import { useEffect, useState, useCallback, useRef } from 'react'
import { useCompositionContext } from '@opendash/composition'

export interface UseComposableTimerOptions {
  componentId: string
  listenToComponent?: string | 'any'
  duration?: number
  autoStart?: boolean
  direction?: 'down' | 'up'
}

/**
 * Headless composition hook for timer behavior.
 *
 * Handles: registration, countdown/countup, start/stop/reset, alerts, linking.
 * Returns time state + control emitters. No JSX, no styling.
 *
 * Use with ANY styled timer (fullscreen countdown, inline badge, progress bar).
 */
export function useComposableTimer({
  componentId,
  listenToComponent = 'any',
  duration = 0,
  autoStart = false,
  direction = 'down',
}: UseComposableTimerOptions) {
  const ctx = useCompositionContext()
  const [remaining, setRemaining] = useState(direction === 'down' ? duration : 0)
  const [isRunning, setIsRunning] = useState(autoStart)
  const [isComplete, setIsComplete] = useState(false)
  const [totalDuration, setTotalDuration] = useState(duration)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Register with CompositionProvider
  useEffect(() => {
    ctx.registerComponent(componentId, {
      id: componentId,
      type: 'timer',
      enabled: true,
      state: { remaining, isRunning, isComplete, totalDuration, direction },
      props: { listenToComponent },
    })
  }, [componentId, remaining, isRunning, isComplete, totalDuration, direction, listenToComponent, ctx])

  // Timer tick
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        const next = direction === 'down' ? prev - 1 : prev + 1

        if (direction === 'down' && next <= 0) {
          setIsRunning(false)
          setIsComplete(true)
          ctx.emitEvent(componentId, 'timer-complete', { duration: totalDuration })
          return 0
        }

        return next
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, direction, componentId, totalDuration, ctx])

  // Listen for timer-control events (start/stop/reset from other components)
  useEffect(() => {
    return ctx.onComponentEvent(listenToComponent, 'timer-control', (payload: unknown) => {
      const p = payload as { action?: string; duration?: number }
      if (p?.action === 'start') emitStart()
      else if (p?.action === 'stop') emitStop()
      else if (p?.action === 'reset') emitReset(p?.duration)
    })
  }, [ctx, listenToComponent]) // eslint-disable-line react-hooks/exhaustive-deps

  // Emit start
  const emitStart = useCallback(() => {
    if (isComplete && direction === 'down') return // Don't restart completed countdown
    setIsRunning(true)
    setIsComplete(false)
    ctx.emitEvent(componentId, 'timer-started', { remaining, totalDuration })
  }, [ctx, componentId, remaining, totalDuration, isComplete, direction])

  // Emit stop
  const emitStop = useCallback(() => {
    setIsRunning(false)
    ctx.emitEvent(componentId, 'timer-stopped', { remaining, totalDuration })
  }, [ctx, componentId, remaining, totalDuration])

  // Emit reset
  const emitReset = useCallback((newDuration?: number) => {
    const dur = newDuration ?? totalDuration
    setTotalDuration(dur)
    setRemaining(direction === 'down' ? dur : 0)
    setIsRunning(false)
    setIsComplete(false)
    ctx.emitEvent(componentId, 'timer-reset', { duration: dur })
  }, [ctx, componentId, totalDuration, direction])

  // Computed
  const progress = totalDuration > 0
    ? direction === 'down'
      ? (totalDuration - remaining) / totalDuration
      : remaining / totalDuration
    : 0

  const minutes = Math.floor(Math.abs(remaining) / 60)
  const seconds = Math.abs(remaining) % 60
  const formatted = `${minutes}:${String(seconds).padStart(2, '0')}`

  return {
    remaining,
    isRunning,
    isComplete,
    totalDuration,
    progress,
    formatted,
    minutes,
    seconds,
    emitStart,
    emitStop,
    emitReset,
  }
}
