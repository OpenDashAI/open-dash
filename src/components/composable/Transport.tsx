import { useEffect, useRef, useState } from 'react'
import { useCompositionContext } from '../../hooks/useCompositionContext'
import { Composer } from './Composer'

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

  const [showPlaylist, setShowPlaylist] = useState(false)

  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto w-full">
      {/* Audio element for playback */}
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        onError={handleAudioError}
      />

      {/* Main Player Card */}
      <div className="bg-gradient-to-br from-zinc-900 to-black rounded-2xl p-8 shadow-2xl border border-zinc-800">
        {/* Track Info */}
        {items.length > 0 && (
          <div className="text-center mb-8">
            <div className="text-sm text-zinc-400 uppercase tracking-widest mb-3">
              {currentTrackIndex + 1} of {items.length}
            </div>
            <h2 className="text-xl font-light text-white mb-6 line-clamp-2">
              {currentTrackName}
            </h2>

            {/* Progress Bar */}
            {duration > 0 && (
              <>
                <div
                  onClick={handleProgressBarClick}
                  className="w-full bg-zinc-700 rounded-full h-1 overflow-hidden cursor-pointer hover:h-1.5 transition-all mb-2"
                >
                  <div
                    className="bg-green-500 h-full transition-all"
                    style={{ width: `${(playbackTime / duration) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-zinc-500">
                  {Math.floor(playbackTime / 60)}:{String(playbackTime % 60).padStart(2, '0')} / {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}
                </div>
              </>
            )}
          </div>
        )}

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-6 mb-8">
          {/* Previous Button */}
          <button
            onClick={handlePrevious}
            disabled={items.length === 0 || currentTrackIndex === 0}
            className="text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" />
            </svg>
          </button>

          {/* Main Play/Pause Button */}
          {!isPlaying ? (
            <button
              onClick={handlePlay}
              disabled={items.length === 0}
              className="relative w-32 h-32 rounded-full bg-green-500 hover:bg-green-600 disabled:bg-zinc-600 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-green-500/50 flex items-center justify-center group disabled:opacity-50"
            >
              <svg className="w-16 h-16 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full bg-green-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="relative w-32 h-32 rounded-full bg-red-500 hover:bg-red-600 transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-red-500/50 flex items-center justify-center group"
            >
              <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full bg-red-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />
            </button>
          )}

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={items.length === 0 || currentTrackIndex === items.length - 1}
            className="text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 18h2V6h-2v12zM2 18l8.5-6L2 6v12z" />
            </svg>
          </button>
        </div>

        {/* Playlist Toggle */}
        <button
          onClick={() => setShowPlaylist(!showPlaylist)}
          className="w-full py-3 text-sm text-green-500 hover:text-green-400 transition-colors border border-green-500 border-opacity-30 hover:border-opacity-60 rounded-lg"
        >
          {showPlaylist ? '−' : '+'} Playlist
        </button>
      </div>

      {/* Collapsible Playlist & Add Track */}
      {showPlaylist && (
        <div className="bg-gradient-to-br from-zinc-900 to-black rounded-2xl p-6 shadow-2xl border border-zinc-800 space-y-4 max-h-48 overflow-hidden flex flex-col">
          {/* Add Track Section */}
          <div className="space-y-3 flex-shrink-0">
            <label className="text-xs text-zinc-400 uppercase tracking-widest">Add Track</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Track name..."
                className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 text-sm"
              />
              <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium flex-shrink-0">
                Add
              </button>
            </div>
          </div>

          {/* Playlist */}
          {items.length > 0 && (
            <div className="space-y-2 overflow-y-auto flex-1 min-h-0">
              <div className="text-xs text-zinc-400 uppercase tracking-widest sticky top-0">Queue</div>
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded text-sm transition-colors cursor-pointer ${
                    idx === currentTrackIndex
                      ? 'bg-green-500 bg-opacity-20 text-green-400 border border-green-500'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                  onClick={() => {
                    setCurrentTrackIndex(idx)
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="truncate text-xs">
                      {idx + 1}. {typeof item === 'object' && 'name' in item ? item.name : item}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
