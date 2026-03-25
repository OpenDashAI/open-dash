# Task 3: Deploy Test Scram Jet Pipeline to OpenDash

**Objective**: Deploy test pipeline from `/Users/admin/Work/scram-jet/examples/opendash-test-metric.yaml` to Scram Jet and verify end-to-end flow.

---

## Prerequisites

1. ✅ D1 migrations deployed (`wrangler d1 migrations apply`)
2. ✅ Metrics webhook endpoint running (`src/routes/api/metrics.ts`)
3. ✅ MetricsPanel component in dashboard

---

## Step 1: Set Environment Variables in OpenDash

### ⚠️ CRITICAL: Store Secret Locally First

Wrangler secrets are **write-only** — once set, they cannot be retrieved. You must save the value locally for use across systems.

### 1a. Generate and store webhook secret
```bash
cd /Users/admin/Work/open-dash

# 1. Generate a random secret
SECRET=$(openssl rand -hex 16)
echo "Generated secret: $SECRET"

# 2. SAVE TO .env.local IMMEDIATELY (before setting in Wrangler)
echo "SCRAMJET_WEBHOOK_SECRET=$SECRET" >> .env.local
echo "✅ Saved to .env.local"

# 3. Verify it's saved
grep SCRAMJET_WEBHOOK_SECRET .env.local

# 4. Now set in Wrangler
wrangler secret put SCRAMJET_WEBHOOK_SECRET
# Paste the value from $SECRET or copy from .env.local
```

### 1b. Why this matters
- ✅ Can reference from .env.local in all subsequent steps
- ✅ Scram Jet needs the same secret value
- ✅ Tests can read from .env.local
- ❌ If you only store in Wrangler, you've lost the value forever

### 1b. Get your OpenDash instance URL

For local testing:
```bash
# If running locally with wrangler
export OPENDASH_WEBHOOK_URL="http://localhost:8787"
```

For production:
```bash
export OPENDASH_WEBHOOK_URL="https://opendash.ai"  # Your deployed instance
```

---

## Step 2: Configure Scram Jet Pipeline

### 2a. Navigate to Scram Jet project
```bash
cd /Users/admin/Work/scram-jet
```

### 2b. Create secrets in Scram Jet
```bash
# Load the secret from .env.local (saved in Step 1a)
cd /Users/admin/Work/open-dash
SECRET=$(grep SCRAMJET_WEBHOOK_SECRET .env.local | cut -d= -f2)

# Now set Scram Jet secrets
cd /Users/admin/Work/scram-jet

pnpm exec wrangler secret put OPENDASH_WEBHOOK_URL
# Enter: http://localhost:8787 (or your production URL)

pnpm exec wrangler secret put SCRAMJET_WEBHOOK_SECRET
# Paste: $SECRET (the value from open-dash/.env.local)
echo "Hint: $SECRET"
```

### 2c. Verify pipeline YAML exists
```bash
cat examples/opendash-test-metric.yaml
```

---

## Step 3: Deploy Test Pipeline

### Option A: Local Testing (Recommended First)

```bash
# 1. Start OpenDash locally
cd /Users/admin/Work/open-dash
npm run dev  # Starts at http://localhost:5173

# 2. In another terminal, start wrangler for local testing
wrangler dev --port 8787

# 3. In another terminal, run the test pipeline
cd /Users/admin/Work/scram-jet
pnpm exec npx tsx scripts/run-pipeline.ts examples/opendash-test-metric.yaml
```

### Option B: Deploy to Cloudflare Workers

```bash
cd /Users/admin/Work/scram-jet

# Deploy the entire Scram Jet engine
pnpm run deploy

# Or: Deploy just this pipeline
wrangler publish examples/opendash-test-metric.yaml
```

---

## Step 4: Verify End-to-End Flow

### Check 1: Metrics webhook received data
```bash
# Check OpenDash logs for POST to /api/metrics
# Look for:
# - 200 response
# - metric ID in response body
# - Database insert successful

curl http://localhost:8787/api/metrics \
  -H "Authorization: Bearer $SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-manual",
    "source": "curl-test",
    "priority": "high",
    "category": "test",
    "title": "Manual Test Metric",
    "detail": "Sent via curl",
    "timestamp": '$(date +%s)',
    "metadata": {"test": true}
  }'
```

### Check 2: Metrics in D1
```bash
# Connect to D1 and query metrics
wrangler d1 execute open-dash-db --remote \
  --command "SELECT COUNT(*) as count FROM metrics WHERE source = 'test';"

# Or local testing:
sqlite3 .wrangler/state/d1/workspace_db.sqlite3 \
  "SELECT * FROM metrics WHERE source = 'test' LIMIT 1;"
```

### Check 3: Dashboard displays metrics
1. Open http://localhost:5173 (or your OpenDash instance)
2. Click "Analytics" experience
3. Look for "Scram Jet Metrics" panel
4. Should show recent test metrics with:
   - Source badge (test)
   - Priority indicator (normal/high/low)
   - Title and detail
   - Last refresh timestamp

### Check 4: Real-time auto-refresh
1. In another terminal, manually trigger the pipeline again:
   ```bash
   pnpm exec npx tsx scripts/run-pipeline.ts examples/opendash-test-metric.yaml
   ```
2. MetricsPanel should auto-refresh (30s default) and show new metric

---

## Step 5: Acceptance Checklist

- [ ] Webhook endpoint receives POST from Scram Jet
- [ ] HTTP 200 response returned
- [ ] Data inserted to D1 metrics table
- [ ] MetricsPanel displays metric in Analytics view
- [ ] Real-time refresh working (<5s latency)
- [ ] No console errors
- [ ] Latency <200ms per metric

---

## Troubleshooting

### Issue: 401 Unauthorized from webhook
**Cause**: Webhook secret mismatch
```bash
# Verify secrets match
echo "OpenDash secret:"
grep SCRAMJET_WEBHOOK_SECRET ~/.wrangler/wrangler.toml

echo "Scram Jet secret in pipeline:"
grep SCRAMJET_WEBHOOK_SECRET examples/opendash-test-metric.yaml
```

### Issue: Metrics not appearing in D1
**Cause**: D1 migration not applied
```bash
# Check migrations
wrangler d1 list

# Apply migration
wrangler d1 migrations apply open-dash-db
```

### Issue: MetricsPanel shows "No metrics available"
**Cause**: GET /api/metrics endpoint not accessible or no data
```bash
# Test GET endpoint
curl "http://localhost:8787/api/metrics?limit=10"

# Should return JSON with metrics array
```

### Issue: CORS errors in browser console
**Cause**: Dashboard fetch hitting CORS issue
- Verify OPENDASH_WEBHOOK_URL matches current instance
- For local: use http://localhost:8787
- For production: use https://opendash.ai or your domain

---

## Success Criteria

✅ **Task 3 Complete When**:
1. Test pipeline deploys without errors
2. Scram Jet → OpenDash webhook flow confirmed
3. Metrics visible in D1 table
4. MetricsPanel component displays metrics in dashboard
5. <200ms latency per metric confirmed
6. All tests passing

---

## Next Steps

After Task 3 completes:
- Issue #99.2: Create YAML templates for 5 high-value sources (Stripe, GA4, Ads, Meta, HubSpot)
- Deploy all 5 to Scram Jet
- Validate metrics flowing through to dashboard
