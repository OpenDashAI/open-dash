# OpenDash Documentation Organization Plan

**Status**: In Progress
**Last Updated**: 2026-03-25
**Goal**: Systematically organize 80+ documents into coherent categories with READMEs and cross-linking

---

## Executive Summary

OpenDash has accumulated comprehensive documentation (80+ files) across strategy, architecture, execution, and operations. However, many root-level documents remain scattered, making navigation difficult. This plan reorganizes documentation into clear categories with dedicated READMEs and explicit cross-linking.

---

## Current State Analysis

### Root-Level Scattered Documents (18 files)
These need categorization or moving:

| Document | Category | Action |
|----------|----------|--------|
| ARCHITECTURE-INDEX.md | Architecture | Move → docs/architecture/ |
| ARCHITECTURE-PERMISSION-MODEL.md | Architecture | Move → docs/architecture/ |
| ARCHITECTURE-PLAN-SUMMARY.md | Architecture | Move → docs/architecture/ |
| COMPONENT-ARCHITECTURE-ROADMAP.md | Components | Move → docs/components/ |
| COMPONENT-REACTIVITY-ARCHITECTURE.md | Components | Move → docs/components/ |
| COMPOSITION-IMPLEMENTATION-GUIDE.md | Components | Move → docs/components/ |
| DEPLOYMENT-AUTOMATION-SETUP.md | Deployment | Move → docs/deployment/ |
| DEPLOYMENT-CHECKLIST.md | Deployment | Move → docs/deployment/ |
| DEPLOYMENT-PATTERNS-RESEARCH.md | Deployment | Move → docs/deployment/ |
| DEPLOYMENT-STANDARD-PROCEDURE.md | Deployment | Move → docs/deployment/ |
| EXAMPLES-OVERVIEW.md | Components | Move → docs/components/ |
| IMPLEMENTATION-COMPLETE-SUMMARY.md | Archive | Move → docs/archive/completed/ |
| NEXT-ACTIONS-COMPONENT-ARCHITECTURE.md | Components | Move → docs/components/ |
| PERMISSION-SYSTEM-RESEARCH.md | Architecture | Move → docs/architecture/ |
| SMOKE-TEST-BASELINE.md | Testing | Move → docs/testing/ |
| START-HERE-TASK-109.md | Archive | Move → docs/archive/completed/ |
| TASK-115-COMPLETE.md | Archive | Move → docs/archive/completed/ |
| TASK-117-COMPLETE.md | Archive | Move → docs/archive/completed/ |
| TASK-118-COMPLETE.md | Archive | Move → docs/archive/completed/ |
| WEEK1-TASK3-DEPLOYMENT-SUMMARY.md | Archive | Move → docs/archive/completed/ |
| CLAUDE.md | Root | Keep at root (project config) |

---

## Target Organization Structure

```
open-dash/
├── docs/
│   ├── README.md                          [✓ exists - main index]
│   ├── QUICK-START.md                     [NEW - entry point]
│   ├── architecture/
│   │   ├── README.md                      [NEW - architecture category]
│   │   ├── TECHNICAL-ARCHITECTURE-REVIEW.md    [✓ exists]
│   │   ├── ARCHITECTURE-INDEX.md          [MOVE from root]
│   │   ├── ARCHITECTURE-PERMISSION-MODEL.md   [MOVE from root]
│   │   ├── ARCHITECTURE-PLAN-SUMMARY.md   [MOVE from root]
│   │   └── ... (existing architecture docs)
│   │
│   ├── components/
│   │   ├── README.md                      [NEW - components category]
│   │   ├── COMPONENT-ARCHITECTURE-ROADMAP.md  [MOVE from root]
│   │   ├── COMPONENT-REACTIVITY-ARCHITECTURE.md [MOVE from root]
│   │   ├── COMPOSITION-IMPLEMENTATION-GUIDE.md [MOVE from root]
│   │   ├── EXAMPLES-OVERVIEW.md           [MOVE from root]
│   │   ├── NEXT-ACTIONS-COMPONENT-ARCHITECTURE.md [MOVE from root]
│   │   └── ... (component ecosystem docs)
│   │
│   ├── deployment/
│   │   ├── README.md                      [NEW - deployment category]
│   │   ├── DEPLOYMENT-AUTOMATION-SETUP.md [MOVE from root]
│   │   ├── DEPLOYMENT-CHECKLIST.md        [MOVE from root]
│   │   ├── DEPLOYMENT-PATTERNS-RESEARCH.md [MOVE from root]
│   │   ├── DEPLOYMENT-STANDARD-PROCEDURE.md [MOVE from root]
│   │   └── ... (existing deployment docs)
│   │
│   ├── testing/
│   │   ├── README.md                      [NEW - testing category]
│   │   ├── SMOKE-TEST-BASELINE.md         [MOVE from root]
│   │   └── ... (testing/QA docs)
│   │
│   ├── archive/
│   │   ├── README.md                      [✓ exists]
│   │   ├── completed/
│   │   │   ├── README.md                  [NEW - completed tasks]
│   │   │   ├── IMPLEMENTATION-COMPLETE-SUMMARY.md [MOVE from root]
│   │   │   ├── START-HERE-TASK-109.md     [MOVE from root]
│   │   │   ├── TASK-115-COMPLETE.md       [MOVE from root]
│   │   │   ├── TASK-117-COMPLETE.md       [MOVE from root]
│   │   │   ├── TASK-118-COMPLETE.md       [MOVE from root]
│   │   │   └── WEEK1-TASK3-DEPLOYMENT-SUMMARY.md [MOVE from root]
│   │   └── ... (existing archive docs)
│   │
│   ├── strategy/ [✓ exists]
│   ├── execution/ [✓ exists]
│   ├── roadmaps/ [✓ exists]
│   ├── setup/ [✓ exists]
│   ├── guides/ [✓ exists]
│   ├── audits/ [✓ exists]
│   ├── competitive-intel/ [✓ exists]
│   ├── research/ [✓ exists]
│   └── status/ [✓ exists]
│
├── Standards/                              [✓ exists - formal specs]
├── workers/                                [✓ exists with READMEs]
└── CLAUDE.md                               [✓ keep at root]
```

---

## New Category READMEs to Create

### 1. docs/QUICK-START.md (NEW)
**Purpose**: Entry point for new team members
**Content**:
- What is OpenDash in 30 seconds
- Quick navigation to 3 most important docs
- Setup instructions (5 min)
- Links to deeper docs

### 2. docs/architecture/README.md (NEW)
**Purpose**: Architecture category navigation
**Content**:
- Architecture decision log
- Core concepts (datasources, components, permissions)
- How architecture docs relate to each other
- Links to technical deep-dives

### 3. docs/components/README.md (NEW)
**Purpose**: Component ecosystem navigation
**Content**:
- Component system overview
- Ecosystem maturity (draft/beta/stable)
- How to build a component (link to guide)
- Component SDK reference
- Links to example components

### 4. docs/deployment/README.md (NEW)
**Purpose**: Deployment documentation entry
**Content**:
- Deployment checklist
- Automation setup guide
- Standard deployment procedure
- Common deployment patterns
- Troubleshooting

### 5. docs/testing/README.md (NEW)
**Purpose**: Testing & QA documentation
**Content**:
- Testing strategy
- Smoke test baseline
- Test types (unit, integration, e2e)
- How to add tests
- CI/CD pipeline overview

### 6. docs/archive/completed/README.md (NEW)
**Purpose**: Historical completed work
**Content**:
- Index of completed tasks
- How to learn from completed work
- Archive dates and context
- Links to related current work

---

## Cross-Linking Strategy

### Links to Add

**From each category README to**:
- docs/README.md (main index)
- Related category READMEs
- Specific documents within category
- docs/QUICK-START.md (from category READMEs)

**From main docs/README.md to**:
- All 8 category READMEs
- docs/QUICK-START.md (first entry point)

**From root README.md to**:
- docs/QUICK-START.md (first stop)
- docs/README.md (comprehensive index)

---

## Implementation Checklist

### Phase 1: Create New READMEs (This Session)
- [ ] docs/QUICK-START.md - New entry point
- [ ] docs/architecture/README.md - Architecture category
- [ ] docs/components/README.md - Components category
- [ ] docs/deployment/README.md - Deployment category
- [ ] docs/testing/README.md - Testing category
- [ ] docs/archive/completed/README.md - Completed work

### Phase 2: Move Documents
- [ ] Move architecture docs from root to docs/architecture/
- [ ] Move component docs from root to docs/components/
- [ ] Move deployment docs from root to docs/deployment/
- [ ] Move testing docs from root to docs/testing/
- [ ] Move completed task docs to docs/archive/completed/

### Phase 3: Update Cross-Linking
- [ ] Update docs/README.md to reference new category READMEs
- [ ] Add "See also" sections to related documents
- [ ] Add breadcrumb navigation to category READMEs
- [ ] Update root README.md with link to docs/QUICK-START.md

### Phase 4: Validation
- [ ] Check all links are valid
- [ ] Verify no broken references
- [ ] Test navigation flow
- [ ] Update MEMORY.md with new structure

---

## Key Decisions

1. **Keep root-level scattered docs**? No. Move to appropriate categories.
2. **Create new categories**? Yes - testing, components (formalize), deployment (consolidate).
3. **Archive old docs**? Yes - move completed task docs to archive/completed/.
4. **Entry point structure**? Tiered:
   - New users → docs/QUICK-START.md (5 min)
   - Deep dives → docs/README.md (comprehensive index)
   - Category-specific → category READMEs (focused)

---

## Success Criteria

- [ ] All scattered root docs have a home
- [ ] Each category has a dedicated README
- [ ] Cross-linking is comprehensive (no orphaned docs)
- [ ] Navigation is clear (can reach any doc in 2-3 clicks)
- [ ] New users can get started in <5 minutes via QUICK-START.md
- [ ] Technical decisions are traceable through architecture docs
- [ ] Component system is clearly described

---

## Document Statistics (Target)

**After reorganization**:
- 8 category READMEs (new)
- 1 QUICK-START.md (new)
- 80+ existing documents organized
- Comprehensive cross-linking
- Clear entry points for different user types

---

## Next Steps

1. **Now**: Create all 6 new category READMEs
2. **Next**: Move documents to correct categories
3. **Then**: Update cross-linking and main index
4. **Final**: Validate and test navigation
