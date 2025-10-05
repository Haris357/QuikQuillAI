import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe';
import { ref, set } from 'firebase/database';
import { database } from '@/lib/firebase';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig || !endpointSecret) {
    return NextResponse.json(
      { error: 'Missing signature or endpoint secret' },
      { status: 400 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      const userId = session.metadata?.userId;
      
      if (userId && session.subscription) {
        // Update user subscription in Firebase
        const userRef = ref(database, `users/${userId}/subscription`);
        await set(userRef, {
          status: 'active',
          planId: 'pro',
          subscriptionId: session.subscription,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        });
      }
      break;

    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      // Handle subscription cancellation
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}