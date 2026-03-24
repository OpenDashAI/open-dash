import { createFileRoute } from "@tanstack/react-router";
import { getRequestAuthContext } from "../../lib/worker-context";
import { z } from "zod";
import { validate, validationErrorResponse, validators } from "../../lib/validation";

const ciActionSchema = z.discriminatedUnion("action", [
	z.object({ action: z.literal("seed-competitors") }),
	z.object({ action: z.literal("list-competitors") }),
	z.object({ action: z.literal("run-daily-jobs") }),
	z.object({ action: z.literal("run-weekly-jobs") }),
	z.object({ action: z.literal("get-serp-status"), keyword: validators.keyword }),
]);

type Action = z.infer<typeof ciActionSchema>;

export const Route = createFileRoute("/api/competitive-intelligence")({
	server: {
		handlers: {
			POST: async ({ request, context }) => {
				// SECURITY: Require authentication for all CI operations
				const authContext = getRequestAuthContext(request);
				if (!authContext?.userId) {
					return Response.json(
						{ error: "Authentication required" },
						{ status: 401 }
					);
				}

				// SECURITY: Validate input against schema
				let body: Action;
				try {
					const rawBody = (await request.json()) as unknown;
					const validation = validate(ciActionSchema, rawBody);
					if (!validation.success) {
						return validationErrorResponse(validation.errors);
					}
					body = validation.data;
				} catch (parseError) {
					return Response.json(
						{ error: "Invalid JSON in request body" },
						{ status: 400 }
					);
				}

				try {
					switch (body.action) {
						case "seed-competitors":
							return seedCompetitors(context);

						case "list-competitors":
							return listCompetitors(context);

						case "run-daily-jobs":
							return runDailyJobs(context);

						case "run-weekly-jobs":
							return runWeeklyJobs(context);

						case "get-serp-status":
							return getSerpStatus(context, body.keyword);

						default:
							return Response.json(
								{ error: "Unknown action" },
								{ status: 400 }
							);
					}
				} catch (error) {
					return Response.json(
						{
							error:
								error instanceof Error
									? error.message
									: "Unknown error",
						},
						{ status: 500 }
					);
				}
			},
		},
	},
});

async function seedCompetitors(context: any): Promise<Response> {
	try {
		const db = context.env.DB;
		const authContext = context.auth;

		if (!authContext?.brandId) {
			return Response.json(
				{ error: "Brand context required" },
				{ status: 400 }
			);
		}

		// Sample competitors with keywords for demo
		const competitors = [
			{
				domain: "metabase.com",
				name: "Metabase",
				keywords: JSON.stringify([
					"business intelligence",
					"analytics dashboard",
					"data visualization",
				]),
			},
			{
				domain: "grafana.com",
				name: "Grafana",
				keywords: JSON.stringify([
					"monitoring dashboard",
					"time series database",
					"metrics visualization",
				]),
			},
			{
				domain: "tableau.com",
				name: "Tableau",
				keywords: JSON.stringify([
					"business intelligence tool",
					"data analytics",
					"enterprise reporting",
				]),
			},
		];

		const seeded = [];
		for (const competitor of competitors) {
			try {
				// Insert via SQL with new schema
				await db
					.prepare(
						`
          INSERT OR IGNORE INTO competitors
          (id, brandId, orgId, domain, name, keywords, active, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
        `
					)
					.bind(
						crypto.randomUUID(),
						authContext.brandId,
						authContext.orgId,
						competitor.domain,
						competitor.name,
						competitor.keywords,
						Date.now(),
						Date.now()
					)
					.run();

				seeded.push(competitor.name);
			} catch (error) {
				console.error(`Failed to seed ${competitor.name}:`, error);
			}
		}

		return Response.json({
			success: true,
			seeded,
			message: `Initialized ${seeded.length} competitors for brand`,
		});
	} catch (error) {
		throw error;
	}
}

async function listCompetitors(context: any): Promise<Response> {
	try {
		const db = context.env.DB;
		const authContext = context.auth;

		// Get competitors for current brand or org
		const whereClause = authContext?.brandId
			? "WHERE brandId = ?"
			: authContext?.orgId
				? "WHERE orgId = ?"
				: "";

		const bindings = authContext?.brandId
			? [authContext.brandId]
			: authContext?.orgId
				? [authContext.orgId]
				: [];

		const competitors = await db
			.prepare(
				`
      SELECT id, brandId, orgId, domain, name, keywords, active, createdAt, updatedAt
      FROM competitors
      ${whereClause}
      ORDER BY updatedAt DESC
      LIMIT 50
    `
			)
			.bind(...bindings)
			.all();

		return Response.json({
			success: true,
			competitors: (competitors.results || []).map((c: any) => ({
				id: c.id,
				brandId: c.brandId,
				domain: c.domain,
				name: c.name,
				keywords: JSON.parse(c.keywords || "[]"),
				active: Boolean(c.active),
				createdAt: c.createdAt,
				updatedAt: c.updatedAt,
			})),
			count: (competitors.results || []).length,
		});
	} catch (error) {
		return Response.json(
			{
				error:
					error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

async function runDailyJobs(context: any): Promise<Response> {
	// Get org ID from auth context (if available) or use default
	const authContext = context.auth;
	const orgId = authContext?.orgId || "default";

	// Invoke the Durable Object coordinator for this org
	const coordinatorId = context.env.COMPETITIVE_INTEL?.idFromName(
		`ci:${orgId}`
	);
	const coordinator = context.env.COMPETITIVE_INTEL?.get(coordinatorId);

	if (!coordinator) {
		return Response.json(
			{ error: "Durable Object not available" },
			{ status: 503 }
		);
	}

	try {
		const response = await coordinator.fetch(
			new Request("https://coordinator/schedule", { method: "POST" })
		);
		return response;
	} catch (error) {
		return Response.json(
			{
				error:
					error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

async function runWeeklyJobs(context: any): Promise<Response> {
	// Invoke the Durable Object coordinator
	const coordinatorId = context.env.COMPETITIVE_INTEL?.idFromName(
		"default"
	);
	const coordinator = context.env.COMPETITIVE_INTEL?.get(coordinatorId);

	if (!coordinator) {
		return Response.json(
			{ error: "Durable Object not available" },
			{ status: 503 }
		);
	}

	const response = await coordinator.fetch(
		new Request("https://coordinator/run-weekly", { method: "POST" })
	);

	return response;
}

async function getSerpStatus(
	context: any,
	keyword: string
): Promise<Response> {
	try {
		const db = context.env.DB;
		const authContext = context.auth;

		// SECURITY: Validate keyword input
		const keywordValidation = validate(validators.keyword, keyword);
		if (!keywordValidation.success) {
			return validationErrorResponse(keywordValidation.errors);
		}

		const validatedKeyword = keywordValidation.data;

		// Add org/brand filtering if auth context available
		const whereClause = authContext?.brandId
			? "AND sr.brandId = ?"
			: authContext?.orgId
				? "AND sr.orgId = ?"
				: "";

		const bindings = authContext?.brandId
			? [validatedKeyword, authContext.brandId]
			: authContext?.orgId
				? [validatedKeyword, authContext.orgId]
				: [validatedKeyword];

		// Get latest SERP rankings for this keyword
		const results = await db
			.prepare(
				`
      SELECT sr.id, sr.competitorId, sr.keyword, sr.rank, sr.url,
             sr.title, sr.snapshotDate, sr.createdAt,
             c.domain, c.name
      FROM serp_rankings sr
      LEFT JOIN competitors c ON sr.competitorId = c.id
      WHERE sr.keyword = ? ${whereClause}
      ORDER BY sr.snapshotDate DESC, sr.rank ASC
      LIMIT 50
    `
			)
			.bind(...bindings)
			.all();

		return Response.json({
			success: true,
			keyword: validatedKeyword,
			results: (results.results || []).map((r: any) => ({
				id: r.id,
				competitorId: r.competitorId,
				domain: r.domain,
				name: r.name,
				keyword: r.keyword,
				rank: r.rank,
				url: r.url,
				title: r.title,
				snapshotDate: r.snapshotDate,
				createdAt: r.createdAt,
			})),
			count: (results.results || []).length,
		});
	} catch (error) {
		return Response.json(
			{
				error:
					error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}
