#!/bin/bash

##
# Health Checks and Verification Functions
# Tests for application readiness and system health
##

set -euo pipefail

source "$(dirname "${BASH_SOURCE[0]}")/logging.sh"

# Check if endpoint is responding
check_endpoint() {
    local url="$1"
    local expected_status="${2:-200}"
    local timeout="${3:-5}"

    local response=$(curl -s -w "\n%{http_code}" -m "$timeout" "$url" 2>/dev/null || echo "error")
    local status=$(echo "$response" | tail -1)

    if [[ "$status" == "$expected_status" ]]; then
        return 0
    else
        log_warn "Endpoint check failed: $url (expected $expected_status, got $status)"
        return 1
    fi
}

# Check health endpoint
check_health() {
    local base_url="$1"

    log_info "Checking health endpoint..."
    if check_endpoint "${base_url}/health" "200"; then
        log_success "Health endpoint responding"
        return 0
    else
        log_error "Health endpoint not responding"
        return 1
    fi
}

# Check application startup
check_startup() {
    local base_url="$1"
    local max_retries="${2:-10}"
    local retry_delay="${3:-1}"

    log_info "Checking application startup..."

    local attempt=0
    while [[ $attempt -lt $max_retries ]]; do
        if check_endpoint "${base_url}/health" "200" >/dev/null 2>&1; then
            log_success "Application started successfully"
            return 0
        fi

        attempt=$((attempt + 1))
        if [[ $attempt -lt $max_retries ]]; then
            log_debug "Startup check attempt $attempt/$max_retries, retrying in ${retry_delay}s..."
            sleep "$retry_delay"
        fi
    done

    log_error "Application failed to start within ${max_retries} attempts"
    return 1
}

# Check database connectivity
check_database() {
    local database_url="$1"

    log_info "Checking database connectivity..."

    # This would be implemented based on your database setup
    # For now, just verify the URL is set
    if [[ -z "$database_url" ]]; then
        log_error "Database URL not configured"
        return 1
    fi

    log_success "Database configuration verified"
    return 0
}

# Check required environment variables
check_environment() {
    local required_vars=("$@")

    log_info "Checking required environment variables..."

    local missing_vars=()
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            missing_vars+=("$var")
        fi
    done

    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        log_error "Missing environment variables: ${missing_vars[*]}"
        return 1
    fi

    log_success "All required environment variables configured"
    return 0
}

# Check build output exists
check_build_output() {
    local build_dir="$1"

    log_info "Checking build output..."

    if [[ ! -d "$build_dir" ]]; then
        log_error "Build directory not found: $build_dir"
        return 1
    fi

    if [[ ! -f "$build_dir/index.js" ]]; then
        log_error "Build output incomplete: $build_dir/index.js not found"
        return 1
    fi

    log_success "Build output verified"
    return 0
}

# Check migrations are ready
check_migrations() {
    local migrations_dir="$1"

    log_info "Checking database migrations..."

    if [[ ! -d "$migrations_dir" ]]; then
        log_error "Migrations directory not found: $migrations_dir"
        return 1
    fi

    local migration_count=$(find "$migrations_dir" -name "*.sql" | wc -l)
    if [[ $migration_count -eq 0 ]]; then
        log_error "No migrations found in $migrations_dir"
        return 1
    fi

    log_success "Found $migration_count migrations ready"
    return 0
}

# Comprehensive pre-deployment checks
run_pre_deployment_checks() {
    local base_url="$1"
    local environment="$2"

    log_step "Running pre-deployment health checks..."

    # Check environment
    check_environment "ENVIRONMENT" "D1_DATABASE_ID" || return 1

    # Check build output
    check_build_output "$BUILD_DIR" || return 1

    # Check migrations
    check_migrations "$MIGRATIONS_DIR" || return 1

    # Check application startup (if running locally)
    if [[ "$environment" != "production" ]]; then
        check_startup "$base_url" || return 1
    fi

    log_success "All pre-deployment checks passed"
    return 0
}

# Export functions
export -f check_endpoint check_health check_startup check_database check_environment check_build_output check_migrations run_pre_deployment_checks
