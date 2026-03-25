# @opendash/sdk

Core component interface and registry for OpenDash and Virtual-Media components.

## Purpose

This SDK provides the foundation for a unified component architecture where:
- **OpenDash datasources** (Stripe, GA4, Meta Ads, etc.) are components
- **Virtual-Media tools** (Grok, Composition, Upload) are components
- Both implement the same interface and are discoverable/composable

## What's Included

### Component Interface

All components implement this interface:

```typescript
interface Component {
  metadata: ComponentMetadata;
  validate(config: ComponentConfig): boolean;
  initialize(config: ComponentConfig): Promise<void>;
  execute(input: ComponentInput): Promise<ComponentOutput>;
  render(data: unknown): React.ReactNode | null;
  teardown?(): Promise<void>;
}
```

### Component Registry

Central registry for discovering, loading, and managing components:

```typescript
const registry = new ComponentRegistry();
registry.register(myComponent);
const component = registry.get("my-component");
const all = registry.getAll();
```

## Usage

### Implementing a Component

```typescript
import {
  AbstractComponent,
  ComponentMetadata,
  ComponentConfig,
  ComponentInput,
  ComponentOutput,
} from "@opendash/sdk";

export class MyComponent extends AbstractComponent {
  readonly metadata: ComponentMetadata = {
    id: "my-component",
    name: "My Component",
    description: "Does something useful",
    team: "virtual-media",
    version: "0.1.0",
  };

  async initialize(config: ComponentConfig): Promise<void> {
    // Setup (API clients, databases, etc.)
  }

  async execute(input: ComponentInput): Promise<ComponentOutput> {
    // Do the work
    return { result: "success" };
  }

  render(data: unknown): React.ReactNode | null {
    // Return UI for dashboard or null
    return <div>Component status</div>;
  }
}
```

### Registering a Component

```typescript
import { registerComponent } from "@opendash/sdk";
import { MyComponent } from "./MyComponent";

const component = new MyComponent();
registerComponent(component);
```

### Using the Registry

```typescript
import {
  getComponent,
  getAllComponents,
  globalComponentRegistry,
} from "@opendash/sdk";

// Get a specific component
const component = getComponent("my-component");

// Get all components
const all = getAllComponents();

// Get components from a specific team
const vmTeam = globalComponentRegistry.getByTeam("virtual-media");

// Execute a component
if (component) {
  await component.initialize({ /* config */ });
  const result = await component.execute({ /* input */ });
}
```

## Architecture

```
SDK (this package)
├── Component interface
├── ComponentRegistry
└── Global registry instance
    │
    ├── OpenDash components
    │   ├── Stripe
    │   ├── GA4
    │   ├── Meta Ads
    │   └── Email
    │
    └── Virtual-Media components
        ├── Grok (video generation)
        ├── Composition (scene assembly)
        └── Upload (YouTube publishing)
```

## Design Principles

1. **Single Interface** — All components implement the same contract
2. **Discoverable** — Registry makes all components discoverable
3. **Composable** — Components can call other components
4. **Team-agnostic** — Works for OpenDash and Virtual-Media
5. **Flexible** — Can be used with monorepo, npm registry, or private registry

## No External Dependencies

This SDK has no external dependencies beyond React (which is a peer dependency). All components are self-contained in their own packages.

## Version

`0.1.0` - Initial SDK with Component interface and Registry

## Next Steps

1. Virtual-Media team implements Grok, Composition, Upload components
2. Dashboard loads all components from registry
3. Components can be orchestrated to produce videos
