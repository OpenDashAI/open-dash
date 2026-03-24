# OpenDash RBAC Implementation Patterns

**Date**: 2026-03-24
**Context**: Issue #27.2 — RBAC Middleware & Team Management
**Status**: Patterns established and partially implemented

---

## Permission Model

### Three-Tier Role System

```typescript
type Role = "owner" | "editor" | "viewer";

interface PermissionSet {
  canRead: boolean;           // Read all org data
  canWrite: boolean;          // Write to brands, alerts, etc
  canDelete: boolean;         // Delete org data
  canManageTeam: boolean;     // Invite/remove users
  canViewBilling: boolean;    // View subscription + costs
  canModifyIntegrations: boolean; // Add/remove datasources
}
```

### Role Mapping

```
OWNER: all permissions (read, write, delete, manage team, billing, integrations)
EDITOR: read + write (no delete, no team manage, no billing)
VIEWER: read only (no write, no delete, no team manage, no billing)
```

---

## Permission Checking Pattern

### Three Levels

```typescript
// 1. Permission check (boolean)
const canWrite = checkPermission(permissions, "canWrite");

// 2. Permission requirement (throw 403 if denied)
requirePermission(permissions, "canWrite", "create brand");

// 3. Role requirement (throw 403 if wrong role)
requireRole(role, ["owner", "editor"], "create brand");
```

### Usage in Handlers

```typescript
export const createBrand = async (request, context) => {
  const auth = getAuth(context);

  // Option A: Check permission
  if (!auth.permissions.canWrite) {
    throw new Response("Forbidden", { status: 403 });
  }

  // Option B: Require permission (cleaner)
  requirePermission(auth.permissions, "canWrite", "create brand");

  // Option C: Require specific role
  requireRole(auth.role, ["owner", "editor"], "create brand");

  // Proceed with operation
};
```

---

## Auth Context Pattern

### Loaded Per Request

```typescript
interface AuthContext {
  userId: string;                // Clerk user ID
  orgId: string;                 // Current organization
  role: "owner" | "editor" | "viewer";
  permissions: PermissionSet;
  teamMember: {
    id: string;
    orgId: string;
    userId: string;
    role: string;
    active: boolean;
  };
}
```

### Loading Process

1. Verify Clerk session exists (middleware)
2. Extract org from URL path
3. Load team_member from DB
4. Compute permissions from role
5. Set on request context

### Extraction Pattern

```typescript
// Extract org from URL path
// Pattern: /orgSlug/dashboard → orgSlug
function extractOrgFromPath(pathname: string): string | null {
  const parts = pathname.split("/").filter(Boolean);
  const reserved = ["api", "login", "sign-up", "sign-in"];

  if (reserved.includes(parts[0])) return null;
  return parts[0]; // org slug
}
```

---

## Tier Limit Enforcement Pattern

### Define Limits Per Plan

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

### Check Before Create

```typescript
export function checkTierLimit(
  plan: string,
  resource: "brands" | "users",
  currentCount: number
): { allowed: boolean; limit: number; message?: string } {
  const limits = TIER_LIMITS[plan as keyof typeof TIER_LIMITS];
  const limit = limits[resource as keyof typeof limits];
  const allowed = currentCount < limit;

  return {
    allowed,
    limit,
    message: allowed ? undefined : `${plan} plan limited to ${limit} ${resource}`,
  };
}

// Usage in create handler
const brands = await getBrandsByOrg(db, orgId);
const check = checkTierLimit(org.plan, "brands", brands.length);
if (!check.allowed) throw new Error(check.message);
```

---

## Organization Creation Pattern

### Auto-Owner Assignment

```typescript
export async function createOrgForUser(
  db: D1Database,
  userId: string,
  orgName: string,
  clerkId?: string
): Promise<{ orgId: string; slug: string }> {
  const orgId = randomUUID();
  const slug = sanitizeSlug(orgName);

  // 1. Verify slug unique
  const existing = await getOrganizationBySlug(db, slug);
  if (existing.length > 0) throw new Error("Slug taken");

  // 2. Create org
  await createOrganization(db, {
    id: orgId,
    clerkId,
    name: orgName,
    slug,
    plan: "starter", // default
  });

  // 3. Auto-add creator as owner
  await addTeamMember(db, {
    id: randomUUID(),
    orgId,
    userId,
    role: "owner",
    invitedBy: userId, // self-invited
    invitedAt: Date.now(),
    acceptedAt: Date.now(), // auto-accepted
  });

  return { orgId, slug };
}
```

### Slug Sanitization

```typescript
function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // non-alphanumeric → dash
    .replace(/^-+|-+$/g, "")      // trim dashes
    .substring(0, 50);             // max length
}

// Examples
"Nike Store" → "nike-store"
"Product X!!!" → "product-x"
"  Acme Inc  " → "acme-inc"
```

---

## Team Invitation Pattern

### Pending Acceptance

```typescript
export async function inviteUserToOrg(
  db: D1Database,
  orgId: string,
  email: string,
  role: "editor" | "viewer",
  invitedByUserId: string
): Promise<{ memberId: string; email: string; status: "pending" }> {
  // Placeholder userId until user signs up
  const invitedUserId = `pending-${randomUUID()}`;

  await addTeamMember(db, {
    id: randomUUID(),
    orgId,
    userId: invitedUserId,
    role,
    invitedBy: invitedByUserId,
    invitedAt: Date.now(),
    acceptedAt: null, // KEY: null means pending
    active: true,
  });

  // Send email with accept link (separate step)
  return { memberId, email, status: "pending" };
}
```

### Query Pending Invites

```typescript
// Pending invites: acceptedAt IS NULL
const pending = await db.select().from(teamMembersTable)
  .where(eq(teamMembersTable.acceptedAt, null));

// Active members: acceptedAt IS NOT NULL AND active = true
const active = await db.select().from(teamMembersTable)
  .where(and(
    isNotNull(teamMembersTable.acceptedAt),
    eq(teamMembersTable.active, true)
  ));
```

---

## API Response Sanitization Pattern

### Exclude Sensitive Fields

```typescript
// ❌ DON'T return sensitive fields
{
  id: "...",
  stripeCustomerId: "cus_...", // sensitive
  stripeSubscriptionId: "sub_...", // sensitive
}

// ✅ DO sanitize before returning
export function sanitizeOrgResponse(org) {
  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    plan: org.plan,
    website: org.website,
    logo: org.logo,
    createdAt: org.createdAt,
    updatedAt: org.updatedAt,
    // stripeCustomerId and stripeSubscriptionId excluded
  };
}
```

### Apply to All Responses

```typescript
// Before returning
const org = await getOrganization(db, orgId);
return sanitizeOrgResponse(org[0]);

const members = await getTeamMembers(db, orgId);
return members.map(sanitizeTeamMemberResponse);

const brand = await getBrand(db, brandId);
return sanitizeBrandResponse(brand[0]);
```

---

## Signup Integration Pattern

### Auto-Create Org on Signup

```typescript
// POST /api/onboarding (called after Clerk signup)
export const POST = async (request, context) => {
  const { clerkId, email, firstName, lastName } = await request.json();

  // Create default org (slug from email)
  const defaultOrgName = email.split("@")[0];
  const { orgId, slug } = await createOrgForUser(
    context.env.DB,
    clerkId,
    defaultOrgName,
    clerkId
  );

  return {
    success: true,
    orgId,
    slug,
    role: "owner",
  };
};
```

### User Journey

1. User signs up with email
2. Clerk creates session
3. Redirect to /onboarding
4. POST /api/onboarding
5. Backend creates org + team_member
6. Redirect to /orgSlug/dashboard
7. RBAC middleware loads auth context
8. User can invite team members

---

## Common Validation Patterns

### Email Validation

```typescript
if (!email || !email.includes("@")) {
  throw new Response("Invalid email", { status: 400 });
}
```

### Domain Validation

```typescript
export function isValidDomain(domain: string): boolean {
  try {
    new URL(`https://${domain}`);
    return true;
  } catch {
    return false;
  }
}
```

### Slug Validation

```typescript
export function isValidSlug(slug: string): boolean {
  const regex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
  return regex.test(slug) && slug.length >= 3 && slug.length <= 50;
}
```

### Role Validation

```typescript
const validRoles = ["editor", "viewer"];
if (!validRoles.includes(role)) {
  throw new Response("Invalid role", { status: 400 });
}
```

---

## Middleware Integration Pattern

### Placement in Request Flow

```
Request
  ↓
1. Clerk Session Verification (auth.ts)
  ↓
2. RBAC Auth Context Loading (rbac.ts)
  ↓
3. Route Handler (org/team/brand operations)
  ↓
4. Permission Check (requirePermission)
  ↓
5. Operation Execution
```

### Pseudo-Code

```typescript
// In worker middleware
const clerkSession = await verifyClerkSession(request);
if (!clerkSession) return Response("Unauthorized", { status: 401 });

const authContext = await loadAuthContext(request, db, clerkSession.userId);
if (!authContext && !isPublicRoute) return Response("Unauthorized", { status: 401 });

context.set("auth", authContext);
```

---

## Testing Patterns

### Unit Test: Permission Check

```typescript
test("owner has all permissions", () => {
  const perms = getPermissions("owner");
  expect(perms.canRead).toBe(true);
  expect(perms.canWrite).toBe(true);
  expect(perms.canDelete).toBe(true);
  expect(perms.canManageTeam).toBe(true);
  expect(perms.canViewBilling).toBe(true);
  expect(perms.canModifyIntegrations).toBe(true);
});

test("viewer is read-only", () => {
  const perms = getPermissions("viewer");
  expect(perms.canRead).toBe(true);
  expect(perms.canWrite).toBe(false);
  expect(perms.canDelete).toBe(false);
});
```

### Integration Test: Org Creation

```typescript
test("createOrgForUser auto-adds creator as owner", async () => {
  const { orgId } = await createOrgForUser(db, userId, "Acme");

  const members = await getTeamMembers(db, orgId);
  expect(members).toHaveLength(1);
  expect(members[0].role).toBe("owner");
  expect(members[0].userId).toBe(userId);
  expect(members[0].acceptedAt).toBeGreaterThan(0);
});

test("tier limits prevent creating > 3 brands in starter", async () => {
  const org = { plan: "starter" };
  const currentCount = 3;

  const check = checkTierLimit(org.plan, "brands", currentCount);
  expect(check.allowed).toBe(false);
  expect(check.message).toContain("limited to 3");
});
```

---

## Future Considerations

### Multi-Org Users

Currently: User → Org (1:many)
Future: Org Selector to switch between multiple orgs

### Custom Permissions

Currently: Fixed 3 roles
Future: Custom role definitions per org

### Audit Logging

Currently: Team invite tracking in acceptedAt
Future: Full audit log for all org changes

### Compliance

Currently: Basic RBAC
Future: SAML/SSO, SCIM, data residency controls

---

**Status**: Foundation established, partially implemented in Issue #27.2
**Next Phase**: Wire middleware into worker, implement email invitations, add tests
