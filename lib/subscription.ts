import supabaseService from './supabase-service';
import { SUBSCRIPTION_TIERS, SubscriptionTier } from './stripe';
import { UserSubscription } from '@/types';

/**
 * Initialize a new user with free trial subscription
 */
export async function initializeUserSubscription(userId: string): Promise<void> {
  try {
    const user = await supabaseService.user.getUser(userId);

    // If user doesn't have a subscription tier set, initialize it
    if (!user || !user.subscription_tier) {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 3); // 3-day trial

      await supabaseService.user.updateUser(userId, {
        subscription_tier: 'free',
        subscription_status: 'active',
        trial_ends_at: trialEndDate.toISOString(),
      });
    }
  } catch (error) {
    console.error('Error initializing user subscription:', error);
  }
}

/**
 * Get user's current subscription
 */
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  try {
    const user = await supabaseService.user.getUser(userId);

    if (!user) return null;

    // Get monthly token usage from Supabase
    const tokensUsed = await supabaseService.user.getMonthlyTokenUsage(userId);
    const tier = user.subscription_tier || 'free';

    return {
      status: user.subscription_status === 'active' ? (user.trial_ends_at ? 'trial' : 'active') : 'inactive',
      tier: tier as 'free' | 'pro' | 'enterprise',
      trialEndsAt: user.trial_ends_at || undefined,
      tokensUsedThisPeriod: tokensUsed,
      tokensLimit: SUBSCRIPTION_TIERS[tier as 'free' | 'pro' | 'enterprise'].tokens,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return null;
  }
}

/**
 * Check if user's trial has expired
 */
export function isTrialExpired(subscription: UserSubscription | null): boolean {
  if (!subscription || !subscription.trialEndsAt) return false;

  const now = new Date();
  const trialEnd = new Date(subscription.trialEndsAt);

  return now > trialEnd && subscription.status === 'trial';
}

/**
 * Check if user has sufficient tokens
 */
export function hasTokensAvailable(subscription: UserSubscription | null, tokensNeeded: number): boolean {
  if (!subscription) return false;

  // Unlimited tokens
  if (subscription.tokensLimit === -1) return true;

  const tokensRemaining = subscription.tokensLimit - subscription.tokensUsedThisPeriod;
  return tokensRemaining >= tokensNeeded;
}

/**
 * Get tokens remaining for current period
 */
export function getTokensRemaining(subscription: UserSubscription | null): number {
  if (!subscription) return 0;

  // Unlimited tokens
  if (subscription.tokensLimit === -1) return -1;

  return Math.max(0, subscription.tokensLimit - subscription.tokensUsedThisPeriod);
}

/**
 * Update token usage
 */
export async function updateTokenUsage(userId: string, tokensUsed: number): Promise<void> {
  try {
    // Token usage is now tracked in usage_tracking table
    // This is handled automatically by the gemini.ts file
    // Just making sure the record exists in usage_tracking
  } catch (error) {
    console.error('Error updating token usage:', error);
  }
}

/**
 * Check if user can create more agents
 */
export async function canCreateAgent(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const subscription = await getUserSubscription(userId);

    if (!subscription) {
      return { allowed: false, reason: 'No subscription found' };
    }

    // Check if trial expired
    if (isTrialExpired(subscription)) {
      return { allowed: false, reason: 'Trial expired. Please upgrade to continue.' };
    }

    const tier = SUBSCRIPTION_TIERS[subscription.tier];

    // Unlimited agents
    if (tier.limits.agents === -1) {
      return { allowed: true };
    }

    // Count current agents from Supabase
    const agents = await supabaseService.agent.getAgents(userId);
    const agentCount = agents.length;

    if (agentCount >= tier.limits.agents) {
      return {
        allowed: false,
        reason: `You've reached the limit of ${tier.limits.agents} agents for your ${tier.name} plan. Upgrade to create more.`
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Error checking if user can create agent:', error);
    return { allowed: false, reason: 'Error checking subscription' };
  }
}

/**
 * Check if user can create more tasks
 */
export async function canCreateTask(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const subscription = await getUserSubscription(userId);

    if (!subscription) {
      return { allowed: false, reason: 'No subscription found' };
    }

    // Check if trial expired
    if (isTrialExpired(subscription)) {
      return { allowed: false, reason: 'Trial expired. Please upgrade to continue.' };
    }

    const tier = SUBSCRIPTION_TIERS[subscription.tier];

    // Unlimited tasks
    if (tier.limits.tasks === -1) {
      return { allowed: true };
    }

    // Count current tasks from Supabase
    const tasks = await supabaseService.task.getTasks(userId);
    const taskCount = tasks.length;

    if (taskCount >= tier.limits.tasks) {
      return {
        allowed: false,
        reason: `You've reached the limit of ${tier.limits.tasks} tasks for your ${tier.name} plan. Upgrade to create more.`
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Error checking if user can create task:', error);
    return { allowed: false, reason: 'Error checking subscription' };
  }
}

/**
 * Format token count for display
 */
export function formatTokenCount(tokens: number): string {
  if (tokens === -1) return 'Unlimited';
  if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(0)}K`;
  return tokens.toString();
}

/**
 * Get subscription tier details
 */
export function getSubscriptionTierDetails(tier: SubscriptionTier) {
  return SUBSCRIPTION_TIERS[tier];
}

/**
 * Calculate days remaining in trial
 */
export function getDaysRemainingInTrial(subscription: UserSubscription | null): number {
  if (!subscription || !subscription.trialEndsAt || subscription.status !== 'trial') {
    return 0;
  }

  const now = new Date();
  const trialEnd = new Date(subscription.trialEndsAt);
  const diffTime = trialEnd.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}
