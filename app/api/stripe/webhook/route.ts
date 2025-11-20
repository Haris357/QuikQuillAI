import { NextRequest, NextResponse } from 'next/server';
import stripe, { SUBSCRIPTION_TIERS } from '@/lib/stripe';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';
import { recordWebhookEvent, markWebhookProcessed, recordPayment } from '@/lib/subscription-manager';

export const dynamic = 'force-dynamic';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, eventId: string) {
  const userId = session.metadata?.firebaseUID;
  const tier = session.metadata?.tier as keyof typeof SUBSCRIPTION_TIERS;

  if (!userId || !tier) {
    console.error('Missing userId or tier in session metadata');
    throw new Error('Missing userId or tier');
  }

  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string) as Stripe.Subscription;
    const selectedTier = SUBSCRIPTION_TIERS[tier];
    const billingPeriod = session.metadata?.billingPeriod || 'monthly';

    // Get the correct price ID based on billing period
    const stripePriceId = billingPeriod === 'monthly'
      ? selectedTier.monthlyPriceId
      : selectedTier.yearlyPriceId;

    // Map Stripe status to our status
    let status: 'active' | 'trialing' | 'past_due' | 'canceled' = 'active';
    if (subscription.status === 'trialing') {
      status = 'trialing';
    } else if (subscription.status === 'past_due') {
      status = 'past_due';
    }

    // Get period dates from first subscription item (Stripe v18 moved these to items)
    const firstItem = subscription.items.data[0];
    const periodStart = firstItem?.current_period_start;
    const periodEnd = firstItem?.current_period_end;

    // Update user in Supabase
    const { error: updateError } = await supabase
      .from('users')
      .update({
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        subscription_tier: tier,
        subscription_status: status,
        trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
        stripe_price_id: stripePriceId,
        subscription_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
        subscription_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        subscription_cancel_at_period_end: subscription.cancel_at_period_end,
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user:', updateError);
      throw updateError;
    }

    // Record payment if amount paid
    if (session.amount_total && session.amount_total > 0 && periodStart && periodEnd) {
      await recordPayment({
        userId,
        stripeInvoiceId: subscription.latest_invoice as string,
        amountCents: session.amount_total,
        currency: session.currency || 'usd',
        status: 'succeeded',
        subscriptionTier: tier,
        billingPeriod: billingPeriod as any,
        periodStart: new Date(periodStart * 1000).toISOString(),
        periodEnd: new Date(periodEnd * 1000).toISOString(),
        description: `${selectedTier.name} - ${billingPeriod} subscription`,
      });
    }

    console.log(`✅ Subscription created for user ${userId}, tier: ${tier}, status: ${status}`);
  } catch (error) {
    console.error('Error handling checkout completed:', error);
    throw error;
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, eventId: string) {
  const userId = subscription.metadata?.firebaseUID;
  const tier = subscription.metadata?.tier as keyof typeof SUBSCRIPTION_TIERS;

  if (!userId || !tier) {
    console.error('Missing userId or tier in subscription metadata');
    throw new Error('Missing userId or tier');
  }

  try {
    // Map Stripe status to our status
    let status: 'active' | 'trialing' | 'past_due' | 'canceled' = 'active';
    if (subscription.status === 'trialing') {
      status = 'trialing';
    } else if (subscription.status === 'past_due') {
      status = 'past_due';
    } else if (subscription.status === 'canceled' || subscription.status === 'incomplete_expired') {
      status = 'canceled';
    }

    // Get period dates from first subscription item (Stripe v18 moved these to items)
    const firstItem = subscription.items.data[0];
    const periodStart = firstItem?.current_period_start;
    const periodEnd = firstItem?.current_period_end;

    // Update user in Supabase
    const { error: updateError } = await supabase
      .from('users')
      .update({
        subscription_status: status,
        subscription_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
        subscription_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        subscription_cancel_at_period_end: subscription.cancel_at_period_end,
        trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating subscription:', updateError);
      throw updateError;
    }

    console.log(`✅ Subscription updated for user ${userId}, status: ${status}`);
  } catch (error) {
    console.error('Error handling subscription updated:', error);
    throw error;
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, eventId: string) {
  const userId = subscription.metadata?.firebaseUID;

  if (!userId) {
    console.error('Missing userId in subscription metadata');
    throw new Error('Missing userId');
  }

  try {
    // Revert to free tier
    const { error: updateError } = await supabase
      .from('users')
      .update({
        subscription_tier: 'free',
        subscription_status: 'canceled',
        stripe_subscription_id: null,
        stripe_price_id: null,
        subscription_cancel_at_period_end: false,
        subscription_canceled_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error deleting subscription:', updateError);
      throw updateError;
    }

    console.log(`✅ Subscription deleted for user ${userId}, reverted to free tier`);
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
    throw error;
  }
}

async function handleTrialWillEnd(subscription: Stripe.Subscription, eventId: string) {
  const userId = subscription.metadata?.firebaseUID;

  if (!userId) {
    console.error('Missing userId in subscription metadata');
    return;
  }

  // You can send email notification here
  console.log(`⚠️ Trial ending soon for user: ${userId}`);

  // TODO: Send email notification to user
}

async function handlePaymentFailed(invoice: Stripe.Invoice, eventId: string) {
  if (!stripe) return;

  try {
    // Get subscription from invoice line items (Stripe v18 moved subscription from Invoice to InvoiceLineItem)
    const firstLine = invoice.lines.data[0];
    const subscriptionId = typeof firstLine?.subscription === 'string' ? firstLine.subscription : firstLine?.subscription?.id;

    if (!subscriptionId) {
      console.error('No subscription found in invoice');
      return;
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId) as Stripe.Subscription;
    const userId = subscription.metadata?.firebaseUID;

    if (!userId) {
      console.error('Missing userId in subscription metadata');
      return;
    }

    // Update user status to past_due
    const { error: updateError } = await supabase
      .from('users')
      .update({
        subscription_status: 'past_due',
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating payment failed status:', updateError);
      throw updateError;
    }

    // Record failed payment
    if (invoice.amount_due && invoice.id) {
      await recordPayment({
        userId,
        stripeInvoiceId: invoice.id,
        amountCents: invoice.amount_due,
        currency: invoice.currency || 'usd',
        status: 'failed',
        subscriptionTier: subscription.metadata?.tier || 'unknown',
        description: 'Failed payment',
      });
    }

    console.log(`❌ Payment failed for user ${userId}`);

    // TODO: Send payment failed email notification
  } catch (error) {
    console.error('Error handling payment failed:', error);
    throw error;
  }
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
    console.warn('⚠️ Missing signature or endpoint secret - webhook not configured');
    return NextResponse.json(
      { error: 'Missing signature or endpoint secret' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  // Record webhook event for debugging and replay
  await recordWebhookEvent({
    stripeEventId: event.id,
    eventType: event.type,
    payload: event,
  });

  console.log(`📥 Webhook received: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, event.id);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, event.id);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, event.id);
        break;

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription, event.id);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice, event.id);
        break;

      case 'invoice.payment_succeeded':
        // Handle successful recurring payment
        console.log(`💰 Payment succeeded: ${event.id}`);
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    // Mark webhook as processed
    await markWebhookProcessed(event.id, true);

    console.log(`✅ Webhook processed successfully: ${event.type} (${event.id})`);

    return NextResponse.json({ received: true, event_id: event.id });
  } catch (error: any) {
    console.error(`❌ Webhook handler error for ${event.type}:`, error);

    // Mark webhook as failed
    await markWebhookProcessed(event.id, false, error.message);

    // Still return 200 to prevent Stripe from retrying immediately
    // We'll handle retries manually if needed
    return NextResponse.json(
      { received: true, error: error.message, event_id: event.id },
      { status: 200 }
    );
  }
}