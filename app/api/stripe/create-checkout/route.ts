// This route is deprecated. Use /api/stripe/checkout instead.
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  return NextResponse.json(
    { error: 'This endpoint is deprecated. Please use /api/stripe/checkout instead.' },
    { status: 410 }
  );
}