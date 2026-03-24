/**
 * Alert Management API
 *
 * POST   /api/alerts/rules              - Create alert rule
 * GET    /api/alerts/rules              - List alert rules
 * PUT    /api/alerts/rules/{ruleId}     - Update alert rule
 * DELETE /api/alerts/rules/{ruleId}     - Delete alert rule
 * GET    /api/alerts/history            - List alert history
 * POST   /api/alerts/{alertId}/ack      - Acknowledge alert
 * POST   /api/alerts/{alertId}/resolve  - Resolve alert
 */

import { createServerFn } from "@tanstack/start";
import { verifyClerkSession } from "@/server/auth";
import { getRequestAuthContext } from "@/lib/worker-context";
import {
	createAlertRule,
	getAlertRules,
	updateAlertRule,
	deleteAlertRule,
	getAlertHistoryForOrg,
	acknowledgeAlert,
	resolveAlert,
} from "@/lib/db/queries";
import { requirePermission } from "@/server/rbac";
import type { EventContext } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";

/**
 * Create alert rule
 * POST /api/alerts/rules
 */
export const createAlertRuleFn = createServerFn(
	{ method: "POST" },
	async (
		request: Request & {
			json: () => Promise<{
				datasourceId: string;
				ruleType: "latency" | "error_rate" | "downtime" | "sla";
				threshold: number;
				alertChannels: string[];
				cooldownSeconds?: number;
			}>;
		},
		context: EventContext
	) => {
		const session = await verifyClerkSession(request, context.env);
		if (!session) throw new Response("Unauthorized", { status: 401 });

		const auth = getRequestAuthContext(request);
		requirePermission(auth.permissions, "canWrite", "create alert rules");

		const body = await request.json();
		const {
			datasourceId,
			ruleType,
			threshold,
			alertChannels,
			cooldownSeconds,
		} = body;

		const db = drizzle(context.env.DB);
		const rule = await createAlertRule(db, {
			datasourceId,
			ruleType,
			threshold,
			alertChannels: JSON.stringify(alertChannels),
			cooldownSeconds: cooldownSeconds || 3600,
			orgId: auth.orgId,
		});

		return {
			success: true,
			rule,
		};
	}
);

/**
 * Get alert rules for org
 * GET /api/alerts/rules
 */
export const getAlertRulesFn = createServerFn(
	{ method: "GET" },
	async (request: Request, context: EventContext) => {
		const session = await verifyClerkSession(request, context.env);
		if (!session) throw new Response("Unauthorized", { status: 401 });

		const auth = getRequestAuthContext(request);
		requirePermission(auth.permissions, "canRead", "view alert rules");

		const db = drizzle(context.env.DB);
		const rules = await getAlertRules(db, auth.orgId);

		return {
			success: true,
			rules: rules.map((r: any) => ({
				...r,
				alertChannels: JSON.parse(r.alertChannels || "[]"),
			})),
			count: rules.length,
		};
	}
);

/**
 * Update alert rule
 * PUT /api/alerts/rules/{ruleId}
 */
export const updateAlertRuleFn = createServerFn(
	{ method: "PUT" },
	async (
		request: Request & {
			json: () => Promise<{
				ruleId: string;
				threshold?: number;
				alertChannels?: string[];
				enabled?: boolean;
				cooldownSeconds?: number;
			}>;
		},
		context: EventContext
	) => {
		const session = await verifyClerkSession(request, context.env);
		if (!session) throw new Response("Unauthorized", { status: 401 });

		const auth = getRequestAuthContext(request);
		requirePermission(auth.permissions, "canWrite", "update alert rules");

		const body = await request.json();
		const { ruleId, ...updates } = body;

		const db = drizzle(context.env.DB);
		const updated = await updateAlertRule(db, ruleId, {
			...updates,
			alertChannels: updates.alertChannels
				? JSON.stringify(updates.alertChannels)
				: undefined,
		});

		return {
			success: true,
			rule: updated,
		};
	}
);

/**
 * Delete alert rule
 * DELETE /api/alerts/rules/{ruleId}
 */
export const deleteAlertRuleFn = createServerFn(
	{ method: "DELETE" },
	async (
		request: Request & {
			json: () => Promise<{ ruleId: string }>;
		},
		context: EventContext
	) => {
		const session = await verifyClerkSession(request, context.env);
		if (!session) throw new Response("Unauthorized", { status: 401 });

		const auth = getRequestAuthContext(request);
		requirePermission(auth.permissions, "canDelete", "delete alert rules");

		const body = await request.json();
		const { ruleId } = body;

		const db = drizzle(context.env.DB);
		await deleteAlertRule(db, ruleId);

		return {
			success: true,
			message: "Alert rule deleted",
		};
	}
);

/**
 * Get alert history for org
 * GET /api/alerts/history
 */
export const getAlertHistoryFn = createServerFn(
	{ method: "GET" },
	async (request: Request, context: EventContext) => {
		const session = await verifyClerkSession(request, context.env);
		if (!session) throw new Response("Unauthorized", { status: 401 });

		const auth = getRequestAuthContext(request);
		requirePermission(auth.permissions, "canRead", "view alert history");

		const db = drizzle(context.env.DB);
		const history = await getAlertHistoryForOrg(db, auth.orgId, 100);

		return {
			success: true,
			history: history.map((h: any) => ({
				...h,
				context: h.context ? JSON.parse(h.context) : null,
			})),
			count: history.length,
		};
	}
);

/**
 * Acknowledge alert
 * POST /api/alerts/{alertId}/ack
 */
export const acknowledgeAlertFn = createServerFn(
	{ method: "POST" },
	async (
		request: Request & {
			json: () => Promise<{ alertId: string }>;
		},
		context: EventContext
	) => {
		const session = await verifyClerkSession(request, context.env);
		if (!session) throw new Response("Unauthorized", { status: 401 });

		const auth = getRequestAuthContext(request);
		requirePermission(auth.permissions, "canWrite", "acknowledge alerts");

		const body = await request.json();
		const { alertId } = body;

		const db = drizzle(context.env.DB);
		const updated = await acknowledgeAlert(db, alertId, session.userId);

		return {
			success: true,
			alert: updated,
		};
	}
);

/**
 * Resolve alert
 * POST /api/alerts/{alertId}/resolve
 */
export const resolveAlertFn = createServerFn(
	{ method: "POST" },
	async (
		request: Request & {
			json: () => Promise<{ alertId: string }>;
		},
		context: EventContext
	) => {
		const session = await verifyClerkSession(request, context.env);
		if (!session) throw new Response("Unauthorized", { status: 401 });

		const auth = getRequestAuthContext(request);
		requirePermission(auth.permissions, "canWrite", "resolve alerts");

		const body = await request.json();
		const { alertId } = body;

		const db = drizzle(context.env.DB);
		const updated = await resolveAlert(db, alertId);

		return {
			success: true,
			alert: updated,
		};
	}
);
