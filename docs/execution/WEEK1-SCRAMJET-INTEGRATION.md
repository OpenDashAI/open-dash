# Week 1 Execution: Scram Jet Integration Setup

**Dates**: This week (starting 2026-03-25)
**Epic**: EPIC #99 — Scram Jet Connector Layer
**Issue**: #99.1 — Scram Jet Integration Setup
**Effort**: 5 hours
**Priority**: P0 (foundation for everything)

---

## Goal

Prove end-to-end integration works:
```
Scram Jet Pipeline → D1 Metrics Table → Dashboard
```

By EOW: One test pipeline running, metrics visible in dashboard.

---

## Tasks

### Task 1: D1 Schema Setup (1 hour)
**What**: Create D1 table for metrics from Scram Jet

```sql
-- migrations/005_scramjet_metrics.sql
CREATE TABLE IF NOT EXISTS metrics (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,        -- 'stripe', 'ga4', 'ads', etc.
  priority TEXT NOT NULL,      -- 'high', 'normal', 'low'
  category TEXT NOT NULL,      -- 'revenue', 'traffic', 'ads', etc.
  title TEXT NOT NULL,
  detail TEXT NOT NULL,
  timestamp INTEGER NOT NULL,   -- Unix timestamp
  created_at INTEGER NOT NULL,  -- When metric arrived
  metadata TEXT,                -- JSON: {totalDollars: 250, etc.}
  INDEX idx_source_timestamp (source, timestamp DESC),
  INDEX idx_created_at (created_at DESC)
);
```

**Acceptance**:
- [ ] Migration runs without errors
- [ ] Table queryable in D1
- [ ] Indexes created

### Task 2: D1 Webhook Endpoint (1.5 hours)
**What**: Create API endpoint for Scram Jet to POST metrics

```typescript
// src/server/routes/metrics.ts
import { json } from '@tanstack/start';
import { getAuth } from '@/server/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  // Accept POST from Scram Jet with webhook secret
  const auth = request.headers.get('Authorization');
  if (auth !== `Bearer ${process.env.SCRAMJET_WEBHOOK_SECRET}`) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const metric = await request.json();

  // Validate metric shape
  if (!metric.id || !metric.title || !metric.source) {
    return json({ error: 'Invalid metric' }, { status: 400 });
  }

  // Insert to D1
  await db
    .insertInto('metrics')
    .values({
      id: metric.id,
      source: metric.source,
      priority: metric.priority || 'normal',
      category: metric.category || 'unknown',
      title: metric.title,
      detail: metric.detail,
      timestamp: metric.timestamp || Date.now(),
      created_at: Date.now(),
      metadata: metric.metadata ? JSON.stringify(metric.metadata) : null,
    })
    .execute();

  return json({ success: true });
}
```

**Acceptance**:
- [ ] Endpoint responds to POST requests
- [ ] Validates webhook secret
- [ ] Inserts metrics to D1
- [ ] Returns 200 on success

### Task 3: Test Scram Jet Pipeline (1.5 hours)
**What**: Deploy and test end-to-end pipeline from Scram Jet → OpenDash

**Pipeline**: `examples/opendash-test-metric.yaml` (created in `/Users/admin/Work/scram-jet/`)

**Deployment Steps**:
1. Set `SCRAMJET_WEBHOOK_SECRET` in wrangler (Step 1a in guide)
2. Configure secrets in Scram Jet (Step 2)
3. Deploy pipeline (Step 3)
4. Verify end-to-end flow (Step 4)

**Full Guide**: See `docs/SCRAMJET-TEST-DEPLOYMENT.md`

**Acceptance**:
- [ ] Pipeline deploys to Scram Jet successfully
- [ ] Webhook POST received at `/api/metrics`
- [ ] HTTP 200 response with success: true
- [ ] Data inserted to D1 metrics table
- [ ] MetricsPanel displays metric in Analytics view
- [ ] <200ms latency confirmed
- [ ] Auto-refresh working (metrics update every 30s)

### Task 4: Dashboard Integration (1 hour)
**What**: Display metrics from D1 in dashboard

```typescript
// src/routes/index.tsx
import { useSuspenseQuery } from '@tanstack/react-query';

export function MetricsPanel() {
  const { data: metrics } = useSuspenseQuery({
    queryKey: ['metrics', 'recent'],
    queryFn: async () => {
      const res = await fetch('/api/metrics?limit=10');
      return res.json();
    },
  });

  return (
    <div className="space-y-2">
      {metrics.map((metric) => (
        <div key={metric.id} className="border rounded p-3">
          <div className="font-bold">{metric.title}</div>
          <div className="text-sm text-gray-600">{metric.detail}</div>
          <div className="text-xs text-gray-500">{metric.source}</div>
        </div>
      ))}
    </div>
  );
}
```

**Acceptance**:
- [ ] Dashboard queries `/api/metrics`
- [ ] Metrics display correctly
- [ ] Real-time refresh working
- [ ] No errors in console

---

## Deliverables

By EOW:

1. ✅ D1 metrics table created and indexed
2. ✅ `/api/metrics` webhook endpoint working
3. ✅ Test pipeline running and sending data
4. ✅ Metrics visible in dashboard
5. ✅ Documentation updated

---

## Testing Checklist

- [ ] D1 table has >0 rows after pipeline run
- [ ] Dashboard shows metrics from D1
- [ ] Latency <200ms for dashboard load
- [ ] Webhook accepts POST from Scram Jet
- [ ] Webhook rejects invalid requests
- [ ] Metrics persist across refreshes
- [ ] No console errors

---

## Acceptance Criteria

**End of Week Success Looks Like**:
- ✅ Test pipeline running every 5 minutes
- ✅ Metrics flowing into D1
- ✅ Dashboard displays Scram Jet metrics
- ✅ <100ms latency confirmed
- ✅ Ready for #99.2 (YAML templates)

---

## Files to Create/Modify

**Create**:
- `src/server/routes/metrics.ts` (webhook endpoint)
- `migrations/005_scramjet_metrics.sql` (D1 schema)
- `docs/SCRAMJET-INTEGRATION.md` (setup guide)

**Modify**:
- `src/routes/index.tsx` (add MetricsPanel)
- `wrangler.jsonc` (add webhook secret binding)

---

## Timeline

| Task | Duration | Owner | Status |
|------|----------|-------|--------|
| D1 schema | 1h | Backend | ⏳ |
| Webhook endpoint | 1.5h | Backend | ⏳ |
| Test pipeline | 1.5h | DevOps/Backend | ⏳ |
| Dashboard integration | 1h | Frontend | ⏳ |
| **Total** | **5h** | | ⏳ |

---

## Blockers & Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Scram Jet not deployed | High | Deploy from `/Users/admin/Work/scram-jet/` |
| D1 write limits | Low | Batch writes if needed |
| Webhook auth mismatch | Medium | Verify secret in both places |
| Latency over target | Medium | Optimize D1 indexes |
| Scram Jet capability gap | Medium | **File upstream issue + design suggestion** |

## Governance: Upstream Escalation

If Task 3 hits **Scram Jet limitations**, follow this pattern:

1. **Identify blocker** — Document what capability is missing
2. **File issue** — Open issue in Scram Jet GitHub with:
   - Use case (OpenDash connector layer)
   - Current limitation
   - Suggested design/implementation
   - Example YAML
3. **Track in EPIC #99** — Add as blocker with reference to upstream issue
4. **Don't work around** — Keep architecture clean, wait for Scram Jet enhancement

**Known potential blockers to watch for**:
- Webhook secret validation in Scram Jet
- Metadata JSON handling in output operators
- Real-time update guarantees
- Error recovery/retry logic
- Rate limiting/throughput at scale

---

## Next Issue

After #99.1 completes:
→ **Issue #99.2** — YAML Pipeline Templates (4 hours)
- Create templates for Stripe, GA4, Ads, Meta Ads, HubSpot
- Deploy all 5 to Scram Jet
- Validate metrics flowing through

---

**Status**: Ready to start immediately
**Owner**: Full-stack engineer
**Start**: Now
**End**: EOW
