/**
 * CompetitiveIntelligenceCoordinator Durable Object
 *
 * Daily scheduler for SERP ranking snapshots.
 * - Fetches competitor keyword rankings from BraveSearch API
 * - Stores daily snapshots in D1 for trend analysis
 * - Detects rank movements and queues briefing items
 *
 * Usage:
 * - One instance per org (idFromName(`ci:{orgId}`)
 * - Alarm fires daily at 6 AM UTC
 * - Stateless — all state in D1 (competitors, serp_rankings tables)
 */

import {
	recordSerpRankings,
	getCompetitorsByOrg,
	getSerpTrend,
} from "../lib/db/queries";
import type { SerpRankingInsert } from "../lib/db/schema";

export class CompetitiveIntelligenceCoordinator {
	private state: DurableObjectState;
	private env: Env;
	private db: D1Database;
	private orgId: string;

	constructor(state: DurableObjectState, env: Env) {
		this.state = state;
		this.env = env;
		this.db = env.DB;

		// Extract orgId from DO id (idFromName format: "ci:{orgId}")
		const idString = state.id.toString();
		const match = idString.match(/^ci:(.+)$/);
		this.orgId = match ? match[1] : "";

		// Load any previous alarm schedule
		if (state.getAlarm() === null) {
			this.scheduleNextRun();
		}
	}

	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);

		// POST /schedule — manually trigger a SERP fetch run
		if (request.method === "POST" && url.pathname === "/schedule") {
			try {
				const rankings = await this.fetchAndStoreSerp();
				return Response.json({
					success: true,
					rankingsRecorded: rankings.length,
					timestamp: new Date().toISOString(),
				});
			} catch (err) {
				console.error(
					`SERP fetch failed for org ${this.orgId}:`,
					err instanceof Error ? err.message : String(err),
				);
				return Response.json(
					{
						success: false,
						error:
							err instanceof Error ? err.message : "Unknown error",
					},
					{ status: 500 },
				);
			}
		}

		// GET /status — check DO health
		if (url.pathname === "/status") {
			const nextAlarm = this.state.getAlarm();
			return Response.json({
				orgId: this.orgId,
				nextAlarm: nextAlarm ? new Date(nextAlarm).toISOString() : null,
				ready: !!this.orgId,
			});
		}

		return new Response("not found", { status: 404 });
	}

	async alarm(): Promise<void> {
		// Daily alarm — fetch SERP data
		try {
			console.log(`[CI] SERP fetch starting for org ${this.orgId}`);
			await this.fetchAndStoreSerp();
			console.log(`[CI] SERP fetch completed for org ${this.orgId}`);
		} catch (err) {
			console.error(
				`[CI] SERP fetch failed for org ${this.orgId}:`,
				err instanceof Error ? err.message : String(err),
			);
		} finally {
			// Reschedule next alarm
			this.scheduleNextRun();
		}
	}

	private async fetchAndStoreSerp(): Promise<SerpRankingInsert[]> {
		const braveApiKey = this.env.BRAVE_API_KEY;
		if (!braveApiKey) {
			throw new Error("BRAVE_API_KEY not configured");
		}

		// Get all active competitors for this org
		const competitors = await getCompetitorsByOrg(this.db, this.orgId);
		if (!competitors.length) {
			return [];
		}

		const rankings: SerpRankingInsert[] = [];
		const today = new Date();
		today.setUTCHours(0, 0, 0, 0);
		const snapshotDate = today.getTime();

		// Fetch rankings for each competitor's keywords
		for (const competitor of competitors) {
			const keywords = (competitor.keywords as string[] | string) || [];
			const keywordList = Array.isArray(keywords)
				? keywords
				: JSON.parse(keywords);

			for (const keyword of keywordList.slice(0, 10)) {
				// Limit to 10 keywords per competitor per day
				try {
					const results = await this.fetchBraveSearchResults(
						braveApiKey,
						keyword,
					);

					// Find this competitor's domain in the results
					const competitorResult = results.find((r) =>
						new URL(r.url).hostname
							.replace("www.", "")
							.includes(
								competitor.domain.replace("www.", "").split("/")[0],
							),
					);

					if (competitorResult) {
						rankings.push({
							id: crypto.randomUUID(),
							competitorId: competitor.id,
							brandId: competitor.brandId,
							orgId: competitor.orgId,
							keyword,
							rank: competitorResult.rank,
							url: competitorResult.url,
							title: competitorResult.title || "",
							snippet: competitorResult.snippet || "",
							searchEngine: "google",
							snapshotDate,
							createdAt: Date.now(),
						});
					}
				} catch (err) {
					console.warn(
						`Failed to fetch rank for ${competitor.domain} on "${keyword}":`,
						err instanceof Error ? err.message : String(err),
					);
				}
			}
		}

		// Store all rankings in D1
		if (rankings.length > 0) {
			await recordSerpRankings(this.db, rankings);
		}

		return rankings;
	}

	private async fetchBraveSearchResults(
		apiKey: string,
		keyword: string,
	): Promise<
		Array<{
			rank: number;
			url: string;
			title?: string;
			snippet?: string;
		}>
	> {
		// Use API Mom as proxy to avoid exposing keys
		const apiMomUrl = this.env.API_MOM_URL || "https://api.apimom.dev";
		const apiMomKey = this.env.API_MOM_KEY;

		if (apiMomKey) {
			// Route through API Mom
			const response = await fetch(
				`${apiMomUrl}/brave-search?q=${encodeURIComponent(keyword)}&count=10`,
				{
					headers: {
						Authorization: `Bearer ${apiMomKey}`,
					},
				},
			);

			if (!response.ok) {
				throw new Error(
					`API Mom failed: ${response.status} ${response.statusText}`,
				);
			}

			const data = (await response.json()) as {
				results?: Array<{
					index: number;
					url: string;
					title?: string;
					description?: string;
				}>;
			};

			return (
				data.results?.map((r, i) => ({
					rank: i + 1,
					url: r.url,
					title: r.title,
					snippet: r.description,
				})) || []
			);
		}

		// Direct BraveSearch API (if API Mom not available)
		const response = await fetch(
			`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(keyword)}&count=10`,
			{
				headers: {
					Accept: "application/json",
					"X-Subscription-Token": apiKey,
				},
			},
		);

		if (!response.ok) {
			throw new Error(
				`BraveSearch failed: ${response.status} ${response.statusText}`,
			);
		}

		const data = (await response.json()) as {
			web?: Array<{
				index: number;
				url: string;
				title: string;
				description: string;
			}>;
		};

		return (
			data.web?.map((r) => ({
				rank: r.index,
				url: r.url,
				title: r.title,
				snippet: r.description,
			})) || []
		);
	}

	private scheduleNextRun(): void {
		// Schedule alarm for 6 AM UTC tomorrow
		const now = new Date();
		const next = new Date(
			now.getUTCFullYear(),
			now.getUTCMonth(),
			now.getUTCDate() + 1,
			6,
			0,
			0,
			0,
		);

		// If it's already past 6 AM today, schedule for tomorrow
		if (now > next) {
			next.setUTCDate(next.getUTCDate() + 1);
		}

		const delayMs = next.getTime() - now.getTime();
		this.state.blockConcurrencyWhile(async () => {
			this.state.setAlarm(now.getTime() + delayMs);
		});

		console.log(
			`[CI] Next SERP fetch scheduled for ${next.toISOString()} (in ${Math.round(delayMs / 1000 / 60)} minutes)`,
		);
	}
}

interface Env {
	DB: D1Database;
	BRAVE_API_KEY?: string;
	API_MOM_URL?: string;
	API_MOM_KEY?: string;
}

interface D1Database {
	prepare(query: string): {
		bind(...values: unknown[]): {
			run(): Promise<{ success: boolean }>;
		};
	};
	exec(sql: string): Promise<{ results: unknown[] }>;
}
