# Next Development Cycle: Prioritized Roadmap

**Date**: 2026-03-24
**Current Phase**: Phase 8 Complete → Phase 9 (MVP Launch Sprint)
**Est. Duration**: 2-3 weeks (40-50 hours)
**Target**: Ship MVP to 50 beta users

---

## Where We Are

✅ **Completed** (Phases 1-8):
- Analytics engine with trending, anomaly, alerts
- UI: Morning Briefing, Project Focus, Portfolio Overview
- 184 tests passing, 95% WCAG AA, 84/100 Lighthouse
- 6 comprehensive guides (deployment, user, alerts, Sentry, CI/CD, README)
- Request deduplication + memory cleanup optimizations
- 100% production-ready product

❌ **Missing** (Blocking MVP Launch):
- Clerk authentication (currently basic password only)
- Production deployment (code exists, needs execution)
- Landing page (public-facing site for GTM)
- Email onboarding (welcome + setup sequences)

---

## Next Development Cycle: 4-Week Plan

### WEEK 1-2: MVP Launch Sprint (Tier 1-2, Critical Path)

**Goal**: Ship founder briefing MVP with auth, live deployment, 50 beta signups

#### TIER 1: Authentication (2-4 hours) ⚠️ BLOCKS EVERYTHING
**Issue #20**: Implement Clerk auth
- Status: NOT STARTED
- Effort: 2-4 hours
- Blocker: YES (all protected routes require this)

**What to build**:
```typescript
// 1. Replace current auth in src/worker.ts
// Replace password validation with Clerk SDK
// Use getAuth() from @clerk/remix or similar

// 2. Protect routes
// POST /api/* → require authentication
// GET / → redirect to /login if not authed
// GET /login → show Clerk sign-in widget

// 3. Session handling
// getAuth() provides user ID + email
// Store in D1 users table with signup date
// Return session cookie to client
```

**Success criteria**:
- [ ] Clerk project created
- [ ] Clerk SDK integrated in worker.ts
- [ ] /login page shows Clerk sign-in widget
- [ ] Auth works: signup → create user → redirect to /
- [ ] Protected routes return 401 if not authed
- [ ] Logout clears session
- [ ] Tests pass (184 + new auth tests)

---

#### TIER 1: Production Deployment (1-2 hours) ⚠️ BLOCKS EVERYTHING
**Issue #21**: Deploy to opendash.ai
- Status: NOT STARTED
- Effort: 1-2 hours
- Blocker: YES (need live domain for GTM)

**What to build**:
```bash
# 1. Set production secrets
wrangler secret put AUTH_SECRET --env production
wrangler secret put API_MOM_KEY --env production
wrangler secret put GITHUB_TOKEN --env production
# (Use values from existing Cloudflare setup)

# 2. Deploy
pnpm build
wrangler deploy

# 3. Point DNS
# Add CNAME: opendash.ai → open-dash.<account>.workers.dev

# 4. Test endpoints
curl https://opendash.ai/health
curl https://opendash.ai/api/brands
# Verify all datasources connecting
```

**Success criteria**:
- [ ] opendash.ai resolves and returns 200
- [ ] /health endpoint works
- [ ] All datasources connecting (GitHub, Stripe, Tailscale, etc.)
- [ ] Sentry captures errors (test with /api/test-error)
- [ ] No 500 errors in production logs
- [ ] <2s load time for Morning Briefing

---

#### TIER 2: Landing Page (2-4 hours)
**Issue #23**: Create landing page
- Status: NOT STARTED
- Effort: 2-4 hours
- Blocker: NO (can launch without, but better GTM)

**What to build**:
```
Route: GET /landing (or external site)

Layout:
┌─────────────────────────────────────────┐
│ OpenDash Logo    [Login] [Get Started] │
├─────────────────────────────────────────┤
│                                         │
│  "See All Your Projects in 5 Minutes"   │
│                                         │
│  [Screenshot of Morning Briefing]       │
│                                         │
│  Features:                              │
│  ✓ Real-time briefing                   │
│  ✓ AI chat for insights                 │
│  ✓ Health scores + alerts               │
│                                         │
│  [Get Free Access →]                    │
│                                         │
├─────────────────────────────────────────┤
│ FAQs + Pricing (if applicable)          │
└─────────────────────────────────────────┘
```

**Success criteria**:
- [ ] Landing page created (React component)
- [ ] Screenshots embedded (Briefing + Portfolio)
- [ ] CTA → Clerk signup works
- [ ] Mobile responsive (375px+)
- [ ] Page loads <2s
- [ ] SEO basics (meta tags, og:image)

---

#### TIER 2: Getting Started Guide (1-2 hours)
**Issue #25**: Create walkthrough + video
- Status: 50% DONE (USER_GUIDE.md exists)
- Effort: 1-2 hours
- Blocker: NO (can defer to Week 2)

**What to do**:
1. **Link from landing page** → Getting Started
   - "Step 1: Sign up with Clerk"
   - "Step 2: Connect your first datasource"
   - "Step 3: View morning briefing"

2. **Create video walkthrough** (5 min)
   - Use Loom or similar
   - Show: Signup → Configure GitHub → See briefing
   - Publish to YouTube

3. **Update USER_GUIDE.md**
   - Add setup walkthrough section
   - Add common errors + fixes

**Success criteria**:
- [ ] User can sign up and see empty dashboard
- [ ] Video published with <50 views setup
- [ ] Quick start takes <10 min total

---

### WEEK 3: Email Onboarding + Validation

**Issue #24**: Onboarding email sequences
- Effort: 2-3 hours
- Status: NOT STARTED
- Blocker: NO (v1 MVP can launch without)

**What to build**:
```
Email 1 (on signup): Welcome
  - "You're in! Here's what OpenDash can do"
  - Link to getting started video
  - Link to docs

Email 2 (after 24h if no login): Setup reminder
  - "Need help connecting your first datasource?"
  - Step-by-step setup guide
  - Link to support

Email 3 (after 7 days if active): Feature discovery
  - "Did you know you can use AI chat to analyze your metrics?"
  - Show example insights
```

Implementation:
```typescript
// Use: SendGrid, Resend, or Mailgun
// Trigger: After user signup
// After 24h of no login
// After 7d of active use
```

---

### WEEK 4: Founder Validation Prep

**Get ready for Phase 2 (Validation)**:
- [ ] 50+ beta users signed up
- [ ] Setup Slack channel for feedback
- [ ] Create feedback form + NPS survey
- [ ] Plan 5-10 founder interviews
- [ ] Monitor Sentry for error patterns

---

## Implementation Sequence

### Day 1: Clerk Auth (2-4 hours)
```
1. Create Clerk account at clerk.com
2. Create Clerk application
3. Get API keys
4. Update src/worker.ts with Clerk SDK
5. Test login/logout locally
6. Deploy to staging
7. Test in staging
```

### Day 2: Production Deploy (1-2 hours)
```
1. Set production secrets
2. Build + deploy
3. Point DNS to opendash.ai
4. Verify all endpoints
5. Test with real datasources
6. Set up Sentry (follow SENTRY_SETUP.md)
7. Monitor for 30 min
```

### Day 3: Landing Page (2-4 hours)
```
1. Design landing page layout
2. Create React component
3. Add screenshots
4. Implement CTA → Clerk signup
5. Test mobile responsiveness
6. Add SEO tags
7. Deploy
```

### Day 4: Getting Started (1-2 hours)
```
1. Record 5-min video walkthrough
2. Upload to YouTube
3. Link from landing page
4. Update USER_GUIDE.md
5. Test walkthrough end-to-end
6. Verify <10 min setup time
```

### Day 5+: Email Onboarding (optional Week 2)
```
1. Set up email provider
2. Create email templates
3. Implement email triggers
4. Test email delivery
5. Monitor for bounces
```

---

## Success Metrics (MVP Launch)

| Metric | Target | How to Track |
|--------|--------|--------------|
| Beta signups | 50+ | Clerk dashboard |
| Daily active users | 20+ | Analytics |
| Critical bugs | 0 | Sentry errors |
| Load time | <2s | Lighthouse |
| Uptime | >99% | Cloudflare dashboard |
| Error rate | <1% | Sentry |

---

## Parallel: Phase 4 Work (When auth+deploy done)

**Issue #4**: Hybrid Config Loader
- Won't block MVP launch
- Can start Day 4-5 if on track
- Needed for production scalability

**What it is**:
```typescript
// In dev: Load from configs/*.yaml (current)
// In prod: Fall back to Brand System API if YAML missing

// Usage:
const config = await loadConfig(brand, env);
// Returns: DashboardYaml from YAML OR from API
```

---

## Notes & Decisions

1. **Clerk choice**:
   - ✅ Better than custom auth (email, signup UI, sessions built-in)
   - ✅ Free tier for <1000 users
   - ✅ Future-ready for teams

2. **Landing page**:
   - Can build simple React component OR separate Next.js site
   - Recommend React component (keep single repo)
   - Use screenshots from Storybook or manual screenshots

3. **Email**:
   - Can defer to Week 2 (v1 MVP works without)
   - Use SendGrid, Resend, or Mailgun
   - Keep templates simple (plain text OK)

4. **DNS**:
   - Will need control of opendash.ai domain
   - Add CNAME record to Cloudflare
   - May take 24h to propagate

---

## Blockers & Dependencies

- ⚠️ Need Clerk account + API keys
- ⚠️ Need opendash.ai domain access + DNS control
- ⚠️ Need SendGrid/email provider account (if doing emails)
- ✅ Sentry already documented (SENTRY_SETUP.md)
- ✅ CI/CD already documented (CI_CD_SETUP.md)

---

## Questions Before Starting

1. **Clerk vs alternatives?**
   - Clerk: Full-featured, free tier, good DX
   - Cloudflare Access: Simpler, but needs team plan
   - Recommendation: Clerk

2. **Email provider choice?**
   - SendGrid: Affordable ($20+/mo)
   - Resend: New, modern, Vercel integration
   - Mailgun: Cheaper, more API options
   - Recommendation: Resend (modern + Vercel tie-in)

3. **Domain for opendash.ai?**
   - Need this ASAP (blocks production deploy)
   - Can test with *.workers.dev domain first
   - Then update DNS when domain ready

4. **GTM strategy for signups?**
   - Day 1: Announce on HN, Twitter, Product Hunt
   - Day 2: Email founder friends (10-20 direct invites)
   - Week 2: Creator interviews + case studies
   - Week 3-4: Blog posts + community engagement

---

**Status**: Ready to start immediately
**Next Step**: Begin with Issue #20 (Clerk auth) on Day 1
**Estimated Completion**: 4-5 days of focused work