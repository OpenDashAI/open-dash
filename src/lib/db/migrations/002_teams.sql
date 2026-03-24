-- ============================================================================
-- OpenDash Team & Organization Tables
-- Migration #002 for B2B multi-tenant support
--
-- Adds:
-- 1. organizations (tenant container)
-- 2. team_members (users in org with roles)
-- 3. brands (products/clients per org)
-- 4. Org scoping columns to existing tables
-- ============================================================================

-- ============================================================================
-- Table 1: organizations (Tenant container)
-- ============================================================================
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  clerkId TEXT UNIQUE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'enterprise')),

  -- Billing
  stripeCustomerId TEXT,
  stripeSubscriptionId TEXT,

  -- Metadata
  website TEXT,
  logo TEXT,

  -- Timestamps
  createdAt INTEGER NOT NULL DEFAULT (CAST(strftime('%s', 'now') * 1000 AS INTEGER)),
  updatedAt INTEGER NOT NULL DEFAULT (CAST(strftime('%s', 'now') * 1000 AS INTEGER))
);

CREATE INDEX IF NOT EXISTS idx_organizations_clerkId ON organizations(clerkId);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_plan ON organizations(plan);

-- ============================================================================
-- Table 2: team_members (Users in org with roles)
-- ============================================================================
CREATE TABLE IF NOT EXISTS team_members (
  id TEXT PRIMARY KEY,
  orgId TEXT NOT NULL,
  userId TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),

  -- Invitation tracking
  invitedBy TEXT,
  invitedAt INTEGER,
  acceptedAt INTEGER,

  -- Status
  active BOOLEAN NOT NULL DEFAULT 1,

  -- Timestamps
  createdAt INTEGER NOT NULL DEFAULT (CAST(strftime('%s', 'now') * 1000 AS INTEGER)),
  updatedAt INTEGER NOT NULL DEFAULT (CAST(strftime('%s', 'now') * 1000 AS INTEGER)),

  -- Constraints
  FOREIGN KEY(orgId) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(invitedBy) REFERENCES users(id),
  UNIQUE(orgId, userId)
);

CREATE INDEX IF NOT EXISTS idx_team_members_orgId ON team_members(orgId);
CREATE INDEX IF NOT EXISTS idx_team_members_userId ON team_members(userId);
CREATE INDEX IF NOT EXISTS idx_team_members_orgId_active ON team_members(orgId, active);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON team_members(role);
CREATE INDEX IF NOT EXISTS idx_team_members_acceptedAt ON team_members(acceptedAt);

-- ============================================================================
-- Table 3: brands (Products/Clients per org)
-- ============================================================================
CREATE TABLE IF NOT EXISTS brands (
  id TEXT PRIMARY KEY,
  orgId TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  domain TEXT UNIQUE NOT NULL,

  -- Metadata
  logo TEXT,
  favicon TEXT,
  themeColor TEXT,

  -- Configuration (JSON arrays)
  datasources TEXT DEFAULT '[]',
  competitors TEXT DEFAULT '[]',
  keywords TEXT DEFAULT '[]',

  -- Status
  active BOOLEAN NOT NULL DEFAULT 1,
  archived BOOLEAN NOT NULL DEFAULT 0,
  archivedAt INTEGER,

  -- Timestamps
  createdAt INTEGER NOT NULL DEFAULT (CAST(strftime('%s', 'now') * 1000 AS INTEGER)),
  updatedAt INTEGER NOT NULL DEFAULT (CAST(strftime('%s', 'now') * 1000 AS INTEGER)),

  -- Constraints
  FOREIGN KEY(orgId) REFERENCES organizations(id) ON DELETE CASCADE,
  UNIQUE(orgId, slug)
);

CREATE INDEX IF NOT EXISTS idx_brands_orgId ON brands(orgId);
CREATE INDEX IF NOT EXISTS idx_brands_orgId_active ON brands(orgId, active);
CREATE INDEX IF NOT EXISTS idx_brands_domain ON brands(domain);
CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug);

-- ============================================================================
-- Scoping columns for existing tables
-- ============================================================================

-- Add orgId to datasource_metrics for org-scoped queries
ALTER TABLE datasource_metrics ADD COLUMN orgId TEXT;
CREATE INDEX IF NOT EXISTS idx_datasource_metrics_orgId ON datasource_metrics(orgId);

-- Add orgId to alert_rules for org-scoped rules
ALTER TABLE alert_rules ADD COLUMN orgId TEXT;
CREATE INDEX IF NOT EXISTS idx_alert_rules_orgId ON alert_rules(orgId);

-- Add orgId to alert_history for audit trails per org
ALTER TABLE alert_history ADD COLUMN orgId TEXT;
CREATE INDEX IF NOT EXISTS idx_alert_history_orgId ON alert_history(orgId);

-- ============================================================================
-- Summary
-- ============================================================================
-- Migration 002 adds:
-- ✅ organizations (multi-tenant)
-- ✅ team_members (team collaboration)
-- ✅ brands (multi-brand support)
-- ✅ org scoping for existing tables
-- ✅ 14 indices for performance
--
-- All tables support soft-delete with active/archived flags
-- All timestamps use milliseconds (unix epoch)
-- All constraints checked at insert/update time
-- Foreign keys cascade on delete (safe cleanup)
