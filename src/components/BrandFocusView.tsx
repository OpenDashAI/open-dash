import { useNavigate } from "@tanstack/react-router";
import type { DashboardYaml } from "../lib/dashboard-config";
import type { BriefingItem } from "../lib/briefing";
import type { DataSourceInfo } from "../server/datasources";
import { ConfigNotFound } from "./focus/ConfigNotFound";
import { BrandFocusHeader } from "./focus/BrandFocusHeader";
import { BrandFocusContent } from "./focus/BrandFocusContent";

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
				<style>{`
					.brand-focus {
						display: flex;
						flex-direction: column;
						height: 100%;
						background: var(--hud-bg);
						color: var(--hud-text);
						font-family: var(--font-mono);
						overflow-y: auto;
					}
				`}</style>
				<ConfigNotFound />
			</div>
		);
	}

	return (
		<div className="brand-focus">
			<style>{`
				.brand-focus {
					display: flex;
					flex-direction: column;
					height: 100%;
					background: var(--hud-bg);
					color: var(--hud-text);
					font-family: var(--font-mono);
					overflow-y: auto;
				}

				.brand-focus-header {
					padding: 2rem;
					border-bottom: 1px solid var(--hud-border);
					background: var(--hud-bg-dim);
					position: sticky;
					top: 0;
					z-index: 10;
				}

				.brand-focus-title {
					display: flex;
					align-items: center;
					gap: 1rem;
					margin-bottom: 1rem;
				}

				.back-button {
					padding: 0.5rem 1rem;
					background: var(--hud-accent-dim);
					color: var(--hud-accent);
					border: none;
					border-radius: 3px;
					cursor: pointer;
					font-family: var(--font-mono);
					font-size: 0.875rem;
					transition: all 0.2s;
				}

				.back-button:hover {
					background: var(--hud-accent);
					color: var(--hud-bg);
				}

				.brand-title {
					font-size: 2rem;
					font-weight: bold;
					color: var(--hud-text-bright);
					text-transform: capitalize;
				}

				.brand-info {
					display: grid;
					grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
					gap: 1.5rem;
					margin-top: 1rem;
				}

				.info-item {
					display: flex;
					flex-direction: column;
					gap: 0.25rem;
				}

				.info-label {
					font-size: 0.75rem;
					color: var(--hud-text-muted);
					text-transform: uppercase;
					letter-spacing: 0.05em;
				}

				.info-value {
					font-size: 0.95rem;
					color: var(--hud-text-bright);
					word-break: break-all;
				}

				.brand-focus-content {
					flex: 1;
					display: grid;
					grid-template-columns: 2fr 1fr;
					gap: 2rem;
					padding: 2rem;
					overflow-y: auto;
				}

				.items-section {
					display: flex;
					flex-direction: column;
					gap: 1.5rem;
				}

				.items-group {
					display: flex;
					flex-direction: column;
					gap: 0.75rem;
				}

				.group-title {
					font-size: 0.875rem;
					font-weight: bold;
					text-transform: uppercase;
					letter-spacing: 0.05em;
					color: var(--hud-accent);
					padding-bottom: 0.5rem;
					border-bottom: 1px solid var(--hud-border);
				}

				.sidebar {
					display: flex;
					flex-direction: column;
					gap: 2rem;
				}

				.sidebar-section {
					display: flex;
					flex-direction: column;
					gap: 0.75rem;
					padding: 1rem;
					border: 1px solid var(--hud-border);
					border-radius: 4px;
					background: var(--hud-bg-dim);
				}

				.section-title {
					font-size: 0.875rem;
					font-weight: bold;
					text-transform: uppercase;
					letter-spacing: 0.05em;
					color: var(--hud-accent);
					margin-bottom: 0.5rem;
				}

				.metric-row {
					display: flex;
					justify-content: space-between;
					font-size: 0.875rem;
					padding: 0.5rem 0;
					border-bottom: 1px solid var(--hud-border-muted);
				}

				.metric-row:last-child {
					border-bottom: none;
				}

				.metric-label {
					color: var(--hud-text-muted);
				}

				.metric-value {
					color: var(--hud-text-bright);
					font-weight: bold;
				}

				.source-item {
					display: flex;
					justify-content: space-between;
					align-items: center;
					padding: 0.75rem;
					background: var(--hud-bg);
					border: 1px solid var(--hud-border);
					border-radius: 3px;
					font-size: 0.875rem;
				}

				.source-name {
					color: var(--hud-text-bright);
					font-weight: 500;
				}

				.source-status {
					display: flex;
					align-items: center;
					gap: 0.5rem;
					font-size: 0.75rem;
				}

				.status-dot {
					width: 8px;
					height: 8px;
					border-radius: 50%;
					background: var(--hud-success);
				}

				.status-dot.disconnected {
					background: var(--hud-error);
				}

				.empty-items {
					padding: 2rem;
					text-align: center;
					color: var(--hud-text-muted);
				}

				@media (max-width: 1024px) {
					.brand-focus-content {
						grid-template-columns: 1fr;
					}
				}
			`}</style>

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
	);
}
