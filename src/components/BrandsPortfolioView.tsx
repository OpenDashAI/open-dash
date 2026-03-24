import { useNavigate } from "@tanstack/react-router";
import type { DashboardYaml } from "../lib/dashboard-config";
import type { BriefingItem } from "../lib/briefing";

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

function getHealthColor(score: number): string {
	if (score >= 80) return "var(--hud-success)";
	if (score >= 60) return "var(--hud-warning)";
	return "var(--hud-error)";
}

function getHealthLabel(score: number): string {
	if (score >= 80) return "Healthy";
	if (score >= 60) return "Degraded";
	return "Critical";
}

export function BrandsPortfolioView({ brands }: BrandsPortfolioViewProps) {
	const navigate = useNavigate({ from: "/brands" });

	const sortedBrands = [...brands].sort((a, b) => b.healthScore - a.healthScore);
	const avgHealth =
		brands.length > 0
			? Math.round(brands.reduce((sum, b) => sum + b.healthScore, 0) / brands.length)
			: 0;

	return (
		<div className="brands-portfolio">
			<style>{`
				.brands-portfolio {
					display: flex;
					flex-direction: column;
					height: 100vh;
					background: var(--hud-bg);
					color: var(--hud-text);
					font-family: var(--font-mono);
					overflow: auto;
				}

				.portfolio-header {
					padding: 2rem;
					border-bottom: 1px solid var(--hud-border);
					background: var(--hud-bg-dim);
				}

				.portfolio-title {
					font-size: 2rem;
					font-weight: bold;
					margin-bottom: 0.5rem;
					color: var(--hud-text-bright);
				}

				.portfolio-stats {
					display: flex;
					gap: 2rem;
					margin-top: 1rem;
					font-size: 0.875rem;
					color: var(--hud-text-muted);
				}

				.stat-item {
					display: flex;
					gap: 0.5rem;
				}

				.stat-label {
					color: var(--hud-text-muted);
				}

				.stat-value {
					color: var(--hud-text-bright);
					font-weight: bold;
				}

				.portfolio-grid {
					display: grid;
					grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
					gap: 1.5rem;
					padding: 2rem;
					overflow-y: auto;
				}

				.brand-card {
					border: 1px solid var(--hud-border);
					border-radius: 4px;
					padding: 1.5rem;
					background: var(--hud-bg-dim);
					cursor: pointer;
					transition: all 0.2s;
				}

				.brand-card:hover {
					border-color: var(--hud-accent);
					background: var(--hud-bg);
					box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
				}

				.brand-card-header {
					display: flex;
					justify-content: space-between;
					align-items: flex-start;
					margin-bottom: 1rem;
				}

				.brand-name {
					font-size: 1.125rem;
					font-weight: bold;
					color: var(--hud-text-bright);
					text-transform: capitalize;
				}

				.health-badge {
					display: flex;
					align-items: center;
					gap: 0.5rem;
					padding: 0.25rem 0.75rem;
					border-radius: 3px;
					font-size: 0.75rem;
					font-weight: bold;
					text-transform: uppercase;
					letter-spacing: 0.05em;
					border: 1px solid;
				}

				.health-dot {
					width: 8px;
					height: 8px;
					border-radius: 50%;
				}

				.brand-domain {
					font-size: 0.875rem;
					color: var(--hud-text-muted);
					margin-bottom: 1rem;
					word-break: break-all;
				}

				.brand-description {
					font-size: 0.875rem;
					color: var(--hud-text-muted);
					margin-bottom: 1.5rem;
					max-height: 3em;
					overflow: hidden;
					text-overflow: ellipsis;
					display: -webkit-box;
					-webkit-line-clamp: 2;
					-webkit-box-orient: vertical;
				}

				.brand-metrics {
					display: grid;
					grid-template-columns: 1fr 1fr;
					gap: 1rem;
					margin-bottom: 1rem;
					padding-bottom: 1rem;
					border-bottom: 1px solid var(--hud-border);
				}

				.metric {
					display: flex;
					flex-direction: column;
				}

				.metric-label {
					font-size: 0.75rem;
					color: var(--hud-text-muted);
					text-transform: uppercase;
					letter-spacing: 0.05em;
					margin-bottom: 0.25rem;
				}

				.metric-value {
					font-size: 1.5rem;
					font-weight: bold;
					color: var(--hud-text-bright);
				}

				.brand-footer {
					display: flex;
					gap: 0.5rem;
					justify-content: space-between;
					font-size: 0.75rem;
				}

				.source-badge {
					padding: 0.25rem 0.5rem;
					background: var(--hud-accent-dim);
					color: var(--hud-accent);
					border-radius: 2px;
					text-transform: uppercase;
					letter-spacing: 0.02em;
				}

				.empty-state {
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					height: 100%;
					color: var(--hud-text-muted);
				}

				.empty-icon {
					font-size: 3rem;
					margin-bottom: 1rem;
					opacity: 0.5;
				}
			`}</style>

			<div className="portfolio-header">
				<div className="portfolio-title">Brands Portfolio</div>
				<div className="portfolio-stats">
					<div className="stat-item">
						<span className="stat-label">Total Brands:</span>
						<span className="stat-value">{brands.length}</span>
					</div>
					<div className="stat-item">
						<span className="stat-label">Avg Health:</span>
						<span className="stat-value" style={{ color: getHealthColor(avgHealth) }}>
							{avgHealth}%
						</span>
					</div>
					<div className="stat-item">
						<span className="stat-label">Total Items:</span>
						<span className="stat-value">
							{brands.reduce((sum, b) => sum + b.items.length, 0)}
						</span>
					</div>
				</div>
			</div>

			{brands.length === 0 ? (
				<div className="empty-state">
					<div className="empty-icon">📊</div>
					<div>No dashboards configured</div>
					<div style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
						Add a dashboard.yaml to the configs/ directory to get started
					</div>
				</div>
			) : (
				<div className="portfolio-grid">
					{sortedBrands.map((brand) => (
						<div
							key={brand.slug}
							className="brand-card"
							onClick={() =>
								navigate({ to: "/brands/$slug", params: { slug: brand.slug } })
							}
						>
							<div className="brand-card-header">
								<div className="brand-name">{brand.config.brand}</div>
								<div
									className="health-badge"
									style={{
										color: getHealthColor(brand.healthScore),
										borderColor: getHealthColor(brand.healthScore),
										backgroundColor: `${getHealthColor(brand.healthScore)}15`,
									}}
								>
									<div
										className="health-dot"
										style={{ backgroundColor: getHealthColor(brand.healthScore) }}
									/>
									{brand.healthScore}%
								</div>
							</div>

							{brand.config.domain && (
								<div className="brand-domain">{brand.config.domain}</div>
							)}

							{brand.config.description && (
								<div className="brand-description">{brand.config.description}</div>
							)}

							<div className="brand-metrics">
								<div className="metric">
									<div className="metric-label">Issues</div>
									<div className="metric-value">{brand.issueCount}</div>
								</div>
								<div className="metric">
									<div className="metric-label">Deploys</div>
									<div className="metric-value">{brand.deployCount}</div>
								</div>
								<div className="metric">
									<div className="metric-label">Revenue Events</div>
									<div className="metric-value">{brand.revenueCount}</div>
								</div>
								<div className="metric">
									<div className="metric-label">Total Items</div>
									<div className="metric-value">{brand.items.length}</div>
								</div>
							</div>

							<div className="brand-footer">
								<span style={{ color: "var(--hud-text-muted)" }}>
									{brand.config.sources.length} source
									{brand.config.sources.length !== 1 ? "s" : ""}
								</span>
								<span style={{ color: "var(--hud-accent)" }}>View →</span>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
