# Competitive Intelligence CLI Guide

**Comprehensive command-line interface for managing competitive intelligence in OpenDash.**

The CI CLI can be driven by Claude Code, shell scripts, or directly via terminal. All operations are cost-controlled through API Mom proxy with built-in quota management and rate limiting.

---

## Quick Start

```bash
# List all competitors
ci-cli competitors list

# Check SERP for a keyword
ci-cli serp check "business intelligence"

# Get market opportunities
ci-cli insights opportunities

# View dashboard
ci-cli dashboard

# Run daily collection job
ci-cli jobs run daily
```

---

## Installation & Setup

### Prerequisites
```bash
# D1 Database must be initialized
# wrangler.jsonc must have COMPETITIVE_INTEL binding
# API_MOM_URL and API_MOM_KEY environment variables required
```

### Build & Deploy
```bash
# Build the CLI
npm run build

# Deploy to Cloudflare
wrangler deploy

# The CLI is available as both:
# 1. TypeScript module: import { ciTools } from './routes/api/ci-tools'
# 2. CLI binary: ci-cli <command> [options]
```

---

## Command Reference

### Competitors

#### `ci-cli competitors list`
List all monitored competitors with metrics.

```bash
ci-cli competitors list
```

**Output:**
```
━━━ Competitors ━━━

Metabase (metabase)
  Domain: metabase.com
  Source: manual
  Last Checked: 3/24/2026

Grafana (grafana)
  Domain: grafana.com
  Source: manual

Total: 5
```

---

#### `ci-cli competitors add <name> <domain>`
Add a new competitor to monitor.

```bash
ci-cli competitors add "Metabase" "metabase.com"
```

**Arguments:**
- `name` — Competitor name
- `domain` — Primary domain (without https://)

**Output:**
```
✓ Added competitor: Metabase
ID: metabase
```

---

#### `ci-cli competitors metrics <id>`
Get detailed metrics for a competitor.

```bash
ci-cli competitors metrics metabase
```

**Output:**
```
━━━ Metrics: Metabase ━━━

Domain Authority: 72
Monthly Traffic: 185,000
Organic Keywords: 3,420
Backlinks: 12,500

Trends:
  Traffic: 📈 up
  Keywords: 📈 up
```

---

### SERP & Rankings

#### `ci-cli serp check "<keyword>"`
Check current SERP rankings for a keyword.

```bash
ci-cli serp check "business intelligence tool"
```

**Output:**
```
━━━ SERP: "business intelligence tool" ━━━

  #1   Tableau
  #2   Power BI
  #3   Metabase
  #5   Grafana
  #8   Looker
  #0   Superset (not ranked)
```

Colors indicate ranking quality:
- 🟢 Green: Top 10
- 🟡 Yellow: 11-50
- 🔴 Red: Below 50

---

#### `ci-cli serp rankings <competitor> [days]`
Get SERP ranking history for a competitor.

```bash
ci-cli serp rankings metabase 30
```

**Arguments:**
- `competitor` — Competitor ID
- `days` — (optional) Number of days of history (default: 7)

**Output:**
```
━━━ Rankings: metabase (30 days) ━━━

Average Rank: 4.2

Improving (3):
  📈 business intelligence open source
  📈 self-hosted analytics platform
  📈 no-code dashboard

Declining (2):
  📉 free analytics tool
  📉 data visualization software
```

---

### Market Intelligence

#### `ci-cli insights opportunities`
Get unaddressed market opportunities.

```bash
ci-cli insights opportunities
```

**Output:**
```
━━━ Market Opportunities ━━━

No-Code Analytics Gap
Confidence: 85%
All competitors offer low-code. Market seeking true no-code.
Competitors: Metabase, Grafana, Tableau

Embedded Analytics Trend
Confidence: 92%
Competitors moving toward embedded offerings. Your positioning unclear.
Competitors: Tableau, Looker, Power BI

Total: 8 | High Confidence: 3
```

---

#### `ci-cli insights threats`
Get active competitive threats.

```bash
ci-cli insights threats
```

**Output:**
```
━━━ Competitive Threats ━━━

Tableau Enterprise Push
Entering SMB market with aggressive pricing ($29/month).
Competitors: Tableau

Grafana Real-Time Focus
New streaming analytics module launched.
Competitors: Grafana

Total: 5 | Critical: 1
```

---

#### `ci-cli insights gaps`
Analyze content gaps vs competitors.

```bash
ci-cli insights gaps
```

**Output:**
```
━━━ Content Gap Analysis ━━━

Time Series Analysis
Priority: HIGH
Competitors Covering: 4
You: ✗ Not covered

ML Model Integration
Priority: HIGH
Competitors Covering: 3
You: ✗ Not covered

API Documentation
Priority: MEDIUM
Competitors Covering: 5
You: ✓ Covered

Recommendations:
  • Create 3 guides on time series analysis
  • Build tutorial for ML integrations
  • Expand API documentation with examples
```

---

### Scheduled Jobs

#### `ci-cli jobs status`
Check status of all scheduled collection jobs.

```bash
ci-cli jobs status
```

**Output:**
```
━━━ Job Status ━━━

DAILY:
  Status: completed
  Last Run: 3/24/2026
  Next Run: 3/25/2026
  Items: 42

WEEKLY:
  Status: completed
  Last Run: 3/22/2026
  Next Run: 3/29/2026
  Items: 156

API Quota:
  Used: 342/1000 (34%)
  Reset: 4/1/2026
```

---

#### `ci-cli jobs run <type>`
Manually trigger a collection job.

```bash
ci-cli jobs run daily
ci-cli jobs run weekly
```

**Arguments:**
- `type` — `daily`, `weekly`, or `monthly`

**Output:**
```
Triggering daily job...
✓ Daily job queued successfully
Job ID: ci-daily-20260324-1645
Estimated Duration: 45s
```

---

### Dashboard & Analytics

#### `ci-cli dashboard`
Show comprehensive CI dashboard.

```bash
ci-cli dashboard
```

**Output:**
```
━━━ Competitive Intelligence Dashboard ━━━

COMPETITORS
  Total: 10
  Active: 8

SERP RANKINGS
  Top Movers:
    Metabase: 📈 +3
    Grafana: 📉 -1
    Tableau: ➡️ 0

MARKET INSIGHTS
  Opportunities: 8
  Threats: 2
  Recent Content: 23

ALERTS
  Recent: 3
  Critical: 0

API USAGE & COSTS
  Quota: 34% of monthly
  Calls: 342
  Est. Cost: $12.50/month
```

---

#### `ci-cli costs breakdown`
Show API cost breakdown and quota usage.

```bash
ci-cli costs breakdown
```

**Output:**
```
━━━ API Cost Breakdown ━━━

Period: March 1-24, 2026
Total Cost: $12.50
Est. Monthly: $15.62

Cost by Provider:
  BraveSearch       ████░░░░░░░░░░░░░░░░ $8.50 (68%)
  Claude AI         ██░░░░░░░░░░░░░░░░░░░ $3.00 (24%)
  Ahrefs            █░░░░░░░░░░░░░░░░░░░░ $1.00 (8%)

Quota:
  Daily: 658/1000 remaining
  Resets: 4/1/2026
```

---

## Integration with Claude Code

The CLI is fully integrated into the OpenDash chat interface. Use it directly:

### Chat-Based Usage

```
User: Check SERP rankings for "business intelligence"
AI: (calls checkKeywordRanking tool)
AI: Based on current rankings, Tableau is #1, Metabase is #3...
```

### Available Chat Tools

- `listCompetitors` — List all monitored competitors
- `addCompetitor` — Add a new competitor
- `getCompetitorMetrics` — Get metrics for a competitor
- `checkKeywordRanking` — Check SERP rankings
- `getCompetitorRankings` — Get ranking history
- `getMarketOpportunities` — Find market gaps
- `getCompetitiveThreats` — Get threats
- `analyzeContentGaps` — Content gap analysis
- `analyzeCompetitiveChanges` — AI analysis of changes
- `getAlertRules` — List active alerts
- `getRecentAlerts` — Get fired alerts
- `getJobStatus` — Job and quota status
- `triggerJob` — Manually run a job
- `getDashboard` — Full dashboard
- `getCostBreakdown` — Cost analysis
- `getQuotaStatus` — API quota status
- `getRecentCompetitorContent` — Recent content

---

## Architecture & Cost Control

### API Mom Integration

All API calls route through **API Mom** managed proxy:

```
CI CLI → API Mom → External APIs (BraveSearch, Ahrefs, Claude, etc.)
         ↓
      Cost Tracking
      Rate Limiting
      API Key Management
      Request Logging
```

**Benefits:**
- No local API keys (security)
- Unified rate limiting (prevents quota burns)
- Cost tracking per provider
- Request audit trails
- Easy key rotation

### Cost Limits

Default limits (configurable):
- **Daily limit**: $5/day
- **Monthly limit**: $150/month
- **Per-API limits**: BraveSearch ($10/mo), Claude ($30/mo), Ahrefs ($20/mo)

When quota exceeded:
- New requests return 429 (rate limited)
- Alert rule fires
- Dashboard shows warning

---

## Security & Authentication

### Credentials
```bash
# Set these environment variables:
export API_MOM_URL="https://apimom.dev"
export API_MOM_KEY="your-api-mom-key"
export OPENROUTER_KEY="your-openrouter-key"  # Optional for direct Claude calls
```

### Access Control
- All API calls authenticated via `X-API-Key` header
- Durable Objects require Clerk session verification
- Database queries scoped to authenticated user
- Audit logging of all operations

---

## Automation & Scheduling

### Cloudflare Cron Triggers

Jobs run automatically on schedule:

```
Daily Job:   00:00 UTC
Weekly Job:  Sunday 18:00 UTC
Monthly Job: 1st of month 00:00 UTC
```

### Manual Triggers

```bash
# Trigger immediately
ci-cli jobs run daily
ci-cli jobs run weekly

# Via chat
User: Run daily competitive intelligence job now
AI: (calls triggerJob tool)
```

### Custom Schedules

Edit `src/server/competitive-intel-coordinator.ts`:

```typescript
// Update minInterval thresholds or add custom schedules
if (url.pathname === "/run-custom") {
  // Your custom job here
}
```

---

## Troubleshooting

### "API Mom not configured"
```bash
export API_MOM_URL="https://apimom.dev"
export API_MOM_KEY="your-key"
```

### Quota Exceeded
```bash
# Check quota status
ci-cli costs breakdown

# Wait for reset or:
# 1. Reduce monitoring scope
# 2. Increase daily limit (edit API Mom settings)
# 3. Upgrade to higher tier
```

### No Competitors Showing Up
```bash
# Seed default competitors
ci-cli competitors add "Metabase" "metabase.com"
ci-cli competitors add "Grafana" "grafana.com"
```

### Job Stuck / Not Running
```bash
# Check job status
ci-cli jobs status

# Check D1 database
# Verify Durable Object binding in wrangler.jsonc
# Review application logs
```

---

## Examples

### Daily Workflow

```bash
# Morning: Check overnight changes
ci-cli dashboard
ci-cli serp check "my target keyword"
ci-cli insights threats

# Take action
ci-cli insights opportunities  # Plan content
ci-cli insights gaps          # Identify gaps
```

### Weekly Analysis

```bash
# Get insights from week of data
ci-cli serp rankings metabase 7
ci-cli getRecentCompetitorContent
ci-cli analyzeCompetitiveChanges weekly
```

### Monthly Strategy

```bash
# Full portfolio review
ci-cli competitors list
ci-cli dashboard
ci-cli costs breakdown
ci-cli jobs run monthly  # Trigger deep analysis
```

---

## Advanced Usage

### Scripting & Automation

```bash
#!/bin/bash
# daily-ci-report.sh

echo "Daily Competitive Intelligence Report"
echo "$(date)"
echo ""

echo "SERP Rankings:"
ci-cli serp check "business intelligence"
echo ""

echo "Recent Threats:"
ci-cli insights threats | head -3
echo ""

echo "Opportunities:"
ci-cli insights opportunities | head -3
echo ""

echo "API Usage:"
ci-cli costs breakdown | grep "Est. Cost"
```

Run with cron:
```bash
0 9 * * * /home/user/daily-ci-report.sh > /tmp/ci-report.txt
```

### Integration with Other Systems

```bash
# Export to JSON for analysis
ci-cli competitors list > competitors.json
ci-cli dashboard > dashboard.json

# Parse and process
jq '.competitors[] | select(.domain_authority > 60)' competitors.json
```

---

## Next Steps

1. **Seed competitors**: `ci-cli competitors add` for 5-10 key competitors
2. **Check keywords**: `ci-cli serp check` for your top 10 terms
3. **Review opportunities**: `ci-cli insights opportunities`
4. **Schedule jobs**: Ensure daily/weekly runs are enabled
5. **Monitor costs**: Check `ci-cli costs breakdown` weekly
6. **Iterate**: Use insights to inform marketing strategy

---

**Last Updated**: March 24, 2026
**Version**: 1.0
**Support**: Refer to COMPETITIVE-INTEL-CLOUDFLARE-EDITION.md for architecture details
