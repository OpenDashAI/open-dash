import { useState, useRef, useEffect } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'OpenDash online. All systems nominal.',
    },
  ])
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')

    // TODO: Replace with TanStack AI useChat hook + server connection
    setTimeout(() => {
      const reply: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Received: "${userMsg.content}". Chat backend not connected yet — this is the HUD shell.`,
      }
      setMessages((prev) => [...prev, reply])
    }, 300)
  }

  return (
    <div className="hud-panel right flex flex-col h-full">
      <div className="panel-header">
        <span>Chat</span>
        <span className="status-dot online" />
      </div>
      <div ref={scrollRef} className="panel-body flex-1 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-message ${msg.role}`}>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--hud-text-muted)]">
              {msg.role === 'user' ? 'You' : 'AI'}
            </span>
            <div className="mt-0.5">{msg.content}</div>
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
            placeholder="Talk to OpenDash..."
          />
        </form>
      </div>
    </div>
  )
}
