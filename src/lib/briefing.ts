/**
 * Briefing system — prioritized, actionable items.
 * Replaces the static activity feed with "what needs your attention."
 */

export type BriefingPriority = "urgent" | "high" | "normal" | "low";

export type BriefingCategory =
	| "issue"
	| "deploy"
	| "revenue"
	| "seo"
	| "agent"
	| "domain"
	| "health";

export interface BriefingItem {
	id: string;
	priority: BriefingPriority;
	category: BriefingCategory;
	title: string;
	detail?: string;
	/** Which brand/project this relates to, if any */
	brand?: string;
	/** When this item was created/detected */
	time: string;
	/** Primary action label (e.g., "View", "Fix", "Dismiss") */
	action?: string;
	/** URL or route to navigate to */
	actionUrl?: string;
	/** Whether this item has been dismissed by the user */
	dismissed?: boolean;
	/** Whether this item appeared since the user's last visit */
	isNew?: boolean;
	/** If snoozed, when it should reappear (ISO string) */
	snoozedUntil?: string;
}

export type HudExperience = "briefing" | "focus" | "portfolio" | "analytics";

export interface ExperienceConfig {
	label: string;
	description: string;
	icon: string;
}

export const EXPERIENCES: Record<HudExperience, ExperienceConfig> = {
	briefing: {
		label: "Briefing",
		description: "What needs your attention",
		icon: "\u25C9", // ◉
	},
	focus: {
		label: "Focus",
		description: "Work on one project",
		icon: "\u25CE", // ◎
	},
	portfolio: {
		label: "Portfolio",
		description: "How everything is doing",
		icon: "\u25A3", // ▣
	},
	analytics: {
		label: "Analytics",
		description: "Trending, anomalies, alerts",
		icon: "\u2394", // ⎔
	},
};

const PRIORITY_ORDER: Record<BriefingPriority, number> = {
	urgent: 0,
	high: 1,
	normal: 2,
	low: 3,
};

/**
 * Filter briefing items by brand (Issue #27.3)
 * If focusBrand is set, show only items for that brand
 * If focusBrand is null, show all items (aggregated view)
 */
export function filterByBrand(
	items: BriefingItem[],
	focusBrand: string | null
): BriefingItem[] {
	if (!focusBrand) {
		// Aggregated view: show all items
		return items;
	}

	// Filtered view: show only items for selected brand
	return items.filter((item) => item.brand === focusBrand || !item.brand);
}

/**
 * Group briefing items by brand
 * Useful for showing brand-specific summaries or metrics
 */
export function groupByBrand(items: BriefingItem[]): Map<string, BriefingItem[]> {
	const groups = new Map<string, BriefingItem[]>();

	for (const item of items) {
		const brand = item.brand || "uncategorized";
		if (!groups.has(brand)) {
			groups.set(brand, []);
		}
		groups.get(brand)!.push(item);
	}

	return groups;
}

/**
 * Count briefing items by priority for a specific brand
 */
export function countByPriority(
	items: BriefingItem[],
	brand?: string
): Record<BriefingPriority, number> {
	const filtered = brand ? items.filter((i) => i.brand === brand) : items;
	return {
		urgent: filtered.filter((i) => i.priority === "urgent").length,
		high: filtered.filter((i) => i.priority === "high").length,
		normal: filtered.filter((i) => i.priority === "normal").length,
		low: filtered.filter((i) => i.priority === "low").length,
	};
}

/** Sort briefing items by priority, then by time (newest first) */
export function sortBriefingItems(items: BriefingItem[]): BriefingItem[] {
	return [...items].sort((a, b) => {
		const pd = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
		if (pd !== 0) return pd;
		return b.time.localeCompare(a.time);
	});
}
