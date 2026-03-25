---
name: OpenDash Unified SaaS Platform Architecture
description: OpenDash is a composable SaaS platform for building intelligent, data-driven products (dashboard engine + component SDK + datasource plugins + market instances)
type: standards
---

# OpenDash: Unified SaaS Platform Architecture

**Decision Date**: 2026-03-25
**Status**: Strategic Architecture
**Applies To**: All OpenDash development, positioning, and product roadmap

---

## Core Vision

**OpenDash is a unified SaaS platform for building composable, intelligent products.**

Not a single product, but a **foundation** that enables:
- Building intelligence dashboards (briefings, analytics, monitoring)
- Building front-end applications (content creation, composition, design)
- Building data-driven products of any kind
- Extensibility through plugins, components, and datasources

---

## Platform Layers

### Layer 1: Foundation (Core Platform)
**What**: The composable building blocks

- **Dashboard Engine** — Declarative, YAML-based dashboard definitions
- **Component System** — SDK for building custom components
- **Datasource Plugin System** — Pluggable data adapters
- **Multi-user Infrastructure** — Organizations, teams, RBAC
- **State Management** — Reactive state, real-time updates
- **Rendering Engine** — Convert declarations to interactive UI

**Principle**: All features in this layer must be product-agnostic

### Layer 2: Plugin Ecosystem
**What**: Reusable, composable plugins that solve common problems

**Intelligence Plugins**:
- Stripe revenue integration
- GA4 traffic metrics
- Google Ads spend tracking
- Meta Ads performance
- GitHub issues status
- Cloudflare analytics
- Tailscale network metrics
- Email metrics
- Competitive intelligence

**Feature Plugins**:
- Alerts & anomaly detection
- Analytics & trending
- Team collaboration
- Billing integration
- Referral system
- Custom plugins (user-built)

**Principle**: All plugins use the datasource interface; they can be mixed and matched

### Layer 3: Market Instances
**What**: Specific SaaS products built on the platform

**Current Instances**:
1. **OpenDash Intelligence (Solo Founders)**
   - Target: Solo founders managing multiple projects
   - Core: Morning briefing dashboard
   - Plugins: Intelligence datasources
   - TAM: ~$50M

2. **OpenDash Intelligence (Marketing Teams)**
   - Target: Marketing operations teams, agencies
   - Core: Team briefing dashboard + collaboration
   - Plugins: Intelligence datasources + team features
   - TAM: ~$5B

**Future Instances** (proof of concept):
3. **Virtual-media** (Separate product, uses platform)
   - Uses: Dashboard engine + component system
   - For: Video composition and content creation
   - Proof: Platform can power different product types

**Principle**: Each instance is a configured deployment of the platform for a specific market/use case

### Layer 4: Dependent Products
**What**: Separate products that depend on the platform

- **Virtual-media** — Video composition and editing
  - Dependency: Dashboard engine, component system, multi-user infrastructure
  - Status: Separate product with own GTM
  - Integration: APIs to platform

---

## Key Architectural Decisions

### 1. Foundation First, Products Second
- Build the platform layer to be completely product-agnostic
- Market instances are just configurations of the same platform
- New market instances should require minimal new code (mostly plugins + UI config)

### 2. Plugins Over Monolith
- All datasources are plugins (not core)
- All features are plugins (not core)
- Core platform provides the composition engine

### 3. Multi-instance, Multi-market
- One codebase powers multiple market instances
- Each instance has its own:
  - Branding
  - Pricing
  - Plugin selection
  - Customization
  - But shares: Foundation, infrastructure, deployment

### 4. Composable Components
- Everything is a component (even datasources)
- Components have well-defined interfaces
- Users can build custom components using SDK

---

## What This Means

### It's NOT:
- ❌ A marketing intelligence tool (that's one instance)
- ❌ A video editor (that's Virtual-media, a separate product)
- ❌ A component library (that's the ecosystem)
- ❌ Just a dashboard tool (that's the foundation)

### It IS:
- ✅ A platform for building intelligent, composable products
- ✅ A foundation for multiple market instances
- ✅ An extensible ecosystem of plugins
- ✅ A base for dependent products (like Virtual-media)

---

## Repository Organization Implications

### Current State Issues
- Virtual-media mixed with intelligence features (should be separate)
- Composable components unclear (are they SDK samples? internal? products?)
- Multiple market instances not clearly separated

### Target State
```
opendash/                           ← Platform core + instances
├── src/
│   ├── core/                       ← Foundation (dashboard, components, datasources, multi-user)
│   ├── plugins/                    ← Plugin ecosystem (intelligence, alerts, etc)
│   ├── instances/
│   │   ├── intelligence-founders/  ← Market instance: solo founders
│   │   └── intelligence-teams/     ← Market instance: marketing teams
│   └── shared/                     ← Shared utilities
│
├── packages/
│   ├── @opendash/sdk               ← Component SDK for building custom components
│   ├── @opendash/plugin-stripe     ← Example plugin
│   ├── @opendash/plugin-ga4        ← Example plugin
│   └── ... (more plugins as packages)
│
├── Standards/
│   ├── component-sdk-spec.md       ← How to build components
│   ├── plugin-interface-spec.md    ← How to build plugins (NEW)
│   ├── datasource-interface-spec.md ← How to build datasources (NEW)
│   └── instance-configuration.md   ← How to create market instance (NEW)
│
└── Documentation/
    ├── Platform Overview            ← What is OpenDash?
    ├── Building Plugins             ← How to extend
    ├── Building Instances           ← How to create market instance
    └── Deployment                   ← How to run
```

Note: Virtual-media moves to separate repo with dependency on opendash core

---

## Messaging & Positioning

### For Different Audiences

**Platform Users** (building products on OpenDash):
> "Build intelligent, composable products without building infrastructure. Use our dashboard engine, component system, and plugin ecosystem."

**Market Instance Users** (using OpenDash Intelligence):
> "Get a complete intelligence briefing of your projects/campaigns in 5 minutes."

**Extension Builders** (building custom components/plugins):
> "Extend OpenDash with custom components and plugins using our SDK."

**Dependent Products** (using OpenDash foundation):
> "Built on the OpenDash platform, providing [specific value]."

---

## Validation

### How We Know This Is Right

1. ✅ **Virtual-media works** — Proves platform can power different product types
2. ✅ **Multiple market instances possible** — Founders version + Teams version from same codebase
3. ✅ **Component SDK exists** — Extensibility is real
4. ✅ **Datasource plugins work** — 9 integrations without modifying core
5. ✅ **Dashboard engine flexible** — YAML-based, can express different UIs

---

## Next Steps

1. **Reorganize repository** to reflect platform architecture
2. **Define plugin interface spec** (formalize how to write plugins)
3. **Define instance configuration** (formalize how to create market instances)
4. **Separate Virtual-media** to own repo with documented dependencies
5. **Update documentation** to position OpenDash as a platform
6. **Create "Build on OpenDash" section** in marketing

---

## Related Documents

- [component-sdk-spec.md](component-sdk-spec.md) — How to build components
- [DOCUMENTATION-ORGANIZATION-COMPLETE.md](../DOCUMENTATION-ORGANIZATION-COMPLETE.md) — How docs are organized
- [opendash_documentation_organization.md](../.claude/projects/-Users-admin-Work-atlas/memory/opendash_documentation_organization.md) — Memory of org structure
- Virtual-media documentation (separate repo)

---

**Version**: 1.0
**Owner**: Product/Architecture team
**Last Updated**: 2026-03-25
**Status**: Active - Guides all OpenDash development
