-- Campaign Performance Metrics - Track Google Ads, Meta Ads, GA4, Email metrics

-- Google Ads campaign snapshots (daily tracking)
CREATE TABLE IF NOT EXISTS google_ads_snapshots (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  campaign_id TEXT NOT NULL,
  campaign_name TEXT NOT NULL,

  -- Spend metrics
  spend_dollars REAL,                -- Total spend in dollars
  spend_micros INTEGER,              -- Alternative: cost in micros (Google format)

  -- Performance metrics
  impressions INTEGER,
  clicks INTEGER,
  conversions INTEGER,
  cost_per_conversion REAL,

  -- Rates
  click_through_rate REAL,           -- 0-1
  conversion_rate REAL,              -- 0-1

  -- Snapshot metadata
  snapshot_date TEXT NOT NULL,       -- YYYY-MM-DD format for range queries
  snapshot_timestamp INTEGER,        -- Unix timestamp (ms)

  created_at INTEGER NOT NULL DEFAULT (cast(strftime('%s', 'now') * 1000 as integer)),

  FOREIGN KEY (org_id) REFERENCES organizations(id)
);

CREATE INDEX IF NOT EXISTS idx_gads_org_date ON google_ads_snapshots(org_id, snapshot_date);
CREATE INDEX IF NOT EXISTS idx_gads_campaign ON google_ads_snapshots(campaign_id);
CREATE INDEX IF NOT EXISTS idx_gads_timestamp ON google_ads_snapshots(snapshot_timestamp);

-- Daily budget tracking for Google Ads campaigns
CREATE TABLE IF NOT EXISTS daily_budgets (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  campaign_id TEXT NOT NULL,

  daily_budget_dollars REAL NOT NULL,

  -- Metadata
  currency TEXT DEFAULT 'USD',
  updated_at INTEGER NOT NULL DEFAULT (cast(strftime('%s', 'now') * 1000 as integer)),
  created_at INTEGER NOT NULL DEFAULT (cast(strftime('%s', 'now') * 1000 as integer)),

  FOREIGN KEY (org_id) REFERENCES organizations(id)
);

CREATE INDEX IF NOT EXISTS idx_daily_budgets_campaign ON daily_budgets(campaign_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_budgets_org_campaign ON daily_budgets(org_id, campaign_id);

-- Meta Ads campaign snapshots (daily tracking)
CREATE TABLE IF NOT EXISTS meta_ads_snapshots (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  campaign_id TEXT NOT NULL,
  campaign_name TEXT NOT NULL,
  ad_account_id TEXT NOT NULL,

  -- Spend and performance
  spend_dollars REAL,
  impressions INTEGER,
  clicks INTEGER,
  actions INTEGER,                  -- Conversions in Meta
  cost_per_action REAL,

  -- Rates
  click_through_rate REAL,
  action_rate REAL,                 -- Conversion rate in Meta

  -- Metadata
  snapshot_date TEXT NOT NULL,       -- YYYY-MM-DD format
  snapshot_timestamp INTEGER,

  created_at INTEGER NOT NULL DEFAULT (cast(strftime('%s', 'now') * 1000 as integer)),

  FOREIGN KEY (org_id) REFERENCES organizations(id)
);

CREATE INDEX IF NOT EXISTS idx_meta_ads_org_date ON meta_ads_snapshots(org_id, snapshot_date);
CREATE INDEX IF NOT EXISTS idx_meta_ads_campaign ON meta_ads_snapshots(campaign_id);

-- GA4 traffic and conversion snapshots (daily)
CREATE TABLE IF NOT EXISTS ga4_snapshots (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  property_id TEXT NOT NULL,
  property_name TEXT,

  -- Traffic metrics
  organic_sessions INTEGER,
  organic_users INTEGER,
  organic_bounce_rate REAL,          -- 0-1

  -- Conversions
  conversions INTEGER,
  conversion_rate REAL,              -- 0-1

  -- Traffic sources breakdown (JSON)
  traffic_by_source TEXT,            -- e.g. '{"organic": 5000, "paid": 2000, "social": 1500}'

  -- Metadata
  snapshot_date TEXT NOT NULL,
  snapshot_timestamp INTEGER,

  created_at INTEGER NOT NULL DEFAULT (cast(strftime('%s', 'now') * 1000 as integer)),

  FOREIGN KEY (org_id) REFERENCES organizations(id)
);

CREATE INDEX IF NOT EXISTS idx_ga4_org_date ON ga4_snapshots(org_id, snapshot_date);
CREATE INDEX IF NOT EXISTS idx_ga4_property ON ga4_snapshots(property_id);

-- Email campaign metrics (Mailchimp/ConvertKit/Substack)
CREATE TABLE IF NOT EXISTS email_metrics_snapshots (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  campaign_id TEXT NOT NULL,
  campaign_name TEXT NOT NULL,
  provider TEXT NOT NULL,           -- 'mailchimp', 'convertkit', 'substack'

  -- List metrics
  list_size INTEGER,
  subscribers_added INTEGER,

  -- Campaign performance
  send_count INTEGER,
  open_count INTEGER,
  click_count INTEGER,
  unsubscribe_count INTEGER,

  -- Rates
  open_rate REAL,                   -- 0-1
  click_rate REAL,                  -- 0-1
  unsubscribe_rate REAL,            -- 0-1

  -- Metadata
  snapshot_date TEXT NOT NULL,
  snapshot_timestamp INTEGER,

  created_at INTEGER NOT NULL DEFAULT (cast(strftime('%s', 'now') * 1000 as integer)),

  FOREIGN KEY (org_id) REFERENCES organizations(id)
);

CREATE INDEX IF NOT EXISTS idx_email_metrics_org_date ON email_metrics_snapshots(org_id, snapshot_date);
CREATE INDEX IF NOT EXISTS idx_email_metrics_provider ON email_metrics_snapshots(provider);

-- Campaign performance alerts and anomalies
CREATE TABLE IF NOT EXISTS campaign_anomalies (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,

  -- Source
  source_type TEXT NOT NULL,        -- 'google_ads', 'meta_ads', 'ga4', 'email'
  source_id TEXT NOT NULL,          -- campaign_id or property_id
  source_name TEXT,

  -- Anomaly details
  anomaly_type TEXT NOT NULL,       -- 'budget_overrun', 'low_roas', 'conversion_drop', 'engagement_decline'
  metric_name TEXT,
  metric_value REAL,
  expected_value REAL,
  threshold REAL,

  -- Severity and status
  severity TEXT DEFAULT 'warning',   -- 'critical', 'warning', 'info'
  acknowledged INTEGER DEFAULT 0,
  acknowledged_at INTEGER,
  acknowledged_by TEXT,

  detected_at INTEGER NOT NULL DEFAULT (cast(strftime('%s', 'now') * 1000 as integer)),
  created_at INTEGER NOT NULL DEFAULT (cast(strftime('%s', 'now') * 1000 as integer)),

  FOREIGN KEY (org_id) REFERENCES organizations(id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_anomalies_org ON campaign_anomalies(org_id);
CREATE INDEX IF NOT EXISTS idx_campaign_anomalies_source ON campaign_anomalies(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_campaign_anomalies_unacknowledged ON campaign_anomalies(acknowledged);
