# Current Session Priority

**Status**: 🔴 COMPONENT ECOSYSTEM PHASE 2

**What**: Extract official components + build marketplace foundation
- Extract 5 components (GA4, Google Ads, GitHub Issues, Meta Ads, Email Metrics)
- Publish to npm registry
- Validate component SDK works in production

**Why**: Validation is complete (see Standards/COMPONENT-ECOSYSTEM-VALIDATION.md). This is the growth lever for opendash.ai — enabling community + enterprise components.

**What NOT to do**: Don't touch Alert System polish, deployment to opendash.ai, or Team Settings right now. These are blocked on component ecosystem working first.

**Next steps**:
1. Start with GA4 component extraction
2. Publish to npm (@opendash-components/ga4)
3. Integrate into dashboard registry
4. Repeat for Google Ads, GitHub, Meta, Email

**See also**:
- Standards/COMPONENT-ECOSYSTEM-VALIDATION.md (full roadmap)
- Standards/component-sdk-spec.md (SDK contract)
- packages/stripe-revenue/ (reference implementation)

---
Last updated: 2026-03-25
Updated by: User (clarifying priority system)
