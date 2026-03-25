/**
 * Script Management Component — Displays script status and metrics
 *
 * Pure status display (NO editing UI).
 * Shows: word count, reading time, section breakdown, principles checklist
 * All editing happens via CLI in chat.
 */

import React from "react";

type ScriptStatus = "draft" | "review" | "approved";

export interface ScriptSection {
  name: "hook" | "problem" | "solution" | "power" | "cta";
  wordCount: number;
  status: "pending" | "draft" | "ready";
  description?: string;
}

export interface ScriptData {
  status: ScriptStatus;
  totalWordCount: number;
  targetWordCount: number; // typically 2000±300
  readingTimeMinutes: number;
  sections: ScriptSection[];
  principles: {
    visualNarrative: boolean;
    emotionalHooks: boolean;
    pacing: boolean;
    clarity: boolean;
    cta: boolean;
  };
  lastUpdated: string;
}

export interface ScriptManagementProps {
  script: ScriptData | null;
  loading?: boolean;
  error?: string;
}

export function ScriptManagement({
  script,
  loading = false,
  error,
}: ScriptManagementProps) {
  if (error) {
    return (
      <div className="hud-card">
        <div className="text-[11px] text-[var(--hud-error)] uppercase tracking-wider">
          Script Manager
        </div>
        <div className="text-xs text-[var(--hud-text-muted)] mt-2">{error}</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="hud-card">
        <div className="text-[11px] text-[var(--hud-text-muted)] uppercase tracking-wider">
          Script Manager
        </div>
        <div className="text-xs text-[var(--hud-text-muted)] mt-2">
          Loading...
        </div>
      </div>
    );
  }

  if (!script) {
    return (
      <div className="hud-card">
        <div className="text-[11px] text-[var(--hud-text-muted)] uppercase tracking-wider">
          Script Manager
        </div>
        <div className="text-xs text-[var(--hud-text-muted)] mt-2">
          No script data
        </div>
      </div>
    );
  }

  // Status indicator
  const getStatusColor = (): string => {
    switch (script.status) {
      case "approved":
        return "text-[var(--hud-success)]";
      case "review":
        return "text-yellow-400";
      case "draft":
        return "text-[var(--hud-text-muted)]";
      default:
        return "text-[var(--hud-text-muted)]";
    }
  };

  // Word count status
  const wordCountDiff = script.totalWordCount - script.targetWordCount;
  const isWordCountGood =
    Math.abs(wordCountDiff) <= 300 && script.totalWordCount > 0;
  const wordCountColor = isWordCountGood
    ? "text-[var(--hud-success)]"
    : "text-[var(--hud-error)]";

  // Principles checklist completion
  const principlesFulfilled = Object.values(script.principles).filter(
    (v) => v
  ).length;
  const principlesTotal = Object.keys(script.principles).length;
  const principlesPercentage = Math.round(
    (principlesFulfilled / principlesTotal) * 100
  );

  return (
    <div className="hud-card">
      {/* Header */}
      <div className="text-[11px] text-[var(--hud-text-muted)] uppercase tracking-wider">
        Script Manager
      </div>

      {/* Status */}
      <div className={`text-lg font-semibold ${getStatusColor()} mt-2`}>
        {script.status.charAt(0).toUpperCase() + script.status.slice(1)}
      </div>

      {/* Word Count */}
      <div className="mt-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-[var(--hud-text-muted)]">
            Word Count
          </span>
          <span className={`text-sm font-mono font-semibold ${wordCountColor}`}>
            {script.totalWordCount}
            <span className="text-[var(--hud-text-muted)] ml-1">
              / {script.targetWordCount}
            </span>
          </span>
        </div>
        <div className="h-1.5 bg-[var(--hud-bg-secondary)] rounded overflow-hidden">
          <div
            className={`h-full transition-all ${
              isWordCountGood
                ? "bg-[var(--hud-success)]"
                : "bg-[var(--hud-error)]"
            }`}
            style={{
              width: `${Math.min(
                (script.totalWordCount / (script.targetWordCount * 1.2)) * 100,
                100
              )}%`,
            }}
          />
        </div>
      </div>

      {/* Reading Time */}
      <div className="mt-3 text-xs flex justify-between">
        <span className="text-[var(--hud-text-muted)]">Reading Time:</span>
        <span className="font-mono text-[var(--hud-text-bright)]">
          {script.readingTimeMinutes}m {Math.round((script.readingTimeMinutes % 1) * 60)}s
        </span>
      </div>

      {/* Sections */}
      <div className="mt-4 space-y-1.5">
        <div className="text-[10px] text-[var(--hud-text-muted)] uppercase tracking-wider">
          Sections
        </div>
        <div className="space-y-1">
          {script.sections.map((section) => (
            <div key={section.name} className="flex justify-between text-[11px]">
              <span className="capitalize text-[var(--hud-text-muted)]">
                {section.name}
              </span>
              <span className="font-mono text-[var(--hud-text-bright)]">
                {section.wordCount}w
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Principles Checklist */}
      <div className="mt-4">
        <div className="text-[10px] text-[var(--hud-text-muted)] uppercase tracking-wider mb-1.5">
          Principles Checklist
        </div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] text-[var(--hud-text-muted)]">
            {principlesFulfilled} / {principlesTotal}
          </span>
          <span className="text-[10px] font-mono text-[var(--hud-text-bright)]">
            {principlesPercentage}%
          </span>
        </div>
        <div className="h-1.5 bg-[var(--hud-bg-secondary)] rounded overflow-hidden">
          <div
            className="h-full bg-[var(--hud-success)] transition-all"
            style={{ width: `${principlesPercentage}%` }}
          />
        </div>
        <div className="mt-2 space-y-1 text-[10px]">
          {Object.entries(script.principles).map(([key, value]) => (
            <div key={key} className="flex items-center gap-1">
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full ${
                  value ? "bg-[var(--hud-success)]" : "bg-[var(--hud-bg-secondary)]"
                }`}
              />
              <span
                className={value ? "text-[var(--hud-text-bright)]" : "text-[var(--hud-text-muted)]"}
              >
                {key.replace(/([A-Z])/g, " $1").trim()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Last Updated */}
      <div className="mt-3 text-[10px] text-[var(--hud-text-muted)]">
        Updated: {new Date(script.lastUpdated).toLocaleTimeString()}
      </div>
    </div>
  );
}
