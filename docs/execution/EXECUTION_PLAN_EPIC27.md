# Epic #27 Execution Plan — Revised (No Fake Blockers)

**Status**: Ready to proceed immediately
**Total Effort**: 46 hours of implementation (parallel, no blockers)
**Target**: Week 6 ProductHunt launch

---

## Implementation Roadmap (Parallel Work)

### Batch 1: Complete Foundation (Days 1-3)

#### Task 1.1: Complete #27.4 SERP Dashboard (2-3 hours)
**Status**: 90% done, just needs D1 wiring

```
1. Wire getSerpTrends() server function to real D1 queries
   - Query competitors table + serp_rankings
   - Calculate 7/30-day trends
   - Test with sample data (1 hour)

2. Integrate SerpTrendingPanel into dashboard
   - Add to FocusPanel (single brand view)
   - Wire callbacks to briefing generation (30 min)

3. Test end-to-end
   - Verify dashboard loads with real data
   - Validate 202 tests still pass (30 min)
```

**Deliverable**: Complete SERP dashboard operational ✅

---

### Batch 2: Competitive Monitoring (Days 3-5)

#### Task 2.1: ContentMonitorDataSource (5 hours)
**Scope**: Monitor competitor blog/RSS updates

```typescript
// Structure
interface ContentSnapshot {
  competitorId: string;
  url: string;           // Post URL
  title: string;
  publishedDate: Date;
  wordCount: number;
  category?: string;     // Blog category if detectable
}

// Detection logic
function detectContentChanges(today: ContentSnapshot[], yesterday: ContentSnapshot[]) {
  // Detect: new blog category, frequency changes, topic shifts
  // Return high-priority movements (e.g., "3x more content this week")
}

// Integration
export const contentMonitorSource: DataSource = {
  id: "content-monitor",
  name: "Content Updates",
  icon: "📝",

  async fetch(config: DataSourceConfig): Promise<BriefingItem[]> {
    // Query competitor RSS feeds
    // Detect new content
    // Return briefing items for significant changes
  }
}
```

**Implementation**:
1. D1 schema for content snapshots (1 hour)
2. RSS feed parser (1 hour)
3. Change detection logic (1 hour)
4. Datasource + briefing items (1 hour)
5. Tests (1 hour)

**Deliverable**: Content monitoring datasource operational ✅

---

#### Task 2.2: Domain Metrics DataSource (4 hours)
**Scope**: Domain authority, traffic, keyword tracking

```typescript
// For MVP: Use public data (SimilarWeb free tier or Ahrefs free API)
// Later: Wire real API

interface DomainSnapshot {
  competitorId: string;
  domainAuthority: number;      // DA score
  estimatedMonthlyVisitors: number;
  estimatedKeywords: number;
  lastChecked: Date;
}

function detectDomainMovements(today: DomainSnapshot[], yesterday: DomainSnapshot[]) {
  // Detect: DA increase, traffic changes, keyword growth
  // Return: "Competitor X gained 100K monthly visitors"
}

export const domainMetricsSource: DataSource = {
  async fetch(config: DataSourceConfig): Promise<BriefingItem[]> {
    // For now: Return stub data with "Integration ready" message
    // Later: Wire SimilarWeb or Ahrefs API
  }
}
```

**Implementation**:
1. D1 schema (30 min)
2. Public data source integration (1 hour)
3. Change detection (30 min)
4. Datasource + briefing (30 min)
5. Tests + stub API fallback (1 hour)

**Deliverable**: Domain metrics datasource (stub API ready for wiring) ✅

---

### Batch 3: Campaign Metrics (Days 5-7)

#### Task 3.1: GoogleAdsDataSource (4 hours)
**Scope**: Spend, impressions, clicks, conversions, ROAS

```typescript
// Stub structure (wire real API later)
interface CampaignSnapshot {
  campaignId: string;
  campaignName: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  costPerConversion: number;
  roas: number;
  snapshotDate: Date;
}

export const googleAdsSource: DataSource = {
  id: "google-ads",
  name: "Google Ads Performance",
  icon: "📊",

  async fetch(config: DataSourceConfig): Promise<BriefingItem[]> {
    // Step 1: Try to fetch from real Google Ads API
    // Step 2: Fallback to stub data if no API key
    // Return: "Campaign X spent $500, got 10 conversions"
  }
}
```

**Implementation**:
1. D1 schema + indices (1 hour)
2. Stub datasource (returns mock data) (1 hour)
3. Briefing item logic (conversion alerts, ROI changes) (1 hour)
4. Tests (1 hour)

**Note**: Wire real Google Ads API later (1-2 hours when API key available)

**Deliverable**: Google Ads datasource (stub → real API hookup ready) ✅

---

#### Task 3.2: MetaAdsDataSource (4 hours)
**Same pattern as Google Ads** (4 hours)

---

#### Task 3.3: GA4DataSource (2 hours)
**Simplified**: Track organic traffic, conversion rate

```typescript
interface TrafficSnapshot {
  source: "organic" | "paid" | "direct" | "referral";
  visitors: number;
  conversions: number;
  conversionRate: number;
  snapshotDate: Date;
}
```

---

### Batch 4: Alert System (Days 8-9)

#### Task 4.1: Alert Routing & Deduplication (3 hours)

```typescript
// Alert structure
interface Alert {
  id: string;
  trigger: "serp_drop" | "budget_overspend" | "traffic_anomaly" | "conversion_drop";
  severity: "critical" | "warning" | "info";
  channels: ("slack" | "email" | "in-app")[];
  recipient: string;
  message: string;
  createdAt: Date;
  acknowledgedAt?: Date;
}

// Deduplication logic
function shouldFireAlert(alert: Alert, recentAlerts: Alert[]): boolean {
  // Don't fire same alert twice in 5 minutes
  const similar = recentAlerts.find(a =>
    a.trigger === alert.trigger &&
    a.recipient === alert.recipient &&
    Date.now() - a.createdAt.getTime() < 5 * 60 * 1000
  );
  return !similar;
}

// Routing
export async function routeAlert(alert: Alert): Promise<void> {
  if (alert.channels.includes("slack")) {
    await sendToSlack(alert);  // Stub for now
  }
  if (alert.channels.includes("email")) {
    await sendEmail(alert);    // Stub for now
  }
  if (alert.channels.includes("in-app")) {
    await storeInAppNotification(alert);
  }
}
```

**Deliverable**: Alert system with stub channels (ready to wire Slack/email) ✅

---

#### Task 4.2: In-App Notifications UI (2 hours)

```typescript
export function AlertManager() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Show alerts in real-time
  // Allow dismiss/snooze
  // Show history
}
```

---

### Batch 5: Billing System (Days 9-10)

#### Task 5.1: Stripe Integration (5 hours)

```typescript
// Pricing tiers
const PRICING_TIERS = {
  starter: { price: 29900, brands: 3, users: 1 },      // $299/mo
  pro: { price: 79900, brands: 10, users: 5 },        // $799/mo
  enterprise: { price: null, brands: unlimited, users: unlimited },
};

// Subscription flow
1. User selects tier
2. Redirect to Stripe checkout
3. Webhook confirms payment
4. Update org subscription + enforcement

// Tier enforcement
function checkTierLimit(org: Org, resource: "brands" | "users") {
  const tier = PRICING_TIERS[org.tier];
  const current = await countResource(org.id, resource);
  if (current >= tier[resource]) {
    throw new Error(`${resource} limit reached for ${org.tier} tier`);
  }
}
```

**Implementation**:
1. D1 schema (subscriptions table) (1 hour)
2. Stripe checkout integration (1.5 hours)
3. Webhook handling (1 hour)
4. Tier enforcement (1 hour)
5. Tests (0.5 hours)

**Note**: Wire real Stripe keys later (30 min when keys available)

**Deliverable**: Billing system with stub Stripe (ready for production keys) ✅

---

### Batch 6: Polish (Day 11+)

#### Task 6.1: Email/JWT (2 hours) — Only when keys available
- Add RESEND_API_KEY
- Get Clerk public key
- Wire JWT decode + email sending
- Test real user invites

---

## Testing Strategy

### Per-Feature Testing (As You Go)
```
For each datasource/feature:
1. Unit tests for logic (parsing, detection)
2. Integration test with mock data
3. End-to-end test with stub APIs
4. Validate all 202 tests still pass
```

### Milestone Testing (After Each Batch)
```
Batch 1 (SERP):
  - SERP dashboard loads with real D1 data
  - Trend calculations correct
  - All tests pass

Batch 2 (Monitoring):
  - Content monitor detects changes
  - Domain metrics show correct data
  - All tests pass

Batch 3 (Campaigns):
  - Campaign dashboard shows data
  - ROI calculations correct
  - All tests pass

Batch 4 (Alerts):
  - Alerts fire correctly
  - Deduplication works
  - All tests pass

Batch 5 (Billing):
  - Tier limits enforced
  - Checkout flow works
  - All tests pass
```

---

## Parallel Work Opportunities

**Can be done simultaneously**:
- Task 2.1 (Content) + Task 3.1 (Google Ads) — different codebases
- Task 2.2 (Domain) + Task 3.2 (Meta Ads) — different codebases
- Task 4.1 (Alert Routing) + Task 5.1 (Billing) — different codebases

**Sequential Only**:
- Task 1.1 (SERP) → must finish first (unblocks everything else)

**Recommended Parallelization**:
- Days 1-3: You do Task 1.1 (SERP) in foreground
- Days 3-5: You do Task 2.1 + 2.2 (Content + Domain)
- Days 5-7: You do Task 3.1 + 3.2 (Google + Meta Ads)
- Days 8-9: You do Task 4.1 + 4.2 (Alerts)
- Days 9-10: You do Task 5.1 (Billing)
- Day 11+: Polish + testing

---

## Stub Strategy (For APIs Without Keys)

All external API integrations follow this pattern:

```typescript
async function fetchFromExternalAPI(endpoint: string) {
  try {
    // Try real API
    const apiKey = config.env.SOME_API_KEY;
    if (!apiKey) throw new Error("No API key");

    const response = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
    return response.json();
  } catch (err) {
    // Fallback to stub data
    console.log("Using stub data for", endpoint);
    return generateStubData(endpoint);
  }
}
```

**Benefits**:
- Feature complete before real API key available
- Tests pass with stub data
- Easy to wire real API later (1-2 hour per integration)
- No waiting on external services

---

## Success Criteria

### After Batch 1 (Day 3)
- ✅ SERP dashboard shows real rankings
- ✅ 202 tests passing
- ✅ No regressions

### After Batch 2 (Day 5)
- ✅ Competitor monitoring datasources registered
- ✅ Change detection working (with stub data)
- ✅ All tests passing

### After Batch 3 (Day 7)
- ✅ Campaign dashboard shows metrics (with stub data)
- ✅ ROI calculations correct
- ✅ All tests passing

### After Batch 4 (Day 9)
- ✅ Alerts fire correctly
- ✅ Slack/email placeholders in place
- ✅ All tests passing

### After Batch 5 (Day 10)
- ✅ Billing system enforces tier limits
- ✅ Checkout flow works (test mode)
- ✅ All tests passing

### After Batch 6 (Day 11+)
- ✅ Real email sending works
- ✅ Real user JWT decode works
- ✅ All 202 tests passing
- ✅ Zero regressions
- ✅ Staging validated

---

## Go/No-Go Decision

**After Day 3 (SERP Complete)**:
- If SERP dashboard operational + 202 tests pass → proceed to Batch 2
- If any failures → stabilize before batch 2

**After Day 10 (All Core Features)**:
- If all features + tests pass → proceed to polish phase
- If any failures → fix before moving to polish

**After Day 11+ (Polish Phase)**:
- If email/JWT work + staging stable for 1 week → ProductHunt ready
- If any failures → fix + retest

---

## Timeline Summary

| Phase | Days | Effort | Deliverable |
|-------|------|--------|-------------|
| **Batch 1** | 1-3 | 2-3h | SERP dashboard ✅ |
| **Batch 2** | 3-5 | 9h | Competitor monitoring ✅ |
| **Batch 3** | 5-7 | 10h | Campaign metrics ✅ |
| **Batch 4** | 8-9 | 5h | Alert system ✅ |
| **Batch 5** | 9-10 | 5h | Billing system ✅ |
| **Batch 6** | 11+ | 2h | Email/JWT polish ✅ |
| **Testing** | Continuous | 5h | Validation + launch prep |
| | | **46h total** | **ProductHunt ready** |

---

## How to Start

### Right Now (Next 30 Minutes)
1. Read this plan
2. Verify D1 database is set up correctly
3. Start Task 1.1 (SERP D1 wiring)

### Task 1.1 Checklist
```
[ ] Wire getSerpTrends() to real D1 queries
[ ] Test with sample competitor data
[ ] Integrate SerpTrendingPanel into dashboard
[ ] Run full test suite
[ ] Commit with "Complete Issue #27.4" message
```

---

**Status**: Ready to proceed immediately
**Next Action**: Start Task 1.1 (SERP D1 wiring, 2-3 hours)
