# Email Provider Setup Guide — Resend

**Version**: 1.0
**Last Updated**: 2026-03-24
**Status**: Ready for implementation

---

## Quick Start

1. Create Resend account at resend.com
2. Add opendash.ai domain
3. Verify SPF + DKIM records
4. Get API key
5. Set wrangler secret: `RESEND_API_KEY=re_xxxxx`

**Estimated time**: 15-20 minutes

---

## Step 1: Create Resend Account

### 1.1 Sign up

Go to [resend.com](https://resend.com) and click **"Get Started"**

- Sign up with email
- Verify email address
- Complete account setup

### 1.2 Create API Key

Once logged in:
1. Go to **Settings → API Keys**
2. Click **"Create API Key"**
3. Name it: `opendash-production`
4. Copy the key (format: `re_xxxxx...`)
5. Save it securely (we'll add to Cloudflare next)

---

## Step 2: Add Domain

### 2.1 Configure sending domain

In Resend dashboard:
1. Go to **Domains**
2. Click **"Add Domain"**
3. Enter: `opendash.ai`
4. Click **"Next"**

### 2.2 Verify DNS records

Resend will show you 2 DNS records to add:

```
Type: CNAME
Name: _resend.opendash.ai
Value: feedback.resend.dev
TTL: 3600
```

```
Type: TXT
Name: opendash.ai
Value: v=spf1 include:resend.dev ~all
TTL: 3600
```

### 2.3 Add to DNS (Cloudflare or your registrar)

If using **Cloudflare**:
1. Go to your domain dashboard
2. Click **DNS**
3. Add the CNAME record
4. Add the SPF record (or add to existing SPF)

If using **another registrar**:
1. Log into your domain registrar
2. Go to DNS settings
3. Add both records as shown above

### 2.4 Verify DNS propagation

In Resend dashboard, click **"Verify Domain"**

- This may take 5-30 minutes for DNS to propagate
- Once verified, you'll see a ✅ checkmark

---

## Step 3: Set Wrangler Secret

Once API key is obtained and DNS is verified:

```bash
wrangler secret put RESEND_API_KEY --env production
# Paste the API key when prompted (e.g., re_xxxxx...)
```

Verify it's set:

```bash
wrangler secret list --env production
# Should show: RESEND_API_KEY
```

---

## Step 4: Test Email Sending

### 4.1 Create test script

```bash
# Create a test script to send an email
cat > test-resend.js << 'EOF'
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  const response = await resend.emails.send({
    from: "OpenDash <onboarding@opendash.ai>",
    to: "your-email@example.com",
    subject: "Test email from OpenDash",
    html: "<h1>It works!</h1><p>Resend is properly configured.</p>",
  });

  console.log("Response:", response);
}

testEmail().catch(console.error);
EOF
```

### 4.2 Run test locally

```bash
# Set API key locally
export RESEND_API_KEY=re_xxxxx...

# Run the test
node test-resend.js
```

Expected output:
```
Response: {
  data: { id: "..." },
  error: null
}
```

Check your email — you should receive the test email in 1-2 minutes.

---

## Step 5: Integrate into OpenDash

### 5.1 Update environment variables

The code already has Resend integration. Just ensure:
- `RESEND_API_KEY` is set in wrangler secrets
- Email templates are in `src/server/email.ts`

### 5.2 Email sending is automatically triggered on:

1. **Welcome email** — Sent immediately after user signup via `/api/onboarding`
2. **Setup reminder** — Sent 24h after signup if user hasn't logged in
3. **Feature discovery** — Sent 7d after signup if user is active

All emails use templates from `src/server/email.ts`

---

## Monitoring

### Check email delivery in Resend dashboard:

1. Go to **Emails** tab
2. See all sent emails with delivery status
3. Track opens, clicks, bounces

### Monitor failure rate:

- If >5% bounce rate → check email lists
- If >10% complaint rate → review content
- If delivery is slow → check domain verification

---

## Cost Breakdown

| Volume | Cost |
|--------|------|
| <5k/month | $20/mo (base) + emails |
| 5k-10k/month | $20 + $0.50 |
| 10k+/month | Upgrade to next tier |

For OpenDash MVP with 50 users:
- Welcome email: 50 × $0.0001 = $0.005
- Setup reminder (24h): 30 × $0.0001 = $0.003
- Feature discovery (7d): 20 × $0.0001 = $0.002
- **Total**: <$1/month for MVP

---

## Troubleshooting

### Email not received

**Check domain verification:**
```bash
# In Resend dashboard: Settings → Domains
# Status should show ✅ Verified
```

**Check API key:**
```bash
# Test the key directly
curl https://api.resend.com/emails \
  -H "Authorization: Bearer re_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "onboarding@opendash.ai",
    "to": "test@example.com",
    "subject": "Test",
    "html": "<p>Test</p>"
  }'
```

**Check logs:**
```bash
# In Resend dashboard: Emails tab
# Click on sent email to see delivery details
```

### Emails going to spam

**Update SPF/DKIM:**
- Ensure SPF record is correct
- Add DKIM record if available
- Wait 24h for DNS propagation

**Check sender reputation:**
- Use senderscore.org to check domain reputation
- May need to warm up new domain (send gradually increasing volume)

### High bounce rate

**Validate email addresses:**
```bash
# Check if emails are being validated
# In code: Resend auto-validates, but check database for typos
```

---

## Alternatives (if Resend doesn't work)

### SendGrid (Enterprise-grade)

Cost: $25/mo (10k emails)
Setup: 20 minutes
Reliability: Enterprise-grade

```bash
pnpm add @sendgrid/mail
```

### Amazon SES (Lowest cost)

Cost: $0.10/1k emails
Setup: 30 minutes (sandbox approval needed)
Reliability: Production-ready

```bash
pnpm add @aws-sdk/client-ses
```

---

## Migration Path

**Current**: Resend (fast setup)
**If volume >10k/mo**: Migrate to SendGrid
**If already AWS**: Migrate to SES

Migration is simple — same email templates work with any provider.

---

## Checklist

- [ ] Resend account created
- [ ] API key generated
- [ ] Domain added to Resend
- [ ] SPF record added to DNS
- [ ] CNAME record verified
- [ ] Domain verified in Resend (✅ status)
- [ ] RESEND_API_KEY set in wrangler secrets
- [ ] Test email sent successfully
- [ ] Deployed to production
- [ ] Welcome email sent to test user
- [ ] Monitored in Resend dashboard

---

**Next Steps**: Once setup complete, Task #3 (Email Sequences) and Task #2 are done.
Deploy to production and test full signup → email flow on opendash.ai

---

**Status**: ✅ Ready to implement
**Estimated Time**: 15 minutes setup + 2 minutes secrets configuration
