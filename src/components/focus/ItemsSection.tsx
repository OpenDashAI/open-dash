import { useMemo } from "react";
import { BriefingCard } from "../cards/BriefingCard";
import type { BriefingItem } from "../../lib/briefing";

interface ItemsSectionProps {
	items: BriefingItem[];
}

export function ItemsSection({ items }: ItemsSectionProps) {
	const groupedItems = useMemo(() => {
		const groups: Record<string, BriefingItem[]> = {};
		items.forEach((item) => {
			if (!groups[item.type]) groups[item.type] = [];
			groups[item.type].push(item);
		});
		return groups;
	}, [items]);

	const highPriorityItems = useMemo(
		() => items.filter((i) => i.priority === "high"),
		[items]
	);

	return (
		<div className="items-section">
			{highPriorityItems.length > 0 && (
				<div className="items-group">
					<div className="group-title">⚠️ High Priority</div>
					{highPriorityItems.map((item) => (
						<BriefingCard key={item.id} item={item} />
					))}
				</div>
			)}

			{Object.entries(groupedItems).map(([type, typeItems]) => (
				<div key={type} className="items-group">
					<div className="group-title">{type}</div>
					{typeItems.slice(0, 5).map((item) => (
						<BriefingCard key={item.id} item={item} />
					))}
					{typeItems.length > 5 && (
						<div style={{ fontSize: "0.75rem", color: "var(--hud-text-muted)" }}>
							+{typeItems.length - 5} more {type}
							{typeItems.length - 5 !== 1 ? "s" : ""}
						</div>
					)}
				</div>
			))}

			{items.length === 0 && (
				<div className="empty-items">
					<div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✓</div>
					<div>No items to display</div>
				</div>
			)}
		</div>
	);
}
