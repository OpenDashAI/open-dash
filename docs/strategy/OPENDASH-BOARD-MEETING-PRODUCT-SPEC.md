# OpenDash: Board Meeting Product Spec

**Purpose**: OpenDash automates and visualizes Board meetings
**Users**: Board agents (you, as CMO/CFO/COO + synthesizer)
**Core Loop**: Pre-meeting briefing → Live meeting capture → Post-meeting directives → Public announcement

---

## I. The Core Problem

**Manual process today**:
1. Spend 30 min gathering metrics into a Google Doc
2. Spend 90 min in a meeting, manually typing decisions
3. Spend 4+ hours writing blog posts + Twitter threads
4. Manually publish + track results

**What OpenDash automates**:
1. **Pre-meeting**: Auto-compile metrics from all sources (GitHub, Twitter, email, manual)
2. **During meeting**: Capture decisions → Auto-generate directives
3. **Post-meeting**: Auto-generate Twitter thread, blog outline, public metrics
4. **Next week**: Auto-populate next briefing with execution status

**Goal**: Board meeting goes from 5+ hours of work to 90 min focused meeting + 1 hour publish.

---

## II. UI Flow: The Board Meeting Interface

### **View 1: BRIEFING (Pre-Meeting, 5 min read)**

**Timestamp**: Monday 2:00 PM ET (automatic refresh every hour)

```
╔════════════════════════════════════════════════════════════════╗
║         ATLAS BOARD BRIEFING — March 31, 2026                 ║
║                    Next meeting in 0 min                       ║
╚════════════════════════════════════════════════════════════════╝

📊 STATUS SNAPSHOT (Last 7 days)
┌─────────────────────────────────────────────────────────────┐
│ 🟡 CMO: Marketing Traction                                   │
│   ├─ Twitter impressions: 500 (target: 1,000) ▼ 50%         │
│   ├─ Blog traffic: 200 views (target: 500) ▼ 40%            │
│   ├─ Signups: 10 attempts (target: 50) ▼ 20%               │
│   └─ Action: We're undershipping weekly content             │
│                                                              │
│ 🟢 CFO: Financial Health                                     │
│   ├─ Weekly spend: $2,000 (budget: $2-3K) ✓                │
│   ├─ Runway: 50 weeks (alert: <24 weeks) ✓                 │
│   ├─ Revenue: $0 (expected at stage)                        │
│   └─ Status: Healthy, sustainable pace                     │
│                                                              │
│ 🟡 COO: Operations & Shipping                               │
│   ├─ PRs shipped: 15 (target: 20) ▼ 75%                    │
│   ├─ P1 issues: 0 ✓                                         │
│   ├─ P1 blockers: 1 (Frontasy #41 - composition)           │
│   ├─ Blocker impact: Blocks composition features (2 weeks)  │
│   └─ Recommendation: Prioritize composition this sprint     │
│                                                              │
│ 🟡 BOARD: Synthesis                                          │
│   └─ Key insight: We have momentum but need velocity +      │
│      composition to show products. Blocker is critical.     │
└─────────────────────────────────────────────────────────────┘

⚠️  DECISIONS NEEDED TODAY (Next 60 min)
┌─────────────────────────────────────────────────────────────┐
│ 1. COMPOSITION PRIORITY?                                     │
│    Question: Do we allocate 50% time for 2 weeks?          │
│    Impact: Unblocks composition features                    │
│    Trade-off: Lower shipping velocity short-term            │
│                                                              │
│ 2. PUBLIC NARRATIVE?                                         │
│    Question: "Shipping in Public" or "Board Governs"?      │
│    Impact: What we announce to market                       │
│    Trade-off: Narrative scope                               │
│                                                              │
│ 3. WHEN TO ANNOUNCE?                                         │
│    Question: Announce Monday (immediately) or Friday        │
│    Impact: Momentum vs. showing results                     │
│    Trade-off: Time for CMO to execute                       │
└─────────────────────────────────────────────────────────────┘

📋 LAST WEEK'S DIRECTIVES (Status)
┌─────────────────────────────────────────────────────────────┐
│ [NEW] First Board meeting (no prior directives)             │
│ → This is the first cycle                                   │
└─────────────────────────────────────────────────────────────┘

🔗 QUICK LINKS
├─ [GitHub: Frontasy #41](https://github.com/...)
├─ [Twitter: Last week's thread](https://twitter.com/...)
├─ [Runway calculator](opendash.ai/calc/runway)
└─ [Previous Board meetings](opendash.ai/board/archive)

[START MEETING] [PRINT] [SHARE]
```

**Data Sources** (automatic):
- GitHub API: `git log --since="7 days ago"` → PR count
- Twitter API: Impressions from last 7 days
- Google Analytics: Blog views
- Email webhooks: Signup attempts (Clerk, form services)
- Manual input: Cash on hand, weekly budget
- Jira/GitHub: Blockers (search for `P1`)
- Previous Board meetings: Load last week's directives

**Refresh Rate**: Every hour (or on-demand)

**Actions Available**:
- `[START MEETING]` → Opens live meeting view
- `[PRINT]` → Print this briefing
- `[SHARE]` → Share briefing via email/Slack

---

### **View 2: LIVE MEETING (During Meeting, 90 min)**

**Timestamp**: Elapsed 0:00 / 90:00

```
╔════════════════════════════════════════════════════════════════╗
║      ATLAS BOARD MEETING #1 — LIVE CAPTURE                   ║
║              Elapsed: 20:45 / 90:00                           ║
║  [PAUSE] [SAVE DRAFT] [TIMER] [NOTES] [AI SUMMARY]          ║
╚════════════════════════════════════════════════════════════════╝

PHASE 1: STATUS SYNC (elapsed 20:45 / 20:00) ✓ DONE
├─────────────────────────────────────────────────────────────┤
│ CMO REPORTED:                                               │
│ ├─ Shipped 1 blog post + 2 Twitter threads                 │
│ ├─ Got 500 impressions (below 1K target)                   │
│ ├─ 10 signup attempts                                       │
│ └─ [Note: People interested but not engaging]              │
│                                                             │
│ [WHAT I HEARD] (AI summary):                               │
│ "Marketing got visibility but low engagement. Need weekly  │
│  shipping to maintain momentum."                           │
│                                                             │
│ CMO WANTS TO DECIDE: [Assign this to directive?]          │
├─────────────────────────────────────────────────────────────┤
│ CFO REPORTED:                                               │
│ ├─ Spent $2K (on budget)                                   │
│ ├─ 50 weeks runway (healthy)                               │
│ └─ No revenue expected yet                                 │
│                                                             │
│ [WHAT I HEARD] (AI summary):                               │
│ "Financial health is solid. We can sustain this pace for   │
│  3+ months. No hard constraints on resource allocation."   │
├─────────────────────────────────────────────────────────────┤
│ COO REPORTED:                                               │
│ ├─ Shipped 15 PRs                                          │
│ ├─ 0 P1 issues                                             │
│ ├─ 1 P1 blocker (Frontasy #41 - composition)              │
│ └─ Estimated 2 weeks to unblock                           │
│                                                             │
│ [WHAT I HEARD] (AI summary):                               │
│ "Operations are healthy but blocked on one critical thing. │
│  Composition would unblock dashboard customization."       │
└─────────────────────────────────────────────────────────────┘

PHASE 2: DECISIONS (elapsed 20:45 / 40:00) 🔄 IN PROGRESS
├─────────────────────────────────────────────────────────────┤
│ DECISION 1: COMPOSITION PRIORITY?                           │
│                                                             │
│ CMO says: "Need weekly shipping to maintain momentum"      │
│ CFO says: "We can afford 2 weeks of lower velocity"       │
│ COO says: "2 weeks focused work to unblock"               │
│                                                             │
│ DECISION BEING DRAFTED:                                     │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ ✓ Allocate 50% COO time for 2 weeks on composition   │ │
│ │ ✓ Goal: Unblock Frontasy #41 by April 10            │ │
│ │ ✓ Rationale: Foundational. Enables velocity.         │ │
│ │ ✓ Trade-off: Lower PR velocity this sprint           │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                             │
│ [BOARD CONFIRMS] [RECORD DECISION] [NEXT DECISION]        │
│                                                             │
│ DECISION 2: PUBLIC NARRATIVE?                              │
│ [START TYPING...]                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘

💬 NOTES (Auto-saved)
├─ 14:20 - CMO: "Visibility is there, engagement low"
├─ 16:45 - CFO: "Runway solid, can take risks"
├─ 18:30 - COO: "Composition work is 2 weeks, critical path"
└─ 20:15 - Board: "Composition is foundational"

⚡ AI SUGGESTIONS
├─ "COO should commit to deadline (April 10)"
├─ "CFO should decide: how much $ for composition?"
└─ "CMO should commit to weekly shipping"

[SAVE & CONTINUE] [END MEETING]
```

**Data Captured** (automatic):
- Timestamps for each phase
- Notes typed during meeting
- Decisions drafted + rationale
- AI suggestions based on discussion
- Elapsed time per phase

**Real-Time Actions**:
- Type notes naturally → AI parses key points
- Click `[RECORD DECISION]` → Captures decision + rationale
- AI auto-suggests next questions based on discussion
- See elapsed time → Keeps meeting on track

**Automation**:
- **AI Listening**: Parses natural language → extracts decisions
- **Smart Timer**: Warns if phase is running long
- **Auto-Summary**: Generates "what I heard" summary for each update
- **Suggestion Engine**: Suggests next questions based on discussion

---

### **View 3: DIRECTIVES (Post-Meeting, 5 min)**

**After meeting ends, auto-generated directive list:**

```
╔════════════════════════════════════════════════════════════════╗
║         BOARD MEETING #1 — DIRECTIVES ASSIGNED                ║
║                  March 31, 2026, 3:15 PM                      ║
║                    [GENERATE ANNOUNCEMENT]                    ║
╚════════════════════════════════════════════════════════════════╝

🎯 DECISIONS MADE TODAY
├─ [✓] Allocate 50% COO time on composition (April 1-10)
├─ [✓] Public narrative: "Shipping in Public" (Weeks 1-4)
└─ [✓] Announce: Friday, April 4

📋 DIRECTIVES ASSIGNED

DIRECTIVE 1: CMO
├─ Owner: CMO Agent
├─ Task: Publish 3 content pieces this week
│  ├─ Tuesday: Blog post on "First Board Meeting"
│  ├─ Wednesday: Twitter thread on composition work
│  └─ Thursday: Twitter thread on metrics transparency
├─ Deadline: Friday, April 4, 11:00 AM
├─ Success metric: 1K impressions (vs. 500 last week)
├─ Context: "CMO needs weekly shipping to maintain narrative momentum"
└─ [ASSIGN TO CMO] [VIEW CALENDAR]

DIRECTIVE 2: CFO
├─ Owner: CFO Agent
├─ Task: Publish public metrics dashboard
│  ├─ What to share: Runway, weekly spend, % of budget
│  ├─ Tool: Create page at opendash.ai/metrics
│  └─ Update frequency: Weekly Fridays
├─ Deadline: Friday, April 4, 10:00 AM
├─ Success metric: Dashboard is live and understandable
├─ Context: "Financial transparency builds trust. Lets market know we're sustainable."
└─ [ASSIGN TO CFO] [CREATE TASK]

DIRECTIVE 3: COO
├─ Owner: COO Agent
├─ Task: Unblock Frontasy composition (Frontasy #41)
│  ├─ Allocation: 50% of time
│  ├─ Start: April 1 (Monday)
│  ├─ Approach: 1 PR per day
│  └─ Goal: Merge Frontasy #41 by April 10
├─ Deadline: April 10
├─ Success metric: PR merged, composition hooks exported
├─ Context: "Composition is foundational. Unblocks all dashboard customization features."
└─ [ASSIGN TO COO] [LINK GITHUB ISSUE]

DIRECTIVE 4: Board
├─ Owner: You (Board Synthesizer)
├─ Task: Schedule Board Meeting #2 + Document Board Meeting #1
│  ├─ Schedule: Monday, April 7, 2:00 PM ET
│  ├─ Document: Save meeting notes to hq/ folder
│  └─ Link: Add to public Board meeting archive
├─ Deadline: Friday, April 4
├─ Success metric: Next meeting on calendar, this meeting archived
└─ [SCHEDULE] [ARCHIVE]

📊 SUMMARY FOR ANNOUNCEMENT
┌─────────────────────────────────────────────────────────────┐
│ Board Meeting #1: We Decided 3 Things                       │
│                                                             │
│ 1. Prioritize composition work (2 weeks)                   │
│    → Unblocks dashboard customization                       │
│                                                             │
│ 2. Public narrative is "Shipping in Public"                │
│    → Share real decisions, metrics, process                │
│                                                             │
│ 3. Announce Friday, April 4                                │
│    → Blog post + metrics dashboard + Twitter              │
│                                                             │
│ This week's directives: CMO (3 pieces), CFO (metrics),    │
│ COO (composition), Board (announce + schedule)             │
└─────────────────────────────────────────────────────────────┘

[GENERATE TWITTER THREAD] [GENERATE BLOG OUTLINE] [PUBLISH]
```

**Auto-generated**:
- Directive summary from decisions
- Owner assignments (auto-route to agents)
- Deadlines calculated from decisions
- Context + rationale for each directive
- Success metrics pre-filled
- Summary for Friday announcement

---

### **View 4: PUBLIC ANNOUNCEMENT (Friday, 1 click)**

**Auto-generated from meeting decisions + week's execution:**

```
╔════════════════════════════════════════════════════════════════╗
║     BOARD MEETING #1 ANNOUNCEMENT — READY TO PUBLISH         ║
║                    April 4, 2026, 12:00 PM                   ║
║              [EDIT] [PREVIEW] [POST TO TWITTER] [PUBLISH]   ║
╚════════════════════════════════════════════════════════════════╝

📋 WHAT EXECUTED THIS WEEK:
├─ ✓ CMO: 3 pieces published (1K impressions)
├─ ✓ CFO: Metrics dashboard live
├─ ✓ COO: Composition work started (3 PRs merged)
└─ ✓ Board: Meeting archived, next meeting scheduled

🧵 TWITTER THREAD (Auto-generated, ready to post)
┌─────────────────────────────────────────────────────────────┐
│ 🧵 Atlas Board Meeting #1: Composition, Momentum & Metrics  │
│                                                             │
│ Monday, the Board met. Here's what happened:              │
│                                                             │
│ STATUS:                                                     │
│ ├─ Shipped 500 impressions (target 1K)                    │
│ ├─ 10 signups, $2K spend (on budget), 50w runway         │
│ ├─ 15 PRs shipped, 1 blocker (composition)               │
│                                                             │
│ DECISION:                                                   │
│ ├─ Prioritize composition for 2 weeks                     │
│ ├─ Unblocks dashboard customization                       │
│ ├─ Public narrative: "Shipping in Public"                 │
│                                                             │
│ DIRECTIVES:                                                 │
│ ├─ CMO: 3 content pieces (Tue/Wed/Thu) ✓                 │
│ ├─ CFO: Public metrics dashboard ✓                        │
│ ├─ COO: Unblock composition (ongoing)                     │
│                                                             │
│ This is how we operate. Transparent. Weekly. Public.      │
│                                                             │
│ Metrics: opendash.ai/metrics                              │
│ Next meeting: April 7                                      │
└─────────────────────────────────────────────────────────────┘

📝 BLOG OUTLINE (Auto-generated)
┌─────────────────────────────────────────────────────────────┐
│ Title: "Our First Board Meeting: Running Atlas in Public"  │
│                                                             │
│ 1. What is the Board? (explain agents)                    │
│ 2. Why share Board meetings? (transparency thesis)        │
│ 3. How do we decide? (decision framework)                 │
│ 4. What did we decide this week? (3 decisions)            │
│ 5. What's the tradeoff? (composition vs. velocity)        │
│ 6. How to follow along (metrics + meeting schedule)       │
│ 7. Next Board meeting (April 7)                          │
│                                                             │
│ [AI-generated draft: 1200 words]                          │
└─────────────────────────────────────────────────────────────┘

📊 METRICS TO INCLUDE
├─ Runway: 50 weeks
├─ Weekly spend: $2,000
├─ Shipping velocity: 15 PRs
├─ Marketing traction: 500 impressions
├─ Signups: 10 (this week)
└─ Composition progress: 3 PRs merged, on track for April 10

🔗 LINKS TO EMBED
├─ [Metrics dashboard](opendash.ai/metrics)
├─ [GitHub: Frontasy #41](https://github.com/...)
├─ [Next Board meeting](opendash.ai/board/april-7)
└─ [Previous Board meetings](opendash.ai/board/archive)

[EDIT TWITTER] [EDIT BLOG] [PREVIEW] [POST & PUBLISH]
```

**Auto-generated**:
- Twitter thread (8 parts) from meeting decisions + execution
- Blog outline from decisions + context
- Metrics snapshot from CFO dashboard
- All links auto-populated
- Formatting ready to copy-paste

---

## III. Data Model: What OpenDash Stores

### **Core Tables**

```sql
-- Board meetings (one per week)
TABLE board_meetings {
  id: uuid
  meeting_number: int (1, 2, 3, ...)
  date: timestamp
  attendees: string[] (CMO, CFO, COO, Board)
  status: "scheduled" | "in-progress" | "completed"

  -- Metrics snapshot at meeting time
  snapshot: {
    metrics: {
      twitter_impressions: number
      signups: number
      prs_shipped: number
      weekly_spend: number
      runway_weeks: number
      blockers: [{ id, title, impact }]
    }
    decisions_needed: [{ question, options, context }]
  }

  -- Decisions made during meeting
  decisions: [{
    id: uuid
    question: string
    decision: string
    rationale: string
    trade_offs: string[]
    timestamp: datetime
  }]

  -- Directives assigned as result
  directives: [{ id, owner, task, deadline, success_metric, context }]

  -- Public narrative
  public: {
    twitter_thread: string
    blog_outline: string
    published_at: timestamp
    links: [{ title, url }]
  }

  created_at: timestamp
  updated_at: timestamp
}

-- Directives (tasks assigned from Board meetings)
TABLE directives {
  id: uuid
  meeting_id: uuid
  owner: string (CMO | CFO | COO | Board)
  task: string
  deadline: date
  success_metric: string
  context: string
  status: "assigned" | "in-progress" | "completed" | "blocked"

  -- Execution tracking
  execution: {
    started_at: timestamp
    completed_at: timestamp
    progress_percent: number
    blockers: [{ description, severity }]
    updates: [{ timestamp, message }]
  }

  created_at: timestamp
  updated_at: timestamp
}

-- Metrics (aggregated from all sources)
TABLE org_metrics {
  id: uuid
  metric_name: string (twitter_impressions, prs_shipped, runway_weeks, etc.)
  value: number | string
  timestamp: datetime
  source: string (github | twitter | email | manual)
  context: string (optional)

  created_at: timestamp
}

-- Data sources (connectors to external APIs)
TABLE data_sources {
  id: uuid
  type: string (github | twitter | email | stripe | ga4 | manual)
  config: json
  last_synced: datetime
  status: "active" | "failed" | "paused"

  created_at: timestamp
}
```

### **Data Sync Pattern**

```
GitHub API → PRs count
Twitter API → Impressions, engagement
Email webhooks → Signup attempts
Stripe API → Revenue (if any)
Google Analytics → Blog traffic
Manual input → Cash on hand, comments
     ↓
org_metrics table (auto-updated)
     ↓
Board briefing (auto-compiled)
     ↓
Next Board meeting
```

---

## IV. Features: MVP vs. Later

### **MVP: Required for First Board Meeting**

- [ ] **Briefing view**: Auto-compile metrics, show status snapshot
- [ ] **Live meeting editor**: Type notes, capture decisions
- [ ] **Decision recorder**: Turn discussion into structured decisions
- [ ] **Directive generator**: Auto-create task list from decisions
- [ ] **Announcement preview**: Show what will be published
- [ ] **Data connectors**: GitHub (PRs), Twitter (impressions), manual input

### **Phase 2: Automation & Intelligence**

- [ ] **AI parsing**: Natural language → decisions (GPT-4)
- [ ] **AI suggestions**: "Based on discussion, you should also decide..."
- [ ] **Auto Twitter thread**: Generate from meeting decisions + execution
- [ ] **Auto blog outline**: Generate from meeting context + narrative
- [ ] **Progress tracking**: Did we execute directives? Show % complete
- [ ] **Directive routing**: Auto-assign to agents (CMO/CFO/COO)

### **Phase 3: Intelligence & Forecasting**

- [ ] **Predictive analytics**: "If you continue at this pace, MRR in X weeks"
- [ ] **Pattern matching**: "Same blocker as 3 meetings ago"
- [ ] **Meeting archive**: Search past decisions, see outcomes
- [ ] **Agent autopilot**: Suggest directives based on metrics
- [ ] **Workflow automation**: "Director complete → trigger next phase"

---

## V. UI Interactions: How It Works

### **Pre-Meeting Flow (Monday 2 PM)**

```
User opens opendash.ai/board
↓
[See briefing auto-populated with metrics from:
  - GitHub (PRs via API)
  - Twitter (impressions via API)
  - Email (signups via webhook)
  - Manual (cash, comments)]
↓
"Ready to start meeting?" → [START MEETING]
↓
Opens live meeting editor
```

### **During Meeting Flow**

```
[Live meeting view]
Phase 1: Status (20 min)
  You type: "CMO shipped 2 pieces, got 500 impressions"
  → AI extracts: CMO report logged
  → AI suggests: "CMO needs weekly shipping?"

Phase 2: Decisions (40 min)
  You type: "We should prioritize composition"
  → AI extracts: "Decision: prioritize composition"
  → You confirm: [RECORD DECISION]
  → AI suggests: "What's the deadline?"
  → You respond: "April 10"
  → Decision saved with rationale

Phase 3: Directives (15 min)
  [AI auto-generates directive list from decisions]
  You review + edit + approve
  → Directives assigned to CMO/CFO/COO

Phase 4: Narrative (5 min)
  [AI auto-generates Twitter thread + blog outline]
  You click: [GENERATE ANNOUNCEMENT]
  → Saves draft for Friday
```

### **Post-Meeting Flow (Friday 12 PM)**

```
User opens opendash.ai/board/announcement
↓
[See auto-generated announcement:
  - Execution status (did we do what we said?)
  - Twitter thread (8-part, ready to post)
  - Blog outline (1200 words, ready to write)
  - Metrics snapshot (revenue, runway, velocity)
  - Next meeting link]
↓
Edit if needed → [POST TO TWITTER]
↓
Auto-publish to Twitter, email list, blog
↓
Next meeting auto-created (April 7)
↓
Next briefing auto-populated with execution data
```

---

## VI. Sample Data Flow

### **Monday 2 PM: Briefing Auto-Compiled**

```
GitHub API: git log --since="7 days ago" → 15 PRs
Twitter API: last 7 days → 500 impressions
Email webhook: signup forms → 10 attempts
Manual: you enter → $50K cash, $2K/week spend
↓
org_metrics table updated:
  - prs_shipped: 15
  - twitter_impressions: 500
  - signups: 10
  - weekly_spend: 2000
  - runway_weeks: 25 (50K / 2K)
↓
board_meetings[#1].snapshot = { metrics above }
↓
Briefing view renders with status snapshot
```

### **Monday 3 PM: Decision Captured**

```
User types: "We prioritize composition. Takes 2 weeks. Unblocks customization."
↓
AI extracts:
  - Decision: "Prioritize composition"
  - Rationale: "Unblocks customization"
  - Timeline: "2 weeks"
↓
board_meetings[#1].decisions[] = {
  question: "Composition priority?",
  decision: "Allocate 50% time for 2 weeks",
  rationale: "Foundational, enables velocity",
  timestamp: "2026-03-31T15:30:00Z"
}
↓
User clicks [RECORD DECISION] → confirmed
```

### **Monday 3:15 PM: Directives Auto-Generated**

```
Decisions made:
  1. Prioritize composition
  2. Narrative: "Shipping in Public"
  3. Announce Friday
↓
AI generates directives:
  - CMO: 3 content pieces by Fri 11 AM
  - CFO: Metrics dashboard by Fri 10 AM
  - COO: Composition work, deadline April 10
  - Board: Schedule meeting #2, archive meeting #1
↓
directives[] table populated
↓
Directive view shows checklist with owners
```

### **Friday 12 PM: Announcement Auto-Generated**

```
Fetch from database:
  - board_meetings[#1].decisions[] → what was decided
  - directives[] → what was assigned + execution status
  - org_metrics (latest) → current metrics
↓
AI generates:
  - Twitter thread (8 parts)
  - Blog outline (1200 words)
  - Metrics snapshot (chart + numbers)
  - Links (metrics dashboard, next meeting)
↓
public_announcement = {
  twitter_thread: "🧵 Atlas Board #1...",
  blog_outline: "Title: First Board Meeting...",
  metrics_snapshot: { runway: 50, spend: 2K, ... },
  published_at: "2026-04-04T12:00:00Z"
}
↓
User sees preview → [POST TO TWITTER]
↓
Auto-posts to Twitter + blog + email
```

---

## VII. What OpenDash Must Do Automatically

### **Data Collection** (Real-time)
- Pull GitHub PRs daily
- Pull Twitter impressions daily
- Sync signup forms daily
- Calculate runway (cash ÷ weekly spend)

### **Pre-Meeting Prep** (Monday morning, auto)
- Compile metrics from all sources
- Format into briefing view
- Suggest decisions that need making
- Show last week's directives + execution status

### **During Meeting** (Manual, but AI-assisted)
- Record notes as user types
- Extract decisions from natural language
- Suggest next questions
- Validate decision completeness

### **Directive Generation** (Post-meeting, auto)
- Convert decisions → structured directives
- Assign owners (CMO/CFO/COO/Board)
- Calculate deadlines
- Generate success metrics

### **Announcement Generation** (Friday, auto)
- Generate Twitter thread from decisions + execution
- Generate blog outline from context
- Compile metrics snapshot
- Create share-ready preview

### **Tracking & Feedback** (Continuous)
- Track directive execution (% complete)
- Alert if directive is falling behind
- Measure success metrics vs. targets
- Populate next briefing with prior week's results

---

## VIII. The MVP: Minimum to Ship Week 1

### **Core Features**:
1. **Briefing view** (read-only, data from APIs)
2. **Meeting editor** (live notes, simple decision capture)
3. **Directive list** (manually created from decisions)
4. **Announcement preview** (manually written, not AI-generated)

### **Data Sources**:
1. GitHub (PRs via API)
2. Twitter (impressions via API, manual entry)
3. Manual input (cash, comments, signups)

### **Not in MVP**:
- AI parsing of notes
- AI announcement generation
- Progress tracking
- Forecasting
- Agent autopilot

### **Can Be Built After First Meeting**:
- AI features (generation, parsing)
- Automation (alerts, routing)
- Intelligence (patterns, predictions)

---

## IX. Getting from "MVP Manual" to "Full Automation"

### **Week 1**: Collect data, capture decisions manually
```
GitHub → PRs (API)
Twitter → impressions (API)
Manual → everything else (you type)
↓
Briefing view (hand-curated, clean)
Meeting notes (you type, save)
Directives (you create from decisions)
Announcement (you write)
```

### **Week 2-3**: Add decision capture automation
```
You type notes naturally
↓
AI extracts: "We prioritize X"
↓
[RECORD DECISION] (confirm extraction)
↓
Directive auto-created
```

### **Week 4+**: Add announcement automation
```
Decisions + execution data
↓
AI generates Twitter thread
AI generates blog outline
↓
You edit + publish
↓
Auto-tweet, auto-post
```

---

## X. Success Criteria

### **MVP (Week 1)**:
- [ ] Briefing auto-compiled from data sources
- [ ] Meeting captured (decisions + notes)
- [ ] Directives listed + assigned
- [ ] Announcement preview ready to edit + publish

### **Phase 2 (Week 2-3)**:
- [ ] AI extracts decisions from natural notes
- [ ] Directives auto-generated from decisions
- [ ] Success metrics auto-calculated

### **Phase 3 (Week 4+)**:
- [ ] Twitter thread auto-generated
- [ ] Blog outline auto-generated
- [ ] Announcement auto-published
- [ ] Next briefing auto-populated with execution data

---

**This is the product. Board meetings run in OpenDash, powered by automated data collection and intelligent assistance.**

