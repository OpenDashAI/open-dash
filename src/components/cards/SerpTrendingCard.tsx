/**
 * SerpTrendingCard - Display competitor SERP ranking trends
 *
 * Shows:
 * - Current rank for competitor's tracked keywords
 * - 7/30-day trend (up, down, stable)
 * - Critical alerts (rank drop > 5 positions)
 * - Top performers (rank 1-3)
 */

import { useState } from "react";
import type { BriefingItemPriority } from "../../lib/briefing";

export interface SerpSnapshot {
	keyword: string;
	rank: number;
	url: string;
	title?: string;
	snippet?: string;
}

export interface SerpTrend {
	keyword: string;
	currentRank: number;
	previousRank?: number;
	change?: number; // Negative = dropped, positive = improved
	trendDays: 7 | 30;
	isNew?: boolean; // Entered tracking
	isTopPerformer?: boolean; // Rank 1-3
}

export interface SerpCompetitorData {
	competitorId: string;
	domain: string;
	name: string;
	trends: SerpTrend[];
	lastUpdated: string;
}

interface SerpTrendingCardProps {
	competitorId: string;
	competitorName: string;
	domain: string;
	trends: SerpTrend[];
	lastUpdated: string;
	onAlert?: (severity: BriefingItemPriority) => void;
}

export function SerpTrendingCard({
	competitorId,
	competitorName,
	domain,
	trends,
	lastUpdated,
	onAlert,
}: SerpTrendingCardProps) {
	const [trendPeriod, setTrendPeriod] = useState<7 | 30>(7);

	const filteredTrends = trends.filter((t) => t.trendDays === trendPeriod);

	// Count rank movements
	const criticalDrops = filteredTrends.filter(
		(t) => t.change && t.change < -5
	).length;
	const improvements = filteredTrends.filter(
		(t) => t.change && t.change > 5
	).length;
	const topPerformers = filteredTrends.filter(
		(t) => t.currentRank <= 3
	).length;

	// Determine alert level
	let alertLevel: BriefingItemPriority = "normal";
	if (criticalDrops > 0) alertLevel = "high";
	if (criticalDrops > 3) alertLevel = "critical";

	// Get severity indicator color
	const getSeverityColor = (
		change?: number,
		rank?: number
	): string => {
		if (!rank) return "text-[var(--hud-text-muted)]";
		if (rank <= 3) return "text-[var(--hud-success)]"; // Top 3 = green
		if (change && change < -5) return "text-[var(--hud-error)]"; // Drop = red
		if (change && change > 5) return "text-[var(--hud-accent)]"; // Gain = blue
		return "text-[var(--hud-text)]";
	};

	// Get trend arrow/emoji
	const getTrendIcon = (change?: number): string => {
		if (!change) return "→";
		if (change > 5) return "↑";
		if (change < -5) return "↓";
		return "→";
	};

	const lastUpdatedDate = new Date(lastUpdated);
	const isRecent =
		Date.now() - lastUpdatedDate.getTime() < 24 * 60 * 60 * 1000; // Within 24h

	return (
		<div className="bg-[var(--hud-bg-secondary)] rounded-lg border border-[var(--hud-border)] p-3">
			{/* Header */}
			<div className="flex items-start justify-between mb-3">
				<div>
					<h3 className="text-[12px] font-semibold text-[var(--hud-text)]">
						{competitorName}
					</h3>
					<p className="text-[10px] text-[var(--hud-text-muted)] truncate">
						{domain}
					</p>
				</div>
				{alertLevel === "critical" && (
					<span className="text-[10px] bg-[var(--hud-error)] text-white px-1.5 py-0.5 rounded">
						Alert
					</span>
				)}
				{alertLevel === "high" && (
					<span className="text-[10px] bg-[var(--hud-warning)] text-white px-1.5 py-0.5 rounded">
						⚠
					</span>
				)}
			</div>

			{/* Metrics Row */}
			<div className="grid grid-cols-4 gap-2 mb-3">
				<div className="bg-[var(--hud-bg)] rounded p-1.5">
					<p className="text-[9px] text-[var(--hud-text-muted)] uppercase tracking-wider">
						Tracked
					</p>
					<p className="text-[14px] font-semibold text-[var(--hud-text)]">
						{filteredTrends.length}
					</p>
				</div>

				<div className="bg-[var(--hud-bg)] rounded p-1.5">
					<p className="text-[9px] text-[var(--hud-text-muted)] uppercase tracking-wider">
						Top 3
					</p>
					<p className={`text-[14px] font-semibold ${getSeverityColor(undefined, topPerformers > 0 ? 1 : 999)}`}>
						{topPerformers}
					</p>
				</div>

				<div className="bg-[var(--hud-bg)] rounded p-1.5">
					<p className="text-[9px] text-[var(--hud-text-muted)] uppercase tracking-wider">
						Gained
					</p>
					<p
						className={`text-[14px] font-semibold ${improvements > 0 ? "text-[var(--hud-accent)]" : "text-[var(--hud-text-muted)]"}`}
					>
						+{improvements}
					</p>
				</div>

				<div className="bg-[var(--hud-bg)] rounded p-1.5">
					<p className="text-[9px] text-[var(--hud-text-muted)] uppercase tracking-wider">
						Dropped
					</p>
					<p
						className={`text-[14px] font-semibold ${criticalDrops > 0 ? "text-[var(--hud-error)]" : "text-[var(--hud-text-muted)]"}`}
					>
						{criticalDrops}
					</p>
				</div>
			</div>

			{/* Trend Period Selector */}
			<div className="flex gap-1 mb-3">
				<button
					onClick={() => setTrendPeriod(7)}
					className={`text-[9px] px-2 py-1 rounded transition-colors ${
						trendPeriod === 7
							? "bg-[var(--hud-accent)] text-white"
							: "bg-[var(--hud-bg)] text-[var(--hud-text-muted)] hover:text-[var(--hud-text)]"
					}`}
				>
					7d
				</button>
				<button
					onClick={() => setTrendPeriod(30)}
					className={`text-[9px] px-2 py-1 rounded transition-colors ${
						trendPeriod === 30
							? "bg-[var(--hud-accent)] text-white"
							: "bg-[var(--hud-bg)] text-[var(--hud-text-muted)] hover:text-[var(--hud-text)]"
					}`}
				>
					30d
				</button>
			</div>

			{/* Keywords List */}
			<div className="space-y-1 mb-3 max-h-[120px] overflow-y-auto">
				{filteredTrends.length > 0 ? (
					filteredTrends.slice(0, 5).map((trend) => (
						<div
							key={trend.keyword}
							className="flex items-center justify-between bg-[var(--hud-bg)] rounded p-2 text-[10px]"
						>
							<div className="flex-1 min-w-0">
								<p className="text-[var(--hud-text)] truncate">
									{trend.keyword}
								</p>
							</div>
							<div className="flex items-center gap-2 ml-2">
								<span
									className={`font-semibold ${getSeverityColor(trend.change, trend.currentRank)}`}
								>
									#{trend.currentRank}
								</span>
								{trend.change && trend.change !== 0 && (
									<span
										className={`flex items-center ${getSeverityColor(trend.change, trend.currentRank)}`}
									>
										{getTrendIcon(trend.change)}
										{Math.abs(trend.change)}
									</span>
								)}
							</div>
						</div>
					))
				) : (
					<p className="text-[10px] text-[var(--hud-text-muted)] py-2 text-center">
						No trends available
					</p>
				)}
			</div>

			{/* Footer */}
			<div className="flex items-center justify-between pt-2 border-t border-[var(--hud-border)] text-[9px] text-[var(--hud-text-muted)]">
				<span>
					{isRecent ? "Updated today" : "Last updated: " + lastUpdatedDate.toLocaleDateString()}
				</span>
				{alertLevel !== "normal" && (
					<button
						onClick={() => onAlert?.(alertLevel)}
						className="text-[var(--hud-accent)] hover:underline"
					>
						View alert
					</button>
				)}
			</div>
		</div>
	);
}
