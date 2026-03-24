import type { BriefingItem } from "../lib/briefing";
import type { DataSource, DataSourceConfig } from "../lib/datasource";
import {
	getCompetitorsByBrand,
	insertCompetitorContent,
	getCompetitorContentByDate,
} from "../lib/db/queries";

/**
 * Competitor Content Monitor - Track competitor blog/content updates
 *
 * Monitors competitor RSS feeds, blog updates, and published content.
 * Detects:
 * - New content published
 * - Content frequency changes (publishing more/less often)
 * - New content categories or topics
 * - Topic shifts in content strategy
 *
 * Data sources:
 * - RSS feeds (if available)
 * - Blog sitemap parsing
 * - Manual RSS feed URLs configured per competitor
 *
 * Store in D1 competitor_content table with daily snapshots.
 */

interface ContentSnapshot {
	competitorId: string;
	url: string;
	title: string;
	publishDate: Date;
	contentType:
		| "blog"
		| "case_study"
		| "tutorial"
		| "announcement"
		| "guide";
	wordCount: number;
	topics: string[];
}

/**
 * Parse RSS feed and extract content entries
 */
async function parseRssFeed(feedUrl: string): Promise<ContentSnapshot[]> {
	try {
		const response = await fetch(feedUrl, {
			headers: {
				"User-Agent": "OpenDash-Bot/1.0 (Competitive Intelligence)",
			},
		});

		if (!response.ok) {
			console.warn(`Failed to fetch RSS feed: ${feedUrl} (${response.status})`);
			return [];
		}

		const text = await response.text();

		// Simple XML parsing for RSS/Atom feeds
		// Extract <item> (RSS) or <entry> (Atom) elements
		const itemRegex = /<item>[\s\S]*?<\/item>/g;
		const entryRegex = /<entry>[\s\S]*?<\/entry>/g;

		const items = text.match(itemRegex) || text.match(entryRegex) || [];

		return items.map((item) => {
			// Extract fields from RSS/Atom
			const titleMatch = item.match(
				/<title[^>]*>([^<]+)<\/title>/
			);
			const linkMatch = item.match(/<link[^>]*>?([^<]*)<\/link>/);
			const pubDateMatch = item.match(/<pubDate>([^<]+)<\/pubDate>/);
			const descriptionMatch = item.match(/<description>([^<]+)<\/description>/);

			const title = titleMatch ? titleMatch[1].trim() : "Untitled";
			const url = linkMatch
				? linkMatch[1].trim()
				: "https://unknown.com";
			const pubDateStr = pubDateMatch ? pubDateMatch[1] : new Date().toISOString();
			const description = descriptionMatch
				? descriptionMatch[1].trim()
				: "";

			// Estimate word count from description
			const wordCount =
				description.split(/\s+/).length || 0;

			// Detect content type from title/description
			let contentType: ContentSnapshot["contentType"] = "blog";
			const text = (title + " " + description).toLowerCase();
			if (text.includes("case study")) contentType = "case_study";
			else if (text.includes("tutorial")) contentType = "tutorial";
			else if (text.includes("announce")) contentType = "announcement";
			else if (text.includes("guide")) contentType = "guide";

			// Extract topics from title
			const topics: string[] = [];
			const commonTopics = [
				"AI",
				"ML",
				"Analytics",
				"Data",
				"API",
				"Integration",
				"Security",
				"Performance",
				"Scaling",
			];
			for (const topic of commonTopics) {
				if (text.includes(topic.toLowerCase())) {
					topics.push(topic);
				}
			}

			return {
				competitorId: "", // Will be set per competitor
				url,
				title,
				publishDate: new Date(pubDateStr),
				contentType,
				wordCount,
				topics,
			};
		});
	} catch (err) {
		console.warn(`Error parsing RSS feed ${feedUrl}:`, err);
		return [];
	}
}

/**
 * Detect content changes between two time periods
 */
function detectContentChanges(
	today: ContentSnapshot[],
	yesterday: ContentSnapshot[]
): Array<{
	competitorId: string;
	metric: string;
	oldValue: number;
	newValue: number;
	severity: "critical" | "warning" | "info";
	message: string;
}> {
	const changes = [];

	const todayCount = today.length;
	const yesterdayCount = yesterday.length;

	// Detect publishing frequency changes
	const frequencyChange = todayCount - yesterdayCount;
	if (frequencyChange > 2) {
		changes.push({
			competitorId: today[0]?.competitorId || "",
			metric: "publish_frequency",
			oldValue: yesterdayCount,
			newValue: todayCount,
			severity: "warning",
			message: `Competitor publishing more content: ${todayCount} articles today vs ${yesterdayCount} yesterday`,
		});
	} else if (frequencyChange < -2) {
		changes.push({
			competitorId: today[0]?.competitorId || "",
			metric: "publish_frequency",
			oldValue: yesterdayCount,
			newValue: todayCount,
			severity: "info",
			message: `Competitor publishing less content: ${todayCount} articles today vs ${yesterdayCount} yesterday`,
		});
	}

	// Detect new content types
	const todayTypes = new Set(today.map((c) => c.contentType));
	const yesterdayTypes = new Set(
		yesterday.map((c) => c.contentType)
	);
	for (const type of todayTypes) {
		if (!yesterdayTypes.has(type)) {
			changes.push({
				competitorId: today[0]?.competitorId || "",
				metric: "content_type",
				oldValue: yesterdayTypes.size,
				newValue: todayTypes.size,
				severity: "info",
				message: `Competitor started publishing ${type} content`,
			});
		}
	}

	// Detect topic shifts
	const todayTopics = new Set(
		today.flatMap((c) => c.topics)
	);
	const yesterdayTopics = new Set(
		yesterday.flatMap((c) => c.topics)
	);

	const newTopics = Array.from(todayTopics).filter(
		(t) => !yesterdayTopics.has(t)
	);
	if (newTopics.length > 0) {
		changes.push({
			competitorId: today[0]?.competitorId || "",
			metric: "topics",
			oldValue: yesterdayTopics.size,
			newValue: todayTopics.size,
			severity: "info",
			message: `Competitor covering new topics: ${newTopics.join(", ")}`,
		});
	}

	return changes;
}

export const competitorContentSource: DataSource = {
	id: "competitor-content",
	name: "Content Updates",
	icon: "📝",
	description:
		"Monitor competitor blog updates, new content, and publishing frequency",
	requiresConfig: true, // Requires RSS feed URLs per competitor

	async fetch(config: DataSourceConfig): Promise<BriefingItem[]> {
		// Note: Full D1 integration would happen in a scheduled job (Durable Object)
		// similar to CompetitiveIntelligenceCoordinator for SERP tracking.
		// This datasource returns status pending full server context integration.

		return [
			{
				id: "content-monitor-setup",
				priority: "normal",
				category: "status",
				title: "Content Monitor - Setup Required",
				detail:
					"Add competitor RSS feed URLs in settings to enable content monitoring. Full integration in progress.",
				time: new Date().toISOString(),
				action: "Configure",
				actionUrl: "/settings/competitors",
			},
		];
	},
};

/**
 * Export helper for testing
 */
export { parseRssFeed, detectContentChanges };
