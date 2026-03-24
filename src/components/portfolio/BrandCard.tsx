import type { DashboardYaml } from "../../lib/dashboard-config";
import type { BriefingItem } from "../../lib/briefing";
import { HealthBadge } from "./HealthBadge";

interface BrandMetric {
	slug: string;
	config: DashboardYaml;
	items: BriefingItem[];
	healthScore: number;
	issueCount: number;
	deployCount: number;
	revenueCount: number;
}

interface BrandCardProps {
	brand: BrandMetric;
	onNavigate: (slug: string) => void;
}

export function BrandCard({ brand, onNavigate }: BrandCardProps) {
	return (
		<div className="brand-card" onClick={() => onNavigate(brand.slug)}>
			<div className="brand-card-header">
				<div className="brand-name">{brand.config.brand}</div>
				<HealthBadge score={brand.healthScore} />
			</div>

			{brand.config.domain && <div className="brand-domain">{brand.config.domain}</div>}

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
					{brand.config.sources.length} source{brand.config.sources.length !== 1 ? "s" : ""}
				</span>
				<span style={{ color: "var(--hud-accent)" }}>View →</span>
			</div>
		</div>
	);
}
