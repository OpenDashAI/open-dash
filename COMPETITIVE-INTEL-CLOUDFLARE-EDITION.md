# Competitive Intelligence System - Cloudflare Edition

**Adapted for OpenDash Stack with D1, Durable Objects, and Workers**
**Status**: Implementation guide for CF-native system
**Last Updated**: 2026-03-24

---

## Overview

Instead of building a separate competitive intelligence system, **integrate directly into OpenDash's existing architecture**. You already have:

✅ D1 database (SQLite)
✅ Durable Objects (for state management)
✅ Cloudflare Workers (serverless compute)
✅ TanStack Start (full-stack framework)
✅ Registry pattern (pluggable datasources)
✅ Real-time WebSocket (HudSocket)
✅ Metrics tracking infrastructure
✅ AI/LLM integration (OpenRouter)

---

## What You Have vs. What You Need

### Already Built ✅

```
✅ D1 Schema Pattern (time-series, metrics, health status)
✅ DataSourceRegistry (pluggable architecture)
✅ MetricsTracker (performance monitoring)
✅ API client patterns (GitHub, Stripe, Tailscale)
✅ Authentication & authorization (Clerk)
✅ Real-time broadcasting (HudSocket)
✅ AI integration (OpenRouter qwen-2.5-72b)
✅ Error handling patterns (Promise.allSettled)
✅ Type safety (Zod schemas)
✅ Server functions (TanStack Start)
```

### Need to Build (Reusing Patterns) ⚙️

```
⚙️ New D1 tables (competitor_keywords, competitor_domains, etc.)
⚙️ 6-8 new datasources (SERP, competitors, content, pricing)
⚙️ Analytics functions (SERP rank movement, content velocity)
⚙️ UI components (competitor cards, market overview)
⚙️ Scheduled jobs (Durable Object coordinator)
⚙️ Webhooks & alerting (real-time notifications)
```

---

## Architecture: Cloudflare-Native Design

```
COMPETITIVE INTELLIGENCE SYSTEM (Cloudflare-Native)

┌─────────────────────────────────────────────────────────┐
│ Scheduled Triggers (Cloudflare Queues + Durable Objects)│
├─────────────────────────────────────────────────────────┤
│ Daily (00:00 UTC)      │ Weekly (Sun 18:00 UTC)         │
│ ├─ SERP tracking       │ ├─ Backlink snapshot           │
│ ├─ Domain metrics      │ ├─ Content crawl                │
│ ├─ News monitoring     │ └─ Market analysis              │
│ └─ Social listening    │                                │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ Cloudflare Workers (Compute Layer)                      │
├─────────────────────────────────────────────────────────┤
│ src/datasources/                                        │
│  ├─ serp-tracker.ts (BraveSearch API)                  │
│  ├─ competitor-domains.ts (Ahrefs/SimilarWeb)          │
│  ├─ content-monitor.ts (RSS/article tracking)          │
│  ├─ social-listener.ts (Twitter/LinkedIn API)          │
│  ├─ pricing-tracker.ts (DOM extraction)                │
│  └─ market-insights.ts (Aggregation + AI)              │
│                                                         │
│ Each datasource:                                        │
│  - Extends DataSourceRegistry interface                │
│  - Records metrics to D1                               │
│  - Handles errors gracefully                           │
│  - Returns standardized BriefingItem[]                 │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ Durable Objects (State Management)                      │
├─────────────────────────────────────────────────────────┤
│ CompetitiveIntelligenceCoordinator                      │
│  ├─ Orchestrate daily/weekly jobs                      │
│  ├─ Manage rate limits (API quotas)                    │
│  ├─ Buffer alerts (deduplicate)                        │
│  └─ Broadcast to HudSocket when changes detected       │
│                                                         │
│ (Plus existing HudSocket for real-time)                │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ Cloudflare KV (Cache Layer)                             │
├─────────────────────────────────────────────────────────┤
│ ├─ SERP snapshots (24h TTL)                            │
│ ├─ Domain metadata (24h TTL)                           │
│ ├─ Competitor configs (7d TTL)                         │
│ └─ API rate limit counters (per minute)                │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ D1 Database (Persistent Storage)                        │
├─────────────────────────────────────────────────────────┤
│ New Tables:                                             │
│  ├─ competitor_keywords (keyword, domain, rank, vol)   │
│  ├─ competitor_serp_snapshots (daily rank tracking)    │
│  ├─ competitor_domains (domain, DA, traffic estimate)  │
│  ├─ competitor_content (URL, title, publish date)      │
│  ├─ market_insights (theme, importance, date)          │
│  └─ competitive_alerts (rule, competitor, status)      │
│                                                         │
│ Existing tables (extended):                            │
│  ├─ datasource_metrics (new CI datasources)            │
│  ├─ alert_rules (competitive_threshold rules)          │
│  └─ alert_history (CI-specific alerts)                 │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ AI Analysis Layer (OpenRouter via Claude SDK)           │
├─────────────────────────────────────────────────────────┤
│ ├─ Significance scoring (is this change important?)    │
│ ├─ Market opportunity identification                   │
│ ├─ Content gap analysis                                │
│ ├─ Positioning recommendations                         │
│ └─ Threat assessment                                   │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ UI Layer (TanStack Start React)                         │
├─────────────────────────────────────────────────────────┤
│ New Routes:                                             │
│  ├─ /competitive-intelligence (dashboard)              │
│  ├─ /api/competitive-intel (data endpoints)            │
│  └─ /api/competitive-analysis (AI endpoint)            │
│                                                         │
│ New Components:                                         │
│  ├─ CompetitorCard                                     │
│  ├─ RankMovementChart                                  │
│  ├─ MarketOverview                                     │
│  └─ OpportunityList                                    │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ Real-Time Alerts (HudSocket WebSocket)                  │
├─────────────────────────────────────────────────────────┤
│ Broadcast to all connected clients:                     │
│  ├─ Significant rank movements                         │
│  ├─ New competitor content published                   │
│  ├─ Pricing changes detected                           │
│  ├─ Market opportunity alerts                          │
│  └─ Threat assessments                                 │
└─────────────────────────────────────────────────────────┘
```

---

## Database Schema (Extend D1)

### New Tables for Competitive Intelligence

```sql
-- Competitor domain tracking
CREATE TABLE competitor_domains (
  id TEXT PRIMARY KEY,  -- competitor-slug
  name TEXT NOT NULL,
  website_url TEXT,

  -- Metrics (refreshed weekly)
  domain_authority INT,  -- 0-100
  traffic_estimate INT,  -- monthly visitors
  organic_keywords INT,
  backlinks_count INT,
  referring_domains INT,

  -- Status
  last_checked TIMESTAMP,
  data_source TEXT,  -- 'ahrefs', 'similarweb', 'semrush'
  confidence_score REAL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Keyword ranking tracking (daily SERP snapshots)
CREATE TABLE competitor_serp (
  id TEXT PRIMARY KEY,  -- uuid
  competitor_id TEXT REFERENCES competitor_domains(id),

  keyword TEXT NOT NULL,
  rank_position INT,  -- 1-100+
  search_volume INT,
  keyword_difficulty INT,  -- 0-100 (KD)

  rank_date DATE NOT NULL,

  -- Trend detection
  rank_change INT,  -- position change from prev day
  trend CHAR(1),  -- U (up), D (down), S (same)

  indexed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_competitor_serp_date ON competitor_serp(rank_date);
CREATE INDEX idx_competitor_serp_competitor ON competitor_serp(competitor_id);

-- Content tracking (articles, blog posts, case studies)
CREATE TABLE competitor_content (
  id TEXT PRIMARY KEY,  -- uuid
  competitor_id TEXT REFERENCES competitor_domains(id),

  url TEXT NOT NULL UNIQUE,
  title TEXT,
  content_type TEXT,  -- 'blog', 'case_study', 'tutorial', 'announcement'

  publish_date TIMESTAMP,
  crawl_date TIMESTAMP,

  -- Content metrics
  word_count INT,
  estimated_reach INT,  -- based on shares, views
  sentiment TEXT,  -- 'positive', 'neutral', 'promotional'

  -- Topics covered (JSON array)
  topics TEXT,  -- e.g. ["AI", "Analytics", "Pricing"]
  keywords TEXT,  -- e.g. ["free BI tool", "no-code analytics"]

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
Create INDEX idx_competitor_content_date ON competitor_content(publish_date);
CREATE INDEX idx_competitor_content_type ON competitor_content(content_type);

-- Pricing tracking
CREATE TABLE competitor_pricing (
  id TEXT PRIMARY KEY,
  competitor_id TEXT REFERENCES competitor_domains(id),

  tier_name TEXT,  -- "Free", "Pro", "Enterprise"
  price_usd REAL,  -- null for free
  billing_period TEXT,  -- 'month', 'year'

  features TEXT,  -- JSON array of included features

  snapshot_date DATE,
  extracted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  created_at TIMESTAMP
);
CREATE INDEX idx_competitor_pricing_date ON competitor_pricing(snapshot_date);

-- Market insights (aggregated findings)
CREATE TABLE market_insights (
  id TEXT PRIMARY KEY,

  insight_type TEXT,  -- 'gap', 'threat', 'opportunity', 'trend'
  title TEXT,
  description TEXT,

  related_competitors TEXT,  -- JSON array of competitor IDs
  confidence_score REAL,  -- 0-1

  generated_by TEXT,  -- 'claude', 'heuristic', 'manual'

  discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  addressed_at TIMESTAMP,  -- NULL until addressed

  created_at TIMESTAMP
);

-- Competitive alerts (like existing alert_rules but for CI)
CREATE TABLE competitive_alerts (
  id TEXT PRIMARY KEY,

  alert_type TEXT,  -- 'rank_movement', 'content_published', 'pricing_change', 'threat'
  competitor_id TEXT REFERENCES competitor_domains(id),

  condition TEXT,  -- e.g. "rank > 50", "traffic +30%"
  threshold REAL,

  enabled BOOLEAN DEFAULT TRUE,
  trigger_count INT DEFAULT 0,
  last_triggered TIMESTAMP,

  channels TEXT,  -- JSON array: ["slack", "email", "webhook"]

  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## Implementation: Datasources (Extend Registry)

Reuse the exact pattern from `src/datasources/` but for competitive intelligence.

### 1. SERP Tracker Datasource

```typescript
// src/datasources/serp-tracker.ts

import { BriefingItem, DataSource } from "../lib/datasource"
import { BraveSearchClient } from "../lib/clients/brave-search"

export class SerpTrackerDataSource implements DataSource {
  id = "serp-tracker"
  name = "SERP Rankings"
  icon = "📊"
  description = "Track keyword rankings for competitors"
  requiresConfig = true

  async fetch(context: {
    env: Env,
    lastVisited: Date,
    brandConfig?: Record<string, unknown>
  }): Promise<BriefingItem[]> {
    const competitors = brandConfig?.competitors as string[] || []
    const keywords = brandConfig?.keywords as string[] || []

    if (!competitors.length || !keywords.length) {
      return [{
        title: "SERP Tracker",
        description: "No competitors or keywords configured",
        priority: "low"
      }]
    }

    const client = new BraveSearchClient(context.env.BRAVE_API_KEY)
    const items: BriefingItem[] = []

    for (const competitor of competitors) {
      for (const keyword of keywords) {
        try {
          const result = await client.search(`${competitor} ${keyword}`)
          const rank = result.results.findIndex(r =>
            r.url.includes(competitor.toLowerCase())
          ) + 1

          items.push({
            title: `${competitor} ranks #${rank} for "${keyword}"`,
            description: `Search volume: ${result.query.search_parameters.count}`,
            priority: rank > 10 ? "high" : "medium",
            metadata: { competitor, keyword, rank }
          })
        } catch (error) {
          console.error(`SERP error: ${error}`)
          // Continue gracefully
        }
      }
    }

    return items
  }
}
```

### 2. Competitor Domains Datasource

```typescript
// src/datasources/competitor-domains.ts

import { BriefingItem, DataSource } from "../lib/datasource"
import { db } from "../lib/db"

export class CompetitorDomainsDataSource implements DataSource {
  id = "competitor-domains"
  name = "Competitor Domains"
  icon = "🌐"
  description = "Track competitor domain metrics (DA, traffic, keywords)"
  requiresConfig = false

  async fetch(context: {
    env: Env,
    lastVisited: Date,
    brandConfig?: Record<string, unknown>
  }): Promise<BriefingItem[]> {
    // Check which competitors changed this week
    const competitors = await db
      .selectFrom("competitor_domains")
      .selectAll()
      .where("updated_at", ">", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .execute()

    return competitors.map(c => ({
      title: `${c.name}: DA ${c.domain_authority}, ${c.traffic_estimate.toLocaleString()} mo visitors`,
      description: `${c.organic_keywords} keywords, ${c.backlinks_count} backlinks`,
      priority: "medium",
      metadata: { domain: c.website_url }
    }))
  }
}
```

### 3. Market Insights Datasource

```typescript
// src/datasources/market-insights.ts

import { BriefingItem, DataSource } from "../lib/datasource"
import { db } from "../lib/db"

export class MarketInsightsDataSource implements DataSource {
  id = "market-insights"
  name = "Market Opportunities"
  icon = "💡"
  description = "AI-detected market gaps and opportunities"
  requiresConfig = false

  async fetch(context: {
    env: Env,
    lastVisited: Date,
    brandConfig?: Record<string, unknown>
  }): Promise<BriefingItem[]> {
    // Get unaddressed opportunities from past week
    const insights = await db
      .selectFrom("market_insights")
      .selectAll()
      .where("insight_type", "=", "opportunity")
      .where("addressed_at", "is", null)
      .where("discovered_at", ">",
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .orderBy("confidence_score", "desc")
      .limit(5)
      .execute()

    return insights.map(i => ({
      title: i.title,
      description: i.description,
      priority: i.confidence_score > 0.8 ? "high" : "medium",
      metadata: { insightId: i.id }
    }))
  }
}
```

Register in `src/datasources/index.ts`:

```typescript
import { SerpTrackerDataSource } from "./serp-tracker"
import { CompetitorDomainsDataSource } from "./competitor-domains"
import { MarketInsightsDataSource } from "./market-insights"

export const DATASOURCES = [
  // ... existing datasources ...
  new SerpTrackerDataSource(),
  new CompetitorDomainsDataSource(),
  new MarketInsightsDataSource(),
]
```

---

## Scheduled Jobs: Durable Objects Coordinator

Create a new Durable Object to orchestrate competitive intelligence jobs:

```typescript
// src/lib/durable-objects/competitive-intel-coordinator.ts

import { DurableObject } from "cloudflare:workers"
import { db } from "../db"
import { DATASOURCES } from "../../datasources"

export class CompetitiveIntelCoordinator extends DurableObject {
  private lastRun: Map<string, Date> = new Map()

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === "/run-daily") {
      return this.runDaily()
    }
    if (url.pathname === "/run-weekly") {
      return this.runWeekly()
    }

    return new Response("OK")
  }

  private async runDaily(): Promise<Response> {
    const now = new Date()

    // SERP tracking
    const ciSources = DATASOURCES.filter(s =>
      ["serp-tracker", "competitor-domains"].includes(s.id)
    )

    for (const source of ciSources) {
      try {
        const items = await source.fetch({
          env: this.env,
          lastVisited: this.lastRun.get(source.id) || new Date(0),
          brandConfig: { competitors: ["Metabase", "Grafana"], keywords: [...] }
        })

        // Process items (insert to D1, detect changes)
        for (const item of items) {
          await this.processInsight(source.id, item)
        }

        this.lastRun.set(source.id, now)
      } catch (error) {
        console.error(`Error in ${source.id}:`, error)
      }
    }

    // Broadcast changes to HudSocket
    await this.broadcastChanges()

    return new Response("Daily CI run complete")
  }

  private async runWeekly(): Promise<Response> {
    // Run deeper analysis
    // - Backlink snapshots (Ahrefs)
    // - Content crawl (full competitor sites)
    // - Market analysis (aggregate insights)
    // - Generate AI recommendations (Claude)

    const insights = await this.generateMarketInsights()

    // Save to D1
    for (const insight of insights) {
      await db
        .insertInto("market_insights")
        .values({
          id: crypto.randomUUID(),
          insight_type: insight.type,
          title: insight.title,
          description: insight.description,
          confidence_score: insight.confidence,
          generated_by: "claude"
        })
        .execute()
    }

    return new Response("Weekly CI run complete")
  }

  private async generateMarketInsights(): Promise<Array<{
    type: string
    title: string
    description: string
    confidence: number
  }>> {
    // Use Claude to analyze this week's data
    const response = await fetch("https://api.openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.env.OPENROUTER_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "qwen/qwen-2.5-72b-instruct",
        messages: [{
          role: "user",
          content: `Analyze this week's competitive intelligence and identify market opportunities and threats.

          [Insert week's data: SERP changes, content published, pricing updates, etc.]

          Return JSON array of insights: [{type: 'opportunity'|'threat', title, description, confidence: 0-1}]`
        }]
      })
    })

    const result = await response.json()
    return JSON.parse(result.choices[0].message.content)
  }

  private async broadcastChanges(): Promise<void> {
    // Notify HudSocket of changes
    // This will trigger real-time updates to all connected clients
    const hudSocket = this.env.HUD_SOCKET.get("global")
    await hudSocket.fetch("https://hud", {
      method: "POST",
      body: JSON.stringify({
        type: "competitive-intel-update",
        timestamp: new Date()
      })
    })
  }
}
```

Bind in `wrangler.jsonc`:

```json
{
  "durable_objects": {
    "bindings": [
      {
        "name": "COMPETITIVE_INTEL",
        "class_name": "CompetitiveIntelCoordinator",
        "script_name": "open-dash"
      }
    ]
  }
}
```

---

## API Endpoints (Extend TanStack Start Routes)

```typescript
// src/routes/api/competitive-intel.tsx

import { createServerFn } from "@tanstack/start"
import { db } from "../../lib/db"

export const getCompetitiveInsights = createServerFn("GET /api/competitive-intel/insights")
  .handler(async () => {
    const insights = await db
      .selectFrom("market_insights")
      .selectAll()
      .where("addressed_at", "is", null)
      .orderBy("discovered_at", "desc")
      .limit(20)
      .execute()

    return insights
  })

export const getCompetitorRankings = createServerFn("GET /api/competitive-intel/rankings")
  .handler(async ({ competitorId, days = 30 }) => {
    const rankings = await db
      .selectFrom("competitor_serp")
      .selectAll()
      .where("competitor_id", "=", competitorId)
      .where("rank_date", ">", new Date(Date.now() - days * 24 * 60 * 60 * 1000))
      .orderBy("rank_date", "asc")
      .execute()

    return rankings
  })

export const analyzeCompetitor = createServerFn("POST /api/competitive-intel/analyze")
  .handler(async ({ competitorId }) => {
    // Use Claude to analyze competitor
    const response = await fetch("https://api.openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_KEY}`
      },
      body: JSON.stringify({
        model: "qwen/qwen-2.5-72b-instruct",
        messages: [{
          role: "user",
          content: `Analyze this competitor: [competitor data]`
        }]
      })
    })

    return response.json()
  })
```

---

## UI Components (React)

```typescript
// src/components/CompetitorIntelligenceDashboard.tsx

import { createServerFn } from "@tanstack/start"
import { useServer } from "@tanstack/start"
import { useSuspenseQuery } from "@tanstack/react-query"

export function CompetitorIntelligenceDashboard() {
  const insights = useSuspenseQuery({
    queryKey: ["competitive-insights"],
    queryFn: () => fetch("/api/competitive-intel/insights").then(r => r.json())
  })

  return (
    <div className="grid gap-6">
      <section>
        <h2 className="text-2xl font-bold mb-4">Market Opportunities</h2>
        <div className="grid gap-4">
          {insights.data
            .filter(i => i.insight_type === "opportunity")
            .map(insight => (
              <div key={insight.id} className="border rounded-lg p-4">
                <h3 className="font-semibold">{insight.title}</h3>
                <p className="text-sm text-gray-600">{insight.description}</p>
                <span className="text-xs bg-green-100 px-2 py-1 rounded">
                  {Math.round(insight.confidence_score * 100)}% confident
                </span>
              </div>
            ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Competitive Threats</h2>
        <div className="grid gap-4">
          {insights.data
            .filter(i => i.insight_type === "threat")
            .map(insight => (
              <div key={insight.id} className="border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-700">{insight.title}</h3>
                <p className="text-sm text-gray-600">{insight.description}</p>
              </div>
            ))}
        </div>
      </section>
    </div>
  )
}
```

---

## Configuration in Wrangler

Add to `wrangler.jsonc`:

```json
{
  "env": {
    "production": {
      "vars": {
        "COMPETITORS": "[\"metabase\", \"grafana\", \"cube-js\"]",
        "SERP_KEYWORDS": "[\"analytics dashboard\", \"bi tool\", \"open source\"]"
      },
      "secrets": [
        "BRAVE_SEARCH_KEY",
        "AHREFS_API_KEY",
        "SIMILARWEB_API_KEY"
      ]
    }
  }
}
```

---

## Deployment Timeline (Cloudflare-Native)

### Week 1: Database & Setup
- [ ] Create D1 tables (competitor_domains, competitor_serp, etc.)
- [ ] Create Durable Object class (CompetitiveIntelCoordinator)
- [ ] Add API secrets to wrangler.jsonc
- [ ] Deploy D1 migrations

### Week 2: Datasources
- [ ] Build SerpTrackerDataSource (SERP tracking)
- [ ] Build CompetitorDomainsDataSource (domain metrics)
- [ ] Test with manual runs
- [ ] Add to registry

### Week 3: Scheduling & Orchestration
- [ ] Implement CompetitiveIntelCoordinator
- [ ] Set up daily/weekly job triggers
- [ ] Connect to HudSocket for real-time updates
- [ ] Test job scheduling

### Week 4: UI & Integration
- [ ] Build CompetitorIntelligenceDashboard component
- [ ] Add API endpoints
- [ ] Create routes (/competitive-intelligence)
- [ ] Add WebSocket real-time updates
- [ ] Deploy to production

---

## What's Reusable

### 100% Reusable ✅
- DataSourceRegistry pattern
- MetricsTracker infrastructure
- D1 schema and query patterns
- Durable Objects pattern
- Error handling (Promise.allSettled)
- Type safety (Zod schemas)
- Server functions (TanStack Start)
- AI integration (OpenRouter)
- WebSocket broadcasting (HudSocket)

### Slightly Adapted ⚙️
- D1 tables (add competitive intel tables)
- Alert rules (add CI-specific rules)
- Datasources (add 3-6 new datasources)
- Analytics functions (add rank movement, content velocity)

### Completely New 🔨
- SERP tracking logic
- Competitor content crawler
- Market insights generation (Claude)
- Competitive alert rules
- UI components for CI dashboard

---

## Cost Estimate (Cloudflare-Native)

### Compute
- **Workers**: Free tier covers 100K requests/day, $0.15 per 10M requests after
- **Durable Objects**: $0.15 per 100k requests + $5/month per class
  - Our 1 coordinator: $5/month
  - Estimate: $0.50/month requests

### Storage
- **D1**: Free tier 3GB, pay-as-you-go after (~$0.75 per GB/month for storage, $0.20 per M writes)
  - Competitive intel tables: ~100MB = $0.08/month storage
  - Writes: ~5k daily = ~$0.03/month

### External APIs
- **BraveSearch**: ~$2-5/month (free tier covers 100 queries/day)
- **Ahrefs API**: $99-399/month if you want that level
- **Semrush API**: $120-450/month if you want that level
- **OpenRouter (Claude)**: ~$1-5/month for daily insights generation

### Total Monthly
- **Cloudflare**: ~$5.50/month
- **External APIs**: $2-5/month (just BraveSearch) or $300+/month (with Ahrefs/Semrush)

**Much cheaper** than separate infrastructure!

---

## Next Steps

1. **This week**:
   - [ ] Create D1 tables (copy schema above)
   - [ ] Deploy migrations
   - [ ] Test D1 queries

2. **Next week**:
   - [ ] Build SerpTrackerDataSource
   - [ ] Build CompetitorDomainsDataSource
   - [ ] Register in datasource index
   - [ ] Test manual runs

3. **Week 3**:
   - [ ] Create CompetitiveIntelCoordinator
   - [ ] Set up daily job scheduling
   - [ ] Connect to HudSocket

4. **Week 4**:
   - [ ] Build UI dashboard
   - [ ] Add API endpoints
   - [ ] Deploy to production
   - [ ] Set up recurring jobs

---

## Architecture Decisions Made

✅ **Use D1** (not separate database) - you already have it, fully integrated
✅ **Use Durable Objects** - orchestrate scheduled jobs, manage state
✅ **Use KV** (optional) - cache SERP/domain metrics for rate limiting
✅ **Use existing registry** - extend DataSource pattern
✅ **Use OpenRouter** - AI analysis via existing qwen-2.5-72b integration
✅ **Use HudSocket** - broadcast changes to all connected clients in real-time
✅ **Use TanStack Start** - API endpoints and UI components

This approach is **50-70% faster** to implement than the standalone system because you reuse all existing patterns, infrastructure, and tooling.

---

**Status**: Ready to implement using Cloudflare stack
**Estimated Timeline**: 4 weeks (compared to 8 weeks for standalone)
**Cost**: $500-1000/month vs. $50-150/month (if using only free APIs)
**Complexity**: Medium (reusing patterns, building new datasources)
