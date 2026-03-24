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

**Last Updated**: 2026-03-24
**Total Standards**: 2
