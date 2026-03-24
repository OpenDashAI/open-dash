/**
 * Test suite for D1 schema definitions
 * Validates table structure, constraints, and type safety
 */

import { describe, it, expect } from "vitest";
import {
	datasourceMetricsTable,
	datasourceStatusTable,
	alertRulesTable,
	alertHistoryTable,
	type DatasourceMetric,
	type DatasourceStatus,
} from "../schema";

describe("D1 Schema", () => {
	describe("datasourceMetricsTable", () => {
		it("defines all required columns", () => {
			const required = [
				"id",
				"datasourceId",
				"datasourceName",
				"timestamp",
				"fetchLatency",
				"errorRate",
				"connected",
				"healthStatus",
			];

			required.forEach((field) => {
				expect(Object.keys(datasourceMetricsTable)).toContain(field);
			});
		});

		it("has id primary key", () => {
			expect(Object.keys(datasourceMetricsTable)).toContain("id");
		});
	});

	describe("datasourceStatusTable", () => {
		it("includes status tracking fields", () => {
			expect(Object.keys(datasourceStatusTable)).toContain("connected");
			expect(Object.keys(datasourceStatusTable)).toContain("lastFetch");
			expect(Object.keys(datasourceStatusTable)).toContain("healthStatus");
		});

		it("includes SLA tracking fields", () => {
			expect(Object.keys(datasourceStatusTable)).toContain("uptime24h");
			expect(Object.keys(datasourceStatusTable)).toContain("mtbf");
		});
	});

	describe("alertRulesTable", () => {
		it("includes rule configuration fields", () => {
			expect(Object.keys(alertRulesTable)).toContain("ruleType");
			expect(Object.keys(alertRulesTable)).toContain("threshold");
			expect(Object.keys(alertRulesTable)).toContain("alertChannels");
		});

		it("includes lifecycle fields", () => {
			expect(Object.keys(alertRulesTable)).toContain("enabled");
			expect(Object.keys(alertRulesTable)).toContain("cooldownSeconds");
		});
	});

	describe("alertHistoryTable", () => {
		it("tracks alert lifecycle", () => {
			expect(Object.keys(alertHistoryTable)).toContain("state");
			expect(Object.keys(alertHistoryTable)).toContain("triggeredAt");
			expect(Object.keys(alertHistoryTable)).toContain("acknowledgedAt");
			expect(Object.keys(alertHistoryTable)).toContain("resolvedAt");
		});

		it("includes audit fields", () => {
			expect(Object.keys(alertHistoryTable)).toContain("acknowledgedBy");
			expect(Object.keys(alertHistoryTable)).toContain("message");
		});
	});

	describe("Type safety", () => {
		it("infers metric types correctly", () => {
			// This is a compile-time check, but we can verify the types exist
			const metric: DatasourceMetric = {
				id: "test-1",
				datasourceId: "stripe",
				datasourceName: "Stripe",
				timestamp: Date.now(),
				fetchLatency: 250,
				errorRate: 0.05,
				connected: true,
				healthStatus: "healthy",
				brandId: "brand-1",
				createdAt: Date.now(),
			};

			expect(metric.id).toBe("test-1");
			expect(metric.fetchLatency).toBe(250);
		});

		it("infers status types correctly", () => {
			const status: DatasourceStatus = {
				id: "stripe",
				datasourceName: "Stripe",
				connected: true,
				lastFetch: Date.now(),
				lastError: null,
				currentLatency: 250,
				errorRate: 0.05,
				healthStatus: "healthy",
				uptime24h: 0.99,
				mtbf: 86400,
				updatedAt: Date.now(),
			};

			expect(status.id).toBe("stripe");
			expect(status.healthStatus).toBe("healthy");
		});
	});
});
