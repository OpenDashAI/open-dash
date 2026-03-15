import { createServerFn } from "@tanstack/react-start";
import type { ActivityEvent, StatusMetric } from "../lib/types";
import { githubFetch } from "./github";

/**
 * Fetch recent activity from GitHub Issues API (comments on #12 session log).
 * Falls back to static data if GITHUB_TOKEN not set.
 */
export const getActivity = createServerFn().handler(
	async (): Promise<ActivityEvent[]> => {
		const token = process.env.GITHUB_TOKEN;
		if (!token) {
			return fallbackEvents();
		}

		try {
			const res = await githubFetch(
				"https://api.github.com/repos/garywu/garywu-vault/issues/12/comments?per_page=10&direction=desc",
				token,
			);

			if (!res.ok) return fallbackEvents();

			const comments = (await res.json()) as Array<{
				id: number;
				body: string;
				created_at: string;
			}>;

			return comments.slice(0, 10).map((c) => ({
				id: String(c.id),
				type: c.body.includes("CLOSE")
					? "success"
					: c.body.includes("OPEN")
						? "info"
						: "info",
				message: c.body.slice(0, 120),
				time: timeAgo(c.created_at),
				source: "github",
			}));
		} catch {
			return fallbackEvents();
		}
	},
);

/**
 * Compute status metrics from current data.
 */
export const getMetrics = createServerFn().handler(
	async (): Promise<StatusMetric[]> => {
		const token = process.env.GITHUB_TOKEN;

		let openIssues = 30;
		let closedIssues = 31;

		if (token) {
			try {
				const [openRes, closedRes] = await Promise.all([
					githubFetch(
						"https://api.github.com/repos/garywu/garywu-vault/issues?state=open&per_page=1",
						token,
					),
					githubFetch(
						"https://api.github.com/repos/garywu/garywu-vault/issues?state=closed&per_page=1",
						token,
					),
				]);

				// GitHub returns total count in Link header
				const openMatch = openRes.headers
					.get("link")
					?.match(/page=(\d+)>; rel="last"/);
				const closedMatch = closedRes.headers
					.get("link")
					?.match(/page=(\d+)>; rel="last"/);
				if (openMatch) openIssues = Number.parseInt(openMatch[1], 10);
				if (closedMatch) closedIssues = Number.parseInt(closedMatch[1], 10);
			} catch {
				// Use defaults
			}
		}

		return [
			{ label: "DRR", value: "$0", change: "10 trains", trend: "flat" },
			{
				label: "Issues",
				value: openIssues,
				change: `${closedIssues} closed`,
				trend: openIssues < 30 ? "down" : "flat",
			},
			{ label: "Machines", value: "3/4", change: "1 offline", trend: "flat" },
			{ label: "L3 Queue", value: "0", change: "idle", trend: "flat" },
		];
	},
);

function timeAgo(dateStr: string): string {
	const diff = Date.now() - new Date(dateStr).getTime();
	const mins = Math.floor(diff / 60000);
	if (mins < 60) return `${mins}m ago`;
	const hours = Math.floor(mins / 60);
	if (hours < 24) return `${hours}h ago`;
	return `${Math.floor(hours / 24)}d ago`;
}

function fallbackEvents(): ActivityEvent[] {
	return [
		{
			id: "1",
			type: "success",
			message: "Blog archetype shipped (#94)",
			time: "2m ago",
		},
		{
			id: "2",
			type: "info",
			message: "Code Turtle core engine deployed",
			time: "15m ago",
		},
		{
			id: "3",
			type: "warning",
			message: "vibemarketing.pro expires in 3 days",
			time: "1h ago",
		},
		{
			id: "4",
			type: "info",
			message: "Train 10 complete — 5/5 sessions",
			time: "2h ago",
		},
		{
			id: "5",
			type: "error",
			message: "API Mom auth bypass detected (#115)",
			time: "3h ago",
		},
	];
}
