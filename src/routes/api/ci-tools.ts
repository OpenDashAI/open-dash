/**
 * AI Tools for Competitive Intelligence
 *
 * These tools integrate competitive intelligence operations into the chat interface.
 * The AI can call these tools to:
 * - Monitor competitors and track changes
 * - Analyze market opportunities
 * - Generate strategic recommendations
 * - Manage alerts and notifications
 *
 * All API calls route through API Mom for cost control and security.
 */

import { tool } from "ai";
import { z } from "zod";
import * as ciOrch from "../../server/ci-orchestrator";

export const ciTools = {
	// --- Competitors ---

	listCompetitors: tool({
		description:
			"List all monitored competitors with their metrics and last update time",
		parameters: z.object({}),
		execute: async () => ciOrch.listCompetitors(),
	}),

	addCompetitor: tool({
		description: "Add a new competitor to monitor",
		parameters: z.object({
			name: z.string().describe("Competitor name"),
			domain: z.string().describe("Primary domain (e.g., metabase.com)"),
			website: z.string().optional().describe("Full website URL"),
			source: z
				.enum(["manual", "ahrefs", "similarweb", "semrush"])
				.default("manual")
				.describe("Data source for this competitor"),
		}),
		execute: async ({ name, domain, website, source }) =>
			ciOrch.addCompetitor({
				name,
				domain,
				website: website || `https://${domain}`,
				dataSource: source,
			}),
	}),

	getCompetitorMetrics: tool({
		description:
			"Get detailed metrics for a specific competitor (DA, traffic, keywords, backlinks)",
		parameters: z.object({
			competitorId: z
				.string()
				.describe("Competitor ID or slug (e.g., 'metabase')"),
		}),
		execute: async ({ competitorId }) =>
			ciOrch.getCompetitorMetrics(competitorId),
	}),

	// --- SERP & Rankings ---

	checkKeywordRanking: tool({
		description:
			"Check current SERP rankings for a keyword across all competitors",
		parameters: z.object({
			keyword: z.string().describe("Search keyword to check"),
			competitors: z
				.array(z.string())
				.optional()
				.describe(
					"Specific competitor IDs to check (optional, defaults to all)"
				),
		}),
		execute: async ({ keyword, competitors }) =>
			ciOrch.checkKeywordRanking(keyword, competitors),
	}),

	getCompetitorRankings: tool({
		description:
			"Get SERP ranking history for a competitor with trend analysis",
		parameters: z.object({
			competitorId: z.string().describe("Competitor ID"),
			days: z
				.number()
				.default(7)
				.describe("How many days of history to retrieve"),
		}),
		execute: async ({ competitorId, days }) =>
			ciOrch.getCompetitorRankings(competitorId, days),
	}),

	// --- Market Intelligence ---

	getMarketOpportunities: tool({
		description:
			"Identify market gaps and opportunities based on competitive analysis",
		parameters: z.object({}),
		execute: async () => ciOrch.getMarketOpportunities(),
	}),

	getCompetitiveThreats: tool({
		description: "Identify active competitive threats and concerning moves",
		parameters: z.object({}),
		execute: async () => ciOrch.getCompetitiveThreats(),
	}),

	analyzeContentGaps: tool({
		description:
			"Analyze content topics competitors cover that you don't, and vice versa",
		parameters: z.object({}),
		execute: async () => ciOrch.analyzeContentGaps(),
	}),

	analyzeCompetitiveChanges: tool({
		description:
			"AI analysis of recent competitive changes with recommendations",
		parameters: z.object({
			timeframe: z
				.enum(["daily", "weekly", "monthly"])
				.default("weekly")
				.describe("Time period for analysis"),
		}),
		execute: async ({ timeframe }) =>
			ciOrch.analyzeCompetitiveChanges(timeframe),
	}),

	// --- Alerts & Monitoring ---

	getAlertRules: tool({
		description: "List all active alert rules for competitive events",
		parameters: z.object({}),
		execute: async () => ciOrch.getAlertRules(),
	}),

	getRecentAlerts: tool({
		description: "Get recent alerts that have fired",
		parameters: z.object({
			hours: z
				.number()
				.default(24)
				.describe("How many hours back to check"),
		}),
		execute: async ({ hours }) => ciOrch.getAlerts(hours),
	}),

	// --- Jobs & Scheduling ---

	getJobStatus: tool({
		description: "Check status of all scheduled CI jobs and API quota usage",
		parameters: z.object({}),
		execute: async () => ciOrch.getJobStatus(),
	}),

	triggerJob: tool({
		description: "Manually trigger a data collection job (for testing or urgent updates)",
		parameters: z.object({
			jobType: z
				.enum(["daily", "weekly", "monthly"])
				.describe("Job type to trigger"),
		}),
		execute: async ({ jobType }) => ciOrch.triggerJob(jobType),
	}),

	// --- Dashboard & Analytics ---

	getDashboard: tool({
		description:
			"Get comprehensive CI dashboard with all key metrics and recent activity",
		parameters: z.object({}),
		execute: async () => ciOrch.getDashboard(),
	}),

	getCostBreakdown: tool({
		description:
			"Get API cost breakdown showing which providers are consuming budget",
		parameters: z.object({}),
		execute: async () => ciOrch.getCostBreakdown(),
	}),

	getQuotaStatus: tool({
		description: "Check remaining API quota and cost limits",
		parameters: z.object({}),
		execute: async () => ciOrch.getQuotaStatus(),
	}),

	// --- Content Monitoring ---

	getRecentCompetitorContent: tool({
		description: "Get recent content published by competitors",
		parameters: z.object({
			limit: z
				.number()
				.default(20)
				.describe("Maximum number of articles to retrieve"),
		}),
		execute: async ({ limit }) => ciOrch.getRecentCompetitorContent(limit),
	}),
};

/**
 * Export all CI tools as a group for easy integration into chat API
 */
export function getCIToolSet() {
	return ciTools;
}
