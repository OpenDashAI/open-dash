/**
 * Zod schemas for server function inputs.
 * Validates all user-provided data at handler boundaries.
 */

import { z } from "zod";

/**
 * Input for fetchAllSources server function.
 */
export const FetchAllSourcesInputSchema = z.object({
  lastVisited: z
    .string()
    .datetime("Invalid ISO timestamp for lastVisited")
    .nullable()
    .optional()
});

export type FetchAllSourcesInput = z.infer<typeof FetchAllSourcesInputSchema>;

/**
 * Input for fetchBrandDashboard server function.
 * Validates brand slug format and timestamp.
 */
export const FetchBrandDashboardInputSchema = z.object({
  brandSlug: z
    .string()
    .min(1, "Brand slug cannot be empty")
    .max(100, "Brand slug too long")
    .regex(
      /^[a-z0-9-]+$/,
      "Brand slug must contain only lowercase letters, numbers, and hyphens"
    ),
  lastVisited: z
    .string()
    .datetime("Invalid ISO timestamp for lastVisited")
    .nullable()
    .optional()
});

export type FetchBrandDashboardInput = z.infer<
  typeof FetchBrandDashboardInputSchema
>;

/**
 * Input for getBrands server function.
 * No input validation needed (no parameters).
 */
export const GetBrandsInputSchema = z.object({}).strict();

export type GetBrandsInput = z.infer<typeof GetBrandsInputSchema>;

/**
 * Helper function to validate input or throw with context.
 * Returns validated data or throws ZodError with message.
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context: string
): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.errors || [];
    const messages = errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join("; ");
    throw new Error(`Invalid ${context}: ${messages}`);
  }

  return result.data;
}

/**
 * Helper to create a validation wrapper for server function handlers.
 * Usage:
 *   .handler(withValidation(FetchBrandDashboardInputSchema, async (input) => {
 *     // input is validated
 *   }))
 */
export function withValidation<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  handler: (input: TInput) => Promise<TOutput>,
  context: string = "input"
) {
  return async (args: { data?: unknown }) => {
    const input = validateInput(schema, args.data, context);
    return handler(input);
  };
}
