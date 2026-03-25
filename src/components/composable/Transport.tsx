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
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [playbackTime, setPlaybackTime] = useState(0)
  const [duration, setDuration] = useState(0)

  // Register this component with the context
  useEffect(() => {
    ctx.registerComponent(componentId, {
      id: componentId,
      type: 'transport',
      enabled: true,
      state: {
        isPlaying,
        currentTrackIndex,
        itemsCount: items.length,
      },
      props: {
        listenToComponent,
      },
    })
  }, [componentId, isPlaying, currentTrackIndex, items.length, listenToComponent, ctx])

  // Listen for 'item-added' events from source component (handles initial items and additions)
  useEffect(() => {
    const unsubscribe = ctx.onComponentEvent(listenToComponent, 'item-added', (payload: any) => {
      const msg = `[${componentId}] Received item-added event with ${payload?.allItems?.length} items`
      console.log(msg, payload)
      localStorage.setItem('debug-transport', msg)
      if (payload?.allItems) {
        setItems(payload.allItems)
        // Auto-update track index if we were at the end
        if (currentTrackIndex >= items.length) {
          setCurrentTrackIndex(payload.allItems.length - 1)
        }
      }
    })
    return unsubscribe
  }, [ctx, listenToComponent, currentTrackIndex, items.length, componentId])

  // Listen for 'item-removed' events from source component
  useEffect(() => {
    return ctx.onComponentEvent(listenToComponent, 'item-removed', (payload: any) => {
      console.log(`[${componentId}] Received item-removed event`, payload)
      if (payload?.allItems) {
        setItems(payload.allItems)
        // Adjust track index if we're beyond the new length
        if (currentTrackIndex >= payload.allItems.length) {
          setCurrentTrackIndex(Math.max(0, payload.allItems.length - 1))
        }
      }
    })
  }, [ctx, listenToComponent, currentTrackIndex, componentId])

  // Update audio source when current track changes (only when track actually changes, not time update)
  const lastTrackIdRef = useRef<string | null>(null)

  useEffect(() => {
    console.log(`[${componentId}] Effect running: items.length=${items.length}, currentTrackIndex=${currentTrackIndex}`)

    if (items.length > 0) {
      const currentTrack = items[currentTrackIndex]
      console.log(`[${componentId}] Current track:`, currentTrack)
      console.log(`[${componentId}] Track is object:`, typeof currentTrack === 'object')
      console.log(`[${componentId}] Track has url:`, 'url' in currentTrack)

      if (currentTrack && typeof currentTrack === 'object' && 'url' in currentTrack) {
        // Only load if we're changing to a different track
        if (lastTrackIdRef.current !== currentTrack.id) {
          console.log(`[${componentId}] Loading track: ${currentTrack.name}`)
          const wasPlaying = audioRef.current && !audioRef.current.paused
          if (audioRef.current) {
            audioRef.current.src = currentTrack.url
            audioRef.current.load()
            console.log(`[${componentId}] ✓ Audio src set to: ${currentTrack.url}`)
            lastTrackIdRef.current = currentTrack.id

            // If it was playing, start playing the new track
            if (wasPlaying) {
              audioRef.current.play().catch(err => console.error('Playback failed:', err))
            }
          }
        }
      } else {
        console.log(`[${componentId}] ✗ Current track is not a valid Track object or missing url`)
      }
    } else {
      console.log(`[${componentId}] No items available`)
    }
  }, [currentTrackIndex, items, componentId])

  // Sync audio playback with isPlaying state
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      console.log(`[${componentId}] Play requested`)
      console.log(`[${componentId}] Audio src: ${audio.src}`)
      console.log(`[${componentId}] Audio ready state: ${audio.readyState}`)
      console.log(`[${componentId}] Audio paused: ${audio.paused}`)
      console.log(`[${componentId}] Audio duration: ${audio.duration}`)

      // If audio is already loaded and ready, play it
      if (audio.readyState >= 2) {
        // HAVE_CURRENT_DATA or better
        const playPromise = audio.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => console.log(`[${componentId}] ✓ Playback started successfully`))
            .catch(err => console.error(`[${componentId}] ✗ Playback failed:`, err.message))
        }
      } else {
        // Audio not ready yet, wait for it
        console.log(`[${componentId}] Audio not ready yet, waiting for canplay event`)
        const onCanPlay = () => {
          console.log(`[${componentId}] Audio is now ready, playing`)
          audio.play().catch(err => console.error(`[${componentId}] Playback failed:`, err.message))
          audio.removeEventListener('canplay', onCanPlay)
        }
        audio.addEventListener('canplay', onCanPlay)
      }
    } else {
      console.log(`[${componentId}] Pause requested`)
      audio.pause()
    }
  }, [isPlaying, componentId])

  // Update position as audio plays
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      setPlaybackTime(Math.floor(audio.currentTime))
    }

    const handleEnded = () => {
      // Move to next track when current track ends
      if (currentTrackIndex < items.length - 1) {
        setCurrentTrackIndex(currentTrackIndex + 1)
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
  }, [currentTrackIndex, items.length])

  /**
   * Handle play button click
   * Emits event so other components (Effects, Monitor, etc.) know playback started
   */
  const handlePlay = () => {
    if (items.length > 0) {
      setIsPlaying(true)
      ctx.emitEvent(componentId, 'playback-started', {
        items,
        currentTrackIndex,
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
      currentTrackIndex,
    })
  }

  /**
   * Handle next button
   * Moves to next item and emits position change event
   */
  const handleNext = () => {
    const nextPos = Math.min(currentTrackIndex + 1, items.length - 1)
    setCurrentTrackIndex(nextPos)
    ctx.emitEvent(componentId, 'position-changed', {
      currentTrackIndex: nextPos,
      item: items[nextPos],
    })
  }

  /**
   * Handle previous button
   * Moves to previous item and emits position change event
   */
  const handlePrevious = () => {
    const prevPos = Math.max(currentTrackIndex - 1, 0)
    setCurrentTrackIndex(prevPos)
    ctx.emitEvent(componentId, 'position-changed', {
      currentTrackIndex: prevPos,
      item: items[prevPos],
    })
  }

  const currentTrack = items.length > 0 ? items[currentTrackIndex] : null
  const currentTrackName = currentTrack && typeof currentTrack === 'object' && 'name' in currentTrack
    ? currentTrack.name
    : currentTrack

  const handleAudioError = (e: any) => {
    const error = audioRef.current?.error
    console.error(`[${componentId}] Audio error:`, error?.code, error?.message)
  }

  /**
   * Handle seeking by clicking on the progress bar
   */
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration === 0) return

    const progressBar = e.currentTarget
    const rect = progressBar.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = percentage * duration

    audioRef.current.currentTime = newTime
  }

  return (
    <div className="flex flex-col gap-3 p-4 border border-green-200 rounded-lg bg-white">
      {/* Audio element for playback */}
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        onError={handleAudioError}
      />

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
                ({currentTrackIndex + 1}/{items.length})
              </span>
            )}
          </span>
        )}
      </div>

      {/* Debug info */}
      {items.length > 0 && (
        <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded font-mono">
          <div>Type: {typeof items[currentTrackIndex] === 'object' ? 'object' : 'string'}</div>
          <div>Has URL: {items[currentTrackIndex] && 'url' in items[currentTrackIndex] ? '✓ yes' : '✗ no'}</div>
          {items[currentTrackIndex] && 'url' in items[currentTrackIndex] && (
            <div className="truncate text-gray-600">URL: {(items[currentTrackIndex] as any).url}</div>
          )}
        </div>
      )}

      {/* Current Item Display */}
      {items.length > 0 && (
        <div className="p-2 bg-blue-50 rounded border border-blue-200">
          <div className="text-xs text-gray-600">Now Playing:</div>
          <div className="text-sm font-medium text-gray-800 truncate">
            {currentTrackName}
          </div>
          {duration > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              {Math.floor(playbackTime / 60)}:{String(playbackTime % 60).padStart(2, '0')} / {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}
            </div>
          )}
        </div>
      )}

      {/* Playback Controls */}
      <div className="flex gap-2">
        <button
          onClick={handlePrevious}
          disabled={items.length === 0 || currentTrackIndex === 0}
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
          disabled={items.length === 0 || currentTrackIndex === items.length - 1}
          className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
        >
          Next ⏭
        </button>
      </div>

      {/* Playback Progress Indicator - clickable to seek */}
      {items.length > 0 && duration > 0 && (
        <div
          onClick={handleProgressBarClick}
          className="w-full bg-gray-200 rounded-full h-2 overflow-hidden cursor-pointer hover:h-3 transition-all"
        >
          <div
            className="bg-green-500 h-full transition-all"
            style={{ width: `${(playbackTime / duration) * 100}%` }}
          />
        </div>
      )}
    </div>
  )
}
