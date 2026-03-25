/**
 * D1 Database Schema for OpenDash
 * Type-safe persistence layer using Drizzle ORM
 *
 * Tables:
 * 1. datasource_metrics — time-series health metrics
 * 2. datasource_status — current connection state
 * 3. alert_rules — configurable alerting
 */

import {
	sqliteTable,
	text,
	integer,
	real,
	index,
	primaryKey,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/**
 * Datasource Metrics — time-series table for historical analytics
 *
 * Stores fetch latency, error rates, and health status over time.
 * Used for trending, anomaly detection, and SLA calculations.
 *
 * Partitioned by datasourceId + timestamp for efficient range queries.
 */
export const datasourceMetricsTable = sqliteTable(
	"datasource_metrics",
	{
		// Composite key: UUID + timestamp ensures uniqueness
		id: text("id").primaryKey(),
		datasourceId: text("datasource_id").notNull(),
		datasourceName: text("datasource_name").notNull(),

		// Timestamp in milliseconds (unix epoch)
		// Validates: must be positive, not in far future
		timestamp: integer("timestamp").notNull(),

		// Latency in milliseconds (0-600000, i.e., 10 minutes max)
		fetchLatency: integer("fetch_latency").notNull(),

		// Error rate (0-1 scale, exponential moving average)
		// Checks: errorRate >= 0 AND errorRate <= 1
		errorRate: real("error_rate")
			.notNull(),

		// Connection status at fetch time (stored as 0/1 in SQLite)
		connected: integer("connected", { mode: "boolean" }).notNull(),

		// Computed health status (healthy/degraded/critical)
		healthStatus: text("health_status", {
			enum: ["healthy", "degraded", "critical"],
		}).notNull(),

		// Metadata: which dashboard/brand requested this
		brandId: text("brand_id"),

		// Organization scoping (for B2B multi-tenant)
		orgId: text("org_id"),

		// Creation timestamp (when record was inserted, not fetched)
		createdAt: integer("created_at")
			.notNull()
			.default(sql`(cast(strftime('%s', 'now') * 1000 as integer))`),
	},
	(table) => [
		// Primary index: (datasourceId, timestamp DESC) for efficient range queries
		index("idx_datasource_timestamp").on(
			table.datasourceId,
			table.timestamp
		),

		// Secondary: brand-scoped queries
		index("idx_brand_timestamp").on(table.brandId, table.timestamp),

		// Tertiary: org-scoped queries
		index("idx_datasource_metrics_orgId").on(table.orgId),

		// Health status tracking
		index("idx_datasource_health").on(table.datasourceId, table.healthStatus),

		// Retention: delete old records by timestamp
		index("idx_timestamp").on(table.timestamp),
	]
);

/**
 * Datasource Status — current connection state (one row per datasource)
 *
 * Cached copy of the latest metric + additional status info.
 * Used for fast dashboard display without aggregating metrics table.
 *
 * Updated by trigger when metrics table changes, or periodically.
 */
export const datasourceStatusTable = sqliteTable("datasource_status", {
	// Primary key: datasource ID
	id: text("id").primaryKey(),
	datasourceName: text("datasource_name").notNull(),

	// Current connection state
	connected: integer("connected", { mode: "boolean" }).notNull(),
	lastFetch: integer("last_fetch"),
	lastError: text("last_error"),

	// Cached metrics
	currentLatency: integer("current_latency"),
	errorRate: real("error_rate").default(0),
	healthStatus: text("health_status", {
		enum: ["healthy", "degraded", "critical"],
	}),

	// SLA tracking
	uptime24h: real("uptime_24h").default(1), // 0-1
	mtbf: integer("mtbf"), // mean time between failures (seconds)

	// Updated at
	updatedAt: integer("updated_at")
		.notNull()
		.default(sql`(cast(strftime('%s', 'now') * 1000 as integer))`),
});

/**
 * Alert Rules — configurable alerting conditions
 *
 * Define thresholds for latency, error rate, downtime, and SLA breaches.
 * Each rule can target multiple notification channels.
 */
export const alertRulesTable = sqliteTable(
	"alert_rules",
	{
		id: text("id").primaryKey(),
		datasourceId: text("datasource_id").notNull(),
		datasourceName: text("datasource_name"),

		// Rule type determines threshold semantics
		ruleType: text("rule_type", {
			enum: ["latency", "error_rate", "downtime", "sla"],
		}).notNull(),

		// Threshold value (interpreted per rule type)
		// latency: milliseconds (e.g., 5000 = alert if >5s)
		// error_rate: 0-1 (e.g., 0.1 = alert if >10%)
		// downtime: minutes (e.g., 5 = alert if down >5 min)
		// sla: percentage (e.g., 0.99 = alert if <99%)
		threshold: real("threshold").notNull(),

		// Notification channels (JSON array of strings)
		// Examples: ["slack", "email", "webhook"]
		alertChannels: text("alert_channels").notNull(), // JSON stringified

		// Rule state
		enabled: integer("enabled", { mode: "boolean" }).default(1),

		// Cooldown period (seconds) to prevent alert spam
		cooldownSeconds: integer("cooldown_seconds").default(3600),

		// Organization scoping (for B2B multi-tenant)
		orgId: text("org_id"),

		// Timestamps
		createdAt: integer("created_at")
			.notNull()
			.default(sql`(cast(strftime('%s', 'now') * 1000 as integer))`),
		updatedAt: integer("updated_at")
			.notNull()
			.default(sql`(cast(strftime('%s', 'now') * 1000 as integer))`),
	},
	(table) => [
		index("idx_datasource_rules").on(table.datasourceId),
		index("idx_alert_rules_orgId").on(table.orgId),
		index("idx_enabled_rules").on(table.enabled),
	]
);

/**
 * Alert History — audit log of fired alerts
 *
 * Track when alerts are triggered, acknowledged, and resolved.
 * Used for SLA calculation and incident analysis.
 */
export const alertHistoryTable = sqliteTable(
	"alert_history",
	{
		id: text("id").primaryKey(),
		ruleId: text("rule_id").notNull(),
		datasourceId: text("datasource_id").notNull(),

		// Alert lifecycle: triggered → acknowledged → resolved
		state: text("state", {
			enum: ["triggered", "acknowledged", "resolved"],
		}).notNull(),

		// When state changed
		triggeredAt: integer("triggered_at")
			.notNull()
			.default(sql`(cast(strftime('%s', 'now') * 1000 as integer))`),
		acknowledgedAt: integer("acknowledged_at"),
		acknowledgedBy: text("acknowledged_by"),
		resolvedAt: integer("resolved_at"),

		// Alert details
		message: text("message"),
		context: text("context"), // JSON with metric values at time of alert

		// Organization scoping (for B2B multi-tenant)
		orgId: text("org_id"),

		// Index for querying
		createdAt: integer("created_at")
			.notNull()
			.default(sql`(cast(strftime('%s', 'now') * 1000 as integer))`),
	},
	(table) => [
		index("idx_rule_alerts").on(table.ruleId),
		index("idx_datasource_history").on(table.datasourceId),
		index("idx_alert_history_orgId").on(table.orgId),
		index("idx_state_triggered").on(table.state, table.triggeredAt),
	]
);

/**
 * Organization & Team Tables — multi-tenant B2B support
 *
 * organizations: Tenant container (company, agency)
 * team_members: Users in org with role-based permissions
 * brands: Products/clients per org (for agencies managing multiple clients)
 */

/**
 * Organizations — tenant container for multi-tenant B2B
 */
export const organizationsTable = sqliteTable(
	"organizations",
	{
		id: text("id").primaryKey(),
		clerkId: text("clerk_id").unique(),
		name: text("name").notNull(),
		slug: text("slug").notNull().unique(),

		// Plan tier (enforces limits)
		plan: text("plan", {
			enum: ["starter", "pro", "enterprise"],
		})
			.notNull()
			.default("starter"),

		// Billing
		stripeCustomerId: text("stripe_customer_id"),
		stripeSubscriptionId: text("stripe_subscription_id"),

		// Metadata
		website: text("website"),
		logo: text("logo"),

		// Timestamps
		createdAt: integer("created_at")
			.notNull()
			.default(sql`(cast(strftime('%s', 'now') * 1000 as integer))`),
		updatedAt: integer("updated_at")
			.notNull()
			.default(sql`(cast(strftime('%s', 'now') * 1000 as integer))`),
	},
	(table) => [
		index("idx_organizations_clerkId").on(table.clerkId),
		index("idx_organizations_slug").on(table.slug),
		index("idx_organizations_plan").on(table.plan),
	]
);

/**
 * Team Members — users in organization with role-based permissions
 */
export const teamMembersTable = sqliteTable(
	"team_members",
	{
		id: text("id").primaryKey(),
		orgId: text("org_id").notNull(),
		userId: text("user_id").notNull(),

		// Permission role
		role: text("role", {
			enum: ["owner", "editor", "viewer"],
		}).notNull(),

		// Invitation tracking
		invitedBy: text("invited_by"),
		invitedAt: integer("invited_at"),
		acceptedAt: integer("accepted_at"), // NULL = pending

		// Status
		active: integer("active", { mode: "boolean" })
			.notNull()
			.default(1),

		// Timestamps
		createdAt: integer("created_at")
			.notNull()
			.default(sql`(cast(strftime('%s', 'now') * 1000 as integer))`),
		updatedAt: integer("updated_at")
			.notNull()
			.default(sql`(cast(strftime('%s', 'now') * 1000 as integer))`),
	},
	(table) => [
		index("idx_team_members_orgId").on(table.orgId),
		index("idx_team_members_userId").on(table.userId),
		index("idx_team_members_orgId_active").on(table.orgId, table.active),
		index("idx_team_members_role").on(table.role),
		index("idx_team_members_acceptedAt").on(table.acceptedAt),
	]
);

/**
 * Brands — products/clients per organization
 *
 * Supports agencies managing multiple clients.
 * Serves as scoping mechanism for datasources, competitors, and alerts.
 */
export const brandsTable = sqliteTable(
	"brands",
	{
		id: text("id").primaryKey(),
		orgId: text("org_id").notNull(),
		name: text("name").notNull(),
		slug: text("slug").notNull(),
		domain: text("domain").notNull().unique(),

		// Metadata
		logo: text("logo"),
		favicon: text("favicon"),
		themeColor: text("theme_color"),

		// Configuration (JSON arrays)
		datasources: text("datasources").default("[]"), // e.g. '["stripe", "ga4"]'
		competitors: text("competitors").default("[]"), // e.g. '["adidas.com", "puma.com"]'
		keywords: text("keywords").default("[]"), // e.g. '["best shoes", "running gear"]'

		// Status
		active: integer("active", { mode: "boolean" })
			.notNull()
			.default(1),
		archived: integer("archived", { mode: "boolean" })
			.notNull()
			.default(0),
		archivedAt: integer("archived_at"),

		// Timestamps
		createdAt: integer("created_at")
			.notNull()
			.default(sql`(cast(strftime('%s', 'now') * 1000 as integer))`),
		updatedAt: integer("updated_at")
			.notNull()
			.default(sql`(cast(strftime('%s', 'now') * 1000 as integer))`),
	},
	(table) => [
		index("idx_brands_orgId").on(table.orgId),
		index("idx_brands_orgId_active").on(table.orgId, table.active),
		index("idx_brands_domain").on(table.domain),
		index("idx_brands_slug").on(table.slug),
	]
);

/**
 * Competitive Intelligence Tables — monitor competitor strategies
 *
 * Tracks competitor domains, keyword rankings, content, and market insights.
 * Supports daily/weekly automated collection via datasources.
 */

/**
 * Competitor Domains — domain metrics tracking
 *
 * Weekly snapshots of domain authority, traffic, keywords, and backlinks.
 * Data sources: Ahrefs, SimilarWeb, Semrush (or manual updates).
 */
export const competitorDomainsTable = sqliteTable(
	"competitor_domains",
	{
		id: text("id").primaryKey(), // competitor-slug
		name: text("name").notNull(),
		websiteUrl: text("website_url"),

		// Metrics (refreshed weekly)
		domainAuthority: integer("domain_authority"), // 0-100
		trafficEstimate: integer("traffic_estimate"), // monthly visitors
		organicKeywords: integer("organic_keywords"),
		backlinksCount: integer("backlinks_count"),
		referringDomains: integer("referring_domains"),

		// Status
		lastChecked: integer("last_checked"),
		dataSource: text("data_source"), // 'ahrefs', 'similarweb', 'semrush', 'manual'
		confidenceScore: real("confidence_score"),

		createdAt: integer("created_at")
			.notNull()
			.default(sql`(cast(strftime('%s', 'now') * 1000 as integer))`),
		updatedAt: integer("updated_at")
			.notNull()
			.default(sql`(cast(strftime('%s', 'now') * 1000 as integer))`),
	},
	(table) => [
		index("idx_competitor_domains_name").on(table.name),
		index("idx_competitor_domains_updated").on(table.updatedAt),
	]
);

/**
 * Competitor SERP — keyword ranking snapshots
 *
 * Daily SERP position tracking for competitors across target keywords.
 * Enables rank movement detection and trend analysis.
 */
export const competitorSerpTable = sqliteTable(
	"competitor_serp",
	{
		id: text("id").primaryKey(), // uuid
		competitorId: text("competitor_id")
			.notNull()
			.references(() => competitorDomainsTable.id),

		keyword: text("keyword").notNull(),
		rankPosition: integer("rank_position"), // 1-100+
		searchVolume: integer("search_volume"),
		keywordDifficulty: integer("keyword_difficulty"), // 0-100 (KD)

		rankDate: text("rank_date").notNull(), // YYYY-MM-DD format for range queries
		rankChange: integer("rank_change"), // position change from prev day
		trend: text("trend", { enum: ["U", "D", "S"] }), // Up, Down, Same

		indexedAt: integer("indexed_at")
			.notNull()
			.default(sql`(cast(strftime('%s', 'now') * 1000 as integer))`),
		createdAt: integer("created_at")
			.notNull()
			.default(sql`(cast(strftime('%s', 'now') * 1000 as integer))`),
	},
	(table) => [
		index("idx_competitor_serp_date").on(table.rankDate),
		index("idx_competitor_serp_competitor").on(table.competitorId),
		index("idx_competitor_serp_keyword").on(table.keyword),
		index("idx_competitor_serp_compound").on(
			table.competitorId,
			table.rankDate
		),
	]
);

/**
 * Competitor Content — articles, blog posts, case studies
 *
 * Track published content, topics covered, and estimated reach.
 * Used for content gap analysis and positioning research.
 */
export const competitorContentTable = sqliteTable(
	"competitor_content",
	{
		id: text("id").primaryKey(), // uuid
		competitorId: text("competitor_id")
			.notNull()
			.references(() => competitorDomainsTable.id),

		url: text("url").notNull().unique(),
		title: text("title"),
		contentType: text("content_type", {
			enum: ["blog", "case_study", "tutorial", "announcement", "guide"],
		}),

		publishDate: integer("publish_date"),
		crawlDate: integer("crawl_date")
			.notNull()
			.default(sql`(cast(strftime('%s', 'now') * 1000 as integer))`),

		// Content metrics
		wordCount: integer("word_count"),
		estimatedReach: integer("estimated_reach"), // based on shares, views
		sentiment: text("sentiment", {
			enum: ["positive", "neutral", "promotional"],
		}),

		// Topics and keywords (JSON arrays)
		topics: text("topics"), // e.g. '["AI", "Analytics"]'
		keywords: text("keywords"), // e.g. '["free BI tool", "no-code"]'

		createdAt: integer("created_at")
			.notNull()
			.default(sql`(cast(strftime('%s', 'now') * 1000 as integer))`),
	},
	(table) => [
		index("idx_competitor_content_date").on(table.publishDate),
		index("idx_competitor_content_type").on(table.contentType),
		index("idx_competitor_content_competitor").on(table.competitorId),
	]
);

/**
 * Competitor Pricing — pricing tiers and features
 *
 * Daily/weekly snapshots of competitor pricing pages.
 * Enables pricing strategy analysis and feature comparison.
 */
export const competitorPricingTable = sqliteTable(
	"competitor_pricing",
	{
		id: text("id").primaryKey(),
		competitorId: text("competitor_id")
			.notNull()
			.references(() => competitorDomainsTable.id),

		tierName: text("tier_name"), // "Free", "Pro", "Enterprise"
		priceUsd: real("price_usd"), // null for free tiers
		billingPeriod: text("billing_period", {
			enum: ["month", "year", "one_time"],
		}),

		// Features as JSON array
		features: text("features"), // e.g. '["API", "Custom branding"]'

		snapshotDate: text("snapshot_date").notNull(), // YYYY-MM-DD for range queries
		extractedAt: integer("extracted_at")
			.notNull()
			.default(sql`(cast(strftime('%s', 'now') * 1000 as integer))`),

		createdAt: integer("created_at")
			.notNull()
			.default(sql`(cast(strftime('%s', 'now') * 1000 as integer))`),
	},
	(table) => [
		index("idx_competitor_pricing_date").on(table.snapshotDate),
		index("idx_competitor_pricing_competitor").on(table.competitorId),
	]
);

/**
 * Market Insights — AI-detected gaps and opportunities
 *
 * Aggregated findings from competitive intelligence analysis.
 * Generated by Claude API during weekly/monthly analysis jobs.
 */
export const marketInsightsTable = sqliteTable(
	"market_insights",
	{
		id: text("id").primaryKey(),

		insightType: text("insight_type", {
			enum: ["gap", "threat", "opportunity", "trend"],
		}).notNull(),
		title: text("title").notNull(),
		description: text("description"),

		// Related competitors (JSON array of IDs)
		relatedCompetitors: text("related_competitors"), // e.g. '["comp-1", "comp-2"]'
		confidenceScore: real("confidence_score"), // 0-1

		generatedBy: text("generated_by", {
			enum: ["claude", "heuristic", "manual"],
		}).notNull(),

		discoveredAt: integer("discovered_at")
			.notNull()
			.default(sql`(cast(strftime('%s', 'now') * 1000 as integer))`),
		addressedAt: integer("addressed_at"), // NULL until addressed

		createdAt: integer("created_at")
			.notNull()
			.default(sql`(cast(strftime('%s', 'now') * 1000 as integer))`),
	},
	(table) => [
		index("idx_market_insights_type").on(table.insightType),
		index("idx_market_insights_date").on(table.discoveredAt),
		index("idx_market_insights_unaddressed").on(table.addressedAt),
	]
);

/**
 * Competitive Alerts — alerting rules for CI system
 *
 * Define conditions for rank movements, content changes, pricing updates, threats.
 * Extends existing alert_rules pattern for competitive intelligence.
 */
export const competitiveAlertsTable = sqliteTable(
	"competitive_alerts",
	{
		id: text("id").primaryKey(),

		alertType: text("alert_type", {
			enum: ["rank_movement", "content_published", "pricing_change", "threat"],
		}).notNull(),
		competitorId: text("competitor_id")
			.notNull()
			.references(() => competitorDomainsTable.id),

		// Alert condition (e.g. "rank > 50", "traffic +30%")
		condition: text("condition"),
		threshold: real("threshold"),

		// Rule state
		enabled: integer("enabled", { mode: "boolean" }).default(1),
		triggerCount: integer("trigger_count").default(0),
		lastTriggered: integer("last_triggered"),

		// Notification channels (JSON array)
		channels: text("channels"), // e.g. '["slack", "email"]'

		createdAt: integer("created_at")
			.notNull()
			.default(sql`(cast(strftime('%s', 'now') * 1000 as integer))`),
		updatedAt: integer("updated_at")
			.notNull()
			.default(sql`(cast(strftime('%s', 'now') * 1000 as integer))`),
	},
	(table) => [
		index("idx_competitive_alerts_competitor").on(table.competitorId),
		index("idx_competitive_alerts_enabled").on(table.enabled),
	]
);

// Type exports for use in query functions
export type DatasourceMetric = typeof datasourceMetricsTable.$inferSelect;
export type DatasourceMetricInsert = typeof datasourceMetricsTable.$inferInsert;

export type DatasourceStatus = typeof datasourceStatusTable.$inferSelect;
export type DatasourceStatusInsert = typeof datasourceStatusTable.$inferInsert;

export type AlertRule = typeof alertRulesTable.$inferSelect;
export type AlertRuleInsert = typeof alertRulesTable.$inferInsert;

export type AlertHistory = typeof alertHistoryTable.$inferSelect;
export type AlertHistoryInsert = typeof alertHistoryTable.$inferInsert;

export type CompetitorDomain = typeof competitorDomainsTable.$inferSelect;
export type CompetitorDomainInsert = typeof competitorDomainsTable.$inferInsert;

export type CompetitorSerp = typeof competitorSerpTable.$inferSelect;
export type CompetitorSerpInsert = typeof competitorSerpTable.$inferInsert;

export type CompetitorContent = typeof competitorContentTable.$inferSelect;
export type CompetitorContentInsert = typeof competitorContentTable.$inferInsert;

export type CompetitorPricing = typeof competitorPricingTable.$inferSelect;
export type CompetitorPricingInsert = typeof competitorPricingTable.$inferInsert;

export type MarketInsight = typeof marketInsightsTable.$inferSelect;
export type MarketInsightInsert = typeof marketInsightsTable.$inferInsert;

export type CompetitiveAlert = typeof competitiveAlertsTable.$inferSelect;
export type CompetitiveAlertInsert = typeof competitiveAlertsTable.$inferInsert;

/**
 * SERP Tracker Tables (Issue #27.4 - Competitive Intelligence)
 * Org and brand-scoped competitor tracking
 */

/**
 * Competitors — Tracked competitor domains per brand
 * Links back to specific brand in an org for isolated competitor intelligence
 */
export const competitorsTable = sqliteTable(
	"competitors",
	{
		id: text("id").primaryKey(),
		brandId: text("brand_id").notNull(),
		orgId: text("org_id").notNull(),
		domain: text("domain").notNull(),
		name: text("name").notNull(),

		// Keywords to track for this competitor (JSON array)
		keywords: text("keywords").default("[]"),

		// Status
		active: integer("active", { mode: "boolean" })
			.notNull()
			.default(1),
		archived: integer("archived", { mode: "boolean" })
			.notNull()
			.default(0),
		archivedAt: integer("archived_at"),

		// Timestamps
		createdAt: integer("created_at")
			.notNull()
			.default(sql`(cast(strftime('%s', 'now') * 1000 as integer))`),
		updatedAt: integer("updated_at")
			.notNull()
			.default(sql`(cast(strftime('%s', 'now') * 1000 as integer))`),
	},
	(table) => [
		index("idx_competitors_brandId").on(table.brandId),
		index("idx_competitors_orgId").on(table.orgId),
		index("idx_competitors_domain").on(table.domain),
		index("idx_competitors_active").on(table.active),
	]
);

/**
 * SERP Rankings — Daily snapshots of search result positions
 * Tracks competitor rankings across keywords for trend analysis
 */
export const serpRankingsTable = sqliteTable(
	"serp_rankings",
	{
		id: text("id").primaryKey(),
		competitorId: text("competitor_id").notNull(),
		brandId: text("brand_id").notNull(),
		orgId: text("org_id").notNull(),

		// Search term and result
		keyword: text("keyword").notNull(),
		rank: integer("rank").notNull(), // 1-100+
		url: text("url").notNull(),
		title: text("title"),
		snippet: text("snippet"),

		// Search engine (google, bing, duckduckgo, etc)
		searchEngine: text("search_engine").default("google"),

		// Snapshot date (for daily comparison)
		snapshotDate: integer("snapshot_date").notNull(), // Date in milliseconds (start of day UTC)

		// Timestamps
		createdAt: integer("created_at")
			.notNull()
			.default(sql`(cast(strftime('%s', 'now') * 1000 as integer))`),
	},
	(table) => [
		index("idx_serp_rankings_competitorId").on(table.competitorId),
		index("idx_serp_rankings_brandId").on(table.brandId),
		index("idx_serp_rankings_orgId").on(table.orgId),
		index("idx_serp_rankings_keyword").on(table.keyword),
		index("idx_serp_rankings_snapshotDate").on(table.snapshotDate),
		index("idx_serp_rankings_competitive").on(
			table.competitorId,
			table.keyword,
			table.snapshotDate
		),
	]
);

/**
 * Campaign Metrics Tables — Ads, analytics, and email performance
 *
 * Tracks Google Ads, Meta Ads, GA4, and email campaign metrics.
 * Org and brand-scoped for multi-tenant isolation.
 */

/**
 * Google Ads Snapshots — daily campaign performance data
 */
export const googleAdsSnapshotsTable = sqliteTable(
	"google_ads_snapshots",
	{
		id: text("id").primaryKey(),
		orgId: text("org_id").notNull(),
		campaignId: text("campaign_id").notNull(),
		campaignName: text("campaign_name").notNull(),

		// Spend metrics
		spendDollars: real("spend_dollars"),
		spendMicros: integer("spend_micros"), // Cost in micros (Google format)

		// Performance metrics
		impressions: integer("impressions"),
		clicks: integer("clicks"),
		conversions: integer("conversions"),
		costPerConversion: real("cost_per_conversion"),

		// Rates
		clickThroughRate: real("click_through_rate"), // 0-1
		conversionRate: real("conversion_rate"), // 0-1

		// Snapshot metadata
		snapshotDate: text("snapshot_date").notNull(), // YYYY-MM-DD format
		snapshotTimestamp: integer("snapshot_timestamp"), // Unix timestamp (ms)

		createdAt: integer("created_at")
			.notNull()
			.default(sql`(cast(strftime('%s', 'now') * 1000 as integer))`),
	},
	(table) => [
		index("idx_gads_org_date").on(table.orgId, table.snapshotDate),
		index("idx_gads_campaign").on(table.campaignId),
		index("idx_gads_timestamp").on(table.snapshotTimestamp),
	]
);

/**
 * Daily Budgets — campaign budget tracking for Google Ads
 */
export const dailyBudgetsTable = sqliteTable(
	"daily_budgets",
	{
		id: text("id").primaryKey(),
		orgId: text("org_id").notNull(),
		campaignId: text("campaign_id").notNull(),

		dailyBudgetDollars: real("daily_budget_dollars").notNull(),

		// Metadata
		currency: text("currency").default("USD"),
		updatedAt: integer("updated_at")
			.notNull()
			.default(sql`(cast(strftime('%s', 'now') * 1000 as integer))`),
		createdAt: integer("created_at")
			.notNull()
			.default(sql`(cast(strftime('%s', 'now') * 1000 as integer))`),
	},
	(table) => [
		index("idx_daily_budgets_campaign").on(table.campaignId),
		index("idx_daily_budgets_org_campaign").on(table.orgId, table.campaignId),
	]
);

/**
 * Meta Ads Snapshots — daily campaign performance from Meta Ads
 */
export const metaAdsSnapshotsTable = sqliteTable(
	"meta_ads_snapshots",
	{
		id: text("id").primaryKey(),
		orgId: text("org_id").notNull(),
		campaignId: text("campaign_id").notNull(),
		campaignName: text("campaign_name").notNull(),
		adAccountId: text("ad_account_id").notNull(),

		// Spend and performance
		spendDollars: real("spend_dollars"),
		impressions: integer("impressions"),
		clicks: integer("clicks"),
		actions: integer("actions"), // Conversions in Meta
		costPerAction: real("cost_per_action"),

		// Rates
		clickThroughRate: real("click_through_rate"),
		actionRate: real("action_rate"), // Conversion rate in Meta

		// Metadata
		snapshotDate: text("snapshot_date").notNull(),
		snapshotTimestamp: integer("snapshot_timestamp"),

		createdAt: integer("created_at")
			.notNull()
			.default(sql`(cast(strftime('%s', 'now') * 1000 as integer))`),
	},
	(table) => [
		index("idx_meta_ads_org_date").on(table.orgId, table.snapshotDate),
		index("idx_meta_ads_campaign").on(table.campaignId),
	]
);

/**
 * GA4 Snapshots — organic traffic and conversion data
 */
export const ga4SnapshotsTable = sqliteTable(
	"ga4_snapshots",
	{
		id: text("id").primaryKey(),
		orgId: text("org_id").notNull(),
		propertyId: text("property_id").notNull(),
		propertyName: text("property_name"),

		// Traffic metrics
		organicSessions: integer("organic_sessions"),
		organicUsers: integer("organic_users"),
		organicBounceRate: real("organic_bounce_rate"), // 0-1

		// Conversions
		conversions: integer("conversions"),
		conversionRate: real("conversion_rate"), // 0-1

		// Traffic sources breakdown (JSON)
		trafficBySource: text("traffic_by_source"), // e.g. '{"organic": 5000, "paid": 2000}'

		// Metadata
		snapshotDate: text("snapshot_date").notNull(),
		snapshotTimestamp: integer("snapshot_timestamp"),

		createdAt: integer("created_at")
			.notNull()
			.default(sql`(cast(strftime('%s', 'now') * 1000 as integer))`),
	},
	(table) => [
		index("idx_ga4_org_date").on(table.orgId, table.snapshotDate),
		index("idx_ga4_property").on(table.propertyId),
	]
);

/**
 * Email Metrics Snapshots — email campaign performance (Mailchimp/ConvertKit/Substack)
 */
export const emailMetricsSnapshotsTable = sqliteTable(
	"email_metrics_snapshots",
	{
		id: text("id").primaryKey(),
		orgId: text("org_id").notNull(),
		campaignId: text("campaign_id").notNull(),
		campaignName: text("campaign_name").notNull(),
		provider: text("provider").notNull(), // 'mailchimp', 'convertkit', 'substack'

		// List metrics
		listSize: integer("list_size"),
		subscribersAdded: integer("subscribers_added"),

		// Campaign performance
		sendCount: integer("send_count"),
		openCount: integer("open_count"),
		clickCount: integer("click_count"),
		unsubscribeCount: integer("unsubscribe_count"),

		// Rates
		openRate: real("open_rate"), // 0-1
		clickRate: real("click_rate"), // 0-1
		unsubscribeRate: real("unsubscribe_rate"), // 0-1

		// Metadata
		snapshotDate: text("snapshot_date").notNull(),
		snapshotTimestamp: integer("snapshot_timestamp"),

		createdAt: integer("created_at")
			.notNull()
			.default(sql`(cast(strftime('%s', 'now') * 1000 as integer))`),
	},
	(table) => [
		index("idx_email_metrics_org_date").on(table.orgId, table.snapshotDate),
		index("idx_email_metrics_provider").on(table.provider),
	]
);

/**
 * Campaign Anomalies — performance issues and alerts
 */
export const campaignAnomaliesTable = sqliteTable(
	"campaign_anomalies",
	{
		id: text("id").primaryKey(),
		orgId: text("org_id").notNull(),

		// Source
		sourceType: text("source_type").notNull(), // 'google_ads', 'meta_ads', 'ga4', 'email'
		sourceId: text("source_id").notNull(), // campaign_id or property_id
		sourceName: text("source_name"),

		// Anomaly details
		anomalyType: text("anomaly_type").notNull(), // 'budget_overrun', 'low_roas', 'conversion_drop', etc
		metricName: text("metric_name"),
		metricValue: real("metric_value"),
		expectedValue: real("expected_value"),
		threshold: real("threshold"),

		// Severity and status
		severity: text("severity").default("warning"), // 'critical', 'warning', 'info'
		acknowledged: integer("acknowledged", { mode: "boolean" }).default(0),
		acknowledgedAt: integer("acknowledged_at"),
		acknowledgedBy: text("acknowledged_by"),

		detectedAt: integer("detected_at")
			.notNull()
			.default(sql`(cast(strftime('%s', 'now') * 1000 as integer))`),
		createdAt: integer("created_at")
			.notNull()
			.default(sql`(cast(strftime('%s', 'now') * 1000 as integer))`),
	},
	(table) => [
		index("idx_campaign_anomalies_org").on(table.orgId),
		index("idx_campaign_anomalies_source").on(table.sourceType, table.sourceId),
		index("idx_campaign_anomalies_unacknowledged").on(table.acknowledged),
	]
);

// Organization & Team types
export type Organization = typeof organizationsTable.$inferSelect;
export type OrganizationInsert = typeof organizationsTable.$inferInsert;

export type TeamMember = typeof teamMembersTable.$inferSelect;
export type TeamMemberInsert = typeof teamMembersTable.$inferInsert;

export type Brand = typeof brandsTable.$inferSelect;
export type BrandInsert = typeof brandsTable.$inferInsert;

// SERP Tracker types
export type Competitor = typeof competitorsTable.$inferSelect;
export type CompetitorInsert = typeof competitorsTable.$inferInsert;

export type SerpRanking = typeof serpRankingsTable.$inferSelect;
export type SerpRankingInsert = typeof serpRankingsTable.$inferInsert;

// Campaign Metrics types
export type GoogleAdsSnapshot = typeof googleAdsSnapshotsTable.$inferSelect;
export type GoogleAdsSnapshotInsert = typeof googleAdsSnapshotsTable.$inferInsert;

export type DailyBudget = typeof dailyBudgetsTable.$inferSelect;
export type DailyBudgetInsert = typeof dailyBudgetsTable.$inferInsert;

export type MetaAdsSnapshot = typeof metaAdsSnapshotsTable.$inferSelect;
export type MetaAdsSnapshotInsert = typeof metaAdsSnapshotsTable.$inferInsert;

export type GA4Snapshot = typeof ga4SnapshotsTable.$inferSelect;
export type GA4SnapshotInsert = typeof ga4SnapshotsTable.$inferInsert;

export type EmailMetricsSnapshot = typeof emailMetricsSnapshotsTable.$inferSelect;
export type EmailMetricsSnapshotInsert = typeof emailMetricsSnapshotsTable.$inferInsert;

export type CampaignAnomaly = typeof campaignAnomaliesTable.$inferSelect;
export type CampaignAnomalyInsert = typeof campaignAnomaliesTable.$inferInsert;

// ============================================================================
// BATCH 5: BILLING SYSTEM
// ============================================================================

/**
 * Subscriptions — Stripe integration + tier management
 *
 * Tracks SaaS subscription state, billing cycles, and Stripe customer IDs.
 * Links organizations to their tier and payment status.
 */
export const subscriptionsTable = sqliteTable(
	"subscriptions",
	{
		id: text("id").primaryKey(),
		orgId: text("org_id").notNull().unique(),

		// Pricing tier
		tier: text("tier", { enum: ["starter", "pro", "enterprise"] })
			.notNull()
			.default("starter"),

		// Stripe integration
		stripeSubscriptionId: text("stripe_subscription_id").unique(),
		stripeCustomerId: text("stripe_customer_id").unique(),

		// Billing cycle dates (Unix ms)
		billingCycleStart: integer("billing_cycle_start"),
		billingCycleEnd: integer("billing_cycle_end"),
		nextBillingDate: integer("next_billing_date"),

		// Subscription status
		status: text("status", {
			enum: ["active", "past_due", "canceled", "expired"],
		})
			.notNull()
			.default("active"),

		// Payment status
		paymentStatus: text("payment_status", {
			enum: ["paid", "unpaid", "no_payment_method"],
		})
			.notNull()
			.default("paid"),

		// Timestamps
		createdAt: integer("created_at")
			.notNull()
			.default(sql`(cast(strftime('%s', 'now') * 1000 as integer))`),
		updatedAt: integer("updated_at")
			.notNull()
			.default(sql`(cast(strftime('%s', 'now') * 1000 as integer))`),
		canceledAt: integer("canceled_at"),
	},
	(table) => [
		index("idx_subscriptions_org_id").on(table.orgId),
		index("idx_subscriptions_status").on(table.status),
		index("idx_subscriptions_stripe_customer").on(table.stripeCustomerId),
	]
);

/**
 * Tier Limits — defines resource caps per pricing tier
 *
 * Stores max brands, users, competitors, alert rules, and monthly price.
 * Referenced for tier enforcement and billing validation.
 */
export const tierLimitsTable = sqliteTable("tier_limits", {
	id: text("id").primaryKey(),
	tier: text("tier", { enum: ["starter", "pro", "enterprise"] })
		.notNull()
		.unique(),

	// Resource limits
	maxBrands: integer("max_brands").notNull(),
	maxUsers: integer("max_users").notNull(),
	maxCompetitorsPerBrand: integer("max_competitors_per_brand").notNull(),
	maxAlertRules: integer("max_alert_rules").notNull(),

	// Pricing (in cents)
	monthlyPriceCents: integer("monthly_price_cents").notNull(),

	createdAt: integer("created_at")
		.notNull()
		.default(sql`(cast(strftime('%s', 'now') * 1000 as integer))`),
});

/**
 * Stripe Events — webhook event log
 *
 * Audit trail of Stripe webhook events for reconciliation and debugging.
 * Ensures idempotent processing of subscription changes.
 */
export const stripeEventsTable = sqliteTable(
	"stripe_events",
	{
		id: text("id").primaryKey(),
		stripeEventId: text("stripe_event_id").notNull().unique(),

		// Event type (e.g., customer.subscription.created)
		eventType: text("event_type").notNull(),

		// Related IDs
		orgId: text("org_id"),
		subscriptionId: text("subscription_id"),
		stripeSubscriptionId: text("stripe_subscription_id"),

		// Raw event data (JSON string)
		eventData: text("event_data").notNull(),

		// Processing status
		processed: integer("processed", { mode: "boolean" }).default(false),
		error: text("error"),

		createdAt: integer("created_at")
			.notNull()
			.default(sql`(cast(strftime('%s', 'now') * 1000 as integer))`),
		processedAt: integer("processed_at"),
	},
	(table) => [
		index("idx_stripe_events_type").on(table.eventType),
		index("idx_stripe_events_org").on(table.orgId),
		index("idx_stripe_events_processed").on(table.processed),
	]
);

// Types
export type Subscription = typeof subscriptionsTable.$inferSelect;
export type SubscriptionInsert = typeof subscriptionsTable.$inferInsert;

export type TierLimit = typeof tierLimitsTable.$inferSelect;
export type TierLimitInsert = typeof tierLimitsTable.$inferInsert;

export type StripeEvent = typeof stripeEventsTable.$inferSelect;
export type StripeEventInsert = typeof stripeEventsTable.$inferInsert;
