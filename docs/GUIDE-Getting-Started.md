# Getting Started with OpenDash

Quick path to understanding and deploying OpenDash.

---

## 1. Understand the Product (30 minutes)

**What is OpenDash?**
A B2B intelligence platform for marketing teams. Combines morning briefing, competitive intelligence, and campaign performance in one dashboard.

**Read these in order:**
1. [PRODUCT.md](strategy/PRODUCT.md) — Product definition
2. [EXECUTIVE-SUMMARY.md](archive/EXECUTIVE-SUMMARY.md) — One-page overview
3. [B2B-STRATEGIC-BUNDLE.md](strategy/B2B-STRATEGIC-BUNDLE.md) — Market position and strategy

**Key facts:**
- Target: Marketing teams (agency ops, in-house marketing)
- TAM: $5B
- Launch: 12 weeks
- Pricing: Freemium + Pro ($299/mo) + Enterprise

---

## 2. Understand the Architecture (1 hour)

**How is it built?**
- Frontend: TanStack Start (React, full-stack)
- Backend: Cloudflare Workers (serverless)
- Database: D1 (SQLite)
- Datasources: Pluggable components (Stripe, GA4, Google Ads, etc.)

**Read these:**
1. [TECHNICAL-ARCHITECTURE-REVIEW.md](architecture/TECHNICAL-ARCHITECTURE-REVIEW.md) — Production-ready assessment (176 tests passing)
2. [DATASOURCES-VS-PRIME-ARCHITECTURE.md](architecture/DATASOURCES-VS-PRIME-ARCHITECTURE.md) — Datasource plugin system

**Key insights:**
- Three-panel HUD (context, briefing, chat)
- Datasource registry (extensible)
- Real-time analytics + competitive intelligence
- Multi-tenant architecture

---

## 3. Understand the Plan (45 minutes)

**What's the roadmap?**

| Timeline | Focus | Status |
|----------|-------|--------|
| Weeks 1-2 | MVP Dashboard | COMPLETE |
| Weeks 3-4 | Team + Org Management | COMPLETE |
| Weeks 5-8 | Analytics + Alerts | COMPLETE |
| Weeks 9-12 | Billing + Growth Engine | IN PROGRESS |

**Read these:**
1. [90-DAY-ROADMAP.md](roadmaps/90-DAY-ROADMAP.md) — Full 3-month roadmap
2. [EXECUTION-CHECKLIST.md](execution/EXECUTION-CHECKLIST.md) — Tactical checklist
3. [NEXT-CYCLE-PRIORITIES.md](roadmaps/NEXT-CYCLE-PRIORITIES.md) — What's next

---

## 4. Set Up Locally (1 hour)

**Prerequisites:**
- Node.js 18+
- Wrangler CLI
- Cloudflare account (for D1, Workers)

**Steps:**
1. Clone repo: `git clone https://github.com/OpenDashAI/open-dash`
2. Install: `pnpm install`
3. Set up D1: Follow [D1_SETUP.md](setup/D1_SETUP.md)
4. Create `.dev.vars`:
   ```
   API_MOM_URL=https://apimom.dev
   API_MOM_KEY=your-key
   STRIPE_SECRET_KEY=sk_test_...
   GITHUB_TOKEN=ghp_...
   ```
5. Run dev server: `pnpm dev`
6. Open http://localhost:3000

---

## 5. Understand Competitive Intelligence (30 minutes)

**What can it monitor?**
- SERP rankings (keyword tracking)
- Competitor domain metrics (traffic, backlinks)
- Competitor content (blog posts, pricing changes)
- Social mentions
- Market insights

**Read these:**
1. [COMPETITIVE-INTELLIGENCE-QUICKSTART.md](competitive-intel/COMPETITIVE-INTELLIGENCE-QUICKSTART.md) — 15-minute setup
2. [COMPETITOR-INTELLIGENCE-SYSTEM.md](competitive-intel/COMPETITOR-INTELLIGENCE-SYSTEM.md) — How it works

---

## 6. Deploy to Production (2 hours)

**Deployment checklist:**

1. Set environment variables: [SECURITY-SECRETS-AUDIT.md](audits/SECURITY-SECRETS-AUDIT.md)
2. Set up D1: [D1_SETUP.md](setup/D1_SETUP.md)
3. Deploy: `wrangler deploy`
4. Set up email: [EMAIL_PROVIDER_SETUP.md](setup/EMAIL_PROVIDER_SETUP.md)
5. Configure monitoring: [SENTRY_SETUP.md](setup/SENTRY_SETUP.md)
6. Set up CI/CD: [CI_CD_SETUP.md](setup/CI_CD_SETUP.md)

**Read:**
- [DEPLOYMENT-GUIDE.md](guides/DEPLOYMENT-GUIDE.md) — Step-by-step

---

## 7. Understand Growth Strategy (45 minutes)

**How do we grow to 20 teams?**
- Month 1-3: Founder sales + content
- Month 3-6: Lifetime deals (LTD) campaign
- Month 6-9: Referral system (friend codes)
- Month 9-12: PLG + SMB sales

**Read these:**
1. [BATCH-6-GROWTH-ENGINE.md](strategy/BATCH-6-GROWTH-ENGINE.md) — Referral system (implemented)
2. [LIFETIME-DEALS-STRATEGY.md](strategy/LIFETIME-DEALS-STRATEGY.md) — LTD campaign
3. [B2B-STRATEGIC-BUNDLE.md](strategy/B2B-STRATEGIC-BUNDLE.md) — Go-to-market

**Revenue target:**
- Month 1-3: $0 (foundation)
- Month 4-6: $5-10k MRR (LTD + founding customers)
- Month 7-12: $20-50k MRR (referrals + paid tiers)

---

## 8. Understand Components (30 minutes)

**What are components?**
Pluggable datasources that fetch data from external systems (Stripe, GA4, GitHub, etc.).

**Read:**
- [Standards/component-sdk-spec.md](../Standards/component-sdk-spec.md) — Formal spec
- [packages/sdk/README.md](../packages/sdk/README.md) — How to use SDK

**Current components** (15+):
- stripe-revenue
- ga4
- google-ads
- github-issues
- meta-ads
- email-metrics
- serp-tracker
- competitor-*
- and more...

---

## 9. Review Code Quality (1 hour)

**What standards do we follow?**
- TypeScript strict mode
- Zod validation
- Drizzle ORM
- Biome (linting)
- 176+ tests passing

**Read:**
- [TECHNICAL-ARCHITECTURE-REVIEW.md](architecture/TECHNICAL-ARCHITECTURE-REVIEW.md) — Code quality assessment
- [UNIFIED-REVIEW-FRAMEWORK.md](audits/review-system/UNIFIED-REVIEW-FRAMEWORK.md) — Review process

---

## 10. Track Progress (10 minutes)

**Current status:**
- Product: B2B intelligence platform ✅
- MVP: 3-panel HUD ✅
- Datasources: 15+ components ✅
- Analytics: Trending + anomalies ✅
- Billing: Stripe integration ✅
- Growth: Referral system Phase 1 ✅
- Tests: 184 passing ✅

**See:**
- [STATUS.md](status/STATUS.md) — Daily status
- [MVP-LAUNCH-STATUS.md](status/MVP-LAUNCH-STATUS.md) — Launch readiness
- [GITHUB-ISSUES-SUMMARY.md](status/GITHUB-ISSUES-SUMMARY.md) — All issues

---

## Common Paths

### I'm a...

**Developer**:
1. Understand architecture → [TECHNICAL-ARCHITECTURE-REVIEW.md](architecture/TECHNICAL-ARCHITECTURE-REVIEW.md)
2. Set up locally → Step 4 above
3. Start on issue → [GITHUB-ISSUES-SUMMARY.md](status/GITHUB-ISSUES-SUMMARY.md)

**Designer**:
1. Understand product → [PRODUCT.md](strategy/PRODUCT.md)
2. Review HUD → [USER_GUIDE.md](guides/USER_GUIDE.md)
3. Check accessibility → [ACCESSIBILITY-AUDIT.md](audits/ACCESSIBILITY-AUDIT.md)

**Product Manager**:
1. Understand strategy → [B2B-STRATEGIC-BUNDLE.md](strategy/B2B-STRATEGIC-BUNDLE.md)
2. Review roadmap → [90-DAY-ROADMAP.md](roadmaps/90-DAY-ROADMAP.md)
3. Track progress → [GITHUB-ISSUES-SUMMARY.md](status/GITHUB-ISSUES-SUMMARY.md)

**DevOps**:
1. Deployment → [DEPLOYMENT-GUIDE.md](guides/DEPLOYMENT-GUIDE.md)
2. CI/CD → [CI_CD_SETUP.md](setup/CI_CD_SETUP.md)
3. Monitoring → [SENTRY_SETUP.md](setup/SENTRY_SETUP.md)

---

## Next Steps

- **In 1 hour**: Have product understanding
- **In 1 day**: Have local environment running
- **In 1 week**: Know the full architecture
- **In 2 weeks**: Can contribute code

---

## Questions?

- **Architecture**: See [docs/README.md](./README.md)
- **Deployment**: See [DEPLOYMENT-GUIDE.md](guides/DEPLOYMENT-GUIDE.md)
- **Code**: Read [TECHNICAL-ARCHITECTURE-REVIEW.md](architecture/TECHNICAL-ARCHITECTURE-REVIEW.md)
- **Growth**: Check [B2B-STRATEGIC-BUNDLE.md](strategy/B2B-STRATEGIC-BUNDLE.md)
