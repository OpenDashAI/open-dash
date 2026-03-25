# GitHub Issues Created from Technical Review

**Generated**: 2026-03-24
**Source**: TECHNICAL-ARCHITECTURE-REVIEW.md
**Total Issues Created**: 8 issues (#61-68)

---

## Issue Summary by Priority

### 🔴 CRITICAL (MVP Blocking)

| # | Title | Effort | Label | Status |
|---|-------|--------|-------|--------|
| 61 | Fix 9 failing schema validation tests | 2-3h | critical, effort-medium | CREATED ✓ |

**Action**: Start immediately in Sprint 0
**Blocker**: Yes - tests must pass before MVP launch

---

### 🟠 HIGH (Phase 2: Weeks 3-6)

| # | Title | Effort | Label | Status |
|---|-------|--------|-------|--------|
| 62 | Fix untyped analytics state (useState<any>) | 1h | high, effort-small | CREATED ✓ |
| 63 | Type analytics.ts database query results | 1-2h | high, effort-medium | CREATED ✓ |
| 64 | Integrate Sentry for error tracking | 2-3h | high, effort-medium | CREATED ✓ |
| 65 | Add E2E tests for authentication flow | 4-6h | high, effort-medium | CREATED ✓ |

**Timeline**: Schedule for Week 3-4 during validation phase
**Total Effort**: 8-12 hours (~2 dev days)
**Dependencies**: #61 must pass first

---

### 🟡 MEDIUM (Phase 3: Weeks 7-12)

| # | Title | Effort | Label | Status |
|---|-------|--------|-------|--------|
| 66 | Add API rate limiting on endpoints | 1-2h | medium, effort-small | CREATED ✓ |
| 67 | Performance profiling and optimization audit | 4-6h | medium, effort-large | CREATED ✓ |

**Timeline**: Week 8-9, parallel with feature development
**Total Effort**: 5-8 hours (~1 dev day)
**Dependencies**: None - can start anytime in Phase 3

---

### 🔵 LOW (Phase 4+: Conditional)

| # | Title | Effort | Label | Status |
|---|-------|--------|-------|--------|
| 68 | Evaluate database connection pooling | 2-3h* | low, effort-medium | CREATED ✓ |

*Investigation only; implementation 4-6h if needed

**Timeline**: Only trigger if performance metrics show bottleneck
**Trigger Condition**: 100k+ metrics/hour OR 1000+ concurrent users
**Dependencies**: #67 (performance profiling shows bottleneck)

---

## Quick Reference: What to Work On

### This Week (Sprint 0 - MVP Launch)
```
[ ] Issue #61: Fix failing tests → 2-3h
    Status: CRITICAL - DO FIRST
    Then proceed with #20, #21
```

### Weeks 3-4 (Validation Phase)
```
[ ] Issue #62: Fix useState<any> → 1h
[ ] Issue #63: Type database queries → 1-2h
[ ] Issue #64: Sentry integration → 2-3h
[ ] Issue #65: E2E tests → 4-6h (parallel with validation features)
```

### Weeks 8-9 (AI Analytics Phase)
```
[ ] Issue #66: Rate limiting → 1-2h
[ ] Issue #67: Performance audit → 4-6h
```

### Week 13+ (Only if needed)
```
[ ] Issue #68: Database pooling → Only if #67 shows bottleneck
```

---

## Issue Details

### #61: Fix 9 Failing Schema Tests ⭐ CRITICAL
**Link**: https://github.com/OpenDashAI/open-dash/issues/61

Failing tests:
- 4 dashboard-config.test.ts failures (YAML schema)
- 3 schemas.test.ts failures (input validation)
- 2 BrandFocusView.test.tsx failures (component rendering)

**Why it matters**: Tests must pass before shipping MVP

---

### #62: Fix useState<any> Type Issues
**Link**: https://github.com/OpenDashAI/open-dash/issues/62

Locations:
- 4 useState<any> in AnalyticsDashboard
- 1 useState<any> in useAnalytics hook

**Impact**: Improves IDE autocomplete and type safety

---

### #63: Type Database Query Results
**Link**: https://github.com/OpenDashAI/open-dash/issues/63

Affected functions:
- getTrendingData (line 60: `metrics as any`)
- getAnomalyData (line 93: `metrics as any`)
- evaluateRules (line 111: `rules as any`)

**Impact**: Better type inference for analysis functions

---

### #64: Sentry Error Tracking
**Link**: https://github.com/OpenDashAI/open-dash/issues/64

Setup:
- Create Sentry.io project
- Install @sentry/node and @sentry/react
- Configure error boundaries
- Setup alerts

**Impact**: Centralized error monitoring for production

---

### #65: E2E Authentication Tests
**Link**: https://github.com/OpenDashAI/open-dash/issues/65

Test coverage:
- Login flow (valid/invalid credentials)
- Logout flow
- Session persistence
- Protected route access
- Token refresh

**Impact**: Confidence in authentication security

---

### #66: API Rate Limiting
**Link**: https://github.com/OpenDashAI/open-dash/issues/66

Targets:
- /api/ws endpoint
- /api/events endpoint

Limits:
- 100 req/min per authenticated user
- 10 req/min per unauthenticated IP

**Impact**: Prevents abuse and DOS attacks

---

### #67: Performance Profiling
**Link**: https://github.com/OpenDashAI/open-dash/issues/67

Metrics:
- Core Web Vitals (FCP, LCP, CLS, TTFB)
- Database query performance
- React render performance
- Bundle size analysis

**Impact**: Establishes performance baseline for optimization

---

### #68: Database Connection Pooling
**Link**: https://github.com/OpenDashAI/open-dash/issues/68

When to trigger:
- 100k+ metrics/hour
- 1000+ concurrent users
- Database latency becomes bottleneck

Options to evaluate:
- D1 SQLite optimization
- Migrate to Postgres (Supabase, Neon, Railway)
- Migrate to MySQL (Planetscale)

**Impact**: Enables scaling beyond current limits

---

## Total Effort Summary

| Phase | Issues | Total Effort | Status |
|-------|--------|-------------|--------|
| MVP Launch (Week 1-2) | #61 | 2-3h | CRITICAL |
| Validation (Week 3-6) | #62-65 | 8-12h | HIGH |
| AI Analytics (Week 7-12) | #66-67 | 5-8h | MEDIUM |
| Scale (Week 13+) | #68 | Conditional | LOW |

**Total (MVP + Phase 2)**: ~12-18 hours
**Total (all phases)**: ~15-26 hours (excluding Phase 4 if not needed)

---

## Related Documents

- **TECHNICAL-ARCHITECTURE-REVIEW.md** — Full code quality assessment
- **TECHNICAL-DEBT-ROADMAP.md** — Detailed improvement roadmap with execution plans
- **WEEK1-MVP-LAUNCH-PLAN.md** — MVP execution (existing)
- **ARCHITECTURE-ROADMAP.md** — Technical decisions (existing)

---

## Next Steps

### Immediate (This Week)
1. Open all 8 issues in GitHub (DONE ✓)
2. Review Issue #61 and estimate fix time
3. Schedule #61 for immediate work (before #20, #21)
4. Update WEEK1-MVP-LAUNCH-PLAN.md to include test fix

### After MVP Launch (Week 3)
1. Review validation phase issues (#62-65)
2. Estimate effort and schedule for Week 3-4
3. Assign based on current capacity

### During Phase 3 (Week 8+)
1. Review performance/rate limiting issues (#66-67)
2. Schedule for Week 8-9 execution

### Conditional (Week 13+)
1. Use #67 results to decide on #68
2. Only proceed if performance metrics show bottleneck

---

**Status**: All issues created and ready for assignment
**Owner**: Solo developer (advanced capability confirmed)
**Risk**: LOW - issues are well-scoped and have clear acceptance criteria
