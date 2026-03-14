import { AssistantRuntimeProvider } from '@assistant-ui/react'
import { useChatRuntime, AssistantChatTransport } from '@assistant-ui/react-ai-sdk'
import { Thread } from '@assistant-ui/react-ui'
import { StreamdownTextPrimitive } from '@assistant-ui/react-streamdown'
import { code } from '@streamdown/code'
import { memo } from 'react'

const StreamdownText = memo(() => (
  <StreamdownTextPrimitive
    plugins={{ code }}
    shikiTheme={['github-dark', 'github-dark']}
  />
))
StreamdownText.displayName = 'StreamdownText'

export function ChatPanel() {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: '/api/chat',
    }),
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
