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

export type HudExperience = "briefing" | "focus" | "portfolio";

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
};

const PRIORITY_ORDER: Record<BriefingPriority, number> = {
	urgent: 0,
	high: 1,
	normal: 2,
	low: 3,
};

/** Sort briefing items by priority, then by time (newest first) */
export function sortBriefingItems(items: BriefingItem[]): BriefingItem[] {
	return [...items].sort((a, b) => {
		const pd = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
		if (pd !== 0) return pd;
		return b.time.localeCompare(a.time);
	});
}
