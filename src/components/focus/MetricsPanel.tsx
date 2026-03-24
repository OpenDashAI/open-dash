interface BrandMetrics {
	totalItems: number;
	issues: number;
	deploys: number;
	revenue: number;
	highPriority: number;
	alerts: number;
}

interface MetricsPanelProps {
	metrics: BrandMetrics;
}

export function MetricsPanel({ metrics }: MetricsPanelProps) {
	return (
		<div className="sidebar-section">
			<div className="section-title">Metrics</div>
			<div className="metric-row">
				<span className="metric-label">Issues</span>
				<span className="metric-value">{metrics.issues}</span>
			</div>
			<div className="metric-row">
				<span className="metric-label">Deploys</span>
				<span className="metric-value">{metrics.deploys}</span>
			</div>
			<div className="metric-row">
				<span className="metric-label">Revenue</span>
				<span className="metric-value">{metrics.revenue}</span>
			</div>
			<div className="metric-row">
				<span className="metric-label">Alerts</span>
				<span className="metric-value">{metrics.alerts}</span>
			</div>
		</div>
	);
}
