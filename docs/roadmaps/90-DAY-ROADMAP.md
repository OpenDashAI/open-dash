# OpenDash 90-Day Roadmap: Founder Briefing → AI Analytics SaaS

**Strategy**: Launch as founder morning briefing (MVP, niche), then expand to AI analytics SaaS (GTM teams, larger TAM).

**Goal**: $10k-20k MRR by end of Q2 2026 with 50-100 paying users.

---

## Phase Breakdown

| Phase | Duration | Focus | Success Metrics |
|-------|----------|-------|-----------------|
| **MVP Launch** | Weeks 1-2 | Auth + deploy + first users | 50 beta signups, 20+ daily active |
| **Founder Validation** | Weeks 3-6 | Gather feedback, improve briefing UX | 30+ weekly actives, <10% churn, NPS >40 |
| **AI Analytics Foundation** | Weeks 7-12 | Add charting, NLQ, anomaly detection | 100+ signups, $2-5k MRR, expand to GTM use cases |
| **Scale & Iterate** | Weeks 13+ | Expand datasources, team features, pricing | $10-20k MRR, 50-100 paying users |

---

## Week 1-2: MVP Launch (Founder Briefing)

### What Ships
- ✅ Basic auth (Clerk or Cloudflare Access)
- ✅ Morning Briefing route (`/`) working end-to-end
- ✅ Portfolio Overview route (`/brands`)
- ✅ Deploy to opendash.ai domain
- ✅ Basic monitoring (Sentry)

### Work Items
1. **Auth setup** (2-4 hours)
   - Choice: Clerk (richer, more features) vs. Cloudflare Access (simpler)
   - Recommendation: Clerk (better DX, built-in email/password, future teams)
   - Implement: Protect `/` and `/brands` routes behind login

2. **Deployment** (1-2 hours)
   - Update `wrangler.jsonc` with domain + environment
   - Create Cloudflare Worker
   - Point DNS to CF
   - Test in production

3. **Monitoring** (1-2 hours)
   - Set up Sentry for error tracking
   - Add basic Cloudflare Analytics

4. **Landing page** (2-4 hours)
   - One-page site at `/landing` or external site
   - CTAs: "Try free" → signup
   - Shows Morning Briefing + Portfolio Overview screenshots
   - Founder-focused copy ("see all your projects in 5 minutes")

5. **Email + onboarding** (2-3 hours)
   - Welcome email after signup
   - Onboarding flow: select datasources, configure YAML
   - Walkthrough video (Loom or similar)

### Go-to-Market (Weeks 1-2)
- **Announce** on HN, Twitter, Product Hunt
- **Reach out** to 10-20 founder friends with direct invites
- **Early tester signup form**: "Get early access"

### Success Criteria
- 50+ beta signups
- 20+ daily active users
- 0 critical bugs in production

---

## Week 3-6: Founder Validation

### What Ships
- ✅ User feedback integration (in-app survey or Slack)
- ✅ Config UI improvement (easier to set up datasources)
- ✅ Slack/Discord notifications (brief tells you new high-priority items)
- ✅ Mobile-friendly briefing layout
- ✅ Improved chat with contextual actions

### Work Items
1. **Improve onboarding** (4-6 hours)
   - Reduce time-to-first-dashboard from 15 min → 5 min
   - Pre-fill common config (GitHub repo guessing, etc.)
   - Add "templates" (e.g., "SaaS GTM," "Content Creator")

2. **Notifications** (4-6 hours)
   - Slack integration: send daily briefing summary
   - Discord webhook for high-priority items
   - Email digest (daily or on-demand)

3. **Mobile UX** (4-6 hours)
   - Make three-panel layout responsive
   - Mobile: full-width center panel, toggle left/right
   - Test on iPhone/Android

4. **Feedback loops** (2-4 hours)
   - Add in-app NPS survey (Typeform embed)
   - Email survey: "What's missing?"
   - Set up feedback form (or use Slack/Discord channel)

5. **Documentation** (4-6 hours)
   - How-to guides (getting started, configuring datasources, understanding briefing)
   - Video walkthrough (5 min setup)
   - FAQ on common config issues

### Go-to-Market (Weeks 3-6)
- **Community engagement**: Reply to every HN/Twitter comment
- **Founder interviews**: 5-10 video calls with active users
  - Questions: "What would make you use this daily?" "What's missing?" "Would you pay?"
- **Content**: 1-2 blog posts on "morning routine for founders" or "managing 5 projects"

### Success Criteria
- 30+ weekly active users
- <10% weekly churn
- NPS >40
- 5+ paid subscriptions (even if discounted/free trials)
- Clear feedback on what to build next

---

## Week 7-12: AI Analytics Foundation

### What Ships
- ✅ Charting library (Recharts) + chart cards
- ✅ Natural language query (NLQ): "show me revenue by customer" → auto-generate chart
- ✅ Anomaly detection: AI highlights unusual metrics
- ✅ Revenue expansion: Team plan, higher datasource limits
- ✅ 6 more datasources (to 12 total): Plausible, Uptime Kuma, SendGrid, YouTube Analytics, Substack, custom API

### Work Items

#### A. Charting Layer (4-6 weeks, 40-60 hours)
1. **Add Recharts** (2-3 hours)
   - Install, test with sample data
   - Create LineChart, BarChart, PieChart card types

2. **Chart spec builder** (8-12 hours)
   - Input: raw data + user intent ("revenue over time")
   - Output: Recharts component spec JSON
   - Method: Use Claude API (or Anthropic SDK) to:
     ```
     "Given this data structure and user query, generate a chart spec."
     ```
   - Cache specs in D1 to reduce API calls

3. **Dashboard builder** (8-12 hours)
   - UI: "Add chart" → select datasource + query
   - Save chart configs to user dashboard
   - Render dashboard with multiple charts
   - Drag-to-reorder (simple, no complex grid)

4. **Testing** (4-6 hours)
   - Unit tests for chart generation logic
   - E2E: user creates chart, saves, reloads

#### B. NLQ (Natural Language Queries) (3-4 weeks, 30-40 hours)
1. **Data sampling & schema** (4-6 hours)
   - When user selects a datasource, sample 100 rows
   - Generate JSON schema of columns + types
   - Cache this schema

2. **NLQ prompt builder** (4-6 hours)
   - System prompt: "Convert user query into data operation"
   - Example:
     ```
     User: "Show me revenue by customer type"
     Context: [data schema from above]
     Output: {
       "operation": "group_by",
       "field": "customer_type",
       "aggregate": "sum(revenue)",
       "sort": "desc"
     }
     ```
   - Use Claude API with JSON mode for reliable output

3. **Query execution** (6-8 hours)
   - Parse LLM output
   - Execute operation on datasource data
   - Return results + chart spec

4. **UI for NLQ** (4-6 hours)
   - Chat-style interface: "Ask your data"
   - Query history + saved queries
   - One-click export to dashboard chart

#### C. Anomaly Detection (2-3 weeks, 20-30 hours)
1. **Time-series analysis** (6-8 hours)
   - For each metric (revenue, deploys, issues, etc.):
     - Compute 7-day moving average
     - Flag if current value deviates >2 standard deviations
   - Use Claude to summarize anomalies in plain English

2. **Briefing integration** (4-6 hours)
   - Add anomaly cards to morning briefing
   - "Revenue down 30% vs. 7-day avg" with explanation
   - Alert severity (low/medium/high)

3. **Testing** (4-6 hours)
   - Inject synthetic anomalies, verify detection
   - Manual review of real anomalies (first 2 weeks)

#### D. Datasource Expansion (3-4 weeks, 30-40 hours)
Add 6 new datasources in parallel:

1. **Plausible Analytics** (4-6 hours)
   - Fetch page views, bounce rate, top pages
   - Config: site_id (from YAML)

2. **Uptime Kuma** (4-6 hours)
   - Fetch monitor status, uptime %
   - Config: api_url + api_key

3. **SendGrid** (4-6 hours)
   - Fetch email stats (sent, open rate, bounce rate)
   - Config: api_key

4. **YouTube Analytics** (4-6 hours)
   - Fetch channel stats (views, subs, watch time)
   - Config: channel_id + api_key

5. **Substack Analytics** (4-6 hours)
   - Fetch subscriber count, open rate, revenue
   - Config: publication_id + api_key

6. **Custom API** (4-6 hours)
   - Generic HTTP datasource
   - Config: url + auth header
   - Parse JSON response

#### E. Product/Pricing Updates (2 weeks, 20 hours)
1. **Team plan** (4-6 hours)
   - Multiple users per org
   - Shared dashboards, role-based access
   - Invite UI

2. **Tier updates** (2-4 hours)
   - Free: 2 datasources, 100 API calls/mo
   - Pro ($49/mo): 6 datasources, 5k API calls/mo, basic charts
   - Team ($199/mo): 12 datasources, 20k API calls/mo, NLQ + anomaly detection
   - Business ($499+/mo): all features, white-label, custom integrations

3. **Billing implementation** (6-8 hours)
   - Stripe integration (if not done in MVP)
   - Usage tracking (API calls, datasources)
   - Metered billing for overages

### Go-to-Market (Weeks 7-12)
- **Content**: "5 ways to use NLQ with your data" — show concrete examples
- **Case studies**: 3-5 early users, their use cases
- **Webinar/demo**: Live walkthrough of charting + NLQ
- **Expansion targets**: Reach out to RevOps, product, growth leaders
  - "You've seen the founder briefing. Now you can build custom dashboards."

### Success Criteria
- 100+ total signups
- 50+ weekly actives
- 20+ paid subscriptions (10+ on Pro/Team)
- $2-5k MRR
- <5% weekly churn on paid users
- Positive feedback on charting + NLQ

---

## Week 13+: Scale & Iterate

### Continuous Work
1. **Datasource expansion**: Add 2-3 more per month (Shopify, Stripe detailed, Segment, etc.)
2. **Feature polish**: Dashboards as templates, more chart types (scatter, heatmap, etc.)
3. **Team features**: Collaboration, comments on metrics, shared workspaces
4. **Observability**: Better anomaly detection, predictive alerts
5. **Verticalization**: "Revenue dashboard for SaaS" template, "GTM dashboard for agencies," etc.

### New Opportunities (Month 4+)
- **White-label** (DaaS): Agencies ask "can you build one for my clients?" → say yes
- **Embedded API** (Model 3): SaaS platforms ask "can we embed this?" → plan SDK
- **Marketplace**: Let advanced users build custom datasources, sell on marketplace

### Go-to-Market (Weeks 13+)
- **Product-led growth**: free tier drives signups, Pro tier is natural upgrade
- **Founder-to-team expansion**: reach founders' teams at their companies
- **Sales motion**: Account executives for $500+/mo deals (enterprises, agencies)
- **Partnerships**: integrate with Zapier, Make, API integrations

---

## Resource Plan (Solo Founder)

### Week 1-2: ~40 hours
- Auth: 4 hrs
- Deploy: 2 hrs
- Landing page: 4 hrs
- Monitoring: 2 hrs
- Onboarding: 3 hrs
- Email/comms: 2 hrs
- **Remaining: ~20 hours** for debugging, iteration

### Week 3-6: ~40 hours/week
- Onboarding improvements: 6 hrs
- Notifications: 6 hrs
- Mobile UX: 6 hrs
- Feedback loops: 4 hrs
- **Remaining: ~18 hours/week** for GTM, customer calls, iteration

### Week 7-12: ~50 hours/week
- **Charting**: 12 hours
- **NLQ**: 8 hours
- **Anomaly detection**: 6 hours
- **6 datasources**: 12 hours
- **Product/pricing**: 6 hours
- **Remaining: ~6 hours/week** for debugging, GTM (minimal)

### Recommendations
- **Week 1-2**: Full focus on MVP + launch
- **Week 3-6**: Balance GTM (40%) + product iteration (60%)
- **Week 7-12**: Product-focused (80%) with GTM pauses for launches (120 hrs of work = ~2.4 full-time weeks)
- **Week 13+**: Shift to 50/50 product/GTM + hiring planning

---

## Key Decisions to Make Now

1. **Auth**: Clerk vs. Cloudflare Access vs. Auth.js?
   - **Recommended**: Clerk (best DX, easy email/password, free tier covers 100s of users)

2. **Charting library**: Recharts vs. Visx vs. Chart.js?
   - **Recommended**: Recharts (React-native, good defaults, no canvas weirdness)

3. **NLQ model**: Claude API vs. Anthropic SDK?
   - **Recommended**: Anthropic SDK (via Claude Code) with JSON mode for reliability

4. **Team structure**: Solo for 90 days, or hire?
   - **Recommended**: Solo for weeks 1-6 (validation), consider contractor/part-time help for weeks 7-12 if traction is strong

5. **Pricing strategy**: Freemium vs. free trial?
   - **Recommended**: Freemium (free tier 2 datasources) with 7-day team trial

---

## Success Metrics Summary

| Milestone | Week | Users | Weekly Active | MRR | Churn |
|-----------|------|-------|---------------|-----|-------|
| MVP Launch | 2 | 50 | 20 | $0 | N/A |
| Validation Gate | 6 | 100 | 30 | $0-500 | <10% |
| AI Analytics V1 | 12 | 300 | 80 | $2-5k | <5% |
| Scale Phase | 26 | 800+ | 200+ | $10-20k | <5% |

---

## Next Steps

1. **Choose tech stack** (auth, charting, NLQ)
2. **Assign work**: create TaskCreate items for each week
3. **Set calendar**: 4-week blocks (MVP, validation, analytics, scale)
4. **Bootstrap marketing**: LinkedIn, Twitter, email list setup
5. **Prepare for launch**: Landing page copy, signup page, first email sequence

---

**Type**: 90-day tactical roadmap
**Status**: Ready to execute
**Audience**: Founder building OpenDash

