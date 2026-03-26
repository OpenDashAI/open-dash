# OpenDash — Custom Intelligence Dashboards

**OpenDash** is a dashboard printer. Tell it about your business, get a custom intelligence dashboard. Not templates — AI composes a dashboard specifically for you.

```
DESCRIBE your business → AI COMPOSES your dashboard → SEE what matters → ACT
```

---

## How It Works

### 1. Connect Your Tools
"I use Stripe, GA4, and GitHub."

Scram Jet YAML pipelines auto-connect to your tools and stream data into a unified store. Adding a data source takes minutes, not weeks.

### 2. AI Builds Your Dashboard
"I'm a SaaS founder. Show me revenue, traffic, and open issues."

AI reads the component registry, selects the right components, wires them together, and validates the composition. Every dashboard is custom.

### 3. See What Matters
Your morning briefing shows exactly what changed. Anomalies are flagged. Alerts are prioritized. Nothing is noise.

---

## Architecture

```
Scram Jet (YAML pipelines)  →  D1 metrics table  →  Composable Components  →  AI Composition
     50+ data sources              unified schema        event-driven UI          constraint satisfaction
```

- **Scram Jet**: YAML pipeline engine on Cloudflare Workers. Connects to any API with zero code.
- **D1**: All metrics in one table (source, priority, category, title, detail, metadata).
- **Components**: Local, event-driven (shadcn model). Communicate via `@opendash/composition` event bus.
- **AI**: Reads registry (`public/r/index.json`), selects components, wires events, outputs verified compositions.

See `CLAUDE.md` for full architecture details.

---

## The Dashboard Printer

OpenDash generates custom dashboards for any ICP at zero marginal cost.

| Dashboard | ICP | Data Sources |
|-----------|-----|-------------|
| Morning Briefing | SaaS Founders | Stripe, GA4, GitHub |
| Campaign Performance | Marketing Managers | GA4, Google Ads, Meta, Email |
| Client Portfolio | Agency Owners | Multi-client GA4, ad spend |
| Store Metrics | E-commerce Operators | Shopify, Google Ads, Meta |
| Audience Growth | Content Creators | YouTube, Substack, Gumroad |
| Incident + Deploy | DevOps Leads | Datadog, PagerDuty, GitHub Actions |

Each dashboard is simultaneously: **product, demo, and marketing material**.

See `Standards/gtm-dashboard-printer-model.md` for full strategy.

---

## UI: Three-Panel HUD

- **Left Panel**: Context (data sources, brands, filters)
- **Center Panel**: Briefing items, charts, drill-down
- **Right Panel**: AI chat (persistent conversation)

### Composable Components

Components communicate through events, not imports:

```tsx
<CompositionProvider>
  <MetricsSource componentId="stripe" source="stripe" />
  <MetricsSource componentId="ga4" source="ga4" />
  <AlertFilter componentId="alerts" listenToComponent="any" />
  <BriefingDisplay componentId="briefing" listenToComponent="alerts" />
  <Summary componentId="summary" listenToComponent="briefing" />
</CompositionProvider>
```

Add a component = one line. Remove a component = delete one line. AI does this automatically.

---

## Getting Started

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

```bash
pnpm build        # production build
pnpm deploy       # Cloudflare Workers
pnpm check        # biome lint
```

---

## Tech Stack

- **TanStack Start** — full-stack React, SSR, file-based routing
- **Tailwind CSS v4** — styling
- **Cloudflare Workers** — deployment (D1, R2, Durable Objects)
- **Scram Jet** — YAML pipeline engine for data collection
- **@opendash/composition** — event-driven component system
- **Biome** — linting and formatting

---

## Key Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Architecture reference (read first) |
| `PRIORITY.md` | Current session priorities |
| `public/r/index.json` | Component registry with event contracts |
| `src/lib/composition-provider.tsx` | Event bus (re-exports from @opendash/composition) |
| `src/components/composable/` | All composable components |
| `src/examples/` | Working example compositions |
| `workers/metrics-collector/` | Scram Jet → D1 bridge |
| `Standards/` | Architecture decisions and strategies |
| `docs/strategy/PRODUCT.md` | Product vision |
| `docs/COMPONENT_MESH_ARCHITECTURE.md` | How to build composable components |

---

## License

MIT
