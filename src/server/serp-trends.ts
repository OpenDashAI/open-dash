/**
 * SERP Trends Server Functions
 *
 * Queries D1 for competitive intelligence data.
 * Called from client-side components to fetch ranking trends.
 */

import { createServerFn } from "@tanstack/start";
import { getWorkerDb } from "../lib/worker-context";
import { getRequestAuthContext } from "../lib/worker-context";
import type { EventContext } from "@cloudflare/workers-types";
import {
	getLatestSerpRankings,
	getSerpTrend,
	getCompetitorsByBrand,
} from "../lib/db/queries";

/**
 * Fetch SERP trends for a brand's competitors
 * Returns 7-day and 30-day trends for all tracked keywords
 */
export const getSerpTrends = createServerFn().handler(
	async (
		request: Request,
		context?: EventContext
	): Promise<
		Array<{
			competitorId: string;
			domain: string;
			name: string;
			trends: Array<{
				keyword: string;
				currentRank: number;
				previousRank?: number;
				change?: number;
				trendDays: 7 | 30;
				isNew?: boolean;
				isTopPerformer?: boolean;
			}>;
			lastUpdated: string;
		}>
	> => {
		try {
			// Get auth context from request
			const auth = getRequestAuthContext(request);
			if (!auth?.brandId) {
				throw new Response("Brand context required", { status: 400 });
			}

			// Get DB from worker context
			const db = getWorkerDb();
			if (!db) {
				throw new Response("Database not initialized", { status: 500 });
			}

			// Get competitors for this brand
			const competitors = await getCompetitorsByBrand(db, auth.brandId);
			if (!competitors.length) {
				return [];
			}

			const results: Array<{
				competitorId: string;
				domain: string;
				name: string;
				trends: Array<{
					keyword: string;
					currentRank: number;
					previousRank?: number;
					change?: number;
					trendDays: 7 | 30;
					isNew?: boolean;
					isTopPerformer?: boolean;
				}>;
				lastUpdated: string;
			}> = [];

			// Fetch trends for each competitor
			for (const competitor of competitors) {
				const keywords = Array.isArray(competitor.keywords)
					? competitor.keywords
					: JSON.parse(competitor.keywords || "[]");

				if (keywords.length === 0) {
					results.push({
						competitorId: competitor.id,
						domain: competitor.domain,
						name: competitor.name,
						trends: [],
						lastUpdated: new Date().toISOString(),
					});
					continue;
				}

				// Fetch 7-day and 30-day trends for each keyword
				const allTrends: Array<{
					keyword: string;
					currentRank: number;
					previousRank?: number;
					change?: number;
					trendDays: 7 | 30;
					isNew?: boolean;
					isTopPerformer?: boolean;
				}> = [];

				for (const keyword of keywords) {
					try {
						// Get 7-day and 30-day trend history
						const trend7Results = await getSerpTrend(
							db,
							competitor.id,
							keyword,
							7
						);
						const trend30Results = await getSerpTrend(
							db,
							competitor.id,
							keyword,
							30
						);

						// Calculate 7-day trend
						if (trend7Results.length > 0) {
							const firstRank = trend7Results[0]?.rank || 999;
							const lastRank =
								trend7Results[trend7Results.length - 1]?.rank || 999;
							const change = lastRank - firstRank; // positive = drop, negative = improvement

							allTrends.push({
								keyword,
								currentRank: lastRank,
								previousRank: firstRank,
								change,
								trendDays: 7,
								isTopPerformer: lastRank <= 3,
								isNew: trend7Results.length === 1, // Only today's data = new
							});
						}

						// Calculate 30-day trend
						if (trend30Results.length > 0) {
							const firstRank = trend30Results[0]?.rank || 999;
							const lastRank =
								trend30Results[trend30Results.length - 1]?.rank || 999;
							const change = lastRank - firstRank;

							allTrends.push({
								keyword,
								currentRank: lastRank,
								previousRank: firstRank,
								change,
								trendDays: 30,
								isTopPerformer: lastRank <= 3,
								isNew: trend30Results.length === 1,
							});
						}
					} catch (err) {
						console.warn(
							`Failed to fetch trend for keyword "${keyword}":`,
							err
						);
						// Continue to next keyword on error
						continue;
					}
				}

				results.push({
					competitorId: competitor.id,
					domain: competitor.domain,
					name: competitor.name,
					trends: allTrends,
					lastUpdated: new Date(
						competitor.updatedAt
					).toISOString(),
				});
			}

			return results;
		} catch (err) {
			console.error("Failed to fetch SERP trends:", err);
			if (err instanceof Response) throw err;
			throw new Response(
				JSON.stringify({
					error:
						err instanceof Error ? err.message : "Unknown error",
				}),
				{ status: 500, headers: { "Content-Type": "application/json" } }
			);
		}
	}
);

/**
 * Fetch SERP trend details for a specific competitor
 */
export const getCompetitorSerpDetails = createServerFn().handler(
	async (
		request: Request,
		context?: EventContext,
		competitorId?: string
	): Promise<
		| {
				competitorId: string;
				domain: string;
				name: string;
				keywords: Array<{
					keyword: string;
					currentRank: number;
					url: string;
					title?: string;
					snippet?: string;
					trend: "up" | "down" | "stable";
					change: number;
				}>;
				lastUpdated: string;
		  }
		| undefined
	> => {
		try {
			if (!competitorId) {
				throw new Response("Competitor ID required", { status: 400 });
			}

			// Get auth context
			const auth = getRequestAuthContext(request);

			// Get DB
			const db = getWorkerDb();
			if (!db) {
				throw new Response("Database not initialized", { status: 500 });
			}

			// Would query competitor and get detailed SERP data
			// For now, return placeholder structure
			return undefined;
		} catch (err) {
			console.error("Failed to fetch competitor SERP details:", err);
			if (err instanceof Response) throw err;
			throw new Response("Error fetching competitor details", {
				status: 500,
			});
		}
	}
);
