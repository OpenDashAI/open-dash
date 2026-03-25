# OpenDash in the Atlas Board Ecosystem

**Context**: OpenDash is not a standalone product. It's a **foundational dashboard layer** for the broader Atlas organizational operating system.

---

## Atlas Board Vision (From Atlas PRD)

**Atlas** is the org operating system with a persistent C-suite of agents running 24/7:

```
┌─────────────────────────────────────────────┐
│ Atlas Board: C-Suite Operating System       │
├─────────────────────────────────────────────┤
│ CEO Agent         (strategy, daily brief)   │
│ CFO Agent         (spend, budget, ROI)      │
│ COO Agent         (ops, train progress)     │
│ CMO Agent         (marketing, ranking)      │
│ CTO Agent         (dev, code quality)       │
└─────────────────────────────────────────────┘
         ↓
    Dashboard UI + Chat
         ↓
  (OpenDash is the primary interface)
```

---

## How OpenDash Fits

### OpenDash = Visual Intelligence Layer for Atlas Board

OpenDash serves **three purposes** in the Atlas ecosystem:

#### 1️⃣ **Standalone Product** (Weeks 1-12)
- **MVP (Week 1-2)**: Founder morning briefing with 6 datasources
- **Growth (Week 3-6)**: Validation with founders, onboarding, notifications
- **Scale (Week 7-12)**: AI analytics (charting, NLQ, anomaly detection), 6+ datasources
- **Target Users**: Solo founders, GTM teams, RevOps leaders
- **Revenue**: $2-5k MRR by Week 12

#### 2️⃣ **Atlas Board Dashboard** (Week 13+)
- **CEO panel**: Morning brief from CEO agent
- **CFO panel**: Spend report + budget tracking
- **COO panel**: Train progress, Mulan activity, blockers
- **CMO panel**: Ranking trends, content pipeline health
- **Chat interface**: "CFO, how much did we spend on API Mom this week?"

#### 3️⃣ **Org Monitoring Datasource** (Phase 5+)
- OpenDash can become a datasource **for itself**
- Atlas agents read OpenDash metrics
- Example: CEO agent asks "How many external founders are using OpenDash?" → CFO creates a Founder Metrics datasource in OpenDash → reads from it

---

## Why This Matters

### Problem Statement (from Atlas PRD)

> Prime (a Claude Code conversation) is the current seat of org intelligence. It reads MEMORY.md, knows all repos, makes strategic decisions. But Prime is:
> - **Ephemeral** — every new conversation starts cold
> - **Manual** — you have to open it; it never comes to you
> - **Unspecialized** — one agent doing everything
> - **Not scalable** — can't manage 36+ repos without context overflow

### OpenDash Solution

OpenDash replaces the manual "open Prime" workflow with:
- ✅ **Persistent agents** (Atlas Board C-suite owns the reasoning)
- ✅ **Push-based updates** (Board sends briefings to Telegram/dashboard, you don't ask)
- ✅ **Specialized dashboards** (CFO shows only finance, COO shows only ops)
- ✅ **Scalable** (add new datasource → new metric appears automatically)

---

## Three-Layer Architecture

```
Layer 1: Data Collection
├─ Datasources (fetch from APIs)
├─ Example: GitHubIssuesSource, StripeRevenueSource
└─ Added by: You (OpenDash team)

Layer 2: Reasoning (ATLAS BOARD AGENTS)
├─ CEO Agent (strategy, resource allocation)
├─ CFO Agent (finance, spend tracking)
├─ COO Agent (ops, blocker detection)
├─ CMO Agent (marketing, ranking trends)
└─ CTO Agent (dev, code quality)

Layer 3: Presentation (OPENDASH)
├─ Morning briefing (synthesis of all above)
├─ CEO panel, CFO panel, COO panel, CMO panel
├─ Chat interface ("CFO, show me spend by project")
└─ Notifications (Telegram, Slack)
```

**Key Insight**: OpenDash is Layer 3 — presentation + UX. The agents (Layer 2) do the reasoning. The datasources (Layer 1) collect the data.

---

## Execution Timeline

### Phase 1-3 (Weeks 1-12): OpenDash as Standalone

**Goal**: Prove founder morning briefing concept with 100+ signups, $2-5k MRR.

**Not dependent on Atlas Board**: OpenDash works independently.

```
Week 1-2:   MVP Launch (auth, deploy, landing page)
Week 3-6:   Founder Validation (interviews, feedback, retention)
Week 7-12:  AI Analytics (charting, NLQ, anomaly, 6 new datasources)

Result: Standalone product with active users and revenue
```

### Phase 4 (Weeks 13-26): OpenDash Becomes Atlas Interface

**Goal**: Once OpenDash is proven, integrate as primary UI for Atlas Board agents.

**Critical Sequence**:
1. **Week 13**: Decide if OpenDash is successful (hitting targets?)
2. **Week 14-20**: If yes → Build Atlas Board integration
   - Create CFO datasource (pull from CFO DO storage)
   - Create COO datasource (pull from COO DO storage)
   - Create CMO datasource (pull from CMO DO storage)
   - Add chat interface to talk to agents
3. **Week 21-26**: Add more specialized agent datasources

**Not dependent on each other**: OpenDash can ship independently in Phase 1-3. Atlas Board agents can be built in parallel (different codebase, different team/session). Integration happens at week 13+.

---

## Concrete Example: CFO Panel in OpenDash

### Today (OpenDash Standalone)
User sees: Stripe revenue, GitHub activity, Cloudflare deploys

### Week 13 (Atlas Integration)
OpenDash adds **CFO datasource**:

```typescript
// src/datasources/atlas-cfo.ts (Week 13+)
export const atlasUpsellSource: DataSource = {
  id: "atlas-cfo",
  async fetch(config) {
    // Read from Atlas CFO DO (in same account)
    const cfoReport = await fetch("https://atlas.example.com/board/cfo/state", {
      headers: { Authorization: `Bearer ${config.atlasToken}` }
    });

    const { spend, budget, burn, anomalies } = await cfoReport.json();

    return [
      {
        id: "atlas-cfo-spend",
        title: `Spend: $${spend}/mo vs Budget: $${budget}`,
        priority: spend > budget * 0.9 ? "high" : "normal",
        status: "active",
        metadata: { spend, budget, burn, anomalies }
      }
    ];
  }
};
```

**In YAML config**:
```yaml
brand: atlas-org
sources:
  - id: github-issues
  - id: stripe-revenue
  - id: cloudflare-deploys
  - id: atlas-cfo          # ← NEW: connects to Atlas Board CFO agent
  - id: atlas-coo          # ← NEW: connects to Atlas Board COO agent
  - id: atlas-cmo          # ← NEW: connects to Atlas Board CMO agent
```

**Result**: Morning briefing now includes:
- "Your spend is $X, on track for budget $Y"
- "Train 21 is blocked by [issue]"
- "Revenue keyword 'AI agents' dropped 5 positions"

All coming from the persistent Atlas agents, not manual Prime conversations.

---

## Why This Architecture Is Smart

### 1. Independent Development
- **OpenDash team** (you) builds MVP independently
- **Atlas team** (future) builds C-suite agents independently
- **Integration** happens at a well-defined API boundary (datasources)

### 2. Reusable Datasources
- Once you build a GitHub datasource for OpenDash founders
- Atlas CFO reuses it for org-wide GitHub monitoring
- COO reuses it for train progress tracking
- No duplication

### 3. Separable Concerns
- OpenDash = how to visualize and interact with data
- Atlas = how to reason about and decide with data
- You can ship OpenDash without Atlas Board
- Atlas can use other dashboards besides OpenDash

### 4. Revenue Model Flexibility
- OpenDash = B2B product for external founders + teams (SaaS revenue)
- Atlas Board = internal tool for org operations (cost savings)
- They can have different monetization strategies

---

## Strategic Questions

### Q1: Should We Wait for Atlas Board?
**No**. OpenDash is valuable independently:
- Founders need morning briefing tools
- Large TAM (solo founders, GTM teams, RevOps)
- Builds the foundation for everything else

Atlas Board is a separate concern (internal org ops).

### Q2: Should We Design OpenDash with Atlas Integration in Mind?
**Yes, but lightly**:
- ✅ Use datasource pattern (clean separation of concerns)
- ✅ Support arbitrary datasources (not just hardcoded 6)
- ❌ Don't over-engineer for Atlas specifically in Phase 1-2
- ✅ In Phase 3+, add support for "internal agent datasources"

### Q3: Does This Change the OpenDash Roadmap?
**No**. The roadmap stays the same:
- Phase 1-2: Founder briefing MVP
- Phase 3: AI analytics (charting, NLQ, anomaly detection)
- Phase 4: Scale to $10-20k MRR
- Phase 5: Consider DaaS, white-label, embedded API

**Addition** (Week 13+): If Atlas Board is ready, OpenDash becomes its primary UI.

---

## Comparison: OpenDash Standalone vs. OpenDash in Atlas

| Aspect | Standalone (Now) | In Atlas (Week 13+) |
|--------|---|---|
| **Users** | External founders, GTM teams | You + your org |
| **Data Sources** | 6-12 external APIs | 6-12 external + 3-5 internal agents |
| **Reasoning** | Static (briefing items) | Dynamic (agents reason daily) |
| **Freshness** | Poll-based (user load triggers fetch) | Push-based (agents trigger updates) |
| **Revenue** | B2B SaaS | Internal cost savings |
| **Complexity** | Medium | Higher |

Both versions use the same **foundation** (datasources, cards, UI).

---

## Timeline for Integration

### If OpenDash Succeeds (Week 12)
✅ 100+ signups, 50+ weekly actives, $2-5k MRR

**Week 13-16**: Build Atlas integration
- [ ] Create `atlas-cfo` datasource
- [ ] Create `atlas-coo` datasource
- [ ] Create `atlas-cmo` datasource
- [ ] Add agent chat interface
- [ ] Deploy to opendash.ai/board

**Week 17-26**: Expand agent datasources
- [ ] Build more sophisticated Atlas queries
- [ ] Add predictive alerts from agents
- [ ] Create specialist dashboards (finance, ops, marketing)

### If OpenDash Plateaus (Week 12)
❌ <50 signups, stalled at <10 weekly actives

**Decision**: Focus on understanding why, don't integrate with Atlas yet. OpenDash as standalone product needs work before becoming org tool.

---

## Inbox Integration (Full Circle)

Remember the inbox portfolio discussion?

**Week 13 (After OpenDash is proven)**:
- You use OpenDash to track your research portfolio
- CEO agent monitors: "How many portfolio items are ready to build?"
- CFO agent tracks: "What's the estimated revenue for portfolio projects?"
- Your inbox becomes part of org decision-making

```
Inbox Research Portfolio
    ↓
OpenDash Datasource (reads from Airtable API)
    ↓
OpenDash Dashboard (/brands/inbox-research)
    ↓
Atlas CEO Agent (reads from OpenDash)
    ↓
Morning Brief: "You have 3 research projects with high viability + low effort"
```

---

## Key Takeaway

**OpenDash is NOT competing with Atlas Board. OpenDash IS the visual interface for Atlas Board.**

- **Now (Week 1-12)**: Build OpenDash as standalone founder product
- **Later (Week 13+)**: OpenDash becomes the primary dashboard for Atlas agents
- **End result**: You have a product (OpenDash) + an internal tool (OpenDash + Atlas Board)

The architecture supports both use cases with minimal overlap.

---

**Type**: Strategic positioning document
**Status**: Ready to reference during Phase 3+ planning
**Audience**: You + future team

