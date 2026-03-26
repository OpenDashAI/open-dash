# OpenDash — SaaS Printer

## ⚠️ ARCHITECTURE v2 (Read First)

**Always check `PRIORITY.md` at repo root before starting work.**
**Full spec: `Standards/architecture-v2-saas-printer.md`**

### Four Layers
1. **Data** — Scram Jet YAML pipelines collect ALL external data → D1. Internal state also in D1. Components NEVER call external APIs.
2. **Primitives** — ~20 structural components (List, Form, Card, Chart, Timer) that define behavior/structure but NOT domain opinions. Local files, NOT npm packages.
3. **Generation** — AI customizes primitives into domain components (ContactList, TimerDisplay, DealPipeline) by filling in customization slots. Done ONCE at print time. Generated files owned by the project (shadcn model).
4. **Composition** — AI wires domain components via event contracts. Outputs declarative JSON. Runtime renders CompositionProvider tree.

### Shared Contract
`@opendash/composition` — the ONE npm package (event bus: CompositionProvider, CompositionContext, useCompositionContext)

### What Does NOT Exist
- ❌ npm packages for domain components
- ❌ Component marketplace or third-party distribution
- ❌ Component SDK with fetch() → BriefingItem[]
- ❌ Pre-built domain components (AI generates them from primitives)

### Active Issues
- **#127** — Epic: SaaS Printer v2 Implementation
- **#128** — Build 5 core structural primitives
- **#129** — AI generation: primitive → domain component
- **#130** — Composition format: JSON that runtime renders
- **#131** — D1 schema generation for arbitrary domains
- **#132** — Update registry format for primitive customization slots

### Key Files
- `public/r/index.json` — Component registry
- `src/lib/composition-provider.tsx` — Event bus
- `src/components/composable/` — All composable components
- `src/examples/` — Dashboard, MusicPlayer, EmailClient compositions
- `workers/metrics-collector/` — Scram Jet → D1 bridge
- `Standards/component-registry-solves-ai-composition.md` — Design rationale
- `Standards/component-system-correct-architecture.md` — Architecture overview

---

## Tech Stack
- **TanStack Start** — full-stack React, file-based routing, SSR
- **Tailwind CSS v4** — utility-first styling
- **Cloudflare Workers** — deployment target (D1, R2, Durable Objects)
- **Biome** — linting and formatting
- **Scram Jet** — YAML pipeline engine for data collection

## Three-Panel HUD (Fighter Pilot Pattern)
- **Left (Context)**: AI-driven — machines, brands, issues
- **Center (Focus)**: AI-driven — activity feed, stats, approvals
- **Right (Chat)**: User-docked — persistent conversation with AI

## Model Routing (NO direct Anthropic API)
- **Tier 1 (free)**: Workers AI / Ollama — status lookups
- **Tier 2 (cheap)**: Qwen 72B via API Mom → OpenRouter — dashboard chat
- **Tier 3 (research)**: GatherFeed L1-L4 via API Mom — investigation queries
- **Tier 4 (subscription)**: Claude Pro/Max via Claude Code — interactive sessions

## Commands
```bash
pnpm dev          # dev server on :3000
pnpm build        # production build
pnpm deploy       # build + wrangler deploy
pnpm check        # biome check
```

## Secrets (.dev.vars / wrangler secret)
- `API_MOM_URL`, `API_MOM_KEY` — API Mom proxy
- `OPENROUTER_KEY` — OpenRouter API key
- `TAILSCALE_API_KEY` — Tailscale device status
- `GITHUB_TOKEN` — GitHub PAT
- `SCRAMJET_WEBHOOK_SECRET` — Scram Jet metrics auth

## Related
- Brand: OpenDash / opendash.ai
- Org: github.com/OpenDashAI
- Scram Jet: github.com/garywu/scram-jet
