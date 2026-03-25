# GitHub Issues Update: New Atlas Integration Epic

**Date**: 2026-03-24
**Action**: Created new Epic #53 + 8 child issues for Atlas Board integration

---

## Summary

### New Epic Created
- **#53**: Epic: Atlas Board Integration (Week 13+)
  - Status: Future (contingent on Phase 3 success)
  - Priority: Medium
  - Timeline: Week 13-14 (after OpenDash Phase 3 validation)

### Child Issues Created (8 Issues)

| Issue | Title | Effort | Area |
|-------|-------|--------|------|
| #54 | Add Atlas agent datasources framework | 4-6h | Backend |
| #55 | Implement CFO agent datasource (spend, budget) | 4-6h | Backend |
| #56 | Implement COO agent datasource (ops, blockers) | 4-6h | Backend |
| #57 | Implement CMO agent datasource (ranking, content) | 4-6h | Backend |
| #58 | Implement CTO agent datasource (code quality) | 4-6h | Backend |
| #59 | Add chat interface to talk to Atlas agents | 6-8h | Frontend |
| #60 | Create Agent panels UI (CFO, COO, CMO) | 6-8h | Frontend |
| #61 | Integrate Atlas webhook alerts in OpenDash | 2-4h | Backend |
| #62 | Document Atlas + OpenDash integration | 2-3h | Docs |

**Total Effort**: 40-60 hours (1 week @ 50 hrs/week)
**Timeline**: Week 13-14
**Blocker**: Only if OpenDash doesn't hit Phase 3 targets

---

## Current Issue Structure (After Update)

### Main Roadmap Epics (4)
| Epic | Title | Status | Issues |
|------|-------|--------|--------|
| #19 | MVP Launch (Week 1-2) | ⏳ Pending | #20-25 (6 issues) |
| #26 | Founder Validation (Week 3-6) | ⏳ Pending | #27-32 (6 issues) |
| #33 | AI Analytics Foundation (Week 7-12) | ⏳ Pending | #34-45 (12 issues) |
| #46 | Scale & Iterate (Week 13+) | ⏳ Pending | #47-52 (6 issues) |

### New Integration Epic (Conditional)
| Epic | Title | Status | Issues |
|------|-------|--------|--------|
| #53 | Atlas Board Integration (Week 13+) | 🔜 Future | #54-62 (9 issues) |

### Old/Deprecated Issues (Marked for Review)
| Range | Status | Action |
|-------|--------|--------|
| #1-9 | Duplicate/old labels | Review for closure |
| #10-18 | Schema epics (internal) | Keep or archive |

---

## Dependency Map

```
MVP Launch (#19)
  ↓ (must succeed: 50 signups, 20 DAU)
Founder Validation (#26)
  ↓ (must succeed: 30 weekly active, NPS >40)
AI Analytics Foundation (#33)
  ↓ (must succeed: $2-5k MRR, 20+ paid users)
Scale & Iterate (#46)
  ├─ Chart types (#47-48)
  ├─ DaaS exploration (#49-50)
  └─ Intelligence (#51-52)
      ↓ (if all above succeeds)
Atlas Board Integration (#53) [CONDITIONAL]
  ├─ Agent datasources (#54-58)
  ├─ Chat interface (#59)
  ├─ UI panels (#60)
  ├─ Webhooks (#61)
  └─ Documentation (#62)
```

**Key**: Epic #53 only proceeds if:
- OpenDash Phase 3 hits targets ($2-5k MRR, 20+ paid)
- Atlas Board agents are live and stable
- Cross-team alignment exists

---

## Issue Labels Used

### Priority
- `critical`: Blocking launches
- `high`: Next sprint
- `medium`: Important but not blocking
- `low`: Nice to have

### Effort
- `effort-small`: 1-3 hours
- `effort-medium`: 3-8 hours
- `effort-large`: 8+ hours
- `effort-epic`: Spans multiple sprints

### Area
- `area-frontend`: UI/UX
- `area-backend`: Server logic
- `area-monitoring`: Observability

### Lifecycle
- `feature`: New capability
- `enhancement`: Improvement
- `documentation`: Docs/guides
- `future`: Post-MVP work
- `post-refactor`: After refactoring

---

## What Changed

### Before (3 Epics)
- #19: MVP Launch
- #26: Founder Validation
- #33: AI Analytics
- #46: Scale & Iterate (vague about what "scale" means)
- Issues #1-52: Mix of old + current + future

### After (4 Epics + Cleanup)
- #19: MVP Launch (6 child issues)
- #26: Founder Validation (6 child issues)
- #33: AI Analytics Foundation (12 child issues)
- #46: Scale & Iterate (6 child issues, clarified tracks)
- #53: **NEW** Atlas Board Integration (9 child issues, conditional)
- Issues #1-18: Marked for review/closure

### Key Improvement
- Clear contingency: #53 only happens if Phase 3 succeeds
- Explicit child issues: Each epic has 6-12 concrete tasks
- Dependency clarity: Can't skip Phase 2 to get to Phase 3, etc.

---

## How This Integrates with Atlas

### OpenDash Independence (Weeks 1-12)
```
OpenDash MVP
├─ Ships as standalone founder product
├─ 100+ signups, $2-5k MRR success target
└─ No dependency on Atlas Board
```

### Parallel Development (Weeks 1-12)
```
Atlas Board (separate repo, separate team/session)
├─ Builds CEO/CFO/COO/CMO agents
├─ Stores state in D1, communicates via webhooks
└─ Doesn't depend on OpenDash
```

### Week 13 Integration (If Both Succeed)
```
OpenDash + Atlas Board
├─ #53: Create agent datasources
├─ Chat interface talks to agents
├─ OpenDash becomes primary org dashboard
└─ Combined product: operational + strategic intelligence
```

---

## Next Steps

### This Week (MVP Launch)
- [ ] Work through issues #20-25 (auth, deploy, landing, monitoring)
- [ ] Target: Ship to 50 founders by end of week

### Weeks 3-6 (Founder Validation)
- [ ] Work through issues #27-32 (onboarding, notifications, mobile, interviews)
- [ ] Target: 30+ weekly actives, NPS >40 by week 6

### Weeks 7-12 (AI Analytics)
- [ ] Work through issues #34-45 (charting, NLQ, anomaly, datasources, team plan)
- [ ] Target: $2-5k MRR, 20+ paid users by week 12

### Week 13 Decision Point
- [ ] Assess Phase 3 results
- [ ] If success: Activate Epic #53 (Atlas integration)
- [ ] If plateau: Focus on understanding why, don't integrate yet

### Weeks 13-14 (Atlas Integration, IF Phase 3 succeeds)
- [ ] Work through issues #54-62
- [ ] Create agent datasources (CFO, COO, CMO, CTO)
- [ ] Add chat interface
- [ ] Ship integrated dashboard

---

## Repository Status

**Total Open Issues**: 62 (was 52, now +10 with Atlas epic)
**Actionable Issues**: 40 (Epic epics + child issues)
**Future/Conditional**: 9 (Atlas integration, only if Phase 3 succeeds)
**Old/Deprecated**: 18 (marked for review)

**Build Status**: ✅ Passing
**MVP Ready**: ✅ Yes (Phases 1-4 complete)
**Launch Ready**: ✅ Yes (issues #20-25 ready)

---

## Files Created/Updated This Session

| File | Purpose |
|------|---------|
| WEEK1-MVP-LAUNCH-PLAN.md | Detailed Week 1-2 execution |
| ROADMAP-OVERVIEW.md | Complete 26-week strategic roadmap |
| WEEK3-FOUNDER-VALIDATION-PLAN.md | Phase 2 validation plan |
| EXECUTION-CHECKLIST.md | Quick reference checklist |
| ARCHITECTURE-ROADMAP.md | Datasources/Prime/Scramjet integration |
| OPENDASH-IN-ATLAS-ECOSYSTEM.md | OpenDash role in Atlas Board |
| PROGRESS-REVIEW-AND-ATLAS-INTEGRATION.md | Current status + integration plan |
| GITHUB-ISSUES-UPDATE.md | **This file** — issue tracking updates |

---

## How to Track Progress

### Weekly Cadence
- **Monday**: Review this week's issues, move to "In Progress"
- **Friday**: Update issue status, measure metrics
- **Sunday**: Reflect on what you learned, plan next week

### Issue Checklist
Each issue has acceptance criteria. Check them off as you work.

Example workflow:
1. Pick issue #20 (Implement auth)
2. Open task: `gh issue view 20`
3. Read acceptance criteria
4. Work until all criteria ✅
5. Update issue: `gh issue close 20`
6. Move to next: `gh issue view 21`

### Measuring Success

**MVP Phase (Week 2)**:
- [ ] 50+ signups
- [ ] 20+ daily active
- [ ] 0 critical bugs

**Validation Phase (Week 6)**:
- [ ] 30+ weekly active
- [ ] <10% churn
- [ ] NPS >40

**AI Analytics Phase (Week 12)**:
- [ ] $2-5k MRR
- [ ] 20+ paid users
- [ ] <5% churn

**Atlas Integration Phase (Week 14)**:
- [ ] Agent datasources live
- [ ] Chat interface working
- [ ] All panels rendering
- [ ] Webhook alerts working

---

**Type**: GitHub issues update
**Status**: Ready to execute
**Audience**: You + future team

Next action: Start Week 1 MVP launch with issues #20-25.

