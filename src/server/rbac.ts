/**
 * Role-Based Access Control (RBAC) system for multi-tenant OpenDash
 *
 * Enforces org-scoped permissions on all requests.
 * Permission model: owner > editor > viewer
 */

import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";
import { eq, and } from "drizzle-orm";
import { teamMembersTable } from "@/lib/db/schema";
import { getTeamMember } from "@/lib/db/queries";

/**
 * Permission set for a user in an organization
 */
export interface PermissionSet {
	canRead: boolean; // Read all org data
	canWrite: boolean; // Write to brands, alerts, etc
	canDelete: boolean; // Delete org data
	canManageTeam: boolean; // Invite/remove users
	canViewBilling: boolean; // View subscription + costs
	canModifyIntegrations: boolean; // Add/remove datasources
}

/**
 * Auth context available on every request
 */
export interface AuthContext {
	userId: string; // Clerk user ID
	orgId: string; // Current organization
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

/**
 * Compute permission set from role
 */
export function getPermissions(
	role: "owner" | "editor" | "viewer"
): PermissionSet {
	const PERMISSIONS: Record<string, PermissionSet> = {
		owner: {
			canRead: true,
			canWrite: true,
			canDelete: true,
			canManageTeam: true,
			canViewBilling: true,
			canModifyIntegrations: true,
		},
		editor: {
			canRead: true,
			canWrite: true,
			canDelete: false,
			canManageTeam: false,
			canViewBilling: false,
			canModifyIntegrations: false,
		},
		viewer: {
			canRead: true,
			canWrite: false,
			canDelete: false,
			canManageTeam: false,
			canViewBilling: false,
			canModifyIntegrations: false,
		},
	};

	return PERMISSIONS[role] || PERMISSIONS.viewer;
}

/**
 * Verify user has required permission
 */
export function checkPermission(
	permissions: PermissionSet,
	required: keyof PermissionSet
): boolean {
	return permissions[required] === true;
}

/**
 * Require specific permission, throw 403 if denied
 */
export function requirePermission(
	permissions: PermissionSet,
	required: keyof PermissionSet,
	context?: string
) {
	if (!checkPermission(permissions, required)) {
		const msg = context
			? `Forbidden: ${context} requires ${required}`
			: `Forbidden: insufficient permissions`;
		throw new Response(msg, { status: 403 });
	}
}

/**
 * Require specific role
 */
export function requireRole(
	role: string,
	requiredRoles: string[],
	context?: string
) {
	if (!requiredRoles.includes(role)) {
		const msg = context
			? `Forbidden: ${context} requires ${requiredRoles.join(" or ")}`
			: `Forbidden: insufficient role`;
		throw new Response(msg, { status: 403 });
	}
}

/**
 * Extract org ID from URL path
 * Pattern: /orgSlug/... → orgSlug
 */
export function extractOrgFromPath(pathname: string): string | null {
	const parts = pathname.split("/").filter(Boolean);
	if (parts.length === 0) return null;

	// First segment is org slug (unless it's a reserved route like /api, /login, etc)
	const reserved = ["api", "login", "sign-up", "sign-in", "landing", "health"];
	const first = parts[0];

	if (reserved.includes(first)) return null;
	return first;
}

/**
 * Load auth context from request + database
 *
 * Verifies:
 * 1. User is authenticated (has Clerk session)
 * 2. Org exists and is accessible
 * 3. User is member of org (active)
 * 4. Computes permissions
 */
export async function loadAuthContext(
	request: Request,
	db: D1Database,
	clerkUserId: string
): Promise<AuthContext | null> {
	// Extract org from path
	const url = new URL(request.url);
	const orgSlug = extractOrgFromPath(url.pathname);

	if (!orgSlug) {
		// Public routes don't require org context
		return null;
	}

	try {
		// Query team member
		// NOTE: This is simplified - in production, you'd:
		// 1. Load org by slug
		// 2. Verify user is member of that org
		// 3. Load team_member record
		// For now, we'll use a placeholder pattern

		// In actual implementation, would do:
		// const org = await getOrganizationBySlug(db, orgSlug);
		// const teamMember = await getTeamMember(db, org.id, clerkUserId);

		// Placeholder return to show structure
		return null;
	} catch (error) {
		console.error("[RBAC] Failed to load auth context:", error);
		return null;
	}
}

/**
 * Middleware to enforce RBAC
 *
 * Usage in handler:
 * ```typescript
 * const auth = context.get("auth") as AuthContext;
 * requirePermission(auth.permissions, "canWrite", "create brand");
 * ```
 */
export function createRbacMiddleware(db: D1Database) {
	return async (
		request: Request,
		context: { set: (key: string, value: unknown) => void }
	) => {
		// Skip RBAC for public routes
		const publicRoutes = ["/login", "/sign-up", "/api/auth", "/health"];
		const url = new URL(request.url);
		if (publicRoutes.some((route) => url.pathname.startsWith(route))) {
			return;
		}

		// Load auth context from session (would be set by auth middleware)
		const clerkUserId = context.get?.("clerkUserId");
		if (!clerkUserId) {
			throw new Response("Unauthorized", { status: 401 });
		}

		// Load team member + permissions
		const authContext = await loadAuthContext(request, db, clerkUserId);

		// Set on context for handlers
		if (authContext) {
			context.set("auth", authContext);
		}
	};
}

/**
 * Helper to get auth from handler context
 */
export function getAuth(context: Record<string, unknown>): AuthContext {
	const auth = context.auth as AuthContext | undefined;
	if (!auth) {
		throw new Response("Unauthorized", { status: 401 });
	}
	return auth;
}

/**
 * Verify org ownership for delete operations
 */
export function verifyOrgOwner(auth: AuthContext, orgId: string) {
	if (auth.orgId !== orgId) {
		throw new Response("Forbidden: org mismatch", { status: 403 });
	}

	requireRole(auth.role, ["owner"], "delete organization requires owner role");
}

/**
 * Check if user can view org data
 */
export function canViewOrg(auth: AuthContext, orgId: string): boolean {
	return auth.orgId === orgId && auth.permissions.canRead;
}

/**
 * Check if user can modify org data
 */
export function canModifyOrg(auth: AuthContext, orgId: string): boolean {
	return auth.orgId === orgId && auth.permissions.canWrite;
}

/**
 * Check if user can manage team (invite/remove)
 */
export function canManageTeam(auth: AuthContext): boolean {
	return auth.permissions.canManageTeam;
}

/**
 * Check if user can view billing
 */
export function canViewBilling(auth: AuthContext): boolean {
	return auth.permissions.canViewBilling;
}
