import type { D1Database } from "@cloudflare/workers-types"
import { initDb, getLatestMetrics, insertMetric } from "./db/queries"
import { DatasourceMetricSchema, computeHealthStatus } from "./schemas/metrics"

export interface DatasourceMetric {
	id: string
	name: string
	lastFetch: number // timestamp in ms
	fetchLatency: number // in ms
	errorRate: number // 0-1
	connected: boolean
}

export class MetricsTracker {
	private db?: ReturnType<typeof initDb>

	constructor(database?: D1Database) {
		if (database) {
			this.db = initDb(database)
		}
	}

	/**
	 * Initialize with D1 database (call this once at startup)
	 */
	initialize(database: D1Database) {
		this.db = initDb(database)
	}

	/**
	 * Record a fetch attempt for a datasource
	 * Validates with Zod and stores in D1
	 */
	async recordFetch(id: string, name: string, latency: number, success: boolean) {
		if (!this.db) {
			console.warn("MetricsTracker not initialized with D1 database")
			return
		}

		const now = Date.now()

		try {
			// Get existing metric for error rate calculation
			const existing = await getLatestMetrics(this.db, id)
			const existingMetric = existing?.[0]

			const newErrorRate = existingMetric
				? existingMetric.errorRate * 0.9 + (success ? 0 : 1) * 0.1
				: success ? 0 : 1

			// Validate before insert
			const metric = DatasourceMetricSchema.parse({
				id,
				name,
				lastFetch: now,
				fetchLatency: latency,
				errorRate: newErrorRate,
				connected: success,
			})

			const healthStatus = computeHealthStatus(metric)

			// Insert to D1 using the proper helper
			await insertMetric(this.db, {
				id: crypto.randomUUID(),
				datasourceId: id,
				datasourceName: name,
				fetchLatency: latency,
				errorRate: newErrorRate,
				connected: success,
				healthStatus,
				timestamp: now,
			})
		} catch (err) {
			console.error("Failed to record fetch metric:", err)
		}
	}

	async getMetric(id: string): Promise<DatasourceMetric | undefined> {
		if (!this.db) {
			return undefined
		}

		try {
			const result = await getLatestMetrics(this.db, id)
			const metric = result?.[0]
			if (!metric) return undefined

			return {
				id: metric.datasourceId,
				name: metric.datasourceName,
				lastFetch: metric.timestamp,
				fetchLatency: metric.fetchLatency,
				errorRate: metric.errorRate,
				connected: metric.connected === 1,
			}
		} catch (err) {
			console.error("Failed to get metric:", err)
			return undefined
		}
	}

	async getAllMetrics(): Promise<DatasourceMetric[]> {
		if (!this.db) {
			return []
		}

		try {
			// This would need a query to get latest metric per datasource
			// For now, return empty array until we add the aggregation query
			return []
		} catch (err) {
			console.error("Failed to get all metrics:", err)
			return []
		}
	}

	async getHealthStatus(id: string): Promise<'healthy' | 'degraded' | 'critical'> {
		const metric = await this.getMetric(id)
		if (!metric) return 'degraded'

		if (!metric.connected) return 'critical'
		if (metric.errorRate > 0.5) return 'critical'
		if (metric.errorRate > 0.2) return 'degraded'
		return 'healthy'
	}

	getLastFetchTime(id: string): string {
		// This is a synchronous utility, kept for compatibility
		// In real usage, would need to make this async and fetch from DB
		return 'unknown'
	}

	clear() {
		// In real D1 usage, would need to delete from database
		// For now, this is a no-op since we don't keep in-memory state
	}
}

export const metricsTracker = new MetricsTracker()
