-- ============================================================================
-- OpenDash SERP Tracker Tables
-- Migration #003 for competitive intelligence tracking
--
-- Adds:
-- 1. competitors (domain, keywords to track)
-- 2. serp_rankings (daily snapshots of search positions)
-- ============================================================================

-- ============================================================================
-- Table 1: competitors (Tracked competitor domains per brand)
-- ============================================================================
CREATE TABLE IF NOT EXISTS competitors (
  id TEXT PRIMARY KEY,
  brandId TEXT NOT NULL,
  orgId TEXT NOT NULL,
  domain TEXT NOT NULL,
  name TEXT NOT NULL,

  -- Keywords to track for this competitor (JSON array)
  keywords TEXT DEFAULT '[]',

  -- Status
  active BOOLEAN NOT NULL DEFAULT 1,
  archived BOOLEAN NOT NULL DEFAULT 0,
  archivedAt INTEGER,

  -- Timestamps
  createdAt INTEGER NOT NULL DEFAULT (CAST(strftime('%s', 'now') * 1000 AS INTEGER)),
  updatedAt INTEGER NOT NULL DEFAULT (CAST(strftime('%s', 'now') * 1000 AS INTEGER)),

  -- Constraints
  FOREIGN KEY(brandId) REFERENCES brands(id) ON DELETE CASCADE,
  FOREIGN KEY(orgId) REFERENCES organizations(id) ON DELETE CASCADE,
  UNIQUE(brandId, domain)
);

CREATE INDEX IF NOT EXISTS idx_competitors_brandId ON competitors(brandId);
CREATE INDEX IF NOT EXISTS idx_competitors_orgId ON competitors(orgId);
CREATE INDEX IF NOT EXISTS idx_competitors_domain ON competitors(domain);
CREATE INDEX IF NOT EXISTS idx_competitors_active ON competitors(active);

-- ============================================================================
-- Table 2: serp_rankings (Search result positions over time)
-- ============================================================================
CREATE TABLE IF NOT EXISTS serp_rankings (
  id TEXT PRIMARY KEY,
  competitorId TEXT NOT NULL,
  brandId TEXT NOT NULL,
  orgId TEXT NOT NULL,

  -- Search term and result
  keyword TEXT NOT NULL,
  rank INTEGER NOT NULL,
  url TEXT NOT NULL,
  title TEXT,
  snippet TEXT,

  -- Search engine (google, bing, etc)
  searchEngine TEXT DEFAULT 'google',

  -- Snapshot date (for daily comparison)
  snapshotDate INTEGER NOT NULL, -- Date in milliseconds (start of day UTC)

  -- Timestamps
  createdAt INTEGER NOT NULL DEFAULT (CAST(strftime('%s', 'now') * 1000 AS INTEGER)),

  -- Constraints
  FOREIGN KEY(competitorId) REFERENCES competitors(id) ON DELETE CASCADE,
  FOREIGN KEY(brandId) REFERENCES brands(id) ON DELETE CASCADE,
  FOREIGN KEY(orgId) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_serp_rankings_competitorId ON serp_rankings(competitorId);
CREATE INDEX IF NOT EXISTS idx_serp_rankings_brandId ON serp_rankings(brandId);
CREATE INDEX IF NOT EXISTS idx_serp_rankings_orgId ON serp_rankings(orgId);
CREATE INDEX IF NOT EXISTS idx_serp_rankings_keyword ON serp_rankings(keyword);
CREATE INDEX IF NOT EXISTS idx_serp_rankings_snapshotDate ON serp_rankings(snapshotDate);
CREATE INDEX IF NOT EXISTS idx_serp_rankings_competitive ON serp_rankings(competitorId, keyword, snapshotDate);

-- ============================================================================
-- Summary
-- ============================================================================
-- Migration 003 adds:
-- ✅ competitors (track competitor domains per brand)
-- ✅ serp_rankings (daily snapshots of search positions)
-- ✅ 9 indices for fast queries on daily snapshots
--
-- Supports:
-- - Tracking multiple competitors per brand
-- - Daily snapshots for trend analysis
-- - Multi-keyword tracking
-- - Rank change detection
-- - Date range queries for trend analysis
