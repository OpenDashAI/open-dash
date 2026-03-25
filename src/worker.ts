// Import TanStack Start's server entry - let it handle the main fetch handler
import startEntry from "@tanstack/react-start/server-entry";
import { metricsHandler } from "./routes/api/metrics";
import type { EventContext } from "@cloudflare/workers-types";

// IP whitelist for /api/metrics endpoint
// Production: only allow specific IPs to prevent unauthorized access
const METRICS_IP_WHITELIST = [
	"76.240.123.80", // Local development public IP
];

function isMetricsAccessAllowed(request: Request): boolean {
	// Get client IP from Cloudflare headers
	const clientIp = request.headers.get("cf-connecting-ip") ||
	                 request.headers.get("x-forwarded-for")?.split(",")[0] ||
	                 "unknown";

	return METRICS_IP_WHITELIST.includes(clientIp.trim());
}

// Custom fetch handler that intercepts API routes before TanStack Start
export default {
	async fetch(
		request: Request,
		env: any,
		ctx: ExecutionContext
	): Promise<Response> {
		// Route metrics endpoint directly with IP gating
		const url = new URL(request.url);
		if (url.pathname === "/api/metrics") {
			// Check IP allowlist
			if (!isMetricsAccessAllowed(request)) {
				const clientIp = request.headers.get("cf-connecting-ip") || "unknown";
				console.warn(`[Metrics] Access denied for IP: ${clientIp}`);
				return new Response(
					JSON.stringify({ success: false, error: "Access denied" }),
					{ status: 403, headers: { "Content-Type": "application/json" } }
				);
			}

			// Pass both env and context to the handler
			return await metricsHandler(request, { env, ctx });
		}

		// All other routes go through TanStack Start
		// TanStack Start expects (request, context) where context has .env
		return await startEntry.fetch(request, { env, ctx });
	},
};

// Export Durable Object classes for Cloudflare bindings
// These are needed for Cloudflare to instantiate our custom DO classes
export { HudSocket } from "./server/hud-socket";
export { CompetitiveIntelligenceCoordinator } from "./server/competitive-intelligence-coordinator";
