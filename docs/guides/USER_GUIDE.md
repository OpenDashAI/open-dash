# OpenDash User Guide

**Version**: 1.0
**Last Updated**: 2026-03-24
**For**: Solo founders managing multiple projects

---

## Quick Start

1. **Login** → Visit https://open-dash.your-domain.com
2. **Morning Briefing** → See all changes from last night
3. **Deep Dive** → Click any item to investigate
4. **Chat** → Ask AI for insights or actions
5. **Decide** → Quick decisions without context switching

---

## Table of Contents

1. [The Three Views](#the-three-views)
2. [Morning Briefing Tour](#morning-briefing-tour)
3. [Project Focus Mode](#project-focus-mode)
4. [Portfolio Overview](#portfolio-overview)
5. [AI Chat Interaction](#ai-chat-interaction)
6. [Managing Datasources](#managing-datasources)
7. [Interpreting Analytics](#interpreting-analytics)
8. [FAQ](#faq)

---

## The Three Views

OpenDash has three complementary views tailored to different tasks:

### View 1: Morning Briefing (Default)

**Purpose**: What changed while you were away?

**Shows**:
- ✓ Revenue metrics (Stripe last 24h)
- ✓ Deployment status (GitHub Actions, Vercel)
- ✓ New issues and PRs
- ✓ System health (Tailscale machines online)
- ✓ AI-generated summary ("Revenue +$2.5K, 1 deployment pending, GitHub trending up")

**Best for**: Daily 5-minute standup

**How to access**: Click "Morning Briefing" in header or refresh landing page

### View 2: Project Focus

**Purpose**: Deep dive into one brand/project

**Shows**:
- ✓ All metrics for selected brand
- ✓ Trending analysis with graphs
- ✓ Anomaly detection (unusual spikes)
- ✓ Alert history and current status
- ✓ Raw datasource data (revenue, issues, deployments)

**Best for**: Troubleshooting specific project

**How to access**: Click brand name in left panel → "Focus Mode"

### View 3: Portfolio Overview

**Purpose**: At-a-glance health of all projects

**Shows**:
- ✓ Health score per brand (0-100)
- ✓ Revenue, deploy, and issue counts per project
- ✓ Quick status indicators (green=healthy, yellow=degraded, red=critical)
- ✓ Drill-down cards for detailed investigation

**Best for**: Weekly portfolio review

**How to access**: Click "Portfolio" in header

---

## Morning Briefing Tour

### The Layout

```
┌─────────────────────────────────────────────────────┐
│  OpenDash    [Morning Briefing | Project | Portfolio] │
├───────────────┬─────────────────────────────────────┤
│ CONTEXTS      │ BRIEFING ITEMS                      │
├───────────────┼─────────────────────────────────────┤
│ • Stripe      │ [High] Deploy failed on prod        │
│ • GitHub      │ [Normal] Revenue +$2.5K (+15%)      │
│ • Tailscale   │ [Urgent] API response time 8s       │
│ • ...         │ [Normal] 2 new GitHub issues        │
│               │                                     │
│               ├─────────────────────────────────────┤
│               │ AI CHAT (Right Panel)               │
│               │                                     │
│               │ You: Why is API slow?               │
│               │ AI: Database query taking 5s...     │
│               │     Suggest: Add index on orders_id │
│               │                                     │
│               │ [Approve] [More info] [Dismiss]    │
└───────────────┴─────────────────────────────────────┘
```

### Understanding Briefing Items

Each item shows:

**Example**: `[High] Deploy failed on prod`

| Part | Meaning | What to do |
|------|---------|-----------|
| `[High]` | Priority level | Read first if orange/red |
| `Deploy failed on prod` | What happened | Click to see deployment logs |
| Timestamp | When it occurred | Use to correlate with other events |
| Action button | Quick action | "View logs", "Retry", "Dismiss" |

### Item Categories

| Category | Examples | Typical Response |
|----------|----------|------------------|
| 🔴 Urgent | Deploy failed, API down, critical error | Immediate action (5 min) |
| 🟠 High | Revenue spike, performance degradation | Investigate within 1 hour |
| 🟡 Normal | New PR, issue closed, metrics trending up | Review during next check |
| 🟢 Low | Minor metric changes, info updates | Skim during briefing |

### Actions You Can Take

**From Briefing Item**:
1. **View Details** → Click title to see full context
2. **View Logs** → Click "View logs" button to jump to source
3. **Dismiss** → Archive item (reappears if severity increases)
4. **Escalate** → "Alert team" if needs immediate attention
5. **Chat** → Ask AI follow-up questions

### Smart Filtering

**Filters** in top-right:
- Show: "All" | "Unread" | "Urgent only"
- Time range: "Last 24h" | "Last 7d" | "Last 30d"
- By datasource: "Stripe" | "GitHub" | "Tailscale" | "All"

**Example workflow**:
```
1. Open OpenDash at 8 AM
2. Filter: "Urgent only" → see critical items
3. Resolve issues
4. Filter: "Last 24h" → review all activity
5. Clear filter for full briefing
```

---

## Project Focus Mode

### Accessing Focus Mode

**From Morning Briefing**:
1. Click any brand name in left sidebar ("Stripe", "GitHub", etc.)
2. View switches to Focus Mode for that brand

**From Portfolio View**:
1. Click brand card
2. Automatically opens Focus Mode

### Focus Mode Panels

**Left Panel** (Context):
- Selected brand name
- Real-time health status
- List of related items
- Quick-access links

**Center Panel** (Details):
- Trending analysis with sparklines
- Current metric values
- Anomaly badges
- Alert history (last 10 alerts)

**Right Panel** (Chat):
- Brand-specific AI assistant
- Has full context of selected brand
- Can access raw data for analysis
- Can suggest actions

### Analyzing Trends

**Trending Card shows**:

```
📊 Stripe Trending
↑ Degrading
  Current:  $4,200
  7h avg:   $3,800
  24h avg:  $3,500
  Pattern:  75% (normal)
```

**What it means**:
- ↑ = trend is going UP (bad for latency, good for revenue)
- Current vs. averages show if deviation is significant
- Pattern % indicates consistency (>70% = stable)

**Actions**:
- If ↑ and high (revenue): celebrate! 🎉
- If ↑ and bad (latency): investigate immediately
- If pattern low (<50%): high variance, may be noisy

### Anomaly Badges

**"3 anomalies - Max severity: high"**

Clicking reveals:
1. Which metrics are anomalous
2. Severity level (low/med/high/critical)
3. Z-score (how far from normal)
4. Suggested investigation steps

**Example**:
```
🚨 Anomaly: Revenue spike (Z=3.2)
   Unusual: +350% from baseline
   Cause: Likely campaign or viral
   Action: Review marketing dashboard
```

### Alert History

**Shows recent alerts** with:
- Timestamp (when alert triggered)
- Severity (color-coded)
- Message (what was unusual)
- Value (metric value at time)
- Status (acknowledged/resolved)

**Actions on alerts**:
- Click to jump to full logs
- Acknowledge if investigating
- Resolve when issue fixed
- View full alert context

---

## Portfolio Overview

### Health Scores

Each brand gets a **Health Score (0-100)**:

| Score | Status | Meaning |
|-------|--------|---------|
| 90-100 | 🟢 Healthy | All systems normal |
| 70-89 | 🟡 Degraded | Minor issues, watch |
| 50-69 | 🟠 Warning | Issues need attention |
| <50 | 🔴 Critical | Immediate action required |

**Score calculation**:
- Uptime % (40% weight): Are services online?
- Error rate (30% weight): How many failures?
- Performance (20% weight): How fast?
- Alerts (10% weight): Are there open issues?

### Portfolio Card Example

```
┌─────────────────────────────────┐
│ STRIPE                          │
├─────────────────────────────────┤
│ Health: 95 🟢                   │
│                                 │
│ Revenue (24h):   $12,500        │
│ Deployments:     2 passed       │
│ Issues:          0 open         │
│ Response time:   180ms          │
│                                 │
│ [View Details] [Focus Mode]    │
└─────────────────────────────────┘
```

### Quick Metrics at a Glance

**For each brand**:
- 💰 Revenue (24-hour total)
- 🚀 Deployments (how many succeeded)
- 🐛 Issues (open/closed)
- ⏱️ Performance (response time)
- 🟢 Status (all systems operational)

### Actions on Portfolio View

1. **Click brand card** → Focus on that project
2. **Click metric** → See detail breakdown
3. **Sort by health** → Find problematic projects
4. **Filter by status** → Show only critical/degraded

---

## AI Chat Interaction

### Starting a Conversation

**In any view**, right panel shows AI chat:

```
You: Why did revenue drop 20% yesterday?

AI: Revenue dropped from $3,200 to $2,560.
    Analyzing...

    Likely causes:
    1. Campaign ended (if running ad spend)
    2. Day-of-week pattern (Mondays lower)
    3. Geographic factor (holiday in major market)

    Next steps:
    - Check marketing dashboard for campaign status
    - Compare to historical Mondays
    - Check if holiday in US/EU

    [Approve Investigation] [Get Code] [Dismiss]
```

### Chat Capabilities

The AI can:

1. **Explain metrics** → "What does this anomaly mean?"
2. **Suggest actions** → "How do I fix slow API?"
3. **Provide code** → "Add an index on orders"
4. **Summarize** → "Give me a 1-min summary of status"
5. **Escalate** → "Alert the team about this"

### Chat Context

AI knows:
- ✓ Selected brand (if in Focus Mode)
- ✓ Last 7 days of metrics
- ✓ Current alerts and anomalies
- ✓ Historical trends
- ✓ Configured datasources

You can:
- Ask follow-up questions
- Request code snippets
- Ask for explanations
- Request immediate actions

### Using Chat Results

**AI responses include action buttons**:

- `[Approve]` → Confirm suggestion and take action
- `[Get Code]` → Request code implementation
- `[Dismiss]` → Archive result
- `[More info]` → Deep dive on topic
- `[Alert Team]` → Send to Slack/email

---

## Managing Datasources

### Adding a New Datasource

**From Settings** (gear icon, top-right):

1. Click "Datasources"
2. Click "Add datasource"
3. Select type (Stripe, GitHub, Tailscale, etc.)
4. Enter credentials/API key
5. Select brand(s) to associate
6. Click "Test connection"
7. Save

### Datasource Status

For each datasource:

**Status indicators**:
- 🟢 Connected: Data flowing normally
- 🟡 Degraded: Connection slow, some data missed
- 🔴 Offline: No data in 1+ hour
- ⚪ No data: Connected but no metrics yet

**Troubleshooting**:
- Click datasource → "Diagnostics"
- View last successful fetch (timestamp)
- See error logs if connection failed
- Retry or reconfigure API key

### Common Datasource Issues

| Problem | Solution |
|---------|----------|
| "Connection refused" | Check API key is valid + not rotated |
| "Authorization failed" | Verify API key has correct permissions |
| "Rate limit exceeded" | Datasource is calling API too frequently, reduce fetch interval |
| "No data for 1+ hour" | Check external service status (Stripe API, GitHub status) |

---

## Interpreting Analytics

### The Analytics Dashboard

**Shows for selected brand**:

```
┌─────────────────────────────┐
│ STRIPE ANALYTICS            │
├─────────────────────────────┤
│                             │
│ TRENDING                    │
│ ↑ Degrading                 │
│ Current: $4.2K              │
│ 24h avg: $3.5K              │
│                             │
├─────────────────────────────┤
│ ISSUES                      │
│                             │
│ 3 anomalies - max: HIGH     │
│ [Stripe revenue spike]      │
│ [More info] [Investigate]   │
│                             │
├─────────────────────────────┤
│ ALERTS                      │
│ [High] Revenue spike +42%   │
│ [Med] Pattern unusual       │
│                             │
└─────────────────────────────┘
```

### Metric Explanations

**Trending (↑↓→)**:
- ↑ = metric increasing (bad for latency, good for revenue)
- ↓ = metric decreasing (good for latency, bad for revenue)
- → = metric stable (no significant change)

**Anomaly Score**:
- Shows if current value is unusual
- Z-score of 2+ means significant anomaly
- Severity: low/med/high/critical

**Alert Status**:
- Shows active alerts for this brand
- Click to see alert rule details
- Acknowledge if investigating

### Example Interpretations

#### Example 1: Revenue Dashboard
```
↑ Degrading
Current: $5,200
24h avg: $3,500

Interpretation: Revenue is UP (+48%)
Action: Celebrate! But verify it's sustained
Next: Check if campaign/viral, or anomaly
```

#### Example 2: API Response Time
```
↑ Degrading
Current: 850ms
24h avg: 120ms

Interpretation: API response time UP (7x worse)
Action: Critical - investigate immediately
Causes: Database query slow, increased load, memory issue
Next: Check database logs, enable slow query logging
```

#### Example 3: GitHub PR Velocity
```
↓ Improving
Current: 12 PRs/day
24h avg: 8 PRs/day

Interpretation: Team is shipping faster
Action: Good sign! But watch for quality
Next: Check PR sizes (still small?), review cycle time
```

---

## FAQ

### Q: What's the difference between "Trending" and "Anomaly"?

**Trending** = sustained change over time
- Example: Response time gradually increasing over 7 days
- Alert: "API Degrading" (trend is negative)

**Anomaly** = sudden spike/drop
- Example: Revenue suddenly +300% (unusual value)
- Alert: "Unusual Revenue" (outside expected range)

**When to act**:
- Trending = investigate cause (needs long-term fix)
- Anomaly = verify not false positive (quick check)

---

### Q: How often is data updated?

**Refresh intervals**:
- Briefing items: Every 1 hour
- Analytics dashboard: Every 60 seconds
- Chat context: Real-time (pulls latest data)
- Portfolio health: Every 5 minutes

**Manual refresh**: Click 🔄 icon in top-right

---

### Q: Can I customize what shows in Morning Briefing?

**Yes!** In Settings:

1. Click gear icon (top-right)
2. Go to "Briefing Preferences"
3. Choose:
   - Which datasources to show
   - Which item types (revenue, deployments, issues, alerts)
   - Minimum severity to display
   - Auto-dismiss items after N hours

---

### Q: How do I set up alerts for my team?

**Alert routing** in Settings → "Alert Channels":

1. Add Slack channel
2. Add email addresses
3. Set severity threshold (only alert on High+)
4. Set quiet hours (no alerts 9 PM - 8 AM)
5. Save

---

### Q: What if I don't recognize a datasource?

**Check datasource type**:

1. Settings → Datasources
2. Find unfamiliar datasource
3. Click to see:
   - Service it's connected to
   - Last successful fetch
   - API key (redacted)

**If not needed**:
- Click "Disable" (keeps config)
- Or "Delete" (remove permanently)

---

### Q: How long is data kept?

**Retention policy**:
- Briefing items: 90 days
- Metrics: 1 year
- Alerts: 1 year
- Chat history: 7 days

---

### Q: Can I export data for reports?

**Coming soon!** Planned features:
- CSV export of metrics
- PDF reports (weekly/monthly)
- Custom report builder
- Automated email reports

---

### Q: What if I see an error?

**Error messages appear as**:

```
⚠️ Failed to fetch Stripe data
Error: "Rate limit exceeded"
[Retry] [Report bug] [More info]
```

**What to do**:
1. Click "Retry" first (may be temporary)
2. Check datasource health (Settings → Datasources)
3. If persistent, click "Report bug" to alert team
4. Check DEPLOYMENT.md troubleshooting section

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `?` | Show keyboard help |
| `b` | Go to Morning Briefing |
| `p` | Go to Portfolio |
| `f` | Open Focus Mode |
| `/` | Open search |
| `1-9` | Switch to brand #N |
| `r` | Refresh all data |
| `Esc` | Close modals |

---

## Getting Help

1. **In-app**: Click `?` → "Help center"
2. **Documentation**: [DEPLOYMENT.md](./DEPLOYMENT.md), [ALERT_RULES.md](./ALERT_RULES.md)
3. **Email**: support@opendash.io
4. **Chat**: Click 💬 in top-right for live support

---

## Feature Requests

Have an idea? [Open a GitHub issue](https://github.com/your-org/open-dash/issues) or email feedback@opendash.io.

---

**Version**: 1.0 (2026-03-24)
**Last Updated**: 2026-03-24
**Status**: ✅ Production Ready
