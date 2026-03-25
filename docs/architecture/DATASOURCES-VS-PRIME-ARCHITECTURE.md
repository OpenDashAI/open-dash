# Datasources Architecture vs Prime: Clarifying the Data Model

**Question**: What is a datasource really? Database? Widget? Why not use D1, SQLite, or Durable Objects directly?

**Answer**: Datasources are **adapters/connectors**, not databases. They're fundamentally different from Prime. But you could use Prime architecture to improve OpenDash. Let me clarify.

---

## What Is a Datasource? (Current Implementation)

A datasource is a **fetch adapter** — a function that:
1. Takes credentials + brand-specific config
2. Queries an external API/system
3. Transforms the response into BriefingItem array
4. Returns the items to be rendered

```ts
interface DataSource {
  id: string;
  name: string;

  async fetch(config: DataSourceConfig): Promise<BriefingItem[]>;
}

// Example: GitHub Issues datasource
export const githubIssuesSource: DataSource = {
  id: "github-issues",
  async fetch(config) {
    // 1. Get GitHub token from config.env
    // 2. Call GitHub API with brand-specific repo param
    // 3. Transform issues into BriefingItem[]
    // 4. Return items
    return items;
  }
};
```

**Key insight**: Datasources are **not storage**. They're **connectors to external storage** (GitHub API, Stripe API, etc.).

---

## The Three-Layer Architecture

OpenDash actually has three distinct layers, each solving a different problem:

### Layer 1: Data Connectors (Datasources)
**What**: Adapters that fetch from external APIs
**Where**: `src/datasources/*.ts`
**Examples**: GitHub, Stripe, Cloudflare, Tailscale, Scalable Media
**Nature**: Stateless functions that fetch + transform
**Runs**: On-demand, when user loads briefing or dashboard

```
GitHub API → githubIssuesSource → BriefingItem[] → UI Card
Stripe API → stripeRevenueSource → BriefingItem[] → UI Card
CF API    → cfDeploysSource      → BriefingItem[] → UI Card
```

### Layer 2: Orchestration (fetchBrandDashboard)
**What**: Coordinates multiple datasources, parallelizes, handles errors
**Where**: `src/server/datasources.ts`
**Nature**: Synchronous function that runs all sources in parallel
**Runs**: On-demand, per route load

```ts
export const fetchBrandDashboard = async (brandSlug) => {
  const config = await loadDashboardConfig(brandSlug);

  const results = await Promise.allSettled(
    config.sources.map(source => source.fetch(...))
  );

  return { items: [...items], statuses: {...} };
};
```

### Layer 3: Presentation (UI Cards)
**What**: Renders BriefingItem[] as card components
**Where**: `src/components/cards/*.tsx`
**Nature**: React components
**Runs**: In browser, re-renders on data change

```ts
// BriefingItem from datasource
{
  id: "gh-issue-42",
  title: "Fix auth bug",
  priority: "high",
  // ...
}

// Rendered as card
<IssueCard item={item} />
```

---

## Why Not Use D1/SQLite/Durable Objects Directly?

Good question. Let's compare the models:

### The Datasource Model (Current)
```
User opens dashboard
  ↓
fetchBrandDashboard(brandSlug)
  ↓
Fetch from all configured datasources in parallel
  ↓
Transform to BriefingItem[]
  ↓
Render as cards
  ↓
User sees dashboard
```

**Pros**:
- ✅ Fresh data every load
- ✅ Stateless (no database management overhead)
- ✅ Works with any external API (GitHub, Stripe, etc.)
- ✅ Easy to reason about (no state ambiguity)

**Cons**:
- ❌ Slow on first load (3-5 API calls happen serially)
- ❌ No historical data (only current state)
- ❌ Can't detect trends (need timestamps)
- ❌ Rate limit risk (if you reload, you make 6 API calls again)

### The D1/SQLite Model (What You're Suggesting)
```
Datasource runs (on cron or webhook)
  ↓
Fetches from APIs
  ↓
Stores in D1/SQLite table
  ↓
User opens dashboard
  ↓
Query D1: SELECT * FROM briefing_items WHERE brand=X
  ↓
Render as cards
```

**Pros**:
- ✅ Fast reads (query database, no API calls)
- ✅ Historical data (timestamps, trends)
- ✅ Can detect anomalies (compare to 7-day avg)
- ✅ Caching layer (reduce API calls)

**Cons**:
- ❌ Stale data (only as fresh as last sync)
- ❌ Need separate "sync" job (cron or webhook)
- ❌ Schema management (define tables + migrations)
- ❌ State complexity (now you have two sources of truth)

### The Prime Model (Control Plane + Data Plane)
```
Prime Agent (Durable Object + SQLite)
  ├── Watches: GitHub webhooks, time alarms
  ├── Decides: what needs doing, what changed
  ├── Stores: in DO SQLite (decisions, state, history)
  └── Orchestrates: calls dispatcher when action needed

User opens dashboard
  ↓
Query DO SQLite for current briefing state
  ↓
Render as cards
```

**Pros**:
- ✅ Stateful (agent remembers everything)
- ✅ Intelligent (agent reasons about state)
- ✅ Event-driven (reacts to webhooks, not just polls)
- ✅ Always-on presence (persistent agent)
- ✅ Hibernation (zero cost when idle)

**Cons**:
- ❌ Complex (needs Durable Objects understanding)
- ❌ Schema/state management
- ❌ Agent logic must be correct (bugs are persistent)

---

## Which Model for What Use Case?

### Use Datasources (Current Model) When:
- Data is from external APIs (GitHub, Stripe, Cloudflare)
- You want fresh data on every load
- You don't need historical trends
- API quotas aren't a concern
- Real-time is more important than performance

**Example**: Morning briefing for solo founder
- "What changed overnight?" requires fresh data
- Load time: 3-5 seconds is acceptable
- No need for historical trends

### Use D1 + Cron Model When:
- You have many users hitting the same data (caching benefit)
- You need historical data (trends, anomalies)
- API rate limits are a concern
- You can tolerate 5-minute staleness
- Read performance is critical

**Example**: SaaS GTM analytics dashboard for team
- Multiple team members load dashboard throughout day
- Want to see "revenue trend for month"
- Need anomaly detection ("sales down today")
- API quotas are constrained

### Use Prime Model When:
- You need intelligent, always-on agents
- System has complex state to track
- You need event-driven reactions (webhooks)
- You want persistent memory across sessions
- Cost of idle compute matters (hibernation)

**Example**: Autonomous org-level control plane
- Agent watches 40 repos, detects drift
- Decides when to apply fixes (not just alerts)
- Remembers past decisions, learns patterns
- Only wakes when needed (hibernation)

---

## The Optimal Architecture for OpenDash

### Phase 1-2 (MVP): Pure Datasources ✅ (Current)
```
User → fetchBrandDashboard → Datasources (fetch from APIs) → BriefingItem[] → Cards
```
- Simple, stateless, good for MVP
- Trade: slower loads, less advanced features
- Cost: fast development

### Phase 3-4 (Scale): Add Caching Layer
```
Cron Job (every 5 min)
  → Fetch from all datasources
  → Store in D1 (briefing_items table)

User → Query D1 → BriefingItem[] → Cards
```
- Add D1 table: `briefing_items(id, brand_slug, source_id, data, timestamp)`
- Cron fetches all sources → upsert to D1
- User queries D1 instead of fetching APIs
- Benefits: faster, cacheable, can do anomaly detection

### Phase 5 (Advanced): Add Prime Agent Layer
```
Prime Agent (Durable Object)
  ├── Watches: GitHub webhooks, D1 data changes
  ├── Reasons: "which items need escalation?"
  └── Stores: decisions, context, history

User → Prime DO → Read decision state from DO SQLite → Cards
```
- Prime agent monitors datasources + D1
- Makes decisions (not just fetches)
- Escalates high-priority items automatically
- Learns from past decisions

---

## Recommendation: Phased Evolution

### NOW (Week 1-2): Keep Pure Datasources
- No D1 schema to manage
- Simple fetch → render
- Fast to build

### LATER (Week 13+): Add D1 Caching
**Why**: Performance + features (trends, anomalies)

```ts
// New datasource that reads from cache
export const cachedBriefingSource: DataSource = {
  id: "cached-briefing",
  async fetch(config) {
    const items = await d1.prepare(
      "SELECT * FROM briefing_items WHERE brand = ? AND timestamp > ?"
    ).bind(config.brand, oneHourAgo).all();

    return items;
  }
};
```

**Cron job** (runs every 5 minutes):
```ts
// Fetch all datasources and cache
async function syncBriefingCache() {
  for (const brand of brands) {
    const items = await fetchBrandDashboard(brand);
    await d1.prepare(
      "INSERT INTO briefing_items VALUES (?, ?, ?)"
    ).bind(id, brand, JSON.stringify(items)).run();
  }
}
```

### MUCH LATER (Phase 5+): Add Prime Agents
- Only if you need intelligent, stateful decisions
- Complex agents that reason about state
- Coordinate multiple teams/repos
- Not needed for simple dashboard

---

## Answering Your Original Questions

**Q: Are we just talking about a database?**
A: No. Datasources are adapters. Databases (D1, SQLite) are optional caching/storage layer added later.

**Q: Why can't we use SQLite or D1 directly?**
A: You *can*, but it adds complexity:
- Need schema + migrations
- Need sync job (cron/webhook)
- Data can get stale
- Better for Phase 4+, not Phase 1

**Q: Why not Durable Objects?**
A: Durable Objects are overkill for simple datasource fetching. Use them when:
- You need stateful agents (Prime pattern)
- You need persistent decision-making
- Not needed for "fetch data and display it"

**Q: Are we talking about widgets?**
A: No. Widgets are UI (cards). Datasources are the adapters that feed data to widgets.
- Datasource: Fetches issue data from GitHub
- Widget: Renders issue data as an issue card

**Q: What about the Prime/Brain deal pattern already in your work?**
A: Prime is a separate architectural pattern for **autonomous agents**. It's orthogonal to datasources:
- Datasources = fetch external data
- Prime = make intelligent decisions + take action
- Can combine: Prime agent that uses datasources as inputs

---

## Conclusion: The Layered Model

```
┌─────────────────────────────────────────────┐
│ UI Layer: Cards, Dashboard, Views           │  ← Widgets
├─────────────────────────────────────────────┤
│ Orchestration: fetchBrandDashboard,         │  ← Current implementation
│ Route loaders, parallel execution            │
├─────────────────────────────────────────────┤
│ Datasources: GitHub, Stripe, CF, etc.       │  ← Adapters (stateless)
├─────────────────────────────────────────────┤
│ Caching Layer (D1): Optional, Phase 4+      │  ← Database (for performance)
├─────────────────────────────────────────────┤
│ Agent Layer (Prime): Optional, Phase 5+     │  ← Stateful reasoning (for intelligence)
├─────────────────────────────────────────────┤
│ External APIs: GitHub, Stripe, Cloudflare   │  ← Source of truth
└─────────────────────────────────────────────┘
```

**Start at the bottom, build up as needed.** Don't add D1 or Prime until they solve real problems.

---

**Type**: Architecture clarification
**Status**: Decision framework ready
**Audience**: Architects planning OpenDash phases 2-5

