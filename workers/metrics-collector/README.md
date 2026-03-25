# Metrics Collector Worker

Receives metrics from Scram Jet pipelines via Cloudflare service bindings.

## Deployment

```bash
cd workers/metrics-collector
npm install
wrangler deploy -c wrangler.jsonc
```

## Configuration

### For Cloudflare Scram Jet (Primary)

Add service binding to Scram Jet's `wrangler.jsonc`:

```json
{
  "services": [
    {
      "binding": "METRICS_COLLECTOR",
      "service": "metrics-collector",
      "environment": "production"
    }
  ]
}
```

### Usage in Scram Jet Pipeline

```typescript
// In Scram Jet Worker
export default {
  async fetch(request: Request, env: Env) {
    // ... pipeline logic ...

    // Record metric via service binding
    const result = await env.METRICS_COLLECTOR.recordMetric({
      id: "metric-001",
      source: "stripe",
      priority: "high",
      category: "revenue",
      title: "Daily Revenue",
      detail: "Total revenue collected",
      timestamp: Date.now(),
      metadata: {
        totalDollars: 5000,
        transactionCount: 25
      }
    });

    if (result.success) {
      console.log(`Metric recorded: ${result.metricId}`);
    } else {
      console.error(`Metric recording failed: ${result.error}`);
    }
  }
}
```

## API

### `recordMetric(metricData)`

**Parameters:**
- `id` (string, required) — Unique metric ID
- `source` (string, required) — Metric source ('stripe', 'ga4', 'ads', etc.)
- `priority` (enum: 'high'|'normal'|'low', default: 'normal')
- `category` (string, default: 'unknown') — Category for grouping
- `title` (string, required) — Display title
- `detail` (string, required) — Description
- `timestamp` (number, optional) — Unix timestamp in ms
- `metadata` (object, optional) — Flexible additional data

**Returns:**
```typescript
{
  success: boolean;
  metricId?: string;  // If successful
  error?: string;     // If failed
}
```

## Database

Connected to D1 `open-dash-db` and inserts into `metrics` table.

Metrics are stored with:
- Automatic `created_at` timestamp
- JSON-serialized metadata
- Indexed on: source, created_at, priority, category

## Health Check

```bash
curl https://metrics-collector.apiservices.workers.dev/health
# {"status":"ok"}
```

## Fallback: Webhook Endpoint

For non-Cloudflare systems, use the webhook endpoint:

```bash
curl -X POST https://opendash.ai/api/metrics \
  -H "Authorization: Bearer $SCRAMJET_WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "metric-001",
    "source": "stripe",
    "priority": "high",
    "category": "revenue",
    "title": "Daily Revenue",
    "detail": "Total revenue collected",
    "metadata": {"totalDollars": 5000}
  }'
```
