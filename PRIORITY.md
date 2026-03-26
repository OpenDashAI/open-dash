# Current Session Priority

**Status**: Architecture v2 Defined — Ready to Build

## Architecture v2: SaaS Printer

```
Layer 1: DATA           Scram Jet → D1
Layer 2: PRIMITIVES     ~20 structural components
Layer 3: GENERATION     AI customizes primitives → domain components (once)
Layer 4: COMPOSITION    AI wires via event contracts → JSON → runtime renders
```

Full spec: `Standards/architecture-v2-saas-printer.md`

## Epic #127: Phase 1 — Foundation

| Issue | Task | Status |
|-------|------|--------|
| #128 | Build 5 core primitives (List, Form, Card, Chart, Timer) | TODO |
| #129 | AI generation: primitive → domain component | TODO |
| #130 | Composition format: JSON that runtime renders | TODO |
| #131 | D1 schema generation for arbitrary domains | TODO |
| #132 | Update registry format for primitive customization slots | TODO |

**Start with**: #128 (primitives) and #132 (registry format) in parallel — these are independent.
Then: #129 (AI generation) depends on #128 + #132.
Then: #130 (composition format) and #131 (D1 schema) can run in parallel.

## Key Files

- `Standards/architecture-v2-saas-printer.md` — Definitive architecture
- `packages/@opendash/composition/` — Shared event bus
- `public/r/index.json` — Component registry
- `src/components/primitives/` — Structural primitives (to build)

---
Last updated: 2026-03-25
