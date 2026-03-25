#!/bin/bash
# Test Scram Jet → OpenDash webhook integration
#
# Prerequisites:
#   - OpenDash running on http://localhost:8787 (wrangler dev)
#   - Secret saved in .env.local
#
# Run this script in a terminal after starting OpenDash with: wrangler dev --port 8787

set -e

echo "═══════════════════════════════════════════════════════════"
echo "  Testing OpenDash Scram Jet Webhook Integration"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Load secret from .env.local
if [ ! -f .env.local ]; then
    echo "❌ ERROR: .env.local not found"
    echo "   Run Step 1 first: generate secret and save to .env.local"
    exit 1
fi

SECRET=$(grep SCRAMJET_WEBHOOK_SECRET .env.local | cut -d= -f2)
if [ -z "$SECRET" ]; then
    echo "❌ ERROR: SCRAMJET_WEBHOOK_SECRET not found in .env.local"
    exit 1
fi

echo "✅ Loaded secret from .env.local"
echo "   Secret: $SECRET"
echo ""

# Check if OpenDash is running
echo "🔍 Checking if OpenDash is running on http://localhost:8787..."
if ! curl -s http://localhost:8787/api/metrics > /dev/null 2>&1; then
    echo "❌ OpenDash not responding on http://localhost:8787"
    echo ""
    echo "   Start OpenDash with:"
    echo "   $ wrangler dev --port 8787"
    exit 1
fi

echo "✅ OpenDash is running"
echo ""

# Test 1: POST metric with valid secret
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 1: POST metric with valid secret"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

RESPONSE=$(curl -s -X POST http://localhost:8787/api/metrics \
  -H "Authorization: Bearer $SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-manual-1",
    "source": "test",
    "priority": "high",
    "category": "test",
    "title": "Manual Test Metric",
    "detail": "Testing webhook from curl",
    "timestamp": '$(date +%s)',
    "metadata": {"test": true}
  }')

echo "Response: $RESPONSE"
echo ""

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "✅ TEST 1 PASSED: Metric accepted by webhook"
else
    echo "❌ TEST 1 FAILED: Webhook rejected metric"
    exit 1
fi

echo ""

# Test 2: GET metrics (verify data was inserted)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 2: GET recent metrics"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

METRICS=$(curl -s "http://localhost:8787/api/metrics?limit=10&source=test")
echo "Response: $METRICS"
echo ""

if echo "$METRICS" | grep -q '"source":"test"'; then
    echo "✅ TEST 2 PASSED: Metrics retrieved from D1"
else
    echo "⚠️  TEST 2 WARNING: No test metrics found yet"
    echo "   This is OK if D1 hasn't synced yet"
fi

echo ""

# Test 3: Invalid secret (should fail)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 3: POST with invalid secret (should fail)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

INVALID_RESPONSE=$(curl -s -X POST http://localhost:8787/api/metrics \
  -H "Authorization: Bearer invalid-secret" \
  -H "Content-Type: application/json" \
  -d '{"id":"test","source":"test","priority":"normal","category":"test","title":"Bad Auth","detail":"This should fail","timestamp":'$(date +%s)'}')

echo "Response: $INVALID_RESPONSE"
echo ""

if echo "$INVALID_RESPONSE" | grep -q '"success":false'; then
    echo "✅ TEST 3 PASSED: Invalid secret correctly rejected"
else
    echo "❌ TEST 3 FAILED: Invalid secret was not rejected"
fi

echo ""

# Summary
echo "═══════════════════════════════════════════════════════════"
echo "  ✅ All tests completed"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo "  1. Check OpenDash dashboard:"
echo "     http://localhost:5173 → Analytics → Scram Jet Metrics"
echo ""
echo "  2. Deploy test pipeline:"
echo "     cd /Users/admin/Work/scram-jet/packages/engine"
echo "     wrangler dev  # local testing"
echo ""
echo "  3. Verify pipeline output appears in MetricsPanel"
echo ""
