import type { DataSourceInfo } from "../../server/datasources";

interface SourcesPanelProps {
	sources: DataSourceInfo[];
}

export function SourcesPanel({ sources }: SourcesPanelProps) {
	return (
		<div className="sidebar-section">
			<div className="section-title">Data Sources</div>
			{sources.map((source) => (
				<div key={source.id} className="source-item">
					<span className="source-name">{source.name}</span>
					<div className="source-status">
						<div
							className={`status-dot ${
								source.status.connected ? "" : "disconnected"
							}`}
						/>
						<span>{source.status.connected ? "Connected" : "Offline"}</span>
					</div>
				</div>
			))}
		</div>
	);
}
