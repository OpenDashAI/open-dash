import type { BriefingItem, Component, ComponentConfig } from '@opendash/sdk';

/**
 * GA4 Component
 *
 * Monitors Google Analytics 4 traffic and conversion metrics.
 * Detects anomalies in organic traffic, bounce rate, and conversion rates.
 *
 * Requires: GA4_PROPERTY_ID, GA_SERVICE_ACCOUNT_JSON environment variables
 *
 * @example
 * ```typescript
 * import { ga4 } from '@opendash-components/ga4';
 *
 * const items = await ga4.fetch({
 *   env: process.env,
 *   lastVisited: user.lastVisited,
 *   brandConfig: { conversionGoal: 'purchase' }
 * });
 * ```
 */

export interface GA4Config {
  /** Custom label for multi-property monitoring */
  label?: string;
  /** Specific conversion goal to track (e.g., 'purchase', 'signup') */
  conversionGoal?: string;
  /** Whether to include mobile traffic in metrics (default: true) */
  includeMobileTraffic?: boolean;
}

/**
 * Fetch GA4 data using the Reporting API
 * This is a stub implementation that returns sample data
 * Real implementation would call Google Analytics Data API
 */
async function fetchGA4Metrics(
  _propertyId: string,
  _serviceAccountJson: string,
): Promise<{
  organicSessions: number;
  organicUsers: number;
  bounceRate: number;
  conversions: number;
  conversionRate: number;
}> {
  // Stub implementation for MVP
  // Full implementation would:
  // 1. Authenticate with service account
  // 2. Call Google Analytics Data API v1beta
  // 3. Fetch metrics: sessions, users, bounce_rate, conversions
  // 4. Calculate conversion_rate from conversions / sessions
  // 5. Return historical data for comparison

  return {
    organicSessions: Math.floor(Math.random() * 49000) + 1000,
    organicUsers: Math.floor(Math.random() * 9000) + 500,
    bounceRate: Math.random() * 0.4 + 0.3,
    conversions: Math.floor(Math.random() * 500) + 20,
    conversionRate: Math.random() * 0.08 + 0.01,
  };
}

/**
 * Detect significant changes in GA4 metrics
 */
function detectMetricChanges(
  today: Awaited<ReturnType<typeof fetchGA4Metrics>>,
  yesterday: Awaited<ReturnType<typeof fetchGA4Metrics>>,
): Array<{
  metric: string;
  change: number;
  percent: number;
  severity: 'critical' | 'warning' | 'info';
  message: string;
}> {
  const changes: Array<{
    metric: string;
    change: number;
    percent: number;
    severity: 'critical' | 'warning' | 'info';
    message: string;
  }> = [];

  // Detect organic session changes
  const sessionChange = today.organicSessions - yesterday.organicSessions;
  const sessionPercent = (sessionChange / Math.max(yesterday.organicSessions, 1)) * 100;

  if (Math.abs(sessionPercent) > 50) {
    let severity: 'critical' | 'warning' | 'info' = 'warning';
    if (sessionPercent <= -80) severity = 'critical';

    changes.push({
      metric: 'organic_sessions',
      change: sessionChange,
      percent: sessionPercent,
      severity,
      message: `Organic sessions ${sessionPercent > 0 ? '↑' : '↓'} ${Math.abs(sessionPercent).toFixed(0)}% to ${today.organicSessions.toLocaleString()}`,
    });
  }

  // Detect bounce rate changes
  const bounceChange = today.bounceRate - yesterday.bounceRate;
  if (bounceChange >= 0.3) {
    let severity: 'critical' | 'warning' | 'info' = 'warning';
    if (bounceChange >= 0.5) severity = 'critical';

    changes.push({
      metric: 'bounce_rate',
      change: bounceChange,
      percent: (bounceChange / Math.max(yesterday.bounceRate, 0.01)) * 100,
      severity,
      message: `Bounce rate ↑ ${(bounceChange * 100).toFixed(1)}% to ${(today.bounceRate * 100).toFixed(1)}%`,
    });
  }

  // Detect conversion rate changes
  const convRateChange = today.conversionRate - yesterday.conversionRate;
  if (Math.abs(convRateChange) >= 0.005) {
    let severity: 'critical' | 'warning' | 'info' = 'info';
    if (convRateChange <= -0.1) severity = 'critical';
    else if (convRateChange <= -0.05) severity = 'warning';

    changes.push({
      metric: 'conversion_rate',
      change: convRateChange,
      percent: (convRateChange / Math.max(yesterday.conversionRate, 0.001)) * 100,
      severity,
      message: `Conversion rate ${convRateChange > 0 ? '↑' : '↓'} to ${(today.conversionRate * 100).toFixed(2)}% (was ${(yesterday.conversionRate * 100).toFixed(2)}%)`,
    });
  }

  return changes;
}

export const ga4: Component = {
  id: 'ga4',
  name: 'Google Analytics 4',
  icon: '📊',
  description: 'Organic traffic, conversions, and user behavior metrics from GA4',
  version: '1.0.0',
  author: 'OpenDash',
  requiresConfig: true,

  async fetch(config: ComponentConfig): Promise<BriefingItem[]> {
    const propertyId = config.env?.GA4_PROPERTY_ID;
    const serviceAccountJson = config.env?.GA_SERVICE_ACCOUNT_JSON;

    if (!propertyId || !serviceAccountJson) {
      return [
        {
          id: 'ga4-not-configured',
          priority: 'low',
          category: 'traffic',
          title: 'GA4 - Configuration Required',
          detail: 'Configure GA4_PROPERTY_ID and GA_SERVICE_ACCOUNT_JSON to enable monitoring',
          time: new Date().toISOString(),
          action: 'Configure',
          actionUrl: '/settings/integrations/ga4',
        },
      ];
    }

    try {
      const brandConfig = config.brandConfig as GA4Config | undefined;
      const label = brandConfig?.label;

      // Fetch today and yesterday's metrics
      const today = await fetchGA4Metrics(propertyId, serviceAccountJson);
      const yesterday = await fetchGA4Metrics(propertyId, serviceAccountJson);

      const changes = detectMetricChanges(today, yesterday);

      // If no significant changes, return summary
      if (changes.length === 0) {
        const titlePrefix = label ? `[${label}] ` : '';
        return [
          {
            id: 'ga4-summary',
            priority: 'low',
            category: 'traffic',
            title: `${titlePrefix}GA4 Metrics Stable`,
            detail: `${today.organicSessions.toLocaleString()} sessions, ${(today.conversionRate * 100).toFixed(2)}% conversion rate`,
            time: new Date().toISOString(),
          },
        ];
      }

      // Return briefing items for each detected change
      const items: BriefingItem[] = changes.map((change) => ({
        id: `ga4-${change.metric}`,
        priority: change.severity === 'critical' ? 'high' : change.severity === 'warning' ? 'normal' : 'low',
        category: 'traffic',
        title: change.message,
        detail: `Change: ${change.change > 0 ? '+' : ''}${change.change.toFixed(2)} (${change.percent > 0 ? '+' : ''}${change.percent.toFixed(1)}%)`,
        time: new Date().toISOString(),
        isNew: true,
      }));

      return items;
    } catch (err) {
      console.error('[ga4] Error fetching metrics:', err);
      return [];
    }
  },
};
