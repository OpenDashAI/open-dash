/**
 * Security headers for all HTTP responses
 * Prevents XSS, clickjacking, MIME-sniffing, etc.
 */

export function addSecurityHeaders(response: Response): Response {
	const headers = new Headers(response.headers);

	// Prevent MIME-type sniffing
	headers.set("X-Content-Type-Options", "nosniff");

	// Prevent clickjacking attacks
	headers.set("X-Frame-Options", "DENY");

	// Enable XSS protection in older browsers
	headers.set("X-XSS-Protection", "1; mode=block");

	// Control referrer information
	headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

	// HSTS: Enforce HTTPS for 1 year
	headers.set(
		"Strict-Transport-Security",
		"max-age=31536000; includeSubDomains; preload"
	);

	// Content Security Policy: Restrict resource loading
	headers.set(
		"Content-Security-Policy",
		"default-src 'self'; " +
			"script-src 'self' 'wasm-unsafe-eval'; " + // Allow WASM for TanStack
			"style-src 'self' 'unsafe-inline'; " + // Tailwind uses inline styles
			"img-src 'self' data: https:; " +
			"font-src 'self'; " +
			"connect-src 'self' https://api.github.com; " + // Allow GitHub API
			"frame-ancestors 'none'; " +
			"base-uri 'self'; " +
			"form-action 'self'"
	);

	// Disable CORS by default (can be overridden per route)
	if (!headers.has("Access-Control-Allow-Origin")) {
		headers.set("Access-Control-Allow-Origin", "null");
	}

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: headers,
	});
}

/**
 * CORS configuration for specific origins
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
	}

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: headers,
	});
}
