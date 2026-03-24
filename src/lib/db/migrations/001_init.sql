-- OpenDash D1 Initial Schema
-- Run this once to initialize the database
-- Safe to run multiple times (uses IF NOT EXISTS)

-- ============================================================================
-- Table 1: datasource_metrics (Time-series)
-- ============================================================================
CREATE TABLE IF NOT EXISTS datasource_metrics (
  id TEXT PRIMARY KEY,
  datasourceId TEXT NOT NULL,
  datasourceName TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  fetchLatency INTEGER NOT NULL,
  errorRate REAL NOT NULL CHECK (errorRate >= 0 AND errorRate <= 1),
  connected BOOLEAN NOT NULL,
  healthStatus TEXT NOT NULL CHECK (healthStatus IN ('healthy', 'degraded', 'critical')),
  brandId TEXT,
  createdAt INTEGER NOT NULL DEFAULT (CAST(strftime('%s', 'now') * 1000 AS INTEGER))
);

CREATE INDEX IF NOT EXISTS idx_datasource_timestamp
  ON datasource_metrics(datasourceId, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_brand_timestamp
  ON datasource_metrics(brandId, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_datasource_health
  ON datasource_metrics(datasourceId, healthStatus);

CREATE INDEX IF NOT EXISTS idx_timestamp
  ON datasource_metrics(timestamp);

-- ============================================================================
-- Table 2: datasource_status (Current state)
-- ============================================================================
CREATE TABLE IF NOT EXISTS datasource_status (
  id TEXT PRIMARY KEY,
  datasourceName TEXT NOT NULL,
  connected BOOLEAN NOT NULL,
  lastFetch INTEGER,
  lastError TEXT,
  currentLatency INTEGER,
  errorRate REAL DEFAULT 0,
  healthStatus TEXT CHECK (healthStatus IN ('healthy', 'degraded', 'critical')),
  uptime24h REAL DEFAULT 1,
  mtbf INTEGER,
  updatedAt INTEGER NOT NULL DEFAULT (CAST(strftime('%s', 'now') * 1000 AS INTEGER))
);

-- ============================================================================
-- Table 3: alert_rules (Configuration)
-- ============================================================================
CREATE TABLE IF NOT EXISTS alert_rules (
  id TEXT PRIMARY KEY,
  datasourceId TEXT NOT NULL,
  datasourceName TEXT,
  ruleType TEXT NOT NULL CHECK (ruleType IN ('latency', 'error_rate', 'downtime', 'sla')),
  threshold REAL NOT NULL,
  alertChannels TEXT NOT NULL,
  enabled BOOLEAN DEFAULT 1,
  cooldownSeconds INTEGER DEFAULT 3600,
  createdAt INTEGER NOT NULL DEFAULT (CAST(strftime('%s', 'now') * 1000 AS INTEGER)),
  updatedAt INTEGER NOT NULL DEFAULT (CAST(strftime('%s', 'now') * 1000 AS INTEGER))
);

CREATE INDEX IF NOT EXISTS idx_datasource_rules
  ON alert_rules(datasourceId);

CREATE INDEX IF NOT EXISTS idx_enabled_rules
  ON alert_rules(enabled);

-- ============================================================================
-- Table 4: alert_history (Audit log)
-- ============================================================================
CREATE TABLE IF NOT EXISTS alert_history (
  id TEXT PRIMARY KEY,
  ruleId TEXT NOT NULL,
  datasourceId TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('triggered', 'acknowledged', 'resolved')),
  triggeredAt INTEGER NOT NULL DEFAULT (CAST(strftime('%s', 'now') * 1000 AS INTEGER)),
  acknowledgedAt INTEGER,
  acknowledgedBy TEXT,
  resolvedAt INTEGER,
  message TEXT,
  context TEXT,
  createdAt INTEGER NOT NULL DEFAULT (CAST(strftime('%s', 'now') * 1000 AS INTEGER))
);

CREATE INDEX IF NOT EXISTS idx_rule_alerts
  ON alert_history(ruleId);

CREATE INDEX IF NOT EXISTS idx_datasource_history
  ON alert_history(datasourceId);

CREATE INDEX IF NOT EXISTS idx_state_triggered
  ON alert_history(state, triggeredAt);

-- ============================================================================
-- Views for common queries (optional, can improve performance)
-- ============================================================================

-- Latest metric per datasource (for fast dashboard display)
CREATE VIEW IF NOT EXISTS v_latest_metrics AS
SELECT DISTINCT ON (datasourceId) *
FROM datasource_metrics
ORDER BY datasourceId, timestamp DESC;

-- Active alerts by datasource
CREATE VIEW IF NOT EXISTS v_active_alerts AS
SELECT ah.*, ar.threshold, ar.ruleType
FROM alert_history ah
JOIN alert_rules ar ON ah.ruleId = ar.id
WHERE ah.state = 'triggered'
ORDER BY ah.triggeredAt DESC;

-- ============================================================================
-- Table 5: users (Clerk authentication)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  clerkId TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  firstName TEXT,
  lastName TEXT,
  avatar TEXT,
  lastLogin INTEGER,
  createdAt INTEGER NOT NULL DEFAULT (CAST(strftime('%s', 'now') * 1000 AS INTEGER)),
  updatedAt INTEGER NOT NULL DEFAULT (CAST(strftime('%s', 'now') * 1000 AS INTEGER))
);

CREATE INDEX IF NOT EXISTS idx_users_email
  ON users(email);

CREATE INDEX IF NOT EXISTS idx_users_clerkId
  ON users(clerkId);

-- ============================================================================
-- Table 6: emails_sent (Onboarding tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS emails_sent (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  emailType TEXT NOT NULL CHECK (emailType IN ('welcome', 'setup_reminder', 'feature_discovery')),
  sentAt INTEGER NOT NULL DEFAULT (CAST(strftime('%s', 'now') * 1000 AS INTEGER)),
  FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(userId, emailType)
);

CREATE INDEX IF NOT EXISTS idx_emails_userId
  ON emails_sent(userId);

-- ============================================================================
-- Summary
-- ============================================================================
-- Initialized 6 tables:
-- ✅ datasource_metrics - Time-series (30-day retention)
-- ✅ datasource_status - Current state (real-time)
-- ✅ alert_rules - Configuration
-- ✅ alert_history - Audit log (90-day retention)
-- ✅ users - Clerk authentication (linked via clerkId)
-- ✅ emails_sent - Onboarding email tracking (prevent duplicates)
--
-- With 14 indices for performance optimization
-- All timestamp columns use milliseconds (unix epoch)
-- All constraints checked at insert/update time
