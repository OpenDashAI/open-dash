/**
 * Trending Analysis — Calculate moving averages and weekly patterns
 */

import type { DatasourceMetric } from "../db/queries";

export interface TrendingMetric {
	timestamp: number;
	value: number;
	movingAvg7h?: number; // 7-hour moving average
	movingAvg24h?: number; // 24-hour moving average
	weeklyPattern?: number; // 0-1 scale, 1 = consistent
}

export interface TrendingAnalysis {
	datasourceId: string;
	metric: "latency" | "errorRate";
	current: number;
	avg7h: number;
	avg24h: number;
	trend: "improving" | "stable" | "degrading";
	weeklyPattern: number;
	samples: number;
}

/**
 * Calculate moving average from metrics
 */
export function calculateMovingAverage(
	metrics: DatasourceMetric[],
	windowHours: number
): number {
	if (metrics.length === 0) return 0;

	const cutoffTime = Date.now() - windowHours * 3600000;
	const recentMetrics = metrics.filter((m) => m.lastFetch >= cutoffTime);

	if (recentMetrics.length === 0) return 0;

	// Calculate average latency or error rate
	const sum = recentMetrics.reduce((acc, m) => {
		return acc + m.fetchLatency; // Change based on metric type
	}, 0);

	return sum / recentMetrics.length;
}

/**
 * Detect weekly patterns (how consistent is the data across days)
 * Returns 0-1 scale where 1 = highly consistent pattern
 */
export function detectWeeklyPattern(metrics: DatasourceMetric[]): number {
	if (metrics.length < 7) return 0; // Need at least 7 samples

	// Group by day of week
	const dayGroups = new Map<number, DatasourceMetric[]>();
	for (const metric of metrics) {
		const day = new Date(metric.lastFetch).getDay();
		if (!dayGroups.has(day)) {
			dayGroups.set(day, []);
		}
		dayGroups.get(day)!.push(metric);
	}

	// Calculate variance of daily averages
	const dayAverages = Array.from(dayGroups.values()).map((dayMetrics) => {
		const sum = dayMetrics.reduce((acc, m) => acc + m.fetchLatency, 0);
		return sum / dayMetrics.length;
	});

	if (dayAverages.length < 2) return 0;

	const mean = dayAverages.reduce((a, b) => a + b, 0) / dayAverages.length;
	const variance =
		dayAverages.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) /
		dayAverages.length;
	const stdDev = Math.sqrt(variance);

	// Inverse of coefficient of variation (0 = high variance, 1 = low variance)
	const cv = stdDev / mean;
	return Math.max(0, 1 - cv);
}

/**
 * Analyze trending for a datasource
 */
export function analyzeTrending(
	metrics: DatasourceMetric[],
	metricType: "latency" | "errorRate" = "latency"
): TrendingAnalysis {
	const datasourceId = metrics[0]?.id || "unknown";

	const avg7h = calculateMovingAverage(metrics, 7);
	const avg24h = calculateMovingAverage(metrics, 24);
	const current = metrics[0]?.fetchLatency || 0;
	const weeklyPattern = detectWeeklyPattern(metrics);

	// Determine trend
	let trend: "improving" | "stable" | "degrading" = "stable";
	if (avg7h > avg24h * 1.1) {
		trend = "degrading";
	} else if (avg7h < avg24h * 0.9) {
		trend = "improving";
	}

	return {
		datasourceId,
		metric: metricType,
		current,
		avg7h,
		avg24h,
		trend,
		weeklyPattern,
		samples: metrics.length,
	};
}
