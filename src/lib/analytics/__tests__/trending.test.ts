import { describe, it, expect } from "vitest";
import {
	calculateMovingAverage,
	detectWeeklyPattern,
	analyzeTrending,
} from "../trending";
import type { DatasourceMetric } from "../../db/queries";

const createMetric = (
	latency: number,
	hoursAgo: number = 0
): DatasourceMetric => ({
	id: "test-ds",
	name: "Test",
	lastFetch: Date.now() - hoursAgo * 3600000,
	fetchLatency: latency,
	errorRate: 0.1,
	connected: true,
});

describe("Trending Analysis", () => {
	it("calculates moving average correctly", () => {
		const metrics = [
			createMetric(100, 0),
			createMetric(110, 1),
			createMetric(120, 2),
			createMetric(130, 3),
		];

		const avg = calculateMovingAverage(metrics, 4);
		expect(avg).toBeCloseTo(115, 0);
	});

	it("returns 0 for empty metrics", () => {
		const avg = calculateMovingAverage([], 7);
		expect(avg).toBe(0);
	});

	it("detects weekly patterns", () => {
		// Create metrics for multiple days
		const now = Date.now();
		const metrics: DatasourceMetric[] = [];

		// Monday to Sunday, consistent latency per day
		for (let day = 0; day < 14; day++) {
			const dayOfWeek = day % 7;
			const baseLatency = dayOfWeek === 5 ? 200 : 100; // Weekend higher

			for (let hour = 0; hour < 8; hour++) {
				metrics.push({
					id: "test",
					name: "Test",
					lastFetch: now - (13 - day) * 24 * 3600000 - hour * 3600000,
					fetchLatency: baseLatency + Math.random() * 10,
					errorRate: 0.05,
					connected: true,
				});
			}
		}

		const pattern = detectWeeklyPattern(metrics);
		expect(pattern).toBeGreaterThan(0.3); // Should detect some pattern
		expect(pattern).toBeLessThanOrEqual(1);
	});

	it("analyzes trending correctly", () => {
		const metrics = [
			createMetric(150, 0),
			createMetric(145, 1),
			createMetric(140, 2),
			createMetric(135, 3),
			createMetric(130, 4),
			createMetric(125, 5),
			createMetric(120, 6),
			createMetric(115, 7),
			createMetric(100, 8),
			createMetric(105, 10),
			createMetric(110, 12),
			createMetric(115, 14),
			createMetric(120, 16),
			createMetric(125, 18),
			createMetric(130, 20),
			createMetric(135, 22),
			createMetric(140, 24),
		];

		const analysis = analyzeTrending(metrics, "latency");

		expect(analysis.datasourceId).toBe("test-ds");
		expect(analysis.metric).toBe("latency");
		expect(analysis.current).toBe(150);
		expect(analysis.avg7h).toBeGreaterThan(0);
		expect(analysis.avg24h).toBeGreaterThan(0);
		expect(["improving", "stable", "degrading"]).toContain(analysis.trend);
		expect(analysis.samples).toBe(17);
	});

	it("identifies improving trend when 7h avg < 24h avg", () => {
		// Recent metrics are much better (lower latency)
		const metrics = [
			createMetric(50, 0), // Recent: low latency
			createMetric(60, 1),
			createMetric(70, 2),
			createMetric(80, 3),
			createMetric(90, 4),
			createMetric(100, 5),
			createMetric(110, 6),
			createMetric(200, 8), // Older: high latency
			createMetric(210, 10),
			createMetric(220, 12),
			createMetric(230, 14),
			createMetric(240, 16),
			createMetric(250, 18),
			createMetric(260, 20),
			createMetric(270, 22),
			createMetric(280, 24),
		];

		const analysis = analyzeTrending(metrics, "latency");
		expect(analysis.trend).toBe("improving");
	});

	it("identifies degrading trend when 7h avg > 24h avg", () => {
		// Recent metrics are much worse (higher latency)
		const metrics = [
			createMetric(250, 0), // Recent: high latency
			createMetric(240, 1),
			createMetric(230, 2),
			createMetric(220, 3),
			createMetric(210, 4),
			createMetric(200, 5),
			createMetric(190, 6),
			createMetric(100, 8), // Older: low latency
			createMetric(90, 10),
			createMetric(80, 12),
			createMetric(70, 14),
			createMetric(60, 16),
			createMetric(50, 18),
			createMetric(40, 20),
			createMetric(30, 22),
			createMetric(20, 24),
		];

		const analysis = analyzeTrending(metrics, "latency");
		expect(analysis.trend).toBe("degrading");
	});
});
