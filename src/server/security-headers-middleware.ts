/**
 * Security Headers Middleware for TanStack Start
 *
 * Applies security headers to responses.
 * Use in route handlers or global error boundaries.
 */

/**
 * Add comprehensive security headers to response
 */
export function addSecurityHeaders(response: Response): Response {
	const headers = new Headers(response.headers);

	// Prevent MIME-type sniffing
	headers.set("X-Content-Type-Options", "nosniff");

	// Prevent clickjacking
	headers.set("X-Frame-Options", "DENY");

	// XSS protection for older browsers
	headers.set("X-XSS-Protection", "1; mode=block");

	// Control referrer information
	headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

	// HSTS: Enforce HTTPS
	headers.set(
		"Strict-Transport-Security",
		"max-age=31536000; includeSubDomains; preload"
	);

	// Content Security Policy
	headers.set(
		"Content-Security-Policy",
		[
			"default-src 'self'",
			"script-src 'self' 'wasm-unsafe-eval'",
			"style-src 'self' 'unsafe-inline'",
			"img-src 'self' data: https:",
			"font-src 'self'",
			"connect-src 'self' https://api.github.com",
			"frame-ancestors 'none'",
			"base-uri 'self'",
			"form-action 'self'",
		].join("; ")
	);

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
}

/**
 * Add CORS headers for specific origins
 */
export function addCorsHeaders(
	response: Response,
	allowedOrigins: string[] = []
): Response {
	const headers = new Headers(response.headers);
	const origin = headers.get("Origin") || "";

	if (allowedOrigins.includes(origin)) {
		headers.set("Access-Control-Allow-Origin", origin);
		headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
		headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
		headers.set("Access-Control-Max-Age", "3600");
		headers.set("Access-Control-Allow-Credentials", "true");
	} else {
		// Default deny CORS
		headers.set("Access-Control-Allow-Origin", "null");
	}

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
}

/**
 * Usage example:
 *
 * ```typescript
 * import { addSecurityHeaders } from '../../server/security-headers-middleware';
 *
 * export const Route = createAPIFileRoute("/api/data")({
 *   handlers: {
 *     GET: async () => {
 *       const response = Response.json({ data: [...] });
 *       return addSecurityHeaders(response);
 *     }
 *   }
 * });
 * ```
 */
