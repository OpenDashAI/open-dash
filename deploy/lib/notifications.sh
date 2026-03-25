#!/bin/bash

##
# Notifications and Alerting
# Sends deployment status notifications
##

set -euo pipefail

source "$(dirname "${BASH_SOURCE[0]}")/logging.sh"

# Notification channels
NOTIFY_SLACK="${NOTIFY_SLACK:-false}"
NOTIFY_EMAIL="${NOTIFY_EMAIL:-false}"
NOTIFY_PAGERDUTY="${NOTIFY_PAGERDUTY:-false}"

# Slack webhook URL
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
SLACK_CHANNEL="${SLACK_CHANNEL:-#deployments}"

# Email configuration
EMAIL_TO="${EMAIL_TO:-}"
EMAIL_FROM="${EMAIL_FROM:-deployments@opendash.app}"

# PagerDuty integration
PAGERDUTY_TOKEN="${PAGERDUTY_TOKEN:-}"
PAGERDUTY_SERVICE_ID="${PAGERDUTY_SERVICE_ID:-}"

# Send Slack notification
notify_slack() {
    local title="$1"
    local message="$2"
    local status="${3:-info}"
    local color="${4:-0099ff}"

    if [[ "$NOTIFY_SLACK" != "true" ]] || [[ -z "$SLACK_WEBHOOK_URL" ]]; then
        log_debug "Slack notification disabled or not configured"
        return 0
    fi

    local payload=$(cat <<EOF
{
  "channel": "$SLACK_CHANNEL",
  "username": "OpenDash Deployment",
  "icon_emoji": ":rocket:",
  "attachments": [
    {
      "color": "$color",
      "title": "$title",
      "text": "$message",
      "fields": [
        {
          "title": "Deployment ID",
          "value": "$DEPLOYMENT_ID",
          "short": true
        },
        {
          "title": "Environment",
          "value": "$ENVIRONMENT",
          "short": true
        },
        {
          "title": "Timestamp",
          "value": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
          "short": true
        }
      ]
    }
  ]
}
EOF
    )

    log_info "Sending Slack notification: $title"
    curl -s -X POST -H 'Content-type: application/json' \
        --data "$payload" \
        "$SLACK_WEBHOOK_URL" > /dev/null

    return 0
}

# Send email notification
notify_email() {
    local subject="$1"
    local message="$2"

    if [[ "$NOTIFY_EMAIL" != "true" ]] || [[ -z "$EMAIL_TO" ]]; then
        log_debug "Email notification disabled or not configured"
        return 0
    fi

    local body=$(cat <<EOF
Subject: $subject
From: $EMAIL_FROM
To: $EMAIL_TO

Deployment: $DEPLOYMENT_ID
Environment: $ENVIRONMENT
Time: $(date)

$message

---
OpenDash Deployment System
EOF
    )

    log_info "Sending email notification to: $EMAIL_TO"
    # This would need a mail server configured
    # echo "$body" | sendmail -t
    # For now, just log the intent
    log_debug "Email body: $body"

    return 0
}

# Send PagerDuty alert
notify_pagerduty() {
    local title="$1"
    local message="$2"
    local severity="${3:-error}"  # critical, error, warning, info

    if [[ "$NOTIFY_PAGERDUTY" != "true" ]] || [[ -z "$PAGERDUTY_TOKEN" ]]; then
        log_debug "PagerDuty notification disabled or not configured"
        return 0
    fi

    local payload=$(cat <<EOF
{
  "routing_key": "$PAGERDUTY_TOKEN",
  "event_action": "trigger",
  "dedup_key": "$DEPLOYMENT_ID",
  "payload": {
    "summary": "$title",
    "severity": "$severity",
    "source": "OpenDash Deployment",
    "custom_details": {
      "deployment_id": "$DEPLOYMENT_ID",
      "environment": "$ENVIRONMENT",
      "message": "$message",
      "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    }
  }
}
EOF
    )

    log_info "Sending PagerDuty alert: $title"
    curl -s -X POST "https://events.pagerduty.com/v2/enqueue" \
        -H "Content-Type: application/json" \
        -d "$payload" > /dev/null

    return 0
}

# Notify deployment started
notify_deployment_started() {
    local phase="$1"

    local title="🚀 Deployment Started: $phase"
    local message="Deployment ID: $DEPLOYMENT_ID\nEnvironment: $ENVIRONMENT\nPhase: $phase"

    notify_slack "$title" "$message" "info" "0099ff"
    notify_email "Deployment Started - $phase" "$message"

    log_info "Deployment started notification sent"
}

# Notify deployment success
notify_deployment_success() {
    local phase="$1"

    local title="✅ Deployment Successful: $phase"
    local message="Phase $phase completed successfully.\nDeployment ID: $DEPLOYMENT_ID\nEnvironment: $ENVIRONMENT"

    notify_slack "$title" "$message" "info" "28a745"
    notify_email "Deployment Successful - $phase" "$message"

    log_success "Deployment success notification sent"
}

# Notify deployment failure
notify_deployment_failure() {
    local phase="$1"
    local reason="${2:-Unknown error}"

    local title="❌ Deployment Failed: $phase"
    local message="Phase $phase failed.\nReason: $reason\nDeployment ID: $DEPLOYMENT_ID\nEnvironment: $ENVIRONMENT"

    notify_slack "$title" "$message" "error" "dc3545"
    notify_email "Deployment Failed - $phase" "$message"
    notify_pagerduty "$title" "$message" "critical"

    log_error "Deployment failure notification sent"
}

# Notify alert
notify_alert() {
    local alert_name="$1"
    local alert_message="$2"
    local severity="${3:-warning}"

    local title="⚠️  Alert: $alert_name"
    local message="$alert_message\nDeployment ID: $DEPLOYMENT_ID\nEnvironment: $ENVIRONMENT"

    if [[ "$severity" == "critical" ]]; then
        notify_slack "$title" "$message" "error" "dc3545"
        notify_pagerduty "$title" "$message" "critical"
    else
        notify_slack "$title" "$message" "warning" "ffc107"
    fi

    log_warn "Alert notification sent: $alert_name"
}

# Export functions
export -f notify_slack notify_email notify_pagerduty notify_deployment_started notify_deployment_success notify_deployment_failure notify_alert
