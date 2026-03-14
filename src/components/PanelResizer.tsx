import { useCallback, useRef } from 'react'

interface PanelResizerProps {
  onResize: (delta: number) => void
}

export function PanelResizer({ onResize }: PanelResizerProps) {
  const startX = useRef(0)
  const isDragging = useRef(false)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      startX.current = e.clientX
      isDragging.current = true

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging.current) return
        const delta = e.clientX - startX.current
        startX.current = e.clientX
        onResize(delta)
      }

      const handleMouseUp = () => {
        isDragging.current = false
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    },
    [onResize],
  )

  return (
    <div
      className="panel-resizer"
      onMouseDown={handleMouseDown}
    />
  )
}
