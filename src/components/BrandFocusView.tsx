import { useNavigate } from "@tanstack/react-router";
import "../styles/brands.css";
import "../styles/errors.css";
import "../styles/monitoring.css";
import type { DashboardYaml } from "../lib/dashboard-config";
import type { BriefingItem } from "../lib/briefing";
import type { DataSourceInfo } from "../server/datasources";
import { ConfigNotFound } from "./focus/ConfigNotFound";
import { BrandFocusHeader } from "./focus/BrandFocusHeader";
import { BrandFocusContent } from "./focus/BrandFocusContent";
import { DashboardErrorBoundary } from "./error/DashboardErrorBoundary";

interface BrandMetrics {
	totalItems: number;
	issues: number;
	deploys: number;
	revenue: number;
	highPriority: number;
	alerts: number;
}

interface BrandFocusViewProps {
	config: DashboardYaml | null;
	items: BriefingItem[];
	sources: DataSourceInfo[];
	metrics: BrandMetrics;
}

export function BrandFocusView({
	config,
	items,
	sources,
	metrics,
}: BrandFocusViewProps) {
	const navigate = useNavigate({ from: "/brands/$slug" });

	if (!config) {
		return (
			<div className="brand-focus">
				<ConfigNotFound />
			</div>
		);
	}

	return (
		<DashboardErrorBoundary>
			<div className="brand-focus">
				<BrandFocusHeader
					config={config}
					totalItems={metrics.totalItems}
					highPriority={metrics.highPriority}
					onBack={() => navigate({ to: "/brands" })}
				/>

				<BrandFocusContent
					items={items}
					sources={sources}
					metrics={metrics}
				/>
			</div>
		</DashboardErrorBoundary>
	);
}
