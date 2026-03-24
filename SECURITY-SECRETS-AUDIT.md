# Secrets Audit and Rotation Guide

This document outlines how to audit, manage, and rotate secrets in OpenDash.

## Current Secrets Inventory

### Environment Variables (Cloudflare Workers)

All secrets are managed via `wrangler.jsonc` and Cloudflare Secrets Manager:

| Secret | Type | Environment | Location | Rotation | Last Rotated |
|--------|------|-------------|----------|----------|--------------|
| `CLERK_SECRET_KEY` | API Key | Dev/Prod | Cloudflare Secrets | Q-Quarterly | TBD |
| `CLERK_PUBLISHABLE_KEY` | API Key | Dev/Prod | Cloudflare Settings | Annual | TBD |
| `RESEND_API_KEY` | API Key | Dev/Prod | Cloudflare Secrets | Q-Quarterly | TBD |
| `SM_SERVICE_KEY` | Service Auth | Dev/Prod | Cloudflare Secrets | Q-Quarterly | TBD |
| `ALLOWED_IPS` | Config | Dev/Prod | wrangler.jsonc | As needed | TBD |

### Database Credentials

- **D1 Database**: Automatically managed by Cloudflare (no manual secrets needed)
- **Connection String**: Provided via `env.DB` binding at runtime

### Third-Party Service Credentials

1. **Clerk Authentication**
   - Keys: `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`
   - Provider: https://clerk.com
   - Access: [Clerk Dashboard](https://dashboard.clerk.com/apps)
   - Rotation: Every 90 days

2. **Resend Email Service**
   - Key: `RESEND_API_KEY`
   - Provider: https://resend.com
   - Access: [Resend Dashboard](https://resend.com/api-keys)
   - Rotation: Every 90 days

3. **Service-to-Service Authentication**
   - Key: `SM_SERVICE_KEY`
   - Purpose: Webhook authentication for escalation events
   - Rotation: Every 90 days

## Rotation Procedures

### Rotating Clerk Keys

1. **Generate new keys**:
   - Go to [Clerk Dashboard](https://dashboard.clerk.com)
   - Navigate to API Keys
   - Create new API Key pair
   - Copy both keys

2. **Update Cloudflare Secrets**:
   ```bash
   # For development environment
   wrangler secret put CLERK_SECRET_KEY --env development
   # Paste new secret key

   wrangler secret put CLERK_PUBLISHABLE_KEY --env development
   # Paste new publishable key
   ```

3. **Update production**:
   ```bash
   wrangler secret put CLERK_SECRET_KEY --env production
   wrangler secret put CLERK_PUBLISHABLE_KEY --env production
   ```

4. **Test authentication** on development environment
5. **Revoke old keys** in Clerk Dashboard

### Rotating Resend API Key

1. **Generate new key**:
   - Go to [Resend API Keys](https://resend.com/api-keys)
   - Create new API Key

2. **Update Cloudflare**:
   ```bash
   wrangler secret put RESEND_API_KEY --env development
   # Paste new key

   wrangler secret put RESEND_API_KEY --env production
   # Paste new key
   ```

3. **Test email sending** before revoking old key
4. **Revoke old key** in Resend Dashboard

### Rotating Service Keys

Service key rotation depends on the service providing the key. For SM webhook authentication:

1. **Generate new SM service key** (as per SM documentation)
2. **Update Cloudflare**:
   ```bash
   wrangler secret put SM_SERVICE_KEY --env development
   wrangler secret put SM_SERVICE_KEY --env production
   ```
3. **Configure SM** to use the new key
4. **Revoke old key** in SM settings

## Secret Scanning

### Pre-Commit Checks

This project includes git hooks to prevent committed secrets:

```bash
# Manual check
git diff --cached | grep -E '(api[_-]?key|secret|password|token)' -i
```

### Automated Scanning Tools

Add to your workflow:

1. **git-secrets**:
   ```bash
   brew install git-secrets
   git secrets --install
   git secrets --register-aws
   ```

2. **Truffles**:
   ```bash
   brew install truffle
   truffle filesystem . --json results.json
   ```

## Audit Checklist

- [ ] Review `wrangler.jsonc` for hardcoded secrets (should be empty)
- [ ] Verify all secrets are in Cloudflare Secrets Manager
- [ ] Check `.env.example` does NOT contain real secrets (use placeholders)
- [ ] Audit git history for accidental secrets:
   ```bash
   git log --all --full-history -p -S="secret\|password\|key" | head -100
   ```
- [ ] Verify `.gitignore` excludes:
   ```
   .env
   .env.local
   .env.*.local
   .wrangler/
   *.key
   ```
- [ ] Check that CI/CD doesn't log secrets
- [ ] Verify database credentials are never logged

## Emergency Procedures

### If a Secret is Compromised

1. **Immediately revoke** the exposed secret in its provider
2. **Generate new secret** from the provider
3. **Update Cloudflare** with new secret
4. **Test on development** environment first
5. **Deploy to production**
6. **Review audit logs** for unauthorized access
7. **Document the incident** in security log

### If a Secret is Committed to Git

1. **Do NOT push** the commit
2. **Revoke the secret** immediately (do not wait)
3. **Amend the commit** to remove the secret:
   ```bash
   git filter-branch --tree-filter 'grep -r "SECRET_HERE" . && sed -i "" "s/SECRET_HERE/placeholder/g" *' HEAD
   ```
4. **Force push only to development branch** (never main)
5. **Document and review**

## Best Practices

✅ **DO:**
- Use Cloudflare Secrets Manager for all sensitive data
- Rotate secrets every 90 days
- Use environment-specific keys (dev vs prod)
- Log secret rotation dates in this file
- Use descriptive secret names (e.g., `CLERK_SECRET_KEY_PROD`)
- Implement least-privilege access for services

❌ **DON'T:**
- Commit secrets to git
- Use the same key across environments
- Share secrets in Slack, email, or chat
- Log secret values in application logs
- Hardcode secrets in source code
- Reuse keys from old services

## Monitoring

### Set Up Alerts

In Cloudflare Workers, add logging for secret access failures:

```typescript
if (!env.RESEND_API_KEY) {
  console.error("CRITICAL: RESEND_API_KEY is missing. Email service unavailable.");
  // Alert ops team
}
```

### Audit Trail

Track rotation dates:

- Clerk Keys: Last rotated __________
- Resend Key: Last rotated __________
- SM Service Key: Last rotated __________

## References

- [Cloudflare Secrets Manager Docs](https://developers.cloudflare.com/workers/configuration/secrets/)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [CWE-798: Use of Hard-Coded Credentials](https://cwe.mitre.org/data/definitions/798.html)
