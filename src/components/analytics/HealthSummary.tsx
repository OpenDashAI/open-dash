/**
 * Health Summary — Overall health status for all datasources
 */

export interface HealthSummaryData {
  totalDatasources: number;
  healthy: number;
  degraded: number;
  critical: number;
  lastUpdated: string;
}

export interface HealthSummaryProps {
  health: HealthSummaryData | null;
  loading?: boolean;
  error?: string;
}

export function HealthSummary({
  health,
  loading = false,
  error,
}: HealthSummaryProps) {
  if (error) {
    return (
      <div className="hud-card">
        <div className="text-[11px] text-[var(--hud-error)] uppercase tracking-wider">
          Health Summary
        </div>
        <div className="text-xs text-[var(--hud-text-muted)] mt-2">{error}</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="hud-card">
        <div className="text-[11px] text-[var(--hud-text-muted)] uppercase tracking-wider">
          Health Summary
        </div>
        <div className="text-xs text-[var(--hud-text-muted)] mt-2">
          Loading...
        </div>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="hud-card">
        <div className="text-[11px] text-[var(--hud-text-muted)] uppercase tracking-wider">
          Health Summary
        </div>
        <div className="text-xs text-[var(--hud-text-muted)] mt-2">
          No data
        </div>
      </div>
    );
  }

  const unhealthyCount = health.degraded + health.critical;
  const healthPercentage =
    health.totalDatasources > 0
      ? Math.round((health.healthy / health.totalDatasources) * 100)
      : 0;

  const getOverallStatus = () => {
    if (health.critical > 0) return { label: "Critical", color: "text-[var(--hud-error)]" };
    if (health.degraded > 0) return { label: "Degraded", color: "text-yellow-400" };
    return { label: "Healthy", color: "text-[var(--hud-success)]" };
  };

  const status = getOverallStatus();

  return (
    <div className="hud-card">
      <div className="text-[11px] text-[var(--hud-text-muted)] uppercase tracking-wider">
        Overall Health
      </div>

      {/* Status Indicator */}
      <div className={`text-xl font-semibold ${status.color} mt-2`}>
        {status.label}
      </div>

      {/* Health Percentage */}
      <div className="mt-3 text-sm">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[var(--hud-text-muted)]">Health:</span>
          <span className="font-mono text-[var(--hud-text-bright)]">
            {healthPercentage}%
          </span>
        </div>
        <div className="h-2 bg-[var(--hud-bg-secondary)] rounded overflow-hidden">
          <div
            className="h-full bg-[var(--hud-success)] transition-all"
            style={{ width: `${healthPercentage}%` }}
          />
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="mt-4 space-y-1.5 text-xs">
        <div className="flex justify-between">
          <span className="text-[var(--hud-text-muted)]">Healthy:</span>
          <span className="font-mono text-[var(--hud-success)]">
            {health.healthy}/{health.totalDatasources}
          </span>
        </div>
        {health.degraded > 0 && (
          <div className="flex justify-between">
            <span className="text-[var(--hud-text-muted)]">Degraded:</span>
            <span className="font-mono text-yellow-400">{health.degraded}</span>
          </div>
        )}
        {health.critical > 0 && (
          <div className="flex justify-between">
            <span className="text-[var(--hud-text-muted)]">Critical:</span>
            <span className="font-mono text-[var(--hud-error)]">
              {health.critical}
            </span>
          </div>
        )}
      </div>

      {/* Last Updated */}
      <div className="mt-3 text-[10px] text-[var(--hud-text-muted)]">
        Updated: {new Date(health.lastUpdated).toLocaleTimeString()}
      </div>
    </div>
  );
}
