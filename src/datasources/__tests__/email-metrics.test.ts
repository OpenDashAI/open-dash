/**
 * Test suite for Email Metrics DataSource
 * Tests change detection, anomaly handling, and stub data generation
 */

import { describe, it, expect } from "vitest";
import {
	detectEmailMetricsChanges,
	generateStubEmailMetricsSnapshot,
	type EmailMetricsSnapshot,
} from "../email-metrics";

/**
 * Create mock email metrics snapshot
 */
function createMockEmailMetricsSnapshot(
	overrides?: Partial<EmailMetricsSnapshot>
): EmailMetricsSnapshot {
	return {
		campaignId: "campaign-1",
		campaignName: "Weekly Newsletter",
		provider: "mailchimp",
		listSize: 10000,
		subscribersAdded: 100,
		sendCount: 1,
		openCount: 3000,
		clickCount: 300,
		unsubscribeCount: 30,
		openRate: 0.3,
		clickRate: 0.1,
		unsubscribeRate: 0.003,
		snapshotDate: new Date(),
		...overrides,
	};
}

describe("Email Metrics DataSource", () => {
	describe("Unsubscribe Rate Detection", () => {
		it("detects unsubscribe rate spike (>=5%)", () => {
			const today = [
				createMockEmailMetricsSnapshot({
					unsubscribeRate: 0.054,
				}),
			];

			const yesterday = [
				createMockEmailMetricsSnapshot({
					unsubscribeRate: 0.003,
				}),
			];

			const changes = detectEmailMetricsChanges(today, yesterday);
			const unsubChange = changes.find(
				(c) => c.metric === "unsubscribe_rate"
			);

			expect(unsubChange).toBeDefined();
			expect(unsubChange?.severity).toBe("warning"); // 5.1% increase
		});

		it("detects critical unsubscribe rate spike (>10%)", () => {
			const today = [
				createMockEmailMetricsSnapshot({
					unsubscribeRate: 0.104,
				}),
			];

			const yesterday = [
				createMockEmailMetricsSnapshot({
					unsubscribeRate: 0.003,
				}),
			];

			const changes = detectEmailMetricsChanges(today, yesterday);
			const unsubChange = changes.find(
				(c) => c.metric === "unsubscribe_rate"
			);

			expect(unsubChange).toBeDefined();
			expect(unsubChange?.severity).toBe("critical"); // 10.1% increase
		});

		it("ignores minor unsubscribe rate changes (<5%)", () => {
			const today = [
				createMockEmailMetricsSnapshot({
					unsubscribeRate: 0.004,
				}),
			];

			const yesterday = [
				createMockEmailMetricsSnapshot({
					unsubscribeRate: 0.003,
				}),
			];

			const changes = detectEmailMetricsChanges(today, yesterday);
			const unsubChange = changes.find(
				(c) => c.metric === "unsubscribe_rate"
			);

			expect(unsubChange).toBeUndefined();
		});
	});

	describe("Open Rate Detection", () => {
		it("detects open rate increase", () => {
			const today = [
				createMockEmailMetricsSnapshot({
					openRate: 0.35,
				}),
			];

			const yesterday = [
				createMockEmailMetricsSnapshot({
					openRate: 0.3,
				}),
			];

			const changes = detectEmailMetricsChanges(today, yesterday);
			const openChange = changes.find((c) => c.metric === "open_rate");

			expect(openChange).toBeDefined();
			expect(openChange?.severity).toBe("info");
		});

		it("detects open rate drop (10-20%)", () => {
			const today = [
				createMockEmailMetricsSnapshot({
					openRate: 0.255,
				}),
			];

			const yesterday = [
				createMockEmailMetricsSnapshot({
					openRate: 0.3,
				}),
			];

			const changes = detectEmailMetricsChanges(today, yesterday);
			const openChange = changes.find((c) => c.metric === "open_rate");

			expect(openChange).toBeDefined();
			expect(openChange?.severity).toBe("warning"); // 15% drop
		});

		it("detects critical open rate drop (>20%)", () => {
			const today = [
				createMockEmailMetricsSnapshot({
					openRate: 0.15,
				}),
			];

			const yesterday = [
				createMockEmailMetricsSnapshot({
					openRate: 0.3,
				}),
			];

			const changes = detectEmailMetricsChanges(today, yesterday);
			const openChange = changes.find((c) => c.metric === "open_rate");

			expect(openChange).toBeDefined();
			expect(openChange?.severity).toBe("critical"); // 50% drop
		});

		it("ignores minor open rate changes (<10%)", () => {
			const today = [
				createMockEmailMetricsSnapshot({
					openRate: 0.303,
				}),
			];

			const yesterday = [
				createMockEmailMetricsSnapshot({
					openRate: 0.3,
				}),
			];

			const changes = detectEmailMetricsChanges(today, yesterday);
			const openChange = changes.find((c) => c.metric === "open_rate");

			expect(openChange).toBeUndefined();
		});
	});

	describe("Click Rate Detection", () => {
		it("detects click rate increase >20%", () => {
			const today = [
				createMockEmailMetricsSnapshot({
					clickRate: 0.125,
				}),
			];

			const yesterday = [
				createMockEmailMetricsSnapshot({
					clickRate: 0.1,
				}),
			];

			const changes = detectEmailMetricsChanges(today, yesterday);
			const clickChange = changes.find((c) => c.metric === "click_rate");

			expect(clickChange).toBeDefined();
			expect(clickChange?.severity).toBe("info"); // 25% increase (not >50%)
		});

		it("detects major click rate change (>50%)", () => {
			const today = [
				createMockEmailMetricsSnapshot({
					clickRate: 0.16,
				}),
			];

			const yesterday = [
				createMockEmailMetricsSnapshot({
					clickRate: 0.1,
				}),
			];

			const changes = detectEmailMetricsChanges(today, yesterday);
			const clickChange = changes.find((c) => c.metric === "click_rate");

			expect(clickChange).toBeDefined();
			expect(clickChange?.severity).toBe("warning"); // 60% increase
		});

		it("ignores minor click rate changes (<20%)", () => {
			const today = [
				createMockEmailMetricsSnapshot({
					clickRate: 0.104,
				}),
			];

			const yesterday = [
				createMockEmailMetricsSnapshot({
					clickRate: 0.1,
				}),
			];

			const changes = detectEmailMetricsChanges(today, yesterday);
			const clickChange = changes.find((c) => c.metric === "click_rate");

			expect(clickChange).toBeUndefined();
		});
	});

	describe("Subscriber Churn Detection", () => {
		it("detects subscriber list decline (>20%)", () => {
			const today = [
				createMockEmailMetricsSnapshot({
					listSize: 8000,
				}),
			];

			const yesterday = [
				createMockEmailMetricsSnapshot({
					listSize: 10000,
				}),
			];

			const changes = detectEmailMetricsChanges(today, yesterday);
			const listChange = changes.find((c) => c.metric === "list_size");

			expect(listChange).toBeDefined();
			expect(listChange?.severity).toBe("warning"); // 20% decline
		});

		it("detects critical subscriber list decline (>50%)", () => {
			const today = [
				createMockEmailMetricsSnapshot({
					listSize: 4000,
				}),
			];

			const yesterday = [
				createMockEmailMetricsSnapshot({
					listSize: 10000,
				}),
			];

			const changes = detectEmailMetricsChanges(today, yesterday);
			const listChange = changes.find((c) => c.metric === "list_size");

			expect(listChange).toBeDefined();
			expect(listChange?.severity).toBe("critical"); // 60% decline
		});

		it("ignores minor list size changes (<20%)", () => {
			const today = [
				createMockEmailMetricsSnapshot({
					listSize: 9800,
				}),
			];

			const yesterday = [
				createMockEmailMetricsSnapshot({
					listSize: 10000,
				}),
			];

			const changes = detectEmailMetricsChanges(today, yesterday);
			const listChange = changes.find((c) => c.metric === "list_size");

			expect(listChange).toBeUndefined();
		});
	});

	describe("Multi-Campaign Detection", () => {
		it("handles multiple campaigns independently", () => {
			const today = [
				createMockEmailMetricsSnapshot({
					campaignId: "camp-1",
					unsubscribeRate: 0.054,
				}),
				createMockEmailMetricsSnapshot({
					campaignId: "camp-2",
					unsubscribeRate: 0.003,
				}),
			];

			const yesterday = [
				createMockEmailMetricsSnapshot({
					campaignId: "camp-1",
					unsubscribeRate: 0.003,
				}),
				createMockEmailMetricsSnapshot({
					campaignId: "camp-2",
					unsubscribeRate: 0.003,
				}),
			];

			const changes = detectEmailMetricsChanges(today, yesterday);
			const camp1Change = changes.find(
				(c) => c.campaignId === "camp-1" && c.metric === "unsubscribe_rate"
			);
			const camp2Change = changes.find(
				(c) => c.campaignId === "camp-2" && c.metric === "unsubscribe_rate"
			);

			expect(camp1Change).toBeDefined();
			expect(camp2Change).toBeUndefined();
		});

		it("handles different email providers independently", () => {
			const today = [
				createMockEmailMetricsSnapshot({
					campaignId: "camp-1",
					provider: "mailchimp",
					unsubscribeRate: 0.054,
				}),
				createMockEmailMetricsSnapshot({
					campaignId: "camp-1",
					provider: "convertkit",
					unsubscribeRate: 0.003,
				}),
			];

			const yesterday = [
				createMockEmailMetricsSnapshot({
					campaignId: "camp-1",
					provider: "mailchimp",
					unsubscribeRate: 0.003,
				}),
				createMockEmailMetricsSnapshot({
					campaignId: "camp-1",
					provider: "convertkit",
					unsubscribeRate: 0.003,
				}),
			];

			const changes = detectEmailMetricsChanges(today, yesterday);
			const mailchimpChange = changes.find(
				(c) =>
					c.campaignId === "camp-1" &&
					c.metric === "unsubscribe_rate" &&
					c.message.includes("5.1")
			);

			expect(mailchimpChange).toBeDefined();
		});
	});

	describe("Stub Data Generation", () => {
		it("generates realistic list size (1K-50K)", () => {
			for (let i = 0; i < 10; i++) {
				const snapshot = generateStubEmailMetricsSnapshot(
					"camp-test",
					"Test Campaign",
					"mailchimp"
				);
				expect(snapshot.listSize).toBeGreaterThanOrEqual(1000);
				expect(snapshot.listSize).toBeLessThanOrEqual(50000);
			}
		});

		it("generates realistic open rate (10-50%)", () => {
			for (let i = 0; i < 10; i++) {
				const snapshot = generateStubEmailMetricsSnapshot(
					"camp-test",
					"Test Campaign",
					"mailchimp"
				);
				expect(snapshot.openRate).toBeGreaterThanOrEqual(0.1);
				expect(snapshot.openRate).toBeLessThanOrEqual(0.5);
			}
		});

		it("generates realistic click rate (1-16%)", () => {
			for (let i = 0; i < 10; i++) {
				const snapshot = generateStubEmailMetricsSnapshot(
					"camp-test",
					"Test Campaign",
					"mailchimp"
				);
				expect(snapshot.clickRate).toBeGreaterThanOrEqual(0.01);
				expect(snapshot.clickRate).toBeLessThanOrEqual(0.16);
			}
		});

		it("generates realistic unsubscribe rate (0.1-2.1%)", () => {
			for (let i = 0; i < 10; i++) {
				const snapshot = generateStubEmailMetricsSnapshot(
					"camp-test",
					"Test Campaign",
					"mailchimp"
				);
				expect(snapshot.unsubscribeRate).toBeGreaterThanOrEqual(0.001);
				expect(snapshot.unsubscribeRate).toBeLessThanOrEqual(0.021);
			}
		});

		it("includes all required fields", () => {
			const snapshot = generateStubEmailMetricsSnapshot(
				"camp-123",
				"Summer Newsletter",
				"convertkit"
			);
			expect(snapshot.campaignId).toBe("camp-123");
			expect(snapshot.campaignName).toBe("Summer Newsletter");
			expect(snapshot.provider).toBe("convertkit");
			expect(snapshot.listSize).toBeGreaterThan(0);
			expect(snapshot.openRate).toBeGreaterThan(0);
		});
	});

	describe("Data Integrity", () => {
		it("preserves all required fields", () => {
			const snapshot = createMockEmailMetricsSnapshot();

			expect(snapshot).toHaveProperty("campaignId");
			expect(snapshot).toHaveProperty("campaignName");
			expect(snapshot).toHaveProperty("provider");
			expect(snapshot).toHaveProperty("listSize");
			expect(snapshot).toHaveProperty("subscribersAdded");
			expect(snapshot).toHaveProperty("sendCount");
			expect(snapshot).toHaveProperty("openCount");
			expect(snapshot).toHaveProperty("clickCount");
			expect(snapshot).toHaveProperty("unsubscribeCount");
			expect(snapshot).toHaveProperty("openRate");
			expect(snapshot).toHaveProperty("clickRate");
			expect(snapshot).toHaveProperty("unsubscribeRate");
			expect(snapshot).toHaveProperty("snapshotDate");
		});

		it("maintains valid metric ranges", () => {
			const snapshot = createMockEmailMetricsSnapshot();

			expect(snapshot.listSize).toBeGreaterThanOrEqual(0);
			expect(snapshot.subscribersAdded).toBeGreaterThanOrEqual(0);
			expect(snapshot.openCount).toBeGreaterThanOrEqual(0);
			expect(snapshot.clickCount).toBeGreaterThanOrEqual(0);
			expect(snapshot.unsubscribeCount).toBeGreaterThanOrEqual(0);
			expect(snapshot.openRate).toBeGreaterThanOrEqual(0);
			expect(snapshot.openRate).toBeLessThanOrEqual(1);
			expect(snapshot.clickRate).toBeGreaterThanOrEqual(0);
			expect(snapshot.clickRate).toBeLessThanOrEqual(1);
			expect(snapshot.unsubscribeRate).toBeGreaterThanOrEqual(0);
			expect(snapshot.unsubscribeRate).toBeLessThanOrEqual(1);
		});

		it("maintains metric relationships (clicks <= opens)", () => {
			const snapshot = createMockEmailMetricsSnapshot();

			expect(snapshot.clickCount).toBeLessThanOrEqual(snapshot.openCount);
		});

		it("maintains metric relationships (opens <= sends)", () => {
			const snapshot = createMockEmailMetricsSnapshot();

			expect(snapshot.openCount).toBeLessThanOrEqual(snapshot.sendCount * snapshot.listSize);
		});
	});

	describe("Change Message Quality", () => {
		it("generates clear unsubscribe rate messages", () => {
			const today = [
				createMockEmailMetricsSnapshot({
					unsubscribeRate: 0.054,
				}),
			];

			const yesterday = [
				createMockEmailMetricsSnapshot({
					unsubscribeRate: 0.003,
				}),
			];

			const changes = detectEmailMetricsChanges(today, yesterday);
			const unsubChange = changes.find(
				(c) => c.metric === "unsubscribe_rate"
			);

			expect(unsubChange?.message).toMatch(/Unsubscribe rate/);
			expect(unsubChange?.message).toMatch(/5.10%/);
		});

		it("generates clear open rate messages", () => {
			const today = [
				createMockEmailMetricsSnapshot({
					openRate: 0.24,
				}),
			];

			const yesterday = [
				createMockEmailMetricsSnapshot({
					openRate: 0.3,
				}),
			];

			const changes = detectEmailMetricsChanges(today, yesterday);
			const openChange = changes.find((c) => c.metric === "open_rate");

			expect(openChange?.message).toMatch(/Open rate/);
			expect(openChange?.message).toMatch(/20.0%/);
			expect(openChange?.message).toMatch(/24.00%/);
		});

		it("generates clear click rate messages", () => {
			const today = [
				createMockEmailMetricsSnapshot({
					clickRate: 0.16,
				}),
			];

			const yesterday = [
				createMockEmailMetricsSnapshot({
					clickRate: 0.1,
				}),
			];

			const changes = detectEmailMetricsChanges(today, yesterday);
			const clickChange = changes.find((c) => c.metric === "click_rate");

			expect(clickChange?.message).toMatch(/Click rate/);
			expect(clickChange?.message).toMatch(/60.0%/);
		});

		it("generates clear churn messages", () => {
			const today = [
				createMockEmailMetricsSnapshot({
					listSize: 8000,
				}),
			];

			const yesterday = [
				createMockEmailMetricsSnapshot({
					listSize: 10000,
				}),
			];

			const changes = detectEmailMetricsChanges(today, yesterday);
			const listChange = changes.find((c) => c.metric === "list_size");

			expect(listChange?.message).toMatch(/Subscriber list/);
			expect(listChange?.message).toMatch(/20/);
			expect(listChange?.message).toMatch(/8,000/);
		});
	});
});
