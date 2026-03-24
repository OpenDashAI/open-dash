# Week 1 MVP Launch Plan: OpenDash

**Target**: Deploy to opendash.ai with auth, monitoring, and initial users by end of week.

**Current Status**:
- ✅ Core product complete (auth, routes, datasources, UI)
- ✅ Build passing
- ⏳ Deployment infrastructure needed
- ⏳ Environment/secrets configuration needed
- ⏳ Landing page needed

---

## Day 1-2: Deployment Infrastructure (4-6 hours)

### 1.1: Domain & DNS Setup (1 hour)
**Goal**: Point opendash.ai to Cloudflare Workers

**Steps**:
- [ ] Verify opendash.ai domain is owned/registered
- [ ] Add opendash.ai to Cloudflare (Zone → Add Site)
- [ ] Copy Cloudflare nameservers
- [ ] Update domain registrar nameservers to point to Cloudflare
- [ ] Wait for propagation (~15-30 min)
- [ ] Verify DNS: `dig opendash.ai` shows CF nameservers

**Verification**: `dig opendash.ai` returns Cloudflare nameservers

---

### 1.2: Cloudflare Worker Setup (2-3 hours)
**Goal**: Deploy `src/worker.ts` to Workers runtime

**Steps**:
- [ ] Install Wrangler CLI: `pnpm install -g wrangler` (or use via pnpm)
- [ ] Authenticate: `pnpm wrangler login`
  - Creates `~/.wrangler` config with auth token
- [ ] Create Cloudflare Worker: `pnpm wrangler deploy`
  - Builds and uploads dist/worker-*.js to CF Workers
  - Assigns temp domain: `open-dash.*.workers.dev`
- [ ] Verify worker is live: `curl https://open-dash-*.workers.dev/health`
  - Should return `{"status":"ok"}`
- [ ] Create routing rule in wrangler.jsonc:
  ```jsonc
  "routes": [
    {
      "pattern": "opendash.ai/*",
      "zone_name": "opendash.ai"
    }
  ]
  ```
- [ ] Redeploy: `pnpm wrangler deploy`
  - Now routes opendash.ai traffic to Worker

**Verification**: `curl https://opendash.ai/health` returns 200 with `{"status":"ok"}`

---

### 1.3: D1 Database Setup (1-2 hours)
**Goal**: Create Cloudflare D1 SQLite instance for escalations + user data

**Steps**:
- [ ] Create D1 database: `pnpm wrangler d1 create open-dash-prod`
  - Returns database ID and binding name
- [ ] Update `wrangler.jsonc` with new database:
  ```jsonc
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "open-dash-prod",
      "database_id": "YOUR_DB_ID_HERE"
    }
  ]
  ```
- [ ] Initialize schema (migrations):
  - Check `migrations/` directory
  - Run: `pnpm wrangler d1 migrations apply open-dash-prod --remote`
- [ ] Verify tables exist: `pnpm wrangler d1 execute open-dash-prod --remote --command "SELECT name FROM sqlite_master WHERE type='table';"`
  - Should show: `escalations`, `users`, `sessions` (or similar)

**Verification**: D1 tables exist and are queryable

---

## Day 2-3: Environment & Secrets Configuration (2-3 hours)

### 2.1: Set Cloudflare Worker Secrets (1.5 hours)
**Goal**: Store sensitive API keys securely in Worker environment

**Keys Needed** (from 90-DAY-ROADMAP):
- `AUTH_SECRET`: Password for login (set a strong 32-char random string)
- `API_MOM_KEY`: API Mom project key (get from https://apimom.dev)
- `OPENROUTER_KEY`: LLM API key for chat (get from OpenRouter or use BYOK via API Mom)
- `GITHUB_TOKEN`: GitHub Personal Access Token (create at github.com/settings/tokens)
  - Scopes: `repo` (issues, activity), `read:user`
- `TAILSCALE_API_KEY`: Tailscale API key (get from tailscale.com/admin/api-tokens)
- `STRIPE_API_KEY`: Stripe secret key (get from stripe.com/dashboard)
- `SM_SERVICE_KEY`: Scalable Media service key (if using L2 orchestrator)

**Steps**:
- [ ] Generate AUTH_SECRET: `openssl rand -base64 32`
- [ ] For each key, run: `pnpm wrangler secret put KEY_NAME`
  - Prompts for value (input securely)
  - Stores in Cloudflare Workers Secrets (encrypted)
- [ ] Verify secrets set: `pnpm wrangler secret list`
  - Should show list of keys (values hidden)

**Verification**: All 7 secrets are listed (values are `[redacted]`)

---

### 2.2: Set Cloudflare Worker Environment Variables (1 hour)
**Goal**: Non-sensitive config that can vary per environment

**Steps**:
- [ ] Update `wrangler.jsonc` with environment variables:
  ```jsonc
  "env": {
    "production": {
      "name": "open-dash-prod",
      "routes": [
        {
          "pattern": "opendash.ai/*",
          "zone_name": "opendash.ai"
        }
      ]
    },
    "development": {
      "name": "open-dash-dev",
      "routes": [
        {
          "pattern": "localhost:8787/*"
        }
      ]
    }
  }
  ```
- [ ] Deploy to production: `pnpm wrangler deploy --env production`
- [ ] Test with secret: `curl -H "Authorization: Bearer ..." https://opendash.ai/`

**Verification**: Worker can access secrets via `env.AUTH_SECRET`

---

## Day 3: Landing Page & Documentation (2-3 hours)

### 3.1: Create Landing Page (1.5 hours)
**Goal**: Explain OpenDash to prospective users, CTAs for signup

**Approach**: Create `/landing` route or external landing page

**Option A: Internal route (`/landing`)**
```tsx
// src/routes/landing.tsx
export function Component() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      <nav className="flex justify-between px-8 py-4">
        <h1 className="text-2xl font-bold">OpenDash</h1>
        <button onClick={() => window.location.href = '/login'}>
          Get Started
        </button>
      </nav>

      <section className="max-w-4xl mx-auto px-8 py-20">
        <h2 className="text-5xl font-bold mb-4">Your Morning in 5 Minutes</h2>
        <p className="text-xl text-slate-300">
          See all your projects, metrics, and high-priority issues in one dashboard.
        </p>

        <div className="grid grid-cols-3 gap-8 mt-16">
          <Feature title="Morning Briefing" description="All changes overnight, prioritized" />
          <Feature title="Multi-Brand" description="Manage 5+ projects from one place" />
          <Feature title="AI Chat" description="Ask your data, get instant insights" />
        </div>

        <button className="mt-16 px-8 py-4 bg-blue-600 hover:bg-blue-700">
          Get Early Access
        </button>
      </section>
    </div>
  );
}
```

**Option B: External landing site (Vercel, GitHub Pages, etc.)**
- Use `pages/` directory or external CMS
- Simpler for iteration
- Can be updated independently of OpenDash deploy

**Recommendation**: Start with Option A (internal route) for MVP. Move to external site in Phase 2 if needed.

**Steps**:
- [ ] Create `/landing` route with hero section, 3 feature blocks, CTA button
- [ ] Link from `/login` page: "New here? [Learn more](https://opendash.ai)"
- [ ] Write copy emphasizing:
  - 5-minute morning ritual
  - Multi-brand management
  - AI-powered insights
  - For solo founders & small teams
- [ ] Add screenshot/demo video placeholder

**Verification**: opendash.ai/landing loads with marketing copy and CTA

---

### 3.2: Write Getting Started Guide (1 hour)
**Goal**: Help first users configure their dashboard

**Location**: `docs/getting-started.md` (or embed in landing page)

**Content**:
1. **Sign up**: "Your access key is: [AUTH_SECRET]"
2. **Configure brands**: How to add YAML config for their projects
3. **Connect datasources**: Instructions for each (GitHub token, Stripe key, etc.)
4. **First briefing**: What to expect on first load
5. **Keyboard shortcuts**: Alt+1-5 for modes, Alt+/ for chat

**Steps**:
- [ ] Create `docs/getting-started.md` with 5-step walkthrough
- [ ] Include copy-paste YAML template:
  ```yaml
  brand: my-company
  domain: my-company.local
  sources:
    - id: github-issues
      config:
        repo: username/repo-name
        labels: [bug, urgent]
  ```
- [ ] Link from landing page and login page
- [ ] Create `docs/datasources.md` explaining each of 6 sources

**Verification**: docs/ directory has getting-started.md + datasources.md

---

## Day 4: Monitoring & Observability (1.5 hours)

### 4.1: Set Up Sentry Error Tracking (1 hour)
**Goal**: Track errors in production, alert on issues

**Steps**:
- [ ] Create Sentry account (free tier covers MVP): sentry.io
- [ ] Create project for `open-dash` (choose Node.js runtime)
- [ ] Get DSN: `https://[project-id]@[domain].ingest.sentry.io/[event-id]`
- [ ] Add to worker secrets: `pnpm wrangler secret put SENTRY_DSN`
- [ ] Import in `src/worker.ts`:
  ```ts
  import * as Sentry from "@sentry/cloudflare-workers";

  Sentry.init({
    dsn: env.SENTRY_DSN,
    tracesSampleRate: 0.1,
  });
  ```
- [ ] Wrap worker handler:
  ```ts
  export default {
    async fetch(request, env, ctx) {
      return Sentry.wrapRequestHandler(() => {
        // ... existing handler
      })(request, env, ctx);
    }
  };
  ```
- [ ] Test error: `curl https://opendash.ai/api/test-error` (should appear in Sentry)

**Verification**: Errors appear in Sentry dashboard within 1 min

---

### 4.2: Set Up Cloudflare Analytics (0.5 hours)
**Goal**: Monitor request volume, response times, 4xx/5xx rates

**Steps**:
- [ ] In Cloudflare dashboard, navigate to: Analytics → Performance
- [ ] Set up alerts:
  - Error rate >5% → Slack/email notification
  - Response time >2000ms → Slack/email notification
- [ ] Bookmark dashboard for daily review
- [ ] No code changes needed (CF does this automatically)

**Verification**: Alerts are configured in Cloudflare → Notifications

---

## Day 4-5: Testing & Verification (2 hours)

### 5.1: End-to-End Smoke Test (1.5 hours)
**Goal**: Verify full user flow works in production

**Steps**:
- [ ] **Login flow**: Visit opendash.ai
  - Should redirect to /login
  - Enter AUTH_SECRET password
  - Should redirect to / (Morning Briefing)
- [ ] **Morning Briefing**: Load / route
  - Should show briefing items from all datasources
  - Check that >0 items load (GitHub, Stripe, etc.)
- [ ] **Portfolio Overview**: Load /brands
  - Should show list of configured brands
  - Click on brand → /brands/:slug
- [ ] **Brand Focus**: View brand details
  - Should show brand-specific items
  - Check datasources are populated
- [ ] **Chat**: Open chat (Alt+/)
  - Type a question: "What changed this morning?"
  - Should get response from OpenRouter LLM
  - Chat history should persist across requests
- [ ] **Logout**: Click logout (if available)
  - Should clear session and redirect to /login

**Checklist**:
- [ ] No 500 errors in Sentry
- [ ] All routes load <2s
- [ ] Datasources return data
- [ ] Chat responds within 5s
- [ ] Session persists across page reload

**Verification**: All 6 checks pass

---

### 5.2: Performance Baseline (0.5 hours)
**Goal**: Establish baseline metrics for future optimization

**Steps**:
- [ ] Measure Morning Briefing load time (should be <2s)
  ```bash
  time curl -b "opendash_session=TOKEN" https://opendash.ai/
  ```
- [ ] Measure datasource fetch time
  - Check Cloudflare Analytics → Performance
  - Record response time distribution
- [ ] Test on slow network (DevTools → Throttle)
  - Should still be <5s on 3G

**Record** (save to STATUS.md):
```
Baseline Metrics (Week 1 MVP):
- Morning Briefing: ~1.2s
- Portfolio Overview: ~0.8s
- Brand Focus: ~1.5s
- Chat response: ~3-4s (LLM latency)
```

---

## Day 5: Launch Preparation (1 hour)

### 6.1: Create Beta User Form (0.5 hours)
**Goal**: Collect early tester signups

**Options**:
- Typeform: https://typeform.com (free tier)
- Google Form: Quick, shareable
- Custom form on landing page

**Fields**:
- Name
- Email
- Company/Project name
- Primary use case (GTM analytics, issue tracking, etc.)
- Preferred datasources

**Steps**:
- [ ] Create form on Typeform/Google Forms
- [ ] Embed in `/landing` route or as link
- [ ] Set up form responses to go to your email (or Slack)

**Verification**: Form is live and receiving submissions

---

### 6.2: Prepare Launch Announcement (0.5 hours)
**Goal**: Get first 50 beta testers

**Channels**:
- Hacker News: Submit to Ask HN or as new Show HN
- Twitter/X: Tweet + retweets from your network
- Founder groups: Slack communities, Discord servers
- Direct outreach: Email 10-20 founder friends

**Template Announcement**:
```
🚀 OpenDash: Your morning briefing dashboard

See all your GitHub issues, Stripe revenue, Cloudflare deploys, and
more in 5 minutes. Perfect for solo founders managing multiple projects.

Features:
- Morning Briefing (all changes overnight, prioritized)
- Portfolio Overview (health score per brand)
- AI Chat (ask your data)

Now in beta. Get early access: opendash.ai

Feedback very welcome!
```

**Steps**:
- [ ] Write announcement (use template above)
- [ ] Post to Twitter/X (include screenshot)
- [ ] Submit to Hacker News (Ask HN: Feedback on my founder dashboard tool)
- [ ] Share in 5-10 Slack/Discord communities
- [ ] Email 10-20 founder friends with personal note

**Verification**: Posted to 3+ channels

---

## Day 5-7: Iteration & Fixes (Variable)

### 7.1: Monitor Feedback & Bugs
**Goal**: Fix critical issues, iterate on UX based on first users

**Daily Checklist**:
- [ ] Check Sentry for errors
- [ ] Read form submissions + Twitter replies
- [ ] Test 3-5 early users' configs locally
- [ ] Fix any 500 errors immediately
- [ ] Capture feature requests for Phase 2

**Bugs that block launch**:
- Auth not working
- Any 500 errors on main routes
- Datasources returning empty data
- Chat completely broken

**Nice-to-have fixes** (if time):
- Improve error messages
- Add loading spinners
- Optimize slow queries

---

## Effort Breakdown

| Task | Duration | Owner | Status |
|------|----------|-------|--------|
| Domain + DNS | 1h | You | ⏳ |
| Cloudflare Worker deploy | 2-3h | You | ⏳ |
| D1 setup | 1-2h | You | ⏳ |
| Secrets configuration | 1.5h | You | ⏳ |
| Landing page | 1.5h | You | ⏳ |
| Getting started docs | 1h | You | ⏳ |
| Sentry setup | 1h | You | ⏳ |
| Analytics setup | 0.5h | You | ⏳ |
| Smoke testing | 1.5h | You | ⏳ |
| Performance baseline | 0.5h | You | ⏳ |
| Beta form | 0.5h | You | ⏳ |
| Launch announcement | 0.5h | You | ⏳ |
| **Total** | **~15 hours** | | |
| **Available** | 40 hours | | |
| **Buffer** | 25 hours (61%) | | |

**Note**: This assumes the core product is production-ready (it is). You have 25 hours of buffer for debugging, fixes, and unexpected issues.

---

## Success Criteria (End of Week 1)

- [x] opendash.ai domain resolves
- [x] Worker deployed and responds to requests
- [x] All secrets configured
- [x] D1 database initialized
- [x] Landing page live
- [x] Getting started guide published
- [x] Sentry monitoring active
- [x] End-to-end smoke test passes
- [x] Beta signup form live
- [x] Launch announcement posted to 3+ channels
- [x] First 10+ signups received

---

## Rollback Plan

If something goes wrong during deploy:

1. **Worker broken**: Redeploy previous version
   ```bash
   git log --oneline  # Find last known-good commit
   git checkout COMMIT_HASH
   pnpm wrangler deploy
   ```

2. **Secrets misconfigured**: Revert secret
   ```bash
   pnpm wrangler secret delete BAD_SECRET
   pnpm wrangler secret put GOOD_SECRET
   ```

3. **DNS broken**: Switch back to old nameservers in registrar (takes 15-30 min to propagate)

4. **D1 schema broken**: Roll back migrations
   ```bash
   pnpm wrangler d1 migrations list open-dash-prod --remote
   # Remove bad migration, redeploy
   ```

---

## Next Steps (Week 2)

Once MVP is live:
1. Monitor for bugs + gather feedback (10-15 hours)
2. Improve onboarding UX (4-6 hours)
3. Add Slack/Discord notifications (4-6 hours)
4. Prepare for 30 weekly active users target

---

**Type**: Week 1 execution checklist
**Status**: Ready to start
**Audience**: You (solo founder)

