import type { DashboardYaml } from "../../lib/dashboard-config";

interface BrandFocusHeaderProps {
	config: DashboardYaml;
	totalItems: number;
	highPriority: number;
	onBack: () => void;
}

export function BrandFocusHeader({
	config,
	totalItems,
	highPriority,
	onBack,
}: BrandFocusHeaderProps) {
	return (
		<div className="brand-focus-header">
			<div className="brand-focus-title">
				<button className="back-button" onClick={onBack}>
					← Brands
				</button>
				<div className="brand-title">{config.brand}</div>
			</div>

			<div className="brand-info">
				{config.domain && (
					<div className="info-item">
						<div className="info-label">Domain</div>
						<div className="info-value">{config.domain}</div>
					</div>
				)}
				<div className="info-item">
					<div className="info-label">Sources</div>
					<div className="info-value">{config.sources.length}</div>
				</div>
				<div className="info-item">
					<div className="info-label">Total Items</div>
					<div className="info-value">{totalItems}</div>
				</div>
				<div className="info-item">
					<div className="info-label">High Priority</div>
					<div className="info-value" style={{ color: "var(--hud-warning)" }}>
						{highPriority}
					</div>
				</div>
			</div>
		</div>
	);
}
