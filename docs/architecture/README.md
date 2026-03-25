# Architecture & Design

Technical deep-dives into OpenDash architecture, design patterns, and system decisions.

## Files

| Document | Topic | Focus | Depth |
|----------|-------|-------|-------|
| [TECHNICAL-ARCHITECTURE-REVIEW.md](./TECHNICAL-ARCHITECTURE-REVIEW.md) | Full system architecture | Production-ready assessment | Comprehensive |
| [DATASOURCES-VS-PRIME-ARCHITECTURE.md](./DATASOURCES-VS-PRIME-ARCHITECTURE.md) | Plugin system design | Datasource architecture | Technical |
| [DECLARATIVE-ARCHITECTURE-ASSESSMENT.md](./DECLARATIVE-ARCHITECTURE-ASSESSMENT.md) | Dashboard config approach | YAML declarative system | Design |
| [ARCHITECTURE-REVIEW-data-integrity-schema.md](./ARCHITECTURE-REVIEW-data-integrity-schema.md) | Data integrity patterns | Zod + Drizzle ORM | Type safety |
| [ARCHITECTURE-ROADMAP.md](./ARCHITECTURE-ROADMAP.md) | Evolution plan | Future improvements | Strategic |

## Core Concepts

**Three-Panel HUD Architecture**
→ Context panel, morning briefing, analytics dashboard
→ See [TECHNICAL-ARCHITECTURE-REVIEW.md](./TECHNICAL-ARCHITECTURE-REVIEW.md)

**Datasource Plugin System**
→ Pluggable components for fetching data from external APIs
→ See [DATASOURCES-VS-PRIME-ARCHITECTURE.md](./DATASOURCES-VS-PRIME-ARCHITECTURE.md)

**Data Integrity**
→ Type-safe validation with Zod, database queries with Drizzle ORM
→ See [ARCHITECTURE-REVIEW-data-integrity-schema.md](./ARCHITECTURE-REVIEW-data-integrity-schema.md)

## Related Directories

- **[strategy/](../strategy/)** — Product strategy & business decisions
- **[standards/](../../Standards/)** — Formal standards & specifications
- **[research/](../research/)** — Analysis & findings
- **[audits/](../audits/)** — Code quality & architecture reviews

---

**📍 Navigation**: [← Back to Docs Index](../README.md)
