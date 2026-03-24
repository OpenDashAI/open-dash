/**
 * SERP Tracking Service
 *
 * Handles daily SERP rank collection and change detection
 * Integrates with BraveSearch API to track competitor keyword rankings
 */

import { BraveSearchClient } from "../clients/brave-search";

export interface SerpSnapshot {
	competitorId: string;
	keyword: string;
	rankPosition: number;
	searchVolume?: number;
	keywordDifficulty?: number;
	rankDate: string; // YYYY-MM-DD
	rankChange?: number; // compared to previous day
	trend?: "U" | "D" | "S"; // Up, Down, Same
}

/**
 * Track SERP rankings for all competitors on all keywords
 * Compare to previous day to detect rank changes
 *
 * Returns array of changes (only ranks that changed)
 */
export async function trackSerpRankings(
	db: any, // D1Database
	braveApiKey: string,
	competitors: Array<{ id: string; name: string; domain: string }>,
	keywords: string[]
): Promise<{
	tracked: number;
	changed: number;
	errors: string[];
}> {
	const client = new BraveSearchClient(braveApiKey);
	const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
	const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
		.toISOString()
		.split("T")[0];

	const errors: string[] = [];
	let tracked = 0;
	let changed = 0;

	for (const keyword of keywords) {
		try {
			// Get ranks for all competitors on this keyword
			const ranks = await client.checkKeywordCompetitors(
				keyword,
				competitors.map((c) => c.domain)
			);

			for (let i = 0; i < competitors.length; i++) {
				const competitor = competitors[i];
				const rank = ranks[i];

				// Get previous rank
				const previousRank = await getPreviousRank(
					db,
					competitor.id,
					keyword,
					yesterday
				);

				const rankChange = previousRank
					? rank.rank - previousRank
					: undefined;
				const trend =
					rankChange === undefined
						? undefined
						: rankChange > 0
							? ("D" as const)
							: rankChange < 0
								? ("U" as const)
								: ("S" as const);

				// Insert SERP snapshot
				try {
					await db
						.prepare(
							`
            INSERT INTO competitor_serp
            (id, competitor_id, keyword, rank_position, rank_date, rank_change, trend, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `
						)
						.bind(
							generateUUID(),
							competitor.id,
							keyword,
							rank.rank,
							today,
							rankChange || null,
							trend || null,
							Date.now()
						)
						.first();

					tracked++;

					if (rankChange && rankChange !== 0) {
						changed++;
					}
				} catch (insertError) {
					errors.push(
						`Failed to insert SERP for ${competitor.name}/${keyword}: ${insertError}`
					);
				}
			}
		} catch (error) {
			errors.push(
				`Failed to check keyword "${keyword}": ${error instanceof Error ? error.message : String(error)}`
			);
		}
	}

	return { tracked, changed, errors };
}

/**
 * Get previous day's rank for a competitor/keyword pair
 */
async function getPreviousRank(
	db: any,
	competitorId: string,
	keyword: string,
	date: string
): Promise<number | null> {
	try {
		const result = await db
			.prepare(
				`
      SELECT rank_position
      FROM competitor_serp
      WHERE competitor_id = ?
        AND keyword = ?
        AND rank_date = ?
      ORDER BY created_at DESC
      LIMIT 1
    `
			)
			.bind(competitorId, keyword, date)
			.first();

		return result?.rank_position || null;
	} catch {
		return null;
	}
}

/**
 * Generate UUID v4
 * Simple implementation for generating unique IDs
 */
function generateUUID(): string {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

/**
 * Get rank change summary for a competitor across all keywords
 */
export async function getCompetitorRankSummary(
	db: any,
	competitorId: string,
	days: number = 7
): Promise<{
	competitorId: string;
	avgRank: number;
	improvingKeywords: string[];
	decliningKeywords: string[];
	stableKeywords: string[];
}> {
	const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
		.toISOString()
		.split("T")[0];

	try {
		const results = await db
			.prepare(
				`
      SELECT
        keyword,
        AVG(rank_position) as avg_rank,
        COUNT(DISTINCT rank_date) as days_tracked,
        SUM(CASE WHEN trend = 'U' THEN 1 ELSE 0 END) as improvements,
        SUM(CASE WHEN trend = 'D' THEN 1 ELSE 0 END) as declines
      FROM competitor_serp
      WHERE competitor_id = ?
        AND rank_date >= ?
      GROUP BY keyword
      ORDER BY avg_rank ASC
    `
			)
			.bind(competitorId, cutoffDate)
			.all();

		const keywordData = results.results || [];

		return {
			competitorId,
			avgRank: keywordData.length
				? keywordData.reduce((sum, k) => sum + (k.avg_rank || 0), 0) /
					keywordData.length
				: 0,
			improvingKeywords: keywordData
				.filter((k) => (k.improvements || 0) > (k.declines || 0))
				.map((k) => k.keyword),
			decliningKeywords: keywordData
				.filter((k) => (k.declines || 0) > (k.improvements || 0))
				.map((k) => k.keyword),
			stableKeywords: keywordData
				.filter((k) => (k.improvements || 0) === (k.declines || 0))
				.map((k) => k.keyword),
		};
	} catch (error) {
		console.error("Error getting rank summary:", error);
		return {
			competitorId,
			avgRank: 0,
			improvingKeywords: [],
			decliningKeywords: [],
			stableKeywords: [],
		};
	}
}
