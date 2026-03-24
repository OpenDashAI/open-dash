/**
 * Dashboard configuration schema (dashboard.yaml)
 * Defines the structure for per-brand operational dashboards
 */

import { z } from "zod";

/**
 * Data source configuration within a dashboard.yaml
 * Specifies which datasource to use and its brand-specific params
 * Note: This is different from DataSourceConfig in datasource.ts
 * This defines YAML config; the other defines runtime config passed to datasources
 */
export const DataSourceYamlConfigSchema = z.object({
	id: z.string(),
	config: z.record(z.unknown()).optional(),
});

export type DataSourceYamlConfig = z.infer<typeof DataSourceYamlConfigSchema>;

/**
 * Widget configuration
 * References a datasource and specifies how to render it
 */
export const WidgetSchema = z.object({
	type: z.string(),
	source: z.string().optional(),
	config: z.record(z.unknown()).optional(),
	title: z.string().optional(),
});

export type Widget = z.infer<typeof WidgetSchema>;

/**
 * Dashboard YAML schema
 * Top-level configuration for a brand's dashboard
 */
export const DashboardYamlSchema = z.object({
	brand: z.string().describe("Brand slug (e.g., 'llc-tax')"),
	domain: z.string().describe("Primary domain for this brand"),
	description: z.string().optional(),
	sources: z
		.array(DataSourceYamlConfigSchema)
		.describe("Data sources to fetch from"),
	widgets: z.array(WidgetSchema).describe("Widgets to render"),
});

export type DashboardYaml = z.infer<typeof DashboardYamlSchema>;

/**
 * Parse and validate YAML config
 */
export function parseDashboardYaml(data: unknown): DashboardYaml {
	return DashboardYamlSchema.parse(data);
}

/**
 * Validate YAML config (returns errors instead of throwing)
 */
export function validateDashboardYaml(
	data: unknown
): { success: true; data: DashboardYaml } | { success: false; errors: string[] } {
	const result = DashboardYamlSchema.safeParse(data);
	if (result.success) {
		return { success: true, data: result.data };
	}
	return {
		success: false,
		errors: result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`),
	};
}
