import { NextRequest, NextResponse } from 'next/server';
import { syncSubscriptionFromStripe } from '@/lib/subscription-manager';

export const dynamic = 'force-dynamic';

/**
 * Manual subscription sync endpoint
 * Fetches subscription from Stripe and updates Supabase
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, userEmail } = await req.json();

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing userId or userEmail' },
        { status: 400 }
      );
    }

    const result = await syncSubscriptionFromStripe(userId, userEmail);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        subscription: result.tier ? { tier: result.tier } : null,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.message,
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Subscription sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync subscription' },
      { status: 500 }
    );
  }
}
