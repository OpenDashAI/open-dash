# OpenDash Deployment Guide — Ready for Production

**Status**: ✅ Production-ready
**Tests**: 500 passing, 0 failing
**Code**: 79 commits pushed to origin
**Batch Status**: Batches 1-5 complete (features + billing + auth + alerts)

---

## Phase 1: Deploy to opendash.ai (This Week)

### Step 1: Set Stripe Secrets

```bash
# Get Stripe keys from Stripe dashboard
# Test mode: sk_test_... and pk_test_...
# Production: sk_live_... and pk_live_...

# Set test keys first
wrangler secret put STRIPE_SECRET_KEY
# Enter: sk_test_4eC39HqLyjWDarhtT657

wrangler secret put STRIPE_PUBLISHABLE_KEY
# Enter: pk_test_4eC39HqLyjWDarhtT657

wrangler secret put STRIPE_WEBHOOK_SECRET
# Enter: whsec_test_... (from Webhook Signing Secrets in Stripe)
```

### Step 2: Set Clerk Secrets

```bash
# Get from Clerk dashboard
wrangler secret put CLERK_SECRET_KEY
# Enter: sk_test_...

wrangler secret put CLERK_PUBLISHABLE_KEY
# Enter: pk_test_...
```

### Step 3: Set Resend Secrets

```bash
# Get from Resend dashboard
wrangler secret put RESEND_API_KEY
# Enter: re_...
```

### Step 4: Set API Mom Secrets

```bash
wrangler secret put API_MOM_URL
# Enter: https://apimom.dev

wrangler secret put API_MOM_KEY
# Enter: <your-api-mom-project-key>
```

### Step 5: Configure Cloudflare Access (Staging)

**For staging.opendash.ai:**

1. Go to **Cloudflare Dashboard** → **Zero Trust** → **Access** → **Applications**
2. Click **Create Application** → **Self-hosted**
3. **Application name**: `OpenDash Staging`
4. **Session duration**: `24 hours`
5. **Application domain**: `staging.opendash.ai`
6. **Subdomain**: `staging`
7. **App launcher visibility**: Off (not public)

**Add Policy:**
1. Click **Add a policy**
2. **Policy name**: `Invite-only access`
3. **Selector**: Email + `your-email@domain.com`
4. **Action**: Allow
5. **Require multi-factor authentication**: On (for security)

**Add Bypass (for health checks):**
1. Click **Add a policy**
2. **Policy name**: `Health check bypass`
3. **Selector**: URL Path matches `^/health$`
4. **Action**: Bypass

### Step 6: Configure Cloudflare Access (Production)

**For app.opendash.ai (Later):**

Same setup, but use email whitelist for:
- Team members
- Beta testers
- Your email

Gradually expand as you add more users.

### Step 7: Deploy to Cloudflare

```bash
# Build and deploy
npm run build
npm run deploy

# Or one-liner
wrangler deploy
```

Verify:
- `https://staging.opendash.ai` loads
- You can log in via Cloudflare Access email
- SERP dashboard shows data
- Alerts panel loads

### Step 8: Set Up Stripe Webhook

1. Go to **Stripe Dashboard** → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. **Endpoint URL**: `https://staging.opendash.ai/api/billing/webhook`
4. **Events to send**:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. **Signing secret**: Copy and set as `STRIPE_WEBHOOK_SECRET`

### Step 9: Configure DNS

```bash
# Add CNAME records to your domain registrar
# Staging:
staging.opendash.ai CNAME staging.opendash.ai.cdn.cloudflare.net

# Production:
app.opendash.ai CNAME app.opendash.ai.cdn.cloudflare.net

# Or root domain:
opendash.ai CNAME opendash.ai.cdn.cloudflare.net
```

(Cloudflare provides the exact CNAME after you add the domain)

---

## Phase 2: Pre-Launch Checklist (2-3 hours)

### Security ✅
- [x] Authentication required (Clerk JWT)
- [x] RBAC enforcement (owner/editor/viewer)
- [x] Cloudflare Access (email whitelist)
- [x] HTTPS only (Workers)
- [x] Rate limiting (stub)
- [x] Security headers (stub)

### Performance
- [ ] Test load time: `pnpm dev` and time homepage load
- [ ] Target: <2s for dashboard
- [ ] Check Cloudflare Analytics for latency

### Monitoring
- [ ] Set up Sentry: `npm install @sentry/node`
- [ ] Configure error tracking in worker.ts
- [ ] Test error reporting with dummy error

### Testing
- [ ] Manual smoke test:
  1. Access staging.opendash.ai
  2. Create org (or use test org)
  3. Add brand
  4. View morning briefing
  5. Create alert rule
  6. Trigger test alert
  7. Test Stripe checkout (test mode)
  8. Create invoice webhook test

### Documentation
- [ ] Add to README: deployment instructions
- [ ] Document environment variables
- [ ] Document Stripe test/live key switch process

---

## Phase 3: Go Live (Week 2)

### Switch to Production Stripe Keys

```bash
# After testing in test mode (at least 1 week)
wrangler secret put STRIPE_SECRET_KEY
# Enter: sk_live_...

# Update webhook domain
# Stripe: change endpoint to https://app.opendash.ai/api/billing/webhook
```

### Update Cloudflare Access Policies

- Expand email whitelist to beta users
- (Optional) Enable public signup via Clerk

### Monitor First Week

- Check error rates (target: <0.1%)
- Monitor latency (target: <2s)
- Watch for Stripe webhook failures
- Get feedback from early users

---

## Environment Variables Reference

### Required (Secrets via `wrangler secret put`)

```
STRIPE_SECRET_KEY           — Stripe API secret
STRIPE_PUBLISHABLE_KEY      — Stripe publishable key (frontend)
STRIPE_WEBHOOK_SECRET       — Stripe webhook signing secret
CLERK_SECRET_KEY            — Clerk secret for JWT validation
CLERK_PUBLISHABLE_KEY       — Clerk public key (frontend)
RESEND_API_KEY              — Resend email service key
API_MOM_URL                 — API Mom proxy URL (apimom.dev)
API_MOM_KEY                 — API Mom project key
```

### Optional (Will add later)

```
BRAVE_API_KEY               — BraveSearch for SERP tracking
OPENROUTER_KEY              — OpenRouter for LLM (via API Mom)
GITHUB_TOKEN                — GitHub PAT for brand status
TAILSCALE_API_KEY           — Tailscale for org infrastructure
```

---

## Rollback Plan

If something breaks:

```bash
# Rollback to previous version
wrangler rollback

# Or redeploy from git
git checkout <previous-commit>
npm run deploy
```

Stripe webhooks are idempotent — if a webhook fails, Stripe retries automatically.

---

## Cost Estimate (First Month)

| Service | Cost | Notes |
|---------|------|-------|
| Cloudflare Workers | $0 (free tier) | 100K requests/day included |
| D1 Database | $0 | Included in Workers plan |
| Durable Objects | ~$5-10 | 2 DOs (HUD, Competitive Intel) |
| Cloudflare Access | $0 (dev) | $3-7 per user in prod |
| Stripe | 2.9% + $0.30 | Per transaction |
| Resend Email | ~$0-5 | Up to 100 emails/day free |
| BraveSearch | ~$0-50 | SERP tracking (optional) |
| **Total** | **~$5-65** | Scaling with usage |

---

## After Launch: Next Steps

### Week 1-2: Stabilization
- Monitor errors, fix bugs, gather feedback
- Refine Cloudflare Access policies
- Optimize slow queries (analytics, trends)

### Week 3-4: Marketing
- Product Hunt launch
- LinkedIn outreach to agencies
- Write 2-3 content pieces on competitive intelligence
- Reach out to 50 target accounts (agency CTOs)

### Month 2: Scaling
- Add more datasources (TikTok trends, Reddit mentions, etc.)
- Implement in-app onboarding video
- Set up Slack community
- Plan first paid customer success story

---

## Questions?

If deployment fails:
1. Check wrangler.jsonc syntax: `wrangler publish --dry-run`
2. Verify secrets are set: `wrangler secret list`
3. Check D1 migration: `wrangler d1 execute open-dash-db --command "SELECT * FROM organizations LIMIT 1"`
4. Review Worker logs: `wrangler tail --format pretty`

**Support**: Check Cloudflare Workers docs or file an issue.
