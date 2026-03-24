import { createFileRoute } from "@tanstack/react-router";

type Action =
	| { action: "seed-competitors" }
	| { action: "list-competitors" }
	| { action: "run-daily-jobs" }
	| { action: "run-weekly-jobs" }
	| { action: "get-serp-status"; keyword: string };

export const Route = createFileRoute("/api/competitive-intelligence")({
	server: {
		handlers: {
			POST: async ({ request, context }) => {
				const body = (await request.json()) as Action;

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

		const competitors = await db
			.prepare(
				`
      SELECT id, name, website_url, domain_authority, traffic_estimate,
             organic_keywords, last_checked, updated_at
      FROM competitor_domains
      ORDER BY updated_at DESC
      LIMIT 50
    `
			)
			.all();

		return Response.json({
			competitors: competitors.results || [],
			count: (competitors.results || []).length,
		});
	} catch (error) {
		throw error;
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

		// Get latest SERP rankings for this keyword
		const results = await db
			.prepare(
				`
      SELECT sr.id, sr.competitorId, sr.keyword, sr.rank, sr.url,
             sr.title, sr.snapshotDate, sr.createdAt,
             c.domain, c.name
      FROM serp_rankings sr
      LEFT JOIN competitors c ON sr.competitorId = c.id
      WHERE sr.keyword = ?
      ORDER BY sr.snapshotDate DESC, sr.rank ASC
      LIMIT 50
    `
			)
			.bind(keyword)
			.all();

		return Response.json({
			keyword,
			results: results.results || [],
			count: (results.results || []).length,
		});
	} catch (error) {
		throw error;
	}
}
