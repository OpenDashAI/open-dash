# Dashboard Example

An intermediate example demonstrating a multi-stage data pipeline with 5 coordinated components.

## Overview

This example shows how data flows through a series of components, each adding value:
1. Select data items
2. Filter by search text
3. Display filtered results
4. Aggregate statistics

## Components

- **DataSelector** - Checkbox list for selecting items
- **Filter** - Text search to filter selected items
- **Display** - Table view of filtered results
- **Summary** - Statistics about displayed data

## Data Flow

```
DataSelector (select items)
    ↓
Filter (filter selected)
    ↓
Display (show results)
    ↓
Summary (calculate stats)
```

## Usage

```tsx
import { Dashboard } from '.'

export default function App() {
  return <Dashboard />
}
```

## Testing

```bash
npm test -- src/examples/Dashboard/__tests__/Dashboard.test.tsx
```

## What You'll Learn

- Multi-stage event pipelines
- Data transformation across components
- Component chaining
- Computed properties (filtering, statistics)
- UI updates through the pipeline

## Patterns

This example demonstrates the **Pipeline** pattern:
- Each component processes and transforms data
- Output of one component becomes input to the next
- Components remain independent
- Easy to insert or remove stages

## Complexity Level

- 5 components
- 3 event types flowing through system
- Stateless data transformations
- Good for learning data flow patterns
