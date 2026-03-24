import type { BriefingItem } from "../../lib/briefing";
import type { DataSourceInfo } from "../../server/datasources";
import { ItemsSection } from "./ItemsSection";
import { Sidebar } from "./Sidebar";
import { MetricsPanel } from "./MetricsPanel";
import { SourcesPanel } from "./SourcesPanel";

interface BrandMetrics {
	totalItems: number;
	issues: number;
	deploys: number;
	revenue: number;
	highPriority: number;
	alerts: number;
}

interface BrandFocusContentProps {
	items: BriefingItem[];
	sources: DataSourceInfo[];
	metrics: BrandMetrics;
}

export function BrandFocusContent({
	items,
	sources,
	metrics,
}: BrandFocusContentProps) {
	return (
		<div className="brand-focus-content">
			<ItemsSection items={items} />
			<Sidebar>
				<MetricsPanel metrics={metrics} />
				<SourcesPanel sources={sources} />
			</Sidebar>
		</div>
	);
}
