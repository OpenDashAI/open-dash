/**
 * Quality Checker Component — Displays quality verification status
 *
 * Pure status display (NO editing UI).
 * Shows: automated checks, manual verification, quality gates
 * All quality work happens via CLI in chat.
 */

import React from "react";

export interface QualityCheckItem {
  name: string;
  category: "script" | "storyboard" | "assets" | "composition" | "export";
  passed: boolean;
  automated: boolean;
  details?: string;
  severity?: "critical" | "warning" | "info";
}

export interface QualityCheckerData {
  overallStatus: "passing" | "warning" | "failing";
  checks: QualityCheckItem[];
  passedCount: number;
  totalCount: number;
  blocksExport: boolean;
  lastUpdated: string;
}

export interface QualityCheckerProps {
  checker: QualityCheckerData | null;
  loading?: boolean;
  error?: string;
}

export function QualityChecker({
  checker,
  loading = false,
  error,
}: QualityCheckerProps) {
  if (error) {
    return (
      <div className="hud-card">
        <div className="text-[11px] text-[var(--hud-error)] uppercase tracking-wider">
          Quality Checker
        </div>
        <div className="text-xs text-[var(--hud-text-muted)] mt-2">{error}</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="hud-card">
        <div className="text-[11px] text-[var(--hud-text-muted)] uppercase tracking-wider">
          Quality Checker
        </div>
        <div className="text-xs text-[var(--hud-text-muted)] mt-2">
          Loading...
        </div>
      </div>
    );
  }

  if (!checker) {
    return (
      <div className="hud-card">
        <div className="text-[11px] text-[var(--hud-text-muted)] uppercase tracking-wider">
          Quality Checker
        </div>
        <div className="text-xs text-[var(--hud-text-muted)] mt-2">
          No quality data
        </div>
      </div>
    );
  }

  // Status color and label
  const getStatusDisplay = () => {
    switch (checker.overallStatus) {
      case "passing":
        return { color: "text-[var(--hud-success)]", label: "Passing" };
      case "warning":
        return { color: "text-yellow-400", label: "Warning" };
      case "failing":
        return { color: "text-[var(--hud-error)]", label: "Failing" };
      default:
        return { color: "text-[var(--hud-text-muted)]", label: "Unknown" };
    }
  };

  const status = getStatusDisplay();
  const passPercentage = Math.round(
    (checker.passedCount / checker.totalCount) * 100
  );

  // Group checks by category
  const checksByCategory = checker.checks.reduce(
    (acc, check) => {
      if (!acc[check.category]) {
        acc[check.category] = [];
      }
      acc[check.category].push(check);
      return acc;
    },
    {} as Record<string, QualityCheckItem[]>
  );

  const failedChecks = checker.checks.filter((c) => !c.passed);

  return (
    <div className="hud-card">
      {/* Header */}
      <div className="text-[11px] text-[var(--hud-text-muted)] uppercase tracking-wider">
        Quality Checker
      </div>

      {/* Overall Status */}
      <div className={`text-lg font-semibold ${status.color} mt-2`}>
        {status.label}
      </div>

      {/* Export Block Indicator */}
      {checker.blocksExport && (
        <div className="mt-2 text-[10px] text-[var(--hud-error)] uppercase tracking-wider">
          ⚠️ Blocks Export
        </div>
      )}

      {/* Pass Rate */}
      <div className="mt-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-[var(--hud-text-muted)]">
            Checks Passed
          </span>
          <span className={`text-sm font-mono font-semibold`}>
            {checker.passedCount} / {checker.totalCount}
          </span>
        </div>
        <div className="h-2 bg-[var(--hud-bg-secondary)] rounded overflow-hidden">
          <div
            className={`h-full transition-all ${
              checker.overallStatus === "passing"
                ? "bg-[var(--hud-success)]"
                : "bg-yellow-400"
            }`}
            style={{ width: `${passPercentage}%` }}
          />
        </div>
      </div>

      {/* Failed Checks Summary */}
      {failedChecks.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[var(--hud-bg-secondary)]">
          <div className="text-[10px] text-[var(--hud-error)] uppercase tracking-wider mb-1.5">
            Issues ({failedChecks.length})
          </div>
          <div className="space-y-1">
            {failedChecks.slice(0, 4).map((check, idx) => (
              <div key={idx} className="text-[10px] flex items-start gap-1">
                <span
                  className={`flex-shrink-0 ${
                    check.severity === "critical"
                      ? "text-[var(--hud-error)]"
                      : "text-yellow-400"
                  }`}
                >
                  ✕
                </span>
                <div className="flex-1">
                  <div className="text-[var(--hud-text-bright)]">{check.name}</div>
                  {check.details && (
                    <div className="text-[var(--hud-text-muted)] mt-0.5">
                      {check.details}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Summary */}
      {checker.overallStatus === "passing" && (
        <div className="mt-3 pt-3 border-t border-[var(--hud-bg-secondary)]">
          <div className="text-[10px] text-[var(--hud-text-muted)] uppercase tracking-wider mb-1.5">
            Categories
          </div>
          <div className="space-y-1">
            {Object.entries(checksByCategory).map(([category, checks]) => {
              const categoryPassed = checks.every((c) => c.passed);
              return (
                <div key={category} className="flex justify-between text-[10px]">
                  <span className="capitalize text-[var(--hud-text-muted)]">
                    {category}
                  </span>
                  <span
                    className={
                      categoryPassed
                        ? "text-[var(--hud-success)]"
                        : "text-[var(--hud-error)]"
                    }
                  >
                    {categoryPassed ? "✓" : "✕"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="mt-3 text-[10px] text-[var(--hud-text-muted)]">
        Updated: {new Date(checker.lastUpdated).toLocaleTimeString()}
      </div>
    </div>
  );
}
