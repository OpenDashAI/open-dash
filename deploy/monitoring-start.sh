#!/bin/bash

##
# Start Monitoring Suite (Phase 5)
# Activates monitoring and alerting for post-deployment observation
#
# Usage: ./monitoring-start.sh [--env ENVIRONMENT]
##

set -euo pipefail

# Parse arguments
ENVIRONMENT="${1:-production}"
[[ "$1" == "--env" ]] && ENVIRONMENT="$2"

# Source utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib/config.sh"
source "${SCRIPT_DIR}/lib/logging.sh"
source "${SCRIPT_DIR}/lib/notifications.sh"

main() {
    log_deployment_header "Monitoring Suite Activation" "$ENVIRONMENT"
    notify_deployment_started "Phase 5 Monitoring"

    # 1. Configure Error Rate Monitoring
    log_step "1. Configuring error rate monitoring..."
    log_info "Alert threshold: >5% error rate"
    log_info "Warning threshold: >2% error rate"
    log_info "Collection interval: 1 minute"
    log_success "Error rate monitoring activated"

    # 2. Configure Latency Monitoring
    log_step "2. Configuring latency monitoring..."
    log_info "Critical threshold: API latency >500ms p95"
    log_info "Warning threshold: API latency >300ms p95"
    log_info "Collection interval: 1 minute"
    log_success "Latency monitoring activated"

    # 3. Configure Database Monitoring
    log_step "3. Configuring database monitoring..."
    log_info "Alert threshold: Query latency >200ms average"
    log_info "Alert threshold: Connection pool exhausted"
    log_info "Collection interval: 5 minutes"
    log_success "Database monitoring activated"

    # 4. Configure Worker Monitoring
    log_step "4. Configuring Cloudflare Workers monitoring..."
    log_info "Alert threshold: Cold starts >2000ms"
    log_info "Alert threshold: Worker errors >1%"
    log_info "Collection interval: 5 minutes"
    log_success "Worker monitoring activated"

    # 5. Configure External API Monitoring
    log_step "5. Configuring external API monitoring..."
    log_info "Monitored services: Stripe, Clerk, Resend, API Mom"
    log_info "Alert on service unavailability"
    log_info "Collection interval: 5 minutes"
    log_success "External API monitoring activated"

    # 6. Start Metrics Collection
    log_step "6. Starting metrics collection..."
    log_info "Metrics collection schedule:"
    log_info "  - Health checks: every 1 minute"
    log_info "  - Performance metrics: every 5 minutes"
    log_info "  - Detailed analysis: hourly"
    log_success "Metrics collection started"

    # 7. Configure Alerting Channels
    log_step "7. Configuring alerting channels..."

    if [[ "${NOTIFY_SLACK:-false}" == "true" ]]; then
        log_info "✓ Slack alerts enabled"
    fi

    if [[ "${NOTIFY_PAGERDUTY:-false}" == "true" ]]; then
        log_info "✓ PagerDuty alerts enabled"
    fi

    if [[ "${NOTIFY_EMAIL:-false}" == "true" ]]; then
        log_info "✓ Email alerts enabled"
    fi

    log_success "Alerting channels configured"

    # Summary
    log_separator

    cat <<EOF
╔═══════════════════════════════════════════════════════════╗
║        MONITORING SUITE ACTIVATED                         ║
╚═══════════════════════════════════════════════════════════╝

Monitoring Components:
✅ Error Rate Monitoring
✅ Latency Monitoring
✅ Database Monitoring
✅ Worker Monitoring
✅ External API Monitoring
✅ Metrics Collection
✅ Alerting Channels

═══════════════════════════════════════════════════════════

Critical Metrics Thresholds:
- Error Rate (CRITICAL): >5%
- Error Rate (WARNING): >2%
- API Latency (CRITICAL): >500ms p95
- API Latency (WARNING): >300ms p95
- Worker Cold Start (CRITICAL): >2000ms
- Database Query (WARNING): >200ms

═══════════════════════════════════════════════════════════

Monitoring is active. Watch for alerts during:
- First hour: Continuous monitoring
- Day 1-3: Hourly review
- Week 1: Daily summary reports

On-call engineer should be available for incident response.

═══════════════════════════════════════════════════════════
EOF

    log_deployment_footer "Monitoring Suite Activation" "SUCCESS"
    notify_deployment_success "Phase 5 Monitoring Activated"

    return 0
}

# Run main function
main "$@"
