import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe';
import { database } from '@/lib/firebase';
import { ref, get } from 'firebase/database';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables.' },
        { status: 500 }
      );
    }

    const { userId } = await req.json();

    if (!userId || !database) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user's subscription data from Firebase
    const userRef = ref(database, `users/${userId}/subscription`);
    const snapshot = await get(userRef);
    const subscription = snapshot.val();

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Portal session error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
