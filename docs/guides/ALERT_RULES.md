# Alert Rules Configuration Guide

**Version**: 1.0
**Last Updated**: 2026-03-24
**Status**: Production-ready

---

## Overview

OpenDash uses alert rules to detect anomalies, monitor trends, and escalate critical issues. Rules are evaluated automatically every 60 seconds against D1 metrics and stored in the `alert_rules` and `alert_history` tables.

---

## Table of Contents

1. [Alert Rule Structure](#alert-rule-structure)
2. [Built-in Alert Types](#built-in-alert-types)
3. [Configuration](#configuration)
4. [Examples](#examples)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

---

## Alert Rule Structure

### Rule Definition (D1 Schema)

```sql
CREATE TABLE alert_rules (
  id TEXT PRIMARY KEY,
  datasource_id TEXT NOT NULL,
  rule_type TEXT NOT NULL,        -- 'anomaly' | 'trend' | 'threshold'
  name TEXT,
  threshold REAL,
  window_minutes INTEGER,
  severity TEXT,                   -- 'low' | 'medium' | 'high' | 'critical'
  enabled BOOLEAN DEFAULT 1,
  created_at TEXT,
  FOREIGN KEY (datasource_id) REFERENCES datasources(id)
);
```

### Rule Properties

| Property | Type | Description | Required |
|----------|------|-------------|----------|
| `id` | string | Unique identifier (UUID or slug) | Yes |
| `datasource_id` | string | Target datasource | Yes |
| `rule_type` | enum | Type of rule (anomaly/trend/threshold) | Yes |
| `name` | string | Human-readable name | Yes |
| `threshold` | number | Numeric threshold (varies by type) | Depends |
| `window_minutes` | integer | Time window for rule evaluation (5-1440) | Yes |
| `severity` | enum | Alert severity level | Yes |
| `enabled` | boolean | Is rule active? | Default: true |

---

## Built-in Alert Types

### 1. Anomaly Detection

Detects statistical outliers using Z-score analysis.

**Configuration**:
```javascript
{
  id: "anomaly-stripe-revenue",
  datasource_id: "stripe",
  rule_type: "anomaly",
  name: "Unusual revenue spike",
  threshold: 3.0,           // Z-score threshold (1=68%, 2=95%, 3=99.7%)
  window_minutes: 60,       // Lookback window
  severity: "high",
  enabled: true
}
```

**How it works**:
- Calculates mean and standard deviation over `window_minutes`
- Compares current value to mean
- Alerts if Z-score > threshold
- Example: `threshold: 3.0` means alert on values >3 standard deviations from mean

**Use cases**:
- Revenue spikes (Stripe)
- Traffic anomalies (analytics)
- Error rate jumps (status metrics)

**Severity Guide**:
- `low` (Z=1.5): 6.7% of data points
- `medium` (Z=2.0): 2.3% of data points
- `high` (Z=3.0): 0.1% of data points
- `critical` (Z=4.0): 0.003% of data points

---

### 2. Trend-based Alerts

Detects sustained changes in metric direction.

**Configuration**:
```javascript
{
  id: "trend-github-pr-velocity",
  datasource_id: "github",
  rule_type: "trend",
  name: "Declining PR velocity",
  threshold: -0.15,         // Trend slope threshold (-1 to 1)
  window_minutes: 1440,     // 24h lookback
  severity: "medium",
  enabled: true
}
```

**How it works**:
- Calculates trend slope using linear regression over `window_minutes`
- Slope ranges from -1 (declining) to +1 (improving)
- Alerts if slope < threshold
- Example: `threshold: -0.15` means alert if metric declining by >15%

**Use cases**:
- Performance degradation (response time trending up)
- Declining metrics (velocity, conversion rate trending down)
- Sustainability checks (CPU usage trending up)

**Threshold Guide**:
- `threshold: -0.10` = alert if declining >10% over window
- `threshold: 0.0` = alert on any decline
- `threshold: 0.10` = alert if improving <10% (unusual improvement)

---

### 3. Threshold-based Alerts

Simple fixed-value threshold crossing.

**Configuration**:
```javascript
{
  id: "threshold-tailscale-offline",
  datasource_id: "tailscale",
  rule_type: "threshold",
  name: "Machine offline",
  threshold: 0,             // Trigger when value <= threshold
  window_minutes: 5,        // Check every 5 minutes
  severity: "critical",
  enabled: true
}
```

**How it works**:
- Compares current metric value to fixed threshold
- Alerts if value <= threshold (for status) or >= threshold (for rates)
- Evaluated every `window_minutes`

**Use cases**:
- Machine status (0 = offline, alert immediately)
- Error count thresholds (alert if >10 errors in window)
- Storage thresholds (alert if disk >90%)
- Timeout thresholds (alert if response time >5000ms)

---

## Configuration

### Adding Rules Programmatically

```typescript
// In src/lib/db/schema.ts or migration file

export async function createAlertRule(
  db: D1Database,
  rule: {
    datasourceId: string;
    ruleType: 'anomaly' | 'trend' | 'threshold';
    name: string;
    threshold: number;
    windowMinutes: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }
) {
  const id = `${rule.ruleType}-${rule.datasourceId}-${Date.now()}`;

  return db
    .prepare(`
      INSERT INTO alert_rules (
        id, datasource_id, rule_type, name, threshold, window_minutes, severity
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      id,
      rule.datasourceId,
      rule.ruleType,
      rule.name,
      rule.threshold,
      rule.windowMinutes,
      rule.severity
    )
    .run();
}
```

### Loading Rules from YAML (Future)

```yaml
# configs/alert-rules.yaml (planned)
stripe:
  - name: "Revenue anomaly"
    type: "anomaly"
    threshold: 3.0
    window_minutes: 60
    severity: "high"

github:
  - name: "PR velocity decline"
    type: "trend"
    threshold: -0.15
    window_minutes: 1440
    severity: "medium"
```

---

## Examples

### Example 1: Stripe Revenue Monitoring

```javascript
// Alert on unusual revenue (>3σ)
{
  id: "stripe-revenue-anomaly",
  datasource_id: "stripe",
  rule_type: "anomaly",
  name: "Stripe: Unusual revenue level",
  threshold: 3.0,        // Z-score: 99.7th percentile
  window_minutes: 60,    // Last hour baseline
  severity: "high",
  enabled: true
}

// Alert on sustained decline (velocity)
{
  id: "stripe-revenue-decline",
  datasource_id: "stripe",
  rule_type: "trend",
  name: "Stripe: Revenue declining",
  threshold: -0.10,      // >10% decline
  window_minutes: 1440,  // Over 24h
  severity: "high",
  enabled: true
}

// Alert on threshold breach (min daily revenue)
{
  id: "stripe-min-revenue",
  datasource_id: "stripe",
  rule_type: "threshold",
  name: "Stripe: Below min daily revenue",
  threshold: 100,        // Alert if daily revenue < $100
  window_minutes: 1440,  // Check daily
  severity: "critical",
  enabled: true
}
```

### Example 2: GitHub Activity Monitoring

```javascript
// Alert on PR velocity drop
{
  id: "github-pr-velocity-drop",
  datasource_id: "github",
  rule_type: "trend",
  name: "GitHub: PR velocity declining",
  threshold: -0.15,      // 15% decline over 7 days
  window_minutes: 10080, // 7 days
  severity: "medium",
  enabled: true
}

// Alert on unusual spike in issues
{
  id: "github-issue-spike",
  datasource_id: "github",
  rule_type: "anomaly",
  name: "GitHub: Unusual issue count",
  threshold: 2.0,        // 2-sigma: 95th percentile
  window_minutes: 120,   // Last 2 hours
  severity: "medium",
  enabled: true
}
```

### Example 3: Tailscale Machine Monitoring

```javascript
// Alert if machine status becomes offline
{
  id: "tailscale-machine-offline",
  datasource_id: "tailscale",
  rule_type: "threshold",
  name: "Tailscale: Machine offline",
  threshold: 0,          // Status 0 = offline
  window_minutes: 5,     // Check every 5 min
  severity: "critical",
  enabled: true
}

// Alert on unusual connection count
{
  id: "tailscale-peers-anomaly",
  datasource_id: "tailscale",
  rule_type: "anomaly",
  name: "Tailscale: Unusual peer count",
  threshold: 2.5,        // 2.5-sigma
  window_minutes: 60,
  severity: "low",
  enabled: true
}
```

---

## Best Practices

### 1. Set Appropriate Thresholds

**Too sensitive** (too many false positives):
- ❌ `anomaly` with `threshold: 1.0` (68% of data)
- ❌ `trend` with `threshold: -0.01` (1% decline)

**Recommended** (balanced):
- ✅ `anomaly` with `threshold: 2.5-3.0` (1-0.1% outliers)
- ✅ `trend` with `threshold: -0.10` (10% decline)

**Too insensitive** (miss real issues):
- ❌ `anomaly` with `threshold: 5.0` (critical only)
- ❌ `trend` with `threshold: -0.50` (50% decline)

### 2. Choose Appropriate Windows

| Metric Type | Recommended Window | Reason |
|-------------|-------------------|--------|
| High-frequency (requests/min) | 5-15 min | Quick detection |
| Daily metrics (revenue/issues) | 1440 min (24h) | Avoid day-of-week noise |
| Weekly trends | 10080 min (7d) | Smooth out daily variance |
| Critical status | 5 min | Immediate notification |

### 3. Use Severity Levels Appropriately

```javascript
// CRITICAL: Immediate action required (page on-call)
threshold: "critical"    // Machine offline, revenue at zero, deployment failed

// HIGH: Investigate within 1 hour
threshold: "high"        // Revenue spike, performance degradation

// MEDIUM: Investigate within 4 hours
threshold: "medium"      // Velocity decline, unusual spike

// LOW: Informational, check daily
threshold: "low"         // Marginal anomaly, minor trend change
```

### 4. Combine Multiple Rules

```javascript
// Instead of one fragile rule:
// ❌ Alert only on anomaly (too sensitive to baselines)

// Use layers:
// ✅ Anomaly (detects spikes)
// ✅ Trend (detects sustained changes)
// ✅ Threshold (detects critical status)
```

### 5. Document Rule Purpose

```javascript
{
  id: "stripe-revenue-anomaly",
  name: "Stripe: Unusual revenue (>3σ spike)",  // Include threshold in name
  // ...
  // Purpose: Detect sudden revenue changes that might indicate fraud,
  //          platform issue, or unexpected campaign success
}
```

---

## Troubleshooting

### Alert Not Triggering

**Symptom**: Rule is enabled but no alerts fired

**Checklist**:
1. Verify datasource has recent metrics:
   ```sql
   SELECT COUNT(*) FROM datasource_metrics
   WHERE datasource_id = 'stripe'
   AND timestamp > datetime('now', '-1 hour')
   ```

2. Check rule is enabled:
   ```sql
   SELECT enabled FROM alert_rules WHERE id = 'stripe-revenue-anomaly'
   ```

3. Review threshold appropriateness:
   ```sql
   -- For anomaly rules, check actual Z-scores
   SELECT
     (current_value - avg_value) / stddev_value as z_score
   FROM (
     SELECT
       last_value as current_value,
       avg(value) as avg_value,
       stddev(value) as stddev_value
     FROM datasource_metrics
     WHERE datasource_id = 'stripe'
   )
   -- If z_score < threshold, rule won't trigger
   ```

### Too Many False Positives

**Symptom**: Alert firing for every minor spike

**Solutions**:
1. Increase threshold (Z-score from 2.0 to 3.0)
2. Extend window (5min to 60min) for stable baseline
3. Change rule type (anomaly → trend for gradual changes)

### Rule Disabled Unexpectedly

**Cause**: Manual disable during investigation

**Recovery**:
```sql
-- Find disabled rules
SELECT * FROM alert_rules WHERE enabled = 0

-- Re-enable after investigation
UPDATE alert_rules SET enabled = 1 WHERE id = 'stripe-revenue-anomaly'
```

---

## Configuration Checklist

- [ ] Created alert rules for critical services (Stripe, GitHub, Tailscale)
- [ ] Set appropriate severity levels
- [ ] Tested thresholds with historical data
- [ ] Documented rule purpose and thresholds
- [ ] Configured Sentry alert rules (error count > 5 in 1h)
- [ ] Verified rules fire correctly in staging
- [ ] Team aware of alert escalation path
- [ ] Alert dashboards accessible (Sentry + Cloudflare)
- [ ] Runbook created for critical alerts

---

## Additional Resources

- [Alert Rule Schema](./src/lib/db/schema.ts) — D1 table definitions
- [Alert Evaluation Logic](./src/lib/analytics/alerts.ts) — Rule evaluation code
- [Monitoring Guide](./DEPLOYMENT.md#monitoring--debugging) — Operational monitoring
- [OpenDash README](./README.md) — Project overview

---

**Last Reviewed**: 2026-03-24
**Next Review**: 2026-04-24
**Status**: ✅ Production Ready
