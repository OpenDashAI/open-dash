/**
 * Export Manager Component — Displays export and publishing status
 *
 * Pure status display (NO editing UI).
 * Shows: export progress, file formats, YouTube upload, publishing status
 * All export/publish work happens via CLI in chat.
 */

import React from "react";

export interface ExportFile {
  format: string;
  resolution: string;
  fileSize: string;
  status: "pending" | "exporting" | "ready" | "uploaded";
  uploadProgress?: number;
}

export interface ExportManagerData {
  overallStatus: "pending" | "exporting" | "ready" | "uploaded" | "published";
  files: ExportFile[];
  masterFile?: {
    size: string;
    codec: string;
    ready: boolean;
  };
  youtubeData?: {
    videoId?: string;
    url?: string;
    title: string;
    description: string;
    status: "pending" | "scheduled" | "live";
    scheduledTime?: string;
    uploadProgress: number;
  };
  lastUpdated: string;
}

export interface ExportManagerProps {
  manager: ExportManagerData | null;
  loading?: boolean;
  error?: string;
}

export function ExportManager({
  manager,
  loading = false,
  error,
}: ExportManagerProps) {
  if (error) {
    return (
      <div className="hud-card">
        <div className="text-[11px] text-[var(--hud-error)] uppercase tracking-wider">
          Export Manager
        </div>
        <div className="text-xs text-[var(--hud-text-muted)] mt-2">{error}</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="hud-card">
        <div className="text-[11px] text-[var(--hud-text-muted)] uppercase tracking-wider">
          Export Manager
        </div>
        <div className="text-xs text-[var(--hud-text-muted)] mt-2">
          Loading...
        </div>
      </div>
    );
  }

  if (!manager) {
    return (
      <div className="hud-card">
        <div className="text-[11px] text-[var(--hud-text-muted)] uppercase tracking-wider">
          Export Manager
        </div>
        <div className="text-xs text-[var(--hud-text-muted)] mt-2">
          No export data
        </div>
      </div>
    );
  }

  // Status color and label
  const getStatusDisplay = () => {
    switch (manager.overallStatus) {
      case "published":
        return {
          color: "text-[var(--hud-success)]",
          label: "Published",
          icon: "▶",
        };
      case "uploaded":
        return {
          color: "text-[var(--hud-success)]",
          label: "Uploaded",
          icon: "✓",
        };
      case "ready":
        return {
          color: "text-yellow-400",
          label: "Ready for Upload",
          icon: "⚡",
        };
      case "exporting":
        return {
          color: "text-yellow-400",
          label: "Exporting...",
          icon: "⟳",
        };
      case "pending":
        return {
          color: "text-[var(--hud-text-muted)]",
          label: "Pending",
          icon: "◯",
        };
      default:
        return {
          color: "text-[var(--hud-text-muted)]",
          label: "Unknown",
          icon: "?",
        };
    }
  };

  const status = getStatusDisplay();
  const exportedCount = manager.files.filter(
    (f) => f.status !== "pending"
  ).length;
  const exportProgress = Math.round(
    (exportedCount / manager.files.length) * 100
  );

  return (
    <div className="hud-card">
      {/* Header */}
      <div className="text-[11px] text-[var(--hud-text-muted)] uppercase tracking-wider">
        Export & Publishing
      </div>

      {/* Overall Status */}
      <div className={`text-lg font-semibold ${status.color} mt-2`}>
        {status.icon} {status.label}
      </div>

      {/* Master File */}
      {manager.masterFile && (
        <div className="mt-3">
          <div className="text-[10px] text-[var(--hud-text-muted)] uppercase tracking-wider mb-1">
            Master File
          </div>
          <div className="bg-[var(--hud-bg-secondary)] rounded p-1.5 text-[10px] space-y-1">
            <div className="flex justify-between">
              <span className="text-[var(--hud-text-muted)]">Size</span>
              <span className="font-mono text-[var(--hud-text-bright)]">
                {manager.masterFile.size}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--hud-text-muted)]">Codec</span>
              <span className="font-mono text-[var(--hud-text-bright)]">
                {manager.masterFile.codec}
              </span>
            </div>
            {manager.masterFile.ready && (
              <div className="text-[var(--hud-success)]">✓ Ready</div>
            )}
          </div>
        </div>
      )}

      {/* Export Progress */}
      <div className="mt-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-[var(--hud-text-muted)]">
            Formats Exported
          </span>
          <span className="text-sm font-mono font-semibold text-[var(--hud-text-bright)]">
            {exportedCount} / {manager.files.length}
          </span>
        </div>
        <div className="h-2 bg-[var(--hud-bg-secondary)] rounded overflow-hidden">
          <div
            className="h-full bg-[var(--hud-success)] transition-all"
            style={{ width: `${exportProgress}%` }}
          />
        </div>
      </div>

      {/* File Formats */}
      <div className="mt-3 pt-3 border-t border-[var(--hud-bg-secondary)]">
        <div className="text-[10px] text-[var(--hud-text-muted)] uppercase tracking-wider mb-1.5">
          Formats
        </div>
        <div className="space-y-1">
          {manager.files.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between text-[10px]">
              <div className="flex-1">
                <div className="font-semibold text-[var(--hud-text-bright)]">
                  {file.format}
                </div>
                <div className="text-[var(--hud-text-muted)] text-[9px]">
                  {file.resolution} • {file.fileSize}
                </div>
              </div>
              <div>
                {file.status === "ready" && (
                  <span className="text-[var(--hud-success)]">✓</span>
                )}
                {file.status === "exporting" && (
                  <span className="text-yellow-400">⟳</span>
                )}
                {file.status === "uploaded" && (
                  <span className="text-[var(--hud-success)]">✓</span>
                )}
                {file.status === "pending" && (
                  <span className="text-[var(--hud-text-muted)]">◯</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* YouTube Upload */}
      {manager.youtubeData && (
        <div className="mt-3 pt-3 border-t border-[var(--hud-bg-secondary)]">
          <div className="text-[10px] text-[var(--hud-text-muted)] uppercase tracking-wider mb-1.5">
            YouTube
          </div>

          {/* Upload Progress */}
          {manager.youtubeData.status === "pending" && (
            <div className="mb-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-[var(--hud-text-muted)]">
                  Upload Progress
                </span>
                <span className="text-[10px] font-mono text-[var(--hud-text-bright)]">
                  {manager.youtubeData.uploadProgress}%
                </span>
              </div>
              <div className="h-1.5 bg-[var(--hud-bg-secondary)] rounded overflow-hidden">
                <div
                  className="h-full bg-yellow-400 transition-all"
                  style={{ width: `${manager.youtubeData.uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Status */}
          <div className="space-y-1 text-[10px]">
            <div className="flex justify-between">
              <span className="text-[var(--hud-text-muted)]">Title</span>
              <span className="text-[var(--hud-text-bright)] truncate max-w-xs">
                {manager.youtubeData.title}
              </span>
            </div>

            {manager.youtubeData.status === "live" && manager.youtubeData.url && (
              <div className="flex justify-between items-center">
                <span className="text-[var(--hud-text-muted)]">Status</span>
                <span className="text-[var(--hud-success)]">
                  ✓ Live
                </span>
              </div>
            )}

            {manager.youtubeData.status === "scheduled" && (
              <div className="flex justify-between items-center">
                <span className="text-[var(--hud-text-muted)]">Scheduled</span>
                <span className="text-yellow-400 text-[9px]">
                  {manager.youtubeData.scheduledTime}
                </span>
              </div>
            )}

            {manager.youtubeData.url && (
              <div className="mt-1 text-[9px] text-blue-400 break-all font-mono">
                {manager.youtubeData.url}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="mt-3 text-[10px] text-[var(--hud-text-muted)]">
        Updated: {new Date(manager.lastUpdated).toLocaleTimeString()}
      </div>
    </div>
  );
}
