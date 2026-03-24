# OpenDash — Morning Briefing Operating System

**OpenDash** is an AI-powered control plane for solo founders managing multiple projects. It replaces the 30-minute "status check" routine with a 5-minute morning briefing that shows you everything that changed overnight across your whole portfolio.

```
OPEN APP → SEE what changed → DECIDE what to do → ACT → SEE result
```

---

## The Problem (Why This Exists)

Solo founders running 3-5 projects waste **30-60 minutes every morning** just figuring out where they left off:

- Revenue delta across multiple Stripe accounts
- Which deploys succeeded/failed overnight
- New GitHub issues, PRs, or code changes
- Support tickets, uptime alerts, expired domains
- Agent activity (content generated, audits run)

They open 15+ tabs (Stripe, GitHub, Vercel, analytics, email) just to answer: **"Is everything OK? What needs my attention?"**

**No tool solves this.** Sunsama handles calendar/tasks. Plausible handles analytics. Linear handles issues. But nothing gives a solo operator a **single briefing across all their projects** — including code, revenue, deployments, and AI agents.

---

## The Solution

OpenDash is a **three-panel HUD** (fighter pilot pattern):

- **Left Panel**: Context (machines, brands, issues) — changes with mode
- **Center Panel**: Briefing items, activity, drill-down details
- **Right Panel**: AI chat (persistent conversation with contextual actions)

### Three Experiences

1. **Morning Briefing** (default): "What happened while I was away?" Revenue delta, failed deploys, new issues, agent activity.
2. **Project Focus**: Drill into one brand for deep work. Chat has project context loaded.
3. **Portfolio Overview**: Health score per brand. Revenue, deploy, and issue counts at a glance.

### AI Integration

Chat responses can include `---HUD---` JSON directives to:
- Switch HUD mode
- Spawn cards in left/center panels
- Update briefing with new insights
- Approve/reject escalated items

---

## Current Status

| Phase | Status | What |
|-------|--------|------|
| **Phase 1** | ✅ Complete | YAML schema + config loader for declarative dashboards |
| **Phase 2** | ✅ Complete | Dynamic datasource instantiation per brand |
| **Phase 3** | ✅ Complete | Routes + three-panel UI (Morning Briefing, Portfolio, Project Focus) |
| **Phase 4** | 🟡 In Progress | Hybrid config loader (filesystem + Brand System API fallback) |
| **Phase 5** | 🔄 Planned | Datasource expansion + agentic execution layer + monetization |

**Build Status**: ✅ Passing (5.36s build time)
**Launch Status**: 🟡 MVP ready; auth + deploy blocking

---

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (or npm)
- Cloudflare account (for Workers deployment)

### Development

```bash
# Install dependencies
pnpm install

# Create config files (if not present)
mkdir configs
cp configs.example/*.yaml configs/

# Start dev server
pnpm dev

# Open http://localhost:3000
```

### Building

```bash
# Production build
pnpm build

# Check for linting/formatting issues
pnpm check

# Deploy to Cloudflare Workers
pnpm deploy
```

---

## Architecture

### Frontend
- **Framework**: TanStack Start (React 19, SSR)
- **Routing**: File-based routing
- **State**: Zustand (HUD store)
- **UI**: Tailwind CSS v4
- **Chat**: AssistUI (streaming)

### Backend
- **Runtime**: Cloudflare Workers (production) / Node.js (dev)
- **Config**: YAML-based per-brand (Type-safe with Zod)
- **Datasources**: 6 adapters (GitHub, Stripe, Cloudflare, Tailscale, Scalable Media)
- **Data Cache**: In-memory + D1 (optional)

### Deployment
- **Target**: Cloudflare Workers
- **Config**: Hybrid loader (filesystem dev, API production)
- **Domain**: opendash.ai (or your custom domain)

---

## Configuration

Dashboard configs are YAML files in the `configs/` directory. Each file represents one brand.

**Example: `configs/llc-tax.yaml`**
```yaml
brand: llc-tax
domain: llctax.co
description: LLC tax SaaS for founders

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

  - id: github-activity
    config:
      repo: garywu/llc-tax

  - id: tailscale
    config:
      tags: [llc-tax, prod]

  - id: scalable-media
    config:
      brand_slug: llc-tax
```

See `PHASE1-DASHBOARD-YAML.md` for complete schema documentation.

---

## Data Sources

OpenDash integrates with 6 datasources out of the box:

| Datasource | Type | Config |
|-----------|------|--------|
| **github-issues** | Code | repo, labels |
| **github-activity** | Code | repo |
| **stripe-revenue** | Business | label (to filter accounts) |
| **cloudflare-deploys** | Infra | worker name |
| **tailscale** | Infra | device tags |
| **scalable-media** | Content | brand_slug |

**Planned (Phase 5)**:
- Plausible analytics (SEO, page views)
- Uptime Kuma (uptime monitoring)
- SendGrid (email metrics)
- LLM API usage (token counts)
- YouTube analytics
- Substack newsletters

---

## API Contract (Datasources)

Each datasource implements:

```ts
interface DataSource {
  id: string;                    // "github-issues", "stripe", etc.
  name: string;                  // Display name

  fetch(config: DataSourceConfig): Promise<BriefingItem[]>;

  getStatus?(): Promise<SourceStatus>;
}

interface DataSourceConfig {
  env: Record<string, string>;        // Secrets (GITHUB_TOKEN, etc.)
  lastVisited: string | null;         // ISO timestamp
  brandConfig?: Record<string, any>;  // Brand-specific params
}

interface BriefingItem {
  id: string;
  type: "issue" | "deploy" | "revenue" | "alert" | "event" | "agent";
  priority: "low" | "medium" | "high";
  title: string;
  description?: string;
  url?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}
```

---

## HUD Modes

The UI has 5 modes that emerge from chat conversation:

| Mode | Left Panel | Center | Use Case |
|------|-----------|--------|----------|
| **operating** | Machines, brands | Activity feed | Overview + status |
| **building** | Issues | Code diff, preview | Code review, merge |
| **analyzing** | Metrics | Charts, KPIs | Performance analysis |
| **reviewing** | PRs | Diff viewer | Pull request review |
| **alert** | Error context | Alert details | Incident response |

---

## Chat Integration

Chat responses use **HUD directives** to mutate the UI:

```ts
// Chat response
"I found 3 high-priority issues in llc-tax. Here's what changed:

---HUD---
{
  "mode": "building",
  "cards": [
    { "type": "issue_card", "id": "issue-1", "panel": "center" },
    { "type": "issue_card", "id": "issue-2", "panel": "center" },
    { "type": "issue_card", "id": "issue-3", "panel": "center" }
  ]
}
---HUD---

These all need fixes before the next deploy."
```

The HUD automatically:
1. Switches to "building" mode
2. Spawns 3 issue cards in the center panel
3. User can click to review/approve/comment

---

## Secrets & Environment

### Development (`.dev.vars`)
```env
GITHUB_TOKEN=ghp_...
STRIPE_API_KEY=sk_test_...
TAILSCALE_API_KEY=tskey_...
API_MOM_KEY=sk_...
OPENROUTER_KEY=sk_...
```

### Production (Cloudflare Worker `wrangler.jsonc`)
```jsonc
{
  "env": {
    "production": {
      "vars": {
        "GITHUB_TOKEN": "ghp_...",
        "STRIPE_API_KEY": "sk_live_...",
        "BRAND_SYSTEM_API_URL": "https://brand-api.example.com"
      }
    }
  }
}
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt+1` | Switch to Operating mode |
| `Alt+2` | Switch to Building mode |
| `Alt+3` | Switch to Analyzing mode |
| `Alt+4` | Switch to Reviewing mode |
| `Alt+5` | Switch to Alert mode |
| `Alt+/` | Focus chat input |
| `Escape` | Close details panel |

---

## Roadmap

### MVP (Current)
- ✅ Morning Briefing experience
- ✅ Portfolio Overview
- ✅ Project Focus (drill-down)
- ✅ Chat with HUD directives
- 🟡 Basic auth (in progress)

### Phase 5a: Datasource Expansion
- Add 6 more datasources (Plausible, Uptime Kuma, SendGrid, etc.)
- Custom datasource plugins
- Real-time vs. polling strategies

### Phase 5b: Agentic Execution
- Chat tool-calling → actual actions
- "Merge this PR" → clicks merge button
- "Deploy to production" → triggers deploy
- Action audit trail

### Phase 5c: Monetization
- Credits/subscription billing (Stripe integration)
- Portfolio analytics (who's growing fastest, where churn happening)
- Team collaboration features
- White-label for agencies

---

## Local Development Tips

```bash
# Start dev server with hot reload
pnpm dev

# Open multiple browser tabs to test:
# Tab 1: http://localhost:3000 (main app)
# Tab 2: http://localhost:3000/brands (portfolio)

# Test config loading
# Place YAML in configs/ directory
# Reload browser to see changes

# Monitor logs
# Check browser console (Cmd+Option+J)
# Check terminal output
```

---

## Testing

Currently no automated tests. Planned for Phase 5:
- E2E tests (Playwright) for routes
- Unit tests for datasources
- Chat response validation

---

## Deployment

### Step 1: Prepare Secrets
1. Get GitHub PAT (personal access token)
2. Get Stripe API key
3. Get Tailscale API key
4. Set up `.dev.vars` for local testing

### Step 2: Configure Brands
1. Create YAML files in `configs/` directory
2. Test locally with `pnpm dev`
3. Commit to Git

### Step 3: Deploy
```bash
# Build and deploy to Cloudflare Workers
pnpm deploy

# If deploying to custom domain:
# - Create CNAME record pointing to CF Workers
# - Update wrangler.jsonc with route
```

### Step 4: Verify
1. Open your domain
2. Test Morning Briefing loads
3. Test Portfolio Overview
4. Test chat integration

---

## Related Documents

- **PRODUCT.md** — Product vision + core loop
- **PHASE1-DASHBOARD-YAML.md** — Config schema documentation
- **PHASE2-DYNAMIC-DATASOURCES.md** — Datasource implementation guide
- **PHASE3-ROUTES-UI.md** — Route + UI architecture
- **PHASE4-HYBRID-CONFIG-LOADER.md** — Config loading strategy (fs + API)
- **STATUS.md** — Current project status + launch checklist
- **CLAUDE.md** — Technical architecture + model routing

---

## Contributing

This is a solo founder project. Contributions welcome! See issues for priority items.

For major changes:
1. Open an issue first
2. Discuss approach
3. Submit PR with tests (when test suite exists)

---

## License

MIT

---

## Support

Questions or issues? Open a GitHub issue or email.

---

**Last Updated**: 2026-03-24
**Version**: 0.4 (Phases 1-4 complete)
**Next Major Release**: 0.5 (Phase 5a: Datasource expansion)
