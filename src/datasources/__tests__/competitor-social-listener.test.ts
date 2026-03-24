/**
 * Test suite for Competitor Social Listener datasource
 * Tests social media change detection and monitoring
 */

import { describe, it, expect } from "vitest";
import {
	detectSocialChanges,
	generateStubSocialSnapshot,
	type SocialSnapshot,
} from "../competitor-social-listener";

/**
 * Mock social snapshot
 */
function createMockSocialSnapshot(
	overrides?: Partial<SocialSnapshot>
): SocialSnapshot {
	return {
		competitorId: "comp-1",
		platform: "twitter",
		handle: "@competitor",
		postCount: 5,
		engagementRate: 3.5,
		followerCount: 50000,
		followerGrowth: 100,
		avgPostLength: 240,
		sentiment: "neutral",
		snapshotDate: new Date(),
		lastUpdated: new Date(),
		...overrides,
	};
}

describe("Competitor Social Listener", () => {
	describe("Posting Frequency Detection", () => {
		it("detects posting spikes", () => {
			const today = [
				createMockSocialSnapshot({
					postCount: 20, // 4x normal posting
				}),
			];

			const yesterday = [
				createMockSocialSnapshot({
					postCount: 5,
				}),
			];

			const changes = detectSocialChanges(today, yesterday);
			const postChange = changes.find(
				(c) => c.metric === "posting_frequency"
			);

			expect(postChange).toBeDefined();
			expect(postChange?.change).toBe(15);
			expect(postChange?.severity).toBe("warning"); // >15 posts = warning
		});

		it("detects minor posting increases", () => {
			const today = [
				createMockSocialSnapshot({
					postCount: 8, // Slight increase
				}),
			];

			const yesterday = [
				createMockSocialSnapshot({
					postCount: 5,
				}),
			];

			const changes = detectSocialChanges(today, yesterday);
			const postChange = changes.find(
				(c) => c.metric === "posting_frequency"
			);

			expect(postChange).toBeDefined();
			expect(postChange?.severity).toBe("info");
		});

		it("ignores small posting variations (<5)", () => {
			const today = [
				createMockSocialSnapshot({
					postCount: 6, // Only +1
				}),
			];

			const yesterday = [
				createMockSocialSnapshot({
					postCount: 5,
				}),
			];

			const changes = detectSocialChanges(today, yesterday);
			const postChange = changes.find(
				(c) => c.metric === "posting_frequency"
			);

			expect(postChange).toBeUndefined();
		});
	});

	describe("Engagement Rate Detection", () => {
		it("detects engagement increase", () => {
			const today = [
				createMockSocialSnapshot({
					engagementRate: 5.5, // +2% engagement
				}),
			];

			const yesterday = [
				createMockSocialSnapshot({
					engagementRate: 3.5,
				}),
			];

			const changes = detectSocialChanges(today, yesterday);
			const engagementChange = changes.find(
				(c) => c.metric === "engagement_rate"
			);

			expect(engagementChange).toBeDefined();
			expect(engagementChange?.severity).toBe("warning");
		});

		it("detects high engagement increase", () => {
			const today = [
				createMockSocialSnapshot({
					engagementRate: 10, // +6% engagement (major)
				}),
			];

			const yesterday = [
				createMockSocialSnapshot({
					engagementRate: 4,
				}),
			];

			const changes = detectSocialChanges(today, yesterday);
			const engagementChange = changes.find(
				(c) => c.metric === "engagement_rate"
			);

			expect(engagementChange?.severity).toBe("warning");
		});

		it("detects engagement decrease", () => {
			const today = [
				createMockSocialSnapshot({
					engagementRate: 1, // -2.5% engagement
				}),
			];

			const yesterday = [
				createMockSocialSnapshot({
					engagementRate: 3.5,
				}),
			];

			const changes = detectSocialChanges(today, yesterday);
			const engagementChange = changes.find(
				(c) => c.metric === "engagement_rate"
			);

			expect(engagementChange?.severity).toBe("info");
		});

		it("ignores minor engagement variations (<2%)", () => {
			const today = [
				createMockSocialSnapshot({
					engagementRate: 3.8, // Only +0.3%
				}),
			];

			const yesterday = [
				createMockSocialSnapshot({
					engagementRate: 3.5,
				}),
			];

			const changes = detectSocialChanges(today, yesterday);
			const engagementChange = changes.find(
				(c) => c.metric === "engagement_rate"
			);

			expect(engagementChange).toBeUndefined();
		});
	});

	describe("Follower Growth Detection", () => {
		it("detects significant follower gains", () => {
			const today = [
				createMockSocialSnapshot({
					followerGrowth: 500, // 500 new followers
				}),
			];

			const yesterday = [
				createMockSocialSnapshot({
					followerGrowth: 100,
				}),
			];

			const changes = detectSocialChanges(today, yesterday);
			const followerChange = changes.find(
				(c) => c.metric === "follower_growth"
			);

			expect(followerChange).toBeDefined();
			expect(followerChange?.severity).toBe("warning"); // >500 = warning
		});

		it("detects moderate follower gains", () => {
			const today = [
				createMockSocialSnapshot({
					followerGrowth: 150, // 150 new followers
				}),
			];

			const yesterday = [
				createMockSocialSnapshot({
					followerGrowth: 100,
				}),
			];

			const changes = detectSocialChanges(today, yesterday);
			const followerChange = changes.find(
				(c) => c.metric === "follower_growth"
			);

			expect(followerChange).toBeDefined();
			expect(followerChange?.severity).toBe("info");
		});

		it("ignores small follower variations (<100)", () => {
			const today = [
				createMockSocialSnapshot({
					followerGrowth: 120, // Only +20
				}),
			];

			const yesterday = [
				createMockSocialSnapshot({
					followerGrowth: 100,
				}),
			];

			const changes = detectSocialChanges(today, yesterday);
			const followerChange = changes.find(
				(c) => c.metric === "follower_growth"
			);

			expect(followerChange).toBeUndefined();
		});
	});

	describe("Sentiment Detection", () => {
		it("detects sentiment shifts", () => {
			const today = [
				createMockSocialSnapshot({
					sentiment: "positive", // Changed from neutral
				}),
			];

			const yesterday = [
				createMockSocialSnapshot({
					sentiment: "neutral",
				}),
			];

			const changes = detectSocialChanges(today, yesterday);
			const sentimentChange = changes.find(
				(c) => c.metric === "sentiment"
			);

			expect(sentimentChange).toBeDefined();
			expect(sentimentChange?.severity).toBe("info");
		});

		it("ignores same sentiment", () => {
			const today = [
				createMockSocialSnapshot({
					sentiment: "neutral",
				}),
			];

			const yesterday = [
				createMockSocialSnapshot({
					sentiment: "neutral",
				}),
			];

			const changes = detectSocialChanges(today, yesterday);
			const sentimentChange = changes.find(
				(c) => c.metric === "sentiment"
			);

			expect(sentimentChange).toBeUndefined();
		});
	});

	describe("Multi-Platform Detection", () => {
		it("handles multiple platforms per competitor", () => {
			const today = [
				createMockSocialSnapshot({
					competitorId: "comp-1",
					platform: "twitter",
					postCount: 10,
				}),
				createMockSocialSnapshot({
					competitorId: "comp-1",
					platform: "linkedin",
					postCount: 8,
				}),
			];

			const yesterday = [
				createMockSocialSnapshot({
					competitorId: "comp-1",
					platform: "twitter",
					postCount: 5,
				}),
				createMockSocialSnapshot({
					competitorId: "comp-1",
					platform: "linkedin",
					postCount: 5,
				}),
			];

			const changes = detectSocialChanges(today, yesterday);

			// Should detect changes on both platforms
			expect(changes.length).toBeGreaterThanOrEqual(2);
			const twitterChange = changes.find(
				(c) => c.platform === "twitter"
			);
			const linkedinChange = changes.find(
				(c) => c.platform === "linkedin"
			);

			expect(twitterChange).toBeDefined();
			expect(linkedinChange).toBeDefined();
		});

		it("handles new platforms gracefully", () => {
			const today = [
				createMockSocialSnapshot({ platform: "twitter" }),
				createMockSocialSnapshot({
					platform: "bluesky",
					postCount: 10,
				}),
			];

			const yesterday = [
				createMockSocialSnapshot({ platform: "twitter" }),
				// bluesky not present yesterday
			];

			// Should not generate changes for new platforms (no baseline)
			const changes = detectSocialChanges(today, yesterday);
			const blueskeyChange = changes.find(
				(c) => c.platform === "bluesky"
			);

			expect(blueskeyChange).toBeUndefined();
		});
	});

	describe("Multi-Competitor Scenarios", () => {
		it("handles multiple competitors", () => {
			const today = [
				createMockSocialSnapshot({
					competitorId: "comp-1",
					postCount: 10,
				}),
				createMockSocialSnapshot({
					competitorId: "comp-2",
					postCount: 8,
				}),
			];

			const yesterday = [
				createMockSocialSnapshot({
					competitorId: "comp-1",
					postCount: 5,
				}),
				createMockSocialSnapshot({
					competitorId: "comp-2",
					postCount: 5,
				}),
			];

			const changes = detectSocialChanges(today, yesterday);

			// Should detect changes for both competitors
			const comp1Change = changes.find(
				(c) => c.competitorId === "comp-1"
			);
			const comp2Change = changes.find(
				(c) => c.competitorId === "comp-2"
			);

			expect(comp1Change).toBeDefined();
			expect(comp2Change).toBeDefined();
		});
	});

	describe("Stub Data Generation", () => {
		it("generates realistic post counts", () => {
			for (let i = 0; i < 10; i++) {
				const snapshot = generateStubSocialSnapshot(
					"comp-test",
					"twitter"
				);
				expect(snapshot.postCount).toBeGreaterThanOrEqual(1);
				expect(snapshot.postCount).toBeLessThanOrEqual(11);
			}
		});

		it("generates realistic engagement rates", () => {
			for (let i = 0; i < 10; i++) {
				const snapshot = generateStubSocialSnapshot(
					"comp-test",
					"twitter"
				);
				expect(snapshot.engagementRate).toBeGreaterThanOrEqual(1);
				expect(snapshot.engagementRate).toBeLessThanOrEqual(9);
			}
		});

		it("generates realistic follower counts", () => {
			for (let i = 0; i < 10; i++) {
				const snapshot = generateStubSocialSnapshot(
					"comp-test",
					"linkedin"
				);
				expect(snapshot.followerCount).toBeGreaterThanOrEqual(1000);
				expect(snapshot.followerCount).toBeLessThanOrEqual(101000);
			}
		});

		it("generates realistic follower growth", () => {
			for (let i = 0; i < 10; i++) {
				const snapshot = generateStubSocialSnapshot(
					"comp-test",
					"twitter"
				);
				expect(snapshot.followerGrowth).toBeGreaterThanOrEqual(0);
				expect(snapshot.followerGrowth).toBeLessThanOrEqual(200);
			}
		});

		it("sets appropriate handles per platform", () => {
			const twitter = generateStubSocialSnapshot(
				"acme",
				"twitter"
			);
			expect(twitter.handle).toMatch(/^@/); // Twitter handles start with @

			const linkedin = generateStubSocialSnapshot(
				"acme",
				"linkedin"
			);
			expect(linkedin.handle).not.toMatch(/^@/); // LinkedIn doesn't use @
		});
	});

	describe("Data Integrity", () => {
		it("preserves all required fields", () => {
			const snapshot = createMockSocialSnapshot();

			expect(snapshot).toHaveProperty("competitorId");
			expect(snapshot).toHaveProperty("platform");
			expect(snapshot).toHaveProperty("handle");
			expect(snapshot).toHaveProperty("postCount");
			expect(snapshot).toHaveProperty("engagementRate");
			expect(snapshot).toHaveProperty("followerCount");
			expect(snapshot).toHaveProperty("sentiment");
			expect(snapshot).toHaveProperty("snapshotDate");
		});

		it("maintains valid metric ranges", () => {
			const snapshot = createMockSocialSnapshot();

			expect(snapshot.postCount).toBeGreaterThanOrEqual(0);
			expect(snapshot.engagementRate).toBeGreaterThanOrEqual(0);
			expect(snapshot.followerCount).toBeGreaterThanOrEqual(0);
			expect(snapshot.followerGrowth).toBeGreaterThanOrEqual(0);
		});

		it("includes valid sentiment values", () => {
			const validSentiments = ["positive", "neutral", "negative"];

			for (let i = 0; i < 10; i++) {
				const snapshot = generateStubSocialSnapshot(
					"comp-test",
					"twitter"
				);
				expect(validSentiments).toContain(snapshot.sentiment);
			}
		});
	});
});
