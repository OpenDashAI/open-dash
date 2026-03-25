---
name: Critical Design Question — Internal Component Viability
description: Before worrying about third-party ecosystems, can OpenDash itself use this component architecture successfully?
type: standard
---

# Critical Question: Can OpenDash Itself Use This Architecture?

**Date**: 2026-03-25
**Status**: Research question identified, requires analysis

## The Question

Even within **our own application**, would the component architecture work?

Forget third-party developers. Forget marketplace. Focus on: **Can we successfully modularize OpenDash's features (15+ datasources) using this component pattern?**

## Why This Matters

If we can't make it work for ourselves, we definitely can't build a marketplace or expect others to use it.

This is the foundational question before anything else.

## What "Works" Means

When GA4, Stripe, Google Ads, GitHub, Meta Ads, Email, etc. all run together in one dashboard, does the system:

1. **Perform acceptably?**
   - Registry fetches all 15 components in parallel on every dashboard load
   - 15 API calls every time user opens dashboard
   - Some slow (GA4, Email), some fast (Stripe)
   - Does slowest component block others? Does it timeout?
   - Is this acceptable for a SaaS product?

2. **Handle failures gracefully?**
   - If GA4 API is down, user sees empty array
   - If Google Ads fails, does it corrupt Stripe data?
   - If one component is slow, does dashboard wait?
   - Can users still see partial results?

3. **Coordinate between components?**
   - Email shows "open rate 3.2%"
   - GA4 shows "conversions 47"
   - Should the dashboard correlate these? (opened email → clicked → converted)
   - Or are they completely independent briefing items?
   - If independent → confusing UX (15 random metrics)
   - If coordinated → components need to talk to each other

4. **Scale operationally?**
   - 15 components = 15 environment variables to manage (GA4_PROPERTY_ID, STRIPE_KEY, etc.)
   - 15 different auth mechanisms (OAuth, API keys, service accounts)
   - 15 different SLAs/reliability levels
   - Can users actually configure all this? Or is it a nightmare?

5. **Stay maintainable?**
   - We own all 15 components
   - Each has bugs, needs updates
   - Stripe pushes API v2 → we update component
   - GA4 changes report format → we update component
   - Email API deprecated → we update component
   - Are we equipped to maintain 15 separate packages?

## The Real Test

**Hypothesis**: If we can make this work for OpenDash's own 15 datasources, we have a viable architecture.

**Counter-hypothesis**: This will become operationally expensive and we'll realize the component system isn't the right pattern.

## Questions We Need to Answer

1. **Performance**: What does "15 components fetching in parallel" look like?
   - Average load time per component?
   - Total dashboard load time?
   - User acceptable threshold?
   - Is Promise.allSettled() the right pattern? Or do we need timeout/priority?

2. **Coordination**: Should components be independent or coordinated?
   - Each returns BriefingItem[] independently
   - Dashboard just concatenates all items
   - Is this good enough for user?

3. **Operational burden**: What's the cost of maintaining 15 packages?
   - Release process: change code → npm publish → update dashboard deps → deploy
   - Vs. monolithic: change code → deploy
   - How much overhead is this?

4. **Failure modes**: What happens when components fail?
   - Current: silent (return empty array)
   - Better: return error briefing item?
   - How do users debug failures?

5. **Configuration complexity**: Can average user configure 15 components?
   - Each needs different secrets
   - Each needs different settings
   - Is this a blocker?

## Validation Approach

Instead of extracting GA4 + 4 more (5 total), what if we:

1. **Extract 3 components** (GA4, Stripe, GitHub)
2. **Deploy them as actual instances** running in production
3. **Measure real user experience**:
   - Dashboard load time
   - Error rates
   - User configuration difficulty
   - Maintenance overhead
4. **Then decide**: Is this pattern viable?

This answers the question from actual data, not theory.

## Related Documents

- `Standards/opendash-unified-platform-architecture.md` — Vision (assumes component pattern works)
- `Standards/COMPONENT-ECOSYSTEM-VALIDATION.md` — Validates SDK works (not full system)
- Commit `68901b8` — GA4 component (one example, not production-tested)

## Decision Point

**Before extracting 4 more components and building a full marketplace:**

Should we:
- **A)** Continue extracting all 15 (validate by volume)
- **B)** Deploy 3 components to production and measure (validate by reality)
- **C)** Something else?

What does real validation look like?
