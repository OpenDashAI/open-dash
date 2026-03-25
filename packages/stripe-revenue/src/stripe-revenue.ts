import type { BriefingItem, Component, ComponentConfig } from '@opendash/sdk';

/**
 * Stripe Revenue Component
 *
 * Fetches daily revenue from Stripe and displays as briefing item.
 * Shows progress toward daily target ($333/day = $10k/month).
 *
 * Requires: STRIPE_SECRET_KEY environment variable
 *
 * @example
 * ```typescript
 * import { stripeRevenue } from '@opendash-components/stripe-revenue';
 *
 * const items = await stripeRevenue.fetch({
 *   env: process.env,
 *   lastVisited: user.lastVisited,
 *   brandConfig: { label: 'Acme Corp', targetDaily: 500 }
 * });
 * ```
 */

export interface StripeRevenueConfig {
  /** Custom label prefix (e.g., "Acme Corp") */
  label?: string;
  /** Daily revenue target in USD (default: 333) */
  targetDaily?: number;
  /** Currency filter - only sum these currencies (default: all) */
  currencies?: string[];
  /** Transaction types to include (default: charge, payment) */
  types?: string[];
}

export const stripeRevenue: Component = {
  id: 'stripe-revenue',
  name: 'Stripe Revenue',
  icon: '$',
  description: 'Daily revenue from Stripe across all accounts',
  version: '1.0.0',
  author: 'OpenDash',
  requiresConfig: true,

  async fetch(config: ComponentConfig): Promise<BriefingItem[]> {
    const stripeKey = config.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      // No Stripe configured — show a prompt to connect
      return [
        {
          id: 'stripe-not-connected',
          priority: 'low',
          category: 'revenue',
          title: 'Daily revenue: $0',
          detail:
            'Target: $333/day ($10K/mo). Connect Stripe to track real revenue.',
          time: new Date().toISOString(),
        },
      ];
    }

    try {
      // Get brand-specific configuration
      const brandConfig = config.brandConfig as StripeRevenueConfig | undefined;
      const label = brandConfig?.label;
      const targetDaily = brandConfig?.targetDaily ?? 333;
      const currencies = brandConfig?.currencies;
      const types = brandConfig?.types ?? ['charge', 'payment'];

      // Fetch today's balance transactions
      const now = new Date();
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );

      const res = await fetch(
        `https://api.stripe.com/v1/balance_transactions?created[gte]=${Math.floor(todayStart.getTime() / 1000)}&limit=100`,
        {
          headers: {
            Authorization: `Bearer ${stripeKey}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error(`Stripe API error: ${res.status}`);
      }

      const data = (await res.json()) as {
        data: Array<{
          id: string;
          amount: number;
          currency: string;
          created: number;
          type: string;
        }>;
      };

      // Filter and sum transactions
      const totalCents = data.data
        .filter((t) => {
          const typeMatch = types.includes(t.type);
          const currencyMatch = !currencies || currencies.includes(t.currency.toUpperCase());
          return typeMatch && currencyMatch;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const totalDollars = totalCents / 100;
      const pct = Math.round((totalDollars / targetDaily) * 100);

      const title = label
        ? `[${label}] Daily revenue: $${totalDollars.toFixed(0)}`
        : `Daily revenue: $${totalDollars.toFixed(0)}`;

      return [
        {
          id: 'stripe-daily-revenue',
          priority: totalDollars > 0 ? 'normal' : 'low',
          category: 'revenue',
          title,
          detail: `${pct}% of $${targetDaily}/day target`,
          time: new Date().toISOString(),
          isNew: totalDollars > 0,
        },
      ];
    } catch (err) {
      // Fail silently — dashboard continues without this item
      console.error('[stripe-revenue] Error fetching revenue:', err);
      return [];
    }
  },
};
