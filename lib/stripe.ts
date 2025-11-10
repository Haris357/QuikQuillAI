import Stripe from 'stripe';

// Initialize Stripe only if the secret key is available
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

let stripe: Stripe | null = null;

if (stripeSecretKey) {
  stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-08-27.basil',
  });
} else {
  console.warn('Stripe secret key not found. Stripe functionality will be disabled.');
}

export default stripe;

// Subscription tiers with token credits
export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free Trial',
    monthlyPrice: 0,
    yearlyPrice: 0,
    monthlyPriceId: null,
    yearlyPriceId: null,
    tokens: 50000, // 50K tokens for trial
    features: [
      '1 AI agent',
      '50,000 tokens/month',
      'Basic editor features',
      'Community support',
      '3-day trial period'
    ],
    limits: {
      agents: 1,
      tasks: 10
    }
  },
  pro: {
    name: 'Pro',
    monthlyPrice: 10,
    yearlyPrice: 100,
    monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
    yearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID,
    tokens: 1000000, // 1M tokens/month
    features: [
      'Unlimited AI agents',
      '1,000,000 tokens/month',
      'All editor features',
      'Priority support',
      'Team collaboration',
      'API access'
    ],
    limits: {
      agents: -1, // unlimited
      tasks: -1 // unlimited
    }
  }
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;