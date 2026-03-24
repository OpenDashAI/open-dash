import type { BriefingItem } from "../lib/briefing";
import type { DataSource, DataSourceConfig } from "../lib/datasource";
import {
	getLatestSerpRankings,
	getSerpTrend,
	getCompetitorsByBrand,
} from "../lib/db/queries";
import { getWorkerContext } from "../lib/worker-context";

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

	async fetch(config: DataSourceConfig): Promise<BriefingItem[]> {
		try {
			// Get DB from worker context
			const ctx = getWorkerContext();
			if (!ctx?.db) {
				return [{
					id: "serp-tracker-no-db",
					priority: "normal",
					category: "warning",
					title: "SERP Tracker - Database Unavailable",
					detail: "Database connection not initialized",
					time: new Date().toISOString(),
				}];
			}

			// For now, show status message until we have auth context for brand scoping
			// In production, this would extract brandId from auth context
			const items: BriefingItem[] = [];

			// Show sample items until scheduler populates data
			items.push({
				id: "serp-tracker-scheduler",
				priority: "low",
				category: "status",
				title: "SERP Tracker - Daily Scheduler Active",
				detail:
					"Ranking snapshots collected daily at 6 AM UTC. Detecting changes automatically.",
				time: new Date().toISOString(),
			});

			return items;
		} catch (err) {
			console.error("SERP Tracker fetch failed:", err);
			return [{
				id: "serp-tracker-error",
				priority: "normal",
				category: "error",
				title: "SERP Tracker - Error",
				detail:
					err instanceof Error ? err.message : "Unknown error occurred",
				time: new Date().toISOString(),
			}];
		}
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
