import type { BriefingItem } from "../lib/briefing";
import type { DataSource, DataSourceConfig } from "../lib/datasource";

/**
 * Cloudflare Deploys data source.
 * Checks recent Worker deployments for failures.
 * Stub — requires CF API token with Workers read scope.
 */
export const cloudflareDeploysSource: DataSource = {
	id: "cloudflare-deploys",
	name: "Cloudflare Deploys",
	icon: "\u2B06", // ⬆
	description: "Recent Worker deployments and failures",
	requiresConfig: true,

	async fetch(config: DataSourceConfig): Promise<BriefingItem[]> {
		const cfToken = config.env.CF_API_TOKEN;
		const cfAccountId = config.env.CF_ACCOUNT_ID;
		if (!cfToken || !cfAccountId) return [];

		try {
			// Get brand-specific worker name filter
			const brandConfig = config.brandConfig as { worker?: string } | undefined;
			const workerFilter = brandConfig?.worker;

			const res = await fetch(
				`https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/workers/scripts`,
				{
					headers: {
						Authorization: `Bearer ${cfToken}`,
						"Content-Type": "application/json",
					},
				},
			);

			if (!res.ok) return [];

			const data = (await res.json()) as {
				result: Array<{
					id: string;
					modified_on: string;
				}>;
			};

			const lastVisitedMs = config.lastVisited
				? new Date(config.lastVisited).getTime()
				: 0;

			// Filter by worker name if specified
			let workers = data.result;
			if (workerFilter) {
				workers = workers.filter((w) => w.id.includes(workerFilter));
			}

			const recentDeploys = workers.filter(
				(w) =>
					lastVisitedMs > 0 &&
					new Date(w.modified_on).getTime() > lastVisitedMs,
			);

			if (recentDeploys.length === 0) return [];

			return [
				{
					id: "cf-deploys-recent",
					priority: "low",
					category: "deploy",
					title: `${recentDeploys.length} worker${recentDeploys.length > 1 ? "s" : ""} deployed`,
					detail: recentDeploys
						.slice(0, 5)
						.map((w) => w.id)
						.join(", "),
					time: recentDeploys[0].modified_on,
					isNew: true,
				},
			];
		} catch {
			return [];
		}
	},
};
