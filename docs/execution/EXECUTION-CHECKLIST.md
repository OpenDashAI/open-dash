# OpenDash Execution Checklist: What to Do First

**Last Updated**: March 24, 2026
**Current Phase**: Week 1-2 (MVP Launch)
**Status**: Ready to execute starting TODAY

---

## IMMEDIATE (Today - This Week)

### ✅ Week 1-2 MVP Launch Checklist

**Day 1-2: Infrastructure (4-6 hours)**
- [ ] Point opendash.ai domain to Cloudflare
- [ ] Deploy Worker to production
- [ ] Set up D1 database
- [ ] Configure secrets (AUTH_SECRET, API keys)

**Day 2-3: Monitoring & Visibility (2-3 hours)**
- [ ] Set up Sentry error tracking
- [ ] Configure Cloudflare Analytics alerts
- [ ] Create monitoring dashboard

**Day 3-4: Landing Page & Docs (2-4 hours)**
- [ ] Create /landing route with marketing copy
- [ ] Write getting-started.md guide
- [ ] Record or find demo video
- [ ] Link all documentation

**Day 4-5: Testing & Launch (3-4 hours)**
- [ ] Run end-to-end smoke test
- [ ] Verify all routes load <2s
- [ ] Test chat integration
- [ ] Check no 500 errors in production

**Day 5: Announce & Collect Signups**
- [ ] Post to Twitter/HN
- [ ] Email 20 founder friends
- [ ] Create beta signup form
- [ ] Monitor feedback continuously

---

## REFERENCE: What Each Epic Does

### Epic 1: MVP Launch (Week 1-2) ✅ IN PROGRESS
**Issues #19-25**
- What: Auth, deploy, landing page, monitoring
- Who: You
- Success: 50 signups, 20 daily active
- Then: Move to Epic 2

### Epic 2: Founder Validation (Week 3-6) ⏭️ NEXT
**Issues #26-32**
- What: Onboarding, notifications, mobile, interviews
- Who: You + beta testers
- Success: 30+ weekly active, NPS >40
- Decision: Proceed to Phase 3 or pivot?

### Epic 3: AI Analytics (Week 7-12) 📊 IF PHASE 2 SUCCEEDS
**Issues #33-45**
- What: Charting, NLQ, anomaly detection, 6 new datasources, team plan
- Who: You (heavy coding sprint)
- Success: $2-5k MRR, 20+ paid users
- Then: Move to Epic 4

### Epic 4: Scale & Iterate (Week 13+) 🚀 LATER
**Issues #46-52**
- What: More chart types, templates, DaaS/embedded API exploration
- Who: You + hired contractor
- Success: $10-20k MRR, 50-100 users

---

## Critical Path (Dependencies)

```
Week 1-2: MVP Launch (#19)
    ↓ (Must hit 50 signups, 20 DAU)
Week 3-6: Founder Validation (#26)
    ↓ (Must hit 30 weekly active, NPS >40)
Week 7-12: AI Analytics (#33)
    ├─ Charting (#34) 4-6h
    ├─ NLQ (#35) 8-12h ← Critical path
    ├─ Anomaly (#36) 6-8h
    ├─ Datasources (#37-42) 24-36h (parallel)
    └─ Team Plan (#43-45) 16-20h (parallel)
    ↓ (Must hit $2-5k MRR, 20+ paid)
Week 13+: Scale & Iterate (#46)
    ├─ Chart types (#47)
    ├─ Templates (#48)
    ├─ DaaS exploration (#49)
    ├─ Embedded API (#50)
    ├─ Predictive alerts (#51)
    └─ Observability (#52)
```

---

## Success Metrics by Phase

### Phase 1 (Week 2)
| Metric | Target | Blocker? |
|--------|--------|----------|
| Signups | 50+ | Yes |
| Daily Active | 20+ | Yes |
| 500 Errors | 0 | Yes |
| Load Time | <2s | No |

### Phase 2 (Week 6)
| Metric | Target | Blocker? |
|--------|--------|----------|
| Weekly Active | 30+ | Yes |
| Churn | <10% | Yes |
| NPS | >40 | Yes |
| Paid Users | 5+ | No |

### Phase 3 (Week 12)
| Metric | Target | Blocker? |
|--------|--------|----------|
| Signups | 300+ | No |
| Weekly Active | 80+ | No |
| Paid Users | 20+ | Yes |
| MRR | $2-5k | Yes |
| Churn | <5% | No |

### Phase 4 (Week 26)
| Metric | Target |
|--------|--------|
| Signups | 800+ |
| Weekly Active | 200+ |
| Paid Users | 50-100 |
| MRR | $10-20k |

---

## Effort Estimate by Phase

| Phase | Duration | Hours/Week | Total Hours | Owner |
|-------|----------|-----------|------------|-------|
| 1 | 2 weeks | 20 | 40 | Solo |
| 2 | 4 weeks | 40 | 160 | Solo |
| 3 | 6 weeks | 50 | 300 | Solo |
| 4 | 13+ weeks | 30-40 | Ongoing | Solo + hire |

**Total to Phase 3 Success**: ~500 hours (12 weeks)

---

## Red Flags (When to Pause)

**After Week 2**:
- ❌ <25 signups → Positioning problem
- ❌ 0 daily actives → Product problem
- ❌ Multiple 500 errors → Critical bugs

**After Week 6**:
- ❌ <15 weekly actives → Wrong ICP or messaging
- ❌ NPS <30 → Product doesn't solve the problem
- ❌ >20% churn → Users don't see ongoing value

**After Week 12**:
- ❌ <50 weekly actives → Market interest plateau
- ❌ No paid conversions → Pricing/positioning wrong
- ❌ >10% churn on paid → Product not valuable enough

**If ANY red flag hits**:
1. Stop Phase 3 work
2. Investigate root cause (conduct interviews)
3. Pivot or double down based on learning
4. Don't waste 300 hours on wrong direction

---

## GitHub Issues Map

**Epic 1 (MVP)**: Issues #19-25
- #20: Auth implementation
- #21: Domain deployment
- #22: Sentry setup
- #23: Landing page
- #24: Onboarding emails
- #25: Getting started guide

**Epic 2 (Validation)**: Issues #26-32
- #27: Onboarding UX
- #28: Slack/Discord notifications
- #29: Mobile responsiveness
- #30: NPS survey
- #31: Blog content
- #32: Founder interviews

**Epic 3 (AI Analytics)**: Issues #33-45
- #34: Charting (Recharts) ← Start here after Phase 2
- #35: NLQ (Claude API)
- #36: Anomaly detection
- #37-42: 6 new datasources
- #43: Team plan
- #44: Pricing update
- #45: Zod validation

**Epic 4 (Scale)**: Issues #46-52
- #47: More chart types
- #48: Dashboard templates
- #49: DaaS exploration
- #50: Embedded API
- #51: Predictive alerts
- #52: Observability

---

## Key Documents

**Read in Order**:
1. **THIS FILE** (you're reading it)
2. **WEEK1-MVP-LAUNCH-PLAN.md** → Detailed Week 1-2 checklist
3. **STATUS.md** → Current project state
4. **90-DAY-ROADMAP.md** → Full timeline with effort estimates
5. **WEEK3-FOUNDER-VALIDATION-PLAN.md** → What comes after MVP
6. **ROADMAP-OVERVIEW.md** → Strategic overview of all 4 epics

**Architecture & Design**:
- **README.md** → Product overview, YAML config format
- **PHASE3-ROUTES-UI.md** → Route structure, UI components
- **PHASE4-HYBRID-CONFIG-LOADER.md** → Config loading strategy
- **DATASOURCES-VS-PRIME-ARCHITECTURE.md** → Architecture layers
- **DATASOURCES-SCRAMJET-INSIGHTS.md** → Future datasource evolution

---

## Quick Start (Next 30 Minutes)

1. **Read** WEEK1-MVP-LAUNCH-PLAN.md (30 min)
2. **Check** that you have:
   - [ ] GitHub repo access (OpenDashAI/open-dash)
   - [ ] Cloudflare account with opendash.ai domain
   - [ ] Wrangler CLI installed
   - [ ] API keys ready (GitHub, Stripe, Tailscale, API Mom, OpenRouter)
3. **Start** Day 1 tasks:
   - [ ] Add domain to Cloudflare
   - [ ] Run `pnpm wrangler deploy`
   - [ ] Set secrets with `pnpm wrangler secret put`

---

## Weekly Cadence

**Every Monday**:
- Review last week's metrics (Sentry, Cloudflare Analytics, user feedback)
- Prioritize top 3 issues for the week
- Update GitHub project board

**Every Friday**:
- Measure: active users, churn, engagement, feedback
- Write brief status update (1 paragraph)
- Plan next week based on what you learned

**Every 2 Weeks** (Sunday):
- Review phase goals vs actual progress
- Decide: continue on track, or adjust?
- Update roadmap if assumptions changed

---

## Decision Framework

### After MVP Ships (Week 2)
**Question**: Did we hit 50 signups, 20 daily active?
- **Yes** → Proceed to Phase 2 (founder validation)
- **No** → Investigate why, don't proceed to Phase 3 yet

### After Phase 2 (Week 6)
**Question**: Did we hit 30 weekly active, NPS >40, <10% churn?
- **Yes** → Proceed to Phase 3 (AI analytics)
- **No** → Pivot positioning or cut features, iterate Phase 2

### After Phase 3 (Week 12)
**Question**: Did we hit $2-5k MRR, 20+ paid users?
- **Yes** → Proceed to Phase 4 (scale & explore DaaS)
- **No** → Understand why, consider pivoting TAM

---

## One-Year Vision (If Everything Works)

```
Week 2:   MVP launch → 50 signups
Week 6:   Founder validated → 100 signups, 5 paid
Week 12:  AI analytics live → 300+ signups, $2-5k MRR
Week 26:  Scale → 800+ signups, $10-20k MRR

Year 2:   250k+ MRR, considering DaaS/embedded API
```

**Note**: This assumes:
- Phase 1 hits targets (50 signups)
- Phase 2 hits targets (30 weekly active, NPS >40)
- Phase 3 ships on time (charting, NLQ, anomaly)
- Market is interested (not a niche product)

If any phase fails, the timeline extends or pivots.

---

## Your Role Each Phase

| Phase | Dev | GTM | Ops |
|-------|-----|-----|-----|
| 1 | 80% | 15% | 5% |
| 2 | 40% | 50% | 10% |
| 3 | 80% | 15% | 5% |
| 4 | 60% | 25% | 15% |

**Phase 1**: Mostly building the MVP, some launch GTM
**Phase 2**: Heavy GTM (interviews, feedback, content), light coding (onboarding, notifications)
**Phase 3**: Heavy building (charting, NLQ, datasources), light GTM
**Phase 4**: Balanced between product and GTM (need contractor help)

---

## Hiring Checkpoint (Week 13)

If Phase 3 succeeds ($2-5k MRR):
- **Week 13-14**: Evaluate if you need help
- **Week 15-16**: Hire contractor or part-time dev
- **Week 17+**: Scale faster with 1.5 FTE

Cost: $5-10k for contractor to help with Phase 4
Benefit: Hit $10-20k MRR faster, maintain quality

---

## Questions to Ask Weekly

1. **Are we on track?**
   - Actual vs. planned signups/active users
   - Any blocker bugs?

2. **What are we learning?**
   - Which datasources do founders use most?
   - What features do they request?
   - Why do some churn?

3. **Should we adjust?**
   - Pivot messaging?
   - Cut features?
   - Add features?
   - Change target audience?

4. **What's next?**
   - Highest priority issue for next week?
   - Any dependencies to unblock?

---

## Final Checklist Before Launch

- [ ] Domain resolves to Worker
- [ ] All secrets configured in Cloudflare
- [ ] D1 database created and migrated
- [ ] Sentry account created and DSN set
- [ ] Landing page live at opendash.ai
- [ ] Getting started guide published
- [ ] Auth redirects to /login if no session
- [ ] Morning briefing loads in <2s
- [ ] Chat responds to messages
- [ ] Datasources return data for all 6 sources
- [ ] No 500 errors in production (Sentry clean)
- [ ] Beta signup form live
- [ ] Launch announcement drafted
- [ ] First 10 founders invited to beta

---

**Type**: Quick reference guide
**Status**: Ready to execute
**Audience**: You (solo founder)

Print this, check off items as you go.

