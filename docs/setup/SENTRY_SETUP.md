# Sentry Error Tracking Setup Guide

**Version**: 1.0
**Last Updated**: 2026-03-24
**Status**: Ready for implementation

---

## Overview

This guide walks through setting up Sentry error tracking for OpenDash. Sentry captures and alerts on unhandled errors, performance issues, and custom events.

---

## Quick Start (5 minutes)

1. Create Sentry project at https://sentry.io
2. Install `@sentry/cloudflare-workers`
3. Add `SENTRY_DSN` secret to Cloudflare
4. Initialize Sentry in `src/worker.ts`
5. Redeploy and test

---

## Step 1: Create Sentry Project

### 1.1 Sign up (if needed)

```bash
# Visit: https://sentry.io/signup/
# Create account with GitHub/email
# Select organization (or create new)
```

### 1.2 Create new project

```
Organization → Projects → "Create Project"
Select: "Cloudflare Workers" as platform
Select: "Alerts on Errors" (recommended)
Give project a name: "open-dash" (or "open-dash-staging")
Click "Create Project"
```

### 1.3 Copy DSN

After project creation, you'll see:

```
DSN: https://XXXXX@XXXXX.ingest.sentry.io/XXXXX
```

**Copy this value** — you'll need it in Step 3.

---

## Step 2: Install Dependencies

```bash
cd /Users/admin/Work/open-dash

# Install Sentry package
pnpm add @sentry/cloudflare-workers

# Install optional but recommended
pnpm add @sentry/tracing
```

---

## Step 3: Configure Secrets

### 3.1 Set Sentry DSN in Wrangler

```bash
# For production
wrangler secret put SENTRY_DSN
# Paste the DSN from Step 1.3, then Enter

# For staging (if using separate environment)
wrangler secret put SENTRY_DSN --env staging
# Paste staging project DSN
```

**Verify it was set**:
```bash
wrangler secret list | grep SENTRY
# Should show: SENTRY_DSN [hidden]
```

### 3.2 Update `wrangler.jsonc`

Add SENTRY_DSN to comments (for documentation):

```jsonc
{
  "name": "open-dash",
  // ... existing config ...
  // Secrets (set via `wrangler secret put`):
  // - SENTRY_DSN: Sentry project DSN for error tracking
  // - API_MOM_KEY: API Mom proxy key
  // - AUTH_SECRET: Session authentication secret
  // - GITHUB_TOKEN: GitHub PAT for issues/activity
  // - SM_SERVICE_KEY: Scalable Media authentication
}
```

---

## Step 4: Initialize Sentry in Worker

### 4.1 Update `src/worker.ts`

Add Sentry import at top:

```typescript
import * as Sentry from "@sentry/cloudflare-workers";
```

### 4.2 Initialize before fetch handler

Add after the `interface Env` definition:

```typescript
// Initialize Sentry (if DSN is configured)
function initSentry(env: Env) {
  if (!env.SENTRY_DSN) {
    console.warn("SENTRY_DSN not configured, error tracking disabled");
    return;
  }

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.ENVIRONMENT || "production",
    tracesSampleRate: 0.1,  // 10% of requests (perf overhead)
    beforeSend(event) {
      // Filter sensitive data
      if (event.request?.cookies) {
        delete event.request.cookies;
      }
      return event;
    },
  });
}
```

### 4.3 Update Env interface

Add SENTRY_DSN and ENVIRONMENT:

```typescript
interface Env {
  HUD_SOCKET: DurableObjectNamespace;
  AUTH_SECRET: string;
  ALLOWED_IPS: string;
  SM_SERVICE_KEY: string;
  DB: D1Database;
  SENTRY_DSN?: string;        // Add this
  ENVIRONMENT?: string;        // Add this ("production" | "staging")
  [key: string]: unknown;
}
```

### 4.4 Update fetch handler

Call `initSentry(env)` at the start:

```typescript
export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    try {
      // Initialize Sentry
      initSentry(env);

      // Initialize worker context with D1 database
      if (env.DB) {
        initWorkerContext(env.DB);
        metricsTracker.initialize(env.DB);
      }

      // ... rest of handler ...

    } catch (err) {
      // Capture error in Sentry
      Sentry.captureException(err, {
        contexts: {
          request: {
            url: request.url,
            method: request.method,
            headers: {
              "user-agent": request.headers.get("user-agent"),
            },
          },
        },
      });

      console.error("Worker error:", err);
      return Response.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
}
```

---

## Step 5: Capture Different Error Types

### 5.1 Server Function Errors

In `src/server/analytics.ts` and similar files:

```typescript
import * as Sentry from "@sentry/cloudflare-workers";

export async function getTrendingData(input: TrendingInput) {
  try {
    const result = await DB.query(...);
    return result;
  } catch (err) {
    Sentry.captureException(err, {
      tags: {
        function: "getTrendingData",
        datasourceId: input.datasourceId,
      },
    });
    throw err;  // Re-throw so client sees error too
  }
}
```

### 5.2 Datasource Fetch Errors

In datasource adapters (e.g., `src/datasources/github.ts`):

```typescript
async function fetchGitHubIssues(config: DataSourceConfig) {
  try {
    const response = await fetch(`https://api.github.com/repos/...`, {
      headers: { Authorization: `token ${config.env.GITHUB_TOKEN}` },
    });

    if (!response.ok) {
      const error = new Error(`GitHub API error: ${response.status}`);
      Sentry.captureException(error, {
        tags: { datasource: "github", endpoint: "issues" },
        extra: { statusCode: response.status },
      });
      throw error;
    }

    return await response.json();
  } catch (err) {
    Sentry.captureException(err, {
      tags: { datasource: "github" },
    });
    throw err;
  }
}
```

### 5.3 Database Errors

In `src/lib/monitoring.ts`:

```typescript
export async function recordFetch(
  datasourceId: string,
  value: number,
  timestamp: number
) {
  try {
    const result = await DB.prepare(
      "INSERT INTO datasource_metrics ..."
    ).run();

    if (!result.success) {
      throw new Error("D1 insert failed");
    }
  } catch (err) {
    Sentry.captureException(err, {
      tags: {
        function: "recordFetch",
        datasourceId,
      },
      extra: { value, timestamp },
    });
    throw err;
  }
}
```

---

## Step 6: Add Custom Events

### 6.1 Track Important Operations

```typescript
import * as Sentry from "@sentry/cloudflare-workers";

// Track successful deployments
function recordDeployment(brand: string, status: "success" | "failed") {
  Sentry.captureMessage(`Deployment: ${brand} ${status}`, "info", {
    tags: { event: "deployment", brand, status },
  });
}

// Track anomaly detection
function recordAnomaly(datasourceId: string, severity: string, zScore: number) {
  Sentry.captureMessage(
    `Anomaly detected: ${datasourceId}`,
    severity === "critical" ? "error" : "warning",
    {
      tags: { event: "anomaly", datasourceId, severity },
      extra: { zScore },
    }
  );
}
```

---

## Step 7: Create Error Logging Table (Optional)

For archival + local audit trail, create D1 table:

```sql
CREATE TABLE error_logs (
  id TEXT PRIMARY KEY,
  error_id TEXT,              -- Sentry error ID
  timestamp TEXT,
  message TEXT,
  severity TEXT,              -- "error" | "warning" | "info"
  datasource_id TEXT,
  context TEXT,               -- JSON with extra details
  created_at TEXT
);

CREATE INDEX idx_error_logs_timestamp ON error_logs(timestamp DESC);
CREATE INDEX idx_error_logs_datasource ON error_logs(datasource_id);
```

Then in error handler:

```typescript
async function logError(
  db: D1Database,
  errorId: string,
  message: string,
  severity: string,
  context: Record<string, any>
) {
  await db.prepare(`
    INSERT INTO error_logs (
      id, error_id, timestamp, message, severity, context, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    crypto.randomUUID(),
    errorId,
    new Date().toISOString(),
    message,
    severity,
    JSON.stringify(context),
    new Date().toISOString()
  ).run();
}
```

---

## Step 8: Configure Sentry Alerts

### 8.1 Slack Integration

1. Go to Sentry → Organization Settings → Integration
2. Connect Slack
3. Select channel (e.g., #opendash-alerts)
4. Test alert

### 8.2 Create Alert Rule

1. Go to Project → Alerts
2. Create new alert
3. When: "An error event occurs" (or "Error threshold")
4. Send to: Slack
5. Actions: "Send a Slack notification"

**Example rule**:
```
When: Error count > 5 in last 1 hour
Send to: #opendash-alerts
Include: Error message, stack trace, affected service
```

### 8.3 Configure Severity-based Alerts

```
Rule 1 - Critical:
  When: Severity = error AND tags.datasource = stripe
  Send to: #opendash-critical

Rule 2 - Warning:
  When: Severity = warning
  Send to: #opendash-alerts
```

---

## Step 9: Test Error Capture

### 9.1 Trigger a test error

```bash
# Create test error endpoint in worker
# (temporary, for testing only)
if (url.pathname === "/api/test-error") {
  throw new Error("Test error from OpenDash");
}
```

### 9.2 Redeploy and test

```bash
pnpm build
wrangler deploy

# Test error capture
curl https://open-dash.<your-domain>.workers.dev/api/test-error
```

### 9.3 Check Sentry dashboard

1. Go to Sentry → Projects → open-dash
2. Should show new error within 10 seconds
3. Verify all context captured (request URL, headers, etc.)
4. Remove test endpoint after verification

---

## Step 10: Deploy and Monitor

### 10.1 Staging deployment

```bash
# Deploy to staging
wrangler deploy --env staging

# Monitor for 1 hour
# Visit Sentry → open-dash-staging project
# Verify no unexpected errors
```

### 10.2 Production deployment

```bash
# Final deployment
wrangler deploy

# Monitor Sentry for 24h
# Check error rate, top errors, performance
```

---

## Monitoring Checklist

After deploying Sentry, check:

- [ ] Errors appear in Sentry within 10s
- [ ] Slack alerts firing correctly
- [ ] Error grouping working (similar errors grouped)
- [ ] Performance metrics recorded (if enabled)
- [ ] No sensitive data in error messages (passwords, tokens)
- [ ] Release tracking enabled (version in errors)
- [ ] Sourcemaps uploaded (if minified)

---

## Performance Impact

**Sentry overhead**:
- Per-request: <1ms (minimal)
- Memory: <5MB (small)
- Network: ~1-2KB per error (small payload)

**With 10% sample rate**:
- 1000 requests/day = 100 traced (profiled)
- Cost: ~$0.05/day for quota

---

## Troubleshooting

### Errors not appearing in Sentry

**Checklist**:
1. Verify SENTRY_DSN is set: `wrangler secret list | grep SENTRY`
2. Check Sentry initialization: `console.log("Sentry DSN:", env.SENTRY_DSN)`
3. Verify error is actually throwing: `curl /api/test-error`
4. Check Sentry project settings → Inbound Filters (not too strict)
5. Verify rate limits not hit (Sentry settings → Rate Limits)

### Sensitive data in errors

**Filter before sending**:
```typescript
Sentry.init({
  beforeSend(event) {
    // Remove cookies
    if (event.request?.cookies) {
      delete event.request.cookies;
    }
    // Redact authorization header
    if (event.request?.headers) {
      event.request.headers.authorization = "[REDACTED]";
    }
    return event;
  },
});
```

### Performance impact too high

**Reduce sample rate**:
```typescript
Sentry.init({
  tracesSampleRate: 0.01,  // 1% instead of 10%
});
```

### Missing stack traces

**Enable source maps**:
```typescript
Sentry.init({
  includeLocalVariables: true,
  attachStacktrace: true,
});
```

---

## Next Steps

1. **Follow Steps 1-4** to get Sentry working
2. **Test with `/api/test-error`** endpoint
3. **Add error captures** in datasource adapters
4. **Configure Slack alerts** for team notifications
5. **Monitor production** for 24h after launch
6. **Tune alert rules** based on noise levels

---

## Resources

- [Sentry Docs](https://docs.sentry.io/)
- [Cloudflare Workers Integration](https://docs.sentry.io/product/integrations/cloudflare/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Alert Rules](https://docs.sentry.io/product/alerts-notifications/)

---

**Version**: 1.0 (2026-03-24)
**Status**: ✅ Ready to implement
**Estimated Time**: 30 minutes (end-to-end)
