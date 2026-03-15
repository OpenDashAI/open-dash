import { createServerFn } from "@tanstack/react-start";
import type { BriefingItem } from "../lib/briefing";
import type { DataSourceConfig, DataSourceStatus } from "../lib/datasource";
import { registry } from "../datasources";

export interface DataSourceInfo {
	id: string;
	name: string;
	icon: string;
	description: string;
	requiresConfig: boolean;
	status: DataSourceStatus;
}

/** Fetch briefing items from all registered data sources */
export const fetchAllSources = createServerFn().handler(
	async ({
		data,
	}: {
		data: { lastVisited: string | null };
	}): Promise<{
		items: BriefingItem[];
		sources: DataSourceInfo[];
	}> => {
		const config: DataSourceConfig = {
			env: {
				GITHUB_TOKEN: process.env.GITHUB_TOKEN,
				TAILSCALE_API_KEY: process.env.TAILSCALE_API_KEY,
				STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
				CF_API_TOKEN: process.env.CF_API_TOKEN,
				CF_ACCOUNT_ID: process.env.CF_ACCOUNT_ID,
				SM_API_URL: process.env.SM_API_URL,
				SM_SERVICE_KEY: process.env.SM_SERVICE_KEY,
			},
			lastVisited: data.lastVisited,
		};

		const { items, statuses } = await registry.fetchAll(config);

		const sources: DataSourceInfo[] = registry.list().map((s) => ({
			id: s.id,
			name: s.name,
			icon: s.icon,
			description: s.description,
			requiresConfig: s.requiresConfig,
			status: statuses.get(s.id) ?? { connected: false },
		}));

		return { items, sources };
	},
);

/** List all registered data sources with their status */
export const listSources = createServerFn().handler(
	async (): Promise<
		Array<{
			id: string;
			name: string;
			icon: string;
			description: string;
			requiresConfig: boolean;
		}>
	> => {
		return registry.list().map((s) => ({
			id: s.id,
			name: s.name,
			icon: s.icon,
			description: s.description,
			requiresConfig: s.requiresConfig,
		}));
	},
);
