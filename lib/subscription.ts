import { database } from './firebase';
import { ref, get, update } from 'firebase/database';
import { SUBSCRIPTION_TIERS, SubscriptionTier } from './stripe';
import { UserSubscription } from '@/types';

/**
 * Initialize a new user with free trial subscription
 */
export async function initializeUserSubscription(userId: string): Promise<void> {
  if (!database) return;

  const userRef = ref(database, `users/${userId}/subscription`);
  const snapshot = await get(userRef);

  if (!snapshot.exists()) {
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 3); // 3-day trial

    const subscription: UserSubscription = {
      status: 'trial',
      tier: 'free',
      trialEndsAt: trialEndDate.toISOString(),
      tokensUsedThisPeriod: 0,
      tokensLimit: SUBSCRIPTION_TIERS.free.tokens,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await update(userRef, subscription);
  }
}

/**
 * Get user's current subscription
 */
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  if (!database) return null;

  const userRef = ref(database, `users/${userId}/subscription`);
  const snapshot = await get(userRef);

  if (snapshot.exists()) {
    return snapshot.val() as UserSubscription;
  }

  return null;
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
  if (!database) return;

  const subscription = await getUserSubscription(userId);
  if (!subscription) return;

  const userRef = ref(database, `users/${userId}/subscription`);
  await update(userRef, {
    tokensUsedThisPeriod: subscription.tokensUsedThisPeriod + tokensUsed,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Check if user can create more agents
 */
export async function canCreateAgent(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  if (!database) return { allowed: false, reason: 'Database not available' };

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

  // Count current agents
  const agentsRef = ref(database, `agents/${userId}`);
  const snapshot = await get(agentsRef);
  const agentCount = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;

  if (agentCount >= tier.limits.agents) {
    return {
      allowed: false,
      reason: `You've reached the limit of ${tier.limits.agents} agents for your ${tier.name} plan. Upgrade to create more.`
    };
  }

  return { allowed: true };
}

/**
 * Check if user can create more tasks
 */
export async function canCreateTask(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  if (!database) return { allowed: false, reason: 'Database not available' };

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

  // Count current tasks
  const tasksRef = ref(database, `tasks/${userId}`);
  const snapshot = await get(tasksRef);
  const taskCount = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;

  if (taskCount >= tier.limits.tasks) {
    return {
      allowed: false,
      reason: `You've reached the limit of ${tier.limits.tasks} tasks for your ${tier.name} plan. Upgrade to create more.`
    };
  }

  return { allowed: true };
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
