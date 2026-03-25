# OpenDash Standards Index

## ⚠️ Architecture (Definitive — 2026-03-25)

**component-system-correct-architecture.md** — THE source of truth
- Scram Jet collects ALL external data → D1 metrics table
- Components are LOCAL (shadcn model), event-driven via CompositionProvider
- Components read from D1, NOT from external APIs
- NO npm packages, NO marketplace, NO Component SDK

**component-registry-solves-ai-composition.md** — Why this works
- Registry with event contracts enables AI composition via constraint satisfaction
- AI selects components, wires events, validates graph — mechanically verifiable
- Finite components + typed contracts = no hallucination

**actual-composition-architecture-event-driven.md** — How it works
- CompositionProvider manages registration, event routing, listener subscriptions
- Components communicate via emitEvent / onComponentEvent
- Three working examples: Dashboard, MusicPlayer, EmailClient

---

## Active Issues

- **#125** — shadcn-style component registry with event contracts
- **#126** — D1-connected composable components (MetricsSource, BriefingDisplay, AlertFilter)

---

## Other Standards

- `agent-sdk-authentication.md` — OAuth token auth for Agent SDK
- `virtual-media-complete-architecture.md` — Virtual Media platform design
