import { getHealthColor } from "./HealthBadge";

interface PortfolioHeaderProps {
	totalBrands: number;
	avgHealth: number;
	totalItems: number;
}

export function PortfolioHeader({
	totalBrands,
	avgHealth,
	totalItems,
}: PortfolioHeaderProps) {
	return (
		<div className="portfolio-header">
			<div className="portfolio-title">Brands Portfolio</div>
			<div className="portfolio-stats">
				<div className="stat-item">
					<span className="stat-label">Total Brands:</span>
					<span className="stat-value">{totalBrands}</span>
				</div>
				<div className="stat-item">
					<span className="stat-label">Avg Health:</span>
					<span className="stat-value" style={{ color: getHealthColor(avgHealth) }}>
						{avgHealth}%
					</span>
				</div>
				<div className="stat-item">
					<span className="stat-label">Total Items:</span>
					<span className="stat-value">{totalItems}</span>
				</div>
			</div>
		</div>
	);
}
