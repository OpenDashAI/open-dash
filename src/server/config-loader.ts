/**
 * Configuration loader for dashboard.yaml files
 * Loads from Brand System API (works in Cloudflare Workers)
 * Caches in memory for performance
 */

import type { DashboardYaml } from "../lib/dashboard-config";
import {
	parseDashboardYaml,
	validateDashboardYaml,
} from "../lib/dashboard-config";

/**
 * In-memory cache for dashboard configs
 * Maps brand slug → DashboardYaml
 */
const configCache = new Map<string, DashboardYaml>();

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
 * Load dashboard config for a brand
 * Uses Brand System API (Worker-compatible)
 */
export async function loadDashboardConfig(brandSlug: string): Promise<DashboardYaml | null> {
	// Check cache first
	if (configCache.has(brandSlug)) {
		return configCache.get(brandSlug)!;
	}

	// Load from Brand System API
	const apiUrl = process.env.BRAND_SYSTEM_API_URL;
	const config = await loadDashboardYamlFromApi(brandSlug, apiUrl);

	// Cache if found
	if (config) {
		configCache.set(brandSlug, config);
	}

	return config;
}

/**
 * List all available dashboard configs
 * Uses Brand System API (Worker-compatible)
 */
export async function listAvailableDashboards(): Promise<DashboardYaml[]> {
	const dashboards: DashboardYaml[] = [];

	// Load from Brand System API
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
}

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
