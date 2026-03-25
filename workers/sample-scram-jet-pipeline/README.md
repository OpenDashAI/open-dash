# Sample Scram Jet Pipeline

Demonstrates how Scram Jet pipelines integrate with OpenDash metrics collection via Cloudflare service bindings.

## Overview

This sample pipeline shows three common metrics collection scenarios:

1. **Stripe Revenue** — Daily revenue sync
2. **GA4 Traffic** — Hourly traffic metrics
3. **Google Ads Spend** — Daily ad spend tracking

All metrics are recorded to OpenDash via the `metrics-collector` Worker using service bindings.

## Service Binding Integration

The pipeline uses a **service binding** to call the metrics-collector Worker directly (no HTTP overhead):

```typescript
// In wrangler.jsonc
"services": [
  {
    "binding": "METRICS_COLLECTOR",
    "service": "metrics-collector",
    "environment": "production"
  }
]

// In code
const result = await env.METRICS_COLLECTOR.recordMetric({
  id: "metric-id",
  source: "stripe",
  // ... metric fields
});
```

## Deployment

```bash
cd workers/sample-scram-jet-pipeline
npm install
wrangler deploy
```

## Testing

### Local Dev

```bash
npm run dev
# Then curl http://localhost:8787/stripe
```

### Manual Triggers

```bash
# Record Stripe revenue
curl https://sample-scram-jet-pipeline.apiservices.workers.dev/stripe

# Record GA4 traffic
curl https://sample-scram-jet-pipeline.apiservices.workers.dev/traffic

# Record Google Ads spend
curl https://sample-scram-jet-pipeline.apiservices.workers.dev/ads
```

## Real Scram Jet Configuration

In production Scram Jet, configure scheduled triggers:

```yaml
# Scram Jet pipeline config
name: metrics-pipeline
version: 1.0.0

triggers:
  - type: schedule
    cron: "0 1 * * *"  # Daily at 1am UTC
    handler: stripeRevenueMetric

  - type: schedule
    cron: "0 * * * *"  # Hourly
    handler: marketingTrafficMetric

  - type: schedule
    cron: "0 2 * * *"  # Daily at 2am UTC
    handler: adSpendMetric
```

## Metrics Recorded

### Stripe Revenue
- **ID**: `stripe-revenue-YYYY-MM-DD`
- **Source**: `stripe`
- **Priority**: `high`
- **Category**: `revenue`
- **Metadata**: `{totalDollars, transactionCount, averageOrderValue}`

### GA4 Traffic
- **ID**: `ga4-traffic-{timestamp}`
- **Source**: `ga4`
- **Priority**: `normal`
- **Category**: `traffic`
- **Metadata**: `{pageviews, sessions, bounceRate}`

### Google Ads Spend
- **ID**: `google-ads-spend-YYYY-MM-DD`
- **Source**: `google-ads`
- **Priority**: `normal`
- **Category**: `ads`
- **Metadata**: `{dailySpend, currency, campaignCount, impressions, clicks}`

## Monitoring

View metrics in OpenDash:

```bash
# Get all metrics
curl https://opendash.ai/api/metrics

# Filter by source
curl "https://opendash.ai/api/metrics?source=stripe"

# Filter by priority
curl "https://opendash.ai/api/metrics?priority=high"
```

## Error Handling

All handlers include try-catch for robustness:

```typescript
// Errors logged to Cloudflare dashboard
// Failed metrics return 500 with error message
{
  "status": "error",
  "error": "Failed to record metric: ..."
}
```

## Next Steps

1. **Real Data Integration** — Replace sample data with actual API calls
   - Stripe SDK for revenue
   - GA4 Reporting API for traffic
   - Google Ads API for spend

2. **Error Retries** — Add exponential backoff for failed metrics

3. **Batch Recording** — Optimize by batching multiple metrics

4. **Monitoring** — Set up alerts for pipeline failures

5. **Caching** — Cache API responses to avoid rate limiting
