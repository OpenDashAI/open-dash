# Competitive Intelligence - Production Deployment Guide

This guide covers deploying the Competitive Intelligence system to production on Cloudflare Workers.

## Pre-Deployment Checklist

### Database
- [ ] D1 database created
- [ ] All migrations applied (`0003_competitive_intelligence.sql`)
- [ ] Competitor seed data loaded

### Environment Variables
```bash
# .env.production (Cloudflare KV)
API_MOM_URL=https://api.mom.service/...
API_MOM_KEY=xxx_production_key_xxx

# Optional: Slack webhook for alerts
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# Optional: Email service configuration
EMAIL_SERVICE_KEY=xxx
EMAIL_FROM=alerts@opendash.ai
```

### Configuration
- [ ] `wrangler.jsonc` updated with D1 binding
- [ ] KV namespaces configured (for Durable Object state)
- [ ] API Mom credentials configured
- [ ] Slack/Email webhooks configured (optional)

## Deployment Steps

### 1. Pre-deployment Testing

Run the full test suite:
```bash
npm run test
```

Test CI-specific functionality:
```bash
# Test competitor data collection
npm run test -- ci-orchestrator

# Test alert system
npm run test -- alert-system

# Test dashboard endpoints
npm run test -- api/ci-dashboard
```

### 2. Verify Migrations

Check D1 migration status:
```bash
wrangler d1 migrations list --binding=DB
```

Apply pending migrations:
```bash
wrangler d1 migrations apply --binding=DB --remote
```

### 3. Seed Initial Data

Run competitor seeding:
```bash
curl -X POST https://your-domain.com/api/competitive-intelligence/seed-competitors \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json"
```

Verify competitors loaded:
```bash
curl https://your-domain.com/api/competitive-intelligence/list-competitors \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### 4. Deploy to Production

```bash
# Build
npm run build

# Deploy to Cloudflare
wrangler deploy

# Or with staging first
wrangler deploy --env staging
# ... test ...
wrangler deploy --env production
```

### 5. Verify Deployment

#### Dashboard Access
- [ ] `/competitive-intelligence` loads
- [ ] Real-time polling works (check network tab every 30s)
- [ ] Tabs switch correctly (Overview, Competitors, Alerts, Insights)

#### API Endpoints
```bash
# Test dashboard API
curl https://your-domain.com/api/competitive-intelligence/get-dashboard

# Test alerts API
curl https://your-domain.com/api/competitive-intelligence/get-alerts?hours=24

# Test CLI commands via API
curl https://your-domain.com/api/cli/competitors/list
```

#### Admin Panel
- [ ] `/competitive-intelligence/admin` loads
- [ ] Alert rules display correctly
- [ ] Budget settings visible
- [ ] Notification channels configurable

#### Metrics Endpoint
```bash
curl https://your-domain.com/api/ci-metrics
# Should return Prometheus format metrics
```

### 6. Configure Monitoring

#### Grafana Setup
1. Add Prometheus data source: `https://your-domain.com/api/ci-metrics`
2. Import dashboard from `GRAFANA-INTEGRATION.md`
3. Set up alerts for:
   - `ci_quota_remaining < 10` (quota warning)
   - `ci_alerts_critical > 0` (critical alerts)
   - `rate(ci_api_cost_usd[1h]) > threshold` (cost spike)

#### Logging & Observability
Enable Wrangler logging:
```bash
# View logs
wrangler tail
```

Key logs to monitor:
- CI job execution (`daily_analysis_job`, `weekly_job`)
- API errors (404, 5xx from external APIs)
- Alert failures
- Cost tracking

### 7. Set Up Automated Jobs

The CI jobs run via Durable Objects scheduled alarm system:

```typescript
// In ci-orchestrator.ts
// Jobs scheduled automatically:
// - Daily analysis: 00:00 UTC
// - Weekly insights: Monday 02:00 UTC
```

Verify jobs running:
```bash
# Check job status
curl https://your-domain.com/api/ci/jobs/status
```

### 8. Enable Slack Notifications

1. Create Slack Webhook: https://api.slack.com/messaging/webhooks
2. Add to environment:
   ```
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
   ```
3. Test alert:
   ```bash
   curl -X POST https://your-domain.com/api/ci/test-alert
   ```

## Rollback Plan

If issues occur, rollback in one of two ways:

### Option 1: Redeploy Previous Version
```bash
# Check git history
git log --oneline

# Revert to previous commit
git revert HEAD
wrangler deploy
```

### Option 2: Feature Flag (if available)
```bash
# Disable CI in wrangler.jsonc
# Then redeploy
wrangler deploy
```

## Post-Deployment

### Week 1
- Monitor dashboard usage (check Grafana)
- Review alert quality (adjust sensitivity)
- Check API cost tracking
- Validate all competitors loading data

### Week 2
- Verify daily jobs completing
- Check alert notification delivery
- Review competitive insights quality
- Optimize API usage if costs high

### Week 3+
- Establish baseline metrics
- Fine-tune alert thresholds
- Document common use cases
- Plan feature enhancements

## Performance Optimization

### Database Indexes
Ensure indexes created for common queries:
```sql
-- Check existing indexes
SELECT * FROM sqlite_master WHERE type='index' AND name LIKE 'ci_%';
```

### API Response Caching
Cache stable data (competitor lists, metrics) for 1 hour:
```typescript
// Add cache headers to responses
response.headers.set('Cache-Control', 'public, max-age=3600');
```

### Batch Processing
Jobs already batch process competitors (avoid N+1 queries).

## Troubleshooting

### Dashboard shows "Loading..." forever
1. Check network tab for failed requests
2. Verify API_MOM_URL environment variable
3. Check API Mom service status
4. Review Cloudflare logs: `wrangler tail`

### No alerts being sent
1. Verify SLACK_WEBHOOK_URL configured
2. Check webhook endpoint is accessible
3. Review alert rules enabled in admin panel
4. Check job logs for errors

### API quota exceeded
1. Check current usage: `/api/ci/costs`
2. Verify daily limit: `/api/ci/admin` → Budget tab
3. Review which APIs consuming most quota
4. Adjust monitoring frequency if needed

### High API costs
1. Check cost breakdown: `/api/ci/costs`
2. Identify expensive API calls
3. Reduce check frequency or competitor count
4. Consider caching more aggressively

## Production Support

### Monitoring Dashboard
Keep open in second monitor:
- Grafana dashboard showing real-time metrics
- Cloudflare Analytics for request volume
- Alerts configured for anomalies

### Emergency Contacts
- **API Mom Support**: support@apimom.service
- **Cloudflare Support**: https://support.cloudflare.com
- **Team on-call**: Defined in incident policy

### Incident Response
1. Check logs: `wrangler tail | grep error`
2. Verify external services (API Mom, Slack)
3. Review recent deployments
4. Rollback if needed
5. Post-incident review

## Scaling Considerations

### Current Limits
- Up to 10-25 competitors monitored
- Daily + weekly jobs
- ~50-100 API calls/day
- ~$5-15/month operating cost

### To Scale Beyond
If monitoring 100+ competitors:
1. Implement job batching with rate limiting
2. Use D1 sharding across multiple databases
3. Cache more aggressively
4. Consider dedicated API quotas
5. Increase Durable Object concurrency

## Next Steps

1. Set up Grafana dashboard with historical data
2. Configure team notifications and escalation
3. Document custom alert rules for your team
4. Create executive reports from Grafana
5. Integrate with marketing systems (HubSpot, Marketo)
