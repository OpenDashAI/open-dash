# Simple Music Player Example

A beginner-friendly example demonstrating basic component communication through events.

## Overview

This example shows how two components (Composer and Transport) can work together without direct imports, communicating entirely through a shared event system.

## Components

- **Composer** - Allows adding and removing tracks
- **Transport** - Controls playback and displays track information

## How It Works

1. User adds a track in Composer
2. Composer emits `item-added` event
3. Transport listens and auto-updates display
4. User controls playback through Transport buttons
5. Transport emits `playback-started`, `playback-stopped` events

## Usage

```tsx
import { SimpleMusicPlayer } from '.'

export default function App() {
  return <SimpleMusicPlayer />
}
```

## Testing

```bash
npm test -- src/examples/SimpleMusicPlayer/__tests__/SimpleMusicPlayer.test.tsx
```

## What You'll Learn

- Event-driven component communication
- Component registration with context
- Listening for and responding to events
- Auto-updating UI based on external events
- Simple event flow (linear)

## Patterns

This example demonstrates the **Source → Display** pattern:
- Composer is a source (emits events)
- Transport is a listener and display (reacts to events)
- No tight coupling between components
