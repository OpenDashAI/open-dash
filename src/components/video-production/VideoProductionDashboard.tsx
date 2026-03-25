/**
 * Video Production Dashboard — Complete workflow integration
 *
 * EPIC #493 #500: Workflow Integration
 *
 * Integrates all 6 video production components into a single workflow dashboard.
 * Shows progression from script → storyboard → assets → composition → quality → export/publish.
 *
 * Pure observation-only. All work happens via CLI in chat.
 */

import React, { useState } from "react";
import { ScriptManagement, type ScriptData } from "./ScriptManagement";
import { StoryboardManagement, type StoryboardData } from "./StoryboardManagement";
import { AssetTracker, type AssetTrackerData } from "./AssetTracker";
import { CompositionTracker, type CompositionTrackerData } from "./CompositionTracker";
import { QualityChecker, type QualityCheckerData } from "./QualityChecker";
import { ExportManager, type ExportManagerData } from "./ExportManager";

export interface VideoProductionDashboardData {
  script: ScriptData | null;
  storyboard: StoryboardData | null;
  assets: AssetTrackerData | null;
  composition: CompositionTrackerData | null;
  quality: QualityCheckerData | null;
  export: ExportManagerData | null;
}

export interface VideoProductionDashboardProps {
  data: VideoProductionDashboardData;
  loading?: boolean;
  error?: string;
}

type ComponentView = "overview" | "script" | "storyboard" | "assets" | "composition" | "quality" | "export";

const workflowSteps: { id: ComponentView; label: string; emoji: string }[] = [
  { id: "script", label: "Script", emoji: "📝" },
  { id: "storyboard", label: "Storyboard", emoji: "🎞️" },
  { id: "assets", label: "Assets", emoji: "📦" },
  { id: "composition", label: "Composition", emoji: "🎬" },
  { id: "quality", label: "Quality", emoji: "✓" },
  { id: "export", label: "Export", emoji: "▶" },
];

export function VideoProductionDashboard({
  data,
  loading = false,
  error,
}: VideoProductionDashboardProps) {
  const [activeView, setActiveView] = useState<ComponentView>("overview");

  if (error) {
    return (
      <div className="hud-card">
        <div className="text-[11px] text-[var(--hud-error)] uppercase tracking-wider">
          Video Production Dashboard
        </div>
        <div className="text-xs text-[var(--hud-text-muted)] mt-2">{error}</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="hud-card">
        <div className="text-[11px] text-[var(--hud-text-muted)] uppercase tracking-wider">
          Video Production Dashboard
        </div>
        <div className="text-xs text-[var(--hud-text-muted)] mt-2">
          Loading...
        </div>
      </div>
    );
  }

  // Calculate workflow progress
  const getStepStatus = (
    step: ComponentView
  ): "pending" | "in-progress" | "complete" => {
    switch (step) {
      case "script":
        return data.script?.status === "approved" ? "complete" : "in-progress";
      case "storyboard":
        return data.storyboard?.totalScenes === data.storyboard?.totalScenes
          ? "complete"
          : "in-progress";
      case "assets":
        return data.assets && data.assets.overallProgress >= 80
          ? "complete"
          : "in-progress";
      case "composition":
        return data.composition &&
          data.composition.completedScenes === data.composition.totalScenes
          ? "complete"
          : "in-progress";
      case "quality":
        return data.quality?.overallStatus === "passing" ? "complete" : "in-progress";
      case "export":
        return data.export?.overallStatus === "published" ||
          data.export?.overallStatus === "uploaded"
          ? "complete"
          : "in-progress";
      default:
        return "pending";
    }
  };

  const getStepColor = (status: "pending" | "in-progress" | "complete"): string => {
    switch (status) {
      case "complete":
        return "text-[var(--hud-success)]";
      case "in-progress":
        return "text-yellow-400";
      case "pending":
        return "text-[var(--hud-text-muted)]";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="hud-card">
        <div className="text-[11px] text-[var(--hud-text-muted)] uppercase tracking-wider">
          Video Production Dashboard
        </div>
        <div className="text-xs text-[var(--hud-text-bright)] mt-1">
          EPIC #493 — Workflow Integration
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="hud-card">
        <div className="text-[11px] text-[var(--hud-text-muted)] uppercase tracking-wider mb-2">
          Workflow Status
        </div>
        <div className="flex flex-wrap gap-2">
          {workflowSteps.map((step, idx) => {
            const status = getStepStatus(step.id);
            const color = getStepColor(status);
            const isActive = activeView === step.id;

            return (
              <div key={step.id}>
                <button
                  onClick={() => setActiveView(step.id)}
                  className={`
                    px-3 py-1 rounded text-[11px] font-semibold uppercase tracking-wider
                    transition-all cursor-pointer
                    ${
                      isActive
                        ? "bg-[var(--hud-bg-secondary)] border border-[var(--hud-text-bright)]"
                        : "border border-[var(--hud-bg-secondary)]"
                    }
                    ${color}
                  `}
                >
                  {step.emoji} {step.label}
                </button>
                {idx < workflowSteps.length - 1 && (
                  <span className="text-[var(--hud-text-muted)] px-1">→</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Component View */}
      {activeView === "overview" && (
        <div className="grid grid-cols-1 gap-4">
          <ScriptManagement script={data.script} />
          <StoryboardManagement storyboard={data.storyboard} />
          <AssetTracker tracker={data.assets} />
        </div>
      )}

      {activeView === "script" && <ScriptManagement script={data.script} />}

      {activeView === "storyboard" && (
        <StoryboardManagement storyboard={data.storyboard} />
      )}

      {activeView === "assets" && <AssetTracker tracker={data.assets} />}

      {activeView === "composition" && (
        <CompositionTracker tracker={data.composition} />
      )}

      {activeView === "quality" && <QualityChecker checker={data.quality} />}

      {activeView === "export" && <ExportManager manager={data.export} />}
    </div>
  );
}
