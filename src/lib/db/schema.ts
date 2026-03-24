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

		// Tertiary: health status tracking
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

		// Index for querying
		createdAt: integer("created_at")
			.notNull()
			.default(sql`(cast(strftime('%s', 'now') * 1000 as integer))`),
	},
	(table) => [
		index("idx_rule_alerts").on(table.ruleId),
		index("idx_datasource_history").on(table.datasourceId),
		index("idx_state_triggered").on(table.state, table.triggeredAt),
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
