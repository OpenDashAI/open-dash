/**
 * Hook to access global security context in components
 *
 * Usage in a route:
 * ```typescript
 * const security = useSecurityContext();
 * console.log(security.auth.userId);
 * console.log(security.requestId);
 * ```
 */

import { useRouterContext } from "@tanstack/react-router";
import { GlobalSecurityContext } from "../server/global-middleware";

export function useSecurityContext(): GlobalSecurityContext {
	const context = useRouterContext();
	const security = context as any as GlobalSecurityContext;

	if (!security?.auth) {
		throw new Error(
			"Security context not found. Ensure createSecurityContext is called in root route."
		);
	}

	return security;
}

/**
 * Hook to get current user from security context
 */
export function useAuth() {
	const security = useSecurityContext();
	return security.auth;
}

/**
 * Hook to check if current route is public
 */
export function useIsPublicRoute() {
	const security = useSecurityContext();
	return security.isPublic;
}

/**
 * Hook to get remaining rate limit for current user
 */
export function useRateLimitRemaining() {
	const security = useSecurityContext();
	return security.rateLimitRemaining;
}

/**
 * Hook to get request ID for logging/debugging
 */
export function useRequestId() {
	const security = useSecurityContext();
	return security.requestId;
}
