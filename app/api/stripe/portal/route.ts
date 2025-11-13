import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe';
import supabaseService from '@/lib/supabase-service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables.' },
        { status: 500 }
      );
    }

    const { userId, userEmail } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    // Try to get user's Stripe customer ID from Supabase
    const user = await supabaseService.user.getUser(userId);
    const stripeCustomerId = user?.stripe_customer_id;

    let customerId: string;

    if (stripeCustomerId) {
      customerId = stripeCustomerId;
    } else {
      // Find customer by email if not in our database
      const customers = await stripe.customers.list({
        email: userEmail,
        limit: 1,
      });

      if (customers.data.length === 0) {
        return NextResponse.json(
          { error: 'No Stripe customer found. Please subscribe first.' },
          { status: 404 }
        );
      }

      customerId = customers.data[0].id;
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
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
