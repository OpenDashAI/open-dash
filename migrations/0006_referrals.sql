-- ============================================================================
-- BATCH 6: FRIEND CODES & REFERRAL SYSTEM (Growth Engine)
-- ============================================================================

-- Campaigns: Referral program definitions (one per organization)
CREATE TABLE campaigns (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active', -- 'active', 'paused', 'ended'
  referrer_reward REAL NOT NULL,  -- e.g., 10 for $10
  referee_discount REAL NOT NULL, -- e.g., 10 for $10
  created_at INTEGER NOT NULL,
  FOREIGN KEY (org_id) REFERENCES organizations(id),
  CHECK (referrer_reward >= 0),
  CHECK (referee_discount >= 0)
);

-- Referral codes: Individual friend codes created per organization
CREATE TABLE referral_codes (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  expires_at INTEGER,
  is_active INTEGER DEFAULT 1, -- Boolean: 0 or 1
  created_at INTEGER NOT NULL,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
  INDEX idx_code ON code,
  INDEX idx_active ON (is_active, expires_at),
  INDEX idx_campaign ON campaign_id
);

-- Redemptions: Audit log of code uses
CREATE TABLE redemptions (
  id TEXT PRIMARY KEY,
  code_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  redeemed_at INTEGER NOT NULL,
  discount_applied REAL,
  status TEXT DEFAULT 'applied', -- 'applied', 'refunded'
  ip_address TEXT,
  FOREIGN KEY (code_id) REFERENCES referral_codes(id),
  INDEX idx_user ON user_id,
  INDEX idx_code ON code_id,
  INDEX idx_timestamp ON redeemed_at,
  UNIQUE(code_id, user_id) -- Prevent double redemption
);

-- Referral rewards: Track rewards earned by referrers
CREATE TABLE referral_rewards (
  id TEXT PRIMARY KEY,
  referrer_user_id TEXT NOT NULL,
  referee_user_id TEXT NOT NULL,
  code_id TEXT NOT NULL,
  reward_amount REAL NOT NULL,
  earned_at INTEGER NOT NULL,
  FOREIGN KEY (code_id) REFERENCES referral_codes(id),
  INDEX idx_referrer ON referrer_user_id,
  INDEX idx_referee ON referee_user_id,
  INDEX idx_timestamp ON earned_at
);
