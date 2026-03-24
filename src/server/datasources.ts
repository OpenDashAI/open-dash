import { createServerFn } from "@tanstack/react-start";
import type { BriefingItem } from "../lib/briefing";
import type { DataSourceConfig, DataSourceStatus } from "../lib/datasource";
import { registry } from "../datasources";
import { loadDashboardConfig } from "./config-loader";
import type { DashboardYaml } from "../lib/dashboard-config";

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

/**
 * Fetch briefing items for a specific brand dashboard
 * Loads config from YAML, instantiates brand-specific datasources, fetches all
 */
export const fetchBrandDashboard = createServerFn()
	.input<{ brandSlug: string; lastVisited?: string | null }>()
	.handler(
		async ({
			data,
		}): Promise<{
			config: DashboardYaml | null;
			items: BriefingItem[];
			sources: DataSourceInfo[];
			error?: string;
		}> => {
			// Load dashboard config from YAML
			const config = await loadDashboardConfig({
				data: { brandSlug: data.brandSlug },
			});

			if (!config) {
				return {
					config: null,
					items: [],
					sources: [],
					error: `No configuration found for brand: ${data.brandSlug}`,
				};
			}

			// Build global config with env vars
			const globalConfig: DataSourceConfig = {
				env: {
					GITHUB_TOKEN: process.env.GITHUB_TOKEN,
					TAILSCALE_API_KEY: process.env.TAILSCALE_API_KEY,
					STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
					CF_API_TOKEN: process.env.CF_API_TOKEN,
					CF_ACCOUNT_ID: process.env.CF_ACCOUNT_ID,
					SM_API_URL: process.env.SM_API_URL,
					SM_SERVICE_KEY: process.env.SM_SERVICE_KEY,
				},
				lastVisited: data.lastVisited || null,
			};

			// Fetch from specified datasources only
			const allItems: BriefingItem[] = [];
			const sourceStatuses = new Map<string, DataSourceStatus>();

			const results = await Promise.allSettled(
				config.sources.map(async (sourceConfig) => {
					const source = registry.get(sourceConfig.id);
					if (!source) {
						sourceStatuses.set(sourceConfig.id, {
							connected: false,
							error: `Datasource not registered: ${sourceConfig.id}`,
						});
						return [];
					}

					try {
						// Merge global config with brand-specific config
						const brandSpecificConfig: DataSourceConfig = {
							...globalConfig,
							brandConfig: sourceConfig.config,
						};

						const items = await source.fetch(brandSpecificConfig);
						sourceStatuses.set(sourceConfig.id, {
							connected: true,
							lastFetch: new Date().toISOString(),
							itemCount: items.length,
						});
						return items;
					} catch (err) {
						sourceStatuses.set(sourceConfig.id, {
							connected: false,
							lastFetch: new Date().toISOString(),
							error: err instanceof Error ? err.message : "Unknown error",
						});
						return [];
					}
				}),
			);

			// Collect all items from results
			for (const result of results) {
				if (result.status === "fulfilled") {
					allItems.push(...result.value);
				}
			}

			// Build source info list
			const sources: DataSourceInfo[] = config.sources
				.map((sourceConfig) => {
					const source = registry.get(sourceConfig.id);
					if (!source) return null;

					return {
						id: source.id,
						name: source.name,
						icon: source.icon,
						description: source.description,
						requiresConfig: source.requiresConfig,
						status: sourceStatuses.get(source.id) ?? { connected: false },
					};
				})
				.filter((s) => s !== null) as DataSourceInfo[];

			return { config, items: allItems, sources };
		},
	);
