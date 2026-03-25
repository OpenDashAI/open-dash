# Phase 3: Routes + Declarative UI Implementation

**Status**: ✅ COMPLETE
**Date**: 2026-03-24
**Commit**: `1997813` (`feat: Phase 3 — Routes + UI for declarative dashboards`)
**Depends on**: Phase 2 ✅ (Dynamic DataSource instantiation)

---

## What Was Built

### 1. Three Core Route Experiences

#### A. Morning Briefing Route (`/`)

The default experience when users open OpenDash. Implements the "See → Decide → Act" loop.

**Key Features:**
- **Intelligent Data Loader**: Fetches 8 data sources in parallel:
  - Machines (Tailscale device status)
  - Brands (portfolio overview)
  - Events (GitHub activity)
  - Metrics (revenue, deploys, uptime)
  - Issues (open GitHub issues across brands)
  - Chat history (previous conversations)
  - Threads (ongoing research threads)
  - Last visited timestamp (for delta notifications)

- **Briefing Assembly**: Combines two sources:
  - Pending escalations (high-priority, actionable items)
  - DataSource registry items (from Phase 2)

- **Three-Panel HUD**:
  - Left: Context panel (machines, brands, issues — changes per HUD mode)
  - Center: MorningFlow component (briefing items, actionable cards)
  - Right: ChatPanel (persistent AI conversation)

- **Keyboard Shortcuts**:
  - `Alt+1-5`: Switch HUD mode
  - `Alt+/`: Focus chat input
  - `Escape`: Close details panel

- **Live Data Updates**:
  - Polling via `useLiveData` hook (15s interval, visibility-aware)
  - Automatic reconnect on disconnect

**Code**: `src/routes/index.tsx` (180+ lines)

---

#### B. Portfolio Overview Route (`/brands`)

The portfolio health view for operators managing multiple brands.

**Key Features:**
- **Parallel Brand Loading**: Fetches dashboard configs and briefing items for all brands simultaneously
- **Health Score Calculation**: Computes per-brand metrics:
  - Base score: 40 (healthy) or 80 (has items)
  - Bonus: +10 if high-priority items exist
  - Bonus: +10 if >5 items (needs attention)
- **Aggregated Metrics**:
  - Issue count per brand
  - Deploy count per brand
  - Revenue count per brand
- **Visual Rendering**: BrandsPortfolioView component displays grid of brand health cards

**Code**: `src/routes/brands.tsx` (74 lines)

---

#### C. Brand-Specific Routes (`/brands/:brandSlug`)

Drills into a single brand for focused work (Project Focus experience).

**Status**: Route structure exists; component implementation in progress.

---

### 2. Card Registry & Components

Six card types render different data in the three-panel HUD:

| Card Type | Used In | Renders | Action |
|-----------|---------|---------|--------|
| **machine_card** | Operating mode | Tailscale device status, CPU/memory | SSH into machine |
| **brand_card** | All modes | Brand health, revenue, key metrics | Click → brand drill-down |
| **activity_card** | Building mode | GitHub commits, PRs, issues | View diff / approve |
| **status_card** | Analyzing mode | KPIs, trends, funnels | Drill into metric |
| **approval_card** | Alert mode | Escalation items (L2→L1) | Approve or reject |
| **issue_card** | Building mode | GitHub issue body, labels, assignees | Comment / close |

**Code Location**: `src/components/cards/` (10 card components)

---

### 3. Panel Components

#### ContextPanel (`src/components/panels/ContextPanel.tsx`)
Left panel that changes content based on HUD mode. Renders active cards for context.

#### FocusPanel (`src/components/panels/FocusPanel.tsx`)
Center panel that displays the main content: briefing items, activity, or drill-down details.

#### ChatPanel (`src/components/panels/ChatPanel.tsx`)
Right panel for persistent AI conversation. Integrated with HUD store for mode switching.

---

### 4. UI Component Hierarchy

```
HUD Root (index.tsx)
├── PanelResizer (manages draggable panel dividers)
│   ├── ContextPanel (Left)
│   │   └── Card Registry (machine, brand, activity, etc.)
│   ├── FocusPanel (Center)
│   │   └── MorningFlow (briefing item renderer)
│   └── ChatPanel (Right)
│       └── AssistUI integration (streaming chat)
├── Keyboard Shortcuts Hook (Alt+1-5, Alt+/)
└── Live Data Hook (polling + reconnect)
```

---

### 5. Integration with Phase 2: Dynamic Datasources

**Route Integration Pattern:**
```ts
// In any route loader:
const result = await fetchBrandDashboard({
  data: {
    brandSlug: "llc-tax",
    lastVisited: "2026-03-24T09:00:00Z"
  }
});

// Returns:
{
  config: DashboardYaml,      // Brand-specific config (Phase 2)
  items: BriefingItem[],      // Briefing items from datasources
  statuses: SourceStatus[],   // Fetch success/failure per datasource
  error?: string
}
```

Each route loader calls `fetchBrandDashboard` or `fetchAllSources` to populate initial state.

---

## Reactive State Management

**HUD Store** (`src/lib/hud-store.ts`) — Zustand-based reactive store:

```ts
export const useHudState = () => {
  // Current experience
  experience: HudExperience  // "briefing" | "focus" | "portfolio"
  mode: HudMode              // "operating" | "building" | "analyzing" | "reviewing" | "alert"

  // Data
  briefingItems: BriefingItem[]
  machines: Machine[]
  brands: Brand[]
  events: Event[]
  metrics: Metric[]
  issues: Issue[]

  // Chat
  threads: ThreadSummary[]
  activeThread: string | null
  messages: StoredMessage[]

  // UI
  selectedBrand: string | null
  expandedCardId: string | null
}
```

Chat responses with `---HUD---` JSON directives mutate this store, triggering panel re-renders.

---

## Key Design Decisions

1. **File-Based Routing** (TanStack Router):
   - Routes are file-based in `src/routes/` for simplicity
   - Automatic `routeTree.gen.ts` generation
   - No manual route registration

2. **Parallel Data Loading**:
   - All independent queries run in parallel via `Promise.all`
   - Timeouts prevent one slow query from blocking load
   - Error handling per query (partial failure OK)

3. **Three Experiences** (not five modes):
   - "Morning Briefing" (what changed)
   - "Project Focus" (one brand, drill-down)
   - "Portfolio Overview" (all brands, health grid)
   - HUD modes emerge from chat conversation, not from menu

4. **Reactivity via HUD Store**:
   - Chat mutates store → panels re-render
   - No prop drilling across three panels
   - Each panel subscribes only to needed state

5. **Keyboard-First Navigation**:
   - Alt+1-5 for mode switching
   - Alt+/ for chat focus
   - Vim-like keybindings (future)

---

## Testing Status

- ✅ Route loaders execute without errors
- ✅ Data aggregation works end-to-end
- ✅ Card registry renders all 6 card types
- ✅ HUD store mutations work correctly
- ✅ Keyboard shortcuts functional
- ⚠️ Chat integration needs E2E test coverage
- ⚠️ Live polling needs reconnect testing

---

## Files Changed in Phase 3

| File | Status | Lines | Purpose |
|------|--------|-------|---------|
| `src/routes/index.tsx` | New | 180+ | Morning Briefing route |
| `src/routes/brands.tsx` | New | 74 | Portfolio Overview route |
| `src/routes/brands/$brandSlug/index.tsx` | New | 100+ | Brand Focus route (partial) |
| `src/components/MorningFlow.tsx` | Exists | 9K | Briefing item renderer |
| `src/components/BrandFocusView.tsx` | New | 8K | Brand drill-down UI |
| `src/components/BrandsPortfolioView.tsx` | New | 7K | Portfolio health grid |
| `src/components/panels/*` | Exists | 5K | Left/center/right panels |
| `src/lib/hud-store.ts` | Exists | 4K | Reactive state |
| `src/lib/briefing.ts` | Updated | — | Added EXPERIENCES enum |

---

## What Phase 3 Unlocks

✅ Users can see their morning briefing
✅ Users can drill down from briefing item to details
✅ Users can switch between operating/building/analyzing modes
✅ Users can access portfolio overview
✅ Chat can mutate the UI via HUD directives
✅ Keyboard navigation works smoothly

---

## Known Limitations & Next Steps

### Phase 3 Gaps (for Phase 4+)
- **Brand System API fallback**: Currently loads from filesystem only (Phase 4 fixes)
- **Datasource plugin system**: Only hardcoded 6 datasources (will expand to 10-12)
- **Agent actions**: Chat can suggest but not execute actions yet
- **Live refresh**: Polling works but WebSocket would be better
- **Mobile responsiveness**: Three-panel layout is desktop-only
- **Persistence**: Draft responses, filters not saved

### Phase 4+ Roadmap
1. **Hybrid config loading** (fs + Brand API fallback) — IN PROGRESS
2. **Agentic execution layer** — Chat tool-calling into action execution
3. **Datasource plugins** — Expand from 6 to 12 strategic sources
4. **WebSocket live updates** — Real-time data without polling
5. **Mobile UI** — Responsive three-panel or mobile-optimized layout

---

**Type**: Implementation completion document
**Status**: Phase 3 complete; Phase 4 in progress
**Audience**: Developers building on OpenDash, product stakeholders

