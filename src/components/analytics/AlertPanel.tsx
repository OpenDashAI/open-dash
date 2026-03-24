/**
 * Alert Panel — Display alert history and active alerts
 */

import { useMemo } from "react";
import type { Alert } from "../../lib/analytics/alerts";

export interface AlertPanelProps {
  alerts: Alert[];
  datasourceId: string;
  maxItems?: number;
  loading?: boolean;
  error?: string;
}

export function AlertPanel({
  alerts,
  datasourceId,
  maxItems = 10,
  loading = false,
  error,
}: AlertPanelProps) {
  const sortedAlerts = useMemo(() => {
    return [...alerts].sort((a, b) => b.timestamp - a.timestamp).slice(0, maxItems);
  }, [alerts, maxItems]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-600 text-white";
      case "high":
        return "bg-orange-600 text-white";
      case "medium":
        return "bg-yellow-600 text-white";
      case "low":
        return "bg-blue-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) return "now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  if (error) {
    return (
      <div className="hud-card">
        <div className="text-[11px] text-[var(--hud-error)] uppercase tracking-wider">
          Alerts
        </div>
        <div className="text-xs text-[var(--hud-text-muted)] mt-2">{error}</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="hud-card">
        <div className="text-[11px] text-[var(--hud-text-muted)] uppercase tracking-wider">
          Alerts
        </div>
        <div className="text-xs text-[var(--hud-text-muted)] mt-2">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="hud-card">
      <div className="text-[11px] text-[var(--hud-text-muted)] uppercase tracking-wider">
        {datasourceId} Alerts
      </div>

      {sortedAlerts.length === 0 ? (
        <div className="text-xs text-[var(--hud-text-muted)] mt-3">
          No active alerts
        </div>
      ) : (
        <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
          {sortedAlerts.map((alert) => (
            <div
              key={alert.id}
              className="text-xs border-l-2 border-gray-600 pl-2 py-1"
            >
              {/* Severity Badge + Timestamp */}
              <div className="flex items-center justify-between gap-2 mb-1">
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${getSeverityColor(alert.severity)}`}
                >
                  {alert.severity.toUpperCase()}
                </span>
                <span className="text-[9px] text-[var(--hud-text-muted)]">
                  {formatTime(alert.timestamp)}
                </span>
              </div>

              {/* Message */}
              <div className="text-[var(--hud-text-bright)] mb-1">
                {alert.message}
              </div>

              {/* Value */}
              <div className="text-[9px] text-[var(--hud-text-muted)] font-mono">
                Value: {alert.value.toFixed(2)}
              </div>

              {/* Status */}
              {alert.acknowledged && (
                <div className="text-[9px] text-green-400 mt-1">
                  ✓ Acknowledged
                </div>
              )}
              {alert.resolved && (
                <div className="text-[9px] text-gray-400 mt-1">
                  ✓ Resolved
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {alerts.length > maxItems && (
        <div className="text-[9px] text-[var(--hud-text-muted)] mt-2">
          +{alerts.length - maxItems} more alerts
        </div>
      )}
    </div>
  );
}
