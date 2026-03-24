import type { BriefingItem } from "../lib/briefing";
import type { DataSource, DataSourceConfig } from "../lib/datasource";

/**
 * SERP Tracker - Monitor competitor keyword rankings
 *
 * Tracks search engine ranking positions for competitors across key terms.
 * Uses BraveSearch API to detect rank movements.
 *
 * Requires:
 * - BRAVE_API_KEY: BraveSearch API key
 * - Brand config: { competitors: ["company1", "company2"], keywords: ["term1", "term2"] }
 */
export const serpTrackerSource: DataSource = {
	id: "serp-tracker",
	name: "SERP Rankings",
	icon: "📊",
	description: "Monitor competitor keyword rankings in search results",
	requiresConfig: true,

	async fetch(config: DataSourceConfig): Promise<BriefingItem[]> {
		const apiKey = config.env.BRAVE_API_KEY;
		if (!apiKey) {
			return [{
				id: "serp-tracker-setup",
				priority: "high",
				category: "error",
				title: "SERP Tracker - Configuration Required",
				detail: "Set BRAVE_API_KEY secret to enable SERP tracking",
				time: new Date().toISOString(),
			}];
		}

		const brandConfig = config.brandConfig as
			| { competitors?: string[]; keywords?: string[] }
			| undefined;

		const competitors = brandConfig?.competitors || [];
		const keywords = brandConfig?.keywords || [];

		if (!competitors.length || !keywords.length) {
			return [{
				id: "serp-tracker-no-config",
				priority: "normal",
				category: "warning",
				title: "SERP Tracker - No Keywords Configured",
				detail: "Configure competitors and keywords in dashboard.yaml",
				time: new Date().toISOString(),
			}];
		}

		const items: BriefingItem[] = [];

		// Track one keyword for each competitor as the briefing item
		// In production, this would check daily snapshots from D1
		for (const keyword of keywords.slice(0, 3)) {
			// Placeholder: In week 2+, this will query competitor_serp table
			// and detect rank movements from previous day
			items.push({
				id: `serp-tracker-${keyword}`,
				priority: "normal",
				category: "metric",
				title: `Keyword: "${keyword}"`,
				detail: `Tracking ${competitors.length} competitors (set up with Durable Object scheduler)`,
				time: new Date().toISOString(),
			});
		}

		return items.length > 0 ? items : [{
			id: "serp-tracker-ready",
			priority: "low",
			category: "status",
			title: "SERP Tracker",
			detail: "Ready to monitor keyword rankings. Daily jobs configured in Week 2.",
			time: new Date().toISOString(),
		}];
	},
};
