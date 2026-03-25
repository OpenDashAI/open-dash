# EPIC #27 — OpenDash B2B Intelligence Platform

**Date**: 2026-03-24
**Status**: ✅ APPROVED. Ready for development.
**Timeline**: 12 weeks (Jan 13 - Apr 7, 2026)
**Target**: B2B launch with 20 paying teams, $72k MRR

---

## Epic Overview

**Goal**: Transform OpenDash from founder morning briefing into B2B intelligence + operations platform for marketing teams and agencies.

**Why Now?**
- Phases 1-8 complete (production-ready code)
- Competitive intelligence system fully designed (4-week implementation)
- Founder MVP validates product/market fit; B2B MVP validates business model
- 5x larger TAM, 5x higher LTV than founder market
- 2 weeks faster to profitability than founder-first path

**Key Decisions**:
- ✅ Skip founder MVP (code exists, but 50 founder users won't generate revenue)
- ✅ Go direct to B2B (teams + agencies have budgets)
- ✅ Competitive intelligence as differentiator (not in Slack/Sunsama)
- ✅ Phase-based delivery (foundation → integrations → AI → launch)

---

## Issues & Subtasks

### Phase 1: Foundation (Weeks 1-2)

#### Issue #27.1: Team/Org Management Architecture
**Effort**: 8 hours
**Priority**: P0 (blocks everything)

**What**:
- [ ] Design org/team D1 schema (organizations, team_members, roles)
- [ ] Design RBAC permission model (owner, editor, viewer)
- [ ] Design brand/client hierarchy (for agencies)
- [ ] API contracts for org management
- [ ] Migration strategy (add org_id to existing tables)

**Acceptance Criteria**:
- D1 schema documented
- RBAC model clearly defined
- API design reviewed
- Backwards compatible with existing briefing data

**Files to Create**:
- `docs/org-rbac-model.md` (design document)
- `src/lib/db/migrations/002_teams.sql` (D1 schema)

---

#### Issue #27.2: RBAC Middleware & UI
**Effort**: 12 hours
**Priority**: P0 (blocks protected routes)
**Depends On**: #27.1

**What**:
- [ ] Create RBAC middleware (check permissions before route access)
- [ ] Add permission checking to server functions
- [ ] Build org management UI (create, invite, manage members)
- [ ] Build team member management (roles, permissions)
- [ ] Update Clerk integration to create org on signup

**Acceptance Criteria**:
- RBAC enforced on all protected routes
- Org creation on signup working
- Team invites sent via email
- Permission checks in all datasource operations
- 90%+ test coverage for RBAC middleware

**Files to Modify**:
- `src/worker.ts` (add org context)
- `src/server/auth.ts` (org creation on signup)
- Create `src/server/rbac.ts` (permission model)
- Create `src/server/organizations.ts` (org operations)
- Create `src/routes/settings/team.tsx` (UI)

---

#### Issue #27.3: Multi-Brand Morning Briefing (Team View)
**Effort**: 10 hours
**Priority**: P1 (core feature)
**Depends On**: #27.2

**What**:
- [ ] Refactor briefing to show all org brands
- [ ] Add brand selector in left panel
- [ ] Aggregate metrics across brands
- [ ] Update datasource fetching (all brands per org)
- [ ] Test with 10+ brands

**Acceptance Criteria**:
- Briefing shows all team brands
- Can switch between brands instantly
- Metrics aggregated across brands
- Performance <2s load time with 10+ brands
- All 184 tests still passing

**Files to Modify**:
- `src/routes/index.tsx` (briefing route)
- `src/server/briefing.ts` (fetch logic)
- Components using brands context

---

### Phase 2: Competitive Intelligence (Weeks 3-4)

#### Issue #27.4: SERP Tracker Datasource
**Effort**: 10 hours
**Priority**: P0 (differentiator)
**Depends On**: #27.2

**What**:
- [ ] Design D1 schema for competitor tracking
  - competitors table (domain, keywords)
  - serp_rankings table (keyword, rank, URL, timestamp)
- [ ] Create SerpTrackerDataSource (BraveSearch API)
- [ ] Implement daily scheduling (Durable Object)
- [ ] Create SERP dashboard component
- [ ] Test with 5 keywords per competitor

**Acceptance Criteria**:
- D1 tables created and indexed
- SerpTrackerDataSource fetches 20+ keywords in <30s
- Daily job runs without errors
- SERP rankings displayed correctly
- Historical trending visible

**Files to Create**:
- `src/datasources/serp-tracker.ts` (datasource)
- `src/components/competitive/SerpDashboard.tsx` (UI)
- Migration: `003_competitors.sql`

---

#### Issue #27.5: Competitor Monitoring Datasources
**Effort**: 12 hours
**Priority**: P1
**Depends On**: #27.4

**What**:
- [ ] CompetitorDomainDataSource (domain metrics, backlinks if possible)
- [ ] ContentMonitorDataSource (RSS feeds, article tracking)
- [ ] Social/Brand MonitorDataSource (Twitter/LinkedIn mentions)
- [ ] Competitor dashboard UI
- [ ] Scheduling (daily)

**Acceptance Criteria**:
- 3 new datasources implemented
- All register in DataSourceRegistry
- Daily scheduling working
- Competitor dashboard displays all metrics
- Alerts on competitor changes

**Files to Create**:
- `src/datasources/competitor-domains.ts`
- `src/datasources/content-monitor.ts`
- `src/datasources/social-listener.ts`
- `src/components/competitive/CompetitorDashboard.tsx`

---

### Phase 3: Campaign Integration (Weeks 5-6)

#### Issue #27.6: Campaign Metrics Datasources
**Effort**: 14 hours
**Priority**: P1 (value driver)
**Depends On**: #27.3

**What**:
- [ ] GoogleAdsDataSource (spend, conversions, ROAS)
- [ ] MetaAdsDataSource (campaign performance)
- [ ] EmailMetricsDataSource (opens, clicks, conversions)
- [ ] GA4/AnalyticsDataSource (traffic, conversions)
- [ ] Campaign dashboard UI (unified view)

**Acceptance Criteria**:
- 4 new datasources fetching data
- Campaign dashboard shows all metrics unified
- Attribution (first-touch, last-touch)
- Performance <5s load with multiple campaigns
- Team can drill into campaign details

**Files to Create**:
- `src/datasources/google-ads.ts`
- `src/datasources/meta-ads.ts`
- `src/datasources/email-metrics.ts`
- `src/datasources/analytics.ts`
- `src/components/campaigns/CampaignDashboard.tsx`

---

#### Issue #27.7: Alert System (Slack, Email, In-App)
**Effort**: 8 hours
**Priority**: P1 (B2B killer feature)
**Depends On**: #27.4

**What**:
- [ ] Design alert routing (Slack webhooks, email, in-app)
- [ ] Implement alert triggers (SERP change, anomaly, budget threshold)
- [ ] Deduplicate alerts (don't spam)
- [ ] Create alert management UI (acknowledge, snooze, dismiss)
- [ ] Test with real changes

**Acceptance Criteria**:
- Slack alerts configured and working
- Email digests sent (daily or real-time)
- In-app notifications appear and disappear correctly
- Can snooze/dismiss alerts
- No duplicate alerts in 5-minute window

**Files to Create/Modify**:
- `src/server/alerts.ts` (routing logic)
- Modify datasources to emit alerts
- `src/components/alerts/AlertManager.tsx` (UI)

---

### Phase 4: AI + Analysis (Weeks 7-8)

#### Issue #27.8: AI Competitive Analysis
**Effort**: 8 hours
**Priority**: P2
**Depends On**: #27.5

**What**:
- [ ] Create LLM prompts for competitive analysis
  - "Why is competitor X winning?"
  - "What should we do about Y?"
  - "Market forecast based on trends"
- [ ] Implement analysis endpoint
- [ ] Add analysis tab to competitor dashboard
- [ ] Cache analysis (expensive, run once per day)

**Acceptance Criteria**:
- Analysis prompt generating insights
- Insights shown in UI
- Cached for performance
- Uses OpenRouter (cost tracking)

**Files to Create/Modify**:
- `src/server/ai-analysis.ts` (prompts, calling)
- `src/components/competitive/CompetitorAnalysis.tsx` (UI)

---

#### Issue #27.9: Billing System & Pricing Tiers
**Effort**: 10 hours
**Priority**: P1 (monetization)
**Depends On**: #27.2

**What**:
- [ ] Design pricing tiers (Starter $299, Pro $799, Enterprise custom)
- [ ] Implement Stripe integration
- [ ] Create billing UI (upgrade/downgrade, payment history)
- [ ] Enforce tier limits (brands, users, features)
- [ ] Test tier enforcement

**Acceptance Criteria**:
- Pricing tiers defined in D1
- Stripe integration working (test mode)
- Users can upgrade/downgrade
- Tier limits enforced on API
- Usage tracking accurate

**Files to Create/Modify**:
- `src/lib/db/migrations/004_billing.sql` (subscriptions table)
- `src/server/billing.ts` (Stripe integration)
- `src/routes/settings/billing.tsx` (UI)

---

### Phase 5: Testing & Launch (Weeks 9-12)

#### Issue #27.10: Security Audit & Performance Testing
**Effort**: 12 hours
**Priority**: P0

**What**:
- [ ] Security audit (OWASP, auth, data access)
- [ ] Load testing (100 concurrent, 1000 events/hour)
- [ ] Performance profiling (target <2s briefing, <5s campaigns)
- [ ] Database optimization (indices, query review)
- [ ] Error handling review (Sentry integration)

**Acceptance Criteria**:
- 0 critical security issues
- Handles 100 concurrent users
- <2s load time briefing
- <5s load time campaigns
- <1% error rate

**Files to Review**:
- All `src/` files for security
- D1 queries for performance

---

#### Issue #27.11: Marketing Website & Sales Materials
**Effort**: 10 hours
**Priority**: P1

**What**:
- [ ] Create B2B landing page (target marketing teams + agencies)
- [ ] Write sales copy (pain points, features, pricing)
- [ ] Create case study template
- [ ] Prepare ProductHunt launch assets
- [ ] Write sales email template

**Acceptance Criteria**:
- Landing page live and converting
- Sales copy resonates with ICP
- Case study template ready
- ProductHunt listing prepared
- Sales outreach ready

**Files to Create**:
- `landing/b2b-landing.tsx` (React component)
- `docs/sales-copy.md` (copy library)
- `docs/case-study-template.md`

---

#### Issue #27.12: Go-to-Market Execution
**Effort**: 16 hours (spread over weeks)
**Priority**: P1

**What**:
- [ ] ProductHunt launch (week 9)
- [ ] Direct outreach to 20 warm leads (week 9-10)
- [ ] Email campaign (week 10-11)
- [ ] LinkedIn content (week 11-12)
- [ ] First customer onboarding (week 12)

**Acceptance Criteria**:
- 50+ free trial signups
- 3-5 paying customers
- 80%+ trial-to-paid for marketing teams
- NPS >40 from early customers

**Files to Track**:
- `docs/gtm-playbook.md` (process)
- `docs/early-customers.md` (case studies)

---

## Dependencies & Sequencing

```
Phase 1: Foundation (Weeks 1-2)
├─ #27.1 (Team/Org schema)
├─ #27.2 (RBAC + UI) [depends on #27.1]
└─ #27.3 (Multi-brand briefing) [depends on #27.2]

Phase 2: Competitive Intelligence (Weeks 3-4)
├─ #27.4 (SERP tracker) [depends on #27.2]
└─ #27.5 (Competitor monitoring) [depends on #27.4]

Phase 3: Campaigns (Weeks 5-6)
├─ #27.6 (Campaign metrics) [depends on #27.3]
└─ #27.7 (Alerts) [depends on #27.4]

Phase 4: AI + Monetization (Weeks 7-8)
├─ #27.8 (AI analysis) [depends on #27.5]
└─ #27.9 (Billing) [depends on #27.2]

Phase 5: Launch (Weeks 9-12)
├─ #27.10 (Security + performance)
├─ #27.11 (Marketing materials)
└─ #27.12 (GTM execution)
```

---

## Success Metrics

### Development Metrics
- [ ] All 12 issues complete
- [ ] 200+ tests passing (maintain Phase 8 baseline + new tests)
- [ ] 0 critical bugs in staging
- [ ] <2s load time briefing with 10 brands
- [ ] <5s load time campaigns
- [ ] Staging deployment stable for 1 week

### Business Metrics (Month 1-3)
- [ ] 50+ free trial signups
- [ ] 3-5 paying customers
- [ ] 80%+ trial-to-paid conversion
- [ ] NPS >40 from early customers
- [ ] $2-3k MRR

---

## Resources

**Strategic Documents**:
- `B2B-STRATEGIC-BUNDLE.md` — Full product spec
- `STRATEGIC-REVIEW-SUMMARY.md` — Path analysis
- `COMPETITIVE-INTEL-CLOUDFLARE-EDITION.md` — Implementation guide

**Code References**:
- Phases 1-8 complete, 184 tests passing
- D1 schema pattern (datasource_metrics)
- DataSourceRegistry (pluggable architecture)
- Durable Objects (HudSocket for real-time)

---

## Timeline

| Week | Phase | Focus |
|------|-------|-------|
| 1-2 | 1 | Team foundation + RBAC + multi-brand briefing |
| 3-4 | 2 | SERP tracking + competitor monitoring |
| 5-6 | 3 | Campaign integrations + alerts |
| 7-8 | 4 | AI analysis + billing system |
| 9-10 | 5 | Security audit, testing, ProductHunt |
| 11-12 | 5 | GTM execution, first customers |

---

## Go/No-Go Decision Points

**Week 2**: Multi-brand briefing working, RBAC enforced → proceed to Phase 2
**Week 4**: Competitive intelligence fetching data → proceed to Phase 3
**Week 6**: Campaign data visible in UI → proceed to Phase 4
**Week 8**: Billing enforced, AI analysis working → proceed to Phase 5
**Week 10**: Security audit clear, performance OK → launch ProductHunt
**Week 12**: 3+ paying customers, NPS >40 → continue scaling

---

**Status**: ✅ APPROVED
**Owner**: You (solo founder)
**Next Step**: Begin Issue #27.1 (team/org schema design)

