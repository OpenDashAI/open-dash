# OpenDash Competitive Intelligence: Visual Project Plan

## 1. Phase Timeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PROJECT TIMELINE: 2026                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Mar 24  ► Mar 28              Apr 1-30              May 1-7    May 15+   │
│  ┌──────────┐                   ┌──────┐             ┌───────┐  ┌──────┐  │
│  │ Planning │                   │ Phase 2            │ Phase 3│  │Phase 4│  │
│  │ Complete │ Phase 1 Deploy    │Validate Demand     │Trends  │  │Insights  │
│  │          │ ▼▼▼▼▼▼▼▼▼▼       │ ▼▼▼▼▼              │ ⚠️⚠️⚠️│  │ ⚠️⚠️⚠️ │
│  └──────────┘ Dashboard Live    │ Gather Feedback    │(If approved)       │
│                ✅ Real-time      │ Monitor Usage      │6-8h dev │(10-20h)   │
│                ✅ 4 Tabs        │ User Requests      │        │          │
│                ✅ Drill-down     │ Data Collection    │Recharts│Insights  │
│                ✅ Alerts        │                    │Matrix  │Radar     │
│                                 │ Decision Gate →    │        │          │
│                                 │ 25% = YES          └───────┘└──────┘   │
│                                 └──────┘                                  │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘

KEY:
✅ = Complete, Ready   |   ▼▼▼▼ = In Progress   |   ⚠️ = Conditional
```

## 2. Architecture: Phase 1 Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│                      COMPETITIVE INTELLIGENCE SYSTEM             │
│                        (Phase 1: Complete)                       │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    REACT DASHBOARD LAYER                         │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  /competitive-intelligence                                │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │ TABS: Overview | Competitors | Alerts | Insights    │ │  │
│  │  │                                                      │ │  │
│  │  │ • Key metrics (competitors, alerts, opportunities)  │ │  │
│  │  │ • Top SERP movers chart                            │ │  │
│  │  │ • Recent activity timeline                         │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  │                                                            │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │ /alerts/:alertId          /competitors/:competitorId│ │  │
│  │  │ Detailed alert analysis   Competitor deep-dive      │ │  │
│  │  │ • Changes detected        • DA, traffic, keywords   │ │  │
│  │  │ • AI significance score   • SERP rankings          │ │  │
│  │  │ • Recommendations         • Activity timeline      │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  │                                                            │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │ /admin (Settings)                                    │ │  │
│  │  │ • Alert rules              • Budget limits           │ │  │
│  │  │ • Add/remove competitors   • Slack/email webhooks   │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────────┘  │
│                            ↕ server$() ↕                          │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│              CLOUDFLARE WORKERS API LAYER                        │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ci-orchestrator.ts (Central API Hub)                      │  │
│  │                                                            │  │
│  │ Competitors:   listCompetitors(), addCompetitor()        │  │
│  │ SERP:          getCompetitorRankings(), trackSERP()     │  │
│  │ Intelligence:  getDashboard(), getAlerts(), getInsights()│  │
│  │ Jobs:          runDaily(), runWeekly(), getJobStatus()  │  │
│  │ Costs:         getCostBreakdown(), getQuotaStatus()     │  │
│  │                                                            │  │
│  │ All calls route through → API Mom (cost control)         │  │
│  └────────────────────────────────────────────────────────────┘  │
│                            ↕                                      │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    BACKGROUND JOBS & ANALYSIS                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Durable Objects: CompetitiveIntelligenceCoordinator       │  │
│  │                                                            │  │
│  │ Daily (00:00 UTC):                                        │  │
│  │ • Collect SERP rankings, domain metrics, content         │  │
│  │ • Detect changes (4 dimensions)                          │  │
│  │ • Score significance with Claude AI                      │  │
│  │ • Generate alerts (Slack, email, webhook, dashboard)     │  │
│  │ • Store insights in D1                                   │  │
│  │ • Broadcast to HudSocket (real-time UI updates)         │  │
│  │                                                            │  │
│  │ Weekly:                                                    │  │
│  │ • Deep analysis and market insights                      │  │
│  │ • Opportunity identification                             │  │
│  └────────────────────────────────────────────────────────────┘  │
│                            ↕                                      │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                      D1 DATABASE LAYER                           │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ competitor_domains        competitor_serp                 │  │
│  │ • ID, name, domain        • Competitor ID                 │  │
│  │ • DA, traffic, keywords   • Keyword                       │  │
│  │ • Last checked            • Rank position                 │  │
│  │                           • Date                          │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │ competitor_content        market_insights                 │  │
│  │ • URL, title, date        • Type (opportunity/threat)    │  │
│  │ • Content hash            • Confidence score              │  │
│  │ • Source                  • Description                   │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │ competitor_pricing        competitive_alerts              │  │
│  │ • Tier changes            • Alert ID                      │  │
│  │ • Feature additions       • Competitor, severity          │  │
│  │ • Timestamp               • Triggered at, message         │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    EXTERNAL INTEGRATIONS                         │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ API MOM (Cost Control & Security)                         │  │
│  │ • Routes all API calls through managed proxy             │  │
│  │ • No local API keys in codebase                          │  │
│  │ • Cost tracking & quota limits                           │  │
│  │                                                            │  │
│  │ BraveSearch (SERP Tracking)                              │  │
│  │ • Keyword rankings for competitors                       │  │
│  │ • Top 10 positions tracked daily                         │  │
│  │                                                            │  │
│  │ Claude AI (Significance Analysis)                        │  │
│  │ • Analyzes competitive changes                           │  │
│  │ • Scores strategic importance                            │  │
│  │ • Generates recommendations                              │  │
│  │                                                            │  │
│  │ Slack/Email/Webhook (Alerting)                           │  │
│  │ • Multi-channel notifications                            │  │
│  │ • Rich formatted messages                                │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

## 3. Phase 2: Decision Framework

```
┌──────────────────────────────────────────────────────────────────┐
│           PHASE 2: DEMAND VALIDATION (April 1-30)               │
│                    Go/No-Go Decision Criteria                    │
└──────────────────────────────────────────────────────────────────┘

                    COLLECT DATA FOR 30 DAYS

                ┌─────────────────────────────┐
                │  Automated Usage Metrics    │
                ├─────────────────────────────┤
                │ • Dashboard pageviews       │
                │ • Time spent per page       │
                │ • Tab usage distribution    │
                │ • Drill-down clicks         │
                │ • Feature request count     │
                │ • Error rates/performance   │
                └─────────────────────────────┘
                            ↓
                ┌─────────────────────────────┐
                │  Manual Feedback Collection │
                ├─────────────────────────────┤
                │ • User interviews (3-5)     │
                │ • Slack feedback channel    │
                │ • Feature request form      │
                │ • NPS/satisfaction survey   │
                │ • Competitive feedback      │
                └─────────────────────────────┘
                            ↓
                ┌─────────────────────────────┐
                │  Data Quality Checks        │
                ├─────────────────────────────┤
                │ • SERP accuracy (spot-check)│
                │ • Alert quality/actionability│
                │ • Missing data assessment   │
                │ • Cost tracking validation  │
                └─────────────────────────────┘
                            ↓
                ┌─────────────────────────────┐
                │  DECISION POINT (Apr 30)    │
                └─────────────────────────────┘
                         ↙      ↘
             ┌────────────────────────────────┐
             │        25%+ USERS ASK FOR      │
             │           TRENDS?              │
             └────────────────────────────────┘
                    ↙ YES      ↘ NO
                   /              \
        ┌─────────────────┐    ┌──────────────┐
        │  PHASE 3 GO     │    │  PHASE 3: NO │
        ├─────────────────┤    ├──────────────┤
        │ May 1-7:        │    │ Keep building│
        │ Build Trends    │    │ dashboard   │
        │ 4-6 hours       │    │ features    │
        │                 │    │             │
        │ Custom React    │    │ Focus on:   │
        │ dashboard       │    │ • UI polish │
        │ with Recharts   │    │ • Alert     │
        │                 │    │   quality   │
        │ Recharts +      │    │ • Perf.     │
        │ Workers         │    │   tuning    │
        │ backend         │    │             │
        └─────────────────┘    └──────────────┘
                 ↓
        ┌─────────────────┐
        │  PHASE 4 GO     │
        ├─────────────────┤
        │ May 15+:        │
        │ Build Custom    │
        │ Insights        │
        │                 │
        │ • Opportunity   │
        │   Radar         │
        │ • Anomaly       │
        │   Detection     │
        │ • Positioning   │
        │   Matrix        │
        └─────────────────┘
```

## 4. Feature Matrix by Phase

```
┌─────────────────────────────────────────────────────────────────┐
│              FEATURE AVAILABILITY BY PHASE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ FEATURE              PHASE 1    PHASE 2    PHASE 3   PHASE 4   │
│                      (Live)     (Monitor)  (Trends)  (Insights)│
│                                                                 │
│ Real-Time Dashboard    ✅         ✅         ✅        ✅       │
│ 4 Tabs (O/C/A/I)       ✅         ✅         ✅        ✅       │
│ Drill-Down Pages       ✅         ✅         ✅        ✅       │
│ Admin Settings         ✅         ✅         ✅        ✅       │
│ Multi-Channel Alerts   ✅         ✅         ✅        ✅       │
│ Slack Notifications    ✅         ✅         ✅        ✅       │
│ Email Reports          ✅         ✅         ✅        ✅       │
│ CLI Tool (ODA)         ✅         ✅         ✅        ✅       │
│                                                                 │
│ Historical Trends       ❌         ❌         ⚠️✅      ✅       │
│ Competitor Comparison   ❌         ❌         ⚠️✅      ✅       │
│ Cost Tracking          ✅         ✅         ✅        ✅       │
│ Grafana Integration    ✅         ✅         ✅        ✅       │
│                                                                 │
│ Opportunity Radar       ❌         ❌         ❌        ⚠️✅      │
│ Anomaly Detection      ❌         ❌         ❌        ⚠️✅      │
│ Content Gap Analysis   ❌         ❌         ❌        ⚠️✅      │
│ Positioning Matrix     ❌         ❌         ❌        ⚠️✅      │
│                                                                 │
│ LEGEND:                                                         │
│ ✅ = Available        ⚠️✅ = Conditional (if approved)  ❌ = N/A  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 5. Cost & ROI Timeline

```
┌─────────────────────────────────────────────────────────────────┐
│              CUMULATIVE COST & ROI ANALYSIS                      │
│                     (Per Customer, $99/mo plan)                 │
└─────────────────────────────────────────────────────────────────┘

DEVELOPMENT COST BREAKDOWN:
  Phase 1: 48-65h ($4,800-6,500)  ─────────────────────────────
  Phase 2: 24h ($2,400, validation)
  Phase 3: 4-6h ($400-600)         ──────
  Phase 4: 10-20h ($1,000-2,000)          ────────────────
           ──────────────────────────────────────────────────
  TOTAL:   86-115h ($8,600-11,500)

MONTHLY INFRASTRUCTURE COST:
  Cloudflare/D1/Workers: $7-16/mo (includes all phases)

GRAFANA COMPARISON (Same customer):
  Grafana SaaS: $19/month minimum → $228/year
  Dev time: 1h setup, then ongoing Grafana cost

PAYBACK ANALYSIS:
  Custom Phase 3 investment: $500 (6h dev)
  Grafana cost for same period: $100-300/month
  ► Payback period: 2-5 months
  ► Year 1 ROI: 300-600%

MARGIN COMPARISON (Year 1):

  Option A: Dashboard Only
  Revenue:        $99/month = $1,188/year
  Infrastructure: $7/month = $84/year
  Dev amortized:  $5,000/12 = $417/month first year
  ────────────────────────────────
  Margin Year 1:  ($1,188 - 84 - 417) = $687 (58%)

  Option B: With Custom Trends (Phase 3)
  Revenue:        $99/month = $1,188/year
  Infrastructure: $8/month = $96/year
  Dev amortized:  $5,500/12 = $458/month first year
  ────────────────────────────────
  Margin Year 1:  ($1,188 - 96 - 458) = $634 (53%)

  Option C: With Grafana
  Revenue:        $99/month = $1,188/year
  Infrastructure: $7 + $25 (Grafana) = $32/month = $384/year
  Dev amortized:  $2,500/12 = $208/month first year
  ────────────────────────────────
  Margin Year 1:  ($1,188 - 384 - 208) = $596 (50%)

YEAR 2+ (After amortization):
  Dashboard Only:        ($1,188 - 84) = $1,104 (93%)
  With Custom Trends:    ($1,188 - 96) = $1,092 (92%)
  With Grafana:          ($1,188 - 384) = $804 (68%)

┌─────────────────────────────────────────────────────────────────┐
│ CONCLUSION: Custom trends cost $100 more in Year 1, but gain    │
│ $288 extra margin in Year 2+. Plus: competitive differentiation │
│ and customer lock-in that Grafana can't match.                   │
└─────────────────────────────────────────────────────────────────┘
```

## 6. Risk vs Reward Matrix

```
┌────────────────────────────────────────────────────────────────┐
│         PHASE RISK VS REWARD ASSESSMENT                        │
├────────────────────────────────────────────────────────────────┤

PHASE 1: Dashboard Deployment
┌─────────────────────────────────────────────────────────────┐
│ Risk Level:     ●●●●○ (Moderate)                            │
│ Reward Level:   ●●●●● (High)                                │
│                                                             │
│ Key Risks:                    Key Rewards:                 │
│ • API Mom downtime            • Market entry NOW           │
│ • Data quality issues         • Real customer data          │
│ • Team adoption low           • Competitive advantage      │
│                               • Revenue generation         │
│ Mitigation: Backup APIs, QA   Starts immediate             │
└─────────────────────────────────────────────────────────────┘

PHASE 2: Validation
┌─────────────────────────────────────────────────────────────┐
│ Risk Level:     ●●○○○ (Low)                                 │
│ Reward Level:   ●●●●○ (High)                                │
│                                                             │
│ Key Risks:                    Key Rewards:                 │
│ • Feedback inconclusive       • Data-driven decision       │
│ • Users lie about needs       • No wasted dev time         │
│ • Market shifts               • Clear go/no-go path        │
│                               • 30 days of analytics        │
│ Mitigation: Criteria set      data collected               │
│             now, not guessed                               │
└─────────────────────────────────────────────────────────────┘

PHASE 3: Custom Trends (Conditional)
┌─────────────────────────────────────────────────────────────┐
│ Risk Level:     ●●●○○ (Moderate-Low)                        │
│ Reward Level:   ●●●●● (Very High)                           │
│                                                             │
│ Key Risks:                    Key Rewards:                 │
│ • 6h wasted if wrong call     • 10x margin vs Grafana      │
│ • Performance regression      • Competitive moat            │
│ • Team distraction            • Customer lock-in            │
│                               • Product differentiation    │
│ Mitigation: Only if >25%      High strategic value         │
│             demand validated                               │
└─────────────────────────────────────────────────────────────┘

PHASE 4: Custom Insights (Conditional)
┌─────────────────────────────────────────────────────────────┐
│ Risk Level:     ●●●●○ (Moderate)                            │
│ Reward Level:   ●●●●● (Very High)                           │
│                                                             │
│ Key Risks:                    Key Rewards:                 │
│ • High dev investment (20h)   • Unique product features    │
│ • May not move needle         • Huge competitive advantage │
│ • Market shifts               • Enterprise sales story      │
│ • Feature creep               • $500+/mo premium possible  │
│                                                             │
│ Mitigation: Only if Phase 3   Only execute if clear        │
│             proving ROI       customer demand               │
└─────────────────────────────────────────────────────────────┘

OVERALL PROJECT RISK: ●●●○○ (Moderate)
  → Well-defined phases reduce risk
  → Each phase has clear go/no-go criteria
  → Can adjust based on market feedback
  → No Phase 3/4 until demand proven
```

## 7. Team Org Chart & Responsibilities

```
┌──────────────────────────────────────────────────────────┐
│              PROJECT TEAM STRUCTURE                      │
│          Competitive Intelligence 2026                   │
└──────────────────────────────────────────────────────────┘

PROJECT SPONSOR
(Leadership Decision Authority)
    │
    ├─ PHASE 1 LEAD (Deployment) ──────────┐
    │  └─ DevOps Engineer (1 week)         │
    │  └─ Backend Developer (2 days)       │ Parallel
    │  └─ PM (2 days training)             │
    │                                      │
    ├─ PHASE 2 LEAD (Validation) ──────────┤ Sequential
    │  └─ Product Manager (20h over 30d)   │
    │  └─ Backend Monitoring (4h)          │
    │                                      │
    ├─ PHASE 3 LEAD (Trends, if approved)─┤
    │  └─ Full-stack Developer (4-6h)      │
    │  └─ QA/Testing (1h)                  │
    │                                      │
    └─ PHASE 4 LEAD (Insights, if aprv'd)─┘
       └─ Full-stack Developer (10-20h)
       └─ Data Analyst (2-4h, optional)

RESPONSIBILITIES BY ROLE:

DevOps:
  • Deploy to Cloudflare (migration, config)
  • Set up monitoring & alerts
  • Backup/rollback procedures
  • Post-deployment troubleshooting

Backend Developer:
  • Dashboard API integration testing
  • Custom trends API (Phase 3)
  • Performance optimization
  • Bug fixes

Product Manager:
  • Team training & enablement
  • Usage metrics collection (Phase 2)
  • Feature request prioritization
  • Customer communication
  • Go/no-go decision recommendation

Full-stack Developer (Phase 3-4):
  • Recharts implementation
  • Workers backend queries
  • React component development
  • Testing & performance tuning

Data Analyst (Phase 4, optional):
  • Validates data for insights
  • ML model tuning
  • Anomaly detection configuration
```

## 8. Decision Tree: Should We Proceed?

```
                    START: March 24
                         │
                         ↓
                ┌─────────────────┐
                │ PHASE 1 READY?  │
                ├─────────────────┤
                │ All code tested │
                │ DB migrations ok│
                │ Team trained?   │
                └────────┬────────┘
                         │
        ┌────────────────┴────────────────┐
        │ YES                             NO
        ↓                                 ↓
    [PROCEED]                    [DELAY & FIX]
    Deploy                       Return to dev
    March 28                      Max 1 week
        │                         extension
        ↓
    PHASE 1 LIVE
    April 1 START
    VALIDATION
        │
        ↓ (April 30)
    ┌──────────────────┐
    │ 25%+ USERS       │
    │ REQUEST TRENDS?  │
    └────────┬─────────┘
             │
    ┌────────┴──────────┐
    │ YES              NO
    ↓                  ↓
 [GO]          [STOP - Keep]
 Phase 3        Dashboard
 May 1-7        Only
    │
    ↓ (May 7)
 ┌──────────────────┐
 │ PHASE 3 USER    │
 │ ADOPTION HIGH?  │
 │ (>50% weekly)   │
 └────────┬────────┘
          │
    ┌─────┴─────┐
    │YES       NO
    ↓          ↓
 [GO]      [STOP]
Phase 4   Keep
May 15+   Trends
          Only
```

---

**All diagrams created March 24, 2026**
**Ready for presentation to leadership**
