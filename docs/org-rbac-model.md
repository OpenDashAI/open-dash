# Organization & RBAC Model for OpenDash B2B

**Date**: 2026-03-24
**Issue**: #27.1 (Team/Org Management Architecture)
**Effort**: 8 hours
**Status**: Design document (ready for implementation)

---

## Overview

OpenDash moves from single-user founder tool to B2B team platform. Each **organization** (company/agency) manages multiple **brands** (products/clients), and **team members** have role-based permissions.

**Key principle**: Org/team layer sits on top of existing briefing infrastructure. No architectural rewrite — just add scoping.

---

## Data Model

### 1. Organizations (Tenant Container)

```typescript
organizations {
  id: TEXT PRIMARY KEY          // UUID v4
  clerkId: TEXT                 // Clerk organization ID (if using Clerk Orgs)
  name: TEXT NOT NULL           // "Acme Marketing", "Design Agency Ltd"
  slug: TEXT UNIQUE             // URL-safe name: "acme-marketing"

  // Plan tier (enforces limits on brands, users, features)
  plan: TEXT ('starter' | 'pro' | 'enterprise')

  // Subscription tracking
  stripeCustomerId: TEXT        // Stripe customer ID for billing
  stripeSubscriptionId: TEXT    // Current subscription

  // Metadata
  website: TEXT                 // Company website
  logo: TEXT                    // S3 URL to logo

  timestamps
  createdAt: INTEGER
  updatedAt: INTEGER
}

indices:
  - (clerkId) UNIQUE
  - (slug) UNIQUE
  - (plan)
```

**Why this design**:
- `clerkId` optional (can manage via Clerk Orgs or manual table)
- `plan` enables tier enforcement in middleware
- `stripeCustomerId` scopes billing queries
- `slug` for URL-friendly org URLs (`opendash.ai/{slug}/dashboard`)

---

### 2. Team Members (Users in Org)

```typescript
team_members {
  id: TEXT PRIMARY KEY          // UUID v4
  orgId: TEXT NOT NULL          // Foreign key → organizations
  userId: TEXT NOT NULL         // Foreign key → users (Clerk-linked)

  // Role determines permissions
  role: TEXT ('owner' | 'editor' | 'viewer')

  // Soft-delete for archive
  active: BOOLEAN DEFAULT 1

  // Invitation tracking (for invite flow)
  invitedBy: TEXT               // userId who sent invite
  invitedAt: INTEGER
  acceptedAt: INTEGER           // NULL = pending

  timestamps
  createdAt: INTEGER
  updatedAt: INTEGER
}

constraints:
  - UNIQUE(orgId, userId)       // One user per org
  - FOREIGN KEY(orgId) → organizations.id
  - FOREIGN KEY(userId) → users.id
  - FOREIGN KEY(invitedBy) → users.id

indices:
  - (orgId, active)             // Find active members in org
  - (userId)                     // Find user's orgs
  - (role)                       // Find editors, viewers
  - (acceptedAt)                // Find pending invites
```

**Why this design**:
- `role` stored in table, not derived from permissions lookup
- `invitedBy` tracks who sent invite (for audit)
- `acceptedAt` NULL until invite accepted (prevents access before acceptance)
- `active` allows soft-delete without breaking foreign keys

---

### 3. Brands (Products/Clients)

```typescript
brands {
  id: TEXT PRIMARY KEY          // UUID v4
  orgId: TEXT NOT NULL          // Foreign key → organizations

  // Client identifier
  name: TEXT NOT NULL           // "Nike Store", "Product X"
  slug: TEXT NOT NULL           // URL-safe: "nike-store"
  domain: TEXT UNIQUE           // Primary domain for SERP tracking

  // Brand metadata
  logo: TEXT                    // S3 URL
  favicon: TEXT
  themeColor: TEXT              // Hex color for UI theming

  // Scoping for datasources
  datasources: TEXT             // JSON array of datasource IDs configured
  competitors: TEXT             // JSON array of competitor domains to track
  keywords: TEXT                // JSON array of SERP tracking keywords

  // Status
  active: BOOLEAN DEFAULT 1
  archived: BOOLEAN DEFAULT 0
  archivedAt: INTEGER

  timestamps
  createdAt: INTEGER
  updatedAt: INTEGER
}

constraints:
  - UNIQUE(orgId, slug)         // Unique within org
  - UNIQUE(domain)              // Global unique (SERP tracking)
  - FOREIGN KEY(orgId) → organizations.id

indices:
  - (orgId, active)
  - (domain)
  - (slug)
```

**Why this design**:
- `slug` scoped to org (easier URLs than random UUIDs)
- `domain` global unique (SERP tracker needs to know which brand to update)
- JSON fields (datasources, competitors, keywords) for MVP simplicity
  - Later migrate to separate tables if needed
- `active` + `archived` allows soft-delete + restoration logic

---

### 4. Permissions (Reference Table)

Not a database table — enforced in middleware. For clarity:

```typescript
// Permission matrix by role
const PERMISSIONS = {
  owner: {
    read: ['*'],           // All data in org
    write: ['*'],          // Modify anything
    delete: ['*'],         // Delete org data
    invite: true,          // Manage team
    billing: true,         // View & edit subscription
    integrations: true,    // Add/remove datasources
  },
  editor: {
    read: ['*'],           // All org data
    write: ['brands', 'alerts', 'comments'],
    delete: [],            // Cannot delete
    invite: false,
    billing: false,        // Cannot view costs
    integrations: false,   // Cannot modify credentials
  },
  viewer: {
    read: ['*'],           // All org data
    write: [],             // Read-only
    delete: [],
    invite: false,
    billing: false,
    integrations: false,
  },
};
```

---

## Migration Strategy

### Phase 1: Add Org Tables (2026-03-24)

**New tables**:
- `organizations` (10 rows expected, 100% growth = 20)
- `team_members` (200 rows expected, 1000% growth = 2K)
- `brands` (500 rows expected, 200% growth = 1.5K)

**Modified tables**:
- `datasource_metrics`: Add `orgId` (indexed)
- `alert_rules`: Add `orgId` (indexed)
- `alert_history`: Add `orgId` (indexed)

### Phase 2: Backfill Data (TBD)

For launch:
- Create default org per existing user
- Move user → team_members with `owner` role
- Move brands → brands with `orgId` = default org

### Phase 3: Update Queries (TBD)

- Add `orgId` filter to all datasource queries
- Enforce org scoping in every fetch

---

## API Contracts

### Auth Context (Middleware)

Every request gets `AuthContext`:

```typescript
interface AuthContext {
  userId: string;           // Clerk user ID
  orgId: string;           // Current org (from URL or cookie)
  role: 'owner' | 'editor' | 'viewer';
  teamMember: TeamMember;
  permissions: PermissionSet;
}
```

Middleware sets this on `context.user`:

```typescript
// In worker.ts middleware
const authContext = await verifyClerkSession(request, env);
const orgId = new URL(request.url).hostname.split('.')[0]; // From subdomain
const teamMember = await getTeamMember(db, authContext.userId, orgId);
context.user = { ...authContext, orgId, role: teamMember.role };
```

### Create Organization

```
POST /api/orgs
Authorization: Bearer {token}

body {
  name: string              // "Acme Marketing"
  website?: string
}

response {
  id: string
  name: string
  slug: string
  plan: 'starter'
  stripeCustomerId: string
  createdAt: number
}
```

### Invite Team Member

```
POST /api/orgs/{orgId}/members
Authorization: Bearer {token}
x-required-role: owner

body {
  email: string
  role: 'editor' | 'viewer'
}

response {
  id: string
  email: string
  role: string
  invitedAt: number
  acceptedAt: null          // Pending acceptance
}
```

### Get Team Members

```
GET /api/orgs/{orgId}/members
Authorization: Bearer {token}

response {
  members: [
    {
      id: string
      email: string
      firstName: string
      lastName: string
      role: string
      active: boolean
      acceptedAt: number
    }
  ]
}
```

### Create Brand

```
POST /api/orgs/{orgId}/brands
Authorization: Bearer {token}
x-required-role: owner|editor

body {
  name: string              // "Nike Store"
  domain: string            // "nike.com"
  logo?: string             // S3 URL
  datasources?: string[]    // ["stripe", "ga4"]
  competitors?: string[]    // ["adidas.com", "puma.com"]
}

response {
  id: string
  name: string
  slug: string
  domain: string
  datasources: string[]
  competitors: string[]
}
```

### Get Brands (for Briefing)

```
GET /api/orgs/{orgId}/brands
Authorization: Bearer {token}

response {
  brands: [
    {
      id: string
      name: string
      slug: string
      domain: string
      datasources: string[]
      competitors: string[]
      active: boolean
    }
  ]
}
```

---

## Backwards Compatibility

**Challenge**: Existing single-user data has no `orgId`.

**Solution** (Phase 2 backfill):

1. On first login after migration:
   - Create default org: `{name: user.email, slug: user.email.split('@')[0]}`
   - Create team_member: `{orgId, userId, role: 'owner'}`
   - Attach existing brands to that org

2. Update all data fetches to filter by org:
   ```typescript
   // Before
   SELECT * FROM datasource_metrics WHERE datasourceId = ?

   // After
   SELECT * FROM datasource_metrics
   WHERE datasourceId = ? AND orgId = ?
   ```

3. Preserve data:
   - Don't delete old records
   - Backfill `orgId` on existing tables
   - Test migration on staging first

---

## Tier Limits

**Enforced in middleware on brand creation, user invite**:

```typescript
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

---

## Testing Strategy

**Unit tests** (queries):
- Create org, verify slug unique
- Add user to org, verify role applied
- Get org members, verify filtering
- Create brand, enforce tier limits
- Soft-delete user, verify `active=0`

**Integration tests** (API):
- Signup → auto-create org + team member
- Invite user → email sent, accept via link
- Add brand → verify datasource scoping
- Permission check: viewer cannot invite

**E2E tests**:
- New user → create org → invite user → edit brand → view briefing
- Verify all data scoped by org (no data bleed)

---

## Implementation Checklist

- [ ] Create `002_teams.sql` migration
- [ ] Add Drizzle schemas: `organizationsTable`, `teamMembersTable`, `brandsTable`
- [ ] Add queries: `createOrg`, `addTeamMember`, `getBrand`, etc.
- [ ] Create RBAC middleware in `src/server/rbac.ts`
- [ ] Create org management API in `src/server/organizations.ts`
- [ ] Build UI: `src/routes/settings/team.tsx`
- [ ] Update auth to auto-create org on signup
- [ ] Backfill existing users (staging only, not production)
- [ ] Test team member invite flow with email
- [ ] Test tier enforcement (brand limits, user limits)

---

## Open Questions

1. **Clerk Organizations**: Should we use Clerk's built-in org feature, or manage in D1?
   - **Decision**: Manual D1 table for MVP (simpler, full control)
   - **Revisit**: At 1000 customers, evaluate Clerk Orgs integration

2. **URL routing**: How do users switch orgs?
   - **Option A**: Subdomain (`acme.opendash.ai`)
   - **Option B**: Path (`opendash.ai/acme/dashboard`)
   - **Decision**: Path (option B) for MVP (easier DNS)

3. **Single user → multi-user**: Existing single-user brands migrate to default org?
   - **Yes**: Automatic backfill on first login post-migration
   - **Safety**: Test on staging database first

---

## Files to Create/Modify

**New files**:
- `src/lib/db/migrations/002_teams.sql`
- `src/lib/db/schema-teams.ts` (Drizzle org/team/brand tables)
- `src/server/rbac.ts` (permission checking)
- `src/server/organizations.ts` (org/team/brand operations)
- `src/routes/api/orgs/index.ts` (org management endpoints)
- `src/routes/api/orgs/{orgId}/members.ts` (team member endpoints)
- `src/routes/api/orgs/{orgId}/brands.ts` (brand endpoints)
- `src/routes/settings/team.tsx` (team management UI)

**Modified files**:
- `src/lib/db/schema.ts` (add new tables, update existing)
- `src/lib/db/queries.ts` (add org/team/brand queries)
- `src/worker.ts` (add org context to auth middleware)
- `src/server/auth.ts` (create default org on signup)

---

**Status**: Ready for implementation
**Next**: Issue #27.2 (RBAC Middleware & UI) depends on this
