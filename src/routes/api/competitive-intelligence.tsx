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

		// Use hardcoded list for Week 2
		const competitors = [
			{
				id: "metabase",
				name: "Metabase",
				websiteUrl: "https://www.metabase.com",
				dataSource: "manual",
				confidenceScore: 0.8,
			},
			{
				id: "grafana",
				name: "Grafana",
				websiteUrl: "https://grafana.com",
				dataSource: "manual",
				confidenceScore: 0.8,
			},
			{
				id: "tableau",
				name: "Tableau",
				websiteUrl: "https://www.tableau.com",
				dataSource: "manual",
				confidenceScore: 0.8,
			},
			{
				id: "looker",
				name: "Looker",
				websiteUrl: "https://www.looker.com",
				dataSource: "manual",
				confidenceScore: 0.8,
			},
			{
				id: "power-bi",
				name: "Power BI",
				websiteUrl: "https://powerbi.microsoft.com",
				dataSource: "manual",
				confidenceScore: 0.8,
			},
		];

		const seeded = [];
		for (const competitor of competitors) {
			try {
				// Insert via SQL since we may not have Drizzle in API context
				await db.prepare(
					`
          INSERT OR IGNORE INTO competitor_domains
          (id, name, website_url, data_source, confidence_score, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `
				).bind(
					competitor.id,
					competitor.name,
					competitor.websiteUrl,
					competitor.dataSource,
					competitor.confidenceScore,
					Date.now(),
					Date.now()
				).first();

				seeded.push(competitor.name);
			} catch (error) {
				console.error(`Failed to seed ${competitor.name}:`, error);
			}
		}

		return Response.json({
			success: true,
			seeded,
			message: `Initialized ${seeded.length} competitors`,
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
		new Request("https://coordinator/run-daily", { method: "POST" })
	);

	return response;
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

		// Get latest SERP data for this keyword
		const results = await db
			.prepare(
				`
      SELECT competitor_id, rank_position, rank_change, trend,
             rank_date, created_at
      FROM competitor_serp
      WHERE keyword = ?
      ORDER BY rank_date DESC, created_at DESC
      LIMIT 20
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
