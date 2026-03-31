# OpenDash: Comprehensive Go-to-Market Strategy
## Executive Review of Opportunities, Blockers, and Leverage Points

**Date**: 2026-03-27
**Status**: Framework Ready for Execution Decision
**Audience**: Founder & stakeholders

---

## I. Strategic Position Summary

**Product**: "AI-powered operating dashboard for people who run things"

**Core Insight**: Solo founders and small operators (1-5 people) running SaaS/content businesses need a single view of their business metrics, replacing 8-12 daily tabs. Nobody serves this market segment for under $60/month.

**Architecture Advantage**:
- Scram Jet (zero marginal cost data pipelines)
- Composable components via Frontasy
- AI sidekick (cross-domain reasoning)
- Three-layer separation (data → reasoning → presentation)

**TAM**: $470K-$1.4M ARR year 1 (conservative 1-3% capture) → $2.3M-$4.7M at maturity (5-10% capture)

---

## II. Discovered Opportunities (by Source & Impact)

### **Tier 1: Immediate (Ship Weeks 1-12)**
These are validated market gaps, already researched, with clear demand signals.

| Opportunity | What It Is | Market Size | Competitive Gap | Effort | Impact |
|---|---|---|---|---|---|
| **Founder Morning Briefing MVP** | Stripe + uptime + GA + GitHub CI + daily email | $470K-$1.4M | +99% cheaper than competitors | LOW | CRITICAL |
| **Uptime Monitoring (Free Hook)** | Cron ping, alert if down, status page | $10.7B | Replaces UptimeRobot ($7-29/mo) | LOW | HIGH |
| **Feature-Page GTM (PostHog Model)** | `/uptime`, `/revenue`, `/seo`, etc. — each page = landing page + demo + blog + SEO keyword | N/A | +3x more long-tail SEO coverage than competitors | LOW | HIGH |
| **Daily AI Briefing (Retention Driver)** | "Here are the 3 things that matter today" | $100M+ market | +$70 cheaper than Ambient | MEDIUM | CRITICAL |
| **Revenue Metrics Dashboard** | Stripe → MRR, churn, LTV | Baremetrics market | +$20 cheaper | LOW | HIGH |
| **SEO Rank Tracking** | DataForSEO API → daily positions | $2-5B market | 10x cheaper than AccuRanker ($129/mo) | LOW | MEDIUM |

### **Tier 2: Phase 2 Expansion (Months 4-6)**
Validated demand; waiting for Phase 1 success before committing resources.

| Opportunity | What It Is | Market Size | Competitive Gap | Effort | Impact |
|---|---|---|---|---|---|
| **Observability (OTLP)** | Accept traces/logs, cross-domain correlation | $3.4B, 15.6% CAGR | Only dashboard combining infra + business metrics | MEDIUM | HIGH |
| **AI/LLM Cost Tracking** | Log API calls, show cost charts | $510M → $8.1B (32% CAGR) | Fastest-growing adjacent category, under-served | MEDIUM | MEDIUM |
| **Competitive Intelligence System** | SERP tracking, competitor domains, content monitoring | $20K+/yr (Crayon market) | $5.50/mo CF-native vs $500+/mo standalone | MEDIUM | MEDIUM |
| **B2B Expansion (Marketing Teams)** | Multi-brand, campaign metrics, alerts | $3x larger TAM than founders | SERP + anomaly detection not in Slack/Sunsama | MEDIUM-HIGH | CRITICAL |

### **Tier 3: Strategic Options (Months 7+)**
High leverage if combined with other elements; validate proof-of-concept first.

| Opportunity | What It Is | Leverage With | Blocker | Impact |
|---|---|---|---|---|
| **Dashboard Printer (50 ICPs)** | Zero-marginal-cost dashboard generation for any ICP | PostHog feature-page GTM | Frontasy engine completion | HIGH |
| **Board Agent Datasources** | CMO + CTO agents become OpenDash datasources | Atlas ecosystem | Board agent product maturity | MEDIUM |
| **Vertical Stacks** | "Revenue dashboard for SaaS founders," "GTM dashboard for agencies," etc. | Feature pages + B2B GTM | Customer feedback validation | MEDIUM |
| **White-Label / DaaS** | Agencies + platforms asking "can you build this for our customers?" | B2B GTM success | B2B traction first | HIGH |
| **Embedded SDK / Marketplace** | "Can we embed this in our app?" → monetization play | Platform partnerships | Early adopter validation | MEDIUM |

---

## III. Critical Blockers (What Prevents Execution)

### **Blocker 1: Product Clarity (RESOLVED)**
**Status**: ✅ RESOLVED in 2026-03-27 strategy docs
**What was blocking**: 5 competing internal narratives (dashboard printer vs. founder briefing vs. B2B intelligence vs. SaaS engine vs. Atlas interface) meant unfocused product work and mixed messaging.
**Resolution**: One coherent story — "operating dashboard for people who run things."
**Impact**: Unblocks all downstream work. Can proceed with confidence.

### **Blocker 2: Frontasy Engine Dependency (MEDIUM — 2-4 weeks)**
**What's blocking**:
- Composable dashboard components need Frontasy `@frontasy/composition`, `@frontasy/hooks`, `@frontasy/renderer`
- OpenDash can't ship D1-connected components (#126) until Frontasy Sprint 1 completes (#41-43)
- Current architecture has components with hardcoded layouts; AI generation can't work until components are truly headless

**Current state**: Frontasy is in parallel development (separate repo). OpenDash waiting for `@frontasy/*` packages.

**Mitigation**:
- **Short-term (Weeks 1-2)**: Ship Founder Morning Briefing MVP without composable components. Use hard-coded HUD layout (briefing + portfolio + chat).
- **Medium-term (Weeks 3-4)**: Integrate Frontasy packages when available. Refactor briefing view to use composable components.
- **Risk**: If Frontasy slips >4 weeks, AI composition stories (Phase 2) slip proportionally.

**Who owns it**: Frontasy team (parallel). OpenDash team blocks on integration, not development.

### **Blocker 3: AI Sidekick Complexity (MEDIUM — validation needed)**
**What's blocking**:
- Current architecture: Vercel AI SDK + assistant-ui + 20+ tools ✅ exists
- What's needed: Data-querying tools (revenue time series, error trends, SEO changes) + query classification + confirmation flows for write actions
- Risk: If AI quality is poor, retention driver (daily briefing) fails
- Question: How good does the briefing have to be to be a habit loop?

**Mitigation**:
- **MVP approach**: Ship with templated briefing (rules-based) + manual AI chat. Don't require AI to generate briefing automatically in week 1.
- **Validation approach**: Collect user data on what briefing items they actually read/act on. Iterate based on feedback.
- **Timeline**: Can add automated briefing generation in Phase 2 after validating the concept.

**Owner**: You (product/engineering judgment needed).

### **Blocker 4: MVP Scope (MEDIUM — design decision)**
**Current MVP scope** (from strategy docs):
- Stripe revenue metrics
- Uptime monitoring
- Status page
- GitHub CI status
- Google Analytics
- Daily email briefing

**Risk**: 6 integrations + briefing engine + email + UI = aggressive for solo founder week 1.

**Mitigation Options**:
1. **Scope-reduce MVP** (Recommended): Launch with Stripe + uptime + status page + daily briefing (4 integrations). Add GA + GitHub in week 2.
2. **Ship only briefing/dashboard**: Launch with dashboard first (no email), add email in week 2.
3. **Parallel work**: Pre-code integrations in week 0, ship scaffolding only in MVP.

**Owner**: You (resource/timeline decision).

### **Blocker 5: Data Collection (LOW — architectural, not technical)**
**What's blocking**:
- Scram Jet pipelines need to collect data from all 6 MVP datasources
- Current setup: metrics-collector Worker + D1 tables (exists)
- Question: Is auth/rate-limiting for Scram Jet webhooks already implemented?

**Mitigation**:
- Review `workers/metrics-collector/` + `src/server/auth.ts`
- If Scram Jet webhook auth is missing, add it (4 hours)
- Use IP whitelist + secret key pattern (already exists for CI)

**Owner**: You (quick code audit needed).

### **Blocker 6: Pricing Model Validation (MEDIUM — go/no-go decision)**
**Proposed pricing** (from strategy):
- Free: Uptime + status page (3 datasources)
- Pro: $29/mo (AI + briefing + all datasources)
- Business: $79/mo (team features)

**Risks**:
- Is $29/mo with no metered billing sustainable?
- Does $29/mo capture founders' willingness-to-pay?
- Do free users convert to paid (freemium model requires high conversion)?

**Mitigation**:
- **Validation plan**: Survey 10-20 users during weeks 1-2 (free signups) with: "Would you pay $29/mo?" + "What's missing?"
- **Pricing flexibility**: Keep pricing flexible. Can test $49/mo in week 6 cohort if week 2 feedback suggests premium positioning.
- **Fallback**: If $29/mo doesn't work, shift to free trial model (14 days unlimited, then $49/mo).

**Owner**: You (business decision with early user feedback).

---

## IV. Leverage Points (Highest ROI Actions)

### **Leverage 1: Zero-Marginal-Cost Datasources (2-4x ROI)**
**What**: Dashboard Printer model — each new datasource/ICP costs hours not weeks.

**Why it's leverage**:
- 1 datasource (YAML pipeline) = multiple landing pages + blog posts + demo videos
- 50 ICPs × 5 pages each = 250 SEO landing pages (organic growth engine)
- Each datasource serves 20+ different use cases

**How to execute**:
1. **Build 1 datasource + 1 landing page** (Stripe revenue, `/opendash.ai/revenue`)
2. **Document the template** (YAML pipeline template + landing page template)
3. **Repeat for 9 more datasources** over months 2-4
4. **Each new datasource unlocks**: +50 new SEO keywords, +1 demo video, +1 blog post

**Timeline**: 2 hours per datasource (after first one) = 20 hours to unlock 250 landing pages

**Owner**: You (leverage multiplier: 250x landing pages from 20 hours of work)

---

### **Leverage 2: Free Uptime Hook (5x user acquisition)**
**What**: Uptime monitoring (free tier) as acquisition funnel.

**Why it's leverage**:
- Free tier is valuable on its own (replaces UptimeRobot at $0 vs $7-29/mo)
- Low friction to sign up ("Get 50 free uptime checks")
- High conversion to paid (user gets value → sees other features → upgrades)
- Competitive advantage: nobody else packages uptime + revenue + observability at one price

**How to execute**:
1. **Marketing message**: "Free uptime monitoring for developers" (target HN, Dev.to, Twitter)
2. **Landing page**: `/opendash.ai/uptime` — show uptime check form + status page preview
3. **Sign-up flow**: Email → validate domain → get status page URL instantly
4. **Upsell trigger**: After 7 days, email: "Want to see your revenue + uptime together?"

**Timeline**: Week 2-3 (after MVP launch)

**Owner**: You + marketing (acquisition channel: organic + paid)

---

### **Leverage 3: Feature-Page SEO (3x organic traffic)**
**What**: PostHog model — each feature gets its own landing page.

**Why it's leverage**:
- Each feature targets different search intent and persona
- `/revenue` captures SaaS founder searches (high intent)
- `/seo` captures marketing manager searches (high intent)
- `/uptime` captures DevOps searches (high intent)
- Same product, 10x more entry points

**How to execute**:
1. **Create 6 feature landing pages** (weeks 4-8):
   - `/uptime` — "Free uptime monitoring"
   - `/revenue` — "SaaS metrics dashboard"
   - `/seo` — "Keyword rank tracker"
   - `/observability` — "Cloudflare Workers observability"
   - `/ai-costs` — "LLM cost tracking"
   - `/briefing` — "AI daily briefing for founders"

2. **SEO playbook for each**:
   - Target competitor keywords (e.g., "alternative to AccuRanker")
   - Write 500-word comparison + OpenDash explanation
   - Screenshot of that feature in action
   - CTA: "Try free" → signup

3. **Traffic estimate**:
   - Assuming 20 impressions/month per keyword for month 1
   - 6 pages × 50 keywords × 20 impressions = 6,000 impressions
   - 3-5% CTR (high-intent) = 180-300 signups

**Timeline**: 40 hours (week 4-8, 10 hours per page)

**Owner**: You (content + SEO)

---

### **Leverage 4: AI Sidekick (2x retention)**
**What**: Daily AI briefing + on-demand Q&A creates habit loop.

**Why it's leverage**:
- Ambient ($100/mo) proves email briefing drives retention
- OpenDash's data + AI reasoning = much better briefing
- Free/cheap models (Qwen 72B $0.001/query) make unit economics work
- Briefing opens daily email → reads dashboard → discovers other features

**How to execute**:
1. **MVP briefing** (rule-based, week 1):
   - "3 things that matter today" = top 3 metrics by change magnitude
   - Hand-coded logic: `if revenue_down > 20%, show it`
   - Template email: "Morning brief: Revenue is down, uptime is up, 3 new GitHub issues"

2. **Phase 2 briefing** (AI-generated, week 8):
   - Collect all metrics
   - Qwen 72B generates: "Here are your 3 biggest changes + why they might matter"
   - Cost: $0.001-0.003 per user per day = $0.03-0.09/user/month (negligible)

3. **On-demand chat** (always available):
   - User asks: "Why did revenue change?"
   - AI queries metrics + generates answer
   - User asks: "What should I do?"
   - AI suggests actions (draft social post, create GitHub issue, set alert)

**Timeline**: Week 1 (rule-based) + week 8 (AI) = phased

**Owner**: You (product + AI prompting)

---

### **Leverage 5: Board Agent Integration (1 customer = 10 use cases)**
**What**: CMO + CTO agents become datasources for OpenDash briefing.

**Why it's leverage**:
- CMO collects marketing metrics → feeds OpenDash → briefing shows marketing health
- CTO collects infrastructure metrics → feeds OpenDash → briefing shows tech health
- One user gets: revenue + uptime + errors + deployments + SEO all in one view
- Founder sees their entire operation (product, marketing, infra) in 5 minutes

**How to execute**:
1. **Wire Board agents to OpenDash metrics table** (week 10, 4 hours):
   - CMO.daily_metrics → push to OpenDash D1 `board_metrics` table
   - CTO.daily_metrics → push to OpenDash D1 `board_metrics` table
   - Subscribe to updates via HudSocket

2. **Add Board agent insights to briefing**:
   - "Marketing insight: Content engagement down 15%, here's why"
   - "Infrastructure: P99 latency up, caused by new feature X"
   - "Product: 3 critical bugs filed, 1 already resolved"

3. **User experience**:
   - Founder opens OpenDash
   - Sees board agents' daily reasoning + their business metrics
   - Makes decisions faster (10 min instead of 60)

**Timeline**: Phase 3 (after both systems proven)

**Owner**: You + Atlas team (dependency on Board agent maturity)

---

### **Leverage 6: B2B Expansion (4x TAM, 10x LTV)**
**What**: Shift from founder market ($470K-$1.4M TAM) to marketing teams/agencies ($2M+ TAM, 5x larger).

**Why it's leverage**:
- Marketing teams have budgets (vs. founders' personal credit cards)
- Competitive intelligence (SERP tracking + competitor monitoring) = must-have for agencies
- Team features + RBAC drive higher LTV ($79-500/mo vs $29/mo)
- B2B GTM is teachable (vs. consumer GTM being unpredictable)

**How to execute** (per EPIC #27):
1. **Phase 1 (Weeks 1-2)**: Build org/team/RBAC architecture (12 hours)
2. **Phase 2 (Weeks 3-4)**: Add SERP + competitor datasources (20 hours)
3. **Phase 3 (Weeks 5-6)**: Add campaign metrics + alerts (20 hours)
4. **Phase 4 (Weeks 7-8)**: AI competitive analysis + billing (20 hours)
5. **Phase 5 (Weeks 9-12)**: Security audit + ProductHunt + GTM (40 hours)

**Expected outcome**: 20 paying teams, $2-3K MRR by week 12 (validation), $72K MRR by week 26 (scale)

**Timeline**: 12 weeks (parallel with founder market scaling)

**Owner**: You (but decide founder vs. B2B sequencing first)

---

## V. Core Tension: Founder MVP vs. B2B Platform

**Two plausible paths diverge:**

### **Path A: Founder First (Lower Risk, Slower Scale)**
- **Weeks 1-6**: Build + validate founder MVP (uptime + revenue + briefing)
- **Weeks 7-12**: Expand to AI analytics (charting, NLQ, anomaly detection)
- **Weeks 13+**: B2B pivot (when founder market validated)
- **Pros**:
  - Lower technical risk (start narrow, expand)
  - Easier to validate product/market fit (founders are loud, give good feedback)
  - Sustainable: 50+ founder users = $1.4K MRR baseline
- **Cons**:
  - B2B TAM is 5x larger (opportunity cost)
  - Slower to profitability (months 5-6 vs. 3-4)
  - May miss B2B-specific features that early users need

### **Path B: B2B Intelligence First (Higher Risk, Faster Scale)**
- **Weeks 1-12**: Build B2B MVP (org/RBAC + SERP + competitor dashboard + billing)
- **Weeks 13+**: Add founder features (observability, AI costs)
- **Skip founder-only features**: No founder briefing focus, position as "for teams"
- **Pros**:
  - 5x larger TAM
  - Faster profitability (teams have budgets)
  - Competitive intelligence = defensible moat
- **Cons**:
  - Higher technical scope (org/RBAC is complex)
  - Higher GTM complexity (B2B sales motion, longer sales cycle)
  - Higher risk of feature creep

### **Path C: Dual Track (Ambitious, Requires Ruthless Scope)**
- **Weeks 1-2**: Founder briefing MVP (4 integrations, no teams)
- **Weeks 3-4**: Add org/RBAC + SERP (B2B foundation)
- **Weeks 5-12**: Expand both tracks in parallel
  - Founder track: Add observability + AI costs + charting
  - B2B track: Add campaigns + alerts + competitive intelligence
- **Outcome by week 12**:
  - Founder market: 100+ users, $500-2K MRR
  - B2B market: 5-10 paying teams, $1.5-3K MRR
  - Total: $2-5K MRR, 100+ total users
- **Pros**:
  - Hedge bets (don't over-commit to one market)
  - Founder users validate building blocks (uptime, revenue, briefing)
  - B2B users validate enterprise features (RBAC, alerts, competitive intel)
  - Faster to $5K MRR
- **Cons**:
  - 2 marketing motions (founder + B2B)
  - Risk of compromising both (trying to please everyone)
  - Requires disciplined scope management

---

## VI. Recommended Go-to-Market Strategy (Sequenced)

### **Decision: Founder First, B2B Second, Unified After**
(Rationale: Lower risk, faster feedback loops, B2B foundation ready to execute when founder traction proves concept)

### **Phase 1: Founder MVP Launch (Weeks 1-2)**
**Goal**: 50 beta signups, 20+ daily active users, validate product-market fit basics

**MVP Scope** (reduced from 6 to 4 integrations):
- Stripe revenue (MRR, churn, LTV)
- Uptime monitoring (cron + alerts)
- Status page (public health)
- Daily email briefing (rule-based, no AI)

**NOT in MVP**: GitHub CI, GA, email filtering, AI reasoning

**Execution**:
1. Pre-build Scram Jet pipelines for Stripe + uptime (week 0)
2. Deploy + auth + landing page (week 1)
3. Launch on HN + Twitter + ProductHunt (week 1, day 3)
4. First 20 users (weeks 1-2)
5. Email outreach to 20 founder friends (week 2)

**GTM**:
- HN: "I built a free uptime monitor + revenue dashboard for founders"
- Twitter: "Tired of 8 tabs? Try this instead" (link to `/opendash.ai`)
- Landing page copy: "See your entire business in one place. 5-minute setup."

**Success metrics**:
- 50+ signups by end of week 2
- 20+ daily active by end of week 2
- 0 critical bugs
- First 5 paid (can be discounted/free trials)

**Owner**: You

---

### **Phase 2: Founder Validation + MVP Expansion (Weeks 3-6)**
**Goal**: 100+ users, 30+ weekly active, clear product feedback, <10% churn, NPS >40

**Execution**:
1. **Week 3**: Add Google Analytics (4 hours), GitHub CI (4 hours)
2. **Week 4**: Improve onboarding (4 hours), add Slack/Discord notifications (4 hours)
3. **Week 5**: Mobile responsiveness (4 hours), user feedback loops (4 hours)
4. **Week 6**: Polish + fix bugs from user feedback

**GTM**:
- Community engagement: Reply to all HN/Twitter comments
- Founder interviews: 5-10 video calls with active users
  - "What would make you use this daily?"
  - "What's missing?"
  - "Would you pay?"
- Content: 1-2 blog posts
  - "Morning routine for busy founders"
  - "How I manage 5 projects at once"

**Success metrics**:
- 100+ total users
- 30+ weekly active
- <10% weekly churn
- NPS >40
- 5-10 paying users (any amount)
- 3+ clear feature requests

**Owner**: You

---

### **Phase 3: AI Analytics Foundation (Weeks 7-12)**
**Goal**: Validate AI briefing as retention driver, expand datasources, reach $2-5K MRR

**Execution**:
1. **Weeks 7-8**:
   - Implement rule-based briefing → upgrade to Qwen 72B AI briefing
   - Build charting infrastructure (Recharts)
   - NLQ (natural language queries): "Show me revenue by customer"
   - Anomaly detection: flag unusual metrics
   - Add 2-3 new datasources (Plausible, Uptime Kuma, custom API)

2. **Weeks 9-10**:
   - Build feature landing pages (`/revenue`, `/seo`, `/uptime`, etc.)
   - SEO optimization
   - Case studies from early customers

3. **Weeks 11-12**:
   - Polish product
   - Prepare B2B roadmap
   - Document competitive intelligence implementation plan

**GTM**:
- Content: Feature pages drive organic traffic
- Expansion targeting: Reach out to growth/RevOps/product leaders
  - "You've used the founder briefing. Now try custom dashboards."
- Webinars/demos: Show charting + NLQ capability

**Success metrics**:
- 300+ total users
- 80+ weekly active (25%+ conversion)
- 20-30 paying users
- $2-5K MRR
- <5% weekly churn on paid
- 10,000+ organic impressions

**Owner**: You

---

### **Phase 4: B2B Intelligence Launch (Weeks 13-24)**
**Goal**: Validate B2B market, reach $2-3K MRR from teams, prove competitive intelligence moat

**Execution** (from EPIC #27, adapted):
1. **Weeks 13-14**:
   - Implement org/team/RBAC architecture
   - Multi-brand briefing for team view
   - Billing system

2. **Weeks 15-16**:
   - SERP tracker datasource (DataForSEO)
   - Competitor monitoring (content, social, domains)
   - Competitor dashboard

3. **Weeks 17-18**:
   - Campaign metrics (Google Ads, Meta Ads, email, GA4)
   - Alert system (Slack, email, in-app)

4. **Weeks 19-20**:
   - AI competitive analysis (LLM reasoning)
   - Security audit, performance testing

5. **Weeks 21-24**:
   - ProductHunt B2B launch
   - Direct outreach to warm leads
   - Email + LinkedIn campaigns
   - First customer onboarding

**GTM**:
- Positioning: "Operating dashboard for marketing teams and agencies"
- Differentiation: Only product combining revenue + competitive intelligence + campaign metrics
- ICP: Marketing managers, RevOps leads, agency owners (1-20 person teams)
- Channel: ProductHunt, direct outreach, LinkedIn
- Proof: Case studies from founder market (founders who hired teams)

**Success metrics**:
- 50+ B2B free trial signups
- 5-10 paying B2B customers
- 80%+ trial-to-paid conversion
- $2-3K MRR from B2B
- NPS >40

**Owner**: You + contractor/hire if funds allow

---

### **Phase 5: Unified Scale (Months 7+)**
**Goal**: Converge founder + B2B markets, reach $10-20K MRR

**Execution**:
- Both products use same infrastructure, same datasources
- Founder features (briefing, charting) are table stakes
- B2B features (competitive intelligence, alerts) are premium
- Pricing reflects usage tier (solo founder vs. team)

**GTM**:
- Product-led growth: free tier → Pro tier → Business tier
- Founder-to-team expansion: existing founders hire employees
- Partnerships: Zapier, Make integrations
- Affiliate program: Send friends → earn 20% of their MRR

**Success metrics**:
- 500+ total users (founder + B2B combined)
- $10-20K MRR
- <3% monthly churn
- 50+ actively paying customers
- Net revenue retention >120% (expansion revenue)

---

## VII. Execution Checklist (Next 2 Weeks)

### **Week 0 (Right Now)**

**Decisions** (8 hours):
- [ ] Choose Path A (Founder first) vs. Path B (B2B first) vs. Path C (Dual track)
- [ ] Decide MVP scope (4 integrations vs. 6 vs. 2)
- [ ] Choose pricing model validation approach
- [ ] Assign owner for each phase
- [ ] Create 90-day calendar (weeks + milestones)

**Unblock Dependencies** (12 hours):
- [ ] Audit Scram Jet webhook auth security (4 hours)
- [ ] Check Frontasy progress + integration timeline (2 hours)
- [ ] Validate D1 schema for metrics collection (2 hours)
- [ ] Test current auth/RBAC baseline (2 hours)
- [ ] Decide: rules-based vs. AI briefing in MVP (2 hours)

**Prepare Launch** (10 hours):
- [ ] Create landing page copy (`/opendash.ai`) (4 hours)
- [ ] Design MVP HUD layout mockups (2 hours)
- [ ] Plan email sequences for signups (2 hours)
- [ ] Set up Stripe test environment (2 hours)

### **Week 1 (MVP Build)**

**Code** (30 hours):
- [ ] Auth (Clerk) + dashboard routes
- [ ] Stripe datasource (fetch MRR, churn, LTV)
- [ ] Uptime datasource (cron + check + alert)
- [ ] Status page (public dashboard)
- [ ] Daily email briefing (rule-based rules)

**Infrastructure** (10 hours):
- [ ] Deploy to opendash.ai domain
- [ ] Wire Scram Jet webhooks
- [ ] Test end-to-end (signup → briefing email)
- [ ] Set up monitoring + Sentry

### **Week 2 (Launch + First Users)**

**GTM** (20 hours):
- [ ] ProductHunt post + discussion engagement
- [ ] HN post + community comments
- [ ] Twitter thread + follow-up engagement
- [ ] Email outreach to 20 warm leads
- [ ] Landing page optimization based on feedback

**Product** (20 hours):
- [ ] Collect user feedback (Slack channel, email surveys)
- [ ] Fix critical bugs
- [ ] Document setup process (guides, videos)
- [ ] Plan Week 3-6 feature additions

---

## VIII. Resource & Dependency Summary

### **Solo Founder Workload**

| Phase | Weeks | Hours/Week | FTE Equivalent | Constraint |
|-------|-------|-----------|---|---|
| MVP | 1-2 | 40 | 1.0 | Full focus: MVP + launch |
| Validation | 3-6 | 40 | 1.0 | 60% product, 40% GTM |
| AI/Analytics | 7-12 | 50 | 1.25 | Product-heavy, GTM pauses |
| B2B/Scale | 13-24 | 50-60 | 1.25-1.5 | **Hire contractor/co-founder** |

**Recommendation**: Hire contractor or co-founder by week 7 if founder market shows traction (>$1K MRR). Aim for 2-person team before B2B GTM (weeks 13+).

### **Key Dependencies**

| Blocker | Owner | Timeline | Impact |
|---------|-------|----------|--------|
| Frontasy engine (@frontasy/* packages) | Frontasy team | Weeks 3-6 | Blocks composable components (Phase 2) |
| Scram Jet webhook auth | You | Week 0 | Blocks MVP (4 hours to fix) |
| Stripe API integration | You | Week 1 | Blocks MVP (4 hours) |
| Clerk setup | You | Week 1 | Blocks MVP (2 hours) |
| DataForSEO API (B2B phase) | You | Week 15 | Blocks competitive intelligence |
| B2B landing page + copy | You | Week 21 | Blocks B2B GTM |

---

## IX. Success Metrics & Go/No-Go Gates

### **Gate 1: MVP Viability (Week 2)**
**Criteria**:
- 50+ signups ✓
- 20+ daily active users ✓
- 0 critical bugs ✓
- $0-200 MRR ✓

**Decision**:
- GO → Proceed to Phase 2 (Founder Validation)
- NO-GO → Pivot approach (scope, positioning, or pricing)

---

### **Gate 2: Founder Market Fit (Week 6)**
**Criteria**:
- 100+ total users
- 30+ weekly active (30% conversion)
- NPS >40
- <10% weekly churn
- 5+ paying users

**Decision**:
- GO → Proceed to Phase 3 (AI Analytics)
- NO-GO → Return to MVP (repositioning or features)
- CONDITIONAL-GO → Proceed but reduce scope (B2B might be more promising)

---

### **Gate 3: AI Analytics Validation (Week 12)**
**Criteria**:
- 300+ total users
- 80+ weekly active
- 20+ paying users
- $2-5K MRR
- <5% churn on paid

**Decision**:
- GO → Proceed to Phase 4 (B2B Launch)
- CONDITIONAL-GO → Proceed but B2B as experimental (week 13 parallel track)
- NO-GO → Pivot to B2B-only (founder market not sustainable)

---

### **Gate 4: B2B Market Fit (Week 24)**
**Criteria**:
- 5-10 paying B2B customers
- 80%+ trial-to-paid conversion
- $2-3K MRR from B2B
- NPS >40

**Decision**:
- GO → Scale both markets (Month 7+)
- CONDITIONAL-GO → B2B is viable but harder than founder. Adjust GTM.
- NO-GO → Double down on founder market (B2B can wait)

---

## X. Competitive Differentiation (Why We Win)

### **Founder Market**
| Competitor | Price | Features | OpenDash Advantage |
|-----------|-------|----------|-------------------|
| **UptimeRobot** | $7/mo | Uptime only | +revenue, +briefing, +observability, +AI |
| **Baremetrics** | $49/mo | Revenue only | +uptime, +SEO, +observability, +briefing |
| **PostHog** | Free-$450/mo | Product analytics | We focus on ops, not user behavior. Cheaper for founders. |
| **Ambient** | $100/mo | AI briefing only | +business metrics, +uptime, +tech health, 3x cheaper |
| **None** | N/A | Uptime + revenue + SEO + observability + briefing | **OpenDash only (defensible 12-month gap)** |

### **B2B Market**
| Competitor | Price | Features | OpenDash Advantage |
|-----------|-------|----------|-------------------|
| **Slack** | $8-15/user/mo | Team chat | OpenDash adds competitive intelligence, custom dashboards |
| **Sunsama** | $16/user/mo | Daily agenda | OpenDash adds campaign metrics, SERP tracking, alerts |
| **Databox** | $149/mo | Custom dashboards | We add competitive intelligence, 40% cheaper, easier setup |
| **Crayon** | $20K+/yr | Competitive intelligence | We combine with operational metrics, 20x cheaper |
| **PostHog** | $450/mo | Product analytics + session replay | We focus on competitive + operational. Better price. |
| **None** | N/A | Competitive intelligence + operational metrics + campaigns | **OpenDash only (defensible 12-month gap)** |

---

## XI. Next Actions (By Owner)

### **For Founder (You)**
1. **Decide**: Founder first (Path A) vs. B2B first (Path B) vs. Dual (Path C)
2. **Scope**: 4-integration MVP vs. 6-integration MVP?
3. **Timeline**: Commit to 90-day calendar
4. **Resources**: Solo for 12 weeks, then hire?
5. **Unblock**: Audit dependencies (Scram Jet, Frontasy, D1)

### **For Stakeholders/Advisors**
1. **Provide feedback**: Which path resonates? Are blockers realistic?
2. **Help with Phase 1 GTM**: Intro to founder friends, HN connections, ProductHunt support?
3. **Help with Phase 4 GTM** (month 4+): Intro to marketing teams, agencies, RevOps leads?

### **For Atlas Team** (if coordinating)
1. **Frontasy timeline**: When will `@frontasy/*` packages be ready?
2. **Board agent maturity**: When can CMO/CTO feed metrics to OpenDash?
3. **Coordination**: How do we launch AtlasxOpenDash integration by Phase 5?

---

## XII. Appendix: Financial Projections

### **Conservative Path (Founder First)**

| Metric | Week 6 | Week 12 | Week 24 | Week 52 |
|--------|--------|---------|---------|---------|
| Total Users | 100 | 300 | 500+ | 1,200+ |
| Paying Users | 5 | 25 | 50-60 | 150-200 |
| MRR | $150 | $2-5K | $5-10K | $15-25K |
| ARR | $1,800 | $24-60K | $60-120K | $180-300K |
| CAC | $50 | $40 | $30 | $25 |
| LTV (24 mo) | $700 | $1,200 | $1,500 | $2,000+ |

### **Aggressive Path (B2B First)**

| Metric | Week 12 | Week 24 | Week 52 |
|--------|---------|---------|---------|
| B2B Paying Teams | 3-5 | 10-15 | 30-50 |
| B2B MRR | $1-3K | $5-10K | $15-25K |
| Founder Users (secondary) | 0 | 50+ | 200+ |
| Total MRR | $1-3K | $7-12K | $20-30K |

### **Unit Economics** (Pro Tier, $29/mo)

- **LTV** (24 month horizon, $29/mo, 10% churn): ~$700
- **CAC** (organic traffic, $50 per early user): $50
- **Payback period**: 1.7 months ✓ (healthy)
- **Gross margin** (AI costs $2-5/mo, infrastructure $1-2/mo): 75-80%
- **Magic number** (MRR growth / spend): TBD (need GTM spend data)

---

## XIII. Final Recommendation

**Choose Path A (Founder First)**

**Rationale**:
1. **Lower risk**: Validate core product (metrics dashboard + briefing) before expanding to teams
2. **Faster feedback**: Founders are vocal, give honest feedback
3. **Sustainable baseline**: 50+ founder users = $1.4K MRR runway
4. **B2B foundation ready**: Can execute EPIC #27 weeks 13-24 with confidence
5. **Technology ready**: All dependencies (Scram Jet, D1, auth, briefing) exist or are 4-hour fixes
6. **Defensible moat**: Nobody bundles these features at this price; 12-month gap before competitors catch up

**Timeline**:
- Weeks 1-2: MVP launch (50 users)
- Weeks 3-6: Validation (100+ users, $150-500 MRR)
- Weeks 7-12: AI analytics (300+ users, $2-5K MRR)
- Weeks 13-24: B2B launch (50-60 total paying users, $5-10K MRR)
- Weeks 25+: Scale both markets (profitability by month 6-8)

**Hiring Plan**:
- Weeks 1-12: Solo founder
- Weeks 13-24: Hire 1 contractor (GTM support) + 1 engineer (product development)
- Week 25+: Grow to 2-3 person team

**Capital Required**: $0 to launch, $5-10K/mo to operate (infrastructure + AI costs), $30-50K/mo for hiring (week 13+)

---

**Status**: Ready for execution
**Owner**: You (founder)
**Next meeting**: Week 0 decision day (Friday)
**Timeline**: MVP launch by end of week 1

