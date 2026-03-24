/**
 * SERP Trending Panel - Dashboard section for competitive SERP tracking
 *
 * Shows:
 * - Competitor ranking cards (7/30-day trends)
 * - Critical rank drop alerts
 * - Top performers (ranks 1-3)
 * - Daily update status
 */

import { useEffect, useState } from "react";
// TODO: Fix serp-trends import for Phase 2
// import { getSerpTrends } from "../../server/serp-trends";
import { SerpTrendingCard } from "../cards/SerpTrendingCard";
import type { BriefingItemPriority } from "../../lib/briefing";

export interface SerpTrendingPanelProps {
	/**
	 * Called when a rank change alert is triggered
	 */
	onAlert?: (competitorId: string, severity: BriefingItemPriority) => void;

	/**
	 * Optional custom title
	 */
	title?: string;

	/**
	 * Show loading state
	 */
	isLoading?: boolean;
}

export function SerpTrendingPanel({
	onAlert,
	title = "SERP Rankings",
	isLoading: externalLoading = false,
}: SerpTrendingPanelProps) {
	const [trendData, setTrendData] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

	// Fetch trends on mount and periodically
	useEffect(() => {
		const fetchTrends = async () => {
			// TODO: Re-enable for Phase 2 once serp-trends is fixed
			/*
			try {
				setLoading(true);
				setError(null);
				const data = await getSerpTrends();
				setTrendData(data || []);
				setLastRefresh(new Date());
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Failed to fetch SERP trends"
				);
				console.error("SERP trends fetch error:", err);
			} finally {
				setLoading(false);
			}
			*/
			// Phase 1: Skip trends, just set empty data
			setTrendData([]);
			setLastRefresh(new Date());
		};

		fetchTrends();

		// Refresh every 30 minutes
		const interval = setInterval(fetchTrends, 30 * 60 * 1000);
		return () => clearInterval(interval);
	}, []);

	const isLoading = loading || externalLoading;

	// Calculate aggregate metrics
	const totalTracked = trendData.reduce(
		(sum, c) => sum + (c.trends?.length || 0),
		0
	);
	const totalAlerts = trendData.reduce((sum, c) => {
		const drops = c.trends?.filter((t: any) => t.change && t.change < -5)
			.length || 0;
		return sum + drops;
	}, 0);

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-[14px] font-semibold text-[var(--hud-text)]">
						{title}
					</h2>
					<p className="text-[10px] text-[var(--hud-text-muted)]">
						{totalTracked} keywords tracked across{" "}
						{trendData.length} competitors
					</p>
				</div>
				<div className="text-right">
					<p className="text-[10px] text-[var(--hud-text-muted)]">
						Last updated
					</p>
					<p className="text-[11px] text-[var(--hud-text)]">
						{lastRefresh.toLocaleTimeString()}
					</p>
				</div>
			</div>

			{/* Alert Summary */}
			{totalAlerts > 0 && (
				<div className="bg-[var(--hud-error)]/10 border border-[var(--hud-error)] rounded-lg p-2">
					<p className="text-[10px] text-[var(--hud-error)] font-semibold">
						⚠️ {totalAlerts} rank movements detected in last 7 days
					</p>
				</div>
			)}

			{/* Loading State */}
			{isLoading && (
				<div className="flex items-center justify-center py-8">
					<div className="flex gap-2 items-center">
						<div className="w-2 h-2 bg-[var(--hud-accent)] rounded-full animate-pulse" />
						<p className="text-[10px] text-[var(--hud-text-muted)]">
							Fetching SERP trends...
						</p>
					</div>
				</div>
			)}

			{/* Error State */}
			{error && !isLoading && (
				<div className="bg-[var(--hud-error)]/10 border border-[var(--hud-error)] rounded-lg p-3">
					<p className="text-[10px] text-[var(--hud-error)]">
						Error: {error}
					</p>
				</div>
			)}

			{/* Empty State */}
			{!isLoading && !error && trendData.length === 0 && (
				<div className="flex flex-col items-center justify-center py-8 text-center">
					<p className="text-[12px] text-[var(--hud-text-muted)] mb-2">
						No competitors configured for SERP tracking
					</p>
					<p className="text-[10px] text-[var(--hud-text-muted)]">
						Add competitors in settings to start monitoring rankings
					</p>
				</div>
			)}

			{/* Trending Cards Grid */}
			{!isLoading && !error && trendData.length > 0 && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					{trendData.map((competitor) => (
						<SerpTrendingCard
							key={competitor.competitorId}
							competitorId={competitor.competitorId}
							competitorName={competitor.name}
							domain={competitor.domain}
							trends={competitor.trends || []}
							lastUpdated={competitor.lastUpdated}
							onAlert={(severity) =>
								onAlert?.(competitor.competitorId, severity)
							}
						/>
					))}
				</div>
			)}

			{/* Refresh Info */}
			<div className="text-[9px] text-[var(--hud-text-muted)] text-right">
				<p>Daily snapshots collected at 6 AM UTC</p>
				<p>Next update: ~{new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
			</div>
		</div>
	);
}
