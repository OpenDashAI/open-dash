# Week 1 Task 3: Execution Checklist

**Status**: Infrastructure created. Ready for final deployment and verification.

---

## ✅ Prerequisites Complete

- [x] D1 migration created (`migrations/0007_scramjet_metrics.sql`)
- [x] Webhook endpoint created (`src/routes/api/metrics.ts`)
- [x] MetricsPanel component created
- [x] Test pipeline created (`examples/opendash-test-metric.yaml`)
- [x] Secrets configured locally (`.env.local`)
- [x] Wrangler secrets set (OpenDash)
- [x] Scram Jet secrets synced

---

## 🚀 Deployment Steps (Do These Now)

### Step 1: Deploy D1 Migration
```bash
cd /Users/admin/Work/open-dash

# Apply the metrics table migration
wrangler d1 migrations apply open-dash-db

# Verify migration applied
wrangler d1 execute open-dash-db --command "SELECT name FROM sqlite_master WHERE type='table' AND name='metrics';"
```

✅ Success looks like: `metrics` table listed

---

### Step 2: Start OpenDash (Terminal 1)
```bash
cd /Users/admin/Work/open-dash

# Start Wrangler dev server on port 8787
wrangler dev --port 8787
```

⏳ Wait for: `Ready on http://127.0.0.1:8787`

---

### Step 3: Run Verification Tests (Terminal 2)
```bash
cd /Users/admin/Work/open-dash

# Run automated test script
bash TEST-WEBHOOK-ENDPOINT.sh
```

✅ Expected output:
```
TEST 1 PASSED: Metric accepted by webhook
TEST 2 PASSED: Metrics retrieved from D1
TEST 3 PASSED: Invalid secret correctly rejected
```

---

### Step 4: View Dashboard (Terminal 3 - Browser)
```bash
# Start dashboard dev server
npm run dev

# Open browser to http://localhost:5173
# Navigate to Analytics tab
# Look for "Scram Jet Metrics" panel
```

You should see:
- Panel title: "Scram Jet Metrics"
- Test metric from TEST 1 displayed
- Last refresh timestamp

---

### Step 5: Deploy Scram Jet Pipeline

Once tests pass and dashboard shows metrics:

```bash
cd /Users/admin/Work/scram-jet/packages/engine

# Option A: Local testing first
wrangler dev

# Option B: Deploy to production (once verified locally)
wrangler deploy
```

Pipeline will:
- Run every 5 minutes (per schedule)
- Fetch from JSONPlaceholder API
- POST metrics to OpenDash webhook
- MetricsPanel auto-refreshes (30s)

---

## 📋 Test Checklist

After running verification tests:

- [ ] TEST 1 passed (POST with valid secret)
- [ ] TEST 2 passed (GET metrics from D1)
- [ ] TEST 3 passed (invalid secret rejection)
- [ ] Dashboard loads (http://localhost:5173)
- [ ] Analytics tab accessible
- [ ] MetricsPanel visible
- [ ] Test metric displays correctly
- [ ] Last refresh timestamp shows

---

## 🐛 Troubleshooting

### "OpenDash not responding"
**Solution**:
- Verify Terminal 1 has `wrangler dev --port 8787` running
- Check that no other process is using port 8787
- Look for errors in wrangler output

### "TEST 2: No test metrics found"
**Reason**: D1 might not have synced yet (usually <1s)
**Solution**:
- Run test again after 2 seconds
- Or manually check D1: `wrangler d1 execute open-dash-db --command "SELECT COUNT(*) FROM metrics;"`

### "MetricsPanel not appearing"
**Solution**:
- Verify npm run dev is running (Terminal 3)
- Clear browser cache (Cmd+Shift+R)
- Check browser console for errors
- Verify MetricsPanel import in FocusPanel.tsx

### "401 Unauthorized"
**Reason**: Secret mismatch
**Solution**:
```bash
# Verify secret in .env.local
grep SCRAMJET_WEBHOOK_SECRET .env.local

# Verify same secret in Scram Jet
# (no direct way to read, but we set it from .env.local)
```

---

## ✨ Success Criteria

✅ Task 3 Complete When:
1. All 3 tests pass (TEST 1, 2, 3)
2. Metrics visible in dashboard MetricsPanel
3. D1 table has >0 rows
4. <200ms latency confirmed (test output)
5. No errors in console

---

## 📊 Final Verification

After everything is running:

```bash
# Terminal 1: Still running wrangler dev --port 8787
# Terminal 2: Still showing test output (or rerun)
# Terminal 3: Dashboard with metrics showing

# Optional: Manually trigger pipeline
cd /Users/admin/Work/scram-jet/packages/engine
# (pipeline runs automatically every 5 minutes)
# MetricsPanel should show new metrics within 30s
```

---

## 📝 Notes

- **Secrets are synced**: Same SCRAMJET_WEBHOOK_SECRET in both OpenDash and Scram Jet
- **Local copy saved**: Secret saved in `.env.local` (never lost)
- **Auto-refresh**: MetricsPanel refreshes every 30s (configurable)
- **Webhook logs**: Check wrangler output for POST requests
- **D1 queries**: All inserts logged in wrangler tail output

---

## Next: After Successful Deployment

1. **Close wrangler dev** (Ctrl+C in Terminal 1)
2. **Deploy to production**:
   ```bash
   cd /Users/admin/Work/scram-jet/packages/engine
   wrangler deploy
   ```
3. **Deploy OpenDash**:
   ```bash
   cd /Users/admin/Work/open-dash
   wrangler deploy
   ```
4. **Monitor in production**: Check Cloudflare Dashboard

---

**Status**: Ready for deployment. Follow steps 1-5 above.
