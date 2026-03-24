/**
 * Analytics Server Functions — Expose analytics data to client
 */

import { createServerFn } from "@tanstack/react-start";
import { getWorkerDb } from "../lib/worker-context";
import { getLatestMetrics, getMetricsLastNHours, getRules } from "../lib/db/queries";
import { initDb } from "../lib/db/queries";
import { analyzeTrending } from "../lib/analytics/trending";
import { detectAnomalies } from "../lib/analytics/anomaly";
import { evaluateRules } from "../lib/analytics/alerts";
import {
	FetchAllSourcesInputSchema,
	validateInput,
} from "../lib/schemas/input";

export interface TrendingData {
	datasourceId: string;
	current: number;
	avg7h: number;
	avg24h: number;
	trend: "improving" | "stable" | "degrading";
	weeklyPattern: number;
	samples: number;
}

export interface AnomalyData {
	datasourceId: string;
	anomalies: Array<{
		value: number;
		mean: number;
		zScore: number;
		severity: "low" | "medium" | "high" | "critical";
	}>;
}

/**
 * Get trending data for a datasource
 */
export const getTrendingData = createServerFn()
	.input<{ datasourceId: string; hours?: number }>()
	.handler(async ({ data }) => {
		const db = getWorkerDb();
		if (!db) {
			return { error: "Database not initialized", trending: null };
		}

		try {
			const drizzleDb = initDb(db);
			const metrics = await getMetricsLastNHours(
				drizzleDb,
				data.datasourceId,
				data.hours || 24
			);

			if (!metrics || metrics.length === 0) {
				return { error: "No metrics found", trending: null };
			}

			const trending = analyzeTrending(metrics as any, "latency");
			return { error: null, trending };
		} catch (err) {
			return {
				error: err instanceof Error ? err.message : "Unknown error",
				trending: null,
			};
		}
	});

/**
 * Get anomalies for a datasource
 */
export const getAnomalyData = createServerFn()
	.input<{ datasourceId: string; hours?: number }>()
	.handler(async ({ data }) => {
		const db = getWorkerDb();
		if (!db) {
			return { error: "Database not initialized", anomalies: [] };
		}

		try {
			const drizzleDb = initDb(db);
			const metrics = await getMetricsLastNHours(
				drizzleDb,
				data.datasourceId,
				data.hours || 24
			);

			if (!metrics || metrics.length === 0) {
				return { error: "No metrics found", anomalies: [] };
			}

			const anomalies = detectAnomalies(metrics as any, "latency", 3);
			return { error: null, anomalies };
		} catch (err) {
			return {
				error: err instanceof Error ? err.message : "Unknown error",
				anomalies: [],
			};
		}
	});

/**
 * Evaluate alert rules for a datasource
 */
export const evaluateAlerts = createServerFn()
	.input<{ datasourceId: string }>()
	.handler(async ({ data }) => {
		const db = getWorkerDb();
		if (!db) {
			return { error: "Database not initialized", alerts: [] };
		}

		try {
			const drizzleDb = initDb(db);

			// Get latest metric
			const latestMetrics = await getLatestMetrics(drizzleDb, data.datasourceId);
			if (!latestMetrics || latestMetrics.length === 0) {
				return { error: "No metrics found", alerts: [] };
			}

			const metric = latestMetrics[0];

			// Get rules for this datasource
			const rules = await getRules(drizzleDb, data.datasourceId);

			// Evaluate rules
			const alerts = evaluateRules(metric as any, rules as any);

			return { error: null, alerts };
		} catch (err) {
			return {
				error: err instanceof Error ? err.message : "Unknown error",
				alerts: [],
			};
		}
	});

/**
 * Get health summary for all datasources
 */
export const getHealthSummary = createServerFn().handler(async () => {
	const db = getWorkerDb();
	if (!db) {
		return { error: "Database not initialized", summary: null };
	}

	try {
		const drizzleDb = initDb(db);

		// In a real implementation, this would aggregate metrics across all datasources
		// For now, return a placeholder

		return {
			error: null,
			summary: {
				totalDatasources: 0,
				healthy: 0,
				degraded: 0,
				critical: 0,
				lastUpdated: new Date().toISOString(),
			},
		};
	} catch (err) {
		return {
			error: err instanceof Error ? err.message : "Unknown error",
			summary: null,
		};
	}
});
