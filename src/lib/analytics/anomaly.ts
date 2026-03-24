/**
 * Anomaly Detection — Statistical outlier detection using Z-score
 */

import type { DatasourceMetric } from "../db/queries";

export interface AnomalyAlert {
	datasourceId: string;
	metric: "latency" | "errorRate";
	value: number;
	mean: number;
	stdDev: number;
	zScore: number;
	severity: "low" | "medium" | "high" | "critical";
	timestamp: number;
	description: string;
}

/**
 * Calculate mean and standard deviation
 */
function calculateStats(values: number[]): { mean: number; stdDev: number } {
	if (values.length === 0) {
		return { mean: 0, stdDev: 0 };
	}

	const mean = values.reduce((a, b) => a + b, 0) / values.length;
	const variance =
		values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) /
		values.length;
	const stdDev = Math.sqrt(variance);

	return { mean, stdDev };
}

/**
 * Detect anomalies using Z-score method
 * Z-score > 3 = significant outlier (99.7% confidence)
 */
export function detectAnomalies(
	metrics: DatasourceMetric[],
	metricType: "latency" | "errorRate" = "latency",
	zScoreThreshold: number = 3
): AnomalyAlert[] {
	if (metrics.length < 3) return []; // Need minimum samples

	const values =
		metricType === "latency"
			? metrics.map((m) => m.fetchLatency)
			: metrics.map((m) => m.errorRate);

	const { mean, stdDev } = calculateStats(values);
	const anomalies: AnomalyAlert[] = [];

	if (stdDev === 0) return []; // No variance, no anomalies

	// Check most recent metric for anomaly
	const recent = metrics[0];
	const recentValue =
		metricType === "latency" ? recent.fetchLatency : recent.errorRate;
	const zScore = Math.abs((recentValue - mean) / stdDev);

	if (zScore > zScoreThreshold) {
		const severity = getSeverity(zScore, zScoreThreshold);
		anomalies.push({
			datasourceId: recent.id,
			metric: metricType,
			value: recentValue,
			mean,
			stdDev,
			zScore,
			severity,
			timestamp: recent.lastFetch,
			description: `${metricType} anomaly detected: ${recentValue.toFixed(2)} (z-score: ${zScore.toFixed(2)})`,
		});
	}

	return anomalies;
}

/**
 * Determine severity based on Z-score
 */
function getSeverity(
	zScore: number,
	threshold: number
): "low" | "medium" | "high" | "critical" {
	const factor = zScore / threshold;
	if (factor > 3) return "critical";
	if (factor > 2) return "high";
	if (factor > 1.5) return "medium";
	return "low";
}

/**
 * Simple threshold-based anomaly detection
 * Useful for known limits (e.g., latency should not exceed 10s)
 */
export function detectThresholdViolation(
	metric: DatasourceMetric,
	thresholds: {
		maxLatency?: number;
		maxErrorRate?: number;
		minConnectivity?: number;
	}
): AnomalyAlert | null {
	const alerts: AnomalyAlert[] = [];

	if (
		thresholds.maxLatency &&
		metric.fetchLatency > thresholds.maxLatency
	) {
		alerts.push({
			datasourceId: metric.id,
			metric: "latency",
			value: metric.fetchLatency,
			mean: thresholds.maxLatency,
			stdDev: 0,
			zScore: 0,
			severity: metric.fetchLatency > thresholds.maxLatency * 2 ? "critical" : "high",
			timestamp: metric.lastFetch,
			description: `Latency threshold exceeded: ${metric.fetchLatency}ms > ${thresholds.maxLatency}ms`,
		});
	}

	if (
		thresholds.maxErrorRate &&
		metric.errorRate > thresholds.maxErrorRate
	) {
		alerts.push({
			datasourceId: metric.id,
			metric: "errorRate",
			value: metric.errorRate,
			mean: thresholds.maxErrorRate,
			stdDev: 0,
			zScore: 0,
			severity: "high",
			timestamp: metric.lastFetch,
			description: `Error rate threshold exceeded: ${(metric.errorRate * 100).toFixed(1)}% > ${(thresholds.maxErrorRate * 100).toFixed(1)}%`,
		});
	}

	if (
		thresholds.minConnectivity === 0 &&
		!metric.connected
	) {
		alerts.push({
			datasourceId: metric.id,
			metric: "errorRate",
			value: 1,
			mean: 0,
			stdDev: 0,
			zScore: 0,
			severity: "critical",
			timestamp: metric.lastFetch,
			description: "Datasource disconnected",
		});
	}

	return alerts.length > 0 ? alerts[0] : null;
}
