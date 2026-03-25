#!/bin/bash

##
# Rollback Procedure (Phase 4 Emergency)
# Reverts to previous stable version if deployment fails
#
# Usage: ./rollback.sh [--version GIT_HASH] [--reason REASON]
##

set -euo pipefail

# Parse arguments
TARGET_VERSION=""
ROLLBACK_REASON="Manual rollback requested"

while [[ $# -gt 0 ]]; do
    case "$1" in
        --version)
            TARGET_VERSION="$2"
            shift 2
            ;;
        --reason)
            ROLLBACK_REASON="$2"
            shift 2
            ;;
        *)
            shift
            ;;
    esac
done

# Source utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib/config.sh"
source "${SCRIPT_DIR}/lib/logging.sh"
source "${SCRIPT_DIR}/lib/notifications.sh"

main() {
    log_deployment_header "Emergency Rollback" "production"

    log_error "INITIATING EMERGENCY ROLLBACK"
    log_error "Reason: $ROLLBACK_REASON"

    notify_alert "Deployment Rollback Initiated" "Reason: $ROLLBACK_REASON" "critical"

    # Step 1: Identify target version
    log_step "Step 1: Identifying rollback target..."

    if [[ -z "$TARGET_VERSION" ]]; then
        log_info "No target version specified. Finding previous stable version..."

        # Get previous stable commit (before current HEAD)
        TARGET_VERSION=$(git rev-parse HEAD~1) 2>/dev/null || {
            log_error "Could not identify previous version. Ensure git repo is available."
            notify_deployment_failure "Rollback" "Could not identify previous version"
            return 1
        }

        log_info "Target version: $TARGET_VERSION"
    fi

    # Step 2: Verify target version is available
    log_step "Step 2: Verifying target version..."

    if ! git rev-parse "$TARGET_VERSION" >/dev/null 2>&1; then
        log_error "Target version not found: $TARGET_VERSION"
        notify_deployment_failure "Rollback" "Target version not found"
        return 1
    fi

    log_success "Target version verified: $TARGET_VERSION"

    # Step 3: Check out target version
    log_step "Step 3: Checking out target version..."

    if ! git checkout "$TARGET_VERSION" >/dev/null 2>&1; then
        log_error "Failed to check out target version"
        notify_deployment_failure "Rollback" "Git checkout failed"
        return 1
    fi

    log_success "Checked out version: $TARGET_VERSION"

    # Step 4: Build from target version
    log_step "Step 4: Building application..."

    if ! npm run build >/dev/null 2>&1; then
        log_error "Build failed for rollback version"
        # Try to restore current version
        git checkout - >/dev/null 2>&1 || true
        notify_deployment_failure "Rollback" "Build failed"
        return 1
    fi

    log_success "Build successful"

    # Step 5: Deploy rollback version
    log_step "Step 5: Deploying rollback version to production..."

    if ! wrangler deploy --env production 2>&1 | tee "${DEPLOYMENT_LOG}.rollback"; then
        log_error "Deployment failed during rollback"
        notify_deployment_failure "Rollback" "Deployment to Cloudflare failed"
        return 1
    fi

    log_success "Rollback version deployed"

    # Step 6: Verify rollback
    log_step "Step 6: Verifying rollback..."

    sleep 5

    if ! curl -s -f "https://opendash.app/health" >/dev/null 2>&1; then
        log_error "Rollback verification failed - health check not responding"
        notify_deployment_failure "Rollback" "Health check failed after rollback"
        return 1
    fi

    log_success "Rollback verified - application responding"

    # Summary
    log_separator

    cat <<EOF
╔═══════════════════════════════════════════════════════════╗
║        EMERGENCY ROLLBACK COMPLETED SUCCESSFULLY          ║
╚═══════════════════════════════════════════════════════════╝

Previous Version Restored:  $TARGET_VERSION
Reason:                     $ROLLBACK_REASON
Deployment ID:              $DEPLOYMENT_ID
Timestamp:                  $(date)

Action Required:
1. Investigate cause of deployment failure
2. Review error logs from failed deployment
3. Fix the issue and prepare new deployment
4. Notify team of rollback action

═══════════════════════════════════════════════════════════
EOF

    log_deployment_footer "Emergency Rollback" "SUCCESS"

    # Notify success and that investigation is needed
    notify_alert "Rollback Completed Successfully" \
        "Rolled back to version: $TARGET_VERSION\nReason: $ROLLBACK_REASON\nImmediate investigation required." \
        "critical"

    return 0
}

# Run main function
main "$@"
