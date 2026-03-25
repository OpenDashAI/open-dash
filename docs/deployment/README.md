# Deployment & Operations Documentation

Complete guide to deploying OpenDash to production and managing it operationally.

**Quick Navigation**: [← Back to Docs](../README.md) | [Quick Start](../QUICK-START.md)

---

## What's Here

This section covers **everything you need to get OpenDash running**, including:
- Deployment procedures and checklists
- CI/CD setup and automation
- Environment configuration
- Deployment patterns and best practices
- Operational troubleshooting

**Use this section if you need to**:
- Deploy to production
- Set up CI/CD pipeline
- Configure environments
- Troubleshoot deployment issues
- Plan and execute upgrades

---

## Getting Started

### Ready to Deploy? (5 steps)

1. **Check readiness** → [../status/MVP-LAUNCH-STATUS.md](../status/MVP-LAUNCH-STATUS.md) (2 min)
2. **Prepare database** → [../setup/D1_SETUP.md](../setup/D1_SETUP.md) (10 min)
3. **Deploy application** → [DEPLOYMENT-STANDARD-PROCEDURE.md](./DEPLOYMENT-STANDARD-PROCEDURE.md) (15 min)
4. **Setup CI/CD** → [../setup/CI_CD_SETUP.md](../setup/CI_CD_SETUP.md) (20 min)
5. **Verify & monitor** → [../guides/DEPLOYMENT-GUIDE.md](../guides/DEPLOYMENT-GUIDE.md) (10 min)

---

## Deployment Guide

### Main Deployment Documents

| Document | Purpose | Audience |
|----------|---------|----------|
| [DEPLOYMENT-STANDARD-PROCEDURE.md](./DEPLOYMENT-STANDARD-PROCEDURE.md) | Step-by-step deployment | DevOps / Engineers |
| [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md) | Pre/post deployment checklist | Everyone deploying |
| [DEPLOYMENT-PATTERNS-RESEARCH.md](./DEPLOYMENT-PATTERNS-RESEARCH.md) | Patterns & best practices | Architecture team |
| [DEPLOYMENT-AUTOMATION-SETUP.md](./DEPLOYMENT-AUTOMATION-SETUP.md) | Automation setup guide | DevOps |

### Quick References

| Document | For | Time |
|----------|-----|------|
| [../guides/DEPLOYMENT-GUIDE.md](../guides/DEPLOYMENT-GUIDE.md) | Full deployment guide | 30 min |
| [../guides/DEPLOYMENT.md](../guides/DEPLOYMENT.md) | Detailed tactical steps | 20 min |

---

## Infrastructure Setup

### Database

| Document | Tool | Setup Time |
|----------|------|-----------|
| [../setup/D1_SETUP.md](../setup/D1_SETUP.md) | Cloudflare D1 | 10 min |

**Contains**:
- D1 schema & migrations
- Local development setup
- Production provisioning
- Backup strategy

### CI/CD Pipeline

| Document | Tool | Setup Time |
|----------|------|-----------|
| [../setup/CI_CD_SETUP.md](../setup/CI_CD_SETUP.md) | GitHub Actions | 20 min |

**Contains**:
- Workflow configuration
- Automated testing
- Automated deployment
- Rollback procedures

### Error Tracking & Monitoring

| Document | Tool | Setup Time |
|----------|------|-----------|
| [../setup/SENTRY_SETUP.md](../setup/SENTRY_SETUP.md) | Sentry | 10 min |
| [../setup/GRAFANA-INTEGRATION.md](../setup/GRAFANA-INTEGRATION.md) | Grafana | 15 min |

**Contains**:
- Service integration
- Alerting configuration
- Dashboard setup
- Incident response

### Email Service

| Document | Tool | Setup Time |
|----------|------|-----------|
| [../setup/EMAIL_PROVIDER_SETUP.md](../setup/EMAIL_PROVIDER_SETUP.md) | Resend | 5 min |

**Contains**:
- Email provider configuration
- Invitation system setup
- Notification templates

---

## Deployment Phases

### Phase 1: Pre-Deployment (Staging)
- [ ] Run full test suite
- [ ] Review changelog
- [ ] Check database migrations
- [ ] Stage environment ready
- [ ] Backup database

**Reference**: [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)

### Phase 2: Deployment
- [ ] Deploy code to production
- [ ] Run migrations
- [ ] Verify health checks
- [ ] Monitor error rates

**Reference**: [DEPLOYMENT-STANDARD-PROCEDURE.md](./DEPLOYMENT-STANDARD-PROCEDURE.md)

### Phase 3: Post-Deployment
- [ ] Verify features working
- [ ] Check API responses
- [ ] Test user workflows
- [ ] Review logs

**Reference**: [../execution/STARTUP-VERIFICATION.md](../execution/STARTUP-VERIFICATION.md)

---

## Common Deployment Tasks

### Deploy a Code Change
```
1. Create PR with changes
2. Run automated tests (CI)
3. Get review approval
4. Merge to main
5. CI automatically deploys
6. Check monitoring dashboard
```
See [../setup/CI_CD_SETUP.md](../setup/CI_CD_SETUP.md)

### Add a Database Migration
```
1. Create migration file in migrations/
2. Update schema.ts
3. Test locally with D1
4. Commit and push
5. CI deploys with migration
```
See [../setup/D1_SETUP.md](../setup/D1_SETUP.md)

### Emergency Rollback
```
1. Identify problem in monitoring
2. Note the last good commit
3. Run: git revert <bad-commit>
4. Push to trigger redeployment
5. Verify fix in monitoring
```
See [DEPLOYMENT-PATTERNS-RESEARCH.md](./DEPLOYMENT-PATTERNS-RESEARCH.md)

### Update Secrets/Environment Variables
```
1. Add to wrangler secrets
2. Reference in code with env.VARIABLE
3. Test locally
4. Deploy (CI picks up from Wrangler)
```
Note: Use `wrangler secret put KEY` to set secrets securely.

---

## Troubleshooting Deployments

### "Build Failed"
1. Check CI logs for error message
2. Run locally: `npm run build`
3. Fix the error
4. Push again

### "Migration Failed"
1. Check D1 state
2. Review migration SQL for syntax errors
3. Verify schema matches code
4. See [../setup/D1_SETUP.md](../setup/D1_SETUP.md) troubleshooting section

### "API Returning 500s"
1. Check Sentry for error details
2. Review recent deploys
3. Check database connectivity
4. See [../setup/SENTRY_SETUP.md](../setup/SENTRY_SETUP.md) incident response

### "Features Not Working After Deploy"
1. Verify feature flags
2. Check configuration loaded
3. Verify database migrations ran
4. Check API route implementation

---

## Monitoring & Alerts

### Key Metrics to Watch
- **Error rate** (Sentry) - Should be <0.1%
- **API latency** (Grafana) - Should be <500ms p99
- **Database load** (Cloudflare) - Monitor CPU/memory
- **Deployment success rate** - Should be 100%

### Critical Alerts
Set up alerts for:
- High error rate (>1%)
- High latency (>2s p99)
- Database connection failures
- CI/CD pipeline failures
- Deployment failures

See [../setup/SENTRY_SETUP.md](../setup/SENTRY_SETUP.md) and [../setup/GRAFANA-INTEGRATION.md](../setup/GRAFANA-INTEGRATION.md).

---

## Related Documentation

### Strategy & Planning
- [../strategy/PRODUCT.md](../strategy/PRODUCT.md) - Product features (impacts deployment)
- [../roadmaps/90-DAY-ROADMAP.md](../roadmaps/90-DAY-ROADMAP.md) - Release schedule

### Architecture
- [../architecture/TECHNICAL-ARCHITECTURE-REVIEW.md](../architecture/TECHNICAL-ARCHITECTURE-REVIEW.md) - System architecture
- [../audits/SECURITY-SECRETS-AUDIT.md](../audits/SECURITY-SECRETS-AUDIT.md) - Secrets management

### Status & Progress
- [../status/DEPLOYMENT-STATUS.md](../status/DEPLOYMENT-STATUS.md) - Current deployment status
- [../status/MVP-LAUNCH-STATUS.md](../status/MVP-LAUNCH-STATUS.md) - Launch readiness

### Execution
- [../execution/STARTUP-VERIFICATION.md](../execution/STARTUP-VERIFICATION.md) - Post-deploy verification
- [../execution/COMPLETE_EXECUTION_PLAN.md](../execution/COMPLETE_EXECUTION_PLAN.md) - Full timeline

---

## File Structure

```
docs/deployment/
├── README.md (you are here)
├── DEPLOYMENT-STANDARD-PROCEDURE.md
├── DEPLOYMENT-CHECKLIST.md
├── DEPLOYMENT-PATTERNS-RESEARCH.md
└── DEPLOYMENT-AUTOMATION-SETUP.md

docs/guides/
├── DEPLOYMENT-GUIDE.md
└── DEPLOYMENT.md

docs/setup/
├── D1_SETUP.md
├── CI_CD_SETUP.md
├── SENTRY_SETUP.md
├── GRAFANA-INTEGRATION.md
└── EMAIL_PROVIDER_SETUP.md
```

---

## Best Practices

### Before Every Deployment
1. ✅ Run tests locally
2. ✅ Check git status (no uncommitted changes)
3. ✅ Review changelog
4. ✅ Verify staging works
5. ✅ Have rollback plan

### During Deployment
1. 🔔 Monitor error rates
2. 🔔 Watch API latency
3. 🔔 Check user reports
4. 🔔 Verify key features

### After Deployment
1. 📊 Review metrics (24h)
2. 📊 Check error trends
3. 📊 Verify user engagement
4. 📊 Update status dashboard

---

## Emergency Procedures

### If Deployment Fails
1. **Don't panic** - CI has safety checks
2. Check CI logs for specific error
3. Fix issue locally
4. Push fix (triggers redeployment)
5. Monitor deployment progress

### If Production is Down
1. **Alert team** immediately
2. Check Sentry for errors
3. Check Grafana for infrastructure issues
4. Identify root cause
5. Execute rollback if needed
6. Post-mortem afterwards

### If Database is Corrupted
1. **Stop deployment** if in progress
2. Check backups available
3. Review recent migrations
4. Restore from backup if possible
5. Run migrations from clean slate
6. Verify data integrity

---

## Secrets Management

### How Secrets Work
- Secrets stored in Wrangler
- Cannot be retrieved after setting
- Keep local `.env.local` copy for reference
- Never commit secrets to git

### Common Secrets
- Database credentials
- API keys (Stripe, GitHub, etc.)
- Email provider credentials
- Webhook signing keys

See [../audits/SECURITY-SECRETS-AUDIT.md](../audits/SECURITY-SECRETS-AUDIT.md) for full audit.

---

## See Also

- 📚 [Complete Documentation Index](../README.md)
- ⚡ [Quick Start](../QUICK-START.md)
- 🗄️ [Database Setup](../setup/D1_SETUP.md)
- 🔄 [CI/CD Setup](../setup/CI_CD_SETUP.md)
- 🚨 [Monitoring & Alerts](../setup/SENTRY_SETUP.md)

---

**Last updated**: 2026-03-25
**Maintainers**: DevOps / Infrastructure team
**Issues**: Use `deployment:` or `infra:` prefix for deployment issues
