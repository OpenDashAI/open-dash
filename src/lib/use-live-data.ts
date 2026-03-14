import { useEffect, useRef, useCallback } from 'react'
import { getMachines } from '../server/machines'
import { getActivity, getMetrics } from '../server/activity'
import { getIssues } from '../server/issues'
import { setMachines, setEvents, setMetrics, setIssues } from './hud-store'

const POLL_INTERVAL = 15_000 // 15s (down from 30s)
const FAST_POLL = 5_000 // 5s after regaining visibility

/**
 * Smart polling hook — replaces naive setInterval.
 * - Pauses when tab is hidden (saves API calls)
 * - Fast-polls once on visibility regain
 * - Immediate fetch on mount
 */
export function useLiveData() {
  const intervalRef = useRef<ReturnType<typeof setInterval>>()
  const visibleRef = useRef(true)

  const fetchAll = useCallback(async () => {
    try {
      const [machines, events, metrics, issues] = await Promise.all([
        getMachines(),
        getActivity(),
        getMetrics(),
        getIssues(),
      ])
      setMachines(machines)
      setEvents(events)
      setMetrics(metrics)
      setIssues(issues)
    } catch {
      // Silently fail — display stale data
    }
  }, [])

  const startPolling = useCallback(
    (interval: number) => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = setInterval(fetchAll, interval)
    },
    [fetchAll],
  )

  useEffect(() => {
    // Start normal polling
    startPolling(POLL_INTERVAL)

    const onVisibilityChange = () => {
      if (document.hidden) {
        // Pause polling when tab hidden
        visibleRef.current = false
        if (intervalRef.current) clearInterval(intervalRef.current)
      } else {
        visibleRef.current = true
        // Immediate fetch + fast poll, then settle back to normal
        fetchAll()
        startPolling(FAST_POLL)
        setTimeout(() => {
          if (visibleRef.current) startPolling(POLL_INTERVAL)
        }, FAST_POLL * 2)
      }
    }

    const onOnline = () => {
      fetchAll()
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('online', onOnline)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('online', onOnline)
    }
  }, [fetchAll, startPolling])
}
