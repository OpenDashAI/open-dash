# Component Ecosystem Documentation

Guide to OpenDash component architecture, building components, and the component ecosystem.

**Quick Navigation**: [← Back to Docs](../README.md) | [Quick Start](../QUICK-START.md)

---

## What's Here

This section covers **how to build and integrate components** into OpenDash, including:
- Component system architecture and design
- SDK specification and interface contracts
- How to build a component (step-by-step)
- Example components and patterns
- Component discovery and marketplace

**Use this section if you need to**:
- Build a new component or plugin
- Understand the component system
- Integrate third-party components
- Design reusable UI patterns

---

## Getting Started

### Quick Start (for component builders)
1. **System overview** → [Component System Overview](#component-system-overview) (5 min)
2. **SDK spec** → [../../Standards/component-sdk-spec.md](../../Standards/component-sdk-spec.md) (15 min)
3. **Build your first component** → [COMPONENT-ARCHITECTURE-ROADMAP.md](./COMPONENT-ARCHITECTURE-ROADMAP.md) (20 min)
4. **See an example** → [../../packages/stripe-revenue/README.md](../../packages/stripe-revenue/README.md) (10 min)

---

## Component Architecture

### Core Documents

| Document | Topic | Focus |
|----------|-------|-------|
| [COMPONENT-ARCHITECTURE-ROADMAP.md](./COMPONENT-ARCHITECTURE-ROADMAP.md) | Component system evolution | Future direction & roadmap |
| [COMPONENT-REACTIVITY-ARCHITECTURE.md](./COMPONENT-REACTIVITY-ARCHITECTURE.md) | Reactive component design | State & reactivity patterns |
| [COMPOSITION-IMPLEMENTATION-GUIDE.md](./COMPOSITION-IMPLEMENTATION-GUIDE.md) | Composition patterns | How to compose components |
| [EXAMPLES-OVERVIEW.md](./EXAMPLES-OVERVIEW.md) | Component examples | Built-in examples & demos |
| [NEXT-ACTIONS-COMPONENT-ARCHITECTURE.md](./NEXT-ACTIONS-COMPONENT-ARCHITECTURE.md) | Next steps | Immediate action items |

### Standards & Specifications

| Document | Standard | Purpose |
|----------|----------|---------|
| [../../Standards/component-sdk-spec.md](../../Standards/component-sdk-spec.md) | SDK Specification | Formal component interface contract |
| [../../Standards/COMPONENT-ECOSYSTEM-VALIDATION.md](../../Standards/COMPONENT-ECOSYSTEM-VALIDATION.md) | Validation | Proof of concept & viability |
| [../../Standards/component-ecosystem-gtm-strategies.md](../../Standards/component-ecosystem-gtm-strategies.md) | Go-to-Market | 4 GTM strategies for components |
| [../../Standards/Index.md](../../Standards/Index.md) | Standards Index | All formal standards |

### Package Documentation

| Package | Location | Purpose |
|---------|----------|---------|
| @opendash/sdk | [../../packages/sdk/README.md](../../packages/sdk/README.md) | SDK and utilities |
| @opendash/stripe-revenue | [../../packages/stripe-revenue/README.md](../../packages/stripe-revenue/README.md) | Example component |

---

## Component System Overview

### What is a Component?

A **component** is a self-contained, pluggable extension to OpenDash that:
- Implements the `Component` interface (defined in SDK)
- Fetches data from an external API or data source
- Transforms data into dashboard-friendly format
- Validates input and output with Zod schemas
- Optionally provides UI visualization

### Example Components

OpenDash comes with several reference implementations:
- **Stripe Revenue** - Fetch daily revenue from Stripe
- **GA4 Traffic** - Real-time traffic metrics from Google Analytics
- **Google Ads Spend** - Campaign spend tracking
- **GitHub Issues** - Project status from GitHub
- **Cloudflare Analytics** - CDN performance metrics
- And 4 more...

### Component Maturity Levels

| Level | Status | Definition |
|-------|--------|-----------|
| 🟦 **Draft** | Planning | Specification proposed, not implemented |
| 🟩 **Beta** | Testing | Implemented, may have breaking changes |
| 🟪 **Stable** | Production | Battle-tested, backward compatible |
| 🟥 **Deprecated** | Sunset | Replaced or no longer maintained |

**Current status**: Most components are **Stable** (9 integrated), a few in **Beta** (experimental integrations).

---

## Building a Component

### Step-by-Step

**1. Design**
- Choose a data source
- Define what metrics you want to expose
- Sketch the data transformation

**2. Implement**
- Create a new directory in `packages/@opendash/`
- Implement the `Component` interface
- Write Zod schemas for validation
- Add unit tests

**3. Integrate**
- Register component in datasource registry
- Wire into dashboard
- Test end-to-end

**4. Document**
- Write README for your component
- Add to component registry
- Document any special setup (API keys, etc.)

**5. Publish**
- Publish to npm (if open-source component)
- Or integrate into OpenDash directly

### Interface Contract

All components implement this TypeScript interface:

```typescript
interface Component {
  // Metadata
  name: string;
  version: string;
  description: string;

  // Configuration
  configSchema: ZodSchema;

  // Execution
  async fetch(config: unknown): Promise<ComponentData>;

  // Validation
  async validate(config: unknown): Promise<ValidationResult>;
}
```

See [../../Standards/component-sdk-spec.md](../../Standards/component-sdk-spec.md) for full spec with examples.

### Real Example

Looking at `@opendash/stripe-revenue`:

```typescript
export const StripeRevenueComponent: Component = {
  name: 'stripe-revenue',
  version: '1.0.0',
  description: 'Daily revenue from Stripe',

  configSchema: z.object({
    apiKey: z.string(),
    lookbackDays: z.number().default(30),
  }),

  async fetch(config) {
    const validated = configSchema.parse(config);
    const revenue = await fetchStripeRevenue(validated.apiKey);
    return {
      metric: 'revenue',
      value: revenue,
      timestamp: Date.now(),
    };
  },

  async validate(config) {
    try {
      configSchema.parse(config);
      return { valid: true };
    } catch (error) {
      return { valid: false, error: String(error) };
    }
  }
}
```

See [../../packages/stripe-revenue/README.md](../../packages/stripe-revenue/README.md) for the full working example.

---

## Component Ecosystem (Future)

### Planned Features

**Phase 1** (Current): Core system + 9 built-in components
**Phase 2** (Next): Component discovery & registry
**Phase 3** (Planned): Marketplace & monetization

### Ecosystem Strategy

OpenDash is exploring 4 GTM approaches for components:

1. **Bundled** - Component included in main product
2. **Open Source** - Community-built components
3. **Marketplace** - Paid third-party components
4. **Proprietary** - OpenDash-only premium components

See [../../Standards/component-ecosystem-gtm-strategies.md](../../Standards/component-ecosystem-gtm-strategies.md) for full analysis.

---

## Architecture Decisions

### Past Decisions
- ✅ **Plugin system**: Components are loosely coupled plugins
- ✅ **Interface-first**: Define behavior, not implementation
- ✅ **Zod validation**: All inputs/outputs validated at runtime
- ✅ **Async-first**: Components are inherently async (API calls)

### Pending Decisions
- ⏳ **Discovery mechanism**: How do users find new components?
- ⏳ **Monetization**: Free vs paid components?
- ⏳ **Governance**: Who reviews/approves new components?

---

## Related Documentation

### Core System
- [../architecture/DATASOURCES-VS-PRIME-ARCHITECTURE.md](../architecture/DATASOURCES-VS-PRIME-ARCHITECTURE.md) - How components fit into datasources
- [../strategy/PRODUCT.md](../strategy/PRODUCT.md) - Product features driving component needs

### Implementation
- [../execution/EXECUTION_PLAN_EPIC27.md](../execution/EXECUTION_PLAN_EPIC27.md) - Planned component work
- [COMPONENT-ARCHITECTURE-ROADMAP.md](./COMPONENT-ARCHITECTURE-ROADMAP.md) - Component roadmap

### Development
- [../guides/](../guides/) - How-to guides
- [../setup/](../setup/) - Environment setup

---

## Common Questions

**Q: How do I get started building a component?**
A: Read [../../Standards/component-sdk-spec.md](../../Standards/component-sdk-spec.md), then copy the Stripe Revenue example from [../../packages/stripe-revenue/](../../packages/stripe-revenue/).

**Q: Can I use my own data source?**
A: Yes! Components can fetch from any API. See the interface spec for requirements.

**Q: How are components deployed?**
A: Components are deployed with the main OpenDash application. For third-party components, see the ecosystem strategy doc.

**Q: Is there a component registry?**
A: Not yet. See [COMPONENT-ARCHITECTURE-ROADMAP.md](./COMPONENT-ARCHITECTURE-ROADMAP.md) for planned registry.

**Q: What's the validation contract?**
A: All components must validate input config with Zod and output with their result schema. See examples.

---

## Contribution Guide

### Want to Add a Component?
1. Check if it already exists (search this doc)
2. Design the interface (what data will it expose?)
3. Implement using the SDK
4. Write tests
5. Document in README
6. Submit PR with tests

### Code Quality
- All components must have unit tests (>80% coverage)
- Zod schemas required for validation
- Async errors must be caught and logged
- No hardcoded secrets in code

---

## See Also

- 📚 [Complete Documentation Index](../README.md)
- ⚡ [Quick Start](../QUICK-START.md)
- 🏗️ [Architecture System Design](../architecture/DATASOURCES-VS-PRIME-ARCHITECTURE.md)
- 📦 [SDK Reference](../../packages/sdk/README.md)
- 📝 [Formal Standards](../../Standards/Index.md)

---

**Last updated**: 2026-03-25
**Maintainers**: Component team
**Issues**: Use `components:` prefix for component-related issues
