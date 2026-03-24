# Competitor Intelligence System for OpenDash

**Purpose**: Formal, systematic process to gather and analyze competitor marketing strategies
**Status**: Framework designed
**Created**: 2026-03-24
**Version**: 1.0

---

## Overview

This system enables OpenDash to systematically monitor, analyze, and learn from competitor and adjacent business marketing strategies across web, social media, and open source channels.

**What This System Does**:
- 🔍 Identifies current and emerging competitors
- 📊 Automatically gathers marketing intelligence (daily)
- 🗄️ Builds searchable competitor database
- 📈 Tracks changes and trends over time
- 🧠 Analyzes best practices for OpenDash adoption
- 📋 Generates actionable insights for marketing pipeline

**Time to ROI**: 2 weeks (basic monitoring) → 8 weeks (full intelligence system)

---

## Architecture Overview

```
COMPETITOR INTELLIGENCE SYSTEM

Data Collection Layer
├─ APIs (Semrush, Ahrefs, SimilarWeb, Brandwatch)
├─ Browser Automation (Playwright)
├─ GitHub Intelligence (API)
├─ Social Media APIs
└─ Manual Research (Perplexity)

↓

Processing Layer
├─ Claude API (semantic analysis, significance detection)
├─ Perplexity API (fact-checking, latest developments)
├─ Custom NLP (content comparison, changes)
└─ Change Detection (visual diffs, DOM parsing)

↓

Storage Layer
├─ Time-Series DB (TimescaleDB) → Historical metrics
├─ Vector DB (Weaviate) → Document embeddings
├─ Document Store (S3) → Screenshots, archived pages
└─ PostgreSQL → Competitor metadata

↓

Analytics & Insights Layer
├─ Grafana Dashboards → Real-time monitoring
├─ Semantic Search → Find patterns across competitors
├─ Trend Analysis → Market movements
└─ Report Generation → Executive summaries
```

---

## Core Concepts

### 1. Competitor Categories

Classify competitors into 5 tiers:

```
TIER 1: Direct Competitors
├─ Category: Same market, similar product
├─ Examples: [List based on your research]
├─ Priority: HIGH
└─ Monitoring Frequency: Daily

TIER 2: Feature Competitors
├─ Category: Different market, overlapping features
├─ Examples: [Grafana, Metabase - analytics/dashboards]
├─ Priority: HIGH
└─ Monitoring Frequency: 2-3x/week

TIER 3: Adjacent Businesses
├─ Category: Related but different
├─ Examples: [Salesforce, HubSpot - CRM/marketing]
├─ Priority: MEDIUM
└─ Monitoring Frequency: Weekly

TIER 4: Emerging/Future Competitors
├─ Category: Small, growth-focused (watch list)
├─ Examples: [YC startups, GitHub trending]
├─ Priority: MEDIUM
└─ Monitoring Frequency: Bi-weekly

TIER 5: Inspirational/Non-Competitive
├─ Category: Great marketing, different market
├─ Examples: [Design, positioning, brand inspiration]
├─ Priority: LOW
└─ Monitoring Frequency: Monthly
```

### 2. Marketing Dimensions to Track

For each competitor, monitor:

```
WEBSITE & SEO
├─ Homepage positioning & messaging
├─ Product/feature pages
├─ Pricing strategy & page
├─ Blog/content strategy
├─ Technical stack (What's Built With)
└─ Traffic & ranking changes

SOCIAL MEDIA
├─ X/Twitter: Posting frequency, content themes, engagement
├─ LinkedIn: Company updates, employee thought leadership
├─ GitHub: Repo activity, open source strategy
├─ YouTube: Video strategy, tutorials, case studies
└─ Alternatives: TikTok, Reddit, Discord (if applicable)

BRANDING & POSITIONING
├─ Brand messaging & tagline evolution
├─ Visual identity changes
├─ Company values & culture positioning
└─ Founder/leadership visibility

PRODUCT & FEATURES
├─ Release cycles and cadence
├─ Feature announcements
├─ API changes
├─ Integration partnerships
└─ Customer showcase/case studies

MARKET PRESENCE
├─ Press releases & news coverage
├─ Conference presence & sponsorships
├─ Partnerships & integrations
├─ Customer testimonials & case studies
└─ Funding announcements
```

### 3. Data Quality Tiers

```
TIER 1: API-Sourced (High Quality)
└─ Structured data from official APIs
   ├─ SimilarWeb traffic data
   ├─ GitHub activity metrics
   └─ LinkedIn company data
   └─ Confidence: 95%+

TIER 2: Automated Extraction (Medium Quality)
└─ Browser automation + parsing
   ├─ DOM extraction (pricing, features)
   ├─ Screenshot visual changes
   └─ Homepage text/positioning
   └─ Confidence: 80-90%

TIER 3: AI Analysis (Medium Quality)
└─ Claude analysis of collected data
   ├─ Semantic significance detection
   ├─ Content gap analysis
   └─ Positioning inference
   └─ Confidence: 70-80%

TIER 4: Manual Research (Varies)
└─ Human verification & research
   ├─ News monitoring
   ├─ Analyst reports
   └─ Industry research
   └─ Confidence: 60-90%
```

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2)

**Goal**: Establish competitor list, basic monitoring, and data structure

**Tasks**:
1. [ ] Define OpenDash competitor universe (10-20 competitors)
2. [ ] Design PostgreSQL schema for competitor data
3. [ ] Create basic Grafana dashboard
4. [ ] Set up API credentials (SimilarWeb, Semrush, GitHub)
5. [ ] Create competitor tracking template

**Deliverables**:
- Competitor Master List (spreadsheet/database)
- Schema definition
- API credentials documented
- Initial dashboard setup

**Time**: 20-30 hours

---

### Phase 2: Automated Collection (Weeks 3-4)

**Goal**: Build automated collection pipeline

**Tasks**:
1. [ ] Develop Playwright scripts for competitor website monitoring
2. [ ] Build API integration layer (SimilarWeb, Ahrefs, GitHub)
3. [ ] Create scheduled jobs (daily, weekly, bi-weekly)
4. [ ] Set up screenshot storage (S3/GCS)
5. [ ] Build change detection logic

**Deliverables**:
- Playwright monitoring scripts
- API integration code
- Scheduled job configuration
- Initial data collection

**Time**: 30-40 hours

---

### Phase 3: Processing & Intelligence (Weeks 5-6)

**Goal**: Convert raw data into intelligence

**Tasks**:
1. [ ] Integrate Claude API for semantic analysis
2. [ ] Build change detection pipeline
3. [ ] Create content comparison logic
4. [ ] Implement significance scoring
5. [ ] Set up alerting for major changes

**Deliverables**:
- Processing pipeline
- Significance scoring model
- Alert system
- Initial intelligence insights

**Time**: 25-35 hours

---

### Phase 4: Storage & Search (Week 7)

**Goal**: Build queryable intelligence database

**Tasks**:
1. [ ] Set up TimescaleDB for time-series metrics
2. [ ] Set up Weaviate for document embeddings
3. [ ] Build data ingestion pipeline
4. [ ] Create semantic search interface
5. [ ] Build competitor comparison queries

**Deliverables**:
- Working TimescaleDB with competitor metrics
- Vector embeddings of competitor content
- Semantic search capability
- Comparison reports

**Time**: 20-25 hours

---

### Phase 5: Analytics & Insights (Week 8+)

**Goal**: Generate actionable marketing intelligence

**Tasks**:
1. [ ] Build Grafana dashboards (trends, comparisons)
2. [ ] Create trend analysis reports
3. [ ] Generate market opportunity analysis
4. [ ] Build marketing strategy recommendations
5. [ ] Create executive summaries

**Deliverables**:
- Multi-dimensional Grafana dashboards
- Weekly/monthly intelligence reports
- Trend analysis
- Actionable recommendations

**Time**: Ongoing (5-10 hours/week)

---

## Data Collection Approach

### A. Website & Online Presence Monitoring

#### Using Playwright

```javascript
// Pseudo-code for systematic competitor monitoring

Daily Tasks:
├─ Screenshot competitor homepages
├─ Extract DOM elements (pricing, features, CTA)
├─ Monitor header/footer changes
├─ Check for announcements/banners
├─ Capture metadata (Open Graph tags, schema markup)
└─ Store with timestamp for comparison

Weekly Tasks:
├─ Full-page screenshots
├─ Check all pricing pages
├─ Monitor blog/news sections
├─ Screenshot key product pages
└─ Capture SEO metadata

Monthly Tasks:
├─ Deep content analysis
├─ Feature comparison audit
├─ Design/brand consistency check
├─ Case study/testimonial updates
└─ Competitive positioning summary
```

**Key Metrics to Extract**:
- Pricing (list, changes, bundling strategy)
- Feature list (new features, deprecations)
- Key messaging (homepage positioning)
- CTAs (sign-up, trial, demo buttons)
- Navigation structure
- Mobile responsiveness
- Page load time

#### Using APIs

```
SimilarWeb API
├─ Monthly visitors
├─ Traffic by geography
├─ Traffic by source (organic, direct, referral, paid, social)
├─ Bounce rate
├─ Avg session length
└─ Top pages

Semrush API
├─ Organic keywords (volume, position, difficulty)
├─ Backlink profile
├─ Content analysis
├─ Paid keyword data
└─ Traffic estimation

Ahrefs API
├─ Backlink analysis
├─ Referring domains
├─ Domain authority trends
├─ Content analysis
└─ Competitor content

GitHub API
├─ Repository activity (commits, PRs)
├─ Release cadence
├─ Stars/forks growth
├─ Language composition
├─ Contributor diversity
└─ Open source strategy
```

---

### B. Social Media Intelligence

#### X/Twitter Monitoring

```
Data to Collect:
├─ Tweet frequency (daily/weekly/monthly average)
├─ Content themes (product, thought leadership, customer success, culture)
├─ Engagement metrics (likes, retweets, replies)
├─ Hashtag strategy
├─ Mention frequency
└─ Sentiment analysis

Tools:
├─ X API (official) - tweets, engagement, followers
├─ Brandwatch - sentiment, trending topics
├─ AYLIEN - media monitoring
└─ Custom integration - frequency analysis
```

#### LinkedIn Monitoring

```
Data to Collect:
├─ Company page activity (posts, followers, engagement)
├─ Employee thought leadership (hiring, culture)
├─ Company updates (funding, partnerships, awards)
├─ Content themes
└─ Posting frequency

Tools:
├─ LinkedIn API (limited access) - structured data
├─ Brandwatch - company mentions
├─ Custom Playwright - periodic screenshots
└─ Manual monitoring - culture/hiring
```

#### GitHub Monitoring

```
Data to Collect:
├─ Repository activity (commits/week)
├─ Release cadence
├─ Issue/PR activity
├─ Language trends
├─ Dependencies
├─ Star growth
└─ Contributor count

Tools:
├─ GitHub API (free) - comprehensive data
├─ StarHistory - star growth charts
├─ Dependabot - dependency tracking
└─ Custom analytics - trends
```

---

### C. Content & SEO Monitoring

#### Blog & Content Strategy

```
Track:
├─ Publishing frequency (posts/month)
├─ Content types (tutorials, case studies, thought leadership)
├─ Average post length
├─ Topics covered
├─ Update frequency (new vs updated)
├─ Author diversity
└─ Engagement metrics

Analysis:
├─ Content gap analysis (what they cover you don't)
├─ Keyword targeting strategy
├─ Authority building
└─ Thought leadership positioning
```

#### SEO Performance

```
Using Semrush:
├─ Top organic keywords (volume, position, traffic)
├─ Keyword growth (new rankings)
├─ Traffic estimation
├─ Backlink profile
├─ Content opportunities
└─ Feature rich snippets

Track Over Time:
├─ Keyword ranking movements
├─ New content targeting
├─ Traffic growth/decline
├─ Competitive positioning
└─ Market opportunities
```

---

## Data Schema

### PostgreSQL Structure

```sql
-- Core Tables

competitors (
  id,
  name,
  category (tier 1-5),
  website_url,
  founded_year,
  funding_status,
  team_size,
  market_position,
  created_at,
  updated_at
)

competitor_metrics (
  id,
  competitor_id,
  metric_date,
  website_traffic, -- from SimilarWeb
  organic_keywords, -- from Semrush
  github_stars, -- from GitHub API
  social_followers, -- aggregated
  content_pieces, -- blog posts
  employee_count, -- LinkedIn
  metric_source, -- API used
  confidence_score
)

website_snapshots (
  id,
  competitor_id,
  snapshot_date,
  screenshot_url, -- S3 path
  homepage_text,
  pricing_extracted,
  features_extracted,
  ctas_found,
  page_load_time,
  status_code
)

social_posts (
  id,
  competitor_id,
  platform, -- twitter, linkedin, github
  post_id,
  posted_date,
  content,
  engagement_metrics,
  sentiment,
  themes (array)
)

content_pieces (
  id,
  competitor_id,
  url,
  title,
  published_date,
  updated_date,
  content_type, -- blog, case study, doc, etc
  topics (array),
  word_count,
  keyword_targets
)

intelligence_reports (
  id,
  competitor_id,
  report_date,
  significant_changes (array),
  positioning_analysis,
  marketing_strategy,
  ai_insights,
  recommendations,
  generated_by -- claude
)

-- Query Tables (for performance)

competitor_comparison (
  competitor_a_id,
  competitor_b_id,
  metric_name,
  value_a,
  value_b,
  last_updated
)

market_positioning (
  competitor_id,
  positioning_statement,
  key_differentiators (array),
  target_audience,
  pricing_strategy,
  confidence_score,
  updated_at
)
```

---

## Processing Pipeline

### Daily Workflow

```
0. Trigger: Scheduler (0:00 UTC)

1. Data Collection (15-30 mins)
   ├─ API pulls: SimilarWeb, GitHub, social
   ├─ Playwright: Screenshot 20 competitor homepages
   ├─ Parse: DOM extraction for pricing/features
   └─ Store: Raw data to S3/database

2. Change Detection (10-20 mins)
   ├─ Compare: Screenshots to previous day
   ├─ Visual diff: Find changes
   ├─ DOM diff: Extract specific changes
   ├─ Alert: If significance > threshold
   └─ Store: Change records

3. Preprocessing (10 mins)
   ├─ Normalize: Data format consistency
   ├─ Validate: Data quality checks
   ├─ Enrich: Add timestamps, sources
   └─ Index: Prepare for storage

4. Storage (5-10 mins)
   ├─ TimescaleDB: Metrics
   ├─ Weaviate: Document embeddings
   ├─ PostgreSQL: Metadata
   └─ S3: Screenshots/archives

5. Analysis Triggers (30 mins, off-peak)
   ├─ Significant changes: Claude analysis
   ├─ Alerts: Slack notifications
   ├─ Trending: Identify major news
   └─ Comparisons: Multi-competitor analysis

Total Daily Time: ~60-90 minutes
```

### Weekly Workflow

```
Trigger: Sunday 18:00 UTC

1. Comprehensive Data Pull
   ├─ Full Semrush analysis (keywords, backlinks, content)
   ├─ Ahrefs analysis (deep backlink, authority)
   ├─ SimilarWeb detailed report (geographies, channels)
   └─ Social media comprehensive audit

2. Deep Analysis
   ├─ Trend analysis (changes from last week)
   ├─ Positioning assessment
   ├─ Content strategy analysis
   ├─ Marketing activity summary
   └─ Competitive landscape update

3. Report Generation
   ├─ Weekly competitive summary
   ├─ Trend highlights
   ├─ Opportunities identified
   ├─ Action recommendations
   └─ Email/dashboard push

Total Time: ~120-180 minutes
```

### Monthly Workflow

```
Trigger: First Sunday of month, 18:00 UTC

1. Comprehensive Market Analysis
   ├─ Full competitive landscape reassessment
   ├─ New competitor discovery
   ├─ Tier reassessment
   ├─ Market opportunity analysis
   └─ Strategic positioning review

2. Intelligence Synthesis
   ├─ Trend analysis (month-over-month)
   ├─ Market shift identification
   ├─ Emerging strategies
   ├─ Best practices compilation
   └─ Threat/opportunity assessment

3. Strategic Report
   ├─ Market overview
   ├─ Competitive positioning matrix
   ├─ Marketing strategy recommendations
   ├─ Feature/product opportunities
   ├─ Content strategy insights
   └─ 90-day outlook

4. Executive Briefing
   ├─ Key findings summary
   ├─ Strategic recommendations
   ├─ Risk assessment
   └─ Opportunity prioritization
```

---

## Integration Points

### APIs to Integrate

#### Priority 1 (Essential)
- [ ] GitHub API (free tier sufficient)
- [ ] Playwright (open source)
- [ ] PostgreSQL (open source)
- [ ] Claude API (flexible pricing)

#### Priority 2 (High Value)
- [ ] SimilarWeb API (traffic intelligence)
- [ ] Semrush API (SEO intelligence)
- [ ] X/Twitter API (social monitoring)

#### Priority 3 (Nice-to-Have)
- [ ] Ahrefs API (deeper backlink analysis)
- [ ] Brandwatch (sentiment analysis)
- [ ] Perplexity API (real-time research)

#### Priority 4 (Future)
- [ ] Weaviate (vector database)
- [ ] TimescaleDB (time-series optimization)
- [ ] Grafana Cloud (managed dashboards)

---

## Tactical Deployment

### MVP (Weeks 1-4): Essential System

**Stack**:
```
Data Collection:
├─ Playwright (screenshots + DOM extraction)
├─ GitHub API (free)
├─ Manual API calls (curl/Python scripts)
└─ SimilarWeb free tier (if available)

Storage:
├─ PostgreSQL (self-hosted or cloud)
└─ S3/GCS (screenshots)

Analysis:
├─ Claude API (batch processing)
└─ Python scripts (data processing)

Monitoring:
├─ Cron jobs (scheduling)
└─ Slack notifications (alerts)

Cost**: $100-300/month (mainly API calls)
```

**Competitors to Track**: Top 10 direct competitors
**Monitoring Frequency**: Daily website, 2x/week deep dive
**Output**: Slack alerts + weekly summary reports

---

### Growth (Weeks 5-8): Intelligence System

**Add**:
```
Data Collection:
├─ Semrush API (high-value insights)
├─ Social media APIs (Twitter, LinkedIn)
└─ Perplexity API (real-time research)

Storage:
├─ Upgrade to TimescaleDB
├─ Add Weaviate for embeddings
└─ Expand S3 archival

Analysis:
├─ Advanced Claude prompts
├─ Automated report generation
└─ Semantic search on corpus

Monitoring:
├─ Grafana dashboards
├─ Automated daily reports
└─ Smart alerts (significance-based)

Cost**: $800-1500/month
```

**Competitors to Track**: 20-25 (all tiers)
**Monitoring Frequency**: Daily + weekly deep dive
**Output**: Grafana dashboards + weekly + monthly reports

---

### Scale (Months 3+): Full Intelligence Platform

**Add**:
```
Data Collection:
├─ Ahrefs API
├─ Brandwatch sentiment
├─ Additional platforms
└─ Custom data sources

Analysis:
├─ ML-based positioning detection
├─ Predictive trend analysis
├─ Automated strategy recommendation
└─ Market opportunity scoring

Outputs:
├─ Real-time competitive alerts
├─ Trend predictions
├─ Strategic recommendations
└─ Quarterly strategic briefings

Cost**: $2000-4000/month
```

---

## Implementation Roadmap

### Week 1-2: Setup & Planning
- [ ] Define OpenDash competitor universe (research: 2 days)
- [ ] Design data schema (engineering: 1 day)
- [ ] Set up PostgreSQL (ops: 1 day)
- [ ] Create competitor master list (product: 1 day)
- [ ] Acquire API credentials (ops: 1 day)

### Week 3-4: Automated Collection
- [ ] Build Playwright monitoring scripts (eng: 3 days)
- [ ] Build API integration layer (eng: 2 days)
- [ ] Set up screenshot storage (ops: 1 day)
- [ ] Create scheduled jobs (eng: 1 day)
- [ ] Initial data collection (ops: 1 day)

### Week 5-6: Processing & Analysis
- [ ] Claude API integration (eng: 2 days)
- [ ] Change detection logic (eng: 2 days)
- [ ] Significance scoring (eng: 1 day)
- [ ] Alert system setup (eng: 1 day)
- [ ] Initial analysis (product: 2 days)

### Week 7: Storage & Search
- [ ] TimescaleDB setup (ops: 1 day)
- [ ] Weaviate setup (ops: 1 day)
- [ ] Data ingestion pipeline (eng: 2 days)
- [ ] Semantic search (eng: 1 day)
- [ ] Testing & optimization (eng/qa: 1 day)

### Week 8+: Insights & Dashboards
- [ ] Grafana dashboard design (product: 2 days)
- [ ] Dashboard implementation (eng: 3 days)
- [ ] Report generation automation (eng: 2 days)
- [ ] Trend analysis (product: ongoing)
- [ ] Executive summary generation (product: ongoing)

**Total: ~80-100 hours engineering, ~40-60 hours product/research**

---

## Measuring Success

### KPIs

| Metric | Target | Timeline |
|--------|--------|----------|
| **Competitors Tracked** | 20+ | Week 4 |
| **Data Points Collected/Day** | 500+ | Week 8 |
| **Change Detection Accuracy** | >90% | Week 6 |
| **Insights Generated/Week** | 10+ | Week 8 |
| **Time to Insight** | <24 hours | Week 8 |
| **Marketing Strategy Impact** | Measurable improvements in: <br/>- Messaging clarity<br/>- Content strategy<br/>- Positioning | Weeks 12+ |

### Success Indicators

- ✅ Can answer "What did competitor X change?" within 24 hours
- ✅ Know competitive positioning across all major dimensions
- ✅ Identify market opportunities before competitors
- ✅ Generate weekly market intelligence for leadership
- ✅ Measurably improve OpenDash marketing based on intelligence

---

## Ethical Guidelines

### What's Allowed

✅ **Public Website Data**
- Scraping public website content
- Recording screenshots of public pages
- Analyzing public APIs

✅ **Public Social Media**
- Monitoring public posts
- Sentiment analysis
- Public account metrics

✅ **Public Data**
- GitHub public repositories
- Press releases
- News coverage
- SEC filings (public companies)

### What's NOT Allowed

❌ **Private/Confidential Data**
- Circumventing login walls
- Accessing private repositories
- Stealing trade secrets

❌ **Terms of Service Violations**
- Violating platform ToS
- Circumventing anti-bot measures
- Rate limit violations

❌ **Copyright Violations**
- Republishing competitor content
- Using screenshots without attribution
- Copying proprietary designs

### Best Practices

1. **Rate Limiting**: Scrape at human-like pace (~1-5 requests/minute)
2. **Respect robots.txt**: Honor robots.txt directives
3. **User-Agent**: Clearly identify as bot in requests
4. **Attribution**: Cite sources in reports
5. **Internal Use Only**: Keep analysis internal until public sharing approved
6. **Regular Review**: Ensure practices remain ethical and legal

---

## Tools Checklist

### Free/Open Source
- [ ] Playwright (web automation)
- [ ] PostgreSQL (database)
- [ ] GitHub API (free tier)
- [ ] Python/Node.js (data processing)
- [ ] Cron (scheduling)
- [ ] S3/GCS free tier (storage)
- [ ] Grafana (dashboards)

### Paid APIs (Recommended)
- [ ] SimilarWeb ($250-500/month) - Website traffic
- [ ] Semrush ($120-450/month) - SEO intelligence
- [ ] Claude API (pay-as-you-go) - Analysis

### Optional but Valuable
- [ ] X/Twitter API ($100-300/month) - Social monitoring
- [ ] LinkedIn API - (limited, approval needed)
- [ ] Ahrefs ($99-399/month) - Backlink analysis
- [ ] Perplexity API ($0.005 per query) - Real-time research

---

## Next Steps

1. **Immediate** (This week):
   - Define OpenDash competitor universe
   - List 10-20 primary competitors
   - Categorize by tier
   - Create master list

2. **Short-term** (Weeks 1-2):
   - Design PostgreSQL schema
   - Set up basic infrastructure
   - Acquire API credentials
   - Create monitoring plan

3. **Medium-term** (Weeks 3-8):
   - Build automated collection
   - Implement processing pipeline
   - Set up analysis system
   - Create dashboards

4. **Long-term** (Months 3+):
   - Refine intelligence system
   - Build predictive models
   - Generate strategic recommendations
   - Measure marketing impact

---

**Status**: Framework complete, ready for execution
**Next Document**: COMPETITOR-INTEL-OPERATIONS.md (detailed operational procedures)
**Review Date**: After Week 4 of deployment
