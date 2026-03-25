# OpenDash Deployment Guide

**Version**: 1.0
**Last Updated**: 2026-03-24
**Status**: Production-ready

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Staging Deployment](#staging-deployment)
4. [Production Deployment](#production-deployment)
5. [Environment Variables Reference](#environment-variables-reference)
6. [Rollback Procedures](#rollback-procedures)
7. [Monitoring & Debugging](#monitoring--debugging)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements
- **Node.js**: 18.0.0 or higher
- **pnpm**: 8.0.0 or higher (preferred package manager)
- **Git**: 2.30.0 or higher
- **Cloudflare Account**: With Workers and D1 database access

### Required Credentials
1. **Cloudflare API Token** (for wrangler CLI)
   - Generate at: https://dash.cloudflare.com/profile/api-tokens
   - Permissions: `Account.Workers` (read/write), `D1` (read/write)

2. **Sentry Project DSN** (error tracking)
   - Create project at: https://sentry.io
   - Copy DSN for later configuration

3. **GitHub Personal Access Token** (for deployment webhooks)
   - Generate at: https://github.com/settings/tokens
   - Permissions: `repo`, `workflow` (if using GitHub Actions)

### Cloudflare Setup
```bash
# Verify Cloudflare account access
wrangler whoami

# List existing workers (should be empty if first deploy)
wrangler list
```

---

## Local Development

### 1. Clone and Install

```bash
# Clone the repository
git clone <repo-url>
cd open-dash

# Install dependencies
pnpm install

# Verify installation
pnpm --version  # Should be 8.0.0+
node --version  # Should be 18.0.0+
```

### 2. Configure Local Environment

Create `.env.local` for development (not committed to git):

```bash
# Session authentication
AUTH_SECRET=$(node -e "console.log(crypto.randomBytes(32).toString('hex'))")

# API integrations (use dev/staging keys)
API_MOM_KEY=pk_test_...  # From API Mom staging
GITHUB_TOKEN=ghp_...     # Personal GitHub token
SM_API_URL=http://localhost:3001  # Scalable Media (local or staging)

# Optional: Sentry (for local error tracking)
SENTRY_DSN=https://...@sentry.io/...
```

### 3. Create Database (Local D1)

```bash
# Initialize local D1 database
wrangler d1 create open-dash --local

# Apply migrations
wrangler d1 execute open-dash --local --file=./src/lib/db/migrations/001_init.sql

# Verify database
wrangler d1 query "SELECT name FROM sqlite_master WHERE type='table'" --local
```

### 4. Start Development Server

```bash
# Run development server (hot reload)
pnpm dev

# Server runs on http://localhost:8787
# Accessible at http://localhost:5173 (frontend)
```

### 5. Test Locally

```bash
# Run test suite
pnpm test

# Run with coverage
pnpm test -- --coverage

# Expected output: 184 tests passing | 1 skipped
```

---

## Staging Deployment

### 1. Set Up Staging Environment

```bash
# Create staging wrangler configuration
cp wrangler.jsonc wrangler.staging.jsonc

# Edit wrangler.staging.jsonc
# Change:
# - "name": "open-dash" → "open-dash-staging"
# - Add environment-specific settings
```

### 2. Configure Staging Secrets

```bash
# Set up Cloudflare secrets for staging
wrangler secret put AUTH_SECRET --env staging
# Enter a new random secret

wrangler secret put API_MOM_KEY --env staging
# Enter staging API Mom key

wrangler secret put GITHUB_TOKEN --env staging
# Enter GitHub PAT for staging

wrangler secret put SENTRY_DSN --env staging
# Enter Sentry staging project DSN

# Optional: Restrict staging to specific IPs
wrangler secret put ALLOWED_IPS --env staging
# Enter comma-separated IPs (e.g., "203.0.113.0,198.51.100.0")
```

### 3. Create Staging D1 Database

```bash
# Note: Replace XXXX-XXXX-XXXX with actual IDs from Cloudflare dashboard
wrangler d1 create open-dash-staging

# Link in wrangler.staging.jsonc:
# "database_id": "12345678-1234-1234-1234-123456789012"

# Apply migrations to staging
wrangler d1 execute open-dash-staging \
  --file=./src/lib/db/migrations/001_init.sql
```

### 4. Build and Deploy to Staging

```bash
# Build production bundle
pnpm build

# Deploy to staging
wrangler deploy --env staging

# Verify deployment
curl https://open-dash-staging.<your-domain>.workers.dev/health

# Expected response: { "status": "ok", "version": "1.0.0" }
```

### 5. Run Integration Tests Against Staging

```bash
# Test staging endpoints
STAGING_URL=https://open-dash-staging.<your-domain>.workers.dev npm run test:integration

# Verify all 184 tests pass in staging environment
```

### 6. Monitor Staging

```bash
# Check Sentry for errors
# Visit: https://sentry.io/[your-org]/open-dash-staging/

# Check D1 metrics
wrangler d1 insights open-dash-staging

# Check Worker analytics
# Visit: https://dash.cloudflare.com/ → Workers → open-dash-staging
```

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] All tests passing locally (184 | 1 skipped)
- [ ] Git branch is clean (no uncommitted changes)
- [ ] Latest changes are committed and pushed to main
- [ ] Staging deployment tested and verified
- [ ] Performance audit (84/100 Lighthouse) confirmed
- [ ] Accessibility audit (95% WCAG AA) confirmed
- [ ] Sentry project created and DSN ready
- [ ] Production database backup strategy confirmed
- [ ] Team aware of deployment time
- [ ] Rollback plan documented and tested

### 1. Configure Production Secrets

```bash
# CRITICAL: Use strong, unique secrets for production

wrangler secret put AUTH_SECRET
# Generate: node -e "console.log(crypto.randomBytes(32).toString('hex'))"
# Enter the generated value

wrangler secret put API_MOM_KEY
# Enter production API Mom key

wrangler secret put GITHUB_TOKEN
# Enter production GitHub PAT

wrangler secret put SENTRY_DSN
# Enter production Sentry project DSN

# Optional: Restrict production to specific IPs
wrangler secret put ALLOWED_IPS
# Enter authorized IPs only
```

### 2. Create Production D1 Database

```bash
# Create production database
wrangler d1 create open-dash

# Update wrangler.jsonc with returned database_id

# Apply migrations
wrangler d1 execute open-dash --file=./src/lib/db/migrations/001_init.sql

# Verify migrations applied
wrangler d1 query "SELECT * FROM datasource_metrics LIMIT 1" | head -1
# Should show column headers, not error
```

### 3. Deploy to Production

```bash
# Final build
pnpm build

# Verify no build errors
# Expected output: "Build complete" with no warnings

# Deploy to production
wrangler deploy

# Verify deployment
curl https://open-dash.<your-domain>.workers.dev/health
# Expected: { "status": "ok", "version": "1.0.0" }

# Check Sentry
# Visit: https://sentry.io/[your-org]/open-dash/
# Should show 0 errors initially
```

### 4. Post-Deployment Validation

```bash
# 1. Verify all endpoints responding
curl https://open-dash.<your-domain>.workers.dev/api/brands
curl https://open-dash.<your-domain>.workers.dev/api/briefing

# 2. Test authentication flow
# Visit: https://open-dash.<your-domain>.workers.dev
# Login with valid credentials

# 3. Verify analytics data flowing
# Check database for recent metrics
wrangler d1 query "SELECT COUNT(*) as count FROM datasource_metrics"

# 4. Monitor Sentry for errors (should be 0 for first hour)
# Visit: https://sentry.io/[your-org]/open-dash/

# 5. Check Worker performance
# Visit: https://dash.cloudflare.com/ → Workers → open-dash
# Verify: <3s avg response time, <5% error rate

# 6. Test mobile responsiveness
# Visit: https://open-dash.<your-domain>.workers.dev
# Viewport: 375px width (iPhone 12)
```

### 5. Configure Custom Domain (Optional)

```bash
# Add custom domain to Worker
wrangler routes create https://briefing.your-domain.com \
  --pattern='https://briefing.your-domain.com/*' \
  --script=open-dash

# Update DNS CNAME record to point to Cloudflare
# CNAME briefing.your-domain.com → open-dash.<namespace>.workers.dev

# Verify DNS propagation (5-10 minutes)
dig CNAME briefing.your-domain.com
```

---

## Environment Variables Reference

### Required (must be set before deploy)

| Variable | Description | Example |
|----------|-------------|---------|
| `AUTH_SECRET` | Session authentication secret (32-byte hex) | `a1b2c3d4...` |
| `API_MOM_KEY` | API Mom project key for datasource APIs | `pk_live_abc123` |
| `GITHUB_TOKEN` | GitHub PAT for issues/activity data | `ghp_16CyZfVDX...` |
| `SENTRY_DSN` | Sentry error tracking DSN | `https://xxx@sentry.io/123` |

### Optional (recommended for prod)

| Variable | Description | Default |
|----------|-------------|---------|
| `SM_API_URL` | Scalable Media API URL | `https://api.scalable-media.com` |
| `SM_SERVICE_KEY` | Scalable Media authentication key | (none) |
| `ALLOWED_IPS` | Comma-separated IPs that bypass auth | (none = auth required) |
| `NODE_ENV` | Environment flag | `production` |

### Database Configuration (wrangler.jsonc)

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "open-dash-db",
      "database_id": "12345678-1234-1234-1234-123456789012"
    }
  ]
}
```

---

## Rollback Procedures

### Quick Rollback (last version)

```bash
# Check deployment history
wrangler deployments list

# Rollback to previous version
wrangler rollback --message "Rollback from v1.0.1 due to error" --version 2

# Verify rollback
curl https://open-dash.<your-domain>.workers.dev/health
```

### Manual Rollback (to specific commit)

```bash
# 1. Checkout previous version
git log --oneline | head -10
# Find the commit hash you want to rollback to

git checkout <commit-hash>

# 2. Rebuild
pnpm install
pnpm build

# 3. Redeploy
wrangler deploy

# 4. Verify
curl https://open-dash.<your-domain>.workers.dev/health

# 5. Push rollback to main
git push origin main --force
```

### Database Rollback (if migration failed)

```bash
# 1. Check current schema
wrangler d1 query "SELECT sql FROM sqlite_master WHERE type='table'"

# 2. If migration didn't complete, manually fix:
wrangler d1 execute open-dash --command "DROP TABLE IF EXISTS bad_table"

# 3. Reapply migrations
wrangler d1 execute open-dash --file=./src/lib/db/migrations/001_init.sql

# 4. Verify
wrangler d1 query "SELECT COUNT(*) FROM datasource_metrics"
```

---

## Monitoring & Debugging

### Real-Time Logs

```bash
# Stream live logs from production worker
wrangler tail --env production

# Filter by specific datasource
wrangler tail --env production --format json | grep "datasource"

# Search for errors
wrangler tail --env production | grep -i error
```

### Performance Monitoring

```bash
# Check Worker analytics
wrangler analytics engine list

# D1 query performance
wrangler d1 insights open-dash

# Response time percentiles
wrangler analytics engine list --metrics p50_response_time,p95_response_time
```

### Error Tracking

```bash
# View Sentry errors
# Visit: https://sentry.io/[your-org]/open-dash/

# Filter by severity
# Severity > error → production bugs
# Severity = warning → potential issues

# Create alert rule
# Go to Settings → Alerts
# Alert on: error count > 5 in 1 hour
```

### Database Debugging

```bash
# Check database health
wrangler d1 query "SELECT COUNT(*) FROM datasource_metrics"

# Monitor growth
wrangler d1 query "SELECT
  COUNT(*) as total_metrics,
  COUNT(DISTINCT datasource_id) as unique_datasources,
  MAX(timestamp) as latest_metric
FROM datasource_metrics"

# Check for slow queries
wrangler d1 query "SELECT * FROM alert_history LIMIT 10" --explain
```

---

## Troubleshooting

### "Authentication Failed" Error

**Symptom**: Users get 401 Unauthorized after login

**Solution**:
```bash
# 1. Verify AUTH_SECRET is set
wrangler secret list | grep AUTH_SECRET

# 2. Check session cookie
# Open DevTools → Application → Cookies
# Verify cookie has 'secure' and 'httponly' flags

# 3. Regenerate AUTH_SECRET
wrangler secret delete AUTH_SECRET
wrangler secret put AUTH_SECRET
# (Generate new value with: node -e "console.log(crypto.randomBytes(32).toString('hex'))")

# 4. Redeploy
wrangler deploy
```

### "Database Connection Failed"

**Symptom**: "Error: Failed to connect to D1" in logs

**Solution**:
```bash
# 1. Verify database exists
wrangler d1 info open-dash

# 2. Check database_id in wrangler.jsonc
# Should match: ID from wrangler d1 info output

# 3. Verify D1 migrations applied
wrangler d1 query "SELECT COUNT(*) FROM sqlite_master WHERE type='table'"
# Should return 4 tables: datasource_metrics, datasource_status, alert_rules, alert_history

# 4. If missing, reapply migrations
wrangler d1 execute open-dash --file=./src/lib/db/migrations/001_init.sql
```

### "Request Timeout" (>30 seconds)

**Symptom**: Worker requests timeout after 30s

**Solution**:
```bash
# 1. Check slow database queries
wrangler tail --env production --format json | grep "duration"

# 2. Optimize queries in src/server/analytics.ts
# Example: Add query timeout
const result = await DB.prepare("SELECT * FROM datasource_metrics")
  .raw()
  .all();

# 3. Implement pagination for large result sets
# Split queries by date range (24h at a time)

# 4. Redeploy after optimization
pnpm build
wrangler deploy
```

### "Memory Exceeded" Warning in Logs

**Symptom**: "Worker exceeded CPU time limits" in Sentry

**Solution**:
```bash
# 1. Check component cleanup functions
# All loaders should have isMountedRef + requestRef cleanup

# 2. Review polling intervals
# Default is 60s, but can reduce to 30s if needed
# File: src/components/analytics/AnalyticsDashboard.tsx

# 3. Implement caching for repeated queries
# Avoid fetching same data multiple times in short period

# 4. Monitor with Sentry Performance
# Visit: https://sentry.io/[your-org]/open-dash/performance/
```

### "Sentry Not Capturing Errors"

**Symptom**: No errors showing in Sentry dashboard

**Solution**:
```bash
# 1. Verify Sentry DSN is set
wrangler secret list | grep SENTRY_DSN

# 2. Test error capture with curl
curl -X POST https://open-dash.<domain>.workers.dev/api/test-error
# Should appear in Sentry within 10 seconds

# 3. Check Sentry dashboard
# Visit: https://sentry.io/[your-org]/open-dash/
# Verify correct project is selected

# 4. Check browser console for client errors
# F12 → Console tab
# Ensure errors are logged to Sentry
```

---

## Support & Escalation

For deployment issues:

1. **Check logs first**: `wrangler tail --env production`
2. **Search Sentry**: https://sentry.io/[your-org]/open-dash/
3. **Review performance**: https://dash.cloudflare.com/
4. **Consult runbook**: This document (DEPLOYMENT.md)
5. **Contact platform team**: @opendash-team on Slack

---

## Additional Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [D1 Database Guide](https://developers.cloudflare.com/d1/)
- [Sentry Error Tracking](https://docs.sentry.io/)
- [OpenDash README](./README.md)
- [OpenDash Architecture](./ARCHITECTURE.md)

---

**Last Reviewed**: 2026-03-24
**Next Review**: 2026-04-24
**Deployment Status**: ✅ Production Ready
