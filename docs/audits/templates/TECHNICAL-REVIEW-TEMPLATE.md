# Technical Review Template

**Template Version**: 1.0
**Purpose**: Standardized format for regular technical assessments
**Frequency**: Recommended quarterly or at phase milestones
**Last Updated**: 2026-03-24

---

## Review Metadata

- **Review Date**: [DATE]
- **Reviewer**: [NAME/AGENT]
- **Phase**: [PHASE - MVP/Phase 2/Phase 3/etc]
- **Duration**: [TOTAL HOURS OF ANALYSIS]
- **Scope**: [WHAT WAS REVIEWED]
- **Status**: [DRAFT/READY FOR REVIEW/APPROVED]

---

## Executive Summary

[1-2 paragraph overview of findings]

### Assessment Scores

| Area | Score | Trend | Notes |
|------|-------|-------|-------|
| Code Quality | [1-5] | [↑↓→] | |
| Architecture | [1-5] | [↑↓→] | |
| Type Safety | [1-5] | [↑↓→] | |
| Test Coverage | [1-5] | [↑↓→] | |
| Error Handling | [1-5] | [↑↓→] | |
| Performance | [1-5] | [↑↓→] | |
| Security | [1-5] | [↑↓→] | |
| Documentation | [1-5] | [↑↓→] | |
| DevOps/Deployment | [1-5] | [↑↓→] | |
| Team Capability | [1-5] | [↑↓→] | |

**Overall Health**: [EXCELLENT/GOOD/FAIR/AT-RISK]

---

## Key Findings

### ✅ Strengths (What's Working Well)

1. **Finding 1**
   - Evidence: [how you know this]
   - Impact: [why it matters]
   - Status: [VALIDATED/NEW/IMPROVING]

2. **Finding 2**
   - Evidence: [...]
   - Impact: [...]
   - Status: [...]

[Add more as needed]

---

### ⚠️ Issues & Gaps (What Needs Attention)

1. **Issue 1: [Clear Description]**
   - Severity: [CRITICAL/HIGH/MEDIUM/LOW]
   - Blocker: [YES/NO]
   - Current Impact: [what's broken or missing]
   - Root Cause: [why this exists]
   - Evidence: [metrics, code, tests]

2. **Issue 2**
   - Severity: [...]
   - Blocker: [...]
   - Current Impact: [...]
   - Root Cause: [...]
   - Evidence: [...]

[Add more as needed]

---

## Recommendations

### Priority 1: CRITICAL (Blocking Current Phase)

| Rec ID | Recommendation | Effort | Phase | Linked Issue | Status |
|--------|---|---|---|---|---|
| R1 | [What to do] | [2-3h] | [Current] | [#XX] | [PROPOSED/APPROVED/IN-PROGRESS/DONE] |
| R2 | [...] | [...] | [...] | [...] | [...] |

**Rationale**: Why these must be done now

**Acceptance Criteria**:
- [ ] Criterion 1
- [ ] Criterion 2

---

### Priority 2: HIGH (Next Phase)

| Rec ID | Recommendation | Effort | Phase | Linked Issue | Status |
|--------|---|---|---|---|---|
| R3 | [What to do] | [4-6h] | [Next Phase] | [#YY] | [PROPOSED/...] |
| R4 | [...] | [...] | [...] | [...] | [...] |

**Rationale**: Why these are important

**Dependencies**: [List any blockers]

---

### Priority 3: MEDIUM (Nice to Have, Current Phase)

| Rec ID | Recommendation | Effort | Phase | Linked Issue | Status |
|--------|---|---|---|---|---|
| R5 | [What to do] | [1-2h] | [Current] | [#ZZ] | [PROPOSED/...] |

---

### Priority 4: LOW (Future Consideration)

| Rec ID | Recommendation | Effort | Phase | Linked Issue | Status |
|--------|---|---|---|---|---|
| R6 | [What to do] | [TBD] | [Phase 4+] | [#AA] | [PROPOSED/...] |

---

## Metrics & Measurements

### Code Quality Metrics

| Metric | Previous | Current | Target | Status |
|--------|----------|---------|--------|--------|
| Test Pass Rate | [%] | [%] | 95% | [✅/⚠️] |
| Type Coverage | [%] | [%] | 95% | [✅/⚠️] |
| Any Casts | [N] | [N] | <50 | [✅/⚠️] |
| TODO/FIXME Markers | [N] | [N] | 0 | [✅/⚠️] |
| Error Handling | [N try/catch] | [N try/catch] | [Target] | [✅/⚠️] |
| Untyped Functions | [%] | [%] | <5% | [✅/⚠️] |

### Architecture Metrics

| Metric | Assessment | Trend | Notes |
|--------|---|---|---|
| Cyclomatic Complexity | [Low/Medium/High] | [↑↓→] | |
| Coupling | [Loose/Moderate/Tight] | [↑↓→] | |
| Cohesion | [High/Medium/Low] | [↑↓→] | |
| Tech Debt Ratio | [X%] | [↑↓→] | |

### Performance Metrics

| Metric | Previous | Current | Target | Status |
|--------|----------|---------|--------|--------|
| Dashboard Load Time | [Xs] | [Xs] | <2s | [✅/⚠️] |
| Datasource Fetch Time | [Xs] | [Xs] | <1s | [✅/⚠️] |
| API Response Time | [Xms] | [Xms] | <200ms | [✅/⚠️] |
| Cache Hit Rate | [%] | [%] | >80% | [✅/⚠️] |

---

## Comparison to Previous Review

| Aspect | Previous | Current | Change | Notes |
|--------|----------|---------|--------|-------|
| Overall Health | [Good] | [Good] | [→] | Stable |
| Critical Issues | [N] | [N] | [↓/↑] | [Notes] |
| Test Coverage | [X%] | [X%] | [+/-X%] | [Notes] |
| Tech Debt | [X items] | [X items] | [+/-X] | [Notes] |

---

## Development Team Assessment

### Current Capability Level

**Profile**: [Solo/Small Team/Medium Team]

**Skills**:
- Backend Architecture: [Beginner/Intermediate/Advanced/Expert]
- Frontend Development: [Beginner/Intermediate/Advanced/Expert]
- TypeScript/Type Safety: [Beginner/Intermediate/Advanced/Expert]
- DevOps/Infrastructure: [Beginner/Intermediate/Advanced/Expert]
- Testing: [Beginner/Intermediate/Advanced/Expert]
- Product Thinking: [Beginner/Intermediate/Advanced/Expert]

**Risk Assessment**: [LOW/MEDIUM/HIGH]
- Blocking concerns: [List any]
- Confidence in roadmap execution: [HIGH/MEDIUM/LOW]

---

## Phase-Specific Notes

### Current Phase ([PHASE NAME])

**What's Working Well**:
- [Item 1]
- [Item 2]

**What Needs Attention**:
- [Item 1]
- [Item 2]

**Recommendations for This Phase**:
- [R1, R2, R3] (from above)

### Next Phase ([PHASE NAME])

**Architectural Decisions to Make**:
- [Decision 1]
- [Decision 2]

**Key Dependencies**:
- [On completing current phase]

---

## Risk Assessment & Mitigations

| Risk | Probability | Impact | Mitigation | Owner |
|------|-------------|--------|-----------|-------|
| [Risk 1] | [High/Med/Low] | [High/Med/Low] | [What to do] | [@person] |
| [Risk 2] | [...] | [...] | [...] | [...] |

---

## Benchmarking Against Industry

| Aspect | OpenDash | Industry Best | Gap | Plan |
|--------|----------|---|---|---|
| [Metric 1] | [Value] | [Value] | [Gap] | [How to close] |
| [Metric 2] | [...] | [...] | [...] | [...] |

---

## External Dependencies & Research

### Research Conducted
- [Research area 1: findings summary]
- [Research area 2: findings summary]

### External Tools/Services Evaluated
- [Tool 1: assessment]
- [Tool 2: assessment]

---

## Appendices

### A. Detailed Findings

[Expand on any findings that need more detail]

### B. Code Quality Details

[Show specific examples of issues found]

### C. Test Coverage Report

[Link to coverage report or show summary]

### D. Performance Profiling

[Link to profiling data or show summary]

### E. Security Audit

[Summary of security assessment]

### F. External Research References

[Links to benchmarking documents or research]

---

## Sign-Off

**Reviewer**: [Name]
**Date**: [Date]
**Approval Status**: [DRAFT/PENDING REVIEW/APPROVED]

**Review Notes**:
- [ ] Code quality assessed
- [ ] Architecture reviewed
- [ ] Recommendations prioritized
- [ ] Risks identified
- [ ] Team capability evaluated
- [ ] Phase alignment verified

**Next Review**: [Date]
**Review Frequency**: [Quarterly/At phase completion/Other]

---

## Document History

| Date | Reviewer | Version | Key Changes |
|------|----------|---------|------------|
| 2026-03-24 | Claude | 1.0 | Template created |
| [...] | [...] | [...] | [...] |

---

**Purpose of This Document**

This review serves as:
1. **Historical Record** — Track technical health over time
2. **Planning Input** — Inform roadmap and epic creation
3. **Risk Management** — Identify issues before they escalate
4. **Team Alignment** — Clear communication of recommendations
5. **Accountability** — Track recommendation implementation

**How to Use**

1. **Conduct Review**: Fill out all sections
2. **Get Approval**: Present to stakeholders
3. **Create Issues**: Link each recommendation to GitHub issue
4. **Track Progress**: Update status as recommendations are addressed
5. **Archive**: Save in REVIEW-HISTORY/ directory
6. **Reference**: Use as basis for next review

**Related Documents**

- ARCHITECTURE-REVIEW-LOG.md — Historical tracking
- REVIEW-RECOMMENDATIONS-TRACKER.md — Epic linking
- [Phase-specific plans]
