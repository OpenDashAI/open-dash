# OpenDash Quick Start (5 Minutes)

**Welcome to OpenDash!** This page gets you oriented in 5 minutes. For deeper dives, see the [complete documentation index](README.md).

---

## What is OpenDash?

OpenDash is a **B2B intelligence platform for marketing teams and agencies**. It consolidates data from 9+ sources (Stripe, Google Ads, GA4, Meta Ads, GitHub, Cloudflare, Tailscale, and more) into a unified morning briefing dashboard.

**Key stats**:
- TAM: $5B (marketing operations teams, agencies)
- Pricing: $49/$199/custom (3-tier)
- Target: 20 customers @ $300/mo average = $50k+ MRR
- Timeline: 12 weeks to launch

---

## I Want To...

### 👤 Understand the Product
Start here if you're new to OpenDash or want to understand positioning.

1. **30-sec overview** → [What is OpenDash?](#what-is-opendash) (you're reading it)
2. **Product strategy** → [PRODUCT.md](strategy/PRODUCT.md) (3 min read)
3. **Full business case** → [B2B-STRATEGIC-BUNDLE.md](strategy/B2B-STRATEGIC-BUNDLE.md) (15 min read)

### 🚀 Deploy to Production
Ready to launch? Follow this path.

1. **Check readiness** → [MVP-LAUNCH-STATUS.md](status/MVP-LAUNCH-STATUS.md) (2 min)
2. **Setup database** → [D1_SETUP.md](setup/D1_SETUP.md) (10 min)
3. **Deploy & monitor** → [DEPLOYMENT-GUIDE.md](guides/DEPLOYMENT-GUIDE.md) (20 min)
4. **Setup CI/CD** → [CI_CD_SETUP.md](setup/CI_CD_SETUP.md) (15 min)

### 🏗️ Understand Architecture
Need technical depth? This path explains how OpenDash works internally.

1. **Architecture overview** → [TECHNICAL-ARCHITECTURE-REVIEW.md](architecture/TECHNICAL-ARCHITECTURE-REVIEW.md) (15 min)
2. **Datasource system** → [DATASOURCES-VS-PRIME-ARCHITECTURE.md](architecture/DATASOURCES-VS-PRIME-ARCHITECTURE.md) (10 min)
3. **Data integrity** → [ARCHITECTURE-REVIEW-data-integrity-schema.md](architecture/ARCHITECTURE-REVIEW-data-integrity-schema.md) (10 min)
4. **Permission model** → [org-rbac-model.md](org-rbac-model.md) (5 min)

### 📊 Use the Dashboard
Want to operate OpenDash as an end-user?

1. **User guide** → [USER_GUIDE.md](guides/USER_GUIDE.md) (5 min)
2. **Understanding metrics** → [ANALYTICS-BUSINESS-CASE.md](research/ANALYTICS-BUSINESS-CASE.md) (5 min)
3. **Alerts & rules** → [ALERT_RULES.md](guides/ALERT_RULES.md) (3 min)

### 🧩 Build a Component
Interested in the component ecosystem?

1. **Component overview** → [docs/components/README.md](components/) (3 min)
2. **SDK specification** → [Standards/component-sdk-spec.md](../Standards/component-sdk-spec.md) (10 min)
3. **Example component** → [packages/stripe-revenue/README.md](../packages/stripe-revenue/README.md) (5 min)

### 🧠 Understand Competitive Intelligence
Want to know how CI system works?

1. **15-min quickstart** → [COMPETITIVE-INTELLIGENCE-QUICKSTART.md](competitive-intel/COMPETITIVE-INTELLIGENCE-QUICKSTART.md)
2. **Full system design** → [COMPETITIVE-INTELLIGENCE-SYSTEM.md](competitive-intel/COMPETITIVE-INTELLIGENCE-SYSTEM.md)
3. **Operations guide** → [COMPETITOR-INTEL-OPERATIONS.md](competitive-intel/COMPETITOR-INTEL-OPERATIONS.md)

### 📋 Plan Next Sprint
Need to know what's next?

1. **Current status** → [STATUS.md](status/STATUS.md) (1 min)
2. **Priorities** → [NEXT-CYCLE-PRIORITIES.md](roadmaps/NEXT-CYCLE-PRIORITIES.md) (5 min)
3. **Full execution plan** → [COMPLETE_EXECUTION_PLAN.md](execution/COMPLETE_EXECUTION_PLAN.md) (20 min)
4. **90-day roadmap** → [90-DAY-ROADMAP.md](roadmaps/90-DAY-ROADMAP.md) (10 min)

---

## Navigation Guide

### 📚 All Documentation
See [Complete Documentation Index](README.md) for 80+ documents organized by category.

### 📁 Main Categories

| Category | Entry Point | Best For |
|----------|-------------|----------|
| **Strategy** | [Strategy Docs](strategy/) | Understanding positioning & market |
| **Architecture** | [Architecture Docs](architecture/) | Technical decisions & design |
| **Components** | [Component Docs](components/) | Building extensions |
| **Deployment** | [Deployment Docs](deployment/) | Getting to production |
| **Setup** | [Setup Guides](setup/) | Environment configuration |
| **Execution** | [Execution Plans](execution/) | Planning sprints |
| **Competitive Intel** | [CI System](competitive-intel/) | Market monitoring |
| **Status & Progress** | [Status Docs](status/) | Tracking where we are |

### 🔑 Key Documents

**Most important** (read these first):
1. PRODUCT.md (strategy/PRODUCT.md)
2. TECHNICAL-ARCHITECTURE-REVIEW.md (architecture/)
3. B2B-STRATEGIC-BUNDLE.md (strategy/)
4. DEPLOYMENT-GUIDE.md (guides/)

**Reference** (keep handy):
1. STATUS.md (status/) - Always up-to-date snapshot
2. NEXT-CYCLE-PRIORITIES.md (roadmaps/) - What's next
3. FAQ sections in guides/

---

## Quick Facts

### Features Included ✅
- 9+ datasource integrations (Stripe, GA4, Google Ads, Meta Ads, GitHub, Cloudflare, Tailscale, Email, Competitive Intel)
- Multi-user team management with RBAC
- Smart alerts & anomaly detection
- Billing integration (Stripe)
- Referral system (friend codes, growth engine)
- Real-time briefing dashboard
- API access for custom integrations

### Still Building 🚧
- Advanced visualization (phase 3)
- Component marketplace (phase 4)
- Custom report builder (phase 5)

### Not In Scope ❌
- Solo founder briefing tool (pivoted to B2B)
- Video production features (different product)
- Complex composable component library (standard components only)

---

## Getting Help

**Can't find what you need?**

1. Search the [complete index](README.md) by keyword
2. Check category READMEs for navigation within a topic
3. Look for "See Also" sections for related docs
4. Check CLAUDE.md for project conventions

**Contributing to docs?**

When adding new documentation:
1. Pick the right category (check directory structure)
2. Create a descriptive filename
3. Add it to the category README
4. Link from related documents
5. Update the main [README.md](README.md)

---

## Architecture at a Glance

```
User Dashboard (TanStack Start SPA)
         ↓
   API Routes (Hono on Cloudflare Workers)
         ↓
   Datasources Plugin System (9 integrations)
         ↓
   D1 Database (SQLite on Cloudflare)
   + R2 Storage (if needed)
         ↓
   External Services (Stripe, GA4, GitHub, etc)
```

**Key insight**: Datasources are pluggable. Add new data sources by implementing the `DataSource` interface.

---

## Next Steps

1. **Choose your path** (pick one from "I Want To..." section above)
2. **Follow the links** in your chosen path
3. **Read the first document** in 5-10 minutes
4. **Explore deeper** as needed
5. **Check [Complete Index](README.md)** when you need something specific

**Ready? Start here:**
- 👤 New to OpenDash? → [strategy/PRODUCT.md](strategy/PRODUCT.md)
- 🚀 Ready to deploy? → [guides/DEPLOYMENT-GUIDE.md](guides/DEPLOYMENT-GUIDE.md)
- 🏗️ Need architecture? → [architecture/TECHNICAL-ARCHITECTURE-REVIEW.md](architecture/TECHNICAL-ARCHITECTURE-REVIEW.md)

---

**Last updated**: 2026-03-25
**See also**: [Complete Documentation Index](README.md) | [CLAUDE.md](../CLAUDE.md)
