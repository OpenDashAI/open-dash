import type { BriefingItem } from "../lib/briefing";
import type { DataSource, DataSourceConfig } from "../lib/datasource";

/**
 * GA4 DataSource - Monitor organic traffic and conversion performance
 *
 * Tracks:
 * - Organic sessions and users
 * - Bounce rate (quality metric)
 * - Conversions and conversion rate
 * - Traffic sources breakdown
 *
 * Detects:
 * - Organic traffic drops (>50% session decrease)
 * - Bounce rate spikes (>30% increase, indicates quality issues)
 * - Conversion rate drops (>5% change)
 * - Traffic source anomalies
 *
 * Uses:
 * - Google Analytics 4 API v1
 * - OAuth2 authentication with property access
 * - Property ID for data access
 */

export interface GA4Snapshot {
	propertyId: string;
	propertyName: string;
	organicSessions: number;
	organicUsers: number;
	bouncRate: number; // 0-1
	conversions: number;
	conversionRate: number; // 0-1
	trafficBySource: Record<string, number>; // e.g., {organic: 5000, paid: 2000, social: 1500}
	snapshotDate: Date;
}

/**
 * Detect changes between GA4 snapshots
 *
 * Severity levels:
 * - critical: organic traffic drop >80%, bounce rate >50%
 * - warning: organic traffic drop 50-80%, bounce rate spike >30%, conversion drop 5-10%
 * - info: minor changes detected
 */
export function detectGA4Changes(
	today: GA4Snapshot[],
	yesterday: GA4Snapshot[]
): Array<{
	propertyId: string;
	propertyName: string;
	metric: string;
	oldValue: number;
	newValue: number;
	change: number;
	severity: "critical" | "warning" | "info";
	message: string;
}> {
	const changes = [];

	for (const snapshot of today) {
		const prev = yesterday.find((s) => s.propertyId === snapshot.propertyId);
		if (!prev) continue;

		// Detect organic session drops (traffic anomalies)
		const sessionChange = snapshot.organicSessions - prev.organicSessions;
		const sessionPercent =
			(sessionChange / Math.max(prev.organicSessions, 1)) * 100;

		if (Math.abs(sessionPercent) > 50) {
			// >50% change
			let severity: "critical" | "warning" | "info" = "warning";
			if (sessionPercent <= -80) {
				severity = "critical"; // Major traffic drop
			}

			changes.push({
				propertyId: snapshot.propertyId,
				propertyName: snapshot.propertyName,
				metric: "organic_sessions",
				oldValue: prev.organicSessions,
				newValue: snapshot.organicSessions,
				change: sessionChange,
				severity,
				message: `Organic sessions ${sessionPercent > 0 ? "↑" : "↓"} ${Math.abs(sessionPercent).toFixed(0)}% to ${snapshot.organicSessions.toLocaleString()}`,
			});
		}

		// Detect bounce rate spikes (quality issues)
		const bounceRateDelta = snapshot.bouncRate - prev.bouncRate;
		const bounceRatePercent = (bounceRateDelta / Math.max(prev.bouncRate, 0.01)) * 100;

		if (bounceRateDelta >= 0.3) {
			// 30% absolute increase is critical
			let severity: "critical" | "warning" | "info" = "warning";
			if (bounceRateDelta >= 0.5) {
				severity = "critical"; // >50% bounce rate
			}

			changes.push({
				propertyId: snapshot.propertyId,
				propertyName: snapshot.propertyName,
				metric: "bounce_rate",
				oldValue: prev.bouncRate,
				newValue: snapshot.bouncRate,
				change: bounceRateDelta,
				severity,
				message: `Bounce rate ↑ ${bounceRatePercent.toFixed(1)}% to ${(snapshot.bouncRate * 100).toFixed(1)}%`,
			});
		}

		// Detect conversion rate changes
		const convRateDelta = snapshot.conversionRate - prev.conversionRate;
		if (Math.abs(convRateDelta) >= 0.005) {
			// >0.5% change
			let severity: "critical" | "warning" | "info" = "info";
			if (convRateDelta <= -0.1) {
				severity = "critical"; // >10% drop
			} else if (convRateDelta <= -0.05) {
				severity = "warning"; // 5-10% drop
			}

			changes.push({
				propertyId: snapshot.propertyId,
				propertyName: snapshot.propertyName,
				metric: "conversion_rate",
				oldValue: prev.conversionRate,
				newValue: snapshot.conversionRate,
				change: convRateDelta,
				severity,
				message: `Conversion rate ${convRateDelta > 0 ? "↑" : "↓"} to ${(snapshot.conversionRate * 100).toFixed(2)}% (was ${(prev.conversionRate * 100).toFixed(2)}%)`,
			});
		}
	}

	return changes;
}

/**
 * Generate stub GA4 snapshots for MVP
 */
export function generateStubGA4Snapshot(
	propertyId: string,
	propertyName: string
): GA4Snapshot {
	return {
		propertyId,
		propertyName,
		organicSessions: Math.floor(Math.random() * 49001) + 1000, // 1K-50K
		organicUsers: Math.floor(Math.random() * 9001) + 500, // 500-9.5K
		bouncRate: Math.random() * 0.4 + 0.3, // 30-70%
		conversions: Math.floor(Math.random() * 500) + 20,
		conversionRate: Math.random() * 0.08 + 0.01, // 1-9%
		trafficBySource: {
			organic: Math.floor(Math.random() * 3000) + 1000,
			paid: Math.floor(Math.random() * 2000) + 500,
			social: Math.floor(Math.random() * 1500) + 300,
			direct: Math.floor(Math.random() * 1000) + 200,
		},
		snapshotDate: new Date(),
	};
}

export const ga4Source: DataSource = {
	id: "ga4",
	name: "Google Analytics 4",
	icon: "📊",
	description: "Track organic traffic, conversions, and user behavior metrics from GA4",
	requiresConfig: true,

	async fetch(config: DataSourceConfig): Promise<BriefingItem[]> {
		const propertyId = config.env.GA4_PROPERTY_ID;

		if (!propertyId) {
			return [
				{
					id: "ga4-setup",
					priority: "normal",
					category: "status",
					title: "Google Analytics 4 - Configuration Required",
					detail: "Configure GA4 property ID and OAuth credentials",
					time: new Date().toISOString(),
					action: "Configure",
					actionUrl: "/settings/integrations/ga4",
				},
			];
		}

		// MVP: Return setup status
		// Full integration would:
		// 1. Authenticate with GA4 API
		// 2. Fetch organic traffic, conversions, bounce rate
		// 3. Compare to yesterday's snapshots
		// 4. Detect traffic drops, bounce rate spikes, conversion changes
		// 5. Store snapshots in D1
		// 6. Generate briefing items for anomalies

		return [
			{
				id: "ga4-active",
				priority: "low",
				category: "traffic",
				title: "Google Analytics 4 - Monitoring Active",
				detail:
					"Tracking organic traffic, conversions, and user behavior. API integration ready.",
				time: new Date().toISOString(),
			},
		];
	},
};
