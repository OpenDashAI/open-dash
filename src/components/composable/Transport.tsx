import { useEffect, useRef, useState } from 'react'
import { useCompositionContext } from '../../hooks/useCompositionContext'

export interface TransportProps {
  /** Unique ID for this component instance */
  componentId: string
  /** Which component's item events to listen to (or 'any') */
  listenToComponent?: string | 'any'
  /** Initial items (optional, will be updated by events) */
  items?: any[]
}

/**
 * Transport Component - Controls playback/state and listens to item events.
 *
 * This is the second composable component demonstrating:
 * - Listening to events from other components ('item-added', 'item-removed')
 * - Managing playback state (play, pause)
 * - Emitting its own events ('playback-started', 'playback-stopped')
 * - Working without tight coupling to Composer
 * - Audio playback integration (plays tracks with URLs)
 *
 * When a Composer adds/removes items, Transport automatically updates
 * and shows the current item count. When Transport starts playback,
 * other components (Effects, Monitor, etc.) can listen and react.
 *
 * @example
 * ```tsx
 * <CompositionProvider>
 *   <Composer componentId="composer-main" />
 *   <Transport componentId="transport-main" listenToComponent="any" />
 * </CompositionProvider>
 * ```
 */
export function Transport({ componentId, listenToComponent = 'any', items: initialItems = [] }: TransportProps) {
  const ctx = useCompositionContext()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [items, setItems] = useState<any[]>(initialItems)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentPosition, setCurrentPosition] = useState(0)
  const [duration, setDuration] = useState(0)

  // Register this component with the context
  useEffect(() => {
    ctx.registerComponent(componentId, {
      id: componentId,
      type: 'transport',
      enabled: true,
      state: {
        isPlaying,
        currentPosition,
        itemsCount: items.length,
      },
      props: {
        listenToComponent,
      },
    })
  }, [componentId, isPlaying, currentPosition, items.length, listenToComponent, ctx])

  // Listen for 'item-added' events from source component (handles initial items and additions)
  useEffect(() => {
    const unsubscribe = ctx.onComponentEvent(listenToComponent, 'item-added', (payload: any) => {
      const msg = `[${componentId}] Received item-added event with ${payload?.allItems?.length} items`
      console.log(msg, payload)
      localStorage.setItem('debug-transport', msg)
      if (payload?.allItems) {
        setItems(payload.allItems)
        // Auto-update position if we were at the end
        if (currentPosition >= items.length) {
          setCurrentPosition(payload.allItems.length - 1)
        }
      }
    })
    return unsubscribe
  }, [ctx, listenToComponent, currentPosition, items.length, componentId])

  // Listen for 'item-removed' events from source component
  useEffect(() => {
    return ctx.onComponentEvent(listenToComponent, 'item-removed', (payload: any) => {
      console.log(`[${componentId}] Received item-removed event`, payload)
      if (payload?.allItems) {
        setItems(payload.allItems)
        // Adjust position if we're beyond the new length
        if (currentPosition >= payload.allItems.length) {
          setCurrentPosition(Math.max(0, payload.allItems.length - 1))
        }
      }
    })
  }, [ctx, listenToComponent, currentPosition, componentId])

  // Update audio source when current track changes
  useEffect(() => {
    if (audioRef.current && items.length > 0) {
      const currentTrack = items[currentPosition]
      if (currentTrack && typeof currentTrack === 'object' && 'url' in currentTrack) {
        audioRef.current.src = currentTrack.url
        if (isPlaying) {
          audioRef.current.play().catch(err => console.log('Playback failed:', err))
        }
      }
    }
  }, [currentPosition, items])

  // Sync audio playback with isPlaying state
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(err => console.log('Playback failed:', err))
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying])

  // Update position as audio plays
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      setCurrentPosition(Math.floor(audio.currentTime))
    }

    const handleEnded = () => {
      // Move to next track when current track ends
      if (currentPosition < items.length - 1) {
        setCurrentPosition(currentPosition + 1)
      } else {
        setIsPlaying(false)
      }
    }

    const handleLoadedMetadata = () => {
      setDuration(Math.floor(audio.duration))
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
  }, [currentPosition, items.length])

  /**
   * Handle play button click
   * Emits event so other components (Effects, Monitor, etc.) know playback started
   */
  const handlePlay = () => {
    if (items.length > 0) {
      setIsPlaying(true)
      ctx.emitEvent(componentId, 'playback-started', {
        items,
        currentPosition,
        itemsCount: items.length,
      })
    }
  }

  /**
   * Handle pause button click
   * Emits event so other components know playback stopped
   */
  const handlePause = () => {
    setIsPlaying(false)
    ctx.emitEvent(componentId, 'playback-stopped', {
      currentPosition,
    })
  }

  /**
   * Handle next button
   * Moves to next item and emits position change event
   */
  const handleNext = () => {
    const nextPos = Math.min(currentPosition + 1, items.length - 1)
    setCurrentPosition(nextPos)
    ctx.emitEvent(componentId, 'position-changed', {
      currentPosition: nextPos,
      item: items[nextPos],
    })
  }

  /**
   * Handle previous button
   * Moves to previous item and emits position change event
   */
  const handlePrevious = () => {
    const prevPos = Math.max(currentPosition - 1, 0)
    setCurrentPosition(prevPos)
    ctx.emitEvent(componentId, 'position-changed', {
      currentPosition: prevPos,
      item: items[prevPos],
    })
  }

  const currentTrack = items.length > 0 ? items[currentPosition] : null
  const currentTrackName = currentTrack && typeof currentTrack === 'object' && 'name' in currentTrack
    ? currentTrack.name
    : currentTrack

  return (
    <div className="flex flex-col gap-3 p-4 border border-green-200 rounded-lg bg-white">
      {/* Hidden audio element for playback */}
      <audio ref={audioRef} crossOrigin="anonymous" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-gray-700">Transport Control</div>
        <div
          className={`px-2 py-1 text-xs font-medium rounded-full ${isPlaying ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
        >
          {isPlaying ? '▶ Playing' : '⏸ Stopped'}
        </div>
      </div>

      {/* Items Info */}
      <div className="text-sm text-gray-600">
        {items.length === 0 ? (
          <span>No items loaded</span>
        ) : (
          <span>
            {items.length} item{items.length !== 1 ? 's' : ''} loaded
            {items.length > 0 && (
              <span className="ml-2 font-medium text-gray-800">
                ({currentPosition + 1}/{items.length})
              </span>
            )}
          </span>
        )}
      </div>

      {/* Current Item Display */}
      {items.length > 0 && (
        <div className="p-2 bg-blue-50 rounded border border-blue-200">
          <div className="text-xs text-gray-600">Now Playing:</div>
          <div className="text-sm font-medium text-gray-800 truncate">
            {currentTrackName}
          </div>
          {duration > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              {Math.floor(currentPosition / 60)}:{String(currentPosition % 60).padStart(2, '0')} / {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}
            </div>
          )}
        </div>
      )}

      {/* Playback Controls */}
      <div className="flex gap-2">
        <button
          onClick={handlePrevious}
          disabled={items.length === 0 || currentPosition === 0}
          className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
        >
          ⏮ Previous
        </button>

        {!isPlaying ? (
          <button
            onClick={handlePlay}
            disabled={items.length === 0}
            className="flex-1 px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            ▶ Play
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="flex-1 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-medium"
          >
            ⏸ Pause
          </button>
        )}

        <button
          onClick={handleNext}
          disabled={items.length === 0 || currentPosition === items.length - 1}
          className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
        >
          Next ⏭
        </button>
      </div>

      {/* Position Indicator */}
      {items.length > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-green-500 h-full transition-all"
            style={{ width: `${((currentPosition + 1) / items.length) * 100}%` }}
          />
        </div>
      )}
    </div>
  )
}
