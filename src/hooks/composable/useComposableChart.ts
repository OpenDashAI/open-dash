import { useEffect, useState, useCallback } from 'react'
import { useCompositionContext } from '@opendash/composition'

export interface ChartSeries {
  name: string
  data: Array<{ x: string | number; y: number }>
  color?: string
}

export interface UseComposableChartOptions {
  componentId: string
  listenToComponent?: string | 'any'
  initialSeries?: ChartSeries[]
}

/**
 * Headless composition hook for chart/visualization behavior.
 *
 * Handles: registration, data updates from upstream, point selection, range changes.
 * Returns series data + interaction emitters. No JSX, no styling.
 *
 * Use with ANY chart library (Recharts, shadcn Charts, Chart.js, D3, plain SVG).
 */
export function useComposableChart({
  componentId,
  listenToComponent = 'any',
  initialSeries = [],
}: UseComposableChartOptions) {
  const ctx = useCompositionContext()
  const [series, setSeries] = useState<ChartSeries[]>(initialSeries)
  const [selectedPoint, setSelectedPoint] = useState<{ seriesIndex: number; pointIndex: number } | null>(null)
  const [timeRange, setTimeRange] = useState<{ start: string; end: string } | null>(null)

  // Register with CompositionProvider
  useEffect(() => {
    ctx.registerComponent(componentId, {
      id: componentId,
      type: 'chart',
      enabled: true,
      state: {
        seriesCount: series.length,
        totalPoints: series.reduce((sum, s) => sum + s.data.length, 0),
        hasSelection: selectedPoint !== null,
        timeRange,
      },
      props: { listenToComponent },
    })
  }, [componentId, series, selectedPoint, timeRange, listenToComponent, ctx])

  // Listen for data-ready events
  useEffect(() => {
    return ctx.onComponentEvent(listenToComponent, 'data-ready', (payload: unknown) => {
      const p = payload as { series?: ChartSeries[]; items?: unknown[] }
      if (p?.series) {
        setSeries(p.series)
      } else if (p?.items && Array.isArray(p.items)) {
        // Auto-convert items array to single series
        setSeries([{
          name: 'Data',
          data: p.items.map((item: unknown, i: number) => ({
            x: i,
            y: typeof item === 'number' ? item : 0,
          })),
        }])
      }
    })
  }, [ctx, listenToComponent])

  // Emit point selection
  const emitPointSelected = useCallback((seriesIndex: number, pointIndex: number) => {
    const point = series[seriesIndex]?.data[pointIndex]
    setSelectedPoint({ seriesIndex, pointIndex })
    ctx.emitEvent(componentId, 'point-selected', {
      seriesIndex,
      pointIndex,
      point,
      seriesName: series[seriesIndex]?.name,
    })
  }, [ctx, componentId, series])

  // Emit range change
  const emitRangeChanged = useCallback((start: string, end: string) => {
    setTimeRange({ start, end })
    ctx.emitEvent(componentId, 'range-changed', { start, end })
  }, [ctx, componentId])

  return {
    series,
    selectedPoint,
    timeRange,
    seriesCount: series.length,
    totalPoints: series.reduce((sum, s) => sum + s.data.length, 0),
    setSeries,
    emitPointSelected,
    emitRangeChanged,
  }
}
