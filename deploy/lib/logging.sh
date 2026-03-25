#!/bin/bash

##
# Logging Utilities
# Provides structured logging with timestamps and log levels
##

set -euo pipefail

# Color codes for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

# Log file (set by config.sh)
DEPLOYMENT_LOG="${DEPLOYMENT_LOG:-/tmp/deployment.log}"

# Log levels
LOG_LEVEL_DEBUG=0
LOG_LEVEL_INFO=1
LOG_LEVEL_STEP=2
LOG_LEVEL_WARN=3
LOG_LEVEL_ERROR=4

# Current log level (default: INFO)
CURRENT_LOG_LEVEL=${CURRENT_LOG_LEVEL:-$LOG_LEVEL_INFO}

# Internal logging function
_log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local color="$NC"

    case "$level" in
        DEBUG) color="$GRAY" ;;
        INFO) color="$BLUE" ;;
        STEP) color="$BLUE" ;;
        WARN) color="$YELLOW" ;;
        ERROR) color="$RED" ;;
    esac

    # Format: [TIMESTAMP] [LEVEL] message
    local log_message="[$timestamp] [$level] $message"

    # Output to log file
    echo "$log_message" >> "$DEPLOYMENT_LOG"

    # Output to terminal with color
    if [[ "$level" == "STEP" ]]; then
        echo -e "${color}${message}${NC}"
    elif [[ "$level" == "ERROR" ]]; then
        echo -e "${color}❌ ${message}${NC}" >&2
    elif [[ "$level" == "WARN" ]]; then
        echo -e "${color}⚠️  ${message}${NC}"
    elif [[ "$level" == "SUCCESS" ]]; then
        echo -e "${GREEN}✅ ${message}${NC}"
    else
        echo -e "${color}${message}${NC}"
    fi
}

# Public logging functions
log_debug() {
    if [[ $CURRENT_LOG_LEVEL -le $LOG_LEVEL_DEBUG ]]; then
        _log "DEBUG" "$1"
    fi
}

log_info() {
    if [[ $CURRENT_LOG_LEVEL -le $LOG_LEVEL_INFO ]]; then
        _log "INFO" "$1"
    fi
}

log_step() {
    _log "STEP" "▶ $1"
}

log_success() {
    _log "SUCCESS" "$1"
}

log_warn() {
    if [[ $CURRENT_LOG_LEVEL -le $LOG_LEVEL_WARN ]]; then
        _log "WARN" "$1"
    fi
}

log_error() {
    _log "ERROR" "$1"
}

# Separator line
log_separator() {
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> "$DEPLOYMENT_LOG"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Deployment header
log_deployment_header() {
    local phase="$1"
    local environment="$2"

    log_separator
    log_step "DEPLOYMENT PHASE: $phase | Environment: $environment"
    log_info "Deployment ID: $DEPLOYMENT_ID"
    log_info "Started: $(date)"
    log_separator
}

# Deployment footer
log_deployment_footer() {
    local phase="$1"
    local status="$2"

    log_separator
    if [[ "$status" == "SUCCESS" ]]; then
        log_success "$phase completed successfully"
    else
        log_error "$phase failed with status: $status"
    fi
    log_info "Completed: $(date)"
    log_separator
}

# Export functions
export -f log_debug log_info log_step log_success log_warn log_error log_separator log_deployment_header log_deployment_footer
