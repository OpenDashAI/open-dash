import { createServerFn } from "@tanstack/react-start";
import { githubFetch } from "./github";

interface Issue {
	number: number;
	title: string;
	labels: string[];
	state: "open" | "closed";
	assignee?: string;
	updatedAt?: string;
}

/**
 * Fetch open issues from GitHub, grouped by team label.
 */
export const getIssues = createServerFn().handler(
	async (): Promise<Issue[]> => {
		const token = process.env.GITHUB_TOKEN;
		if (!token) return fallbackIssues();

		try {
			const res = await githubFetch(
				"https://api.github.com/repos/garywu/garywu-vault/issues?state=open&per_page=100&sort=updated",
				token,
			);

			if (!res.ok) return fallbackIssues();

			const data = (await res.json()) as Array<{
				number: number;
				title: string;
				labels: Array<{ name: string }>;
				state: string;
				assignee?: { login: string };
				pull_request?: unknown;
				updated_at: string;
			}>;

			return data
				.filter((i) => !i.pull_request) // Exclude PRs
				.map((i) => ({
					number: i.number,
					title: i.title,
					labels: i.labels.map((l) => l.name),
					state: i.state as "open" | "closed",
					assignee: i.assignee?.login,
					updatedAt: i.updated_at,
				}));
		} catch {
			return fallbackIssues();
		}
	},
);

function fallbackIssues(): Issue[] {
	return [
		{
			number: 115,
			title: "Security sweep",
			labels: ["team-3-infra"],
			state: "open",
		},
		{
			number: 94,
			title: "Blog archetype",
			labels: ["team-1-pp"],
			state: "open",
		},
		{
			number: 96,
			title: "Tool/Converter archetype",
			labels: ["team-1-pp"],
			state: "open",
		},
		{
			number: 68,
			title: "Channel activation: search + email",
			labels: ["team-2-sm"],
			state: "open",
		},
		{
			number: 114,
			title: "Code Turtle product epic",
			labels: ["team-3-infra"],
			state: "open",
		},
	];
}
