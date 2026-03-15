import { useCallback, useEffect, useState } from "react";
import type { BriefingItem } from "../lib/briefing";
import {
	getVisibleBriefingItems,
	setExperience,
	setFocusBrand,
	useHudState,
} from "../lib/hud-store";

type FlowStep = "welcome" | "review" | "pick-focus" | "done";

interface MorningFlowProps {
	lastVisited: string | null;
	onComplete: () => void;
}

function timeOfDay(): string {
	const h = new Date().getHours();
	if (h < 12) return "morning";
	if (h < 17) return "afternoon";
	return "evening";
}

function timeSince(iso: string): string {
	const diff = Date.now() - new Date(iso).getTime();
	const hours = Math.floor(diff / 3600000);
	if (hours < 1) return "less than an hour";
	if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""}`;
	const days = Math.floor(hours / 24);
	return `${days} day${days > 1 ? "s" : ""}`;
}

export function MorningFlow({ lastVisited, onComplete }: MorningFlowProps) {
	const [step, setStep] = useState<FlowStep>("welcome");
	const [reviewIndex, setReviewIndex] = useState(0);
	const hudState = useHudState();
	const items = getVisibleBriefingItems(hudState);
	const newItems = items.filter((i) => i.isNew);
	const { brands } = hudState;

	// Auto-skip if nothing to review
	useEffect(() => {
		if (step === "review" && newItems.length === 0) {
			setStep("pick-focus");
		}
	}, [step, newItems.length]);

	const handleStartReview = useCallback(() => {
		if (newItems.length === 0) {
			setStep("pick-focus");
		} else {
			setStep("review");
		}
	}, [newItems.length]);

	const handleNextItem = useCallback(() => {
		if (reviewIndex + 1 >= Math.min(newItems.length, 5)) {
			setStep("pick-focus");
		} else {
			setReviewIndex((i) => i + 1);
		}
	}, [reviewIndex, newItems.length]);

	const handlePickBrand = useCallback(
		(slug: string) => {
			setFocusBrand(slug);
			setStep("done");
			setTimeout(onComplete, 600);
		},
		[onComplete],
	);

	const handleSkipFocus = useCallback(() => {
		setExperience("briefing");
		setStep("done");
		setTimeout(onComplete, 600);
	}, [onComplete]);

	const currentItem = newItems[reviewIndex];

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--hud-bg)]/90 backdrop-blur-sm">
			<div className="w-[440px] max-h-[80vh] overflow-y-auto">
				{step === "welcome" && (
					<div className="text-center">
						<div className="text-[32px] mb-4 opacity-80">
							{"\u25C9"}
						</div>
						<h1 className="text-[20px] font-semibold text-[var(--hud-text-bright)] mb-2">
							Good {timeOfDay()}
						</h1>
						{lastVisited && (
							<p className="text-[13px] text-[var(--hud-text-muted)] mb-6">
								You were last here {timeSince(lastVisited)} ago
							</p>
						)}

						<div className="grid grid-cols-3 gap-3 mb-6">
							<div className="hud-card text-center">
								<div className="text-[18px] font-semibold text-[var(--hud-text-bright)]">
									{newItems.length}
								</div>
								<div className="text-[10px] text-[var(--hud-text-muted)] uppercase tracking-wider">
									New
								</div>
							</div>
							<div className="hud-card text-center">
								<div className="text-[18px] font-semibold text-[var(--hud-text-bright)]">
									{items.length}
								</div>
								<div className="text-[10px] text-[var(--hud-text-muted)] uppercase tracking-wider">
									Total
								</div>
							</div>
							<div className="hud-card text-center">
								<div className="text-[18px] font-semibold text-[var(--hud-text-bright)]">
									{brands.length}
								</div>
								<div className="text-[10px] text-[var(--hud-text-muted)] uppercase tracking-wider">
									Brands
								</div>
							</div>
						</div>

						<button
							type="button"
							onClick={handleStartReview}
							className="px-6 py-2 rounded-md bg-[var(--hud-accent)] text-[var(--hud-bg)] font-semibold text-[13px] hover:opacity-90 transition-opacity"
						>
							Start briefing
						</button>
						<button
							type="button"
							onClick={onComplete}
							className="block mx-auto mt-3 text-[11px] text-[var(--hud-text-muted)] hover:text-[var(--hud-text)] transition-colors"
						>
							Skip
						</button>
					</div>
				)}

				{step === "review" && currentItem && (
					<div>
						<div className="flex items-center justify-between mb-4">
							<span className="text-[10px] font-semibold text-[var(--hud-text-muted)] uppercase tracking-wider">
								Review ({reviewIndex + 1}/{Math.min(newItems.length, 5)})
							</span>
							<button
								type="button"
								onClick={() => setStep("pick-focus")}
								className="text-[10px] text-[var(--hud-text-muted)] hover:text-[var(--hud-text)]"
							>
								Skip all
							</button>
						</div>

						<ReviewItem item={currentItem} onNext={handleNextItem} />

						{/* Progress dots */}
						<div className="flex justify-center gap-1.5 mt-4">
							{Array.from(
								{ length: Math.min(newItems.length, 5) },
								(_, i) => (
									<div
										key={`dot-${newItems[i]?.id ?? i}`}
										className={`w-1.5 h-1.5 rounded-full transition-colors ${
											i <= reviewIndex
												? "bg-[var(--hud-accent)]"
												: "bg-[var(--hud-border)]"
										}`}
									/>
								),
							)}
						</div>
					</div>
				)}

				{step === "pick-focus" && (
					<div>
						<h2 className="text-[16px] font-semibold text-[var(--hud-text-bright)] mb-1 text-center">
							Pick today's focus
						</h2>
						<p className="text-[12px] text-[var(--hud-text-muted)] mb-4 text-center">
							Which project gets your attention today?
						</p>

						<div className="space-y-1.5 max-h-[300px] overflow-y-auto">
							{brands.map((b) => (
								<button
									key={b.slug}
									type="button"
									onClick={() => handlePickBrand(b.slug)}
									className="w-full hud-card flex items-center gap-3 text-left hover:border-[var(--hud-accent)] transition-colors"
								>
									<span
										className={`status-dot ${
											b.status === "healthy"
												? "online"
												: b.status === "warning"
													? "warning"
													: "error"
										}`}
									/>
									<div className="flex-1 min-w-0">
										<div className="text-[12px] font-medium text-[var(--hud-text-bright)]">
											{b.name}
										</div>
										<div className="text-[10px] text-[var(--hud-text-muted)]">
											{b.slug} &middot; {b.score}% &middot; ${b.revenue}/mo
										</div>
									</div>
								</button>
							))}
						</div>

						<button
							type="button"
							onClick={handleSkipFocus}
							className="block mx-auto mt-4 text-[11px] text-[var(--hud-text-muted)] hover:text-[var(--hud-text)] transition-colors"
						>
							Stay in briefing view
						</button>
					</div>
				)}

				{step === "done" && (
					<div className="text-center py-8">
						<div className="text-[32px] mb-2">{"\u2713"}</div>
						<p className="text-[14px] text-[var(--hud-text-bright)]">
							Let's go
						</p>
					</div>
				)}
			</div>
		</div>
	);
}

const PRIORITY_COLORS: Record<string, string> = {
	urgent: "var(--hud-error)",
	high: "var(--hud-warning)",
	normal: "var(--hud-accent)",
	low: "var(--hud-text-muted)",
};

function ReviewItem({
	item,
	onNext,
}: { item: BriefingItem; onNext: () => void }) {
	return (
		<div className="hud-card">
			<div className="flex items-start gap-3">
				<div
					className="w-1 h-8 rounded-full flex-shrink-0 mt-0.5"
					style={{
						background: PRIORITY_COLORS[item.priority] ?? PRIORITY_COLORS.normal,
					}}
				/>
				<div className="flex-1 min-w-0">
					<div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--hud-text-muted)] mb-1">
						{item.priority} &middot; {item.category}
					</div>
					<div className="text-[14px] font-medium text-[var(--hud-text-bright)] mb-1">
						{item.title}
					</div>
					{item.detail && (
						<div className="text-[12px] text-[var(--hud-text-muted)]">
							{item.detail}
						</div>
					)}
					{item.brand && (
						<span className="inline-block text-[9px] font-semibold uppercase tracking-wider text-[var(--hud-accent)] bg-[var(--hud-accent-dim)] px-1.5 py-0.5 rounded mt-2">
							{item.brand}
						</span>
					)}
				</div>
			</div>

			<div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-[var(--hud-border)]">
				{item.actionUrl && (
					<a
						href={item.actionUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="text-[10px] px-2.5 py-1 rounded bg-[var(--hud-accent-dim)] text-[var(--hud-accent)] hover:bg-[var(--hud-accent)] hover:text-[var(--hud-bg)] transition-colors font-medium"
					>
						{item.action ?? "View"}
					</a>
				)}
				<button
					type="button"
					onClick={onNext}
					className="text-[10px] px-2.5 py-1 rounded border border-[var(--hud-border)] text-[var(--hud-text-muted)] hover:border-[var(--hud-text)] hover:text-[var(--hud-text)] transition-colors font-medium"
				>
					Next
				</button>
			</div>
		</div>
	);
}
