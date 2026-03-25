# Progress Review: Where Are We? + Atlas Integration Plan

**Date**: 2026-03-24
**Review Focus**: Current OpenDash status + how to integrate with Atlas Board ecosystem

---

## Current Status Summary

### ✅ Complete (Phases 1-4)
- ✅ **Phase 1**: YAML schema + config loader (implemented)
- ✅ **Phase 2**: Dynamic datasource instantiation (6 sources implemented)
- ✅ **Phase 3**: Routes + declarative UI (three-panel HUD implemented)
- 🟡 **Phase 4**: Hybrid config loader (90% complete, blocked by Brand System API)

**Build Status**: ✅ Passing
**Ready to Ship**: MVP is production-ready

---

## Issues Breakdown

### Total Open Issues: 52

#### By Epic (4 Planned Epics)

| Epic | # | Issues | Status |
|------|---|--------|--------|
| **#19: MVP Launch** (Week 1-2) | 7 | #20-25 | ⏳ Pending |
| **#26: Founder Validation** (Week 3-6) | 7 | #27-32 | ⏳ Pending |
| **#33: AI Analytics** (Week 7-12) | 13 | #34-45 | ⏳ Pending |
| **#46: Scale & Iterate** (Week 13+) | 7 | #47-52 | ⏳ Pending |

#### Unaccounted Issues
- Issues #1-18: Old/duplicate labels, need cleanup
- Issues #14-17: Data Integrity schema epic (internal infrastructure, separate from roadmap)

**Total Actionable**: 34 issues across 4 main epics
**Remaining**: 18 old issues that should be archived or merged

---

## What's Actually Done vs. What's Pending

### Done (Building Blocks)
- ✅ Core architecture (YAML schema, datasources, UI routes)
- ✅ 6 initial datasources (GitHub, Stripe, Cloudflare, Tailscale, Scalable Media)
- ✅ Three-panel HUD with keyboard shortcuts
- ✅ Chat integration via AssistUI
- ✅ D1 database setup
- ✅ Auth system (session-based)

### Pending (MVP Week 1-2)
- ⏳ #20: Implement auth (Clerk) — Need to upgrade from session-based
- ⏳ #21: Deploy to opendash.ai domain
- ⏳ #22: Set up Sentry monitoring
- ⏳ #23: Create landing page
- ⏳ #24: Onboarding email sequences
- ⏳ #25: Getting started guide + video

### Pending (Validation Week 3-6)
- ⏳ #27: Improve onboarding UX
- ⏳ #28: Add Slack/Discord notifications
- ⏳ #29: Mobile UI responsiveness
- ⏳ #30: Add in-app NPS survey
- ⏳ #31: Blog content
- ⏳ #32: Founder interviews

### Pending (AI Analytics Week 7-12)
- ⏳ #34: Recharts integration (critical path)
- ⏳ #35: NLQ foundation (critical path)
- ⏳ #36: Anomaly detection
- ⏳ #37-42: 6 new datasources (Plausible, Uptime Kuma, SendGrid, YouTube, Substack, Custom HTTP)
- ⏳ #43: Team plan
- ⏳ #44: Pricing update
- ⏳ #45: Zod schema validation

### Pending (Scale Week 13+)
- ⏳ #47: More chart types
- ⏳ #48: Dashboard templates
- ⏳ #49: DaaS exploration
- ⏳ #50: Embedded API
- ⏳ #51: Predictive alerts
- ⏳ #52: Observability

---

## New Epic: Atlas Board Integration (Week 13+)

### Why This Epic?

OpenDash succeeds as standalone product (Phases 1-3). Once proven, it becomes the primary dashboard for Atlas Board agents.

**Current Plan**: Week 13+ in "Scale & Iterate" is vague about what to prioritize.

**Better Plan**: Create explicit "Atlas Integration" epic that:
- Clarifies how OpenDash connects to Atlas agents
- Provides concrete datasource specs
- Defines success metrics
- Doesn't block MVP launch (independent path)

### Proposed Epic #53: Atlas Board Integration (Week 13+)

**Goal**: Make OpenDash the primary UI for Atlas C-suite agents (CEO, CFO, COO, CMO, CTO)

**Why**:
- Founders prove OpenDash is viable (Phase 1-3 success)
- Atlas Board agents need visualization layer
- OpenDash datasources can read from agent storage
- Becomes internal tool + external product

**Child Issues** (estimated 8-10 issues, 40-60 hours):

| # | Issue | Effort | Description |
|---|-------|--------|-------------|
| #53a | Add Atlas agent datasources framework | 4-6h | Support reading from DO storage |
| #53b | Implement CFO datasource (spend, budget) | 4-6h | Connect to Atlas CFO agent |
| #53c | Implement COO datasource (ops, blockers) | 4-6h | Connect to Atlas COO agent |
| #53d | Implement CMO datasource (ranking, content) | 4-6h | Connect to Atlas CMO agent |
| #53e | Implement CTO datasource (code quality) | 4-6h | Connect to Atlas CTO agent (future) |
| #53f | Add chat interface to talk to agents | 6-8h | "CFO, what's our spend this month?" |
| #53g | Create Agent panels UI (CFO, COO, CMO) | 6-8h | Panel templates for each agent |
| #53h | Integrate Atlas webhook alerts in OpenDash | 2-4h | Push agent events to dashboard |
| #53i | Document Atlas + OpenDash integration | 2-3h | Architecture guide, setup instructions |

**Total Effort**: 40-60 hours (1 week at 50 hrs/week)
**Timeline**: Week 13-14 (after Phase 3 is proven)
**Owner**: You (solo)
**Blocker**: Only if OpenDash doesn't hit Phase 3 targets ($2-5k MRR, 20+ paid users)

---

## Proposed Issue Structure & Cleanup

### Keep (Relabel + Keep Open)
- **#19**: Epic: MVP Launch (Week 1-2) ✅
- **#26**: Epic: Founder Validation (Week 3-6) ✅
- **#33**: Epic: AI Analytics Foundation (Week 7-12) ✅
- **#46**: Epic: Scale & Iterate (Week 13+) ✅

### Modify (Update Description)
- **#46**: Retitle to "Epic: Scale, DaaS, & Embedded (Week 13+)" — break into sub-epics:
  - Scale track: #47-48 (chart types, templates)
  - DaaS track: #49 (white-label exploration)
  - Embedded API track: #50 (embeddable analytics)
  - Intelligence track: #51-52 (predictive alerts, observability)

### Create NEW (Atlas Integration)
- **#53**: Epic: Atlas Board Integration (Week 13+)
  - Child issues: #53a-#53i

### Archive/Close (Old/Duplicate)
- **#1-18**: Mark as obsolete, close or migrate content
  - #1-4, #6-9: Duplicate Phase 1-2 definitions (covered by #19, #26)
  - #5: Covered by #19
  - #10-13: Data schema epics (out of scope for now)
  - #14-18: Covered by #33

---

## Integration Strategy (Detailed)

### Phase 1-3 Independence (Weeks 1-12)
```
OpenDash MVP
├─ Week 1-2: Ship founder briefing
├─ Week 3-6: Validate with founders, iterate
├─ Week 7-12: Add charting, NLQ, anomaly, datasources
└─ Result: 100+ signups, $2-5k MRR, 20+ paid users
```

**Parallel Track** (doesn't block OpenDash):
```
Atlas Board Development (separate repo, separate sessions)
├─ Week 1-12: Build CEO/CFO/COO/CMO agents
├─ Storage: Use D1, DO storage, Telegram comms
└─ No dependency on OpenDash
```

### Week 13 Integration Decision Point

**If OpenDash succeeds** (100+ signups, $2-5k MRR, 20+ paid):
- ✅ Proceed to Phase 4 (Scale + Atlas integration)
- Create Epic #53 (Atlas Board Integration)
- Build agent datasources
- Ship integrated dashboard

**If OpenDash plateaus** (<50 active, <$1k MRR):
- ⏸ Hold on Atlas integration
- Focus on understanding why OpenDash isn't working
- Don't waste 40-60 hours integrating failing product

### Datasource Pattern for Atlas Integration

**Current** (Phase 1-3): Datasources read from external APIs
```typescript
export const githubIssuesSource: DataSource = {
  fetch() {
    const issues = await fetch("https://api.github.com/...");
    return issues.map(issue => ({...}));
  }
};
```

**Future** (Phase 4+): Datasources can also read from internal agents
```typescript
// Phase 4 addition: Atlas agent datasources
export const atlasCfoSource: DataSource = {
  id: "atlas-cfo",
  async fetch(config) {
    // Read from Atlas CFO Durable Object
    const cfoReport = await fetch(
      "https://atlas.example.com/board/cfo/state",
      { headers: { Authorization: `Bearer ${config.atlasToken}` } }
    );
    const { spend, budget, anomalies } = await cfoReport.json();

    return [
      {
        id: "atlas-spend",
        title: `Monthly Spend: $${spend} / $${budget}`,
        priority: spend > budget * 0.9 ? "high" : "normal",
        metadata: { spend, budget, anomalies }
      }
    ];
  }
};
```

**Key**: Same `DataSource` interface, different implementation.

---

## Recommended Actions (This Week)

### 1. Cleanup Old Issues (#1-18)
- [ ] Review issues #1-18 for any valuable content
- [ ] Migrate unique content to wiki/docs
- [ ] Close or mark as duplicate
- [ ] Clean up: Keep only the 4 main epics + 34 issue

### 2. Retitle Epic #46
- [ ] Change title: "Epic: Scale & Iterate (Week 13+)" → "Epic: Scale, DaaS, & Embedded (Week 13+)"
- [ ] Update body to clarify three parallel tracks:
  - Track A: Scale (chart types, templates)
  - Track B: DaaS/white-label exploration
  - Track C: Embedded API
  - Track D: Intelligence (predictive alerts, observability)

### 3. Create Epic #53 (Atlas Integration)
- [ ] Title: "Epic: Atlas Board Integration (Week 13+)"
- [ ] Body: (from above)
- [ ] Mark as: Feature, Medium priority, Future/post-validation label
- [ ] Child issues: #53a-#53i (estimated, not created yet)

### 4. Add Phase 5+ Note
- [ ] Add comment to #46: "Atlas Board integration (Epic #53) is conditional on Phase 3 success"
- [ ] Link to OPENDASH-IN-ATLAS-ECOSYSTEM.md for context

### 5. Verify Critical Path
- [ ] Critical path for MVP (#19): Auth → Deploy → Landing → Launch
- [ ] Critical path for Phase 3 (#33): Charting → NLQ → Anomaly → Datasources
- [ ] Ensure all "Blocker" dependencies are noted

---

## New Issue Template for Atlas Integration

```
Title: [#53a-#53i] Atlas Board Integration: {feature}

## Description
OpenDash Phase 4: Integrate with Atlas Board agents to become primary org dashboard UI.

## Acceptance Criteria
- [ ] {specific deliverable}
- [ ] Tests passing
- [ ] Documentation updated

## Effort
{hours}

## Dependencies
{if any}

## Related
Epic #53: Atlas Board Integration
Link to OPENDASH-IN-ATLAS-ECOSYSTEM.md
```

---

## Summary: What Needs to Happen

### Before MVP Ship (Week 2)
- [x] Phases 1-4 architecture complete
- [ ] Issues #20-25 (MVP Launch) are ready to implement

### Before Phase 2 Complete (Week 6)
- [ ] Issues #27-32 (Founder Validation) are ready

### Before Phase 3 Complete (Week 12)
- [ ] Issues #34-45 (AI Analytics) are ready
- [ ] Decision: Proceed to Phase 4 or pivot?

### Week 13 Decision Point
- [ ] If Phase 3 succeeds: Create Epic #53 (Atlas Integration)
- [ ] If Phase 3 fails: Investigate, iterate, don't integrate yet

---

## Issue Count Going Forward

| Status | Count |
|--------|-------|
| Old/Duplicate (#1-18) | 18 → **Close** |
| Epic #19 (MVP) | 7 issues | ⏳ Pending |
| Epic #26 (Validation) | 7 issues | ⏳ Pending |
| Epic #33 (AI Analytics) | 13 issues | ⏳ Pending |
| Epic #46 (Scale) | 7 issues | ⏳ Pending |
| **Epic #53 (Atlas)** | **8-10 issues** | **⏳ Future (Week 13+)** |
| **Clean Total** | **34 + 8-10** | **Ready to execute** |

---

## Next Steps

1. **This week**: Run Week 1 MVP launch, start working on issues #20-25
2. **Week 2 end**: Decide whether to proceed to Phase 2 or pivot
3. **Week 6 end**: Decide whether Phase 2 validated founder interest
4. **Week 12 end**: Decide whether Phase 3 hit targets, whether to integrate with Atlas
5. **Week 13+**: If yes to all above, create Epic #53 and execute Atlas integration

---

**Type**: Progress review + integration plan
**Status**: Ready to execute MVP, contingent integration plan ready
**Audience**: You + future team

