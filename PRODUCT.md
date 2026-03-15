# OpenDash — Product Vision

## The Insight

Solo founders running 3-5 projects waste 30-60 minutes every morning just figuring out where they left off. They open 15+ tabs across Stripe, analytics, GitHub, hosting dashboards, email — just to answer: "Is everything OK? What needs my attention?"

No tool solves this. Sunsama does morning planning for calendar/tasks. Plausible does analytics. Linear does issues. But nothing gives a solo operator a **single briefing across all their projects** — including code state, deploys, revenue, SEO, and agent activity.

Enterprise has AI control planes (Microsoft Agent 365, GitHub). Solo operators have nothing.

## The Product

**OpenDash is a morning briefing that becomes your operating system.**

Not a dashboard you check when something breaks. A **daily ritual** you open every morning that tells you what matters, lets you act on it, and gets smarter over time.

## ICP: The Multi-Project Operator

- Solo founder or 1-3 person team
- Runs 3-5 active projects/brands simultaneously
- Technical (can deploy, read code, use CLI)
- Revenue: $1K-$50K MRR across portfolio
- Stack: Cloudflare/Vercel, Stripe, GitHub, analytics
- Pain: context switching, morning startup time, no portfolio-wide view
- Spends $100-300/mo on tools, values simplicity over features
- Discovers tools via HN, Twitter/X build-in-public, word of mouth

**Not the ICP**: Enterprise teams, non-technical founders, single-project operators.

## Core Loop: See → Decide → Act → See Result

Current OpenDash breaks this loop — panels show data but you can't act on it. The chat lets you act but it's disconnected from what you see.

### The Fixed Loop

```
OPEN APP
  ↓
BRIEFING (what changed, what's broken, what needs you)
  ↓
CLICK a briefing item → CONTEXT loads (right panel shows details)
  ↓
ACT (approve, deploy, dismiss, investigate via chat)
  ↓
RESULT updates the briefing → item resolved
  ↓
NEXT ITEM (or done — go build)
```

## Three Experiences (not five modes)

The current 5 modes (operating, building, analyzing, reviewing, alert) are abstract. Users don't think "I'm in analyzing mode." They think:

### 1. Morning Briefing (default on open)
**"What happened while I was away?"**

- Revenue delta since last visit (across all Stripe accounts)
- Deploys that succeeded/failed overnight
- SEO changes (rankings up/down, new indexed pages)
- Support tickets / GitHub issues opened
- Agent activity (content generated, audits run)
- Domains expiring soon

Each item is **actionable**: click to drill down, swipe to dismiss, tap to act.

### 2. Project Focus
**"I'm working on this one project right now."**

- Select a project/brand → everything else fades
- Left panel: that project's issues, deploys, metrics
- Center panel: recent activity, content pipeline, agent status
- Chat panel: AI has project context loaded, can act on it

### 3. Portfolio Overview
**"How's the whole thing doing?"**

- Revenue across all brands (DRR, MRR, trends)
- Health scores per brand (green/yellow/red)
- Resource usage (API costs, worker invocations)
- Comparative: which brand is growing, which is stalling

## What Changes in the Code

### Cards become interactive
```
Click BrandCard → loads Project Focus for that brand
Click MachineCard → shows machine details + running processes
Click IssueCard → shows issue body, lets you close/comment
Click revenue metric → drills into revenue breakdown
```

### Briefing replaces static activity feed
Instead of a reverse-chronological event list, the center panel on load shows a **prioritized briefing** — items ranked by urgency, grouped by type, each with an action button.

### Chat becomes contextual
When you're in Project Focus for "llc-tax", the chat system prompt includes that brand's context. You don't have to say "audit llc-tax" — you say "audit this" and it knows.

### Data sources become plugins
Instead of hardcoded GitHub/Tailscale/SM fetchers, define a data source interface:
```ts
interface DataSource {
  id: string
  name: string
  icon: string
  fetch(): Promise<BriefingItem[]>
  actions?: Action[]
}
```
Ship with: GitHub, Stripe, Cloudflare, Plausible. Let users add their own.

## The Daily Habit

Steal from Sunsama: a **guided 5-minute morning flow**.

1. **Open app** → Briefing loads automatically
2. **Review items** (30 seconds each) → dismiss, snooze, or act
3. **Pick focus** → select today's primary project
4. **Go** → Project Focus loads, chat ready

The shutdown version (end of day):
1. **What shipped today** (auto-generated from git + deploys)
2. **What's still open** → snooze or schedule for tomorrow
3. **Revenue update** → daily total across portfolio

## Pricing Direction

| Tier | Price | Includes |
|------|-------|----------|
| Free | $0 | 2 projects, briefing, basic chat |
| Pro | $19/mo | Unlimited projects, all data sources, priority chat model |
| Team | $49/mo | 3 seats, shared briefings, team activity |

Multi-site support is table stakes (every competitor charges per-site — don't). The expansion trigger: free users hit the 2-project limit and need the 3rd.

## Competitive Position

| Competitor | What they do | What OpenDash does differently |
|---|---|---|
| Sunsama ($16/mo) | Morning planning for calendar + tasks | Briefing for code, revenue, deploys, agents |
| Tanka (free+) | AI co-founder with long-term memory | HUD-first not chat-first, technical operations |
| Linear ($8/mo) | Issue tracking | We consume Linear data, not replace it |
| Plausible ($9/mo) | Web analytics | We show analytics alongside revenue, deploys, issues |
| Grafana (free) | DevOps dashboards | We're for product operators, not SREs |
| Google CC (free) | Email + calendar briefing | We brief on technical operations, not email |

**Positioning**: "The morning briefing for solo founders running multiple products."

Not a dashboard. Not a project manager. Not another AI chat. A **briefing** that knows your projects and lets you act.

## What to Build Next (Priority Order)

### Phase 1: The Briefing (ship this first)
- [ ] Replace static activity feed with prioritized briefing
- [ ] Briefing items from: GitHub (issues, deploys), revenue (mock → Stripe), SEO (mock → Plausible/GSC)
- [ ] Each item has: icon, title, detail, action button, dismiss
- [ ] "Last visited" timestamp → show only what changed since

### Phase 2: Interactive Cards
- [ ] Click-through on all cards (brand → project focus, issue → detail)
- [ ] Project Focus view (single-project mode)
- [ ] Contextual chat (system prompt includes current project context)

### Phase 3: Data Source Plugins
- [ ] DataSource interface + registry
- [ ] Built-in: GitHub, Stripe (revenue), Cloudflare (deploys), Plausible (analytics)
- [ ] Settings page to connect accounts (OAuth or API key)

### Phase 4: The Ritual
- [ ] Guided morning flow (5-min onboarding experience)
- [ ] End-of-day summary (auto-generated)
- [ ] "What shipped today" from git history

### Phase 5: Multi-User
- [ ] Auth via Cloudflare Access or email magic link
- [ ] Per-user project assignments
- [ ] Shared briefings for small teams
