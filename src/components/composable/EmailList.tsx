import { useEffect, useState } from 'react'
import { useCompositionContext } from '../../hooks/useCompositionContext'

export interface EmailListProps {
  /** Unique ID for this component instance */
  componentId: string
  /** Which component's folder selection to listen to */
  listenToComponent?: string | 'any'
  /** Label */
  label?: string
}

// Sample emails for demo
const SAMPLE_EMAILS: Record<string, string[]> = {
  'Inbox': [
    'From: alice@example.com - Project Update',
    'From: bob@example.com - Meeting Reschedule',
    'From: charlie@example.com - Code Review',
  ],
  'Sent': [
    'To: alice@example.com - Re: Project Update',
    'To: bob@example.com - Looks Good',
  ],
  'Drafts': [
    'To: david@example.com - Team Announcement (draft)',
  ],
  'Archive': [
    'From: eve@example.com - Old Discussion Thread',
  ],
  'Spam': [
    'From: unknown@spam.com - Buy now!',
  ],
}

/**
 * EmailList Component - Display emails for selected folder.
 *
 * This component demonstrates:
 * - Listening to folder-selected events
 * - Dynamic content based on selection
 * - Emitting email-selected events
 * - Managing clickable lists
 *
 * Listens to FolderSelector and emits for EmailPreview.
 */
export function EmailList({
  componentId,
  listenToComponent = 'any',
  label = 'Emails',
}: EmailListProps) {
  const ctx = useCompositionContext()
  const [currentFolder, setCurrentFolder] = useState('Inbox')
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null)

  // Register this component with the context
  useEffect(() => {
    const emails = SAMPLE_EMAILS[currentFolder] || []
    ctx.registerComponent(componentId, {
      id: componentId,
      type: 'emaillist',
      enabled: true,
      state: {
        currentFolder,
        selectedEmail,
        emailCount: emails.length,
      },
      props: { label, listenToComponent },
    })
  }, [componentId, currentFolder, selectedEmail, label, listenToComponent, ctx])

  // Listen for folder-selected events
  useEffect(() => {
    return ctx.onComponentEvent(
      listenToComponent,
      'folder-selected',
      (payload: any) => {
        if (payload?.folder) {
          setCurrentFolder(payload.folder)
          setSelectedEmail(null) // Clear selection when folder changes

          ctx.emitEvent(componentId, 'folder-changed', {
            folder: payload.folder,
            emailCount: (SAMPLE_EMAILS[payload.folder] || []).length,
          })
        }
      }
    )
  }, [ctx, listenToComponent, componentId])

  /**
   * Handle email selection
   */
  const handleSelectEmail = (email: string) => {
    setSelectedEmail(email)
    ctx.emitEvent(componentId, 'email-selected', {
      email,
      folder: currentFolder,
    })
  }

  const emails = SAMPLE_EMAILS[currentFolder] || []

  return (
    <div className="flex flex-col gap-3 p-4 border border-cyan-200 rounded-lg bg-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-gray-700">{label}</div>
        <div className="text-xs text-gray-500">{emails.length} emails</div>
      </div>

      {/* Email List */}
      {emails.length > 0 ? (
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {emails.map((email, index) => (
            <button
              key={index}
              onClick={() => handleSelectEmail(email)}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors text-xs truncate ${
                selectedEmail === email
                  ? 'bg-cyan-100 text-cyan-700 border border-cyan-300'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              {email}
            </button>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-500 text-center py-6">
          No emails in {currentFolder}
        </div>
      )}

      {/* Selected Email Info */}
      {selectedEmail && (
        <div className="text-xs text-gray-600 pt-2 border-t border-gray-200">
          <div className="font-medium truncate">{selectedEmail}</div>
        </div>
      )}
    </div>
  )
}
