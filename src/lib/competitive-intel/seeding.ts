/**
 * Competitive Intelligence - Initial Data Seeding
 *
 * Seed function to populate competitor_domains table with initial competitors.
 * Call this during Week 2 setup to initialize the system.
 *
 * Usage:
 * ```
 * const competitors = [
 *   { name: "Metabase", website: "https://www.metabase.com" },
 *   { name: "Grafana", website: "https://grafana.com" },
 *   { name: "Tableau", website: "https://www.tableau.com" },
 * ]
 * await seedCompetitors(db, competitors)
 * ```
 */

import { v4 as uuid } from "uuid";

export interface CompetitorSeed {
	name: string;
	website: string;
	dataSource?: "manual" | "ahrefs" | "similarweb" | "semrush";
}

/**
 * Seed initial competitors into the database
 * Creates one row per competitor with placeholder metrics
 */
export async function seedCompetitors(
	db: any, // D1Database type
	competitors: CompetitorSeed[]
): Promise<{ seeded: number; errors: string[] }> {
	const errors: string[] = [];

	for (const competitor of competitors) {
		try {
			const id = `${competitor.name.toLowerCase().replace(/\s+/g, "-")}`;

			// Check if already exists
			const existing = await db
				.selectFrom("competitor_domains")
				.select("id")
				.where("id", "=", id)
				.executeTakeFirst();

			if (existing) {
				console.log(`Competitor ${competitor.name} already exists, skipping`);
				continue;
			}

			// Insert new competitor with placeholder metrics
			await db
				.insertInto("competitor_domains")
				.values({
					id,
					name: competitor.name,
					websiteUrl: competitor.website,
					domainAuthority: null,
					trafficEstimate: null,
					organicKeywords: null,
					backlinksCount: null,
					referringDomains: null,
					lastChecked: null,
					dataSource: competitor.dataSource || "manual",
					confidenceScore: 0.8,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				})
				.execute();

			console.log(`Seeded competitor: ${competitor.name}`);
		} catch (error) {
			const msg = error instanceof Error ? error.message : String(error);
			errors.push(`Failed to seed ${competitor.name}: ${msg}`);
		}
	}

	return {
		seeded: competitors.length - errors.length,
		errors,
	};
}

/**
 * Seed initial keywords for SERP tracking
 *
 * Keywords are generic targets that should apply across most competitors
 * (e.g., product category, problem statement, solution keywords)
 */
export interface KeywordSeed {
	keyword: string;
	searchVolume?: number;
	difficulty?: number; // 0-100
}

export async function seedKeywords(
	db: any,
	keywords: KeywordSeed[]
): Promise<{ seeded: number; errors: string[] }> {
	const errors: string[] = [];

	// For Week 2, keywords are stored in dashboard.yaml config
	// This is a placeholder for future enhancement

	return {
		seeded: keywords.length,
		errors,
	};
}

/**
 * Initialize competitive intelligence system with default competitors
 *
 * Edit this list with YOUR actual competitors before running
 */
export const DEFAULT_COMPETITORS: CompetitorSeed[] = [
	// BI/Analytics competitors
	{
		name: "Metabase",
		website: "https://www.metabase.com",
		dataSource: "manual",
	},
	{
		name: "Grafana",
		website: "https://grafana.com",
		dataSource: "manual",
	},
	{
		name: "Tableau",
		website: "https://www.tableau.com",
		dataSource: "manual",
	},
	{
		name: "Looker",
		website: "https://www.looker.com",
		dataSource: "manual",
	},
	{
		name: "Power BI",
		website: "https://powerbi.microsoft.com",
		dataSource: "manual",
	},

	// Data infrastructure competitors
	{
		name: "Apache Superset",
		website: "https://superset.apache.org",
		dataSource: "manual",
	},
	{
		name: "Databricks",
		website: "https://www.databricks.com",
		dataSource: "manual",
	},
	{
		name: "Snowflake",
		website: "https://www.snowflake.com",
		dataSource: "manual",
	},

	// Open source alternatives
	{
		name: "Apache Druid",
		website: "https://druid.apache.org",
		dataSource: "manual",
	},
	{
		name: "ClickHouse",
		website: "https://clickhouse.com",
		dataSource: "manual",
	},
];

export const DEFAULT_KEYWORDS: KeywordSeed[] = [
	// Product category
	{ keyword: "business intelligence tool", searchVolume: 3600 },
	{ keyword: "open source analytics", searchVolume: 1200 },
	{ keyword: "dashboard software", searchVolume: 2400 },

	// Problem statements
	{ keyword: "no-code analytics platform", searchVolume: 800 },
	{ keyword: "self-hosted analytics", searchVolume: 600 },
	{ keyword: "real-time monitoring dashboard", searchVolume: 2200 },

	// Solution keywords
	{ keyword: "free analytics tool", searchVolume: 1800 },
	{ keyword: "lightweight BI tool", searchVolume: 400 },
	{ keyword: "data visualization platform", searchVolume: 2600 },
];
