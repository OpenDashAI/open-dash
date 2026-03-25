import type { BriefingItem } from "../../lib/briefing";
import { renderCard } from "../../lib/card-registry";
import {
	dismissBriefingItem,
	getVisibleBriefingItems,
	setBrowserSession,
	snoozeBriefingItem,
	useHudState,
} from "../../lib/hud-store";
import { BrowserCard } from "../cards/BrowserCard";
import { resolveEscalation } from "../../server/escalations";
import { ActivityCard } from "../cards/ActivityCard";
import { BriefingCard } from "../cards/BriefingCard";
import { IssueCard } from "../cards/IssueCard";
import { StatusCard } from "../cards/StatusCard";
import { AnalyticsDashboard } from "../analytics/AnalyticsDashboard";
import { SerpTrendingPanel } from "./SerpTrendingPanel";
import { MetricsPanel } from "./MetricsPanel";

function handleAction(item: BriefingItem) {
	// If this is an escalation with an approval action, approve it
	if (item.id.startsWith("esc-") && item.action === "Approve") {
		resolveEscalation({ data: { id: item.id, decision: "approved" } }).catch(
			() => {},
		);
		dismissBriefingItem(item.id);
		return;
	}
	if (item.actionUrl) {
		window.open(item.actionUrl, "_blank");
	}
}

function handleDismiss(id: string) {
	// If this is an escalation, mark it dismissed in D1 too
	if (id.startsWith("esc-")) {
		resolveEscalation({ data: { id, decision: "dismissed" } }).catch(() => {});
	}
	dismissBriefingItem(id);
}

function handleSnooze(id: string) {
	// Snooze until tomorrow 8 AM local time
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	tomorrow.setHours(8, 0, 0, 0);
	snoozeBriefingItem(id, tomorrow.toISOString());
}

function formatLastVisited(iso: string | null): string {
	if (!iso) return "";
	const diff = Date.now() - new Date(iso).getTime();
	const mins = Math.floor(diff / 60000);
	if (mins < 60) return `${mins}m ago`;
	const hours = Math.floor(mins / 60);
	if (hours < 24) return `${hours}h ago`;
	return `${Math.floor(hours / 24)}d ago`;
}

function BriefingView() {
	const hudState = useHudState();
	const items = getVisibleBriefingItems(hudState);
	const { metrics, lastVisited } = hudState;

	const urgentCount = items.filter((i) => i.priority === "urgent").length;
	const highCount = items.filter((i) => i.priority === "high").length;
	const newCount = items.filter((i) => i.isNew).length;

	return (
		<>
			{/* Summary bar */}
			<div className="flex items-center gap-3 px-1 mb-3">
				<span className="text-[11px] text-[var(--hud-text-muted)]">
					{items.length} item{items.length !== 1 ? "s" : ""}
				</span>
				{newCount > 0 && (
					<span className="text-[10px] font-semibold text-[var(--hud-accent)]">
						{newCount} new
					</span>
				)}
				{urgentCount > 0 && (
					<span className="text-[10px] font-semibold text-[var(--hud-error)]">
						{urgentCount} urgent
					</span>
				)}
				{highCount > 0 && (
					<span className="text-[10px] font-semibold text-[var(--hud-warning)]">
						{highCount} high
					</span>
				)}
				{lastVisited && (
					<span className="text-[10px] text-[var(--hud-text-muted)] ml-auto">
						last seen {formatLastVisited(lastVisited)}
					</span>
				)}
			</div>

			{/* KPI row */}
			{metrics.length > 0 && (
				<div className="grid grid-cols-2 gap-1.5 mb-3">
					{metrics.map((m) => (
						<StatusCard key={m.label} {...m} />
					))}
				</div>
			)}

			{/* Briefing items */}
			{items.length > 0 ? (
				<div className="space-y-1">
					{items.map((item) => (
						<BriefingCard
							key={item.id}
							item={item}
							onDismiss={handleDismiss}
							onSnooze={handleSnooze}
							onAction={handleAction}
						/>
					))}
				</div>
			) : (
				<div className="flex flex-col items-center justify-center py-8 text-center">
					<span className="text-2xl mb-2">{"\u2713"}</span>
					<span className="text-[13px] text-[var(--hud-text-bright)]">
						All clear
					</span>
					<span className="text-[11px] text-[var(--hud-text-muted)] mt-1">
						Nothing needs your attention right now
					</span>
				</div>
			)}
		</>
	);
}

function FocusView() {
	const { focusBrand, brands, issues, events } = useHudState();
	const brand = brands.find((b) => b.slug === focusBrand);
	const brandIssues = focusBrand
		? issues.filter((i) =>
				i.labels.some((l) => l.includes(focusBrand.replace(/-/g, ""))),
			)
		: issues.slice(0, 10);

	return (
		<>
			{brand && (
				<div className="hud-card mb-3">
					<div className="text-[14px] font-semibold text-[var(--hud-text-bright)]">
						{brand.name}
					</div>
					<div className="flex gap-4 text-[11px] text-[var(--hud-text-muted)] mt-1">
						<span>{brand.slug}</span>
						<span>Score: {brand.score}%</span>
						<span>${brand.revenue}/mo</span>
					</div>
					{brand.blockedOn && (
						<div className="mt-1.5 text-[11px] text-[var(--hud-warning)]">
							Blocked: {brand.blockedOn}
						</div>
					)}
				</div>
			)}

			{brandIssues.length > 0 && (
				<>
					<div className="text-[10px] font-semibold text-[var(--hud-text-muted)] uppercase tracking-wider mb-2 px-1">
						Issues ({brandIssues.length})
					</div>
					{brandIssues.map((issue) => (
						<IssueCard key={issue.number} {...issue} />
					))}
				</>
			)}

			<div className="mt-3">
				<ActivityCard events={events} />
			</div>
		</>
	);
}

function PortfolioView() {
	const { metrics, brands, events } = useHudState();

	const healthyCount = brands.filter((b) => b.status === "healthy").length;
	const warningCount = brands.filter((b) => b.status === "warning").length;
	const blockedCount = brands.filter((b) => b.status === "blocked").length;
	const totalRevenue = brands.reduce((sum, b) => sum + (b.revenue || 0), 0);

	return (
		<>
			{/* Portfolio summary */}
			<div className="grid grid-cols-2 gap-1.5 mb-3">
				<StatusCard
					label="Revenue"
					value={`$${totalRevenue}`}
					change="portfolio total"
					trend="flat"
				/>
				<StatusCard
					label="Brands"
					value={brands.length}
					change={`${healthyCount} healthy`}
					trend={blockedCount > 0 ? "down" : "up"}
				/>
				{metrics.map((m) => (
					<StatusCard key={m.label} {...m} />
				))}
			</div>

			{/* Brand health breakdown */}
			{(warningCount > 0 || blockedCount > 0) && (
				<div className="mb-3">
					<div className="text-[10px] font-semibold text-[var(--hud-text-muted)] uppercase tracking-wider mb-2 px-1">
						Needs Attention
					</div>
					{brands
						.filter((b) => b.status !== "healthy")
						.map((b) => (
							<div key={b.slug} className="hud-card flex items-center gap-2">
								<span
									className={`status-dot ${b.status === "blocked" ? "error" : "warning"}`}
								/>
								<span className="text-[12px] text-[var(--hud-text-bright)] flex-1">
									{b.name}
								</span>
								<span className="text-[11px] text-[var(--hud-text-muted)]">
									{b.score}%
								</span>
							</div>
						))}
				</div>
			)}

			<ActivityCard events={events} />
		</>
	);
}

function AnalyticsView() {
	const { dataSources } = useHudState();

	if (dataSources.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-8 text-center">
				<span className="text-2xl mb-2">◎</span>
				<span className="text-[13px] text-[var(--hud-text-bright)]">
					No datasources
				</span>
				<span className="text-[11px] text-[var(--hud-text-muted)] mt-1">
					Configure datasources to see analytics
				</span>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Scram Jet Metrics Panel */}
			<MetricsPanel
				title="Scram Jet Metrics"
				limit={10}
				refreshInterval={30000}
			/>

			{/* SERP Trending Panel */}
			<SerpTrendingPanel title="Competitive SERP Tracking" />

			{/* Analytics Dashboard */}
			<AnalyticsDashboard datasources={dataSources} />
		</div>
	);
}

export function FocusPanel() {
	const { experience, cards, browserSession } = useHudState();

	// AI-spawned cards render first in all views
	const centerCards = cards.filter((c) => c.position === "center");

	return (
		<div className="hud-panel center">
			<div className="panel-header">
				<span>
					{experience === "briefing"
						? "Briefing"
						: experience === "focus"
							? "Project"
							: experience === "portfolio"
								? "Portfolio"
								: "Analytics"}
				</span>
			</div>
			<div className="panel-body">
				{/* Live browser view — shown in any experience when active */}
				{browserSession && (
					<BrowserCard
						session={browserSession}
						onUpdate={(s) => setBrowserSession(s)}
						onClose={() => setBrowserSession(null)}
					/>
				)}

				{centerCards.map((card, i) =>
					renderCard(card.type, card.props, `ai-center-${i}`),
				)}

				{experience === "briefing" && <BriefingView />}
				{experience === "focus" && <FocusView />}
				{experience === "portfolio" && <PortfolioView />}
				{experience === "analytics" && <AnalyticsView />}
			</div>
		</div>
	);
}
