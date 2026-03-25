# Email Client Example

An advanced example demonstrating a complex event network with 7+ components and multiple event sources.

## Overview

This example shows a real-world application where multiple independent components emit events that cascade through the system, creating a sophisticated communication network.

## Components

- **FolderSelector** - Select email folder
- **EmailList** - Display emails for selected folder
- **EmailPreview** - Show email content
- **EmailSearch** - Search and filter emails
- **ContactsList** - Quick access to contacts
- **EmailSettings** - Configure preferences

## Event Network

```
FolderSelector ──→ EmailList ──→ EmailPreview
                      ↑
EmailSearch ──────────┤
                      │
Contacts ─────────────┤
                      │
Settings ─────────────┘
```

## Features

- Multiple independent event sources
- Branching and merging event flows
- Real-world UI patterns (sidebar, main content)
- Professional dark theme
- Feature flag examples
- Architecture visualization

## Usage

```tsx
import { EmailClient } from '.'

export default function App() {
  return <EmailClient />
}
```

## Testing

```bash
npm test -- src/examples/EmailClient/__tests__/EmailClient.test.tsx
```

## What You'll Learn

- Complex event networks
- Multiple event sources
- Bidirectional communication patterns
- Real-world application structure
- Feature flags and customization
- Enterprise-scale patterns

## Patterns

This example demonstrates the **Network** pattern:
- Multiple independent components emit events
- Listeners subscribe to specific events
- Components can have multiple listeners
- No circular dependencies
- Scalable to many components

## Complexity Level

- 7+ components
- 6+ event types
- Real-world patterns
- Professional UI/UX
- Production-ready patterns

## Real-World Use Cases

- Email clients
- Chat applications
- Project management tools
- CRM systems
- Collaboration platforms
- Dashboard applications
