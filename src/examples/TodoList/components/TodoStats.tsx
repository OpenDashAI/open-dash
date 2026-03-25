import { useState, useEffect, useContext } from 'react'
import { CompositionContextReact } from '../../../lib/composition-context'

interface Stats {
  total: number
  completed: number
  pending: number
  completionRate: number
}

interface TodoStatsProps {
  componentId: string
  listenToComponent: string
}

export function TodoStats({ componentId, listenToComponent }: TodoStatsProps) {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    completed: 0,
    pending: 0,
    completionRate: 0,
  })
  const ctx = useContext(CompositionContextReact)

  useEffect(() => {
    if (!ctx) return

    ctx.registerComponent(componentId, {
      id: componentId,
      type: 'todo-stats',
      state: stats,
    })

    const unsubscribe = ctx.onComponentEvent(listenToComponent, 'todos-updated', (data: any) => {
      const todos = data.todos || []
      const completed = todos.filter((t: any) => t.completed).length
      const total = todos.length

      const newStats: Stats = {
        total,
        completed,
        pending: total - completed,
        completionRate: total === 0 ? 0 : Math.round((completed / total) * 100),
      }

      setStats(newStats)
    })

    return unsubscribe
  }, [ctx, componentId, listenToComponent])

  return (
    <div className="flex flex-col gap-3 p-4 border border-purple-200 rounded-lg bg-white">
      <div className="text-sm font-medium text-gray-700">Statistics</div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-xs text-gray-600">Total</div>
        </div>
        <div className="flex flex-col items-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-xs text-gray-600">Completed</div>
        </div>
        <div className="flex flex-col items-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-xs text-gray-600">Pending</div>
        </div>
        <div className="flex flex-col items-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{stats.completionRate}%</div>
          <div className="text-xs text-gray-600">Done</div>
        </div>
      </div>
      {stats.total > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${stats.completionRate}%` }}
          ></div>
        </div>
      )}
    </div>
  )
}
