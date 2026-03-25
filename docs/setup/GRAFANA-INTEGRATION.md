# Grafana Integration Guide

Competitive Intelligence metrics are available for Grafana visualization via Prometheus-compatible endpoint.

## Quick Start

### 1. Add Prometheus Data Source in Grafana

1. Go to Grafana: **Configuration** → **Data Sources** → **Add data source**
2. Select **Prometheus**
3. Configure:
   - **Name**: `OpenDash CI`
   - **URL**: `https://your-opendash-domain.com/api/ci-metrics`
   - **Auth**: Configure if needed (e.g., Bearer token)
   - **Scrape Interval**: `60s` (or your preference)
4. Click **Save & Test**

### 2. Import Dashboard

Use the provided dashboard JSON:
1. Create new Dashboard → **Import**
2. Upload `grafana-dashboard.json` (to be generated)
3. Select **OpenDash CI** as the data source

## Available Metrics

### Competitor Monitoring

- `ci_competitors_total` - Total competitors being monitored
- `ci_competitor_domain_authority{competitor="..."}` - Domain Authority (0-100)
- `ci_competitor_traffic_estimate{competitor="..."}` - Monthly traffic estimate
- `ci_competitor_organic_keywords{competitor="..."}` - Organic keywords ranking

### Alert Metrics

- `ci_alerts_critical` - Number of critical alerts in last 24h
- `ci_alerts_recent` - Total recent alerts

### API Usage & Cost

- `ci_api_calls_total` - Total API calls this month
- `ci_api_cost_usd` - Total cost in USD (current period)
- `ci_quota_remaining` - Remaining daily quota

## Example Queries

### Domain Authority Comparison
```promql
ci_competitor_domain_authority
```

### Traffic Trend
```promql
ci_competitor_traffic_estimate
```

### API Cost (last 7 days)
```promql
rate(ci_api_cost_usd[7d])
```

### Critical Alerts Alert
```promql
ci_alerts_critical > 0
```

## Dashboard Examples

### High-Level Overview
- Total competitors monitored
- Critical alerts in last 24h
- API quota remaining
- Monthly API cost

### Competitive Positioning
- Domain Authority comparison chart
- Traffic estimate trend
- Organic keywords growth
- Backlinks analysis

### Cost Management
- API cost trend
- Cost by provider
- Quota usage gauge
- Calls per API

### Alert Timeline
- Alert frequency by severity
- Alert sources (which competitors)
- Alert trends over time

## Alerting Examples

### Set Alert: High DA Competitor
```
ci_competitor_domain_authority > 70
```

### Set Alert: Quota Exceeded
```
ci_quota_remaining < 10
```

### Set Alert: Cost Spike
```
rate(ci_api_cost_usd[1h]) > 2
```

## Authentication

If your OpenDash instance requires authentication:

1. Generate API token: **Settings** → **API Tokens** → **New API Token**
2. In Grafana, add to Prometheus data source:
   - **Headers** → **Add header**
   - **Header**: `Authorization`
   - **Value**: `Bearer YOUR_API_TOKEN`

## Troubleshooting

### Metrics not appearing
1. Check URL is accessible: `curl https://your-domain.com/api/ci-metrics`
2. Verify Grafana can reach OpenDash (firewall, network)
3. Check Grafana logs for connection errors

### Wrong competitor names
Competitor names are sanitized for Prometheus format. Quotes and special characters are escaped.

### No data points
Ensure CI system has been running for at least one interval to generate metrics.

## Advanced: Custom Dashboard

Create custom panels for specific needs:

```json
{
  "targets": [
    {
      "expr": "ci_competitor_domain_authority{competitor=\"Competitor Name\"}"
    }
  ],
  "title": "Competitor DA Trend",
  "type": "graph"
}
```

## Next Steps

1. Set up alerts for critical changes
2. Create executive dashboard
3. Integrate with incident management (PagerDuty, etc.)
4. Export reports with Grafana scheduled reports
