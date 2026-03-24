/**
 * Runtime validation helpers for datasource configurations.
 * Used when instantiating datasources to ensure required secrets are available.
 */

import { z } from "zod";
import type { DataSourceConfig } from "../datasource";
import {
	GitHubEnvSchema,
	StripeEnvSchema,
	TailscaleEnvSchema,
	GitHubBrandConfigSchema,
	StripeBrandConfigSchema,
} from "./datasource";

/**
 * Validate that a datasource has all required environment variables.
 * Throws with clear error if missing or invalid.
 */
export function validateDatasourceEnv<T extends z.ZodType>(
	datasourceName: string,
	envSchema: T,
	config: DataSourceConfig
): z.infer<T> {
	const result = envSchema.safeParse(config.env);

	if (!result.success) {
		const errors = result.error.errors || [];
		const missing = errors
			.filter((e) => e.code === "invalid_type")
			.map((e) => String(e.path[0]))
			.join(", ");
		throw new Error(
			`${datasourceName}: Missing environment variables: ${missing || "unknown"}`
		);
	}

	return result.data;
}

/**
 * Validate brand-specific configuration for a datasource.
 * Returns validated config or empty object if not provided.
 */
export function validateDatasourceBrandConfig<T extends z.ZodType>(
	datasourceName: string,
	configSchema: T,
	config: DataSourceConfig
): z.infer<T> {
	const result = configSchema.safeParse(config.brandConfig || {});

	if (!result.success) {
		const errors = result.error.errors || [];
		const issues = errors
			.map((e) => `${e.path.join(".")}: ${e.message}`)
			.join("; ");
		throw new Error(`${datasourceName} brand config: ${issues}`);
	}

	return result.data;
}

/**
 * Helper: Validate GitHub datasource config.
 * Returns { env, brandConfig } with both validated.
 */
export function validateGitHubConfig(config: DataSourceConfig) {
	const env = validateDatasourceEnv("GitHub", GitHubEnvSchema, config);
	const brandConfig = validateDatasourceBrandConfig(
		"GitHub",
		GitHubBrandConfigSchema,
		config
	);
	return { env, brandConfig };
}

/**
 * Helper: Validate Stripe datasource config.
 */
export function validateStripeConfig(config: DataSourceConfig) {
	const env = validateDatasourceEnv("Stripe", StripeEnvSchema, config);
	const brandConfig = validateDatasourceBrandConfig(
		"Stripe",
		StripeBrandConfigSchema,
		config
	);
	return { env, brandConfig };
}

/**
 * Helper: Validate Tailscale datasource config.
 */
export function validateTailscaleConfig(config: DataSourceConfig) {
	const env = validateDatasourceEnv(
		"Tailscale",
		TailscaleEnvSchema,
		config
	);
	return { env };
}

/**
 * Generic validation for any datasource.
 * Usage:
 *   const { env } = validateDatasourceConfig("github", config, {
 *     GITHUB_TOKEN: z.string(),
 *   });
 */
export function validateDatasourceConfig(
	name: string,
	config: DataSourceConfig,
	envSchema: Record<string, z.ZodType>
) {
	const schema = z.object(envSchema).strict();
	const env = validateDatasourceEnv(name, schema, config);
	return { env };
}
