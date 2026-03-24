import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { BrandsPortfolioView } from "../components/BrandsPortfolioView";
import { listAvailableDashboards } from "../server/config-loader";
import { fetchBrandDashboard } from "../server/datasources";
import type { DashboardYaml } from "../lib/dashboard-config";
import type { BriefingItem } from "../lib/briefing";

interface BrandDashboardData {
	config: DashboardYaml;
	items: BriefingItem[];
	error?: string;
}

export const Route = createFileRoute("/brands")({
	component: BrandsPortfolio,
	loader: async () => {
		// Get list of all available dashboards
		const dashboards = await listAvailableDashboards();

		// Fetch briefing items for each brand in parallel
		const brandResults = await Promise.allSettled(
			dashboards.map(async (dashboard) => {
				const result = await fetchBrandDashboard({
					data: { brandSlug: dashboard.brand, lastVisited: null },
				});
				return {
					config: result.config,
					items: result.items,
					error: result.error,
				} as BrandDashboardData;
			}),
		);

		// Collect successful results
		const brands: Array<BrandDashboardData & { slug: string }> = [];
		dashboards.forEach((dashboard, idx) => {
			const result = brandResults[idx];
			if (result.status === "fulfilled" && result.value.config) {
				brands.push({
					...result.value,
					slug: dashboard.brand,
				});
			}
		});

		return { brands };
	},
});

function BrandsPortfolio() {
	const loaderData = Route.useLoaderData();

	// Compute health metrics per brand
	const brandMetrics = useMemo(() => {
		return loaderData.brands.map((brand) => {
			const healthScore =
				(brand.items.length > 0 ? 80 : 40) +
				(brand.items.filter((i) => i.priority === "high").length > 0 ? 10 : 0) +
				(brand.items.length > 5 ? 10 : 0);

			return {
				...brand,
				healthScore: Math.min(100, healthScore),
				issueCount: brand.items.filter((i) => i.type === "issue").length,
				deployCount: brand.items.filter((i) => i.type === "deploy").length,
				revenueCount: brand.items.filter((i) => i.type === "revenue").length,
			};
		});
	}, [loaderData.brands]);

	return <BrandsPortfolioView brands={brandMetrics} />;
}
