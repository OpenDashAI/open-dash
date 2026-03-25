# OpenDash Deployment Standard Procedure (DSP)

**Version**: 1.0
**Type**: Infrastructure as Code (IaC) Pattern
**Scope**: Deployment automation, testing, validation
**Frequency**: Weekly (potentially daily)
**Owner**: DevOps Lead
**Last Updated**: 2026-03-25

---

## Overview

This document formalizes the OpenDash deployment process as a repeatable, standardized procedure. It defines:

- **Phases**: 5-phase deployment lifecycle
- **Automation**: Infrastructure as code (shell scripts, GitHub workflows)
- **Validation**: Automated testing and verification
- **Monitoring**: Health checks and metrics
- **Rollback**: Automated recovery procedures

The procedure is designed to be **idempotent** (safe to run multiple times) and **automated** (minimal manual intervention).

---

## Deployment Phases

```
┌─────────────────────────────────────────────────────────────┐
│                   DEPLOYMENT LIFECYCLE                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Phase 1: Pre-Deployment Verification (Day 0)             │
│  ├─ Code quality checks (automated)                        │
│  ├─ Performance baseline (automated)                       │
│  ├─ Security validation (automated)                        │
│  └─ Team readiness (manual approval)                       │
│                                                              │
│  Phase 2: Staging Deployment (Day 1)                       │
│  ├─ Configure staging environment (automated)              │
│  ├─ Deploy to staging (automated)                          │
│  ├─ Apply database migrations (automated)                  │
│  └─ Run load tests (automated, requires interpretation)    │
│                                                              │
│  Phase 3: Final Validation (Day 2)                         │
│  ├─ Production environment verification (automated)        │
│  ├─ Infrastructure validation (automated)                  │
│  ├─ Team training (manual)                                 │
│  └─ Go/No-Go decision (manual approval)                    │
│                                                              │
│  Phase 4: Production Deployment (Day 3)                    │
│  ├─ Production deployment (automated)                      │
│  ├─ Health check verification (automated)                  │
│  └─ Initial monitoring (automated alerts)                  │
│                                                              │
│  Phase 5: Post-Deployment Monitoring (Week 1)             │
│  ├─ Metrics collection (automated)                         │
│  ├─ Error tracking (automated)                             │
│  ├─ Daily reports (automated)                              │
│  └─ Incident response (manual)                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Pre-Deployment Verification

**Timeline**: 1 day (usually day 0 before deployment)
**Automation**: 90% automated
**Owner**: CI/CD Pipeline + Code Review

### Automated Checks

```bash
# 1. Code Quality
npm test                          # Run all tests
npm run lint                      # Check linting
npm run format -- --check        # Check formatting

# 2. Build Verification
npm run build                     # Verify build succeeds
# Capture: Build time, bundle size

# 3. Security Validation
# Check for known vulnerabilities
npm audit --audit-level=moderate

# 4. Performance Baseline
npm run test:startup             # Startup time test
npm run test:performance        # Performance benchmarks
```

### Expected Output

```
✅ 564/564 tests passing
✅ Build time: 3.83 seconds
✅ Request latency: 13.5ms
✅ Zero critical security issues
✅ No console errors on startup
```

### Success Criteria

- [x] All tests passing (564/564)
- [x] No critical issues
- [x] Build time <5 seconds
- [x] Startup latency <1000ms
- [x] Security audit clean

### Manual Approval Gate

```
Decision Required:
- Code review approved? ✓
- All tests passing? ✓
- Performance acceptable? ✓
- Team ready? ✓
```

---

## Phase 2: Staging Deployment

**Timeline**: 1 day
**Automation**: 80% automated
**Owner**: DevOps Lead + Backend Engineer

### Infrastructure Setup

```bash
# Configure staging environment
./deploy/setup-staging-env.sh

# What it does:
# 1. Configure Cloudflare Access policies
# 2. Set up staging secrets from secure storage
# 3. Configure monitoring and alerts
# 4. Set up database backups
```

### Deployment Script

```bash
# Deploy to staging
./deploy/deploy-staging.sh --env staging

# What it does:
# 1. Run final tests
# 2. Build optimized bundle
# 3. Deploy to Cloudflare Workers
# 4. Run smoke tests against staging
# 5. Verify all endpoints responding
```

### Database Migration

```bash
# Apply migrations to staging D1
./deploy/migrate-database.sh --env staging --target staging

# What it does:
# 1. Backup current database
# 2. Apply pending migrations
# 3. Verify schema matches expected
# 4. Seed sample data
# 5. Run database validation tests
```

### Load Testing

```bash
# Run load tests
./deploy/load-test.sh --env staging --vus 50

# Expected results:
# - Error rate: <1%
# - Dashboard latency: <500ms p95
# - API latency: <200ms p95
# - No database timeouts
```

### Success Criteria

- [x] Staging deployment successful
- [x] All endpoints responding
- [x] Database migrations applied
- [x] Load tests passed
- [x] Sample data seeded

---

## Phase 3: Final Validation

**Timeline**: 1 day
**Automation**: 70% automated
**Owner**: DevOps Lead + Product Manager

### Production Environment Validation

```bash
# Validate production environment readiness
./deploy/validate-production.sh

# Checks:
# - DNS records correct
# - SSL certificates valid
# - Secrets configured
# - Monitoring ready
# - Backups configured
# - Rollback procedure tested
```

### Infrastructure Verification

```bash
# Verify all infrastructure components
./deploy/verify-infrastructure.sh

# Checks:
# - Cloudflare Workers configuration
# - D1 database connection
# - Durable Objects configured
# - Rate limiting rules set
# - Access policies ready
```

### Team Readiness

```bash
# Team training and sign-off
./deploy/team-training.sh

# Includes:
# - Dashboard walkthrough
# - Monitoring setup explanation
# - Incident response procedures
# - Q&A and confirmations
```

### Go/No-Go Decision

```
GATE DECISION: GO or NO-GO
├─ Load test results acceptable? ✓
├─ Infrastructure ready? ✓
├─ Team confident? ✓
├─ All issues resolved? ✓
└─ DECISION: → GO FOR LAUNCH
```

### Success Criteria

- [x] Production environment ready
- [x] Team trained and confident
- [x] Incident response plan confirmed
- [x] Rollback procedure tested
- [x] Go/No-Go decision: GO

---

## Phase 4: Production Deployment

**Timeline**: 1-2 hours
**Automation**: 95% automated
**Owner**: DevOps Lead (on-call support)

### Pre-Launch (6am-8am)

```bash
# Pre-deployment verification
./deploy/pre-launch-check.sh

# Verifications:
# - All tests passing
# - Build successful
# - Secrets configured
# - Team ready
```

### Deployment (8am)

```bash
# Execute production deployment
./deploy/deploy-production.sh --env production

# What it does:
# 1. Create deployment backup
# 2. Build optimized bundle
# 3. Deploy to Cloudflare Workers
# 4. Run smoke tests
# 5. Verify health endpoints
# 6. Confirm all systems operational
```

### Verification (8:30am)

```bash
# Verify deployment success
./deploy/post-deployment-check.sh

# Verifications:
# - Application responding
# - All APIs functional
# - Database accessible
# - Monitoring active
# - Error rate <1%
```

### Success Criteria

- [x] Deployment completed
- [x] All endpoints responding
- [x] Error rate <1%
- [x] Performance targets met
- [x] Team confident

### Rollback Procedure (If Needed)

```bash
# Automated rollback if critical issues
./deploy/rollback.sh --previous-version <commit-hash>

# What it does:
# 1. Identify previous stable version
# 2. Revert to previous deployment
# 3. Verify rollback complete
# 4. Alert team
# 5. Start investigation
```

---

## Phase 5: Post-Deployment Monitoring

**Timeline**: Week 1 and beyond
**Automation**: 85% automated
**Owner**: On-Call Engineer

### Continuous Monitoring

```bash
# Start monitoring suite
./deploy/monitoring-start.sh

# Monitors:
# - Error rate (alert if >5%)
# - API latency (alert if >500ms)
# - Database performance
# - Worker cold starts
# - External API status
```

### Metrics Collection

```bash
# Collect and analyze metrics
./deploy/metrics-collect.sh --interval hourly

# Metrics captured:
# - Request volume
# - Error rate
# - Latency distribution (p50, p95, p99)
# - Database query times
# - Memory usage
```

### Daily Reports

```bash
# Generate daily report
./deploy/daily-report.sh --date $(date +%Y-%m-%d)

# Report includes:
# - Key metrics summary
# - Error analysis
# - Performance trends
# - Issues identified
# - Recommendations
```

### Incident Response

```bash
# If alert triggered, start investigation
./deploy/incident-start.sh --alert-name <alert>

# Captures:
# - Current state logs
# - Metrics at time of incident
# - Recent changes
# - Suggested fixes
```

---

## Automation Scripts

### Script Architecture

```
deploy/
├── setup-staging-env.sh         # Phase 2: Setup
├── deploy-staging.sh            # Phase 2: Deploy
├── migrate-database.sh          # Phase 2: Migrations
├── load-test.sh                 # Phase 2: Load testing
├── validate-production.sh       # Phase 3: Validation
├── verify-infrastructure.sh     # Phase 3: Infrastructure
├── team-training.sh             # Phase 3: Training
├── pre-launch-check.sh          # Phase 4: Pre-launch
├── deploy-production.sh         # Phase 4: Production
├── post-deployment-check.sh     # Phase 4: Verification
├── rollback.sh                  # Phase 4: Rollback
├── monitoring-start.sh          # Phase 5: Monitoring
├── metrics-collect.sh           # Phase 5: Metrics
├── daily-report.sh              # Phase 5: Reporting
├── incident-start.sh            # Phase 5: Incident response
└── lib/
    ├── config.sh                # Configuration
    ├── logging.sh               # Logging utilities
    ├── health-checks.sh         # Health check functions
    ├── metrics.sh               # Metrics utilities
    └── notifications.sh         # Alert notifications
```

### Script Template

```bash
#!/bin/bash

##
# deploy-production.sh
# Deploy OpenDash to production environment
#
# Usage: ./deploy-production.sh [--env ENVIRONMENT]
##

set -euo pipefail

# Source utilities
source "$(dirname "$0")/lib/config.sh"
source "$(dirname "$0")/lib/logging.sh"
source "$(dirname "$0")/lib/health-checks.sh"

# Configuration
ENVIRONMENT="${1:-production}"
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
DEPLOYMENT_ID="deploy_${TIMESTAMP}"

# Main deployment logic
main() {
    log_info "Starting deployment: $DEPLOYMENT_ID"

    # Phase 1: Verify environment
    log_step "1. Verifying environment..."
    verify_environment "$ENVIRONMENT"

    # Phase 2: Build
    log_step "2. Building application..."
    build_application

    # Phase 3: Deploy
    log_step "3. Deploying to Cloudflare..."
    deploy_to_cloudflare "$ENVIRONMENT"

    # Phase 4: Verify
    log_step "4. Verifying deployment..."
    verify_deployment "$ENVIRONMENT"

    log_success "Deployment completed: $DEPLOYMENT_ID"
}

# Run main function
main "$@"
```

---

## Testing Strategy

### Automated Test Suite

```
Test Levels (by phase):

Phase 1 (Pre-Deployment):
├─ Unit tests (564 tests)
├─ Integration tests
├─ Security tests
└─ Performance tests

Phase 2 (Staging):
├─ Smoke tests (5 VUs, 30s)
├─ Load tests (50 VUs, 60s)
├─ Peak load tests (100 VUs, 120s)
└─ API validation tests

Phase 3 (Validation):
├─ Production readiness checks
├─ Infrastructure validation
└─ Endpoint verification

Phase 4 (Production):
├─ Health checks
├─ Smoke tests
└─ Error rate monitoring

Phase 5 (Post-Launch):
├─ Continuous health checks
├─ Error tracking
└─ Performance monitoring
```

### Test Commands

```bash
# Pre-deployment
npm test                              # All tests
npm run test:startup                 # Startup time
npm run test:performance             # Performance baseline

# Staging
k6 run load-test.js --vus 50        # Load test
./deploy/smoke-test.sh               # Smoke test

# Production
./deploy/health-check.sh             # Health endpoints
./deploy/error-check.sh              # Error rate monitoring
```

---

## Monitoring & Alerting

### Key Metrics

```
Critical Metrics (alert if threshold exceeded):
├─ Error Rate: >5% (critical), >2% (warning)
├─ API Latency: >500ms p95 (critical), >300ms (warning)
├─ Dashboard Load: >1000ms (critical), >750ms (warning)
├─ Worker Cold Start: >2000ms (critical)
└─ Database Queries: >200ms avg (warning)

Performance Metrics (track but don't alert):
├─ Request volume (per minute)
├─ Latency distribution (p50, p95, p99)
├─ Memory usage
├─ CPU usage
└─ Database connections
```

### Alerting Configuration

```yaml
# alerts.yaml
alerts:
  - name: "HighErrorRate"
    condition: "error_rate > 0.05"
    severity: "critical"
    action: "page_oncall"

  - name: "HighLatency"
    condition: "api_latency_p95 > 500"
    severity: "warning"
    action: "slack_notification"

  - name: "DeploymentFailure"
    condition: "deployment_status == failed"
    severity: "critical"
    action: "page_oncall_and_slack"
```

---

## Rollback Procedure

### Automated Rollback

```bash
# If critical issue detected during deployment
./deploy/rollback.sh --version <previous-stable>

# Automatic triggers:
# - Error rate >10% for 5 minutes
# - All health checks failing
# - Critical alerts triggered
# - Manual decision during deployment
```

### Manual Rollback

```bash
# Initiated by on-call engineer
./deploy/rollback.sh --manual --reason "Critical bug found"

# Steps:
# 1. Alert team
# 2. Identify last stable version
# 3. Revert code
# 4. Redeploy
# 5. Verify rollback
# 6. Start investigation
```

---

## Frequency & Scheduling

### Weekly Deployment (Standard)

```
Monday: Pre-deployment verification
Tuesday-Wednesday: Staging deployment & testing
Thursday: Final validation & training
Friday: Production deployment & monitoring
Weekend: Monitoring & on-call
```

### Daily Deployment (CI/CD Mode)

```
Each commit:
├─ Run all tests (automated)
├─ Check code quality (automated)
└─ If all pass:
   ├─ Auto-deploy to staging
   ├─ Run load tests
   └─ If all pass: ready for production
```

### Configuration

```yaml
# .github/workflows/deployment.yml
deployment:
  triggers:
    - push to main (auto-staging)
    - manual trigger (production)
    - scheduled (weekly Friday 8am)

  notifications:
    - Slack: deployment status
    - Email: daily metrics report
    - PagerDuty: critical alerts
```

---

## Documentation Requirements

### Per Deployment

```
- Deployment log (timestamp, changes, results)
- Metrics summary (build time, latency, errors)
- Issues encountered (if any)
- Resolution steps taken
- Team sign-off
```

### Weekly Summary

```
- All deployments this week
- Total uptime percentage
- Incidents and resolutions
- Performance trends
- Team feedback
- Lessons learned
```

---

## Success Metrics

### Deployment Success

```
Criteria:
✓ Build time <5 seconds
✓ Deployment time <30 minutes
✓ Error rate <1% after deployment
✓ All tests passing
✓ No critical issues
```

### Operational Success (Week 1)

```
Criteria:
✓ Uptime >99%
✓ Error rate <1%
✓ Latency targets maintained
✓ No unplanned incidents
✓ Team confident in operations
```

---

## Training & Runbooks

### Team Training

Every deployment requires:
- 30-minute dashboard walkthrough
- 15-minute incident response training
- 15-minute Q&A session

### On-Call Runbook

Procedures for:
- Monitoring active deployments
- Responding to alerts
- Executing rollback
- Escalation path
- Communication procedures

---

## Continuous Improvement

### Metrics to Track

- Deployment success rate
- Time to deployment
- Post-deployment issues
- Team confidence score
- Process adherence

### Review Cycle

- **Daily**: Issues encountered
- **Weekly**: Deployment summary
- **Monthly**: Process improvements
- **Quarterly**: Architectural review

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-25 | Initial standard procedure |

---

## References

- DEPLOYMENT-READY.md - Step-by-step deployment guide
- LOAD-TESTING-GUIDE.md - Load testing procedures
- DEPLOYMENT-CHECKLIST.md - Pre-launch checklist
- GitHub Issues: #98-#104 - Specific deployment tasks

---

**Status**: 🟢 OPERATIONAL
**Last Verified**: 2026-03-25
**Next Review**: 2026-04-01
