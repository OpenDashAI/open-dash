/**
 * Demo page to view examples
 *
 * Navigate to: http://localhost:9000/demo
 *
 * This file can be viewed as a route in the TanStack Start app
 */

import { createFileRoute } from '@tanstack/react-router'
import { SimpleMusicPlayer } from '../examples/SimpleMusicPlayer/SimpleMusicPlayer'
import { TodoList } from '../examples/TodoList/TodoList'
import { Dashboard } from '../examples/Dashboard/Dashboard'
import { EmailClient } from '../examples/EmailClient/EmailClient'
import { useState } from 'react'

function DemoPage() {
  const [activeExample, setActiveExample] = useState<'music' | 'todo' | 'dashboard' | 'email'>('music')

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <div className="sticky top-0 bg-white border-b border-gray-200 shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">OpenDash Examples</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setActiveExample('music')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeExample === 'music'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Music Player
            </button>
            <button
              onClick={() => setActiveExample('todo')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeExample === 'todo'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Todo List
            </button>
            <button
              onClick={() => setActiveExample('dashboard')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeExample === 'dashboard'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveExample('email')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeExample === 'email'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Email Client
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-8">
        {activeExample === 'music' && <SimpleMusicPlayer />}
        {activeExample === 'todo' && <TodoList />}
        {activeExample === 'dashboard' && <Dashboard />}
        {activeExample === 'email' && <EmailClient />}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/demo')({
  component: DemoPage,
})
