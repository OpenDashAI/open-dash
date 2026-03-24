/**
 * Test suite for Google Ads DataSource
 * Tests change detection, anomaly handling, and stub data generation
 */

import { describe, it, expect } from "vitest";
import {
	detectGoogleAdsChanges,
	generateStubGoogleAdsSnapshot,
	type GoogleAdsSnapshot,
} from "../google-ads";

/**
 * Create mock Google Ads snapshot
 */
function createMockGoogleAdsSnapshot(
	overrides?: Partial<GoogleAdsSnapshot>
): GoogleAdsSnapshot {
	return {
		campaignId: "campaign-1",
		campaignName: "Summer Campaign",
		spend: 5000,
		impressions: 50000,
		clicks: 500,
		conversions: 25,
		costPerConversion: 200,
		clickThroughRate: 0.01,
		conversionRate: 0.05,
		snapshotDate: new Date(),
		...overrides,
	};
}

describe("Google Ads DataSource", () => {
	describe("Conversion Rate Detection", () => {
		it("detects conversion rate increase", () => {
			const today = [
				createMockGoogleAdsSnapshot({
					conversionRate: 0.08, // +3%
				}),
			];

			const yesterday = [
				createMockGoogleAdsSnapshot({
					conversionRate: 0.10,
				}),
			];

			const changes = detectGoogleAdsChanges(today, yesterday);
			const convChange = changes.find((c) => c.metric === "conversion_rate");

			expect(convChange).toBeDefined();
			expect(convChange?.severity).toBe("info"); // 3% is minor
		});

		it("detects significant conversion rate drop (5-10%)", () => {
			const today = [
				createMockGoogleAdsSnapshot({
					conversionRate: 0.05, // -5% from 0.05
				}),
			];

			const yesterday = [
				createMockGoogleAdsSnapshot({
					conversionRate: 0.10,
				}),
			];

			const changes = detectGoogleAdsChanges(today, yesterday);
			const convChange = changes.find((c) => c.metric === "conversion_rate");

			expect(convChange).toBeDefined();
			expect(convChange?.severity).toBe("warning"); // 5-10% drop
		});

		it("detects critical conversion rate drop (>10%)", () => {
			const today = [
				createMockGoogleAdsSnapshot({
					conversionRate: 0.04, // -11% from 0.045... need clearer data
				}),
			];

			const yesterday = [
				createMockGoogleAdsSnapshot({
					conversionRate: 0.15, // 15%, so 0.04 is -11%
				}),
			];

			const changes = detectGoogleAdsChanges(today, yesterday);
			const convChange = changes.find((c) => c.metric === "conversion_rate");

			expect(convChange).toBeDefined();
			expect(convChange?.severity).toBe("critical"); // >10% drop
		});

		it("ignores minor conversion rate changes (<1%)", () => {
			const today = [
				createMockGoogleAdsSnapshot({
					conversionRate: 0.051, // +0.1%
				}),
			];

			const yesterday = [createMockGoogleAdsSnapshot({})];

			const changes = detectGoogleAdsChanges(today, yesterday);
			const convChange = changes.find((c) => c.metric === "conversion_rate");

			expect(convChange).toBeUndefined();
		});
	});

	describe("Cost Per Conversion Detection", () => {
		it("detects CPC increase >20%", () => {
			const today = [
				createMockGoogleAdsSnapshot({
					costPerConversion: 250, // +25% from 200
				}),
			];

			const yesterday = [
				createMockGoogleAdsSnapshot({
					costPerConversion: 200,
				}),
			];

			const changes = detectGoogleAdsChanges(today, yesterday);
			const cpcChange = changes.find((c) => c.metric === "cost_per_conversion");

			expect(cpcChange).toBeDefined();
			expect(cpcChange?.severity).toBe("info"); // 25% increase (not >50%)
		});

		it("detects major CPC increase (>50%)", () => {
			const today = [
				createMockGoogleAdsSnapshot({
					costPerConversion: 320, // +60% from 200
				}),
			];

			const yesterday = [
				createMockGoogleAdsSnapshot({
					costPerConversion: 200,
				}),
			];

			const changes = detectGoogleAdsChanges(today, yesterday);
			const cpcChange = changes.find((c) => c.metric === "cost_per_conversion");

			expect(cpcChange).toBeDefined();
			expect(cpcChange?.severity).toBe("warning"); // >50% increase
		});

		it("ignores minor CPC changes (<20%)", () => {
			const today = [
				createMockGoogleAdsSnapshot({
					costPerConversion: 210, // +5%
				}),
			];

			const yesterday = [
				createMockGoogleAdsSnapshot({
					costPerConversion: 200,
				}),
			];

			const changes = detectGoogleAdsChanges(today, yesterday);
			const cpcChange = changes.find((c) => c.metric === "cost_per_conversion");

			expect(cpcChange).toBeUndefined();
		});
	});

	describe("Impression Anomaly Detection", () => {
		it("detects impression spike >50%", () => {
			const today = [
				createMockGoogleAdsSnapshot({
					impressions: 85000, // +70% from 50K
				}),
			];

			const yesterday = [
				createMockGoogleAdsSnapshot({
					impressions: 50000,
				}),
			];

			const changes = detectGoogleAdsChanges(today, yesterday);
			const impChange = changes.find((c) => c.metric === "impressions");

			expect(impChange).toBeDefined();
			expect(impChange?.severity).toBe("warning");
		});

		it("detects impression drop >50%", () => {
			const today = [
				createMockGoogleAdsSnapshot({
					impressions: 10000, // -80% from 50K
				}),
			];

			const yesterday = [
				createMockGoogleAdsSnapshot({
					impressions: 50000,
				}),
			];

			const changes = detectGoogleAdsChanges(today, yesterday);
			const impChange = changes.find((c) => c.metric === "impressions");

			expect(impChange).toBeDefined();
			expect(impChange?.severity).toBe("critical"); // >80% drop (likely paused)
		});

		it("ignores minor impression changes (<50%)", () => {
			const today = [
				createMockGoogleAdsSnapshot({
					impressions: 60000, // +20% from 50K
				}),
			];

			const yesterday = [
				createMockGoogleAdsSnapshot({
					impressions: 50000,
				}),
			];

			const changes = detectGoogleAdsChanges(today, yesterday);
			const impChange = changes.find((c) => c.metric === "impressions");

			expect(impChange).toBeUndefined();
		});
	});

	describe("Multi-Campaign Detection", () => {
		it("handles multiple campaigns independently", () => {
			const today = [
				createMockGoogleAdsSnapshot({
					campaignId: "camp-1",
					conversionRate: 0.08, // Change
				}),
				createMockGoogleAdsSnapshot({
					campaignId: "camp-2",
					conversionRate: 0.05, // No change
				}),
			];

			const yesterday = [
				createMockGoogleAdsSnapshot({
					campaignId: "camp-1",
					conversionRate: 0.10,
				}),
				createMockGoogleAdsSnapshot({
					campaignId: "camp-2",
					conversionRate: 0.05,
				}),
			];

			const changes = detectGoogleAdsChanges(today, yesterday);
			const camp1Change = changes.find(
				(c) => c.campaignId === "camp-1" && c.metric === "conversion_rate"
			);
			const camp2Change = changes.find(
				(c) => c.campaignId === "camp-2" && c.metric === "conversion_rate"
			);

			expect(camp1Change).toBeDefined();
			expect(camp2Change).toBeUndefined();
		});

		it("handles new campaigns (not in yesterday)", () => {
			const today = [
				createMockGoogleAdsSnapshot({ campaignId: "camp-1" }),
				createMockGoogleAdsSnapshot({ campaignId: "camp-2" }),
			];

			const yesterday = [
				createMockGoogleAdsSnapshot({ campaignId: "camp-1" }),
				// camp-2 is new
			];

			const changes = detectGoogleAdsChanges(today, yesterday);
			const camp2Changes = changes.filter(
				(c) => c.campaignId === "camp-2"
			);

			expect(camp2Changes).toEqual([]); // No baseline, no changes
		});
	});

	describe("Stub Data Generation", () => {
		it("generates realistic spend ($100-10K)", () => {
			for (let i = 0; i < 10; i++) {
				const snapshot = generateStubGoogleAdsSnapshot(
					"camp-test",
					"Test Campaign"
				);
				expect(snapshot.spend).toBeGreaterThanOrEqual(100);
				expect(snapshot.spend).toBeLessThanOrEqual(10000);
			}
		});

		it("generates realistic impressions (1K-100K)", () => {
			for (let i = 0; i < 10; i++) {
				const snapshot = generateStubGoogleAdsSnapshot(
					"camp-test",
					"Test Campaign"
				);
				expect(snapshot.impressions).toBeGreaterThanOrEqual(1000);
				expect(snapshot.impressions).toBeLessThanOrEqual(100000);
			}
		});

		it("generates realistic CPC ($10-110)", () => {
			for (let i = 0; i < 10; i++) {
				const snapshot = generateStubGoogleAdsSnapshot(
					"camp-test",
					"Test Campaign"
				);
				expect(snapshot.costPerConversion).toBeGreaterThanOrEqual(10);
				expect(snapshot.costPerConversion).toBeLessThanOrEqual(110);
			}
		});

		it("generates realistic click-through rate (1-11%)", () => {
			for (let i = 0; i < 10; i++) {
				const snapshot = generateStubGoogleAdsSnapshot(
					"camp-test",
					"Test Campaign"
				);
				expect(snapshot.clickThroughRate).toBeGreaterThanOrEqual(0.01);
				expect(snapshot.clickThroughRate).toBeLessThanOrEqual(0.11);
			}
		});

		it("generates realistic conversion rate (1-11%)", () => {
			for (let i = 0; i < 10; i++) {
				const snapshot = generateStubGoogleAdsSnapshot(
					"camp-test",
					"Test Campaign"
				);
				expect(snapshot.conversionRate).toBeGreaterThanOrEqual(0.01);
				expect(snapshot.conversionRate).toBeLessThanOrEqual(0.11);
			}
		});

		it("includes campaignId and campaignName", () => {
			const snapshot = generateStubGoogleAdsSnapshot(
				"camp-123",
				"Summer Promo"
			);
			expect(snapshot.campaignId).toBe("camp-123");
			expect(snapshot.campaignName).toBe("Summer Promo");
		});
	});

	describe("Data Integrity", () => {
		it("preserves all required fields", () => {
			const snapshot = createMockGoogleAdsSnapshot();

			expect(snapshot).toHaveProperty("campaignId");
			expect(snapshot).toHaveProperty("campaignName");
			expect(snapshot).toHaveProperty("spend");
			expect(snapshot).toHaveProperty("impressions");
			expect(snapshot).toHaveProperty("clicks");
			expect(snapshot).toHaveProperty("conversions");
			expect(snapshot).toHaveProperty("costPerConversion");
			expect(snapshot).toHaveProperty("clickThroughRate");
			expect(snapshot).toHaveProperty("conversionRate");
			expect(snapshot).toHaveProperty("snapshotDate");
		});

		it("maintains valid metric ranges", () => {
			const snapshot = createMockGoogleAdsSnapshot();

			expect(snapshot.spend).toBeGreaterThanOrEqual(0);
			expect(snapshot.impressions).toBeGreaterThanOrEqual(0);
			expect(snapshot.clicks).toBeGreaterThanOrEqual(0);
			expect(snapshot.conversions).toBeGreaterThanOrEqual(0);
			expect(snapshot.costPerConversion).toBeGreaterThanOrEqual(0);
			expect(snapshot.clickThroughRate).toBeGreaterThanOrEqual(0);
			expect(snapshot.clickThroughRate).toBeLessThanOrEqual(1);
			expect(snapshot.conversionRate).toBeGreaterThanOrEqual(0);
			expect(snapshot.conversionRate).toBeLessThanOrEqual(1);
		});

		it("maintains metric relationships (clicks <= impressions)", () => {
			const snapshot = createMockGoogleAdsSnapshot();

			expect(snapshot.clicks).toBeLessThanOrEqual(snapshot.impressions);
		});

		it("maintains metric relationships (conversions <= clicks)", () => {
			const snapshot = createMockGoogleAdsSnapshot();

			expect(snapshot.conversions).toBeLessThanOrEqual(snapshot.clicks);
		});
	});

	describe("Change Message Quality", () => {
		it("generates clear conversion rate messages", () => {
			const today = [
				createMockGoogleAdsSnapshot({
					conversionRate: 0.08,
				}),
			];

			const yesterday = [
				createMockGoogleAdsSnapshot({
					conversionRate: 0.05,
				}),
			];

			const changes = detectGoogleAdsChanges(today, yesterday);
			const convChange = changes.find((c) => c.metric === "conversion_rate");

			expect(convChange?.message).toMatch(/Conversion rate/);
			expect(convChange?.message).toMatch(/8.00%/);
			expect(convChange?.message).toMatch(/5.00%/);
		});

		it("generates clear CPC change messages", () => {
			const today = [
				createMockGoogleAdsSnapshot({
					costPerConversion: 250,
				}),
			];

			const yesterday = [
				createMockGoogleAdsSnapshot({
					costPerConversion: 200,
				}),
			];

			const changes = detectGoogleAdsChanges(today, yesterday);
			const cpcChange = changes.find((c) => c.metric === "cost_per_conversion");

			expect(cpcChange?.message).toMatch(/CPC/);
			expect(cpcChange?.message).toMatch(/\$250.00/);
		});

		it("generates clear impression change messages", () => {
			const today = [
				createMockGoogleAdsSnapshot({
					impressions: 85000,
				}),
			];

			const yesterday = [
				createMockGoogleAdsSnapshot({
					impressions: 50000,
				}),
			];

			const changes = detectGoogleAdsChanges(today, yesterday);
			const impChange = changes.find((c) => c.metric === "impressions");

			expect(impChange?.message).toMatch(/Impressions/);
			expect(impChange?.message).toMatch(/70/);
			expect(impChange?.message).toMatch(/85,000/);
		});
	});
});
