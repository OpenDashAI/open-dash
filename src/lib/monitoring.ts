export interface DatasourceMetric {
	id: string
	name: string
	lastFetch: number // timestamp in ms
	fetchLatency: number // in ms
	errorRate: number // 0-1
	connected: boolean
}

class MetricsTracker {
	private metrics: Map<string, DatasourceMetric> = new Map()

	recordFetch(id: string, name: string, latency: number, success: boolean) {
		const existing = this.metrics.get(id)
		const now = Date.now()

		if (existing) {
			const newErrorRate =
				existing.errorRate * 0.9 + (success ? 0 : 1) * 0.1
			this.metrics.set(id, {
				...existing,
				lastFetch: now,
				fetchLatency: latency,
				errorRate: newErrorRate,
				connected: success,
				name,
			})
		} else {
			this.metrics.set(id, {
				id,
				name,
				lastFetch: now,
				fetchLatency: latency,
				errorRate: success ? 0 : 1,
				connected: success,
			})
		}
	}

	getMetric(id: string): DatasourceMetric | undefined {
		return this.metrics.get(id)
	}

	getAllMetrics(): DatasourceMetric[] {
		return Array.from(this.metrics.values())
	}

	getHealthStatus(id: string): 'healthy' | 'degraded' | 'critical' {
		const metric = this.metrics.get(id)
		if (!metric) return 'degraded'

		if (!metric.connected) return 'critical'
		if (metric.errorRate > 0.5) return 'critical'
		if (metric.errorRate > 0.2) return 'degraded'
		return 'healthy'
	}

	getLastFetchTime(id: string): string {
		const metric = this.metrics.get(id)
		if (!metric) return 'never'

		const seconds = Math.floor((Date.now() - metric.lastFetch) / 1000)
		if (seconds < 60) return `${seconds}s ago`
		if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
		return `${Math.floor(seconds / 3600)}h ago`
	}

	clear() {
		this.metrics.clear()
	}
}

export const metricsTracker = new MetricsTracker()
