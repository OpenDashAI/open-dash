---
name: GTM Strategy — Dashboard Printer Model
description: Zero marginal cost dashboard generation. Every ICP gets a custom dashboard that serves as both product AND marketing material.
type: standard
---

# GTM Strategy: The Dashboard Printer

**Date**: 2026-03-25
**Status**: Definitive — derived from locked architecture

---

## The Insight

OpenDash is a **dashboard printer**.

Like a book printer that can print any book at near-zero marginal cost, OpenDash can generate a custom dashboard for any ICP at near-zero marginal cost.

The architecture makes this possible:
- **Scram Jet**: Adding a data source = writing a YAML file (minutes, not weeks)
- **Composable components**: Same components, different compositions
- **AI composition**: Describe the user → get a dashboard
- **Registry**: Finite components, typed contracts → every composition is valid

**Zero marginal cost per new ICP.**

---

## How It Works

### Step 1: Pick an ICP
"SaaS founders managing 3-5 products"

### Step 2: Identify their tools
Stripe, GA4, GitHub, Vercel, Resend

### Step 3: Write YAML pipelines (minutes)
```yaml
name: stripe-revenue
schedule: "0 1 * * *"
fetch:
  - type: api
    url: "https://api.stripe.com/v1/balance_transactions"
    auth: "Bearer {{ secrets.STRIPE_KEY }}"
output:
  - webhook:
      url: "{{ secrets.OPENDASH_API }}/metrics/stripe"
```

### Step 4: AI composes the dashboard
```
User: "I'm a SaaS founder. I use Stripe, GA4, and GitHub."
AI → MetricsSource(stripe) + MetricsSource(ga4) + MetricsSource(github)
   → AlertFilter → BriefingDisplay → Summary
```

### Step 5: The dashboard IS the marketing
- Screenshot it → landing page
- Record a walkthrough → YouTube
- Write the use case → blog post
- Share the composition → social proof

**Each dashboard is simultaneously: product, demo, and marketing material.**

---

## The 50 Dashboard Strategy

We don't pick ONE ICP. We pick 50.

| # | ICP | Their Tools | Dashboard |
|---|-----|-------------|-----------|
| 1 | SaaS Founder | Stripe, GA4, GitHub | Morning Briefing |
| 2 | E-commerce Operator | Shopify, Google Ads, Meta Ads | Revenue + Ad Spend |
| 3 | Content Creator | YouTube, Substack, Gumroad | Audience + Revenue |
| 4 | Agency Owner | Multiple client GA4s, Google Ads, Meta | Client Portfolio |
| 5 | DevOps Lead | Datadog, PagerDuty, GitHub Actions | Incident + Deploy |
| 6 | Marketing Manager | GA4, Google Ads, Meta, Email | Campaign Performance |
| 7 | Solo Consultant | Stripe, Calendly, LinkedIn | Pipeline + Revenue |
| 8 | Open Source Maintainer | GitHub, npm downloads, Sponsors | Health + Growth |
| 9 | Indie Hacker | Stripe, Plausible, ProductHunt | Launch + Revenue |
| 10 | Real Estate Agent | CRM, Zillow, Google Ads | Lead Pipeline |
| ... | ... | ... | ... |
| 50 | [Any professional with SaaS tools] | [Their tools] | [Custom briefing] |

**Each one costs us**: A few YAML pipelines + an AI composition. Hours, not months.

**Each one produces**: A landing page, a demo, a blog post, a YouTube video, SEO keywords.

---

## Why This Works

### 1. Zero Marginal Cost
Adding ICP #51 costs the same as ICP #1:
- Scram Jet pipeline: YAML (copy + modify existing)
- Components: Already exist (MetricsSource, Display, Filter, Summary, etc.)
- AI composition: Automatic from registry
- No new code required

### 2. SEO at Scale
50 ICPs × 5 pages each = 250 SEO landing pages
- "Best dashboard for SaaS founders"
- "Marketing analytics dashboard for agencies"
- "E-commerce metrics dashboard Shopify"
- Long-tail keywords for every niche

### 3. Content at Scale
Each dashboard = one YouTube video + one blog post + one Twitter thread
- "I built a morning briefing for indie hackers in 10 minutes"
- "Here's what a DevOps lead sees every morning"
- "Agency owner dashboard: all clients, one view"

### 4. Product-Led Growth
User finds their ICP's landing page → signs up → gets THAT dashboard instantly
- No configuration required (AI already knows what they need)
- No "connect 15 datasources" onboarding pain
- Instant value

### 5. Network Effects
Each ICP attracts users who request variations:
- "Like the SaaS founder dashboard but add Intercom"
- "Like the agency dashboard but for 20 clients"
- Each variation = new landing page = more SEO

---

## Revenue Model

**The product is the same for everyone. The packaging is different.**

| Tier | What | Price |
|------|------|-------|
| Free | 1 dashboard, 3 data sources, daily refresh | $0 |
| Pro | Unlimited dashboards, unlimited sources, real-time | $49/mo |
| Team | Pro + team sharing, role-based views, alerts | $199/mo |
| Business | Team + custom components, API access, SSO | $499/mo |

The price isn't about which ICP — it's about usage and features.

**Founder at $49/mo and agency owner at $499/mo use the same architecture.** The difference is number of dashboards, data sources, team members.

---

## Execution Order

### Phase 1: First Dashboard (Founder Briefing)
- Prove the full stack works: Scram Jet → D1 → Components → AI
- One ICP, one landing page, one demo video
- Validate: Do users sign up? Do they retain?

### Phase 2: Dashboard Printing (5-10 ICPs)
- Pick highest-value ICPs (SaaS, e-commerce, agency, content creator, DevOps)
- Generate dashboards, landing pages, videos
- Validate: Which ICPs convert best? Which retain?

### Phase 3: Scale (50 ICPs)
- AI generates dashboards for any ICP description
- Users can request custom ICPs
- Landing pages auto-generated
- SEO flywheel running

### Phase 4: User-Generated Dashboards
- Users compose their own dashboards via AI
- Share compositions publicly
- Community-driven ICP expansion
- Organic growth

---

## What This Means for Strategy Docs

All existing strategy docs (founder MVP, B2B pivot, platform play, DevOps communities) are **not wrong — they're all valid ICPs in the dashboard printer model**.

- Founder briefing = Dashboard #1
- B2B marketing teams = Dashboard #6
- DevOps communities = Dashboard #5
- Agency portfolio = Dashboard #4

They're not competing strategies. They're different prints from the same printer.

---

## Related

- `Standards/component-system-correct-architecture.md` — The architecture that enables this
- `Standards/component-registry-solves-ai-composition.md` — How AI composition works
- `public/r/index.json` — Component registry
- `CLAUDE.md` — Architecture overview

