/**
 * Authentication Middleware for TanStack Start
 *
 * Validates user authentication and injects auth context into route handlers.
 * Runs per-request, not at module level (avoids startup timeout).
 */

import { getRequestAuthContext } from "../lib/worker-context";

export type AuthContext = {
	userId: string;
	orgId?: string;
	brandId?: string;
	role?: string;
};

/**
 * Validate request authentication
 * Returns auth context or null if not authenticated
 */
export function validateAuth(request: Request): AuthContext | null {
	return getRequestAuthContext(request);
}

/**
 * Require authentication middleware
 * Use in route handlers to protect endpoints
 *
 * Example:
 * ```typescript
 * export const Route = createAPIFileRoute("/api/protected")({
 *   handlers: {
 *     GET: async ({ request }) => {
 *       const auth = requireAuth(request);
 *       // Now use auth.userId, auth.orgId, etc.
 *     }
 *   }
 * })
 * ```
 */
export function requireAuth(request: Request): AuthContext {
	const auth = validateAuth(request);
	if (!auth?.userId) {
		throw new Response(JSON.stringify({ error: "Authentication required" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}
	return auth;
}

/**
 * Require specific role
 * Throws 403 if user doesn't have the required role
 */
export function requireRole(auth: AuthContext, ...roles: string[]): void {
	if (!auth.role || !roles.includes(auth.role)) {
		throw new Response(
			JSON.stringify({ error: "Insufficient permissions" }),
			{
				status: 403,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}

/**
 * Require organization context
 * Throws 400 if orgId is not available
 */
export function requireOrgContext(auth: AuthContext): string {
	if (!auth.orgId) {
		throw new Response(
			JSON.stringify({ error: "Organization context required" }),
			{
				status: 400,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
	return auth.orgId;
}

/**
 * Public route authentication (optional)
 * Returns auth context if authenticated, null if public access
 */
export function optionalAuth(request: Request): AuthContext | null {
	return validateAuth(request);
}
