# OpenDash Example Applications

All example applications are standalone, fully functional demonstrations of the component mesh architecture. Each can run independently.

## Quick Start

### SimpleMusicPlayer
**Complexity:** Beginner | **Components:** 2 | **Tests:** 10

```tsx
import { SimpleMusicPlayer } from './src/examples'

export default function App() {
  return <SimpleMusicPlayer />
}
```

**What it teaches:**
- Basic component communication
- Simple event flow
- Component registration
- Auto-update on events

**Features:**
- Add/remove tracks
- Play/pause controls
- Track navigation
- Current track display

**Files:**
- `src/examples/SimpleMusicPlayer.tsx` (85 lines)
- `src/examples/__tests__/SimpleMusicPlayer.test.tsx` (175 lines)

---

### Dashboard
**Complexity:** Intermediate | **Components:** 5 | **Tests:** 14

```tsx
import { Dashboard } from './src/examples'

export default function App() {
  return <Dashboard />
}
```

**What it teaches:**
- Multi-stage data pipeline
- Event transformation
- Filter and display patterns
- Statistics aggregation
- Component coordination at scale

**Features:**
- Select data sources
- Filter results by search
- View filtered data in table
- See aggregate statistics

**Architecture:**
```
DataSelector → Filter → Display → Summary
     ↓          ↓         ↓         ↓
  selects    filters   displays  analyzes
```

**Files:**
- `src/examples/Dashboard.tsx` (185 lines)
- `src/examples/__tests__/Dashboard.test.tsx` (220 lines)
- Components: DataSelector, Filter, Display, Summary

---

### EmailClient
**Complexity:** Advanced | **Components:** 7+ | **Tests:** 16

```tsx
import { EmailClient } from './src/examples'

export default function App() {
  return <EmailClient />
}
```

**What it teaches:**
- Multiple event sources
- Complex component networks
- Bidirectional communication
- Real-world application patterns
- Feature flag integration
- Multi-tenant customization

**Features:**
- Browse email folders
- View emails and compose
- Search functionality
- Manage contacts
- Configure settings
- See event flow visualization

**Architecture:**
```
Folders ──→ EmailList ──→ EmailPreview
              ↑
             │
Search ──────┤
             │
Contacts ────┤
             │
Settings ────┘
```

**Files:**
- `src/examples/EmailClient.tsx` (225 lines)
- `src/examples/__tests__/EmailClient.test.tsx` (240 lines)
- Components: FolderSelector, EmailList, EmailPreview, EmailSearch, ContactsList, EmailSettings

---

## Running Examples

### Run All Tests
```bash
npm test -- src/examples/__tests__/
```

**Result:**
```
✓ SimpleMusicPlayer.test.tsx (10 tests)
✓ Dashboard.test.tsx (14 tests)
✓ EmailClient.test.tsx (16 tests)

Total: 40 tests passing
```

### Run Specific Example Tests
```bash
# SimpleMusicPlayer only
npm test -- src/examples/__tests__/SimpleMusicPlayer.test.tsx

# Dashboard only
npm test -- src/examples/__tests__/Dashboard.test.tsx

# EmailClient only
npm test -- src/examples/__tests__/EmailClient.test.tsx
```

### Use in Your App
```tsx
import { SimpleMusicPlayer, Dashboard, EmailClient } from './src/examples'

export default function App() {
  const [example, setExample] = React.useState('music')

  return (
    <div>
      <button onClick={() => setExample('music')}>Music Player</button>
      <button onClick={() => setExample('dashboard')}>Dashboard</button>
      <button onClick={() => setExample('email')}>Email Client</button>

      {example === 'music' && <SimpleMusicPlayer />}
      {example === 'dashboard' && <Dashboard />}
      {example === 'email' && <EmailClient />}
    </div>
  )
}
```

---

## Component Breakdown

### Shared by All Examples
- **CompositionProvider** - Enables event system
- **useCompositionContext** - Hook for component access

### SimpleMusicPlayer
- **Composer** - Add/remove items
- **Transport** - Playback control

### Dashboard
- **DataSelector** - Select items (checkboxes)
- **Filter** - Filter by text search
- **Display** - Show results in table
- **Summary** - Aggregate statistics

### EmailClient
- **FolderSelector** - Email folders
- **EmailList** - Emails in folder
- **EmailPreview** - Email content
- **EmailSearch** - Search emails
- **ContactsList** - Manage contacts
- **EmailSettings** - Configure preferences

---

## Learning Path

### For Beginners
1. **Start:** SimpleMusicPlayer
2. **Focus:** How Composer and Transport communicate
3. **Key Concept:** Events instead of props

### For Intermediate Developers
1. **Study:** Dashboard
2. **Focus:** Data transformation across components
3. **Key Concept:** Multi-stage pipelines

### For Advanced Developers
1. **Explore:** EmailClient
2. **Focus:** Multiple event sources and complex flows
3. **Key Concepts:**
   - Bidirectional communication
   - Feature flags
   - Real-world patterns
   - Scalability

---

## Key Patterns Demonstrated

### Pattern 1: Source Component
```tsx
// Composer, FolderSelector, EmailSearch
// Emits events based on user input
ctx.emitEvent(componentId, 'event-name', payload)
```

### Pattern 2: Transform Component
```tsx
// Filter, EmailList
// Listens to events, transforms data, emits new events
ctx.onComponentEvent(listenToComponent, 'event-name', (payload) => {
  const transformed = transform(payload)
  ctx.emitEvent(componentId, 'new-event', transformed)
})
```

### Pattern 3: Display Component
```tsx
// Display, EmailPreview
// Listens to events, displays data, no outbound events
ctx.onComponentEvent(listenToComponent, 'event-name', (payload) => {
  setData(payload)
})
```

### Pattern 4: Configuration Component
```tsx
// EmailSettings
// Emits preference changes to all listeners
ctx.emitEvent(componentId, 'settings-changed', preferences)
```

---

## Testing Examples

Each example has comprehensive tests covering:
- Component rendering
- User interactions
- Event emission and listening
- Component coordination
- Edge cases

### Example Test Structure
```tsx
describe('Example App', () => {
  it('should render with title', () => {
    render(<ExampleApp />)
    expect(screen.getByText('Title')).toBeInTheDocument()
  })

  it('should handle user interaction', () => {
    render(<ExampleApp />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(screen.getByText('Updated')).toBeInTheDocument()
  })
})
```

---

## Real-World Applications

These examples demonstrate patterns used in:

### SimpleMusicPlayer
- Media players
- Playlist managers
- Video players
- Audio applications

### Dashboard
- Analytics dashboards
- Data visualization
- Business intelligence
- Report builders

### EmailClient
- Email clients
- Chat applications
- CRM systems
- Project management
- Collaboration tools

---

## Next Steps

### To Create Your Own Example
1. Create component files for each part
2. Wrap in CompositionProvider
3. Use useCompositionContext in each component
4. Register with ctx.registerComponent
5. Listen/emit events as needed
6. Write tests for interactions
7. Add to examples index.ts

### To Use in Production
1. Replace sample data with real APIs
2. Handle loading/error states
3. Add persistence (localStorage/DB)
4. Implement real-time updates
5. Add authentication/authorization
6. Performance optimization
7. Accessibility review

---

## Troubleshooting

### Component not updating
- ✓ Check event name matches listener
- ✓ Verify componentId is unique
- ✓ Ensure CompositionProvider wraps all components

### Events not firing
- ✓ Check ctx.registerComponent is called
- ✓ Verify listenToComponent matches source componentId
- ✓ Look at browser console for errors

### Tests failing
- ✓ Run individual test file
- ✓ Check for timing issues (fireEvent vs waitFor)
- ✓ Verify components are wrapped in CompositionProvider

---

## Statistics

| Example | Components | Tests | Lines | Complexity |
|---------|-----------|-------|-------|-----------|
| SimpleMusicPlayer | 2 | 10 | 260 | Low |
| Dashboard | 5 | 14 | 405 | Medium |
| EmailClient | 7 | 16 | 465 | High |
| **Total** | **14** | **40** | **1,130** | **Progressive** |

---

## Ready to Run

All examples are:
- ✓ Fully functional
- ✓ Independently runnable
- ✓ Fully tested (40 tests)
- ✓ Well documented
- ✓ Production patterns

**Status: Ready for use and learning**
