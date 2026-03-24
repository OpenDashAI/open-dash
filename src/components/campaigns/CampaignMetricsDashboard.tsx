/**
 * Campaign Metrics Dashboard — Unified view of all campaign performance metrics
 *
 * Displays metrics from Google Ads, Meta Ads, GA4, and Email campaigns
 * Shows performance trends, detected changes, and anomalies
 */

import { useMemo } from "react";
import type { GoogleAdsSnapshot } from "../../datasources/google-ads";
import type { MetaAdsSnapshot } from "../../datasources/meta-ads";
import type { GA4Snapshot } from "../../datasources/ga4";
import type { EmailMetricsSnapshot } from "../../datasources/email-metrics";

export interface CampaignMetricsDashboardProps {
  googleAdsCampaigns?: GoogleAdsSnapshot[];
  metaAdsCampaigns?: MetaAdsSnapshot[];
  ga4Properties?: GA4Snapshot[];
  emailCampaigns?: EmailMetricsSnapshot[];
  onRefresh?: () => void;
}

interface CampaignMetric {
  id: string;
  name: string;
  type: "google_ads" | "meta_ads" | "ga4" | "email";
  spend?: number;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  conversionRate?: number;
  actionRate?: number;
  listSize?: number;
  openRate?: number;
  clickRate?: number;
}

export function CampaignMetricsDashboard({
  googleAdsCampaigns = [],
  metaAdsCampaigns = [],
  ga4Properties = [],
  emailCampaigns = [],
  onRefresh,
}: CampaignMetricsDashboardProps) {
  const campaigns = useMemo(() => {
    const all: CampaignMetric[] = [];

    // Google Ads campaigns
    googleAdsCampaigns.forEach((camp) => {
      all.push({
        id: `google-ads-${camp.campaignId}`,
        name: camp.campaignName,
        type: "google_ads",
        spend: camp.spend,
        impressions: camp.impressions,
        clicks: camp.clicks,
        conversions: camp.conversions,
        conversionRate: camp.conversionRate,
      });
    });

    // Meta Ads campaigns
    metaAdsCampaigns.forEach((camp) => {
      all.push({
        id: `meta-ads-${camp.campaignId}`,
        name: camp.campaignName,
        type: "meta_ads",
        spend: camp.spend,
        impressions: camp.impressions,
        clicks: camp.clicks,
        conversions: camp.actions,
        actionRate: camp.actionRate,
      });
    });

    // GA4 properties
    ga4Properties.forEach((prop) => {
      all.push({
        id: `ga4-${prop.propertyId}`,
        name: prop.propertyName,
        type: "ga4",
        impressions: prop.organicSessions,
        clicks: prop.organicUsers,
        conversions: prop.conversions,
        conversionRate: prop.conversionRate,
      });
    });

    // Email campaigns
    emailCampaigns.forEach((camp) => {
      all.push({
        id: `email-${camp.campaignId}`,
        name: camp.campaignName,
        type: "email",
        impressions: camp.listSize,
        clicks: camp.openCount,
        conversions: camp.clickCount,
        openRate: camp.openRate,
        clickRate: camp.clickRate,
      });
    });

    return all.sort((a, b) => a.name.localeCompare(b.name));
  }, [googleAdsCampaigns, metaAdsCampaigns, ga4Properties, emailCampaigns]);

  const totalSpend = useMemo(
    () =>
      campaigns
        .filter((c) => c.spend !== undefined)
        .reduce((sum, c) => sum + (c.spend || 0), 0),
    [campaigns]
  );

  const totalConversions = useMemo(
    () =>
      campaigns
        .filter((c) => c.conversions !== undefined)
        .reduce((sum, c) => sum + (c.conversions || 0), 0),
    [campaigns]
  );

  const avgConversionRate = useMemo(() => {
    const rateValues = campaigns
      .filter((c) => c.conversionRate !== undefined || c.actionRate !== undefined)
      .map((c) => c.conversionRate ?? c.actionRate ?? 0);
    return rateValues.length > 0
      ? rateValues.reduce((a, b) => a + b, 0) / rateValues.length
      : 0;
  }, [campaigns]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--hud-text-bright)]">
              Campaign Metrics
            </h2>
            <p className="text-xs text-[var(--hud-text-muted)] mt-1">
              {campaigns.length} campaign
              {campaigns.length !== 1 ? "s" : ""} tracked across{" "}
              {[
                googleAdsCampaigns.length > 0 && "Google Ads",
                metaAdsCampaigns.length > 0 && "Meta Ads",
                ga4Properties.length > 0 && "GA4",
                emailCampaigns.length > 0 && "Email",
              ]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-3 py-1 text-xs rounded bg-[var(--hud-bg-secondary)] text-[var(--hud-text-bright)] hover:bg-[var(--hud-bg-tertiary)] transition-colors"
            >
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded border border-[var(--hud-border)] bg-[var(--hud-bg-secondary)]">
          <div className="text-xs text-[var(--hud-text-muted)] uppercase tracking-wider">
            Total Spend
          </div>
          <div className="text-2xl font-bold text-[var(--hud-text-bright)] mt-2">
            ${totalSpend.toFixed(0)}
          </div>
        </div>

        <div className="p-4 rounded border border-[var(--hud-border)] bg-[var(--hud-bg-secondary)]">
          <div className="text-xs text-[var(--hud-text-muted)] uppercase tracking-wider">
            Total Conversions
          </div>
          <div className="text-2xl font-bold text-[var(--hud-text-bright)] mt-2">
            {totalConversions.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded border border-[var(--hud-border)] bg-[var(--hud-bg-secondary)]">
          <div className="text-xs text-[var(--hud-text-muted)] uppercase tracking-wider">
            Avg Conversion Rate
          </div>
          <div className="text-2xl font-bold text-[var(--hud-text-bright)] mt-2">
            {(avgConversionRate * 100).toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Campaign List */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-[var(--hud-text-muted)] uppercase tracking-wider">
          All Campaigns
        </h3>

        {campaigns.length === 0 ? (
          <div className="p-6 rounded border border-[var(--hud-border)] bg-[var(--hud-bg-secondary)] text-center">
            <p className="text-sm text-[var(--hud-text-muted)]">
              No campaigns configured yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface CampaignCardProps {
  campaign: CampaignMetric;
}

function CampaignCard({ campaign }: CampaignCardProps) {
  const typeLabel = {
    google_ads: "Google Ads",
    meta_ads: "Meta Ads",
    ga4: "GA4",
    email: "Email",
  }[campaign.type];

  const typeColor = {
    google_ads: "bg-blue-500/20 text-blue-400",
    meta_ads: "bg-sky-500/20 text-sky-400",
    ga4: "bg-orange-500/20 text-orange-400",
    email: "bg-purple-500/20 text-purple-400",
  }[campaign.type];

  return (
    <div className="p-4 rounded border border-[var(--hud-border)] bg-[var(--hud-bg-secondary)] space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-[var(--hud-text-bright)]">
            {campaign.name}
          </h4>
          <div className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${typeColor}`}>
            {typeLabel}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {campaign.spend !== undefined && (
          <div>
            <div className="text-xs text-[var(--hud-text-muted)]">Spend</div>
            <div className="text-lg font-semibold text-[var(--hud-text-bright)]">
              ${campaign.spend.toFixed(0)}
            </div>
          </div>
        )}

        {campaign.impressions !== undefined && (
          <div>
            <div className="text-xs text-[var(--hud-text-muted)]">
              {campaign.type === "email" ? "List Size" : "Impressions"}
            </div>
            <div className="text-lg font-semibold text-[var(--hud-text-bright)]">
              {campaign.impressions.toLocaleString()}
            </div>
          </div>
        )}

        {campaign.clicks !== undefined && (
          <div>
            <div className="text-xs text-[var(--hud-text-muted)]">
              {campaign.type === "email" ? "Opens" : "Clicks"}
            </div>
            <div className="text-lg font-semibold text-[var(--hud-text-bright)]">
              {campaign.clicks.toLocaleString()}
            </div>
          </div>
        )}

        {campaign.conversions !== undefined && (
          <div>
            <div className="text-xs text-[var(--hud-text-muted)]">
              {campaign.type === "email" ? "Clicks" : "Conversions"}
            </div>
            <div className="text-lg font-semibold text-[var(--hud-text-bright)]">
              {campaign.conversions.toLocaleString()}
            </div>
          </div>
        )}
      </div>

      {/* Rates */}
      <div className="flex gap-4 pt-2 border-t border-[var(--hud-border)]">
        {(campaign.conversionRate ?? campaign.actionRate) !== undefined && (
          <div>
            <div className="text-xs text-[var(--hud-text-muted)]">Conv Rate</div>
            <div className="text-sm font-semibold text-[var(--hud-text-bright)]">
              {(((campaign.conversionRate ?? campaign.actionRate) ?? 0) * 100).toFixed(2)}%
            </div>
          </div>
        )}

        {campaign.openRate !== undefined && (
          <div>
            <div className="text-xs text-[var(--hud-text-muted)]">Open Rate</div>
            <div className="text-sm font-semibold text-[var(--hud-text-bright)]">
              {(campaign.openRate * 100).toFixed(2)}%
            </div>
          </div>
        )}

        {campaign.clickRate !== undefined && (
          <div>
            <div className="text-xs text-[var(--hud-text-muted)]">Click Rate</div>
            <div className="text-sm font-semibold text-[var(--hud-text-bright)]">
              {(campaign.clickRate * 100).toFixed(2)}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
