/**
 * Configuration loader for dashboard.yaml files
 * Hybrid approach: tries fs first (Phase 1-3), falls back to Brand System API (Phase 4+)
 * Caches in memory for performance
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

		return result.data;
	} catch (err) {
		if (err instanceof Error && "code" in err && err.code === "ENOENT") {
			// File not found is normal, will try API fallback
			return null;
		} else {
			console.error(`Failed to load config for brand '${brandSlug}':`, err);
			return null;
		}
	}
}

/**
 * Load a dashboard config from Brand System API
 * Fallback when fs config is not available
 */
async function loadDashboardYamlFromApi(
	brandSlug: string,
	apiUrl: string | undefined
): Promise<DashboardYaml | null> {
	if (!apiUrl) {
		return null;
	}

	try {
		const url = new URL(`/api/dashboards/${brandSlug}`, apiUrl);
		const res = await fetch(url.toString());

		if (!res.ok) {
			console.warn(`Brand System API error for ${brandSlug}: ${res.status}`);
			return null;
		}

		const config = await res.json();

		// Validate against schema
		const result = validateDashboardYaml(config);
		if (!result.success) {
			console.error(
				`Invalid config from Brand System for '${brandSlug}':`,
				result.errors
			);
			return null;
		}

		return result.data;
	} catch (err) {
		console.error(
			`Failed to load config from Brand System for '${brandSlug}':`,
			err
		);
		return null;
	}
}

/**
 * Server function: Load dashboard config for a brand
 * Tries fs first, then Brand System API, then returns null
 */
export const loadDashboardConfig = createServerFn()
	.input<{ brandSlug: string }>()
	.handler(async ({ data }) => {
		// Check cache first
		if (configCache.has(data.brandSlug)) {
			return configCache.get(data.brandSlug)!;
		}

		// Try filesystem first (Phase 1-3 local development)
		let config = await loadDashboardYamlFromDisk(data.brandSlug);

		// Fall back to Brand System API (Phase 4+)
		if (!config) {
			const apiUrl = process.env.BRAND_SYSTEM_API_URL;
			config = await loadDashboardYamlFromApi(data.brandSlug, apiUrl);
		}

		// Cache if found
		if (config) {
			configCache.set(data.brandSlug, config);
		}

		return config;
	});

/**
 * Server function: List all available dashboard configs
 * Tries fs first, falls back to Brand System API
 */
export const listAvailableDashboards = createServerFn().handler(async () => {
	const dashboards: DashboardYaml[] = [];

	// Try filesystem first
	try {
		const { readdirSync } = await import("fs");
		const configDir = resolve(process.cwd(), "configs");
		const files = readdirSync(configDir).filter((f) => f.endsWith(".yaml"));

		const slugs = files.map((f) => f.replace(".yaml", ""));

		// Load all configs from disk
		for (const slug of slugs) {
			const config = await loadDashboardYamlFromDisk(slug);
			if (config) {
				dashboards.push(config);
				configCache.set(slug, config);
			}
		}

		// If we found configs on disk, return them
		if (dashboards.length > 0) {
			return dashboards;
		}
	} catch (err) {
		console.warn("Failed to read configs from disk:", err);
	}

	// Fall back to Brand System API
	const apiUrl = process.env.BRAND_SYSTEM_API_URL;
	if (!apiUrl) {
		console.warn("BRAND_SYSTEM_API_URL not set, cannot load dashboards from API");
		return [];
	}

	try {
		const url = new URL("/api/dashboards", apiUrl);
		const res = await fetch(url.toString());

		if (!res.ok) {
			console.warn(`Brand System API error: ${res.status}`);
			return [];
		}

		const configs = await res.json();

		// Validate and cache each config
		if (Array.isArray(configs)) {
			for (const config of configs) {
				const result = validateDashboardYaml(config);
				if (result.success) {
					dashboards.push(result.data);
					configCache.set(config.brand, result.data);
				}
			}
		}

		return dashboards;
	} catch (err) {
		console.error("Failed to list dashboards from Brand System API:", err);
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
