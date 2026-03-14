import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { ContextPanel } from '../components/panels/ContextPanel'
import { FocusPanel } from '../components/panels/FocusPanel'
import { ChatPanel } from '../components/panels/ChatPanel'
import { getMachines } from '../server/machines'
import { getBrands } from '../server/brands'
import { getActivity, getMetrics } from '../server/activity'
import { useHudState, setMachines, setBrands, setEvents, setMetrics, setMode } from '../lib/hud-store'
import { MODE_CONFIGS } from '../lib/hud-mode'

export const Route = createFileRoute('/')({
  component: HUD,
  loader: async () => {
    // Fetch all data in parallel on first load (SSR)
    const [machines, brands, events, metrics] = await Promise.all([
      getMachines(),
      getBrands(),
      getActivity(),
      getMetrics(),
    ])
    return { machines, brands, events, metrics }
  },
})

function HUD() {
  const loaderData = Route.useLoaderData()
  const { mode } = useHudState()

  // Hydrate store from SSR loader data
  useEffect(() => {
    setMachines(loaderData.machines)
    setBrands(loaderData.brands)
    setEvents(loaderData.events)
    setMetrics(loaderData.metrics)
  }, [loaderData])

  // Poll for updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [machines, events, metrics] = await Promise.all([
          getMachines(),
          getActivity(),
          getMetrics(),
        ])
        setMachines(machines)
        setEvents(events)
        setMetrics(metrics)
      } catch {
        // Silently fail — display stale data
      }
    }, 30_000)

    return () => clearInterval(interval)
  }, [])

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
                onClick={() => setMode(key as typeof mode)}
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
        <div className="flex items-center gap-3 text-[12px]">
          <span className="flex items-center gap-1.5">
            <span className={`status-dot ${loaderData.machines.filter((m) => m.status === 'online').length > 0 ? 'online' : 'offline'}`} />
            <span>{loaderData.machines.filter((m) => m.status === 'online').length}/{loaderData.machines.length} machines</span>
          </span>
          <span className="text-[var(--hud-border)]">|</span>
          <span>{loaderData.brands.length} brands</span>
          <span className="text-[var(--hud-border)]">|</span>
          <span>Train 10</span>
        </div>
      </div>

      <ContextPanel />
      <FocusPanel />
      <ChatPanel />
    </div>
  )
}
