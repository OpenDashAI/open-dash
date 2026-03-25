/**
 * Input Validation Middleware for TanStack Start
 *
 * Provides lazy-loaded validators that run per-request, not at startup.
 * Defines validators in route handlers to avoid module-level initialization.
 */

import { z, ZodSchema } from "zod";

export type ValidationError = {
	field: string;
	message: string;
};

/**
 * Validate input against a schema
 * Returns { success: true, data } or { success: false, errors }
 */
export function validateInput<T>(
	schema: ZodSchema<T>,
	input: unknown
): { success: true; data: T } | { success: false; errors: ValidationError[] } {
	const result = schema.safeParse(input);

	if (result.success) {
		return { success: true, data: result.data };
	}

	const errors: ValidationError[] = result.error.issues.map((issue) => ({
		field: issue.path.join(".") || "unknown",
		message: issue.message,
	}));

	return { success: false, errors };
}

/**
 * Require valid input or throw 400
 * Use in route handlers:
 *
 * ```typescript
 * const validated = requireValidInput(
 *   await request.json(),
 *   z.object({ email: z.string().email() })
 * );
 * ```
 */
export function requireValidInput<T>(
	input: unknown,
	schema: ZodSchema<T>
): T {
	const result = validateInput(schema, input);

	if (!result.success) {
		throw new Response(
			JSON.stringify({
				error: "Validation failed",
				details: result.errors.map((e) => ({
					field: e.field,
					message: e.message,
				})),
			}),
			{
				status: 400,
				headers: { "Content-Type": "application/json" },
			}
		);
	}

	return result.data;
}

/**
 * Schema factory functions (defined per-request, not at module level)
 * These are helper functions for common validation patterns
 */
export function createIdSchema() {
	return z.string().uuid("Invalid ID format");
}

export function createEmailSchema() {
	return z.string().email("Invalid email address");
}

export function createKeywordSchema() {
	return z
		.string()
		.min(1, "Keyword required")
		.max(200, "Keyword too long")
		.trim();
}

export function createTitleSchema() {
	return z
		.string()
		.min(1, "Title required")
		.max(500, "Title too long")
		.trim();
}

export function createSlugSchema() {
	return z
		.string()
		.min(1)
		.max(100)
		.regex(/^[a-z0-9-]+$/i, "Slug must contain only alphanumeric and hyphens");
}

/**
 * Example: Creating a request validator in a route handler
 *
 * ```typescript
 * import { requireValidInput, createEmailSchema, createTitleSchema } from '../../server/validation-middleware';
 *
 * export const Route = createAPIFileRoute("/api/users")({
 *   handlers: {
 *     POST: async ({ request }) => {
 *       // Define schema in handler (not at module level)
 *       const createUserSchema = z.object({
 *         email: createEmailSchema(),
 *         name: createTitleSchema(),
 *         role: z.enum(["viewer", "editor", "admin"]).default("viewer"),
 *       });
 *
 *       const body = await request.json();
 *       const validated = requireValidInput(body, createUserSchema);
 *
 *       // Use validated data
 *       return Response.json({ created: validated });
 *     }
 *   }
 * });
 * ```
 */
