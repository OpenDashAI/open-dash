# OpenDash Architecture Review: Data Integrity, Schema Design & Interface Contracts

**Date**: 2026-03-24
**Reviewer**: Prime (Claude Code)
**Scope**: Data flow, schema validation, type safety, interface contracts
**Grade**: B+ (solid foundation, ready for enhancement with Zod + Drizzle patterns)

---

## Executive Summary

**Current State**: ✅ Good
- Zod already in use for dashboard config validation
- Clear interface contracts (DataSource, BriefingItem)
- Type-safe TypeScript throughout
- Proper error handling in most paths

**Gaps**: ⚠️ Medium Priority
- No runtime validation for BriefingItem (interfaces only)
- Monitoring metrics lack schema validation
- DataSourceStatus is too loose (string union for connected property)
- No database schema (all in-memory, no persistence layer)
- Missing input validation for server functions
- Inconsistent timestamp handling (string vs number vs Date)

**Recommendations**: 💡
1. **Extend Zod** to all runtime data (not just dashboard.yaml)
2. **Introduce Drizzle** for D1 schema + type-safe queries
3. **Standardize timestamps** across the system
4. **Add input validation** to all server functions
5. **Create schema registry** for domain entities

---

## 1. Data Integrity Analysis

### Current Validation Layer

**✅ Good: Dashboard Config (Zod)**
```typescript
// dashboard-config.ts — validated at load time
export const DashboardYamlSchema = z.object({
  brand: z.string(),
  domain: z.string(),
  sources: z.array(DataSourceYamlConfigSchema),
  widgets: z.array(WidgetSchema),
});

const result = DashboardYamlSchema.safeParse(data);
```
- ✅ YAML config is validated before use
- ✅ Type inference from schema (`z.infer<typeof ...>`)
- ✅ Clear error messages via safeParse
- ✅ Optional fields properly marked

**⚠️ Gap: BriefingItem (No Runtime Validation)**
```typescript
// briefing.ts — interface-only, no validation
export interface BriefingItem {
  id: string;
  priority: BriefingPriority;  // ⚠️ Not validated at fetch time
  category: BriefingCategory;  // ⚠️ String union, no enum guards
  title: string;
  detail?: string;
  // ... 10+ optional fields without constraints
}
```

**Problem**: A malformed datasource can return invalid items without detection:
```typescript
// This passes TypeScript but might be wrong at runtime
const item = {
  id: '', // empty string!
  priority: 'invalid', // not in union!
  category: 'unknown', // not in category enum!
  title: null, // null instead of string!
  time: new Date(), // Date instead of ISO string!
};
```

**⚠️ Gap: DataSourceStatus (Loose Typing)**
```typescript
export interface DataSourceStatus {
  connected: boolean;
  lastFetch?: string;     // ⚠️ What format? ISO? Unix? No validation
  error?: string;         // ⚠️ What if too long? No constraint
  itemCount?: number;     // ⚠️ Can be negative? No constraint
}
```

**⚠️ Gap: Monitoring Metrics (No Schema)**
```typescript
// monitoring.ts — interface-only
export interface DatasourceMetric {
  id: string;
  name: string;
  lastFetch: number;      // ⚠️ Milliseconds? Seconds? No constraint
  fetchLatency: number;   // ⚠️ Can be negative? No min bound
  errorRate: number;      // ⚠️ Should be 0-1, no validation!
  connected: boolean;
}
```

Actual code doesn't validate bounds:
```typescript
// This is allowed but nonsensical
errorRate: 1.5,      // > 1!
fetchLatency: -100,  // negative!
lastFetch: 0,        // epoch time, confusing
```

**⚠️ Gap: No Input Validation on Server Functions**
```typescript
// datasources.ts — accepts any input
export const fetchBrandDashboard = createServerFn()
  .input<{ brandSlug: string; lastVisited?: string | null }>()
  .handler(async ({ data }) => {
    // ⚠️ brandSlug could be "", "\n\n", very long string
    // ⚠️ lastVisited could be "invalid date", huge number
    const config = await loadDashboardConfig({
      data: { brandSlug: data.brandSlug }, // no sanitization
    });
```

---

## 2. Schema Design Review

### Current Architecture

```
┌─ dashboard.yaml (YAML on disk)
│  └─ parsed via Zod → DashboardYaml
├─ DataSource implementations (TypeScript classes)
│  └─ return BriefingItem[] (no validation)
├─ MetricsTracker (in-memory Map)
│  └─ stores DatasourceMetric (no schema)
└─ Components (React)
   └─ consume typed props (no validation)
```

### Gaps

**1. No Persistence Layer**
- Metrics tracked in-memory only (lost on reload)
- No D1 schema defined
- No query patterns for historical data

**2. Timestamp Handling is Inconsistent**
```typescript
// briefing.ts
time: string;  // ISO format assumed

// datasources.ts
lastFetch?: string;  // ISO? or what?

// monitoring.ts
lastFetch: number;  // milliseconds

// datasources.ts
data.lastVisited: string | null  // ISO assumed
```

**3. Config Flow is Implicit**
```
DataSourceConfig (env + lastVisited + brandConfig?)
  ↓
datasource.fetch(config)  // how is config.brandConfig used?
  ↓
returns BriefingItem[]  // what if config.brandConfig is malformed?
```

**4. Enum-like Values Not Validated**
```typescript
// briefing.ts
type BriefingPriority = "urgent" | "high" | "normal" | "low";
type BriefingCategory = "issue" | "deploy" | "revenue" | "seo" | ...;

// Problem: TypeScript only validates literals, not runtime values
const item = JSON.parse('{"priority":"typo"}');
// TypeScript doesn't catch this at runtime!
```

---

## 3. Interface Contract Review

### Strong Contracts ✅

**DataSource Plugin Interface**
```typescript
export interface DataSource {
  id: string;
  name: string;
  icon: string;
  description: string;
  requiresConfig: boolean;
  fetch(config: DataSourceConfig): Promise<BriefingItem[]>;
}
```
✅ Clear method signature
✅ All properties typed
✅ Async/error handling clear
✅ Used consistently across 6+ datasource implementations

### Weak Contracts ⚠️

**DataSourceConfig (Too Loose)**
```typescript
export interface DataSourceConfig {
  env: Record<string, string | undefined>;  // ⚠️ Untyped keys!
  lastVisited: string | null;                // ⚠️ What format?
  brandConfig?: Record<string, unknown>;     // ⚠️ Completely untyped!
}
```

Problem: Datasources must guess what env vars are available:
```typescript
// stripe-revenue.ts
const secretKey = config.env.STRIPE_SECRET_KEY;
// ⚠️ Did we spell it right? Is it required? Undefined?

// ⚠️ brandConfig is mystery object
const customParam = config.brandConfig?.customParam;
// What if brandConfig is { foo: 123 } when we expect string?
```

**Server Function Contracts (Missing Input Validation)**
```typescript
export const fetchBrandDashboard = createServerFn()
  .input<{ brandSlug: string; lastVisited?: string | null }>()
  .handler(async ({ data }) => {
    // ⚠️ Input type is inference, no runtime validation
    // ⚠️ brandSlug length not checked
    // ⚠️ lastVisited format not validated
  });
```

### Monitoring Types Are Too Permissive ⚠️

```typescript
export interface DatasourceMetric {
  id: string;           // ⚠️ Can be empty
  name: string;         // ⚠️ Can be empty
  lastFetch: number;    // ⚠️ Can be negative or zero
  fetchLatency: number; // ⚠️ Can be negative!
  errorRate: number;    // ⚠️ Should be [0, 1] but unchecked
  connected: boolean;
}

// Actual usage doesn't validate:
const newErrorRate = existing.errorRate * 0.9 + (success ? 0 : 1) * 0.1;
// ⚠️ Could result in negative number if existing was already invalid
```

---

## 4. Recommended Zod Patterns

### Pattern 1: Validate All Runtime Data

**Current**:
```typescript
// Only dashboard.yaml is validated
export const DashboardYamlSchema = z.object({...});
// But BriefingItem is just an interface!
```

**Proposed**:
```typescript
// Validate at source, at boundaries, and on I/O

// Domain entity validation
export const BriefingItemSchema = z.object({
  id: z.string().min(1, "ID cannot be empty"),
  priority: z.enum(["urgent", "high", "normal", "low"]),
  category: z.enum(["issue", "deploy", "revenue", "seo", "agent", "domain", "health"]),
  title: z.string().min(1).max(200, "Title too long"),
  detail: z.string().max(1000).optional(),
  brand: z.string().optional(),
  time: z.string().datetime("Invalid ISO timestamp"),
  action: z.string().optional(),
  actionUrl: z.string().url().optional(),
  dismissed: z.boolean().default(false),
  isNew: z.boolean().default(false),
  snoozedUntil: z.string().datetime().optional(),
});

export type BriefingItem = z.infer<typeof BriefingItemSchema>;

// Validate at fetch boundaries
export interface DataSource {
  fetch(config: DataSourceConfig): Promise<BriefingItem[]>;
  // ↓ becomes
  fetch(config: DataSourceConfig): Promise<z.infer<typeof BriefingItemSchema>[]>;
}

// Usage in datasource implementations
export class GitHubIssues implements DataSource {
  async fetch(config: DataSourceConfig): Promise<BriefingItem[]> {
    const raw = await fetchFromAPI(config);
    const validated = BriefingItemSchema.array().parse(raw);
    // ✅ Now guaranteed valid, or throws clear error
    return validated;
  }
}
```

### Pattern 2: Typed Configuration Objects

**Current**:
```typescript
export interface DataSourceConfig {
  env: Record<string, string | undefined>;
  brandConfig?: Record<string, unknown>;  // ⚠️ Untyped
}
```

**Proposed**:
```typescript
// Define what env vars each source needs
export const StripeEnvSchema = z.object({
  STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY required"),
  STRIPE_PUBLIC_KEY: z.string().min(1, "STRIPE_PUBLIC_KEY required"),
}).strict(); // No extra keys allowed

export const GitHubEnvSchema = z.object({
  GITHUB_TOKEN: z.string().min(1, "GITHUB_TOKEN required"),
}).strict();

// Brand-specific config per datasource
export const StripeDatasourceConfigSchema = z.object({
  currencyFilter?: z.enum(["USD", "EUR", "GBP"]).optional(),
  minAmountFilter?: z.number().min(0).optional(),
  lookbackDays?: z.number().min(1).max(365).default(30),
});

// Validate config at instantiation time
class StripeRevenue implements DataSource {
  async fetch(config: DataSourceConfig): Promise<BriefingItem[]> {
    // Validate env vars available
    const env = StripeEnvSchema.parse(config.env);

    // Validate brand-specific config
    const brandConfig = StripeDatasourceConfigSchema.parse(
      config.brandConfig || {}
    );

    // ✅ Now both env and brandConfig are typed and validated
    const key = env.STRIPE_SECRET_KEY;
    const lookback = brandConfig.lookbackDays;
  }
}
```

### Pattern 3: Input Validation for Server Functions

**Current**:
```typescript
export const fetchBrandDashboard = createServerFn()
  .input<{ brandSlug: string; lastVisited?: string | null }>()
  .handler(async ({ data }) => {
    // ⚠️ No runtime validation of data
  });
```

**Proposed**:
```typescript
export const FetchBrandDashboardInputSchema = z.object({
  brandSlug: z.string()
    .min(1, "Brand slug required")
    .max(50, "Brand slug too long")
    .regex(/^[a-z0-9-]+$/, "Invalid slug format"),
  lastVisited: z.string()
    .datetime("Invalid ISO timestamp")
    .optional()
    .nullable(),
});

export const fetchBrandDashboard = createServerFn()
  .input<z.infer<typeof FetchBrandDashboardInputSchema>>()
  .handler(async ({ data }) => {
    // ✅ Validate input at handler boundary
    const validated = FetchBrandDashboardInputSchema.parse(data);

    // Now safe to use
    const config = await loadDashboardConfig({
      data: { brandSlug: validated.brandSlug },
    });
  });
```

### Pattern 4: Enums as Branded Types

**Current**:
```typescript
type BriefingPriority = "urgent" | "high" | "normal" | "low";
// ⚠️ String literal, not validated at runtime
```

**Proposed**:
```typescript
// Create Zod enum
export const BriefingPriorityEnum = z.enum(["urgent", "high", "normal", "low"]);
export type BriefingPriority = z.infer<typeof BriefingPriorityEnum>;

// Now you can validate:
const priority = BriefingPriorityEnum.parse("urgent"); // ✅ valid
const invalid = BriefingPriorityEnum.parse("typo");     // ❌ throws

// And you get autocomplete + type safety
const items = briefing.sort((a, b) => {
  const aPriority = BriefingPriorityEnum.parse(a.priority); // validates
  // ...
});
```

---

## 5. Recommended Drizzle Patterns (for D1)

### Problem: No Persistence Schema

Currently all data is in-memory:
- Metrics lost on reload
- No historical analysis
- Can't query trends

### Solution: Define D1 Schema with Drizzle

```typescript
// src/lib/db/schema.ts
import { drizzle } from 'drizzle-orm/d1';
import { text, integer, real, boolean, index } from 'drizzle-orm/d1';

export const datasourceMetricsTable = sqliteTable(
  'datasource_metrics',
  {
    id: text('id').primaryKey(),
    datasourceId: text('datasource_id').notNull(),
    datasourceName: text('datasource_name').notNull(),
    timestamp: integer('timestamp').notNull(), // unix milliseconds
    fetchLatency: integer('fetch_latency').notNull(),
    errorRate: real('error_rate').notNull().check(
      sql`${errorRate} >= 0 AND ${errorRate} <= 1`
    ),
    connected: boolean('connected').notNull(),
    healthStatus: text('health_status')
      .notNull()
      .check(sql`${healthStatus} IN ('healthy', 'degraded', 'critical')`),
  },
  (table) => [
    index('idx_datasource_id').on(table.datasourceId),
    index('idx_timestamp').on(table.timestamp),
  ],
);

export const alertRulesTable = sqliteTable('alert_rules', {
  id: text('id').primaryKey(),
  datasourceId: text('datasource_id').notNull(),
  ruleType: text('rule_type')
    .notNull()
    .check(sql`${ruleType} IN ('latency', 'error_rate', 'downtime', 'sla')`),
  threshold: real('threshold').notNull(),
  alertChannels: text('alert_channels').notNull(), // JSON array
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const alertHistoryTable = sqliteTable('alert_history', {
  id: text('id').primaryKey(),
  ruleId: text('rule_id').notNull(),
  state: text('state')
    .notNull()
    .check(sql`${state} IN ('triggered', 'acknowledged', 'resolved')`),
  acknowledgedAt: integer('acknowledged_at'),
  acknowledgedBy: text('acknowledged_by'),
  resolvedAt: integer('resolved_at'),
  createdAt: integer('created_at').notNull(),
});
```

### Type-Safe Queries

```typescript
// src/lib/db/queries.ts
import { drizzle } from 'drizzle-orm/d1';
import { eq, gte, lte, and, desc, limit } from 'drizzle-orm';
import { datasourceMetricsTable } from './schema';

export async function getLatestMetrics(db: D1Database) {
  const results = await db
    .select()
    .from(datasourceMetricsTable)
    .orderBy(desc(datasourceMetricsTable.timestamp))
    .limit(100);

  // ✅ results are typed as typeof datasourceMetricsTable
  // ✅ Can't select invalid columns
  // ✅ Type-safe filters

  return results;
}

export async function getMetricsInRange(
  db: D1Database,
  datasourceId: string,
  startTime: number,
  endTime: number,
) {
  return db
    .select()
    .from(datasourceMetricsTable)
    .where(
      and(
        eq(datasourceMetricsTable.datasourceId, datasourceId),
        gte(datasourceMetricsTable.timestamp, startTime),
        lte(datasourceMetricsTable.timestamp, endTime),
      ),
    )
    .orderBy(datasourceMetricsTable.timestamp);
}

// ✅ No string-based queries
// ✅ SQL injection impossible
// ✅ Schema changes propagate to type system
```

### Migrate MetricsTracker → Drizzle

```typescript
// src/lib/monitoring.ts
import { drizzle } from 'drizzle-orm/d1';
import { datasourceMetricsTable } from './db/schema';

export class MetricsTracker {
  constructor(private db: D1Database) {}

  async recordFetch(
    id: string,
    name: string,
    latency: number,
    success: boolean,
  ): Promise<void> {
    // ✅ Validate data before insert
    const metric = DatasourceMetricSchema.parse({
      id: crypto.randomUUID(),
      datasourceId: id,
      datasourceName: name,
      timestamp: Date.now(),
      fetchLatency: latency,
      errorRate: success ? 0 : 1,
      connected: success,
      healthStatus: 'healthy', // will be computed properly
    });

    // ✅ Type-safe insert
    await this.db
      .insert(datasourceMetricsTable)
      .values(metric);
  }

  async getHealthStatus(id: string): Promise<'healthy' | 'degraded' | 'critical'> {
    // ✅ Query last 100 metrics
    const recent = await this.db
      .select()
      .from(datasourceMetricsTable)
      .where(eq(datasourceMetricsTable.datasourceId, id))
      .orderBy(desc(datasourceMetricsTable.timestamp))
      .limit(100);

    if (recent.length === 0) return 'degraded';

    const latest = recent[0];
    if (!latest.connected) return 'critical';
    if (latest.errorRate > 0.5) return 'critical';
    if (latest.errorRate > 0.2) return 'degraded';
    return 'healthy';
  }
}
```

---

## 6. Timestamp Standardization

### Problem: Inconsistent Timestamp Types

```typescript
// briefing.ts - ISO string
time: string;  // "2026-03-24T12:00:00Z"

// monitoring.ts - milliseconds
lastFetch: number;  // 1711270800000

// datasources.ts - ISO string
lastVisited?: string | null;  // "2026-03-24T12:00:00Z"
```

### Solution: Define Standard

```typescript
// src/lib/time.ts

/**
 * Standard timestamp across OpenDash:
 * - Storage: Unix milliseconds (can be compared with <, >)
 * - API responses: ISO 8601 strings (human readable)
 * - Internal representation: number (milliseconds since epoch)
 */

export const TimestampSchema = z
  .number()
  .int("Timestamp must be integer")
  .positive("Timestamp must be positive")
  .max(Date.now() + 86400000, "Timestamp cannot be in far future");

export type Timestamp = z.infer<typeof TimestampSchema>;

// Helpers
export function toISOString(timestamp: Timestamp): string {
  return new Date(timestamp).toISOString();
}

export function fromISOString(isoString: string): Timestamp {
  return TimestampSchema.parse(new Date(isoString).getTime());
}

export function now(): Timestamp {
  return TimestampSchema.parse(Date.now());
}

// Usage in schemas
export const BriefingItemSchema = z.object({
  // ...
  time: z.number().pipe(TimestampSchema), // validated + typed
});

export const DatasourceMetricSchema = z.object({
  // ...
  lastFetch: z.number().pipe(TimestampSchema),
  timestamp: z.number().pipe(TimestampSchema),
});
```

---

## 7. Implementation Roadmap

### Phase 1: Schema Foundation (2-3 days)
- [ ] Create Zod schemas for all domain entities
- [ ] Add runtime validation to BriefingItem returns
- [ ] Validate server function inputs
- [ ] Standardize timestamps across system

### Phase 2: Configuration Validation (2-3 days)
- [ ] Define env var schemas per datasource
- [ ] Define brand-config schemas
- [ ] Validate DataSourceConfig at instantiation
- [ ] Add config documentation

### Phase 3: Database Schema (3-5 days)
- [ ] Design and implement D1 tables with Drizzle
- [ ] Migrate MetricsTracker to use D1
- [ ] Create query helpers for historical data
- [ ] Add retention/cleanup policies

### Phase 4: Integration (2-3 days)
- [ ] Validate all D1 inserts with Zod
- [ ] Type-safe API endpoints
- [ ] Update tests to validate schemas
- [ ] Documentation + runbooks

**Total Effort**: ~2 weeks
**Priority**: Medium (post-Phase 5 optional work)

---

## 8. Code Examples: Before & After

### Example 1: DataSource Implementation

**Before**:
```typescript
export class GitHubIssues implements DataSource {
  async fetch(config: DataSourceConfig): Promise<BriefingItem[]> {
    const token = config.env.GITHUB_TOKEN; // ⚠️ Could be undefined
    const response = await fetch('https://api.github.com/issues', {
      headers: { 'Authorization': `token ${token}` }, // ⚠️ Fails silently
    });
    const data = await response.json();

    return data.map((issue: any) => ({ // ⚠️ any type
      id: issue.id,
      priority: 'normal', // ⚠️ Not based on issue severity
      category: 'issue',
      title: issue.title,
      time: issue.created_at, // ⚠️ Not validated timestamp
      // ...
    }));
  }
}
```

**After**:
```typescript
export class GitHubIssues implements DataSource {
  async fetch(config: DataSourceConfig): Promise<BriefingItem[]> {
    // ✅ Validate required env vars
    const env = GitHubEnvSchema.parse(config.env);
    const brandConfig = GitHubBrandConfigSchema.parse(config.brandConfig || {});

    // ✅ Type-safe fetch
    const response = await fetch('https://api.github.com/issues', {
      headers: { 'Authorization': `token ${env.GITHUB_TOKEN}` },
    });
    const data = await response.json();

    // ✅ Validate each item before returning
    return data.map((issue) =>
      BriefingItemSchema.parse({
        id: issue.id,
        priority: mapIssueToPriority(issue.severity),
        category: 'issue',
        title: issue.title,
        time: fromISOString(issue.created_at),
        brand: brandConfig.brand,
      })
    );
  }
}
```

### Example 2: Server Function

**Before**:
```typescript
export const fetchBrandDashboard = createServerFn()
  .input<{ brandSlug: string; lastVisited?: string | null }>()
  .handler(async ({ data }) => {
    // ⚠️ No validation
    const config = await loadDashboardConfig({
      data: { brandSlug: data.brandSlug },
    });
    // ⚠️ brandSlug could be "", "../../etc/passwd", very long
  });
```

**After**:
```typescript
export const FetchBrandDashboardInput = z.object({
  brandSlug: z.string()
    .min(1).max(50)
    .regex(/^[a-z0-9-]+$/),
  lastVisited: z.string().datetime().nullable().optional(),
});

export const fetchBrandDashboard = createServerFn()
  .input<z.infer<typeof FetchBrandDashboardInput>>()
  .handler(async ({ data }) => {
    // ✅ Validate input
    const input = FetchBrandDashboardInput.parse(data);

    // ✅ Safe to use
    const config = await loadDashboardConfig({
      data: { brandSlug: input.brandSlug },
    });
  });
```

---

## 9. Checklist for Implementation

### Data Integrity
- [ ] All runtime data validated with Zod
- [ ] Server functions validate inputs
- [ ] DataSource implementations validate returned items
- [ ] No `any` types in public APIs
- [ ] Error messages clear and actionable

### Schema Design
- [ ] Timestamps standardized (milliseconds internally, ISO externally)
- [ ] Configuration objects typed and validated
- [ ] D1 schema defined with constraints
- [ ] Enums properly typed (Zod enums, not string literals)
- [ ] Schema migration docs provided

### Interface Contracts
- [ ] DataSourceConfig fully typed
- [ ] BriefingItem contract with validation
- [ ] DataSourceStatus properly constrained
- [ ] Server function inputs validated
- [ ] Error handling documented

### Testing
- [ ] Invalid data rejected with clear errors
- [ ] Schema validation tested comprehensively
- [ ] Boundary conditions tested (empty strings, null, extremes)
- [ ] Database queries tested for correctness
- [ ] Type safety verified (strict tsconfig)

---

## 10. Grade Justification

**Current Grade: B+** (Before Zod/Drizzle enhancements)

### Strengths (45 points)
- ✅ TypeScript strict mode (15 pts)
- ✅ Zod already in use for config (10 pts)
- ✅ Clear interface contracts (10 pts)
- ✅ Proper error handling patterns (10 pts)

### Gaps (25 points deducted)
- ⚠️ No validation for runtime data (-10 pts)
- ⚠️ No persistence/schema (-10 pts)
- ⚠️ Timestamp inconsistency (-5 pts)

### Potential (25 bonus points after improvements)
- Drizzle integration (+10 pts)
- Full Zod coverage (+10 pts)
- Standardized timestamps (+5 pts)

**Post-Enhancement Grade: A** (with Drizzle + full Zod)

---

## Conclusion

OpenDash has a solid foundation with TypeScript and Zod validation for configs. The next step is **extending Zod to all runtime data** and **adding Drizzle for D1 persistence** (needed for Phase 5 monitoring features).

The improvements outlined above will:
- 🛡️ Prevent invalid data at system boundaries
- 📊 Enable historical analytics (D1 persistence)
- 🔍 Make debugging easier (clear validation errors)
- 📈 Support scaling to 100+ brands (schema-driven)
- ✅ Maintain type safety throughout

**Recommended**: Implement Phase 1-2 of roadmap before starting optional Phase 5 work (#10-#13).

---

**Next Review**: After Phase 5 (#10-#13 work) to assess monitoring data integrity
**Owner**: Engineering Team
**Date Created**: 2026-03-24
