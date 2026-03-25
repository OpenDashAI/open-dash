import { useState, useEffect, useContext } from 'react'
import { CompositionContextReact } from '../../../lib/composition-context'

interface TodoInputProps {
  componentId: string
  placeholder?: string
}

export function TodoInput({ componentId, placeholder = 'Add a new todo...' }: TodoInputProps) {
  const [input, setInput] = useState('')
  const ctx = useContext(CompositionContextReact)

  useEffect(() => {
    if (!ctx) return

    ctx.registerComponent(componentId, {
      id: componentId,
      type: 'todo-input',
      state: { input },
    })
  }, [ctx, componentId])

  const handleAdd = () => {
    if (input.trim()) {
      ctx?.emitEvent(componentId, 'todo-added', {
        id: Date.now().toString(),
        text: input.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
      })
      setInput('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd()
    }
  }

  return (
    <div className="flex flex-col gap-3 p-4 border border-blue-200 rounded-lg bg-white">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Add Todo</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
