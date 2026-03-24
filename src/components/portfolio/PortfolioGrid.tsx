import type { BriefingItem } from "../../lib/briefing";
import type { DashboardYaml } from "../../lib/dashboard-config";
import { BrandCard } from "./BrandCard";

interface BrandMetric {
	slug: string;
	config: DashboardYaml;
	items: BriefingItem[];
	healthScore: number;
	issueCount: number;
	deployCount: number;
	revenueCount: number;
}

interface PortfolioGridProps {
	brands: BrandMetric[];
	onNavigate: (slug: string) => void;
}

export function PortfolioGrid({ brands, onNavigate }: PortfolioGridProps) {
	const sortedBrands = [...brands].sort((a, b) => b.healthScore - a.healthScore);

	return (
		<div className="portfolio-grid">
			{sortedBrands.map((brand) => (
				<BrandCard
					key={brand.slug}
					brand={brand}
					onNavigate={onNavigate}
				/>
			))}
		</div>
	);
}
