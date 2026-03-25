import { CompositionProvider } from '../../lib/composition-provider'
import { TodoInput } from './components/TodoInput'
import { TodoListDisplay } from './components/TodoListDisplay'
import { TodoStats } from './components/TodoStats'
import { useEffect, useState } from 'react'

const SAMPLE_TODOS = [
  { id: '1', text: 'Review component architecture', completed: true, createdAt: new Date().toISOString() },
  { id: '2', text: 'Test tab switching between examples', completed: false, createdAt: new Date().toISOString() },
  { id: '3', text: 'Add sample data to all examples', completed: false, createdAt: new Date().toISOString() },
]

/**
 * TodoList Example App
 *
 * Demonstrates a 3-component todo application with:
 * 1. TodoInput: Add new todos
 * 2. TodoListDisplay: Show todos with toggle/delete
 * 3. TodoStats: Display statistics
 *
 * Event Flow:
 * TodoInput → todo-added → TodoListDisplay
 * TodoListDisplay → todos-updated → TodoStats
 */
export function TodoList() {
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!initialized && typeof window !== 'undefined') {
      const key = 'opendash-demo-todos'
      const stored = localStorage.getItem(key)
      if (!stored) {
        localStorage.setItem(key, JSON.stringify(SAMPLE_TODOS))
      }
      setInitialized(true)
    }
  }, [initialized])

  return (
    <CompositionProvider>
      <div className="bg-gradient-to-br from-purple-900 to-purple-800 p-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Todo List</h1>
            <p className="text-purple-200">Add todos, mark them complete, and track your progress.</p>
          </div>

          {/* Components Grid */}
          <div className="space-y-6">
            {/* Input */}
            <TodoInput componentId="todo-input" placeholder="What needs to be done?" />

            {/* List and Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TodoListDisplay componentId="todo-list" listenToComponent="todo-input" initialTodos={SAMPLE_TODOS} />
              <TodoStats componentId="todo-stats" listenToComponent="todo-list" />
            </div>

            {/* Info Box */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm text-purple-900">
              <p className="font-medium mb-2">How it works:</p>
              <ul className="space-y-1 text-purple-800">
                <li>• Type a todo and press Enter or click Add</li>
                <li>• Check the box to mark todos as complete</li>
                <li>• Delete button removes todos from the list</li>
                <li>• Statistics update automatically as you manage todos</li>
                <li>• Components communicate through events, not direct imports</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </CompositionProvider>
  )
}
