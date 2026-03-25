-- ============================================================================
-- EPIC #99.1: SCRAM JET CONNECTOR METRICS TABLE
-- ============================================================================
-- Metrics table for Scram Jet pipeline outputs
-- Receives JSON from Scram Jet YAML pipelines via webhook
-- Powers dashboard metrics display and real-time analytics

CREATE TABLE IF NOT EXISTS metrics (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,        -- 'stripe', 'ga4', 'ads', 'meta', 'hubspot', etc.
  priority TEXT NOT NULL,      -- 'high', 'normal', 'low'
  category TEXT NOT NULL,      -- 'revenue', 'traffic', 'ads', 'email', etc.
  title TEXT NOT NULL,         -- Display title
  detail TEXT NOT NULL,        -- Description/detail
  timestamp INTEGER NOT NULL,  -- Unix timestamp (when metric occurred)
  created_at INTEGER NOT NULL, -- When metric arrived at OpenDash (insertion time)
  metadata TEXT                -- JSON: {totalDollars: 250, transactionCount: 10, etc.}
);

CREATE INDEX idx_source_timestamp ON metrics(source, timestamp DESC);
CREATE INDEX idx_created_at ON metrics(created_at DESC);
CREATE INDEX idx_priority ON metrics(priority);
CREATE INDEX idx_category ON metrics(category);
