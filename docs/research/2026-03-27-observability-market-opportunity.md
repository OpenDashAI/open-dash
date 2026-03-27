# OpenDash Observability: Market Opportunity Assessment

**Date:** 2026-03-27
**Sources:** 4 parallel market research surveys

## The Gap

| Tier | Price | What You Get | Problem |
|------|-------|-------------|---------|
| **CF native** | Free-$5/mo | 7-day retention, basic dashboard, no alerting | Too short, no cross-service traces |
| **Open-source self-hosted** | $30-400/mo infra | Full features, unlimited retention | Requires SRE to operate (ClickHouse, K8s) |
| **Managed platforms** | $130-500+/mo | Full features, no ops | Expensive, unpredictable billing |

**Nobody serves:** Small teams (5-20 people) wanting 30+ day retention, alerting, and business+infra correlation for $10-50/month with zero ops burden.

## Cloudflare Workers-Specific Gaps

CF built the primitives but the developer experience is incomplete:

1. **7-day max retention** — No option for longer within CF. Must set up Logpush yourself.
2. **Broken cross-service traces** — Service binding and DO calls create separate traces, not nested spans.
3. **No custom spans** — Only auto-instrumented I/O. Business logic between I/O calls is invisible.
4. **No alerting** — "Not a monitoring system." Must bolt on external tool.
5. **Workflows/Queues opaque** — console.log doesn't work inside Workflow steps.
6. **Durable Objects blind** — No state transition visibility, alarm tracking, or storage operation monitoring.
7. **0ms span problem** — Spectre mitigations make CPU-bound code invisible in traces.

## Competitive Landscape

### Pricing (10M events/month, small team)

| Platform | Cost | Retention | Business Metrics? |
|----------|------|-----------|-------------------|
| CF Workers | ~$5/mo | 7 days | No |
| Axiom | $25/mo | 12 months | No |
| Sentry | $29/mo | 30-90 days | No |
| SigNoz Cloud | $49/mo + usage | Configurable | No |
| Honeycomb | $130/mo | 60 days | No |
| Datadog | $155-360/mo | 15-30 days | Partially (expensive) |

**Key observation:** None of these combine business KPIs (revenue, traffic, conversions) with infrastructure observability (traces, errors, latency) in one view.

### Open-Source Options

| Tool | Min Self-Host Cost | OTLP? | Notes |
|------|-------------------|-------|-------|
| OpenObserve | $30-100/mo | Yes | Single binary (Rust), lowest barrier |
| SigNoz | $150-400/mo | Native | Best "Datadog replacement" |
| ClickStack (HyperDX) | $100-300/mo | Native | ClickHouse-backed, has session replay |
| Grafana Stack | $50-500/mo | Yes | Best ecosystem, highest ops burden |
| Jaeger | $50-200/mo | Native v2 | Tracing only |

**Problem with all:** Requires infrastructure to run. The target customer doesn't want to manage ClickHouse.

## The Opportunity for OpenDash

### Positioning

> "The only dashboard where you see your MRR, your error rate, and your p99 latency in the same view — for $29/month."

No current product occupies this position. Business dashboards and observability are always separate tools.

### Why OpenDash Is Uniquely Positioned

1. **Already a dashboard product** — Adding observability to an existing dashboard is easier than adding business metrics to an observability tool
2. **CF-native infrastructure** — Baselime proved CF Workers + D1 + R2 costs 80% less than AWS. OpenDash already runs on CF.
3. **Scram Jet integration** — Pipeline engine already collects business metrics and forwards to OpenDash. Adding OTel traces is incremental.
4. **The "single pane of glass" demand is real** — 72% of teams use 4-9 monitoring tools. 80% are actively consolidating.

### What OpenDash Would Provide

| Feature | What Exists Today | What to Add |
|---------|-------------------|-------------|
| Business metrics | Scram Jet → D1 metrics table | Already works |
| OTLP trace ingestion | Nothing | New: accept traces via OTLP HTTP endpoint |
| OTLP log ingestion | Nothing | New: accept logs via OTLP HTTP endpoint |
| Trace storage | Nothing | R2 for cold, D1 for index/metadata |
| Alerting | Nothing | New: threshold alerts on metrics + traces |
| Cross-service traces | Nothing | New: stitch CF Workers traces by correlation ID |
| Dashboard | Briefing HUD exists | Extend: add trace waterfall, error list panels |

### Constraints

| Resource | CF Limit | Impact |
|----------|----------|--------|
| D1 size | 10 GB | Store trace index/metadata only, not raw spans |
| R2 | Unlimited | Store raw traces as Parquet files |
| Worker CPU | 30s paid | Fine for ingest + lightweight queries |
| Analytics Engine | 92-day retention | Good for numeric metrics aggregation |

**Realistic scope:** OpenDash can be a lightweight observability product for CF Workers users with <50M events/month. Not competing with Datadog at scale — competing with "console.log and hope."

### Revenue Model

| Tier | Price | Limits |
|------|-------|--------|
| Free | $0 | 1M events/mo, 3-day retention, 1 dashboard |
| Pro | $29/mo | 20M events/mo, 30-day retention, unlimited dashboards, alerting |
| Team | $79/mo | 100M events/mo, 90-day retention, SSO, team features |

At CF's infrastructure costs (proven 80% cheaper than AWS by Baselime), margins would be strong.

### Demand Signals

- **Baselime acquisition** — CF paid to acquire a serverless observability startup. The demand is validated.
- **Fiberplane** — Built specifically to fill the cross-Worker tracing gap. Niche but real demand.
- **72% tool sprawl** — Most teams want fewer tools, not more.
- **Vercel/Netlify set expectations** — Platform-native observability is becoming table stakes.
- **$3.4B observability market** growing 15.6% CAGR — plenty of room for a CF-native entrant.

## Recommendation

**For internal use (immediate):** Enable CF native tracing across all repos via Alchemy template. Use Honeycomb or Axiom as external platform. Cost: ~$25-50/month.

**For OpenDash product (medium-term):** Add OTLP ingestion as a product feature. This is both the right architecture for our own observability AND a product differentiator. Build incrementally:
1. OTLP ingest endpoint (accept traces + logs)
2. Trace storage (R2 Parquet + D1 index)
3. Trace waterfall UI
4. Alerting on error rates / latency thresholds
5. Correlate business metrics with infrastructure traces

**The question is not "should we build this" but "when."** The market gap is clear, the infrastructure advantage is proven (Baselime), and OpenDash is already positioned as a dashboard product.
