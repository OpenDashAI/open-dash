# Phase 2: Dynamic DataSource Instantiation

**Status**: ✅ COMPLETE
**Date**: 2026-03-24
**Issue**: OpenDashAI/open-dash#6
**Depends on**: Phase 1 ✅

## What Was Built

### 1. Updated DataSourceConfig Interface

Added optional `brandConfig` field to support brand-specific parameters:

```ts
export interface DataSourceConfig {
  env: Record<string, string | undefined>;      // Global secrets
  lastVisited: string | null;                    // Briefing timestamp
  brandConfig?: Record<string, unknown>;         // Brand-specific params (NEW)
}
```

### 2. Refactored All 6 Datasources

Each datasource now accepts brand-specific config via `brandConfig`:

| Datasource | Brand Params | Implementation |
|-----------|--------------|-----------------|
| **github-issues** | `repo`, `labels` | Parameterized API URL + labels filter |
| **github-activity** | `repo` | Parameterized repo URL |
| **stripe-revenue** | `label` | Filter label in item title |
| **cloudflare-deploys** | `worker` | Filter by worker name substring |
| **tailscale** | `tags[]` | Filter devices by tag array |
| **scalable-media** | `brand_slug` | Filter brands by slug |

**Example usage in YAML**:
```yaml
sources:
  - id: github-issues
    config:
      repo: garywu/llc-tax
      labels: [bug, urgent]
  - id: stripe
    config:
      label: llc-tax
  - id: cloudflare
    config:
      worker: llc-tax-worker
```

### 3. fetchBrandDashboard() Server Function

New server function that orchestrates brand-specific fetching:

```ts
export const fetchBrandDashboard = createServerFn()
  .input<{ brandSlug: string; lastVisited?: string | null }>()
  .handler(async ({ data }) => {
    // 1. Load dashboard.yaml config
    // 2. Fetch from specified datasources only
    // 3. Merge global + brand-specific config
    // 4. Return items + statuses

    return { config, items, sources };
  });
```

**Returns**:
```ts
{
  config: DashboardYaml | null;           // Parsed YAML
  items: BriefingItem[];                  // All briefing items
  sources: DataSourceInfo[];              // Status per source
  error?: string;                         // If config not found
}
```

### 4. Files Modified

| File | Changes |
|------|---------|
| `src/lib/datasource.ts` | Added `brandConfig?` to interface |
| `src/datasources/github-issues.ts` | Parameterized repo + labels |
| `src/datasources/github-activity.ts` | Parameterized repo |
| `src/datasources/stripe-revenue.ts` | Parameterized label |
| `src/datasources/cloudflare-deploys.ts` | Parameterized worker filter |
| `src/datasources/tailscale.ts` | Parameterized tag filter |
| `src/datasources/scalable-media.ts` | Parameterized brand filter |
| `src/server/datasources.ts` | Added `fetchBrandDashboard()` |

## Design Highlights

### 1. **Backward Compatible**
- Existing `fetchAllSources()` still works (global, all datasources)
- All datasources have fallbacks (use default repo/labels if not specified)
- No breaking changes to existing code

### 2. **Brand-Specific Filtering**
Each datasource filters based on YAML config:
- GitHub: repo + labels
- Stripe: label (for brand attribution)
- Cloudflare: worker name contains filter
- Tailscale: tags array
- Scalable Media: brand slug equality

### 3. **Error Handling**
- Missing datasource in registry → logged, not fatal
- Missing config file → returns error + empty items
- API failures → caught, status set to disconnected
- All error handling graceful (no crashes)

### 4. **No New Dependencies**
- All changes use existing Zod, TanStack Start, etc.
- No breaking changes to package.json
- Build still passes ✅

## How It Works

### Example Flow

```
Browser calls:
  fetchBrandDashboard({ brandSlug: "llc-tax", lastVisited: "2026-03-24T10:00:00Z" })

Server:
  1. Load /configs/llc-tax.yaml
  2. Parse & validate via Zod schema ✅
  3. For each source in config.sources:
     a. Get datasource from registry
     b. Merge: globalConfig + sourceConfig.config → brandSpecificConfig
     c. Call datasource.fetch(brandSpecificConfig)
  4. Collect all items + statuses
  5. Return { config, items, sources }

Result:
  {
    config: {
      brand: "llc-tax",
      domain: "llctax.com",
      sources: [
        { id: "github-issues", config: { repo: "garywu/llc-tax" } },
        { id: "stripe", config: { label: "llc-tax" } },
        ...
      ],
      widgets: [...]
    },
    items: [
      { id: "gh-issue-123", title: "#123 Fix login bug", ... },
      { id: "stripe-daily-revenue", title: "[llc-tax] Daily revenue: $234", ... },
      ...
    ],
    sources: [
      { id: "github-issues", name: "GitHub Issues", status: { connected: true, ... } },
      { id: "stripe", name: "Stripe Revenue", status: { connected: true, ... } },
      ...
    ]
  }
```

## Testing

### Manual Test (TypeScript)
```ts
// From server context:
const result = await fetchBrandDashboard({
  data: {
    brandSlug: "llc-tax",
    lastVisited: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
});

console.log(result.config.brand);        // "llc-tax"
console.log(result.items.length);        // e.g., 23
console.log(result.sources.length);      // e.g., 4 (only configured sources)
```

### Verify Parameterization
- github-issues: Check that URL includes `garywu/llc-tax` (not vault)
- stripe: Check title includes `[llc-tax]` prefix
- cloudflare: Check filter works (only llc-tax-worker results)
- All datasources: Check they respect `lastVisited` timestamp

## Success Criteria (All Met ✅)

- [x] DataSourceConfig updated with `brandConfig` field
- [x] All 6 datasources accept and use brand-specific params
- [x] github-issues: repo + labels parameterized
- [x] stripe: label filtering works
- [x] cloudflare: worker name filter works
- [x] tailscale: tag filter works
- [x] scalable-media: brand slug filter works
- [x] fetchBrandDashboard() server function implemented
- [x] Graceful error handling (no crashes on missing config)
- [x] All fallbacks working (defaults when config not provided)
- [x] No breaking changes to existing code
- [x] Build passes ✅

## Architecture

```
Browser
  ↓
fetchBrandDashboard({ brandSlug })
  ↓
loadDashboardConfig() [Phase 1]
  ↓
DashboardYaml loaded + validated
  ↓
For each source in config.sources:
  - Get datasource from registry
  - Merge: globalConfig + brandConfig
  - Call datasource.fetch(merged)
  ↓
Collect items + statuses
  ↓
Return { config, items, sources }
  ↓
Browser renders dashboard
```

## What's Next: Phase 3

Phase 3 will add the routes and UI:
- `GET /brands` — Portfolio view listing all brands
- `GET /brands/:slug` — Brand-specific dashboard
- `BrandsPortfolioView` component
- `BrandFocusView` component
- Navigation between brands

**Phase 2 unblocks Phase 3** — the data pipeline is now ready.

## Commit Info

```
feat: Phase 2 — Dynamic DataSource instantiation per brand

Refactor all 6 datasources to accept brand-specific config:
- Add brandConfig field to DataSourceConfig interface
- github-issues: parameterize repo + labels
- github-activity: parameterize repo
- stripe: parameterize label
- cloudflare: parameterize worker filter
- tailscale: parameterize tags
- scalable-media: parameterize brand slug

Implement fetchBrandDashboard() server function that:
- Loads YAML config per brand
- Instantiates brand-specific datasources
- Merges global + brand config
- Fetches from all sources in parallel
- Returns items + statuses

All datasources have fallbacks for missing config.
Error handling is graceful (no crashes).
No breaking changes to existing code.

Issue: OpenDashAI/open-dash#6
```

## Notes

- All changes are additive; existing `fetchAllSources()` unchanged
- Backward compatibility maintained: brands not in YAML still work with defaults
- Ready for Phase 3 (routes + UI)
