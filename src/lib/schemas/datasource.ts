/**
 * Zod schemas for datasource configuration and status.
 */

import { z } from "zod";

/**
 * DataSource status — connection state and health info.
 */
export const DataSourceStatusSchema = z.object({
  connected: z.boolean(),
  lastFetch: z
    .string()
    .datetime("Invalid ISO timestamp")
    .optional()
  error: z
    .string()
    .max(1000, "Error message too long")
    .optional()
  itemCount: z
    .number()
    .nonnegative("Item count cannot be negative")
    .optional(),
});

export type DataSourceStatus = z.infer<typeof DataSourceStatusSchema>;

/**
 * Base datasource configuration.
 * Individual datasources may extend this with per-source env var schemas.
 */
export const DataSourceConfigSchema = z
  .object({
    env: z.record(z.string()),
    lastVisited: z
      .string()
      .datetime("Invalid ISO timestamp")
      .nullable(),
  })
  .extend({
    brandConfig: z.record(z.unknown()).optional(),
  });

export type DataSourceConfig = z.infer<typeof DataSourceConfigSchema>;

/**
 * Helper to define per-datasource environment variable schemas.
 * Use like:
 *
 *   const GitHubEnvSchema = defineEnvSchema('github', {
 *     GITHUB_TOKEN: z.string(),
 *   });
 *
 *   // In datasource fetch():
 *   const env = GitHubEnvSchema.parse(config.env);
 *   const token = env.GITHUB_TOKEN; // ✅ typed
 */
export function defineEnvSchema<T extends Record<string, z.ZodType>>(
  name: string,
  fields: T,
) {
  return z.object(fields).strict();
}

/**
 * Helper to define per-datasource brand config schemas.
 */
export function defineBrandConfigSchema<T extends Record<string, z.ZodType>>(
  name: string,
  fields: T,
) {
  return z.object(fields).partial();
}

/**
 * Example env schemas for common datasources.
 */

export const StripeEnvSchema = defineEnvSchema("stripe", {
  STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY required"),
  STRIPE_PUBLIC_KEY: z.string().min(1, "STRIPE_PUBLIC_KEY required"),
});

export const GitHubEnvSchema = defineEnvSchema("github", {
  GITHUB_TOKEN: z.string().min(1, "GITHUB_TOKEN required"),
});

export const TailscaleEnvSchema = defineEnvSchema("tailscale", {
  TAILSCALE_API_KEY: z.string().min(1, "TAILSCALE_API_KEY required"),
});

/**
 * Example brand config schemas.
 */

export const StripeBrandConfigSchema = defineBrandConfigSchema("stripe", {
  currencyFilter: z.enum(["USD", "EUR", "GBP"]).optional(),
  minAmountFilter: z.number().min(0).optional(),
  lookbackDays: z.number().min(1).max(365).default(30),
});

export const GitHubBrandConfigSchema = defineBrandConfigSchema("github", {
  owner: z.string().optional(),
  repo: z.string().optional(),
  filterLabels: z.array(z.string()).optional(),
});
