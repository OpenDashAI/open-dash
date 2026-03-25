#!/bin/bash

##
# Configuration and Environment Loading
# Centralized configuration management for deployment scripts
##

set -euo pipefail

# Environment detection
ENVIRONMENT="${ENVIRONMENT:-production}"
DEPLOYMENT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../" && pwd)"

# Deployment configuration
DEPLOYMENT_TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
DEPLOYMENT_ID="deploy_${DEPLOYMENT_TIMESTAMP}_$$"
DEPLOYMENT_LOG="${DEPLOYMENT_DIR}/logs/deployment_${DEPLOYMENT_TIMESTAMP}.log"

# Application configuration
APP_NAME="opendash"
BUILD_DIR="${PROJECT_ROOT}/dist"
MIGRATIONS_DIR="${PROJECT_ROOT}/migrations"

# Performance targets
TARGET_BUILD_TIME=5000          # milliseconds
TARGET_STARTUP_LATENCY=1000     # milliseconds (Cloudflare Error 10021 limit)
TARGET_REQUEST_LATENCY=200      # milliseconds (API endpoints)
TARGET_DASHBOARD_LATENCY=500    # milliseconds
TARGET_ERROR_RATE=0.01          # 1%

# Database configuration
D1_DATABASE_ID="${D1_DATABASE_ID:-}"
D1_BINDING="DB"

# Load .env files
load_env_file() {
    local env_file="$1"

    if [[ ! -f "$env_file" ]]; then
        log_warn "Environment file not found: $env_file"
        return 1
    fi

    # Load env file (skip comments and empty lines)
    while IFS='=' read -r key value; do
        [[ "$key" =~ ^#.*$ ]] && continue
        [[ -z "$key" ]] && continue

        # Trim whitespace
        key=$(echo "$key" | xargs)
        value=$(echo "$value" | xargs)

        export "$key=$value"
    done < "$env_file"

    log_info "Loaded environment: $env_file"
}

# Load environment-specific config
load_environment_config() {
    local env="$1"

    case "$env" in
        staging)
            load_env_file "${PROJECT_ROOT}/.env.staging"
            WRANGLER_ENV="staging"
            ;;
        production)
            load_env_file "${PROJECT_ROOT}/.env.production"
            WRANGLER_ENV="production"
            ;;
        *)
            log_error "Unknown environment: $env"
            return 1
            ;;
    esac
}

# Create deployment log directory
mkdir -p "${DEPLOYMENT_DIR}/logs"

# Load environment config
load_environment_config "$ENVIRONMENT"

export DEPLOYMENT_ID DEPLOYMENT_TIMESTAMP DEPLOYMENT_LOG
export ENVIRONMENT WRANGLER_ENV
export PROJECT_ROOT DEPLOYMENT_DIR BUILD_DIR MIGRATIONS_DIR
export D1_DATABASE_ID D1_BINDING
export TARGET_BUILD_TIME TARGET_STARTUP_LATENCY TARGET_REQUEST_LATENCY TARGET_DASHBOARD_LATENCY TARGET_ERROR_RATE
