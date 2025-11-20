import { NextRequest, NextResponse } from 'next/server';
import supabaseService from '@/lib/supabase-service';
import stripe from '@/lib/stripe';

export const dynamic = 'force-dynamic';

/**
 * Debug endpoint to check subscription status
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, userEmail } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    // Get user from Supabase
    const user = await supabaseService.user.getUser(userId);

    let stripeInfo = null;

    // If email provided and Stripe configured, check Stripe
    if (userEmail && stripe) {
      try {
        const customers = await stripe.customers.list({
          email: userEmail,
          limit: 1,
        });

        if (customers.data.length > 0) {
          const customer = customers.data[0];
          const subscriptions = await stripe.subscriptions.list({
            customer: customer.id,
            limit: 10,
          });

          stripeInfo = {
            customer_id: customer.id,
            customer_email: customer.email,
            subscriptions: subscriptions.data.map((sub) => {
              // Get period dates from first subscription item (Stripe v18 moved these to items)
              const firstItem = sub.items.data[0];
              const periodStart = firstItem?.current_period_start;
              const periodEnd = firstItem?.current_period_end;

              return {
                id: sub.id,
                status: sub.status,
                current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
                current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
                trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
                items: sub.items.data.map((item) => ({
                  price_id: item.price.id,
                  product_id: item.price.product,
                })),
              };
            }),
          };
        }
      } catch (stripeError: any) {
        console.error('Stripe error:', stripeError);
        stripeInfo = { error: stripeError.message };
      }
    }

    return NextResponse.json({
      success: true,
      database: {
        user_exists: !!user,
        subscription_tier: user?.subscription_tier || null,
        subscription_status: user?.subscription_status || null,
        stripe_customer_id: user?.stripe_customer_id || null,
        stripe_subscription_id: user?.stripe_subscription_id || null,
        trial_ends_at: user?.trial_ends_at || null,
        created_at: user?.created_at || null,
        updated_at: user?.updated_at || null,
      },
      stripe: stripeInfo,
      environment: {
        stripe_configured: !!stripe,
        webhook_secret_configured: !!process.env.STRIPE_WEBHOOK_SECRET,
        pro_monthly_price_id: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || null,
        pro_yearly_price_id: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID || null,
      },
    });
  } catch (error: any) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get debug info' },
      { status: 500 }
    );
  }
}
