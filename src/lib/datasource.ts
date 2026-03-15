/**
 * DataSource plugin interface.
 * Each source contributes briefing items from an external system.
 */

import type { BriefingItem } from "./briefing";

export interface DataSourceAction {
	label: string;
	/** Identifier for the action handler */
	handler: string;
}

export interface DataSourceStatus {
	connected: boolean;
	lastFetch?: string;
	error?: string;
	itemCount?: number;
}

export interface DataSource {
	/** Unique identifier */
	id: string;
	/** Display name */
	name: string;
	/** Single character or emoji icon */
	icon: string;
	/** Short description of what this source provides */
	description: string;
	/** Whether this source requires configuration (API key, etc.) */
	requiresConfig: boolean;
	/** Fetch briefing items from this source */
	fetch(config: DataSourceConfig): Promise<BriefingItem[]>;
}

export interface DataSourceConfig {
	/** Environment variables / secrets available */
	env: Record<string, string | undefined>;
	/** Last visited timestamp for isNew calculation */
	lastVisited: string | null;
}

export interface RegisteredSource {
	source: DataSource;
	status: DataSourceStatus;
}

/**
 * DataSource registry — manages all available data sources.
 */
class DataSourceRegistry {
	private sources = new Map<string, DataSource>();

	register(source: DataSource): void {
		this.sources.set(source.id, source);
	}

	get(id: string): DataSource | undefined {
		return this.sources.get(id);
	}

	list(): DataSource[] {
		return Array.from(this.sources.values());
	}

	async fetchAll(
		config: DataSourceConfig,
	): Promise<{ items: BriefingItem[]; statuses: Map<string, DataSourceStatus> }> {
		const statuses = new Map<string, DataSourceStatus>();
		const allItems: BriefingItem[] = [];

		const results = await Promise.allSettled(
			this.list().map(async (source) => {
				const start = Date.now();
				try {
					const items = await source.fetch(config);
					statuses.set(source.id, {
						connected: true,
						lastFetch: new Date().toISOString(),
						itemCount: items.length,
					});
					return items;
				} catch (err) {
					statuses.set(source.id, {
						connected: false,
						lastFetch: new Date().toISOString(),
						error: err instanceof Error ? err.message : "Unknown error",
						itemCount: 0,
					});
					return [];
				}
			}),
		);

		for (const result of results) {
			if (result.status === "fulfilled") {
				allItems.push(...result.value);
			}
		}

		return { items: allItems, statuses };
	}
}

/** Global registry instance */
export const registry = new DataSourceRegistry();
