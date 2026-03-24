/**
 * Zod schemas for datasource metrics and health tracking.
 */

import { z } from "zod";
import { TimestampSchema } from "./time";

/**
 * Health status — derived from metric values.
 */
export const HealthStatusEnum = z.enum(["healthy", "degraded", "critical"]);
export type HealthStatus = z.infer<typeof HealthStatusEnum>;

/**
 * Single datasource metric snapshot.
 * - Tracks latency, error rate, connection status
 * - All values validated and constrained
 */
export const DatasourceMetricSchema = z.object({
  id: z
    .string()
    .min(1, "ID cannot be empty")
    .max(100, "ID too long"),
  name: z
    .string()
    .min(1, "Name cannot be empty")
    .max(100, "Name too long"),
  lastFetch: TimestampSchema.describe("Unix milliseconds of last fetch attempt"),
  fetchLatency: z
    .number()
    .nonnegative("Latency cannot be negative")
    .max(600000, "Latency exceeded 10 minutes (likely hung)")
    .describe("Fetch duration in milliseconds"),
  errorRate: z
    .number()
    .min(0, "Error rate cannot be negative")
    .max(1, "Error rate cannot exceed 1")
    .describe("Exponential moving average (0-1)"),
  connected: z.boolean(),
  healthStatus: HealthStatusEnum.optional(),
});

export type DatasourceMetric = z.infer<typeof DatasourceMetricSchema>;

/**
 * Collection of metrics for all datasources.
 */
export const DatasourceMetricArraySchema = z.array(DatasourceMetricSchema);
export type DatasourceMetricArray = z.infer<typeof DatasourceMetricArraySchema>;

/**
 * Validate and compute health status from a metric.
 * Used when inserting or updating metrics.
 */
export function computeHealthStatus(metric: z.input<typeof DatasourceMetricSchema>): HealthStatus {
  const validated = DatasourceMetricSchema.parse(metric);

  if (!validated.connected) return "critical";
  if (validated.errorRate > 0.5) return "critical";
  if (validated.errorRate > 0.2) return "degraded";
  return "healthy";
}
