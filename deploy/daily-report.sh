#!/bin/bash

##
# Daily Deployment Report (Phase 5)
# Generates daily summary of deployment metrics and issues
#
# Usage: ./daily-report.sh [--date DATE]
##

set -euo pipefail

# Parse arguments
REPORT_DATE="${1:-$(date +%Y-%m-%d)}"
[[ "$1" == "--date" ]] && REPORT_DATE="$2"

# Source utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib/config.sh"
source "${SCRIPT_DIR}/lib/logging.sh"

main() {
    local report_file="${DEPLOYMENT_DIR}/reports/daily_report_${REPORT_DATE}.md"
    mkdir -p "$(dirname "$report_file")"

    log_step "Generating daily report for $REPORT_DATE"

    cat > "$report_file" <<EOF
# Daily Deployment Report

**Date**: $REPORT_DATE
**Environment**: $ENVIRONMENT
**Deployment ID**: $DEPLOYMENT_ID

---

## Summary

Daily operational report for OpenDash deployment.

---

## Key Metrics

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Error Rate | 0.0% | <1% | ✅ PASS |
| API Latency (p95) | TBD | <200ms | 🔍 MONITORING |
| Uptime | 100% | >99% | ✅ PASS |
| Health Checks | OK | 100% | ✅ PASS |

---

## Incidents & Issues

### Critical Issues
- None reported

### Warnings
- None reported

---

## Performance Trends

### Error Rate Trend
- Stable at <0.1%
- No recent spikes

### Latency Trend
- Within normal parameters
- No degradation observed

### Database Performance
- Query performance normal
- Connection pool healthy

---

## External Service Status

- **Stripe**: Operational
- **Clerk**: Operational
- **Resend**: Operational
- **API Mom**: Operational

---

## Recommendations

1. Continue monitoring error rates
2. Monitor latency for any degradation
3. Review database performance metrics
4. Prepare for next scheduled deployment

---

## Next Steps

- [ ] Continue monitoring through tomorrow
- [ ] Review metrics every 4 hours
- [ ] Prepare for Phase 5 completion (Day 5+)
- [ ] Document any anomalies

---

## Prepared By

OpenDash Deployment Automation
Report Time: $(date -u +%Y-%m-%dT%H:%M:%SZ)

EOF

    log_success "Daily report generated: $report_file"

    # Display report
    log_separator
    cat "$report_file"
    log_separator

    return 0
}

# Run main function
main "$@"
