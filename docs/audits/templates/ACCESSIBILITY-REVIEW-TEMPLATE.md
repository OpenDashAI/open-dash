# Accessibility Review Template

**Review Type**: Accessibility
**Status**: Template (copy and fill in for each review)
**Based on**: UNIFIED-REVIEW-FRAMEWORK.md
**Standards**: WCAG 2.1 Level AA

---

## Review Metadata

| Field | Value |
|-------|-------|
| **Review ID** | [Accessibility Review #N] |
| **Date** | [YYYY-MM-DD] |
| **Scope** | [Codebase / Component / Feature / Epic / Phase] |
| **Phase** | [MVP / Phase 2 / Phase 3 / Phase 4+] |
| **Reviewer** | [Name] |
| **Duration** | [X hours] |
| **Previous Review** | [Link to prior accessibility review, if any] |

---

## Executive Summary

[1-2 paragraphs summarizing accessibility posture]

**Overall Score**: [1-5] ⭐
**Compliance Level**: [Non-compliant / Partial / Substantial / Full] WCAG 2.1 AA
**Critical Issues**: [Number]
**High Priority Issues**: [Number]
**Trend**: [Improving / Stable / Degrading]

---

## Assessment Scope

### What Was Reviewed

```
Focus Areas:
├─ Keyboard Navigation
├─ Screen Reader Compatibility
├─ Color Contrast & Visual Design
├─ Form Labels & Error Messages
├─ Focus Management
├─ ARIA Implementation
├─ Mobile Accessibility
├─ Document Structure (Semantic HTML)
└─ Alternative Text (Images)
```

### Components/Features Assessed

- [Component 1]: [Brief assessment]
- [Component 2]: [Brief assessment]
- [Feature 1]: [Brief assessment]

---

## Findings

### Strengths (What's Working Well)

1. **[Strength 1]**
   - Details
   - Impact on users

2. **[Strength 2]**
   - Details
   - Benefit

### Issues & Gaps (What Needs Attention)

1. **[Issue 1: Category]** (Priority: CRITICAL/HIGH/MEDIUM/LOW)
   - Location: [Component/page path]
   - Problem: [What's broken]
   - Impact: [Who's affected, how many users]
   - Severity: [Why this matters]
   - WCAG Criterion: [e.g., 2.1.1 Keyboard, 1.4.3 Contrast]

2. **[Issue 2]** (Priority: CRITICAL/HIGH/MEDIUM/LOW)
   - Location
   - Problem
   - Impact
   - Severity
   - WCAG Criterion

### Metrics

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Keyboard Navigation Coverage | [%] | 100% | ⚠️ |
| Screen Reader Issues | [#] | 0 | ⚠️ |
| Color Contrast Violations | [#] | 0 | ✅ |
| Missing Alt Text | [#] | 0 | ⚠️ |
| Form Label Issues | [#] | 0 | ✅ |
| ARIA Misuse | [#] | 0 | ⚠️ |
| Focus Indicators Missing | [#] | 0 | ⚠️ |
| Overall WCAG AA Compliance | [%] | 100% | ⚠️ |

---

## Recommendations by Priority

### CRITICAL (MVP Blocking / Launch Blocking)

#### Rec A1.1: [Title]

**What**:
[Clear description of what needs to be fixed]

**Why**:
[Why this is critical - legal, user impact, compliance]

**How to Know It's Done**:
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

**Implementation Notes**:
[Technical guidance]

**Timeline**: [Target week/phase]
**Effort**: [X-Y hours]
**Issue**: [GitHub issue #]

---

### HIGH (Phase 2+ / Next Milestone)

#### Rec A1.2: [Title]

**What**:
[Description]

**Why**:
[Rationale]

**How to Know It's Done**:
- [ ] Criterion 1
- [ ] Criterion 2

**Implementation Notes**:
[Technical guidance]

**Timeline**: [Target]
**Effort**: [X-Y hours]
**Issue**: [GitHub issue #]

---

### MEDIUM (Nice-to-Have / Current Phase if Capacity)

#### Rec A1.3: [Title]

**What**:
[Description]

**Why**:
[Rationale]

**Timeline**: [Target]
**Effort**: [X-Y hours]
**Issue**: [GitHub issue #]

---

### LOW (Future / Post-Launch)

#### Rec A1.4: [Title]

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

- [Automated tool 1]: [Version/findings]
- [Automated tool 2]: [Version/findings]
- Manual testing: [Scope]
- Screen reader testing: [NVDA/JAWS/VoiceOver]
- Keyboard-only testing: [Scope]

### Test Cases

1. **Keyboard-Only Navigation**
   - Start: [Entry point]
   - Expected: [All interactive elements reachable]
   - Actual: [Results]
   - Status: ✅ / ⚠️

2. **Screen Reader Testing**
   - Tool: [Name]
   - Scope: [Areas tested]
   - Expected: [Content announced correctly]
   - Actual: [Results]
   - Status: ✅ / ⚠️

3. **Color Contrast Verification**
   - Tool: [Name]
   - Violations: [#]
   - Status: ✅ / ⚠️

---

## Recommendations Summary Table

| Rec | Title | Priority | Effort | Phase | Status |
|-----|-------|----------|--------|-------|--------|
| A1.1 | [Title] | CRITICAL | X-Yh | [Phase] | PROPOSED |
| A1.2 | [Title] | HIGH | X-Yh | [Phase] | PROPOSED |
| A1.3 | [Title] | MEDIUM | X-Yh | [Phase] | PROPOSED |
| A1.4 | [Title] | LOW | X-Yh | [Phase] | PROPOSED |

**Total Effort**: [X-Y hours]
**Current Phase Work**: [A hours]
**Phase 2+ Work**: [B hours]

---

## Compliance Status

### WCAG 2.1 Level AA Coverage

| Guideline | Status | Notes |
|-----------|--------|-------|
| 1.1 Text Alternatives | ⚠️ Partial | [Details] |
| 1.3 Adaptable | ✅ Full | [Details] |
| 1.4 Distinguishable | ⚠️ Partial | [Details] |
| 2.1 Keyboard Accessible | ⚠️ Partial | [Details] |
| 2.2 Enough Time | ✅ Full | [Details] |
| 2.3 Seizures | ✅ Full | [Details] |
| 2.4 Navigable | ⚠️ Partial | [Details] |
| 2.5 Input Modalities | ✅ Full | [Details] |
| 3.1 Readable | ✅ Full | [Details] |
| 3.2 Predictable | ✅ Full | [Details] |
| 3.3 Input Assistance | ⚠️ Partial | [Details] |
| 4.1 Compatible | ⚠️ Partial | [Details] |

**Overall Compliance**: [% of WCAG 2.1 AA met]

---

## Impact Assessment

### User Groups Affected

- **Screen Reader Users**: [Details]
- **Keyboard-Only Users**: [Details]
- **Low Vision Users**: [Details]
- **Color-Blind Users**: [Details]
- **Motor Impairment Users**: [Details]
- **Cognitive Impairment Users**: [Details]

### Business Impact

- Legal risk: [Assessment]
- User acquisition impact: [Assessment]
- Retention impact: [Assessment]
- Compliance cost: [If not addressed]

---

## Team Assessment

- **Accessibility Expertise**: [Level]
- **Testing Capability**: [Current state]
- **Training Needs**: [What's needed]
- **Tool Adoption**: [What's needed]

---

## Next Steps

1. **This Week**: [Action items]
2. **Next Phase**: [Forward-looking items]
3. **Ongoing**: [Maintenance items]

---

## Related Documents

- **ACCESSIBILITY-AUDIT.md** — [If prior audit exists]
- **WCAG-COMPLIANCE-CHECKLIST.md** — [If exists]
- **ACCESSIBILITY-ROADMAP.md** — [If accessibility has dedicated roadmap]

---

## Appendices

### A. Detailed Findings

[Full details of each issue with screenshots, code examples, etc.]

### B. Testing Reports

[Automated testing reports, manual testing notes, etc.]

### C. References

- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/
- ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/
- WebAIM: https://webaim.org/

---

**Review Status**: [DRAFT / COMPLETE / APPROVED]
**Approval Date**: [Date, if approved]
**Next Review**: [Estimated date for follow-up review]
