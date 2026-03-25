/**
 * Storyboard Management Component — Displays scene-by-scene breakdown
 *
 * Pure status display (NO editing UI).
 * Shows: scene count, timing, visual descriptions, voiceover, asset requirements
 * All editing happens via CLI in chat.
 */

import React, { useState } from "react";

export interface StoryboardScene {
  sceneNumber: number;
  duration: number; // in seconds
  visualDescription: string;
  voiceoverText: string;
  audioNotes?: string;
  assetRequirements: {
    broll?: string[];
    graphics?: string[];
    voiceover?: boolean;
    musicCues?: string[];
  };
}

export interface StoryboardData {
  totalScenes: number;
  totalDuration: number; // in seconds
  scenes: StoryboardScene[];
  targetDuration?: number; // expected runtime in seconds
  lastUpdated: string;
}

export interface StoryboardManagementProps {
  storyboard: StoryboardData | null;
  loading?: boolean;
  error?: string;
}

export function StoryboardManagement({
  storyboard,
  loading = false,
  error,
}: StoryboardManagementProps) {
  const [expandedScenes, setExpandedScenes] = useState<Set<number>>(new Set());

  const toggleScene = (sceneNumber: number) => {
    const updated = new Set(expandedScenes);
    if (updated.has(sceneNumber)) {
      updated.delete(sceneNumber);
    } else {
      updated.add(sceneNumber);
    }
    setExpandedScenes(updated);
  };

  if (error) {
    return (
      <div className="hud-card">
        <div className="text-[11px] text-[var(--hud-error)] uppercase tracking-wider">
          Storyboard Tracker
        </div>
        <div className="text-xs text-[var(--hud-text-muted)] mt-2">{error}</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="hud-card">
        <div className="text-[11px] text-[var(--hud-text-muted)] uppercase tracking-wider">
          Storyboard Tracker
        </div>
        <div className="text-xs text-[var(--hud-text-muted)] mt-2">
          Loading...
        </div>
      </div>
    );
  }

  if (!storyboard) {
    return (
      <div className="hud-card">
        <div className="text-[11px] text-[var(--hud-text-muted)] uppercase tracking-wider">
          Storyboard Tracker
        </div>
        <div className="text-xs text-[var(--hud-text-muted)] mt-2">
          No storyboard data
        </div>
      </div>
    );
  }

  // Format time
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  // Duration status
  const durationMatch = storyboard.targetDuration
    ? Math.abs(storyboard.totalDuration - storyboard.targetDuration) <= 30
    : true;
  const durationColor = durationMatch
    ? "text-[var(--hud-success)]"
    : "text-[var(--hud-error)]";

  // Scene count status (target: 40-50 scenes)
  const sceneCountGood =
    storyboard.totalScenes >= 40 && storyboard.totalScenes <= 50;
  const sceneCountColor = sceneCountGood
    ? "text-[var(--hud-success)]"
    : "text-[var(--hud-error)]";

  return (
    <div className="hud-card">
      {/* Header */}
      <div className="text-[11px] text-[var(--hud-text-muted)] uppercase tracking-wider">
        Storyboard Tracker
      </div>

      {/* Scene Count */}
      <div className="mt-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-[var(--hud-text-muted)]">
            Total Scenes
          </span>
          <span className={`text-sm font-mono font-semibold ${sceneCountColor}`}>
            {storyboard.totalScenes}
            <span className="text-[var(--hud-text-muted)] ml-1">
              / 40-50
            </span>
          </span>
        </div>
        <div className="h-1.5 bg-[var(--hud-bg-secondary)] rounded overflow-hidden">
          <div
            className={`h-full transition-all ${
              sceneCountGood
                ? "bg-[var(--hud-success)]"
                : "bg-[var(--hud-error)]"
            }`}
            style={{
              width: `${Math.min(
                (storyboard.totalScenes / 55) * 100,
                100
              )}%`,
            }}
          />
        </div>
      </div>

      {/* Total Duration */}
      <div className="mt-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-[var(--hud-text-muted)]">
            Total Duration
          </span>
          <span className={`text-sm font-mono font-semibold ${durationColor}`}>
            {formatTime(storyboard.totalDuration)}
            {storyboard.targetDuration && (
              <span className="text-[var(--hud-text-muted)] ml-1">
                / {formatTime(storyboard.targetDuration)}
              </span>
            )}
          </span>
        </div>
        {storyboard.targetDuration && (
          <div className="h-1.5 bg-[var(--hud-bg-secondary)] rounded overflow-hidden">
            <div
              className={`h-full transition-all ${
                durationMatch
                  ? "bg-[var(--hud-success)]"
                  : "bg-[var(--hud-error)]"
              }`}
              style={{
                width: `${Math.min(
                  (storyboard.totalDuration / (storyboard.targetDuration * 1.1)) * 100,
                  100
                )}%`,
              }}
            />
          </div>
        )}
      </div>

      {/* Scenes List */}
      <div className="mt-4 space-y-1">
        <div className="text-[10px] text-[var(--hud-text-muted)] uppercase tracking-wider mb-2">
          Scenes ({storyboard.scenes.length})
        </div>
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {storyboard.scenes.slice(0, 10).map((scene) => (
            <div
              key={scene.sceneNumber}
              className="border border-[var(--hud-bg-secondary)] rounded p-1.5 cursor-pointer hover:border-[var(--hud-text-muted)] transition-colors"
              onClick={() => toggleScene(scene.sceneNumber)}
            >
              {/* Scene Header */}
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-[var(--hud-text-bright)]">
                  Scene {scene.sceneNumber.toString().padStart(2, "0")}
                </span>
                <span className="text-[10px] font-mono text-[var(--hud-text-muted)]">
                  {formatTime(scene.duration)}
                </span>
              </div>

              {/* Visual Description (truncated) */}
              <div className="text-[10px] text-[var(--hud-text-muted)] mt-0.5 truncate">
                {scene.visualDescription}
              </div>

              {/* Expanded View */}
              {expandedScenes.has(scene.sceneNumber) && (
                <div className="mt-2 pt-2 border-t border-[var(--hud-bg-secondary)] space-y-1.5 text-[10px]">
                  {/* Visual Description */}
                  <div>
                    <div className="text-[var(--hud-text-muted)] uppercase tracking-wider">
                      Visual
                    </div>
                    <div className="text-[var(--hud-text-bright)]">
                      {scene.visualDescription}
                    </div>
                  </div>

                  {/* Voiceover */}
                  {scene.voiceoverText && (
                    <div>
                      <div className="text-[var(--hud-text-muted)] uppercase tracking-wider">
                        VO
                      </div>
                      <div className="text-[var(--hud-text-bright)] italic">
                        "{scene.voiceoverText.substring(0, 100)}
                        {scene.voiceoverText.length > 100 ? "..." : ""}"
                      </div>
                    </div>
                  )}

                  {/* Asset Requirements */}
                  {scene.assetRequirements && (
                    <div>
                      <div className="text-[var(--hud-text-muted)] uppercase tracking-wider">
                        Assets
                      </div>
                      <div className="space-y-0.5">
                        {scene.assetRequirements.broll?.length > 0 && (
                          <div className="text-[var(--hud-text-bright)]">
                            B-roll: {scene.assetRequirements.broll.join(", ")}
                          </div>
                        )}
                        {scene.assetRequirements.graphics?.length > 0 && (
                          <div className="text-[var(--hud-text-bright)]">
                            Graphics: {scene.assetRequirements.graphics.join(", ")}
                          </div>
                        )}
                        {scene.assetRequirements.musicCues?.length > 0 && (
                          <div className="text-[var(--hud-text-bright)]">
                            Music: {scene.assetRequirements.musicCues.join(", ")}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Audio Notes */}
                  {scene.audioNotes && (
                    <div>
                      <div className="text-[var(--hud-text-muted)] uppercase tracking-wider">
                        Audio
                      </div>
                      <div className="text-[var(--hud-text-bright)]">
                        {scene.audioNotes}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Last Updated */}
      <div className="mt-3 text-[10px] text-[var(--hud-text-muted)]">
        Updated: {new Date(storyboard.lastUpdated).toLocaleTimeString()}
      </div>
    </div>
  );
}
