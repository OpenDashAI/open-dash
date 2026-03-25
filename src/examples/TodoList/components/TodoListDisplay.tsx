import { useState, useEffect, useContext } from 'react'
import { CompositionContextReact } from '../../../lib/composition-context'

interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: string
}

interface TodoListDisplayProps {
  componentId: string
  listenToComponent: string
}

export function TodoListDisplay({ componentId, listenToComponent }: TodoListDisplayProps) {
  const [todos, setTodos] = useState<Todo[]>([])
  const ctx = useContext(CompositionContextReact)

  useEffect(() => {
    if (!ctx) return

    ctx.registerComponent(componentId, {
      id: componentId,
      type: 'todo-list',
      state: { todos },
    })

    // Listen for new todos
    const unsubscribe = ctx.onComponentEvent(listenToComponent, 'todo-added', (todo: Todo) => {
      setTodos((prev) => [...prev, todo])
      ctx.emitEvent(componentId, 'todos-updated', { todos: [...todos, todo], count: todos.length + 1 })
    })

    return unsubscribe
  }, [ctx, componentId, listenToComponent, todos])

  const handleToggle = (id: string) => {
    setTodos((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
      ctx?.emitEvent(componentId, 'todos-updated', { todos: updated, count: updated.length })
      return updated
    })
  }

  const handleDelete = (id: string) => {
    setTodos((prev) => {
      const updated = prev.filter((t) => t.id !== id)
      ctx?.emitEvent(componentId, 'todos-updated', { todos: updated, count: updated.length })
      return updated
    })
  }

  const completedCount = todos.filter((t) => t.completed).length

  return (
    <div className="flex flex-col gap-3 p-4 border border-green-200 rounded-lg bg-white">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-gray-700">Todos</div>
        <div className="text-xs text-gray-500">
          {completedCount}/{todos.length} done
        </div>
      </div>
      {todos.length === 0 ? (
        <div className="text-sm text-gray-500 text-center py-4">No todos yet. Add one to get started!</div>
      ) : (
        <div className="space-y-2">
          {todos.map((todo) => (
            <div key={todo.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggle(todo.id)}
                className="w-4 h-4 cursor-pointer"
              />
              <span className={`flex-1 text-sm ${todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                {todo.text}
              </span>
              <button
                onClick={() => handleDelete(todo.id)}
                className="text-xs text-red-500 hover:text-red-700 font-medium"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
