import type { DataSourceInfo } from "../../server/datasources";
import { SourcesMonitor } from "./SourcesMonitor";

interface SourcesPanelProps {
	sources: DataSourceInfo[];
}

export function SourcesPanel({ sources }: SourcesPanelProps) {
	return (
		<div className="sidebar-section">
			<div className="section-title">Data Sources</div>
			<SourcesMonitor sources={sources} />
		</div>
	);
}
