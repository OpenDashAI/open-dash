# Component Interoperability: Phase 1-2 Roadmap

**Goal**: Prove OpenDash + Virtual-Media components work together in shared monorepo
**Timeline**: Weeks 1-4 (4 weeks)
**Teams**: OpenDash + Virtual-Media

---

## Week 1: Foundation Setup

### Days 1-2: Monorepo & SDK Setup
- [ ] Create `packages/@opendash/sdk/` directory structure
- [ ] Implement SDK types (Component, BriefingItem, ComponentConfig, ComponentStatus)
- [ ] Implement ComponentRegistry with `fetchAll()` method
- [ ] Configure `pnpm-workspace.yaml` for both `@opendash/*` and `@virtual-media/*` scopes
- [ ] Set up shared `tsconfig.json`
- [ ] Add `biome.json` for linting (shared config)

**Deliverable**: Core SDK complete and tested

### Days 3-5: First Component Extraction
- [ ] Extract Stripe datasource → `@opendash-components/stripe-revenue`
- [ ] Convert datasource code to Component interface
- [ ] Write 8+ unit tests
- [ ] Create README with configuration example
- [ ] Verify component works with registry

**Deliverable**: One working component, full test coverage

### Owner: OpenDash team
**Effort**: 40h (2 people × 20h)

---

## Week 2: Component Extraction + Virtual-Media Build

### Days 1-3: OpenDash Extraction (Parallel)
Extract 4 more datasources:
- [ ] GA4 → `@opendash-components/ga4`
- [ ] Google Ads → `@opendash-components/google-ads`
- [ ] GitHub Issues → `@opendash-components/github-issues`
- [ ] Email Metrics → `@opendash-components/email-metrics`

Each gets:
- Tests (8+)
- README
- Configuration examples
- Verified with registry

**Deliverable**: 5 total OpenDash components

### Days 1-3: Virtual-Media Component Build (Parallel)
Build 2-3 new components:
- [ ] Grok Component → `@virtual-media-components/grok`
  - Fetch video generation metrics
  - Return briefing items about generated videos
  - Tests (8+)
- [ ] Video Metrics → `@virtual-media-components/video-metrics`
  - Fetch performance data
  - Tests (8+)
- [ ] (Optional) 3rd component TBD

Each gets:
- Tests (8+)
- README
- Configuration examples
- Verified with registry

**Deliverable**: 2-3 Virtual-Media components

### Day 4: Cross-team Testing
- [ ] Both teams run each other's components locally
- [ ] Verify types are compatible
- [ ] Test error handling from other team's component

### Owner: OpenDash team (extraction) + Virtual-Media team (new builds)
**Effort**: 80h total (OpenDash: 40h, Virtual-Media: 40h)

---

## Week 3: Integration & Dashboard Loading

### Days 1-2: Dashboard Integration
- [ ] Update `apps/opendash/src/dashboard.ts` to import all components
  - 5 OpenDash components
  - 2-3 Virtual-Media components
- [ ] Register all with ComponentRegistry
- [ ] Test `registry.fetchAll()` loads all

**Deliverable**: Dashboard loads mixed components

### Days 2-3: Graceful Error Handling
- [ ] Test component failure scenarios
  - One component missing API key → returns error item
  - One component API down → returns error item
  - Verify dashboard still loads other components
- [ ] Write integration tests for error cases

**Deliverable**: 5+ integration tests with error scenarios

### Days 3-4: Configuration & Environment
- [ ] Verify environment variable passing works
- [ ] Test brandConfig for customization
- [ ] Document required env vars per component
- [ ] Create `.env.example` with all needed keys

**Deliverable**: Configuration documented and tested

### Day 5: Documentation
- [ ] Create `COMPONENT-INTEROP-GUIDE.md` (developer setup)
- [ ] Update `Standards/opendash-virtual-media-component-interop.md` with findings
- [ ] Document monorepo setup in README

**Deliverable**: Complete developer guide

### Owner: Both teams (collaborative)
**Effort**: 60h (OpenDash: 30h, Virtual-Media: 30h)

---

## Week 4: Validation & Handoff

### Days 1-2: End-to-End Testing
- [ ] All 7-8 components load on dashboard
- [ ] All briefing items display correctly
- [ ] Error handling verified
- [ ] Run full test suite: `pnpm -r test`

**Checklist**:
- [ ] Dashboard launches without errors
- [ ] All components show in briefing panel
- [ ] OpenDash components display revenue/ads/email items
- [ ] Virtual-Media components display video items
- [ ] One component failure doesn't block others
- [ ] All tests pass
- [ ] No console errors

### Days 2-3: Performance & Monitoring
- [ ] Measure `fetchAll()` time with all components
- [ ] Verify parallel fetching (Promise.allSettled)
- [ ] Check bundle size impact
- [ ] Document performance characteristics

**Acceptance criteria**:
- [ ] All components fetch within 3s timeout
- [ ] <1MB bundle size increase

### Days 3-4: Documentation & Findings
- [ ] Write validation report
  - What worked
  - What surprised us
  - What to improve
- [ ] Document monorepo maintenance patterns
- [ ] Create troubleshooting guide

### Day 5: Phase 2 Retrospective
- [ ] Team meeting: lessons learned
- [ ] Decide on Phase 3 path (stay monorepo, npm, private registry?)
- [ ] Plan next steps

**Deliverable**: Validation report + decision on Phase 3

### Owner: Both teams + product lead
**Effort**: 40h (OpenDash: 20h, Virtual-Media: 20h)

---

## Success Criteria (Phase 1-2 Complete)

| Criterion | Target | Proof |
|-----------|--------|-------|
| **Components built** | 7-8 working components | Packages in `packages/` |
| **SDK stable** | Zero breaking changes | Same interface week 1-4 |
| **Tests written** | 8+ per component | Coverage >90% |
| **Integration tests** | 10+ mixed-team tests | All passing |
| **Dashboard loads** | All components on one page | Briefing items display |
| **Error handling** | Single failure non-blocking | Tests verify |
| **Documentation** | Complete setup guide | COMPONENT-INTEROP-GUIDE.md |
| **Performance** | <3s fetch time | Measured & reported |

---

## Critical Path

```
Week 1: SDK + Stripe extraction (blocker)
  ↓
Week 2: 4 more extractions (parallel) + Virtual-Media builds
  ↓
Week 3: Integration & testing (both teams)
  ↓
Week 4: Validation & Phase 3 decision
```

---

## Resource Allocation

### OpenDash Team
- **Week 1**: 1-2 people on SDK + Stripe (40h)
- **Week 2**: 1-2 people on 4 more components (40h)
- **Week 3**: 1 person on integration, 1 on docs (30h)
- **Week 4**: 1 person on testing, 1 on retrospective (20h)
- **Total**: ~130h (1.5 people × 4 weeks)

### Virtual-Media Team
- **Week 1**: Planning & setup (5h)
- **Week 2**: Build 2-3 components (40h)
- **Week 3**: Integration testing & config (30h)
- **Week 4**: Validation & retrospective (20h)
- **Total**: ~95h (1 person × 4 weeks)

---

## Decision: Phase 3 Distribution (Week 4)

At end of Week 4, decide:

| Option | If... |
|--------|-------|
| **Stay monorepo** | Teams want tight integration, low ops overhead |
| **Publish to npm** | Ready for public use, want distribution scale |
| **Private registry** | Want access control, not ready for public |
| **Separate repos** | Teams want independence, coordination overhead OK |

**Decision timing**: End of Week 4
**Decision makers**: Both team leads + product

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Interface misunderstanding | Components don't work together | Design review day 2 of Week 1 |
| Extraction complexity | Slow component build | Use extraction template |
| Config/env variable chaos | Dashboard won't start | Centralize .env example |
| Performance issues | Slow dashboard load | Profile week 3, optimize week 4 |
| Documentation gaps | Hard for others to use | Write guide while building |

---

## Handoff: Phase 3

Once Phase 1-2 complete:

**If staying in monorepo:**
- Establish component review process
- Set up CI/CD per package
- Plan pnpm/npm publishing

**If extracting to npm:**
- Create separate repos
- Set up package publishing
- Docs on version management

**If using private registry:**
- Choose platform (GitHub Packages, Artifactory, etc.)
- Configure access control
- Set up CI/CD publishing

---

## Appendix: Week-by-Week Milestones

### Week 1 Milestone: "SDK + 1 Component"
- [ ] SDK complete and typed
- [ ] Stripe component working
- [ ] Registry handles one component
- [ ] Tests passing

### Week 2 Milestone: "OpenDash + Virtual-Media"
- [ ] 5 OpenDash components extracted
- [ ] 2-3 Virtual-Media components built
- [ ] All components independently tested
- [ ] Mix of components registering together

### Week 3 Milestone: "Dashboard Integration"
- [ ] All components loading on dashboard
- [ ] Error handling verified
- [ ] Configuration documented
- [ ] Developer guide complete

### Week 4 Milestone: "Validation + Decision"
- [ ] All tests passing
- [ ] Performance acceptable
- [ ] Phase 3 approach decided
- [ ] Lessons learned documented
