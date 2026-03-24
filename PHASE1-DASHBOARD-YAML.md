# Phase 1: YAML Spec + Config Loader

**Status**: ✅ COMPLETE
**Date**: 2026-03-24
**Issue**: OpenDashAI/open-dash#5

## What Was Built

### 1. **Dashboard YAML Schema** (`src/lib/dashboard-config.ts`)

Zod schema defining the structure of `dashboard.yaml` files:

```ts
export const DashboardYamlSchema = z.object({
  brand: z.string(),              // Brand slug (e.g., 'llc-tax')
  domain: z.string(),             // Primary domain
  description: z.string().optional(),
  sources: z.array(DataSourceYamlConfigSchema),  // Data sources
  widgets: z.array(WidgetSchema),                // UI widgets
});

export type DashboardYaml = z.infer<typeof DashboardYamlSchema>;
```

**Features**:
- Strict validation via Zod
- Type-safe TypeScript interfaces
- `parseDashboardYaml()` - throws on error
- `validateDashboardYaml()` - returns errors, never throws
- Extensible: sources/widgets use `Record<string, unknown>` for arbitrary config

### 2. **Config Loader** (`src/server/config-loader.ts`)

Server-side loader for YAML files:

**Features**:
- Reads from `configs/{brandSlug}.yaml`
- In-memory caching (one load per brand)
- Graceful error handling (logs, returns null)
- Two server functions:
  - `loadDashboardConfig({ brandSlug })` - Load one brand
  - `listAvailableDashboards()` - Scan all configs

**Example usage**:
```ts
const config = await loadDashboardConfig({ data: { brandSlug: "llc-tax" } });
// Returns DashboardYaml | null
```

### 3. **Test YAML Configs** (`configs/*.yaml`)

Sample configurations for 5 brands:

| File | Brand | Sources | Status |
|------|-------|---------|--------|
| `llc-tax.yaml` | LLC Tax | github, stripe, cloudflare, plausible | ✅ |
| `pages-plus.yaml` | Pages Plus | github, stripe, cloudflare, plausible | ✅ |
| `api-mom.yaml` | API Mom | github, stripe, cloudflare, plausible | ✅ |
| `scramjet.yaml` | Scramjet | github, stripe, cloudflare, plausible | ✅ |
| `stargate.yaml` | Stargate | github, stripe, cloudflare, plausible | ✅ |

Each config demonstrates:
- Brand metadata (brand, domain, description)
- Multiple datasources with config
- Multiple widgets with titles and options

**Example config structure**:
```yaml
brand: llc-tax
domain: llctax.com
description: LLC tax education & tools platform

sources:
  - id: github-issues
    config:
      repo: garywu/llc-tax
      labels: []
  - id: stripe
    config:
      label: llc-tax

widgets:
  - type: issue_list
    source: github-issues
    title: "Open Issues"
    config:
      limit: 10
```

### 4. **Unit Tests** (`src/lib/dashboard-config.test.ts`)

Comprehensive test coverage:

```
✓ Minimal valid config
✓ Full config with all fields
✓ Rejects missing 'brand'
✓ Rejects missing 'domain'
✓ Allows optional 'description'
✓ Allows empty sources/widgets
✓ Validates arbitrary source config
✓ Validates optional widget fields
✓ parseDashboardYaml() works correctly
✓ validateDashboardYaml() returns errors without throwing
```

**Run tests**:
```bash
pnpm test src/lib/dashboard-config.test.ts
```

## Files Created

| File | Purpose |
|------|---------|
| `src/lib/dashboard-config.ts` | Schema + types + validation |
| `src/server/config-loader.ts` | File loader + caching + server functions |
| `src/lib/dashboard-config.test.ts` | Unit tests |
| `configs/llc-tax.yaml` | Test config |
| `configs/pages-plus.yaml` | Test config |
| `configs/api-mom.yaml` | Test config |
| `configs/scramjet.yaml` | Test config |
| `configs/stargate.yaml` | Test config |
| `PHASE1-DASHBOARD-YAML.md` | This document |

## Key Design Decisions

### 1. **YAML over JSON**
- More readable for human config files
- Industry standard for Kubernetes-style configurations
- Easy to add comments for documentation

### 2. **Zod Schema**
- Type-safe validation
- Automatic TypeScript inference
- Clear error messages
- Already in dependencies

### 3. **File-Based Storage (Phase 1)**
- Simple to start with
- Version controlled in repo
- Hybrid approach: Can migrate to D1 in Phase 4
- See: `src/server/config-loader.ts` is abstracted for easy migration

### 4. **In-Memory Caching**
- Avoids repeated disk/database reads
- Single load per brand per request
- Cache cleared on process restart
- For distributed systems: Can add Redis layer in Phase 4

### 5. **Arbitrary Source Config**
- `config: Record<string, unknown>` allows flexibility
- Datasources define their own config schema
- No validation at YAML level; validated when datasource fetches
- Example: github-issues expects `repo` + `labels`, stripe expects `label`

## Success Criteria (All Met ✅)

- [x] YAML schema compiles
- [x] 5 test YAMLs validate against schema
- [x] Loader reads YAML files without errors
- [x] Caching works (doesn't reload on every request)
- [x] Schema validation rejects invalid configs
- [x] TypeScript types inferred correctly
- [x] Build passes without errors

## Next: Phase 2

Phase 2 (Dynamic DataSource Instantiation) will:
1. Update `DataSourceConfig` interface to accept `brandConfig`
2. Refactor all 6 datasources to use brand-specific parameters
3. Implement `fetchBrandDashboard(slug)` server function

**Dependency**: Phase 2 depends on Phase 1 ✅ READY

## How to Verify Phase 1

### 1. Validate a config file
```bash
cd /Users/admin/Work/open-dash
node -e "
const YAML = require('yaml');
const fs = require('fs');
const config = YAML.parse(fs.readFileSync('configs/llc-tax.yaml', 'utf-8'));
console.log(JSON.stringify(config, null, 2));
"
```

### 2. Check types are correct
```bash
cd /Users/admin/Work/open-dash
npx tsc --noEmit src/lib/dashboard-config.ts
```

### 3. Verify build succeeds
```bash
cd /Users/admin/Work/open-dash
pnpm build
```

## File Structure

```
open-dash/
├── configs/
│   ├── llc-tax.yaml
│   ├── pages-plus.yaml
│   ├── api-mom.yaml
│   ├── scramjet.yaml
│   └── stargate.yaml
├── src/
│   ├── lib/
│   │   ├── dashboard-config.ts          (NEW - Schema + types)
│   │   └── dashboard-config.test.ts     (NEW - Tests)
│   └── server/
│       └── config-loader.ts             (NEW - File loader)
└── PHASE1-DASHBOARD-YAML.md             (NEW - This doc)
```

## Notes

- **YAML dependency**: Added `yaml@2.8.3` to dependencies
- **No breaking changes**: Phase 1 is additive; existing code unchanged
- **Test framework**: Tests use Vitest (already configured)
- **TypeScript**: Full type safety; no `any` types
