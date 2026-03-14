import { useState, useRef, useEffect } from 'react'
import { sendChat } from '../../server/chat'
import { applyHudResponse } from '../../lib/hud-store'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: 'OpenDash online. All systems nominal. How can I help?',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userContent = input.trim()
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userContent,
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      // Build message history for context
      const history = [...messages, userMsg]
        .filter((m) => m.id !== '0') // Skip initial greeting
        .map((m) => ({ role: m.role, content: m.content }))

      const response = await sendChat({ messages: history })

      // Apply HUD directives (mode change, cards) to the store
      if (response.mode || response.cards?.length) {
        applyHudResponse(response)
      }

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.text,
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch (err) {
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Connection error. Check server logs.',
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="hud-panel right flex flex-col h-full">
      <div className="panel-header">
        <span>Chat</span>
        <div className="flex items-center gap-2">
          {isLoading && (
            <span className="text-[10px] text-[var(--hud-accent)] animate-pulse">thinking...</span>
          )}
          <span className={`status-dot ${isLoading ? 'warning' : 'online'}`} />
        </div>
      </div>
      <div ref={scrollRef} className="panel-body flex-1 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-message ${msg.role}`}>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--hud-text-muted)]">
              {msg.role === 'user' ? 'You' : 'AI'}
            </span>
            <div className="mt-0.5 whitespace-pre-wrap">{msg.content}</div>
          </div>
        ))}
      </div>
      <div className="p-2 border-t border-[var(--hud-border)]">
        <form onSubmit={handleSubmit}>
          <textarea
            className="chat-input"
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
            placeholder={isLoading ? 'Waiting for response...' : 'Talk to OpenDash...'}
            disabled={isLoading}
          />
        </form>
      </div>
    </div>
  )
}
