import type { BriefingItem } from "../lib/briefing";
import type { DataSource, DataSourceConfig } from "../lib/datasource";

/**
 * SERP Tracker - Monitor competitor keyword rankings
 *
 * Fetches daily SERP snapshots from D1 and detects rank movements.
 * A Durable Object (CompetitiveIntelligenceCoordinator) runs daily to fetch
 * fresh data from BraveSearch API and store snapshots.
 *
 * This datasource generates briefing items for:
 * - Critical rank drops (5+ positions, especially out of top 10)
 * - New top performer entries (rank 1-3)
 * - Significant improvements
 *
 * Note: Full D1 integration pending server context wiring.
 * For now, shows status message during scheduler operation.
 */
export const serpTrackerSource: DataSource = {
	id: "serp-tracker",
	name: "SERP Rankings",
	icon: "📊",
	description: "Monitor competitor keyword rankings in search results",
	requiresConfig: false,

	async fetch(): Promise<BriefingItem[]> {
		// SERP Tracker uses a Durable Object scheduler to fetch rankings daily at 6 AM UTC
		// This datasource generates briefing items for significant rank movements
		//
		// Briefing item generation flow:
		// 1. CompetitiveIntelligenceCoordinator DO fetches SERP data daily
		// 2. Snapshots stored in D1 serp_rankings table
		// 3. detectRankMovements() identifies significant changes
		// 4. Create briefing items for high-priority movements
		//
		// Currently shows status message pending server context integration

		const items: BriefingItem[] = [];

		// Status: Scheduler is active and collecting data
		items.push({
			id: "serp-tracker-status",
			priority: "low",
			category: "seo",
			title: "SERP Tracker Running",
			detail:
				"Competitor keyword rankings collected daily at 6 AM UTC. Configure competitors to track rankings.",
			time: new Date().toISOString(),
			action: "Configure",
			actionUrl: "/settings/competitors",
		});

		// Placeholder for when rank movements are detected
		// In production, this would query D1 and generate items like:
		// {
		//   id: "serp-rank-drop-example",
		//   priority: "high",
		//   category: "seo",
		//   title: "Competitor Rank Drop",
		//   detail: "metabase.com dropped to rank 12 for 'business intelligence' (from #8)",
		//   time: new Date().toISOString(),
		//   action: "View Trends",
		//   actionUrl: "/analytics/serp-trends",
		// }

		return items;
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
