import { useEffect } from 'react'
import { setMode } from './hud-store'
import type { HudState } from './types'

/**
 * Global keyboard shortcuts for the HUD.
 * Alt+1-5: switch modes
 * Alt+/: focus chat input
 */
export function useKeyboardShortcuts() {
  useEffect(() => {
    const modes: HudState['mode'][] = ['operating', 'building', 'analyzing', 'reviewing', 'alert']

    function handleKeyDown(e: KeyboardEvent) {
      // Alt+1 through Alt+5: switch modes
      if (e.altKey && e.key >= '1' && e.key <= '5') {
        e.preventDefault()
        const index = Number.parseInt(e.key) - 1
        if (modes[index]) setMode(modes[index])
        return
      }

      // Alt+/: focus chat input
      if (e.altKey && e.key === '/') {
        e.preventDefault()
        const chatInput = document.querySelector('.chat-input') as HTMLTextAreaElement | null
        chatInput?.focus()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}
