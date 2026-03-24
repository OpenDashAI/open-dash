import type { BriefingItem } from "../lib/briefing";
import type { DataSource, DataSourceConfig } from "../lib/datasource";

/**
 * GitHub Activity data source.
 * Fetches session log comments from issue #12.
 */
export const githubActivitySource: DataSource = {
	id: "github-activity",
	name: "Session Log",
	icon: "\u2302", // ⌂
	description: "Recent session activity from GitHub issue #12",
	requiresConfig: true,

	async fetch(config: DataSourceConfig): Promise<BriefingItem[]> {
		const token = config.env.GITHUB_TOKEN;
		if (!token) return [];

		// Get brand-specific repo from config, fallback to vault
		const brandConfig = config.brandConfig as { repo?: string } | undefined;
		const repo = brandConfig?.repo || "garywu/garywu-vault";

		const res = await fetch(
			`https://api.github.com/repos/${repo}/issues/12/comments?per_page=10&direction=desc`,
			{
				headers: {
					Authorization: `token ${token}`,
					Accept: "application/vnd.github.v3+json",
					"User-Agent": "OpenDash/1.0",
				},
			},
		);

		if (!res.ok) return [];

		const comments = (await res.json()) as Array<{
			id: number;
			body: string;
			created_at: string;
		}>;

		const items: BriefingItem[] = [];

		// Surface errors and warnings from session log
		for (const c of comments.slice(0, 5)) {
			if (c.body.includes("ERROR") || c.body.includes("FAIL")) {
				items.push({
					id: `gh-activity-error-${c.id}`,
					priority: "high",
					category: "health",
					title: c.body.slice(0, 120),
					time: c.created_at,
					action: "Investigate",
					isNew: true,
				});
			}
		}

		return items;
	},
};
