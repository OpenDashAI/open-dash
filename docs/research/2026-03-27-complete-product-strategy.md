# OpenDash: Complete Product Strategy

**Date:** 2026-03-27
**Status:** Research complete, pending decisions
**Sources:** 15 parallel research surveys across market, competitors, technology, and positioning

---

## One-Line Positioning

**OpenDash is the AI-powered operating dashboard for people who run things.**

Connect your tools, get a daily briefing, ask questions, take action — all in one place for $29/mo.

---

## The Gap Nobody Fills

```
                    SINGLE DOMAIN ←→ CROSS-DOMAIN
                         |                |
    PASSIVE           Baremetrics      ← OpenDash
    DASHBOARDS        UptimeRobot        (revenue + uptime + SEO +
                      AccuRanker          errors + social in one view)
                         |                |
    PROACTIVE         Narrative BI     ← OpenDash
    ALERTS            Outlier ($299)      (cross-domain anomaly detection
                                          at $29/mo, not $299/mo)
                         |                |
    AI SIDEKICK       PostHog AI       ← OpenDash
    (Q&A + ACTIONS)   Ambient ($100)     (asks + answers + acts across
                                          all your data, not just one silo)
```

**Every cell in the right column is empty today.** Nobody combines revenue + uptime + errors + SEO + social data and provides AI-driven cross-domain insights + actions for under $100/mo.

---

## Product Features (Ordered by Priority)

### Already Built
- Composable dashboard (HUD layout, composable hooks, AI-generated components)
- AI chat panel (Vercel AI SDK + assistant-ui + 20+ tools)
- Data ingestion (Scram Jet pipelines → D1 metrics table)
- Auth + RBAC (Clerk, multi-tenant)
- Real-time transport (HudSocket DO + WebSocket)

### Phase 1: MVP — "Morning Briefing" (Ship First)

| Feature | What It Is | Replaces |
|---------|-----------|----------|
| **Stripe revenue** | MRR, churn, LTV, failed payments | Baremetrics ($49/mo) |
| **Uptime monitoring** | Cron ping → alert if down | UptimeRobot ($7-29/mo) |
| **Status page** | Public service health page | StatusPage ($29-399/mo) |
| **GitHub CI status** | Build pass/fail, deploy status | Checking GitHub manually |
| **Google Analytics** | Visitors, top pages, traffic trends | Opening GA tab |
| **Daily email briefing** | "Here are the 3 things that matter today" | Opening 8 tabs |

### Phase 2: Differentiation

| Feature | What It Is | Replaces |
|---------|-----------|----------|
| **SEO rank tracking** | Daily keyword positions via DataForSEO ($0.0006/query) | AccuRanker ($129/mo) |
| **Observability (OTLP)** | Accept traces/logs, show errors + latency | Basic Sentry/Datadog |
| **AI/LLM cost tracking** | Token costs, model usage charts | Helicone ($39/mo) |
| **AI sidekick actions** | Draft social posts, create incidents, send alerts | Manual work |

### Phase 3: Expansion

| Feature | What It Is | Replaces |
|---------|-----------|----------|
| **Social metrics** | Follower counts, engagement trends | Buffer analytics |
| **Email metrics** | Subscriber counts, open rates | Checking ESP dashboard |
| **Competitive intelligence** | Competitor changes, pricing alerts | Crayon ($20K+/yr) |
| **Team features + RBAC** | Multi-user, permissions, team briefings | Geckoboard ($149/mo) |

---

## Marketing: PostHog Model (Feature Pages)

Each feature gets a separately marketed landing page for SEO:

| Page | SEO Target | Competitor Being Undercut |
|------|-----------|--------------------------|
| `opendash.ai/uptime` | "free uptime monitoring" | UptimeRobot |
| `opendash.ai/status-pages` | "free status page" | StatusPage ($29-399/mo) |
| `opendash.ai/revenue` | "SaaS metrics dashboard" | Baremetrics ($49/mo) |
| `opendash.ai/seo` | "keyword rank tracker" | AccuRanker ($129/mo) |
| `opendash.ai/observability` | "cloudflare workers observability" | Datadog ($500+/mo) |
| `opendash.ai/ai-costs` | "LLM cost tracking" | Helicone ($39/mo) |
| `opendash.ai/briefing` | "AI daily briefing for founders" | Ambient ($100/mo) |

All one product, one login, one billing. Each page captures a different search intent.

---

## AI Sidekick Architecture

### What OpenDash Already Has
- Vercel AI SDK v6 (streaming, tool calling, multi-step)
- assistant-ui (chat UI with human-in-the-loop approval)
- @tanstack/ai (CF Workers integration)
- Qwen 72B via OpenRouter (current model)
- 20+ orchestrator tools

### What to Add
- More data-querying tools (revenue time series, error trends, uptime history, SEO changes)
- Query classification → route simple queries to Workers AI (free), complex to Haiku/Sonnet
- Confirmation flows for write actions (draft posts, create incidents, set alerts)
- Audit logging for all AI actions
- Proactive daily briefing generation (scheduled, not just on-demand)

### What NOT to Add
- LangChain.js (incompatible with CF Workers, overkill)
- CopilotKit ($1,000/seat/mo, already have assistant-ui)
- OpenAI Assistants API (vendor lock-in)
- Vector RAG for structured metrics (context injection + tool calling is better)
- Credit-based pricing (creates anxiety)

### Model Routing (Cost Optimization)

| Tier | Model | Cost/Query | Use Case |
|------|-------|-----------|----------|
| Free | Workers AI (Llama/Qwen) | $0.00 | Status lookups, simple factual queries |
| Standard | Qwen 72B or Haiku 4.5 | $0.001-$0.006 | Dashboard chat, "why did revenue change?" |
| Premium | Sonnet 4.6 | $0.012-$0.017 | Complex cross-domain analysis, agentic workflows |

### Unit Economics

At $29/mo Pro with standard routing (20-30 queries/day average):
- AI cost per user: ~$2-5/mo
- AI cost as % of revenue: 7-17%
- Gross margin: **58-78%** (healthy for AI-enhanced SaaS)

---

## Pricing

| Tier | Price | What You Get |
|------|-------|-------------|
| **Free** | $0 | Uptime monitoring (50 checks) + status page + dashboard (3 data sources, no AI) |
| **Pro** | $29/mo | AI sidekick + daily briefing + unlimited data sources + alerting + observability |
| **Business** | $79/mo | Team features + RBAC + premium AI (Sonnet) + AI actions + API access |
| **Enterprise** | Custom | White-label + custom datasources + SLA + priority support |

AI is included in Pro, not charged separately. This is the Notion/Linear model — AI is the upgrade differentiator.

---

## Competitive Positioning

| Competitor | Price | What They Do | What OpenDash Does Better |
|-----------|-------|-------------|--------------------------|
| **UptimeRobot** | $7/mo | Uptime only | + revenue + SEO + errors + AI briefing |
| **Baremetrics** | $49/mo | Revenue only | + uptime + SEO + errors + AI briefing |
| **AccuRanker** | $129/mo | SEO only | + revenue + uptime + errors + AI briefing |
| **Geckoboard** | $149/mo | Custom dashboards (no AI) | AI-powered, 5x cheaper, built-in datasources |
| **Ambient** | $100/mo | AI briefing (email/calendar only) | + revenue + uptime + SEO + errors + actions |
| **Outlier AI** | $299/mo | Anomaly detection (single domain) | Cross-domain anomalies at $29/mo |
| **Datadog** | $500+/mo | Observability only | + business metrics at 1/17th the price |
| **PostHog** | $0-450/mo | Product analytics | OpenDash focuses on ops, not user behavior |

**Nobody bundles uptime + revenue + SEO + observability + AI briefing for $29/mo.**

---

## Market Size

- Solo SaaS founders: ~200K globally
- Indie hackers building: ~500K
- Freelance devs with projects: ~2M
- Small agency owners: ~1M
- At $29/mo, 1-3% capture in year 1: **$470K - $1.4M ARR**
- At maturity (5-10% capture): **$2.3M - $4.7M ARR**

Adjacent markets that strengthen the position:
- Uptime monitoring: $10.7B
- Status pages: $1.2B (14% CAGR)
- AI/LLM cost tracking: $510M → $8.1B by 2034 (32% CAGR)
- Observability: $3.4B (15.6% CAGR)

---

## Daily Standup / Briefing Angle

The daily briefing is the **habit loop** that drives retention:

| Existing Product | What It Does | Price | OpenDash Advantage |
|-----------------|-------------|-------|-------------------|
| Geekbot/DailyBot | Collects human-written updates | $2-5/user/mo | OpenDash pulls data automatically, no manual input |
| Morning Brew | Curated external news | Free | OpenDash shows YOUR data, not world news |
| Baremetrics email | Revenue digest | $49/mo | OpenDash adds uptime + errors + SEO + social |
| Ambient | AI Chief of Staff (email/calendar) | $100/mo | OpenDash adds Stripe + GitHub + analytics at 1/3 price |
| Outlier AI | Anomaly detection briefing | $299/mo | OpenDash does cross-domain at $29/mo |

**The proactive daily brief — "here are the 3 things that matter today" — is the killer feature.** It's the reason to open OpenDash every morning instead of 8 separate tabs.

---

## Architecture Decisions (Resolved)

| Decision | Resolution |
|----------|-----------|
| SaaS Printer engine | → Frontasy. OpenDash is a customer, not the engine. |
| B2B Marketing Intelligence | → Phase 3 (team features), not a separate product |
| Atlas Board integration | → Phase 3 (Board agents become datasources) |
| 5 competing narratives | → One story: "operating dashboard for people who run things" |
| Observability | → OTLP datasource (feature), not a platform (Baselime clone) |
| AI pricing | → Included in Pro tier, not separate add-on |
| RAG vs context injection | → Context injection + tool calling (no vector DB needed for structured metrics) |
| AI library stack | → Keep Vercel AI SDK + assistant-ui + @tanstack/ai. Don't add LangChain. |

---

## What This Session Produced

### Code Shipped (Atlas repo)
- CMO agent: unified brand schema, D1 data layer, daily content loop (12 commits, 22 tests)
- CTO agent: technical infrastructure intelligence (2 commits)

### Issues Filed (13 total)
- atlas #534, #535, #536, #542
- scram-jet #240, #241, #242, #243, #244
- open-dash #135, #136, #137

### Research Documents
- `atlas/docs/research/2026-03-27-otel-survey-report.md`
- `open-dash/docs/research/2026-03-27-observability-market-opportunity.md`
- `open-dash/docs/research/2026-03-27-strategic-coherence-review.md`
- `open-dash/docs/research/2026-03-27-complete-product-strategy.md` (this file)
