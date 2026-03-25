/**
 * Sample Scram Jet Pipeline
 *
 * Demonstrates metrics collection via service binding to metrics-collector Worker
 * This would be configured in Scram Jet to run on a schedule or trigger
 *
 * Example: Daily revenue sync from Stripe → OpenDash metrics
 */

interface Env {
	METRICS_COLLECTOR: any; // Service binding to metrics-collector
}

/**
 * Daily Stripe Revenue Pipeline
 * Triggered by Scram Jet scheduler: daily at 1am UTC
 */
export async function stripeRevenueMetric(env: Env): Promise<Response> {
	try {
		// In a real pipeline, this would:
		// 1. Fetch data from Stripe API
		// 2. Calculate daily totals
		// 3. Record metrics

		// For demo, use sample data
		const today = new Date().toISOString().split("T")[0];
		const sampleData = {
			totalRevenue: 15500,
			transactionCount: 234,
			averageOrderValue: 66.24,
		};

		// Record metric via service binding
		const result = await env.METRICS_COLLECTOR.recordMetric({
			id: `stripe-revenue-${today}`,
			source: "stripe",
			priority: "high",
			category: "revenue",
			title: `Daily Revenue: $${sampleData.totalRevenue}`,
			detail: `${sampleData.transactionCount} transactions processed`,
			timestamp: Date.now(),
			metadata: {
				totalDollars: sampleData.totalRevenue,
				transactionCount: sampleData.transactionCount,
				averageOrderValue: sampleData.averageOrderValue,
			},
		});

		return new Response(
			JSON.stringify({
				status: "success",
				metric: result,
				timestamp: new Date().toISOString(),
			}),
			{ status: 200, headers: { "Content-Type": "application/json" } }
		);
	} catch (error) {
		console.error("[Scram Jet Pipeline Error]", error);
		return new Response(
			JSON.stringify({
				status: "error",
				error: String(error),
			}),
			{ status: 500, headers: { "Content-Type": "application/json" } }
		);
	}
}

/**
 * Marketing Traffic Metric
 * Triggered: hourly, aggregates GA4 data
 */
export async function marketingTrafficMetric(env: Env): Promise<Response> {
	try {
		const hour = new Date().getHours();
		const sampleMetrics = {
			pageviews: Math.floor(Math.random() * 5000) + 1000,
			sessions: Math.floor(Math.random() * 1000) + 200,
			bounceRate: (Math.random() * 30 + 40).toFixed(1),
		};

		const result = await env.METRICS_COLLECTOR.recordMetric({
			id: `ga4-traffic-${Date.now()}`,
			source: "ga4",
			priority: "normal",
			category: "traffic",
			title: `Hourly Traffic: ${sampleMetrics.pageviews} views`,
			detail: `${sampleMetrics.sessions} sessions, ${sampleMetrics.bounceRate}% bounce`,
			timestamp: Date.now(),
			metadata: {
				pageviews: sampleMetrics.pageviews,
				sessions: sampleMetrics.sessions,
				bounceRate: parseFloat(sampleMetrics.bounceRate),
			},
		});

		return new Response(
			JSON.stringify({
				status: "success",
				metric: result,
				hour,
			}),
			{ status: 200, headers: { "Content-Type": "application/json" } }
		);
	} catch (error) {
		console.error("[GA4 Pipeline Error]", error);
		return new Response(
			JSON.stringify({
				status: "error",
				error: String(error),
			}),
			{ status: 500, headers: { "Content-Type": "application/json" } }
		);
	}
}

/**
 * Ad Spend Metric
 * Triggered: daily, syncs Google Ads spend
 */
export async function adSpendMetric(env: Env): Promise<Response> {
	try {
		const today = new Date().toISOString().split("T")[0];
		const dailySpend = Math.floor(Math.random() * 500) + 200;

		const result = await env.METRICS_COLLECTOR.recordMetric({
			id: `google-ads-spend-${today}`,
			source: "google-ads",
			priority: "normal",
			category: "ads",
			title: `Daily Ad Spend: $${dailySpend}`,
			detail: "Google Ads campaign spending",
			timestamp: Date.now(),
			metadata: {
				dailySpend,
				currency: "USD",
				campaignCount: 12,
				impressions: Math.floor(Math.random() * 50000),
				clicks: Math.floor(Math.random() * 2000),
			},
		});

		return new Response(
			JSON.stringify({
				status: "success",
				metric: result,
			}),
			{ status: 200, headers: { "Content-Type": "application/json" } }
		);
	} catch (error) {
		console.error("[Google Ads Pipeline Error]", error);
		return new Response(
			JSON.stringify({
				status: "error",
				error: String(error),
			}),
			{ status: 500, headers: { "Content-Type": "application/json" } }
		);
	}
}

/**
 * Worker entry point for HTTP triggers
 * Allows manual testing: GET /stripe, /traffic, /ads
 */
export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);
		const pathname = url.pathname.toLowerCase();

		if (pathname === "/stripe") {
			return stripeRevenueMetric(env);
		} else if (pathname === "/traffic") {
			return marketingTrafficMetric(env);
		} else if (pathname === "/ads") {
			return adSpendMetric(env);
		}

		return new Response(
			JSON.stringify({
				status: "ok",
				available_endpoints: [
					"GET /stripe - Record Stripe revenue metric",
					"GET /traffic - Record GA4 traffic metric",
					"GET /ads - Record Google Ads spend metric",
				],
			}),
			{ status: 200, headers: { "Content-Type": "application/json" } }
		);
	},
};
