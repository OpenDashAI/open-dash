# GitHub Issues Created for OpenDash 90-Day Roadmap

**Repo**: github.com/OpenDashAI/open-dash
**Date Created**: 2026-03-24
**Total Issues**: 34 issues across 4 epics

---

## Epic 1: MVP Launch (Weeks 1-2) — Issue #19

**Epic Goal**: Ship founder briefing MVP with auth, deploy, 50+ beta users

### Child Issues

| # | Title | Effort | Priority | Area |
|---|-------|--------|----------|------|
| #20 | Implement auth (Clerk) | 2-4h | High | Backend |
| #21 | Deploy to opendash.ai domain | 1-2h | High | Backend |
| #22 | Set up Sentry monitoring | 1-2h | High | Monitoring |
| #23 | Create landing page | 2-4h | High | Frontend |
| #24 | Implement onboarding email sequences | 2-3h | Medium | Backend |
| #25 | Create getting started guide + video | 2-4h | High | Docs |

**Total Effort**: ~40 hours
**Success Criteria**: 50 beta signups, 20 daily active, 0 critical bugs

---

## Epic 2: Founder Validation (Weeks 3-6) — Issue #26

**Epic Goal**: Gather feedback, improve UX, hit 30+ weekly actives, NPS >40, 5+ paid users

### Child Issues

| # | Title | Effort | Priority | Area |
|---|-------|--------|----------|------|
| #27 | Improve onboarding UX | 4-6h | High | Frontend |
| #28 | Add Slack/Discord notifications | 4-6h | Medium | Backend |
| #29 | Improve mobile UI responsiveness | 4-6h | High | Frontend |
| #30 | Add in-app NPS survey | 2-4h | Medium | Frontend |
| #31 | Blog: Founder morning routines | 4-6h | Medium | Docs |
| #32 | Conduct 5-10 founder interviews | 6-8h | High | General |

**Total Effort**: ~160 hours (~40/week)
**Success Criteria**: 30+ weekly active, <10% churn, NPS >40, 5+ paid subscriptions

---

## Epic 3: AI Analytics Foundation (Weeks 7-12) — Issue #33

**Epic Goal**: Transform into AI analytics SaaS, hit $2-5k MRR, 100+ signups

### Core Features

| # | Title | Effort | Priority | Area |
|---|-------|--------|----------|------|
| #34 | Integrate Recharts + chart cards | 4-6h | **Critical** | Frontend |
| #35 | Build NLQ foundation | 8-12h | **Critical** | Backend |
| #36 | Implement anomaly detection | 6-8h | **Critical** | Backend |

### Datasource Expansion (Add 6 new sources)

| # | Title | Effort | Priority | Area |
|---|-------|--------|----------|------|
| #37 | Add Plausible Analytics | 4-6h | Medium | Backend |
| #38 | Add Uptime Kuma | 4-6h | Medium | Backend |
| #39 | Add SendGrid | 4-6h | Medium | Backend |
| #40 | Add YouTube Analytics | 4-6h | Medium | Backend |
| #41 | Add Substack Analytics | 4-6h | Medium | Backend |
| #42 | Add custom HTTP API | 4-6h | Medium | Backend |

### Product & Monetization

| # | Title | Effort | Priority | Area |
|---|-------|--------|----------|------|
| #43 | Team plan + multi-user | 6-8h | High | Backend |
| #44 | Update pricing tiers + billing | 6-8h | High | Backend |
| #45 | Add per-datasource Zod schemas | 4-6h | High | Backend |

**Total Effort**: ~300+ hours
**Success Criteria**: 100+ signups, 50+ weekly active, 20+ paid subs, $2-5k MRR, <5% churn

---

## Epic 4: Scale & Iterate (Week 13+) — Issue #46

**Epic Goal**: Expand features, users, revenue. Hit $10-20k MRR by quarter-end

### Child Issues

| # | Title | Effort | Priority | Area |
|---|-------|--------|----------|------|
| #47 | Add more chart types | 8-12h | Medium | Frontend |
| #48 | Build dashboard templates by vertical | 6-8h | Medium | Frontend |
| #49 | Explore white-label / DaaS opportunities | 8-12h | Low | General |
| #50 | Explore embeddable analytics API | 10-12h | Low | General |
| #51 | Implement predictive alerts | 8-10h | Medium | Backend |
| #52 | Add observability + monitoring | 6-8h | High | Monitoring |

**Total Effort**: Ongoing (50% product, 50% GTM)
**Success Criteria**: $10-20k MRR, 50-100 paying users, <5% churn

---

## Labels Used

### Priority
- `critical`: Blocking launches or core features
- `high`: Next sprint or MVP-critical
- `medium`: Important but not blocking
- `low`: Nice to have, future work

### Effort
- `effort-trivial`: <1 hour
- `effort-small`: 1-3 hours
- `effort-medium`: 3-8 hours
- `effort-large`: 1-3 days (8+ hours)
- `effort-epic`: Large epics spanning weeks

### Area
- `area-frontend`: UI/UX
- `area-backend`: Server logic, APIs
- `area-monitoring`: Observability, analytics
- `area-testing`: Tests and QA

### Type
- `feature`: New capability
- `enhancement`: Improvement to existing feature
- `refactor`: Code cleanup without behavior change
- `chore`: Maintenance, tooling, no user-facing change
- `documentation`: Docs, guides, blog posts

### Status
- `future`: Post-MVP, exploration
- `post-refactor`: Work after refactoring complete

---

## Issue Organization by Effort & Timeline

### Week 1-2 MVP (40 hours)
- Auth, deploy, monitoring, landing page, emails, docs
- **Critical path**: Auth → Deploy → Landing page

### Week 3-6 Validation (160 hours / ~40 per week)
- UX improvements, notifications, mobile, feedback loops
- **Parallel**: Onboarding + mobile + notifications
- **Sequential**: Interviews → Blog posts

### Week 7-12 AI Analytics (300+ hours)
- **Critical path**: Charting (4-6h) → NLQ (8-12h) → Anomaly (6-8h)
- **Parallel**: 6 datasources (4-6h each) + team plan + pricing + validation
- **Longest**: NLQ (8-12h), datasources (6 × 5h = 30h)

### Week 13+ Scale
- Continuous improvement
- Exploration of DaaS + embedded API
- Feature polish + observability

---

## Success Metrics Checklist

### MVP Launch (Week 2)
- [ ] 50 beta signups
- [ ] 20 daily active users
- [ ] 0 critical bugs
- [ ] Auth working
- [ ] Deployed to opendash.ai

### Founder Validation (Week 6)
- [ ] 30+ weekly active
- [ ] <10% weekly churn
- [ ] NPS >40
- [ ] 5+ paid subscriptions
- [ ] 10 founder interviews completed

### AI Analytics (Week 12)
- [ ] 100+ total signups
- [ ] 50+ weekly active
- [ ] 20+ paid subscriptions
- [ ] $2-5k MRR
- [ ] <5% weekly churn (paid)
- [ ] Charting + NLQ + anomaly working
- [ ] 6+ new datasources live

### Scale (Week 26)
- [ ] $10-20k MRR
- [ ] 50-100 paying users
- [ ] <5% churn
- [ ] 2+ pilot DaaS customers (exploration)
- [ ] Clear roadmap for Q3

---

## Next Steps

1. **Review & prioritize**: Reorder issues if needed
2. **Assign to sprints**: Organize Week 1-2, Week 3-6, etc.
3. **Add estimates**: Refine effort estimates after first week
4. **Track progress**: Update issue status weekly
5. **Adjust**: If actual effort differs, update remaining issues

---

## How to Use This in GitHub

1. Create a **Project** for "90-Day MVP Roadmap"
2. Add all 34 issues to the project
3. Create columns: Backlog, Current Sprint (Week 1-2), In Progress, Review, Done
4. Move issues through workflow as you work
5. Review metrics weekly in project view

---

**File**: GITHUB-ISSUES-SUMMARY.md
**Type**: Reference guide
**Status**: Ready for implementation

