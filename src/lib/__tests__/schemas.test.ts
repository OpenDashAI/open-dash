/**
 * Test suite for Zod schemas.
 * Validates:
 * - Valid data passes
 * - Invalid data is rejected with clear errors
 * - Constraints are enforced (min/max, enums, types)
 */

import { describe, it, expect } from "vitest";
import {
  // Time
  TimestampSchema,
  now,
  toISOString,
  fromISOString,
  // Briefing
  BriefingItemSchema,
  BriefingItemArraySchema,
  BriefingPriorityEnum,
  BriefingCategoryEnum,
  // Metrics
  DatasourceMetricSchema,
  computeHealthStatus,
  HealthStatusEnum,
  // Datasource
  DataSourceStatusSchema,
  DataSourceConfigSchema,
  GitHubEnvSchema,
  StripeBrandConfigSchema,
} from "../schemas";

describe("TimestampSchema", () => {
  it("accepts valid unix milliseconds", () => {
    const ts = Date.now();
    expect(TimestampSchema.parse(ts)).toBe(ts);
  });

  it("accepts future timestamps within 24h", () => {
    const tomorrow = Date.now() + 86400000 - 1000;
    expect(TimestampSchema.parse(tomorrow)).toBe(tomorrow);
  });

  it("rejects negative timestamps", () => {
    expect(() => TimestampSchema.parse(-1)).toThrow();
  });

  it("rejects non-integer timestamps", () => {
    expect(() => TimestampSchema.parse(123.456)).toThrow();
  });

  it("rejects timestamps far in future (>24h)", () => {
    const tooFar = Date.now() + 86400000 + 1000;
    expect(() => TimestampSchema.parse(tooFar)).toThrow();
  });

  it("converts between ISO and milliseconds", () => {
    const ts = Date.now();
    const iso = toISOString(ts);
    expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}T/);

    const back = fromISOString(iso);
    expect(back).toBe(ts);
  });

  it("rejects invalid ISO strings", () => {
    expect(() => fromISOString("not-a-date")).toThrow();
  });

  it("gets current timestamp", () => {
    const current = now();
    expect(current).toBeGreaterThan(0);
    expect(current).toBeLessThanOrEqual(Date.now());
  });
});

describe("BriefingPriorityEnum", () => {
  it("accepts valid priorities", () => {
    expect(BriefingPriorityEnum.parse("urgent")).toBe("urgent");
    expect(BriefingPriorityEnum.parse("high")).toBe("high");
    expect(BriefingPriorityEnum.parse("normal")).toBe("normal");
    expect(BriefingPriorityEnum.parse("low")).toBe("low");
  });

  it("rejects invalid priorities", () => {
    expect(() => BriefingPriorityEnum.parse("critical")).toThrow();
    expect(() => BriefingPriorityEnum.parse("")).toThrow();
    expect(() => BriefingPriorityEnum.parse(123)).toThrow();
  });
});

describe("BriefingCategoryEnum", () => {
  it("accepts valid categories", () => {
    expect(BriefingCategoryEnum.parse("issue")).toBe("issue");
    expect(BriefingCategoryEnum.parse("deploy")).toBe("deploy");
    expect(BriefingCategoryEnum.parse("revenue")).toBe("revenue");
    expect(BriefingCategoryEnum.parse("seo")).toBe("seo");
  });

  it("rejects invalid categories", () => {
    expect(() => BriefingCategoryEnum.parse("unknown")).toThrow();
    expect(() => BriefingCategoryEnum.parse("")).toThrow();
  });
});

describe("BriefingItemSchema", () => {
  const validItem = {
    id: "item-1",
    priority: "high" as const,
    category: "issue" as const,
    title: "Test Issue",
    time: new Date().toISOString(),
  };

  it("accepts valid briefing item", () => {
    const result = BriefingItemSchema.parse(validItem);
    expect(result.id).toBe("item-1");
    expect(result.priority).toBe("high");
    expect(result.dismissed).toBe(false); // default
  });

  it("rejects empty id", () => {
    expect(() =>
      BriefingItemSchema.parse({
        ...validItem,
        id: "",
      })
    ).toThrow();
  });

  it("rejects empty title", () => {
    expect(() =>
      BriefingItemSchema.parse({
        ...validItem,
        title: "",
      })
    ).toThrow();
  });

  it("rejects title too long (>500 chars)", () => {
    expect(() =>
      BriefingItemSchema.parse({
        ...validItem,
        title: "x".repeat(501),
      })
    ).toThrow();
  });

  it("rejects invalid timestamp", () => {
    expect(() =>
      BriefingItemSchema.parse({
        ...validItem,
        time: "not-a-date",
      })
    ).toThrow();
  });

  it("rejects invalid URL for actionUrl", () => {
    expect(() =>
      BriefingItemSchema.parse({
        ...validItem,
        actionUrl: "not-a-url",
      })
    ).toThrow();
  });

  it("accepts valid optional fields", () => {
    const result = BriefingItemSchema.parse({
      ...validItem,
      detail: "More details",
      brand: "my-brand",
      action: "View",
      actionUrl: "https://example.com",
      dismissed: true,
      isNew: true,
      snoozedUntil: new Date(Date.now() + 3600000).toISOString(),
    });

    expect(result.detail).toBe("More details");
    expect(result.brand).toBe("my-brand");
    expect(result.dismissed).toBe(true);
  });

  it("defaults optional booleans", () => {
    const result = BriefingItemSchema.parse(validItem);
    expect(result.dismissed).toBe(false);
    expect(result.isNew).toBe(false);
  });
});

describe("BriefingItemArraySchema", () => {
  const items = [
    {
      id: "1",
      priority: "urgent" as const,
      category: "issue" as const,
      title: "Issue 1",
      time: new Date().toISOString(),
    },
    {
      id: "2",
      priority: "normal" as const,
      category: "deploy" as const,
      title: "Deploy 2",
      time: new Date().toISOString(),
    },
  ];

  it("accepts valid array of items", () => {
    const result = BriefingItemArraySchema.parse(items);
    expect(result).toHaveLength(2);
  });

  it("rejects array with invalid item", () => {
    expect(() =>
      BriefingItemArraySchema.parse([
        ...items,
        {
          // missing required fields
          id: "3",
        },
      ])
    ).toThrow();
  });

  it("accepts empty array", () => {
    const result = BriefingItemArraySchema.parse([]);
    expect(result).toHaveLength(0);
  });
});

describe("DatasourceMetricSchema", () => {
  const validMetric = {
    id: "stripe",
    name: "Stripe Revenue",
    lastFetch: Date.now(),
    fetchLatency: 250,
    errorRate: 0.05,
    connected: true,
  };

  it("accepts valid metric", () => {
    const result = DatasourceMetricSchema.parse(validMetric);
    expect(result.id).toBe("stripe");
    expect(result.errorRate).toBe(0.05);
  });

  it("rejects negative latency", () => {
    expect(() =>
      DatasourceMetricSchema.parse({
        ...validMetric,
        fetchLatency: -100,
      })
    ).toThrow();
  });

  it("rejects error rate > 1", () => {
    expect(() =>
      DatasourceMetricSchema.parse({
        ...validMetric,
        errorRate: 1.5,
      })
    ).toThrow();
  });

  it("rejects error rate < 0", () => {
    expect(() =>
      DatasourceMetricSchema.parse({
        ...validMetric,
        errorRate: -0.1,
      })
    ).toThrow();
  });

  it("rejects latency > 10 minutes", () => {
    expect(() =>
      DatasourceMetricSchema.parse({
        ...validMetric,
        fetchLatency: 600001,
      })
    ).toThrow();
  });

  it("allows edge case: latency = 0 (instant)", () => {
    const result = DatasourceMetricSchema.parse({
      ...validMetric,
      fetchLatency: 0,
    });
    expect(result.fetchLatency).toBe(0);
  });

  it("allows edge case: error rate = 0", () => {
    const result = DatasourceMetricSchema.parse({
      ...validMetric,
      errorRate: 0,
    });
    expect(result.errorRate).toBe(0);
  });

  it("allows edge case: error rate = 1", () => {
    const result = DatasourceMetricSchema.parse({
      ...validMetric,
      errorRate: 1,
    });
    expect(result.errorRate).toBe(1);
  });
});

describe("computeHealthStatus", () => {
  it("returns 'critical' when not connected", () => {
    const metric = {
      id: "stripe",
      name: "Stripe",
      lastFetch: Date.now(),
      fetchLatency: 100,
      errorRate: 0,
      connected: false,
    };
    expect(computeHealthStatus(metric)).toBe("critical");
  });

  it("returns 'critical' when error rate > 50%", () => {
    const metric = {
      id: "stripe",
      name: "Stripe",
      lastFetch: Date.now(),
      fetchLatency: 100,
      errorRate: 0.51,
      connected: true,
    };
    expect(computeHealthStatus(metric)).toBe("critical");
  });

  it("returns 'degraded' when error rate 20-50%", () => {
    const metric = {
      id: "stripe",
      name: "Stripe",
      lastFetch: Date.now(),
      fetchLatency: 100,
      errorRate: 0.35,
      connected: true,
    };
    expect(computeHealthStatus(metric)).toBe("degraded");
  });

  it("returns 'healthy' when error rate < 20% and connected", () => {
    const metric = {
      id: "stripe",
      name: "Stripe",
      lastFetch: Date.now(),
      fetchLatency: 100,
      errorRate: 0.05,
      connected: true,
    };
    expect(computeHealthStatus(metric)).toBe("healthy");
  });
});

describe("DataSourceStatusSchema", () => {
  it("accepts valid status", () => {
    const status = {
      connected: true,
      lastFetch: new Date().toISOString(),
      itemCount: 5,
    };
    const result = DataSourceStatusSchema.parse(status);
    expect(result.connected).toBe(true);
  });

  it("accepts minimal status", () => {
    const result = DataSourceStatusSchema.parse({
      connected: false,
    });
    expect(result.connected).toBe(false);
    expect(result.lastFetch).toBeUndefined();
  });

  it("rejects invalid ISO timestamp", () => {
    expect(() =>
      DataSourceStatusSchema.parse({
        connected: true,
        lastFetch: "not-a-date",
      })
    ).toThrow();
  });

  it("rejects negative item count", () => {
    expect(() =>
      DataSourceStatusSchema.parse({
        connected: true,
        itemCount: -1,
      })
    ).toThrow();
  });
});

describe("DataSourceConfigSchema", () => {
  it("accepts valid config", () => {
    const config = {
      env: {
        API_KEY: "secret",
        API_SECRET: undefined,
      },
      lastVisited: new Date().toISOString(),
      brandConfig: {
        color: "blue",
      },
    };
    const result = DataSourceConfigSchema.parse(config);
    expect(result.env.API_KEY).toBe("secret");
  });

  it("accepts minimal config", () => {
    const result = DataSourceConfigSchema.parse({
      env: {},
      lastVisited: null,
    });
    expect(result.env).toEqual({});
    expect(result.lastVisited).toBeNull();
  });

  it("rejects invalid lastVisited timestamp", () => {
    expect(() =>
      DataSourceConfigSchema.parse({
        env: {},
        lastVisited: "invalid",
      })
    ).toThrow();
  });
});

describe("GitHubEnvSchema", () => {
  it("accepts valid GitHub env vars", () => {
    const result = GitHubEnvSchema.parse({
      GITHUB_TOKEN: "ghp_xxx",
    });
    expect(result.GITHUB_TOKEN).toBe("ghp_xxx");
  });

  it("rejects missing GITHUB_TOKEN", () => {
    expect(() => GitHubEnvSchema.parse({})).toThrow();
  });

  it("rejects extra keys (strict mode)", () => {
    expect(() =>
      GitHubEnvSchema.parse({
        GITHUB_TOKEN: "ghp_xxx",
        EXTRA_KEY: "value",
      })
    ).toThrow();
  });

  it("rejects empty GITHUB_TOKEN", () => {
    expect(() =>
      GitHubEnvSchema.parse({
        GITHUB_TOKEN: "",
      })
    ).toThrow();
  });
});

describe("StripeBrandConfigSchema", () => {
  it("accepts valid Stripe brand config", () => {
    const result = StripeBrandConfigSchema.parse({
      currencyFilter: "USD",
      minAmountFilter: 10,
      lookbackDays: 30,
    });
    expect(result.currencyFilter).toBe("USD");
  });

  it("defaults lookbackDays to 30", () => {
    const result = StripeBrandConfigSchema.parse({});
    expect(result.lookbackDays).toBe(30);
  });

  it("allows partial config", () => {
    const result = StripeBrandConfigSchema.parse({
      currencyFilter: "EUR",
    });
    expect(result.currencyFilter).toBe("EUR");
    expect(result.lookbackDays).toBe(30);
  });

  it("rejects invalid currency", () => {
    expect(() =>
      StripeBrandConfigSchema.parse({
        currencyFilter: "JPY",
      })
    ).toThrow();
  });

  it("rejects negative minAmountFilter", () => {
    expect(() =>
      StripeBrandConfigSchema.parse({
        minAmountFilter: -10,
      })
    ).toThrow();
  });
});
