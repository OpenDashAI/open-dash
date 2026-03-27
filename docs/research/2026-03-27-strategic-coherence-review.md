# OpenDash Strategic Coherence Review

**Date:** 2026-03-27
**Purpose:** Resolve positioning fragmentation, identify coherent story, map adjacent opportunities

## The Problem: 5 Competing Narratives

The internal review found 5 distinct visions living in the same repo:

| # | Narrative | ICP | Price | Status |
|---|-----------|-----|-------|--------|
| 1 | Dashboard Printer | Any professional | $49-499/mo | Conceptual |
| 2 | Founder Morning Briefing | Solo founders | $19-49/mo | 80% coded |
| 3 | B2B Marketing Intelligence | Marketing teams/agencies | $300-3K/mo | Designed, not built |
| 4 | SaaS Printer Engine | Developers | Licensing? | Partially built (moving to Frontasy) |
| 5 | Atlas Board Interface | Internal (garywu) | $0 | Dependent on #2 succeeding |

These contradict each other on ICP, pricing, GTM, and MVP definition. The code, docs, and README all tell different stories.

## The Resolution: One Story

### What the market actually needs

The market research reveals a clear, underserved position:

> **Solo founders and small operators (1-5 people) running SaaS/content businesses need a single dashboard that replaces 8-12 separate tabs they check every morning. Nobody serves this for under $60/month.**

- Geckoboard/Databox/Klipfolio: $60-150/mo, agency-oriented, complex
- PostHog: developer-focused, not business metrics
- AnyPanel/Solex: pre-launch or requires custom instrumentation
- Free tools (Stripe dashboard, GA4, UptimeRobot): work but require 8+ tabs

### The coherent story

**OpenDash is the operating dashboard for people who run things.**

Not a dashboard builder. Not a SaaS engine. Not a marketing intelligence platform. A single product that shows a founder/operator everything they need to know about their business in one view, with alerting when something needs attention.

The composable architecture is HOW it works, not WHAT it is. Customers don't buy "composable dashboards" — they buy "I can see my revenue, my uptime, my errors, and my SEO rankings in one place."

### What this means for the 5 narratives

| Narrative | Resolution |
|-----------|-----------|
| Dashboard Printer | Rename to "operating dashboard." Not infinite ICPs — focused on operators. |
| Founder Morning Briefing | **This is the MVP.** Ship it. |
| B2B Marketing Intelligence | Phase 2 upsell. Same product, team features + more datasources. |
| SaaS Printer Engine | Moves to Frontasy. OpenDash is a CUSTOMER of Frontasy, not the engine. |
| Atlas Board Interface | Phase 3. Board agents become datasources. Internal use validates the product. |

## Adjacent Features That Strengthen the Story

The adjacent opportunity research reveals features that map perfectly to the composable dashboard pattern and strengthen the "operating dashboard" positioning:

### Tier 1: Build These (trivial, high demand)

| Feature | What It Is | Why It Fits | Market Reference |
|---------|-----------|-------------|-----------------|
| **Uptime Monitoring** | Cron + fetch URL + alert if down | Literally a pipeline. Replaces UptimeRobot ($7-29/mo). Free tier bait. | $10.7B market |
| **Status Pages** | Public dashboard showing service health | Same data as uptime, different layout. Replaces StatusPage ($29-399/mo). | $1.2B market, 14% CAGR |
| **Observability** | Accept OTLP traces/logs, show errors + latency | Another datasource. Replaces basic Sentry/Datadog usage. | $3.4B market |

### Tier 2: Build Next (moderate effort, strong demand)

| Feature | What It Is | Why It Fits | Market Reference |
|---------|-----------|-------------|-----------------|
| **Revenue Metrics** | Stripe API → MRR/churn/LTV charts | Fetch + math + chart. Replaces Baremetrics ($49+/mo). | ChartMogul free <$120K ARR |
| **SEO Rank Tracking** | DataForSEO API → daily position charts | Cron + fetch + store + chart. $0.0006/query. Undercuts AccuRanker ($129/mo) by 10x. | $2-5B market |
| **AI/LLM Cost Tracking** | Log API calls, show cost charts | Structured logging + aggregation. 32-36% CAGR, fastest-growing adjacent category. | $510M → $8.1B by 2034 |

### Tier 3: Consider Later

| Feature | Score | Notes |
|---------|-------|-------|
| Social Media Analytics | 12/25 | API access is the hard part, not the dashboard |
| CI/CD Dashboards | 12/25 | Easy to build, small market |
| Content Performance | 9/25 | Competes with free GA4 |
| Email Analytics | 6/25 | Cross-provider normalization is hard |
| Competitive Intelligence | 4/25 | Fundamentally different product (scraping + NLP) |

## The Product Wedge

**Free uptime monitoring** gets users into the dashboard. Then:

```
Free: Uptime monitoring (50 checks) + status page
  ↓ user sees value of unified dashboard
$29/mo Pro: + Revenue metrics + SEO tracking + observability + alerting
  ↓ team grows
$79/mo Team: + Team features + RBAC + more datasources + LLM cost tracking
  ↓ agency/larger team
$199/mo Business: + White-label + API access + custom datasources
```

This is the PostHog playbook (free product analytics → paid session replay + feature flags) applied to the operator dashboard space.

## Feature Pages (PostHog Model)

Each major feature gets a separately marketed page for SEO:

- `opendash.ai/uptime` — "Free uptime monitoring for developers"
- `opendash.ai/status-pages` — "Beautiful status pages, free"
- `opendash.ai/observability` — "Traces and errors alongside your business metrics"
- `opendash.ai/revenue` — "SaaS metrics dashboard — MRR, churn, LTV"
- `opendash.ai/seo` — "SEO rank tracking at 1/10th the price"
- `opendash.ai/ai-costs` — "Track your AI/LLM spend"

All one product, one login, one billing. Each page captures a different search intent.

## Competitive Position

| Competitor | Price | Functions | OpenDash Advantage |
|-----------|-------|-----------|-------------------|
| UptimeRobot | $7/mo | Uptime only | OpenDash includes uptime + revenue + SEO + observability |
| Baremetrics | $49/mo | Revenue only | OpenDash includes revenue + uptime + SEO + observability |
| AccuRanker | $129/mo | SEO only | OpenDash includes SEO + revenue + uptime + observability |
| Geckoboard | $149/mo | Custom dashboards | OpenDash is $29/mo with built-in datasources |
| Datadog | $500+/mo | Observability only | OpenDash includes observability + business metrics |
| PostHog | $0-450/mo | Product analytics | OpenDash focuses on ops, not user behavior |

**Nobody bundles uptime + revenue + SEO + observability + status pages for $29/mo.**

## TAM

- Solo SaaS founders: ~200K globally
- Indie hackers: ~500K
- Freelance devs with projects: ~2M
- Small agency owners: ~1M
- Realistic capture (1-3% year 1): 1,350-4,050 customers
- At $29/mo: **$470K - $1.4M ARR**
- At maturity (5-10% capture): **$2.3M - $4.7M ARR**

## Decisions Made

1. **OpenDash = operating dashboard for people who run things.** Not a SaaS engine, not a marketing platform.
2. **SaaS Printer / composition engine → Frontasy.** OpenDash is a customer.
3. **MVP = Founder Morning Briefing** with uptime monitoring as the free hook.
4. **Adjacent features added as separately marketed pages** (PostHog model).
5. **B2B/team features are Phase 2**, not a separate product.
6. **Atlas Board integration is Phase 3**, validating the product internally.
