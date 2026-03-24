# OpenDash Roadmap Overview: From MVP to $10-20k MRR

**Timeline**: 26 weeks (6 months)
**Total Issues**: 34 across 4 Epic phases
**Current Phase**: Week 1-2 (MVP Launch)

---

## Phase 1: MVP Launch (Week 1-2) — Epic #19

**Goal**: Get 50 beta users, prove founder morning briefing concept

**What Ships**:
- ✅ Auth (simple password-based session)
- ✅ Morning Briefing route (see all changes overnight)
- ✅ Portfolio Overview (health scores)
- ✅ Landing page + getting started guide
- ✅ Sentry monitoring

**Key Issues**:
| # | Task | Effort | Status |
|---|------|--------|--------|
| #20 | Implement auth (Clerk) | 2-4h | Pending |
| #21 | Deploy to opendash.ai | 1-2h | Pending |
| #22 | Set up Sentry monitoring | 1-2h | Pending |
| #23 | Create landing page | 2-4h | Pending |
| #24 | Onboarding email sequences | 2-3h | Pending |
| #25 | Getting started guide + video | 2-4h | Pending |

**Success Criteria**:
- 50+ beta signups
- 20+ daily active users
- 0 critical bugs
- <2s load time for Morning Briefing

**Owner**: You (solo founder)
**Timeline**: THIS WEEK

---

## Phase 2: Founder Validation (Weeks 3-6) — Epic #26

**Goal**: Get 30+ weekly actives, NPS >40, understand what matters

**What Ships**:
- Better onboarding UX (reduce setup time 15m → 5m)
- Slack/Discord daily briefing summaries
- Mobile-responsive layout
- In-app NPS survey
- Blog content on founder workflows
- 5-10 founder interviews for feedback

**Key Issues**:
| # | Task | Effort | Status |
|---|------|--------|--------|
| #27 | Improve onboarding UX | 4-6h | Backlog |
| #28 | Slack/Discord notifications | 4-6h | Backlog |
| #29 | Mobile UI responsiveness | 4-6h | Backlog |
| #30 | In-app NPS survey | 2-4h | Backlog |
| #31 | Blog: founder morning routines | 4-6h | Backlog |
| #32 | Conduct founder interviews | 6-8h | Backlog |

**Success Criteria**:
- 30+ weekly active users
- <10% weekly churn
- NPS >40
- 5+ paid subscriptions
- Clear pattern on what features matter

**Owner**: You + engaged founders
**Timeline**: Weeks 3-6 (4 weeks, ~40 hrs/week)
**Key Insight**: Founder interviews (not metrics) will guide Phase 3

---

## Phase 3: AI Analytics Foundation (Weeks 7-12) — Epic #33

**Goal**: Transform into AI analytics SaaS, hit $2-5k MRR, 100+ signups

### 3A: Charting Layer (Critical Path)
**What Ships**:
- Recharts integration with line, bar, pie, scatter charts
- Chart card types for BriefingItem display
- Dashboard builder: add charts, save configs, persist across sessions

**Key Issues**:
| # | Task | Effort |
|---|------|--------|
| #34 | Integrate Recharts + chart cards | 4-6h |

**Why Critical**: All other Phase 3 work depends on charting layer

---

### 3B: Natural Language Query (Critical Path)
**What Ships**:
- NLQ prompt builder (convert user intent → data operation)
- Query execution engine (group_by, aggregate, filter, sort)
- Chat UI for "Ask your data" interface
- Example: "Show me revenue by customer type" → auto-generates chart

**Key Issues**:
| # | Task | Effort |
|---|------|--------|
| #35 | Build NLQ foundation | 8-12h |

**Why Critical**: This is the AI differentiator vs. simple dashboards

---

### 3C: Anomaly Detection
**What Ships**:
- Time-series analysis (7-day moving average + std dev)
- AI-generated explanations for anomalies
- Anomaly cards in morning briefing

**Key Issues**:
| # | Task | Effort |
|---|------|--------|
| #36 | Implement anomaly detection | 6-8h |

**Why**: Creates "moments of insight" (e.g., "Revenue down 30% vs. avg")

---

### 3D: Datasource Expansion (6 New Sources)
**What Ships**:
- Plausible Analytics (page views, bounce rate)
- Uptime Kuma (monitor status, uptime %)
- SendGrid (email stats)
- YouTube Analytics (channel metrics)
- Substack Analytics (subscriber growth)
- Custom HTTP API (generic webhook receiver)

**Key Issues**:
| # | Task | Effort |
|---|------|--------|
| #37 | Add Plausible Analytics | 4-6h |
| #38 | Add Uptime Kuma | 4-6h |
| #39 | Add SendGrid | 4-6h |
| #40 | Add YouTube Analytics | 4-6h |
| #41 | Add Substack Analytics | 4-6h |
| #42 | Add custom HTTP API | 4-6h |

**Why**: Expands TAM from solo founders → content creators, SaaS GTM teams

---

### 3E: Product & Monetization
**What Ships**:
- Team plan with multi-user support + shared dashboards
- Updated pricing tiers (Free, Pro $49/mo, Team $199/mo, Business $499+/mo)
- Per-datasource Zod schema validation (Phase 1 → Phase 2 evolution)

**Key Issues**:
| # | Task | Effort |
|---|------|--------|
| #43 | Team plan + multi-user | 6-8h |
| #44 | Update pricing + billing | 6-8h |
| #45 | Zod schema validation | 4-6h |

**Why**: Removes per-user/team limits, enables revenue scaling

---

### Phase 3 Summary

**Total Effort**: ~300+ hours (6 weeks @ 50-60 hrs/week)

**Critical Path** (must do in order):
1. Charting (#34) — 4-6h
2. NLQ (#35) — 8-12h
3. Anomaly detection (#36) — 6-8h
4. Then: Datasources in parallel (#37-42)
5. Then: Team plan + pricing (#43-45)

**Go-to-Market Tactic**:
- Content: "5 ways to use NLQ with your data"
- Case studies: 3-5 early users + their use cases
- Webinar: Live demo of charting + NLQ
- Outreach: RevOps, product, growth leaders

**Success Criteria**:
- 100+ total signups
- 50+ weekly actives
- 20+ paid subscriptions
- $2-5k MRR
- <5% churn on paid users
- Positive feedback on charting + NLQ

---

## Phase 4: Scale & Iterate (Week 13+) — Epic #46

**Goal**: Hit $10-20k MRR, explore new revenue models, 50-100 paying users

**Continuous Work**:

### 4A: Feature Polish & Expansion
- More chart types (scatter, heatmap, funnel, cohort)
- Dashboard templates by vertical ("SaaS GTM", "Content Creator", "RevOps")
- 2-3 new datasources per month

**Key Issues**:
| # | Task |
|---|------|
| #47 | Add more chart types |
| #48 | Build dashboard templates |

---

### 4B: Strategic Explorations

**Explore White-Label / DaaS**:
- Agencies ask: "Can you build one for my clients?"
- MVP: Offer as productized service
- Later: Build white-label platform

**Issue**: #49 (low priority, exploratory)

**Explore Embeddable Analytics API**:
- SaaS platforms ask: "Can we embed this in our product?"
- MVP: Simple REST API + React SDK
- Later: Full embedded analytics platform

**Issue**: #50 (low priority, exploratory)

---

### 4C: Intelligence & Automation
- Predictive anomaly alerts (learn patterns over time)
- Custom health thresholds (alert when metrics deviate)
- Monitoring dashboard (Grafana integration)

**Key Issues**:
| # | Task |
|---|------|
| #51 | Predictive alerts |
| #52 | Observability + monitoring |

---

### 4D: Go-to-Market Expansion
- Product-led growth (free tier → Pro tier conversions)
- Founder → Team expansion (reach founders' colleagues)
- Sales motion for $500+/mo deals (enterprises)
- Partnerships (Zapier, Make, etc.)

---

## Revenue Projection

| Phase | Week | Users | Weekly Active | Paid | MRR | Churn |
|-------|------|-------|----------------|------|-----|-------|
| MVP Launch | 2 | 50 | 20 | 0 | $0 | N/A |
| Validation | 6 | 100 | 30 | 5+ | $200-500 | <10% |
| AI Analytics | 12 | 300 | 80 | 20+ | $2-5k | <5% |
| Scale | 26 | 800+ | 200+ | 50-100 | $10-20k | <5% |

---

## What's NOT in Week 1-2

- ❌ **Team plan**: Too early, focus on founder use case first
- ❌ **Charting**: Phase 3, not needed for MVP
- ❌ **NLQ**: Phase 3, nice-to-have but not required
- ❌ **Anomaly detection**: Phase 3, bonus feature
- ❌ **Mobile-first UI**: Phase 2, can wait 4 weeks
- ❌ **Billing/payments**: Phase 3, once you have traction
- ❌ **DaaS/white-label**: Phase 4, too early

**Reason**: Focus on one thing (founder briefing) and do it really well. Expand after validation.

---

## Critical Dependencies

```
MVP Launch (Weeks 1-2)
    ↓
Must reach 30+ weekly actives before Phase 3
    ↓
Founder Validation (Weeks 3-6)
    ↓
Phase 3 critical path:
    Charting (#34)
        ↓
    NLQ (#35)
        ↓
    Anomaly Detection (#36)
        ↓
    Parallel: Datasources (#37-42) + Team Plan (#43-44)
        ↓
Phase 4: Scale
    - If we hit $2-5k MRR by week 12, continue scaling
    - If we plateau, pivot to DaaS exploration (#49)
    - If we stall, reconsider positioning
```

---

## Next Epic (Immediately After MVP)

### Epic #26: Founder Validation (Weeks 3-6)

This is the most critical phase. You'll learn:
1. **What's working**: Which datasources do founders use most?
2. **What's missing**: What do they ask for?
3. **Who to target next**: Founders using X datasource → expand to Y audience
4. **Pricing signal**: Are founders willing to pay?

**Key Activities**:
- Daily iteration based on founder feedback
- Measure: <10% weekly churn, NPS >40, growth to 30+ weekly actives
- Conduct 5-10 founder interviews (this is the real learning)
- Write 1-2 blog posts to attract similar founders

**Why This Matters**:
- If Phase 2 succeeds → proceed to Phase 3 (AI analytics)
- If Phase 2 fails → pivot before investing 300+ hours in Phase 3

---

## Decision Framework for Post-MVP

After Week 2, assess:

1. **Traction**: Did you hit 50 signups, 20 daily actives?
   - Yes → Continue to Phase 2
   - No → Revisit positioning, marketing, UX

2. **Founder Interest**: Are founders using it?
   - Yes (>10 daily actives) → Move to Phase 2
   - No → Pause, understand why

3. **Data Availability**: Can founders easily configure their data?
   - Yes → Good UX, focus on retention
   - No → Fix onboarding before scaling

4. **Retention**: Are week 2 users still active in week 3?
   - Yes (>70%) → Strong product-market fit signal
   - No → Understand churn, iterate on UX

**Red Flags**:
- <25 signups by end of week 2 (positioning problem)
- <5 daily actives (product problem or narrow TAM)
- >30% weekly churn (retention problem)
- Any 500 errors in Sentry (critical bug)

---

## Summary: What's Next?

| Phase | Timeline | Focus | Success Metric |
|-------|----------|-------|-----------------|
| **Phase 1** | Week 1-2 | Launch MVP | 50 signups, 20 DAU |
| **Phase 2** | Week 3-6 | Iterate on feedback | 30+ weekly actives, NPS >40 |
| **Phase 3** | Week 7-12 | Add AI features | $2-5k MRR, 20+ paid users |
| **Phase 4** | Week 13+ | Scale & explore | $10-20k MRR, 50-100 users |

**Starting immediately after MVP ships**: Run Phase 2 (Founder Validation). This is a 4-week sprint focused on learning, not building. Most of the work is customer interviews, not code.

---

**Type**: Roadmap overview
**Status**: Ready to execute
**Audience**: You + future team members

