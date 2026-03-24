import type { BriefingItem } from "../lib/briefing";
import type { DataSource, DataSourceConfig } from "../lib/datasource";

/**
 * Competitor Domains - Track competitor domain metrics
 *
 * Shows domain authority, traffic, organic keywords, and backlinks.
 * Data is refreshed weekly via scheduled jobs.
 *
 * Weekly snapshots from:
 * - Ahrefs (backlinks, DA, keywords)
 * - SimilarWeb (traffic estimates)
 * - Semrush (SEO metrics)
 */
export const competitorDomainsSource: DataSource = {
	id: "competitor-domains",
	name: "Competitor Domains",
	icon: "🌐",
	description: "Track competitor domain metrics (authority, traffic, keywords)",
	requiresConfig: false,

	async fetch(config: DataSourceConfig): Promise<BriefingItem[]> {
		// In Week 1: Return setup status
		// In Week 2+: Query competitor_domains table from D1
		// and show recently updated competitors

		return [{
			id: "competitor-domains-setup",
			priority: "normal",
			category: "status",
			title: "Competitor Domains - Setup Required",
			detail: "Define competitors in dashboard config, metrics collected starting Week 2",
			time: new Date().toISOString(),
		}];
	},
};
