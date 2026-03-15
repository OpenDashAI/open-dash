import { createServerFn } from "@tanstack/react-start";
import type {
	BriefingCategory,
	BriefingItem,
	BriefingPriority,
} from "../lib/briefing";
import type { ActivityEvent, Brand, Issue, Machine } from "../lib/types";

/**
 * Generate a prioritized briefing from all available data sources.
 * Each source contributes items ranked by urgency.
 * Items created/updated after lastVisited are marked isNew.
 */
export const getBriefing = createServerFn().handler(
	async ({
		data,
	}: {
		data: {
			machines: Machine[];
			brands: Brand[];
			issues: Issue[];
			events: ActivityEvent[];
			lastVisited: string | null;
		};
	}): Promise<BriefingItem[]> => {
		const items: BriefingItem[] = [];
		const lastVisitedMs = data.lastVisited
			? new Date(data.lastVisited).getTime()
			: 0;

		function isNewSince(isoDate?: string): boolean {
			if (!isoDate || !lastVisitedMs) return false;
			return new Date(isoDate).getTime() > lastVisitedMs;
		}

		// --- Machine health ---
		const offlineMachines = data.machines.filter((m) => m.status === "offline");
		if (offlineMachines.length > 0) {
			items.push({
				id: "machines-offline",
				priority: "high",
				category: "health",
				title: `${offlineMachines.length} machine${offlineMachines.length > 1 ? "s" : ""} offline`,
				detail: offlineMachines.map((m) => m.hostname).join(", "),
				time: new Date().toISOString(),
				action: "Check",
				isNew: offlineMachines.some((m) => isNewSince(m.lastSeen)),
			});
		}

		// --- Blocked brands ---
		for (const brand of data.brands) {
			if (brand.status === "blocked") {
				items.push({
					id: `brand-blocked-${brand.slug}`,
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
			} else if (brand.status === "warning") {
				items.push({
					id: `brand-warning-${brand.slug}`,
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

		// --- Open issues by team ---
		const teamCounts: Record<string, number> = {};
		const recentIssues: Issue[] = [];
		for (const issue of data.issues) {
			if (issue.state !== "open") continue;
			for (const label of issue.labels) {
				if (label.startsWith("team-")) {
					teamCounts[label] = (teamCounts[label] || 0) + 1;
				}
			}
			recentIssues.push(issue);
		}

		// Show high-priority issues (first 5)
		for (const issue of recentIssues.slice(0, 5)) {
			const teamLabel = issue.labels.find((l) => l.startsWith("team-"));
			items.push({
				id: `issue-${issue.number}`,
				priority: "normal",
				category: "issue",
				title: `#${issue.number} ${issue.title}`,
				detail: teamLabel || undefined,
				time: issue.updatedAt ?? new Date().toISOString(),
				action: "View",
				actionUrl: `https://github.com/garywu/garywu-vault/issues/${issue.number}`,
				isNew: isNewSince(issue.updatedAt),
			});
		}

		if (recentIssues.length > 5) {
			items.push({
				id: "issues-more",
				priority: "low",
				category: "issue",
				title: `${recentIssues.length - 5} more open issues`,
				detail: Object.entries(teamCounts)
					.map(([team, count]) => `${team}: ${count}`)
					.join(", "),
				time: new Date().toISOString(),
			});
		}

		// --- Activity events that need attention ---
		for (const event of data.events) {
			if (event.type === "error") {
				items.push({
					id: `event-error-${event.id}`,
					priority: "high",
					category: "health",
					title: event.message,
					time: new Date().toISOString(),
					action: "Investigate",
					isNew: true, // errors are always surfaced as new
				});
			} else if (event.type === "warning") {
				items.push({
					id: `event-warning-${event.id}`,
					priority: "normal",
					category: "domain",
					title: event.message,
					time: new Date().toISOString(),
					action: "Check",
				});
			}
		}

		// --- Revenue (static for now — will be Stripe integration) ---
		items.push({
			id: "revenue-daily",
			priority: "low",
			category: "revenue",
			title: "Daily revenue: $0",
			detail: "Target: $333/day ($10K/mo). Connect Stripe to track.",
			time: new Date().toISOString(),
		});

		return items;
	},
);
