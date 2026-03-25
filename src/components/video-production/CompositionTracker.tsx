/**
 * Composition Tracker Component — Displays scene composition progress
 *
 * Pure status display (NO editing UI).
 * Shows: scenes completed, in progress, queued, and issues
 * All composition work happens via CLI in chat.
 */

import React from "react";

export interface CompositionTask {
  sceneNumber: number;
  status: "queued" | "in-progress" | "completed" | "blocked";
  progress: number; // 0-100%
  startedAt?: string;
  completedAt?: string;
  issues?: string[];
}

export interface CompositionTrackerData {
  totalScenes: number;
  completedScenes: number;
  inProgressScene?: number;
  tasks: CompositionTask[];
  lastUpdated: string;
}

export interface CompositionTrackerProps {
  tracker: CompositionTrackerData | null;
  loading?: boolean;
  error?: string;
}

export function CompositionTracker({
  tracker,
  loading = false,
  error,
}: CompositionTrackerProps) {
  if (error) {
    return (
      <div className="hud-card">
        <div className="text-[11px] text-[var(--hud-error)] uppercase tracking-wider">
          Composition Tracker
        </div>
        <div className="text-xs text-[var(--hud-text-muted)] mt-2">{error}</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="hud-card">
        <div className="text-[11px] text-[var(--hud-text-muted)] uppercase tracking-wider">
          Composition Tracker
        </div>
        <div className="text-xs text-[var(--hud-text-muted)] mt-2">
          Loading...
        </div>
      </div>
    );
  }

  if (!tracker) {
    return (
      <div className="hud-card">
        <div className="text-[11px] text-[var(--hud-text-muted)] uppercase tracking-wider">
          Composition Tracker
        </div>
        <div className="text-xs text-[var(--hud-text-muted)] mt-2">
          No composition data
        </div>
      </div>
    );
  }

  const completionPercentage = Math.round(
    (tracker.completedScenes / tracker.totalScenes) * 100
  );
  const completionColor =
    completionPercentage >= 80
      ? "text-[var(--hud-success)]"
      : completionPercentage >= 50
        ? "text-yellow-400"
        : "text-[var(--hud-error)]";

  const blockedTasks = tracker.tasks.filter((t) => t.status === "blocked");

  return (
    <div className="hud-card">
      {/* Header */}
      <div className="text-[11px] text-[var(--hud-text-muted)] uppercase tracking-wider">
        Composition Tracker
      </div>

      {/* Completion Progress */}
      <div className="mt-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-[var(--hud-text-muted)]">
            Scenes Completed
          </span>
          <span className={`text-sm font-mono font-semibold ${completionColor}`}>
            {tracker.completedScenes} / {tracker.totalScenes}
          </span>
        </div>
        <div className="h-2 bg-[var(--hud-bg-secondary)] rounded overflow-hidden">
          <div
            className="h-full bg-[var(--hud-success)] transition-all"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Overall Progress */}
      <div className="mt-2 text-xs flex justify-between text-[var(--hud-text-muted)]">
        <span>Overall Progress</span>
        <span className="font-mono text-[var(--hud-text-bright)]">
          {completionPercentage}%
        </span>
      </div>

      {/* Currently In Progress */}
      {tracker.inProgressScene !== undefined && (
        <div className="mt-3 pt-3 border-t border-[var(--hud-bg-secondary)]">
          <div className="text-[10px] text-[var(--hud-text-muted)] uppercase tracking-wider mb-1.5">
            Currently In Progress
          </div>
          <div className="bg-[var(--hud-bg-secondary)] rounded p-1.5">
            <div className="text-xs font-semibold text-yellow-400 mb-1">
              Scene {tracker.inProgressScene.toString().padStart(2, "0")}
            </div>
            {tracker.tasks
              .find((t) => t.sceneNumber === tracker.inProgressScene)
              ?.progress !== undefined && (
              <div>
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-[10px] text-[var(--hud-text-muted)]">
                    Progress
                  </span>
                  <span className="text-[10px] font-mono text-[var(--hud-text-bright)]">
                    {tracker.tasks.find((t) => t.sceneNumber === tracker.inProgressScene)?.progress || 0}%
                  </span>
                </div>
                <div className="h-1 bg-[var(--hud-bg-primary)] rounded overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all"
                    style={{
                      width: `${tracker.tasks.find((t) => t.sceneNumber === tracker.inProgressScene)?.progress || 0}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status Summary */}
      <div className="mt-3 space-y-1 text-[10px]">
        <div className="flex justify-between">
          <span className="text-[var(--hud-success)]">✓ Completed</span>
          <span className="font-mono text-[var(--hud-text-bright)]">
            {tracker.tasks.filter((t) => t.status === "completed").length}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-yellow-400">⟳ Queued</span>
          <span className="font-mono text-[var(--hud-text-bright)]">
            {tracker.tasks.filter((t) => t.status === "queued").length}
          </span>
        </div>
        {blockedTasks.length > 0 && (
          <div className="flex justify-between">
            <span className="text-[var(--hud-error)]">⚠ Blocked</span>
            <span className="font-mono text-[var(--hud-text-bright)]">
              {blockedTasks.length}
            </span>
          </div>
        )}
      </div>

      {/* Blocked Tasks Details */}
      {blockedTasks.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[var(--hud-bg-secondary)]">
          <div className="text-[10px] text-[var(--hud-error)] uppercase tracking-wider mb-1.5">
            Issues ({blockedTasks.length})
          </div>
          <div className="space-y-1">
            {blockedTasks.slice(0, 3).map((task) => (
              <div key={task.sceneNumber} className="text-[10px] bg-[var(--hud-bg-secondary)] rounded p-1">
                <div className="text-[var(--hud-error)] font-semibold">
                  Scene {task.sceneNumber.toString().padStart(2, "0")}
                </div>
                {task.issues && task.issues.length > 0 && (
                  <div className="text-[var(--hud-text-muted)] mt-0.5">
                    {task.issues[0]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="mt-3 text-[10px] text-[var(--hud-text-muted)]">
        Updated: {new Date(tracker.lastUpdated).toLocaleTimeString()}
      </div>
    </div>
  );
}
