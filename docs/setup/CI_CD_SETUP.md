# CI/CD Pipeline Setup Guide

**Version**: 1.0
**Last Updated**: 2026-03-24
**Status**: Ready for implementation

---

## Overview

This guide sets up automated testing, building, and deployment of OpenDash to Cloudflare Workers on every push to `main` branch.

---

## Quick Start

1. Create GitHub Actions workflow file (`.github/workflows/deploy.yml`)
2. Configure Cloudflare API credentials
3. Push to trigger first deployment
4. Monitor in GitHub Actions dashboard

---

## Step 1: Generate Cloudflare API Token

### 1.1 Create API Token

```bash
# Go to: https://dash.cloudflare.com/profile/api-tokens

# Click "Create Token"
# Use template: "Edit Cloudflare Workers"
# This grants:
#   - Workers Scripts: Edit
#   - D1 Database: Edit (for migrations)
#   - Account Settings: Read

# Copy the token
export CLOUDFLARE_API_TOKEN=<paste-here>
```

### 1.2 Verify token works

```bash
# Test token
curl https://api.cloudflare.com/client/v4/user/tokens/verify \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json"

# Should return: { "success": true, "result": {...} }
```

---

## Step 2: Get Cloudflare Account ID

```bash
# Check wrangler.toml or wrangler.jsonc
# Look for account_id field

# Or via API:
curl https://api.cloudflare.com/client/v4/accounts \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"

# Copy account_id from response
export CLOUDFLARE_ACCOUNT_ID=<your-account-id>
```

---

## Step 3: Add GitHub Secrets

### 3.1 Go to GitHub repo settings

```
GitHub → Settings → Secrets and variables → Actions
```

### 3.2 Add secrets

Click "New repository secret" for each:

| Name | Value |
|------|-------|
| `CLOUDFLARE_API_TOKEN` | (from Step 1.2) |
| `CLOUDFLARE_ACCOUNT_ID` | (from Step 2) |

---

## Step 4: Create GitHub Actions Workflow

### 4.1 Create directory structure

```bash
cd /Users/admin/Work/open-dash
mkdir -p .github/workflows
```

### 4.2 Create workflow file

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: "18"

jobs:
  test:
    name: Test
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: "pnpm"

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run linting
        run: pnpm check

      - name: Run tests
        run: pnpm test

      - name: Build production bundle
        run: pnpm build

  deploy:
    name: Deploy to Cloudflare Workers
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "pnpm"

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build production bundle
        run: pnpm build

      - name: Deploy to Cloudflare Workers
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        run: pnpm deploy

      - name: Verify deployment
        run: |
          WORKER_URL="https://open-dash.your-domain.workers.dev"
          echo "Testing deployment at $WORKER_URL/health"
          curl -f "$WORKER_URL/health" || exit 1

      - name: Notify Slack (success)
        if: success()
        uses: slackapi/slack-github-action@v1.24.0
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          payload: |
            {
              "text": "✅ OpenDash deployment successful",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*✅ OpenDash Deployment Successful*\nRef: ${{ github.ref }}\nCommit: ${{ github.sha }}\nAuthor: ${{ github.actor }}"
                  }
                }
              ]
            }

      - name: Notify Slack (failure)
        if: failure()
        uses: slackapi/slack-github-action@v1.24.0
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          payload: |
            {
              "text": "❌ OpenDash deployment failed",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*❌ OpenDash Deployment Failed*\nRef: ${{ github.ref }}\nAuthor: ${{ github.actor }}\n<${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|View logs>"
                  }
                }
              ]
            }
```

---

## Step 5: Configure Slack Notifications (Optional)

### 5.1 Create Slack incoming webhook

```bash
# Go to: https://api.slack.com/apps

# Create New App → From scratch
# Name: "OpenDash CI/CD"
# Workspace: (select your workspace)

# Go to: Incoming Webhooks
# Activate Incoming Webhooks: toggle ON

# Add New Webhook to Workspace
# Select channel: #opendash-deployments (or create it)
# Copy Webhook URL
```

### 5.2 Add to GitHub secrets

```
GitHub → Settings → Secrets → New secret
Name: SLACK_WEBHOOK
Value: (paste webhook URL)
```

---

## Step 6: Staging Deployment (Optional)

For safer deployments, add staging workflow that deploys on pull requests:

Create `.github/workflows/deploy-staging.yml`:

```yaml
name: Deploy to Staging

on:
  pull_request:
    branches: [main]

env:
  NODE_VERSION: "18"

jobs:
  test:
    name: Test
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "pnpm"
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - run: pnpm install --frozen-lockfile
      - run: pnpm check
      - run: pnpm test
      - run: pnpm build

  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: test

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "pnpm"
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - run: pnpm install --frozen-lockfile
      - run: pnpm build

      - name: Deploy to staging environment
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        run: pnpm deploy --env staging

      - name: Add deployment comment to PR
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '✅ Staging deployment complete. View at: https://open-dash-staging.your-domain.workers.dev'
            })
```

---

## Step 7: Database Migrations

For production deployments with D1 changes, add pre-deployment migration:

Create `.github/workflows/migrate-db.yml`:

```yaml
name: Database Migration Check

on:
  pull_request:
    branches: [main]
    paths:
      - "src/lib/db/**"
      - ".github/workflows/migrate-db.yml"

jobs:
  check-migrations:
    name: Check Database Migrations
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "pnpm"
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - run: pnpm install --frozen-lockfile

      - name: Check migration files
        run: |
          if [ ! -f "src/lib/db/migrations/001_init.sql" ]; then
            echo "❌ Migration file missing!"
            exit 1
          fi
          echo "✅ Migration files present"

      - name: Add migration reminder to PR
        if: success()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '⚠️ Database schema changes detected. Remember to run migrations on production:\n```bash\nwrangler d1 execute open-dash --file=./src/lib/db/migrations/001_init.sql\n```'
            })
```

---

## Step 8: Monitor Deployments

### 8.1 GitHub Actions Dashboard

```
GitHub → Actions → View workflow runs
- Green checkmark = deployment successful
- Red X = deployment failed
- Click to see logs
```

### 8.2 Cloudflare Dashboard

```
Cloudflare → Workers → open-dash
- View recent deployments
- Check error rates
- Monitor request counts
```

### 8.3 Sentry Dashboard

```
Sentry → open-dash project
- Monitor error rates
- Check for new issues
- View performance metrics
```

---

## Step 9: Rollback Procedure

If production deployment fails:

```bash
# Option 1: Revert commit and push
git revert <commit-hash>
git push origin main
# CI/CD automatically redeploys

# Option 2: Manual rollback (quick)
# Find previous working deployment in GitHub Actions
# Click "Re-run" on that workflow
# Or use: wrangler rollback --version <N>
```

---

## Deployment Checklist

Before merging to `main`:

- [ ] All tests passing (locally: `pnpm test`)
- [ ] Code reviewed (at least 1 approval)
- [ ] No failing checks in GitHub
- [ ] Breaking changes documented
- [ ] Database migrations tested (if D1 changes)
- [ ] Manual test in staging (for major changes)

---

## Troubleshooting

### Deployment fails: "pnpm: command not found"

**Solution**: GitHub Actions uses different cache. Add to workflow:

```yaml
- uses: pnpm/action-setup@v2
  with:
    version: 8
```

### Deployment fails: "CLOUDFLARE_API_TOKEN not found"

**Solution**: Check GitHub Secrets are set:

```
GitHub → Settings → Secrets → Verify CLOUDFLARE_API_TOKEN exists
```

### Tests pass but deploy fails

**Solution**: Check deploy logs:

```bash
# Pull logs locally
# GitHub → Actions → Click failed workflow → View logs

# Common causes:
# 1. wrangler.jsonc syntax error
# 2. Database migration failed
# 3. Too many changes (size limit exceeded)
```

---

## Performance Metrics

**CI/CD pipeline time**:
- Install + build: 2-3 minutes
- Tests: 1-2 minutes
- Deploy: 30 seconds
- **Total**: ~5 minutes from push to live

**Reduces deployment toil**: 0 → fully automated

---

## Next Steps

1. **Create Cloudflare API token** (Step 1)
2. **Add GitHub Secrets** (Step 3)
3. **Create workflow file** (Step 4)
4. **Test with dummy commit** to `main`
5. **Monitor first deployment** in GitHub Actions

---

## Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Cloudflare Workers Deployment](https://developers.cloudflare.com/workers/deployment-targets/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
- [Slack Webhook Docs](https://api.slack.com/messaging/webhooks)

---

**Version**: 1.0 (2026-03-24)
**Status**: ✅ Ready to implement
**Estimated Time**: 15 minutes setup + 5 minutes per deployment (automated thereafter)
