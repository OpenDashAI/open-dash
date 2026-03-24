/**
 * Organization management API endpoints
 *
 * GET  /api/orgs/{orgId}         - Get org details
 * POST /api/orgs                 - Create new org
 * GET  /api/orgs/{orgId}/members - List team members
 * POST /api/orgs/{orgId}/members - Invite user
 */

import { createServerFn } from "@tanstack/start";
import { verifyClerkSession } from "@/server/auth";
import {
	createOrgForUser,
	inviteUserToOrg,
	sanitizeOrgResponse,
	sanitizeTeamMemberResponse,
	isValidSlug,
	TIER_LIMITS,
} from "@/server/organizations";
import {
	getOrganization,
	getTeamMembers,
	getPendingInvites,
} from "@/lib/db/queries";
import {
	requirePermission,
	canManageTeam,
	canModifyOrg,
} from "@/server/rbac";
import { getRequestAuthContext } from "@/lib/worker-context";
import type { EventContext } from "@cloudflare/workers-types";

/**
 * Get organization details
 * Requires: canRead permission for the org
 */
export const getOrgDetails = createServerFn(
	{ method: "GET" },
	async (request: Request, context: EventContext) => {
		const session = await verifyClerkSession(request, context.env);
		if (!session) throw new Response("Unauthorized", { status: 401 });

		// Load auth context from middleware (org context is in path)
		const auth = getRequestAuthContext(request);

		const db = context.env.DB;
		const org = await getOrganization(db, auth.orgId);

		if (!org || org.length === 0) {
			throw new Response("Org not found", { status: 404 });
		}

		// Verify user can view this org
		requirePermission(auth.permissions, "canRead", "view org details");

		return {
			success: true,
			org: sanitizeOrgResponse(org[0]),
			limits: TIER_LIMITS[org[0].plan as keyof typeof TIER_LIMITS],
		};
	}
);

/**
 * Create new organization
 *
 * POST /api/orgs
 * body: { name: string }
 */
export const createOrg = createServerFn(
	{ method: "POST" },
	async (
		request: Request & { json: () => Promise<{ name: string }> },
		context: EventContext
	) => {
		const session = await verifyClerkSession(request, context.env);
		if (!session) throw new Response("Unauthorized", { status: 401 });

		const body = await request.json();
		const { name } = body;

		if (!name || typeof name !== "string" || name.trim().length === 0) {
			throw new Response("Invalid org name", { status: 400 });
		}

		const db = context.env.DB;
		const result = await createOrgForUser(db, session.userId, name);

		return {
			success: true,
			orgId: result.orgId,
			slug: result.slug,
			plan: "starter",
			message: "Organization created successfully",
		};
	}
);

/**
 * List team members in organization
 * Requires: canRead permission for the org
 */
export const listTeamMembers = createServerFn(
	{ method: "GET" },
	async (request: Request, context: EventContext) => {
		const session = await verifyClerkSession(request, context.env);
		if (!session) throw new Response("Unauthorized", { status: 401 });

		const auth = getRequestAuthContext(request);

		// Verify user can view this org
		requirePermission(auth.permissions, "canRead", "list team members");

		const db = context.env.DB;
		const members = await getTeamMembers(db, auth.orgId);
		const pendingInvites = await getPendingInvites(db, auth.orgId);

		return {
			success: true,
			members: members.map(sanitizeTeamMemberResponse),
			pendingInvites: pendingInvites.map(sanitizeTeamMemberResponse),
			total: members.length + pendingInvites.length,
		};
	}
);

/**
 * Invite user to organization
 *
 * POST /api/orgs/{orgId}/members
 * body: { email: string, role: 'editor' | 'viewer' }
 */
export const inviteTeamMember = createServerFn(
	{ method: "POST" },
	async (
		request: Request & {
			json: () => Promise<{ email: string; role: string }>;
		},
		context: EventContext
	) => {
		const session = await verifyClerkSession(request, context.env);
		if (!session) throw new Response("Unauthorized", { status: 401 });

		const auth = getRequestAuthContext(request);

		const body = await request.json();
		const { email, role } = body;

		// Validate inputs
		if (!email || !email.includes("@")) {
			throw new Response("Invalid email", { status: 400 });
		}

		if (!["editor", "viewer"].includes(role)) {
			throw new Response("Invalid role", { status: 400 });
		}

		// Check permission: only owners can invite
		requirePermission(
			auth.permissions,
			"canManageTeam",
			"invite team members"
		);

		const db = context.env.DB;

		const result = await inviteUserToOrg(
			db,
			auth.orgId,
			email,
			role as "editor" | "viewer",
			auth.userId
		);

		// Email sending handled in organizations.ts
		const message = result.emailSent
			? "Invitation sent"
			: "Invitation created (email pending)";

		return {
			success: true,
			memberId: result.memberId,
			email: result.email,
			status: result.status,
			emailSent: result.emailSent,
			message,
		};
	}
);

/**
 * API handler selector
 */
export async function handler(request: Request, context: EventContext) {
	const url = new URL(request.url);
	const method = request.method;

	// GET /api/orgs/{orgId}
	if (method === "GET" && !url.searchParams.has("orgId")) {
		return getOrgDetails(request, context);
	}

	// POST /api/orgs
	if (method === "POST" && url.pathname === "/api/orgs") {
		return createOrg(request, context);
	}

	// GET /api/orgs/{orgId}/members
	if (method === "GET" && url.pathname.includes("/members")) {
		return listTeamMembers(request, context);
	}

	// POST /api/orgs/{orgId}/members
	if (method === "POST" && url.pathname.includes("/members")) {
		return inviteTeamMember(request, context);
	}

	return new Response("Not found", { status: 404 });
}
