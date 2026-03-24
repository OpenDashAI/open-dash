/**
 * Input Validation Framework
 *
 * Centralized Zod-based validation for API requests, form submissions, and user inputs.
 * Prevents injection attacks, ensures data integrity, and provides clear error messages.
 */

import { z } from "zod";

/**
 * Common field validators - reusable across endpoints
 */
export const validators = {
	// IDs
	uuid: z.string().uuid("Invalid UUID format"),
	slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/i, "Slug must contain only alphanumeric characters and hyphens"),

	// Strings
	email: z.string().email("Invalid email address").toLowerCase(),
	domain: z.string().url("Invalid domain URL"),
	url: z.string().url("Invalid URL"),
	keyword: z.string().min(1).max(200, "Keyword too long").trim(),
	title: z.string().min(1).max(500, "Title too long").trim(),
	description: z.string().max(5000, "Description too long").trim().nullable().optional(),

	// Numbers
	priority: z.enum(["low", "normal", "high", "critical"], {
		errorMap: () => ({ message: "Invalid priority level" })
	}),
	percentile: z.number().min(0).max(100, "Percentile must be 0-100"),

	// Status
	status: z.enum(["active", "inactive", "archived"], {
		errorMap: () => ({ message: "Invalid status" })
	}),

	// Credentials
	apiKey: z.string().min(20).max(500, "Invalid API key format"),
};

/**
 * API Request Schemas
 */

// Competitor endpoints
export const addCompetitorSchema = z.object({
	name: validators.title,
	domain: validators.domain,
	keywords: z.array(validators.keyword).optional().default([]),
	dataSource: z.enum(["manual", "ahrefs", "similarweb", "semrush"]).default("manual"),
});

export const updateCompetitorSchema = z.object({
	id: validators.uuid,
	name: validators.title.optional(),
	domain: validators.domain.optional(),
	keywords: z.array(validators.keyword).optional(),
	active: z.boolean().optional(),
});

// SERP/Keyword endpoints
export const checkKeywordSchema = z.object({
	keyword: validators.keyword,
	competitors: z.array(validators.uuid).optional().default([]),
});

export const siteSearchSchema = z.object({
	query: z.string().min(1).max(200, "Search query too long").trim(),
	limit: z.number().int().min(1).max(100, "Limit must be 1-100").default(20),
	offset: z.number().int().min(0).default(0),
});

// Escalation/Alert endpoints
export const createEscalationSchema = z.object({
	id: z.string().optional(),
	title: validators.title,
	detail: validators.description,
	priority: validators.priority.default("normal"),
	category: z.string().max(100, "Category too long").optional(),
	brand: z.string().max(100, "Brand name too long").optional(),
	source: z.string().max(100, "Source too long").optional(),
	action: z.string().max(200, "Action too long").optional(),
	actionUrl: validators.url.optional(),
	requiresApproval: z.boolean().default(false),
});

// Authentication/User endpoints
export const createUserSchema = z.object({
	email: validators.email,
	name: z.string().min(1).max(200, "Name too long").trim(),
	role: z.enum(["viewer", "editor", "admin"]).default("viewer"),
});

export const updateUserSchema = z.object({
	id: validators.uuid,
	email: validators.email.optional(),
	name: z.string().min(1).max(200, "Name too long").trim().optional(),
	role: z.enum(["viewer", "editor", "admin"]).optional(),
});

// Organization endpoints
export const createOrgSchema = z.object({
	name: validators.title,
	slug: validators.slug,
	tier: z.enum(["free", "pro", "enterprise"]).default("free"),
});

export const updateOrgSchema = z.object({
	id: validators.uuid,
	name: validators.title.optional(),
	slug: validators.slug.optional(),
	tier: z.enum(["free", "pro", "enterprise"]).optional(),
});

/**
 * Validation result types
 */
export type ValidationError = {
	field: string;
	message: string;
};

export type ValidationResult<T> =
	| { success: true; data: T }
	| { success: false; errors: ValidationError[] };

/**
 * Validate input against a schema and return structured result
 */
export function validate<T>(
	schema: z.ZodSchema<T>,
	input: unknown
): ValidationResult<T> {
	const result = schema.safeParse(input);

	if (result.success) {
		return { success: true, data: result.data };
	}

	// Transform Zod errors into our ValidationError format
	const errors: ValidationError[] = result.error.issues.map((issue) => ({
		field: issue.path.join(".") || "unknown",
		message: issue.message,
	}));

	return { success: false, errors };
}

/**
 * Validate and throw Response on failure (for use in route handlers)
 */
export function validateRequest<T>(
	schema: z.ZodSchema<T>,
	input: unknown
): T {
	const result = validate(schema, input);

	if (!result.success) {
		const error = new Error("Validation failed");
		(error as any).status = 400;
		(error as any).errors = result.errors;
		throw error;
	}

	return result.data;
}

/**
 * Response helper for validation errors
 */
export function validationErrorResponse(errors: ValidationError[]) {
	return Response.json(
		{
			error: "Validation failed",
			details: errors.map((e) => ({
				field: e.field,
				message: e.message,
			})),
		},
		{ status: 400 }
	);
}
