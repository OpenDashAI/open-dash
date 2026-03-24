/**
 * Timestamp standardization.
 *
 * Standard across OpenDash:
 * - Storage & comparison: Unix milliseconds (can use <, >, math)
 * - API responses: ISO 8601 strings (human readable)
 * - Internal representation: number (milliseconds since epoch)
 */

import { z } from "zod";

/**
 * Timestamp schema — milliseconds since epoch.
 * Must be a positive integer, not in far future.
 */
export const TimestampSchema = z
  .number()
  .int("Timestamp must be integer milliseconds")
  .nonnegative("Timestamp must be non-negative")
  .max(Date.now() + 86400000, "Timestamp cannot be more than 24h in future");

export type Timestamp = z.infer<typeof TimestampSchema>;

/**
 * Convert Unix milliseconds to ISO string.
 */
export function toISOString(timestamp: Timestamp): string {
  return new Date(timestamp).toISOString();
}

/**
 * Convert ISO string to Unix milliseconds.
 * Throws if invalid format.
 */
export function fromISOString(isoString: string): Timestamp {
  const ms = new Date(isoString).getTime();
  if (Number.isNaN(ms)) {
    throw new Error(`Invalid ISO string: ${isoString}`);
  }
  return TimestampSchema.parse(ms);
}

/**
 * Get current timestamp.
 */
export function now(): Timestamp {
  return TimestampSchema.parse(Date.now());
}
