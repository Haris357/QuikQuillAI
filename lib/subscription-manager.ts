/**
 * Comprehensive Subscription Management Service
 * Handles all subscription-related operations with proper database tracking
 */

import { supabase } from './supabase';
import supabaseService from './supabase-service';
import stripe from './stripe';
import { SUBSCRIPTION_TIERS } from './stripe';

// =====================================================
// TYPES
// =====================================================

export interface SubscriptionDetails {
  user_id: string;
  subscription_tier: 'free' | 'pro' | 'enterprise';
  subscription_status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  trial_ends_at: string | null;
  period_start: string | null;
  period_end: string | null;
  cancel_at_period_end: boolean;
  tokens_used_this_period: number;
  tokens_limit: number;
  days_until_renewal: number | null;
}

export interface PaymentRecord {
  id: string;
  amount_cents: number;
  amount_formatted: string;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed' | 'refunded' | 'canceled';
  subscription_tier: string;
  payment_date: string;
  period_start: string | null;
  period_end: string | null;
  description: string | null;
  receipt_url: string | null;
  stripe_invoice_id: string | null;
}

export interface SubscriptionHistoryRecord {
  id: string;
  user_id: string;
  subscription_tier: string;
  subscription_status: string;
  stripe_subscription_id: string | null;
  started_at: string;
  ended_at: string | null;
  change_reason: string | null;
}

// =====================================================
// SUBSCRIPTION DETAILS
// =====================================================

/**
 * Get comprehensive subscription details for a user
 */
export async function getSubscriptionDetails(userId: string): Promise<SubscriptionDetails | null> {
  try {
    const { data, error } = await supabase
      .rpc('get_user_subscription_details', { p_user_id: userId })
      .single();

    if (error) {
      console.error('Error getting subscription details:', error);
      return null;
    }

    return data as SubscriptionDetails;
  } catch (error) {
    console.error('Error getting subscription details:', error);
    return null;
  }
}

// =====================================================
// SUBSCRIPTION SYNC WITH STRIPE
// =====================================================

/**
 * Sync user subscription from Stripe to database
 */
export async function syncSubscriptionFromStripe(
  userId: string,
  userEmail: string
): Promise<{ success: boolean; message: string; tier?: string }> {
  try {
    if (!stripe) {
      return { success: false, message: 'Stripe not configured' };
    }

    // Find customer by email
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return { success: false, message: 'No Stripe customer found' };
    }

    const customer = customers.data[0];

    // Get subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'all',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return { success: false, message: 'No subscriptions found' };
    }

    const subscription = subscriptions.data[0];

    // Determine tier from price ID
    let tier: 'free' | 'pro' = 'free';
    let priceId = '';
    if (subscription.items.data.length > 0) {
      priceId = subscription.items.data[0].price.id;
      const proMonthlyId = process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID;
      const proYearlyId = process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID;

      if (priceId === proMonthlyId || priceId === proYearlyId) {
        tier = 'pro';
      }
    }

    // Map Stripe status
    const statusMap: Record<string, string> = {
      'active': 'active',
      'trialing': 'trialing',
      'past_due': 'past_due',
      'canceled': 'canceled',
      'incomplete': 'incomplete',
      'incomplete_expired': 'incomplete_expired',
      'unpaid': 'canceled',
    };

    const status = statusMap[subscription.status] || 'inactive';

    // Update database
    await supabaseService.user.updateUser(userId, {
      stripe_customer_id: customer.id,
      stripe_subscription_id: subscription.id,
      subscription_tier: tier,
      subscription_status: status as any,
      trial_ends_at: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
    });

    // Get period dates from first subscription item (Stripe v18 moved these to items)
    const firstItem = subscription.items.data[0];
    const periodStart = firstItem?.current_period_start;
    const periodEnd = firstItem?.current_period_end;

    // Update additional subscription fields
    await supabase
      .from('users')
      .update({
        stripe_price_id: priceId,
        subscription_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
        subscription_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        subscription_cancel_at_period_end: subscription.cancel_at_period_end,
      })
      .eq('id', userId);

    console.log(`✅ Synced subscription for ${userId}: ${tier} (${status})`);

    return {
      success: true,
      message: 'Subscription synced successfully',
      tier,
    };
  } catch (error: any) {
    console.error('Subscription sync error:', error);
    return {
      success: false,
      message: error.message || 'Failed to sync subscription',
    };
  }
}

// =====================================================
// PAYMENT HISTORY
// =====================================================

/**
 * Get payment history for a user
 */
export async function getPaymentHistory(
  userId: string,
  limit: number = 10
): Promise<PaymentRecord[]> {
  try {
    const { data, error } = await supabase.rpc('get_user_payment_history', {
      p_user_id: userId,
      p_limit: limit,
    });

    if (error) {
      console.error('Error getting payment history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting payment history:', error);
    return [];
  }
}

/**
 * Record a payment in the database
 */
export async function recordPayment(payment: {
  userId: string;
  stripePaymentIntentId?: string;
  stripeInvoiceId?: string;
  stripeChargeId?: string;
  amountCents: number;
  currency?: string;
  status: 'succeeded' | 'pending' | 'failed' | 'refunded' | 'canceled';
  subscriptionTier: string;
  billingPeriod?: 'monthly' | 'yearly';
  periodStart?: string;
  periodEnd?: string;
  description?: string;
  receiptUrl?: string;
  metadata?: Record<string, any>;
}): Promise<boolean> {
  try {
    const { error } = await supabase.from('payment_history').insert({
      user_id: payment.userId,
      stripe_payment_intent_id: payment.stripePaymentIntentId,
      stripe_invoice_id: payment.stripeInvoiceId,
      stripe_charge_id: payment.stripeChargeId,
      amount_cents: payment.amountCents,
      currency: payment.currency || 'usd',
      status: payment.status,
      subscription_tier: payment.subscriptionTier,
      billing_period: payment.billingPeriod,
      period_start: payment.periodStart,
      period_end: payment.periodEnd,
      description: payment.description,
      receipt_url: payment.receiptUrl,
      metadata: payment.metadata || {},
    });

    if (error) {
      console.error('Error recording payment:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error recording payment:', error);
    return false;
  }
}

// =====================================================
// SUBSCRIPTION HISTORY
// =====================================================

/**
 * Get subscription history for a user
 */
export async function getSubscriptionHistory(userId: string): Promise<SubscriptionHistoryRecord[]> {
  try {
    const { data, error } = await supabase
      .from('subscription_history')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error getting subscription history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting subscription history:', error);
    return [];
  }
}

// =====================================================
// WEBHOOK EVENT TRACKING
// =====================================================

/**
 * Record a webhook event for debugging
 */
export async function recordWebhookEvent(event: {
  stripeEventId: string;
  eventType: string;
  payload: any;
}): Promise<boolean> {
  try {
    const { error } = await supabase.from('webhook_events').insert({
      stripe_event_id: event.stripeEventId,
      event_type: event.eventType,
      payload: event.payload,
      processed: false,
    });

    if (error) {
      // Ignore duplicate events
      if (error.code === '23505') {
        console.log('Webhook event already recorded:', event.stripeEventId);
        return true;
      }
      console.error('Error recording webhook event:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error recording webhook event:', error);
    return false;
  }
}

/**
 * Mark webhook event as processed
 */
export async function markWebhookProcessed(
  stripeEventId: string,
  success: boolean,
  error?: string
): Promise<void> {
  try {
    await supabase
      .from('webhook_events')
      .update({
        processed: success,
        processed_at: new Date().toISOString(),
        processing_error: error || null,
      })
      .eq('stripe_event_id', stripeEventId);
  } catch (err) {
    console.error('Error marking webhook as processed:', err);
  }
}

/**
 * Increment webhook retry count
 */
export async function incrementWebhookRetry(stripeEventId: string): Promise<void> {
  try {
    await supabase.rpc('increment', {
      row_id: stripeEventId,
      table_name: 'webhook_events',
      column_name: 'retry_count',
    });
  } catch (error) {
    console.error('Error incrementing webhook retry:', error);
  }
}

// =====================================================
// ANALYTICS
// =====================================================

export interface SubscriptionAnalytics {
  total_users: number;
  free_users: number;
  pro_users: number;
  trial_users: number;
  active_subscriptions: number;
  canceled_subscriptions: number;
  mrr_cents: number;
  total_revenue_this_month_cents: number;
}

/**
 * Get subscription analytics
 */
export async function getSubscriptionAnalytics(): Promise<SubscriptionAnalytics | null> {
  try {
    const { data, error } = await supabase.rpc('get_subscription_analytics').single();

    if (error) {
      console.error('Error getting subscription analytics:', error);
      return null;
    }

    return data as SubscriptionAnalytics;
  } catch (error) {
    console.error('Error getting subscription analytics:', error);
    return null;
  }
}
