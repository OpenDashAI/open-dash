/**
 * Anomaly Badge — Display anomaly alerts with severity indicators
 */

import type { AnomalyData } from "../../server/analytics";

export interface AnomalyBadgeProps {
  datasourceId: string;
  anomalies: AnomalyData | null;
  loading?: boolean;
  error?: string;
}

export function AnomalyBadge({
  datasourceId,
  anomalies,
  loading = false,
  error,
}: AnomalyBadgeProps) {
  const getSeverityColor = (
    severity: "low" | "medium" | "high" | "critical"
  ) => {
    switch (severity) {
      case "critical":
        return "bg-[var(--hud-error)] text-white";
      case "high":
        return "bg-orange-600 text-white";
      case "medium":
        return "bg-yellow-600 text-white";
      case "low":
        return "bg-blue-700 text-white";
    }
  };

  if (error) {
    return (
      <div className="px-2 py-1 rounded text-[10px] bg-[var(--hud-error)] text-white">
        Error
      </div>
    );
  }

  if (loading) {
    return (
      <div className="px-2 py-1 rounded text-[10px] bg-[var(--hud-text-muted)] text-white opacity-50">
        ...
      </div>
    );
  }

  if (!anomalies || anomalies.anomalies.length === 0) {
    return (
      <div className="px-2 py-1 rounded text-[10px] bg-[var(--hud-success)] text-white">
        Normal
      </div>
    );
  }

  const maxSeverity = anomalies.anomalies.reduce((max, a) => {
    const severityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
    return severityOrder[a.severity] > severityOrder[max.severity]
      ? a
      : max;
  });

  return (
    <div
      className={`px-2 py-1 rounded text-[10px] font-semibold ${getSeverityColor(maxSeverity.severity)} cursor-help`}
      title={`${anomalies.anomalies.length} anomaly(ies) detected\nMax severity: ${maxSeverity.severity}\nZ-score: ${maxSeverity.zScore.toFixed(2)}`}
    >
      {anomalies.anomalies.length} anomaly
      {anomalies.anomalies.length !== 1 ? "ies" : ""}
    </div>
  );
}
