// Import TanStack Start's server entry
import startEntry from "@tanstack/react-start/server-entry";

// Export TanStack Start as the default handler
export default startEntry;

// Export Durable Object classes for Cloudflare bindings
export { HudSocket } from "./server/hud-socket";
export { CompetitiveIntelligenceCoordinator } from "./server/competitive-intelligence-coordinator";
