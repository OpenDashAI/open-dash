# OpenDash — Product Vision

## The Insight

Professionals across every vertical waste 30-60 minutes every morning figuring out where they stand. They open 15+ tabs across Stripe, analytics, GitHub, ad platforms, email — just to answer: "Is everything OK? What needs my attention?"

No tool solves this universally. Enterprise has AI control planes. Everyone else has nothing.

## The Product

**OpenDash is a dashboard printer.**

Tell it about your business, get a custom intelligence dashboard. Not templates. Not "pick from a list." AI builds it for you based on what you describe.

The architecture enables zero marginal cost per new dashboard:
- **Scram Jet** YAML pipelines connect to any API (minutes, not weeks)
- **D1** stores all metrics in a unified schema
- **Composable components** render any combination of data
- **AI composition** selects and wires components via constraint satisfaction

## ICP: Anyone Who Needs a Dashboard

The architecture is vertical-agnostic. The first dashboard is for solo founders. The 50th is for real estate agents. Same printer, different prints.

### Dashboard #1: The Multi-Project Operator (Launch ICP)
- Solo founder or 1-3 person team
- Runs 3-5 active projects/brands simultaneously
- Stack: Stripe, GA4, GitHub, Cloudflare
- Pain: context switching, morning startup time, no portfolio-wide view
- Price sensitivity: $19-49/mo

### Dashboard #2-10: High-Value ICPs
- Marketing managers (GA4, Google Ads, Meta, Email)
- E-commerce operators (Shopify, Google Ads, Meta)
- Agency owners (multi-client GA4, ad spend)
- Content creators (YouTube, Substack, Gumroad)
- DevOps leads (Datadog, PagerDuty, GitHub Actions)

### Dashboard #11-50: Long Tail
- Every professional with 3+ SaaS tools needs a unified view
- Each new ICP = YAML pipelines + AI composition (hours, not months)
- Each dashboard = landing page + demo + blog post + SEO keywords

## Core Loop: See → Decide → Act → See Result

Morning: Open briefing → see prioritized items across all tools
Decide: What needs attention? AI highlights anomalies + alerts
Act: Click through to resolve (or AI handles it)
Evening: Dashboard reflects what changed

## Architecture

See `CLAUDE.md` and `Standards/component-system-correct-architecture.md`:

```
Scram Jet (YAML pipelines) → D1 metrics → Composable Components → AI Composition
```

- Data collection: Scram Jet (zero-code YAML, 50+ sources)
- Storage: D1 unified metrics table
- UI: Local composable components (shadcn model, event-driven)
- Personalization: AI reads registry, composes per user
- Shared contract: `@opendash/composition` package

## Revenue Model

| Tier | What | Price |
|------|------|-------|
| Free | 1 dashboard, 3 data sources, daily refresh | $0 |
| Pro | Unlimited dashboards, unlimited sources, real-time | $49/mo |
| Team | Pro + team sharing, role-based views, alerts | $199/mo |
| Business | Team + custom components, API access, SSO | $499/mo |

Same architecture serves all tiers. Pricing is usage-based, not vertical-based.

## GTM: Dashboard Printing

Each new dashboard is simultaneously product, demo, and marketing material.

50 ICPs × 5 pages each = 250 SEO landing pages
50 ICPs × 1 video each = 50 YouTube demos
50 ICPs × 1 blog post = 50 content pieces

See `Standards/gtm-dashboard-printer-model.md` for full strategy.

## What This Is NOT

- ❌ A component marketplace (components are local, not distributed)
- ❌ A developer platform (no SDK, no npm packages for components)
- ❌ A single-vertical tool (architecture is vertical-agnostic)
- ❌ A template library (AI composes custom dashboards, not templates)
