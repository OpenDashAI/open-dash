/**
 * Test suite for GA4 DataSource
 * Tests change detection, anomaly handling, and stub data generation
 */

import { describe, it, expect } from "vitest";
import {
	detectGA4Changes,
	generateStubGA4Snapshot,
	type GA4Snapshot,
} from "../ga4";

/**
 * Create mock GA4 snapshot
 */
function createMockGA4Snapshot(
	overrides?: Partial<GA4Snapshot>
): GA4Snapshot {
	return {
		propertyId: "property-1",
		propertyName: "Main Website",
		organicSessions: 10000,
		organicUsers: 5000,
		bouncRate: 0.4,
		conversions: 100,
		conversionRate: 0.05,
		trafficBySource: {
			organic: 10000,
			paid: 3000,
			social: 2000,
			direct: 1000,
		},
		snapshotDate: new Date(),
		...overrides,
	};
}

describe("GA4 DataSource", () => {
	describe("Organic Sessions Detection", () => {
		it("detects organic session increase >50%", () => {
			const today = [
				createMockGA4Snapshot({
					organicSessions: 16000,
				}),
			];

			const yesterday = [
				createMockGA4Snapshot({
					organicSessions: 10000,
				}),
			];

			const changes = detectGA4Changes(today, yesterday);
			const sessionChange = changes.find(
				(c) => c.metric === "organic_sessions"
			);

			expect(sessionChange).toBeDefined();
			expect(sessionChange?.severity).toBe("warning"); // 60% increase
		});

		it("detects significant organic session drop (50-80%)", () => {
			const today = [
				createMockGA4Snapshot({
					organicSessions: 2500,
				}),
			];

			const yesterday = [
				createMockGA4Snapshot({
					organicSessions: 10000,
				}),
			];

			const changes = detectGA4Changes(today, yesterday);
			const sessionChange = changes.find(
				(c) => c.metric === "organic_sessions"
			);

			expect(sessionChange).toBeDefined();
			expect(sessionChange?.severity).toBe("warning"); // 75% drop
		});

		it("detects critical organic session drop (>80%)", () => {
			const today = [
				createMockGA4Snapshot({
					organicSessions: 1000,
				}),
			];

			const yesterday = [
				createMockGA4Snapshot({
					organicSessions: 10000,
				}),
			];

			const changes = detectGA4Changes(today, yesterday);
			const sessionChange = changes.find(
				(c) => c.metric === "organic_sessions"
			);

			expect(sessionChange).toBeDefined();
			expect(sessionChange?.severity).toBe("critical");
		});

		it("ignores minor session changes (<50%)", () => {
			const today = [
				createMockGA4Snapshot({
					organicSessions: 11000,
				}),
			];

			const yesterday = [
				createMockGA4Snapshot({
					organicSessions: 10000,
				}),
			];

			const changes = detectGA4Changes(today, yesterday);
			const sessionChange = changes.find(
				(c) => c.metric === "organic_sessions"
			);

			expect(sessionChange).toBeUndefined();
		});
	});

	describe("Bounce Rate Detection", () => {
		it("detects bounce rate spike (>30%)", () => {
			const today = [
				createMockGA4Snapshot({
					bouncRate: 0.72, // 72% (30% increase from 40%)
				}),
			];

			const yesterday = [
				createMockMetaAdsSnapshot({
					bouncRate: 0.4,
				}),
			];

			const changes = detectGA4Changes(today, yesterday);
			const bounceChange = changes.find((c) => c.metric === "bounce_rate");

			expect(bounceChange).toBeDefined();
			expect(bounceChange?.severity).toBe("warning");
		});

		it("detects critical bounce rate spike (>50%)", () => {
			const today = [
				createMockGA4Snapshot({
					bouncRate: 0.9,
				}),
			];

			const yesterday = [
				createMockGA4Snapshot({
					bouncRate: 0.4,
				}),
			];

			const changes = detectGA4Changes(today, yesterday);
			const bounceChange = changes.find((c) => c.metric === "bounce_rate");

			expect(bounceChange).toBeDefined();
			expect(bounceChange?.severity).toBe("critical");
		});

		it("ignores minor bounce rate changes (<30%)", () => {
			const today = [
				createMockGA4Snapshot({
					bouncRate: 0.48,
				}),
			];

			const yesterday = [
				createMockGA4Snapshot({
					bouncRate: 0.4,
				}),
			];

			const changes = detectGA4Changes(today, yesterday);
			const bounceChange = changes.find((c) => c.metric === "bounce_rate");

			expect(bounceChange).toBeUndefined();
		});
	});

	describe("Conversion Rate Detection", () => {
		it("detects conversion rate increase", () => {
			const today = [
				createMockGA4Snapshot({
					conversionRate: 0.08,
				}),
			];

			const yesterday = [
				createMockGA4Snapshot({
					conversionRate: 0.05,
				}),
			];

			const changes = detectGA4Changes(today, yesterday);
			const convChange = changes.find((c) => c.metric === "conversion_rate");

			expect(convChange).toBeDefined();
			expect(convChange?.severity).toBe("info");
		});

		it("detects significant conversion rate drop (5-10%)", () => {
			const today = [
				createMockGA4Snapshot({
					conversionRate: 0.025,
				}),
			];

			const yesterday = [
				createMockGA4Snapshot({
					conversionRate: 0.10,
				}),
			];

			const changes = detectGA4Changes(today, yesterday);
			const convChange = changes.find((c) => c.metric === "conversion_rate");

			expect(convChange).toBeDefined();
			expect(convChange?.severity).toBe("warning");
		});

		it("detects critical conversion rate drop (>10%)", () => {
			const today = [
				createMockGA4Snapshot({
					conversionRate: 0.04,
				}),
			];

			const yesterday = [
				createMockGA4Snapshot({
					conversionRate: 0.15,
				}),
			];

			const changes = detectGA4Changes(today, yesterday);
			const convChange = changes.find((c) => c.metric === "conversion_rate");

			expect(convChange).toBeDefined();
			expect(convChange?.severity).toBe("critical");
		});

		it("ignores minor conversion rate changes (<1%)", () => {
			const today = [
				createMockGA4Snapshot({
					conversionRate: 0.051,
				}),
			];

			const yesterday = [createMockGA4Snapshot({})];

			const changes = detectGA4Changes(today, yesterday);
			const convChange = changes.find((c) => c.metric === "conversion_rate");

			expect(convChange).toBeUndefined();
		});
	});

	describe("Multi-Property Detection", () => {
		it("handles multiple properties independently", () => {
			const today = [
				createMockGA4Snapshot({
					propertyId: "prop-1",
					conversionRate: 0.08,
				}),
				createMockGA4Snapshot({
					propertyId: "prop-2",
					conversionRate: 0.05,
				}),
			];

			const yesterday = [
				createMockGA4Snapshot({
					propertyId: "prop-1",
					conversionRate: 0.10,
				}),
				createMockGA4Snapshot({
					propertyId: "prop-2",
					conversionRate: 0.05,
				}),
			];

			const changes = detectGA4Changes(today, yesterday);
			const prop1Change = changes.find(
				(c) => c.propertyId === "prop-1" && c.metric === "conversion_rate"
			);
			const prop2Change = changes.find(
				(c) => c.propertyId === "prop-2" && c.metric === "conversion_rate"
			);

			expect(prop1Change).toBeDefined();
			expect(prop2Change).toBeUndefined();
		});

		it("handles new properties (not in yesterday)", () => {
			const today = [
				createMockGA4Snapshot({ propertyId: "prop-1" }),
				createMockGA4Snapshot({ propertyId: "prop-2" }),
			];

			const yesterday = [
				createMockGA4Snapshot({ propertyId: "prop-1" }),
			];

			const changes = detectGA4Changes(today, yesterday);
			const prop2Changes = changes.filter(
				(c) => c.propertyId === "prop-2"
			);

			expect(prop2Changes).toEqual([]);
		});
	});

	describe("Stub Data Generation", () => {
		it("generates realistic organic sessions (1K-50K)", () => {
			for (let i = 0; i < 10; i++) {
				const snapshot = generateStubGA4Snapshot(
					"prop-test",
					"Test Property"
				);
				expect(snapshot.organicSessions).toBeGreaterThanOrEqual(1000);
				expect(snapshot.organicSessions).toBeLessThanOrEqual(50000);
			}
		});

		it("generates realistic organic users (500-9.5K)", () => {
			for (let i = 0; i < 10; i++) {
				const snapshot = generateStubGA4Snapshot(
					"prop-test",
					"Test Property"
				);
				expect(snapshot.organicUsers).toBeGreaterThanOrEqual(500);
				expect(snapshot.organicUsers).toBeLessThanOrEqual(9500);
			}
		});

		it("generates realistic bounce rate (30-70%)", () => {
			for (let i = 0; i < 10; i++) {
				const snapshot = generateStubGA4Snapshot(
					"prop-test",
					"Test Property"
				);
				expect(snapshot.bouncRate).toBeGreaterThanOrEqual(0.3);
				expect(snapshot.bouncRate).toBeLessThanOrEqual(0.7);
			}
		});

		it("generates realistic conversion rate (1-9%)", () => {
			for (let i = 0; i < 10; i++) {
				const snapshot = generateStubGA4Snapshot(
					"prop-test",
					"Test Property"
				);
				expect(snapshot.conversionRate).toBeGreaterThanOrEqual(0.01);
				expect(snapshot.conversionRate).toBeLessThanOrEqual(0.09);
			}
		});

		it("includes traffic source breakdown", () => {
			const snapshot = generateStubGA4Snapshot(
				"prop-123",
				"Test Property"
			);
			expect(snapshot.trafficBySource).toHaveProperty("organic");
			expect(snapshot.trafficBySource).toHaveProperty("paid");
			expect(snapshot.trafficBySource).toHaveProperty("social");
			expect(snapshot.trafficBySource).toHaveProperty("direct");
		});

		it("includes propertyId and propertyName", () => {
			const snapshot = generateStubGA4Snapshot(
				"prop-123",
				"Main Website"
			);
			expect(snapshot.propertyId).toBe("prop-123");
			expect(snapshot.propertyName).toBe("Main Website");
		});
	});

	describe("Data Integrity", () => {
		it("preserves all required fields", () => {
			const snapshot = createMockGA4Snapshot();

			expect(snapshot).toHaveProperty("propertyId");
			expect(snapshot).toHaveProperty("propertyName");
			expect(snapshot).toHaveProperty("organicSessions");
			expect(snapshot).toHaveProperty("organicUsers");
			expect(snapshot).toHaveProperty("bouncRate");
			expect(snapshot).toHaveProperty("conversions");
			expect(snapshot).toHaveProperty("conversionRate");
			expect(snapshot).toHaveProperty("trafficBySource");
			expect(snapshot).toHaveProperty("snapshotDate");
		});

		it("maintains valid metric ranges", () => {
			const snapshot = createMockGA4Snapshot();

			expect(snapshot.organicSessions).toBeGreaterThanOrEqual(0);
			expect(snapshot.organicUsers).toBeGreaterThanOrEqual(0);
			expect(snapshot.bouncRate).toBeGreaterThanOrEqual(0);
			expect(snapshot.bouncRate).toBeLessThanOrEqual(1);
			expect(snapshot.conversions).toBeGreaterThanOrEqual(0);
			expect(snapshot.conversionRate).toBeGreaterThanOrEqual(0);
			expect(snapshot.conversionRate).toBeLessThanOrEqual(1);
		});

		it("maintains metric relationships (users <= sessions)", () => {
			const snapshot = createMockGA4Snapshot();

			expect(snapshot.organicUsers).toBeLessThanOrEqual(
				snapshot.organicSessions
			);
		});

		it("maintains metric relationships (conversions >= 0)", () => {
			const snapshot = createMockGA4Snapshot();

			expect(snapshot.conversions).toBeGreaterThanOrEqual(0);
		});
	});

	describe("Change Message Quality", () => {
		it("generates clear organic session messages", () => {
			const today = [
				createMockGA4Snapshot({
					organicSessions: 16000,
				}),
			];

			const yesterday = [
				createMockGA4Snapshot({
					organicSessions: 10000,
				}),
			];

			const changes = detectGA4Changes(today, yesterday);
			const sessionChange = changes.find(
				(c) => c.metric === "organic_sessions"
			);

			expect(sessionChange?.message).toMatch(/Organic sessions/);
			expect(sessionChange?.message).toMatch(/60/);
			expect(sessionChange?.message).toMatch(/16,000/);
		});

		it("generates clear bounce rate messages", () => {
			const today = [
				createMockGA4Snapshot({
					bouncRate: 0.72,
				}),
			];

			const yesterday = [
				createMockGA4Snapshot({
					bouncRate: 0.4,
				}),
			];

			const changes = detectGA4Changes(today, yesterday);
			const bounceChange = changes.find((c) => c.metric === "bounce_rate");

			expect(bounceChange?.message).toMatch(/Bounce rate/);
			expect(bounceChange?.message).toMatch(/72/);
		});

		it("generates clear conversion rate messages", () => {
			const today = [
				createMockGA4Snapshot({
					conversionRate: 0.08,
				}),
			];

			const yesterday = [
				createMockGA4Snapshot({
					conversionRate: 0.05,
				}),
			];

			const changes = detectGA4Changes(today, yesterday);
			const convChange = changes.find((c) => c.metric === "conversion_rate");

			expect(convChange?.message).toMatch(/Conversion rate/);
			expect(convChange?.message).toMatch(/8.00%/);
			expect(convChange?.message).toMatch(/5.00%/);
		});
	});
});

// Helper function (duplicate of createMockGA4Snapshot for bounce rate tests)
function createMockMetaAdsSnapshot(
	overrides?: Partial<GA4Snapshot>
): GA4Snapshot {
	return createMockGA4Snapshot(overrides);
}
