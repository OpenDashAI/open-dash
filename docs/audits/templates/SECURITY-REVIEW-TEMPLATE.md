# Security Review Template

**Review Type**: Security
**Status**: Template (copy and fill in for each review)
**Based on**: UNIFIED-REVIEW-FRAMEWORK.md
**Standards**: OWASP Top 10, CWE, Industry Best Practices

---

## Review Metadata

| Field | Value |
|-------|-------|
| **Review ID** | [Security Review #N] |
| **Date** | [YYYY-MM-DD] |
| **Scope** | [Codebase / Component / Feature / Epic / Phase] |
| **Phase** | [MVP / Phase 2 / Phase 3 / Phase 4+] |
| **Reviewer** | [Security Lead / Auditor] |
| **Duration** | [X hours] |
| **Testing Type** | [Code Review / Penetration Test / Vulnerability Scan / Manual Test] |
| **Previous Review** | [Link to prior security review, if any] |

---

## Executive Summary

[1-2 paragraphs summarizing security posture]

**Overall Security Score**: [1-5] ⭐
**Compliance Status**: [Non-compliant / Partial / Substantial / Full]
**Critical Vulnerabilities**: [Number]
**High Severity Issues**: [Number]
**Risk Level**: [Critical / High / Medium / Low]

---

## Assessment Scope

### Security Domains Reviewed

```
Security Dimensions:
├─ Authentication & Authorization
├─ Data Protection (Encryption, PII)
├─ API Security (Rate limiting, validation)
├─ Injection Attacks (SQL, XSS, Command)
├─ CSRF & CORS
├─ Dependency Vulnerabilities
├─ Secrets Management
├─ Logging & Monitoring
├─ Session Management
├─ Infrastructure Security
└─ Incident Response
```

### Components/Features Assessed

- [Component 1]: [Security stance]
- [Component 2]: [Security stance]
- [Feature 1]: [Security stance]

---

## Findings

### Strengths (Security Best Practices In Place)

1. **[Strength 1: Authentication]**
   - Details: [Implementation detail]
   - Impact: [Security benefit]

2. **[Strength 2: Data Protection]**
   - Details
   - Impact

### Vulnerabilities & Gaps (OWASP Top 10 Mapping)

1. **[Vulnerability 1: Category]** (Severity: CRITICAL/HIGH/MEDIUM/LOW)
   - OWASP Mapping: [A01:2021-Broken Access Control / etc.]
   - CWE: [CWE number if applicable]
   - Location: [Code path, component]
   - Description: [What's vulnerable, why]
   - Attack Vector: [How it could be exploited]
   - Impact: [If exploited, what happens]
   - Affected Users: [Who's at risk]
   - Proof of Concept: [If applicable, high-level description]

2. **[Vulnerability 2]** (Severity: HIGH/MEDIUM)
   - OWASP Mapping
   - CWE
   - Location
   - Description
   - Attack Vector
   - Impact
   - Affected Users

### Metrics

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Known Vulnerabilities | [#] | 0 | ⚠️ |
| Outdated Dependencies | [#] | 0 | ⚠️ |
| Secrets in Code | [#] | 0 | ⚠️ |
| Missing Input Validation | [#] | 0 | ⚠️ |
| Unencrypted Data Transit | [#] | 0 | ✅ |
| Unencrypted Data Storage | [#] | 0 | ✅ |
| Hardcoded Credentials | [#] | 0 | ⚠️ |
| Missing Rate Limiting | [#] | 0 | ⚠️ |
| HTTPS Coverage | [%] | 100% | ✅/⚠️ |
| Security Headers | [#/7] | 7 | ⚠️ |

---

## Authentication & Authorization

### Current Implementation

- **Method**: [OAuth / JWT / Session-based / Other]
- **Provider**: [Clerk / Auth0 / Custom / Other]
- **Token Type**: [Bearer / Cookie / Other]
- **Refresh Strategy**: [How tokens refresh]

### Vulnerabilities Found

1. **[Auth Issue 1]** (Severity: CRITICAL/HIGH)
   - Problem: [What's broken]
   - Impact: [Unauthorized access, privilege escalation, etc.]
   - Fix: [What to do]

### Auth Checklist

- [ ] Passwords hashed (bcrypt/argon2)
- [ ] TLS/HTTPS enforced
- [ ] Token expiration configured
- [ ] Refresh token rotation implemented
- [ ] Password strength requirements enforced
- [ ] Account lockout after failed attempts
- [ ] MFA available (if sensitive data)
- [ ] Session timeout configured
- [ ] CORS properly configured

---

## Data Protection

### Encryption in Transit

- HTTPS enforced: [Yes / Partial / No]
- TLS version: [1.2+ / Older]
- Certificate: [Self-signed / Let's Encrypt / CA]
- Status: ✅ / ⚠️

### Encryption at Rest

- Database encryption: [Yes / No]
- Sensitive field encryption: [Yes / No / Partial]
- Backup encryption: [Yes / No]
- Status: ✅ / ⚠️

### Data Classification

| Data Type | Sensitivity | Protection | Status |
|-----------|-------------|-----------|--------|
| User IDs | Low | None needed | ✅ |
| Email Addresses | Medium | Encrypted | ⚠️ |
| Passwords | Critical | Hashed+Salt | ✅ |
| API Keys | Critical | Encrypted | ✅ |
| Payment Info | Critical | PCI-DSS | ✅ |

---

## Dependency Vulnerabilities

### Scanning Results

**Tool**: [npm audit / Snyk / Dependabot]
**Last Scan**: [Date]
**Status**: [# critical, # high, # medium, # low]

### Critical Vulnerabilities

| Package | Version | Vulnerability | Severity | Status |
|---------|---------|---|---|---|
| [Pkg 1] | [V] | [CVE/CWE] | CRITICAL | Needs Fix |
| [Pkg 2] | [V] | [CVE/CWE] | CRITICAL | Patched |

### Remediation Plan

- [Vulnerability 1]: Update to [version] by [date]
- [Vulnerability 2]: Workaround until [target version] available

---

## Input Validation & Injection Prevention

### Current Implementation

- Input sanitization: [Implemented / Partial / Missing]
- SQL injection prevention: [Parameterized queries / ORM]
- XSS prevention: [CSP / Output encoding / Both]
- Command injection prevention: [Yes / Partial / No]

### Vulnerabilities Found

1. **[Injection Issue 1]** (Severity: HIGH)
   - Location: [Endpoint/component]
   - Problem: [Unvalidated user input]
   - Impact: [Data breach / RCE / etc.]

### Validation Checklist

- [ ] All user inputs validated
- [ ] Parameterized queries used
- [ ] Output properly encoded
- [ ] CSP header configured
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented
- [ ] File upload validation
- [ ] API input schema enforced

---

## API Security

### Rate Limiting

- Status: [Implemented / Partial / Missing]
- Limits: [Req/min by auth status]
- Enforcement: [Cloudflare / App / Database]

### API Authentication

- All endpoints require auth: [Yes / No / Partial]
- Token validation: [Yes / No]
- Scope enforcement: [Yes / No]

### CORS Configuration

```
Allowed Origins: [List]
Allowed Methods: [GET/POST/etc]
Credentials Allowed: [Yes / No]
Status: ✅ / ⚠️
```

---

## Secrets Management

### Current Approach

- Environment variables: [Yes / No]
- Secrets management service: [None / Cloudflare / Doppler / Other]
- Secrets in code: [0 / N] issues found
- Secrets in logs: [0 / N] issues found

### Vulnerabilities

- [Secret exposure in git history]
- [Hardcoded API keys]
- [Exposed in error messages]

### Remediation

- [ ] Scan git history (git-secrets / truffleHog)
- [ ] Rotate all exposed secrets
- [ ] Update .gitignore
- [ ] Implement pre-commit hooks

---

## Logging & Monitoring

### Logging Implemented

- Authentication events: [Yes / No]
- Authorization failures: [Yes / No]
- Data access: [Yes / No]
- Error conditions: [Yes / No]
- Status: ✅ / ⚠️

### Log Security

- Sensitive data in logs: [0 / N] instances
- Log retention: [X days]
- Log access control: [Restricted / Open]
- Status: ⚠️ / ✅

### Security Monitoring

- Intrusion detection: [Yes / No]
- Anomaly detection: [Yes / No]
- Alert thresholds: [Configured / Not set]
- Incident response playbook: [Documented / Missing]

---

## Recommendations by Priority

### CRITICAL (Security Breach Risk / Launch Blocking)

#### Rec S1.1: [Title]

**What**:
[Clear description of security fix needed]

**Why**:
[Why this is critical - compliance, breach risk]

**Attack Scenario**:
[How this could be exploited]

**How to Know It's Done**:
- [ ] Vulnerability eliminated
- [ ] Test case confirms fix
- [ ] Vulnerability rescanned to verify

**Implementation Notes**:
[Technical approach]

**Timeline**: [Target week/phase]
**Effort**: [X-Y hours]
**Issue**: [GitHub issue #]

---

### HIGH (Significant Risk / Phase 2+)

#### Rec S1.2: [Title]

**What**:
[Description]

**Why**:
[Rationale with risk assessment]

**How to Know It's Done**:
- [ ] Criterion 1
- [ ] Criterion 2

**Implementation Notes**:
[Technical guidance]

**Timeline**: [Target]
**Effort**: [X-Y hours]
**Issue**: [GitHub issue #]

---

### MEDIUM (Good Practice / Current Phase if Capacity)

#### Rec S1.3: [Title]

**What**:
[Description]

**Why**:
[Rationale]

**Timeline**: [Target]
**Effort**: [X-Y hours]
**Issue**: [GitHub issue #]

---

### LOW (Defense in Depth / Post-Launch)

#### Rec S1.4: [Title]

**What**:
[Description]

**Why**:
[Rationale]

**Timeline**: [Target]
**Effort**: [X-Y hours]
**Issue**: [GitHub issue #]

---

## Compliance Assessment

### Standards Applicable

| Standard | Status | Notes |
|----------|--------|-------|
| OWASP Top 10 | [Compliant / Partial / Non-compliant] | [Details] |
| CWE | [X critical issues] | [Link to CWE list] |
| GDPR (if EU users) | [Compliant / Partial / Non-compliant] | [Details] |
| SOC 2 (if enterprise) | [Compliant / Partial / Non-compliant] | [Details] |

---

## Testing Methodology

### Tools Used

- **SAST** (Static Analysis): [Tool / Version / Findings]
- **DAST** (Dynamic Analysis): [Tool / Version / Findings]
- **Dependency Scanning**: [Tool / Version / Findings]
- **Manual Code Review**: [Scope / Findings]
- **Penetration Testing**: [Scope / Findings]

### Test Coverage

- **Authentication**: [Tested / Not tested]
- **Authorization**: [Tested / Not tested]
- **Data Protection**: [Tested / Not tested]
- **Input Validation**: [Tested / Not tested]
- **API Security**: [Tested / Not tested]

---

## Recommendations Summary Table

| Rec | Title | Priority | Effort | Phase | Status |
|-----|-------|----------|--------|-------|--------|
| S1.1 | [Title] | CRITICAL | X-Yh | [Phase] | PROPOSED |
| S1.2 | [Title] | HIGH | X-Yh | [Phase] | PROPOSED |
| S1.3 | [Title] | MEDIUM | X-Yh | [Phase] | PROPOSED |
| S1.4 | [Title] | LOW | X-Yh | [Phase] | PROPOSED |

**Total Effort**: [X-Y hours]

---

## Team Assessment

- **Security Expertise**: [Level]
- **Secure Coding Practices**: [Level]
- **Threat Modeling Capability**: [Level]
- **Training Needs**: [What's needed]

---

## Incident Response

### Response Plan Status

- [ ] Incident response team assigned
- [ ] Escalation procedure documented
- [ ] Communication protocol established
- [ ] Legal/compliance notified
- [ ] Customer notification process defined

### Historical Incidents

[If any, document how they were handled]

---

## Next Steps

1. **This Week**: [Critical remediation items]
2. **Next Phase**: [High priority items]
3. **Ongoing**: [Monitoring and maintenance]

---

## Related Documents

- **SECURITY-ROADMAP.md** — [If security has dedicated roadmap]
- **INCIDENT-RESPONSE-PLAN.md** — [If exists]

---

## Appendices

### A. Vulnerability Details

[Full write-up of each vulnerability]

### B. Scan Reports

[SAST/DAST/dependency scan outputs]

### C. Threat Model

[Security threat model if applicable]

---

**Review Status**: [DRAFT / COMPLETE / APPROVED]
**Approval Date**: [Date, if approved]
**Next Review**: [Estimated date for follow-up review]
**Last Security Test**: [Date]
**Next Penetration Test**: [Scheduled date]
