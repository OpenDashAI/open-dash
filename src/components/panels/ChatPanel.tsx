import { AssistantRuntimeProvider } from '@assistant-ui/react'
import { useChatRuntime, AssistantChatTransport } from '@assistant-ui/react-ai-sdk'
import { Thread } from '@assistant-ui/react-ui'
import { StreamdownTextPrimitive } from '@assistant-ui/react-streamdown'
import { code } from '@streamdown/code'
import { memo, useCallback } from 'react'
import { applyHudResponse } from '../../lib/hud-store'
import type { CardDirective } from '../../lib/types'

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
  const onFinish = useCallback(({ message }: { message: { parts: Array<{ type: string; text?: string }> } }) => {
    for (const part of message.parts) {
      if (part.type === 'text' && part.text) {
        processHudDirectives(part.text)
      }
    }
  }, [])

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
