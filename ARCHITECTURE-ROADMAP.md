# Architecture Roadmap: Datasources → Prime → DaaS

**Question Answered**: How do datasources, Durable Objects (Prime), and Scramjet insights shape our technical roadmap?

---

## Current State (MVP): Simple Stateless Adapters

### Phase 1-2 (Now - Week 6)
```
External API (GitHub, Stripe, Cloudflare, etc.)
    ↓
Datasource Adapter (stateless, pure function)
    ↓
BriefingItem[] (transformed data)
    ↓
UI Cards (render in briefing)
```

**Characteristics**:
- ✅ Simple: Each datasource is 50-200 lines of code
- ✅ Stateless: No memory, no side effects
- ✅ Composable: Can add/remove datasources easily
- ❌ Brittle: Manual type casting, no validation
- ❌ Unscalable: At 12+ datasources, parsing code gets messy

**Example**:
```typescript
export const githubIssuesSource: DataSource = {
  id: "github-issues",
  async fetch(config) {
    const issues = await fetch("https://api.github.com/repos/...");
    return issues.map(issue => ({
      id: `gh-${issue.number}`,
      title: issue.title,
      priority: issue.labels.includes("urgent") ? "high" : "normal",
      // ... manual type casting
    }));
  }
};
```

---

## Phase 2 Evolution: Add Type Safety (Week 13)

### When: After MVP is validated (Week 13+)
### Why: At 12+ datasources, manual parsing becomes unmaintainable

**Add Per-Datasource Zod Schemas**:
```typescript
const GitHubIssuesConfigSchema = z.object({
  repo: z.string(),
  labels: z.array(z.string()).optional(),
});

const GitHubIssueSchema = z.object({
  number: z.number(),
  title: z.string(),
  labels: z.array(z.object({ name: z.string() })),
});

export const githubIssuesSource: DataSource = {
  id: "github-issues",
  configSchema: GitHubIssuesConfigSchema,
  outputSchema: z.array(GitHubIssueSchema),
  async fetch(config) {
    const validated = GitHubIssuesConfigSchema.parse(config);
    const issues = await fetch("...");
    const parsed = GitHubIssueSchema.array().parse(issues);
    return parsed.map(issue => ({
      id: `gh-${issue.number}`,
      title: issue.title,
      priority: issue.labels.some(l => l.name === "urgent") ? "high" : "normal",
    }));
  }
};
```

**Benefits**:
- ✅ Type-safe config validation
- ✅ Clear contracts (what config is expected, what's returned)
- ✅ Runtime error messages when parsing fails
- ✅ Easier to add new datasources (follow the schema pattern)

**Timeline**: Week 13 (low priority, post-MVP validation)
**Effort**: 2-4 hours to refactor existing datasources
**Blocker?**: No, can wait until we have 8+ datasources

---

## Phase 3 Evolution: Declarative YAML Pipelines (Phase 5+)

### When: If you want power users or agency customers (Week 26+)
### Why: Build complex data pipelines without code

**Inspired by Scramjet's declarative model**:

```yaml
# Per-datasource extraction schema (optional, Phase 5+)
datasource: github-issues
sources:
  - url: "https://api.github.com/repos/{repo}/issues"
    headers:
      Authorization: "token {github_token}"

extract:
  id: "string(number) | prefix('gh-')"
  title: "string(title)"
  priority: "if_else(array.contains(labels[].name, 'urgent'), 'high', 'normal')"
  status: "enum(state)"
  body: "string(body) | truncate(200)"

filter:
  - field: "labels[].name"
    operator: "contains"
    values: ["bug", "urgent"]  # Only bugs and urgent issues

transform:
  - field: "priority"
    operation: "map"
    values: {urgent: "high", normal: "medium", low: "low"}

sort:
  - field: "priority"
    direction: "desc"

pagination:
  - method: "cursor"
    param: "page"
    delay: 100ms  # Rate limiting
```

**Benefits**:
- ✅ No code required for new datasources
- ✅ Power users can create custom pipelines
- ✅ Easy to add parallelization (fetch multiple pages in parallel)
- ✅ Built-in rate limiting
- ✅ Enables DaaS (customers define their own pipelines)

**Timeline**: Phase 5+ (after Phase 3 succeeds)
**Effort**: 40-60 hours to implement
**Why Later?**: Not needed until you have power users or DaaS customers

---

## Where Prime (Durable Objects) Fits In

### Prime = Control Plane + Decision Making
**When**: Phase 5+ (Week 26+) - Only if you want autonomous agents

**Example Use Case**:
- User: "Auto-merge PRs when CI passes and assigned reviewers approve"
- Prime Agent watches: GitHub webhooks, Slack, calendar
- Decides: Is it safe to merge? Should I ask first?
- Acts: Calls GitHub API to merge

**Current OpenDash**:
- ❌ No agent layer (can't auto-execute)
- ✅ Chat can suggest actions, user clicks merge manually

**Future with Prime**:
- ✅ Chat can execute actions automatically
- ✅ Agents remember patterns (e.g., "always merge after 3+ approvals")
- ✅ Persistent decision memory across sessions

**Architecture**:
```
Datasources (Layer 1): Fetch data
    ↓
Orchestration (Layer 2): Aggregate across datasources
    ↓
Prime Agent (NEW, Layer 3): Watch for patterns, decide actions
    ↓
Execution (NEW, Layer 4): Execute decisions (merge PR, create issue, etc.)
    ↓
UI (Layer 5): Show what happened, ask for confirmation
```

**Cost**: 60-80 hours to build
**Risk**: Agents can break things (need careful safety testing)
**Benefit**: Transforms from "briefing tool" to "autonomous control plane"

---

## Datasource Expansion Path (Phase 3)

### Week 7-12: Add 6 Strategic Datasources
These follow the Phase 1 pattern (simple stateless adapters):

1. **Plausible Analytics** (#37)
   - What: Page views, bounce rate, top pages
   - Implementation: ~4-6 hours
   - Why: Content creators want traffic metrics

2. **Uptime Kuma** (#38)
   - What: Monitor status, uptime %, response time
   - Implementation: ~4-6 hours
   - Why: SaaS founders want reliability metrics

3. **SendGrid** (#39)
   - What: Email sent, open rate, bounce rate
   - Implementation: ~4-6 hours
   - Why: Growth founders care about email marketing

4. **YouTube Analytics** (#40)
   - What: Views, subs, watch time, revenue
   - Implementation: ~4-6 hours
   - Why: Content creators want channel health

5. **Substack Analytics** (#41)
   - What: Subscribers, open rate, revenue
   - Implementation: ~4-6 hours
   - Why: Newsletter creators want reader metrics

6. **Custom HTTP API** (#42)
   - What: Generic webhook receiver + JSON parser
   - Implementation: ~4-6 hours
   - Why: Power users can integrate anything

**Pattern**:
- Each datasource: 50-200 lines of code
- Each config: Simple YAML (url, api_key, filters)
- Each output: Array of BriefingItem
- Total effort: 24-36 hours (parallel work)

---

## When to Add What

### Phase 1-2 (Weeks 1-6): Keep It Simple
- ✅ Keep datasources as stateless adapters
- ❌ DON'T add Zod schemas yet (unnecessary complexity)
- ❌ DON'T add Prime agents (too early)
- ✅ Focus: Founder validation, not architecture perfection

### Phase 3 (Weeks 7-12): Add Type Safety
- ✅ Refactor datasources with Zod schemas
- ✅ Add 6 new datasources (using same pattern)
- ✅ Ensure config validation is solid
- ✅ Build charting + NLQ (more important than perfect schemas)
- ❌ DON'T add Prime agents yet (too complex, not needed)

### Phase 4 (Weeks 13-26): Explore Advanced Patterns
- ✅ Consider: Should we build YAML pipelines? (only if power users ask)
- ✅ Explore: Prime agents for trusted customers (beta)
- ✅ Plan: DaaS architecture (if demand exists)
- ❌ DON'T overengineer until you have real demand

### Phase 5+ (Beyond Week 26): Conditional on Market
- **If power users exist**: Add YAML pipelines
- **If customers request automation**: Build Prime integration
- **If DaaS is viable**: Implement white-label version
- **If embedded API demand**: Build SDKs

---

## Architecture Decision Matrix

| Scenario | Use Datasources | Add Zod | Use Prime | Use YAML Pipelines |
|----------|---|---|---|---|
| MVP (Week 2) | ✅ | ❌ | ❌ | ❌ |
| Validated (Week 6) | ✅ | ❌ | ❌ | ❌ |
| Scaling (Week 12) | ✅ | ✅ | ❌ | ❌ |
| Exploring Agents (Week 20) | ✅ | ✅ | 🔍 | ❌ |
| Power Users Demand (Week 26) | ✅ | ✅ | ✅ | 🔍 |
| DaaS Product (Week 40) | ✅ | ✅ | ✅ | ✅ |

**✅ = Implement**
**❌ = Don't do it yet**
**🔍 = Evaluate demand first**

---

## Inbox Datasource Timeline

### Option 1: Build Now (Week 1-2)
- **Effort**: 4-6 hours (takes away from MVP launch)
- **Benefit**: Dogfood OpenDash with your own portfolio
- **Risk**: MVP launch slips

### Option 2: Use Airtable (Weeks 3-6)
- **Effort**: 1-2 hours setup, 10 min/week maintenance
- **Benefit**: Fast, professional, easy to iterate
- **Later**: Build OpenDash datasource to read from Airtable API

### Option 3: Build as Phase 3 Case Study (Week 13+)
- **Effort**: 4-6 hours (simple stateless adapter reading from Airtable API)
- **Benefit**: Demonstrates OpenDash for portfolio management use case
- **Story**: "We use OpenDash to track our research ideas"

**Recommendation**: **Option 3** (build in Week 13 after Airtable setup)

This way:
- ✅ MVP launch stays on schedule (Week 1-2)
- ✅ Inbox portfolio tracker is live immediately (use Airtable)
- ✅ OpenDash datasource becomes case study (Week 13)
- ✅ You get the dogfooding benefit with less risk

---

## Summary: Layered Architecture

```
Phase 1-2 (Weeks 1-6):
├─ Layer 1: Datasources (6 sources, stateless adapters)
├─ Layer 2: Orchestration (fetchBrandDashboard)
├─ Layer 3: UI (cards, briefing, portfolio)
└─ Optional: D1 caching (if needed for performance)

Phase 3 (Weeks 7-12):
├─ Charting (Recharts)
├─ NLQ (Claude API for natural language queries)
├─ Anomaly detection (AI-powered insights)
├─ Datasource expansion (6 more sources)
├─ Zod schemas (type safety for datasources)
└─ Team plan (multi-user, shared dashboards)

Phase 4+ (Week 13+):
├─ YAML pipelines (if power users ask)
├─ Prime agents (if automation demand)
├─ DaaS product (if agencies ask)
├─ Embedded API (if platforms ask)
└─ White-label (if reseller demand)
```

**Key Insight**: Don't build it until you need it. Validate the market first (Phase 2), then add sophistication (Phase 3+).

---

## Next Steps

### This Week (MVP Launch):
- [ ] Deploy datasource-based briefing to 50 founders
- [ ] Monitor which datasources they use most
- [ ] Collect feedback on what's missing

### Week 3-6 (Founder Validation):
- [ ] Learn which datasources matter most
- [ ] Decide: Do we need Zod schemas? (probably yes at 12+ sources)
- [ ] Plan which 6 new datasources to add in Phase 3

### Week 7-12 (AI Analytics):
- [ ] Add charting + NLQ (higher priority than new datasources)
- [ ] Refactor existing datasources with Zod (1-2 hours)
- [ ] Add 6 new datasources (24-36 hours, parallel)

### Week 13+ (Scale):
- [ ] Evaluate: Do power users want YAML pipelines? (depends on demand)
- [ ] Evaluate: Do customers want Prime agents? (depends on feedback)
- [ ] Build whichever has clearest demand signal

---

**Type**: Architecture roadmap
**Status**: Ready to execute
**Audience**: You + future technical team

