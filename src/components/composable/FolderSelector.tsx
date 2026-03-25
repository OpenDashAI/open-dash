import { useEffect, useState } from 'react'
import { useCompositionContext } from '../../hooks/useCompositionContext'

export interface FolderSelectorProps {
  /** Unique ID for this component instance */
  componentId: string
  /** Available folders */
  folders?: string[]
  /** Label for the selector */
  label?: string
}

/**
 * FolderSelector Component - Displays email folders and allows selection.
 *
 * This component demonstrates:
 * - Managing multiple options (folders)
 * - Emitting selection events
 * - Acting as a source for other components
 * - First component in an email pipeline
 *
 * EmailList and other components listen for folder-selected events.
 */
export function FolderSelector({
  componentId,
  folders = ['Inbox', 'Sent', 'Drafts', 'Archive', 'Spam'],
  label = 'Folders',
}: FolderSelectorProps) {
  const ctx = useCompositionContext()
  const [selectedFolder, setSelectedFolder] = useState(folders[0])

  // Register this component with the context
  useEffect(() => {
    ctx.registerComponent(componentId, {
      id: componentId,
      type: 'folderselector',
      enabled: true,
      state: { selectedFolder },
      props: { label, folderCount: folders.length },
    })
  }, [componentId, selectedFolder, label, folders.length, ctx])

  /**
   * Handle folder selection
   */
  const handleSelectFolder = (folder: string) => {
    setSelectedFolder(folder)
    ctx.emitEvent(componentId, 'folder-selected', {
      folder,
      timestamp: new Date().toISOString(),
    })
  }

  return (
    <div className="flex flex-col gap-3 p-4 border border-indigo-200 rounded-lg bg-white h-fit">
      {/* Header */}
      <div className="text-sm font-medium text-gray-700">{label}</div>

      {/* Folder List */}
      <nav className="space-y-1">
        {folders.map(folder => (
          <button
            key={folder}
            onClick={() => handleSelectFolder(folder)}
            className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm font-medium ${
              selectedFolder === folder
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <span>{folder}</span>
          </button>
        ))}
      </nav>

      {/* Selected Status */}
      <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
        <div>Viewing: <span className="font-medium">{selectedFolder}</span></div>
      </div>
    </div>
  )
}
