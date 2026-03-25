# Architecture Documentation

Comprehensive guide to OpenDash technical architecture, design decisions, and system design.

**Quick Navigation**: [← Back to Docs](../README.md) | [Quick Start](../QUICK-START.md)

---

## What's Here

This section contains architecture documentation explaining **how OpenDash works internally**, including:
- Core system design and data flow
- Datasource plugin architecture
- Permission and RBAC system
- Data integrity and schema design
- Technical decision logs

**Use this section if you need to**:
- Understand how components fit together
- Extend or modify core systems
- Make architectural decisions
- Understand data flow and dependencies

---

## Core Architecture

### High-Level Overview
Start here to understand the overall system design.

| Document | Focus | Time |
|----------|-------|------|
| [TECHNICAL-ARCHITECTURE-REVIEW.md](./TECHNICAL-ARCHITECTURE-REVIEW.md) | Complete system architecture (production-ready assessment) | 15 min |
| [ARCHITECTURE-INDEX.md](./ARCHITECTURE-INDEX.md) | Architecture decision index | 5 min |
| [ARCHITECTURE-PLAN-SUMMARY.md](./ARCHITECTURE-PLAN-SUMMARY.md) | Architecture planning summary | 5 min |

### System Design

| Document | Topic | Depth |
|----------|-------|-------|
| [DATASOURCES-VS-PRIME-ARCHITECTURE.md](./DATASOURCES-VS-PRIME-ARCHITECTURE.md) | Datasource plugin system design | Technical |
| [DECLARATIVE-ARCHITECTURE-ASSESSMENT.md](./DECLARATIVE-ARCHITECTURE-ASSESSMENT.md) | Dashboard YAML declarative approach | Design |
| [ARCHITECTURE-REVIEW-data-integrity-schema.md](./ARCHITECTURE-REVIEW-data-integrity-schema.md) | Data integrity, Zod validation, Drizzle schema | Type Safety |

### Subsystems

| Document | System | Purpose |
|----------|--------|---------|
| [ARCHITECTURE-PERMISSION-MODEL.md](./ARCHITECTURE-PERMISSION-MODEL.md) | Permission system | RBAC and team-based access control |
| [ARCHITECTURE-ROADMAP.md](./ARCHITECTURE-ROADMAP.md) | Evolution plan | Future architectural improvements |

---

## Key Concepts

### 1. Datasources
OpenDash uses a **plugin-based datasource system** where each integration (Stripe, GA4, Google Ads, etc.) implements the `DataSource` interface.

- **What**: Pluggable data adapters for different integrations
- **How**: Datasources fetch data → transform → store in D1
- **Why**: Makes adding new sources easy without core changes
- **Doc**: [DATASOURCES-VS-PRIME-ARCHITECTURE.md](./DATASOURCES-VS-PRIME-ARCHITECTURE.md)

### 2. Multi-User & RBAC
OpenDash supports multiple teams within an organization with role-based access control.

- **What**: Organizations contain teams; teams have users with roles (owner, editor, viewer)
- **How**: Middleware validates user permissions before allowing access
- **Why**: Required for B2B product (multiple teams, shared data)
- **Doc**: [../org-rbac-model.md](../org-rbac-model.md)

### 3. Data Flow
```
External Services (Stripe, GA4, etc)
    ↓
Datasources (transform & validate)
    ↓
D1 Database (persist metrics)
    ↓
API Routes (serve to dashboard)
    ↓
Dashboard (visualize)
```

### 4. Dashboard Configuration
Dashboards are defined via **YAML or JSON** allowing declarative layout definitions.

- **What**: Declare dashboard structure without coding UI
- **How**: Parser reads config → renders components → connects to datasources
- **Why**: Enables customization without full redeploy
- **Doc**: [DECLARATIVE-ARCHITECTURE-ASSESSMENT.md](./DECLARATIVE-ARCHITECTURE-ASSESSMENT.md)

### 5. Data Integrity
All data is validated at boundaries using Zod schemas.

- **What**: Input validation (API requests), output validation (datasource responses), schema validation (D1 persistence)
- **How**: Zod schemas define contracts at each layer
- **Why**: Prevents bad data from corrupting database
- **Doc**: [ARCHITECTURE-REVIEW-data-integrity-schema.md](./ARCHITECTURE-REVIEW-data-integrity-schema.md)

---

## Architecture Decisions

### Past Decisions (Completed)
- ✅ **Datasource plugins over monolithic**: Easier to add new sources
- ✅ **D1 for metrics persistence**: Cloudflare-native, no external DB needed
- ✅ **Zod for validation**: Type-safe runtime validation
- ✅ **RBAC for team access**: Multi-tenant from day one
- ✅ **Service bindings for Scram Jet**: RPC > HTTP for internal pipelines

### Pending Decisions
- ⏳ **Component marketplace architecture**: How to host/discover components
- ⏳ **Real-time sync strategy**: WebSocket vs polling for live updates
- ⏳ **Custom report builder UI**: Drag-drop or declarative DSL?

---

## Related Documentation

### Strategy & Planning
- [../strategy/B2B-STRATEGIC-BUNDLE.md](../strategy/B2B-STRATEGIC-BUNDLE.md) - Product strategy (includes architectural assumptions)
- [../strategy/PRODUCT.md](../strategy/PRODUCT.md) - Feature set driving architecture

### Implementation
- [../execution/EXECUTION_PLAN_EPIC27.md](../execution/EXECUTION_PLAN_EPIC27.md) - How to build what's designed here
- [../setup/D1_SETUP.md](../setup/D1_SETUP.md) - Database schema & migrations

### Components
- [../components/README.md](../components/) - Component ecosystem (uses this architecture)
- [../../Standards/component-sdk-spec.md](../../Standards/component-sdk-spec.md) - Component interface contracts

### Audits & Reviews
- [../audits/](../audits/) - Code quality & security reviews
- [../research/TECHNICAL-DEBT-ROADMAP.md](../research/TECHNICAL-DEBT-ROADMAP.md) - Known tech debt

---

## File Structure

```
docs/architecture/
├── README.md (you are here)
├── TECHNICAL-ARCHITECTURE-REVIEW.md
├── ARCHITECTURE-INDEX.md
├── ARCHITECTURE-PLAN-SUMMARY.md
├── ARCHITECTURE-PERMISSION-MODEL.md
├── DATASOURCES-VS-PRIME-ARCHITECTURE.md
├── DECLARATIVE-ARCHITECTURE-ASSESSMENT.md
├── ARCHITECTURE-REVIEW-data-integrity-schema.md
└── ARCHITECTURE-ROADMAP.md
```

---

## Common Questions

**Q: How do I add a new datasource?**
A: See the DataSource interface definition in [DATASOURCES-VS-PRIME-ARCHITECTURE.md](./DATASOURCES-VS-PRIME-ARCHITECTURE.md) and follow the implementation pattern.

**Q: Where's the permission system code?**
A: [ARCHITECTURE-PERMISSION-MODEL.md](./ARCHITECTURE-PERMISSION-MODEL.md) has the design; implementation is in `src/middleware/auth.ts`.

**Q: Can we change the database schema?**
A: Yes, but through migrations. See [../setup/D1_SETUP.md](../setup/D1_SETUP.md).

**Q: What's the scope of the RBAC system?**
A: [../org-rbac-model.md](../org-rbac-model.md) has the full model. Short: org → teams → users → roles.

---

## Before You Code

**Architecture decisions should**:
1. Be documented here before implementation
2. Be reviewed against existing patterns
3. Consider scale & extensibility
4. Be backward-compatible if possible
5. Include a "why" explanation (not just "what")

**To propose a change**:
1. Open an issue with "architecture:" prefix
2. Reference this section and related docs
3. Explain the problem being solved
4. Propose alternatives
5. Link to issue from relevant architecture doc

---

## See Also

- 📚 [Complete Documentation Index](../README.md)
- ⚡ [Quick Start](../QUICK-START.md)
- 🏗️ [Deployment](../deployment/)
- 🧩 [Components](../components/)
- 📊 [Setup & Infrastructure](../setup/)

---

**Last updated**: 2026-03-25
**Maintainers**: Architecture team
**Issues**: Use `docs:architecture:` prefix for architecture-related issues
