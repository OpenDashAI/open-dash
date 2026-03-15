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

// Register all built-in sources
registry.register(githubIssuesSource);
registry.register(githubActivitySource);
registry.register(tailscaleSource);
registry.register(stripeRevenueSource);
registry.register(cloudflareDeploysSource);
registry.register(scalableMediaSource);

export { registry };
