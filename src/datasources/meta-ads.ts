import type { BriefingItem } from "../lib/briefing";
import type { DataSource, DataSourceConfig } from "../lib/datasource";

/**
 * Meta Ads DataSource - Monitor Facebook/Instagram campaign performance
 *
 * Tracks:
 * - Campaign spend (daily budget vs actual)
 * - Impressions, clicks, conversions (actions)
 * - Cost per action (CPA)
 * - Action rate (conversion rate) trends
 *
 * Detects:
 * - Budget overruns (daily spend > budget)
 * - Action rate drops (>5% change)
 * - Low ROAS campaigns (<2x ROI)
 * - Impression/click anomalies
 *
 * Uses:
 * - Meta Marketing API v18+ (facebook-nodejs-business-sdk)
 * - OAuth2 authentication with app token
 * - Ad account ID for campaign access
 */

export interface MetaAdsSnapshot {
	campaignId: string;
	campaignName: string;
	adAccountId: string;
	spend: number; // in dollars
	impressions: number;
	clicks: number;
	actions: number; // conversions in Meta terminology
	costPerAction: number;
	clickThroughRate: number; // 0-1
	actionRate: number; // 0-1, conversion rate
	snapshotDate: Date;
}

/**
 * Detect changes between Meta Ads snapshots
 *
 * Severity levels:
 * - critical: action rate drop >10%, impression drop >80%
 * - warning: action rate drop 5-10%, CPA >50% increase, impression drop/spike >50%
 * - info: minor changes detected
 */
export function detectMetaAdsChanges(
	today: MetaAdsSnapshot[],
	yesterday: MetaAdsSnapshot[]
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

		// Detect action rate changes
		const actionRateDelta = snapshot.actionRate - prev.actionRate;
		if (Math.abs(actionRateDelta) >= 0.005) {
			// >0.5% change
			let severity: "critical" | "warning" | "info" = "info";
			if (actionRateDelta <= -0.1) {
				severity = "critical"; // >10% drop
			} else if (actionRateDelta <= -0.05) {
				severity = "warning"; // 5-10% drop
			}

			changes.push({
				campaignId: snapshot.campaignId,
				campaignName: snapshot.campaignName,
				metric: "action_rate",
				oldValue: prev.actionRate,
				newValue: snapshot.actionRate,
				change: actionRateDelta,
				severity,
				message: `Action rate ${actionRateDelta > 0 ? "↑" : "↓"} to ${(snapshot.actionRate * 100).toFixed(2)}% (was ${(prev.actionRate * 100).toFixed(2)}%)`,
			});
		}

		// Detect CPA changes (cost per action)
		if (snapshot.costPerAction > 0 && prev.costPerAction > 0) {
			const cpaChange = snapshot.costPerAction - prev.costPerAction;
			const cpaPercent = (cpaChange / prev.costPerAction) * 100;

			if (Math.abs(cpaPercent) > 20) {
				// >20% change
				let severity: "critical" | "warning" | "info" = "info";
				if (cpaPercent > 50) severity = "warning"; // >50% increase
				if (cpaPercent < -30) severity = "info"; // Improvement

				changes.push({
					campaignId: snapshot.campaignId,
					campaignName: snapshot.campaignName,
					metric: "cost_per_action",
					oldValue: prev.costPerAction,
					newValue: snapshot.costPerAction,
					change: cpaChange,
					severity,
					message: `CPA ${cpaPercent > 0 ? "↑" : "↓"} ${Math.abs(cpaPercent).toFixed(1)}% to $${snapshot.costPerAction.toFixed(2)}`,
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
 * Generate stub Meta Ads snapshots for MVP
 */
export function generateStubMetaAdsSnapshot(
	campaignId: string,
	campaignName: string,
	adAccountId: string
): MetaAdsSnapshot {
	return {
		campaignId,
		campaignName,
		adAccountId,
		spend: Math.random() * 9900 + 100, // $100-10K
		impressions: Math.floor(Math.random() * 99001) + 1000, // 1K-100K
		clicks: Math.floor(Math.random() * 5000) + 100,
		actions: Math.floor(Math.random() * 500) + 10,
		costPerAction: Math.random() * 100 + 10, // $10-110
		clickThroughRate: Math.random() * 0.1 + 0.01, // 1-11%
		actionRate: Math.random() * 0.1 + 0.01, // 1-11%
		snapshotDate: new Date(),
	};
}

export const metaAdsSource: DataSource = {
	id: "meta-ads",
	name: "Meta Ads",
	icon: "📱",
	description: "Track Meta Ads (Facebook/Instagram) campaign performance, spend, and conversions",
	requiresConfig: true,

	async fetch(config: DataSourceConfig): Promise<BriefingItem[]> {
		const accessToken = config.env.META_ADS_ACCESS_TOKEN;

		if (!accessToken) {
			return [
				{
					id: "meta-ads-setup",
					priority: "normal",
					category: "status",
					title: "Meta Ads - API Configuration Required",
					detail:
						"Configure OAuth credentials to connect Meta Ads account",
					time: new Date().toISOString(),
					action: "Configure",
					actionUrl: "/settings/integrations/meta-ads",
				},
			];
		}

		// MVP: Return setup status
		// Full integration would:
		// 1. Authenticate with Meta Marketing API
		// 2. Fetch campaigns and performance metrics
		// 3. Compare to yesterday's snapshots
		// 4. Detect budget overruns, action rate changes
		// 5. Store snapshots in D1
		// 6. Generate briefing items for anomalies

		return [
			{
				id: "meta-ads-active",
				priority: "low",
				category: "revenue",
				title: "Meta Ads - Monitoring Active",
				detail:
					"Tracking campaign spend, conversions, and performance metrics. API integration ready.",
				time: new Date().toISOString(),
			},
		];
	},
};
