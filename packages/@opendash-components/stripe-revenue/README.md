# Stripe Revenue Component

OpenDash component for displaying daily revenue metrics from Stripe.

## Overview

The Stripe Revenue component fetches daily revenue data from Stripe and displays progress towards a configurable daily target. It integrates with the OpenDash Component Registry for seamless interoperability with other components.

## Installation

```bash
npm install @opendash-components/stripe-revenue
```

## Usage

### Basic Setup

```typescript
import { stripeRevenueComponent } from '@opendash-components/stripe-revenue';
import { createComponentRegistry } from '@opendash/sdk';

// Create a registry and register the component
const registry = createComponentRegistry();
registry.register(stripeRevenueComponent);

// Fetch briefing items
const items = await registry.fetchAll({
  env: {
    STRIPE_SECRET_KEY: 'sk_test_...',
  },
  lastVisited: null,
});
```

### Custom Configuration

Create an instance with a custom daily revenue target:

```typescript
import { createStripeRevenueComponent } from '@opendash-components/stripe-revenue';

const customComponent = createStripeRevenueComponent({
  dailyTarget: 1000, // $1000/day instead of default $333
});

registry.register(customComponent);
```

### Brand-Specific Configuration

Pass brand-specific settings via `brandConfig`:

```typescript
const items = await registry.fetchAll({
  env: {
    STRIPE_SECRET_KEY: 'sk_test_...',
  },
  lastVisited: null,
  brandConfig: {
    label: 'ACME Inc',        // Shows in item title
    dailyTarget: 500,         // Override component's default target
  },
});
```

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `STRIPE_SECRET_KEY` | Yes | Stripe API secret key (starts with `sk_`) |

### Brand Config

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `label` | string | undefined | Brand/org label shown in title |
| `dailyTarget` | number | 333 | Daily revenue target in USD |

## Briefing Item Format

The component returns a single `BriefingItem` with:

```typescript
{
  id: 'stripe-daily-revenue',
  priority: 'high' | 'normal' | 'low',  // Based on revenue vs target
  category: 'revenue',
  title: string,                         // e.g., "Daily revenue: $250"
  detail: string,                        // e.g., "75% of $333/day target"
  time: ISO8601 timestamp,
  isNew: boolean,                        // true if revenue > $0
  metadata: {
    totalDollars: number,
    percentOfTarget: number,
    target: number,
  },
}
```

## Error Handling

### No API Key Configured

Returns a single briefing item prompting configuration:

```typescript
{
  id: 'stripe-not-connected',
  priority: 'low',
  title: 'Daily revenue: $0',
  detail: 'Target: $333/day. Connect Stripe to track real revenue.',
  actionLabel: 'Configure Stripe',
  actionHandler: 'open-settings',
}
```

### API Failures

Returns an error briefing item instead of throwing:

```typescript
{
  id: 'stripe-error',
  priority: 'low',
  category: 'error',
  title: 'Stripe component error',
  detail: error message,
}
```

This ensures that Stripe failures don't block other components in the registry.

## Implementation Details

### Transaction Filtering

Only `charge` and `payment` transaction types are counted as revenue. Other types (payouts, adjustments, etc.) are excluded.

### Daily Calculation

Revenue is calculated from the start of the current day (midnight) to the current time. The Stripe API is queried with `created[gte]` parameter.

### Priority Logic

- **High**: Revenue exceeds daily target
- **Normal**: Revenue is above $0 but below target
- **Low**: No revenue or API error

## Testing

```bash
npm test
```

The test suite includes:
- Component metadata validation
- Successful fetch scenarios
- Error handling (API failures, network errors, invalid responses)
- Brand configuration overrides
- Custom instance creation
- API contract verification

## Compatibility

- **SDK Version**: ^1.0.0
- **Node.js**: 18+
- **TypeScript**: 5.0+

## Related Components

- `@opendash-components/ga4-metrics` — Traffic metrics
- `@opendash-components/google-ads` — Campaign performance
- `@opendash-components/meta-ads` — Meta ad spend

## License

MIT
