# Unified Review Framework: Flexible & Composable

**Version**: 1.0
**Date**: 2026-03-24
**Purpose**: Systematic approach to conducting reviews across all dimensions of the project

---

## Framework Philosophy

**Problem**: Different review types (technical, accessibility, performance, progress) use similar structures but aren't connected.

**Solution**: A composable framework where:
- Core structure is abstract and reusable
- Review types are pluggable templates
- Different aspects/phases can be reviewed independently
- All reviews feed into unified tracking system
- Reviews inform planning and highlight risks

**Key Principle**: **"Assess once, use everywhere"**
- Conduct review in any dimension
- Output feeds into planning, issue creation, tracking
- Trends visible across all dimensions
- Decisions data-driven and traceable

---

## Core Review Structure

Every review—regardless of type or dimension—follows this pattern:

```
┌─────────────────────────────────┐
│  REVIEW DEFINITION              │
│  (Type, Scope, Phase, Audience) │
└────────┬────────────────────────┘
         │
┌────────▼────────────────────────┐
│  ASSESSMENT                     │
│  (Gather data, measure, evaluate)
└────────┬────────────────────────┘
         │
┌────────▼────────────────────────┐
│  FINDINGS                       │
│  (Strengths, gaps, risks)       │
└────────┬────────────────────────┘
         │
┌────────▼────────────────────────┐
│  RECOMMENDATIONS                │
│  (Prioritized actions)          │
└────────┬────────────────────────┘
         │
┌────────▼────────────────────────┐
│  TRACKING                       │
│  (GitHub issues, status, trends)│
└─────────────────────────────────┘
```

---

## Review Dimensions (What to Review)

### By Type (Discipline)

| Type | Focus | Example | Frequency |
|------|-------|---------|-----------|
| **Technical** | Code quality, architecture, type safety | TECHNICAL-ARCHITECTURE-REVIEW.md | Phase completion |
| **Accessibility** | WCAG compliance, a11y, inclusion | ACCESSIBILITY-AUDIT.md | Phase completion |
| **Performance** | Load times, metrics, optimization | PERFORMANCE-AUDIT.md | Phase completion |
| **Security** | Vulnerabilities, auth, data protection | [Future] | Quarterly |
| **Product** | Feature completeness, UX, roadmap alignment | PROGRESS-REVIEW-AND-ATLAS-INTEGRATION.md | Phase completion |
| **Infrastructure** | DevOps, deployment, scaling | [Future] | Quarterly |

### By Scope (What Part)

| Scope | Subject | Example |
|-------|---------|---------|
| **Codebase** | All code in repo | TECHNICAL-ARCHITECTURE-REVIEW.md |
| **Component** | Single UI component | Individual component assessment |
| **Feature** | Specific feature (#XX) | Feature audit before launch |
| **Epic** | Related issues group | Epic assessment before phase completion |
| **Phase** | 2-week sprint or phase | SYSTEMATIC-REVIEW-2026-03-24.md |
| **Area** | Domain (frontend, backend, testing) | Area-specific health check |

### By Phase

| Phase | Timing | Reviews Conducted |
|-------|--------|-------------------|
| **MVP (Week 1-2)** | Before launch | Technical, accessibility, performance |
| **Phase 2 (Week 3-6)** | Week 8 (end) | Progress/systematic, trend analysis |
| **Phase 3 (Week 7-12)** | Week 16 (end) | All dimensions, scaling readiness |
| **Phase 4+ (Week 13+)** | Quarterly | Ongoing health monitoring |

---

## Review Template: Universal Structure

Every review, regardless of type, uses this structure:

### 1. Review Header
```markdown
# [Type] Review: [Scope]

**Date**: [Date]
**Phase**: [Phase]
**Dimension**: [Type]
**Scope**: [What's being reviewed]
**Audience**: [Who reads this]
**Status**: [DRAFT/READY/APPROVED]
```

### 2. Executive Summary
```markdown
## Executive Summary

[1-2 paragraph overview]

### Assessment Scores
| Category | Score | Status | Trend |
|----------|-------|--------|-------|
| [Item 1] | [1-5] | ✅/⚠️/❌ | ↑↓→ |
| [Item 2] | [...] | [...] | [...] |

**Overall Health**: [EXCELLENT/GOOD/FAIR/AT-RISK]
**Recommendation**: [Ship/Hold/Improve/Block]
```

### 3. Detailed Findings
```markdown
## Findings

### ✅ Strengths (What's Working)
1. [Item] - Evidence, Impact
2. [Item] - Evidence, Impact

### ⚠️ Gaps (What Needs Work)
1. [Item] - Severity, Evidence, Impact
2. [Item] - Severity, Evidence, Impact

### ❌ Blockers (If Any)
1. [Item] - Why it blocks, How to resolve
```

### 4. Recommendations
```markdown
## Recommendations

### Priority 1: CRITICAL (Blocking)
| Rec | What | Effort | Issue | Phase |
|-----|------|--------|-------|-------|
| R1 | [Action] | [Time] | [#XX] | [Phase] |

### Priority 2: HIGH (Next Phase)
| Rec | What | Effort | Issue | Phase |
|-----|------|--------|-------|-------|
| R2 | [...] | [...] | [...] | [...] |

### Priority 3: MEDIUM (Nice-to-have)
### Priority 4: LOW (Future)
```

### 5. Metrics & Measurements
```markdown
## Metrics

| Metric | Previous | Current | Target | Status |
|--------|----------|---------|--------|--------|
| [M1] | [Value] | [Value] | [Value] | ✅/⚠️ |
| [M2] | [...] | [...] | [...] | [...] |

### Trend Analysis
[How are things moving? Improving, stable, or declining?]
```

### 6. Related Reviews
```markdown
## Related Reviews & Context

- Previous review: [Link]
- Related dimensions: [Links]
- Broader context: [References]
```

---

## Review Types: Templates & Focus

### Template 1: Technical Review
**Focus**: Code quality, architecture, type safety, testing, error handling

**Key Sections**:
- Code quality metrics
- Architecture assessment
- Type safety analysis
- Test coverage
- Error handling
- Security assessment

**Tools**: TypeScript, Biome, coverage reports, git history
**Frequency**: After each phase
**Example**: TECHNICAL-ARCHITECTURE-REVIEW.md

---

### Template 2: Accessibility Review
**Focus**: WCAG compliance, a11y, inclusion, user experience for disabled users

**Key Sections**:
- WCAG 2.1 AA checklist
- Color contrast analysis
- Keyboard navigation
- Screen reader compatibility
- Focus management
- Alternative text

**Tools**: axe DevTools, WAVE, manual testing, screen readers
**Frequency**: After each phase
**Example**: ACCESSIBILITY-AUDIT.md

---

### Template 3: Performance Review
**Focus**: Load times, rendering, optimization, metrics, responsiveness

**Key Sections**:
- Core Web Vitals (FCP, LCP, CLS, TTFB)
- Component render performance
- API response times
- Database query performance
- Bundle size
- Memory usage

**Tools**: Lighthouse, React Profiler, Chrome DevTools, load testing
**Frequency**: After each phase
**Example**: PERFORMANCE-AUDIT.md

---

### Template 4: Progress Review
**Focus**: Shipping readiness, epic tracking, feature completeness, roadmap alignment

**Key Sections**:
- Phase completion status
- Epic status and blockers
- Feature completeness
- Shipping readiness
- Dependency tracking
- Risk assessment

**Tools**: GitHub issues, project boards, git log, manual tracking
**Frequency**: Phase completion
**Example**: SYSTEMATIC-REVIEW-2026-03-24.md

---

### Template 5: Security Review
**Focus**: Vulnerabilities, authentication, authorization, data protection

**Key Sections**:
- Dependency vulnerabilities
- Authentication assessment
- Authorization implementation
- Data protection
- API security
- Secrets management

**Tools**: npm audit, OWASP checklist, manual code review
**Frequency**: Quarterly + on demand
**Example**: [Not yet created, create with next review]

---

### Template 6: Infrastructure Review
**Focus**: DevOps, deployment, scaling, reliability, monitoring

**Key Sections**:
- Deployment pipeline
- Scaling readiness
- Monitoring & observability
- Disaster recovery
- Security posture
- Cost optimization

**Tools**: Cloudflare logs, deployment history, monitoring dashboards
**Frequency**: Quarterly + before scaling
**Example**: [Not yet created, create with next review]

---

## Composable Review Approach

### Combine Dimensions

You can review **any combination** of type + scope + phase:

```
Technical Review of Frontend Components (Phase 2)
  ↓
Accessibility Audit of Analytics Dashboard (Phase 7)
  ↓
Performance Review of Phase 3 Features
  ↓
Progress Review of Epic #33 (AI Analytics)
  ↓
Security Audit of Auth System
  ↓
Infrastructure Review before Scaling
```

### Example: Feature-Level Review

```
Feature #35: NLQ (Natural Language Query)

Technical Review:
├─ Code quality of LLM integration
├─ Type safety of prompt engineering
├─ Error handling for parsing failures
└─ Test coverage of chat interface

Accessibility Review:
├─ Chat interface keyboard navigation
├─ Alternative text for results
└─ Screen reader support

Performance Review:
├─ LLM API latency
├─ Response streaming
└─ Memory impact of prompt caching

Recommendation: SHIP with accessibility improvements
```

### Example: Phase-Level Review

```
Phase 2 (Validation, Week 8)

Technical Review: Code quality across Phase 2 work
  └─ Found: Type safety improved from Phase 1

Accessibility Review: All Phase 2 features
  └─ Found: 3 minor a11y issues, 1 blocker

Performance Review: Phase 2 impact on metrics
  └─ Found: +40ms latency, optimizable

Progress Review: Roadmap alignment, blockers
  └─ Found: Validation targets hit, Phase 3 ready

Decision: PROCEED to Phase 3 with optimizations
```

---

## Unified Review Tracker

All reviews feed into a single tracking system:

```
┌──────────────────────────────────────┐
│  UNIFIED REVIEW TRACKER              │
├──────────────────────────────────────┤
│                                      │
│  By Type:                            │
│  ├─ Technical (Review #1 ✅)         │
│  ├─ Accessibility (Review #1 ✅)     │
│  ├─ Performance (Review #1 ✅)       │
│  ├─ Progress (Review #1 ✅)          │
│  ├─ Security (Scheduled Week 8)      │
│  └─ Infrastructure (Scheduled Qtr)   │
│                                      │
│  By Phase:                           │
│  ├─ MVP (Week 1-2): All dimensions   │
│  ├─ Phase 2 (Week 3-6): Week 8       │
│  ├─ Phase 3 (Week 7-12): Week 16     │
│  └─ Phase 4+ (Week 13+): Quarterly   │
│                                      │
│  By Status:                          │
│  ├─ Findings: [N items]              │
│  ├─ Recommendations: [N items]       │
│  └─ Tracked Issues: [#XX, #YY]       │
│                                      │
└──────────────────────────────────────┘
```

---

## Integration with Development Planning

### Flow: Review → Planning → Execution

```
Conduct Review
  ↓
Identify Findings & Recommendations
  ↓
Create GitHub Issues
  ↓
Prioritize by Phase
  ↓
Add to Phase Planning Document
  ↓
Execute in Sprint
  ↓
Track in REVIEW-RECOMMENDATIONS-TRACKER.md
  ↓
Next Review Assesses Impact
```

### Example: Phase 2 Planning Integration

```
From Technical Review #1:
├─ R1.2: Fix useState<any> (#62) → Add to Week 3-4
├─ R1.3: Type queries (#63) → Add to Week 3-4
├─ R1.4: Sentry integration (#64) → Add to Week 4
└─ R1.5: E2E tests (#65) → Add to Week 5-6

From Progress Review of Phase 2:
├─ Focus: Validation metrics (30+ weekly active, NPS >40)
├─ Issue: Track progress against targets
└─ Risk: Low engagement → Iterate on UX

Result: WEEK3-FOUNDER-VALIDATION-PLAN.md includes:
├─ Feature work (#27-32)
├─ Technical improvements (R1.2-R1.5)
├─ Progress tracking (Review metrics)
└─ Risk mitigation (Contingency plans)
```

---

## Review Schedule & Rhythm

### Systematic Cadence

```
Week 1-2 (MVP)
└─ Conduct: Technical, Accessibility, Performance reviews
   └─ Output: Issues #61-68 created
   └─ Decision: Ready for launch ✅

Week 8 (Phase 2 End)
└─ Conduct: Progress review, Technical review #2
   └─ Output: Phase 2 assessment, Phase 3 recommendations
   └─ Decision: Continue to Phase 3?

Week 16 (Phase 3 End)
└─ Conduct: All dimensions review, Scaling readiness
   └─ Output: Phase 4 plan, Infrastructure needs
   └─ Decision: Ready to scale?

Month 6+
└─ Conduct: Quarterly reviews of all dimensions
   └─ Output: Trends, health metrics, roadmap adjustments
   └─ Decision: Scaling or pivoting?
```

### Review Types by Timing

| When | Reviews | Purpose |
|------|---------|---------|
| Before MVP | Tech, Accessibility, Performance | Ship-readiness |
| Phase completion | Progress, Technical #N | Phase assessment |
| Pre-scaling | Infrastructure, Security, Performance | Readiness |
| Quarterly | All dimensions | Health check |

---

## Metrics Tracked Across Reviews

### Universal Metrics (All Reviews)

| Metric | Purpose | Trend |
|--------|---------|-------|
| Overall Health Score | Combined assessment | Watch trend |
| Critical Issues | Blockers count | Should decrease |
| Recommendations Implemented | % of actions taken | Should increase |
| Days to Fix | Time from finding to resolution | Should decrease |

### Type-Specific Metrics

**Technical**:
- Test pass rate (target: >95%)
- Type safety: any casts (target: <50)
- Tech debt: TODO markers (target: 0)

**Accessibility**:
- WCAG 2.1 AA pass rate (target: 100%)
- Color contrast violations (target: 0)
- Keyboard navigation (target: 100%)

**Performance**:
- Core Web Vitals (FCP <1.8s, LCP <2.5s, CLS <0.1)
- API response time (target: <200ms)
- Cache hit rate (target: >80%)

**Progress**:
- Feature completion % by phase
- Roadmap alignment %
- Blocker resolution time

---

## Creating a Review: Step-by-Step

### Phase 1: Planning (2-4 hours)

1. **Define Review Scope**
   - Type: Technical / Accessibility / Performance / Progress / Security / Infrastructure
   - Scope: Codebase / Component / Feature / Epic / Phase / Area
   - Phase: MVP / Phase 2 / Phase 3 / Phase 4+ / N/A
   - Audience: Team / Stakeholders / Product / Leadership

2. **Set Baseline Metrics**
   - Gather previous review data
   - Establish current measurements
   - Set comparison points

3. **Schedule & Communicate**
   - Block time for review (20-50 hours total)
   - Notify team of scope
   - Prepare assessment tools

---

### Phase 2: Assessment (15-40 hours)

1. **Gather Data**
   - Run analysis tools
   - Conduct manual review
   - Collect metrics
   - Interview stakeholders

2. **Evaluate Against Standards**
   - Compare to targets
   - Assess against best practices
   - Identify gaps
   - Note strengths

3. **Document Findings**
   - Write strengths section
   - Document gaps with evidence
   - Assess impact of each issue
   - Create recommendations

---

### Phase 3: Documentation (5-10 hours)

1. **Write Using Template**
   - Fill in review header
   - Write executive summary with scores
   - Document detailed findings
   - List prioritized recommendations

2. **Create GitHub Issues**
   - One issue per recommendation
   - Link to review document
   - Add acceptance criteria
   - Estimate effort and phase

3. **Update Tracking**
   - Add to REVIEW-RECOMMENDATIONS-TRACKER.md
   - Add to ARCHITECTURE-REVIEW-LOG.md
   - Update UNIFIED-REVIEW-TRACKER.md

---

### Phase 4: Review & Approval (2-3 hours)

1. **Present Findings**
   - Share executive summary
   - Discuss critical issues
   - Align on recommendations

2. **Get Approval**
   - Stakeholder sign-off
   - Agreement on timeline
   - Commitment to execution

3. **Commit & Track**
   - Commit review document
   - Create GitHub issues
   - Add to phase planning
   - Update roadmap

---

## Composable Review Examples

### Example 1: Lightweight Component Review

```
Scope: TrendingCard component
Effort: 4 hours
Type: Technical + Accessibility + Performance

Assessment:
├─ Code quality: 5/5 (clean, maintainable)
├─ Accessibility: 4/5 (needs aria-label on trend arrow)
└─ Performance: 5/5 (2-3ms render time, useMemo optimized)

Recommendation: SHIP with a11y fix (30 min)
Issue: #[NEW] - Add aria-label to trend indicator
```

### Example 2: Epic-Level Review

```
Scope: Epic #35 (NLQ - Natural Language Query)
Phase: 3 (Week 7-12)
Effort: 8 hours
Type: All dimensions

Technical Review:
├─ Code quality: 4/5 (good, needs type safety improvements)
├─ Architecture: 5/5 (clean separation of concerns)
└─ Testing: 3/5 (needs more edge case tests)

Accessibility Review:
├─ Chat interface: 4/5 (keyboard nav works, needs help text)
└─ Result display: 5/5 (semantic HTML, proper labeling)

Performance Review:
├─ LLM API latency: 2s average (acceptable)
├─ Streaming support: 4/5 (implemented, not tested under load)
└─ Memory impact: 5/5 (prompt caching works well)

Recommendations: SHIP with improvements
Issues: #[NEW], #[NEW], #[NEW]
Phase: Week 9-10 fixes, Week 11-12 testing
```

### Example 3: Phase-Level Review

```
Scope: Phase 2 Completion (Weeks 3-6)
Effort: 16 hours
Type: All dimensions

Technical Review:
├─ Type safety: Improved from 4/5 → 4.5/5
├─ Test coverage: Stable at 95%
└─ Architecture: Maintained at 5/5

Accessibility Review:
├─ WCAG AA: 92% → 95% (3 issues fixed)
└─ Keyboard nav: 100%

Performance Review:
├─ Load time: Stable at 1.2s
├─ Optimizations: +3 implemented
└─ Bottlenecks: Database queries identified

Progress Review:
├─ Features: 100% complete
├─ Validation metrics: Hit 30+ weekly active ✅
├─ NPS: 42 (target: >40) ✅
└─ Churn: 8% (target: <10%) ✅

Decision: PROCEED to Phase 3
Issues: Phase 3 recommendations created
Timeline: Phase 3 plan informed by findings
```

---

## Benefits of Unified Framework

✅ **Flexibility**: Review any combination of type/scope/phase
✅ **Composability**: Mix and match as needed
✅ **Consistency**: Standard structure across all reviews
✅ **Traceability**: All findings linked to issues and plans
✅ **Trending**: Metrics visible across time
✅ **Integration**: Reviews inform planning automatically
✅ **Comprehensive**: No dimension left unchecked
✅ **Lightweight**: Can do quick reviews when needed

---

## Next: Create Dimension-Specific Templates

See:
- **TECHNICAL-REVIEW-TEMPLATE.md** — Technical reviews
- **[CREATE] ACCESSIBILITY-REVIEW-TEMPLATE.md** — Accessibility reviews
- **[CREATE] PERFORMANCE-REVIEW-TEMPLATE.md** — Performance reviews
- **[CREATE] PROGRESS-REVIEW-TEMPLATE.md** — Progress reviews
- **[CREATE] SECURITY-REVIEW-TEMPLATE.md** — Security reviews
- **[CREATE] INFRASTRUCTURE-REVIEW-TEMPLATE.md** — Infrastructure reviews

---

## File Structure

```
/open-dash/

UNIFIED FRAMEWORK
├─ UNIFIED-REVIEW-FRAMEWORK.md ← YOU ARE HERE
├─ REVIEW-SYSTEM-OVERVIEW.md (legacy, consolidate)
├─ REVIEW-PROCESS-GUIDE.md (legacy, consolidate)

CORE TEMPLATES
├─ TECHNICAL-REVIEW-TEMPLATE.md (exists)
├─ ACCESSIBILITY-REVIEW-TEMPLATE.md (create)
├─ PERFORMANCE-REVIEW-TEMPLATE.md (create)
├─ PROGRESS-REVIEW-TEMPLATE.md (create)
├─ SECURITY-REVIEW-TEMPLATE.md (create)
└─ INFRASTRUCTURE-REVIEW-TEMPLATE.md (create)

TRACKING
├─ ARCHITECTURE-REVIEW-LOG.md (exists)
├─ UNIFIED-REVIEW-TRACKER.md (create)
└─ REVIEW-RECOMMENDATIONS-TRACKER.md (exists)

COMPLETED REVIEWS (by type)
├─ TECHNICAL-ARCHITECTURE-REVIEW.md (Review #1)
├─ ACCESSIBILITY-AUDIT.md (Review #1)
├─ PERFORMANCE-AUDIT.md (Review #1)
├─ SYSTEMATIC-REVIEW-2026-03-24.md (Review #1)
└─ PROGRESS-REVIEW-AND-ATLAS-INTEGRATION.md (Previous)
```

---

**Status**: Framework complete and ready for implementation
**Next**: Create dimension-specific templates based on this framework
**Update Frequency**: Evolve framework based on learnings from Review #2+
