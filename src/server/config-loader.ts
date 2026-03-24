/**
 * Configuration loader for dashboard.yaml files
 * Loads and caches dashboard configurations for brands
 */

import { createServerFn } from "@tanstack/react-start";
import { readFile } from "fs/promises";
import { resolve } from "path";
import YAML from "yaml";
import {
	DashboardYaml,
	parseDashboardYaml,
	validateDashboardYaml,
} from "../lib/dashboard-config";

/**
 * In-memory cache for dashboard configs
 * Maps brand slug → DashboardYaml
 */
const configCache = new Map<string, DashboardYaml>();

/**
 * Load a dashboard config from the configs/ directory
 * Cached after first load
 */
async function loadDashboardYamlFromDisk(
	brandSlug: string
): Promise<DashboardYaml | null> {
	// Check cache first
	if (configCache.has(brandSlug)) {
		return configCache.get(brandSlug)!;
	}

	try {
		// Read YAML file from disk
		// Path relative to project root: configs/{brandSlug}.yaml
		const configPath = resolve(process.cwd(), `configs/${brandSlug}.yaml`);
		const fileContent = await readFile(configPath, "utf-8");

		// Parse YAML
		const parsed = YAML.parse(fileContent);

		// Validate against schema
		const result = validateDashboardYaml(parsed);
		if (!result.success) {
			console.error(
				`Invalid config for brand '${brandSlug}':`,
				result.errors
			);
			return null;
		}

		// Cache and return
		configCache.set(brandSlug, result.data);
		return result.data;
	} catch (err) {
		if (err instanceof Error && "code" in err && err.code === "ENOENT") {
			console.warn(`No config found for brand: ${brandSlug}`);
		} else {
			console.error(`Failed to load config for brand '${brandSlug}':`, err);
		}
		return null;
	}
}

/**
 * Server function: Load dashboard config for a brand
 * Can be called from client via TanStack Start
 */
export const loadDashboardConfig = createServerFn()
	.input<{ brandSlug: string }>()
	.handler(async ({ data }) => {
		const config = await loadDashboardYamlFromDisk(data.brandSlug);
		return config;
	});

/**
 * Server function: List all available dashboard configs
 * Scans the configs/ directory
 */
export const listAvailableDashboards = createServerFn().handler(async () => {
	try {
		const { readdirSync } = await import("fs");
		const configDir = resolve(process.cwd(), "configs");
		const files = readdirSync(configDir).filter((f) => f.endsWith(".yaml"));

		const slugs = files.map((f) => f.replace(".yaml", ""));

		// Preload all configs into cache
		const dashboards: DashboardYaml[] = [];
		for (const slug of slugs) {
			const config = await loadDashboardYamlFromDisk(slug);
			if (config) {
				dashboards.push(config);
			}
		}

		return dashboards;
	} catch (err) {
		console.error("Failed to list available dashboards:", err);
		return [];
	}
});

/**
 * Clear the config cache (useful for testing or reloading)
 */
export function clearConfigCache(): void {
	configCache.clear();
}

/**
 * Get cache stats (for debugging)
 */
export function getCacheStats(): { size: number; keys: string[] } {
	return {
		size: configCache.size,
		keys: Array.from(configCache.keys()),
	};
}
