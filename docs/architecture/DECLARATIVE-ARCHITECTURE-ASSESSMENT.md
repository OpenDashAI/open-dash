# Declarative Architecture Assessment

**Question**: Do the declarative features (Phases 1-4) make a positive or negative difference?

**Answer**: ✅ **STRONGLY POSITIVE for MVP** | ⚠️ **Warning signs for scale** | 🔧 **One refactor needed before Phase 5**

---

## Current State Analysis

### What We're Evaluating

The declarative architecture consists of:
- **Phase 1**: YAML schema + config loader (Zod validation)
- **Phase 2**: Dynamic datasource instantiation per brand
- **Phase 3**: Routes + declarative UI (file-based routing)
- **Phase 4**: Hybrid config loader (fs + API fallback)

**Question being asked**: Is this complexity worth it, or would imperative code be simpler?

---

## The Evidence: Comparing Approaches

### Example: Adding a New Datasource

#### With Declarative Approach (Current)
```ts
// 1. Create new file: src/datasources/uptime-kuma.ts (100 lines)
export const uptimeKumaSource: DataSource = {
  id: "uptime-kuma",
  name: "Uptime Kuma",
  fetch(config: DataSourceConfig) {
    const baseUrl = (config.brandConfig as { baseUrl?: string })?.baseUrl;
    const res = await fetch(`${baseUrl}/api/monitors`);
    return items;
  }
};

// 2. Register in src/datasources/index.ts (1 line)
registry.register(uptimeKumaSource);

// 3. Add to brand YAML config (3 lines)
sources:
  - id: uptime-kuma
    config:
      baseUrl: https://status.example.com

// Total code changes: ~105 lines + 1 line + 3 lines = 109 lines
// Most of that is datasource logic (would exist in any approach)
// Overhead: ~5 lines (registration + type casting)
```

#### With Imperative Approach (Hypothetical)
```ts
// Would need to:
// 1. Add new field to fetchAllSources global config
// 2. Add conditional logic for when to call uptime-kuma
// 3. Merge results manually
// 4. Update UI to show new datasource status
// 5. Update type definitions for dashboard config
// Total: Scattered changes across 4-5 files, higher risk of breakage
```

### Actual Codebase Metrics

**Datasource implementations** (individual datasource files):
```
github-issues.ts      2.8 KB  ✓ Fetches N issues with label filtering
github-activity.ts    1.6 KB  ✓ Fetches recent commits
stripe-revenue.ts     2.4 KB  ✓ Fetches transactions with label filtering
cloudflare-deploys.ts 2.1 KB  ✓ Fetches worker deployments
tailscale.ts          1.9 KB  ✓ Fetches devices with tag filtering
scalable-media.ts     2.2 KB  ✓ Fetches content by brand slug
────────────────────────────
Total datasource code: 12.7 KB (very focused, no boilerplate)
```

**Infrastructure code** (orchestration, registry, config):
```
datasources/index.ts  779 B   ← Just registration, very clean
config-loader.ts      ~300 L  ← One source of truth for loading
dashboard-config.ts   ~72 L   ← Validation rules
datasources.ts        ~180 L  ← Orchestration (fetchAllSources, fetchBrandDashboard)
────────────────────────────
Total infrastructure: ~50 KB (including comments + error handling)
```

**The ratio**: 12.7 KB application logic : 50 KB infrastructure = **Tight ratio** (not bloated)

---

## Positive Impact: Why It's Working

### ✅ Benefit 1: Easy Datasource Addition
Adding datasource #6 was as easy as datasource #1. No API changes needed.

**Without declarative approach**: Each new datasource would require:
- Updating route loaders
- Updating type definitions
- Updating UI card registry
- Updating error handling
- Risk of breaking existing datasources

**With declarative approach**: Just register + implement interface.

---

### ✅ Benefit 2: Per-Brand Configuration
Each brand can have different datasources, different repos, different labels—all in YAML.

```yaml
# configs/llc-tax.yaml
sources:
  - id: github-issues
    config: { repo: "garywu/llc-tax", labels: [bug, urgent] }
  - id: stripe
    config: { label: "llc-tax" }

# configs/pages-plus.yaml
sources:
  - id: github-issues
    config: { repo: "some-org/pages-plus", labels: [p0] }
  - id: tailscale
    config: { tags: [pages-prod] }
```

**Without declarative approach**: You'd hardcode different logic for each brand in the route/server functions.

---

### ✅ Benefit 3: Parallel Execution
```ts
const results = await Promise.allSettled(
  config.sources.map(async (sourceConfig) => {
    const source = registry.get(sourceConfig.id);
    return await source.fetch(brandConfig);
  })
);
```

This automatically parallelizes. Without the registry pattern, you'd manually write:
```ts
const [issuesRes, stripeRes, cfRes, ...] = await Promise.all([
  fetchIssues(), fetchStripe(), fetchCloudflare(), ...
]);
```

Which breaks when you add a 7th datasource.

---

### ✅ Benefit 4: Graceful Degradation
If one datasource fails, the briefing still shows the other 5.

```ts
const results = await Promise.allSettled(...);  // ← NOT Promise.all()
// One failure doesn't crash everything
```

---

### ✅ Benefit 5: Type Safety at Build Time
```ts
export const DashboardYamlSchema = z.object({
  brand: z.string(),
  sources: z.array(DataSourceYamlConfigSchema),
  // ...
});
```

Invalid YAML is caught at load time, not runtime in production.

---

## Negative Impact: The Friction Points

### ⚠️ Problem 1: Runtime Type Casting Per Datasource

Look at github-issues.ts, line 20-21:
```ts
const brandConfig = config.brandConfig as
  | { repo?: string; labels?: string[] }
  | undefined;
```

**What's happening:**
- YAML schema says: `config: z.record(z.unknown())` (accepts anything)
- Datasource manually casts to expected shape
- If YAML has `repo: 123` (number), TypeScript won't catch it
- Runtime will silently use `123` as a string, causing API call failure

**The friction:**
- Each of 6 datasources duplicates validation logic
- No autocomplete in YAML editors
- Hard to debug "why isn't this datasource working?"
- New datasource developers must remember to cast types manually

**Impact**: Low for 6 datasources. **High for 12-15 datasources.**

---

### ⚠️ Problem 2: No Single Source of Truth for Config Shapes

The valid config shape for `github-issues` is:
```ts
{
  repo?: string;
  labels?: string[];
}
```

But this shape lives *only in the TypeScript code*, not in the schema. A developer:
1. Writes YAML with wrong shape
2. Commits
3. Load-time: config passes generic Zod validation (because `z.record(z.unknown())`)
4. Runtime: datasource silently ignores bad config
5. Briefing shows no GitHub issues
6. Developer debugs for 30 minutes

**Without declarative approach**: You'd have a single TypeScript object that defines everything, so mismatches are caught.

**Impact**: Low for 6 datasources. **Medium for 12+ datasources.**

---

### ⚠️ Problem 3: Scalability at 12-15 Datasources

Currently, to add datasource #7:
1. Create file (~100 lines)
2. Register in index.ts (1 line)
3. Add to brand YAML (3 lines)

At 12-15 datasources:
- `datasources/index.ts` has 12-15 imports + registrations (still clean)
- But now there are **15 different config shape assumptions** across the codebase
- Documentation becomes critical (which datasources support which config keys?)
- Testing becomes tedious (have to manually create correct DataSourceConfig shapes)
- Adding a datasource that supports dynamic config becomes harder

**Impact**: Medium now, **High at 12-15 datasources.**

---

### ⚠️ Problem 4: Debugging "Why isn't this datasource returning data?"

When a datasource fails silently:

**Current approach**:
1. Check datasources.ts for error handling (it's there, returns empty array)
2. Check datasource code for wrong config shape (have to manually trace)
3. Check YAML config (no schema validation says what's valid)
4. Tedious

**Imperative approach**:
1. TypeScript compiler catches shape mismatches immediately

---

### ⚠️ Problem 5: Can't Dynamically Load Datasources (Plugin System)

If you ever want to support:
- Custom per-team datasources
- Plugins from npm packages
- Datasources loaded from Brand System API

The registry pattern plus hardcoded index.ts registration makes this harder. You'd need to refactor to load datasources dynamically, which is more complex than if you'd just hardcoded them from the start.

---

## Verdict: Is It Worth It?

### For MVP (Right Now) ✅
**YES, STRONGLY. The declarative approach is the right choice because:**

1. Adding datasources #2-6 was smooth
2. Per-brand YAML config works cleanly
3. Parallel execution and error handling are automatic
4. Type safety at build time catches errors
5. No breaking changes when adding new sources
6. Code is focused and maintainable

**Pain points don't matter yet** because there are only 6 datasources and the type-casting overhead is negligible.

---

### For Phase 5 (10-15 datasources) ⚠️
**YES, but with one refactor: Add per-datasource Zod schemas.**

Instead of each datasource doing its own casting:

```ts
// NEW: Each datasource defines its config schema

// src/datasources/github-issues.ts
export const GitHubIssuesConfigSchema = z.object({
  repo: z.string().default("garywu/garywu-vault"),
  labels: z.array(z.string()).default([]),
});

export const githubIssuesSource: DataSource = {
  id: "github-issues",
  async fetch(config: DataSourceConfig) {
    const brandConfig = GitHubIssuesConfigSchema.parse(config.brandConfig);
    const repo = brandConfig.repo;  // ← Typed, no casting needed
    const labels = brandConfig.labels;
    // ...
  }
};

// src/datasources/uptime-kuma.ts
export const UptimeKumaConfigSchema = z.object({
  baseUrl: z.string().url(),
  checkInterval: z.number().default(300),
});

export const uptimeKumaSource: DataSource = {
  id: "uptime-kuma",
  async fetch(config: DataSourceConfig) {
    const brandConfig = UptimeKumaConfigSchema.parse(config.brandConfig);
    // Fully typed, validates at runtime, fails fast with good error messages
  }
};
```

**Benefits of per-datasource schemas:**
- ✅ Type safety with validation, no casting
- ✅ Single source of truth per datasource
- ✅ IDE autocomplete in YAML editors (via JSON Schema)
- ✅ Better error messages ("Expected string for repo, got number")
- ✅ Easier testing (can use schema to generate test data)
- ✅ Self-documenting (schema shows valid config keys)
- ✅ Easy to add 12 datasources without friction
- ✅ Scales to 100+ datasources

**Effort**: ~4 hours (add ~5-10 lines per datasource)

---

## Timeline Recommendation

| Phase | Datasources | Recommended |
|-------|-------------|-------------|
| **MVP (Now)** | 6 | ✅ Current declarative approach works great |
| **Phase 5a (Week 2-3)** | 10-12 | ⚠️ Add per-datasource schemas before expanding |
| **Phase 5b (Month 2)** | 12-15 | ✅ With schemas, expansion is smooth |
| **Phase 5c (Month 3)** | 20+ | ✅ Scales well with schema foundation |

---

## Recommendation: Ship As-Is, Refactor Early in Phase 5

**Don't change before MVP:** The current approach is clean and works. Premature optimization is the enemy.

**Do refactor in Phase 5:** Before adding the 7th datasource, spend 4 hours adding per-datasource Zod schemas. This prevents pain at 12+ datasources.

---

## Related Documents

- **PHASE2-DYNAMIC-DATASOURCES.md** — How the registry pattern works
- **STATUS.md** — Phase 5 planning (datasource expansion)

---

**Type**: Architecture assessment
**Status**: MVP-ready; Phase 5 refactor planned
**Audience**: Developers evaluating maintainability, future team members

