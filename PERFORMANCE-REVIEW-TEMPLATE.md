# Performance Review Template

**Review Type**: Performance
**Status**: Template (copy and fill in for each review)
**Based on**: UNIFIED-REVIEW-FRAMEWORK.md
**Standards**: Core Web Vitals, Industry Benchmarks

---

## Review Metadata

| Field | Value |
|-------|-------|
| **Review ID** | [Performance Review #N] |
| **Date** | [YYYY-MM-DD] |
| **Scope** | [Codebase / Component / Feature / Epic / Phase] |
| **Phase** | [MVP / Phase 2 / Phase 3 / Phase 4+] |
| **Reviewer** | [Name] |
| **Duration** | [X hours] |
| **Testing Environment** | [Desktop / Mobile / Both] |
| **Network Condition** | [Fast 3G / 4G / 5G / Cable] |
| **Previous Review** | [Link to prior performance review, if any] |

---

## Executive Summary

[1-2 paragraphs summarizing performance posture]

**Overall Score**: [1-5] ⭐
**Performance Health**: [Excellent / Good / Fair / Poor / Critical]
**Critical Bottlenecks**: [Number]
**High Priority Optimizations**: [Number]
**Trend**: [Improving / Stable / Degrading]

---

## Assessment Scope

### What Was Measured

```
Performance Dimensions:
├─ Frontend Metrics (Core Web Vitals)
├─ API Response Times
├─ Database Query Performance
├─ Bundle Size & Asset Loading
├─ Caching Effectiveness
├─ Memory Usage
├─ CPU Usage
├─ Network Waterfall
└─ Real User Monitoring (RUM) baseline
```

### Pages/Features Assessed

- [Page 1]: [Metrics]
- [Page 2]: [Metrics]
- [Feature 1]: [Metrics]

---

## Findings

### Core Web Vitals (Frontend)

| Metric | Current | Target | Status | Details |
|--------|---------|--------|--------|---------|
| **FCP** (First Contentful Paint) | [Xs] | <1.8s | ✅/⚠️ | [Details] |
| **LCP** (Largest Contentful Paint) | [Xs] | <2.5s | ✅/⚠️ | [Details] |
| **CLS** (Cumulative Layout Shift) | [#] | <0.1 | ✅/⚠️ | [Details] |
| **TTFB** (Time to First Byte) | [Xs] | <600ms | ✅/⚠️ | [Details] |
| **FID/INP** (Interactivity) | [Xms] | <100ms | ✅/⚠️ | [Details] |

### Backend Performance

| Metric | Current | Target | Status | Details |
|--------|---------|--------|--------|---------|
| **API Response Time (p50)** | [Xms] | <200ms | ✅/⚠️ | [Details] |
| **API Response Time (p95)** | [Xms] | <500ms | ✅/⚠️ | [Details] |
| **Database Query Time (p50)** | [Xms] | <100ms | ✅/⚠️ | [Details] |
| **Database Query Time (p95)** | [Xms] | <300ms | ✅/⚠️ | [Details] |
| **API Error Rate** | [%] | <0.5% | ✅/⚠️ | [Details] |

### Asset Performance

| Metric | Current | Target | Status | Details |
|--------|---------|--------|--------|---------|
| **Bundle Size (Main)** | [XXkB] | <300kB | ✅/⚠️ | [Details] |
| **Bundle Size (React/UI)** | [XXkB] | <200kB | ✅/⚠️ | [Details] |
| **Critical CSS** | [XXkB] | <50kB | ✅/⚠️ | [Details] |
| **Unminified Code %** | [%] | 0% | ✅/⚠️ | [Details] |
| **Tree-Shaking Unused Code** | [XXkB removed] | [Target] | ✅/⚠️ | [Details] |

### Caching Performance

| Metric | Current | Target | Status | Details |
|--------|---------|--------|--------|---------|
| **Cache Hit Rate (Browser)** | [%] | >80% | ✅/⚠️ | [Details] |
| **Cache Hit Rate (Edge)** | [%] | >90% | ✅/⚠️ | [Details] |
| **Cache Hit Rate (App)** | [%] | >85% | ✅/⚠️ | [Details] |
| **Cache Invalidation Time** | [Xs] | <5m | ✅/⚠️ | [Details] |

### Resource Usage

| Metric | Current | Target | Status | Details |
|--------|---------|--------|--------|---------|
| **Memory Usage (Idle)** | [XXMb] | <100Mb | ✅/⚠️ | [Details] |
| **Memory Usage (Peak)** | [XXMb] | <300Mb | ✅/⚠️ | [Details] |
| **CPU Usage (Idle)** | [%] | <5% | ✅/⚠️ | [Details] |
| **CPU Usage (Peak)** | [%] | <40% | ✅/⚠️ | [Details] |

---

## Strengths (What's Working Well)

1. **[Strength 1]**
   - Metric evidence
   - Impact on users

2. **[Strength 2]**
   - Metric evidence
   - Benefit

### Issues & Performance Gaps

1. **[Issue 1: Category]** (Priority: CRITICAL/HIGH/MEDIUM/LOW)
   - Location: [Component/page/endpoint]
   - Problem: [What's slow, why]
   - Metric Impact: [Which metric affected]
   - Severity: [User impact, scale]
   - Root Cause: [Why this is happening]
   - Estimated Impact: [Improvement possible if fixed]

2. **[Issue 2]** (Priority: CRITICAL/HIGH/MEDIUM/LOW)
   - Location
   - Problem
   - Metric Impact
   - Severity
   - Root Cause
   - Estimated Impact

---

## Bottleneck Analysis

### Frontend Bottlenecks

```
[Component/Page] rendering time: [Xms]
├─ Initial parse: [Xms]
├─ Bundle download: [Xms]
├─ Code evaluation: [Xms]
└─ React render: [Xms]
```

### Backend Bottlenecks

```
[Endpoint] response time: [Xms]
├─ Request parsing: [Xms]
├─ Database query: [Xms]
├─ Business logic: [Xms]
└─ Serialization: [Xms]
```

### Network Bottlenecks

```
[Request type] waterfalls:
├─ DNS lookup: [Xms]
├─ TCP connect: [Xms]
├─ TLS handshake: [Xms]
├─ Request send: [Xms]
├─ Server process: [Xms]
└─ Response download: [Xms]
```

---

## Recommendations by Priority

### CRITICAL (Launch Blocking / Unacceptable Performance)

#### Rec P1.1: [Title]

**What**:
[Clear description of optimization needed]

**Why**:
[Why this is critical - user impact, metrics]

**Current State**: [Xms → Target: <Yms]
**Expected Improvement**: [Zms or X%]
**User Impact**: [How many users benefit, what they experience]

**How to Know It's Done**:
- [ ] Metric improved from [X] to [Y]
- [ ] Test case passes
- [ ] No regressions in other metrics

**Implementation Notes**:
[Technical approach, tools, methodology]

**Timeline**: [Target week/phase]
**Effort**: [X-Y hours]
**Complexity**: [Low / Medium / High]
**Issue**: [GitHub issue #]

---

### HIGH (Phase 2+ / Next Milestone)

#### Rec P1.2: [Title]

**What**:
[Description]

**Why**:
[Rationale with metrics]

**Current State**: [Xms → Target: <Yms]
**Expected Improvement**: [Zms or X%]

**How to Know It's Done**:
- [ ] Criterion 1
- [ ] Criterion 2

**Implementation Notes**:
[Technical guidance]

**Timeline**: [Target]
**Effort**: [X-Y hours]
**Complexity**: [Low / Medium / High]
**Issue**: [GitHub issue #]

---

### MEDIUM (Nice-to-Have / Current Phase if Capacity)

#### Rec P1.3: [Title]

**What**:
[Description]

**Why**:
[Rationale]

**Current State**: [Xms → Target: <Yms]
**Expected Improvement**: [X%]

**Timeline**: [Target]
**Effort**: [X-Y hours]
**Complexity**: [Low / Medium / High]
**Issue**: [GitHub issue #]

---

### LOW (Future / Post-Launch)

#### Rec P1.4: [Title]

**What**:
[Description]

**Why**:
[Rationale]

**Timeline**: [Target]
**Effort**: [X-Y hours]
**Issue**: [GitHub issue #]

---

## Testing Methodology

### Tools Used

- **Core Web Vitals**: [Lighthouse version / PageSpeed Insights / Speedcurve]
- **Real User Monitoring**: [Tool]
- **Synthetic Monitoring**: [Tool]
- **Bundle Analysis**: [webpack-bundle-analyzer / source-map-explorer]
- **Profiling**: [Chrome DevTools / Performance API / Other]

### Test Scenarios

1. **Desktop (Fast 3G)**
   - Metrics: [Results]
   - Status: ✅ / ⚠️

2. **Mobile (4G)**
   - Metrics: [Results]
   - Status: ✅ / ⚠️

3. **High Latency Scenario (500ms latency)**
   - Metrics: [Results]
   - Status: ✅ / ⚠️

4. **High Load Scenario (100 concurrent users)**
   - Metrics: [Results]
   - Status: ✅ / ⚠️

---

## Recommendations Summary Table

| Rec | Title | Priority | Impact | Effort | Phase | Status |
|-----|-------|----------|--------|--------|-------|--------|
| P1.1 | [Title] | CRITICAL | Xms | X-Yh | [Phase] | PROPOSED |
| P1.2 | [Title] | HIGH | Xms | X-Yh | [Phase] | PROPOSED |
| P1.3 | [Title] | MEDIUM | Xms | X-Yh | [Phase] | PROPOSED |
| P1.4 | [Title] | LOW | Xms | X-Yh | [Phase] | PROPOSED |

**Total Effort**: [X-Y hours]
**Total Potential Improvement**: [Sum of improvements]
**Current Phase Work**: [A hours]

---

## Performance Budget

### Targets for Next Phase

| Metric | Current | Target | Budget Change |
|--------|---------|--------|---|
| LCP | [Xms] | <2.5s | [+Xms or OK] |
| CLS | [#] | <0.1 | [OK] |
| Bundle Size | [XXkB] | <300kB | [+XXkB or OK] |
| API p95 | [Xms] | <500ms | [OK or +Xms] |

### Performance Regression Prevention

- Lighthouse CI: [Enabled / Not yet]
- Bundle size limits: [Set / Not yet]
- API latency monitoring: [In place / Needed]
- RUM alerts: [Configured / Needed]

---

## Team Assessment

- **Performance Expertise**: [Level]
- **Monitoring Capability**: [Current state]
- **Profiling Skills**: [Current state]
- **Optimization Experience**: [Current state]
- **Training Needs**: [What's needed]

---

## Business Impact

### User Experience Impact

- **Bounce Rate Risk**: [Assessment if not optimized]
- **Conversion Impact**: [% improvement if optimized]
- **Retention Impact**: [How performance affects retention]

### Infrastructure Impact

- **Server Cost**: [Potential savings if optimized]
- **CDN Cost**: [Potential savings]
- **Scaling Timeline**: [Pushed back / Same / Accelerated by optimization]

---

## Comparison to Baseline

If this is a repeat review:

| Metric | Review #[N-1] | Review #[N] | Change | Status |
|--------|---|---|---|---|
| LCP | [X] | [Y] | [+/-Z] | ↑↓ |
| CLS | [X] | [Y] | [+/-Z] | ↑↓ |
| Bundle Size | [X] | [Y] | [+/-Z] | ↑↓ |
| API p95 | [X] | [Y] | [+/-Z] | ↑↓ |

---

## Next Steps

1. **This Week**: [Action items]
2. **Next Phase**: [Forward-looking items]
3. **Ongoing**: [Monitoring and maintenance]

---

## Related Documents

- **PERFORMANCE-AUDIT.md** — [If prior audit exists]
- **PERFORMANCE-ROADMAP.md** — [If performance has dedicated roadmap]

---

## Appendices

### A. Detailed Test Results

[Full Lighthouse reports, RUM data, synthetic monitoring results]

### B. Network Waterfall Diagrams

[Screenshots or diagrams showing request waterfalls]

### C. Profiling Data

[CPU profiles, memory profiles, flame graphs]

### D. Competitive Benchmarking

[How we compare to similar products]

---

**Review Status**: [DRAFT / COMPLETE / APPROVED]
**Approval Date**: [Date, if approved]
**Next Review**: [Estimated date for follow-up review]
**Monitoring Active**: [Yes / No - links to monitoring dashboards if yes]
