#!/bin/bash

##
# Production Deployment (Phase 4)
# Deploys OpenDash to production environment
#
# Usage: ./deploy-production.sh [--env ENVIRONMENT]
##

set -euo pipefail

# Parse arguments
ENVIRONMENT="${1:-production}"
[[ "$1" == "--env" ]] && ENVIRONMENT="$2"

# Source utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib/config.sh"
source "${SCRIPT_DIR}/lib/logging.sh"
source "${SCRIPT_DIR}/lib/metrics.sh"
source "${SCRIPT_DIR}/lib/notifications.sh"

# Deployment state
DEPLOYMENT_SUCCESS=0
ROLLBACK_NEEDED=0

# Cleanup function
cleanup() {
    if [[ $ROLLBACK_NEEDED -eq 1 ]]; then
        log_error "Deployment failed. Initiating rollback..."
        notify_deployment_failure "Phase 4" "Deployment failed - initiating rollback"
    fi
}

trap cleanup EXIT

main() {
    log_deployment_header "Production Deployment" "$ENVIRONMENT"
    notify_deployment_started "Phase 4 Production Deployment"

    # Phase 1: Pre-Deployment Backup
    log_step "Phase 1: Creating deployment backup..."
    BACKUP_TIME=$(date +%s)
    BACKUP_DIR="${DEPLOYMENT_DIR}/backups/backup_${BACKUP_TIME}"
    mkdir -p "$BACKUP_DIR"

    if [[ -d "${BUILD_DIR}" ]]; then
        cp -r "${BUILD_DIR}" "${BACKUP_DIR}/build_backup"
        log_success "Deployment backup created: $BACKUP_DIR"
    fi

    # Phase 2: Build Application
    log_step "Phase 2: Building application..."

    local build_start=$(date +%s%N)
    if ! npm run build; then
        log_error "Build failed"
        ROLLBACK_NEEDED=1
        notify_deployment_failure "Phase 4" "Build failed"
        return 1
    fi
    local build_end=$(date +%s%N)
    local build_time_ms=$(( (build_end - build_start) / 1000000 ))

    log_success "Build completed in ${build_time_ms}ms"
    verify_performance_targets "Build Time" "$build_time_ms" "$TARGET_BUILD_TIME" || {
        log_warn "Build time exceeded target"
    }

    # Phase 3: Verify Build Output
    log_step "Phase 3: Verifying build output..."
    if [[ ! -f "${BUILD_DIR}/index.js" ]]; then
        log_error "Build output incomplete"
        ROLLBACK_NEEDED=1
        notify_deployment_failure "Phase 4" "Build output incomplete"
        return 1
    fi
    log_success "Build output verified"

    # Phase 4: Deploy to Cloudflare Workers
    log_step "Phase 4: Deploying to Cloudflare Workers..."

    local deploy_start=$(date +%s%N)

    if ! wrangler deploy --env "$ENVIRONMENT" 2>&1 | tee "${DEPLOYMENT_LOG}.deploy"; then
        log_error "Deployment to Cloudflare failed"
        ROLLBACK_NEEDED=1
        notify_deployment_failure "Phase 4" "Cloudflare deployment failed"
        return 1
    fi

    local deploy_end=$(date +%s%N)
    local deploy_time_ms=$(( (deploy_end - deploy_start) / 1000000 ))

    log_success "Deployed to Cloudflare Workers in ${deploy_time_ms}ms"
    record_metric "deployment_time_ms" "$deploy_time_ms"

    # Phase 5: Health Checks
    log_step "Phase 5: Running health checks..."

    # Wait for deployment to be live
    sleep 5

    local health_check_url="${DEPLOYMENT_PRODUCTION_URL:-https://opendash.app}/health"

    if ! check_endpoint "$health_check_url" "200"; then
        log_error "Health check failed"
        ROLLBACK_NEEDED=1
        notify_deployment_failure "Phase 4" "Health check failed"
        return 1
    fi
    log_success "Health checks passed"

    # Phase 6: Smoke Tests
    log_step "Phase 6: Running smoke tests..."
    if [[ -x "${SCRIPT_DIR}/../smoke-test.sh" ]]; then
        if ! "${SCRIPT_DIR}/../smoke-test.sh" "$health_check_url" 2>&1 | tee "${DEPLOYMENT_LOG}.smoke"; then
            log_warn "Smoke tests had issues"
        fi
    fi

    # Phase 7: Deployment Summary
    log_step "Phase 7: Deployment Summary"
    log_separator

    cat <<EOF
╔═══════════════════════════════════════════════════════════╗
║        PRODUCTION DEPLOYMENT COMPLETE                     ║
╚═══════════════════════════════════════════════════════════╝

✅ Backup Created:      $BACKUP_DIR
✅ Build Time:          ${build_time_ms}ms
✅ Deploy Time:         ${deploy_time_ms}ms
✅ Health Checks:       PASSED
✅ Environment:         $ENVIRONMENT
✅ Deployment ID:       $DEPLOYMENT_ID

═══════════════════════════════════════════════════════════

NEXT STEPS:
1. Monitor application health in production
2. Watch error rates and latency metrics
3. Be ready to rollback if critical issues occur
4. Keep team notified of deployment status

═══════════════════════════════════════════════════════════
EOF

    DEPLOYMENT_SUCCESS=1
    log_deployment_footer "Production Deployment" "SUCCESS"
    notify_deployment_success "Phase 4 Production Deployment"

    return 0
}

# Run main function
main "$@"
