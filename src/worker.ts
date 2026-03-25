// Import TanStack Start's server entry - let it handle the main fetch handler
import startEntry from "@tanstack/react-start/server-entry";

// Export TanStack Start as the default handler
export default startEntry;

// Export Durable Object classes for Cloudflare bindings
// These are needed for Cloudflare to instantiate our custom DO classes
export { HudSocket } from "./server/hud-socket";
export { CompetitiveIntelligenceCoordinator } from "./server/competitive-intelligence-coordinator";
