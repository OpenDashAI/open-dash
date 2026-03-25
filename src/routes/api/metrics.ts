/**
 * Scram Jet Metrics Webhook Handler
 * Export handler function for use in worker.ts middleware
 *
 * POST /api/metrics - Receive metrics from Scram Jet pipelines
 * GET /api/metrics - Retrieve recent metrics
 */

import { drizzle } from "drizzle-orm/d1";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { metricsTable } from "@/lib/db/schema";

const MetricSchema = z.object({
	id: z.string().min(1),
	source: z.string().min(1),
	priority: z.enum(["high", "normal", "low"]).default("normal"),
	category: z.string().default("unknown"),
	title: z.string().min(1),
	detail: z.string().min(1),
	timestamp: z.number().optional(),
	metadata: z.any().optional(),
});

// IP whitelist for security
const METRICS_IP_WHITELIST = ["76.240.123.80"];

function checkIP(request: Request): boolean {
	const clientIp = request.headers.get("cf-connecting-ip") ||
	                 request.headers.get("x-forwarded-for")?.split(",")[0] ||
	                 "unknown";
	return METRICS_IP_WHITELIST.includes(clientIp.trim());
}

export async function metricsHandler(request: Request, context: any): Promise<Response> {
	try {
		// Check IP whitelist
		if (!checkIP(request)) {
			const clientIp = request.headers.get("cf-connecting-ip") || "unknown";
			console.warn(`[Metrics] IP denied: ${clientIp}`);
			return new Response(JSON.stringify({ success: false, error: "Access denied" }), {
				status: 403,
				headers: { "Content-Type": "application/json" },
			});
		}

		if (request.method === "POST") {
			return handleMetricsPost(request, context);
		} else if (request.method === "GET") {
			return handleMetricsGet(request, context);
		}
		return new Response("Method not allowed", { status: 405 });
	} catch (error) {
		console.error("[Metrics Handler Error]", error);
		return new Response(JSON.stringify({ success: false, error: String(error) }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}

async function handleMetricsPost(request: Request, context: any): Promise<Response> {
	try {
		const authHeader = request.headers.get("Authorization");
		const secret = context.env?.SCRAMJET_WEBHOOK_SECRET;

		if (!secret || authHeader !== `Bearer ${secret}`) {
			return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
				status: 401,
				headers: { "Content-Type": "application/json" },
			});
		}

		const body = await request.json();
		const metric = MetricSchema.parse(body);

		const db = drizzle(context.env.DB);
		await db.insert(metricsTable).values({
			id: metric.id,
			source: metric.source,
			priority: metric.priority,
			category: metric.category,
			title: metric.title,
			detail: metric.detail,
			timestamp: metric.timestamp ?? Date.now(),
			metadata: metric.metadata ? JSON.stringify(metric.metadata) : null,
		});

		return new Response(
			JSON.stringify({
				success: true,
				metric: { id: metric.id, source: metric.source },
			}),
			{ status: 200, headers: { "Content-Type": "application/json" } }
		);
	} catch (error) {
		console.error("[Metrics POST]", error);
		return new Response(JSON.stringify({ success: false, error: String(error) }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}

async function handleMetricsGet(request: Request, context: any): Promise<Response> {
	try {
		const url = new URL(request.url);
		const limit = Math.min(parseInt(url.searchParams.get("limit") || "10") || 10, 100);
		const source = url.searchParams.get("source");
		const priority = url.searchParams.get("priority");

		const db = drizzle(context.env.DB);

		let query = db.select().from(metricsTable);

		if (source) {
			query = query.where(eq(metricsTable.source, source));
		}
		if (priority) {
			query = query.where(eq(metricsTable.priority, priority));
		}

		const results = await query
			.orderBy(desc(metricsTable.createdAt))
			.limit(limit);

		return new Response(
			JSON.stringify({
				success: true,
				metrics: results || [],
			}),
			{ status: 200, headers: { "Content-Type": "application/json" } }
		);
	} catch (error) {
		console.error("[Metrics GET]", error);
		return new Response(JSON.stringify({ success: false, error: String(error) }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
