# OpenDash Multi-Tenant Org & RBAC Architecture

**Date**: 2026-03-24
**Context**: Issue #27.1 — Team & Org Management Architecture
**Status**: Approved and implemented

---

## Core Pattern: Org-Scoped Multi-Tenant

### Three-Layer Model

1. **Organization** (tenant container)
   - Company/agency boundary
   - Billing unit (one Stripe customer per org)
   - Plan tier determines feature limits (starter/pro/enterprise)

2. **Team Members** (users with roles)
   - User + organization scoping
   - Role-based permissions (owner, editor, viewer)
   - Invitation tracking (acceptedAt = null means pending)
   - Soft-delete (active = 0)

3. **Brands** (products/clients)
   - Per-org collection (agencies manage multiple client brands)
   - Contains configuration (datasources, competitors, keywords as JSON)
   - Globally unique domain (for SERP tracking)
   - Soft-delete (archived = 1, archivedAt = timestamp)

---

## Permission Model

### Role Definitions

```
OWNER:
  - Read all org data
  - Write all org data
  - Delete org data
  - Manage team (invite, remove, change roles)
  - View/edit billing
  - Add/modify integrations

EDITOR:
  - Read all org data
  - Write: brands, alerts, comments
  - Cannot delete
  - Cannot manage team
  - Cannot view billing
  - Cannot modify integrations

VIEWER:
  - Read all org data
  - Write: none
  - Cannot delete
  - Cannot manage team
  - Cannot view billing
  - Cannot modify integrations
```

**Enforcement Point**: Middleware checks role before allowing route access

---

## Database Scoping Pattern

### Applied to Every Table

```sql
-- Before
SELECT * FROM datasource_metrics WHERE datasourceId = ?

-- After (org-scoped)
SELECT * FROM datasource_metrics
WHERE datasourceId = ? AND orgId = ?
```

**Tables Updated**:
- datasource_metrics (orgId added)
- alert_rules (orgId added)
- alert_history (orgId added)

**Pattern for Future Work**:
- Every data-returning query must filter by orgId
- No cross-org data leakage
- All indices include orgId for performance

---

## Tier Limits

### Enforced Per Organization

```javascript
const TIER_LIMITS = {
  starter: {
    brands: 3,
    users: 3,
    competitors_per_brand: 5,
    keywords_per_competitor: 10,
    alerts: 5,
  },
  pro: {
    brands: 10,
    users: 10,
    competitors_per_brand: 20,
    keywords_per_competitor: 50,
    alerts: 50,
  },
  enterprise: {
    brands: 999,
    users: 999,
    competitors_per_brand: 999,
    keywords_per_competitor: 999,
    alerts: 999,
  },
};
```

**Enforcement**: Before creating brand or inviting user, check org.plan against limits

---

## Backwards Compatibility Strategy

### Migration Path (Not Yet Implemented)

1. **On first login** (post-migration):
   - Detect user has no default org
   - Create org: `{name: user.email, slug: user.email.split('@')[0]}`
   - Add user: `{orgId, userId, role: 'owner'}`

2. **Backfill existing data**:
   - Move existing brands to default org
   - Update all datasource_metrics to include orgId
   - Test on staging database first

3. **No data deletion**:
   - Old records preserved
   - orgId backfilled (not null-checked initially)
   - Gradual rollout possible

---

## API Contract Pattern

### Standard Endpoints

```
POST /api/orgs
  - Create new organization
  - Returns: {id, name, slug, plan, createdAt}

GET /api/orgs/{orgId}
  - Requires: member role check
  - Returns: org details

POST /api/orgs/{orgId}/members
  - Invite user
  - Requires: owner role
  - Input: {email, role}
  - Returns: team_member {id, email, invitedAt, acceptedAt}

GET /api/orgs/{orgId}/brands
  - List active brands
  - Requires: viewer+ role
  - Returns: [brand...]

POST /api/orgs/{orgId}/brands
  - Create brand
  - Requires: editor+ role + within tier limit
  - Input: {name, domain, datasources[], competitors[]}
  - Returns: brand details
```

---

## Soft-Delete Pattern

### Two Approaches

**Team Members**:
```sql
-- Don't delete, set active = 0
UPDATE team_members SET active = 0 WHERE id = ?

-- Query only active members
SELECT * FROM team_members WHERE orgId = ? AND active = 1
```

**Brands**:
```sql
-- Don't delete, set archived = 1
UPDATE brands SET archived = 1, archivedAt = NOW WHERE id = ?

-- Query only active brands
SELECT * FROM brands WHERE orgId = ? AND archived = 0
```

**Benefit**:
- Data preserved (compliance, audit trail)
- No foreign key violation issues
- Can restore if needed
- Clean "deleted" vs "inactive" semantics

---

## Key Design Decisions

### 1. Manual D1 Tables vs Clerk Organizations

**Decision**: Manual D1 tables

**Why**:
- Full control over schema
- Simpler integration with existing codebase
- Can migrate to Clerk Orgs later if needed
- Clerk Orgs adds complexity for MVP stage

**Revisit**: At 1000+ customers, evaluate Clerk Orgs integration

---

### 2. Path-Based vs Subdomain Routing

**Decision**: Path-based (`opendash.ai/{orgSlug}/dashboard`)

**Why**:
- Simpler DNS setup (no wildcard needed)
- Easier dev/staging environment
- Works with CloudFlare Pages deployment
- Subdomain routing can be added later

**Pattern**:
```typescript
// In middleware, extract orgSlug from URL path
const orgSlug = new URL(request.url).pathname.split('/')[1];
const org = await getOrganizationBySlug(db, orgSlug);
```

---

### 3. JSON Config Fields vs Separate Tables

**Decision**: JSON arrays for MVP (datasources[], competitors[], keywords[])

**Why**:
- Simpler schema initially
- Fewer join queries
- Can evolve without migration
- Acceptable performance for 100s of entries

**Migration Path**:
```
Phase 1 (MVP): datasources TEXT '["stripe", "ga4"]'
Phase 2 (Scale): Create datasource_subscriptions table, migrate
```

---

### 4. Invitation Flow with acceptedAt

**Decision**: `acceptedAt = NULL` means pending

**Why**:
- Clear pending/accepted state
- Simple SQL query (WHERE acceptedAt IS NULL)
- Prevents access before acceptance (acceptedAt checked before permission grant)
- Audit trail (timestamps preserved)

---

## Testing Requirements

### Unit Tests

- Org CRUD operations
- Team member soft-delete (active = 0)
- Brand archive (archived = 1)
- Permission matrix enforcement
- Tier limit calculations

### Integration Tests

- Invite flow: create org → invite → accept → access granted
- Permission checks: viewer cannot create brand
- Tier enforcement: starter org cannot create 4th brand
- Data isolation: org A cannot see org B data

### E2E Tests

- Signup → auto org creation → invite user → view shared dashboard
- Org switching (path-based routing)

---

## Future Considerations

### 1. Organization Hierarchy

Not needed for MVP, but possible future:
- Parent orgs (enterprise container)
- Sub-orgs (departments, divisions)
- Cross-org team members

### 2. Custom Permissions

Not needed for MVP:
- Per-brand permissions
- Resource-level permissions
- Custom role definitions

### 3. Audit Logging

Added to alert_history, but could expand:
- All org changes logged
- Member invite/removal audit trail
- Brand configuration change logs

### 4. SSO Integration

Not for MVP:
- SAML for enterprise tier
- OAuth integration
- MFA enforcement per org

---

## Implementation Checklist

- [x] Design org/team/brand tables
- [x] Create D1 migration (002_teams.sql)
- [x] Add Drizzle schemas + type exports
- [x] Implement query helpers
- [ ] Build RBAC middleware (Issue #27.2)
- [ ] Org creation API (Issue #27.2)
- [ ] Team management UI (Issue #27.2)
- [ ] Auto-create org on signup (Issue #27.2)
- [ ] Tier limit enforcement (Issue #27.2)

---

**Status**: Foundation complete. Ready for Phase 2 (middleware + UI).
