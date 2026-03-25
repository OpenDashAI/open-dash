---
name: OpenDash Actual Composition Architecture — Event-Driven Local Components
description: The real component system already exists in the repo. Event-driven, local, minimal. Not separate packages.
type: standard
---

# The Actual OpenDash Composition Architecture

**Date**: 2026-03-25
**Status**: Already implemented and working in src/lib/ and src/components/composable/

## What We Actually Have

NOT: Separate npm packages with SDK registry (what I was building)

BUT: **A custom event-driven composition system built locally in the repo**

```
src/lib/
├── CompositionProvider    — Manages registration, event routing, listener subscriptions
└── CompositionContext     — Interface defining how components communicate

src/components/composable/
├── Transport              — Component with componentId
├── Composer               — Component with componentId
├── DataSelector           — Component with componentId
├── Filter                 — Component with componentId
├── Display                — Component with componentId
├── Summary                — Component with componentId
└── ...
```

## How It Actually Works

### Components Register Themselves
```typescript
<DataSelector componentId="selector" ... />
```
- Component mounts → registers with CompositionProvider
- Provider tracks it via componentId
- No central registry configuration needed

### Components Communicate Through Events
```typescript
// DataSelector emits
emitEvent("selector", "selection-changed", { data: [...] })

// Filter listens
onComponentEvent("selector", "selection-changed", (payload) => {
  // React to selection
})

// Display listens
onComponentEvent("filter", "filter-applied", (payload) => {
  // React to filter
})
```

### Data Flows Through Event Chain
```
selector → emits "selection-changed"
   ↓
filter → listens, processes, emits "filter-applied"
   ↓
display → listens, renders, emits "display-changed"
   ↓
summary → listens, summarizes
```

## Key Architectural Properties

### 1. Loose Coupling
- Components don't import each other
- No dependencies between component files
- Communication is purely through named events
- Remove a component → just remove its JSX
- Add a component → just add its JSX with componentId

### 2. Local/Minimal
- No npm packages
- No external dependencies
- No complex SDK
- All in one repo
- Easy to understand and modify

### 3. Event-Driven
- Components emit events
- Components listen to events
- No direct function calls between components
- Decoupled execution

### 4. Dynamic/Composable
- Easy to add/remove components
- Easy to rearrange component order
- Easy to add new listeners
- Event names are the contract

## Why This Matters

This is a **fundamentally different approach** from what I was building:

| Aspect | My Approach (GA4) | Actual Architecture |
|--------|------------------|-------------------|
| Location | Separate npm packages | Local in repo |
| Loading | Registry.fetchAll() at startup | Components mount dynamically |
| Communication | Component returns BriefingItem[] | Event emissions |
| Coordination | Registry manages all | CompositionProvider manages routing |
| Coupling | Each component independent | Tight event contracts, loose code coupling |
| Use Case | Standalone datasources | UI component composition |

## Critical Question

**These are solving different problems:**

- **My approach (GA4, Stripe, etc.)**: How do we integrate external APIs as modular datasources?
- **Actual architecture**: How do we compose UI components that share state and coordinate?

Are they meant to work together? Or are they solving different layers?

### Possibility 1: Separate Layers
- **UI composition layer**: Event-driven (what exists)
- **Datasource composition layer**: Registry-based (what I was building)
- Both coexist

### Possibility 2: One Architecture
- Event-driven composition for everything
- Datasources are just components that emit data events
- Single model for composition

### Possibility 3: Different Architecture Needed
- Neither approach is right
- Need something else entirely

## How This Relates to AI Remix

If the goal is AI-driven composition, THIS architecture might actually be better:

```typescript
// AI wants to compose: selector → filter → display → summary
// AI doesn't load separate packages
// AI just:
// 1. Understands what components exist (in src/components/composable/)
// 2. Understands their event contracts
// 3. Wires them together via event listeners
// 4. User gets composed flow

<DataSelector componentId="selector" onData={(data) => emit(...)} />
<Filter componentId="filter" listenToComponent="selector" />
<Display componentId="display" listenToComponent="filter" />
<Summary componentId="summary" listenToComponent="display" />
```

No registry. No npm packages. No configuration complexity.

Just: AI understands components exist locally, wires them through event contracts.

## The Real Question

**Should we:**

A) **Scale the local event-driven architecture**
   - Make it easier for AI to discover components
   - Make it easier for AI to wire components
   - Keep everything local in repo
   - More like: parameterized composition

B) **Keep both approaches separate**
   - UI components: event-driven local
   - Datasources: registry-based packages
   - Both exist

C) **Unify under event-driven model**
   - Datasources become components that emit data events
   - Everything uses CompositionProvider
   - Single architecture for everything

## Related Files

- `src/lib/CompositionProvider` — The actual composition system
- `src/components/composable/` — The actual components
- (What I was building) `packages/@opendash-components/ga4/` — Different model entirely

## Conclusion

I was investigating whether a component SDK with separate npm packages makes sense.

But OpenDash **already has a component system** — it's event-driven, local, and integrated.

The question isn't "should we build a component system" (we have one).

The question is: **How do we make THIS component system work with AI remix?**

