/**
 * Global Security Middleware for TanStack Start
 *
 * Applied to ALL routes automatically via root.tsx
 * Provides:
 * - Authentication enforcement (with public route whitelist)
 * - Rate limiting per endpoint
 * - Security headers on all responses
 * - Error handling with request IDs
 * - Input validation wrapper
 */

import { validateAuth } from "./auth-middleware";
import { checkRateLimit, rateLimitConfigs } from "./rate-limit-middleware";
import { addSecurityHeaders } from "./security-headers-middleware";
import { handleError } from "./error-handler-middleware";

/**
 * Public routes that don't require authentication
 * All other routes require a valid user session
 */
export const PUBLIC_ROUTES = [
	"/health",
	"/login",
	"/sign-up",
	"/sign-in",
	"/landing",
	"/logout",
];

/**
 * Routes that bypass rate limiting (public endpoints)
 */
export const RATE_LIMIT_EXEMPT_ROUTES = ["/health", "/login", "/landing"];

/**
 * Determine if a route is public
 */
export function isPublicRoute(pathname: string): boolean {
	return PUBLIC_ROUTES.some((route) =>
		pathname === route || pathname.startsWith(route)
	);
}

/**
 * Get appropriate rate limit config based on route
 */
export function getRateLimitConfig(pathname: string) {
	if (pathname.startsWith("/auth")) {
		return rateLimitConfigs.auth;
	}
	if (pathname.includes("search")) {
		return rateLimitConfigs.search;
	}
	if (pathname.startsWith("/export") || pathname.includes("download")) {
		return rateLimitConfigs.export;
	}
	// Default API rate limit
	return rateLimitConfigs.api;
}

/**
 * Global security context injected into all routes
 */
export type GlobalSecurityContext = {
	auth: ReturnType<typeof validateAuth>;
	isPublic: boolean;
	rateLimitRemaining: number;
	requestId: string;
};

/**
 * Apply global security middleware to a request
 * Returns context for use in route handlers
 */
export function createSecurityContext(
	request: Request
): { context: GlobalSecurityContext; shouldBlock?: Response } {
	const pathname = new URL(request.url).pathname;
	const isPublic = isPublicRoute(pathname);
	const auth = validateAuth(request);
	const requestId = crypto.randomUUID();

	// AUTHENTICATION: Check if route requires auth
	if (!isPublic && !auth?.userId) {
		const accept = request.headers.get("Accept") ?? "";
		const response =
			accept.includes("text/html") && request.method === "GET"
				? new Response(null, {
						status: 302,
						headers: { Location: "/login" },
					})
				: new Response(
						JSON.stringify({ error: "Authentication required" }),
						{ status: 401, headers: { "Content-Type": "application/json" } }
					);

		return {
			context: {
				auth,
				isPublic,
				rateLimitRemaining: 0,
				requestId,
			},
			shouldBlock: addSecurityHeaders(response),
		};
	}

	// RATE LIMITING: Check if route is rate limited
	const isRateLimitExempt = RATE_LIMIT_EXEMPT_ROUTES.some((route) =>
		pathname === route || pathname.startsWith(route)
	);

	let rateLimitRemaining = -1;
	if (!isRateLimitExempt && auth?.userId) {
		const config = getRateLimitConfig(pathname);
		const result = checkRateLimit(request, config, auth.userId);

		if (!result.allowed) {
			const resetInSeconds = Math.ceil((result.resetAt - Date.now()) / 1000);
			const response = new Response(
				JSON.stringify({
					error: "Rate limit exceeded",
					message: `Maximum ${config.maxRequests} requests per ${config.windowSeconds}s`,
					retryAfter: resetInSeconds,
				}),
				{
					status: 429,
					headers: {
						"Content-Type": "application/json",
						"Retry-After": String(resetInSeconds),
						"X-RateLimit-Limit": String(config.maxRequests),
						"X-RateLimit-Remaining": String(result.remaining),
						"X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
					},
				}
			);

			return {
				context: {
					auth,
					isPublic,
					rateLimitRemaining: result.remaining,
					requestId,
				},
				shouldBlock: addSecurityHeaders(response),
			};
		}

		rateLimitRemaining = result.remaining;
	}

	return {
		context: {
			auth,
			isPublic,
			rateLimitRemaining,
			requestId,
		},
	};
}

/**
 * Apply security headers and rate limit headers to response
 */
export function applyGlobalSecurityHeaders(
	response: Response,
	context: GlobalSecurityContext
): Response {
	let headers = new Headers(response.headers);

	// Add security headers
	const secureResponse = addSecurityHeaders(response);
	headers = new Headers(secureResponse.headers);

	// Add rate limit headers if applicable
	if (context.rateLimitRemaining >= 0) {
		const config = getRateLimitConfig(new URL(response.url || "").pathname);
		headers.set("X-RateLimit-Limit", String(config.maxRequests));
		headers.set("X-RateLimit-Remaining", String(context.rateLimitRemaining));
	}

	// Add request ID for tracing
	headers.set("X-Request-ID", context.requestId);

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
}

/**
 * Usage in root.tsx:
 *
 * ```typescript
 * import { createSecurityContext, applyGlobalSecurityHeaders, GlobalSecurityContext } from './server/global-middleware';
 *
 * export const Route = createRootRoute({
 *   beforeLoad: async ({ context, location }) => {
 *     const { context: security, shouldBlock } = createSecurityContext(
 *       new Request(location.href, {
 *         method: 'GET',
 *         headers: context.request.headers,
 *       })
 *     );
 *
 *     if (shouldBlock) {
 *       return { security, blocked: shouldBlock };
 *     }
 *
 *     return { security };
 *   },
 *   component: ({ context }) => {
 *     if (context.blocked) return context.blocked;
 *     return <Outlet context={context.security} />;
 *   }
 * });
 * ```
 */
