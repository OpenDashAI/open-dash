# OpenDash Standards Index

Standards for architecture, code quality, and operations patterns across OpenDash.

---

## Multi-Tenant Architecture (2026-03-24)

**opendash-org-rbac-architecture.md**
- Org/team/brand data model (three-layer multi-tenant)
- RBAC permission matrix (owner, editor, viewer)
- Data scoping pattern (every query filtered by orgId)
- Tier limits enforcement (starter/pro/enterprise)
- Soft-delete patterns (active flags, archived timestamps)
- API contract patterns (org, team, brand endpoints)
- Key design decisions:
  - Manual D1 tables (vs Clerk Organizations)
  - Path-based routing (vs subdomains)
  - JSON config fields (vs separate tables)
  - acceptedAt for invitation tracking

**opendash-rbac-implementation-patterns.md**
- Three-tier permission model (owner/editor/viewer)
- Permission checking patterns (check, require, requireRole)
- Auth context loading pattern
- Tier limit enforcement before create
- Org creation with auto-owner assignment
- Team invitation with pending acceptance
- API response sanitization (exclude sensitive fields)
- Signup integration (auto-create org on signup)
- Common validation patterns (email, domain, slug, role)
- Middleware integration flow
- Testing patterns (unit + integration)
- Future considerations (custom roles, audit logging)

---

## Data Integrity (From Epic #14)

**opendash-data-integrity-patterns.md**
- Zod schema patterns for validation
- Drizzle ORM query patterns
- D1 migration strategy
- Type-safe database operations
- Alert rule evaluation
- Trend analysis and anomaly detection

---

## Component SDK & Ecosystem (2026-03-25)

**component-sdk-spec.md**
- Component interface definition (id, name, icon, fetch, requiresConfig)
- BriefingItem and ComponentConfig types
- Component registry pattern with error isolation
- Configuration patterns (env vars + brand config)
- Error handling and graceful degradation
- Security guidelines for component isolation
- Performance expectations (latency, memory, API calls)
- Marketplace metadata format
- Migration guide for existing datasources

**COMPONENT-ECOSYSTEM-VALIDATION.md**
- Proof of concept: end-to-end architecture working
- Registry pattern validation (parallel fetch, error isolation)
- Extraction proof: stripe-revenue component working
- 15 existing datasources ready for extraction
- Marketplace registry and discovery API spec
- Roadmap: Phase 2 (extract components), Phase 3 (marketplace), Phase 4 (monetization)
- Developer experience patterns (npm workflow)
- Security sandboxing model
- Community contribution guidelines

---

## Go-To-Market Strategies (2026-03-25)

**component-ecosystem-gtm-strategies.md**
- Four comprehensive GTM approaches for the ecosystem:
  1. Pure Open Source (CNCF model - Kubernetes style)
  2. Open Core (Docker model - proprietary marketplace + SaaS)
  3. Community-First (Linux kernel model - maintainer-led)
  4. Developer Tools (npm/Homebrew model - package manager focus)
- Comparison matrix, revenue projections, timeline, effort estimates
- Recommendation: Start with Developer Tools → Evolve to Open Core
- Implementation roadmap (6-12 months to profitability)
- Success metrics for each strategy
- GitHub issues created for execution (Epic #85, Issues #86-94)

---

**Last Updated**: 2026-03-25
**Total Standards**: 5
