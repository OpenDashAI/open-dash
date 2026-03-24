import type { BriefingItem } from "../lib/briefing";
import type { DataSource, DataSourceConfig } from "../lib/datasource";

/**
 * GitHub Issues data source.
 * Fetches open issues from the vault repo and generates briefing items.
 */
export const githubIssuesSource: DataSource = {
	id: "github-issues",
	name: "GitHub Issues",
	icon: "\u2691", // ⚑
	description: "Open issues from your GitHub repositories",
	requiresConfig: true,

	async fetch(config: DataSourceConfig): Promise<BriefingItem[]> {
		const token = config.env.GITHUB_TOKEN;
		if (!token) return [];

		// Get brand-specific repo from config, fallback to vault
		const brandConfig = config.brandConfig as
			| { repo?: string; labels?: string[] }
			| undefined;
		const repo = brandConfig?.repo || "garywu/garywu-vault";
		const labels = brandConfig?.labels || [];

		// Build query with optional labels filter
		const labelQuery =
			labels.length > 0 ? `&labels=${labels.join(",")}` : "";

		const res = await fetch(
			`https://api.github.com/repos/${repo}/issues?state=open&per_page=100&sort=updated${labelQuery}`,
			{
				headers: {
					Authorization: `token ${token}`,
					Accept: "application/vnd.github.v3+json",
					"User-Agent": "OpenDash/1.0",
				},
			},
		);

		if (!res.ok) return [];

		const data = (await res.json()) as Array<{
			number: number;
			title: string;
			labels: Array<{ name: string }>;
			state: string;
			pull_request?: unknown;
			updated_at: string;
		}>;

		const lastVisitedMs = config.lastVisited
			? new Date(config.lastVisited).getTime()
			: 0;

		const issues = data.filter((i) => !i.pull_request);

		// Top 5 issues as briefing items
		const items: BriefingItem[] = issues.slice(0, 5).map((issue) => {
			const teamLabel = issue.labels
				.map((l) => l.name)
				.find((l) => l.startsWith("team-"));
			return {
				id: `gh-issue-${issue.number}`,
				priority: "normal" as const,
				category: "issue" as const,
				title: `#${issue.number} ${issue.title}`,
				detail: teamLabel || undefined,
				time: issue.updated_at,
				action: "View",
				actionUrl: `https://github.com/${repo}/issues/${issue.number}`,
				isNew:
					lastVisitedMs > 0 &&
					new Date(issue.updated_at).getTime() > lastVisitedMs,
			};
		});

		if (issues.length > 5) {
			const teamCounts: Record<string, number> = {};
			for (const issue of issues) {
				for (const label of issue.labels.map((l) => l.name)) {
					if (label.startsWith("team-")) {
						teamCounts[label] = (teamCounts[label] || 0) + 1;
					}
				}
			}
			items.push({
				id: "gh-issues-more",
				priority: "low",
				category: "issue",
				title: `${issues.length - 5} more open issues`,
				detail: Object.entries(teamCounts)
					.map(([team, count]) => `${team}: ${count}`)
					.join(", "),
				time: new Date().toISOString(),
			});
		}

		return items;
	},
};
