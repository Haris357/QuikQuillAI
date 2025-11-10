import { NextRequest, NextResponse } from 'next/server';
import stripe, { SUBSCRIPTION_TIERS } from '@/lib/stripe';
import { auth } from '@/lib/firebase';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Check for missing environment variables
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      console.error('Missing NEXT_PUBLIC_APP_URL environment variable');
      return NextResponse.json(
        { error: 'Server configuration error: Missing APP_URL' },
        { status: 500 }
      );
    }

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables.' },
        { status: 500 }
      );
    }

    const { tier, userId, billingPeriod = 'monthly' } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate tier
    if (!tier || !['pro'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      );
    }

    // Validate billing period
    if (!['monthly', 'yearly'].includes(billingPeriod)) {
      return NextResponse.json(
        { error: 'Invalid billing period' },
        { status: 400 }
      );
    }

    const selectedTier = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];

    // Get the correct price ID based on billing period
    const priceId = billingPeriod === 'monthly'
      ? selectedTier.monthlyPriceId
      : selectedTier.yearlyPriceId;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID not configured for this tier and billing period' },
        { status: 400 }
      );
    }

    // Create or retrieve Stripe customer
    const customers = await stripe.customers.list({
      email: userId,
      limit: 1,
    });

    let customerId: string;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: userId,
        metadata: {
          firebaseUID: userId,
        },
      });
      customerId = customer.id;
    }

    // Create checkout session with 3-day trial
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        trial_period_days: 3, // 3-day trial
        metadata: {
          firebaseUID: userId,
          tier: tier,
          billingPeriod: billingPeriod,
          tokensLimit: selectedTier.tokens.toString(),
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        firebaseUID: userId,
        tier: tier,
        billingPeriod: billingPeriod,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Checkout session error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
