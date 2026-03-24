import { describe, it, expect, beforeEach } from 'vitest'
import { metricsTracker } from '../monitoring'

describe('MetricsTracker', () => {
	beforeEach(() => {
		metricsTracker.clear()
	})

	it('records fetch metrics', () => {
		metricsTracker.recordFetch('ds-1', 'Database', 150, true)

		const metric = metricsTracker.getMetric('ds-1')
		expect(metric).toBeDefined()
		expect(metric?.id).toBe('ds-1')
		expect(metric?.name).toBe('Database')
		expect(metric?.fetchLatency).toBe(150)
		expect(metric?.connected).toBe(true)
	})

	it('tracks error rate', () => {
		// Successful fetch
		metricsTracker.recordFetch('ds-1', 'DB', 100, true)
		let metric = metricsTracker.getMetric('ds-1')
		expect(metric?.errorRate).toBe(0)

		// Failed fetch
		metricsTracker.recordFetch('ds-1', 'DB', 100, false)
		metric = metricsTracker.getMetric('ds-1')
		expect(metric?.errorRate).toBeGreaterThan(0)
		expect(metric?.errorRate).toBeLessThan(1)
	})

	it('updates last fetch timestamp', () => {
		const before = Date.now()
		metricsTracker.recordFetch('ds-1', 'DB', 100, true)
		const after = Date.now()

		const metric = metricsTracker.getMetric('ds-1')
		expect(metric?.lastFetch).toBeGreaterThanOrEqual(before)
		expect(metric?.lastFetch).toBeLessThanOrEqual(after)
	})

	it('determines health status correctly', () => {
		// Healthy: connected, no errors
		metricsTracker.recordFetch('healthy', 'DB', 50, true)
		expect(metricsTracker.getHealthStatus('healthy')).toBe('healthy')

		// Critical: disconnected
		metricsTracker.recordFetch('critical', 'DB', 100, false)
		expect(metricsTracker.getHealthStatus('critical')).toBe('critical')

		// Degraded: high error rate
		for (let i = 0; i < 3; i++) {
			metricsTracker.recordFetch('degraded', 'DB', 100, false)
		}
		expect(metricsTracker.getHealthStatus('degraded')).toBe('critical')
	})

	it('formats last fetch time correctly', () => {
		metricsTracker.recordFetch('ds-1', 'DB', 100, true)

		// Should be "0s ago" or "1s ago"
		const lastFetch = metricsTracker.getLastFetchTime('ds-1')
		expect(lastFetch).toMatch(/^\d+s ago$/)
	})

	it('returns "never" for unknown datasources', () => {
		const lastFetch = metricsTracker.getLastFetchTime('unknown')
		expect(lastFetch).toBe('never')
	})

	it('returns "degraded" for unknown datasources health', () => {
		const health = metricsTracker.getHealthStatus('unknown')
		expect(health).toBe('degraded')
	})

	it('returns all metrics', () => {
		metricsTracker.recordFetch('ds-1', 'DB1', 100, true)
		metricsTracker.recordFetch('ds-2', 'DB2', 200, true)

		const allMetrics = metricsTracker.getAllMetrics()
		expect(allMetrics.length).toBe(2)
		expect(allMetrics.map((m) => m.id)).toEqual(['ds-1', 'ds-2'])
	})

	it('clears all metrics', () => {
		metricsTracker.recordFetch('ds-1', 'DB', 100, true)
		expect(metricsTracker.getAllMetrics().length).toBe(1)

		metricsTracker.clear()
		expect(metricsTracker.getAllMetrics().length).toBe(0)
	})
})
