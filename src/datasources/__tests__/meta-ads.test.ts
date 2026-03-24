/**
 * Test suite for Meta Ads DataSource
 * Tests change detection, anomaly handling, and stub data generation
 */

import { describe, it, expect } from "vitest";
import {
	detectMetaAdsChanges,
	generateStubMetaAdsSnapshot,
	type MetaAdsSnapshot,
} from "../meta-ads";

/**
 * Create mock Meta Ads snapshot
 */
function createMockMetaAdsSnapshot(
	overrides?: Partial<MetaAdsSnapshot>
): MetaAdsSnapshot {
	return {
		campaignId: "campaign-1",
		campaignName: "Summer Campaign",
		adAccountId: "act_123456789",
		spend: 5000,
		impressions: 50000,
		clicks: 500,
		actions: 25,
		costPerAction: 200,
		clickThroughRate: 0.01,
		actionRate: 0.05,
		snapshotDate: new Date(),
		...overrides,
	};
}

describe("Meta Ads DataSource", () => {
	describe("Action Rate Detection", () => {
		it("detects action rate increase", () => {
			const today = [
				createMockMetaAdsSnapshot({
					actionRate: 0.08,
				}),
			];

			const yesterday = [
				createMockMetaAdsSnapshot({
					actionRate: 0.05,
				}),
			];

			const changes = detectMetaAdsChanges(today, yesterday);
			const actionChange = changes.find(
				(c) => c.metric === "action_rate"
			);

			expect(actionChange).toBeDefined();
			expect(actionChange?.severity).toBe("info"); // 3% is minor
		});

		it("detects significant action rate drop (5-10%)", () => {
			const today = [
				createMockMetaAdsSnapshot({
					actionRate: 0.025,
				}),
			];

			const yesterday = [
				createMockMetaAdsSnapshot({
					actionRate: 0.10,
				}),
			];

			const changes = detectMetaAdsChanges(today, yesterday);
			const actionChange = changes.find(
				(c) => c.metric === "action_rate"
			);

			expect(actionChange).toBeDefined();
			expect(actionChange?.severity).toBe("warning"); // 7.5% drop
		});

		it("detects critical action rate drop (>10%)", () => {
			const today = [
				createMockMetaAdsSnapshot({
					actionRate: 0.04,
				}),
			];

			const yesterday = [
				createMockMetaAdsSnapshot({
					actionRate: 0.15,
				}),
			];

			const changes = detectMetaAdsChanges(today, yesterday);
			const actionChange = changes.find(
				(c) => c.metric === "action_rate"
			);

			expect(actionChange).toBeDefined();
			expect(actionChange?.severity).toBe("critical");
		});

		it("ignores minor action rate changes (<1%)", () => {
			const today = [
				createMockMetaAdsSnapshot({
					actionRate: 0.051,
				}),
			];

			const yesterday = [createMockMetaAdsSnapshot({})];

			const changes = detectMetaAdsChanges(today, yesterday);
			const actionChange = changes.find(
				(c) => c.metric === "action_rate"
			);

			expect(actionChange).toBeUndefined();
		});
	});

	describe("Cost Per Action Detection", () => {
		it("detects CPA increase >20%", () => {
			const today = [
				createMockMetaAdsSnapshot({
					costPerAction: 250,
				}),
			];

			const yesterday = [
				createMockMetaAdsSnapshot({
					costPerAction: 200,
				}),
			];

			const changes = detectMetaAdsChanges(today, yesterday);
			const cpaChange = changes.find((c) => c.metric === "cost_per_action");

			expect(cpaChange).toBeDefined();
			expect(cpaChange?.severity).toBe("info"); // 25% increase (not >50%)
		});

		it("detects major CPA increase (>50%)", () => {
			const today = [
				createMockMetaAdsSnapshot({
					costPerAction: 320,
				}),
			];

			const yesterday = [
				createMockMetaAdsSnapshot({
					costPerAction: 200,
				}),
			];

			const changes = detectMetaAdsChanges(today, yesterday);
			const cpaChange = changes.find((c) => c.metric === "cost_per_action");

			expect(cpaChange).toBeDefined();
			expect(cpaChange?.severity).toBe("warning");
		});

		it("ignores minor CPA changes (<20%)", () => {
			const today = [
				createMockMetaAdsSnapshot({
					costPerAction: 210,
				}),
			];

			const yesterday = [
				createMockMetaAdsSnapshot({
					costPerAction: 200,
				}),
			];

			const changes = detectMetaAdsChanges(today, yesterday);
			const cpaChange = changes.find((c) => c.metric === "cost_per_action");

			expect(cpaChange).toBeUndefined();
		});
	});

	describe("Impression Anomaly Detection", () => {
		it("detects impression spike >50%", () => {
			const today = [
				createMockMetaAdsSnapshot({
					impressions: 85000,
				}),
			];

			const yesterday = [
				createMockMetaAdsSnapshot({
					impressions: 50000,
				}),
			];

			const changes = detectMetaAdsChanges(today, yesterday);
			const impChange = changes.find((c) => c.metric === "impressions");

			expect(impChange).toBeDefined();
			expect(impChange?.severity).toBe("warning");
		});

		it("detects impression drop >50%", () => {
			const today = [
				createMockMetaAdsSnapshot({
					impressions: 10000,
				}),
			];

			const yesterday = [
				createMockMetaAdsSnapshot({
					impressions: 50000,
				}),
			];

			const changes = detectMetaAdsChanges(today, yesterday);
			const impChange = changes.find((c) => c.metric === "impressions");

			expect(impChange).toBeDefined();
			expect(impChange?.severity).toBe("critical");
		});

		it("ignores minor impression changes (<50%)", () => {
			const today = [
				createMockMetaAdsSnapshot({
					impressions: 60000,
				}),
			];

			const yesterday = [
				createMockMetaAdsSnapshot({
					impressions: 50000,
				}),
			];

			const changes = detectMetaAdsChanges(today, yesterday);
			const impChange = changes.find((c) => c.metric === "impressions");

			expect(impChange).toBeUndefined();
		});
	});

	describe("Multi-Campaign Detection", () => {
		it("handles multiple campaigns independently", () => {
			const today = [
				createMockMetaAdsSnapshot({
					campaignId: "camp-1",
					actionRate: 0.08,
				}),
				createMockMetaAdsSnapshot({
					campaignId: "camp-2",
					actionRate: 0.05,
				}),
			];

			const yesterday = [
				createMockMetaAdsSnapshot({
					campaignId: "camp-1",
					actionRate: 0.10,
				}),
				createMockMetaAdsSnapshot({
					campaignId: "camp-2",
					actionRate: 0.05,
				}),
			];

			const changes = detectMetaAdsChanges(today, yesterday);
			const camp1Change = changes.find(
				(c) => c.campaignId === "camp-1" && c.metric === "action_rate"
			);
			const camp2Change = changes.find(
				(c) => c.campaignId === "camp-2" && c.metric === "action_rate"
			);

			expect(camp1Change).toBeDefined();
			expect(camp2Change).toBeUndefined();
		});

		it("handles new campaigns (not in yesterday)", () => {
			const today = [
				createMockMetaAdsSnapshot({ campaignId: "camp-1" }),
				createMockMetaAdsSnapshot({ campaignId: "camp-2" }),
			];

			const yesterday = [
				createMockMetaAdsSnapshot({ campaignId: "camp-1" }),
			];

			const changes = detectMetaAdsChanges(today, yesterday);
			const camp2Changes = changes.filter(
				(c) => c.campaignId === "camp-2"
			);

			expect(camp2Changes).toEqual([]);
		});
	});

	describe("Stub Data Generation", () => {
		it("generates realistic spend ($100-10K)", () => {
			for (let i = 0; i < 10; i++) {
				const snapshot = generateStubMetaAdsSnapshot(
					"camp-test",
					"Test Campaign",
					"act_123456789"
				);
				expect(snapshot.spend).toBeGreaterThanOrEqual(100);
				expect(snapshot.spend).toBeLessThanOrEqual(10000);
			}
		});

		it("generates realistic impressions (1K-100K)", () => {
			for (let i = 0; i < 10; i++) {
				const snapshot = generateStubMetaAdsSnapshot(
					"camp-test",
					"Test Campaign",
					"act_123456789"
				);
				expect(snapshot.impressions).toBeGreaterThanOrEqual(1000);
				expect(snapshot.impressions).toBeLessThanOrEqual(100000);
			}
		});

		it("generates realistic CPA ($10-110)", () => {
			for (let i = 0; i < 10; i++) {
				const snapshot = generateStubMetaAdsSnapshot(
					"camp-test",
					"Test Campaign",
					"act_123456789"
				);
				expect(snapshot.costPerAction).toBeGreaterThanOrEqual(10);
				expect(snapshot.costPerAction).toBeLessThanOrEqual(110);
			}
		});

		it("generates realistic click-through rate (1-11%)", () => {
			for (let i = 0; i < 10; i++) {
				const snapshot = generateStubMetaAdsSnapshot(
					"camp-test",
					"Test Campaign",
					"act_123456789"
				);
				expect(snapshot.clickThroughRate).toBeGreaterThanOrEqual(0.01);
				expect(snapshot.clickThroughRate).toBeLessThanOrEqual(0.11);
			}
		});

		it("generates realistic action rate (1-11%)", () => {
			for (let i = 0; i < 10; i++) {
				const snapshot = generateStubMetaAdsSnapshot(
					"camp-test",
					"Test Campaign",
					"act_123456789"
				);
				expect(snapshot.actionRate).toBeGreaterThanOrEqual(0.01);
				expect(snapshot.actionRate).toBeLessThanOrEqual(0.11);
			}
		});

		it("includes campaignId, campaignName, and adAccountId", () => {
			const snapshot = generateStubMetaAdsSnapshot(
				"camp-123",
				"Summer Promo",
				"act_987654321"
			);
			expect(snapshot.campaignId).toBe("camp-123");
			expect(snapshot.campaignName).toBe("Summer Promo");
			expect(snapshot.adAccountId).toBe("act_987654321");
		});
	});

	describe("Data Integrity", () => {
		it("preserves all required fields", () => {
			const snapshot = createMockMetaAdsSnapshot();

			expect(snapshot).toHaveProperty("campaignId");
			expect(snapshot).toHaveProperty("campaignName");
			expect(snapshot).toHaveProperty("adAccountId");
			expect(snapshot).toHaveProperty("spend");
			expect(snapshot).toHaveProperty("impressions");
			expect(snapshot).toHaveProperty("clicks");
			expect(snapshot).toHaveProperty("actions");
			expect(snapshot).toHaveProperty("costPerAction");
			expect(snapshot).toHaveProperty("clickThroughRate");
			expect(snapshot).toHaveProperty("actionRate");
			expect(snapshot).toHaveProperty("snapshotDate");
		});

		it("maintains valid metric ranges", () => {
			const snapshot = createMockMetaAdsSnapshot();

			expect(snapshot.spend).toBeGreaterThanOrEqual(0);
			expect(snapshot.impressions).toBeGreaterThanOrEqual(0);
			expect(snapshot.clicks).toBeGreaterThanOrEqual(0);
			expect(snapshot.actions).toBeGreaterThanOrEqual(0);
			expect(snapshot.costPerAction).toBeGreaterThanOrEqual(0);
			expect(snapshot.clickThroughRate).toBeGreaterThanOrEqual(0);
			expect(snapshot.clickThroughRate).toBeLessThanOrEqual(1);
			expect(snapshot.actionRate).toBeGreaterThanOrEqual(0);
			expect(snapshot.actionRate).toBeLessThanOrEqual(1);
		});

		it("maintains metric relationships (clicks <= impressions)", () => {
			const snapshot = createMockMetaAdsSnapshot();

			expect(snapshot.clicks).toBeLessThanOrEqual(snapshot.impressions);
		});

		it("maintains metric relationships (actions <= clicks)", () => {
			const snapshot = createMockMetaAdsSnapshot();

			expect(snapshot.actions).toBeLessThanOrEqual(snapshot.clicks);
		});
	});

	describe("Change Message Quality", () => {
		it("generates clear action rate messages", () => {
			const today = [
				createMockMetaAdsSnapshot({
					actionRate: 0.08,
				}),
			];

			const yesterday = [
				createMockMetaAdsSnapshot({
					actionRate: 0.05,
				}),
			];

			const changes = detectMetaAdsChanges(today, yesterday);
			const actionChange = changes.find(
				(c) => c.metric === "action_rate"
			);

			expect(actionChange?.message).toMatch(/Action rate/);
			expect(actionChange?.message).toMatch(/8.00%/);
			expect(actionChange?.message).toMatch(/5.00%/);
		});

		it("generates clear CPA change messages", () => {
			const today = [
				createMockMetaAdsSnapshot({
					costPerAction: 250,
				}),
			];

			const yesterday = [
				createMockMetaAdsSnapshot({
					costPerAction: 200,
				}),
			];

			const changes = detectMetaAdsChanges(today, yesterday);
			const cpaChange = changes.find((c) => c.metric === "cost_per_action");

			expect(cpaChange?.message).toMatch(/CPA/);
			expect(cpaChange?.message).toMatch(/\$250.00/);
		});

		it("generates clear impression change messages", () => {
			const today = [
				createMockMetaAdsSnapshot({
					impressions: 85000,
				}),
			];

			const yesterday = [
				createMockMetaAdsSnapshot({
					impressions: 50000,
				}),
			];

			const changes = detectMetaAdsChanges(today, yesterday);
			const impChange = changes.find((c) => c.metric === "impressions");

			expect(impChange?.message).toMatch(/Impressions/);
			expect(impChange?.message).toMatch(/70/);
			expect(impChange?.message).toMatch(/85,000/);
		});
	});
});
