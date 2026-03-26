---
name: Frontasy / OpenDash Split — What Lives Where
description: The SaaS printer composition system belongs in Frontasy. OpenDash is a dashboard product that uses Frontasy's engine.
type: standard
---

# Frontasy / OpenDash Split

**Date**: 2026-03-25
**Status**: Decision made

---

## The Split

**Frontasy** = Front-end generation engine. Generates any SaaS front-end from description.
**OpenDash** = Dashboard/intelligence product. Uses Frontasy's engine for its own UI.

---

## What Moves to Frontasy

### Composition System (core engine)
| Current Location (open-dash) | New Location (frontasy) |
|------------------------------|------------------------|
| `packages/@opendash/composition/` | `packages/@frontasy/composition/` |
| `src/hooks/composable/` (5 headless hooks) | `packages/@frontasy/hooks/` |
| `src/components/CompositionRenderer.tsx` | `packages/@frontasy/renderer/` |
| `src/lib/composition-schema.ts` | `packages/@frontasy/renderer/` |
| `public/r/index.json` (registry) | Merges with Frontasy's existing registry |

### AI Generation
| Current Location (open-dash) | New Location (frontasy) |
|------------------------------|------------------------|
| `src/components/generated/` (proof-of-concept) | `src/generated/` (production) |
| `tools/design-extractor/` | `tools/design-extractor/` |
| Design extraction JSONs | `tools/design-extractor/extracted/` |

### Architecture Docs
| Document | Action |
|----------|--------|
| `Standards/architecture-v2-saas-printer.md` | Move to Frontasy (this IS Frontasy's architecture) |
| `Standards/saas-printer-universal-components.md` | Move to Frontasy |
| `Standards/component-registry-solves-ai-composition.md` | Move to Frontasy |
| `Standards/gtm-dashboard-printer-model.md` | Keep in OpenDash (dashboard GTM) |
| `Standards/component-system-correct-architecture.md` | Update: reference Frontasy as the engine |

### Example Apps (proofs of concept)
| Example | Move? |
|---------|-------|
| `GeneratedCRM/` | Move to Frontasy (CRM is not a dashboard) |
| `GeneratedStageTimer/` | Move to Frontasy (timer is not a dashboard) |
| `GeneratedBooking/` | Move to Frontasy (booking is not a dashboard) |
| `ComposedDashboard/` | Keep in OpenDash (this IS a dashboard) |

---

## What Stays in OpenDash

### Dashboard-Specific
- Scram Jet integration (YAML pipelines → D1 metrics)
- Morning briefing / portfolio view
- Alerting, anomaly detection
- Brand/project management
- HUD modes (operating, building, analyzing)

### Infrastructure (shared, not moved)
- Clerk auth + RBAC
- D1 database
- HudSocket (WebSocket transport)
- TanStack server functions
- Cloudflare Workers deployment

### OpenDash as Frontasy Customer
OpenDash's dashboard UI is composed using Frontasy's engine:
```
npm install @frontasy/composition @frontasy/hooks
```
Then uses hooks + CompositionRenderer for its dashboard views.

---

## What Already Exists in Frontasy

Frontasy already has capabilities that the composition system needs:

| Capability | Frontasy Status | Replaces |
|-----------|----------------|----------|
| shadcn registry (`frontasy.com/r/`) | Built (LOB 2) | `public/r/index.json` in open-dash |
| 8 theme families | Built | Design tokens we were planning |
| Quality pipeline (critique + refine) | Built | Layer 8 eval loop we were planning |
| Multi-pass generation | Built | Layer 7 generation we were proving |
| Component library (atoms/molecules/organisms) | Built | Generated components pattern |
| System prompt with design tokens | Built (35KB) | Design extraction metadata |

---

## Frontasy's New Architecture (After Merge)

```
FRONTASY — AI Front-End Generation Platform

Layer 1: REGISTRY         shadcn-style component + composition registry
Layer 2: HOOKS            Headless composition hooks (@frontasy/hooks)
Layer 3: COMPOSITION      JSON format → CompositionRenderer (@frontasy/renderer)
Layer 4: GENERATION       AI: hook + domain + theme → domain component (multi-pass)
Layer 5: DESIGN DATABASE  Real app designs extracted → retrieval database
Layer 6: QUALITY          Critique + refine pipeline (Gemini rubric)
Layer 7: ORCHESTRATOR     User intent → retrieve → generate → compose → deploy

Output Types:
  - HTML landing pages (existing LOB 1)
  - Composable SaaS apps (NEW — from open-dash composition system)
  - shadcn components (existing LOB 2)
```

### Frontasy generates TWO things now:
1. **Static pages** (existing): HTML + Tailwind → deploy to Pages Plus
2. **Composable apps** (new): Hooks + components + JSON composition → deploy anywhere

---

## OpenDash's New Architecture (After Split)

```
OPENDASH — Dashboard Intelligence Product

Data:       Scram Jet → D1 metrics
Auth:       Clerk + RBAC + orgs
Transport:  HudSocket DO + WebSocket
UI:         @frontasy/composition + @frontasy/hooks (dependency)
Views:      Morning briefing, portfolio, project focus, analytics
Features:   Alerting, anomaly detection, brand management
```

OpenDash is a PRODUCT. Frontasy is the ENGINE.

---

## Migration Steps

### Phase 1: Create packages in Frontasy repo
1. Create `packages/@frontasy/composition/` (copy from `@opendash/composition`)
2. Create `packages/@frontasy/hooks/` (copy 5 hooks)
3. Create `packages/@frontasy/renderer/` (CompositionRenderer + schema)
4. Merge with existing Frontasy registry

### Phase 2: Merge design extraction
1. Move `tools/design-extractor/` to Frontasy
2. Merge extracted JSONs with Frontasy's existing design system
3. Connect to Frontasy's quality pipeline (critique + refine)

### Phase 3: Update OpenDash to depend on Frontasy
1. `pnpm add @frontasy/composition @frontasy/hooks @frontasy/renderer`
2. Update imports throughout open-dash
3. Remove moved code from open-dash
4. Keep dashboard-specific components in open-dash

### Phase 4: Expand Frontasy generation
1. Frontasy can now generate static pages (existing) AND composable apps (new)
2. "Generate a booking page" → Frontasy outputs composition JSON + components
3. "Generate a dashboard" → Frontasy outputs composition → OpenDash renders it

---

## Naming

| Package | Purpose |
|---------|---------|
| `@frontasy/composition` | Event bus (CompositionProvider, useCompositionContext) |
| `@frontasy/hooks` | Headless hooks (useComposableList, Form, Card, Chart, Timer) |
| `@frontasy/renderer` | CompositionRenderer + composition schema |
| `@frontasy/registry` | Registry format + CLI tooling |
| `@frontasy/themes` | 8 theme families + design tokens |

---

## Key Principle

**Frontasy is the engine. OpenDash, and every other SaaS, is a customer.**

Frontasy generates front-ends. OpenDash is one of those front-ends (focused on dashboards). A CRM would be another. A stage timer would be another. All powered by the same Frontasy engine.
