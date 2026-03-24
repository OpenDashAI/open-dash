# Phase 4: Hybrid Config Loader (Filesystem + Brand System API)

**Status**: 🟡 IN PROGRESS
**Date Started**: 2026-03-24
**Commit**: `ad31aad` (`feat: Phase 4 — Hybrid config loader (fs + Brand System API)`)
**Depends on**: Phase 3 ✅ (Routes + UI)

---

## The Problem

Phase 1-3 assumed configs are on disk (`configs/{brandSlug}.yaml`). This works for local development but doesn't scale to production:

- **Development**: Configs in filesystem → works locally
- **Production (Cloudflare Workers)**: No filesystem access → configs must come from external API
- **Multi-team scenarios**: Each team manages their own dashboard configs → need central service

**Solution**: Hybrid loader that tries filesystem first (dev), falls back to Brand System API (prod).

---

## What's Being Built

### 1. Dual-Source Config Loading

**File: `src/server/config-loader.ts`**

```ts
async function loadDashboardYaml(
  brandSlug: string,
  apiUrl?: string
): Promise<DashboardYaml | null> {
  // Try filesystem first (development)
  const fsConfig = await loadDashboardYamlFromDisk(brandSlug);
  if (fsConfig) return fsConfig;

  // Fall back to API (production)
  const apiConfig = await loadDashboardYamlFromApi(brandSlug, apiUrl);
  if (apiConfig) return apiConfig;

  // Neither worked
  return null;
}
```

#### A. Filesystem Loader (`loadDashboardYamlFromDisk`)

Reads `configs/{brandSlug}.yaml` and validates via Zod schema (Phase 1).

- **Input**: Brand slug (e.g., `"llc-tax"`)
- **Output**: Parsed and validated `DashboardYaml` object or null
- **Errors**: Returns null for "file not found"; logs all other errors

**Use Case**: Local development, testing, self-hosted instances

---

#### B. Brand System API Loader (`loadDashboardYamlFromApi`)

Fetches config from external Brand System API.

- **Input**: Brand slug + API URL (via env var `BRAND_SYSTEM_API_URL`)
- **API Endpoint**: `GET /api/dashboards/{brandSlug}`
- **Response Format**: JSON matching `DashboardYaml` schema
- **Errors**: Returns null if API unreachable or returns invalid data

**Use Case**: Cloudflare Workers, multi-team SaaS, dynamic config management

---

### 2. In-Memory Caching

All configs (fs or API) are cached after first load:

```ts
const configCache = new Map<string, DashboardYaml>();

function getCachedDashboardYaml(brandSlug: string): DashboardYaml | undefined {
  return configCache.get(brandSlug);
}

function setCachedDashboardYaml(
  brandSlug: string,
  config: DashboardYaml
): void {
  configCache.set(brandSlug, config);
}
```

**Cache Invalidation Strategy**:
- No TTL (cache lasts for Worker lifetime)
- On deploy, Worker restarts and cache clears
- Future: Add webhook listener for config changes (no restart needed)

---

### 3. Exported Server Functions

#### `loadDashboardYamlCached(brandSlug, apiUrl?)`

Loads a single dashboard config. Uses cache + fallback chain.

```ts
// In a route loader:
const config = await loadDashboardYamlCached("llc-tax");
```

---

#### `listAvailableDashboards()`

Lists all available dashboards. Determines source via env var strategy:

**Strategy 1 (Development)**:
- Scans `configs/` directory for all `.yaml` files
- Returns list of slugs (one per file)
- Example: `["llc-tax", "pages-plus", "scramjet"]`

**Strategy 2 (Production)**:
- Calls Brand System API `/api/dashboards` (list endpoint)
- Returns full dashboard metadata + configs
- Example: `[{ brand: "llc-tax", domain: "...", sources: [...] }]`

---

### 4. Environment Configuration

**For Development**:
```env
# .dev.vars (Wrangler)
BRAND_SYSTEM_API_URL=  # Not set; filesystem only
```

**For Production (Workers)**:
```env
# wrangler.jsonc
env.production.vars:
  BRAND_SYSTEM_API_URL: "https://brand-system-api.example.com"
```

**For Self-Hosted**:
```env
# .env
BRAND_SYSTEM_API_URL="http://localhost:3001"
```

---

## API Contract (Brand System)

OpenDash expects the following endpoints on the Brand System:

### GET /api/dashboards
Lists all available dashboards.

**Response**:
```json
[
  {
    "brand": "llc-tax",
    "domain": "llctax.co",
    "description": "LLC tax SaaS",
    "sources": [
      { "id": "github-issues", "config": { "repo": "garywu/llc-tax" } },
      { "id": "stripe", "config": { "label": "llc-tax" } }
    ]
  }
]
```

---

### GET /api/dashboards/{brandSlug}
Fetch single dashboard config.

**Response**:
```json
{
  "brand": "llc-tax",
  "domain": "llctax.co",
  "description": "LLC tax SaaS",
  "sources": [...]
}
```

---

## Deployment Path

### Local Development
1. Place `configs/{brand}.yaml` files in `configs/` directory
2. `BRAND_SYSTEM_API_URL` unset in `.dev.vars`
3. Loader uses filesystem only

### Staging (Cloudflare Workers)
1. Set `BRAND_SYSTEM_API_URL` to staging Brand System instance
2. Deploy to CF Workers
3. Loader tries fs (fails), falls back to API (succeeds)

### Production (Cloudflare Workers)
1. Set `BRAND_SYSTEM_API_URL` to production Brand System API
2. Deploy to opendash.ai
3. Loader uses API as source of truth

---

## Code Changes

| File | Change | Lines |
|------|--------|-------|
| `src/server/config-loader.ts` | Added API fallback + caching | +150 |
| `.dev.vars.example` | Added `BRAND_SYSTEM_API_URL` | +1 |
| `wrangler.jsonc` | Added env.production.vars | +3 |
| `src/routes/brands.tsx` | Updated to use `listAvailableDashboards` | ~5 |

---

## Testing Checklist

- [ ] **Development path**: Configs load from `configs/*.yaml`
- [ ] **Fallback path**: If file missing, API fetches from Brand System
- [ ] **Caching**: Second load uses cache, no disk/API call
- [ ] **API errors**: If API returns 404, gracefully return null
- [ ] **Env vars**: `BRAND_SYSTEM_API_URL` properly loaded in Worker
- [ ] **Schema validation**: Invalid config (missing required fields) rejected
- [ ] **Production deploy**: Cloudflare Workers can reach Brand System API
- [ ] **List endpoint**: `listAvailableDashboards()` returns all brands

---

## Next Steps (Phase 5+)

1. **Build Brand System API**:
   - Endpoint: `GET /api/dashboards`
   - Endpoint: `GET /api/dashboards/{brandSlug}`
   - Persistence: Store configs in Supabase or D1
   - Auth: JWT or Cloudflare Access

2. **Webhook Invalidation**:
   - Brand System calls OpenDash `/webhook/config-changed/{brandSlug}`
   - OpenDash clears cache entry
   - No Worker restart needed for config updates

3. **Config UI**:
   - Dashboard editor to create/edit YAML configs
   - Web form instead of text editor
   - Live preview of schema errors

4. **Multi-tenant**: Support multiple OpenDash instances pointing to same Brand System

---

## Known Issues

- ⚠️ No authentication between OpenDash and Brand System API (future: JWT)
- ⚠️ Cache never expires (future: TTL + webhooks)
- ⚠️ Filesystem scan (`listAvailableDashboards`) not optimized for many files

---

**Type**: Implementation status document
**Status**: Mostly complete; awaiting Brand System API to exist
**Audience**: Developers integrating Brand System, DevOps, deployment managers

