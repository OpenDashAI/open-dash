import { useEffect, useState } from 'react'
import { useCompositionContext } from '../../hooks/useCompositionContext'

export interface EmailSettingsProps {
  /** Unique ID for this component instance */
  componentId: string
  /** Label */
  label?: string
}

/**
 * EmailSettings Component - Configure email client settings.
 *
 * This component demonstrates:
 * - Configuration management
 * - Toggle and preference controls
 * - Emitting settings-changed events
 * - Preferences that affect other components
 *
 * Other components listen to settings changes.
 */
export function EmailSettings({
  componentId,
  label = 'Settings',
}: EmailSettingsProps) {
  const ctx = useCompositionContext()
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [previewPane, setPreviewPane] = useState(true)
  const [emailsPerPage, setEmailsPerPage] = useState('20')

  // Register this component with the context
  useEffect(() => {
    ctx.registerComponent(componentId, {
      id: componentId,
      type: 'emailsettings',
      enabled: true,
      state: { autoRefresh, previewPane, emailsPerPage },
      props: { label },
    })

    // Emit settings-changed event
    ctx.emitEvent(componentId, 'settings-changed', {
      autoRefresh,
      previewPane,
      emailsPerPage: parseInt(emailsPerPage),
    })
  }, [componentId, autoRefresh, previewPane, emailsPerPage, label, ctx])

  return (
    <div className="flex flex-col gap-3 p-4 border border-amber-200 rounded-lg bg-white h-fit">
      {/* Header */}
      <div className="text-sm font-medium text-gray-700">{label}</div>

      {/* Settings Options */}
      <div className="space-y-3">
        {/* Auto Refresh */}
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">Auto Refresh</label>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`relative w-10 h-6 rounded-full transition-colors ${
              autoRefresh ? 'bg-amber-500' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                autoRefresh ? 'translate-x-4' : ''
              }`}
            />
          </button>
        </div>

        {/* Preview Pane */}
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">Preview Pane</label>
          <button
            onClick={() => setPreviewPane(!previewPane)}
            className={`relative w-10 h-6 rounded-full transition-colors ${
              previewPane ? 'bg-amber-500' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                previewPane ? 'translate-x-4' : ''
              }`}
            />
          </button>
        </div>

        {/* Emails Per Page */}
        <div className="space-y-1">
          <label className="text-sm text-gray-700">Emails Per Page</label>
          <select
            value={emailsPerPage}
            onChange={e => setEmailsPerPage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="text-xs text-gray-500 border-t border-gray-200 pt-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span>Settings saved</span>
        </div>
      </div>
    </div>
  )
}
