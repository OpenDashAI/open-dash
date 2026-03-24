# Progress Review Template

**Review Type**: Progress
**Status**: Template (copy and fill in for each review)
**Based on**: UNIFIED-REVIEW-FRAMEWORK.md
**Focus**: Shipping Readiness, Epic Tracking, Milestone Completion

---

## Review Metadata

| Field | Value |
|-------|-------|
| **Review ID** | [Progress Review #N] |
| **Date** | [YYYY-MM-DD] |
| **Scope** | [Epic / Phase / Area] |
| **Phase** | [MVP / Phase 2 / Phase 3 / Phase 4+] |
| **Reviewer** | [Name] |
| **Duration** | [X hours] |
| **Review Period** | [Date range reviewed] |
| **Previous Review** | [Link to prior progress review, if any] |

---

## Executive Summary

[1-2 paragraphs on progress status]

**Overall Status**: [On Track / At Risk / Delayed / Complete]
**Completion Rate**: [X%]
**Critical Blockers**: [Number]
**High Priority Blockers**: [Number]
**Shipping Readiness**: [Ready Now / Ready Next Week / 1-2 Weeks / 3+ Weeks]

---

## Assessment Scope

### What Was Reviewed

```
Progress Dimensions:
├─ Epic/Feature Completion Rate
├─ Issue Closure Rate
├─ Dependency Tracking
├─ Blocker Resolution
├─ Test Coverage on Changes
├─ Code Quality on Merged PRs
├─ Team Velocity
└─ Risk Factors
```

### Epics/Milestones Assessed

- [Epic Name / Issue #]: [Status]
- [Epic Name / Issue #]: [Status]
- [Milestone Name]: [Status]

---

## Progress Summary

### Overall Metrics

| Metric | Target | Current | Status | Trend |
|--------|--------|---------|--------|-------|
| **Completion Rate** | [X%] | [Y%] | ✅/⚠️ | ↑/→/↓ |
| **Issues Closed** | [N] | [M] | ✅/⚠️ | ↑/→/↓ |
| **Open Issues** | [N] | [M] | ✅/⚠️ | ↓/→/↑ |
| **Blocked Issues** | <[N] | [M] | ⚠️/✅ | ↓/→/↑ |
| **Team Velocity (pts/week)** | [X] | [Y] | ✅/⚠️ | ↑/→/↓ |
| **Test Pass Rate** | >95% | [%] | ✅/⚠️ | ↑/→/↓ |
| **Code Review Lag (days)** | <3 | [N] | ✅/⚠️ | ↓/→/↑ |

---

## Epic/Milestone Status

### Epic 1: [Name] (Issue #[N])

**Status**: [Not Started / In Progress / Complete / On Hold]
**Completion**: [X/Y items] ([Z%])
**Target Date**: [Date]
**Current Date**: [Date - early/on-track/late]

**Key Items**:
- [ ] Item 1: [Status - Not Started / In Progress / Complete / Blocked]
- [ ] Item 2: [Status]
- [ ] Item 3: [Status]

**Blockers**:
- [Blocker 1 - details]
- [Blocker 2 - details]

**Last Update**: [Date]
**Owner**: [Name]
**Notes**: [Any relevant context]

---

### Epic 2: [Name] (Issue #[N])

**Status**: [Status]
**Completion**: [X/Y items] ([Z%])
**Target Date**: [Date]
**Current Date**: [Date - early/on-track/late]

**Key Items**:
- [ ] Item 1: [Status]
- [ ] Item 2: [Status]

**Blockers**:
- [Details if any]

---

## Findings

### What's On Track

1. **[Progress 1]**
   - Details: [What's going well]
   - Impact: [Why this matters]
   - Owner: [Who's driving this]

2. **[Progress 2]**
   - Details
   - Impact
   - Owner

### What's At Risk

1. **[Risk 1: Epic/Item Name]** (Priority: CRITICAL/HIGH/MEDIUM)
   - Status: [Approaching deadline / Behind schedule / Blocked]
   - Days until deadline: [N]
   - Days of work remaining: [M]
   - Gap: [M-N days of risk]
   - Root cause: [Why behind]
   - Mitigation: [What can help]
   - Owner: [Who needs to handle]

2. **[Risk 2]** (Priority: HIGH/MEDIUM)
   - Status
   - Gap
   - Root cause
   - Mitigation
   - Owner

### Blockers & Dependencies

1. **[Blocker 1]**
   - Blocked Issue: [#]
   - Blocking Issue: [#]
   - Severity: [CRITICAL/HIGH/MEDIUM]
   - Duration: [How long it's been blocked]
   - Resolution: [What's needed to unblock]
   - Owner: [Who can unblock]

2. **[Blocker 2]**
   - Blocked Issue
   - Blocking Issue
   - Severity
   - Duration
   - Resolution needed
   - Owner

---

## Velocity Analysis

### Team Capacity vs. Load

| Period | Capacity | Assigned | Completed | Status |
|--------|----------|----------|-----------|--------|
| Week N-2 | [X pts] | [Y pts] | [Z pts] | [%] ✅/⚠️ |
| Week N-1 | [X pts] | [Y pts] | [Z pts] | [%] ✅/⚠️ |
| Week N | [X pts] | [Y pts] | [Z pts] | [%] ✅/⚠️ |
| **Average** | [X] | [Y] | [Z] | [%] |

### Velocity Trend

```
Trending: [↑ Improving / → Stable / ↓ Declining]
Reason: [Why velocity is trending this way]
Forecast Impact: [How this affects completion date]
Adjustment Needed: [Scope cut / Timeline extension / Resource addition]
```

---

## Code Quality on Merged Changes

### Merge Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **PRs Merged (this period)** | [X] | [Y] | ✅/⚠️ |
| **Avg Review Lag (days)** | <3 | [N] | ✅/⚠️ |
| **Test Coverage on Changes** | >80% | [%] | ✅/⚠️ |
| **Regressions Found** | 0 | [N] | ✅/⚠️ |
| **Security Issues Found** | 0 | [N] | ✅/⚠️ |
| **Lint Violations Merged** | 0 | [N] | ✅/⚠️ |

### Quality Trend

- Code review quality: [Good / Fair / Needs improvement]
- Test coverage trend: [Improving / Stable / Declining]
- Defect escape rate: [Metric]

---

## Shipping Readiness Assessment

### Readiness Checklist

**Functionality Complete**:
- [ ] Core features shipped
- [ ] All critical items done
- [ ] No blocking issues
- [ ] API contracts finalized

**Quality Standards Met**:
- [ ] >95% test pass rate
- [ ] No critical bugs
- [ ] Code review complete
- [ ] Performance acceptable

**Documentation Complete**:
- [ ] User documentation done
- [ ] API documentation done
- [ ] Deployment docs ready
- [ ] Runbook prepared

**Infrastructure Ready**:
- [ ] Staging environment validated
- [ ] Monitoring configured
- [ ] Alerting configured
- [ ] Rollback plan documented

**Team Ready**:
- [ ] On-call rotation assigned
- [ ] Incident response plan ready
- [ ] Team trained
- [ ] Launch communication ready

### Readiness Status

**Overall Shipping Readiness**: [Ready Now / Ready Next Week / 1-2 Weeks / 3+ Weeks / Blocked]

**If Not Ready**:
- Top blockers: [List]
- Time to resolve: [Estimate]
- Recommendation: [Ship now with plan / Wait / Ship subset]

---

## Issue Closure Analysis

### Closed Issues (This Period)

| Type | Closed | Status | Quality |
|------|--------|--------|---------|
| **Features** | [N] | ✅ | [Good / Fair] |
| **Bug Fixes** | [N] | ✅ | [Good / Fair] |
| **Technical Debt** | [N] | ✅ | [Good / Fair] |
| **Research/Spike** | [N] | ✅ | [Good / Fair] |

### Open Issues by Priority

| Priority | Count | Trend | Owner |
|----------|-------|-------|-------|
| **Critical** | [N] | ↑/→/↓ | [Team] |
| **High** | [N] | ↑/→/↓ | [Team] |
| **Medium** | [N] | ↑/→/↓ | [Team] |
| **Low** | [N] | ↑/→/↓ | [Team] |

---

## Recommendations by Priority

### CRITICAL (Ship-Blocking)

#### Rec R1.1: [Title]

**What**:
[What needs to be done to unblock shipping]

**Why**:
[Why this blocks shipping]

**How to Unblock**:
[Steps to resolve]

**Timeline**: [Estimated time to resolve]
**Effort**: [X-Y hours]
**Owner**: [Who should handle]
**Issue**: [GitHub issue #]

---

### HIGH (Should Be Done Before Ship)

#### Rec R1.2: [Title]

**What**:
[Description]

**Why**:
[Rationale]

**How to Resolve**:
[Steps]

**Timeline**: [Target]
**Effort**: [X-Y hours]
**Issue**: [GitHub issue #]

---

### MEDIUM (Can Ship With Plan)

#### Rec R1.3: [Title]

**What**:
[Description]

**Why**:
[Rationale]

**Timeline**: [Target]
**Effort**: [X-Y hours]
**Issue**: [GitHub issue #]

---

## Next Phase Planning

### Issues to Carry Forward

- [Issue #]: [Reason not completed]
- [Issue #]: [Reason not completed]

### New Issues Discovered

- [Issue]: [Description]
- [Issue]: [Description]

### Recommendations for Next Phase

1. [Recommendation]
2. [Recommendation]
3. [Recommendation]

---

## Team Performance

### Strengths

- [What the team did well]
- [Execution quality]
- [Collaboration]

### Opportunities

- [Where team can improve]
- [Skill gaps]
- [Process improvements]

### Resource Needs

- [Staffing needs]
- [Tool/infrastructure needs]
- [Training needs]

---

## Risk Assessment

### Identified Risks

| Risk | Likelihood | Impact | Status | Mitigation |
|------|------------|--------|--------|-----------|
| [Risk 1] | High/Med/Low | High/Med/Low | On Track / At Risk | [Plan] |
| [Risk 2] | High/Med/Low | High/Med/Low | On Track / At Risk | [Plan] |

### Mitigations in Place

- [Mitigation 1]
- [Mitigation 2]

---

## Comparison to Plan

### Planned vs. Actual

| Planned | Actual | Variance | Status |
|---------|--------|----------|--------|
| [X items] | [Y items] | [+/-Z] | [On track / Behind] |
| [X hours] | [Y hours] | [+/-Z] | [On track / Behind] |
| [Deadline] | [Likely date] | [+/-N days] | [On time / Late / Early] |

### What Went Differently

1. [What changed from plan]
   - Original assumption: [What we thought]
   - Actual result: [What happened]
   - Impact: [How this affected plan]

2. [Other variances]

---

## Related Documents

- **ROADMAP-OVERVIEW.md** — [Link to overall roadmap]
- **[Phase-specific plan].md** — [Link to current phase plan]
- **GITHUB-ISSUES-UPDATE.md** — [Current issues status]

---

## Appendices

### A. Detailed Epic Status

[Full status of each epic with breakdown of sub-items]

### B. Blocker Resolution History

[How previous blockers were resolved, lessons learned]

### C. Velocity Trends

[Charts or detailed data on team velocity over time]

---

**Review Status**: [DRAFT / COMPLETE / APPROVED]
**Approval Date**: [Date, if approved]
**Next Review**: [Estimated date for follow-up review]
**Shipping Decision**: [Ship / Hold / Ship with conditions]
