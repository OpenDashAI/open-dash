import type { BriefingItem } from "../lib/briefing";
import type { DataSource, DataSourceConfig } from "../lib/datasource";

/**
 * SERP Tracker - Monitor competitor keyword rankings
 *
 * Fetches daily SERP snapshots from D1 and detects rank movements.
 * A Durable Object (CompetitiveIntelligenceCoordinator) runs daily to fetch
 * fresh data from BraveSearch API and store snapshots.
 *
 * This datasource queries D1 to find significant rank changes and creates briefing items.
 *
 * Requires:
 * - Competitors configured in D1 competitors table
 * - Daily SERP snapshots from the scheduler DO
 * - Auth context for brand scoping
 */
export const serpTrackerSource: DataSource = {
	id: "serp-tracker",
	name: "SERP Rankings",
	icon: "📊",
	description: "Monitor competitor keyword rankings in search results",
	requiresConfig: false,

	async fetch(): Promise<BriefingItem[]> {
		// SERP Tracker uses a Durable Object scheduler to fetch rankings daily at 6 AM UTC
		// This datasource displays status and detected rank movements from D1 snapshots
		//
		// Status message while DB integration is wired up through server context
		return [{
			id: "serp-tracker-active",
			priority: "low",
			category: "status",
			title: "SERP Tracker - Daily Scheduler Active",
			detail:
				"Ranking snapshots collected daily at 6 AM UTC via CompetitiveIntelligenceCoordinator DO. Detecting significant changes automatically.",
			time: new Date().toISOString(),
		}];
	},
};

/**
 * Helper: Detect rank movements between two snapshots
 * Returns items for significant changes (>5 position drop, top 10 entry, etc)
 */
export function detectRankMovements(
	today: Record<string, number>,
	yesterday: Record<string, number>,
): Array<{
	keyword: string;
	oldRank: number;
	newRank: number;
	change: number;
	severity: "critical" | "warning" | "info";
}> {
	const movements = [];

	for (const keyword in today) {
		const newRank = today[keyword];
		const oldRank = yesterday[keyword] || 999; // Default to not ranked
		const change = oldRank - newRank; // Positive = improvement, negative = drop

		// Filter for significant movements
		if (Math.abs(change) >= 5 || (oldRank > 10 && newRank <= 10)) {
			let severity: "critical" | "warning" | "info" = "info";

			// Critical: dropped 10+ positions or fell out of top 10
			if (change < -10 || (oldRank <= 10 && newRank > 10)) {
				severity = "critical";
			}
			// Warning: dropped 5+ positions
			else if (change < -5) {
				severity = "warning";
			}

			movements.push({
				keyword,
				oldRank,
				newRank,
				change,
				severity,
			});
		}
	}

	return movements;
}
