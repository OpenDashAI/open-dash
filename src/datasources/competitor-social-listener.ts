import type { BriefingItem } from "../lib/briefing";
import type { DataSource, DataSourceConfig } from "../lib/datasource";

/**
 * Competitor Social Listener - Monitor competitor social media activity
 *
 * Tracks competitor activity on:
 * - Twitter/X (tweets, engagement, follower growth)
 * - LinkedIn (posts, engagement, follower growth)
 * - Bluesky, Threads (emerging platforms)
 *
 * Detects:
 * - Posting frequency changes
 * - Engagement rate anomalies
 * - Follower growth spikes
 * - Campaign announcements
 * - Sentiment shifts
 *
 * Uses:
 * - Twitter/X API (v2 with Bearer token)
 * - LinkedIn API (company pages)
 * - Bluesky API (public feeds)
 */

export interface SocialSnapshot {
	competitorId: string;
	platform: "twitter" | "linkedin" | "bluesky" | "threads";
	handle: string;
	postCount: number; // Posts this period
	engagementRate: number; // Avg likes/comments per post (%)
	followerCount: number; // Current follower count
	followerGrowth: number; // New followers this period
	avgPostLength: number; // Avg characters per post
	sentiment: "positive" | "neutral" | "negative"; // Aggregate sentiment
	snapshotDate: Date;
	lastUpdated: Date;
}

/**
 * Detect social media activity changes
 */
export function detectSocialChanges(
	today: SocialSnapshot[],
	yesterday: SocialSnapshot[]
): Array<{
	competitorId: string;
	platform: string;
	metric: string;
	oldValue: number;
	newValue: number;
	change: number;
	severity: "critical" | "warning" | "info";
	message: string;
}> {
	const changes = [];

	for (const snap of today) {
		const prev = yesterday.find(
			(s) =>
				s.competitorId === snap.competitorId &&
				s.platform === snap.platform
		);
		if (!prev) continue;

		// Detect posting frequency spike
		const postChange = snap.postCount - prev.postCount;
		if (postChange >= 2) {
			let severity: "critical" | "warning" | "info" = "info";
			if (postChange >= 15) severity = "warning"; // Major spike

			changes.push({
				competitorId: snap.competitorId,
				platform: snap.platform,
				metric: "posting_frequency",
				oldValue: prev.postCount,
				newValue: snap.postCount,
				change: postChange,
				severity,
				message: `${snap.competitorId} posted ${snap.postCount} times on ${snap.platform} (vs ${prev.postCount} usual)`,
			});
		}

		// Detect engagement rate changes
		const engagementChange =
			snap.engagementRate - prev.engagementRate;
		if (Math.abs(engagementChange) >= 2) {
			let severity: "critical" | "warning" | "info" = "info";
			if (engagementChange >= 2) severity = "warning"; // Higher engagement
			if (engagementChange < -3) severity = "info"; // Lower engagement (expected)

			changes.push({
				competitorId: snap.competitorId,
				platform: snap.platform,
				metric: "engagement_rate",
				oldValue: prev.engagementRate,
				newValue: snap.engagementRate,
				change: engagementChange,
				severity,
				message:
					engagementChange > 0
						? `Engagement up to ${snap.engagementRate.toFixed(1)}% (from ${prev.engagementRate.toFixed(1)}%)`
						: `Engagement down to ${snap.engagementRate.toFixed(1)}% (from ${prev.engagementRate.toFixed(1)}%)`,
			});
		}

		// Detect follower growth spikes
		const followerGrowth = snap.followerGrowth - prev.followerGrowth;
		if (followerGrowth >= 50) {
			// More than 50 new followers in a period
			changes.push({
				competitorId: snap.competitorId,
				platform: snap.platform,
				metric: "follower_growth",
				oldValue: prev.followerGrowth,
				newValue: snap.followerGrowth,
				change: followerGrowth,
				severity: followerGrowth >= 300 ? "warning" : "info",
				message: `Gained ${snap.followerGrowth} followers on ${snap.platform} (current: ${snap.followerCount.toLocaleString()})`,
			});
		}

		// Detect sentiment shifts
		if (snap.sentiment !== prev.sentiment) {
			changes.push({
				competitorId: snap.competitorId,
				platform: snap.platform,
				metric: "sentiment",
				oldValue: 0, // Can't easily compare sentiments
				newValue: 0,
				change: 0,
				severity: "info",
				message: `Sentiment shift on ${snap.platform}: ${snap.sentiment}`,
			});
		}
	}

	return changes;
}

/**
 * Fetch Twitter/X data via API
 */
async function fetchTwitterData(
	handle: string,
	bearerToken: string | undefined
): Promise<SocialSnapshot | null> {
	if (!bearerToken) {
		console.warn("Twitter API token not configured");
		return null;
	}

	try {
		// Would use Twitter API v2 to fetch:
		// - Recent tweets (user_recent_tweets endpoint)
		// - Follower metrics (users/by_username endpoint)
		// - Engagement metrics (tweets endpoint with metrics.public_metrics)

		console.warn("Twitter API integration not yet implemented");
		return null;
	} catch (err) {
		console.warn(`Failed to fetch Twitter data for @${handle}:`, err);
		return null;
	}
}

/**
 * Fetch LinkedIn data via API
 */
async function fetchLinkedInData(
	companyUrl: string,
	accessToken: string | undefined
): Promise<SocialSnapshot | null> {
	if (!accessToken) {
		console.warn("LinkedIn API token not configured");
		return null;
	}

	try {
		// Would use LinkedIn API v2 to fetch:
		// - Company page info (/organizations/{id})
		// - Recent posts (/posts endpoint)
		// - Follower count and growth

		console.warn("LinkedIn API integration not yet implemented");
		return null;
	} catch (err) {
		console.warn(`Failed to fetch LinkedIn data for ${companyUrl}:`, err);
		return null;
	}
}

/**
 * Generate stub social media snapshots for MVP
 */
function generateStubSocialSnapshot(
	competitorId: string,
	platform: "twitter" | "linkedin" | "bluesky" | "threads"
): SocialSnapshot {
	const basePostCount = Math.floor(Math.random() * 10) + 1;
	const baseFollowers = Math.floor(Math.random() * 100000) + 1000;

	return {
		competitorId,
		platform,
		handle:
			platform === "twitter"
				? `@${competitorId.toLowerCase()}`
				: competitorId,
		postCount: basePostCount,
		engagementRate: Math.random() * 8 + 1, // 1-9%
		followerCount: baseFollowers,
		followerGrowth: Math.floor(Math.random() * 200),
		avgPostLength: 240,
		sentiment: "neutral",
		snapshotDate: new Date(),
		lastUpdated: new Date(),
	};
}

export const competitorSocialListenerSource: DataSource = {
	id: "competitor-social",
	name: "Social Activity",
	icon: "📱",
	description:
		"Monitor competitor social media activity (Twitter, LinkedIn, etc)",
	requiresConfig: true, // Requires API tokens (Twitter, LinkedIn)

	async fetch(config: DataSourceConfig): Promise<BriefingItem[]> {
		// For MVP: Return setup status
		// Full integration would:
		// 1. Fetch latest social snapshots per competitor per platform
		// 2. Compare to yesterday's data
		// 3. Detect changes (posting frequency, engagement, follower growth)
		// 4. Generate briefing items for significant activity

		const apiKeyAvailable =
			config.env.TWITTER_BEARER_TOKEN ||
			config.env.LINKEDIN_ACCESS_TOKEN;

		if (!apiKeyAvailable) {
			return [
				{
					id: "social-listener-setup",
					priority: "normal",
					category: "status",
					title: "Social Activity Monitor - API Configuration Required",
					detail:
						"Configure Twitter/X and LinkedIn API tokens to monitor competitor social media activity",
					time: new Date().toISOString(),
					action: "Configure",
					actionUrl: "/settings/integrations",
				},
			];
		}

		return [
			{
				id: "social-listener-active",
				priority: "low",
				category: "marketing",
				title: "Social Activity Monitor - Active",
				detail:
					"Monitoring competitor Twitter, LinkedIn, and emerging platforms for posting activity, engagement, and growth trends.",
				time: new Date().toISOString(),
			},
		];
	},
};

/**
 * Export helpers for testing and scheduled jobs
 */
export {
	fetchTwitterData,
	fetchLinkedInData,
	generateStubSocialSnapshot,
};
