import { useNavigate } from "@tanstack/react-router";
import "../styles/brands.css";
import "../styles/errors.css";
import type { DashboardYaml } from "../lib/dashboard-config";
import type { BriefingItem } from "../lib/briefing";
import { PortfolioHeader } from "./portfolio/PortfolioHeader";
import { PortfolioGrid } from "./portfolio/PortfolioGrid";
import { EmptyState } from "./portfolio/EmptyState";
import { DashboardErrorBoundary } from "./error/DashboardErrorBoundary";

interface BrandMetric {
	slug: string;
	config: DashboardYaml;
	items: BriefingItem[];
	healthScore: number;
	issueCount: number;
	deployCount: number;
	revenueCount: number;
}

interface BrandsPortfolioViewProps {
	brands: BrandMetric[];
}

export function BrandsPortfolioView({ brands }: BrandsPortfolioViewProps) {
	const navigate = useNavigate({ from: "/brands" });

	const avgHealth =
		brands.length > 0
			? Math.round(brands.reduce((sum, b) => sum + b.healthScore, 0) / brands.length)
			: 0;

	const totalItems = brands.reduce((sum, b) => sum + b.items.length, 0);

	return (
		<DashboardErrorBoundary>
			<div className="brands-portfolio">
				<PortfolioHeader
					totalBrands={brands.length}
					avgHealth={avgHealth}
					totalItems={totalItems}
				/>

				{brands.length === 0 ? (
					<EmptyState />
				) : (
					<PortfolioGrid
						brands={brands}
						onNavigate={(slug) =>
							navigate({ to: "/brands/$slug", params: { slug } })
						}
					/>
				)}
			</div>
		</DashboardErrorBoundary>
	);
}
