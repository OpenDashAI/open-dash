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
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: 'track-2',
    name: 'Ocean Waves - Ambient',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: 'track-3',
    name: 'Urban Pulse - Hip Hop',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
  {
    id: 'track-4',
    name: 'Jazz Improvisation - Modern Jazz',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  },
  {
    id: 'track-5',
    name: 'Electric Sunset - Electronic',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
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
  const [items, setItems] = useState<string[]>(SAMPLE_TRACKS)

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
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-4 sm:p-8 w-full">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Music Player</h1>
            <p className="text-slate-400">
              Add tracks below and use the transport controls to play, pause, and navigate.
            </p>
          </div>

          {/* Components Grid */}
          <div className="space-y-6">
            {/* Composer - Add/Remove Tracks */}
            <Composer
              componentId="composer-main"
              label="Add Track"
              placeholder="Enter track name..."
              items={SAMPLE_TRACKS}
            />

            {/* Transport - Playback Controls */}
            <Transport
              componentId="transport-main"
              listenToComponent="composer-main"
              items={items}
            />

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
              <p className="font-medium mb-2">How it works:</p>
              <ul className="space-y-1 text-blue-800">
                <li>• Click "Play" to listen to the sample tracks (audio will play)</li>
                <li>• Use "Previous" and "Next" to navigate between tracks</li>
                <li>• The Transport component shows playback time and automatically moves to the next track when one finishes</li>
                <li>• Type a track name and click "Add" to add custom items to the playlist</li>
                <li>• Components communicate through events without importing each other (component mesh architecture)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </CompositionProvider>
  )
}
