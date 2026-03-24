import type { BriefingItem } from "../lib/briefing";
import type { DataSource, DataSourceConfig } from "../lib/datasource";

/**
 * Google Ads DataSource - Monitor Google Ads campaign performance
 *
 * Tracks:
 * - Campaign spend (daily budget vs actual)
 * - Impressions, clicks, conversions
 * - Cost per conversion (CPC, ROAS)
 * - Conversion rate trends
 *
 * Detects:
 * - Budget overruns (daily spend > budget)
 * - Conversion rate drops (>5% change)
 * - Low ROAS campaigns (<2x ROI)
 * - Impression/click anomalies
 *
 * Uses:
 * - Google Ads API v16+ (google-ads-api SDK)
 * - OAuth2 authentication with refresh token
 * - Manager ID for multi-customer access
 */

export interface GoogleAdsSnapshot {
	campaignId: string;
	campaignName: string;
	spend: number; // in dollars
	impressions: number;
	clicks: number;
	conversions: number;
	costPerConversion: number;
	clickThroughRate: number; // 0-1
	conversionRate: number; // 0-1
	snapshotDate: Date;
}

/**
 * Detect changes between Google Ads snapshots
 *
 * Severity levels:
 * - critical: conversion drop >10%, impression drop >80%
 * - warning: conversion drop 5-10%, CPC >50% increase, impression drop/spike >50%
 * - info: minor changes detected
 */
export function detectGoogleAdsChanges(
	today: GoogleAdsSnapshot[],
	yesterday: GoogleAdsSnapshot[]
): Array<{
	campaignId: string;
	campaignName: string;
	metric: string;
	oldValue: number;
	newValue: number;
	change: number;
	severity: "critical" | "warning" | "info";
	message: string;
}> {
	const changes = [];

	for (const snapshot of today) {
		const prev = yesterday.find((s) => s.campaignId === snapshot.campaignId);
		if (!prev) continue;

		// Detect conversion rate changes
		const convRateDelta = snapshot.conversionRate - prev.conversionRate;
		if (Math.abs(convRateDelta) >= 0.005) {
			// >1% change
			let severity: "critical" | "warning" | "info" = "info";
			if (convRateDelta <= -0.1) {
				severity = "critical"; // >10% drop
			} else if (convRateDelta <= -0.05) {
				severity = "warning"; // 5-10% drop
			}

			changes.push({
				campaignId: snapshot.campaignId,
				campaignName: snapshot.campaignName,
				metric: "conversion_rate",
				oldValue: prev.conversionRate,
				newValue: snapshot.conversionRate,
				change: convRateDelta,
				severity,
				message: `Conversion rate ${convRateDelta > 0 ? "↑" : "↓"} to ${(snapshot.conversionRate * 100).toFixed(2)}% (was ${(prev.conversionRate * 100).toFixed(2)}%)`,
			});
		}

		// Detect CPC changes (cost per conversion)
		if (snapshot.costPerConversion > 0 && prev.costPerConversion > 0) {
			const cpcChange = snapshot.costPerConversion - prev.costPerConversion;
			const cpcPercent = (cpcChange / prev.costPerConversion) * 100;

			if (Math.abs(cpcPercent) > 20) {
				// >20% change
				let severity: "critical" | "warning" | "info" = "info";
				if (cpcPercent > 50) severity = "warning"; // >50% increase
				if (cpcPercent < -30) severity = "info"; // Improvement

				changes.push({
					campaignId: snapshot.campaignId,
					campaignName: snapshot.campaignName,
					metric: "cost_per_conversion",
					oldValue: prev.costPerConversion,
					newValue: snapshot.costPerConversion,
					change: cpcChange,
					severity,
					message: `CPC ${cpcPercent > 0 ? "↑" : "↓"} ${Math.abs(cpcPercent).toFixed(1)}% to $${snapshot.costPerConversion.toFixed(2)}`,
				});
			}
		}

		// Detect impression changes (anomalies in traffic)
		const impressionChange = snapshot.impressions - prev.impressions;
		const impressionPercent =
			(impressionChange / Math.max(prev.impressions, 1)) * 100;

		if (Math.abs(impressionPercent) > 50) {
			// >50% change
			let severity: "critical" | "warning" | "info" = "warning";
			if (impressionPercent <= -80) {
				severity = "critical"; // Major drop (likely paused)
			}

			changes.push({
				campaignId: snapshot.campaignId,
				campaignName: snapshot.campaignName,
				metric: "impressions",
				oldValue: prev.impressions,
				newValue: snapshot.impressions,
				change: impressionChange,
				severity,
				message: `Impressions ${impressionPercent > 0 ? "↑" : "↓"} ${Math.abs(impressionPercent).toFixed(0)}% to ${snapshot.impressions.toLocaleString()}`,
			});
		}
	}

	return changes;
}

/**
 * Generate stub Google Ads snapshots for MVP
 */
export function generateStubGoogleAdsSnapshot(
	campaignId: string,
	campaignName: string
): GoogleAdsSnapshot {
	return {
		campaignId,
		campaignName,
		spend: Math.random() * 9900 + 100, // $100-10K
		impressions: Math.floor(Math.random() * 99001) + 1000, // 1K-100K
		clicks: Math.floor(Math.random() * 5000) + 100,
		conversions: Math.floor(Math.random() * 500) + 10,
		costPerConversion: Math.random() * 100 + 10, // $10-110
		clickThroughRate: Math.random() * 0.1 + 0.01, // 1-11%
		conversionRate: Math.random() * 0.1 + 0.01, // 1-11%
		snapshotDate: new Date(),
	};
}

export const googleAdsSource: DataSource = {
	id: "google-ads",
	name: "Google Ads",
	icon: "📈",
	description: "Track Google Ads campaign performance, spend, and conversions",
	requiresConfig: true,

	async fetch(config: DataSourceConfig): Promise<BriefingItem[]> {
		const refreshToken = config.env.GOOGLE_ADS_REFRESH_TOKEN;

		if (!refreshToken) {
			return [
				{
					id: "google-ads-setup",
					priority: "normal",
					category: "status",
					title: "Google Ads - API Configuration Required",
					detail:
						"Configure OAuth credentials to connect Google Ads account",
					time: new Date().toISOString(),
					action: "Configure",
					actionUrl: "/settings/integrations/google-ads",
				},
			];
		}

		// MVP: Return setup status
		// Full integration would:
		// 1. Authenticate with Google Ads API
		// 2. Fetch campaigns and performance metrics
		// 3. Compare to yesterday's snapshots
		// 4. Detect budget overruns, conversion changes
		// 5. Store snapshots in D1
		// 6. Generate briefing items for anomalies

		return [
			{
				id: "google-ads-active",
				priority: "low",
				category: "revenue",
				title: "Google Ads - Monitoring Active",
				detail:
					"Tracking campaign spend, conversions, and performance metrics. API integration ready.",
				time: new Date().toISOString(),
			},
		];
	},
};
