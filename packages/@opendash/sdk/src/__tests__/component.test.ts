import { describe, it, expect } from 'vitest';
import type { BriefingItem, Component, ComponentConfig } from '../component';

describe('BriefingItem', () => {
  it('creates a valid briefing item with required fields', () => {
    const item: BriefingItem = {
      id: 'item-1',
      priority: 'high',
      category: 'alert',
      title: 'Revenue spike detected',
      detail: '$5K increase in last hour',
      time: new Date().toISOString(),
    };
    expect(item.id).toBe('item-1');
    expect(item.priority).toBe('high');
  });

  it('creates a briefing item with optional fields', () => {
    const item: BriefingItem = {
      id: 'item-2',
      priority: 'normal',
      category: 'deployment',
      title: 'New release deployed',
      detail: 'v1.2.3 is now live',
      time: new Date().toISOString(),
      isNew: true,
      actionLabel: 'View Deployment',
      actionHandler: 'open-deployment-log',
      metadata: { deploymentId: '123', duration: '5m' },
    };
    expect(item.isNew).toBe(true);
    expect(item.metadata?.deploymentId).toBe('123');
  });

  it('allows any priority level', () => {
    const priorities: Array<'low' | 'normal' | 'high'> = ['low', 'normal', 'high'];
    priorities.forEach((priority) => {
      const item: BriefingItem = {
        id: 'test',
        priority,
        category: 'test',
        title: 'Test',
        detail: 'Test',
        time: new Date().toISOString(),
      };
      expect(item.priority).toBe(priority);
    });
  });
});

describe('ComponentConfig', () => {
  it('creates config with environment variables', () => {
    const config: ComponentConfig = {
      env: {
        STRIPE_API_KEY: 'sk_test_123',
        DATABASE_URL: 'postgresql://localhost',
      },
      lastVisited: '2026-03-25T10:00:00Z',
    };
    expect(config.env.STRIPE_API_KEY).toBe('sk_test_123');
    expect(config.lastVisited).toBeTruthy();
  });

  it('allows lastVisited to be null', () => {
    const config: ComponentConfig = {
      env: {},
      lastVisited: null,
    };
    expect(config.lastVisited).toBeNull();
  });

  it('supports optional brand config', () => {
    const config: ComponentConfig = {
      env: {},
      lastVisited: null,
      brandConfig: {
        theme: 'dark',
        locale: 'en-US',
      },
    };
    expect(config.brandConfig?.theme).toBe('dark');
  });
});

describe('Component Interface', () => {
  it('enforces required metadata fields', () => {
    const component: Component = {
      id: 'stripe-revenue',
      name: 'Stripe Revenue',
      icon: '💰',
      description: 'Fetch revenue metrics from Stripe',
      version: '1.0.0',
      author: 'OpenDash',
      requiresConfig: true,
      fetch: async () => [],
    };
    expect(component.id).toBe('stripe-revenue');
    expect(component.requiresConfig).toBe(true);
  });

  it('enforces fetch method returns Promise<BriefingItem[]>', async () => {
    const items: BriefingItem[] = [
      {
        id: 'rev-1',
        priority: 'high',
        category: 'revenue',
        title: 'Daily revenue: $1,234',
        detail: '↑ 15% from yesterday',
        time: new Date().toISOString(),
      },
    ];

    const component: Component = {
      id: 'test-component',
      name: 'Test',
      icon: '🧪',
      description: 'Test component',
      version: '1.0.0',
      author: 'Test',
      requiresConfig: false,
      fetch: async () => items,
    };

    const result = await component.fetch({
      env: {},
      lastVisited: null,
    });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('rev-1');
  });

  it('supports componentId with kebab-case', () => {
    const component: Component = {
      id: 'my-custom-component',
      name: 'My Custom Component',
      icon: '🎯',
      description: 'A custom component',
      version: '1.0.0',
      author: 'Team',
      requiresConfig: false,
      fetch: async () => [],
    };
    expect(component.id).toMatch(/^[a-z0-9-]+$/);
  });
});
