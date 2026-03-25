---
name: Component Registry Solves the Hard AI Composition Problem
description: Event contracts + composition rules in the registry give AI the constraint system it needs to compose valid component pipelines without hallucinating wiring.
type: standard
---

# The Registry Solves AI's Hard Problem

**Date**: 2026-03-25
**Status**: Critical architectural insight

---

## The Problem

AI is bad at open-ended composition. If you say "build me a dashboard," AI hallucinates:
- Invents components that don't exist
- Wires things together that don't work
- Generates code that looks right but fails at runtime
- No way to validate the output without running it

This is the fundamental problem with AI-generated applications.

---

## The Solution: Constrained Composition

The registry with event contracts gives AI a **closed, verifiable constraint system**.

AI doesn't freestyle. It solves a constraint satisfaction problem:

### What AI Knows (from registry)

```
Available components:
  - DataSelector: emits "selection-changed"
  - MetricsSource: emits "data-ready", needs D1 binding
  - Filter: listens to "selection-changed", emits "filter-updated"
  - Display: listens to "filter-updated" OR "data-ready", emits "display-ready"
  - Summary: listens to "display-ready"
  - AlertFilter: listens to "data-ready", emits "alerts-ready"

Valid wiring rules:
  - Every listener must connect to an emitter of the matching event
  - Every component needs a componentId (unique string)
  - All components must be inside CompositionProvider
  - Data flows downstream (no cycles)
```

### What AI Does (constraint solving, not generation)

```
User: "Show me revenue alerts"

AI reasons:
1. "Revenue" → needs MetricsSource with source="stripe"
2. "Alerts" → needs AlertFilter (listens to "data-ready")
3. Need to display → needs Display (listens to "alerts-ready")
4. Summary would be useful → listens to "display-ready"

Validate:
- MetricsSource emits "data-ready" ✓
- AlertFilter listens to "data-ready" ✓ (matches MetricsSource)
- AlertFilter emits "alerts-ready" ✓
- Display listens to "alerts-ready" ✓ (matches AlertFilter)
- Display emits "display-ready" ✓
- Summary listens to "display-ready" ✓ (matches Display)
- No dangling listeners ✓
- No cycles ✓

Output:
<CompositionProvider>
  <MetricsSource componentId="stripe" source="stripe" />
  <AlertFilter componentId="alerts" listenToComponent="stripe" />
  <Display componentId="display" listenToComponent="alerts" />
  <Summary componentId="summary" listenToComponent="display" />
</CompositionProvider>
```

### Why This Works

1. **Finite set of components** — AI can't invent new ones. Only what's in the registry.
2. **Typed event contracts** — AI knows exactly what each component emits and listens to. No guessing.
3. **Validation is mechanical** — Check: does every listener have a matching emitter? Yes/no. No ambiguity.
4. **Composition is a graph problem** — AI selects nodes (components) and edges (event wiring). This is well-understood.
5. **The output is small and verifiable** — A composition is just 5-15 lines of JSX. Easy to validate, easy to test.

---

## Compare to the Alternative (No Registry)

Without event contracts:
```
User: "Show me revenue alerts"

AI guesses:
- "I'll create a StripeRevenue component" (doesn't exist)
- "I'll fetch from Stripe API" (wrong — Scram Jet does this)
- "I'll wire it to... something?" (no contract to follow)
- Generates 200 lines of code
- Maybe works, maybe doesn't
- No way to validate without running it
```

**With registry**: AI composes from known components with known contracts → output is guaranteed valid if constraints are satisfied.

**Without registry**: AI generates code from scratch → output is probabilistic, unreliable, unverifiable.

---

## The Constraint System

### Registry provides:
- **Component catalog** — What exists
- **Event contracts** — What each component emits/listens to
- **Data bindings** — What D1 data each component needs
- **Composition rules** — What valid pipelines look like
- **Props schema** — What configuration each component accepts

### AI's job reduces to:
1. **Understand user intent** → "revenue alerts"
2. **Select components** → MetricsSource, AlertFilter, Display, Summary
3. **Wire events** → Match emitters to listeners
4. **Validate** → All constraints satisfied?
5. **Output** → Small, verifiable JSX composition

### This is fundamentally different from code generation
- Code generation: "Write me a dashboard" → AI writes 500 lines → pray it works
- Constraint composition: "Compose these components" → AI wires 10 lines → mechanically verifiable

---

## Why shadcn's Meta Field Is Perfect

shadcn already has `meta: {}` for arbitrary metadata. We use it for:

```json
{
  "meta": {
    "composable": true,
    "emits": [{ "event": "data-ready", "payload": "Metric[]" }],
    "listensTo": [{ "event": "selection-changed" }],
    "dataBinding": { "table": "metrics", "filters": ["source"] },
    "validUpstream": ["metrics-source"],
    "validDownstream": ["display", "alert-filter"]
  }
}
```

AI reads this. AI doesn't need to understand the component's source code. It just needs the contract.

---

## Summary

The hard problem with AI composition is: **How does AI compose things correctly without hallucinating?**

Answer: **Give it a closed constraint system where correctness is mechanically verifiable.**

The registry with event contracts IS that constraint system.

