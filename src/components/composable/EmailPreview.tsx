import { useEffect, useState } from 'react'
import { useCompositionContext } from '../../hooks/useCompositionContext'

export interface EmailPreviewProps {
  /** Unique ID for this component instance */
  componentId: string
  /** Which component's email selection to listen to */
  listenToComponent?: string | 'any'
  /** Label */
  label?: string
}

/**
 * EmailPreview Component - Display selected email content.
 *
 * This component demonstrates:
 * - Listening to email-selected events
 * - Displaying detailed content
 * - Acting as a viewer component
 * - No outbound events (terminal component)
 *
 * Listens to EmailList and displays content.
 */
export function EmailPreview({
  componentId,
  listenToComponent = 'any',
  label = 'Preview',
}: EmailPreviewProps) {
  const ctx = useCompositionContext()
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null)
  const [folder, setFolder] = useState<string | null>(null)

  // Register this component with the context
  useEffect(() => {
    ctx.registerComponent(componentId, {
      id: componentId,
      type: 'emailpreview',
      enabled: true,
      state: {
        hasEmail: !!selectedEmail,
        folder,
      },
      props: { label, listenToComponent },
    })
  }, [componentId, selectedEmail, folder, label, listenToComponent, ctx])

  // Listen for email-selected events
  useEffect(() => {
    return ctx.onComponentEvent(
      listenToComponent,
      'email-selected',
      (payload: any) => {
        if (payload?.email) {
          setSelectedEmail(payload.email)
          setFolder(payload.folder)
        }
      }
    )
  }, [ctx, listenToComponent])

  return (
    <div className="flex flex-col gap-3 p-4 border border-emerald-200 rounded-lg bg-white">
      {/* Header */}
      <div className="text-sm font-medium text-gray-700">{label}</div>

      {/* Email Content */}
      {selectedEmail ? (
        <div className="space-y-3">
          {/* From/To Info */}
          <div className="bg-gray-50 rounded p-3 text-sm space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Folder:</span>
              <span className="font-medium text-gray-800">{folder}</span>
            </div>
            <div className="text-gray-700 break-words">{selectedEmail}</div>
          </div>

          {/* Email Body */}
          <div className="bg-white rounded border border-gray-200 p-4">
            <div className="text-sm text-gray-700 space-y-3">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
                tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <p>
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                aliquip ex ea commodo consequat.
              </p>
              <p>
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore
                eu fugiat nulla pariatur.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button className="px-3 py-1 text-xs bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition-colors font-medium">
              Reply
            </button>
            <button className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors font-medium">
              Delete
            </button>
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-500 text-center py-12">
          Select an email to preview
        </div>
      )}
    </div>
  )
}
