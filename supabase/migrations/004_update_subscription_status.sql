-- Update subscription status to include trial statuses
-- Drop the old constraint
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_subscription_status_check;

-- Add new constraint with more status options
ALTER TABLE public.users
  ADD CONSTRAINT users_subscription_status_check
  CHECK (subscription_status IN ('active', 'inactive', 'trial', 'trialing', 'cancelled', 'canceled', 'past_due'));

-- Update subscription tier constraint to only include free and pro
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_subscription_tier_check;

ALTER TABLE public.users
  ADD CONSTRAINT users_subscription_tier_check
  CHECK (subscription_tier IN ('free', 'pro'));
