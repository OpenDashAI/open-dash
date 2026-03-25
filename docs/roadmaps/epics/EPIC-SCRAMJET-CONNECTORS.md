# EPIC #99 — Scram Jet Connector Layer

**Date**: 2026-03-25
**Status**: 🆕 APPROVED. Ready for immediate implementation.
**Timeline**: 4 weeks (Week 1-4 of Phase 1-2 component interop)
**Target**: 50+ connectors ready, auto-generation system live

---

## Epic Overview

**Goal**: Use Scram Jet Project (Cloudflare Workers YAML pipeline engine) as unified connector/datasource layer instead of building custom framework.

**Why This Approach?**
- ✅ Cloudflare Workers-native (same ecosystem as OpenDash)
- ✅ YAML pipelines (easier than code generation)
- ✅ 15+ fetch operators already built (no development)
- ✅ 20+ transform operators available
- ✅ 10+ output operators ready
- ✅ Zero coldstart (Workers instant)
- ✅ Same cost as Workers (~$20/mo)
- ✅ Real-time dashboards (not polling)

**Key Insight**: Every OpenDash datasource = one Scram Jet YAML pipeline. No custom component framework needed.

---

## Architecture

```
Marketing APIs (Stripe, GA4, Ads, HubSpot, etc.)
        ↓
Scram Jet Pipelines (YAML configuration)
  fetch: [api, rss, reddit, webhook, github, search, etc.]
  transform: [filter, map, aggregate, dedup, ai, etc.]
  output: [json → D1, slack, email, webhook]
        ↓
D1 Database (metrics storage)
        ↓
OpenDash Dashboard (queries D1, renders metrics)
```

**Comparison to Previous Plans**:
- ❌ NOT building custom component framework
- ❌ NOT using Scramjet.org (container platform, wrong tool)
- ✅ USING Scram Jet Project (YAML pipeline engine)

---

## Available Operators (Immediate)

### Fetch Operators (Connectors)
Already built, ready to use:
- `fetch-api` — REST/GraphQL APIs (Stripe, GA4, Ads, HubSpot, Shopify, Salesforce, etc.)
- `fetch-rss` — RSS feeds
- `fetch-reddit` — Reddit
- `fetch-bluesky` — Bluesky
- `fetch-github-org` — GitHub organizations
- `fetch-webhook` — Incoming webhooks
- `fetch-research` — Research/web data
- `fetch-scraper` — Web scraping
- `fetch-search` — Web search
- `fetch-mcp` — MCP servers
- `fetch-youtube-transcript` — YouTube
- `fetch-browser` — Browser automation
- `fetch-crawl` — Website crawling
- `fetch-wan` — Web analytics

**Total fetch operators**: 15+

### Transform Operators
- `transform-ai` — AI/LLM processing
- `transform-filter` — Filter records
- `transform-map` — Map/transform fields
- `transform-dedup` — Deduplication
- `transform-sort` — Sort
- `transform-aggregate` — Aggregation
- `transform-enrich` — Data enrichment
- And 8+ more...

**Total transform operators**: 20+

### Output Operators
- `output-json` — JSON/file
- `output-slack` — Slack
- `output-email` — Email
- `output-github` — GitHub
- `output-google-sheets` — Google Sheets
- `output-notion` — Notion
- `output-webhook` — Webhooks
- `output-r2` — Cloudflare R2
- And 3+ more...

**Total output operators**: 12+

---

## How It Works: Example

### Stripe Revenue Pipeline (YAML)

```yaml
name: stripe-revenue
schedule: "*/5 * * * *"  # Every 5 minutes

fetch:
  - type: api
    url: "https://api.stripe.com/v1/balance_transactions"
    method: GET
    auth: "Bearer {{ secrets.STRIPE_SECRET_KEY }}"
    params:
      created[gte]: "{{ now() - 86400 }}"  # Last 24h

transform:
  - map:
      amount: "value.amount / 100"  # Cents to dollars
      currency: "value.currency"
      type: "value.type"
      timestamp: "value.created * 1000"
  - filter: "type == 'charge' OR type == 'payment'"
  - aggregate:
      total_revenue: "sum(amount)"
      transaction_count: "count()"
      timestamp: "max(timestamp)"
  - map:
      id: "'stripe-daily-revenue'"
      priority: "total_revenue > 333 ? 'high' : 'normal'"
      category: "'revenue'"
      title: "'Daily revenue: $' + total_revenue.toFixed(0)"
      detail: "Math.round((total_revenue / 333) * 100) + '% of $333 target'"

output:
  - webhook:
      url: "{{ secrets.OPENDASH_API_URL }}/metrics"
      method: POST
      headers:
        Authorization: "Bearer {{ secrets.OPENDASH_API_KEY }}"
```

**Result**: One YAML file (not custom code). Deployed to Scram Jet. Runs every 5 minutes. Outputs BriefingItem to D1.

---

## Connectors Available Without Code

| Source | Operator | Format | Ready |
|--------|----------|--------|-------|
| Stripe | fetch-api | REST | ✅ Now |
| Google Analytics 4 | fetch-api | REST | ✅ Now |
| Google Ads | fetch-api | REST | ✅ Now |
| Meta Ads | fetch-api | REST | ✅ Now |
| HubSpot | fetch-api | REST | ✅ Now |
| Shopify | fetch-api | REST | ✅ Now |
| Salesforce | fetch-api | REST | ✅ Now |
| Mailchimp | fetch-api | REST | ✅ Now |
| Slack | fetch-api | REST | ✅ Now |
| GitHub | fetch-github-org | Operator | ✅ Now |
| Reddit | fetch-reddit | Operator | ✅ Now |
| RSS (blogs, news) | fetch-rss | Operator | ✅ Now |
| Web Search | fetch-search | Operator | ✅ Now |
| YouTube | fetch-youtube-transcript | Operator | ✅ Now |
| Web Scraping | fetch-scraper | Operator | ✅ Now |

**Total sources ready today: 50+**

---

## Auto-Generation Strategy

### Problem
- 150+ SaaS/API sources could be connected
- Writing YAML by hand for each = slow
- Need systematic way to generate pipelines

### Solution
- Parse OpenAPI specifications
- Auto-generate YAML pipeline templates
- Map API response fields → BriefingItem format
- User fine-tunes if needed

### Example: Auto-Generating from OpenAPI

```python
def generate_pipeline_from_openapi(openapi_spec, api_name):
    """Generate Scram Jet YAML pipeline from OpenAPI spec"""

    pipeline = {
        'name': api_name.lower().replace(' ', '-'),
        'fetch': [{
            'type': 'api',
            'url': openapi_spec.servers[0].url,
            'method': 'GET',  # Use first GET endpoint
            'auth': f"Bearer {{{{ secrets.{api_name.upper()}_KEY }}}}"
        }],
        'transform': [
            {
                'map': {
                    # Auto-map response fields to metrics
                    'id': f"'{api_name.lower()}-metric'",
                    'timestamp': 'response.timestamp || now()',
                    'value': 'response.data.value',  # Inferred
                }
            },
            {
                'aggregate': {
                    'total': 'sum(value)',
                    'count': 'count()',
                    'average': 'avg(value)'
                }
            }
        ],
        'output': [{
            'webhook': {
                'url': "{{ secrets.OPENDASH_API_URL }}/metrics",
                'method': 'POST'
            }
        }]
    }

    return yaml.dump(pipeline)
```

**Result**: 200+ YAML pipelines from auto-generation, covering long tail of APIs.

---

## Issues & Subtasks

### Phase 1: Foundation (Week 1)

#### Issue #99.1: Scram Jet Integration Setup
**Effort**: 5 hours
**Priority**: P0

**What**:
- [ ] Document Scram Jet operators (fetch, transform, output)
- [ ] Set up D1 metrics table schema
- [ ] Create D1 webhook endpoint (`/api/metrics`)
- [ ] Deploy test pipeline to Scram Jet
- [ ] Validate end-to-end (Scram Jet → D1 → Dashboard)

**Acceptance Criteria**:
- Scram Jet can write to D1 successfully
- D1 metrics visible in dashboard
- <100ms latency confirmed
- Documentation updated

**Files to Create**:
- `docs/SCRAMJET-INTEGRATION.md` (setup guide)
- Update D1 schema (`migrations/005_scramjet_metrics.sql`)
- Create `/api/metrics` endpoint

---

#### Issue #99.2: YAML Pipeline Templates (5 High-Value Sources)
**Effort**: 4 hours
**Priority**: P0

**What**:
- [ ] Create YAML template for Stripe pipeline
- [ ] Create YAML template for GA4 pipeline
- [ ] Create YAML template for Google Ads pipeline
- [ ] Create YAML template for Meta Ads pipeline
- [ ] Create YAML template for HubSpot pipeline
- [ ] Test all 5 pipelines (deploy to Scram Jet)
- [ ] Verify output to D1

**Acceptance Criteria**:
- All 5 templates syntactically valid
- All 5 pipelines run successfully
- Metrics appear in D1
- <100ms latency for all
- Documentation for each

**Files to Create**:
- `pipelines/stripe-revenue.yaml`
- `pipelines/ga4-traffic.yaml`
- `pipelines/google-ads-spend.yaml`
- `pipelines/meta-ads-spend.yaml`
- `pipelines/hubspot-contacts.yaml`

---

### Phase 2: Expansion (Week 2)

#### Issue #99.3: Auto-Generation System
**Effort**: 6 hours
**Priority**: P0

**What**:
- [ ] Build OpenAPI → YAML pipeline generator
- [ ] Support basic REST API patterns
- [ ] Auto-map response fields to BriefingItem format
- [ ] Test with 5 public APIs (Mailchimp, Slack, etc.)
- [ ] Generate 10 pipelines from OpenAPI specs
- [ ] Document the auto-gen system

**Acceptance Criteria**:
- Generator produces syntactically valid YAML
- Generated pipelines run without modification
- 10 pipelines auto-generated from OpenAPI
- Performance: <1 second to generate
- Documentation complete

**Files to Create**:
- `scripts/generate-pipeline-from-openapi.py` (or ts)
- `docs/PIPELINE-AUTOGEN.md` (how to use)
- 10 auto-generated pipeline YAML files

---

#### Issue #99.4: Dashboard Integration (D1 Consumption)
**Effort**: 4 hours
**Priority**: P1

**What**:
- [ ] Update dashboard to query D1 metrics table
- [ ] Display metrics from all Scram Jet pipelines
- [ ] Support real-time refresh (WebSocket or poll D1)
- [ ] Show pipeline status (last run, errors)
- [ ] Test with 10 concurrent pipelines

**Acceptance Criteria**:
- Dashboard displays Scram Jet metrics
- Real-time refresh working (<5s latency)
- No regression in existing briefing
- All 184 tests still passing
- Performance: <2s dashboard load time

**Files to Modify**:
- `src/routes/index.tsx` (add metrics panel)
- `src/server/briefing.ts` (query D1 for metrics)
- `src/lib/db/queries.ts` (add metrics queries)

---

### Phase 3: Scale & Optimize (Week 3-4)

#### Issue #99.5: Operator Library Documentation
**Effort**: 3 hours
**Priority**: P1

**What**:
- [ ] Document all 15 fetch operators (examples, configs)
- [ ] Document all 20 transform operators
- [ ] Document all 10+ output operators
- [ ] Create operator recipes (common patterns)
- [ ] Create troubleshooting guide

**Acceptance Criteria**:
- Each operator has examples
- Recipes for 5 common use cases
- Troubleshooting guide covers edge cases
- User can self-serve building new pipelines

**Files to Create**:
- `docs/SCRAMJET-OPERATORS.md` (complete reference)
- `docs/SCRAMJET-RECIPES.md` (examples)

---

#### Issue #99.6: Performance & Cost Optimization
**Effort**: 4 hours
**Priority**: P2

**What**:
- [ ] Measure latency per 100 pipelines
- [ ] Measure D1 write latency under load
- [ ] Measure Workers CPU cost per pipeline
- [ ] Optimize batch writes to D1
- [ ] Set up monitoring/alerts

**Acceptance Criteria**:
- <200ms latency with 100 concurrent pipelines
- Cost <$50/month at scale
- No pipeline timeouts
- Alert on failed pipelines

**Files to Create**:
- `docs/PERFORMANCE-ANALYSIS.md`
- Monitoring dashboard configuration

---

## Success Criteria

| Metric | Target | Why |
|--------|--------|-----|
| Connectors ready | 50+ | Immediate coverage, zero dev needed |
| Auto-generated pipelines | 200+ | Long tail coverage |
| Latency | <200ms per pipeline | Real-time dashboards |
| Cost | <$50/month | Efficient at scale |
| Time to deploy new pipeline | <1 hour (or auto-gen) | Quick iteration |
| Dashboard integration | Complete | Seamless user experience |
| Documentation | Complete | User self-service |
| Test coverage | >90% | Reliability |

---

## Relationship to Other Epics

- **EPIC #27 (B2B Platform)**: Scram Jet provides datasources for competitive intelligence + campaign metrics
- **EPIC #493 (Video Production Dashboard)**: Could use Scram Jet pipelines for video metrics
- **Component Interop (Phase 1-2)**: Scram Jet pipelines are the connector layer; Component SDK handles UI orchestration

---

## Timeline

| Week | Focus | Issues | Deliverable |
|------|-------|--------|-------------|
| 1 | Foundation | #99.1, #99.2 | 5 working pipelines in Scram Jet, D1 integration |
| 2 | Expand | #99.3, #99.4 | Auto-gen system, 50+ pipelines, dashboard integration |
| 3 | Polish | #99.5 | Complete documentation, recipes |
| 4 | Optimize | #99.6 | Performance analysis, cost optimization |

---

## Technical Architecture

```
Scram Jet Project (Cloudflare Workers)
  ├── Fetch operators (15+)
  │   ├── fetch-api (REST, GraphQL)
  │   ├── fetch-rss, fetch-reddit, fetch-github-org
  │   ├── fetch-search, fetch-scraper, fetch-webhook
  │   └── Custom operators as needed
  │
  ├── Transform operators (20+)
  │   ├── transform-filter, transform-map, transform-aggregate
  │   ├── transform-ai, transform-dedup, transform-enrich
  │   └── Custom transforms as needed
  │
  └── Output operators (10+)
      ├── output-json (→ D1 via webhook)
      ├── output-slack, output-email, output-webhook
      └── output-r2, output-github, etc.

                    ↓
                [D1 Database]
                    ↓
            [OpenDash Dashboard]
```

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Scram Jet changes operators | High | Monitor GitHub, version-pin operators |
| Auto-gen fails for complex APIs | Medium | Manual override capability, admin mode |
| D1 throughput limits | Low | Batch writes, archival strategy |
| Latency SLA not met | Medium | Load testing first, async strategy |
| Scram Jet capability gap | Medium | **File upstream issue + design suggestion** |

## Governance: Upstream Escalation Pattern

When EPIC #99 implementation hits **Scram Jet limitations**:

1. **Do not work around it** — Keep architecture clean
2. **File issue in Scram Jet GitHub** with:
   - Use case: "OpenDash connector layer needs [capability]"
   - Current limitation: What's blocking us
   - Suggested design: How Scram Jet could solve it
   - Example YAML or implementation sketch
3. **Track as blocker** in EPIC #99 with reference to upstream issue
4. **Wait for enhancement** — Maintains long-term health

**Known potential blockers** (watch for during #99.1-#99.4):
- Webhook secret validation mechanism
- Metadata JSON handling in output operators
- Real-time update guarantees or retry logic
- Error handling and pipeline failure recovery
- Rate limiting and throughput constraints at scale

---

## Related Standards & Research

- `Standards/component-sdk-spec.md` — Component interface (UI layer, separate from Scram Jet)
- `Standards/opendash-virtual-media-component-interop.md` — Multi-team architecture
- `Memory/project_opendash_scramjet_correct_architecture.md` — Decision rationale
- `Research/OPENDASH-SCRAMJET-INTEGRATION-STRATEGY.md` — Detailed design

---

## Status

✅ **APPROVED** — Ready to begin Week 1 implementation
🔗 **Related Epics**: #27 (B2B Platform), #493 (Video Dashboard), Component Interop Phase 1-2
📅 **Start**: Immediately (integrate with Phase 1-2 component work)

---

**Owner**: Product + Engineering
**Timeline**: 4 weeks (integrate with component interop Phase 1-2)
**Budget**: $0 (uses existing Scram Jet operators + Cloudflare Workers quota)
