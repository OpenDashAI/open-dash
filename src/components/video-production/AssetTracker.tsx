/**
 * Asset Tracker Component — Displays asset collection status
 *
 * Pure status display (NO editing UI).
 * Shows: B-roll, graphics, voiceover, music collection progress
 * All asset work happens via CLI in chat.
 */

import React from "react";

type AssetStatus = "needed" | "filming" | "uploading" | "ready";

export interface Asset {
  id: string;
  name: string;
  type: "broll" | "graphics" | "voiceover" | "music" | "titles";
  status: AssetStatus;
  dueDate?: string;
  notes?: string;
}

export interface AssetCounts {
  broll: {
    needed: number;
    filming: number;
    uploading: number;
    ready: number;
  };
  graphics: {
    needed: number;
    designed: number;
    animated: number;
    ready: number;
  };
  voiceover: {
    needed: number;
    recorded: number;
    editing: number;
    ready: number;
  };
  music: {
    needed: number;
    selected: number;
    licensed: number;
    ready: number;
  };
}

export interface AssetTrackerData {
  assets: Asset[];
  counts: AssetCounts;
  overallProgress: number; // 0-100%
  lastUpdated: string;
}

export interface AssetTrackerProps {
  tracker: AssetTrackerData | null;
  loading?: boolean;
  error?: string;
}

const getStatusColor = (status: AssetStatus | string): string => {
  const statusLower = status.toLowerCase();
  if (statusLower === "ready") return "text-[var(--hud-success)]";
  if (statusLower === "needed") return "text-[var(--hud-error)]";
  return "text-yellow-400";
};

const getAssetTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    broll: "🎬",
    graphics: "🎨",
    voiceover: "🎙️",
    music: "🎵",
    titles: "📝",
  };
  return icons[type] || "📦";
};

export function AssetTracker({
  tracker,
  loading = false,
  error,
}: AssetTrackerProps) {
  if (error) {
    return (
      <div className="hud-card">
        <div className="text-[11px] text-[var(--hud-error)] uppercase tracking-wider">
          Asset Tracker
        </div>
        <div className="text-xs text-[var(--hud-text-muted)] mt-2">{error}</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="hud-card">
        <div className="text-[11px] text-[var(--hud-text-muted)] uppercase tracking-wider">
          Asset Tracker
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
          Asset Tracker
        </div>
        <div className="text-xs text-[var(--hud-text-muted)] mt-2">
          No asset data
        </div>
      </div>
    );
  }

  const overallProgressColor =
    tracker.overallProgress >= 80
      ? "text-[var(--hud-success)]"
      : tracker.overallProgress >= 50
        ? "text-yellow-400"
        : "text-[var(--hud-error)]";

  return (
    <div className="hud-card">
      {/* Header */}
      <div className="text-[11px] text-[var(--hud-text-muted)] uppercase tracking-wider">
        Asset Tracker
      </div>

      {/* Overall Progress */}
      <div className="mt-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-[var(--hud-text-muted)]">
            Overall Progress
          </span>
          <span className={`text-sm font-mono font-semibold ${overallProgressColor}`}>
            {tracker.overallProgress}%
          </span>
        </div>
        <div className="h-2 bg-[var(--hud-bg-secondary)] rounded overflow-hidden">
          <div
            className="h-full bg-[var(--hud-success)] transition-all"
            style={{ width: `${tracker.overallProgress}%` }}
          />
        </div>
      </div>

      {/* B-Roll */}
      <div className="mt-4">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-lg">🎬</span>
          <div className="flex-1">
            <span className="text-xs font-semibold text-[var(--hud-text-bright)]">
              B-Roll
            </span>
            <span className="text-[10px] text-[var(--hud-text-muted)] ml-2">
              {tracker.counts.broll.ready}/
              {tracker.counts.broll.needed +
                tracker.counts.broll.filming +
                tracker.counts.broll.uploading +
                tracker.counts.broll.ready}
            </span>
          </div>
        </div>
        <div className="space-y-0.5 text-[10px] ml-7">
          {tracker.counts.broll.ready > 0 && (
            <div className="flex justify-between">
              <span className="text-[var(--hud-success)]">Ready</span>
              <span className="font-mono text-[var(--hud-text-bright)]">
                {tracker.counts.broll.ready}
              </span>
            </div>
          )}
          {tracker.counts.broll.uploading > 0 && (
            <div className="flex justify-between">
              <span className="text-yellow-400">Uploading</span>
              <span className="font-mono text-[var(--hud-text-bright)]">
                {tracker.counts.broll.uploading}
              </span>
            </div>
          )}
          {tracker.counts.broll.filming > 0 && (
            <div className="flex justify-between">
              <span className="text-yellow-400">Filming</span>
              <span className="font-mono text-[var(--hud-text-bright)]">
                {tracker.counts.broll.filming}
              </span>
            </div>
          )}
          {tracker.counts.broll.needed > 0 && (
            <div className="flex justify-between">
              <span className="text-[var(--hud-error)]">Needed</span>
              <span className="font-mono text-[var(--hud-text-bright)]">
                {tracker.counts.broll.needed}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Graphics */}
      <div className="mt-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-lg">🎨</span>
          <div className="flex-1">
            <span className="text-xs font-semibold text-[var(--hud-text-bright)]">
              Graphics
            </span>
            <span className="text-[10px] text-[var(--hud-text-muted)] ml-2">
              {tracker.counts.graphics.ready}/
              {tracker.counts.graphics.needed +
                tracker.counts.graphics.designed +
                tracker.counts.graphics.animated +
                tracker.counts.graphics.ready}
            </span>
          </div>
        </div>
        <div className="space-y-0.5 text-[10px] ml-7">
          {tracker.counts.graphics.ready > 0 && (
            <div className="flex justify-between">
              <span className="text-[var(--hud-success)]">Ready</span>
              <span className="font-mono text-[var(--hud-text-bright)]">
                {tracker.counts.graphics.ready}
              </span>
            </div>
          )}
          {tracker.counts.graphics.animated > 0 && (
            <div className="flex justify-between">
              <span className="text-yellow-400">Animated</span>
              <span className="font-mono text-[var(--hud-text-bright)]">
                {tracker.counts.graphics.animated}
              </span>
            </div>
          )}
          {tracker.counts.graphics.designed > 0 && (
            <div className="flex justify-between">
              <span className="text-yellow-400">Designed</span>
              <span className="font-mono text-[var(--hud-text-bright)]">
                {tracker.counts.graphics.designed}
              </span>
            </div>
          )}
          {tracker.counts.graphics.needed > 0 && (
            <div className="flex justify-between">
              <span className="text-[var(--hud-error)]">Needed</span>
              <span className="font-mono text-[var(--hud-text-bright)]">
                {tracker.counts.graphics.needed}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Voiceover */}
      <div className="mt-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-lg">🎙️</span>
          <div className="flex-1">
            <span className="text-xs font-semibold text-[var(--hud-text-bright)]">
              Voiceover
            </span>
            <span className="text-[10px] text-[var(--hud-text-muted)] ml-2">
              {tracker.counts.voiceover.ready}/1
            </span>
          </div>
        </div>
        <div className="space-y-0.5 text-[10px] ml-7">
          {tracker.counts.voiceover.ready > 0 && (
            <div className="text-[var(--hud-success)]">Ready</div>
          )}
          {tracker.counts.voiceover.editing > 0 && (
            <div className="text-yellow-400">Editing</div>
          )}
          {tracker.counts.voiceover.recorded > 0 && (
            <div className="text-yellow-400">Recorded</div>
          )}
          {tracker.counts.voiceover.needed > 0 && (
            <div className="text-[var(--hud-error)]">Needed</div>
          )}
        </div>
      </div>

      {/* Music */}
      <div className="mt-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-lg">🎵</span>
          <div className="flex-1">
            <span className="text-xs font-semibold text-[var(--hud-text-bright)]">
              Music
            </span>
            <span className="text-[10px] text-[var(--hud-text-muted)] ml-2">
              {tracker.counts.music.ready}/1
            </span>
          </div>
        </div>
        <div className="space-y-0.5 text-[10px] ml-7">
          {tracker.counts.music.ready > 0 && (
            <div className="text-[var(--hud-success)]">Ready</div>
          )}
          {tracker.counts.music.licensed > 0 && (
            <div className="text-yellow-400">Licensed</div>
          )}
          {tracker.counts.music.selected > 0 && (
            <div className="text-yellow-400">Selected</div>
          )}
          {tracker.counts.music.needed > 0 && (
            <div className="text-[var(--hud-error)]">Needed</div>
          )}
        </div>
      </div>

      {/* Last Updated */}
      <div className="mt-3 text-[10px] text-[var(--hud-text-muted)]">
        Updated: {new Date(tracker.lastUpdated).toLocaleTimeString()}
      </div>
    </div>
  );
}
