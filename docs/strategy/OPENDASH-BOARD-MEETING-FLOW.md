# OpenDash Board Meeting Flow: Complete Visual

---

## The Weekly Loop

```
WEEK N (Monday)
│
├─ [PRE-MEETING: 5 min]
│  └─ OpenDash auto-compiles briefing from:
│     ├─ GitHub (PRs via API)
│     ├─ Twitter (impressions via API)
│     ├─ Email (signups via webhook)
│     ├─ Manual (cash, comments)
│     └─ Shows: Status snapshot + decisions needed
│
├─ [LIVE MEETING: 90 min]
│  ├─ Phase 1: Status (20 min)
│  │  └─ You report: CMO/CFO/COO perspective
│  │     → OpenDash records notes + extracts insights
│  │
│  ├─ Phase 2: Decisions (40 min)
│  │  └─ You decide: Composition? Narrative? Timing?
│  │     → OpenDash records decision + rationale + trade-offs
│  │
│  ├─ Phase 3: Directives (15 min)
│  │  └─ You assign: Tasks to CMO/CFO/COO/Board
│  │     → OpenDash auto-generates directive list
│  │
│  └─ Phase 4: Narrative (5 min)
│     └─ You sketch: How to announce this?
│        → OpenDash saves draft
│
├─ [TUESDAY-THURSDAY: Execution]
│  ├─ CMO executes directives
│  │  └─ OpenDash tracks: progress, blockers, % complete
│  │
│  ├─ CFO executes directives
│  │  └─ OpenDash tracks: dashboard live? metrics published?
│  │
│  └─ COO executes directives
│     └─ OpenDash tracks: PRs merged? deadline on track?
│
├─ [FRIDAY: 1 hour]
│  ├─ OpenDash auto-generates announcement:
│  │  ├─ Execution status (what we said vs. what we did)
│  │  ├─ Twitter thread (8 parts, ready to post)
│  │  ├─ Blog outline (1200 words, ready to write)
│  │  └─ Metrics snapshot (runway, spend, velocity)
│  │
│  └─ You click: [POST TO TWITTER] + [PUBLISH BLOG]
│     → Auto-published to all channels
│
└─ [NEXT MONDAY: Repeat]
   └─ OpenDash auto-populated briefing with:
      ├─ Last week's execution status
      ├─ New metrics (this week's shipping)
      ├─ Blockers that emerged
      └─ Decisions needed this week
```

---

## Data Flow: How OpenDash Feeds Itself

```
EXTERNAL SOURCES
│
├─ GitHub API (daily)
│  └─ Query: git log --since="7 days ago"
│     → Metric: PRs shipped per week
│
├─ Twitter API (daily)
│  └─ Query: impressions, engagement last 7 days
│     → Metric: Twitter impressions, followers
│
├─ Email webhooks (real-time)
│  └─ From: Clerk, form services, Stripe
│     → Metric: Signups, revenue events
│
├─ Google Analytics (daily)
│  └─ Query: page views, bounce rate
│     → Metric: Blog traffic
│
├─ Manual input (on-demand)
│  └─ You enter: Cash balance, comments, blockers
│     → Metric: Any data APIs can't provide
│
└─ GitHub Issues (daily)
   └─ Query: Issues labeled P1
      → Metric: Blockers, severity

        ↓
        ↓
        ↓
  [org_metrics table]
  ├─ prs_shipped: 15
  ├─ twitter_impressions: 500
  ├─ signups: 10
  ├─ weekly_spend: $2,000
  ├─ runway_weeks: 25
  ├─ p1_blockers: [Frontasy #41]
  └─ [updated: every hour]

        ↓
        ↓
        ↓
  [board_briefing view]
  ├─ Status snapshot (metrics)
  ├─ Decisions needed (questions)
  ├─ Last week's directives (status)
  └─ [auto-compiled, ready Monday 2 PM]

        ↓
        ↓
        ↓
  [BOARD MEETING]
  └─ [You conduct 90-min meeting]

        ↓
        ↓
        ↓
  [board_meetings table]
  ├─ decisions[] (what was decided)
  ├─ directives[] (what was assigned)
  └─ narrative (what to announce)

        ↓
        ↓
        ↓
  [directives table]
  ├─ owner: CMO | CFO | COO | Board
  ├─ task: [assigned job]
  ├─ deadline: [date]
  └─ status: assigned → in-progress → completed

        ↓
        ↓
        ↓
  [Execution tracking (Tue-Fri)]
  └─ Progress: % complete, blockers, updates

        ↓
        ↓
        ↓
  [announcement view]
  ├─ Twitter thread (auto-generated from decisions + execution)
  ├─ Blog outline (auto-generated from context)
  ├─ Metrics snapshot (compiled from org_metrics)
  └─ [ready to publish Friday]

        ↓
        ↓
        ↓
  [PUBLISH]
  └─ Twitter + Blog + Email + GitHub Wiki

        ↓
        ↓
        ↓
  [NEXT BRIEFING]
  └─ Execution data from directives[] feeds next week's briefing
     ├─ "Last week: CMO published 3 pieces ✓"
     ├─ "Last week: CFO published metrics ✓"
     ├─ "Last week: COO completed 40% of composition"
     └─ "This week: Continue composition work"
```

---

## The Three Core Tables

### **Table 1: board_meetings**

```
board_meetings[1] = {
  id: "meeting-001"
  meeting_number: 1
  date: "2026-03-31"
  status: "completed"

  snapshot: {
    metrics: {
      prs_shipped: 15,
      twitter_impressions: 500,
      signups: 10,
      weekly_spend: 2000,
      runway_weeks: 25,
      blockers: [
        { id: "frontasy-41", title: "Composition hooks", impact: "blocks features" }
      ]
    },
    decisions_needed: [
      { question: "Composition priority?", context: "blocks velocity" },
      { question: "Public narrative?", context: "shipping in public or board governs?" },
      { question: "When to announce?", context: "momentum vs. results" }
    ]
  },

  decisions: [
    {
      question: "Composition priority?",
      decision: "Allocate 50% COO time for 2 weeks",
      rationale: "Foundational. Enables velocity.",
      trade_offs: ["Lower PR velocity this sprint", "Tight timeline for composition"],
      timestamp: "2026-03-31T14:30:00Z"
    },
    {
      question: "Public narrative?",
      decision: "Shipping in Public (Weeks 1-4)",
      rationale: "Authentic, founder appeal",
      trade_offs: ["Requires honesty about failures", "Limited depth initially"],
      timestamp: "2026-03-31T14:50:00Z"
    },
    {
      question: "When to announce?",
      decision: "Friday, April 4",
      rationale: "Show results + decisions together",
      trade_offs: ["Late in week", "CMO has 4 days to execute"],
      timestamp: "2026-03-31T15:00:00Z"
    }
  ],

  directives: [
    "directive-001", "directive-002", "directive-003", "directive-004"
  ],

  public: {
    twitter_thread: "🧵 Atlas Board Meeting #1...",
    blog_outline: "Title: Our First Board Meeting...",
    metrics_snapshot: { runway: 50, spend: 2000, velocity: 15 },
    published_at: "2026-04-04T12:00:00Z"
  }
}
```

### **Table 2: directives**

```
directives[001] = {
  id: "directive-001"
  meeting_id: "meeting-001"
  owner: "CMO"
  task: "Publish 3 content pieces (Tue/Wed/Thu)"
  deadline: "2026-04-04T11:00:00Z"
  success_metric: "1K impressions (vs. 500 last week)"
  context: "CMO needs weekly shipping to maintain narrative momentum"
  status: "in-progress"

  execution: {
    started_at: "2026-04-01",
    progress_percent: 66,  // 2 of 3 published
    updates: [
      { timestamp: "2026-04-01T16:00:00Z", message: "Tue blog post published" },
      { timestamp: "2026-04-02T09:00:00Z", message: "Wed Twitter thread published" },
      { timestamp: "2026-04-03", message: "Thu thread in draft" }
    ],
    blockers: []
  }
}

directives[002] = {
  id: "directive-002"
  meeting_id: "meeting-001"
  owner: "CFO"
  task: "Publish public metrics dashboard (opendash.ai/metrics)"
  deadline: "2026-04-04T10:00:00Z"
  success_metric: "Dashboard live, metrics understandable"
  context: "Financial transparency builds trust"
  status: "completed"

  execution: {
    started_at: "2026-04-01",
    completed_at: "2026-04-03T17:00:00Z",
    progress_percent: 100,
    updates: [
      { timestamp: "2026-04-03T17:00:00Z", message: "Dashboard live" }
    ],
    blockers: []
  }
}

directives[003] = {
  id: "directive-003"
  meeting_id: "meeting-001"
  owner: "COO"
  task: "Unblock Frontasy composition (Frontasy #41, 1 PR/day)"
  deadline: "2026-04-10",
  success_metric: "PR merged, composition hooks exported"
  context: "Composition is foundational. Unblocks all dashboard customization."
  status: "in-progress"

  execution: {
    started_at: "2026-04-01",
    progress_percent: 40,
    updates: [
      { timestamp: "2026-04-01T18:00:00Z", message: "Started work" },
      { timestamp: "2026-04-02T16:00:00Z", message: "PR #1 merged" },
      { timestamp: "2026-04-03T17:00:00Z", message: "PR #2 merged" }
    ],
    blockers: []
  }
}

directives[004] = {
  id: "directive-004"
  meeting_id: "meeting-001"
  owner: "Board"
  task: "Schedule Board Meeting #2 + Archive Board Meeting #1"
  deadline: "2026-04-04",
  success_metric: "Meeting on calendar, notes archived + public"
  context: "Maintain weekly cadence, ensure institutional memory"
  status: "in-progress"

  execution: {
    started_at: "2026-03-31",
    progress_percent: 50,
    updates: [
      { timestamp: "2026-04-01T09:00:00Z", message: "Meeting #2 scheduled April 7" }
    ],
    blockers: ["Need to write up meeting notes"]
  }
}
```

### **Table 3: org_metrics**

```
org_metrics = [
  { metric: "prs_shipped", value: 15, timestamp: "2026-03-31T14:00Z", source: "github" },
  { metric: "twitter_impressions", value: 500, timestamp: "2026-03-31T14:00Z", source: "twitter" },
  { metric: "signups", value: 10, timestamp: "2026-03-31T14:00Z", source: "email" },
  { metric: "weekly_spend", value: 2000, timestamp: "2026-03-31T14:00Z", source: "manual" },
  { metric: "cash_balance", value: 50000, timestamp: "2026-03-31T14:00Z", source: "manual" },
  { metric: "runway_weeks", value: 25, timestamp: "2026-03-31T14:00Z", source: "calculated" },
  { metric: "p1_blockers", value: 1, timestamp: "2026-03-31T14:00Z", source: "github" },
  { metric: "blog_traffic", value: 200, timestamp: "2026-03-31T14:00Z", source: "analytics" },
]
```

---

## The MVP: What You Need to Ship Week 1

### **Step 1: Collect Data (Automated)**
```
✓ GitHub API → PRs count
✓ Twitter API → impressions
✓ Manual input → cash, signups, comments
→ Populate org_metrics table
```

### **Step 2: Display Briefing (Automated)**
```
✓ Query org_metrics for last 7 days
✓ Format into briefing view (status snapshot + decisions needed)
✓ Show last week's directives + execution status
→ User sees pre-meeting briefing
```

### **Step 3: Capture Meeting (Manual)**
```
✓ Live notes editor (you type)
✓ Decision recorder (you fill in structured decision form)
✓ Directive list generator (you create from decisions)
→ board_meetings[#1] table populated
```

### **Step 4: Create Announcement (Manual)**
```
✓ Twitter thread template (pre-filled with decisions + execution)
✓ Blog outline template (pre-filled with context)
✓ Metrics snapshot (auto-pulled from org_metrics)
→ User edits + publishes Friday
```

**No AI required. All templates + structure pre-built.**

---

## The Evolution: MVP → Full System

### **Week 1: Manual MVP**
```
Data collection: Automated (APIs)
Briefing compilation: Automated (queries)
Meeting capture: Manual (you type)
Announcement: Manual (you write from templates)
↓
Human effort: ~30 min Monday + 4 hrs Fri (after execution)
```

### **Week 2-3: Add Decision Automation**
```
You type: "We should prioritize composition"
↓
AI extracts: "Decision: prioritize composition"
↓
You confirm: [RECORD DECISION]
↓
Directives auto-generated from decision
↓
Human effort: Same, but less friction
```

### **Week 4+: Full Automation**
```
Decisions made → Directives auto-created
Directives executed → Announcement auto-generated
Announcement published → Next briefing auto-populated
↓
Human effort: 90 min Monday, 30 min Friday
(Rest is automated)
```

---

## One-Click Workflows

### **Monday 2 PM: One Click**
```
[OPEN BOARD MEETING]
↓
Briefing auto-loaded
Meeting template auto-opened
Timer auto-started
↓
You conduct 90 min meeting
You fill in decisions + directives
↓
[SAVE MEETING]
→ directives[] table populated
→ All agents notified
```

### **Friday 12 PM: One Click**
```
[GENERATE ANNOUNCEMENT]
↓
Query board_meetings[#1]
Query directives[] (execution status)
Query org_metrics (current metrics)
↓
Generate:
  - Twitter thread (8 parts)
  - Blog outline (1200 words)
  - Metrics snapshot
  - Links
↓
[PREVIEW] [EDIT] [POST]
↓
Auto-published to all channels
```

---

## Success: By End of Week 1

```
✓ Briefing auto-compiled Monday 2 PM
  ├─ GitHub PRs: 15
  ├─ Twitter: 500 impressions
  ├─ Signups: 10
  ├─ Runway: 25 weeks
  └─ Blockers: Composition

✓ Meeting conducted 90 min
  ├─ Decisions: 3 (composition, narrative, timing)
  ├─ Directives: 4 (CMO, CFO, COO, Board)
  └─ Narrative: "Shipping in Public"

✓ Execution tracked Tue-Fri
  ├─ CMO: 2/3 pieces published
  ├─ CFO: Metrics dashboard live
  ├─ COO: Composition work started (2 PRs)
  └─ Board: Meeting #2 scheduled

✓ Announcement published Friday
  ├─ Twitter thread: 1K impressions (vs. 500)
  ├─ Blog post: published
  ├─ Metrics: public at opendash.ai/metrics
  └─ Next meeting: April 7 scheduled

✓ Next week's briefing auto-populated
  ├─ Last week's directives status
  ├─ New metrics
  ├─ Blockers that emerged
  └─ Ready for next Board meeting Monday
```

---

## The Product: Board Governance Operating System

OpenDash becomes the operational nerve center:

```
Monday: What happened? What do we decide?
  ↓ (data collection + briefing)
Friday: Did we execute? What's next?
  ↓ (announcement + next briefing)
Next Monday: Repeat
  ↓
Org is transparent, decisions are visible, execution is measured
```

**That's the product.**

