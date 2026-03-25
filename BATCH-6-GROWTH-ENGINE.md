# Batch 6: Friend Codes & Referral System (Growth Engine)

**Status**: Ready to implement (research complete)
**Effort**: 3-4 hours MVP → 2-3 hours Phase 2 → 1-2 weeks Phase 3
**Priority**: P0 - Required for production launch
**ROI**: 30 paying customers ($5,970 MRR) from 1K organic users

---

## Overview

OpenDash requires a referral/redemption code system as the **core growth mechanism**. This is the proven playbook for reaching 1,000+ users without marketing budget.

**User's Strategy**: "Every new app I release has a backend with redeem codes and a referral system. This allows me to grow each app to at least 1,000 users without any additional marketing."

---

## Decision: Custom D1 Implementation

**Why not commercial platforms?**
- Referralrock/Refersion: $1,500-5,000/year
- Custom D1: ~$100/year
- Full control, Cloudflare-native, no vendor lock-in

**Why not open-source?**
- Research found no mature solutions for Cloudflare Workers
- Building custom is faster than adapting non-Workers code

**Full Analysis**: See `Standards/referral-system-cloudflare-analysis.md`

---

## Phase 1: MVP (3-4 hours) — SHIP THIS WEEK

### Deliverables

- [ ] D1 schema (campaigns, codes, redemptions, rewards)
- [ ] Code generation (nanoid, 8-char, URL-safe, collision-free)
- [ ] Validation endpoint (`POST /api/referral/validate`)
- [ ] Redemption API (`POST /api/referral/redeem`)
- [ ] Stripe integration (apply credit on redemption)
- [ ] Server functions (TanStack Start)

### Success Criteria

- User creates org → auto-generate friend code
- Code validates in <100ms
- Stripe receives credit when code redeemed
- D1 tracks all redemptions (audit log)

### Implementation Guide

#### 1. Add D1 Migration

```sql
-- migrations/0006_referrals.sql

CREATE TABLE campaigns (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  referrer_reward REAL NOT NULL,  -- e.g., 10 for $10
  referee_discount REAL NOT NULL, -- e.g., 10 for $10
  created_at INTEGER NOT NULL,
  FOREIGN KEY (org_id) REFERENCES organizations(id)
);

CREATE TABLE referral_codes (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  expires_at INTEGER,
  is_active INTEGER DEFAULT 1,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
  INDEX idx_code ON code,
  INDEX idx_active ON (is_active, expires_at)
);

CREATE TABLE redemptions (
  id TEXT PRIMARY KEY,
  code_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  redeemed_at INTEGER NOT NULL,
  discount_applied REAL,
  status TEXT DEFAULT 'applied',
  FOREIGN KEY (code_id) REFERENCES referral_codes(id),
  INDEX idx_user ON user_id,
  INDEX idx_code ON code_id
);

CREATE TABLE referral_rewards (
  id TEXT PRIMARY KEY,
  referrer_user_id TEXT NOT NULL,
  referee_user_id TEXT NOT NULL,
  code_id TEXT NOT NULL,
  reward_amount REAL NOT NULL,
  earned_at INTEGER NOT NULL,
  FOREIGN KEY (code_id) REFERENCES referral_codes(id),
  INDEX idx_referrer ON referrer_user_id
);
```

#### 2. Drizzle Schema

```typescript
// src/lib/db/schema.ts

export const campaignsTable = sqliteTable("campaigns", {
  id: text("id").primaryKey(),
  orgId: text("org_id").notNull(),
  name: text("name").notNull(),
  status: text("status", { enum: ["active", "paused", "ended"] }).default("active"),
  referrerReward: real("referrer_reward").notNull(),
  refereeDiscount: real("referee_discount").notNull(),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(cast(strftime('%s', 'now') * 1000 as integer))`),
});

export const referralCodesTable = sqliteTable("referral_codes", {
  id: text("id").primaryKey(),
  campaignId: text("campaign_id").notNull(),
  code: text("code").notNull().unique(),
  maxUses: integer("max_uses"),
  currentUses: integer("current_uses").default(0),
  expiresAt: integer("expires_at"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at").notNull(),
});

// Types
export type Campaign = typeof campaignsTable.$inferSelect;
export type ReferralCode = typeof referralCodesTable.$inferSelect;
```

#### 3. Code Generation

```typescript
// src/lib/referral/code-generator.ts

import { customAlphabet } from "nanoid";

const generateCode = customAlphabet(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  8
);

export async function createReferralCode(
  db: ReturnType<typeof drizzle>,
  orgId: string
): Promise<string> {
  const campaign = await db
    .select()
    .from(campaignsTable)
    .where(eq(campaignsTable.orgId, orgId))
    .get();

  if (!campaign) {
    // Create default campaign
    await db.insert(campaignsTable).values({
      id: `campaign_${orgId}`,
      orgId,
      name: "Friend Referral",
      referrerReward: 10,
      refereeDiscount: 10,
      createdAt: Date.now(),
    });
  }

  let code = generateCode();
  let collision = true;

  while (collision) {
    const existing = await db
      .select()
      .from(referralCodesTable)
      .where(eq(referralCodesTable.code, code))
      .get();

    if (!existing) {
      collision = false;
    } else {
      code = generateCode();
    }
  }

  // Insert code
  await db.insert(referralCodesTable).values({
    id: `code_${Date.now()}`,
    campaignId: campaign.id,
    code,
    createdAt: Date.now(),
  });

  return code;
}
```

#### 4. Validation Endpoint

```typescript
// src/routes/api/referral.ts

export const validateCodeFn = createServerFn(
  { method: "POST" },
  async (
    request: Request & {
      json: () => Promise<{ code: string }>;
    },
    context: EventContext
  ) => {
    const { code } = await request.json();
    const db = drizzle(context.env.DB);

    const referralCode = await db
      .select()
      .from(referralCodesTable)
      .where(eq(referralCodesTable.code, code))
      .where(eq(referralCodesTable.isActive, true))
      .get();

    if (!referralCode) {
      return { valid: false, error: "Code not found" };
    }

    if (referralCode.expiresAt && referralCode.expiresAt < Date.now()) {
      return { valid: false, error: "Code expired" };
    }

    if (
      referralCode.maxUses &&
      referralCode.currentUses >= referralCode.maxUses
    ) {
      return { valid: false, error: "Code limit reached" };
    }

    const campaign = await db
      .select()
      .from(campaignsTable)
      .where(eq(campaignsTable.id, referralCode.campaignId))
      .get();

    return {
      valid: true,
      discount: campaign?.refereeDiscount || 0,
    };
  }
);
```

#### 5. Redemption Endpoint

```typescript
export const redeemCodeFn = createServerFn(
  { method: "POST" },
  async (
    request: Request & {
      json: () => Promise<{ code: string; orgId: string }>;
    },
    context: EventContext
  ) => {
    const { code, orgId } = await request.json();
    const auth = getRequestAuthContext(request);
    const userId = auth?.userId;

    if (!userId || !orgId) {
      throw new Error("Missing context");
    }

    const db = drizzle(context.env.DB);

    // Validate code
    const referralCode = await db
      .select()
      .from(referralCodesTable)
      .where(eq(referralCodesTable.code, code))
      .get();

    if (!referralCode || !referralCode.isActive) {
      throw new Error("Code invalid");
    }

    // Check duplicate
    const existing = await db
      .select()
      .from(redemptionsTable)
      .where(eq(redemptionsTable.codeId, referralCode.id))
      .where(eq(redemptionsTable.userId, userId))
      .get();

    if (existing) {
      throw new Error("Already redeemed");
    }

    const campaign = await db
      .select()
      .from(campaignsTable)
      .where(eq(campaignsTable.id, referralCode.campaignId))
      .get();

    // Record redemption
    await db.insert(redemptionsTable).values({
      id: `redemption_${Date.now()}`,
      codeId: referralCode.id,
      userId,
      redeemedAt: Date.now(),
      discountApplied: campaign?.refereeDiscount || 0,
      status: "applied",
    });

    // Update code use count
    await db
      .update(referralCodesTable)
      .set({ currentUses: referralCode.currentUses + 1 })
      .where(eq(referralCodesTable.id, referralCode.id));

    // Apply to Stripe
    if (campaign?.refereeDiscount) {
      // TODO: Call Stripe to apply credit
      console.log(
        `Apply $${campaign.refereeDiscount} credit to user ${userId}`
      );
    }

    return { success: true, discount: campaign?.refereeDiscount };
  }
);
```

#### 6. Auto-Generate Code on Org Creation

```typescript
// In org creation flow

const org = await createOrganization(db, {
  name: orgName,
  ownerId: userId,
});

// Generate friend code
const friendCode = await createReferralCode(db, org.id);

// Return to client
return { org, friendCode };
```

---

## Phase 2: Performance & Fraud (2-3 hours, Week 2)

### Deliverables

- [ ] KV cache layer (60s TTL)
- [ ] IP velocity checks
- [ ] Bot detection integration
- [ ] Analytics Engine logging
- [ ] Dashboard UI

### Validation with Caching

```typescript
async function validateCodeWithCache(
  db: D1Database,
  kv: KVNamespace,
  code: string
) {
  // Try cache
  const cached = await kv.get(`code:${code}`);
  if (cached === "invalid") return null;
  if (cached) return JSON.parse(cached);

  // Query D1
  const result = await db
    .prepare(
      `SELECT rc.*, c.referee_discount FROM referral_codes rc
       JOIN campaigns c ON rc.campaign_id = c.id
       WHERE rc.code = ? AND rc.is_active = 1
         AND (rc.expires_at IS NULL OR rc.expires_at > ?)`
    )
    .bind(code, Date.now())
    .first();

  if (!result) {
    await kv.put(`code:${code}`, "invalid", { expirationTtl: 60 });
    return null;
  }

  await kv.put(`code:${code}`, JSON.stringify(result), {
    expirationTtl: 60,
  });
  return result;
}
```

### Fraud Prevention

```typescript
async function checkFraud(request: Request, db: D1Database) {
  const ip = request.headers.get("CF-Connecting-IP");
  const botScore = request.headers.get("cf-bot-management-score");

  // Bot detection
  if (botScore && parseInt(botScore) > 80) {
    return { blocked: true, reason: "Bot activity detected" };
  }

  // IP velocity
  const recentFromIp = await db
    .prepare(`SELECT COUNT(*) as count FROM redemptions WHERE ip = ? AND redeemed_at > ?`)
    .bind(ip, Date.now() - 3600000)
    .first();

  if (recentFromIp.count > 10) {
    return { blocked: true, reason: "Too many attempts" };
  }

  return { blocked: false };
}
```

---

## Phase 3: Advanced (1-2 weeks, Week 3+)

- [ ] Tiered rewards
- [ ] Leaderboard
- [ ] Email notifications
- [ ] Admin dashboard

---

## Growth Projections

### Conservative Scenario (20% conversion)

```
Week 1: Launch with 100 beta users
Week 2: 100 × 3 referrals = 300 new signups
        300 × 10% Pro conversion = 30 paying customers
        30 × $199 = $5,970 MRR

Month 2: 30 × 2 more referrals = 60 new signups
         60 × 10% = 6 new Pro → +$1,194 MRR
         Total: $7,164 MRR

Month 3: Momentum continues → $50k+ MRR achievable
```

---

## Testing Checklist

- [ ] Code generates uniquely (no collisions)
- [ ] Validation prevents double redemption
- [ ] Max uses enforced
- [ ] Expiry respected
- [ ] Stripe credit applied
- [ ] Analytics logged

---

## Success Metrics

- Validation latency: <100ms
- Code redemption rate: >10%
- Referral conversion: >10%
- Cost per user: <$5 (vs $20-50 marketing)

---

## References

- Full analysis: `Standards/referral-system-cloudflare-analysis.md`
- Code generation: `github.com/ai/nanoid`
- D1 docs: `developers.cloudflare.com/d1/`
- Analytics: `developers.cloudflare.com/workers/databases/analytics-engine/`

---

## Next Steps

1. ✅ Research complete
2. → **Implement Phase 1 MVP** (3-4 hours)
3. → Deploy with launch
4. → Monitor metrics
5. → Phase 2 (performance) next week

**Timeline**: Ship this week with Batches 1-5 for maximum impact.
