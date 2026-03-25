import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createStripeRevenueComponent, stripeRevenueComponent } from '../stripe-revenue';
import type { ComponentConfig } from '@opendash/sdk';

// Mock fetch globally
global.fetch = vi.fn();

describe('Stripe Revenue Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('component metadata', () => {
    it('has correct identity metadata', () => {
      expect(stripeRevenueComponent.id).toBe('stripe-revenue');
      expect(stripeRevenueComponent.name).toBe('Stripe Revenue');
      expect(stripeRevenueComponent.icon).toBe('💰');
      expect(stripeRevenueComponent.requiresConfig).toBe(true);
      expect(stripeRevenueComponent.version).toBe('1.0.0');
      expect(stripeRevenueComponent.author).toBe('OpenDash');
    });

    it('implements Component interface', () => {
      expect(typeof stripeRevenueComponent.id).toBe('string');
      expect(typeof stripeRevenueComponent.name).toBe('string');
      expect(typeof stripeRevenueComponent.icon).toBe('string');
      expect(typeof stripeRevenueComponent.description).toBe('string');
      expect(typeof stripeRevenueComponent.fetch).toBe('function');
    });
  });

  describe('fetch - no API key', () => {
    it('returns helpful prompt when STRIPE_SECRET_KEY not configured', async () => {
      const config: ComponentConfig = {
        env: {},
        lastVisited: null,
      };

      const items = await stripeRevenueComponent.fetch(config);

      expect(items).toHaveLength(1);
      expect(items[0].id).toBe('stripe-not-connected');
      expect(items[0].priority).toBe('low');
      expect(items[0].title).toBe('Daily revenue: $0');
      expect(items[0].actionLabel).toBe('Configure Stripe');
    });

    it('includes target amount in prompt', async () => {
      const config: ComponentConfig = {
        env: {},
        lastVisited: null,
      };

      const items = await stripeRevenueComponent.fetch(config);
      expect(items[0].detail).toContain('$333/day');
    });
  });

  describe('fetch - successful response', () => {
    it('calculates revenue from balance transactions', async () => {
      const mockResponse = {
        data: [
          { id: 'txn_1', amount: 10000, type: 'charge', currency: 'usd', created: 1234567890 },
          { id: 'txn_2', amount: 20000, type: 'payment', currency: 'usd', created: 1234567891 },
          { id: 'txn_3', amount: 500, type: 'payout', currency: 'usd', created: 1234567892 }, // Should be excluded
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const config: ComponentConfig = {
        env: { STRIPE_SECRET_KEY: 'sk_test_123' },
        lastVisited: null,
      };

      const items = await stripeRevenueComponent.fetch(config);

      expect(items).toHaveLength(1);
      expect(items[0].id).toBe('stripe-daily-revenue');
      expect(items[0].title).toContain('Daily revenue: $300'); // 10000 + 20000 = 30000 cents = $300
    });

    it('includes brand label in title when configured', async () => {
      const mockResponse = {
        data: [
          { id: 'txn_1', amount: 50000, type: 'charge', currency: 'usd', created: 1234567890 },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const config: ComponentConfig = {
        env: { STRIPE_SECRET_KEY: 'sk_test_123' },
        lastVisited: null,
        brandConfig: { label: 'ACME Inc' },
      };

      const items = await stripeRevenueComponent.fetch(config);

      expect(items[0].title).toContain('[ACME Inc]');
      expect(items[0].title).toContain('$500');
    });

    it('calculates percentage of target', async () => {
      const mockResponse = {
        data: [
          { id: 'txn_1', amount: 16650, type: 'charge', currency: 'usd', created: 1234567890 }, // $166.50 = 50% of $333
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const config: ComponentConfig = {
        env: { STRIPE_SECRET_KEY: 'sk_test_123' },
        lastVisited: null,
      };

      const items = await stripeRevenueComponent.fetch(config);

      expect(items[0].detail).toContain('50%');
      expect(items[0].detail).toContain('$333/day');
    });

    it('sets priority based on revenue', async () => {
      // Above target
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            { id: 'txn_1', amount: 50000, type: 'charge', currency: 'usd', created: 1234567890 },
          ],
        }),
      });

      let config: ComponentConfig = {
        env: { STRIPE_SECRET_KEY: 'sk_test_123' },
        lastVisited: null,
      };

      let items = await stripeRevenueComponent.fetch(config);
      expect(items[0].priority).toBe('high');

      // Below target, but above zero
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            { id: 'txn_1', amount: 10000, type: 'charge', currency: 'usd', created: 1234567890 },
          ],
        }),
      });

      items = await stripeRevenueComponent.fetch(config);
      expect(items[0].priority).toBe('normal');

      // Zero revenue
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      items = await stripeRevenueComponent.fetch(config);
      expect(items[0].priority).toBe('low');
    });

    it('includes metadata with numeric values', async () => {
      const mockResponse = {
        data: [
          { id: 'txn_1', amount: 16650, type: 'charge', currency: 'usd', created: 1234567890 },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const config: ComponentConfig = {
        env: { STRIPE_SECRET_KEY: 'sk_test_123' },
        lastVisited: null,
      };

      const items = await stripeRevenueComponent.fetch(config);

      expect(items[0].metadata).toEqual({
        totalDollars: 166.5,
        percentOfTarget: 50,
        target: 333,
      });
    });

    it('filters out non-revenue transaction types', async () => {
      const mockResponse = {
        data: [
          { id: 'txn_1', amount: 100000, type: 'charge', currency: 'usd', created: 1234567890 },
          { id: 'txn_2', amount: 50000, type: 'payout', currency: 'usd', created: 1234567891 }, // Excluded
          { id: 'txn_3', amount: 30000, type: 'adjustment', currency: 'usd', created: 1234567892 }, // Excluded
          { id: 'txn_4', amount: 20000, type: 'payment', currency: 'usd', created: 1234567893 },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const config: ComponentConfig = {
        env: { STRIPE_SECRET_KEY: 'sk_test_123' },
        lastVisited: null,
      };

      const items = await stripeRevenueComponent.fetch(config);

      // Only charge (100000) + payment (20000) = 120000 cents = $1200
      expect(items[0].title).toContain('$1200');
    });
  });

  describe('fetch - errors', () => {
    it('returns error item on API failure', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const config: ComponentConfig = {
        env: { STRIPE_SECRET_KEY: 'sk_test_invalid' },
        lastVisited: null,
      };

      const items = await stripeRevenueComponent.fetch(config);

      expect(items).toHaveLength(1);
      expect(items[0].id).toBe('stripe-error');
      expect(items[0].priority).toBe('low');
      expect(items[0].title).toBe('Stripe API error: 401');
    });

    it('handles network errors gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network timeout'));

      const config: ComponentConfig = {
        env: { STRIPE_SECRET_KEY: 'sk_test_123' },
        lastVisited: null,
      };

      const items = await stripeRevenueComponent.fetch(config);

      expect(items).toHaveLength(1);
      expect(items[0].category).toBe('error');
      expect(items[0].detail).toContain('Network timeout');
    });

    it('handles invalid JSON response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      const config: ComponentConfig = {
        env: { STRIPE_SECRET_KEY: 'sk_test_123' },
        lastVisited: null,
      };

      const items = await stripeRevenueComponent.fetch(config);

      expect(items[0].category).toBe('error');
    });
  });

  describe('custom instances', () => {
    it('creates instance with custom daily target', async () => {
      const customComponent = createStripeRevenueComponent({ dailyTarget: 1000 });

      const config: ComponentConfig = {
        env: {},
        lastVisited: null,
      };

      const items = await customComponent.fetch(config);

      expect(items[0].detail).toContain('$1000/day');
    });

    it('respects brand-config override of default target', async () => {
      const customComponent = createStripeRevenueComponent({ dailyTarget: 1000 });

      const mockResponse = {
        data: [
          { id: 'txn_1', amount: 50000, type: 'charge', currency: 'usd', created: 1234567890 },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const config: ComponentConfig = {
        env: { STRIPE_SECRET_KEY: 'sk_test_123' },
        lastVisited: null,
        brandConfig: { dailyTarget: 500 }, // Override default
      };

      const items = await customComponent.fetch(config);

      expect(items[0].detail).toContain('100%'); // $500 / $500 target
      expect(items[0].detail).toContain('$500/day');
    });

    it('creates independent instances that dont interfere', async () => {
      const comp1 = createStripeRevenueComponent({ dailyTarget: 100 });
      const comp2 = createStripeRevenueComponent({ dailyTarget: 1000 });

      const config1: ComponentConfig = { env: {}, lastVisited: null };
      const config2: ComponentConfig = { env: {}, lastVisited: null };

      const items1 = await comp1.fetch(config1);
      const items2 = await comp2.fetch(config2);

      expect(items1[0].detail).toContain('$100/day');
      expect(items2[0].detail).toContain('$1000/day');
    });
  });

  describe('API contract', () => {
    it('sends correct Authorization header', async () => {
      const mockResponse = {
        data: [],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const config: ComponentConfig = {
        env: { STRIPE_SECRET_KEY: 'sk_test_abc123' },
        lastVisited: null,
      };

      await stripeRevenueComponent.fetch(config);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.stripe.com/v1/balance_transactions'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer sk_test_abc123',
          }),
        })
      );
    });

    it('includes created[gte] parameter for today', async () => {
      const mockResponse = { data: [] };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const config: ComponentConfig = {
        env: { STRIPE_SECRET_KEY: 'sk_test_123' },
        lastVisited: null,
      };

      await stripeRevenueComponent.fetch(config);

      const callUrl = (global.fetch as any).mock.calls[0][0];
      expect(callUrl).toContain('created[gte]=');
      expect(callUrl).toContain('limit=100');
    });
  });
});
