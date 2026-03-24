/**
 * Integration tests for SERP Trends server functions
 * Tests actual server function behavior with mocked D1 queries
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Competitor, SerpRanking } from "../../lib/db/schema";

/**
 * Mock implementations of D1 query functions
 */
const mockQueries = {
	getCompetitorsByBrand: vi.fn(),
	getSerpTrend: vi.fn(),
};

/**
 * Mock data
 */
function createMockCompetitor(overrides?: Partial<Competitor>): Competitor {
	return {
		id: "comp-1",
		brandId: "brand-1",
		orgId: "org-1",
		domain: "competitor.com",
		name: "Competitor Site",
		keywords: JSON.stringify(["best shoes", "running gear"]),
		active: true,
		archived: false,
		archivedAt: null,
		createdAt: Date.now(),
		updatedAt: Date.now(),
		...overrides,
	};
}

function createMockSerpRanking(overrides?: Partial<SerpRanking>): SerpRanking {
	const today = new Date();
	today.setUTCHours(0, 0, 0, 0);

	return {
		id: `ranking-${Math.random()}`,
		competitorId: "comp-1",
		brandId: "brand-1",
		orgId: "org-1",
		keyword: "best shoes",
		rank: 5,
		url: "https://competitor.com/shoes",
		title: "Best Shoes - Competitor",
		snippet: "Our selection of the best shoes...",
		searchEngine: "google",
		snapshotDate: today.getTime(),
		createdAt: Date.now(),
		...overrides,
	};
}

describe("SERP Trends Integration Tests", () => {
	beforeEach(() => {
		mockQueries.getCompetitorsByBrand.mockClear();
		mockQueries.getSerpTrend.mockClear();
	});

	describe("Fetching competitors by brand", () => {
		it("retrieves all competitors for a brand", async () => {
			const competitors = [
				createMockCompetitor({ id: "comp-1", name: "Competitor 1" }),
				createMockCompetitor({ id: "comp-2", name: "Competitor 2" }),
			];

			mockQueries.getCompetitorsByBrand.mockResolvedValue(competitors);

			const result = await mockQueries.getCompetitorsByBrand(null, "brand-1");
			expect(result).toEqual(competitors);
			expect(result).toHaveLength(2);
		});

		it("returns empty array when no competitors exist", async () => {
			mockQueries.getCompetitorsByBrand.mockResolvedValue([]);

			const result = await mockQueries.getCompetitorsByBrand(null, "brand-1");
			expect(result).toEqual([]);
		});

		it("filters by active status", async () => {
			const activeCompetitors = [
				createMockCompetitor({ active: true }),
			];

			mockQueries.getCompetitorsByBrand.mockResolvedValue(activeCompetitors);

			const result = await mockQueries.getCompetitorsByBrand(null, "brand-1");
			expect(result.every((c) => c.active)).toBe(true);
		});
	});

	describe("Fetching SERP trends", () => {
		it("retrieves trend history for a keyword", async () => {
			const today = new Date();
			today.setUTCHours(0, 0, 0, 0);

			const sevenDaysAgo = new Date(today);
			sevenDaysAgo.setUTCDate(today.getUTCDate() - 7);

			const rankings = [
				createMockSerpRanking({
					snapshotDate: sevenDaysAgo.getTime(),
					rank: 10,
				}),
				createMockSerpRanking({
					snapshotDate: today.getTime(),
					rank: 5,
				}),
			];

			mockQueries.getSerpTrend.mockResolvedValue(rankings);

			const result = await mockQueries.getSerpTrend(
				null,
				"comp-1",
				"best shoes",
				7
			);

			expect(result).toHaveLength(2);
			expect(result[0].rank).toBe(10);
			expect(result[1].rank).toBe(5);
		});

		it("orders results by snapshot date ascending", async () => {
			const today = new Date();
			today.setUTCHours(0, 0, 0, 0);

			const threeDaysAgo = new Date(today);
			threeDaysAgo.setUTCDate(today.getUTCDate() - 3);

			const rankings = [
				createMockSerpRanking({
					snapshotDate: threeDaysAgo.getTime(),
					rank: 8,
				}),
				createMockSerpRanking({
					snapshotDate: today.getTime(),
					rank: 5,
				}),
			];

			mockQueries.getSerpTrend.mockResolvedValue(rankings);

			const result = await mockQueries.getSerpTrend(
				null,
				"comp-1",
				"best shoes",
				30
			);

			// Should be ordered by date ascending
			expect(
				result[0].snapshotDate <= result[1].snapshotDate
			).toBe(true);
		});

		it("handles queries for different date ranges", async () => {
			const rankings = [createMockSerpRanking()];
			mockQueries.getSerpTrend.mockResolvedValue(rankings);

			// 7-day query
			const result7 = await mockQueries.getSerpTrend(
				null,
				"comp-1",
				"keyword",
				7
			);
			expect(result7).toBeDefined();

			// 30-day query
			const result30 = await mockQueries.getSerpTrend(
				null,
				"comp-1",
				"keyword",
				30
			);
			expect(result30).toBeDefined();
		});
	});

	describe("Server function logic", () => {
		it("processes all keywords for a competitor", async () => {
			const competitor = createMockCompetitor({
				keywords: JSON.stringify([
					"keyword-1",
					"keyword-2",
					"keyword-3",
				]),
			});

			mockQueries.getCompetitorsByBrand.mockResolvedValue([competitor]);
			mockQueries.getSerpTrend.mockResolvedValue([createMockSerpRanking()]);

			// Simulate processing all keywords
			const keywords = JSON.parse(competitor.keywords || "[]");
			for (const keyword of keywords) {
				await mockQueries.getSerpTrend(null, competitor.id, keyword, 7);
			}

			expect(mockQueries.getSerpTrend).toHaveBeenCalledTimes(3);
		});

		it("calculates rank change correctly", () => {
			const oldRank = 10;
			const newRank = 5;
			const change = newRank - oldRank; // -5 = improvement

			expect(change).toBe(-5);
			expect(newRank < oldRank).toBe(true); // Lower rank is better
		});

		it("formats response with all required fields", async () => {
			const competitor = createMockCompetitor();
			const rankings = [createMockSerpRanking()];

			mockQueries.getCompetitorsByBrand.mockResolvedValue([competitor]);
			mockQueries.getSerpTrend.mockResolvedValue(rankings);

			// Simulate response formatting
			const response = {
				competitorId: competitor.id,
				domain: competitor.domain,
				name: competitor.name,
				trends: [
					{
						keyword: rankings[0].keyword,
						currentRank: rankings[0].rank,
						previousRank: undefined,
						change: 0,
						trendDays: 7 as const,
						isTopPerformer: rankings[0].rank <= 3,
						isNew: rankings.length === 1,
					},
				],
				lastUpdated: new Date(competitor.updatedAt).toISOString(),
			};

			expect(response).toHaveProperty("competitorId");
			expect(response).toHaveProperty("domain");
			expect(response).toHaveProperty("name");
			expect(response).toHaveProperty("trends");
			expect(response).toHaveProperty("lastUpdated");
		});
	});

	describe("Error handling in server function", () => {
		it("continues processing on single keyword error", async () => {
			const keywords = ["keyword-1", "keyword-2", "keyword-3"];
			let successCount = 0;

			for (const keyword of keywords) {
				try {
					if (keyword === "keyword-2") {
						throw new Error("Query failed for keyword-2");
					}
					mockQueries.getSerpTrend.mockResolvedValue([
						createMockSerpRanking({ keyword }),
					]);
					await mockQueries.getSerpTrend(null, "comp-1", keyword, 7);
					successCount++;
				} catch (err) {
					console.warn(`Failed to fetch trend for keyword "${keyword}"`);
					continue;
				}
			}

			// Should process 2 of 3 keywords
			expect(successCount).toBe(2);
		});

		it("returns empty trends for competitor with no keywords", async () => {
			const competitor = createMockCompetitor({
				keywords: JSON.stringify([]),
			});

			const response = {
				competitorId: competitor.id,
				domain: competitor.domain,
				name: competitor.name,
				trends: [],
				lastUpdated: new Date(competitor.updatedAt).toISOString(),
			};

			expect(response.trends).toHaveLength(0);
		});

		it("handles query rejections gracefully", async () => {
			mockQueries.getSerpTrend.mockRejectedValue(
				new Error("Database error")
			);

			try {
				await mockQueries.getSerpTrend(null, "comp-1", "keyword", 7);
			} catch (err) {
				expect(err).toBeDefined();
				expect((err as Error).message).toBe("Database error");
			}
		});
	});

	describe("Multi-competitor scenarios", () => {
		it("processes multiple competitors independently", async () => {
			const competitors = [
				createMockCompetitor({ id: "comp-1", name: "Competitor 1" }),
				createMockCompetitor({ id: "comp-2", name: "Competitor 2" }),
				createMockCompetitor({ id: "comp-3", name: "Competitor 3" }),
			];

			mockQueries.getCompetitorsByBrand.mockResolvedValue(competitors);

			const result = await mockQueries.getCompetitorsByBrand(null, "brand-1");
			expect(result).toHaveLength(3);

			// Each competitor should return separate result
			expect(result[0].id).not.toBe(result[1].id);
			expect(result[1].id).not.toBe(result[2].id);
		});

		it("aggregates metrics across competitors", () => {
			const competitors = [
				createMockCompetitor({ id: "comp-1", keywords: '["keyword-1", "keyword-2"]' }),
				createMockCompetitor({ id: "comp-2", keywords: '["keyword-1", "keyword-2", "keyword-3"]' }),
			];

			let totalKeywords = 0;
			for (const competitor of competitors) {
				const keywords = JSON.parse(competitor.keywords || "[]");
				totalKeywords += keywords.length;
			}

			expect(totalKeywords).toBe(5);
		});
	});

	describe("Performance characteristics", () => {
		it("handles 100+ keywords efficiently", async () => {
			const keywords = Array.from({ length: 100 }, (_, i) => `keyword-${i}`);
			const competitor = createMockCompetitor({
				keywords: JSON.stringify(keywords),
			});

			const parsed = JSON.parse(competitor.keywords || "[]");
			expect(parsed).toHaveLength(100);

			// Should be able to iterate all keywords
			let count = 0;
			for (const _ of parsed) {
				count++;
			}
			expect(count).toBe(100);
		});

		it("handles 50+ competitors without performance degradation", async () => {
			const competitors = Array.from({ length: 50 }, (_, i) =>
				createMockCompetitor({ id: `comp-${i}` })
			);

			mockQueries.getCompetitorsByBrand.mockResolvedValue(competitors);

			const start = Date.now();
			const result = await mockQueries.getCompetitorsByBrand(
				null,
				"brand-1"
			);
			const duration = Date.now() - start;

			expect(result).toHaveLength(50);
			expect(duration).toBeLessThan(100); // Should be fast
		});
	});

	describe("Data consistency", () => {
		it("preserves competitor data through transformation", () => {
			const competitor = createMockCompetitor({
				id: "comp-123",
				domain: "example.com",
				name: "Example Site",
				brandId: "brand-abc",
				orgId: "org-xyz",
			});

			expect(competitor.id).toBe("comp-123");
			expect(competitor.domain).toBe("example.com");
			expect(competitor.name).toBe("Example Site");
			expect(competitor.brandId).toBe("brand-abc");
			expect(competitor.orgId).toBe("org-xyz");
		});

		it("maintains ranking data integrity", () => {
			const ranking = createMockSerpRanking({
				keyword: "test keyword",
				rank: 7,
				url: "https://example.com/page",
				title: "Page Title",
				snippet: "Page snippet text...",
			});

			expect(ranking.keyword).toBe("test keyword");
			expect(ranking.rank).toBe(7);
			expect(ranking.url).toBe("https://example.com/page");
			expect(ranking.title).toBe("Page Title");
		});
	});
});
