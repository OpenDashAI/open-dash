# @opendash-components/ga4

Google Analytics 4 briefing component for OpenDash. Monitors organic traffic, conversions, and user behavior metrics with automatic anomaly detection.

## Features

- 📊 Track organic sessions, users, and bounce rate
- 🎯 Monitor conversion rates and conversion goals
- 🚨 Automatic anomaly detection for traffic drops and bounce rate spikes
- 🏷️ Multi-property support with custom labels
- 🎚️ Configurable conversion goal tracking
- 🔄 Real-time data fetching from GA4 API

## Installation

```bash
npm install @opendash-components/ga4
```

## Usage

```typescript
import { ga4 } from '@opendash-components/ga4';
import { createComponentRegistry } from '@opendash/sdk';

const registry = createComponentRegistry();
registry.register(ga4);

// In your dashboard startup
const items = await registry.fetchAll({
  env: process.env,
  lastVisited: user.lastVisited,
  brandConfig: { label: 'Acme Corp', conversionGoal: 'purchase' }
});
```

## Configuration

### Environment Variables

- `GA4_PROPERTY_ID` (required) — Your Google Analytics 4 property ID
- `GA_SERVICE_ACCOUNT_JSON` (required) — Service account JSON for authentication

### Brand Configuration

```typescript
interface GA4Config {
  // Custom label for multi-property monitoring
  label?: string;

  // Specific conversion goal to track (e.g., 'purchase', 'signup')
  conversionGoal?: string;

  // Whether to include mobile traffic (default: true)
  includeMobileTraffic?: boolean;
}
```

### Example Configuration

```yaml
brands:
  - name: Acme Corp
    datasources:
      - id: ga4
        config:
          label: Acme Corp
          conversionGoal: purchase
          includeMobileTraffic: true
```

## What It Detects

### Critical Alerts

- Organic traffic drop > 80%
- Bounce rate increase > 50%
- Conversion rate drop > 10%

### Warnings

- Organic traffic drop 50-80%
- Bounce rate increase 30-50%
- Conversion rate drop 5-10%

### Info

- Minor traffic or conversion changes

## Output

Returns `BriefingItem[]` with:

- **No changes**: Single summary item showing current metrics
- **Detected changes**: Individual items for each anomaly with severity levels
- **Configuration missing**: Setup prompt

Example:

```
Title: "Organic sessions ↓ 65% to 8,500"
Detail: "Change: -15,000 (-65.0%)"
Priority: "high"
Category: "traffic"
```

## Testing

```bash
npm test
```

## Architecture

This component implements the OpenDash Component SDK contract:

```typescript
export interface Component {
  id: string;
  name: string;
  icon: string;
  fetch(config: ComponentConfig): Promise<BriefingItem[]>;
}
```

## Error Handling

- Missing configuration: Returns setup prompt
- API errors: Returns empty array (graceful degradation)
- Invalid credentials: Returns empty array

## Future Enhancements

- Real GA4 API integration (currently stub implementation)
- Historical trend analysis
- Predictive alerts
- Custom metric dimensions
- Segment-specific tracking

## See Also

- [Component SDK Specification](../../Standards/component-sdk-spec.md)
- [Component Ecosystem Validation](../../Standards/COMPONENT-ECOSYSTEM-VALIDATION.md)
- [OpenDash Dashboard](../../README.md)

## License

MIT
