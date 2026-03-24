export function EmptyState() {
	return (
		<div className="empty-state">
			<div className="empty-icon">📊</div>
			<div>No dashboards configured</div>
			<div style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
				Add a dashboard.yaml to the configs/ directory to get started
			</div>
		</div>
	);
}
