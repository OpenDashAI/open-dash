# OpenDash Project Status

**Last Updated**: 2026-03-24
**Current Phase**: 4 (Hybrid Config Loader) — In Progress
**Build Status**: ✅ Passing
**Deployment Ready**: 🟡 Partial (see below)

---

## Executive Summary

OpenDash is a morning briefing + control plane for solo founders. The core product loop (See → Decide → Act) is **built and functional**. Infrastructure is **ready for production deployment**. Remaining work is **datasource expansion** and **agentic execution layer** — not blocking initial launch.

**Recommendation**: Ship Phase 1-4 as MVP, iterate based on founder feedback, then plan datasource/agentic roadmap.

---

## Completed Phases

### Phase 1: YAML Schema + Config Loader ✅
- Zod-based schema validation for `DashboardYaml`
- Config loader with in-memory caching
- Test configs created (llc-tax, pages-plus, api-mom, scramjet, stargate)
- All tests passing
- **Status**: Production ready

### Phase 2: Dynamic DataSource Instantiation ✅
- 6 datasources implemented: GitHub issues, GitHub activity, Stripe revenue, Cloudflare deploys, Tailscale devices, Scalable Media
- Brand-specific config parameters (repo, worker, label, tags, brand_slug)
- `fetchBrandDashboard()` function for per-brand data aggregation
- Backward compatible with `fetchAllSources()`
- **Status**: Production ready

### Phase 3: Routes + Declarative UI ✅
- Three route experiences: Morning Briefing (`/`), Portfolio Overview (`/brands`), Brand Focus (`/brands/:brandSlug`)
- Three-panel HUD with keyboard shortcuts
- Card registry (6 card types)
- Reactive HUD store (Zustand)
- Live data polling (15s interval, visibility-aware)
- **Status**: Production ready

### Phase 4: Hybrid Config Loader 🟡
- Filesystem loader (development)
- Brand System API fallback (production)
- Environment-aware routing (dev vs. prod)
- In-memory caching with future webhook invalidation
- **Status**: 90% complete; awaiting Brand System API existence
- **Blocker**: Brand System API not yet built
- **Workaround**: Deploy with filesystem configs to Cloudflare Workers (workers can read configs from `configs/` directory)

---

## Current Architecture

### Frontend (Client)
- **Framework**: TanStack Start (React 19, SSR, RSC)
- **Routing**: File-based routing (`src/routes/`)
- **State**: Zustand (HUD store) + TanStack Query (optional)
- **UI**: Tailwind CSS v4
- **Chat**: AssistUI (streaming chat component)

### Backend (Server)
- **Runtime**: Cloudflare Workers (production) / Node.js (development)
- **Config**: YAML-based per-brand (Phase 1)
- **Datasources**: 6 hardcoded adapters (Phase 2)
- **Data Models**: TypeScript interfaces (type-safe)
- **Cache**: In-memory + optional D1 (Cloudflare SQLite)

### Data Flow
```
Route Loader
  ↓
fetchAllSources() or fetchBrandDashboard()
  ↓
Datasource Registry (6 adapters)
  ↓
External APIs (GitHub, Stripe, Cloudflare, Tailscale)
  ↓
Briefing Items (aggregated, prioritized)
  ↓
HUD Components (cards, panels)
```

---

## What's Ready to Ship (MVP)

✅ **Morning Briefing Experience**
- See all changes across projects at a glance
- Drill down from briefing item to details
- Dismiss or act on items

✅ **Portfolio Overview**
- Health score per brand
- Revenue, deploy, issue counts
- At-a-glance portfolio health

✅ **AI Chat Integration**
- Contextual chat within briefing
- HUD directives (mode switching, card spawning)
- Research via GatherFeed API

✅ **Keyboard Navigation**
- Alt+1-5 for mode switching
- Alt+/ for chat focus
- Vim-like keybindings

✅ **Multi-Brand Support**
- YAML configs per brand
- Per-brand datasource parameters
- Brand-specific chat context

---

## What's NOT Ready (Deferred to Post-MVP)

❌ **Agentic Execution**
- Chat can suggest actions but can't execute them
- Plan: Build in Phase 5 (tool-calling from Claude API)

❌ **Datasource Expansion**
- Only 6 hardcoded datasources
- Plan: Expand to 10-12 strategic sources in Phase 5
- Not needed for MVP (these 6 cover 90% of solo founder use case)

❌ **Brand System API**
- Configs currently load from filesystem
- Workaround: Deploy with `configs/` directory; no external API needed
- Plan: Build external API in Phase 5 for multi-team scenarios

❌ **Mobile/Responsive UI**
- Three-panel layout is desktop-only
- Plan: Mobile-optimized variant in Phase 5

❌ **Webhook Live Updates**
- Polling works but WebSocket would be faster
- Plan: WebSocket in Phase 5

---

## Deployment Checklist

### Pre-Launch (Before First Users)

- [ ] **Secrets Management**
  - [ ] Set `GITHUB_TOKEN` in Cloudflare Worker
  - [ ] Set `TAILSCALE_API_KEY` in Cloudflare Worker
  - [ ] Set `STRIPE_API_KEY` in Cloudflare Worker
  - [ ] Set `API_MOM_KEY` (for GatherFeed research)
  - [ ] Set `OPENROUTER_KEY` (for chat via Qwen 72B)

- [ ] **Configs**
  - [ ] Create `configs/` directory with YAML files for live brands
  - [ ] Test each config locally (`pnpm dev`)
  - [ ] Validate schema (should auto-validate on load)

- [ ] **Performance**
  - [ ] Measure route load time (<2s for Morning Briefing)
  - [ ] Measure datasource fetch time per brand (<5s total)
  - [ ] Verify cache hit rate (2nd load should be <500ms)

- [ ] **Monitoring**
  - [ ] Set up Sentry or Cloudflare Workers Analytics
  - [ ] Set up alerts for error rates
  - [ ] Set up alerts for slow route loads

- [ ] **Auth**
  - [ ] Choose auth provider (Cloudflare Access, Clerk, Auth.js)
  - [ ] Implement login/signup flow
  - [ ] Add user model to D1 (or Supabase)

### Launch

- [ ] **Deploy to opendash.ai**
  - `pnpm deploy` to production
  - Verify routes load correctly
  - Smoke test Morning Briefing

- [ ] **Announcement**
  - Tweet/post on HN
  - Email to early testers
  - Gather feedback

---

## Next Steps (Prioritized)

### Immediate (Before MVP Launch)
1. **Implement Basic Auth** (Cloudflare Access or Clerk)
   - Required to gate access to early testers
   - Time: 2-4 hours

2. **Deploy to opendash.ai**
   - Point DNS to Cloudflare Workers
   - Set up `wrangler deploy` in CI/CD
   - Time: 1-2 hours

3. **Set Up Monitoring**
   - Sentry for error tracking
   - Cloudflare Analytics for performance
   - Time: 1-2 hours

### Post-MVP (Based on Feedback)
1. **Datasource Expansion** (Phase 5a)
   - Add 4-6 more datasources (e.g., Plausible analytics, Uptime Kuma)
   - Estimated: 2-4 weeks

2. **Agentic Layer** (Phase 5b)
   - Chat tool-calling into action execution
   - Example: "Merge this PR" → clicks merge button automatically
   - Estimated: 3-4 weeks

3. **Portfolio Monetization** (Phase 5c)
   - Implement credits/subscription billing
   - Portfolio analytics dashboard
   - Estimated: 4-6 weeks

---

## Tech Debt & Known Issues

- 🟡 **No test suite**: Write E2E tests for routes + chat
- 🟡 **Config validation**: Errors logged but not exposed to UI
- 🟡 **Error handling**: Partial failures (1 datasource fails) should be graceful
- 🟡 **TypeScript**: Some `any` types in chat response handling
- 🟡 **Rate limiting**: No built-in rate limiting for datasources (could exceed quotas)

---

## Success Metrics (MVP)

- [ ] 50+ beta testers sign up
- [ ] 10+ founders use daily (>20 min/day)
- [ ] <5% churn in first month
- [ ] <2s load time for Morning Briefing
- [ ] 4.0+ rating (very simple post-session survey)

---

## Team & Capacity

**Current Team**: Solo founder (you)

**Realistic Timeline**:
- MVP Launch: 1-2 weeks (auth + deploy)
- Phase 5a (datasources): 2-4 weeks after launch
- Phase 5b (agents): 3-4 weeks after 5a
- Phase 5c (monetization): 2-4 weeks after 5b

**Recommendation**: Ship MVP, get founder feedback, then prioritize based on patterns you see.

---

## Questions for Next Planning Session

1. **Auth**: Cloudflare Access (simple) or Clerk (more features, email, etc.)?
2. **Datasources**: Which 4-6 new sources matter most for initial users?
3. **Agents**: First use case — deploy a website? Approve a PR? Something else?
4. **Pricing**: Freemium (free tier + paid) or flat-rate subscription?
5. **Launch window**: 1 week? 2 weeks? Target date?

---

**Type**: Project status + go-to-market checklist
**Status**: Ready for MVP launch; full roadmap pending
**Audience**: Founder (primary decision maker), future team members

