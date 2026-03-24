-- Competitive Intelligence System - Track competitor strategies and market insights

-- Competitor domains — domain metrics tracking (weekly snapshots)
CREATE TABLE IF NOT EXISTS competitor_domains (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  website_url TEXT,

  -- Metrics (refreshed weekly)
  domain_authority INTEGER,      -- 0-100
  traffic_estimate INTEGER,      -- monthly visitors
  organic_keywords INTEGER,
  backlinks_count INTEGER,
  referring_domains INTEGER,

  -- Status
  last_checked INTEGER,
  data_source TEXT,              -- 'ahrefs', 'similarweb', 'semrush', 'manual'
  confidence_score REAL,

  created_at INTEGER NOT NULL DEFAULT (cast(strftime('%s', 'now') * 1000 as integer)),
  updated_at INTEGER NOT NULL DEFAULT (cast(strftime('%s', 'now') * 1000 as integer))
);

CREATE INDEX IF NOT EXISTS idx_competitor_domains_name ON competitor_domains(name);
CREATE INDEX IF NOT EXISTS idx_competitor_domains_updated ON competitor_domains(updated_at);

-- Competitor SERP — keyword ranking snapshots (daily tracking)
CREATE TABLE IF NOT EXISTS competitor_serp (
  id TEXT PRIMARY KEY,
  competitor_id TEXT NOT NULL,

  keyword TEXT NOT NULL,
  rank_position INTEGER,          -- 1-100+
  search_volume INTEGER,
  keyword_difficulty INTEGER,    -- 0-100 (KD)

  rank_date TEXT NOT NULL,        -- YYYY-MM-DD format
  rank_change INTEGER,            -- position change from prev day
  trend TEXT,                     -- 'U' (up), 'D' (down), 'S' (same)

  indexed_at INTEGER NOT NULL DEFAULT (cast(strftime('%s', 'now') * 1000 as integer)),
  created_at INTEGER NOT NULL DEFAULT (cast(strftime('%s', 'now') * 1000 as integer)),

  FOREIGN KEY (competitor_id) REFERENCES competitor_domains(id)
);

CREATE INDEX IF NOT EXISTS idx_competitor_serp_date ON competitor_serp(rank_date);
CREATE INDEX IF NOT EXISTS idx_competitor_serp_competitor ON competitor_serp(competitor_id);
CREATE INDEX IF NOT EXISTS idx_competitor_serp_keyword ON competitor_serp(keyword);
CREATE INDEX IF NOT EXISTS idx_competitor_serp_compound ON competitor_serp(competitor_id, rank_date);

-- Competitor content — articles, blog posts, case studies
CREATE TABLE IF NOT EXISTS competitor_content (
  id TEXT PRIMARY KEY,
  competitor_id TEXT NOT NULL,

  url TEXT NOT NULL UNIQUE,
  title TEXT,
  content_type TEXT,             -- 'blog', 'case_study', 'tutorial', 'announcement', 'guide'

  publish_date INTEGER,
  crawl_date INTEGER NOT NULL DEFAULT (cast(strftime('%s', 'now') * 1000 as integer)),

  -- Content metrics
  word_count INTEGER,
  estimated_reach INTEGER,       -- based on shares, views
  sentiment TEXT,                -- 'positive', 'neutral', 'promotional'

  -- Topics and keywords (JSON arrays)
  topics TEXT,                   -- e.g. '["AI", "Analytics"]'
  keywords TEXT,                 -- e.g. '["free BI tool", "no-code"]'

  created_at INTEGER NOT NULL DEFAULT (cast(strftime('%s', 'now') * 1000 as integer)),

  FOREIGN KEY (competitor_id) REFERENCES competitor_domains(id)
);

CREATE INDEX IF NOT EXISTS idx_competitor_content_date ON competitor_content(publish_date);
CREATE INDEX IF NOT EXISTS idx_competitor_content_type ON competitor_content(content_type);
CREATE INDEX IF NOT EXISTS idx_competitor_content_competitor ON competitor_content(competitor_id);

-- Competitor pricing — pricing tiers and features
CREATE TABLE IF NOT EXISTS competitor_pricing (
  id TEXT PRIMARY KEY,
  competitor_id TEXT NOT NULL,

  tier_name TEXT,                -- "Free", "Pro", "Enterprise"
  price_usd REAL,                -- null for free tiers
  billing_period TEXT,           -- 'month', 'year', 'one_time'

  -- Features as JSON array
  features TEXT,                 -- e.g. '["API", "Custom branding"]'

  snapshot_date TEXT NOT NULL,   -- YYYY-MM-DD for range queries
  extracted_at INTEGER NOT NULL DEFAULT (cast(strftime('%s', 'now') * 1000 as integer)),

  created_at INTEGER NOT NULL DEFAULT (cast(strftime('%s', 'now') * 1000 as integer)),

  FOREIGN KEY (competitor_id) REFERENCES competitor_domains(id)
);

CREATE INDEX IF NOT EXISTS idx_competitor_pricing_date ON competitor_pricing(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_competitor_pricing_competitor ON competitor_pricing(competitor_id);

-- Market insights — AI-detected gaps and opportunities
CREATE TABLE IF NOT EXISTS market_insights (
  id TEXT PRIMARY KEY,

  insight_type TEXT NOT NULL,   -- 'gap', 'threat', 'opportunity', 'trend'
  title TEXT NOT NULL,
  description TEXT,

  -- Related competitors (JSON array of IDs)
  related_competitors TEXT,     -- e.g. '["comp-1", "comp-2"]'
  confidence_score REAL,        -- 0-1

  generated_by TEXT NOT NULL,   -- 'claude', 'heuristic', 'manual'

  discovered_at INTEGER NOT NULL DEFAULT (cast(strftime('%s', 'now') * 1000 as integer)),
  addressed_at INTEGER,         -- NULL until addressed

  created_at INTEGER NOT NULL DEFAULT (cast(strftime('%s', 'now') * 1000 as integer))
);

CREATE INDEX IF NOT EXISTS idx_market_insights_type ON market_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_market_insights_date ON market_insights(discovered_at);
CREATE INDEX IF NOT EXISTS idx_market_insights_unaddressed ON market_insights(addressed_at);

-- Competitive alerts — alerting rules for CI system
CREATE TABLE IF NOT EXISTS competitive_alerts (
  id TEXT PRIMARY KEY,

  alert_type TEXT NOT NULL,     -- 'rank_movement', 'content_published', 'pricing_change', 'threat'
  competitor_id TEXT NOT NULL,

  -- Alert condition
  condition TEXT,               -- e.g. "rank > 50", "traffic +30%"
  threshold REAL,

  -- Rule state
  enabled INTEGER DEFAULT 1,
  trigger_count INTEGER DEFAULT 0,
  last_triggered INTEGER,

  -- Notification channels (JSON array)
  channels TEXT,                -- e.g. '["slack", "email"]'

  created_at INTEGER NOT NULL DEFAULT (cast(strftime('%s', 'now') * 1000 as integer)),
  updated_at INTEGER NOT NULL DEFAULT (cast(strftime('%s', 'now') * 1000 as integer)),

  FOREIGN KEY (competitor_id) REFERENCES competitor_domains(id)
);

CREATE INDEX IF NOT EXISTS idx_competitive_alerts_competitor ON competitive_alerts(competitor_id);
CREATE INDEX IF NOT EXISTS idx_competitive_alerts_enabled ON competitive_alerts(enabled);
