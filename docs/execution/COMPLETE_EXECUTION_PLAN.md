# Epic #27 Complete Execution Plan — Full Implementation, Zero Debt

**Mandate**: Implement every feature completely. Real APIs, full testing, architecture review.
**Timeline**: 12 days of focused work
**Quality Target**: Production-ready code, zero technical debt
**Launch Target**: Week 6 (ProductHunt)

---

## Implementation Checklist Template

For each feature, follow this pattern:

```
FEATURE: [Name]
EFFORT: [Hours]

PRE-IMPLEMENTATION:
  [ ] Get API keys (test + production)
  [ ] Read API documentation
  [ ] Understand rate limits & quotas
  [ ] Plan error handling strategy
  [ ] Design data schema (D1 migrations)

IMPLEMENTATION:
  [ ] Core logic (data fetching, parsing, storage)
  [ ] Error handling (rate limits, auth, timeouts)
  [ ] Logging & monitoring hooks
  [ ] Config/secrets management
  [ ] Documentation (inline + README)

TESTING:
  [ ] Unit tests (mocked API) — 100% coverage
  [ ] Integration tests (test env) — real API calls
  [ ] E2E tests (full flow) — user journey
  [ ] Error scenarios — quota, auth failure, timeout
  [ ] Load testing — concurrent requests

ARCHITECTURE REVIEW:
  [ ] Security review (API keys, webhooks, auth)
  [ ] Performance review (caching, connection pooling)
  [ ] Scalability review (rate limits, costs)
  [ ] Reliability review (retry logic, circuit breakers)
  [ ] Documentation review (clear, complete)

MERGE CRITERIA:
  [ ] All tests passing
  [ ] 0 critical security issues
  [ ] Architecture approved
  [ ] Code reviewed
  [ ] Performance acceptable (<500ms per call)
  [ ] Logging in place
  [ ] Monitoring configured
```

---

## Batch 1: Complete SERP Tracker (Days 1-2, 4 hours)

### Task 1.1: SERP D1 Wiring & Testing

**What**: Wire getSerpTrends() server function to real D1 queries. Full testing.

**Implementation**:
```typescript
// src/server/serp-trends.ts (COMPLETE)

// 1. Real D1 queries
export const getSerpTrends = createServerFn().handler(
  async (request: Request): Promise<SerpTrendData[]> => {
    const auth = getRequestAuthContext(request);
    const db = getWorkerDb();

    // Query real D1 data
    const competitors = await getCompetitorsByBrand(db, auth.brandId);
    const trends = await Promise.all(
      competitors.map(async (c) => {
        // 7-day trend
        const trend7 = await getSerpTrend(db, c.id, "*", 7);
        // 30-day trend
        const trend30 = await getSerpTrend(db, c.id, "*", 30);
        return { trend7, trend30 };
      })
    );

    return formatTrendsForUI(trends);
  }
);

// 2. Error handling
try {
  const trends = await getSerpTrends();
  if (!trends || trends.length === 0) {
    return { error: "No trends available", code: "NO_DATA" };
  }
} catch (err) {
  if (err instanceof D1Error) {
    // Handle D1-specific errors
    return { error: "Database error", code: "DB_ERROR" };
  }
  throw err;
}

// 3. Logging
logger.info("SERP trends fetched", { brandId: auth.brandId, count: trends.length });

// 4. Caching (prevent repeated queries)
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
```

**Testing**:
```typescript
// Unit tests (mocked D1)
describe("getSerpTrends", () => {
  test("returns trends for multiple competitors", async () => {
    const mockTrends = [{ competitorId: "c1", trends: [...] }];
    mockDb.getSerpTrend.mockResolvedValue(mockTrends);
    const result = await getSerpTrends();
    expect(result).toEqual(mockTrends);
  });

  test("handles empty trends gracefully", async () => {
    mockDb.getSerpTrend.mockResolvedValue([]);
    const result = await getSerpTrends();
    expect(result).toEqual([]);
  });

  test("logs errors appropriately", async () => {
    mockDb.getSerpTrend.mockRejectedValue(new Error("DB down"));
    expect(() => getSerpTrends()).rejects.toThrow();
  });
});

// Integration tests (real D1, test data)
describe("getSerpTrends (integration)", () => {
  let testBrand: Brand;
  let testCompetitor: Competitor;

  beforeAll(async () => {
    // Create test brand + competitor in D1
    testBrand = await createTestBrand(db);
    testCompetitor = await createTestCompetitor(db, testBrand.id);
    // Insert test SERP snapshots
    await insertTestSerpRankings(db, testCompetitor.id);
  });

  test("fetches real trends from D1", async () => {
    const trends = await getSerpTrends(testBrand.id);
    expect(trends).toHaveLength(1);
    expect(trends[0].currentRank).toBeGreaterThan(0);
  });

  test("calculates 7/30-day averages correctly", async () => {
    const trends = await getSerpTrends(testBrand.id);
    // Verify trend calculation logic
    expect(trends[0].trend7).toBeDefined();
    expect(trends[0].trend30).toBeDefined();
  });
});

// E2E tests (full component flow)
describe("SERP dashboard (E2E)", () => {
  test("loads and displays trends", async () => {
    const { getByText, getByTestId } = render(
      <SerpTrendingPanel brandId="test-brand" />
    );
    await waitFor(() => {
      expect(getByText(/SERP Rankings/)).toBeInTheDocument();
      expect(getByTestId("competitor-card")).toBeVisible();
    });
  });
});
```

**Architecture Review Checklist**:
- [ ] Query performance acceptable (<200ms for 10 competitors)
- [ ] Caching strategy prevents N+1 queries
- [ ] Error handling covers all D1 failure modes
- [ ] Logging includes request tracing
- [ ] Types are correct (BriefingItem schema matched)

**Effort**: 2-3 hours

**Deliverable**: SERP dashboard fully wired, tested, reviewed ✅

---

## Batch 2: Competitor Monitoring (Days 2-5, 24 hours)

### Task 2.1: ContentMonitorDataSource (5 hours)

**What**: Monitor competitor blogs, detect new content, publish frequency changes

**Implementation**:
```typescript
// src/datasources/content-monitor.ts

interface BlogPost {
  url: string;
  title: string;
  publishedDate: Date;
  wordCount: number;
  category?: string;
  summary?: string;
}

interface ContentSnapshot {
  competitorId: string;
  posts: BlogPost[];
  totalPostsThisWeek: number;
  avgPostsPerWeek: number;
  topicShift?: boolean;
  snapshotDate: Date;
}

export const contentMonitorSource: DataSource = {
  id: "content-monitor",
  name: "Content Updates",
  icon: "📝",
  requiresConfig: false,

  async fetch(config: DataSourceConfig): Promise<BriefingItem[]> {
    const auth = getRequestAuthContext(config.request);
    const db = getWorkerDb();

    const competitors = await getCompetitorsByBrand(db, auth.brandId);
    const items: BriefingItem[] = [];

    for (const competitor of competitors) {
      try {
        // Fetch RSS feeds
        const feeds = competitor.contentFeeds || [];
        const posts = await fetchBlogPosts(feeds);

        // Store snapshot
        const snapshot: ContentSnapshot = {
          competitorId: competitor.id,
          posts,
          totalPostsThisWeek: calculateThisWeek(posts),
          avgPostsPerWeek: calculateAverage(posts),
          snapshotDate: new Date(),
        };

        await storeContentSnapshot(db, snapshot);

        // Detect changes from yesterday
        const changes = await detectContentChanges(
          db,
          competitor.id,
          snapshot
        );

        // Generate briefing items
        if (changes.newPostCount > 0) {
          items.push({
            id: `content-${competitor.id}-new`,
            priority: changes.newPostCount > 3 ? "high" : "normal",
            category: "seo",
            title: `${competitor.name} published ${changes.newPostCount} posts`,
            detail: changes.topicsDetected
              ? `New topics: ${changes.topicsDetected.join(", ")}`
              : undefined,
            time: new Date().toISOString(),
            action: "View",
            actionUrl: `/competitor/${competitor.id}/content`,
          });
        }

        if (changes.frequencyAnomaly) {
          items.push({
            id: `content-${competitor.id}-frequency`,
            priority: "normal",
            category: "seo",
            title: `${competitor.name} content pace changed`,
            detail: `${changes.frequencyAnomaly.from}→${changes.frequencyAnomaly.to} posts/week`,
            time: new Date().toISOString(),
          });
        }
      } catch (err) {
        logger.error("Content monitoring failed for competitor", {
          competitorId: competitor.id,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return items;
  }
};

// Helper: Parse RSS feeds
async function fetchBlogPosts(feeds: string[]): Promise<BlogPost[]> {
  const posts: BlogPost[] = [];

  for (const feedUrl of feeds) {
    try {
      const response = await fetch(feedUrl, {
        timeout: 10000,
        headers: { "User-Agent": "OpenDash/1.0" },
      });

      if (!response.ok) {
        logger.warn("Feed fetch failed", { feedUrl, status: response.status });
        continue;
      }

      const text = await response.text();
      const parser = new XMLParser();
      const feed = parser.parse(text);

      // Handle both RSS and Atom formats
      const items = feed.rss?.channel?.item || feed.feed?.entry || [];

      for (const item of items) {
        posts.push({
          url: item.link || item.id,
          title: item.title,
          publishedDate: new Date(item.pubDate || item.published),
          wordCount: estimateWordCount(item.description || item.summary),
          category: extractCategory(item),
        });
      }
    } catch (err) {
      logger.error("RSS parsing failed", { feedUrl, error: String(err) });
    }
  }

  return posts;
}

// Helper: Detect changes from previous snapshot
async function detectContentChanges(
  db: D1Database,
  competitorId: string,
  current: ContentSnapshot
): Promise<{
  newPostCount: number;
  topicsDetected: string[];
  frequencyAnomaly?: { from: number; to: number };
}> {
  // Query yesterday's snapshot
  const yesterday = await db.prepare(
    `SELECT * FROM content_snapshots
     WHERE competitorId = ? AND snapshotDate >= ?
     ORDER BY snapshotDate DESC LIMIT 1`
  ).bind(competitorId, Date.now() - 24 * 60 * 60 * 1000).first();

  if (!yesterday) {
    return {
      newPostCount: current.totalPostsThisWeek,
      topicsDetected: [],
    };
  }

  const newPosts = current.posts.filter(
    p => !yesterday.postUrls.includes(p.url)
  );

  const frequencyChange = Math.abs(
    current.avgPostsPerWeek - yesterday.avgPostsPerWeek
  );

  return {
    newPostCount: newPosts.length,
    topicsDetected: extractNewTopics(newPosts),
    frequencyAnomaly: frequencyChange > 50
      ? { from: yesterday.avgPostsPerWeek, to: current.avgPostsPerWeek }
      : undefined,
  };
}
```

**Testing**:
```typescript
describe("ContentMonitorDataSource", () => {
  test("fetches and parses RSS feeds correctly", async () => {
    const mockFeed = `<?xml version="1.0"?>
      <rss><channel>
        <item><title>Post 1</title><link>http://example.com/1</link></item>
      </channel></rss>`;

    mockFetch.mockResolvedValueOnce(
      new Response(mockFeed, { status: 200 })
    );

    const posts = await fetchBlogPosts(["http://example.com/feed.xml"]);
    expect(posts).toHaveLength(1);
    expect(posts[0].title).toBe("Post 1");
  });

  test("handles feed fetch failures gracefully", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Timeout"));
    const posts = await fetchBlogPosts(["http://example.com/feed.xml"]);
    expect(posts).toEqual([]);
  });

  test("detects new content correctly", async () => {
    const current = {
      competitorId: "c1",
      totalPostsThisWeek: 5,
      posts: [...], // 5 posts
    };

    const yesterday = {
      totalPostsThisWeek: 2,
      postUrls: ["post1", "post2"],
    };

    const changes = await detectContentChanges(db, "c1", current);
    expect(changes.newPostCount).toBe(3);
  });

  test("generates briefing items for significant changes", async () => {
    const items = await contentMonitorSource.fetch({...});
    const newContentItem = items.find(i => i.id.includes("new"));
    expect(newContentItem?.priority).toBe("high");
  });
});
```

**Architecture Review**:
- [ ] RSS parsing handles both RSS 2.0 and Atom formats
- [ ] Feed timeouts prevent cascade failures (10s timeout)
- [ ] Change detection uses D1 for historical comparison
- [ ] Logging captures parse errors (for monitoring)
- [ ] Error handling doesn't block other competitors

**Effort**: 5 hours

---

### Task 2.2: DomainMetricsDataSource (4 hours)

**What**: Track domain authority, traffic, keyword metrics via SimilarWeb

**Implementation**:
```typescript
// src/datasources/domain-metrics.ts

interface DomainMetrics {
  competitorId: string;
  domain: string;
  domainAuthority: number;        // 0-100
  estimatedMonthlyVisitors: number;
  estimatedKeywords: number;
  trafficChange: number;          // % change from prev month
  topCountries: Array<{ country: string; pct: number }>;
  snapshotDate: Date;
}

async function fetchDomainMetricsFromAPI(
  domain: string,
  apiKey: string
): Promise<DomainMetrics> {
  // Use SimilarWeb API (or Ahrefs)
  const response = await fetch(
    `https://api.similarweb.com/v1/website/${domain}/overview?start_date=2026-01-01&end_date=2026-03-24&country=US&granularity=monthly&api_key=${apiKey}`,
    {
      timeout: 15000,
      headers: { "User-Agent": "OpenDash/1.0" },
    }
  );

  if (!response.ok) {
    if (response.status === 429) {
      throw new RateLimitError("SimilarWeb API rate limited");
    }
    if (response.status === 404) {
      throw new NotFoundError(`Domain not found: ${domain}`);
    }
    throw new Error(`SimilarWeb API error: ${response.status}`);
  }

  const data = await response.json();

  return {
    competitorId: data.website,
    domain,
    domainAuthority: data.authority_score || 0,
    estimatedMonthlyVisitors: data.visits.last_month || 0,
    estimatedKeywords: data.keywords_count || 0,
    trafficChange: calculateChange(data.visits),
    topCountries: data.countries_dist || [],
    snapshotDate: new Date(),
  };
}

export const domainMetricsSource: DataSource = {
  id: "domain-metrics",
  name: "Domain Metrics",
  icon: "🌐",
  requiresConfig: false,

  async fetch(config: DataSourceConfig): Promise<BriefingItem[]> {
    const apiKey = config.env.SIMILARWEB_API_KEY;
    if (!apiKey) {
      return [{
        id: "domain-metrics-no-key",
        priority: "normal",
        category: "status",
        title: "Domain Metrics - Setup Required",
        detail: "Set SIMILARWEB_API_KEY to enable domain tracking",
        time: new Date().toISOString(),
      }];
    }

    const auth = getRequestAuthContext(config.request);
    const db = getWorkerDb();
    const competitors = await getCompetitorsByBrand(db, auth.brandId);
    const items: BriefingItem[] = [];

    for (const competitor of competitors) {
      try {
        // Fetch with rate limit handling
        const metrics = await retryWithBackoff(
          () => fetchDomainMetricsFromAPI(competitor.domain, apiKey),
          { maxRetries: 3, baseDelay: 1000 }
        );

        // Store snapshot
        await storeDomainSnapshot(db, metrics);

        // Detect changes
        const previousMetrics = await getDomainSnapshot(
          db,
          competitor.id,
          7 // 7 days ago
        );

        if (previousMetrics) {
          const changes = {
            daChange: metrics.domainAuthority - previousMetrics.domainAuthority,
            trafficChange:
              (metrics.estimatedMonthlyVisitors - previousMetrics.estimatedMonthlyVisitors)
              / previousMetrics.estimatedMonthlyVisitors * 100,
            keywordChange: metrics.estimatedKeywords - previousMetrics.estimatedKeywords,
          };

          // Generate briefing items
          if (Math.abs(changes.daChange) >= 2) {
            items.push({
              id: `domain-da-${competitor.id}`,
              priority: changes.daChange > 0 ? "normal" : "high",
              category: "seo",
              title: `${competitor.name} DA ${changes.daChange > 0 ? "↑" : "↓"} ${Math.abs(changes.daChange).toFixed(1)}`,
              detail: `Now ${metrics.domainAuthority.toFixed(1)}`,
              time: new Date().toISOString(),
            });
          }

          if (Math.abs(changes.trafficChange) > 10) {
            items.push({
              id: `domain-traffic-${competitor.id}`,
              priority: changes.trafficChange > 0 ? "normal" : "high",
              category: "seo",
              title: `${competitor.name} traffic ${changes.trafficChange > 0 ? "↑" : "↓"} ${Math.abs(changes.trafficChange).toFixed(0)}%`,
              detail: `${metrics.estimatedMonthlyVisitors.toLocaleString()} monthly visitors`,
              time: new Date().toISOString(),
            });
          }
        }
      } catch (err) {
        if (err instanceof RateLimitError) {
          logger.warn("SimilarWeb rate limit hit");
          // Exponential backoff, try next competitor
          continue;
        } else if (err instanceof NotFoundError) {
          logger.warn("Domain not found in SimilarWeb", {
            domain: competitor.domain,
          });
        } else {
          logger.error("Domain metrics fetch failed", {
            competitorId: competitor.id,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }
    }

    return items;
  }
};

// Helper: Retry with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: { maxRetries: number; baseDelay: number }
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < options.maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err as Error;
      const delay = options.baseDelay * Math.pow(2, i);
      logger.debug("Retry after backoff", { delay, attempt: i + 1 });
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error("Retry failed");
}
```

**Testing**:
```typescript
describe("DomainMetricsDataSource", () => {
  test("fetches metrics from SimilarWeb API", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({
        authority_score: 45,
        visits: { last_month: 100000 },
        keywords_count: 5000,
      }), { status: 200, headers: { "Content-Type": "application/json" } })
    );

    const metrics = await fetchDomainMetricsFromAPI("example.com", "test-key");
    expect(metrics.domainAuthority).toBe(45);
    expect(metrics.estimatedMonthlyVisitors).toBe(100000);
  });

  test("handles rate limiting with backoff", async () => {
    mockFetch.mockRejectedValueOnce(new Error("429 Too Many Requests"));
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ authority_score: 45 }), { status: 200 })
    );

    const metrics = await retryWithBackoff(
      () => fetchDomainMetricsFromAPI("example.com", "test-key"),
      { maxRetries: 2, baseDelay: 100 }
    );

    expect(metrics.domainAuthority).toBe(45);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  test("generates alerts for significant changes", async () => {
    const items = await domainMetricsSource.fetch({...});
    const daChangeItem = items.find(i => i.id.includes("da-change"));
    expect(daChangeItem?.priority).toBe("high"); // If DA dropped
  });

  test("handles missing domain gracefully", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 404 })
    );

    const items = await domainMetricsSource.fetch({...});
    // Should not crash, should log warning
    expect(items).toBeDefined();
  });
});
```

**Architecture Review**:
- [ ] Rate limiting handled with exponential backoff
- [ ] API key not exposed in logs
- [ ] Error handling distinguishes between temporary and permanent failures
- [ ] Change threshold prevents alert fatigue (2 DA point minimum)
- [ ] D1 queries for historical comparison are indexed

**Effort**: 4 hours

---

## Batch 3: Campaign Metrics (Days 5-8, 24 hours)

### Task 3.1: GoogleAdsDataSource (6 hours)

**What**: Fetch Google Ads campaign performance (real API integration)

**Implementation**:
```typescript
// src/datasources/google-ads.ts

import { GoogleAdsApi } from "google-ads-api";

interface GoogleAdsSnapshot {
  campaignId: string;
  campaignName: string;
  spend: number;           // in cents
  impressions: number;
  clicks: number;
  conversions: number;
  costPerConversion: number;
  clickThroughRate: number; // 0-1
  conversionRate: number;   // 0-1
  snapshotDate: Date;
}

async function fetchGoogleAdsData(
  accessToken: string,
  customerId: string
): Promise<GoogleAdsSnapshot[]> {
  const client = new GoogleAdsApi({
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
    client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
  });

  const customer = client.Customer({
    customer_id: customerId,
    login_customer_id: process.env.GOOGLE_ADS_MANAGER_ID,
  });

  try {
    const report = await customer.report({
      entity: "campaign",
      attributes: [
        "campaign.id",
        "campaign.name",
        "metrics.cost_micros",
        "metrics.impressions",
        "metrics.clicks",
        "metrics.conversions",
        "metrics.cost_per_conversion",
        "metrics.ctr",
        "metrics.conversion_rate",
      ],
      constraints: {
        "campaign.status": "ENABLED",
      },
      limit: 1000,
    });

    return report.map((row: any) => ({
      campaignId: row.campaign.id,
      campaignName: row.campaign.name,
      spend: row.metrics.cost_micros / 1000000, // Convert to dollars
      impressions: row.metrics.impressions || 0,
      clicks: row.metrics.clicks || 0,
      conversions: row.metrics.conversions || 0,
      costPerConversion: row.metrics.cost_per_conversion || 0,
      clickThroughRate: row.metrics.ctr || 0,
      conversionRate: row.metrics.conversion_rate || 0,
      snapshotDate: new Date(),
    }));
  } catch (err) {
    if (err.message.includes("401")) {
      throw new AuthError("Google Ads authentication failed");
    }
    if (err.message.includes("429")) {
      throw new RateLimitError("Google Ads API rate limited");
    }
    throw err;
  }
}

export const googleAdsSource: DataSource = {
  id: "google-ads",
  name: "Google Ads",
  icon: "📈",
  requiresConfig: true,

  async fetch(config: DataSourceConfig): Promise<BriefingItem[]> {
    const apiKey = config.env.GOOGLE_ADS_REFRESH_TOKEN;
    if (!apiKey) {
      return [{
        id: "google-ads-setup",
        priority: "normal",
        category: "status",
        title: "Google Ads - Setup Required",
        detail: "Configure OAuth credentials to connect Google Ads",
        time: new Date().toISOString(),
        action: "Configure",
        actionUrl: "/settings/integrations/google-ads",
      }];
    }

    const auth = getRequestAuthContext(config.request);
    const db = getWorkerDb();

    try {
      const customerId = auth.metadata?.googleAdsCustomerId;
      if (!customerId) {
        return [{
          id: "google-ads-no-customer",
          priority: "normal",
          category: "status",
          title: "Google Ads - Customer ID Not Set",
          detail: "Select which Google Ads account to track",
          time: new Date().toISOString(),
        }];
      }

      // Fetch with rate limit handling
      const snapshots = await retryWithBackoff(
        () => fetchGoogleAdsData(apiKey, customerId),
        { maxRetries: 3, baseDelay: 1000 }
      );

      // Store snapshots
      await storeGoogleAdsSnapshots(db, auth.orgId, snapshots);

      // Generate briefing items
      const items: BriefingItem[] = [];

      for (const snapshot of snapshots) {
        // Check for budget overruns
        const dailyBudget = await getDailyBudget(db, auth.orgId, snapshot.campaignId);
        const dailySpend = snapshot.spend / 7; // Assume weekly snapshot
        const pctOfBudget = (dailySpend / dailyBudget) * 100;

        if (pctOfBudget > 100) {
          items.push({
            id: `gads-overbudget-${snapshot.campaignId}`,
            priority: "high",
            category: "revenue",
            title: `${snapshot.campaignName} over budget`,
            detail: `Spent ${pctOfBudget.toFixed(0)}% of daily budget ($${dailySpend.toFixed(2)})`,
            time: new Date().toISOString(),
            action: "Review",
            actionUrl: `/campaigns/${snapshot.campaignId}`,
          });
        }

        // Check for conversion rate anomalies
        const previousSnapshot = await getGoogleAdsSnapshot(
          db,
          snapshot.campaignId,
          7
        );

        if (previousSnapshot) {
          const convRateDelta = snapshot.conversionRate - previousSnapshot.conversionRate;
          if (Math.abs(convRateDelta) > 0.05) { // 5% change threshold
            items.push({
              id: `gads-conv-change-${snapshot.campaignId}`,
              priority: convRateDelta < 0 ? "high" : "normal",
              category: "revenue",
              title: `${snapshot.campaignName} conversion rate ${convRateDelta > 0 ? "↑" : "↓"}`,
              detail: `${(snapshot.conversionRate * 100).toFixed(1)}% (was ${(previousSnapshot.conversionRate * 100).toFixed(1)}%)`,
              time: new Date().toISOString(),
            });
          }
        }
      }

      return items;
    } catch (err) {
      if (err instanceof AuthError) {
        logger.error("Google Ads auth failed", { orgId: auth.orgId });
        return [{
          id: "google-ads-auth-error",
          priority: "high",
          category: "error",
          title: "Google Ads - Authentication Failed",
          detail: "Re-connect your Google Ads account",
          time: new Date().toISOString(),
        }];
      }
      throw err;
    }
  }
};
```

**Testing** (including live API):
```typescript
describe("GoogleAdsDataSource", () => {
  // Unit tests (mocked API)
  test("parses Google Ads API response correctly", async () => {
    const mockResponse = [{
      campaign: { id: "123", name: "Summer Campaign" },
      metrics: {
        cost_micros: 500000000,
        impressions: 10000,
        clicks: 500,
        conversions: 25,
      },
    }];

    mockGoogleAdsClient.report.mockResolvedValueOnce(mockResponse);
    const snapshots = await fetchGoogleAdsData("token", "12345");
    expect(snapshots[0].spend).toBe(500);
  });

  // Integration test (real API, test account)
  test("fetches real campaigns from Google Ads (integration)", async () => {
    const snapshots = await fetchGoogleAdsData(
      process.env.GOOGLE_ADS_TEST_TOKEN!,
      process.env.GOOGLE_ADS_TEST_CUSTOMER_ID!
    );

    expect(snapshots.length).toBeGreaterThan(0);
    expect(snapshots[0]).toHaveProperty("campaignId");
    expect(snapshots[0]).toHaveProperty("spend");
  });

  // E2E test
  test("datasource generates alerts for budget overruns", async () => {
    const items = await googleAdsSource.fetch({...});
    const overbudgetItem = items.find(i => i.id.includes("overbudget"));
    expect(overbudgetItem?.priority).toBe("high");
  });

  // Error handling
  test("handles auth failures gracefully", async () => {
    mockGoogleAdsClient.report.mockRejectedValueOnce(
      new Error("401 Unauthorized")
    );

    const items = await googleAdsSource.fetch({...});
    const errorItem = items.find(i => i.id === "google-ads-auth-error");
    expect(errorItem).toBeDefined();
  });

  test("retries on rate limit with backoff", async () => {
    mockGoogleAdsClient.report
      .mockRejectedValueOnce(new Error("429 Too Many Requests"))
      .mockResolvedValueOnce([...]);

    const snapshots = await retryWithBackoff(
      () => fetchGoogleAdsData("token", "12345"),
      { maxRetries: 2, baseDelay: 100 }
    );

    expect(snapshots).toBeDefined();
  });
});
```

**Architecture Review**:
- [ ] OAuth token refresh logic secure and automated
- [ ] Rate limiting handled with exponential backoff
- [ ] API key never exposed in logs or UI
- [ ] Error responses distinguished (auth vs. rate limit vs. data error)
- [ ] Change thresholds prevent alert fatigue
- [ ] D1 snapshots indexed for historical queries
- [ ] Daily spend calculation includes account-level budgets

**Effort**: 6 hours

---

### Task 3.2: MetaAdsDataSource (6 hours)

**Same pattern as Google Ads** — Meta Ads API integration with full testing

**Key differences**:
- Meta Ads API uses different authentication (App Secret + User Token)
- Campaign performance metrics slightly different
- Cost data returned in specific currency

---

### Task 3.3: GA4DataSource (4 hours)

**What**: Organic traffic, conversion rate, traffic by source

```typescript
export const ga4Source: DataSource = {
  // Simpler than Google Ads (fewer metrics)
  // Track: organic visits, conversions, conversion rate
  // Detect: traffic anomalies, conversion rate drops
}
```

---

### Task 3.4: EmailMetricsDataSource (4 hours)

**What**: Email campaign performance

```typescript
// Fetch from Mailchimp/ConvertKit/Substack
// Metrics: open rate, click rate, unsubscribe rate
// Detect: declining engagement, list fatigue
```

---

### Task 3.5: Campaign Dashboard Component (4 hours)

```typescript
// UI component: unified campaign performance view
// Channels: Google Ads, Meta Ads, GA4, Email side-by-side
// Metrics: spend, conversions, ROAS, CTR
// Alerts: budget overruns, conversion drops, anomalies
```

**Effort**: 24 hours total for Batch 3

---

## Batch 4: Alert System (Days 8-10, 14 hours)

### Task 4.1: Alert Routing & Channels (6 hours)

**What**: Route alerts to Slack, email, in-app

```typescript
// src/server/alerts.ts

interface AlertConfig {
  trigger: "serp_drop" | "budget_overrun" | "traffic_anomaly" | "conversion_drop";
  severity: "critical" | "warning" | "info";
  channels: ("slack" | "email" | "in-app")[];
  recipient?: string; // User email or Slack handle
  suppressionWindow?: number; // Minutes to suppress duplicates
}

// Alert deduplication
function shouldFireAlert(alert: Alert, recent: Alert[]): boolean {
  const similar = recent.find(a =>
    a.trigger === alert.trigger &&
    a.sourceId === alert.sourceId &&
    Date.now() - a.createdAt.getTime() < (alert.suppressionWindow || 300000)
  );
  return !similar;
}

// Slack webhook integration
async function sendToSlack(alert: Alert, webhookUrl: string): Promise<void> {
  const color = alert.severity === "critical" ? "danger" : "warning";
  const payload = {
    attachments: [{
      color,
      title: alert.title,
      text: alert.detail,
      ts: Math.floor(alert.createdAt.getTime() / 1000),
    }],
  };

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Slack webhook failed: ${response.status}`);
  }
}

// Email integration (Resend)
async function sendEmail(alert: Alert, email: string): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "alerts@opendash.io",
      to: email,
      subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
      html: `<p>${alert.detail}</p>`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Email send failed: ${response.status}`);
  }
}

// In-app notification (stored in D1)
async function storeInAppNotification(
  db: D1Database,
  alert: Alert
): Promise<void> {
  await db.prepare(
    `INSERT INTO notifications (id, userId, title, detail, severity, createdAt)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(
    alert.id,
    alert.userId,
    alert.title,
    alert.detail,
    alert.severity,
    Date.now()
  ).run();
}

// Main alert router
export async function routeAlert(alert: Alert, config: AlertConfig): Promise<void> {
  // Check deduplication
  const recent = await getRecentAlerts(alert.sourceId, config.suppressionWindow);
  if (!shouldFireAlert(alert, recent)) {
    logger.debug("Alert deduplicated", { alertId: alert.id });
    return;
  }

  // Route to channels
  const promises = [];

  if (config.channels.includes("slack")) {
    const webhookUrl = await getSlackWebhook(alert.orgId);
    promises.push(sendToSlack(alert, webhookUrl).catch(err =>
      logger.error("Slack send failed", { error: String(err) })
    ));
  }

  if (config.channels.includes("email")) {
    const email = config.recipient || await getUserEmail(alert.userId);
    promises.push(sendEmail(alert, email).catch(err =>
      logger.error("Email send failed", { error: String(err) })
    ));
  }

  if (config.channels.includes("in-app")) {
    promises.push(storeInAppNotification(db, alert).catch(err =>
      logger.error("In-app notification failed", { error: String(err) })
    ));
  }

  await Promise.allSettled(promises);
}
```

**Testing** (including live webhooks):
```typescript
describe("Alert Routing", () => {
  test("deduplicates alerts within suppression window", async () => {
    const alert1 = { id: "a1", trigger: "serp_drop", sourceId: "c1" };
    const recent = [alert1];

    const alert2 = { ...alert1, id: "a2" };
    const shouldFire = shouldFireAlert(alert2, recent);
    expect(shouldFire).toBe(false);
  });

  test("sends to Slack webhook", async () => {
    const webhookUrl = process.env.SLACK_TEST_WEBHOOK;
    await sendToSlack({
      title: "Test Alert",
      detail: "This is a test",
      severity: "warning",
      createdAt: new Date(),
    }, webhookUrl);

    // Verify message appeared in Slack (manual)
  });

  test("sends email via Resend", async () => {
    await sendEmail({
      title: "Test Email",
      detail: "Test body",
      severity: "critical",
      createdAt: new Date(),
    }, "test@example.com");

    // Verify email received (check inbox)
  });

  test("stores in-app notifications in D1", async () => {
    await storeInAppNotification(db, alert);
    const stored = await db.prepare(
      "SELECT * FROM notifications WHERE id = ?"
    ).bind(alert.id).first();
    expect(stored).toBeDefined();
  });
});
```

**Effort**: 6 hours

---

### Task 4.2: Alert UI & Management (4 hours)

```typescript
// UI component: show alerts, dismiss, snooze, acknowledge
// Features:
//  - Show critical alerts prominently
//  - Dismiss button (user doesn't care)
//  - Snooze button (remind in 1hr/1day)
//  - Acknowledge button (user has seen it)
//  - Alert history (past 7 days)
```

---

### Task 4.3: Alert Configuration UI (4 hours)

```typescript
// Settings page: per-brand alert configuration
// For each trigger: enable/disable, set channels, set thresholds
```

---

## Batch 5: Billing System (Days 10-12, 12 hours)

### Task 5.1: Stripe Integration (6 hours)

```typescript
// src/server/billing.ts

const PRICING_TIERS = {
  starter: { price: 29900, brands: 3, seats: 1, monthlyRequests: 10000 },
  pro: { price: 79900, brands: 10, seats: 5, monthlyRequests: 100000 },
  enterprise: { price: null, brands: -1, seats: -1, monthlyRequests: -1 },
};

// Create checkout session
async function createCheckoutSession(
  orgId: string,
  tier: "starter" | "pro" | "enterprise"
): Promise<string> {
  const org = await getOrg(orgId);

  const session = await stripe.checkout.sessions.create({
    customer: org.stripeCustomerId,
    billing_address_collection: "auto",
    line_items: [{
      price: PRICING_TIERS[tier].stripePriceId,
      quantity: 1,
    }],
    mode: "subscription",
    success_url: "https://opendash.io/billing/success",
    cancel_url: "https://opendash.io/billing/cancel",
  });

  return session.url!;
}

// Handle webhook
async function handleStripeWebhook(
  event: Stripe.Event
): Promise<void> {
  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const org = await getOrgByStripeId(subscription.customer as string);

      // Update org tier
      const tier = getPriceTier(subscription.items.data[0].price.id);
      await updateOrgTier(org.id, tier);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const org = await getOrgByStripeId(subscription.customer as string);

      // Downgrade to free tier
      await updateOrgTier(org.id, "free");
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const org = await getOrgByStripeId(invoice.customer as string);

      // Send alert email
      await sendPaymentFailedEmail(org.ownerEmail);
      break;
    }
  }
}

// Tier enforcement
async function checkTierLimit(
  org: Org,
  resource: "brands" | "seats" | "requests"
): Promise<void> {
  const tier = PRICING_TIERS[org.tier];
  const limit = tier[resource];

  if (limit === -1) return; // Unlimited

  const current = await countResource(org.id, resource);
  if (current >= limit) {
    throw new TierLimitError(
      `${resource} limit reached for ${org.tier} tier`,
      { limit, current, tier: org.tier }
    );
  }
}
```

**Testing**:
```typescript
describe("Billing System", () => {
  test("creates Stripe checkout session", async () => {
    const session = await createCheckoutSession("org-123", "pro");
    expect(session).toMatch(/^https:\/\/checkout\.stripe\.com/);
  });

  test("handles subscription created webhook", async () => {
    const event = {
      type: "customer.subscription.created",
      data: { object: { customer: "cus_123", items: { data: [...] } } },
    };

    await handleStripeWebhook(event);
    const org = await getOrg("org-123");
    expect(org.tier).toBe("pro");
  });

  test("enforces brand limit for starter tier", async () => {
    const org = { id: "org-123", tier: "starter" };

    // Create 3 brands (limit)
    for (let i = 0; i < 3; i++) {
      await createBrand(org.id, `brand-${i}`);
    }

    // 4th brand should fail
    expect(() => createBrand(org.id, "brand-3")).rejects.toThrow(TierLimitError);
  });

  test("handles payment failed webhook", async () => {
    const event = {
      type: "invoice.payment_failed",
      data: { object: { customer: "cus_123" } },
    };

    await handleStripeWebhook(event);
    // Verify email sent
  });
});
```

**Effort**: 6 hours

---

### Task 5.2: Billing UI (4 hours)

```typescript
// src/routes/settings/billing.tsx

// Features:
// - Show current plan + price
// - Upgrade/downgrade buttons
// - Usage dashboard (X of Y brands used, etc)
// - Invoice history
// - Payment method management
```

---

### Task 5.3: Stripe Webhook Server (2 hours)

```typescript
// Secure webhook endpoint: validate Stripe signature, handle events
```

---

## Final: Architecture Review & Merge Process

For every feature, before merging:

```
MERGE CHECKLIST:

Code Quality:
  [ ] All tests passing (unit + integration + E2E)
  [ ] Code reviewed by self (clarity, maintainability)
  [ ] No console.log statements (use logger)
  [ ] No TODOs (complete or create issues)
  [ ] TypeScript strict mode passing

Security:
  [ ] No API keys in code or logs
  [ ] Webhooks validated
  [ ] Auth checks on all endpoints
  [ ] Input validation (Zod schemas)
  [ ] Rate limiting in place

Performance:
  [ ] API calls < 500ms (99th percentile)
  [ ] D1 queries indexed
  [ ] No N+1 queries
  [ ] Caching strategy documented

Monitoring:
  [ ] Error logging for all try/catch blocks
  [ ] Request tracing for debugging
  [ ] API spend monitoring
  [ ] Rate limit monitoring

Documentation:
  [ ] README updated
  [ ] API docs complete
  [ ] Error codes documented
  [ ] Integration guide included

Testing:
  [ ] Unit tests: >80% code coverage
  [ ] Integration tests: real API tested
  [ ] E2E tests: user journey validated
  [ ] Error scenarios: >90% handled
  [ ] Load test: 10 concurrent requests

Commit:
  [ ] Descriptive commit message
  [ ] References issue number
  [ ] Lists all new files/APIs
  [ ] Includes "Tested by:"section
```

---

## Timeline Summary

| Phase | Days | Effort | Status | Merge |
|-------|------|--------|--------|-------|
| **SERP** | 1-2 | 4h | Wired + tested | Day 2 |
| **Monitoring** | 2-5 | 9h | Content + Domain metrics | Day 5 |
| **Campaigns** | 5-8 | 24h | 4 datasources + dashboard | Day 8 |
| **Alerts** | 8-10 | 14h | Routing + UI + config | Day 10 |
| **Billing** | 10-12 | 12h | Stripe + UI + webhooks | Day 12 |
| **Testing** | Ongoing | 8h | E2E + load + staging | Day 12 |
| **Total** | **12 days** | **71h** | **Production-ready** | **Day 12** |

---

## Success Criteria (for Production Launch)

- ✅ All 71 hours of implementation complete
- ✅ 100% test coverage on critical paths
- ✅ 0 critical security issues
- ✅ <2s briefing load (10+ brands)
- ✅ <5s campaign dashboard
- ✅ <500ms per API call (99th percentile)
- ✅ Staging stable for 1 week
- ✅ Real Google/Meta/Slack/Stripe integration working
- ✅ Real email sending (Resend)
- ✅ Real user JWT decoding (Clerk)
- ✅ Sentry monitoring configured
- ✅ Daily API spend monitored
- ✅ ProductHunt launch ready

---

## Next Steps

**Start immediately with Batch 1** (4 hours):

```
Hour 1: Wire getSerpTrends() to D1
Hour 0.5: Integrate SerpTrendingPanel
Hour 0.5: Test end-to-end
Hour 1: Commit + merge
Hour 1: Verify all 202 tests pass
```

Then proceed to Batch 2 (no waiting, no blockers).

---

**Status**: Ready to execute immediately
**Mandate**: Complete everything, zero shortcuts
**Quality**: Production-ready end-to-end
