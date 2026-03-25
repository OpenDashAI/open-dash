---
name: Component System — Correct Architecture Understanding
description: Components are local event-driven UI (shadcn model), data comes from Scram Jet pipelines via D1. NOT npm packages.
type: standard
---

# Component System — Correct Architecture

**Date**: 2026-03-25
**Status**: Architecture clarified

---

## The Three Layers

```
Layer 1: DATA COLLECTION — Scram Jet
├── YAML pipelines (no code for 95% of APIs)
├── 22+ pre-built operators (fetch-api, transform-ai, output-webhook, etc.)
├── Runs on Cloudflare Workers
├── Pushes metrics via service binding RPC → metrics-collector Worker → D1
└── Handles: Stripe, GA4, Google Ads, Meta, GitHub, Email, etc.

Layer 2: STORAGE — D1 (metrics table)
├── source, priority, category, title, detail, timestamp, metadata
├── Indexed by source+timestamp, priority, category
└── REST API: GET /api/metrics (with filtering)

Layer 3: UI COMPOSITION — Composable Components (shadcn model)
├── CompositionProvider (event bus)
├── Local components: DataSelector, Filter, Display, Summary, Transport, etc.
├── Components communicate via events (emitEvent / onComponentEvent)
├── Components READ from D1 (not fetch from external APIs)
├── shadcn-style registry for catalog/discovery
└── AI remixes by selecting components and wiring event chains
```

---

## What This Means

### Data Collection is SOLVED
Scram Jet handles ALL external API integrations:
- Stripe revenue → Scram Jet YAML pipeline → D1
- GA4 traffic → Scram Jet YAML pipeline → D1
- Google Ads spend → Scram Jet YAML pipeline → D1
- Meta Ads → Scram Jet YAML pipeline → D1
- GitHub issues → Scram Jet YAML pipeline → D1
- Email metrics → Scram Jet YAML pipeline → D1

**Components do NOT fetch from external APIs.**
**Components READ from D1 and RENDER.**

### Component Model = shadcn/ui
- Components are NOT npm packages
- Components live locally in the codebase
- Users/AI browse a registry (catalog)
- Components are copied into the project (like `npx shadcn add button`)
- You own them, you modify them
- No version management, no package updates

### AI Remix = Select from catalog + Wire events
```
User: "I'm a SaaS founder. Show me revenue and traffic."

AI:
1. Queries D1: "What data sources exist?" → stripe, ga4
2. Selects from catalog: MetricsSource, BriefingDisplay, AlertFilter
3. Wires events:
   <CompositionProvider>
     <MetricsSource componentId="stripe" source="stripe" />
     <MetricsSource componentId="ga4" source="ga4" />
     <BriefingDisplay componentId="briefing" listenToComponent="any" />
     <AlertFilter componentId="alerts" listenToComponent="briefing" />
   </CompositionProvider>
4. User sees: Composed dashboard with just their data
```

---

## What Was Wrong (Previous Approach)

❌ Extracting GA4 as `@opendash-components/ga4` npm package
❌ Building registry-based SDK with fetch() → BriefingItem[]
❌ Components calling external APIs directly
❌ Package distribution / npm publishing
❌ Marketplace for third-party developers

**Why wrong**: Scram Jet already collects data. Components just need to render it.

---

## What's Actually Needed

1. **Composable components that read from D1** (not fetch from APIs)
   - MetricsSource component (reads D1 metrics by source/category)
   - BriefingDisplay component (renders BriefingItems from metrics)
   - AlertFilter component (filters by priority/severity)
   - TrendChart component (visualizes metric trends)
   - etc.

2. **shadcn-style registry** (component catalog)
   - List of available components with descriptions
   - Event contracts (what each emits/listens to)
   - Props schema (what configuration each accepts)
   - AI can query this to compose dashboards

3. **AI composition layer**
   - Understands what components exist (from registry)
   - Understands what data exists (from D1 metrics)
   - Wires components together based on user intent
   - Generates CompositionProvider + component JSX

---

## Related Files

- `src/lib/composition-provider.tsx` — Event bus
- `src/lib/composition-context.ts` — Component interface
- `src/components/composable/` — Existing components
- `src/examples/` — Dashboard, MusicPlayer, EmailClient compositions
- `workers/metrics-collector/` — Scram Jet → D1 bridge
- `workers/sample-scram-jet-pipeline/` — Example Scram Jet → D1 flow
- `src/lib/db/schema.ts` — D1 metrics table schema

