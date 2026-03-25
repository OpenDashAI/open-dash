#!/bin/bash

##
# Metrics Collection and Tracking
# Performance metrics and deployment statistics
##

set -euo pipefail

source "$(dirname "${BASH_SOURCE[0]}")/logging.sh"

# Metrics storage
METRICS_FILE="${DEPLOYMENT_DIR}/metrics/metrics_${DEPLOYMENT_TIMESTAMP}.json"
mkdir -p "${DEPLOYMENT_DIR}/metrics"

# Record metric
record_metric() {
    local name="$1"
    local value="$2"
    local unit="${3:-}"
    local timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)

    log_debug "Metric: $name = $value $unit"

    # Append to metrics file (create if doesn't exist)
    if [[ ! -f "$METRICS_FILE" ]]; then
        echo '{"metrics": []}' > "$METRICS_FILE"
    fi

    # This is a simplified implementation. In production, use jq or similar
    echo "  {\"timestamp\": \"$timestamp\", \"name\": \"$name\", \"value\": $value, \"unit\": \"$unit\"}" >> "$METRICS_FILE.tmp"
}

# Measure execution time
measure_time() {
    local name="$1"
    shift
    local start_time=$(date +%s%N)

    # Execute the command
    "$@"
    local exit_code=$?

    local end_time=$(date +%s%N)
    local elapsed_ms=$(( (end_time - start_time) / 1000000 ))

    record_metric "$name" "$elapsed_ms" "ms"
    log_info "$name completed in ${elapsed_ms}ms"

    return $exit_code
}

# Check metric against target
check_metric_threshold() {
    local name="$1"
    local value="$2"
    local threshold="$3"
    local comparison="${4:-le}"  # le (<=), lt (<), ge (>=), gt (>)

    case "$comparison" in
        le) [[ $value -le $threshold ]] && return 0 || return 1 ;;
        lt) [[ $value -lt $threshold ]] && return 0 || return 1 ;;
        ge) [[ $value -ge $threshold ]] && return 0 || return 1 ;;
        gt) [[ $value -gt $threshold ]] && return 0 || return 1 ;;
        *)
            log_error "Unknown comparison operator: $comparison"
            return 1
            ;;
    esac
}

# Verify performance targets
verify_performance_targets() {
    local metric_name="$1"
    local metric_value="$2"
    local target_value="$3"

    log_info "Verifying $metric_name: $metric_value (target: <$target_value)"

    if check_metric_threshold "$metric_name" "$metric_value" "$target_value" "le"; then
        log_success "$metric_name meets target"
        return 0
    else
        log_warn "$metric_name EXCEEDS target: $metric_value > $target_value"
        return 1
    fi
}

# Generate metrics report
generate_metrics_report() {
    local output_file="${1:-${DEPLOYMENT_DIR}/reports/metrics_${DEPLOYMENT_TIMESTAMP}.json}"

    mkdir -p "$(dirname "$output_file")"

    log_step "Generating metrics report..."

    # Create comprehensive metrics report
    cat > "$output_file" <<EOF
{
  "deployment_id": "$DEPLOYMENT_ID",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "environment": "$ENVIRONMENT",
  "metrics": {
    "build_time_ms": 0,
    "deployment_time_ms": 0,
    "startup_latency_ms": 0,
    "api_latency_ms": 0,
    "error_rate": 0.0
  },
  "targets": {
    "build_time_ms": $TARGET_BUILD_TIME,
    "startup_latency_ms": $TARGET_STARTUP_LATENCY,
    "api_latency_ms": $TARGET_REQUEST_LATENCY,
    "dashboard_latency_ms": $TARGET_DASHBOARD_LATENCY,
    "error_rate": $TARGET_ERROR_RATE
  },
  "status": "pending"
}
EOF

    log_success "Metrics report created: $output_file"
}

# Export functions
export -f record_metric measure_time check_metric_threshold verify_performance_targets generate_metrics_report
