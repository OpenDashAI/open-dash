# D1 Database Setup & Migrations

This guide explains how to set up and manage the OpenDash D1 database.

## Quick Start

### 1. Create D1 Database

```bash
# Create database via Wrangler
wrangler d1 create opendash

# This generates a binding in wrangler.jsonc
# Add to [[env.production.d1_databases]]:
# name = "opendash"
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 2. Create Tables

Use Wrangler to execute SQL:

```bash
wrangler d1 execute opendash --file=src/lib/db/migrations/001_init.sql
```

Or use the SQL from `migrations/001_init.sql` in the Cloudflare dashboard.

### 3. Verify Installation

```bash
# Test connection
curl https://opendash.ai/api/health
```

## Migrations

### Drizzle Migrations (Future)

Once Drizzle migration tooling is set up:

```bash
# Generate migration from schema changes
drizzle-kit generate:sqlite --out src/lib/db/migrations

# Run migration
wrangler d1 execute opendash --file=src/lib/db/migrations/002_add_alerts.sql
```

### Manual Migrations

SQL files are in `src/lib/db/migrations/`:
- `001_init.sql` — Initial schema (4 tables)
- `002_add_*.sql` — Future schema updates

## Schema Overview

### datasource_metrics (Time-Series)

```sql
CREATE TABLE datasource_metrics (
  id TEXT PRIMARY KEY,
  datasourceId TEXT NOT NULL,
  datasourceName TEXT NOT NULL,
  timestamp INTEGER NOT NULL,        -- unix ms
  fetchLatency INTEGER NOT NULL,     -- milliseconds
  errorRate REAL NOT NULL,           -- 0-1
  connected BOOLEAN NOT NULL,
  healthStatus TEXT NOT NULL,        -- healthy|degraded|critical
  brandId TEXT,
  createdAt INTEGER NOT NULL
);

-- Indices
CREATE INDEX idx_datasource_timestamp ON datasource_metrics(datasourceId, timestamp DESC);
CREATE INDEX idx_brand_timestamp ON datasource_metrics(brandId, timestamp DESC);
CREATE INDEX idx_datasource_health ON datasource_metrics(datasourceId, healthStatus);
```

### datasource_status (Current State)

```sql
CREATE TABLE datasource_status (
  id TEXT PRIMARY KEY,
  datasourceName TEXT NOT NULL,
  connected BOOLEAN NOT NULL,
  lastFetch INTEGER,
  lastError TEXT,
  currentLatency INTEGER,
  errorRate REAL DEFAULT 0,
  healthStatus TEXT,                 -- healthy|degraded|critical
  uptime24h REAL DEFAULT 1,          -- 0-1
  mtbf INTEGER,                      -- seconds
  updatedAt INTEGER NOT NULL
);
```

### alert_rules (Configuration)

```sql
CREATE TABLE alert_rules (
  id TEXT PRIMARY KEY,
  datasourceId TEXT NOT NULL,
  datasourceName TEXT,
  ruleType TEXT NOT NULL,            -- latency|error_rate|downtime|sla
  threshold REAL NOT NULL,
  alertChannels TEXT NOT NULL,       -- JSON array
  enabled BOOLEAN DEFAULT 1,
  cooldownSeconds INTEGER DEFAULT 3600,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

CREATE INDEX idx_datasource_rules ON alert_rules(datasourceId);
CREATE INDEX idx_enabled_rules ON alert_rules(enabled);
```

### alert_history (Audit Log)

```sql
CREATE TABLE alert_history (
  id TEXT PRIMARY KEY,
  ruleId TEXT NOT NULL,
  datasourceId TEXT NOT NULL,
  state TEXT NOT NULL,               -- triggered|acknowledged|resolved
  triggeredAt INTEGER NOT NULL,
  acknowledgedAt INTEGER,
  acknowledgedBy TEXT,
  resolvedAt INTEGER,
  message TEXT,
  context TEXT,                      -- JSON
  createdAt INTEGER NOT NULL
);

CREATE INDEX idx_rule_alerts ON alert_history(ruleId);
CREATE INDEX idx_datasource_history ON alert_history(datasourceId);
CREATE INDEX idx_state_triggered ON alert_history(state, triggeredAt);
```

## Query Examples

### Insert Metric

```typescript
import { getDb } from '@/lib/db';
import { datasourceMetricsTable } from '@/lib/db/schema';

const db = getDb();
await db.insert(datasourceMetricsTable).values({
  id: crypto.randomUUID(),
  datasourceId: 'stripe',
  datasourceName: 'Stripe',
  timestamp: Date.now(),
  fetchLatency: 250,
  errorRate: 0.05,
  connected: true,
  healthStatus: 'healthy',
});
```

### Query Last 24h Metrics

```typescript
import { getMetricsLastNHours } from '@/lib/db';

const metrics = await getMetricsLastNHours(db, 'stripe', 24);
console.log(metrics); // array of metrics
```

### Get Aggregated Statistics

```typescript
import { getMetricsAggregate } from '@/lib/db';

const now = Date.now();
const stats = await getMetricsAggregate(
  db,
  'stripe',
  now - 24 * 3600000, // 24h ago
  now
);

console.log(stats[0]); // {
//   avgLatency: 250,
//   maxLatency: 1000,
//   avgErrorRate: 0.05,
//   totalSamples: 96
// }
```

## Retention Policy

### Metrics Retention

- Keep metrics for **30 days** (default)
- Delete records older than 30 days nightly
- Aggregate to hourly summaries before deletion (future)

SQL:
```sql
DELETE FROM datasource_metrics
WHERE timestamp < cast(strftime('%s', 'now', '-30 days') * 1000 as integer);
```

### Alert History Retention

- Keep alerts for **90 days**
- Export to R2 archive before deletion (future)

## Performance Considerations

### Indexing Strategy

1. **Primary query pattern**: `datasourceId + timestamp DESC`
   - Used for trending, recent metrics
   - Index: `idx_datasource_timestamp`

2. **Secondary pattern**: Brand-scoped queries
   - Used for dashboard views
   - Index: `idx_brand_timestamp`

3. **Health status lookup**: `datasourceId + healthStatus`
   - Used for alert rule matching
   - Index: `idx_datasource_health`

### Query Optimization

```typescript
// ✅ Good: Uses index
SELECT * FROM datasource_metrics
WHERE datasourceId = 'stripe'
ORDER BY timestamp DESC
LIMIT 100;

// ❌ Slow: Full table scan
SELECT * FROM datasource_metrics
WHERE errorRate > 0.5
ORDER BY timestamp DESC;
```

## Monitoring

### Table Sizes

```sql
SELECT name, SUM(pgsize) as bytes
FROM dbstat
WHERE aggregate = TRUE
GROUP BY name;
```

### Index Health

```sql
-- Find unused indices
SELECT * FROM pragma_index_info('idx_datasource_timestamp');
```

### Query Performance

Use Wrangler analytics:
```bash
wrangler d1 analyze opendash
```

## Troubleshooting

### Connection Issues

1. Check binding in `wrangler.jsonc`
2. Verify D1 database exists: `wrangler d1 list`
3. Check permissions: ensure Worker has D1 access

### Schema Mismatches

If Drizzle types don't match database:

1. Check migrations applied
2. Verify column types and nullability
3. Re-run initialization: `wrangler d1 execute opendash --file=migrations/001_init.sql`

### Performance Issues

1. Check indices exist: `PRAGMA index_list('table_name')`
2. Analyze query plans: `EXPLAIN QUERY PLAN SELECT ...`
3. Consider vacuuming: `VACUUM;`

## Backup & Restore

### Backup

```bash
# Export to SQL file
wrangler d1 export opendash > backup.sql

# Upload to R2
aws s3 cp backup.sql s3://opendash-backups/$(date +%Y%m%d).sql
```

### Restore

```bash
# Create new database
wrangler d1 create opendash-restored

# Restore from SQL
wrangler d1 execute opendash-restored --file=backup.sql
```

## References

- [Drizzle D1 Docs](https://orm.drizzle.team/docs/get-started-sqlite)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [SQLite Docs](https://www.sqlite.org/docs.html)
