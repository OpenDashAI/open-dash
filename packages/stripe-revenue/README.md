# @opendash-components/stripe-revenue

Stripe revenue briefing component for OpenDash. Displays daily revenue progress toward your daily target.

```
Daily revenue: $1,250 ➜ 375% of $333/day target
```

## Installation

```bash
npm install @opendash-components/stripe-revenue
```

## Usage

### Basic Setup

```typescript
import { stripeRevenue } from '@opendash-components/stripe-revenue';
import { registerComponent } from '@opendash/sdk';

// Register with OpenDash dashboard
registerComponent(stripeRevenue);
```

### With Configuration

```typescript
const config = {
  env: process.env,  // Must include STRIPE_SECRET_KEY
  lastVisited: new Date().toISOString(),
  brandConfig: {
    label: 'Acme Corp',        // Custom label
    targetDaily: 500,           // Target $500/day instead of default $333
    currencies: ['USD', 'EUR'], // Only sum these currencies
    types: ['charge', 'payment'] // Transaction types to include
  }
};

const items = await stripeRevenue.fetch(config);
// Returns: BriefingItem[]
```

## Configuration

The component uses environment variables and optional brand-specific config.

### Environment Variables

**Required:**
- `STRIPE_SECRET_KEY` - Your Stripe secret key

### Brand Config

```typescript
interface StripeRevenueConfig {
  label?: string;           // Custom label prefix (e.g., "[Acme Corp]")
  targetDaily?: number;     // Daily revenue target in USD (default: 333)
  currencies?: string[];    // Currency filter (default: all)
  types?: string[];         // Transaction types (default: ['charge', 'payment'])
}
```

## What It Shows

The component creates a single briefing item:

```typescript
{
  id: 'stripe-daily-revenue',
  priority: 'normal',      // 'low' if $0 revenue
  category: 'revenue',
  title: 'Daily revenue: $1,250',
  detail: '375% of $333/day target',
  time: '2026-03-25T10:30:00Z',
  isNew: true
}
```

Or, if not configured:

```typescript
{
  id: 'stripe-not-connected',
  priority: 'low',
  category: 'revenue',
  title: 'Daily revenue: $0',
  detail: 'Target: $333/day ($10K/mo). Connect Stripe to track real revenue.',
  time: '2026-03-25T10:30:00Z'
}
```

## Features

✅ **Real-time data** — Fetches today's transactions from Stripe API
✅ **Configurable target** — Set your own daily revenue target
✅ **Multi-brand support** — Custom labels per brand/team
✅ **Currency filtering** — Include/exclude specific currencies
✅ **Graceful degradation** — Returns empty array on error (dashboard continues)
✅ **Type-safe** — Full TypeScript support

## Performance

- **Fetch time**: ~500ms (Stripe API call)
- **Cache**: No caching — fetches on every dashboard load
- **API calls**: 1 per load (balance_transactions endpoint)
- **Limits**: 100 transactions per fetch (sufficient for most use cases)

## Security

- Only accesses Stripe with the provided `STRIPE_SECRET_KEY`
- No disk/file system access
- No network calls except to Stripe API
- Fails silently on error — no sensitive data in logs

## Development

### Build

```bash
npm run build          # TypeScript → dist/
npm run type-check    # Type checking
```

### Test

```bash
npm run test          # Vitest runner
npm run test -- --ui  # Interactive UI
```

### Debugging

```typescript
// Enable verbose logging
const config = {
  env: { ...process.env, DEBUG: 'stripe-revenue' },
  lastVisited: null,
};

const items = await stripeRevenue.fetch(config);
// Logs to console[stripe-revenue]
```

## Examples

### Example 1: Basic Usage

```typescript
import { stripeRevenue } from '@opendash-components/stripe-revenue';

const items = await stripeRevenue.fetch({
  env: process.env,
  lastVisited: null,
});

console.log(items[0].title); // "Daily revenue: $1,250"
```

### Example 2: Multi-Brand Dashboard

```typescript
const config = {
  env: process.env,
  lastVisited: user.lastVisited,
  brandConfig: {
    label: user.brand.name, // "TechStartup Inc"
    targetDaily: user.brand.revenueTarget, // 1000
  }
};

const items = await stripeRevenue.fetch(config);
// Returns: [{ title: "[TechStartup Inc] Daily revenue: $847", ... }]
```

### Example 3: Filtered Currencies

```typescript
// Only track USD revenue
const items = await stripeRevenue.fetch({
  env: process.env,
  lastVisited: null,
  brandConfig: {
    currencies: ['USD']
  }
});
```

## FAQ

**Q: What if I have no Stripe activity today?**
A: Returns an item with priority 'low' and 0% toward target.

**Q: Can I see historical data?**
A: No — this component only fetches today's balance transactions. For trends, use the analytics dashboard or Stripe's built-in reports.

**Q: How often does it refresh?**
A: Only when the dashboard loads. For real-time updates, refresh the page.

**Q: What if my Stripe key is invalid?**
A: Component returns empty array (graceful degradation). Check dashboard logs for the error.

**Q: Can I customize the briefing item title/description?**
A: Not yet — component returns fixed format. File an issue if you need customization.

## Contributing

Found a bug? Have a feature request?

- **Bug reports**: https://github.com/OpenDashAI/open-dash/issues
- **PRs welcome**: https://github.com/OpenDashAI/open-dash/pulls

## License

MIT

## See Also

- [@opendash/sdk](../../../packages/sdk) — Component SDK documentation
- [Component Developer Guide](../../../docs/COMPONENT_BUILDER_GUIDE.md)
- [OpenDash](https://github.com/OpenDashAI/open-dash) — Main project
