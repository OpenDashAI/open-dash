/**
 * Type-safe query helpers for D1 database
 * All queries are parameterized and validated
 */

import {
	eq,
	gte,
	lte,
	and,
	or,
	desc,
	asc,
	count,
	avg,
	max,
	min,
} from "drizzle-orm";
import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";
import {
	datasourceMetricsTable,
	datasourceStatusTable,
	alertRulesTable,
	alertHistoryTable,
	organizationsTable,
	teamMembersTable,
	brandsTable,
	type DatasourceMetric,
	type DatasourceStatus,
	type AlertRule,
	type AlertHistory,
	type Organization,
	type OrganizationInsert,
	type TeamMember,
	type TeamMemberInsert,
	type Brand,
	type BrandInsert,
} from "./schema";

export type {
	DatasourceMetric,
	DatasourceStatus,
	AlertRule,
	AlertHistory,
	Organization,
	OrganizationInsert,
	TeamMember,
	TeamMemberInsert,
	Brand,
	BrandInsert,
};

/**
 * Initialize Drizzle client for D1
 */
export function initDb(db: D1Database) {
	return drizzle(db);
}

/**
 * METRICS QUERIES
 */

export async function getLatestMetrics(
	db: ReturnType<typeof initDb>,
	datasourceId: string
) {
	return db
		.select()
		.from(datasourceMetricsTable)
		.where(eq(datasourceMetricsTable.datasourceId, datasourceId))
		.orderBy(desc(datasourceMetricsTable.timestamp))
		.limit(1);
}

export async function getMetricsInRange(
	db: ReturnType<typeof initDb>,
	datasourceId: string,
	startTime: number,
	endTime: number,
	maxResults: number = 1000
) {
	return db
		.select()
		.from(datasourceMetricsTable)
		.where(
			and(
				eq(datasourceMetricsTable.datasourceId, datasourceId),
				gte(datasourceMetricsTable.timestamp, startTime),
				lte(datasourceMetricsTable.timestamp, endTime)
			)
		)
		.orderBy(desc(datasourceMetricsTable.timestamp))
		.limit(maxResults);
}

/**
 * Get metrics for last N hours
 */
export async function getMetricsLastNHours(
	db: ReturnType<typeof initDb>,
	datasourceId: string,
	hours: number
) {
	const now = Date.now();
	const startTime = now - hours * 3600000; // milliseconds

	return getMetricsInRange(db, datasourceId, startTime, now);
}

/**
 * Get aggregated metrics for a datasource (for trending/analytics)
 */
export async function getMetricsAggregate(
	db: ReturnType<typeof initDb>,
	datasourceId: string,
	startTime: number,
	endTime: number
) {
	return db
		.select({
			avgLatency: avg(datasourceMetricsTable.fetchLatency),
			maxLatency: max(datasourceMetricsTable.fetchLatency),
			minLatency: min(datasourceMetricsTable.fetchLatency),
			avgErrorRate: avg(datasourceMetricsTable.errorRate),
			maxErrorRate: max(datasourceMetricsTable.errorRate),
			totalSamples: count(),
		})
		.from(datasourceMetricsTable)
		.where(
			and(
				eq(datasourceMetricsTable.datasourceId, datasourceId),
				gte(datasourceMetricsTable.timestamp, startTime),
				lte(datasourceMetricsTable.timestamp, endTime)
			)
		);
}

/**
 * Insert a new metric
 */
export async function insertMetric(
	db: ReturnType<typeof initDb>,
	metric: typeof datasourceMetricsTable.$inferInsert
) {
	return await db.insert(datasourceMetricsTable).values(metric);
}

/**
 * STATUS QUERIES
 */

export async function getStatus(
	db: ReturnType<typeof initDb>,
	datasourceId: string
) {
	return db
		.select()
		.from(datasourceStatusTable)
		.where(eq(datasourceStatusTable.id, datasourceId));
}

export async function getAllStatus(db: ReturnType<typeof initDb>) {
	return db.select().from(datasourceStatusTable);
}

export async function upsertStatus(
	db: ReturnType<typeof initDb>,
	status: typeof datasourceStatusTable.$inferInsert
) {
	// SQLite doesn't have UPSERT, so we do insert or update manually
	return db
		.insert(datasourceStatusTable)
		.values(status)
		.onConflictDoUpdate({
			target: datasourceStatusTable.id,
			set: status,
		});
}

/**
 * ALERT RULES QUERIES
 */

export async function getRules(
	db: ReturnType<typeof initDb>,
	datasourceId: string
) {
	return db
		.select()
		.from(alertRulesTable)
		.where(
			and(
				eq(alertRulesTable.datasourceId, datasourceId),
				eq(alertRulesTable.enabled, true)
			)
		);
}

export async function getRule(
	db: ReturnType<typeof initDb>,
	ruleId: string
) {
	return db
		.select()
		.from(alertRulesTable)
		.where(eq(alertRulesTable.id, ruleId));
}

export async function createRule(
	db: ReturnType<typeof initDb>,
	rule: typeof alertRulesTable.$inferInsert
) {
	return db.insert(alertRulesTable).values(rule);
}

export async function disableRule(
	db: ReturnType<typeof initDb>,
	ruleId: string
) {
	return db
		.update(alertRulesTable)
		.set({ enabled: false })
		.where(eq(alertRulesTable.id, ruleId));
}

/**
 * ALERT HISTORY QUERIES
 */

export async function getAlertHistory(
	db: ReturnType<typeof initDb>,
	datasourceId: string,
	hours: number = 24
) {
	const now = Date.now();
	const startTime = now - hours * 3600000;

	return db
		.select()
		.from(alertHistoryTable)
		.where(
			and(
				eq(alertHistoryTable.datasourceId, datasourceId),
				gte(alertHistoryTable.triggeredAt, startTime)
			)
		)
		.orderBy(desc(alertHistoryTable.triggeredAt));
}

export async function getActiveAlerts(
	db: ReturnType<typeof initDb>,
	datasourceId: string
) {
	return db
		.select()
		.from(alertHistoryTable)
		.where(
			and(
				eq(alertHistoryTable.datasourceId, datasourceId),
				eq(alertHistoryTable.state, "triggered")
			)
		)
		.orderBy(desc(alertHistoryTable.triggeredAt));
}

export async function recordAlert(
	db: ReturnType<typeof initDb>,
	alert: typeof alertHistoryTable.$inferInsert
) {
	return db.insert(alertHistoryTable).values(alert);
}

export async function acknowledgeAlert(
	db: ReturnType<typeof initDb>,
	alertId: string,
	acknowledgedBy: string
) {
	const now = Date.now();
	return db
		.update(alertHistoryTable)
		.set({
			state: "acknowledged",
			acknowledgedAt: now,
			acknowledgedBy,
		})
		.where(eq(alertHistoryTable.id, alertId));
}

export async function resolveAlert(
	db: ReturnType<typeof initDb>,
	alertId: string
) {
	const now = Date.now();
	return db
		.update(alertHistoryTable)
		.set({
			state: "resolved",
			resolvedAt: now,
		})
		.where(eq(alertHistoryTable.id, alertId));
}

/**
 * HEALTH STATUS HELPERS
 */

/**
 * Calculate health status from error rate and connection state
 */
export function computeHealthStatus(
	connected: boolean,
	errorRate: number
): "healthy" | "degraded" | "critical" {
	if (!connected) return "critical";
	if (errorRate > 0.5) return "critical";
	if (errorRate > 0.2) return "degraded";
	return "healthy";
}

/**
 * Calculate uptime percentage from metrics
 */
export function calculateUptime(
	metrics: Array<{ connected: boolean }>
): number {
	if (metrics.length === 0) return 0;
	const connected = metrics.filter((m) => m.connected).length;
	return connected / metrics.length;
}

/**
 * Calculate mean time between failures
 */
export function calculateMtbf(
	metrics: Array<{ connected: boolean; timestamp: number }>
): number | null {
	// Find transitions from connected=true to connected=false
	const failures: number[] = [];

	for (let i = 1; i < metrics.length; i++) {
		if (metrics[i - 1].connected && !metrics[i].connected) {
			// Start of failure
			failures.push(metrics[i].timestamp);
		}
	}

	if (failures.length === 0) return null;

	// Average time between failures
	let totalTime = 0;
	for (let i = 1; i < failures.length; i++) {
		totalTime += failures[i] - failures[i - 1];
	}

	return Math.round(totalTime / (failures.length - 1) / 1000); // Convert to seconds
}

/**
 * ORGANIZATION QUERIES
 */

export async function createOrganization(
	db: ReturnType<typeof initDb>,
	org: OrganizationInsert
) {
	return db.insert(organizationsTable).values(org);
}

export async function getOrganization(
	db: ReturnType<typeof initDb>,
	orgId: string
) {
	return db
		.select()
		.from(organizationsTable)
		.where(eq(organizationsTable.id, orgId))
		.limit(1);
}

export async function getOrganizationBySlug(
	db: ReturnType<typeof initDb>,
	slug: string
) {
	return db
		.select()
		.from(organizationsTable)
		.where(eq(organizationsTable.slug, slug))
		.limit(1);
}

export async function getOrganizationByClerkId(
	db: ReturnType<typeof initDb>,
	clerkId: string
) {
	return db
		.select()
		.from(organizationsTable)
		.where(eq(organizationsTable.clerkId, clerkId))
		.limit(1);
}

export async function updateOrganization(
	db: ReturnType<typeof initDb>,
	orgId: string,
	updates: Partial<Organization>
) {
	return db
		.update(organizationsTable)
		.set(updates)
		.where(eq(organizationsTable.id, orgId));
}

/**
 * TEAM MEMBER QUERIES
 */

export async function addTeamMember(
	db: ReturnType<typeof initDb>,
	member: TeamMemberInsert
) {
	return db.insert(teamMembersTable).values(member);
}

export async function getTeamMember(
	db: ReturnType<typeof initDb>,
	orgId: string,
	userId: string
) {
	return db
		.select()
		.from(teamMembersTable)
		.where(
			and(
				eq(teamMembersTable.orgId, orgId),
				eq(teamMembersTable.userId, userId)
			)
		)
		.limit(1);
}

export async function getTeamMembers(
	db: ReturnType<typeof initDb>,
	orgId: string
) {
	return db
		.select()
		.from(teamMembersTable)
		.where(
			and(
				eq(teamMembersTable.orgId, orgId),
				eq(teamMembersTable.active, true)
			)
		)
		.orderBy(asc(teamMembersTable.createdAt));
}

export async function getPendingInvites(
	db: ReturnType<typeof initDb>,
	orgId: string
) {
	return db
		.select()
		.from(teamMembersTable)
		.where(
			and(
				eq(teamMembersTable.orgId, orgId),
				eq(teamMembersTable.acceptedAt, null)
			)
		);
}

export async function acceptInvite(
	db: ReturnType<typeof initDb>,
	memberId: string
) {
	const now = Date.now();
	return db
		.update(teamMembersTable)
		.set({ acceptedAt: now })
		.where(eq(teamMembersTable.id, memberId));
}

export async function removeTeamMember(
	db: ReturnType<typeof initDb>,
	memberId: string
) {
	return db
		.update(teamMembersTable)
		.set({ active: false })
		.where(eq(teamMembersTable.id, memberId));
}

/**
 * BRAND QUERIES
 */

export async function createBrand(
	db: ReturnType<typeof initDb>,
	brand: BrandInsert
) {
	return db.insert(brandsTable).values(brand);
}

export async function getBrand(db: ReturnType<typeof initDb>, brandId: string) {
	return db
		.select()
		.from(brandsTable)
		.where(eq(brandsTable.id, brandId))
		.limit(1);
}

export async function getBrandsByOrg(
	db: ReturnType<typeof initDb>,
	orgId: string
) {
	return db
		.select()
		.from(brandsTable)
		.where(
			and(eq(brandsTable.orgId, orgId), eq(brandsTable.active, true))
		)
		.orderBy(asc(brandsTable.createdAt));
}

export async function getBrandByDomain(
	db: ReturnType<typeof initDb>,
	domain: string
) {
	return db
		.select()
		.from(brandsTable)
		.where(eq(brandsTable.domain, domain))
		.limit(1);
}

export async function updateBrand(
	db: ReturnType<typeof initDb>,
	brandId: string,
	updates: Partial<Brand>
) {
	return db
		.update(brandsTable)
		.set(updates)
		.where(eq(brandsTable.id, brandId));
}

export async function archiveBrand(
	db: ReturnType<typeof initDb>,
	brandId: string
) {
	const now = Date.now();
	return db
		.update(brandsTable)
		.set({ archived: true, archivedAt: now })
		.where(eq(brandsTable.id, brandId));
}
