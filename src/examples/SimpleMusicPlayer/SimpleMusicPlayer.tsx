import { Composer } from '../../components/composable/Composer'
import { Transport } from '../../components/composable/Transport'
import { CompositionProvider } from '../../lib/composition-provider'
import { useEffect, useState } from 'react'

interface Track {
  id: string
  name: string
  url: string
}

const SAMPLE_TRACKS: Track[] = [
  {
    id: 'track-1',
    name: 'Midnight Dreams - Synthwave',
    url: '/midnight-dreams.mp3',
  },
  {
    id: 'track-2',
    name: 'Ocean Waves - Ambient',
    url: '/ocean-waves.mp3',
  },
  {
    id: 'track-3',
    name: 'Urban Pulse - Hip Hop',
    url: '/urban-pulse.mp3',
  },
  {
    id: 'track-4',
    name: 'Jazz Improvisation - Modern Jazz',
    url: '/jazz-improvisation.mp3',
  },
  {
    id: 'track-5',
    name: 'Electric Sunset - Electronic',
    url: '/electric-sunset.mp3',
  },
]

/**
 * SimpleMusicPlayer Example App
 *
 * Demonstrates the component mesh architecture by combining two composable components:
 * - Composer: Allows adding/removing tracks to a playlist
 * - Transport: Controls playback and displays track information
 *
 * This example shows:
 * - Components communicate through events (no direct imports)
 * - Transport automatically updates when Composer adds/removes tracks
 * - Multiple components coordinate without tight coupling
 * - Same components can be composed in different ways
 */
export function SimpleMusicPlayer() {
  const [initialized, setInitialized] = useState(false)
  const [items, setItems] = useState<Track[]>(SAMPLE_TRACKS)

  useEffect(() => {
    if (!initialized && typeof window !== 'undefined') {
      const key = 'opendash-demo-music-tracks'
      const stored = localStorage.getItem(key)
      if (!stored) {
        localStorage.setItem(key, JSON.stringify(SAMPLE_TRACKS))
      }
      setInitialized(true)
    }
  }, [initialized])

  return (
    <CompositionProvider>
      <div className="bg-black min-h-full flex flex-col items-center justify-center py-8">
        <div className="max-w-md w-full">
          {/* Transport - Playback Controls */}
          <Transport
            componentId="transport-main"
            listenToComponent="composer-main"
            items={items}
          />

          {/* Composer - Add/Remove Tracks (collapsible in Transport) */}
          <div className="hidden">
            <Composer
              componentId="composer-main"
              label="Add Track"
              placeholder="Enter track name..."
              items={SAMPLE_TRACKS}
            />
          </div>
        </div>
      </div>
    </CompositionProvider>
  )
}
