/**
 * Trending Card — Display trending analysis with visual indicators
 */

import { useMemo } from "react";
import type { TrendingData } from "../../server/analytics";

export interface TrendingCardProps {
  datasourceId: string;
  trending: TrendingData | null;
  loading?: boolean;
  error?: string;
}

export function TrendingCard({
  datasourceId,
  trending,
  loading = false,
  error,
}: TrendingCardProps) {
  const trendIndicator = useMemo(() => {
    if (!trending) return null;

    switch (trending.trend) {
      case "improving":
        return {
          arrow: "↓",
          color: "text-[var(--hud-success)]",
          label: "Improving",
        };
      case "degrading":
        return {
          arrow: "↑",
          color: "text-[var(--hud-error)]",
          label: "Degrading",
        };
      default:
        return {
          arrow: "→",
          color: "text-[var(--hud-text-muted)]",
          label: "Stable",
        };
    }
  }, [trending]);

  if (error) {
    return (
      <div className="hud-card">
        <div className="text-[11px] text-[var(--hud-error)] uppercase tracking-wider">
          Error
        </div>
        <div className="text-xs text-[var(--hud-text-muted)] mt-2">{error}</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="hud-card">
        <div className="text-[11px] text-[var(--hud-text-muted)] uppercase tracking-wider">
          {datasourceId}
        </div>
        <div className="text-xs text-[var(--hud-text-muted)] mt-2">
          Loading...
        </div>
      </div>
    );
  }

  if (!trending) {
    return (
      <div className="hud-card">
        <div className="text-[11px] text-[var(--hud-text-muted)] uppercase tracking-wider">
          {datasourceId}
        </div>
        <div className="text-xs text-[var(--hud-text-muted)] mt-2">
          No data
        </div>
      </div>
    );
  }

  const weeklyScore = Math.round(trending.weeklyPattern * 100);

  return (
    <div className="hud-card">
      <div className="text-[11px] text-[var(--hud-text-muted)] uppercase tracking-wider">
        {datasourceId} Trending
      </div>

      {/* Trend Indicator */}
      <div className="mt-3 flex items-center gap-2">
        <span
          className={`text-xl ${trendIndicator?.color}`}
          aria-label={`Trend ${trendIndicator?.label?.toLowerCase()}: ${trendIndicator?.arrow}`}
          role="img"
        >
          {trendIndicator?.arrow}
        </span>
        <span className={`text-sm font-semibold ${trendIndicator?.color}`}>
          {trendIndicator?.label}
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="mt-4 space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-[var(--hud-text-muted)]">Current:</span>
          <span className="font-mono text-[var(--hud-text-bright)]">
            {trending.current.toFixed(0)}ms
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--hud-text-muted)]">7h Avg:</span>
          <span className="font-mono text-[var(--hud-text-bright)]">
            {trending.avg7h.toFixed(0)}ms
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--hud-text-muted)]">24h Avg:</span>
          <span className="font-mono text-[var(--hud-text-bright)]">
            {trending.avg24h.toFixed(0)}ms
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--hud-text-muted)]">Pattern:</span>
          <span className="font-mono text-[var(--hud-text-bright)]">
            {weeklyScore}%
          </span>
        </div>
      </div>

      {/* Sample Count */}
      <div className="mt-3 text-[10px] text-[var(--hud-text-muted)]">
        Based on {trending.samples} samples
      </div>
    </div>
  );
}
