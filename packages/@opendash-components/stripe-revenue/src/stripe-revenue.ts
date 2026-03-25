import type { Component, BriefingItem, ComponentConfig } from '@opendash/sdk';
import { z } from 'zod';

/**
 * Stripe Revenue Component
 *
 * Fetches daily revenue from Stripe and shows progress against target.
 * Implements the OpenDash Component interface for interoperability.
 */

// Extend ComponentConfig with Stripe-specific configuration
export interface StripeComponentConfig extends ComponentConfig {
  brandConfig?: {
    label?: string; // Brand-specific label (e.g., "ACME Inc")
    dailyTarget?: number; // Daily revenue target in dollars (default: $333)
  };
}

// Schema for validating Stripe API response
const BalanceTransactionSchema = z.object({
  id: z.string(),
  amount: z.number(),
  currency: z.string(),
  created: z.number(),
  type: z.string(),
});

const BalanceTransactionsResponseSchema = z.object({
  data: z.array(BalanceTransactionSchema),
});

/**
 * Create a Stripe revenue component instance
 * Can be customized with different targets and labels per brand
 */
export function createStripeRevenueComponent(overrides?: {
  dailyTarget?: number;
}): Component {
  const defaultDailyTarget = overrides?.dailyTarget ?? 333;

  const component: Component = {
    // Identity
    id: 'stripe-revenue',
    name: 'Stripe Revenue',
    icon: '💰',
    description: 'Daily revenue from Stripe across all accounts',
    version: '1.0.0',
    author: 'OpenDash',
    requiresConfig: true,

    // Behavior
    async fetch(config: StripeComponentConfig): Promise<BriefingItem[]> {
      const stripeKey = config.env.STRIPE_SECRET_KEY;

      // No key configured - return helpful prompt
      if (!stripeKey) {
        return [
          {
            id: 'stripe-not-connected',
            priority: 'low',
            category: 'revenue',
            title: 'Daily revenue: $0',
            detail: `Target: $${defaultDailyTarget}/day. Connect Stripe to track real revenue.`,
            time: new Date().toISOString(),
            actionLabel: 'Configure Stripe',
            actionHandler: 'open-settings',
          },
        ];
      }

      try {
        // Get brand-specific configuration
        const brandLabel = config.brandConfig?.label;
        const dailyTarget = config.brandConfig?.dailyTarget ?? defaultDailyTarget;

        // Fetch today's balance transactions
        const todayStart = getTodayStart();
        const unixTime = Math.floor(todayStart.getTime() / 1000);

        const response = await fetch(
          `https://api.stripe.com/v1/balance_transactions?created[gte]=${unixTime}&limit=100`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${stripeKey}`,
              'Accept': 'application/json',
            },
          }
        );

        if (!response.ok) {
          return createErrorItem(
            `Stripe API error: ${response.status}`,
            'Failed to fetch revenue data'
          );
        }

        const data = await response.json();
        const validatedData = BalanceTransactionsResponseSchema.parse(data);

        // Sum revenue from charge and payment transactions
        const totalCents = validatedData.data
          .filter((t) => t.type === 'charge' || t.type === 'payment')
          .reduce((sum, t) => sum + t.amount, 0);

        const totalDollars = totalCents / 100;
        const percentOfTarget = Math.round((totalDollars / dailyTarget) * 100);

        const title = brandLabel
          ? `[${brandLabel}] Daily revenue: $${totalDollars.toFixed(0)}`
          : `Daily revenue: $${totalDollars.toFixed(0)}`;

        return [
          {
            id: 'stripe-daily-revenue',
            priority: totalDollars > dailyTarget ? 'high' : totalDollars > 0 ? 'normal' : 'low',
            category: 'revenue',
            title,
            detail: `${percentOfTarget}% of $${dailyTarget}/day target`,
            time: new Date().toISOString(),
            isNew: totalDollars > 0,
            metadata: {
              totalDollars,
              percentOfTarget,
              target: dailyTarget,
            },
          },
        ];
      } catch (error) {
        return createErrorItem(
          'Stripe component error',
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    },
  };

  return component;
}

/**
 * Singleton instance with default configuration
 * Use createStripeRevenueComponent() to create custom instances
 */
export const stripeRevenueComponent = createStripeRevenueComponent();

/**
 * Helper: Get today's start time (midnight)
 */
function getTodayStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Helper: Create an error briefing item
 */
function createErrorItem(title: string, detail: string): BriefingItem[] {
  return [
    {
      id: 'stripe-error',
      priority: 'low',
      category: 'error',
      title,
      detail,
      time: new Date().toISOString(),
    },
  ];
}
