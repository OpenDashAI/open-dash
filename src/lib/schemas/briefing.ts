/**
 * Zod schemas for briefing items.
 * Validates all runtime data from datasources.
 */

import { z } from "zod";
import { TimestampSchema, fromISOString, toISOString } from "./time";

/**
 * Priority enum — affects sorting and display.
 */
export const BriefingPriorityEnum = z.enum([
  "urgent",
  "high",
  "normal",
  "low",
]);

export type BriefingPriority = z.infer<typeof BriefingPriorityEnum>;

/**
 * Category enum — used to categorize and filter items.
 */
export const BriefingCategoryEnum = z.enum([
  "issue",
  "deploy",
  "revenue",
  "seo",
  "agent",
  "domain",
  "health",
]);

export type BriefingCategory = z.infer<typeof BriefingCategoryEnum>;

/**
 * Complete BriefingItem schema.
 * - Validates all fields
 * - Enforces constraints (min/max lengths, valid enums)
 * - Timestamps as ISO strings (converted to/from milliseconds)
 */
export const BriefingItemSchema = z.object({
  id: z
    .string()
    .min(1, "ID cannot be empty")
    .max(255, "ID too long"),
  priority: BriefingPriorityEnum,
  category: BriefingCategoryEnum,
  title: z
    .string()
    .min(1, "Title cannot be empty")
    .max(500, "Title too long"),
  detail: z
    .string()
    .max(2000, "Detail text too long")
    .optional(),
  brand: z
    .string()
    .max(100, "Brand slug too long")
    .optional(),
  time: z
    .string()
    .datetime("Invalid ISO timestamp")
    .describe("ISO 8601 timestamp when item was created/detected"),
  action: z
    .string()
    .max(100, "Action label too long")
    .optional(),
  actionUrl: z
    .string()
    .url("Invalid URL")
    .max(2000, "URL too long")
    .optional(),
  dismissed: z.boolean().default(false),
  isNew: z.boolean().default(false),
  snoozedUntil: z
    .string()
    .datetime("Invalid snooze timestamp")
    .optional(),
});

export type BriefingItem = z.infer<typeof BriefingItemSchema>;

/**
 * Array of briefing items.
 */
export const BriefingItemArraySchema = z.array(BriefingItemSchema);

export type BriefingItemArray = z.infer<typeof BriefingItemArraySchema>;
