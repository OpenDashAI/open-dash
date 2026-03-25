import { createFileRoute } from '@tanstack/react-router'
import { SimpleMusicPlayer } from '../examples/SimpleMusicPlayer/SimpleMusicPlayer'

function MusicPage() {
  return <SimpleMusicPlayer />
}

export const Route = createFileRoute('/music')({
  component: MusicPage,
})
