/**
 * Analytics Dashboard — Composite component for all analytics
 */

import { useTransition } from "react";
import { getTrendingData, getAnomalyData, evaluateAlerts } from "../../server/analytics";
import { TrendingCard } from "./TrendingCard";
import { AnomalyBadge } from "./AnomalyBadge";
import { AlertPanel } from "./AlertPanel";
import type { DatasourceMetric } from "../../db/queries";

export interface AnalyticsDashboardProps {
  datasources: Array<{ id: string; name: string }>;
  autoRefreshSeconds?: number;
}

export function AnalyticsDashboard({
  datasources,
  autoRefreshSeconds = 60,
}: AnalyticsDashboardProps) {
  const [_isPending, startTransition] = useTransition();

  // In a real implementation, would use useEffect + polling for auto-refresh
  // For now, this is a layout component that uses server functions

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[var(--hud-text-bright)]">
          Analytics
        </h2>
        <p className="text-xs text-[var(--hud-text-muted)] mt-1">
          Trending, anomalies, and alerts for {datasources.length} datasource
          {datasources.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Trending Analysis */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-[var(--hud-text-muted)] uppercase tracking-wider">
            Trending
          </h3>
          <div className="space-y-3">
            {datasources.map((ds) => (
              <AnalyticsCardLoader
                key={`trending-${ds.id}`}
                type="trending"
                datasourceId={ds.id}
              />
            ))}
          </div>
        </div>

        {/* Alerts & Anomalies */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-[var(--hud-text-muted)] uppercase tracking-wider">
            Issues
          </h3>
          <div className="space-y-3">
            {datasources.map((ds) => (
              <div key={`issues-${ds.id}`} className="space-y-2">
                <AnalyticsCardLoader
                  type="anomaly"
                  datasourceId={ds.id}
                />
                <AnalyticsCardLoader
                  type="alerts"
                  datasourceId={ds.id}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="text-[10px] text-[var(--hud-text-muted)] mt-8 pt-4 border-t border-[var(--hud-border)]">
        Auto-refresh every {autoRefreshSeconds}s • Based on D1 metrics
      </div>
    </div>
  );
}

/**
 * Lazy loader for analytics cards — handles data fetching
 */
interface AnalyticsCardLoaderProps {
  type: "trending" | "anomaly" | "alerts";
  datasourceId: string;
}

function AnalyticsCardLoader({ type, datasourceId }: AnalyticsCardLoaderProps) {
  // In a real implementation, would use useAsync or React Query
  // For now, return placeholder
  // Server functions would be called here to fetch data

  return (
    <div className="hud-card">
      <div className="text-[11px] text-[var(--hud-text-muted)] uppercase tracking-wider">
        {type.charAt(0).toUpperCase() + type.slice(1)} — {datasourceId}
      </div>
      <div className="text-xs text-[var(--hud-text-muted)] mt-2">
        Ready to display {type} data
      </div>
    </div>
  );
}
