import { describe, it, expect } from "vitest";
import {
	evaluateRules,
	createDefaultRules,
	formatAlertMessage,
	getSeverityColor,
} from "../alerts";
import type { DatasourceMetric, AlertRule } from "../../db/queries";

const createMetric = (
	latency: number = 100,
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

describe("Alert Rules", () => {
	it("creates default rules for a datasource", () => {
		const rules = createDefaultRules("test-ds");

		expect(rules.length).toBe(3);
		expect(rules[0].type).toBe("threshold");
		expect(rules[0].metric).toBe("latency");
		expect(rules[1].metric).toBe("errorRate");
		expect(rules[2].metric).toBe("connectivity");
	});

	it("evaluates latency threshold rule", () => {
		const metric = createMetric(6000); // 6 seconds
		const rules: AlertRule[] = [
			{
				id: "test-rule",
				datasourceId: "test-ds",
				type: "threshold",
				metric: "latency",
				threshold: 5000,
				enabled: true,
				acknowledgeable: true,
			} as any,
		];

		const alerts = evaluateRules(metric, rules);

		expect(alerts.length).toBeGreaterThan(0);
		expect(alerts[0].severity).toBe("high");
	});

	it("evaluates error rate threshold rule", () => {
		const metric = createMetric(100, 0.75); // 75% error rate
		const rules: AlertRule[] = [
			{
				id: "test-rule",
				datasourceId: "test-ds",
				type: "threshold",
				metric: "errorRate",
				threshold: 0.5,
				enabled: true,
				acknowledgeable: true,
			} as any,
		];

		const alerts = evaluateRules(metric, rules);

		expect(alerts.length).toBeGreaterThan(0);
	});

	it("evaluates connectivity rule", () => {
		const metric = createMetric(100, 0.1, false); // Disconnected
		const rules: AlertRule[] = [
			{
				id: "test-rule",
				datasourceId: "test-ds",
				type: "threshold",
				metric: "connectivity",
				enabled: true,
				acknowledgeable: true,
			} as any,
		];

		const alerts = evaluateRules(metric, rules);

		expect(alerts.length).toBeGreaterThan(0);
		expect(alerts[0].severity).toBe("critical");
	});

	it("ignores disabled rules", () => {
		const metric = createMetric(6000);
		const rules: AlertRule[] = [
			{
				id: "test-rule",
				datasourceId: "test-ds",
				type: "threshold",
				metric: "latency",
				threshold: 5000,
				enabled: false,
				acknowledgeable: true,
			} as any,
		];

		const alerts = evaluateRules(metric, rules);

		expect(alerts.length).toBe(0);
	});

	it("ignores rules for other datasources", () => {
		const metric = createMetric(6000);
		const rules: AlertRule[] = [
			{
				id: "test-rule",
				datasourceId: "other-ds",
				type: "threshold",
				metric: "latency",
				threshold: 5000,
				enabled: true,
				acknowledgeable: true,
			} as any,
		];

		const alerts = evaluateRules(metric, rules);

		expect(alerts.length).toBe(0);
	});

	it("formats alert messages with acknowledgement", () => {
		const alert = {
			id: "alert-1",
			ruleId: "rule-1",
			datasourceId: "test-ds",
			severity: "high" as const,
			message: "Latency threshold exceeded",
			value: 6000,
			timestamp: Date.now(),
			acknowledged: true,
			acknowledgedAt: Date.now(),
			"acknowledged By": "admin",
			resolved: false,
		};

		const formatted = formatAlertMessage(alert);
		expect(formatted).toContain("acknowledged");
		expect(formatted).toContain("admin");
	});

	it("formats resolved alerts", () => {
		const alert = {
			id: "alert-1",
			ruleId: "rule-1",
			datasourceId: "test-ds",
			severity: "high" as const,
			message: "Latency threshold exceeded",
			value: 6000,
			timestamp: Date.now(),
			acknowledged: false,
			resolved: true,
			resolvedAt: Date.now(),
		};

		const formatted = formatAlertMessage(alert);
		expect(formatted).toContain("[RESOLVED]");
	});

	it("returns correct severity colors", () => {
		expect(getSeverityColor("critical")).toBe("#dc2626");
		expect(getSeverityColor("high")).toBe("#ea580c");
		expect(getSeverityColor("medium")).toBe("#eab308");
		expect(getSeverityColor("low")).toBe("#3b82f6");
		expect(getSeverityColor("unknown")).toBe("#6b7280");
	});
});
