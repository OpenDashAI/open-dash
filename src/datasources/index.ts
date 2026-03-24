/**
 * DataSource registry initialization.
 * Import and register all built-in data sources here.
 */
import { registry } from "../lib/datasource";
import { cloudflareDeploysSource } from "./cloudflare-deploys";
import { githubActivitySource } from "./github-activity";
import { githubIssuesSource } from "./github-issues";
import { scalableMediaSource } from "./scalable-media";
import { stripeRevenueSource } from "./stripe-revenue";
import { tailscaleSource } from "./tailscale";

// Competitive intelligence sources
import { serpTrackerSource } from "./serp-tracker";
import { competitorDomainsSource } from "./competitor-domains";
import { competitorContentSource } from "./competitor-content";
import { competitorDomainMetricsSource } from "./competitor-domain-metrics";
import { competitorSocialListenerSource } from "./competitor-social-listener";
import { marketInsightsSource } from "./market-insights";

// Campaign performance sources
import { googleAdsSource } from "./google-ads";
import { metaAdsSource } from "./meta-ads";

// Register all built-in sources
registry.register(githubIssuesSource);
registry.register(githubActivitySource);
registry.register(tailscaleSource);
registry.register(stripeRevenueSource);
registry.register(cloudflareDeploysSource);
registry.register(scalableMediaSource);

// Register competitive intelligence sources (Week 1+)
registry.register(serpTrackerSource);
registry.register(competitorDomainsSource);
registry.register(competitorContentSource);
registry.register(competitorDomainMetricsSource);
registry.register(competitorSocialListenerSource);
registry.register(marketInsightsSource);

// Register campaign performance sources (Week 2+)
registry.register(googleAdsSource);
registry.register(metaAdsSource);

export { registry };
