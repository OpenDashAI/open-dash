# EPIC: MVP Launch Sprint — Founder Briefing Operating System

**Epic ID**: #26
**Status**: Ready to Start
**Phase**: Phase 9 (MVP Launch)
**Estimated Duration**: 4-5 days (30-40 hours)
**Target**: Ship MVP to 50+ beta users on opendash.ai

---

## Current State

✅ **Phase 8 Complete** (2026-03-24)
- 184 tests passing (100% baseline)
- 95% WCAG AA accessibility
- 84/100 Lighthouse performance
- Production-ready code
- Comprehensive documentation (DEPLOYMENT.md, SENTRY_SETUP.md, CI_CD_SETUP.md)

✅ **Infrastructure Ready**
- Domain: opendash.ai (owned + DNS access)
- Cloudflare Workers configured
- D1 database ready
- Environment secrets available

✅ **Product Ready**
- Morning Briefing experience complete
- Portfolio Overview + Project Focus modes
- Analytics dashboard (trending, anomalies, alerts)
- AI chat integration with HUD directives
- 6 datasource adapters (GitHub, Stripe, Cloudflare, Tailscale, Scalable Media)

❌ **MVP Launch Blockers** (What we're building now)
- Authentication: Need Clerk integration (currently basic password only)
- Email: Need provider setup (Resend recommended)
- Landing page: Needs CTA → Clerk signup conversion
- Deployment: Need production secrets + DNS verification
- Onboarding: Need welcome + setup email sequences

---

## Subtasks

### Task 1: Implement Clerk Authentication (Issue #20) ⚠️ CRITICAL PATH
**Effort**: 2-4 hours
**Blocker**: YES — all protected routes require this
**Owner**: TBD

**What to build**:
1. Create Clerk application at clerk.com
   - Generate API keys (publishable + secret)
   - Configure sign-in methods (email/password)
   - Set authorized URLs: http://localhost:3000, https://opendash.ai

2. Update src/worker.ts
   - Import Clerk SDK: `@clerk/remix`
   - Replace current basic auth with `getAuth()` from Clerk
   - Protect /api/* routes with auth middleware
   - Redirect unauthenticated users to /login

3. Create /login page
   - Display Clerk sign-in widget
   - Handle signup + login flows
   - Create user record in D1 on signup

4. Implement session handling
   - Store user ID + email in D1 users table
   - Return session cookie to client
   - Logout clears session

5. Test locally
   - pnpm dev
   - Sign up with email/password
   - Verify access to /api/brands
   - Test logout

6. Deploy to staging
   - Set CLERK_SECRET_KEY + CLERK_PUBLISHABLE_KEY
   - Test in staging environment
   - Verify all flows work

**Success Criteria**:
- [ ] Clerk project created with API keys
- [ ] /login page shows Clerk widget
- [ ] Signup creates user in D1
- [ ] Auth middleware protects /api routes
- [ ] Session cookie issued after login
- [ ] Logout clears session
- [ ] Tests pass (184 + new auth tests)
- [ ] Works in staging environment

**Secrets needed**:
```
CLERK_SECRET_KEY=sk_live_xxxxx
CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
```

---

### Task 2: Set Up Email Provider (Issue #22) ⚠️ CRITICAL PATH
**Effort**: 15-30 minutes
**Blocker**: YES — needed for onboarding sequence
**Decision**: Resend (recommended for MVP)
**Owner**: TBD

**Why Resend**:
- Fastest setup (15 min)
- Modern API (cleaner than SendGrid)
- $20/mo + $0.0001 per email
- Includes Vercel integration
- Can scale to SendGrid if needed

**What to do**:
1. Create Resend account at resend.com
   - Get API key

2. Add domain to Resend
   - Add SPF + DKIM records (takes 5-10 min to propagate)
   - Verify opendash.ai as sender domain

3. Install @resend/react SDK
   - `pnpm add @resend/react`

4. Update worker.ts
   - Import Resend SDK
   - Store API key in env.RESEND_API_KEY
   - Create email send helper function

5. Test email sending
   - Send test email to personal email
   - Verify delivery (should arrive in 1 min)

**Success Criteria**:
- [ ] Resend account created
- [ ] API key secured in wrangler secret
- [ ] SDK installed
- [ ] SPF + DKIM verified
- [ ] Test email sent successfully
- [ ] Ready for onboarding sequence integration

**Alternative Options** (if Resend doesn't work):
- **SendGrid**: $25/mo, free tier 100/day, more established
- **Amazon SES**: $0.10/1K emails, need sandbox approval, more setup

**Secrets needed**:
```
RESEND_API_KEY=re_xxxxx
```

---

### Task 3: Email Onboarding Sequences (Issue #24)
**Effort**: 2-3 hours
**Blocker**: NO — MVP can launch without, improves retention
**Owner**: TBD

**Sequence 1: Welcome Email (triggered on signup)**
```
From: OpenDash <onboarding@opendash.ai>
Subject: Welcome to OpenDash! 🎉

Hi {name},

You're in! Here's what you can now do:

1. Connect your first datasource (GitHub, Stripe, Tailscale)
2. See your morning briefing in 5 minutes
3. Ask questions in the AI chat

Quick Start: https://opendash.ai/getting-started
Support: support@opendash.ai

Get started →
```

**Sequence 2: Setup Reminder (24h after signup, if no login)**
```
From: OpenDash <onboarding@opendash.ai>
Subject: Need help getting started?

Hi {name},

Noticed you haven't logged in yet. Setting up takes just 5 minutes:

Step 1: Connect GitHub (automatic, 1 click)
Step 2: See your briefing live
Step 3: Ask AI about your metrics

Tutorial: https://opendash.ai/video
Help: support@opendash.ai

Let's go →
```

**Sequence 3: Feature Discovery (7d after signup, if active)**
```
From: OpenDash <insights@opendash.ai>
Subject: Did you know? AI Chat is powerful for analysis

Hi {name},

Your briefing is great for status checks. But did you know you can ask OpenDash anything?

Example questions:
- "Why did GitHub issues spike last week?"
- "Which datasource needs attention?"
- "Show me my health trends"

Try it now →
```

**Implementation**:
1. Create email templates in `src/lib/email/templates/`
   - welcome.tsx
   - setup-reminder.tsx
   - feature-discovery.tsx

2. Add email triggers in src/worker.ts
   - On user signup: send welcome email
   - After 24h no login: send reminder (use D1 last_login timestamp)
   - After 7d activity: send feature discovery

3. Track email state in D1
   - Add emails_sent table (user_id, email_type, sent_at)
   - Prevent duplicate sends

4. Test locally
   - Sign up → verify welcome email arrives
   - Wait 24h logic → verify reminder queued
   - Verify feature discovery after 7d

**Success Criteria**:
- [ ] Welcome email sends on signup
- [ ] Setup reminder triggers 24h after signup
- [ ] Feature discovery triggers after 7d
- [ ] Email templates render correctly
- [ ] No duplicate emails sent
- [ ] All sequences tested end-to-end

---

### Task 4: Production Deployment & Verification (Issue #21) ⚠️ CRITICAL PATH
**Effort**: 1-2 hours
**Blocker**: YES — need live domain for launch
**Owner**: TBD

**What to do**:
1. Set production secrets
   ```bash
   wrangler secret put CLERK_SECRET_KEY --env production
   wrangler secret put CLERK_PUBLISHABLE_KEY --env production
   wrangler secret put RESEND_API_KEY --env production
   wrangler secret put AUTH_SECRET --env production
   wrangler secret put GITHUB_TOKEN --env production
   wrangler secret put API_MOM_KEY --env production
   ```

2. Configure production environment
   - Update wrangler.jsonc
   - Set routes: opendash.ai, www.opendash.ai
   - Enable D1 binding

3. Build production bundle
   ```bash
   pnpm build
   ```

4. Deploy to Cloudflare
   ```bash
   wrangler deploy --env production
   ```

5. Configure DNS
   - Add CNAME: opendash.ai → open-dash.{account-id}.workers.dev
   - DNS propagation: ~5-30 min
   - Verify with: `nslookup opendash.ai`

6. Verify endpoints
   ```bash
   # Test health check
   curl https://opendash.ai/health

   # Test API
   curl https://opendash.ai/api/brands

   # Test login redirect
   curl -L https://opendash.ai/
   ```

7. Test with real datasources
   - Sign up with GitHub/Stripe connected
   - Verify morning briefing loads
   - Verify analytics dashboard works
   - Check <2s load time

8. Set up Sentry
   - Follow SENTRY_SETUP.md (30 min)
   - Create Sentry project at sentry.io
   - Install @sentry/cloudflare-workers
   - Initialize in worker.ts
   - Configure Slack alerts

**Success Criteria**:
- [ ] opendash.ai resolves to production worker
- [ ] /health endpoint returns 200
- [ ] All datasources connecting
- [ ] Morning briefing loads <2s
- [ ] No 500 errors in Sentry
- [ ] Analytics dashboard working
- [ ] Sentry capturing errors
- [ ] Slack alerts configured

---

### Task 5: Landing Page CTA Integration (Issue #23)
**Effort**: 30-60 minutes
**Blocker**: NO — can launch with existing, improves GTM
**Owner**: TBD

**Current State**:
- Landing page already exists at /landing
- May need CTA → Clerk signup update

**What to update**:
1. Review existing landing page
   - Check if "Get Started" button exists
   - Verify it links to /login

2. Update CTA button
   - Change action to: `href="/login"` (Clerk sign-in)
   - Add loading state while Clerk widget loads
   - Test on mobile (375px+)

3. Add SEO tags
   ```tsx
   <meta name="description" content="See all your projects in 5 minutes" />
   <meta property="og:image" content="https://opendash.ai/briefing-screenshot.png" />
   <meta property="og:title" content="OpenDash — Morning Briefing" />
   ```

4. Verify mobile responsiveness
   - Test at 375px, 768px, 1024px
   - Ensure CTA button is touch-friendly
   - Check image loading

5. Test conversion flow
   - Click CTA → lands at /login
   - Sign up → creates user
   - Onboarding email arrives

**Success Criteria**:
- [ ] Landing page loads <2s
- [ ] CTA button converts to /login
- [ ] Mobile responsive (375px+)
- [ ] SEO tags present
- [ ] No console errors
- [ ] Full flow tested (CTA → signup → email)

---

### Task 6: Getting Started Guide (Issue #25)
**Effort**: 1-2 hours
**Blocker**: NO — can defer to week 2 if needed
**Owner**: TBD

**What to do**:
1. Update USER_GUIDE.md
   - Add "Quick Start" section (5 min setup)
   - Step 1: Sign up with Clerk
   - Step 2: Connect first datasource (GitHub recommended)
   - Step 3: View morning briefing
   - Step 4: Try AI chat questions

2. Record video walkthrough (5-10 min)
   - Use Loom or ScreenFlow
   - Show: signup → connect datasource → see briefing
   - Publish to YouTube (set to unlisted)
   - Get shareable link

3. Create getting-started email
   - Send after signup (or in welcome email)
   - Link to video
   - Link to USER_GUIDE.md
   - Link to FAQ section

4. Test end-to-end
   - New user can follow guide without friction
   - <10 min total setup time
   - All links work

**Success Criteria**:
- [ ] USER_GUIDE.md has quick start (5 min)
- [ ] Video published and linked
- [ ] Guide is <10 min total
- [ ] No broken links
- [ ] Mobile-friendly (can follow on phone)

---

### Task 7: Production Monitoring & Alerts Setup
**Effort**: 30 minutes
**Blocker**: NO — can defer to day 2 if needed
**Owner**: TBD

**What to do**:
1. Configure Sentry alerts
   - Set up error-rate threshold: trigger if >5% errors
   - Set up latency alert: trigger if p95 >3s
   - Configure Slack channel: #opendash-alerts

2. Set up Cloudflare dashboard
   - Monitor request count (target: 100+ daily)
   - Monitor error rate (target: <1%)
   - Monitor CPU time (should be <100ms per request)

3. Create monitoring dashboard
   - Sentry: Error tracking, performance
   - Cloudflare: Request volume, latency
   - Clerk: Signup count, active users
   - Resend: Email delivery rate

4. Document on-call procedures
   - Alert acknowledgement
   - Common fixes
   - Escalation path

**Success Criteria**:
- [ ] Sentry alerts routing to Slack
- [ ] Cloudflare dashboard accessible
- [ ] Baseline metrics recorded (requests/errors/latency)
- [ ] Team aware of monitoring setup

---

### Task 8: Beta User Recruitment & GTM (Parallel work, not blocking)
**Effort**: 4-8 hours (spread over 2 weeks)
**Blocker**: NO — MVP launches when Task 1-4 done
**Owner**: TBD

**Day 1 Announcement**:
- [ ] Post to Hacker News (Show HN)
- [ ] Tweet announcement + screenshot
- [ ] Post to Product Hunt
- [ ] Email founder friends (10-20 direct invites)

**Week 1 Outreach**:
- [ ] Collect feedback via Slack channel
- [ ] Monitor NPS survey responses
- [ ] Identify top pain points
- [ ] Plan interviews with active users

**Week 2 Content**:
- [ ] Write blog post: "How we built OpenDash"
- [ ] Create case study: "How founder X uses OpenDash"
- [ ] Record demo video (5 min)
- [ ] Share on Twitter, LinkedIn, Reddit

**Metrics**:
- [ ] 50+ signups by end of week 1
- [ ] 20+ daily active users by end of week 2
- [ ] 8+ interviews completed
- [ ] 5+ community posts/shares

---

## Timeline

### Day 1 (2-4 hours)
- [ ] Task 1: Clerk auth implementation
  - Setup Clerk account
  - Update src/worker.ts
  - Test locally
  - Deploy to staging

### Day 2 (1-2 hours)
- [ ] Task 2: Email provider setup
  - Create Resend account
  - Configure DNS records
  - Test email sending

### Day 3 (1-2 hours)
- [ ] Task 4: Production deployment
  - Set secrets
  - Deploy to production
  - Configure DNS (opendash.ai)
  - Verify all endpoints
  - Setup Sentry (30 min from SENTRY_SETUP.md)

### Day 4 (2-4 hours)
- [ ] Task 3: Email onboarding sequences
  - Create email templates
  - Implement triggers
  - Test sequences
  - OR Task 6: Getting started guide
  - Record video
  - Update USER_GUIDE.md

### Day 5 (1-2 hours)
- [ ] Task 5: Landing page CTA updates
  - Verify landing page CTA → /login
  - Test mobile responsiveness
  - Verify conversion flow
  - SEO tags

### Parallel (2-3 hours/week)
- [ ] Task 8: Beta recruitment
  - Day 1: Announce (HN, Twitter, PH)
  - Day 2: Email invites
  - Week 2: Content + interviews

---

## Dependencies

```
Task 1 (Clerk) ✓ UNBLOCKED
    ↓
Task 2 (Email Provider) ✓ UNBLOCKED
Task 4 (Deployment) ✓ UNBLOCKED
Task 5 (Landing Page CTA) ✓ UNBLOCKED
    ↓
Task 3 (Email Sequences) [depends on 1+2]
Task 6 (Getting Started) [depends on 1]
Task 7 (Monitoring) [depends on 4]
    ↓
Task 8 (GTM) [depends on 4, can start day 1]
```

**Critical Path**: Task 1 → Task 2 → Task 4 = ~5-7 hours
**Can Run in Parallel**: Task 5, Task 8 = 1-2 hours each
**Nice to Have**: Task 3, Task 6, Task 7

---

## Architecture Overview

```
User Journey:
1. Visits opendash.ai (landing page)
2. Clicks "Get Started" → /login (Clerk sign-in)
3. Enters email + password → signup
4. Clerk redirects to /onboarding
5. Receives welcome email (Resend)
6. Connects first datasource (GitHub)
7. Sees morning briefing (real data)
8. Tries AI chat questions
9. Gets setup reminder email (24h)
10. Active user in analytics

Technical Flow:
Landing Page ← CTA → /login (Clerk Widget)
                    ↓
            Sign up / Login
                    ↓
            Create D1 user record
                    ↓
            Redirect to /onboarding
                    ↓
            Send welcome email (Resend)
                    ↓
            Connect datasources
                    ↓
            Load briefing data
                    ↓
            Show analytics + AI chat
```

---

## Success Metrics (MVP Launch)

| Metric | Target | How to Track |
|--------|--------|--------------|
| **Beta Signups** | 50+ | Clerk dashboard |
| **Daily Active Users** | 20+ | Analytics view |
| **Critical Bugs** | 0 | Sentry errors |
| **Load Time** | <2s | Lighthouse |
| **Uptime** | >99% | Cloudflare |
| **Error Rate** | <1% | Sentry |
| **Email Delivery** | >95% | Resend dashboard |
| **Founder Interviews** | 5+ | Spreadsheet |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Clerk auth integration bugs | High | Test in staging first, have rollback ready |
| Email deliverability issues | Medium | Start with Resend free tier, test SPF/DKIM |
| DNS propagation delays | Low | Configure early, point to *.workers.dev as backup |
| Database schema migration | Medium | Follow DEPLOYMENT.md migration procedure |
| High error rate on launch | High | Monitor Sentry continuously, have on-call rotation |
| Slow load times | Medium | Pre-warm datasource connections, use caching |

---

## Secrets Checklist

Before launching, ensure all secrets are set:

```bash
# Clerk
wrangler secret put CLERK_SECRET_KEY --env production
wrangler secret put CLERK_PUBLISHABLE_KEY --env production

# Email
wrangler secret put RESEND_API_KEY --env production

# Existing (already set)
wrangler secret put GITHUB_TOKEN --env production
wrangler secret put API_MOM_KEY --env production
wrangler secret put AUTH_SECRET --env production
```

---

## Documentation References

- 📖 [DEPLOYMENT.md](./DEPLOYMENT.md) — Full deployment guide
- 🚨 [SENTRY_SETUP.md](./SENTRY_SETUP.md) — Error tracking setup
- 🚀 [CI_CD_SETUP.md](./CI_CD_SETUP.md) — Automated deployment
- 👤 [USER_GUIDE.md](./USER_GUIDE.md) — User operations
- 🚨 [ALERT_RULES.md](./ALERT_RULES.md) — Alert configuration

---

## Decision Log

**2026-03-24 - Authentication**: Chose Clerk over custom auth
- Reason: Better UX, built-in email verification, sessions, future-ready for teams
- Cost: Free up to 1,000 users
- Alternative considered: Cloudflare Access (simpler but less featured)

**2026-03-24 - Email Provider**: Chose Resend (with SendGrid fallback)
- Reason: Fastest setup, modern API, $21/mo at 10k emails/mo
- Alternative 1: SendGrid ($25/mo, more established)
- Alternative 2: Amazon SES ($1/mo, but complex setup)
- Plan: Start with Resend, migrate to SendGrid if volume exceeds 10k/mo

**2026-03-24 - Landing Page**: Use existing landing page
- Reason: Already built, just needs CTA update
- Alternative: Rebuild in Next.js (too slow for MVP)

**2026-03-24 - Deployment**: Cloudflare Workers production
- Reason: Already set up, costs minimal, scales with usage
- Alternative: Vercel (could use, but CF Workers is faster)

---

## Status

**Ready to Start**: ✅ YES
**All Blockers Cleared**: ✅ YES
**Estimated Completion**: 4-5 working days
**Phase Transition**: Phase 8 → Phase 9 (MVP Launch)

**Next Step**: Begin Task 1 (Clerk auth implementation)

---

**Epic Created**: 2026-03-24
**Last Updated**: 2026-03-24
**Version**: 1.0 (Ready for Implementation)
