import type { BriefingItem } from "../lib/briefing";
import type { DataSource, DataSourceConfig } from "../lib/datasource";

/**
 * Scalable Media data source.
 * Checks brand agent status and escalations from the SM API.
 */
export const scalableMediaSource: DataSource = {
	id: "scalable-media",
	name: "Brand Agents",
	icon: "\u2699", // ⚙
	description: "Autonomous brand agent status and escalations",
	requiresConfig: true,

	async fetch(config: DataSourceConfig): Promise<BriefingItem[]> {
		const smUrl = config.env.SM_API_URL;
		const smKey = config.env.SM_SERVICE_KEY;
		if (!smUrl || !smKey) return [];

		try {
			const res = await fetch(`${smUrl}/v1/brands`, {
				headers: { "X-Service-Key": smKey },
			});

			if (!res.ok) return [];

			const data = (await res.json()) as {
				brands: Array<{
					slug: string;
					name: string;
					status: string;
					score?: number;
					blockedOn?: string;
				}>;
			};

			const items: BriefingItem[] = [];

			for (const brand of data.brands) {
				if (brand.status === "blocked") {
					items.push({
						id: `sm-blocked-${brand.slug}`,
						priority: "urgent",
						category: "health",
						title: `${brand.name} is blocked`,
						detail: brand.blockedOn
							? `Blocked on: ${brand.blockedOn}`
							: undefined,
						brand: brand.slug,
						time: new Date().toISOString(),
						action: "Unblock",
					});
				} else if (
					brand.status === "warning" ||
					(brand.score !== undefined && brand.score < 30)
				) {
					items.push({
						id: `sm-warning-${brand.slug}`,
						priority: "normal",
						category: "health",
						title: `${brand.name} needs attention`,
						detail:
							brand.score !== undefined
								? `Health score: ${brand.score}%`
								: undefined,
						brand: brand.slug,
						time: new Date().toISOString(),
						action: "Review",
					});
				}
			}

			return items;
		} catch {
			return [];
		}
	},
};
