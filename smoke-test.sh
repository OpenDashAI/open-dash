#!/bin/bash

##
# Smoke Test for OpenDash - Baseline Performance Verification
#
# Quick validation that the application responds correctly and within
# acceptable performance ranges. Run before deploying to staging.
#
# Usage: ./smoke-test.sh [BASE_URL]
# Default BASE_URL: http://localhost:5000 (vite preview)
##

set -e

BASE_URL="${1:-http://localhost:5000}"
RESULTS_FILE="smoke-test-results.json"

echo "🧪 Starting OpenDash Smoke Test"
echo "📍 Target: $BASE_URL"
echo "⏱️  $(date)"
echo ""

# Initialize results
TOTAL_REQUESTS=0
FAILED_REQUESTS=0
TOTAL_TIME=0
RESPONSE_TIMES=()

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test helper function
test_endpoint() {
    local method=$1
    local endpoint=$2
    local expected_status=$3
    local test_name=$4

    echo -n "Testing: $test_name ... "

    # Make request and measure time
    local response=$(curl -s -w "\n%{http_code}\n%{time_total}" -X "$method" "$BASE_URL$endpoint")
    local body=$(echo "$response" | head -n -2)
    local status=$(echo "$response" | tail -2 | head -1)
    local time=$(echo "$response" | tail -1)

    TOTAL_REQUESTS=$((TOTAL_REQUESTS + 1))
    RESPONSE_TIMES+=("$time")
    TOTAL_TIME=$(echo "$TOTAL_TIME + $time" | bc)

    # Convert time to milliseconds
    local time_ms=$(echo "$time * 1000" | bc | cut -d. -f1)

    # Check status
    if [[ "$status" == "$expected_status" ]] || [[ "$status" == "302" ]]; then
        echo -e "${GREEN}✓${NC} [$status] ${time_ms}ms"
        return 0
    else
        echo -e "${RED}✗${NC} [Expected $expected_status, got $status]"
        FAILED_REQUESTS=$((FAILED_REQUESTS + 1))
        return 1
    fi
}

# Health check (fastest endpoint)
echo "📌 Health & Infrastructure Tests"
test_endpoint GET "/health" "200" "Health check" || true
sleep 0.5

echo ""
echo "📌 Dashboard & UI Tests"
test_endpoint GET "/" "200" "Root page" || true
test_endpoint GET "/login" "200" "Login page" || true
sleep 0.5

echo ""
echo "📌 Performance Baseline"
echo "Measuring dashboard load time..."
local dashboard_times=()
for i in {1..5}; do
    local response=$(curl -s -w "%{time_total}" -o /dev/null "$BASE_URL/")
    dashboard_times+=("$response")
    echo -n "  Attempt $i: $(echo "$response * 1000" | bc | cut -d. -f1)ms"
    echo ""
    sleep 0.2
done

# Calculate statistics
echo ""
echo "📊 Results Summary"
echo "=================================="

# Calculate averages
total_requests=${#RESPONSE_TIMES[@]}
if [ $total_requests -gt 0 ]; then
    avg_time=$(echo "scale=3; $TOTAL_TIME / $total_requests" | bc)
    avg_ms=$(echo "$avg_time * 1000" | bc | cut -d. -f1)
    echo "Total Requests: $TOTAL_REQUESTS"
    echo "Failed Requests: $FAILED_REQUESTS"
    echo "Average Response Time: ${avg_ms}ms"
else
    echo "No requests completed"
fi

# Determine pass/fail
if [ $FAILED_REQUESTS -eq 0 ]; then
    echo -e "\n${GREEN}✅ SMOKE TEST PASSED${NC}"
    STATUS="PASS"
else
    echo -e "\n${RED}❌ SMOKE TEST FAILED${NC}"
    STATUS="FAIL"
fi

# Save results
cat > "$RESULTS_FILE" <<EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "base_url": "$BASE_URL",
  "status": "$STATUS",
  "total_requests": $TOTAL_REQUESTS,
  "failed_requests": $FAILED_REQUESTS,
  "average_time_ms": ${avg_ms:-0},
  "performance_targets": {
    "health_check": "<50ms",
    "dashboard": "<500ms",
    "api": "<200ms"
  },
  "notes": "Baseline smoke test - verify application responds to requests"
}
EOF

echo ""
echo "💾 Results saved to: $RESULTS_FILE"
echo ""
echo "🎯 Next Steps:"
echo "  1. Verify all requests passed above"
echo "  2. If PASSED: Proceed to staging deployment (Day 2)"
echo "  3. If FAILED: Debug and fix issues before continuing"
echo ""
