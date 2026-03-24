/**
 * Rate Limiting Middleware
 *
 * Tracks request rates per user/IP and enforces limits.
 * Prevents brute force attacks and API abuse.
 */

interface RateLimitConfig {
	/** Maximum requests allowed within the window */
	maxRequests: number;
	/** Time window in seconds */
	windowSeconds: number;
	/** Optional: custom key function to identify rate limit subject */
	keyFn?: (request: Request) => string;
}

interface RateLimitEntry {
	count: number;
	resetAt: number;
}

/** In-memory store for rate limit data - replace with KV Store in production */
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Default rate limit configurations for different endpoints
 */
export const rateLimitDefaults = {
	/** Strict limit for authentication endpoints */
	auth: { maxRequests: 5, windowSeconds: 60 },

	/** Standard API limit */
	api: { maxRequests: 100, windowSeconds: 60 },

	/** Generous limit for data export endpoints */
	export: { maxRequests: 20, windowSeconds: 300 },

	/** Search and query endpoints */
	search: { maxRequests: 30, windowSeconds: 60 },
};

/**
 * Generate rate limit key from request
 */
function getDefaultRateLimitKey(request: Request, identifier?: string): string {
	// Use Cloudflare's IP header if available, fall back to user ID
	const ip =
		request.headers.get("CF-Connecting-IP") ||
		request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
		"unknown";

	return identifier ? `${identifier}:${ip}` : ip;
}

/**
 * Check if request exceeds rate limit
 */
export function checkRateLimit(
	request: Request,
	config: RateLimitConfig,
	identifier?: string
): { allowed: boolean; remaining: number; resetAt: number } {
	const now = Date.now();
	const key = config.keyFn ? config.keyFn(request) : getDefaultRateLimitKey(request, identifier);

	let entry = rateLimitStore.get(key);

	// Create new entry if expired or doesn't exist
	if (!entry || now >= entry.resetAt) {
		entry = {
			count: 0,
			resetAt: now + config.windowSeconds * 1000,
		};
		rateLimitStore.set(key, entry);
	}

	// Increment counter
	entry.count++;

	const allowed = entry.count <= config.maxRequests;
	const remaining = Math.max(0, config.maxRequests - entry.count);

	return {
		allowed,
		remaining,
		resetAt: entry.resetAt,
	};
}

/**
 * Rate limit middleware response
 */
export function rateLimitResponse(
	config: RateLimitConfig,
	remaining: number,
	resetAt: number
): Response {
	const resetInSeconds = Math.ceil((resetAt - Date.now()) / 1000);

	return Response.json(
		{
			error: "Rate limit exceeded",
			message: `Maximum ${config.maxRequests} requests per ${config.windowSeconds}s window`,
			retryAfter: resetInSeconds,
		},
		{
			status: 429,
			headers: {
				"Retry-After": String(resetInSeconds),
				"X-RateLimit-Limit": String(config.maxRequests),
				"X-RateLimit-Remaining": String(remaining),
				"X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
			},
		}
	);
}

/**
 * Add rate limit headers to successful responses
 */
export function addRateLimitHeaders(
	response: Response,
	config: RateLimitConfig,
	remaining: number,
	resetAt: number
): Response {
	const headers = new Headers(response.headers);
	headers.set("X-RateLimit-Limit", String(config.maxRequests));
	headers.set("X-RateLimit-Remaining", String(remaining));
	headers.set("X-RateLimit-Reset", String(Math.ceil(resetAt / 1000)));

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
}

/**
 * Clean up expired entries periodically
 * Call this from a scheduled worker or background job
 */
export function cleanupExpiredLimits(): number {
	const now = Date.now();
	let cleaned = 0;

	for (const [key, entry] of rateLimitStore.entries()) {
		if (now >= entry.resetAt) {
			rateLimitStore.delete(key);
			cleaned++;
		}
	}

	return cleaned;
}

/** Cleanup every 5 minutes */
if (typeof setInterval !== "undefined") {
	setInterval(() => {
		const cleaned = cleanupExpiredLimits();
		if (cleaned > 0) {
			console.log(`Rate limit cleanup: removed ${cleaned} expired entries`);
		}
	}, 5 * 60 * 1000);
}
