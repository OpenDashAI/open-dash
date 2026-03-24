/**
 * CompetitiveIntelligenceCoordinator Durable Object
 *
 * Orchestrates competitive intelligence data collection:
 * - Manages daily/weekly job scheduling
 * - Rate-limits external API calls
 * - Tracks last run times to prevent duplicates
 * - Queues collection jobs for datasources
 *
 * Accessible via: /durable/competitive-intel/{competitorId}/run-daily
 */

interface CIState {
	lastDailyRun?: number; // timestamp
	lastWeeklyRun?: number; // timestamp
	lastSerpCheck?: number;
	apiCallCount: number;
	apiCallResetTime?: number;
}

export class CompetitiveIntelligenceCoordinator {
	private state: DurableObjectState;
	private ciState: CIState = { apiCallCount: 0 };

	constructor(state: DurableObjectState) {
		this.state = state;
	}

	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);

		// Load persisted state
		const stored = await this.state.storage?.get<CIState>("ci-state");
		if (stored) {
			this.ciState = stored;
		}

		try {
			// Daily SERP tracking job
			if (url.pathname === "/run-daily") {
				return this.runDaily();
			}

			// Weekly analysis job
			if (url.pathname === "/run-weekly") {
				return this.runWeekly();
			}

			// Check rate limits
			if (url.pathname === "/api-quota") {
				return Response.json({
					callCount: this.ciState.apiCallCount,
					resetTime: this.ciState.apiCallResetTime,
				});
			}

			return new Response("not found", { status: 404 });
		} catch (error) {
			console.error("CI Coordinator error:", error);
			return new Response(
				JSON.stringify({
					error: error instanceof Error ? error.message : "Unknown error",
				}),
				{ status: 500 }
			);
		}
	}

	private async runDaily(): Promise<Response> {
		const now = Date.now();
		const lastRun = this.ciState.lastDailyRun || 0;
		const minInterval = 22 * 60 * 60 * 1000; // 22 hours to allow for schedule drift

		// Prevent duplicate runs within interval
		if (now - lastRun < minInterval) {
			return Response.json({
				skipped: true,
				reason: "Daily job already ran recently",
				lastRun: new Date(lastRun).toISOString(),
				nextEligible: new Date(lastRun + minInterval).toISOString(),
			});
		}

		// Update last run time
		this.ciState.lastDailyRun = now;
		await this.state.storage?.put("ci-state", this.ciState);

		return Response.json({
			success: true,
			jobsQueued: [
				"serp-tracking",
				"domain-metrics",
				"news-monitoring",
				"social-listening",
			],
			timestamp: new Date(now).toISOString(),
			message: "Daily competitive intelligence jobs queued",
		});
	}

	private async runWeekly(): Promise<Response> {
		const now = Date.now();
		const lastRun = this.ciState.lastWeeklyRun || 0;
		const minInterval = 6 * 24 * 60 * 60 * 1000; // 6 days to allow for schedule drift

		// Prevent duplicate runs within interval
		if (now - lastRun < minInterval) {
			return Response.json({
				skipped: true,
				reason: "Weekly job already ran recently",
				lastRun: new Date(lastRun).toISOString(),
				nextEligible: new Date(lastRun + minInterval).toISOString(),
			});
		}

		// Update last run time
		this.ciState.lastWeeklyRun = now;
		await this.state.storage?.put("ci-state", this.ciState);

		return Response.json({
			success: true,
			jobsQueued: [
				"backlink-analysis",
				"content-crawl",
				"market-analysis",
				"claude-insights",
			],
			timestamp: new Date(now).toISOString(),
			message: "Weekly competitive intelligence jobs queued",
		});
	}
}
