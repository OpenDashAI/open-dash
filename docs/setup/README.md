# Service Setup Guides

Step-by-step guides for integrating external services into OpenDash.

## Files

| Document | Service | Purpose | Time |
|----------|---------|---------|------|
| [D1_SETUP.md](./D1_SETUP.md) | Cloudflare D1 | Database schema, migrations, setup | 30 min |
| [CI_CD_SETUP.md](./CI_CD_SETUP.md) | GitHub Actions | Automated deployment & testing | 45 min |
| [SENTRY_SETUP.md](./SENTRY_SETUP.md) | Sentry | Error tracking & monitoring | 30 min |
| [EMAIL_PROVIDER_SETUP.md](./EMAIL_PROVIDER_SETUP.md) | Resend | Email invitations & notifications | 20 min |
| [GRAFANA-INTEGRATION.md](./GRAFANA-INTEGRATION.md) | Grafana | Metrics dashboard | 40 min |

## Setup Order

Recommended order for production setup:

1. **Database** → [D1_SETUP.md](./D1_SETUP.md)
2. **Email** → [EMAIL_PROVIDER_SETUP.md](./EMAIL_PROVIDER_SETUP.md)
3. **Monitoring** → [SENTRY_SETUP.md](./SENTRY_SETUP.md) + [GRAFANA-INTEGRATION.md](./GRAFANA-INTEGRATION.md)
4. **Deployment** → [CI_CD_SETUP.md](./CI_CD_SETUP.md)

## Related Directories

- **[guides/](../guides/)** — Deployment guides & user docs
- **[execution/](../execution/)** — Deployment checklists
- **[audits/](../audits/)** — Security & performance audits
- **[status/](../status/)** — Deployment status tracking

---

**📍 Navigation**: [← Back to Docs Index](../README.md)
