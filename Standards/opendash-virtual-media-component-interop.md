---
name: OpenDash + Virtual-Media Component Interoperability Architecture
description: Shared monorepo workspace enabling both teams to build interoperable components using a common SDK interface. Phase 1-2 validation approach.
type: standard
---

# Component Interoperability: OpenDash + Virtual-Media

**Date**: 2026-03-25
**Status**: Architecture approved, ready for implementation
**Goal**: Prove components from different teams can be interoperable in Phase 1-2

---

## The Vision

Both **OpenDash** and **Virtual-Media** build components that implement the same `Component` interface. A single dashboard can load and compose components from both teams without knowing or caring where they came from.

```
OpenDash Dashboard
├── Stripe Revenue (OpenDash component)
├── GA4 Metrics (OpenDash component)
├── Grok Videos (Virtual-Media component)
├── Video Metrics (Virtual-Media component)
└── Any future component that implements Component interface
```

---

## Architecture: Shared Monorepo Workspace

### Repository Structure

```
atlas/  (single Git repo, multiple teams)
├── pnpm-workspace.yaml
├── package.json (root)
├── tsconfig.json (shared)
├── biome.json (shared linting)
│
├── packages/@opendash/
│   ├── sdk/                    ← Component interface spec
│   │   ├── src/
│   │   │   ├── component.ts    ← Component interface
│   │   │   ├── briefing.ts     ← BriefingItem type
│   │   │   ├── registry.ts     ← ComponentRegistry
│   │   │   ├── types.ts        ← ComponentConfig, etc.
│   │   │   └── index.ts        ← Exports
│   │   ├── package.json        ← @opendash/sdk
│   │   └── README.md
│   │
│   ├── stripe-revenue/         ← Component implementation
│   │   ├── src/
│   │   │   ├── stripe-revenue.ts
│   │   │   └── index.ts
│   │   ├── __tests__/
│   │   ├── package.json        ← @opendash-components/stripe-revenue
│   │   └── README.md
│   │
│   ├── ga4/                    ← Component implementation
│   ├── google-ads/
│   └── ...
│
├── packages/@virtual-media/
│   ├── sdk/                    ← Points to @opendash/sdk (peer dep)
│   │   └── package.json        ← depends on @opendash/sdk
│   │
│   ├── grok-component/         ← Component implementation
│   │   ├── src/
│   │   │   ├── grok.ts
│   │   │   └── index.ts
│   │   ├── __tests__/
│   │   ├── package.json        ← @virtual-media-components/grok
│   │   └── README.md
│   │
│   ├── video-metrics/          ← Component implementation
│   └── ...
│
├── apps/opendash/              ← OpenDash dashboard
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── index.ts
│   ├── package.json
│   └── ...
│
├── apps/virtual-media/         ← Virtual-Media app (future)
│   └── ...
│
└── docs/
    ├── COMPONENT-INTEROP-GUIDE.md
    └── ...
```

### Key Points

1. **Single SDK source of truth**
   - `@opendash/sdk` defines the interface
   - Both teams depend on it
   - No spec drift

2. **Scoped packages** (pnpm workspaces)
   - `@opendash/stripe-revenue` — OpenDash team's component
   - `@virtual-media-components/grok` — Virtual-Media team's component
   - Clear ownership, mixed in same repo

3. **Shared infrastructure**
   - `tsconfig.json` — Consistent TypeScript setup
   - `biome.json` — Unified linting/formatting
   - `pnpm-workspace.yaml` — Monorepo config

4. **Separate testing & builds**
   - Each package is independently tested
   - Each has own package.json, README, entry points
   - pnpm handles linking

---

## Phase 1-2: Validation Proof Points

### Phase 1: Build Components (Weeks 1-2)

**OpenDash team**:
- Extract existing 5 datasources → components
  - stripe-revenue
  - ga4
  - google-ads
  - github-issues
  - email-metrics

**Virtual-Media team**:
- Build new components in same workspace
  - grok-component (video generation)
  - video-metrics (performance tracking)

### Phase 2: Integration (Weeks 3-4)

**Dashboard integration**:
- Load components from both teams
- Registry handles both sets
- Graceful error handling
- Compose on single dashboard

**Success criteria**:
- ✅ Dashboard loads OpenDash components
- ✅ Dashboard loads Virtual-Media components
- ✅ Both sets fetch data in parallel
- ✅ One component failing doesn't break others
- ✅ UI displays all briefing items together
- ✅ Config passing works for both teams' components

---

## Component Interface Contract

### Minimal Interface (Both teams implement this)

```typescript
// @opendash/sdk/src/component.ts

export interface BriefingItem {
  id: string;
  priority: "low" | "normal" | "high";
  category: string;
  title: string;
  detail: string;
  time: string;
  isNew?: boolean;
  actionLabel?: string;
  actionHandler?: string;
}

export interface ComponentConfig {
  env: Record<string, string | undefined>;
  lastVisited: string | null;
  brandConfig?: Record<string, unknown>;
}

export interface ComponentStatus {
  connected: boolean;
  lastFetch?: string;
  error?: string;
  itemCount?: number;
}

export interface Component {
  // Identity
  id: string;
  name: string;
  icon: string;
  description: string;
  version: string;
  author: string;

  // Configuration
  requiresConfig: boolean;

  // Behavior
  fetch(config: ComponentConfig): Promise<BriefingItem[]>;
}

export class ComponentRegistry {
  register(component: Component): void;
  get(id: string): Component | undefined;
  getAll(): Component[];
  async fetchAll(config: ComponentConfig): Promise<BriefingItem[]>;
}

export function createComponentRegistry(): ComponentRegistry;
```

---

## Usage Example

### OpenDash Dashboard

```typescript
// apps/opendash/src/dashboard.ts
import { createComponentRegistry } from '@opendash/sdk';

// OpenDash components
import { stripeRevenue } from '@opendash-components/stripe-revenue';
import { ga4 } from '@opendash-components/ga4';
import { googleAds } from '@opendash-components/google-ads';

// Virtual-Media components (same way!)
import { grokComponent } from '@virtual-media-components/grok';
import { videoMetrics } from '@virtual-media-components/video-metrics';

// Create registry
const registry = createComponentRegistry();

// Register all components (order doesn't matter)
registry.register(stripeRevenue);
registry.register(ga4);
registry.register(googleAds);
registry.register(grokComponent);
registry.register(videoMetrics);

// On dashboard load, fetch all
async function loadDashboard(user: User) {
  const items = await registry.fetchAll({
    env: process.env,
    lastVisited: user.lastVisited,
    brandConfig: { label: user.orgName }
  });

  // Items contain briefing items from all 5 components
  return items.sort(byPriority);
}
```

---

## Benefits of This Approach

### For Phase 1-2 Validation

✅ **Single source of truth** — One SDK interface
✅ **No external dependencies** — Both teams in same workspace
✅ **Easy to develop** — Both teams can iterate together
✅ **Proven before shipping** — Test interop before npm/registry
✅ **Team isolation** — Scoped packages clearly separate concerns
✅ **Unified tooling** — Shared tsconfig, linter, build setup

### For Future (Phase 3+)

✅ **Easy to separate** — Extract to separate repos when ready
✅ **Choose distribution** — Can go npm, private registry, or stay monorepo
✅ **No refactoring needed** — Interface stays the same
✅ **Independent versioning** — Each package versions independently

---

## Implementation Roadmap

### Week 1: Setup
- [ ] Create `packages/@opendash/sdk/` with interface definitions
- [ ] Add `pnpm-workspace.yaml` config
- [ ] Set up shared `tsconfig.json`
- [ ] Create `packages/@opendash/stripe-revenue/` (proof of concept)

### Week 2: Extraction
- [ ] Extract remaining OpenDash datasources (GA4, Google Ads, etc.)
- [ ] Create `packages/@virtual-media/` namespace
- [ ] Virtual-Media builds 2-3 components using SDK
- [ ] All components have unit tests

### Week 3: Integration
- [ ] Update OpenDash dashboard to import all components
- [ ] Test component registry with mixed sources
- [ ] Verify graceful error handling
- [ ] Update documentation with new structure

### Week 4: Validation
- [ ] Load both team's components on single dashboard
- [ ] Verify data flows correctly
- [ ] Test configuration passing
- [ ] Document findings & lessons learned

---

## Testing Strategy

### Unit Tests (Per Component)
Each component has its own test suite:

```typescript
// packages/@opendash-components/stripe-revenue/__tests__/stripe.test.ts
describe('Stripe Revenue Component', () => {
  it('returns unconfigured message when no STRIPE_SECRET_KEY', async () => {
    const items = await stripeRevenue.fetch({ env: {}, lastVisited: null });
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('stripe-not-connected');
  });
});
```

### Integration Tests (Registry)
Test multiple components together:

```typescript
// apps/opendash/__tests__/dashboard-integration.test.ts
describe('Dashboard with mixed components', () => {
  it('loads components from both teams', async () => {
    const registry = createComponentRegistry();
    registry.register(stripeRevenue);     // OpenDash
    registry.register(grokComponent);     // Virtual-Media

    const items = await registry.fetchAll(config);
    expect(items.length).toBeGreaterThan(0);
  });

  it('handles partial failures gracefully', async () => {
    const registry = createComponentRegistry();
    registry.register(stripeRevenue);     // Will fail (no key)
    registry.register(grokComponent);     // Should succeed

    const items = await registry.fetchAll(config);
    // Should have items from grokComponent, graceful error from stripe
    expect(items.some(i => i.id.includes('grok'))).toBe(true);
  });
});
```

### E2E Tests (Dashboard)
Test the full flow:

```typescript
// e2e/dashboard.spec.ts
test('dashboard displays components from both teams', async () => {
  const page = await browser.newPage();
  await page.goto('http://localhost:3000');

  // Should see briefing items from both teams
  expect(await page.locator('[data-category="revenue"]')).toBeVisible(); // OpenDash
  expect(await page.locator('[data-category="video"]')).toBeVisible();   // Virtual-Media
});
```

---

## Governance & Collaboration

### Team Responsibilities

**OpenDash Team**:
- Maintains `@opendash/sdk` (interface contract)
- Builds OpenDash components
- Owns component registry implementation
- Integrates into OpenDash dashboard

**Virtual-Media Team**:
- Builds Virtual-Media components
- Implements against `@opendash/sdk` interface
- Provides feedback on SDK ergonomics
- Tests components with registry

### Decision Making

**SDK Interface changes** — Require both teams' agreement
- Breaking changes affect both
- Add deprecation period before removal
- Use semantic versioning

**Component implementations** — Team's discretion
- Each team owns their components
- Independent testing & quality
- Can use different patterns/libraries (as long as interface works)

---

## Migration Path (Phase 3+)

Once validated, options for distribution:

### Option A: Stay in Monorepo
- Keep `packages/@opendash/*` and `packages/@virtual-media/*`
- Publish to npm as scoped packages
- CI/CD publishes on commit
- Most control, simplest for now

### Option B: Separate Repos + Shared SDK
- Extract `opendash-component-sdk` to separate repo
- Both teams depend on it
- OpenDash stays as is
- Virtual-Media creates separate `virtual-media-components` repo

### Option C: Private Registry (GitHub Packages, Artifactory)
- Keep everything private
- Not exposed on public npm
- Only accessible to internal teams
- Good for proprietary components

**Decision made in Month 2, after Phase 1-2 validation.**

---

## Success Metrics

By end of Phase 2:

| Metric | Target | Proof |
|--------|--------|-------|
| Component extraction | 5+ OpenDash components | Packages in workspace |
| Virtual-Media build | 2+ components | Packages in workspace |
| Interface stability | Zero breaking changes | SDK unchanged week 1-4 |
| Test coverage | >90% per component | Coverage reports |
| Integration tests | 10+ mixed-team tests | E2E suite passing |
| Dashboard composition | All components load | Briefing items visible |
| Error handling | Single failure non-blocking | Tests verify graceful fallback |
| Documentation | Complete guide | COMPONENT-INTEROP-GUIDE.md |

---

## Related Documents

- `Standards/component-sdk-spec.md` — Detailed SDK specification
- `Standards/COMPONENT-ECOSYSTEM-VALIDATION.md` — Proof of concept
- `docs/roadmaps/phases/PHASE1-DASHBOARD-YAML.md` — Phase 1 overview

---

## Next Steps

1. ✅ Approve this architecture
2. Create `COMPONENT-INTEROP-GUIDE.md` with developer setup
3. Set up workspace structure
4. Begin Phase 1 extraction

**Ready to start?**
