# @opendash/sdk

OpenDash Component SDK — Build briefing components for OpenDash.

## What is a Component?

A component is a pluggable data source that fetches information from an external system and presents it as briefing items in OpenDash.

```typescript
import type { Component } from '@opendash/sdk';

const exampleComponent: Component = {
  id: 'my-source',
  name: 'My Data Source',
  icon: '📊',
  description: 'Displays data from my API',
  version: '1.0.0',
  author: 'You',
  requiresConfig: false,

  async fetch(config) {
    return [{
      id: 'item-1',
      priority: 'normal',
      category: 'metrics',
      title: 'Example briefing item',
      detail: 'This is shown in the dashboard',
      time: new Date().toISOString(),
    }];
  }
};
```

## Quick Start

### 1. Install SDK

```bash
npm install @opendash/sdk
```

### 2. Create a Component

```typescript
// my-component.ts
import type { Component, BriefingItem, ComponentConfig } from '@opendash/sdk';

export const myComponent: Component = {
  id: 'my-component',
  name: 'My Component',
  icon: '🎯',
  description: 'Shows important metrics',
  version: '1.0.0',
  author: 'Your Name',
  requiresConfig: false,

  async fetch(config: ComponentConfig): Promise<BriefingItem[]> {
    return [{
      id: 'metric-1',
      priority: 'normal',
      category: 'metrics',
      title: 'Key metric: 42',
      detail: 'Everything is normal',
      time: new Date().toISOString(),
    }];
  }
};
```

### 3. Register It

```typescript
import { createComponentRegistry } from '@opendash/sdk';
import { myComponent } from './my-component';

const registry = createComponentRegistry();
registry.register(myComponent);

// Fetch all components
const { items, statuses } = await registry.fetchAll({
  env: process.env,
  lastVisited: null,
});

console.log(items); // Array of briefing items
```

## Core Types

### `BriefingItem`

Information shown to the user.

```typescript
interface BriefingItem {
  id: string;                    // Unique identifier
  priority: 'low' | 'normal' | 'high';
  category: string;              // e.g., "revenue", "deploy"
  title: string;                 // Headline
  detail: string;                // Additional context
  time: string;                  // ISO 8601 timestamp
  isNew?: boolean;               // Highlight as new
  actionLabel?: string;          // Button text
  actionHandler?: string;        // Action handler ID
}
```

### `Component`

A pluggable data source.

```typescript
interface Component {
  id: string;                    // Unique, kebab-case
  name: string;                  // Display name
  icon: string;                  // Single char/emoji
  description: string;           // One-liner
  version: string;               // SemVer (e.g., "1.0.0")
  author: string;                // Author name
  requiresConfig: boolean;       // Needs API key?

  fetch(config: ComponentConfig): Promise<BriefingItem[]>;
}
```

### `ComponentConfig`

Configuration passed to `fetch()`.

```typescript
interface ComponentConfig {
  env: Record<string, string | undefined>;  // Secrets
  lastVisited: string | null;                 // For isNew detection
  brandConfig?: Record<string, unknown>;      // Custom settings
}
```

### `ComponentStatus`

Status after a fetch attempt.

```typescript
interface ComponentStatus {
  connected: boolean;            // Did fetch succeed?
  lastFetch?: string;            // ISO timestamp
  error?: string;                // Error message if failed
  itemCount?: number;            // Items returned
}
```

## Examples

### Example 1: Simple Metric

```typescript
export const uptimeComponent: Component = {
  id: 'uptime-check',
  name: 'Uptime Monitor',
  icon: '✅',
  description: 'Check if services are up',
  version: '1.0.0',
  author: 'ops-team',
  requiresConfig: false,

  async fetch(): Promise<BriefingItem[]> {
    const statuses = await checkServices();

    return statuses.map(s => ({
      id: `${s.service}-${Date.now()}`,
      priority: s.up ? 'low' : 'high',
      category: 'operations',
      title: s.up ? `✅ ${s.service}` : `❌ ${s.service}`,
      detail: s.up ? `Last checked: ${s.lastCheck}` : `Down since: ${s.downSince}`,
      time: new Date().toISOString(),
      isNew: !s.up,  // Highlight if down
    }));
  }
};
```

### Example 2: With Configuration

```typescript
interface GithubConfig {
  org?: string;          // GitHub org
  minStars?: number;     // Minimum stars to show
}

export const githubTrending: Component = {
  id: 'github-trending',
  name: 'GitHub Trending',
  icon: '⭐',
  description: 'New repos in your org',
  version: '1.0.0',
  author: 'dev-tools',
  requiresConfig: true,  // Requires config

  async fetch(config: ComponentConfig) {
    const brandConfig = config.brandConfig as GithubConfig | undefined;
    const org = brandConfig?.org ?? 'myorg';
    const minStars = brandConfig?.minStars ?? 5;

    const repos = await fetchGithubRepos(org, {
      sort: 'stars',
      created: 'last-week'
    });

    return repos
      .filter(r => r.stargazers_count >= minStars)
      .slice(0, 3)
      .map(r => ({
        id: r.id.toString(),
        priority: 'normal',
        category: 'development',
        title: `⭐ ${r.name}: ${r.stargazers_count} stars`,
        detail: r.description,
        time: new Date(r.created_at).toISOString(),
      }));
  }
};
```

### Example 3: With Error Handling

```typescript
export const apiMetrics: Component = {
  id: 'api-metrics',
  name: 'API Metrics',
  icon: '📊',
  description: 'Current API response times',
  version: '1.0.0',
  author: 'backend-team',
  requiresConfig: true,

  async fetch(config: ComponentConfig) {
    try {
      const apiKey = config.env.METRICS_API_KEY;
      if (!apiKey) {
        // No key configured — show helpful message
        return [{
          id: 'metrics-not-configured',
          priority: 'low',
          category: 'operations',
          title: 'API Metrics: Not configured',
          detail: 'Add METRICS_API_KEY to enable monitoring',
          time: new Date().toISOString(),
        }];
      }

      const response = await fetch('https://api.metrics.io/v1/stats', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();

      return [{
        id: 'api-p99-latency',
        priority: data.p99 > 500 ? 'high' : 'normal',
        category: 'operations',
        title: `API p99 latency: ${data.p99}ms`,
        detail: `p50: ${data.p50}ms, p95: ${data.p95}ms`,
        time: new Date().toISOString(),
        isNew: data.p99 > 500,  // Highlight if slow
      }];
    } catch (err) {
      // Fail silently — dashboard continues without this component
      console.error('API metrics error:', err);
      return [];  // Empty array = graceful degradation
    }
  }
};
```

## Best Practices

### ✅ Do

- **Return empty array on error** — Let the dashboard continue
- **Set `requiresConfig: true`** if you need API keys or settings
- **Use `isNew: true`** to highlight important changes
- **Validate all inputs** — Even from config
- **Set sensible timeouts** — 5-10 seconds max
- **Use categories** consistently — "revenue", "deploy", "issue", etc.

### ❌ Don't

- **Throw errors** — Return empty array instead
- **Make blocking calls** — Use async/await properly
- **Access file system** — Not allowed in Workers
- **Store sensitive data** — Pass via `config.env` only
- **Return > 100 items** — Keep it brief
- **Make unbounded API calls** — Cache or paginate

## Publishing

### As NPM Package

```bash
npm publish --access public
```

Component will be discoverable as:
```
npm install @opendash-components/my-component
```

### To Marketplace

1. Publish to npm
2. Add metadata to `MANIFEST.json`
3. PR to OpenDash marketplace
4. Listed within 24 hours

## API Reference

### `createComponentRegistry()`

Create a new component registry.

```typescript
import { createComponentRegistry } from '@opendash/sdk';

const registry = createComponentRegistry();
registry.register(myComponent);
```

### `registry.register(component)`

Register a component.

```typescript
registry.register(myComponent);
// Throws if component.id already exists
```

### `registry.list()`

List all registered components.

```typescript
const all = registry.list();
// Returns: Component[]
```

### `registry.fetchAll(config)`

Fetch from all components.

```typescript
const { items, statuses } = await registry.fetchAll({
  env: process.env,
  lastVisited: user.lastVisited,
});

// items: BriefingItem[]
// statuses: Map<componentId, ComponentStatus>
```

## Troubleshooting

### Component not showing in dashboard

1. Did you call `registry.register()`?
2. Is the component's `fetch()` method throwing? (Should return `[]` instead)
3. Check browser console for errors

### Fetch is slow

1. Use `lastVisited` to avoid duplicate work
2. Add caching (KV, Redis, etc.)
3. Set timeouts for external API calls
4. Use parallel requests, not sequential

### Configuration not working

1. Check that `requiresConfig: true`
2. Verify env vars are passed to `ComponentConfig`
3. Log `config.brandConfig` to debug

## Contributing

Found an issue? Have a feature request?

- **Bug reports**: https://github.com/OpenDashAI/open-dash/issues
- **Feature requests**: https://github.com/OpenDashAI/open-dash/discussions
- **PRs welcome**: https://github.com/OpenDashAI/open-dash/pulls

## License

MIT

## See Also

- [OpenDash](https://github.com/OpenDashAI/open-dash) — Main project
- [@opendash-components](https://github.com/orgs/OpenDashAI/repositories?q=components) — Official components
- [Component Developer Guide](../../docs/COMPONENT_BUILDER_GUIDE.md)
- [SDK Specification](../../Standards/component-sdk-spec.md)
