import type { BriefingItem } from "../../lib/briefing";

const PRIORITY_STYLES: Record<string, string> = {
	urgent: "border-l-[var(--hud-error)]",
	high: "border-l-[var(--hud-warning)]",
	normal: "border-l-[var(--hud-accent)]",
	low: "border-l-[var(--hud-text-muted)]",
};

const CATEGORY_ICONS: Record<string, string> = {
	issue: "\u2691", // ⚑
	deploy: "\u2B06", // ⬆
	revenue: "\u0024", // $
	seo: "\u2315", // ⌕
	agent: "\u2699", // ⚙
	domain: "\u2302", // ⌂
	health: "\u2665", // ♥
};

interface BriefingCardProps {
	item: BriefingItem;
	onDismiss?: (id: string) => void;
	onSnooze?: (id: string) => void;
	onAction?: (item: BriefingItem) => void;
}

export function BriefingCard({ item, onDismiss, onSnooze, onAction }: BriefingCardProps) {
	const borderClass = PRIORITY_STYLES[item.priority] ?? PRIORITY_STYLES.normal;
	const icon = CATEGORY_ICONS[item.category] ?? "\u2022";

	return (
		<div
			className={`hud-card border-l-2 ${borderClass} flex items-start gap-2.5 group`}
		>
			<span className="text-[14px] mt-0.5 flex-shrink-0 text-[var(--hud-text-muted)]">
				{icon}
			</span>
			<div className="flex-1 min-w-0">
				<div className="text-[12px] font-medium text-[var(--hud-text-bright)] leading-tight flex items-center gap-1.5">
					{item.isNew && (
						<span className="inline-block text-[8px] font-bold uppercase tracking-widest text-[var(--hud-accent)] bg-[var(--hud-accent-dim)] px-1 py-px rounded leading-none flex-shrink-0">
							new
						</span>
					)}
					<span>{item.title}</span>
				</div>
				{item.detail && (
					<div className="text-[11px] text-[var(--hud-text-muted)] mt-0.5 truncate">
						{item.detail}
					</div>
				)}
				{item.brand && (
					<span className="inline-block text-[9px] font-semibold uppercase tracking-wider text-[var(--hud-accent)] bg-[var(--hud-accent-dim)] px-1.5 py-0.5 rounded mt-1">
						{item.brand}
					</span>
				)}
			</div>
			<div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
				{item.action && (
					<button
						type="button"
						onClick={() => onAction?.(item)}
						className="text-[10px] px-2 py-0.5 rounded bg-[var(--hud-accent-dim)] text-[var(--hud-accent)] hover:bg-[var(--hud-accent)] hover:text-[var(--hud-bg)] transition-colors font-medium"
					>
						{item.action}
					</button>
				)}
				{onSnooze && (
					<button
						type="button"
						onClick={() => onSnooze(item.id)}
						className="text-[var(--hud-text-muted)] hover:text-[var(--hud-warning)] text-[12px] transition-colors"
						title="Snooze until tomorrow"
					>
						{"\u23F0"}
					</button>
				)}
				<button
					type="button"
					onClick={() => onDismiss?.(item.id)}
					className="text-[var(--hud-text-muted)] hover:text-[var(--hud-text)] text-[12px] transition-colors"
					title="Dismiss"
				>
					{"\u2715"}
				</button>
			</div>
		</div>
	);
}
