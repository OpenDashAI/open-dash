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
  const buildTime = new Date().toLocaleTimeString()

  return (
    <div className="bg-gray-100 flex flex-col h-screen max-w-screen">
      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
        <div className="max-w-screen-2xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">OpenDash Examples</h1>
            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded" suppressHydrationWarning>Build: {buildTime}</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-3 max-w-3xl">
            <button
              onClick={() => setActiveExample('music')}
              className={`px-3 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                activeExample === 'music'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Music
            </button>
            <button
              onClick={() => setActiveExample('todo')}
              className={`px-3 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                activeExample === 'todo'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setActiveExample('dashboard')}
              className={`px-3 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                activeExample === 'dashboard'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveExample('email')}
              className={`px-3 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                activeExample === 'email'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Email
            </button>
          </div>
        </div>
      </div>

      {/* Content Area - constrained to fit, allows internal scrolling */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden max-w-screen">
        <div className="max-w-screen-2xl mx-auto h-full">
          {activeExample === 'music' && <SimpleMusicPlayer />}
          {activeExample === 'todo' && <TodoList />}
          {activeExample === 'dashboard' && <Dashboard />}
          {activeExample === 'email' && <EmailClient />}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 flex-shrink-0">
        <div className="max-w-screen-2xl mx-auto px-4 py-4 text-sm text-gray-600">
          Component Mesh Architecture Demo
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/demo')({
  component: DemoPage,
})
