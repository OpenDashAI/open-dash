# Epic Plans

High-level epic-scope planning documents.

## Files

| Document | Epic | Scope | Status |
|----------|------|-------|--------|
| [EPIC-SCRAMJET-CONNECTORS.md](./EPIC-SCRAMJET-CONNECTORS.md) | #99 | Connector layer (Scram Jet YAML pipelines) | 🆕 ✅ |
| [EPIC-27-B2B-INTELLIGENCE-PLATFORM.md](./EPIC-27-B2B-INTELLIGENCE-PLATFORM.md) | #27 | B2B platform (all 12 issues) | ✅ |
| [EPIC-MVP-LAUNCH.md](./EPIC-MVP-LAUNCH.md) | MVP | Launch readiness | ✅ |

## Epic #99: Scram Jet Connector Layer (🆕 NEW)

4-week epic implementing Scram Jet Project as unified connector/datasource layer.

**Key Points**:
- Use Scram Jet YAML pipelines (not custom code)
- 50+ connectors ready immediately (zero dev)
- 200+ via auto-generation from OpenAPI specs
- Cloudflare Workers native (same ecosystem)
- Sub-100ms latency (real-time dashboards)

**Issues**:
1. #99.1 — Integration setup (5h)
2. #99.2 — YAML templates (4h)
3. #99.3 — Auto-generation (6h)
4. #99.4 — Dashboard integration (4h)
5. #99.5 — Documentation (3h)
6. #99.6 — Performance optimization (4h)

See [EPIC-SCRAMJET-CONNECTORS.md](./EPIC-SCRAMJET-CONNECTORS.md)

---

## Epic #27: B2B Intelligence Platform

12-issue epic covering the entire B2B product:

- Team & Org Management
- RBAC & Multi-tenant
- Analytics & Alerts
- Campaign Performance
- Competitive Intelligence
- Billing System
- Growth Engine (Referrals)

See [EPIC-27-B2B-INTELLIGENCE-PLATFORM.md](./EPIC-27-B2B-INTELLIGENCE-PLATFORM.md)

---

## Architecture Integration

**EPIC #99** (Scram Jet) is the **connector/datasource layer**:
- Provides data fetching from 50+ sources
- YAML pipelines → D1 metrics table
- Real-time, no coldstart

**EPIC #27** (B2B Platform) is the **product layer**:
- Team management, RBAC, billing
- Competitive intelligence features
- Dashboard UI consuming D1 metrics

**Result**: Connectors + Platform = Complete B2B product

## Related

- **[../](../)** — Top-level roadmaps
- **[../../strategy/](../../strategy/)** — Strategic context
- **[../../status/](../../status/)** — Progress tracking

---

**📍 Navigation**: [← Back to Roadmaps](../README.md) | [← Back to Docs Index](../../README.md)
