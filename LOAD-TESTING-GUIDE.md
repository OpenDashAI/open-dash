# Load Testing Guide for Phase 1 Deployment

**Purpose**: Verify OpenDash handles realistic traffic loads before production launch
**Timeline**: Run 3 days before deployment (by March 27)
**Tools**: k6 (Grafana load testing framework)

---

## Prerequisites

### Install k6

```bash
# macOS
brew install k6

# Linux
sudo apt-get install k6

# Or download from https://k6.io/docs/getting-started/installation/
```

### Verify Installation
```bash
k6 version
# Expected output: k6 v0.x.x
```

---

## Performance Targets

| Metric | Target | Acceptable | Alert |
|--------|--------|-----------|-------|
| Dashboard Load Time (p95) | <500ms | <750ms | >1000ms ❌ |
| API Response Time (p95) | <200ms | <300ms | >500ms ❌ |
| Health Check (p95) | <50ms | <100ms | >200ms ⚠️ |
| Error Rate | <1% | <2% | >5% ❌ |
| Worker Cold Start | <1000ms | <1500ms | N/A |

---

## Test Scenarios

### Scenario 1: Baseline Load (Smoke Test)
**Purpose**: Verify nothing is broken
**VUs**: 5 concurrent users
**Duration**: 30 seconds
**Command**:
```bash
k6 run load-test.js --vus 5 --duration 30s
```

**Expected Results**:
- ✅ 0% error rate
- ✅ Dashboard <500ms
- ✅ API <200ms

### Scenario 2: Normal Load (Typical Usage)
**Purpose**: Verify performance under typical traffic
**VUs**: 50 concurrent users
**Duration**: 60 seconds
**Command**:
```bash
k6 run load-test.js --vus 50 --duration 60s
```

**Expected Results**:
- ✅ Error rate <1%
- ✅ Dashboard p95 <500ms
- ✅ API p95 <200ms
- ✅ Rate limiting working (some 429 responses expected)

### Scenario 3: Peak Load (Expected Peak Traffic)
**Purpose**: Verify system handles peak usage
**VUs**: 100 concurrent users
**Duration**: 120 seconds
**Command**:
```bash
k6 run load-test.js --vus 100 --duration 120s
```

**Expected Results**:
- ✅ Error rate <2%
- ✅ Dashboard p95 <750ms
- ✅ API p95 <300ms
- ✅ No database timeouts

### Scenario 4: Stress Test (Breaking Point)
**Purpose**: Find the breaking point
**VUs**: 200 concurrent users
**Duration**: 60 seconds
**Command**:
```bash
k6 run load-test.js --vus 200 --duration 60s
```

**Expected Results**:
- Expected to fail at some point
- Goal: Identify failure mode
- Acceptable: Graceful degradation (404s, rate limits)
- Unacceptable: 500 errors, crashed server

---

## Running Load Tests

### Setup

1. **Start development server** (for local testing):
```bash
npm run dev
# Server runs on http://localhost:3000
```

2. **In a new terminal, run load tests**:
```bash
# Run baseline (quick verification)
k6 run load-test.js --vus 5 --duration 30s

# If baseline passes, run normal load
k6 run load-test.js --vus 50 --duration 60s

# If normal load passes, run peak load
k6 run load-test.js --vus 100 --duration 120s
```

### Test with Custom URL

For staging environment:
```bash
BASE_URL=https://staging.opendash.ai k6 run load-test.js --vus 50 --duration 60s
```

For production (before actual deployment):
```bash
BASE_URL=https://app.opendash.ai k6 run load-test.js --vus 50 --duration 60s
```

### Real-time Monitoring

Monitor application while load test runs:

**Terminal 1: Load test**
```bash
k6 run load-test.js --vus 50 --duration 60s
```

**Terminal 2: Watch logs**
```bash
tail -f logs/app.log | grep -E "ERROR|error|warning"
```

**Terminal 3: Monitor resources**
```bash
# macOS
top

# Linux
htop
```

---

## Analyzing Results

### Key Metrics

**1. HTTP Request Duration**
```
http_req_duration: 123ms (p50=120ms, p95=145ms, p99=200ms)
```
- **p50 (median)**: Half of requests faster, half slower
- **p95**: 95% of requests are faster than this
- **p99**: 99% of requests are faster than this

**2. Check Pass Rate**
```
checks: 1234 passed, 56 failed
✅ dashboard returns 200: 100%
✅ dashboard is responsive: 98%
```

**3. Request Distribution**
```
GET /health: 500 requests
GET /competitive-intelligence: 480 requests
GET /api/ci-tools: 460 requests
...
```

### Sample Results Output

```
=== Load Test Summary ===

HTTP Requests: 15,000
Failed: 45 (0.3%)
Duration: 120,000ms
Response Time P95: 245ms
Response Time P99: 312ms

Checks:
  ✅ health check returns 200: 500/500
  ✅ health check is fast: 499/500
  ✅ dashboard loads: 480/480
  ✅ dashboard is responsive: 475/480
  ✅ competitors endpoint responds: 460/460
  ✅ alerts endpoint responds: 440/440
  ✅ rate limiting works: 450/500

=== End Summary ===
```

### Common Issues & Solutions

#### Issue: High Error Rate (>5%)
**Possible Causes**:
- Application overload
- Database connection pool exhausted
- Rate limiting too aggressive
- Missing authentication token

**Solution**:
1. Reduce VUs
2. Check error logs: `tail -f logs/app.log`
3. Verify database is running
4. Check rate limit configuration

#### Issue: High Latency (p95 >1000ms)
**Possible Causes**:
- Database queries slow
- Memory pressure/garbage collection
- Network bottleneck
- External API latency

**Solution**:
1. Run database query profiling
2. Check CPU/memory usage
3. Reduce concurrent requests
4. Check external API response times

#### Issue: Rate Limiting Too Strict
**Symptoms**: Many 429 responses even at 50 VUs

**Solution**:
1. Check rate limit configuration in `src/server/rate-limit-middleware.ts`
2. Adjust limits for testing: `maxRequests: 100, windowSeconds: 60`
3. Re-run test

#### Issue: Worker Timeout Errors (Error 10021)
**Symptoms**: Worker not responding, requests timing out

**Solution**:
1. Verify build time <4 seconds: `npm run build`
2. Check middleware isn't synchronous at startup
3. Verify D1 connection is fast
4. Review application code for blocking operations

---

## Performance Benchmarking

### Comparing Runs

Save results for comparison:
```bash
# First run
k6 run load-test.js --vus 50 --duration 60s -o json=baseline.json

# Second run (after optimization)
k6 run load-test.js --vus 50 --duration 60s -o json=optimized.json

# Compare
k6 stats baseline.json optimized.json
```

### Expected Performance Progression

| Stage | p50 | p95 | p99 | Error Rate |
|-------|-----|-----|-----|-----------|
| Local Dev | 50ms | 100ms | 150ms | 0% |
| After Optimization | 40ms | 80ms | 120ms | 0% |
| Production | 80ms | 150ms | 250ms | <1% |

---

## Pre-Deployment Testing Plan

### Day 1 (March 25) - Baseline
- [x] Install k6
- [ ] Run smoke test (5 VUs, 30s)
- [ ] Document baseline metrics
- [ ] Fix any immediate issues

### Day 2 (March 26) - Load Testing
- [ ] Run normal load test (50 VUs, 60s)
- [ ] Run peak load test (100 VUs, 120s)
- [ ] Monitor database performance
- [ ] Verify rate limiting
- [ ] Confirm error handling

### Day 3 (March 27) - Staging Validation
- [ ] Run load tests against staging environment
- [ ] Verify all secrets configured
- [ ] Test with realistic data volumes
- [ ] Confirm Cloudflare Worker performance
- [ ] Final sign-off before deployment

---

## Deployment Day (March 28)

### Before Going Live

```bash
# Final smoke test on production URL
BASE_URL=https://app.opendash.ai k6 run load-test.js --vus 10 --duration 30s
```

### During First Hour

Monitor these metrics continuously:
- Error rate (should be <0.5%)
- API latency (should be <300ms p95)
- Database connections (should not be maxed out)
- Worker cold starts (should be <1000ms)

### If Issues Arise

1. **Performance degrades**: Reduce traffic, investigate slow queries
2. **Error rate spikes**: Check logs, verify external APIs
3. **Rate limiting hits**: May indicate DDoS, verify legitimate traffic
4. **Database issues**: Check connection pool, query performance

---

## Tools & Resources

### k6 Documentation
- https://k6.io/docs/
- Scripting reference: https://k6.io/docs/javascript-api/
- Cloud option: https://cloud.k6.io/ (for distributed testing)

### Monitoring Tools
- Cloudflare Analytics: Monitor real requests
- Browser DevTools: Network tab for real user experience
- `top`/`htop`: System resource monitoring

### Additional Load Testing

For more advanced testing:
```bash
# Test with custom payload
k6 run load-test.js --vus 50 --duration 60s --env BASE_URL=http://localhost:3000

# Output results to JSON
k6 run load-test.js --out json=results.json

# Test with gradual ramp-up
k6 run load-test.js --stage "1m:10" --stage "5m:50" --stage "1m:0"
```

---

## Sign-Off Checklist

- [ ] Smoke test passes (0% errors)
- [ ] Normal load test passes (error rate <1%)
- [ ] Peak load test passes (error rate <2%)
- [ ] Latency targets met (p95 <500ms dashboard, <200ms API)
- [ ] Rate limiting working correctly
- [ ] Error responses are generic (no stack traces)
- [ ] RequestId logging working (appears in X-Request-ID header)
- [ ] Database queries are fast (<100ms)
- [ ] No worker cold start issues
- [ ] Staging environment mirrors production

**Sign-off**: _________________________________ **Date**: _______

---

## Post-Deployment Monitoring

### Day 1 (Launch Day)
- Monitor continuously during peak hours
- Be ready to rollback if issues arise
- Track error rates and latency

### Week 1
- Monitor usage patterns
- Identify any performance issues
- Gather user feedback

### Week 2+
- Analyze usage data
- Plan optimizations based on real traffic
- Prepare Phase 2

---

**Next Steps**: Run load tests and update this document with results.
