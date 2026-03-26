# Current Session Priority

**Status**: Composition system built. Frontasy is the engine. OpenDash is a product.

## Architecture Split (2026-03-25)

**Frontasy** = front-end generation engine (hooks, renderer, AI generation, design retrieval)
**OpenDash** = dashboard intelligence product (Scram Jet → D1 → briefings, alerts)

Composition system migrating to Frontasy. OpenDash will consume `@frontasy/*` packages.

## OpenDash-Specific Work

| Task | Status |
|------|--------|
| Scram Jet → D1 data pipeline | ✅ Working |
| Auth (Clerk + RBAC + multi-tenancy) | ✅ Working |
| HudSocket (WebSocket transport) | ✅ Working |
| Server actions (15+ API routes) | ✅ Working |
| Dashboard views (briefing, portfolio) | Needs update to use @frontasy/* |
| D1-connected composable components (#126) | Blocked on Frontasy migration (#41) |
| Bridge CompositionProvider → HudSocket (#133) | TODO |
| Server action hooks (#134) | TODO |

## Next OpenDash Session

Wait for Frontasy Sprint 1 (#41-43), then:
1. `pnpm add @frontasy/composition @frontasy/hooks @frontasy/renderer`
2. Build D1-connected components (MetricsSource, BriefingDisplay, AlertFilter)
3. Wire to Scram Jet metrics data
4. Bridge events to HudSocket for real-time

## See Also

- `Standards/architecture-v2-saas-printer.md` — Full architecture
- `Standards/frontasy-opendash-split.md` — What lives where
- Frontasy `PRIORITY.md` — Engine development priorities

---
Last updated: 2026-03-25
