# Technical Debt & Improvements Roadmap

**Date**: 2026-03-24
**Source**: TECHNICAL-ARCHITECTURE-REVIEW.md
**Status**: Prioritized backlog

---

## Priority Levels & Phases

### 🔴 CRITICAL (Must Do Before MVP Launch)

**Issue #61**: Fix 9 failing schema validation tests
- **Effort**: 2-3 hours
- **Blocker**: Yes (tests must pass before shipping)
- **Details**: 4 failures in dashboard-config tests, 3 in schemas tests, 2 in component tests
- **Phase**: Week 1 (Sprint 0 - Pre-Launch)

**Status**: Issues #20, #21 already exist for Clerk auth and deployment

---

### 🟠 HIGH (Phase 2: Weeks 3-6, Post-MVP Validation)

These are improvements to code quality and observability that should be completed during validation phase while founder feedback is being collected.

| Issue | Title | Effort | Type | Details |
|-------|-------|--------|------|---------|
| #62 | Fix untyped analytics state (useState<any>) | 1h | Type Safety | Update 4 useState<any> calls to proper types |
| #63 | Type analytics.ts database query results | 1-2h | Type Safety | Remove 'as any' casts in getTrendingData, getAnomalyData, evaluateRules |
| #64 | Integrate Sentry for error tracking | 2-3h | Monitoring | Setup Sentry.io for centralized error tracking and alerting |
| #65 | Add E2E tests for authentication flow | 4-6h | Testing | Playwright tests for login, logout, session persistence |

**Timeline**: Schedule these for Week 3-4 during validation phase
**Dependencies**: #62, #63 depend on #61 passing
**Total Effort**: 8-12 hours (~2 days of work)

---

### 🟡 MEDIUM (Phase 3: Weeks 7-12, AI Analytics)

These improvements enhance performance and developer experience during feature-heavy phase.

| Issue | Title | Effort | Type | Details |
|-------|-------|--------|------|---------|
| #66 | Add API rate limiting on endpoints | 1-2h | Security | Rate limit /api/ws and /api/events |
| #67 | Performance profiling and optimization audit | 4-6h | Performance | Profile Core Web Vitals, database queries, render performance |

**Timeline**: Week 8-9 (after charting, NLQ foundations are shipping)
**Dependencies**: None
**Total Effort**: 5-8 hours (~1 day)

---

### 🔵 LOW (Phase 4+: Weeks 13+, Scale & Beyond)

These are conditional improvements only needed if specific scaling challenges arise.

| Issue | Title | Effort | Type | When Needed |
|-------|-------|--------|------|------------|
| #68 | Evaluate database connection pooling | 2-3h (investigation) + 4-6h (if needed) | Infrastructure | If hitting 100k+ metrics/hour or 1000+ concurrent users |

**Timeline**: Only trigger if performance metrics indicate bottleneck
**Dependencies**: #67 (performance profiling must show bottleneck first)
**Note**: May decide to migrate to Postgres instead

---

## Deferred Until Market Validation

These architectural improvements should wait until Phase 3 results are validated:

- **YAML Pipeline System** — Only if power users request declarative configurations
- **Prime Agent Integration** — Only if automation demand justifies complexity
- **DaaS/White-Label Product** — Only after proving standalone product viability
- **Embedded Analytics API** — Only if platform partners request integration

---

## Execution Plan by Phase

### Phase 0 (This Week - MVP Launch Prep)
```
[ ] Issue #61: Fix failing tests (2-3h)
    └─ BLOCKS: MVP launch
    └─ Status: Sprint 0 - Start immediately
[ ] Issue #20: Implement Clerk auth (2-4h) - ALREADY OPEN
[ ] Issue #21: Deploy to opendash.ai (1-2h) - ALREADY OPEN
```

### Phase 2 (Weeks 3-6 - Validation)
```
[ ] Week 3: Issue #62 (Fix useState<any>) — 1h
[ ] Week 3: Issue #63 (Type analytics queries) — 1-2h
[ ] Week 4: Issue #64 (Sentry integration) — 2-3h
[ ] Week 5-6: Issue #65 (E2E auth tests) — 4-6h
    └─ Parallel with other validation features (#27-32)
```

### Phase 3 (Weeks 7-12 - AI Analytics)
```
[ ] Week 8: Issue #66 (Rate limiting) — 1-2h
[ ] Week 9: Issue #67 (Performance profiling) — 4-6h
    └─ Parallel with charting (#34), NLQ (#35), anomaly detection (#36)
```

### Phase 4+ (Weeks 13+)
```
[ ] Issue #68: Database optimization — ONLY IF NEEDED
    └─ Trigger: Performance metrics show DB bottleneck
    └─ OR: Scaling past 100k metrics/hour
```

---

## Type Safety Improvements Detail

### Issue #62: Fix useState<any> in AnalyticsDashboard

**Current Code**:
```typescript
function TrendingCardLoader({ datasourceId, datasourceName }: CardLoaderProps) {
  const [data, setData] = useState<any>(null);  // ❌ Untyped
  // ... rest of component
}
```

**After Fix**:
```typescript
function TrendingCardLoader({ datasourceId, datasourceName }: CardLoaderProps) {
  const [data, setData] = useState<TrendingData | null>(null);  // ✅ Typed
  // ... rest of component
}
```

**Impact**:
- ✅ IDE autocomplete for data properties
- ✅ Type errors caught at compile time
- ✅ Easier refactoring
- ❌ No functional change to user experience

**Similar fixes needed in**:
- useAnalytics.ts (line 21: useState<any[]>)
- Multiple card loader components

---

### Issue #63: Remove 'as any' Casts in analytics.ts

**Current Code**:
```typescript
export const getTrendingData = createServerFn()
  .input<{ datasourceId: string; hours?: number }>()
  .handler(async ({ data }) => {
    const metrics = await getMetricsLastNHours(drizzleDb, data.datasourceId, data.hours || 24);
    const trending = analyzeTrending(metrics as any, "latency");  // ❌ Workaround
    return { error: null, trending };
  });
```

**Root Cause**:
Database query returns properly typed `DatasourceMetric[]`, but there's a mismatch in how it's passed to the analysis function.

**Solution**:
Create wrapper type or ensure metric shape matches analyzer's expected input exactly.

**After Fix**:
```typescript
export const getTrendingData = createServerFn()
  .handler(async ({ data }) => {
    const metrics = await getMetricsLastNHours(drizzleDb, data.datasourceId, data.hours || 24);
    const trending = analyzeTrending(metrics, "latency");  // ✅ No cast needed
    return { error: null, trending };
  });
```

---

## Testing Improvement Details

### Issue #61: Schema Test Failures

**Failing Tests** (9 total):
1. `dashboard-config.test.ts`: 4 failures (YAML schema validation)
2. `schemas.test.ts`: 3 failures (input validation mocks)
3. `BrandFocusView.test.tsx`: 2 failures (text content assertions)

**Fix Strategy**:
- Update mock data to match schema validation rules
- Fix brittle text assertions (use data-testid instead of text content)
- Verify component behavior matches test expectations

---

### Issue #65: E2E Tests for Auth

**Coverage Needed**:
```typescript
// tests/e2e/auth.spec.ts
describe('Authentication Flow', () => {
  test('User can login with valid credentials')
  test('User can logout')
  test('Session persists across page reloads')
  test('Unauthenticated users redirected to /login')
  test('Protected routes require valid session')
  test('Invalid credentials show error message')
  test('Session expires after timeout')
  test('Token refresh works automatically')
})
```

**Tools**:
- Playwright (recommended over Cypress for speed)
- headless: true for CI/CD
- baseURL: staging environment URL

---

## Monitoring & Observability Details

### Issue #64: Sentry Integration

**Setup Steps**:
1. Create Sentry account at sentry.io
2. Create new project for OpenDash
3. Install packages:
   ```bash
   npm install @sentry/node @sentry/react
   ```
4. Initialize in worker.ts:
   ```typescript
   import * as Sentry from "@sentry/node";

   Sentry.init({
     dsn: env.SENTRY_DSN,
     environment: env.ENVIRONMENT,
   });
   ```
5. Initialize in root layout:
   ```typescript
   import { Sentry } from '@sentry/react';

   const SentryRoot = Sentry.withSentryRouterRouting(Root);
   ```

**Error Boundaries**:
- Server errors auto-reported (via Sentry middleware)
- Client errors via ErrorBoundary component
- Unhandled promise rejections (configure in browser config)

**Alerts**:
- Critical errors trigger Slack/email notifications
- Weekly digest of errors by severity
- Custom alerts for specific error patterns

---

## Performance Audit Details

### Issue #67: Performance Profiling

**Core Web Vitals to Track**:
- **FCP** (First Contentful Paint): <1.8s
- **LCP** (Largest Contentful Paint): <2.5s
- **CLS** (Cumulative Layout Shift): <0.1
- **TTFB** (Time to First Byte): <600ms

**Database Metrics**:
- Query latency: avg, p95, p99
- Slow query log: queries >500ms
- Connection time: avg latency to acquire connection

**React Performance**:
- Component render time (React Profiler)
- Unnecessary re-renders
- Slow component alerts

**Bundle Analysis**:
- Total bundle size
- Unused code
- Vendor code splitting

**Tools**:
- web-vitals npm package
- Chrome DevTools Performance tab
- Cloudflare Analytics
- Custom logging (Sentry)

---

## Summary: Total Technical Debt Effort

| Phase | Issues | Total Effort | Priority |
|-------|--------|-------------|----------|
| Phase 0 (MVP Launch) | #61 | 2-3h | CRITICAL 🔴 |
| Phase 2 (Validation) | #62-65 | 8-12h | HIGH 🟠 |
| Phase 3 (AI Analytics) | #66-67 | 5-8h | MEDIUM 🟡 |
| Phase 4+ (Scale) | #68 | Conditional | LOW 🔵 |

**Total (MVP + Phase 2)**: ~12-18 hours
**Total (all phases)**: ~15-26 hours (excluding Phase 4 if not needed)

---

## Decision Gates

### Before MVP Launch (Week 2)
- ✅ Issue #61 resolved (tests passing)
- ✅ Issue #20 resolved (Clerk auth)
- ✅ Issue #21 resolved (opendash.ai deployment)

**Go/No-Go**: All three must be DONE

### Before Phase 3 (Week 7)
- ✅ Issues #62, #63 resolved (type safety)
- ✅ Issue #64 resolved (Sentry monitoring)
- ⚠️ Issue #65 (E2E tests) - SHOULD be done but not blocking

**Go/No-Go**: #62-64 must be DONE; #65 can slip to week 8-9

### Phase 3 Milestone (Week 12)
- Issue #67 performance baseline established
- Decision made: Continue scaling or investigate bottlenecks

---

## Related Documents

- **TECHNICAL-ARCHITECTURE-REVIEW.md** — Full code quality assessment
- **WEEK1-MVP-LAUNCH-PLAN.md** — MVP execution checklist
- **ARCHITECTURE-ROADMAP.md** — Technical decisions by phase
- **PERFORMANCE-AUDIT.md** — Performance assessment (existing)

---

**Status**: Backlog prioritized and ready for execution
**Next Action**: Start with Issue #61 (failing tests) before MVP launch
**Owner**: Solo developer (with team support for Phase 4+)
