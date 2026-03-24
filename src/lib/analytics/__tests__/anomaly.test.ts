import { describe, it, expect } from "vitest";
import { detectAnomalies, detectThresholdViolation } from "../anomaly";
import type { DatasourceMetric } from "../../db/queries";

const createMetric = (
	latency: number,
	errorRate: number = 0.1,
	connected: boolean = true
): DatasourceMetric => ({
	id: "test-ds",
	name: "Test",
	lastFetch: Date.now(),
	fetchLatency: latency,
	errorRate,
	connected,
});

describe("Anomaly Detection", () => {
	it("detects anomalies using Z-score", () => {
		// Normal distribution with some outliers
		const metrics: DatasourceMetric[] = [
			createMetric(500), // Recent - outlier
			createMetric(100),
			createMetric(105),
			createMetric(110),
			createMetric(95),
			createMetric(100),
			createMetric(105),
		];

		const anomalies = detectAnomalies(metrics, "latency", 2);
		expect(anomalies.length).toBeGreaterThan(0);
		expect(anomalies[0].zScore).toBeGreaterThan(2);
	});

	it("returns empty array for insufficient data", () => {
		const metrics = [createMetric(100), createMetric(105)];
		const anomalies = detectAnomalies(metrics, "latency");
		expect(anomalies.length).toBe(0);
	});

	it("returns empty array for zero variance", () => {
		const metrics = Array(10)
			.fill(null)
			.map(() => createMetric(100));
		const anomalies = detectAnomalies(metrics, "latency");
		expect(anomalies.length).toBe(0);
	});

	it("detects threshold violations for latency", () => {
		const metric = createMetric(6000); // 6 seconds
		const alert = detectThresholdViolation(metric, {
			maxLatency: 5000, // 5 second threshold
		});

		expect(alert).not.toBeNull();
		expect(alert?.metric).toBe("latency");
		expect(alert?.severity).toBe("high");
	});

	it("detects critical severity for severe threshold violation", () => {
		const metric = createMetric(11000); // 11 seconds
		const alert = detectThresholdViolation(metric, {
			maxLatency: 5000, // 5 second threshold
		});

		expect(alert?.severity).toBe("critical");
	});

	it("detects threshold violations for error rate", () => {
		const metric = createMetric(100, 0.75); // 75% error rate
		const alert = detectThresholdViolation(metric, {
			maxErrorRate: 0.5, // 50% threshold
		});

		expect(alert).not.toBeNull();
		expect(alert?.metric).toBe("errorRate");
	});

	it("detects connectivity violations", () => {
		const metric = createMetric(100, 0.1, false); // Disconnected
		const alert = detectThresholdViolation(metric, {
			minConnectivity: 0,
		});

		expect(alert).not.toBeNull();
		expect(alert?.severity).toBe("critical");
	});

	it("returns null for no violations", () => {
		const metric = createMetric(100);
		const alert = detectThresholdViolation(metric, {
			maxLatency: 5000,
			maxErrorRate: 0.5,
		});

		expect(alert).toBeNull();
	});

	it("handles error rate anomalies", () => {
		// Normal error rates
		const metrics: DatasourceMetric[] = [
			createMetric(100, 0.8), // Recent - outlier
			createMetric(100, 0.05),
			createMetric(100, 0.05),
			createMetric(100, 0.05),
			createMetric(100, 0.05),
			createMetric(100, 0.05),
			createMetric(100, 0.05),
		];

		const anomalies = detectAnomalies(metrics, "errorRate", 2);
		expect(anomalies.length).toBeGreaterThan(0);
	});
});
