# OpenDash Deployment Automation

Infrastructure as Code (IaC) deployment automation for OpenDash. Enables repeatable, weekly (or daily) deployments with minimal manual intervention.

## Quick Start

### Prerequisites

```bash
# Install Wrangler CLI
npm install -g @cloudflare/wrangler

# Install k6 for load testing (optional)
curl https://get.k6.io | sh
```

### One-Command Deployment

```bash
# Full deployment workflow (Phase 1-4)
./pre-launch-check.sh --env production && \
./deploy-production.sh --env production && \
./post-deployment-check.sh --env production
```

## Directory Structure

```
deploy/
├── lib/                           # Shared utilities
│   ├── config.sh                 # Configuration & environment loading
│   ├── logging.sh                # Structured logging
│   ├── health-checks.sh          # Health verification
│   ├── metrics.sh                # Metrics collection
│   └── notifications.sh          # Alerting & notifications
│
├── pre-launch-check.sh           # Phase 4: Pre-deployment verification
├── deploy-production.sh          # Phase 4: Production deployment
├── post-deployment-check.sh      # Phase 4: Verification after deployment
├── rollback.sh                   # Phase 4: Emergency rollback
│
├── monitoring-start.sh           # Phase 5: Activate monitoring
├── metrics-collect.sh            # Phase 5: Collect metrics
├── daily-report.sh               # Phase 5: Generate daily report
│
├── logs/                         # Deployment logs (auto-created)
├── metrics/                      # Metrics storage (auto-created)
├── reports/                      # Generated reports (auto-created)
├── backups/                      # Deployment backups (auto-created)
└── README.md                     # This file
```

## Deployment Scripts

### Pre-Deployment Verification
Runs all checks before deployment is authorized.

```bash
./pre-launch-check.sh --env production
```

**Verifies:**
- Build completes successfully
- All tests passing (564/564)
- Environment variables configured
- Secrets are set
- Database migrations are valid
- Cloudflare configuration ready

### Production Deployment
Executes the production deployment.

```bash
./deploy-production.sh --env production
```

**Performs:**
1. Creates deployment backup
2. Builds the application
3. Verifies build output
4. Deploys to Cloudflare Workers
5. Runs health checks
6. Executes smoke tests

### Post-Deployment Verification
Confirms deployment success and gathers baseline metrics.

```bash
./post-deployment-check.sh --env production --url https://opendash.app
```

**Checks:**
- Application is responding
- All API endpoints working
- Database connectivity
- Performance baseline
- Error rates normal

### Emergency Rollback
Reverts to previous stable version if critical issues occur.

```bash
# Rollback to previous commit
./rollback.sh

# Rollback to specific version
./rollback.sh --version abc123def456 --reason "Critical bug found"
```

**Actions:**
1. Identifies previous stable version
2. Checks out that version
3. Builds application
4. Deploys to Cloudflare
5. Verifies health checks

### Monitoring Activation
Starts monitoring suite for post-deployment observation.

```bash
./monitoring-start.sh --env production
```

**Activates:**
- Error rate monitoring
- Latency monitoring
- Database monitoring
- Worker cold start monitoring
- External API monitoring
- Metrics collection
- Alert channels

### Metrics Collection
Collects and analyzes deployment metrics.

```bash
# Hourly metrics collection
./metrics-collect.sh --interval hourly

# Daily metrics collection
./metrics-collect.sh --interval daily

# Save to specific file
./metrics-collect.sh --output metrics.json
```

### Daily Report
Generates daily summary of deployment health.

```bash
# Report for today
./daily-report.sh

# Report for specific date
./daily-report.sh --date 2026-03-25
```

## Configuration

All configuration is centralized in `lib/config.sh`.

### Environment Variables

```bash
# Application
ENVIRONMENT=production      # Environment: staging, production
APP_NAME=opendash          # Application name
BUILD_DIR=./dist           # Build output directory
MIGRATIONS_DIR=./migrations # Database migrations directory

# Database
D1_DATABASE_ID=xxxx        # Cloudflare D1 database ID
D1_BINDING=DB              # D1 binding name in wrangler.jsonc

# Performance Targets (milliseconds)
TARGET_BUILD_TIME=5000           # Build time
TARGET_STARTUP_LATENCY=1000      # Startup latency (Cloudflare limit)
TARGET_REQUEST_LATENCY=200       # API response time
TARGET_DASHBOARD_LATENCY=500     # Dashboard load time
TARGET_ERROR_RATE=0.01          # 1% maximum error rate

# Notifications (optional)
NOTIFY_SLACK=true
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
SLACK_CHANNEL=#deployments

NOTIFY_PAGERDUTY=true
PAGERDUTY_TOKEN=xxx
PAGERDUTY_SERVICE_ID=xxx

NOTIFY_EMAIL=false
EMAIL_TO=oncall@opendash.app
```

### Environment Files

Create `.env.staging` and `.env.production` in project root:

```bash
# .env.production
ENVIRONMENT=production
D1_DATABASE_ID=abc123def456
STRIPE_API_KEY=sk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
RESEND_API_KEY=re_xxx
```

## Logging

All logs are stored in `deploy/logs/`:

```bash
# View logs
tail -f deploy/logs/deployment_2026-03-25_14-30-45.log

# Search logs
grep ERROR deploy/logs/*.log
grep "Phase" deploy/logs/*.log
```

## Metrics & Reports

Metrics are stored in `deploy/metrics/` and `deploy/reports/`:

```bash
# View metrics
cat deploy/metrics/metrics_2026-03-25.json

# View daily report
cat deploy/reports/daily_report_2026-03-25.md
```

## Performance Targets

| Metric | Target | Critical Threshold | Warning Threshold |
|--------|--------|-------------------|-------------------|
| Build Time | <5s | >5s | >4s |
| Startup Latency | <1s | >1s | >800ms |
| API Response | <200ms p95 | >500ms | >300ms |
| Dashboard Load | <500ms p95 | >1000ms | >750ms |
| Error Rate | <1% | >5% | >2% |
| Worker Cold Start | <2000ms | >2000ms | >1500ms |

## Alerting Thresholds

### Critical Alerts (Immediate Action)
- Error rate >5% for 5 minutes
- All health checks failing
- Database unavailable
- Worker deployment failures

### Warning Alerts (Monitor)
- Error rate >2% for 10 minutes
- API latency >300ms p95
- Database query latency >200ms average
- Memory usage >80%

## Weekly Deployment Schedule

```
Monday:     Pre-deployment verification
Tuesday:    Staging deployment & load testing
Wednesday:  Final validation & team training
Thursday:   Production deployment (8am UTC)
Friday:     Post-deployment verification & monitoring
Weekend:    Monitoring & on-call support
```

## Daily Deployment Schedule (CI/CD Mode)

Each commit to main automatically:
1. Runs tests (npm test)
2. Deploys to staging
3. Runs load tests (k6)
4. If all pass: ready for production approval

```bash
# Manual trigger of daily workflow
./pre-launch-check.sh && ./deploy-production.sh && ./post-deployment-check.sh
```

## Troubleshooting

### Build Failures
```bash
# Clean rebuild
rm -rf dist node_modules
npm install
npm run build
```

### Deployment Failures
```bash
# Check Wrangler is installed
wrangler --version

# Verify wrangler.jsonc
cat wrangler.jsonc | jq .

# Check D1 database access
wrangler d1 list
```

### Health Check Failures
```bash
# Test endpoint directly
curl https://opendash.app/health

# Check Cloudflare status
wrangler status

# View worker logs
wrangler tail
```

### Rollback Issues
```bash
# If rollback script fails, manual process:
git log --oneline -5          # Find good commit
git checkout <commit-hash>    # Checkout version
npm run build                 # Rebuild
wrangler deploy --env production  # Redeploy
```

## Advanced Usage

### Custom Deployment with Logging
```bash
# Verbose logging
CURRENT_LOG_LEVEL=0 ./deploy-production.sh

# Specific environment
./deploy-production.sh --env staging
```

### Metrics Analysis
```bash
# View specific metric
jq '.metrics.error_rate' deploy/metrics/metrics_*.json

# Compare metrics across deployments
for f in deploy/metrics/metrics_*.json; do
  echo "File: $f"
  jq '.metrics' "$f"
done
```

### Multi-Phase Deployment
```bash
# Execute multiple phases with error handling
{
  ./pre-launch-check.sh --env production &&
  ./deploy-production.sh --env production &&
  ./post-deployment-check.sh --env production &&
  ./monitoring-start.sh --env production
} || ./rollback.sh --reason "Deployment pipeline failed"
```

## GitHub Issues Integration

Deployment phases are tracked as GitHub issues:

- **#98**: Day 2 Staging Environment Deployment
- **#99**: Day 2 Load Testing & Performance Verification
- **#100**: Day 3 Final Production Readiness Validation
- **#101**: Post-Deployment Monitoring & Incident Response
- **#102**: Deployment Day Production Launch
- **#103**: Team Training & Operational Handoff
- **#104**: Phase 1 Deployment Execution Epic

## Related Documentation

- **DEPLOYMENT-STANDARD-PROCEDURE.md** - Complete deployment lifecycle
- **DEPLOYMENT-CHECKLIST.md** - Pre-launch task checklist
- **LOAD-TESTING-GUIDE.md** - Load testing procedures
- **MIGRATION-VALIDATION.md** - Database schema validation
- **SMOKE-TEST-BASELINE.md** - Baseline smoke test results

## Safety Features

✅ Pre-deployment verification gate
✅ Automated health checks
✅ Deployment backups (auto-restore on failure)
✅ Automatic rollback on critical errors
✅ Performance threshold validation
✅ Error rate monitoring
✅ Multi-channel alerting
✅ Structured logging with request IDs

## Support

For issues or questions about deployment automation:

1. Check deployment logs: `deploy/logs/`
2. Review error messages carefully
3. Run rollback if critical: `./rollback.sh`
4. Check GitHub issues for status
5. Contact DevOps Lead for assistance

---

**Last Updated**: 2026-03-25
**Version**: 1.0
**Status**: Production Ready
