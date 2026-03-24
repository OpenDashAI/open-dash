/**
 * Test suite for CampaignMetricsDashboard component
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CampaignMetricsDashboard } from "../CampaignMetricsDashboard";
import type { GoogleAdsSnapshot } from "../../../datasources/google-ads";
import type { MetaAdsSnapshot } from "../../../datasources/meta-ads";
import type { GA4Snapshot } from "../../../datasources/ga4";
import type { EmailMetricsSnapshot } from "../../../datasources/email-metrics";

// Mock snapshots
const mockGoogleAdsCampaign: GoogleAdsSnapshot = {
  campaignId: "gads-1",
  campaignName: "Summer Sale Google",
  spend: 5000,
  impressions: 50000,
  clicks: 500,
  conversions: 50,
  costPerConversion: 100,
  clickThroughRate: 0.01,
  conversionRate: 0.1,
  snapshotDate: new Date(),
};

const mockMetaAdsCampaign: MetaAdsSnapshot = {
  campaignId: "meta-1",
  campaignName: "Summer Sale Meta",
  adAccountId: "act_123",
  spend: 3000,
  impressions: 40000,
  clicks: 400,
  actions: 40,
  costPerAction: 75,
  clickThroughRate: 0.01,
  actionRate: 0.1,
  snapshotDate: new Date(),
};

const mockGA4Property: GA4Snapshot = {
  propertyId: "ga4-1",
  propertyName: "Main Website",
  organicSessions: 10000,
  organicUsers: 5000,
  bouncRate: 0.4,
  conversions: 200,
  conversionRate: 0.02,
  trafficBySource: { organic: 10000, paid: 0, social: 0, direct: 0 },
  snapshotDate: new Date(),
};

const mockEmailCampaign: EmailMetricsSnapshot = {
  campaignId: "email-1",
  campaignName: "Newsletter Summer",
  provider: "mailchimp",
  listSize: 5000,
  subscribersAdded: 100,
  sendCount: 1,
  openCount: 1500,
  clickCount: 300,
  unsubscribeCount: 10,
  openRate: 0.3,
  clickRate: 0.2,
  unsubscribeRate: 0.002,
  snapshotDate: new Date(),
};

describe("CampaignMetricsDashboard", () => {
  describe("Rendering", () => {
    it("renders the dashboard header", () => {
      render(<CampaignMetricsDashboard />);
      expect(screen.getByText("Campaign Metrics")).toBeInTheDocument();
    });

    it("shows campaign count in subtitle", () => {
      render(
        <CampaignMetricsDashboard
          googleAdsCampaigns={[mockGoogleAdsCampaign]}
        />
      );
      expect(screen.getByText(/1 campaign/)).toBeInTheDocument();
    });

    it("shows no campaigns message when empty", () => {
      render(<CampaignMetricsDashboard />);
      expect(
        screen.getByText("No campaigns configured yet")
      ).toBeInTheDocument();
    });

    it("renders refresh button when callback provided", () => {
      const mockRefresh = vi.fn();
      render(<CampaignMetricsDashboard onRefresh={mockRefresh} />);
      expect(screen.getByText("Refresh")).toBeInTheDocument();
    });

    it("does not render refresh button when callback not provided", () => {
      render(<CampaignMetricsDashboard />);
      const refreshButton = screen.queryByText("Refresh");
      expect(refreshButton).not.toBeInTheDocument();
    });
  });

  describe("Google Ads Integration", () => {
    it("renders Google Ads campaign", () => {
      render(
        <CampaignMetricsDashboard
          googleAdsCampaigns={[mockGoogleAdsCampaign]}
        />
      );
      expect(screen.getByText("Summer Sale Google")).toBeInTheDocument();
      expect(screen.getByText("Google Ads")).toBeInTheDocument();
    });

    it("displays Google Ads metrics", () => {
      const { container } = render(
        <CampaignMetricsDashboard
          googleAdsCampaigns={[mockGoogleAdsCampaign]}
        />
      );
      const campaignText = container.textContent;
      expect(campaignText).toContain("50,000");
      expect(campaignText).toContain("500");
      expect(campaignText).toContain("50");
    });

    it("formats conversion rate correctly", () => {
      const { container } = render(
        <CampaignMetricsDashboard
          googleAdsCampaigns={[mockGoogleAdsCampaign]}
        />
      );
      const allElements = container.querySelectorAll("*");
      let foundRate = false;
      allElements.forEach((el) => {
        if (el.textContent?.includes("10.00%") && el.textContent?.length < 50) {
          foundRate = true;
        }
      });
      expect(foundRate).toBe(true);
    });
  });

  describe("Meta Ads Integration", () => {
    it("renders Meta Ads campaign", () => {
      render(
        <CampaignMetricsDashboard metaAdsCampaigns={[mockMetaAdsCampaign]} />
      );
      expect(screen.getByText("Summer Sale Meta")).toBeInTheDocument();
      expect(screen.getByText("Meta Ads")).toBeInTheDocument();
    });

    it("displays Meta Ads metrics with actions as conversions", () => {
      const { container } = render(
        <CampaignMetricsDashboard metaAdsCampaigns={[mockMetaAdsCampaign]} />
      );
      expect(container.textContent).toContain("40,000");
      expect(screen.getByText("Summer Sale Meta")).toBeInTheDocument();
    });
  });

  describe("GA4 Integration", () => {
    it("renders GA4 property", () => {
      render(<CampaignMetricsDashboard ga4Properties={[mockGA4Property]} />);
      expect(screen.getByText("Main Website")).toBeInTheDocument();
      expect(screen.getByText("GA4")).toBeInTheDocument();
    });

    it("displays GA4 metrics with organic sessions", () => {
      render(<CampaignMetricsDashboard ga4Properties={[mockGA4Property]} />);
      expect(screen.getByText("10,000")).toBeInTheDocument();
      expect(screen.getByText("5,000")).toBeInTheDocument();
    });
  });

  describe("Email Integration", () => {
    it("renders email campaign", () => {
      render(
        <CampaignMetricsDashboard emailCampaigns={[mockEmailCampaign]} />
      );
      expect(screen.getByText("Newsletter Summer")).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
    });

    it("displays email metrics with list size and opens", () => {
      render(
        <CampaignMetricsDashboard emailCampaigns={[mockEmailCampaign]} />
      );
      expect(screen.getByText("5,000")).toBeInTheDocument();
      expect(screen.getByText("1,500")).toBeInTheDocument();
    });

    it("shows open rate and click rate for email", () => {
      render(
        <CampaignMetricsDashboard emailCampaigns={[mockEmailCampaign]} />
      );
      expect(screen.getByText("30.00%")).toBeInTheDocument();
      expect(screen.getByText("20.00%")).toBeInTheDocument();
    });
  });

  describe("Multi-Datasource Integration", () => {
    it("renders campaigns from all datasources", () => {
      render(
        <CampaignMetricsDashboard
          googleAdsCampaigns={[mockGoogleAdsCampaign]}
          metaAdsCampaigns={[mockMetaAdsCampaign]}
          ga4Properties={[mockGA4Property]}
          emailCampaigns={[mockEmailCampaign]}
        />
      );
      expect(screen.getByText("Summer Sale Google")).toBeInTheDocument();
      expect(screen.getByText("Summer Sale Meta")).toBeInTheDocument();
      expect(screen.getByText("Main Website")).toBeInTheDocument();
      expect(screen.getByText("Newsletter Summer")).toBeInTheDocument();
    });

    it("shows datasource mentions in subtitle", () => {
      const { container } = render(
        <CampaignMetricsDashboard
          googleAdsCampaigns={[mockGoogleAdsCampaign]}
          metaAdsCampaigns={[mockMetaAdsCampaign]}
        />
      );
      expect(container.textContent).toContain("Google Ads");
      expect(container.textContent).toContain("Meta Ads");
    });

    it("counts all campaigns correctly", () => {
      render(
        <CampaignMetricsDashboard
          googleAdsCampaigns={[mockGoogleAdsCampaign]}
          metaAdsCampaigns={[mockMetaAdsCampaign]}
          ga4Properties={[mockGA4Property]}
          emailCampaigns={[mockEmailCampaign]}
        />
      );
      expect(screen.getByText(/4 campaigns/)).toBeInTheDocument();
    });
  });

  describe("Summary Metrics", () => {
    it("calculates total spend from multiple datasources", () => {
      render(
        <CampaignMetricsDashboard
          googleAdsCampaigns={[mockGoogleAdsCampaign]}
          metaAdsCampaigns={[mockMetaAdsCampaign]}
        />
      );
      // 5000 + 3000 = 8000
      expect(screen.getByText("$8000")).toBeInTheDocument();
    });

    it("calculates total conversions across campaigns", () => {
      render(
        <CampaignMetricsDashboard
          googleAdsCampaigns={[mockGoogleAdsCampaign]}
          metaAdsCampaigns={[mockMetaAdsCampaign]}
          ga4Properties={[mockGA4Property]}
          emailCampaigns={[mockEmailCampaign]}
        />
      );
      // 50 + 40 + 200 + 300 = 590
      expect(screen.getByText("590")).toBeInTheDocument();
    });

    it("calculates average conversion rate", () => {
      const { container } = render(
        <CampaignMetricsDashboard
          googleAdsCampaigns={[mockGoogleAdsCampaign]}
          metaAdsCampaigns={[mockMetaAdsCampaign]}
        />
      );
      // (0.1 + 0.1) / 2 = 0.1 = 10%
      expect(container.textContent).toContain("10.00%");
    });

    it("handles campaigns without spend metric", () => {
      render(
        <CampaignMetricsDashboard
          ga4Properties={[mockGA4Property]}
          emailCampaigns={[mockEmailCampaign]}
        />
      );
      expect(screen.getByText("$0")).toBeInTheDocument();
    });

    it("handles mixed metrics in conversion rate calculation", () => {
      const customGoogle = { ...mockGoogleAdsCampaign, conversionRate: 0.15 };
      const customMeta = { ...mockMetaAdsCampaign, actionRate: 0.05 };
      render(
        <CampaignMetricsDashboard
          googleAdsCampaigns={[customGoogle]}
          metaAdsCampaigns={[customMeta]}
        />
      );
      // (0.15 + 0.05) / 2 = 0.1 = 10%
      expect(screen.getByText(/10\.00%/)).toBeInTheDocument();
    });
  });

  describe("Sorting", () => {
    it("sorts campaigns alphabetically by name", () => {
      const camp1 = { ...mockGoogleAdsCampaign, campaignName: "Zebra Campaign" };
      const camp2 = { ...mockGoogleAdsCampaign, campaignName: "Alpha Campaign" };

      const { container } = render(
        <CampaignMetricsDashboard googleAdsCampaigns={[camp1, camp2]} />
      );

      const campaignCards = container.querySelectorAll("h4");
      expect(campaignCards[0].textContent).toBe("Alpha Campaign");
      expect(campaignCards[1].textContent).toBe("Zebra Campaign");
    });
  });

  describe("Refresh Button", () => {
    it("calls refresh callback when button clicked", () => {
      const mockRefresh = vi.fn();

      render(
        <CampaignMetricsDashboard
          googleAdsCampaigns={[mockGoogleAdsCampaign]}
          onRefresh={mockRefresh}
        />
      );

      const refreshButton = screen.getByText("Refresh");
      fireEvent.click(refreshButton);
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });
  });

  describe("Campaign Card Display", () => {
    it("shows correct badge color for Google Ads", () => {
      const { container } = render(
        <CampaignMetricsDashboard
          googleAdsCampaigns={[mockGoogleAdsCampaign]}
        />
      );
      const badge = container.querySelector(".bg-blue-500\\/20");
      expect(badge).toBeInTheDocument();
    });

    it("shows correct badge color for Meta Ads", () => {
      const { container } = render(
        <CampaignMetricsDashboard metaAdsCampaigns={[mockMetaAdsCampaign]} />
      );
      const badge = container.querySelector(".bg-sky-500\\/20");
      expect(badge).toBeInTheDocument();
    });

    it("shows correct badge color for GA4", () => {
      const { container } = render(
        <CampaignMetricsDashboard ga4Properties={[mockGA4Property]} />
      );
      const badge = container.querySelector(".bg-orange-500\\/20");
      expect(badge).toBeInTheDocument();
    });

    it("shows correct badge color for Email", () => {
      const { container } = render(
        <CampaignMetricsDashboard emailCampaigns={[mockEmailCampaign]} />
      );
      const badge = container.querySelector(".bg-purple-500\\/20");
      expect(badge).toBeInTheDocument();
    });
  });

  describe("Number Formatting", () => {
    it("formats large numbers with thousand separators", () => {
      const largeCampaign = {
        ...mockGoogleAdsCampaign,
        impressions: 1234567,
        conversions: 5000,
      };
      const { container } = render(
        <CampaignMetricsDashboard googleAdsCampaigns={[largeCampaign]} />
      );
      expect(container.textContent).toContain("1,234,567");
      expect(container.textContent).toContain("5,000");
    });

    it("formats percentages with 2 decimal places", () => {
      const precisionCampaign = {
        ...mockGoogleAdsCampaign,
        conversionRate: 0.123456,
      };
      const { container } = render(
        <CampaignMetricsDashboard googleAdsCampaigns={[precisionCampaign]} />
      );
      expect(container.textContent).toContain("12.35%");
    });

    it("formats currency to whole dollars", () => {
      const currencyCampaign = {
        ...mockGoogleAdsCampaign,
        spend: 1234.56,
      };
      const { container } = render(
        <CampaignMetricsDashboard googleAdsCampaigns={[currencyCampaign]} />
      );
      expect(container.textContent).toContain("$1235");
    });
  });

  describe("Empty Sections", () => {
    it("handles campaigns with missing optional metrics", () => {
      const partialCampaign = {
        ...mockGoogleAdsCampaign,
        spend: undefined,
      } as any;
      render(
        <CampaignMetricsDashboard googleAdsCampaigns={[partialCampaign]} />
      );
      expect(screen.getByText("Summer Sale Google")).toBeInTheDocument();
    });

    it("handles multiple empty datasources gracefully", () => {
      const { container } = render(
        <CampaignMetricsDashboard
          googleAdsCampaigns={[]}
          metaAdsCampaigns={[]}
          ga4Properties={[]}
          emailCampaigns={[]}
        />
      );
      expect(container.textContent).toContain("No campaigns configured yet");
    });
  });
});
