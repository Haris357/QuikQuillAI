-- =====================================================
-- COMPREHENSIVE SUBSCRIPTION MANAGEMENT SYSTEM
-- =====================================================

-- Update users table with proper subscription fields
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_subscription_status_check,
  DROP CONSTRAINT IF EXISTS users_subscription_tier_check;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS subscription_period_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_period_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_cancel_at_period_end BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS subscription_canceled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

ALTER TABLE users
  ADD CONSTRAINT users_subscription_status_check
  CHECK (subscription_status IN ('active', 'inactive', 'trial', 'trialing', 'cancelled', 'canceled', 'past_due', 'incomplete', 'incomplete_expired', 'unpaid')),
  ADD CONSTRAINT users_subscription_tier_check
  CHECK (subscription_tier IN ('free', 'pro', 'enterprise'));

-- Create index for faster subscription queries
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);

-- =====================================================
-- SUBSCRIPTION HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS subscription_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Subscription details
  subscription_tier TEXT NOT NULL CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  subscription_status TEXT NOT NULL,

  -- Stripe details
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,

  -- Dates
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,

  -- Metadata
  change_reason TEXT, -- 'upgrade', 'downgrade', 'cancel', 'renewal', 'trial_start', 'trial_end', 'payment_failed'
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_history_user_id ON subscription_history(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_started_at ON subscription_history(started_at DESC);

-- =====================================================
-- PAYMENT HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Stripe details
  stripe_payment_intent_id TEXT,
  stripe_invoice_id TEXT,
  stripe_charge_id TEXT,

  -- Payment details
  amount_cents INTEGER NOT NULL, -- Amount in cents
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('succeeded', 'pending', 'failed', 'refunded', 'canceled')),

  -- Subscription details
  subscription_tier TEXT NOT NULL,
  billing_period TEXT CHECK (billing_period IN ('monthly', 'yearly')),

  -- Dates
  payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,

  -- Additional info
  description TEXT,
  receipt_url TEXT,
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_payment_date ON payment_history(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);
CREATE INDEX IF NOT EXISTS idx_payment_history_stripe_invoice_id ON payment_history(stripe_invoice_id);

-- =====================================================
-- WEBHOOK EVENTS TABLE (for debugging and replay)
-- =====================================================
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Stripe details
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,

  -- Processing
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  processing_error TEXT,
  retry_count INTEGER DEFAULT 0,

  -- Event data
  payload JSONB NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_stripe_event_id ON webhook_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at DESC);

-- =====================================================
-- FUNCTIONS FOR SUBSCRIPTION MANAGEMENT
-- =====================================================

-- Function to log subscription changes
CREATE OR REPLACE FUNCTION log_subscription_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if subscription tier or status changed
  IF (OLD.subscription_tier IS DISTINCT FROM NEW.subscription_tier) OR
     (OLD.subscription_status IS DISTINCT FROM NEW.subscription_status) THEN

    -- End previous subscription record if exists
    UPDATE subscription_history
    SET ended_at = NOW()
    WHERE user_id = NEW.id
      AND ended_at IS NULL;

    -- Create new subscription record
    INSERT INTO subscription_history (
      user_id,
      subscription_tier,
      subscription_status,
      stripe_subscription_id,
      stripe_price_id,
      change_reason,
      metadata
    ) VALUES (
      NEW.id,
      NEW.subscription_tier,
      NEW.subscription_status,
      NEW.stripe_subscription_id,
      NEW.stripe_price_id,
      CASE
        WHEN OLD.subscription_tier = 'free' AND NEW.subscription_tier = 'pro' THEN 'upgrade'
        WHEN OLD.subscription_tier = 'pro' AND NEW.subscription_tier = 'free' THEN 'downgrade'
        WHEN NEW.subscription_status = 'canceled' THEN 'cancel'
        WHEN NEW.subscription_status = 'trialing' THEN 'trial_start'
        ELSE 'update'
      END,
      jsonb_build_object(
        'old_tier', OLD.subscription_tier,
        'old_status', OLD.subscription_status,
        'new_tier', NEW.subscription_tier,
        'new_status', NEW.subscription_status
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for subscription changes
DROP TRIGGER IF EXISTS trigger_log_subscription_change ON users;
CREATE TRIGGER trigger_log_subscription_change
  AFTER UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION log_subscription_change();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get user's current subscription with details
CREATE OR REPLACE FUNCTION get_user_subscription_details(p_user_id TEXT)
RETURNS TABLE (
  user_id TEXT,
  subscription_tier TEXT,
  subscription_status TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  trial_ends_at TIMESTAMPTZ,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN,
  tokens_used_this_period INTEGER,
  tokens_limit INTEGER,
  days_until_renewal INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.subscription_tier,
    u.subscription_status,
    u.stripe_customer_id,
    u.stripe_subscription_id,
    u.stripe_price_id,
    u.trial_ends_at,
    u.subscription_period_start,
    u.subscription_period_end,
    u.subscription_cancel_at_period_end,
    COALESCE((
      SELECT SUM(tokens_used)::INTEGER
      FROM usage_tracking
      WHERE user_id = p_user_id
        AND created_at >= COALESCE(u.subscription_period_start, DATE_TRUNC('month', NOW()))
        AND created_at < COALESCE(u.subscription_period_end, DATE_TRUNC('month', NOW()) + INTERVAL '1 month')
    ), 0) as tokens_used,
    CASE
      WHEN u.subscription_tier = 'pro' THEN 1000000
      WHEN u.subscription_tier = 'free' THEN 50000
      ELSE 10000
    END as tokens_limit,
    CASE
      WHEN u.subscription_period_end IS NOT NULL THEN
        EXTRACT(DAY FROM (u.subscription_period_end - NOW()))::INTEGER
      ELSE NULL
    END as days_until_renewal
  FROM users u
  WHERE u.id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Get user's payment history
CREATE OR REPLACE FUNCTION get_user_payment_history(p_user_id TEXT, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  amount_cents INTEGER,
  amount_formatted TEXT,
  currency TEXT,
  status TEXT,
  subscription_tier TEXT,
  payment_date TIMESTAMPTZ,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  description TEXT,
  receipt_url TEXT,
  stripe_invoice_id TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ph.id,
    ph.amount_cents,
    CONCAT('$', (ph.amount_cents / 100.0)::NUMERIC(10,2)) as amount_formatted,
    ph.currency,
    ph.status,
    ph.subscription_tier,
    ph.payment_date,
    ph.period_start,
    ph.period_end,
    ph.description,
    ph.receipt_url,
    ph.stripe_invoice_id
  FROM payment_history ph
  WHERE ph.user_id = p_user_id
  ORDER BY ph.payment_date DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Get subscription analytics
CREATE OR REPLACE FUNCTION get_subscription_analytics()
RETURNS TABLE (
  total_users BIGINT,
  free_users BIGINT,
  pro_users BIGINT,
  trial_users BIGINT,
  active_subscriptions BIGINT,
  canceled_subscriptions BIGINT,
  mrr_cents BIGINT, -- Monthly Recurring Revenue in cents
  total_revenue_this_month_cents BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_users,
    COUNT(*) FILTER (WHERE subscription_tier = 'free')::BIGINT as free_users,
    COUNT(*) FILTER (WHERE subscription_tier = 'pro')::BIGINT as pro_users,
    COUNT(*) FILTER (WHERE subscription_status IN ('trial', 'trialing'))::BIGINT as trial_users,
    COUNT(*) FILTER (WHERE subscription_status = 'active')::BIGINT as active_subscriptions,
    COUNT(*) FILTER (WHERE subscription_status IN ('canceled', 'cancelled'))::BIGINT as canceled_subscriptions,
    (COUNT(*) FILTER (WHERE subscription_tier = 'pro' AND subscription_status = 'active') * 1000)::BIGINT as mrr_cents,
    COALESCE((
      SELECT SUM(amount_cents)::BIGINT
      FROM payment_history
      WHERE status = 'succeeded'
        AND payment_date >= DATE_TRUNC('month', NOW())
        AND payment_date < DATE_TRUNC('month', NOW()) + INTERVAL '1 month'
    ), 0) as total_revenue_this_month_cents
  FROM users;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INITIAL DATA MIGRATION
-- =====================================================

-- Create initial subscription history records for existing users
INSERT INTO subscription_history (user_id, subscription_tier, subscription_status, stripe_subscription_id, change_reason)
SELECT
  id,
  subscription_tier,
  subscription_status,
  stripe_subscription_id,
  'initial_migration'
FROM users
WHERE NOT EXISTS (
  SELECT 1 FROM subscription_history WHERE subscription_history.user_id = users.id
);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE subscription_history IS 'Tracks all subscription changes over time for audit and analytics';
COMMENT ON TABLE payment_history IS 'Records all payment transactions for billing history and receipts';
COMMENT ON TABLE webhook_events IS 'Stores Stripe webhook events for debugging and replay capability';
COMMENT ON FUNCTION log_subscription_change() IS 'Automatically logs subscription changes to subscription_history table';
COMMENT ON FUNCTION get_user_subscription_details(TEXT) IS 'Returns comprehensive subscription details including usage for a user';
COMMENT ON FUNCTION get_user_payment_history(TEXT, INTEGER) IS 'Returns formatted payment history for a user';
COMMENT ON FUNCTION get_subscription_analytics() IS 'Returns platform-wide subscription analytics and revenue metrics';
