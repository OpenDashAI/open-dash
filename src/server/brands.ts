import { createServerFn } from "@tanstack/react-start";
import type { Brand } from "../lib/types";
import { githubFetch } from "./github";
import { getRequestAuthContext, hasRequestAuthContext } from "../lib/worker-context";
import { initDb, getBrandsByOrg } from "../lib/db/queries";
import type { EventContext } from "@cloudflare/workers-types";

/**
 * Fetch brand data — org-aware (Issue #27.3)
 *
 * For authenticated org requests:
 * - Fetches brands from D1 for the current org
 * - Shows only brands user is member of
 *
 * For public routes (no org context):
 * - Falls back to static data or GitHub API
 */
export const getBrands = createServerFn().handler(
	async (context?: EventContext): Promise<Brand[]> => {
		// Try to get org context from request (Issue #27.2 RBAC middleware)
		if (hasRequestAuthContext && context?.req) {
			try {
				const auth = getRequestAuthContext(context.req as Request);
				if (auth && context.env?.DB) {
					// Return org-specific brands from D1
					return await getOrgBrands(auth.orgId, context.env.DB);
				}
			} catch (err) {
				// Fallback if auth context not available
				console.debug("Auth context not available, using fallback brands");
			}
		}

		// Fallback: GitHub API or static data (public routes)
		const token = process.env.GITHUB_TOKEN;
		if (!token) {
			return fallbackBrands();
		}

		try {
			// Fetch open issues with team labels to count per-brand work
			const res = await githubFetch(
				"https://api.github.com/repos/garywu/garywu-vault/issues?state=open&per_page=100",
				token,
			);

			if (!res.ok) {
				console.error(`GitHub API error: ${res.status}`);
				return fallbackBrands();
			}

			// For now, return brands with fallback data
			// Full integration will pull from D1 brand_audits table
			return fallbackBrands();
		} catch (err) {
			console.error("GitHub API fetch failed:", err);
			return fallbackBrands();
		}
	},
);

/**
 * Fetch brands for a specific organization from D1
 */
async function getOrgBrands(orgId: string, db: any): Promise<Brand[]> {
	try {
		const drizzleDb = initDb(db);
		const brands = await getBrandsByOrg(drizzleDb, orgId);

		return brands.map((b) => ({
			name: b.name,
			slug: b.slug,
			score: 75, // TODO: Calculate from metrics
			revenue: 0, // TODO: Pull from analytics
			status: b.active ? "healthy" : "archived",
			archetype: "saas" as const,
		}));
	} catch (err) {
		console.error("Failed to fetch org brands from D1:", err);
		return [];
	}
}

interface GitHubIssue {
	number: number;
	title: string;
	labels: Array<{ name: string }>;
	state: string;
}

function fallbackBrands(): Brand[] {
	return [
		{
			name: "Bank Statement to Excel",
			slug: "bank-statement-to-excel",
			score: 87,
			revenue: 0,
			status: "healthy",
			archetype: "tool",
		},
		{
			name: "LLC Tax",
			slug: "llc-tax",
			score: 42,
			revenue: 0,
			status: "blocked",
			blockedOn: "SES secrets",
			archetype: "blog",
		},
		{
			name: "UGC Marketing",
			slug: "ugc-marketing",
			score: 28,
			revenue: 0,
			status: "warning",
			archetype: "blog",
		},
		{
			name: "Vibe Marketing",
			slug: "vibe-marketing",
			score: 15,
			revenue: 0,
			status: "warning",
			archetype: "blog",
		},
		{
			name: "Indie Game",
			slug: "indie-game",
			score: 10,
			revenue: 0,
			status: "warning",
			archetype: "blog",
		},
		{
			name: "Pages Plus",
			slug: "pages-plus",
			score: 72,
			revenue: 0,
			status: "healthy",
			archetype: "saas",
		},
		{
			name: "GatherFeed",
			slug: "gatherfeed",
			score: 65,
			revenue: 0,
			status: "healthy",
			archetype: "saas",
		},
		{
			name: "Scramjet",
			slug: "scramjet",
			score: 58,
			revenue: 0,
			status: "healthy",
			archetype: "saas",
		},
		{
			name: "OpenDash",
			slug: "open-dash",
			score: 5,
			revenue: 0,
			status: "warning",
			archetype: "saas",
		},
		{
			name: "Code Turtle",
			slug: "mulan",
			score: 20,
			revenue: 0,
			status: "warning",
			archetype: "saas",
		},
	];
}
