import { AssistantRuntimeProvider } from '@assistant-ui/react'
import { useChatRuntime, AssistantChatTransport } from '@assistant-ui/react-ai-sdk'
import { Thread } from '@assistant-ui/react-ui'
import { StreamdownTextPrimitive } from '@assistant-ui/react-streamdown'
import { code } from '@streamdown/code'
import { memo, useCallback, useRef } from 'react'
import { applyHudResponse } from '../../lib/hud-store'
import type { CardDirective } from '../../lib/types'

const THREAD_ID = 'default' // Single thread for now

const HUD_MARKER = '---HUD---'

/** Parse and apply HUD directives from a completed assistant message */
function processHudDirectives(text: string) {
  const idx = text.indexOf(HUD_MARKER)
  if (idx === -1) return
  const json = text.slice(idx + HUD_MARKER.length).trim()
  try {
    const directives = JSON.parse(json) as { mode?: string; cards?: CardDirective[] }
    applyHudResponse(directives)
  } catch {
    // Malformed HUD JSON — ignore
  }
}

/** Strip ---HUD--- block from displayed text */
function stripHudBlock(text: string): string {
  const idx = text.indexOf(HUD_MARKER)
  return idx === -1 ? text : text.slice(0, idx).trimEnd()
}

const StreamdownText = memo(() => (
  <StreamdownTextPrimitive
    plugins={{ code }}
    shikiTheme={['github-dark', 'github-dark']}
    preprocess={stripHudBlock}
  />
))
StreamdownText.displayName = 'StreamdownText'

export function ChatPanel() {
  const savedIds = useRef(new Set<string>())

  const persistMessage = useCallback(
    (msg: { id: string; role: string; parts: unknown[] }) => {
      if (savedIds.current.has(msg.id)) return
      savedIds.current.add(msg.id)
      fetch('/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: THREAD_ID,
          messageId: msg.id,
          role: msg.role,
          parts: msg.parts,
        }),
      }).catch(() => {
        savedIds.current.delete(msg.id) // Retry next time
      })
    },
    [],
  )

  const onFinish = useCallback(
    ({
      message,
      messages,
    }: {
      message: { id: string; role: string; parts: Array<{ type: string; text?: string }> }
      messages: Array<{ id: string; role: string; parts: Array<{ type: string; text?: string }> }>
    }) => {
      // Apply HUD directives
      for (const part of message.parts) {
        if (part.type === 'text' && part.text) {
          processHudDirectives(part.text)
        }
      }

      // Persist all unsaved messages (user + assistant)
      for (const msg of messages) {
        persistMessage(msg)
      }
    },
    [persistMessage],
  )

  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: '/api/chat',
    }),
    onFinish,
  })

  return (
    <div className="hud-panel right flex flex-col h-full">
      <div className="panel-header">
        <span>Chat</span>
        <span className="status-dot online" />
      </div>
      <div className="flex-1 overflow-hidden">
        <AssistantRuntimeProvider runtime={runtime}>
          <Thread
            assistantMessage={{
              components: { Text: StreamdownText },
            }}
          />
        </AssistantRuntimeProvider>
      </div>
    </div>
  )
}
