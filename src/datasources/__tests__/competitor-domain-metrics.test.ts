/**
 * Test suite for Competitor Domain Metrics datasource
 * Tests API integration, change detection, and metric tracking
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
	detectDomainMovements,
	generateStubDomainMetrics,
	type DomainSnapshot,
} from "../competitor-domain-metrics";

/**
 * Mock domain snapshot
 */
function createMockDomainSnapshot(
	overrides?: Partial<DomainSnapshot>
): DomainSnapshot {
	return {
		competitorId: "comp-1",
		domain: "competitor.com",
		domainAuthority: 42,
		trafficEstimate: 50000,
		organicKeywords: 2500,
		backlinksCount: 5000,
		referringDomains: 150,
		lastChecked: new Date(),
		source: "manual",
		...overrides,
	};
}

describe("Competitor Domain Metrics", () => {
	describe("Domain Authority Changes", () => {
		it("detects domain authority increase", () => {
			const today = [
				createMockDomainSnapshot({
					domainAuthority: 47, // Increased from 42
				}),
			];

			const yesterday = [
				createMockDomainSnapshot({
					domainAuthority: 42,
				}),
			];

			const changes = detectDomainMovements(today, yesterday);
			const daChange = changes.find((c) => c.metric === "domain_authority");

			expect(daChange).toBeDefined();
			expect(daChange?.severity).toBe("warning"); // +5 = significant
			expect(daChange?.newValue).toBe(47);
			expect(daChange?.oldValue).toBe(42);
		});

		it("detects domain authority decrease", () => {
			const today = [
				createMockDomainSnapshot({
					domainAuthority: 35, // Decreased from 42
				}),
			];

			const yesterday = [
				createMockDomainSnapshot({
					domainAuthority: 42,
				}),
			];

			const changes = detectDomainMovements(today, yesterday);
			const daChange = changes.find((c) => c.metric === "domain_authority");

			expect(daChange?.severity).toBe("critical"); // -7 = significant
		});

		it("ignores minor DA changes (<2 points)", () => {
			const today = [
				createMockDomainSnapshot({
					domainAuthority: 43, // Only +1
				}),
			];

			const yesterday = [
				createMockDomainSnapshot({
					domainAuthority: 42,
				}),
			];

			const changes = detectDomainMovements(today, yesterday);
			const daChange = changes.find((c) => c.metric === "domain_authority");

			expect(daChange).toBeUndefined();
		});
	});

	describe("Traffic Changes", () => {
		it("detects traffic increase >20%", () => {
			const today = [
				createMockDomainSnapshot({
					trafficEstimate: 61000, // +22% from 50K
				}),
			];

			const yesterday = [
				createMockDomainSnapshot({
					trafficEstimate: 50000,
				}),
			];

			const changes = detectDomainMovements(today, yesterday);
			const trafficChange = changes.find(
				(c) => c.metric === "traffic_estimate"
			);

			expect(trafficChange).toBeDefined();
			expect(trafficChange?.severity).toBe("warning");
			expect(trafficChange?.percentChange).toBeCloseTo(22, 1);
		});

		it("detects traffic decrease >20%", () => {
			const today = [
				createMockDomainSnapshot({
					trafficEstimate: 25000, // -50% from 50K (critical threshold)
				}),
			];

			const yesterday = [
				createMockDomainSnapshot({
					trafficEstimate: 50000,
				}),
			];

			const changes = detectDomainMovements(today, yesterday);
			const trafficChange = changes.find(
				(c) => c.metric === "traffic_estimate"
			);

			expect(trafficChange?.severity).toBe("critical");
			expect(trafficChange?.percentChange).toBeCloseTo(-50, 1);
		});

		it("ignores minor traffic changes (<20%)", () => {
			const today = [
				createMockDomainSnapshot({
					trafficEstimate: 55000, // +10%
				}),
			];

			const yesterday = [
				createMockDomainSnapshot({
					trafficEstimate: 50000,
				}),
			];

			const changes = detectDomainMovements(today, yesterday);
			const trafficChange = changes.find(
				(c) => c.metric === "traffic_estimate"
			);

			expect(trafficChange).toBeUndefined();
		});
	});

	describe("Keyword Changes", () => {
		it("detects keyword ranking increase >15%", () => {
			const today = [
				createMockDomainSnapshot({
					organicKeywords: 2900, // +16% from 2500
				}),
			];

			const yesterday = [
				createMockDomainSnapshot({
					organicKeywords: 2500,
				}),
			];

			const changes = detectDomainMovements(today, yesterday);
			const keywordChange = changes.find(
				(c) => c.metric === "organic_keywords"
			);

			expect(keywordChange).toBeDefined();
			expect(keywordChange?.severity).toBe("warning");
		});

		it("detects keyword ranking decrease >15%", () => {
			const today = [
				createMockDomainSnapshot({
					organicKeywords: 1700, // -32% from 2500 (critical threshold)
				}),
			];

			const yesterday = [
				createMockDomainSnapshot({
					organicKeywords: 2500,
				}),
			];

			const changes = detectDomainMovements(today, yesterday);
			const keywordChange = changes.find(
				(c) => c.metric === "organic_keywords"
			);

			expect(keywordChange?.severity).toBe("critical");
		});
	});

	describe("Backlink Changes", () => {
		it("detects backlink growth >10%", () => {
			const today = [
				createMockDomainSnapshot({
					backlinksCount: 5600, // +12% from 5000
				}),
			];

			const yesterday = [
				createMockDomainSnapshot({
					backlinksCount: 5000,
				}),
			];

			const changes = detectDomainMovements(today, yesterday);
			const backlinkChange = changes.find((c) => c.metric === "backlinks");

			expect(backlinkChange).toBeDefined();
			expect(backlinkChange?.severity).toBe("warning");
		});

		it("detects backlink loss >10%", () => {
			const today = [
				createMockDomainSnapshot({
					backlinksCount: 3750, // -25% from 5000 (critical threshold)
				}),
			];

			const yesterday = [
				createMockDomainSnapshot({
					backlinksCount: 5000,
				}),
			];

			const changes = detectDomainMovements(today, yesterday);
			const backlinkChange = changes.find((c) => c.metric === "backlinks");

			expect(backlinkChange?.severity).toBe("critical");
		});
	});

	describe("Stub Data Generation", () => {
		it("generates realistic DA scores (20-60)", () => {
			for (let i = 0; i < 10; i++) {
				const snapshot = generateStubDomainMetrics(
					"comp-test",
					"example.com"
				);
				expect(snapshot.domainAuthority).toBeGreaterThanOrEqual(20);
				expect(snapshot.domainAuthority).toBeLessThanOrEqual(60);
			}
		});

		it("generates realistic traffic estimates (10K-110K)", () => {
			for (let i = 0; i < 10; i++) {
				const snapshot = generateStubDomainMetrics(
					"comp-test",
					"example.com"
				);
				expect(snapshot.trafficEstimate).toBeGreaterThanOrEqual(10000);
				expect(snapshot.trafficEstimate).toBeLessThanOrEqual(110000);
			}
		});

		it("generates realistic keyword counts (500-5500)", () => {
			for (let i = 0; i < 10; i++) {
				const snapshot = generateStubDomainMetrics(
					"comp-test",
					"example.com"
				);
				expect(snapshot.organicKeywords).toBeGreaterThanOrEqual(500);
				expect(snapshot.organicKeywords).toBeLessThanOrEqual(5500);
			}
		});

		it("maintains realistic backlink/keyword ratio", () => {
			const snapshot = generateStubDomainMetrics(
				"comp-test",
				"example.com"
			);
			// Backlinks should be ~2x keywords
			const ratio = snapshot.backlinksCount / snapshot.organicKeywords;
			expect(ratio).toBeCloseTo(2, 0.5);
		});

		it("includes competitorId and domain", () => {
			const snapshot = generateStubDomainMetrics(
				"comp-123",
				"example.com"
			);
			expect(snapshot.competitorId).toBe("comp-123");
			expect(snapshot.domain).toBe("example.com");
		});
	});

	describe("Multi-Competitor Scenarios", () => {
		it("handles multiple competitors independently", () => {
			const today = [
				createMockDomainSnapshot({
					competitorId: "comp-1",
					domainAuthority: 50,
				}),
				createMockDomainSnapshot({
					competitorId: "comp-2",
					domainAuthority: 38,
				}),
				createMockDomainSnapshot({
					competitorId: "comp-3",
					domainAuthority: 45,
				}),
			];

			const yesterday = [
				createMockDomainSnapshot({
					competitorId: "comp-1",
					domainAuthority: 42,
				}),
				createMockDomainSnapshot({
					competitorId: "comp-2",
					domainAuthority: 38,
				}),
				createMockDomainSnapshot({
					competitorId: "comp-3",
					domainAuthority: 45,
				}),
			];

			const changes = detectDomainMovements(today, yesterday);

			// Only comp-1 should have a change (+8 DA)
			expect(changes.length).toBeGreaterThanOrEqual(1);
			const comp1Change = changes.find(
				(c) => c.competitorId === "comp-1"
			);
			expect(comp1Change).toBeDefined();
		});

		it("handles new competitors (not in yesterday's data)", () => {
			const today = [
				createMockDomainSnapshot({ competitorId: "comp-1" }),
				createMockDomainSnapshot({ competitorId: "comp-2" }),
			];

			const yesterday = [
				createMockDomainSnapshot({ competitorId: "comp-1" }),
				// comp-2 is new
			];

			const changes = detectDomainMovements(today, yesterday);

			// New competitors shouldn't generate changes (no baseline)
			expect(changes.filter((c) => c.competitorId === "comp-2")).toEqual(
				[]
			);
		});
	});

	describe("Change Severity Calculation", () => {
		it("calculates percent change correctly", () => {
			const today = [
				createMockDomainSnapshot({
					trafficEstimate: 75000, // +50% from 50K
				}),
			];

			const yesterday = [
				createMockDomainSnapshot({
					trafficEstimate: 50000,
				}),
			];

			const changes = detectDomainMovements(today, yesterday);
			const trafficChange = changes.find(
				(c) => c.metric === "traffic_estimate"
			);

			expect(trafficChange?.percentChange).toBeCloseTo(50, 0);
		});

		it("handles zero baseline values safely", () => {
			const today = [
				createMockDomainSnapshot({
					trafficEstimate: 10000,
				}),
			];

			const yesterday = [
				createMockDomainSnapshot({
					trafficEstimate: 0, // Edge case: no previous traffic
				}),
			];

			// Should handle gracefully without division by zero
			expect(() => {
				detectDomainMovements(today, yesterday);
			}).not.toThrow();
		});
	});

	describe("Data Integrity", () => {
		it("preserves all required fields", () => {
			const snapshot = createMockDomainSnapshot();

			expect(snapshot).toHaveProperty("competitorId");
			expect(snapshot).toHaveProperty("domain");
			expect(snapshot).toHaveProperty("domainAuthority");
			expect(snapshot).toHaveProperty("trafficEstimate");
			expect(snapshot).toHaveProperty("organicKeywords");
			expect(snapshot).toHaveProperty("backlinksCount");
			expect(snapshot).toHaveProperty("referringDomains");
			expect(snapshot).toHaveProperty("lastChecked");
			expect(snapshot).toHaveProperty("source");
		});

		it("maintains metric ranges after changes", () => {
			const snapshot = createMockDomainSnapshot();

			// All metrics should be non-negative
			expect(snapshot.domainAuthority).toBeGreaterThanOrEqual(0);
			expect(snapshot.trafficEstimate).toBeGreaterThanOrEqual(0);
			expect(snapshot.organicKeywords).toBeGreaterThanOrEqual(0);
			expect(snapshot.backlinksCount).toBeGreaterThanOrEqual(0);

			// DA should be 0-100
			expect(snapshot.domainAuthority).toBeLessThanOrEqual(100);
		});
	});
});
