import type { BriefingItem } from "../lib/briefing";
import type { DataSource, DataSourceConfig } from "../lib/datasource";

/**
 * Tailscale machines data source.
 * Surfaces offline machines as briefing items.
 */
export const tailscaleSource: DataSource = {
	id: "tailscale",
	name: "Tailscale Machines",
	icon: "\u2665", // ♥
	description: "Machine status from your Tailscale network",
	requiresConfig: true,

	async fetch(config: DataSourceConfig): Promise<BriefingItem[]> {
		const apiKey = config.env.TAILSCALE_API_KEY;
		if (!apiKey) return [];

		// Get brand-specific tag filter (optional)
		const brandConfig = config.brandConfig as { tags?: string[] } | undefined;
		const tags = brandConfig?.tags;

		const res = await fetch(
			"https://api.tailscale.com/api/v2/tailnet/-/devices",
			{ headers: { Authorization: `Bearer ${apiKey}` } },
		);

		if (!res.ok) return [];

		const data = (await res.json()) as {
			devices: Array<{
				hostname: string;
				name: string;
				os: string;
				online: boolean;
				lastSeen: string;
				isExternal?: boolean;
				tags?: string[];
			}>;
		};

		let devices = data.devices.filter((d) => !d.isExternal);

		// Filter by tags if specified
		if (tags && tags.length > 0) {
			devices = devices.filter((d) =>
				d.tags?.some((t) => tags.includes(t))
			);
		}
		const offline = devices.filter((d) => !d.online);

		if (offline.length === 0) return [];

		const lastVisitedMs = config.lastVisited
			? new Date(config.lastVisited).getTime()
			: 0;

		return [
			{
				id: "ts-machines-offline",
				priority: "high",
				category: "health",
				title: `${offline.length} machine${offline.length > 1 ? "s" : ""} offline`,
				detail: offline.map((m) => m.hostname || m.name.split(".")[0]).join(", "),
				time: new Date().toISOString(),
				action: "Check",
				isNew: offline.some(
					(m) =>
						lastVisitedMs > 0 &&
						new Date(m.lastSeen).getTime() > lastVisitedMs,
				),
			},
		];
	},
};
