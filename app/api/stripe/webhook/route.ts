import { NextRequest, NextResponse } from 'next/server';
import stripe, { SUBSCRIPTION_TIERS } from '@/lib/stripe';
import { ref, set, update } from 'firebase/database';
import { database } from '@/lib/firebase';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (!database) return;

  const userId = session.metadata?.firebaseUID;
  const tier = session.metadata?.tier as keyof typeof SUBSCRIPTION_TIERS;

  if (!userId || !tier) {
    console.error('Missing userId or tier in session metadata');
    return;
  }

  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  const subscription: Stripe.Subscription = await stripe.subscriptions.retrieve(session.subscription as string) as any;
  const selectedTier = SUBSCRIPTION_TIERS[tier];
  const billingPeriod = session.metadata?.billingPeriod || 'monthly';

  // Get the correct price ID based on billing period
  const stripePriceId = billingPeriod === 'monthly'
    ? selectedTier.monthlyPriceId
    : selectedTier.yearlyPriceId;

  const userRef = ref(database, `users/${userId}/subscription`);
  const sub: any = subscription;
  await set(userRef, {
    status: sub.trial_end ? 'trial' : 'active',
    tier: tier,
    stripeCustomerId: session.customer as string,
    stripeSubscriptionId: session.subscription as string,
    stripePriceId: stripePriceId,
    trialEndsAt: sub.trial_end
      ? new Date(sub.trial_end * 1000).toISOString()
      : null,
    currentPeriodStart: new Date(sub.current_period_start * 1000).toISOString(),
    currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    tokensUsedThisPeriod: 0,
    tokensLimit: selectedTier.tokens,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  if (!database) return;

  const userId = subscription.metadata?.firebaseUID;
  const tier = subscription.metadata?.tier as keyof typeof SUBSCRIPTION_TIERS;

  if (!userId || !tier) {
    console.error('Missing userId or tier in subscription metadata');
    return;
  }

  const selectedTier = SUBSCRIPTION_TIERS[tier];
  const userRef = ref(database, `users/${userId}/subscription`);
  const sub: any = subscription;

  await update(userRef, {
    status: sub.status === 'trialing' ? 'trial' : sub.status,
    currentPeriodStart: new Date(sub.current_period_start * 1000).toISOString(),
    currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    tokensLimit: selectedTier.tokens,
    updatedAt: new Date().toISOString(),
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  if (!database) return;

  const userId = subscription.metadata?.firebaseUID;

  if (!userId) {
    console.error('Missing userId in subscription metadata');
    return;
  }

  const userRef = ref(database, `users/${userId}/subscription`);
  const freeTier = SUBSCRIPTION_TIERS.free;

  // Revert to free tier
  await update(userRef, {
    status: 'canceled',
    tier: 'free',
    stripeSubscriptionId: null,
    stripePriceId: null,
    cancelAtPeriodEnd: false,
    tokensUsedThisPeriod: 0,
    tokensLimit: freeTier.tokens,
    updatedAt: new Date().toISOString(),
  });
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  if (!database) return;

  const userId = subscription.metadata?.firebaseUID;

  if (!userId) {
    console.error('Missing userId in subscription metadata');
    return;
  }

  // You can send email notification here
  console.log(`Trial ending soon for user: ${userId}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (!database || !stripe) return;

  const inv: any = invoice;
  const subscription: Stripe.Subscription = await stripe.subscriptions.retrieve(inv.subscription as string) as any;
  const sub: any = subscription;
  const userId = sub.metadata?.firebaseUID;

  if (!userId) {
    console.error('Missing userId in subscription metadata');
    return;
  }

  const userRef = ref(database, `users/${userId}/subscription`);
  await update(userRef, {
    status: 'past_due',
    updatedAt: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 500 }
    );
  }

  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig || !endpointSecret) {
    return NextResponse.json(
      { error: 'Missing signature or endpoint secret' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}