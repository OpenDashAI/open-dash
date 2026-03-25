# Component Interoperability: Developer Guide

**For**: OpenDash + Virtual-Media teams building interoperable components
**Time**: 15 minutes to set up locally
**Goal**: Build components from different teams that work together

---

## What You're Building

A component is a self-contained module that:
- Fetches data from an external API
- Returns "briefing items" (news/alerts)
- Works alongside other components

Example: Stripe component returns daily revenue. Grok component returns video performance. Both display on the same dashboard.

---

## Quick Start

### 1. Clone & Install

```bash
cd atlas
pnpm install
```

### 2. Create Your Component

```bash
mkdir packages/@your-team/your-component
cd packages/@your-team/your-component
pnpm init
```

Edit `package.json`:

```json
{
  "name": "@your-team-components/your-component",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "vitest",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "@opendash/sdk": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^1.0.0",
    "@types/node": "^20.0.0"
  }
}
```

### 3. Implement Component

Create `src/index.ts`:

```typescript
import type { Component, BriefingItem, ComponentConfig } from '@opendash/sdk';

export const yourComponent: Component = {
  // Metadata
  id: 'your-component',
  name: 'Your Component',
  icon: '🎯',
  description: 'What your component does',
  version: '1.0.0',
  author: 'Your Team',
  requiresConfig: true,

  // The fetch function (called on dashboard load)
  async fetch(config: ComponentConfig): Promise<BriefingItem[]> {
    // 1. Check configuration
    const apiKey = config.env.YOUR_API_KEY;
    if (!apiKey) {
      return [{
        id: 'not-configured',
        priority: 'low',
        category: 'your-category',
        title: 'Your Component: Not configured',
        detail: 'Add YOUR_API_KEY to dashboard settings',
        time: new Date().toISOString(),
      }];
    }

    // 2. Fetch data from external API
    try {
      const response = await fetch('https://api.example.com/data', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      const data = await response.json();

      // 3. Transform to BriefingItems
      return data.items.map((item: any) => ({
        id: item.id,
        priority: item.important ? 'high' : 'normal',
        category: 'your-category',
        title: item.title,
        detail: item.description,
        time: new Date(item.timestamp).toISOString(),
        isNew: isNew(item, config.lastVisited),
      }));
    } catch (error) {
      // 4. Graceful error handling (dashboard continues)
      return [{
        id: 'fetch-error',
        priority: 'low',
        category: 'your-category',
        title: 'Your Component: Error',
        detail: error instanceof Error ? error.message : 'Unknown error',
        time: new Date().toISOString(),
      }];
    }
  }
};

function isNew(item: any, lastVisited: string | null): boolean {
  if (!lastVisited) return false;
  return new Date(item.timestamp) > new Date(lastVisited);
}

export type { Component } from '@opendash/sdk';
```

### 4. Write Tests

Create `__tests__/component.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { yourComponent } from '../src/index';

describe('Your Component', () => {
  it('returns unconfigured message when no API key', async () => {
    const items = await yourComponent.fetch({
      env: {},
      lastVisited: null,
    });

    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('not-configured');
  });

  it('returns briefing items from API', async () => {
    const items = await yourComponent.fetch({
      env: { YOUR_API_KEY: 'test-key' },
      lastVisited: null,
    });

    expect(items.length).toBeGreaterThan(0);
    expect(items[0].category).toBe('your-category');
  });
});
```

### 5. Build & Test

```bash
# Build TypeScript
pnpm build

# Run tests
pnpm test

# Watch mode while developing
pnpm dev
```

---

## Using Your Component

### In the Dashboard

```typescript
// apps/opendash/src/dashboard.ts
import { yourComponent } from '@your-team-components/your-component';
import { stripeRevenue } from '@opendash-components/stripe-revenue';

const registry = createComponentRegistry();
registry.register(yourComponent);       // Your team's component
registry.register(stripeRevenue);       // OpenDash's component

// Both load together
const items = await registry.fetchAll(config);
```

### Component Lifecycle

1. **Registration** — Add to registry
2. **Configuration** — Pass env vars + settings
3. **Fetch** — Component calls API
4. **Transform** — Convert API response to BriefingItems
5. **Return** — Items merged with other components
6. **Display** — Dashboard shows all items together

---

## Common Patterns

### API Authentication

```typescript
// Option 1: Environment variable
const apiKey = config.env.YOUR_API_KEY;

// Option 2: Multiple env vars
const clientId = config.env.YOUR_CLIENT_ID;
const clientSecret = config.env.YOUR_CLIENT_SECRET;

// Option 3: Brand-specific config
const customSetting = config.brandConfig?.customValue;
```

### Error Handling

```typescript
async fetch(config: ComponentConfig): Promise<BriefingItem[]> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    // Process response...
  } catch (error) {
    // Return error briefing item (not a thrown error)
    return [{
      id: 'error',
      priority: 'low',
      category: 'your-category',
      title: 'Component error',
      detail: error instanceof Error ? error.message : 'Unknown error',
      time: new Date().toISOString(),
    }];
    // Dashboard continues, other components still load
  }
}
```

### Filtering/Sorting

```typescript
// Only return high-priority items
const important = items.filter(i => i.priority === 'high');

// Sort by time (newest first)
const sorted = items.sort((a, b) =>
  new Date(b.time).getTime() - new Date(a.time).getTime()
);

// Limit to 5 items
const limited = items.slice(0, 5);
```

### Testing with Mock Data

```typescript
it('transforms API response correctly', async () => {
  // Mock the fetch
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        items: [
          { id: '1', title: 'Item 1', timestamp: '2026-03-25T10:00:00Z' }
        ]
      })
    })
  );

  const items = await yourComponent.fetch({
    env: { YOUR_API_KEY: 'test' },
    lastVisited: null,
  });

  expect(items[0].title).toBe('Item 1');
});
```

---

## File Structure Best Practice

```
packages/@your-team/your-component/
├── src/
│   ├── index.ts               ← Main export
│   ├── your-component.ts      ← Component implementation
│   └── types.ts               ← Local types (if needed)
├── __tests__/
│   ├── component.test.ts
│   └── integration.test.ts
├── package.json               ← Declare dependencies
├── tsconfig.json              ← Extends root
├── README.md                  ← Usage guide
├── .gitignore
└── dist/                       ← Built files (not committed)
```

---

## Common Issues

### "Cannot find module '@opendash/sdk'"

```bash
# Ensure workspace is set up
pnpm install
pnpm -r build  # Build all packages

# In your package.json, use workspace: protocol
"dependencies": {
  "@opendash/sdk": "workspace:*"  ← This is correct
}
```

### "Component not loading on dashboard"

1. Did you `registry.register(yourComponent)`?
2. Is the component exported from `src/index.ts`?
3. Run `pnpm build` in your component directory
4. Check dashboard imports are correct

### "Tests not finding module"

```typescript
// Make sure vitest is configured
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node'
  }
});
```

---

## Testing Checklist

Before pushing, verify:

- [ ] Component implements `Component` interface
- [ ] Unconfigured case returns helpful message
- [ ] Configured case fetches and transforms data
- [ ] Error handling returns briefing item (not thrown error)
- [ ] All tests pass: `pnpm test`
- [ ] Types compile: `pnpm build`
- [ ] README is complete
- [ ] No console errors/warnings

---

## Merging Components from Both Teams

### On the Dashboard

```typescript
import { createComponentRegistry } from '@opendash/sdk';

// OpenDash components
import { stripeRevenue } from '@opendash-components/stripe-revenue';
import { ga4 } from '@opendash-components/ga4';

// Virtual-Media components
import { grokComponent } from '@virtual-media-components/grok';
import { videoMetrics } from '@virtual-media-components/video-metrics';

// Create registry and register all
const registry = createComponentRegistry();

// Order doesn't matter — register as needed
registry.register(stripeRevenue);
registry.register(ga4);
registry.register(grokComponent);
registry.register(videoMetrics);

// Fetch all at once
const allItems = await registry.fetchAll({
  env: process.env,
  lastVisited: user.lastVisited,
  brandConfig: { orgName: user.org }
});

// Items from both teams merged
console.log(allItems.length); // Sum of all component outputs
```

Both teams' components work together without modification.

---

## Next Steps

1. Copy component scaffold to your workspace
2. Implement your component
3. Write tests
4. Run `pnpm test` to verify
5. Commit and submit PR
6. Dashboard maintainer integrates your component

**Questions?** See `Standards/opendash-virtual-media-component-interop.md`
