# OpenDash — AI Operations Control Plane

## What
One interface to manage all machines, all brands, all execution. Three-panel HUD with AI-driven contextual mode switching.

## Tech Stack
- **TanStack Start** — full-stack React, file-based routing, SSR
- **Tailwind CSS v4** — utility-first styling
- **Cloudflare Workers** — deployment target
- **Biome** — linting and formatting

## Architecture

### Three-Panel HUD (Fighter Pilot Pattern)
- **Left (Context)**: AI-driven — machines, brands, issues. Changes with mode.
- **Center (Focus)**: AI-driven — activity feed, stats, approvals. Changes with mode.
- **Right (Chat)**: User-docked — persistent conversation with AI.

### HUD Modes
Modes emerge from conversation, not menus:
- `operating` — machine grid, brand status, activity feed
- `building` — issues, code diff, preview
- `analyzing` — charts, KPIs, funnels
- `reviewing` — PR diff, approve/reject
- `alert` — error context, affected systems

### Card Registry
6 card types in `src/components/cards/`, registered in `src/lib/card-registry.tsx`:
- `machine_card` — Tailscale machine status
- `brand_card` — brand health, score, revenue
- `activity_card` — event feed
- `status_card` — KPI metrics
- `approval_card` — L2→L1 escalation with approve/reject
- `issue_card` — GitHub issue with team labels

### AI-Driven UI Protocol
Chat responses can include `---HUD---` JSON directives to:
- Switch HUD mode
- Spawn cards in left/center panels
- Cleared by next mode transition

### Reactive HUD Store
`src/lib/hud-store.ts` — useSyncExternalStore. Chat mutates, panels re-render.

## Model Routing (NO direct Anthropic API)

Layered cost strategy — maximize Pro/Max subscription:
- **Tier 1 (free)**: Workers AI / Ollama on stargate-wsl — status lookups
- **Tier 2 (cheap)**: Qwen 72B via API Mom → OpenRouter (~$0.0003/call) — dashboard chat
- **Tier 3 (research)**: GatherFeed L1-L4 via API Mom — investigation queries
- **Tier 4 (subscription)**: Claude Pro/Max via Claude Code — interactive creative sessions

Dashboard chat defaults to Tier 2. API Mom provides: permanent cache, cost attribution, budget enforcement, fallback chain.

## Server Functions
- `src/server/machines.ts` — Tailscale API → machine status
- `src/server/brands.ts` — GitHub API → brand data
- `src/server/activity.ts` — GitHub Issues #12 → activity feed + metrics
- `src/server/chat.ts` — API Mom → OpenRouter → Qwen 72B (with fallback chain)
- `src/server/research.ts` — API Mom → GatherFeed deep research (L1-L4)

## Secrets (.dev.vars / wrangler secret)
- `API_MOM_URL` — API Mom proxy (https://apimom.dev)
- `API_MOM_KEY` — API Mom project key
- `OPENROUTER_KEY` — OpenRouter API key (BYOK)
- `TAILSCALE_API_KEY` — Tailscale device status
- `GITHUB_TOKEN` — GitHub PAT for issues/activity

## Commands
```bash
pnpm dev          # dev server on :3000
pnpm build        # production build
pnpm deploy       # build + wrangler deploy
pnpm check        # biome check
```

## Three-Layer Execution Model
- **Layer 1** (this UI): Human + AI creative partnership
- **Layer 2** (future): Autonomous context assembly + orchestration (SM Durable Object)
- **Layer 3** (Code Turtle): Maximum throughput execution across machines

## Distribution
- **Web**: CF Workers (opendash.ai or staging URL)
- **Desktop**: Tauri wrapper (future) — same web UI + system tray, local filesystem, Claude Code IPC

## Related
- Design doc: `~/Work/garywu/Operations/team-model.md`
- Brand: OpenDash / opendash.ai
- Org: github.com/OpenDashAI
