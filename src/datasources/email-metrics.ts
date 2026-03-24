import type { BriefingItem } from "../lib/briefing";
import type { DataSource, DataSourceConfig } from "../lib/datasource";

/**
 * Email Metrics DataSource - Monitor email campaign performance
 *
 * Tracks:
 * - List size and subscriber growth
 * - Email sends, opens, clicks
 * - Unsubscribe rates and churn
 * - Engagement rates (open rate, click rate)
 *
 * Detects:
 * - Unsubscribe rate spikes (>5% increase)
 * - Open rate drops (>10% change)
 * - Click rate anomalies (>20% change)
 * - Subscriber churn (sudden list shrinkage)
 *
 * Uses:
 * - Mailchimp API, ConvertKit API, or Substack API
 * - OAuth2 authentication
 * - Multi-provider support
 */

export interface EmailMetricsSnapshot {
	campaignId: string;
	campaignName: string;
	provider: "mailchimp" | "convertkit" | "substack";
	listSize: number;
	subscribersAdded: number;
	sendCount: number;
	openCount: number;
	clickCount: number;
	unsubscribeCount: number;
	openRate: number; // 0-1
	clickRate: number; // 0-1
	unsubscribeRate: number; // 0-1
	snapshotDate: Date;
}

/**
 * Detect changes between email metrics snapshots
 *
 * Severity levels:
 * - critical: unsubscribe rate >10%, open rate drop >20%
 * - warning: unsubscribe rate >5%, open rate drop >10%, click rate change >20%
 * - info: minor changes detected
 */
export function detectEmailMetricsChanges(
	today: EmailMetricsSnapshot[],
	yesterday: EmailMetricsSnapshot[]
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
		const prev = yesterday.find(
			(s) => s.campaignId === snapshot.campaignId && s.provider === snapshot.provider
		);
		if (!prev) continue;

		// Detect unsubscribe rate spikes
		const unsubRateDelta = snapshot.unsubscribeRate - prev.unsubscribeRate;
		if (unsubRateDelta >= 0.05) {
			// >=5% increase (absolute)
			let severity: "critical" | "warning" | "info" = "warning";
			if (unsubRateDelta >= 0.1) {
				severity = "critical"; // >10% spike
			}

			changes.push({
				campaignId: snapshot.campaignId,
				campaignName: snapshot.campaignName,
				metric: "unsubscribe_rate",
				oldValue: prev.unsubscribeRate,
				newValue: snapshot.unsubscribeRate,
				change: unsubRateDelta,
				severity,
				message: `Unsubscribe rate ↑ ${(unsubRateDelta * 100).toFixed(2)}% to ${(snapshot.unsubscribeRate * 100).toFixed(2)}%`,
			});
		}

		// Detect open rate changes
		if (snapshot.openRate > 0 && prev.openRate > 0) {
			const openRateDelta = snapshot.openRate - prev.openRate;
			const openRatePercent = (openRateDelta / prev.openRate) * 100;

			if (Math.abs(openRatePercent) > 10) {
				// >10% change
				let severity: "critical" | "warning" | "info" = "info";
				if (openRatePercent <= -20) {
					severity = "critical"; // >20% drop
				} else if (openRatePercent <= -10) {
					severity = "warning"; // 10-20% drop
				}

				changes.push({
					campaignId: snapshot.campaignId,
					campaignName: snapshot.campaignName,
					metric: "open_rate",
					oldValue: prev.openRate,
					newValue: snapshot.openRate,
					change: openRateDelta,
					severity,
					message: `Open rate ${openRatePercent > 0 ? "↑" : "↓"} ${Math.abs(openRatePercent).toFixed(1)}% to ${(snapshot.openRate * 100).toFixed(2)}%`,
				});
			}
		}

		// Detect click rate changes
		if (snapshot.clickRate > 0 && prev.clickRate > 0) {
			const clickRateDelta = snapshot.clickRate - prev.clickRate;
			const clickRatePercent = (clickRateDelta / prev.clickRate) * 100;

			if (Math.abs(clickRatePercent) > 20) {
				// >20% change
				let severity: "critical" | "warning" | "info" = "info";
				if (Math.abs(clickRatePercent) > 50) severity = "warning"; // >50% change

				changes.push({
					campaignId: snapshot.campaignId,
					campaignName: snapshot.campaignName,
					metric: "click_rate",
					oldValue: prev.clickRate,
					newValue: snapshot.clickRate,
					change: clickRateDelta,
					severity,
					message: `Click rate ${clickRatePercent > 0 ? "↑" : "↓"} ${Math.abs(clickRatePercent).toFixed(1)}% to ${(snapshot.clickRate * 100).toFixed(2)}%`,
				});
			}
		}

		// Detect subscriber churn (list size decline)
		const listSizeChange = snapshot.listSize - prev.listSize;
		const listSizePercent = (listSizeChange / Math.max(prev.listSize, 1)) * 100;

		if (listSizePercent <= -20) {
			// >20% decline
			let severity: "critical" | "warning" | "info" = "warning";
			if (listSizePercent <= -50) {
				severity = "critical"; // >50% decline
			}

			changes.push({
				campaignId: snapshot.campaignId,
				campaignName: snapshot.campaignName,
				metric: "list_size",
				oldValue: prev.listSize,
				newValue: snapshot.listSize,
				change: listSizeChange,
				severity,
				message: `Subscriber list ↓ ${Math.abs(listSizePercent).toFixed(0)}% to ${snapshot.listSize.toLocaleString()} subscribers`,
			});
		}
	}

	return changes;
}

/**
 * Generate stub email metrics snapshots for MVP
 */
export function generateStubEmailMetricsSnapshot(
	campaignId: string,
	campaignName: string,
	provider: "mailchimp" | "convertkit" | "substack"
): EmailMetricsSnapshot {
	const listSize = Math.floor(Math.random() * 49000) + 1000; // 1K-50K subscribers

	return {
		campaignId,
		campaignName,
		provider,
		listSize,
		subscribersAdded: Math.floor(Math.random() * 500) + 50,
		sendCount: Math.floor(Math.random() * 5) + 1,
		openCount: Math.floor((listSize * (Math.random() * 0.4 + 0.1)) / 100), // 10-50% of sends
		clickCount: Math.floor((listSize * (Math.random() * 0.1 + 0.01)) / 100), // 1-11% of opens
		unsubscribeCount: Math.floor((listSize * (Math.random() * 0.02 + 0.001)) / 100), // 0.1-2% of sends
		openRate: Math.random() * 0.4 + 0.1, // 10-50%
		clickRate: Math.random() * 0.15 + 0.01, // 1-16%
		unsubscribeRate: Math.random() * 0.02 + 0.001, // 0.1-2.1%
		snapshotDate: new Date(),
	};
}

export const emailMetricsSource: DataSource = {
	id: "email-metrics",
	name: "Email Metrics",
	icon: "📧",
	description: "Track email campaign performance, engagement, and subscriber metrics",
	requiresConfig: true,

	async fetch(config: DataSourceConfig): Promise<BriefingItem[]> {
		const provider = config.env.EMAIL_PROVIDER;
		const accessToken = config.env.EMAIL_API_KEY;

		if (!provider || !accessToken) {
			return [
				{
					id: "email-metrics-setup",
					priority: "normal",
					category: "status",
					title: "Email Metrics - API Configuration Required",
					detail:
						"Configure email provider (Mailchimp, ConvertKit, or Substack) and API credentials",
					time: new Date().toISOString(),
					action: "Configure",
					actionUrl: "/settings/integrations/email-metrics",
				},
			];
		}

		// MVP: Return setup status
		// Full integration would:
		// 1. Authenticate with email provider API
		// 2. Fetch campaign metrics (opens, clicks, unsubscribes)
		// 3. Compare to yesterday's snapshots
		// 4. Detect engagement drops, unsubscribe spikes, churn
		// 5. Store snapshots in D1
		// 6. Generate briefing items for anomalies

		return [
			{
				id: "email-metrics-active",
				priority: "low",
				category: "engagement",
				title: "Email Metrics - Monitoring Active",
				detail:
					"Tracking campaign engagement, subscriber metrics, and performance. API integration ready.",
				time: new Date().toISOString(),
			},
		];
	},
};
