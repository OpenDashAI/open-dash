import { renderCard } from "../../lib/card-registry";
import { setFocusBrand, useHudState, getBrandSummaries } from "../../lib/hud-store";
import { BrandCard } from "../cards/BrandCard";
import { MachineCard } from "../cards/MachineCard";

export function ContextPanel() {
	const state = useHudState();
	const { experience, machines, brands, cards, focusBrand, dataSources } = state;

	// Issue #27.3: Get pending item counts per brand
	const brandSummaries = getBrandSummaries(state);

	// Filter AI-spawned cards destined for left panel
	const leftCards = cards.filter((c) => c.position === "left");

	return (
		<div className="hud-panel left">
			<div className="panel-header">
				<span>{experience === "focus" ? "Project" : "Context"}</span>
			</div>
			<div className="panel-body">
				{/* AI-spawned cards render first */}
				{leftCards.map((card, i) =>
					renderCard(card.type, card.props, `ai-left-${i}`),
				)}

				{/* Machine cards — show in briefing and portfolio */}
				{experience !== "focus" && machines.length > 0 && (
					<>
						<div className="text-[10px] font-semibold text-[var(--hud-text-muted)] uppercase tracking-wider mb-2 px-1">
							Machines
						</div>
						{machines.map((m) => (
							<MachineCard key={m.hostname} {...m} />
						))}
					</>
				)}

				{/* Brand list — clickable to enter focus mode */}
				<div className="text-[10px] font-semibold text-[var(--hud-text-muted)] uppercase tracking-wider mb-2 mt-3 px-1">
					{experience === "focus" ? "Switch Project" : "Brands"}
				</div>
				{brands.map((b) => (
					<button
						key={b.slug}
						type="button"
						onClick={() => setFocusBrand(b.slug)}
						className={`w-full text-left transition-colors ${
							focusBrand === b.slug
								? "ring-1 ring-[var(--hud-accent)] rounded-md"
								: ""
						}`}
					>
						<BrandCard
					{...b}
					itemCount={(brandSummaries[b.slug] || { count: 0 }).count}
					urgentCount={(brandSummaries[b.slug] || { urgent: 0 }).urgent}
				/>
					</button>
				))}

				{brands.length === 0 && (
					<div className="text-[12px] text-[var(--hud-text-muted)] px-1">
						Loading brands...
					</div>
				)}

				{/* Data Sources status */}
				{experience !== "focus" && dataSources.length > 0 && (
					<>
						<div className="text-[10px] font-semibold text-[var(--hud-text-muted)] uppercase tracking-wider mb-2 mt-3 px-1">
							Data Sources
						</div>
						{dataSources.map((ds) => (
							<div
								key={ds.id}
								className="flex items-center gap-2 px-1 py-1 text-[11px]"
							>
								<span
									className={`status-dot ${ds.status.connected ? "online" : "offline"}`}
								/>
								<span className="text-[12px] flex-shrink-0">
									{ds.icon}
								</span>
								<span
									className={`flex-1 truncate ${ds.status.connected ? "text-[var(--hud-text)]" : "text-[var(--hud-text-muted)]"}`}
								>
									{ds.name}
								</span>
								{ds.status.connected && ds.status.itemCount !== undefined && (
									<span className="text-[10px] text-[var(--hud-text-muted)]">
										{ds.status.itemCount}
									</span>
								)}
								{ds.status.error && (
									<span
										className="text-[10px] text-[var(--hud-error)]"
										title={ds.status.error}
									>
										err
									</span>
								)}
							</div>
						))}
					</>
				)}
			</div>
		</div>
	);
}
