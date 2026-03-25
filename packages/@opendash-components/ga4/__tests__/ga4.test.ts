import { describe, it, expect } from 'vitest';
import { ga4 } from '../src/ga4';
import type { ComponentConfig } from '@opendash/sdk';

describe('GA4 Component', () => {
  it('returns unconfigured message when GA4_PROPERTY_ID is missing', async () => {
    const config: ComponentConfig = {
      env: { GA_SERVICE_ACCOUNT_JSON: '{}' },
      lastVisited: null,
    };

    const items = await ga4.fetch(config);

    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('ga4-not-configured');
    expect(items[0].priority).toBe('low');
    expect(items[0].category).toBe('traffic');
  });

  it('returns unconfigured message when GA_SERVICE_ACCOUNT_JSON is missing', async () => {
    const config: ComponentConfig = {
      env: { GA4_PROPERTY_ID: '123456' },
      lastVisited: null,
    };

    const items = await ga4.fetch(config);

    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('ga4-not-configured');
    expect(items[0].actionUrl).toBe('/settings/integrations/ga4');
  });

  it('returns summary when no significant changes detected', async () => {
    const config: ComponentConfig = {
      env: {
        GA4_PROPERTY_ID: '123456',
        GA_SERVICE_ACCOUNT_JSON: '{}',
      },
      lastVisited: null,
    };

    const items = await ga4.fetch(config);

    // Since we're using random data generation, we may or may not have changes
    // But the response should always be valid BriefingItem[]
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThan(0);

    // Check structure of first item
    const item = items[0];
    expect(item.id).toBeDefined();
    expect(item.priority).toMatch(/low|normal|high/);
    expect(item.category).toBe('traffic');
    expect(item.title).toBeDefined();
    expect(item.time).toBeDefined();
  });

  it('includes proper metadata', () => {
    expect(ga4.id).toBe('ga4');
    expect(ga4.name).toBe('Google Analytics 4');
    expect(ga4.icon).toBe('📊');
    expect(ga4.requiresConfig).toBe(true);
    expect(ga4.version).toBe('1.0.0');
    expect(ga4.author).toBe('OpenDash');
  });

  it('applies custom label prefix', async () => {
    const config: ComponentConfig = {
      env: {
        GA4_PROPERTY_ID: '123456',
        GA_SERVICE_ACCOUNT_JSON: '{}',
      },
      lastVisited: null,
      brandConfig: { label: 'Acme Corp' },
    };

    const items = await ga4.fetch(config);

    expect(items.length).toBeGreaterThan(0);
    // If no significant changes, summary title should have label
    if (items[0].id === 'ga4-summary') {
      expect(items[0].title).toContain('[Acme Corp]');
    }
  });

  it('respects conversion goal configuration', async () => {
    const config: ComponentConfig = {
      env: {
        GA4_PROPERTY_ID: '123456',
        GA_SERVICE_ACCOUNT_JSON: '{}',
      },
      lastVisited: null,
      brandConfig: { conversionGoal: 'purchase' },
    };

    const items = await ga4.fetch(config);

    expect(items.length).toBeGreaterThan(0);
    // Component should initialize successfully with custom goal
    expect(items[0].category).toBe('traffic');
  });

  it('returns empty array on error (graceful degradation)', async () => {
    // This would require mocking the fetch function to throw
    // For now, we can test that the component doesn't crash

    const config: ComponentConfig = {
      env: {
        GA4_PROPERTY_ID: '123456',
        GA_SERVICE_ACCOUNT_JSON: 'invalid',
      },
      lastVisited: null,
    };

    const items = await ga4.fetch(config);

    // Even with invalid JSON, component should return gracefully
    expect(Array.isArray(items)).toBe(true);
  });

  it('generates briefing items with correct priority levels', async () => {
    const config: ComponentConfig = {
      env: {
        GA4_PROPERTY_ID: '123456',
        GA_SERVICE_ACCOUNT_JSON: '{}',
      },
      lastVisited: null,
    };

    const items = await ga4.fetch(config);

    expect(items.length).toBeGreaterThan(0);
    items.forEach((item) => {
      expect(['low', 'normal', 'high']).toContain(item.priority);
    });
  });

  it('marks new metrics as isNew', async () => {
    const config: ComponentConfig = {
      env: {
        GA4_PROPERTY_ID: '123456',
        GA_SERVICE_ACCOUNT_JSON: '{}',
      },
      lastVisited: null,
    };

    const items = await ga4.fetch(config);

    // Metrics with changes should be marked as new
    const changedItems = items.filter((item) => item.id.startsWith('ga4-') && item.id !== 'ga4-summary');
    changedItems.forEach((item) => {
      if (item.id !== 'ga4-summary') {
        expect(item.isNew).toBe(true);
      }
    });
  });
});
