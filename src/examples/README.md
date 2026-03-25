# OpenDash Example Applications

This directory contains example applications demonstrating the component mesh architecture at different complexity levels.

## Directory Structure

Each example is self-contained in its own folder:

```
examples/
├── SimpleMusicPlayer/          [Beginner - 2 components]
│   ├── SimpleMusicPlayer.tsx
│   ├── __tests__/
│   │   └── SimpleMusicPlayer.test.tsx
│   └── README.md
│
├── Dashboard/                  [Intermediate - 5 components]
│   ├── Dashboard.tsx
│   ├── __tests__/
│   │   └── Dashboard.test.tsx
│   └── README.md
│
├── EmailClient/                [Advanced - 7+ components]
│   ├── EmailClient.tsx
│   ├── __tests__/
│   │   └── EmailClient.test.tsx
│   └── README.md
│
├── index.ts                    [Main exports]
└── README.md                   [This file]
```

## Quick Start

### Beginner: Simple Music Player
```tsx
import { SimpleMusicPlayer } from './examples'

export default function App() {
  return <SimpleMusicPlayer />
}
```
- **Learn:** Basic event communication
- **Components:** 2 (Composer, Transport)
- **Tests:** 10
- **Time:** 5 minutes to understand

### Intermediate: Dashboard
```tsx
import { Dashboard } from './examples'

export default function App() {
  return <Dashboard />
}
```
- **Learn:** Multi-stage pipelines
- **Components:** 5 (DataSelector, Filter, Display, Summary)
- **Tests:** 14
- **Time:** 15 minutes to understand

### Advanced: Email Client
```tsx
import { EmailClient } from './examples'

export default function App() {
  return <EmailClient />
}
```
- **Learn:** Complex event networks
- **Components:** 7+ (Folders, Emails, Preview, Search, Contacts, Settings)
- **Tests:** 16
- **Time:** 30 minutes to understand

## Running Tests

### All examples:
```bash
npm test -- src/examples
```

### Specific example:
```bash
npm test -- src/examples/SimpleMusicPlayer
npm test -- src/examples/Dashboard
npm test -- src/examples/EmailClient
```

## Adding New Examples

To add a new example:

1. Create a folder: `src/examples/YourExample/`
2. Create the app component: `YourExample.tsx`
3. Create tests: `__tests__/YourExample.test.tsx`
4. Create documentation: `README.md`
5. Export in `index.ts`

```
YourExample/
├── YourExample.tsx
├── __tests__/
│   └── YourExample.test.tsx
└── README.md
```

## Pattern Reference

### Source Component
Emits events based on user input
```tsx
ctx.emitEvent(componentId, 'event-name', payload)
```
Examples: Composer, FolderSelector, EmailSearch

### Transform Component
Listens, processes, and emits
```tsx
ctx.onComponentEvent(source, 'event', payload => {
  const transformed = transform(payload)
  ctx.emitEvent(componentId, 'new-event', transformed)
})
```
Examples: Filter, EmailList

### Display Component
Listens and displays (no outbound events)
```tsx
ctx.onComponentEvent(source, 'event', payload => {
  setData(payload)
})
```
Examples: Display, EmailPreview

### Config Component
Emits preferences to all listeners
```tsx
ctx.emitEvent(componentId, 'settings-changed', config)
```
Examples: EmailSettings

## Learning Path

1. **Start with SimpleMusicPlayer** - Understand basic event flow
2. **Move to Dashboard** - Learn pipelines and data transformation
3. **Study EmailClient** - Master complex networks and real-world patterns

## Best Practices

✓ Each example is independent
✓ Wrap in CompositionProvider
✓ Use unique componentIds
✓ Event names should be descriptive
✓ Listener componentId should match emitter
✓ Clean up subscriptions in useEffect

## Structure for Scalability

This folder structure supports:
- **Dozens of examples** - Each in its own folder
- **Easy discovery** - Browse examples by complexity
- **Independent testing** - Run specific example tests
- **Clear documentation** - README per example
- **Parallel development** - Multiple people can work on different examples

## Next Steps

- Read individual example README files
- Run the tests to see them in action
- Study the component patterns
- Create your own example
- Integrate into your app
