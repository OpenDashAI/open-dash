import { Composer } from '../../components/composable/Composer'
import { Transport } from '../../components/composable/Transport'
import { CompositionProvider } from '../../lib/composition-provider'

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
  return (
    <CompositionProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
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
            />

            {/* Transport - Playback Controls */}
            <Transport
              componentId="transport-main"
              listenToComponent="composer-main"
            />

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
              <p className="font-medium mb-2">How it works:</p>
              <ul className="space-y-1 text-blue-800">
                <li>• Type a track name and click "Add" to add it to the playlist</li>
                <li>• The Transport component automatically updates when tracks are added or removed</li>
                <li>• Click Play to start playback (Transport emits events to other components)</li>
                <li>• These components don't import each other - they communicate through events</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </CompositionProvider>
  )
}
