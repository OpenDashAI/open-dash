/**
 * Metrics Collector Worker
 *
 * Receives metrics from Scram Jet pipelines via service binding (RPC)
 * Validates, transforms, and stores metrics in D1
 *
 * Called from Scram Jet:
 * await env.METRICS_COLLECTOR.recordMetric({ id, source, ... })
 */

import { drizzle } from "drizzle-orm/d1";
import { z } from "zod";
import { metricsTable } from "../../../src/lib/db/schema";

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

type MetricInput = z.infer<typeof MetricSchema>;

interface MetricResult {
	success: boolean;
	metricId?: string;
	error?: string;
}

/**
 * Metrics Collector — Durable Object / Service Binding Handler
 *
 * Handles metric ingestion from Scram Jet pipelines
 */
export class MetricsCollector {
	env: Env;
	state: DurableObjectState;

	constructor(state: DurableObjectState, env: Env) {
		this.state = state;
		this.env = env;
	}

	/**
	 * Record a metric from Scram Jet pipeline
	 * Called via service binding: await env.METRICS_COLLECTOR.recordMetric(metric)
	 */
	async recordMetric(metricData: unknown): Promise<MetricResult> {
		try {
			// Validate input
			const metric = MetricSchema.parse(metricData);

			// Initialize D1 database
			const db = drizzle(this.env.DB);

			// Insert metric
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

			return {
				success: true,
				metricId: metric.id,
			};
		} catch (error) {
			console.error("[MetricsCollector Error]", error);
			return {
				success: false,
				error: String(error),
			};
		}
	}

	/**
	 * Fetch worker stub for HTTP (optional, for testing)
	 */
	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname === "/health") {
			return new Response(JSON.stringify({ status: "ok" }), {
				headers: { "Content-Type": "application/json" },
			});
		}

		return new Response("Metrics Collector Worker (use service bindings)", {
			status: 200,
		});
	}
}

/**
 * Default export: Worker entrypoint
 * Handles HTTP requests and exposes the MetricsCollector class
 */
export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname === "/health") {
			return new Response(JSON.stringify({ status: "ok" }), {
				headers: { "Content-Type": "application/json" },
			});
		}

		return new Response("Metrics Collector Worker (use service bindings)", {
			status: 200,
		});
	},
};

interface Env {
	DB: D1Database;
}
