import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { ContextPanel } from '../components/panels/ContextPanel'
import { FocusPanel } from '../components/panels/FocusPanel'
import { ChatPanel } from '../components/panels/ChatPanel'
import type { HudMode } from '../lib/hud-mode'
import { MODE_CONFIGS } from '../lib/hud-mode'

export const Route = createFileRoute('/')({ component: HUD })

function HUD() {
  const [mode, setMode] = useState<HudMode>('operating')

  return (
    <div className="hud-layout">
      <div className="hud-topbar">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-[var(--hud-text-bright)] tracking-wide">OPENDASH</span>
          <span className="text-[var(--hud-border)]">|</span>
          <div className="flex gap-1">
            {Object.entries(MODE_CONFIGS).map(([key, config]) => (
              <button
                key={key}
                type="button"
                onClick={() => setMode(key as HudMode)}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                  mode === key
                    ? 'bg-[var(--hud-accent-dim)] text-[var(--hud-accent)]'
                    : 'text-[var(--hud-text-muted)] hover:text-[var(--hud-text)]'
                }`}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="status-dot online" />
            <span>3 machines</span>
          </span>
          <span className="text-[var(--hud-border)]">|</span>
          <span>19 brands</span>
          <span className="text-[var(--hud-border)]">|</span>
          <span>Train 10</span>
        </div>
      </div>

      <ContextPanel mode={mode} />
      <FocusPanel mode={mode} />
      <ChatPanel />
    </div>
  )
}
