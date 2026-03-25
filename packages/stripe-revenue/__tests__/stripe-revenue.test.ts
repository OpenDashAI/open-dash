import { describe, it, expect, vi, afterEach } from 'vitest';
import { stripeRevenue } from '../src/stripe-revenue';
import type { ComponentConfig } from '@opendash/sdk';

describe('Stripe Revenue Component', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns unconfigured message when STRIPE_SECRET_KEY is missing', async () => {
    const config: ComponentConfig = {
      env: {},
      lastVisited: null,
    };

    const items = await stripeRevenue.fetch(config);

    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('stripe-not-connected');
    expect(items[0].title).toBe('Daily revenue: $0');
    expect(items[0].priority).toBe('low');
  });

  it('fetches and formats daily revenue correctly', async () => {
    const mockResponse = {
      data: [
        { id: 'txn_1', amount: 50000, currency: 'usd', type: 'charge', created: 1234567890 },
        { id: 'txn_2', amount: 75000, currency: 'usd', type: 'payment', created: 1234567890 },
      ],
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const config: ComponentConfig = {
      env: { STRIPE_SECRET_KEY: 'sk_test_example' },
      lastVisited: null,
    };

    const items = await stripeRevenue.fetch(config);

    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('stripe-daily-revenue');
    expect(items[0].category).toBe('revenue');
    expect(items[0].priority).toBe('normal');
    expect(items[0].title).toContain('Daily revenue: $1250');
    expect(items[0].detail).toContain('375%'); // 1250/333
    expect(items[0].isNew).toBe(true);
  });

  it('respects custom target daily amount', async () => {
    const mockResponse = {
      data: [
        { id: 'txn_1', amount: 50000, currency: 'usd', type: 'charge', created: 1234567890 },
      ],
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const config: ComponentConfig = {
      env: { STRIPE_SECRET_KEY: 'sk_test_example' },
      lastVisited: null,
      brandConfig: { targetDaily: 1000 },
    };

    const items = await stripeRevenue.fetch(config);

    expect(items[0].detail).toContain('50%'); // 500/1000
  });

  it('applies custom label prefix', async () => {
    const mockResponse = {
      data: [
        { id: 'txn_1', amount: 10000, currency: 'usd', type: 'charge', created: 1234567890 },
      ],
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const config: ComponentConfig = {
      env: { STRIPE_SECRET_KEY: 'sk_test_example' },
      lastVisited: null,
      brandConfig: { label: 'Acme Corp' },
    };

    const items = await stripeRevenue.fetch(config);

    expect(items[0].title).toContain('[Acme Corp]');
  });

  it('returns empty array on API error', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    const config: ComponentConfig = {
      env: { STRIPE_SECRET_KEY: 'sk_test_invalid' },
      lastVisited: null,
    };

    const items = await stripeRevenue.fetch(config);

    expect(items).toHaveLength(0);
  });

  it('filters transactions by currency', async () => {
    const mockResponse = {
      data: [
        { id: 'txn_1', amount: 10000, currency: 'usd', type: 'charge', created: 1234567890 },
        { id: 'txn_2', amount: 5000, currency: 'eur', type: 'charge', created: 1234567890 },
      ],
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const config: ComponentConfig = {
      env: { STRIPE_SECRET_KEY: 'sk_test_example' },
      lastVisited: null,
      brandConfig: { currencies: ['USD'] },
    };

    const items = await stripeRevenue.fetch(config);

    expect(items[0].detail).toContain('100'); // 100/333
  });

  it('sets priority to low when no revenue', async () => {
    const mockResponse = {
      data: [],
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const config: ComponentConfig = {
      env: { STRIPE_SECRET_KEY: 'sk_test_example' },
      lastVisited: null,
    };

    const items = await stripeRevenue.fetch(config);

    expect(items[0].priority).toBe('low');
    expect(items[0].isNew).toBeUndefined();
  });

  it('includes proper metadata', () => {
    expect(stripeRevenue.id).toBe('stripe-revenue');
    expect(stripeRevenue.name).toBe('Stripe Revenue');
    expect(stripeRevenue.icon).toBe('$');
    expect(stripeRevenue.requiresConfig).toBe(true);
    expect(stripeRevenue.version).toBe('1.0.0');
  });
});
