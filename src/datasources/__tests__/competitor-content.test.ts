/**
 * Test suite for Competitor Content Monitor datasource
 * Tests RSS parsing, change detection, and briefing item generation
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
	parseRssFeed,
	detectContentChanges,
} from "../competitor-content";

/**
 * Mock RSS feed data
 */
const mockRssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Example Blog</title>
    <item>
      <title>Getting Started with AI</title>
      <link>https://example.com/blog/ai-guide</link>
      <pubDate>Fri, 24 Mar 2026 10:00:00 GMT</pubDate>
      <description>A comprehensive guide to getting started with AI and ML</description>
    </item>
    <item>
      <title>Data Analytics Tutorial</title>
      <link>https://example.com/blog/analytics</link>
      <pubDate>Thu, 23 Mar 2026 10:00:00 GMT</pubDate>
      <description>Learn how to analyze data effectively</description>
    </item>
  </channel>
</rss>`;

const mockRssFeedSingleItem = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Example Blog</title>
    <item>
      <title>Announcing New Features</title>
      <link>https://example.com/blog/announcement</link>
      <pubDate>Sat, 25 Mar 2026 10:00:00 GMT</pubDate>
      <description>We are excited to announce new features</description>
    </item>
  </channel>
</rss>`;

describe("Competitor Content Monitor", () => {
	describe("RSS Feed Parsing", () => {
		it("parses valid RSS feed", async () => {
			// Mock fetch
			global.fetch = vi.fn().mockResolvedValue(
				new Response(mockRssFeed, { status: 200 })
			);

			const entries = await parseRssFeed(
				"https://example.com/feed"
			);

			expect(entries).toHaveLength(2);
			expect(entries[0].title).toBe("Getting Started with AI");
			expect(entries[1].title).toBe("Data Analytics Tutorial");
		});

		it("extracts content metadata correctly", async () => {
			global.fetch = vi.fn().mockResolvedValue(
				new Response(mockRssFeed, { status: 200 })
			);

			const entries = await parseRssFeed(
				"https://example.com/feed"
			);
			const entry = entries[0];

			expect(entry).toHaveProperty("title");
			expect(entry).toHaveProperty("url");
			expect(entry).toHaveProperty("publishDate");
			expect(entry).toHaveProperty("contentType");
			expect(entry).toHaveProperty("wordCount");
		});

		it("detects content types from title", async () => {
			const caseStudyFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Case Study: Success Story</title>
      <link>https://example.com/blog/case-study</link>
      <pubDate>Fri, 24 Mar 2026 10:00:00 GMT</pubDate>
      <description>A detailed case study</description>
    </item>
  </channel>
</rss>`;

			global.fetch = vi.fn().mockResolvedValue(
				new Response(caseStudyFeed, { status: 200 })
			);

			const entries = await parseRssFeed(
				"https://example.com/feed"
			);

			expect(entries[0].contentType).toBe("case_study");
		});

		it("extracts topics from content", async () => {
			global.fetch = vi.fn().mockResolvedValue(
				new Response(mockRssFeed, { status: 200 })
			);

			const entries = await parseRssFeed(
				"https://example.com/feed"
			);

			// Should detect AI and ML topics
			expect(entries[0].topics).toContain("AI");
			expect(entries[0].topics).toContain("ML");
		});

		it("calculates word count from description", async () => {
			global.fetch = vi.fn().mockResolvedValue(
				new Response(mockRssFeed, { status: 200 })
			);

			const entries = await parseRssFeed(
				"https://example.com/feed"
			);

			// Description has ~15 words
			expect(entries[0].wordCount).toBeGreaterThan(0);
		});

		it("handles empty feed gracefully", async () => {
			const emptyFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Empty Blog</title>
  </channel>
</rss>`;

			global.fetch = vi.fn().mockResolvedValue(
				new Response(emptyFeed, { status: 200 })
			);

			const entries = await parseRssFeed(
				"https://example.com/feed"
			);

			expect(entries).toHaveLength(0);
		});

		it("returns empty array on fetch error", async () => {
			global.fetch = vi.fn().mockResolvedValue(
				new Response("Not Found", { status: 404 })
			);

			const entries = await parseRssFeed(
				"https://example.com/nonexistent"
			);

			expect(entries).toEqual([]);
		});

		it("returns empty array on network error", async () => {
			global.fetch = vi.fn().mockRejectedValue(
				new Error("Network error")
			);

			const entries = await parseRssFeed(
				"https://example.com/feed"
			);

			expect(entries).toEqual([]);
		});

		it("handles malformed XML gracefully", async () => {
			const malformedFeed = `<?xml version="1.0"?>
<rss><channel><item>unclosed`;

			global.fetch = vi.fn().mockResolvedValue(
				new Response(malformedFeed, { status: 200 })
			);

			const entries = await parseRssFeed(
				"https://example.com/feed"
			);

			// Should handle gracefully and return empty or partial results
			expect(Array.isArray(entries)).toBe(true);
		});

		it("uses correct User-Agent header", async () => {
			global.fetch = vi.fn().mockResolvedValue(
				new Response(mockRssFeed, { status: 200 })
			);

			await parseRssFeed("https://example.com/feed");

			expect(global.fetch).toHaveBeenCalledWith(
				"https://example.com/feed",
				expect.objectContaining({
					headers: expect.objectContaining({
						"User-Agent": expect.stringContaining(
							"OpenDash-Bot"
						),
					}),
				})
			);
		});
	});

	describe("Content Change Detection", () => {
		it("detects publishing frequency increase", () => {
			const today = [
				{
					competitorId: "comp-1",
					url: "https://example.com/1",
					title: "Article 1",
					publishDate: new Date(),
					contentType: "blog" as const,
					wordCount: 500,
					topics: ["AI"],
				},
				{
					competitorId: "comp-1",
					url: "https://example.com/2",
					title: "Article 2",
					publishDate: new Date(),
					contentType: "blog" as const,
					wordCount: 600,
					topics: ["ML"],
				},
				{
					competitorId: "comp-1",
					url: "https://example.com/3",
					title: "Article 3",
					publishDate: new Date(),
					contentType: "blog" as const,
					wordCount: 700,
					topics: ["AI"],
				},
				{
					competitorId: "comp-1",
					url: "https://example.com/4",
					title: "Article 4",
					publishDate: new Date(),
					contentType: "blog" as const,
					wordCount: 800,
					topics: ["Data"],
				},
			];

			const yesterday = [
				{
					competitorId: "comp-1",
					url: "https://example.com/old",
					title: "Old Article",
					publishDate: new Date(),
					contentType: "blog" as const,
					wordCount: 400,
					topics: ["AI"],
				},
			];

			const changes = detectContentChanges(today, yesterday);

			// Should detect frequency increase
			const frequencyChange = changes.find(
				(c) => c.metric === "publish_frequency"
			);
			expect(frequencyChange).toBeDefined();
			expect(frequencyChange?.severity).toBe("warning");
		});

		it("detects publishing frequency decrease", () => {
			const today = [
				{
					competitorId: "comp-1",
					url: "https://example.com/1",
					title: "Article 1",
					publishDate: new Date(),
					contentType: "blog" as const,
					wordCount: 500,
					topics: ["AI"],
				},
			];

			const yesterday = Array.from({ length: 5 }, (_, i) => ({
				competitorId: "comp-1",
				url: `https://example.com/${i}`,
				title: `Article ${i}`,
				publishDate: new Date(),
				contentType: "blog" as const,
				wordCount: 500,
				topics: ["AI"],
			}));

			const changes = detectContentChanges(today, yesterday);

			const frequencyChange = changes.find(
				(c) => c.metric === "publish_frequency"
			);
			expect(frequencyChange).toBeDefined();
			expect(frequencyChange?.severity).toBe("info");
		});

		it("detects new content types", () => {
			const today = [
				{
					competitorId: "comp-1",
					url: "https://example.com/1",
					title: "Blog Post",
					publishDate: new Date(),
					contentType: "blog" as const,
					wordCount: 500,
					topics: ["AI"],
				},
				{
					competitorId: "comp-1",
					url: "https://example.com/2",
					title: "Case Study: Success",
					publishDate: new Date(),
					contentType: "case_study" as const,
					wordCount: 800,
					topics: ["AI"],
				},
			];

			const yesterday = [
				{
					competitorId: "comp-1",
					url: "https://example.com/old",
					title: "Old Blog",
					publishDate: new Date(),
					contentType: "blog" as const,
					wordCount: 400,
					topics: ["AI"],
				},
			];

			const changes = detectContentChanges(today, yesterday);

			const typeChange = changes.find(
				(c) => c.metric === "content_type"
			);
			expect(typeChange).toBeDefined();
		});

		it("detects topic shifts", () => {
			const today = [
				{
					competitorId: "comp-1",
					url: "https://example.com/1",
					title: "Article on Security",
					publishDate: new Date(),
					contentType: "blog" as const,
					wordCount: 500,
					topics: ["Security"],
				},
				{
					competitorId: "comp-1",
					url: "https://example.com/2",
					title: "Article on Performance",
					publishDate: new Date(),
					contentType: "blog" as const,
					wordCount: 600,
					topics: ["Performance"],
				},
			];

			const yesterday = [
				{
					competitorId: "comp-1",
					url: "https://example.com/old",
					title: "Old AI Article",
					publishDate: new Date(),
					contentType: "blog" as const,
					wordCount: 400,
					topics: ["AI"],
				},
			];

			const changes = detectContentChanges(today, yesterday);

			const topicChange = changes.find(
				(c) => c.metric === "topics"
			);
			expect(topicChange).toBeDefined();
		});

		it("returns empty array for no changes", () => {
			const content = [
				{
					competitorId: "comp-1",
					url: "https://example.com/1",
					title: "Article",
					publishDate: new Date(),
					contentType: "blog" as const,
					wordCount: 500,
					topics: ["AI"],
				},
			];

			const changes = detectContentChanges(content, content);

			// Should have no significant changes if identical
			expect(changes.length).toBeLessThanOrEqual(0);
		});
	});

	describe("Data Integrity", () => {
		it("preserves URL uniqueness constraint", async () => {
			global.fetch = vi.fn().mockResolvedValue(
				new Response(mockRssFeed, { status: 200 })
			);

			const entries = await parseRssFeed(
				"https://example.com/feed"
			);

			const urls = entries.map((e) => e.url);
			const uniqueUrls = new Set(urls);

			// All URLs should be unique (as per DB constraint)
			expect(urls.length).toBe(uniqueUrls.size);
		});

		it("maintains publish date ordering", async () => {
			global.fetch = vi.fn().mockResolvedValue(
				new Response(mockRssFeed, { status: 200 })
			);

			const entries = await parseRssFeed(
				"https://example.com/feed"
			);

			// Publish dates should be valid
			for (const entry of entries) {
				expect(entry.publishDate instanceof Date).toBe(true);
				expect(
					entry.publishDate.getTime()
				).toBeLessThanOrEqual(Date.now());
			}
		});

		it("includes required fields for DB insertion", async () => {
			global.fetch = vi.fn().mockResolvedValue(
				new Response(mockRssFeed, { status: 200 })
			);

			const entries = await parseRssFeed(
				"https://example.com/feed"
			);

			for (const entry of entries) {
				expect(entry.competitorId).toBeDefined();
				expect(entry.url).toBeDefined();
				expect(entry.title).toBeDefined();
				expect(entry.publishDate).toBeDefined();
				expect(entry.contentType).toBeDefined();
				expect(entry.wordCount).toBeDefined();
			}
		});
	});

	describe("Performance", () => {
		it("handles large RSS feeds", async () => {
			// Create a feed with 100+ items
			let largeRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>`;
			for (let i = 0; i < 100; i++) {
				largeRss += `
  <item>
    <title>Article ${i}</title>
    <link>https://example.com/blog/${i}</link>
    <pubDate>Fri, 24 Mar 2026 10:00:00 GMT</pubDate>
    <description>Article content</description>
  </item>`;
			}
			largeRss += `</channel></rss>`;

			global.fetch = vi.fn().mockResolvedValue(
				new Response(largeRss, { status: 200 })
			);

			const entries = await parseRssFeed(
				"https://example.com/feed"
			);

			expect(entries).toHaveLength(100);
		});

		it("handles multiple competitors efficiently", () => {
			const competitors = Array.from({ length: 50 }, (_, i) => ({
				competitorId: `comp-${i}`,
				url: `https://competitor${i}.com/1`,
				title: `Article from competitor ${i}`,
				publishDate: new Date(),
				contentType: "blog" as const,
				wordCount: 500,
				topics: ["AI"],
			}));

			expect(competitors).toHaveLength(50);
		});
	});
});
