---
name: OpenDash Component SDK Specification
description: Formal specification for OpenDash datasource components. Defines component contract, lifecycle, configuration, and marketplace registration.
type: standard
---

# OpenDash Component SDK Specification v1.0

**Status**: Final (2026-03-25)
**Target Audience**: Component builders, marketplace integrators, core team

---

## Overview

OpenDash Components (formerly "datasources") are modular, self-contained units that fetch data from external systems and present briefing items to the user.

A component is:
- **Pluggable**: Registers via SDK interface
- **Composable**: Multiple components on one dashboard
- **Configurable**: Environment variables + brand-specific settings
- **Type-safe**: Full TypeScript support
- **Testable**: Isolated, mockable fetch logic
- **Distributable**: Standalone npm package

---

## Component Interface (v1)

### BriefingItem

```typescript
interface BriefingItem {
  id: string;                  // Unique within component
  priority: "low" | "normal" | "high";
  category: string;            // e.g., "revenue", "deploy", "issue"
  title: string;               // One-liner headline
  detail: string;              // Additional context
  time: string;                // ISO 8601 timestamp
  isNew?: boolean;             // Highlight if new since last visit
  actionLabel?: string;        // Optional button label
  actionHandler?: string;      // Handler identifier
}
```

### Component Definition

```typescript
interface Component {
  // Identity
  id: string;                  // kebab-case, globally unique
  name: string;                // Display name
  icon: string;                // Single char or emoji
  description: string;         // One-liner

  // Capabilities
  requiresConfig: boolean;     // Needs env vars or settings
  version: string;             // semver (e.g., "1.0.0")
  author: string;              // Component author

  // Behavior
  fetch(config: ComponentConfig): Promise<BriefingItem[]>;
}

interface ComponentConfig {
  env: Record<string, string | undefined>;  // Secrets
  lastVisited: string | null;                 // For isNew detection
  brandConfig?: Record<string, unknown>;      // Custom settings
}
```

### Component Status

```typescript
interface ComponentStatus {
  connected: boolean;          // Successful last fetch
  lastFetch?: string;          // ISO timestamp
  error?: string;              // Last error message
  itemCount?: number;          // Briefing items returned
}
```

---

## Component Lifecycle

### 1. Registration

```typescript
import { registerComponent } from '@opendash/sdk';
import { stripeRevenueComponent } from '@opendash-components/stripe-revenue';

registerComponent(stripeRevenueComponent);
```

### 2. Initialization

```typescript
const registry = new ComponentRegistry();
registry.register(stripeRevenueComponent);
```

### 3. Fetch (Per Dashboard Load)

```typescript
const items = await component.fetch({
  env: process.env,
  lastVisited: user.lastVisited,
  brandConfig: { label: 'Acme Corp' }
});
```

### 4. Error Handling

- Component fetch fails → returns empty array (graceful degradation)
- Status reflects error
- Dashboard continues loading other components
- User sees "connection failed" badge

---

## Building a Component

### Minimal Example

```typescript
// stripe-revenue.ts
import type { Component, BriefingItem, ComponentConfig } from '@opendash/sdk';

export const stripeRevenue: Component = {
  id: 'stripe-revenue',
  name: 'Stripe Revenue',
  icon: '$',
  description: 'Daily revenue from Stripe',
  version: '1.0.0',
  author: 'OpenDash',
  requiresConfig: true,

  async fetch(config: ComponentConfig): Promise<BriefingItem[]> {
    const key = config.env.STRIPE_SECRET_KEY;
    if (!key) {
      return [{
        id: 'stripe-not-connected',
        priority: 'low',
        category: 'revenue',
        title: 'Stripe: Not connected',
        detail: 'Add STRIPE_SECRET_KEY to dashboard settings',
        time: new Date().toISOString(),
      }];
    }

    try {
      const res = await fetch('https://api.stripe.com/v1/balance_transactions', {
        headers: { 'Authorization': `Bearer ${key}` }
      });
      const data = await res.json();

      const revenue = data.data.reduce((sum, t) => sum + t.amount, 0) / 100;

      return [{
        id: 'daily-revenue',
        priority: revenue > 0 ? 'normal' : 'low',
        category: 'revenue',
        title: `Daily revenue: $${revenue.toFixed(0)}`,
        detail: `${Math.round((revenue / 333) * 100)}% of $333 target`,
        time: new Date().toISOString(),
        isNew: true,
      }];
    } catch (err) {
      return []; // Fail silently
    }
  }
};
```

### With Configuration

```typescript
interface StripeConfig {
  label?: string;              // Custom label prefix
  currencyFilter?: string[];   // Only these currencies
  targetDaily?: number;        // Revenue target
}

async fetch(config: ComponentConfig): Promise<BriefingItem[]> {
  const brandConfig = config.brandConfig as StripeConfig | undefined;
  const target = brandConfig?.targetDaily ?? 333;

  // Use config.brandConfig for per-dashboard customization
}
```

---

## Packaging a Component

### Directory Structure

```
@opendash-components/stripe-revenue/
├── src/
│   ├── index.ts              # Export component
│   └── stripe-revenue.ts      # Component implementation
├── __tests__/
│   └── stripe-revenue.test.ts
├── package.json
├── README.md
├── tsconfig.json
└── vitest.config.ts
```

### package.json

```json
{
  "name": "@opendash-components/stripe-revenue",
  "version": "1.0.0",
  "description": "Stripe revenue briefing component",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "peerDependencies": {
    "@opendash/sdk": "^1.0.0"
  },
  "devDependencies": {
    "@opendash/sdk": "^1.0.0",
    "typescript": "^5.0.0",
    "vitest": "^0.34.0"
  }
}
```

### Exporting

```typescript
// src/index.ts
export { stripeRevenue } from './stripe-revenue';
export type { StripeConfig } from './stripe-revenue';
```

### Building

```bash
npm run build    # TypeScript → dist/
npm run test     # Vitest
npm pack         # Create tarball
npm publish      # Publish to npm or private registry
```

---

## Testing a Component

```typescript
import { describe, it, expect } from 'vitest';
import { stripeRevenue } from '../src/stripe-revenue';

describe('Stripe Revenue Component', () => {
  it('returns unconfigured message when no STRIPE_SECRET_KEY', async () => {
    const items = await stripeRevenue.fetch({
      env: {},
      lastVisited: null,
    });

    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('stripe-not-connected');
  });

  it('fetches daily revenue', async () => {
    const items = await stripeRevenue.fetch({
      env: { STRIPE_SECRET_KEY: 'sk_test_...' },
      lastVisited: null,
    });

    expect(items).toHaveLength(1);
    expect(items[0].category).toBe('revenue');
  });
});
```

---

## Marketplace Registration

### Component Manifest (for marketplace discovery)

```json
{
  "id": "stripe-revenue",
  "name": "Stripe Revenue",
  "version": "1.0.0",
  "description": "Daily revenue from Stripe",
  "author": "OpenDash",
  "icon": "$",
  "category": "finance",
  "requiresConfig": true,
  "tags": ["stripe", "revenue", "payments"],
  "npmPackage": "@opendash-components/stripe-revenue",
  "homepage": "https://github.com/OpenDashAI/components/tree/main/packages/stripe-revenue",
  "license": "MIT",
  "installs": 1250,        // From npm downloads
  "rating": 4.8,           // Community rating
  "verified": true,        // Published by OpenDash team
  "minSdkVersion": "1.0.0"
}
```

### Marketplace Discovery API

```typescript
// Client-side
const components = await fetch('https://api.opendash.ai/v1/components', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Response
{
  "components": [
    { id: "stripe-revenue", name: "Stripe Revenue", ... },
    { id: "ga4", name: "Google Analytics 4", ... }
  ],
  "total": 47,
  "page": 1,
  "perPage": 20
}
```

---

## Versioning & Compatibility

### Semantic Versioning

- **MAJOR**: Breaking changes to component interface
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes

### Compatibility Declaration

```typescript
{
  "componentSdkVersion": "1.0.0",  // Supports SDK v1.0+
  "opendashMinVersion": "1.0.0",   // Requires OpenDash v1.0+
}
```

---

## Security Guidelines

### What Components Can Access

✅ **Allowed**:
- Environment variables passed explicitly
- Network calls to external APIs
- Local computation

❌ **Disallowed**:
- File system access
- Direct database access
- Loading other npm packages (deps must be declared)
- Accessing browser APIs on server

### Configuration Best Practices

1. **Never commit secrets** — use `.env` or wrangler secrets
2. **Validate all inputs** — use Zod for config validation
3. **Fail gracefully** — errors should return empty array, not throw
4. **Rate limit** — respect API quota (cache if possible)
5. **Timeout handling** — set fetch timeouts (5s default)

---

## Performance Expectations

| Metric | Target | Limit |
|--------|--------|-------|
| Fetch time (p50) | <1s | 5s |
| Fetch time (p95) | <2s | 10s |
| Memory usage | <10MB | 50MB |
| Items returned | 1-10 | 100 |
| API calls | 1-3 | 10 |

Components exceeding limits are throttled or disabled in dashboard.

---

## Migration Path (Existing → SDK)

### Step 1: Extract to package

```bash
mkdir -p packages/stripe-revenue
cp src/datasources/stripe-revenue.ts packages/stripe-revenue/src/
```

### Step 2: Update imports

```typescript
// Before
import type { DataSource, DataSourceConfig } from "../../lib/datasource";

// After
import type { Component, ComponentConfig } from "@opendash/sdk";
```

### Step 3: Rename types

```typescript
// Before
export const stripeRevenueSource: DataSource

// After
export const stripeRevenue: Component
```

### Step 4: Publish & re-import

```typescript
// In main dashboard
import { stripeRevenue } from "@opendash-components/stripe-revenue";
registry.register(stripeRevenue);
```

---

## Resources

- **SDK Package**: `@opendash/sdk` (npm)
- **Component Template**: `create-opendash-component` (scaffolding)
- **Examples**: `@opendash-components/stripe-revenue`, `@opendash-components/ga4`
- **Documentation**: https://docs.opendash.ai/components
- **Community**: https://discord.gg/opendash

---

## Questions & Support

- **Bug reports**: https://github.com/OpenDashAI/opendash/issues
- **Component issues**: @opendash-components repos
- **SDK discussions**: https://github.com/OpenDashAI/sdk/discussions
