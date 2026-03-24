import { useNavigate } from "@tanstack/react-router";
import type { DashboardYaml } from "../lib/dashboard-config";
import type { BriefingItem } from "../lib/briefing";
import { PortfolioHeader } from "./portfolio/PortfolioHeader";
import { PortfolioGrid } from "./portfolio/PortfolioGrid";
import { EmptyState } from "./portfolio/EmptyState";

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
	);
}
