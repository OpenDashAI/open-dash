# Documentation Organization Plan

## Proposed Directory Structure

```
docs/
├── README.md                           # Master index (COMPLETE)
├── GUIDE-Getting-Started.md            # 10-step onboarding (COMPLETE)
├── ORGANIZATION-PLAN.md                # This file
│
├── guides/                             # User guides & deployment
│   ├── DEPLOYMENT.md
│   ├── DEPLOYMENT-GUIDE.md
│   ├── USER_GUIDE.md
│   ├── ODA-GUIDE.md
│   ├── ODA-QUICKREF.md
│   └── SECURITY-MIDDLEWARE-GUIDE.md
│
├── setup/                              # Service setup guides
│   ├── D1_SETUP.md
│   ├── CI_CD_SETUP.md
│   ├── SENTRY_SETUP.md
│   ├── EMAIL_PROVIDER_SETUP.md
│   └── GRAFANA-INTEGRATION.md
│
├── architecture/                       # Architecture & design
│   ├── TECHNICAL-ARCHITECTURE-REVIEW.md
│   ├── ARCHITECTURE-ROADMAP.md
│   ├── ARCHITECTURE-REVIEW-data-integrity-schema.md
│   ├── DATASOURCES-VS-PRIME-ARCHITECTURE.md
│   └── DECLARATIVE-ARCHITECTURE-ASSESSMENT.md
│
├── strategy/                           # Strategic documents
│   ├── PRODUCT.md
│   ├── B2B-STRATEGIC-BUNDLE.md
│   ├── STRATEGIC-PIVOT-ANALYSIS.md
│   ├── STRATEGIC-REVIEW-SUMMARY.md
│   ├── LIFETIME-DEALS-STRATEGY.md
│   ├── BATCH-6-GROWTH-ENGINE.md
│   └── OPENDASH-IN-ATLAS-ECOSYSTEM.md
│
├── roadmaps/                           # Plans & roadmaps
│   ├── 90-DAY-ROADMAP.md
│   ├── PROJECT-PLAN-2026.md
│   ├── ROADMAP-OVERVIEW.md
│   ├── NEXT-CYCLE-PRIORITIES.md
│   │
│   ├── weekly/
│   │   ├── WEEK1-MVP-LAUNCH-PLAN.md
│   │   └── WEEK3-FOUNDER-VALIDATION-PLAN.md
│   │
│   ├── phases/
│   │   ├── PHASE1-DASHBOARD-YAML.md
│   │   ├── PHASE2-DYNAMIC-DATASOURCES.md
│   │   ├── PHASE3-ROUTES-UI.md
│   │   └── PHASE4-HYBRID-CONFIG-LOADER.md
│   │
│   └── epics/
│       ├── EPIC-27-B2B-INTELLIGENCE-PLATFORM.md
│       └── EPIC-MVP-LAUNCH.md
│
├── competitive-intel/                  # Competitive intelligence
│   ├── COMPETITIVE-INTELLIGENCE-SYSTEM.md
│   ├── COMPETITOR-INTELLIGENCE-SYSTEM.md
│   ├── COMPETITIVE-INTEL-CLOUDFLARE-EDITION.md
│   ├── COMPETITOR-INTEL-OPERATIONS.md
│   ├── COMPETITIVE-INTELLIGENCE-QUICKSTART.md
│   ├── COMPETITIVE-INTELLIGENCE-README.md
│   └── MARKETING-INTELLIGENCE-PIPELINE.md
│
├── audits/                             # Reviews & audits
│   ├── ACCESSIBILITY-AUDIT.md
│   ├── PERFORMANCE-AUDIT.md
│   ├── SECURITY-SECRETS-AUDIT.md
│   │
│   ├── templates/
│   │   ├── TECHNICAL-REVIEW-TEMPLATE.md
│   │   ├── SECURITY-REVIEW-TEMPLATE.md
│   │   ├── PERFORMANCE-REVIEW-TEMPLATE.md
│   │   ├── ACCESSIBILITY-REVIEW-TEMPLATE.md
│   │   └── INFRASTRUCTURE-REVIEW-TEMPLATE.md
│   │
│   ├── review-system/
│   │   ├── REVIEW-SYSTEM-OVERVIEW.md
│   │   ├── REVIEW-SYSTEM-INDEX.md
│   │   ├── REVIEW-PROCESS-GUIDE.md
│   │   ├── REVIEW-RECOMMENDATIONS-TRACKER.md
│   │   ├── UNIFIED-REVIEW-FRAMEWORK.md
│   │   └── UNIFIED-REVIEW-TRACKER.md
│   │
│   └── logs/
│       └── ARCHITECTURE-REVIEW-LOG.md
│
├── research/                           # Analysis & findings
│   ├── OPEN-SOURCE-RESEARCH-FINDINGS.md
│   ├── ANALYTICS-BUSINESS-CASE.md
│   ├── TECHNICAL-DEBT-ROADMAP.md
│   ├── SYSTEMATIC-REVIEW-2026-03-24.md
│   └── PROJECT-PLAN-DIAGRAMS.md
│
├── execution/                          # Execution plans & checklists
│   ├── COMPLETE_EXECUTION_PLAN.md
│   ├── EXECUTION_PLAN_EPIC27.md
│   ├── EXECUTION-CHECKLIST.md
│   └── STARTUP-VERIFICATION.md
│
├── status/                             # Status tracking
│   ├── STATUS.md
│   ├── MVP-LAUNCH-STATUS.md
│   ├── PROGRESS-REVIEW-AND-ATLAS-INTEGRATION.md
│   ├── PROGRESS-REVIEW-TEMPLATE.md
│   ├── GITHUB-ISSUES-SUMMARY.md
│   ├── GITHUB-ISSUES-UPDATE.md
│   └── CREATED-ISSUES-SUMMARY.md
│
└── archive/                            # Older/deprecated documents
    ├── EXECUTIVE-SUMMARY.md
    ├── DEPLOYMENT-READY.md
    └── README.md (moved from root)
```

## Consolidation Opportunities

### Files to Consolidate

1. **Deployment guides** (3 files → 1):
   - DEPLOYMENT.md + DEPLOYMENT-GUIDE.md + DEPLOYMENT-READY.md → guides/DEPLOYMENT.md
   - Keep as single source of truth

2. **Review documents** (8 files → 2):
   - Combine review templates into docs/audits/templates/
   - Combine review system docs into docs/audits/review-system/

3. **Execution plans** (3 files → 1):
   - COMPLETE_EXECUTION_PLAN.md is master
   - Archive EXECUTION_PLAN_EPIC27.md (redundant with Epic docs)
   - Keep EXECUTION-CHECKLIST.md as tactical reference

4. **Roadmaps** (4 files → 2):
   - 90-DAY-ROADMAP.md (keep)
   - PROJECT-PLAN-2026.md (keep)
   - ROADMAP-OVERVIEW.md (archive - redundant)
   - NEXT-CYCLE-PRIORITIES.md (keep as supplement)

### Files to Archive

Files that are templates or superseded:
- PROGRESS-REVIEW-TEMPLATE.md → docs/audits/templates/
- Various TEMPLATE.md files → docs/audits/templates/
- EXECUTIVE-SUMMARY.md → docs/archive/ (STRATEGIC-REVIEW-SUMMARY.md is more current)
- DEPLOYMENT-READY.md → docs/archive/ (covered by DEPLOYMENT.md)
- Any "updated" variants (use latest version, archive old)

## New Directory Sizes (Estimated)

| Directory | Files | Purpose |
|-----------|-------|---------|
| guides/ | 6 | User-facing documentation |
| setup/ | 5 | Service integration guides |
| architecture/ | 5 | Technical deep-dives |
| strategy/ | 7 | Business & product strategy |
| roadmaps/ | 12 | Plans, phases, epics, weekly |
| competitive-intel/ | 7 | CI system & operations |
| audits/ | 18 | Reviews, templates, review system |
| research/ | 5 | Analysis & findings |
| execution/ | 4 | Execution plans & checklists |
| status/ | 7 | Status tracking & progress |
| archive/ | 5 | Older/deprecated documents |
| **TOTAL** | **81** | All documents organized |

## Benefits

✅ **Navigability**: No more 80+ files in root
✅ **Discoverability**: Clear directory structure
✅ **Consolidation**: Removed redundant files
✅ **Maintainability**: Clear purpose per directory
✅ **Growth**: Can add more docs without clutter

## Next Steps

1. Create subdirectories
2. Move files (git mv preserves history)
3. Update links in README.md
4. Archive duplicate/old files
5. Commit as single "refactor: reorganize documentation"

---

**Status**: Proposal ready for implementation
**Estimated effort**: 1-2 hours
**Risk**: Low (git preserves all history)
