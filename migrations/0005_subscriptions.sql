-- Batch 5: Billing System Schema
-- Tables for subscription management, Stripe integration, and tier enforcement

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL UNIQUE,

  -- Pricing tier (starter, pro, enterprise)
  tier TEXT NOT NULL DEFAULT 'starter' CHECK (tier IN ('starter', 'pro', 'enterprise')),

  -- Stripe subscription ID (null for free tier or before first subscription)
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT UNIQUE,

  -- Billing cycle
  billing_cycle_start INTEGER,  -- Unix timestamp (ms)
  billing_cycle_end INTEGER,    -- Unix timestamp (ms)
  next_billing_date INTEGER,    -- Unix timestamp (ms)

  -- Subscription status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'expired')),

  -- Payment status
  payment_status TEXT NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('paid', 'unpaid', 'no_payment_method')),

  -- Metadata
  created_at INTEGER NOT NULL DEFAULT (cast(strftime('%s', 'now') * 1000 as integer)),
  updated_at INTEGER NOT NULL DEFAULT (cast(strftime('%s', 'now') * 1000 as integer)),
  canceled_at INTEGER,

  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE INDEX idx_subscriptions_org_id ON subscriptions(org_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);

-- Tier limits table (defines max resources per tier)
CREATE TABLE IF NOT EXISTS tier_limits (
  id TEXT PRIMARY KEY,
  tier TEXT NOT NULL UNIQUE CHECK (tier IN ('starter', 'pro', 'enterprise')),

  -- Resource limits
  max_brands INTEGER NOT NULL,
  max_users INTEGER NOT NULL,
  max_competitors_per_brand INTEGER NOT NULL,
  max_alert_rules INTEGER NOT NULL,

  -- Pricing
  monthly_price_cents INTEGER NOT NULL,  -- $0 for starter (free tier)

  created_at INTEGER NOT NULL DEFAULT (cast(strftime('%s', 'now') * 1000 as integer))
);

INSERT OR IGNORE INTO tier_limits VALUES
  ('starter', 'starter', 3, 3, 5, 5, 4900, CAST(strftime('%s', 'now') * 1000 AS INTEGER)),
  ('pro', 'pro', 10, 10, 20, 50, 19900, CAST(strftime('%s', 'now') * 1000 AS INTEGER)),
  ('enterprise', 'enterprise', 999999, 999999, 999999, 999999, 0, CAST(strftime('%s', 'now') * 1000 AS INTEGER));

-- Stripe events log (for webhook reconciliation and debugging)
CREATE TABLE IF NOT EXISTS stripe_events (
  id TEXT PRIMARY KEY,
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,  -- customer.subscription.created, invoice.payment_succeeded, etc.

  -- Related IDs
  org_id TEXT,
  subscription_id TEXT,
  stripe_subscription_id TEXT,

  -- Raw event data (JSON)
  event_data TEXT NOT NULL,

  -- Processing status
  processed INTEGER DEFAULT 0,  -- 0 = pending, 1 = processed
  error TEXT,                   -- Error message if processing failed

  created_at INTEGER NOT NULL DEFAULT (cast(strftime('%s', 'now') * 1000 as integer)),
  processed_at INTEGER,

  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE INDEX idx_stripe_events_type ON stripe_events(event_type);
CREATE INDEX idx_stripe_events_org_id ON stripe_events(org_id);
CREATE INDEX idx_stripe_events_processed ON stripe_events(processed);
