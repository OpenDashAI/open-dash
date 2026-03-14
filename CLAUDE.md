# OpenDash — AI Operations Control Plane

## What
One interface to manage all machines, all brands, all execution. Three-panel HUD with AI-driven contextual mode switching.

## Tech Stack
- **TanStack Start** — full-stack React, file-based routing, SSR
- **TanStack AI** — chat integration (useChat, streaming, tool calls, approvals)
- **Tailwind CSS v4** — utility-first styling
- **Cloudflare Workers** — deployment target
- **Biome** — linting and formatting

## Architecture

### Three-Panel HUD
- **Left (Context)**: AI-driven — machines, brands, issues. Changes with mode.
- **Center (Focus)**: AI-driven — activity feed, stats, code, charts. Changes with mode.
- **Right (Chat)**: User-docked — persistent conversation with AI.

### HUD Modes
Modes emerge from conversation, not menus:
- `operating` — machine grid, brand status, activity feed
- `building` — issues, code diff, preview
- `analyzing` — charts, KPIs, funnels
- `reviewing` — PR diff, approve/reject
- `alert` — error context, affected systems

### Card Registry
Components in `src/components/cards/` registered in `src/lib/card-registry.tsx`.
AI emits card directives; renderer looks up and mounts components.

## Commands
```bash
pnpm dev          # dev server on :3000
pnpm build        # production build
pnpm deploy       # build + wrangler deploy
pnpm check        # biome check
```

## Three-Layer Execution Model
- **Layer 1** (this UI): Human + AI creative partnership. Chat interface.
- **Layer 2** (future): Autonomous context assembly + orchestration.
- **Layer 3** (Code Turtle): Maximum throughput execution across machines.

## Related
- Design doc: `~/Work/garywu/Operations/team-model.md`
- Brand: OpenDash / opendash.ai
- Org: github.com/OpenDashAI
