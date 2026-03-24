import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MetricsTracker } from '../monitoring'

// Mock the query functions
vi.mock('../db/queries', () => ({
	initDb: vi.fn((db) => db),
	getLatestMetrics: vi.fn().mockResolvedValue([]),
	insertMetric: vi.fn().mockResolvedValue(undefined),
}))

describe('MetricsTracker (D1-based)', () => {
	let tracker: MetricsTracker
	let mockDb: any

	beforeEach(() => {
		tracker = new MetricsTracker()
		mockDb = { insert: vi.fn() }
	})

	it('initializes with D1 database', () => {
		const newTracker = new MetricsTracker(mockDb)
		expect(newTracker).toBeDefined()
	})

	it('returns undefined when not initialized', async () => {
		const uninitializedTracker = new MetricsTracker()
		const metric = await uninitializedTracker.getMetric('ds-1')
		expect(metric).toBeUndefined()
	})

	it('records fetch metrics asynchronously', async () => {
		tracker.initialize(mockDb)
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

		await tracker.recordFetch('ds-1', 'Database', 150, true)

		// recordFetch should complete without errors
		expect(consoleSpy).not.toHaveBeenCalled()
		consoleSpy.mockRestore()
	})

	it('logs error when recordFetch called without initialization', async () => {
		const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

		await tracker.recordFetch('ds-1', 'Database', 150, true)

		expect(consoleSpy).toHaveBeenCalledWith(
			'MetricsTracker not initialized with D1 database'
		)
		consoleSpy.mockRestore()
	})

	it('returns health status for uninitialized datasource as degraded', async () => {
		const health = await tracker.getHealthStatus('unknown')
		expect(health).toBe('degraded')
	})

	it('returns empty array for all metrics when not initialized', async () => {
		const uninitializedTracker = new MetricsTracker()
		const allMetrics = await uninitializedTracker.getAllMetrics()
		expect(allMetrics).toEqual([])
	})
})

describe('MetricsTracker (backward compatibility)', () => {
	it('returns "unknown" for last fetch time', () => {
		const tracker = new MetricsTracker()
		const lastFetch = tracker.getLastFetchTime('ds-1')
		expect(lastFetch).toBe('unknown')
	})

	it('has clear() method for cleanup', () => {
		const tracker = new MetricsTracker()
		// Should not throw
		expect(() => tracker.clear()).not.toThrow()
	})
})
