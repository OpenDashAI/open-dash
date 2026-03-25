// Import TanStack Start's server entry - let it handle the main fetch handler
import startEntry from "@tanstack/react-start/server-entry";
import { metricsHandler } from "./routes/api/metrics";
import type { EventContext } from "@cloudflare/workers-types";

// Custom fetch handler that intercepts API routes before TanStack Start
export default {
	async fetch(
		request: Request,
		env: any,
		ctx: ExecutionContext
	): Promise<Response> {
		// Route metrics endpoint directly
		const url = new URL(request.url);
		if (url.pathname === "/api/metrics") {
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
