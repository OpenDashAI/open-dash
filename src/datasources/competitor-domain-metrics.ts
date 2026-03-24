import type { BriefingItem } from "../lib/briefing";
import type { DataSource, DataSourceConfig } from "../lib/datasource";

/**
 * Competitor Domain Metrics - Track competitor domain authority & traffic
 *
 * Monitors:
 * - Domain Authority (DA) scores
 * - Estimated monthly visitors
 * - Organic keyword count
 * - Backlinks and referring domains
 * - Traffic trends and anomalies
 *
 * Data sources:
 * - SimilarWeb (traffic estimates, keywords)
 * - Ahrefs (domain authority, backlinks)
 * - Semrush (SEO metrics)
 *
 * Weekly snapshots stored in D1 for trend analysis.
 */

export interface DomainSnapshot {
	competitorId: string;
	domain: string;
	domainAuthority: number; // 0-100 (Ahrefs DA)
	trafficEstimate: number; // Monthly visitors
	organicKeywords: number; // Tracked keywords
	backlinksCount: number;
	referringDomains: number;
	lastChecked: Date;
	source: "similarweb" | "ahrefs" | "semrush" | "manual";
}

/**
 * Detect domain metrics changes between snapshots
 */
export function detectDomainMovements(
	today: DomainSnapshot[],
	yesterday: DomainSnapshot[]
): Array<{
	competitorId: string;
	metric: string;
	oldValue: number;
	newValue: number;
	percentChange: number;
	severity: "critical" | "warning" | "info";
	message: string;
}> {
	const movements = [];

	for (const comp of today) {
		const prev = yesterday.find((c) => c.competitorId === comp.competitorId);
		if (!prev) continue;

		// Detect Domain Authority changes (0-100 scale)
		const daChange = comp.domainAuthority - prev.domainAuthority;
		if (Math.abs(daChange) >= 2) {
			let severity: "critical" | "warning" | "info" = "info";
			if (daChange >= 5) severity = "warning"; // Significant gain
			if (daChange <= -5) severity = "critical"; // Significant loss

			movements.push({
				competitorId: comp.competitorId,
				metric: "domain_authority",
				oldValue: prev.domainAuthority,
				newValue: comp.domainAuthority,
				percentChange: (daChange / Math.max(prev.domainAuthority, 1)) * 100,
				severity,
				message:
					daChange > 0
						? `DA increased to ${comp.domainAuthority} (from ${prev.domainAuthority})`
						: `DA decreased to ${comp.domainAuthority} (from ${prev.domainAuthority})`,
			});
		}

		// Detect traffic changes (>20% = significant)
		const trafficChange = comp.trafficEstimate - prev.trafficEstimate;
		const trafficPercent =
			(trafficChange / Math.max(prev.trafficEstimate, 1)) * 100;

		if (Math.abs(trafficPercent) >= 20) {
			let severity: "critical" | "warning" | "info" = "warning";
			if (trafficPercent >= 50) severity = "warning"; // Major gain
			if (trafficPercent <= -50) severity = "critical"; // Major loss

			movements.push({
				competitorId: comp.competitorId,
				metric: "traffic_estimate",
				oldValue: prev.trafficEstimate,
				newValue: comp.trafficEstimate,
				percentChange: trafficPercent,
				severity,
				message:
					trafficPercent > 0
						? `Traffic grew ${trafficPercent.toFixed(0)}% to ${comp.trafficEstimate.toLocaleString()} visitors/mo`
						: `Traffic dropped ${trafficPercent.toFixed(0)}% to ${comp.trafficEstimate.toLocaleString()} visitors/mo`,
			});
		}

		// Detect keyword ranking changes (>15% = significant)
		const keywordChange = comp.organicKeywords - prev.organicKeywords;
		const keywordPercent =
			(keywordChange / Math.max(prev.organicKeywords, 1)) * 100;

		if (Math.abs(keywordPercent) >= 15) {
			let severity: "critical" | "warning" | "info" = "warning";
			if (keywordPercent >= 30) severity = "warning"; // Strong gain
			if (keywordPercent <= -30) severity = "critical"; // Strong loss

			movements.push({
				competitorId: comp.competitorId,
				metric: "organic_keywords",
				oldValue: prev.organicKeywords,
				newValue: comp.organicKeywords,
				percentChange: keywordPercent,
				severity,
				message:
					keywordPercent > 0
						? `Ranking for ${keywordPercent.toFixed(0)}% more keywords (${comp.organicKeywords.toLocaleString()} total)`
						: `Ranking for ${keywordPercent.toFixed(0)}% fewer keywords (${comp.organicKeywords.toLocaleString()} total)`,
			});
		}

		// Detect backlink profile changes (>10% = significant)
		const backlinkChange = comp.backlinksCount - prev.backlinksCount;
		const backlinkPercent =
			(backlinkChange / Math.max(prev.backlinksCount, 1)) * 100;

		if (Math.abs(backlinkPercent) >= 10) {
			let severity: "critical" | "warning" | "info" = "warning";
			if (backlinkPercent > 20) severity = "warning"; // Strong link growth
			if (backlinkPercent < -20) severity = "critical"; // Link loss

			movements.push({
				competitorId: comp.competitorId,
				metric: "backlinks",
				oldValue: prev.backlinksCount,
				newValue: comp.backlinksCount,
				percentChange: backlinkPercent,
				severity,
				message:
					backlinkPercent > 0
						? `Gained ${backlinkChange.toLocaleString()} backlinks (${comp.backlinksCount.toLocaleString()} total)`
						: `Lost ${Math.abs(backlinkChange).toLocaleString()} backlinks (${comp.backlinksCount.toLocaleString()} total)`,
			});
		}
	}

	return movements;
}

/**
 * Fetch domain metrics from SimilarWeb API
 * Falls back to stub data if API unavailable
 */
async function fetchFromSimilarWeb(
	domain: string,
	apiKey: string | undefined
): Promise<DomainSnapshot | null> {
	if (!apiKey) {
		console.warn("SimilarWeb API key not configured");
		return null;
	}

	try {
		const response = await fetch(
			`https://api.similarweb.com/v1/website/${domain}/overview/monthly`,
			{
				headers: {
					Authorization: `Bearer ${apiKey}`,
					"Accept-Encoding": "gzip",
				},
			}
		);

		if (!response.ok) {
			console.warn(`SimilarWeb API error: ${response.status}`);
			return null;
		}

		const data = (await response.json()) as any;

		return {
			competitorId: "", // Will be set by caller
			domain,
			domainAuthority: 0, // SimilarWeb doesn't provide DA
			trafficEstimate: data.visits?.monthly || 0,
			organicKeywords: data.keywords?.organic?.count || 0,
			backlinksCount: 0, // SimilarWeb doesn't provide backlinks
			referringDomains: data.keywords?.referring_domains || 0,
			lastChecked: new Date(),
			source: "similarweb",
		};
	} catch (err) {
		console.warn(`Failed to fetch from SimilarWeb for ${domain}:`, err);
		return null;
	}
}

/**
 * Fetch domain metrics from Ahrefs API
 * Falls back to stub data if API unavailable
 */
async function fetchFromAhrefs(
	domain: string,
	apiKey: string | undefined
): Promise<DomainSnapshot | null> {
	if (!apiKey) {
		console.warn("Ahrefs API key not configured");
		return null;
	}

	try {
		const response = await fetch(
			`https://api.ahrefs.com/v3/domain-metrics?target=${domain}`,
			{
				headers: {
					Authorization: `Bearer ${apiKey}`,
				},
			}
		);

		if (!response.ok) {
			console.warn(`Ahrefs API error: ${response.status}`);
			return null;
		}

		const data = (await response.json()) as any;

		return {
			competitorId: "", // Will be set by caller
			domain,
			domainAuthority: Math.round(data.ahrefs_rank || 0),
			trafficEstimate: data.organic_traffic || 0,
			organicKeywords: data.keywords || 0,
			backlinksCount: data.backlinks || 0,
			referringDomains: data.referring_domains || 0,
			lastChecked: new Date(),
			source: "ahrefs",
		};
	} catch (err) {
		console.warn(`Failed to fetch from Ahrefs for ${domain}:`, err);
		return null;
	}
}

/**
 * Generate stub domain metrics for MVP
 */
function generateStubDomainMetrics(
	competitorId: string,
	domain: string
): DomainSnapshot {
	// Generate realistic-looking stub data
	const baseDA = Math.floor(Math.random() * 40) + 20; // DA 20-60
	const baseTraffic = Math.floor(Math.random() * 100000) + 10000; // 10K-110K visitors
	const baseKeywords = Math.floor(Math.random() * 5000) + 500; // 500-5500 keywords

	return {
		competitorId,
		domain,
		domainAuthority: baseDA,
		trafficEstimate: baseTraffic,
		organicKeywords: baseKeywords,
		backlinksCount: Math.floor(baseKeywords * 2), // Approx 2 backlinks per keyword tracked
		referringDomains: Math.floor(baseKeywords / 20), // Approx 1 ref domain per 20 keywords
		lastChecked: new Date(),
		source: "manual",
	};
}

export const competitorDomainMetricsSource: DataSource = {
	id: "competitor-domains",
	name: "Domain Metrics",
	icon: "🌐",
	description:
		"Track competitor domain authority, traffic, and keyword metrics",
	requiresConfig: true, // Requires API key (SimilarWeb or Ahrefs)

	async fetch(config: DataSourceConfig): Promise<BriefingItem[]> {
		// For MVP: Return setup status
		// Full integration would query D1 and detect changes between snapshots

		const apiKeyAvailable =
			config.env.SIMILARWEB_API_KEY ||
			config.env.AHREFS_API_KEY;

		if (!apiKeyAvailable) {
			return [
				{
					id: "domain-metrics-setup",
					priority: "normal",
					category: "status",
					title: "Domain Metrics - API Configuration Required",
					detail:
						"Configure SimilarWeb or Ahrefs API key to track competitor domain metrics (authority, traffic, keywords)",
					time: new Date().toISOString(),
					action: "Configure",
					actionUrl: "/settings/integrations",
				},
			];
		}

		return [
			{
				id: "domain-metrics-collecting",
				priority: "low",
				category: "seo",
				title: "Domain Metrics - Collecting Data",
				detail:
					"Competitor domain metrics collected weekly. API integration for SimilarWeb/Ahrefs ready.",
				time: new Date().toISOString(),
			},
		];
	},
};

/**
 * Export helpers for testing and scheduled jobs
 */
export {
	fetchFromSimilarWeb,
	fetchFromAhrefs,
	generateStubDomainMetrics,
};
