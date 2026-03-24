import { useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { BriefingCard } from "./cards/BriefingCard";
import type { DashboardYaml } from "../lib/dashboard-config";
import type { BriefingItem } from "../lib/briefing";
import type { DataSourceInfo } from "../server/datasources";

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

	// Group items by type
	const groupedItems = useMemo(() => {
		const groups: Record<string, BriefingItem[]> = {};
		items.forEach((item) => {
			if (!groups[item.type]) groups[item.type] = [];
			groups[item.type].push(item);
		});
		return groups;
	}, [items]);

	const highPriorityItems = useMemo(
		() => items.filter((i) => i.priority === "high"),
		[items]
	);

	if (!config) {
		return (
			<div
				className="brand-focus"
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					height: "100%",
					color: "var(--hud-text-muted)",
				}}
			>
				<div style={{ textAlign: "center" }}>
					<div style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>⚠️</div>
					<div>Brand configuration not found</div>
				</div>
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

			<div className="brand-focus-header">
				<div className="brand-focus-title">
					<button className="back-button" onClick={() => navigate({ to: "/brands" })}>
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
						<div className="info-value">{metrics.totalItems}</div>
					</div>
					<div className="info-item">
						<div className="info-label">High Priority</div>
						<div className="info-value" style={{ color: "var(--hud-warning)" }}>
							{metrics.highPriority}
						</div>
					</div>
				</div>
			</div>

			<div className="brand-focus-content">
				<div className="items-section">
					{highPriorityItems.length > 0 && (
						<div className="items-group">
							<div className="group-title">⚠️ High Priority</div>
							{highPriorityItems.map((item) => (
								<BriefingCard key={item.id} item={item} />
							))}
						</div>
					)}

					{Object.entries(groupedItems).map(([type, typeItems]) => (
						<div key={type} className="items-group">
							<div className="group-title">{type}</div>
							{typeItems.slice(0, 5).map((item) => (
								<BriefingCard key={item.id} item={item} />
							))}
							{typeItems.length > 5 && (
								<div style={{ fontSize: "0.75rem", color: "var(--hud-text-muted)" }}>
									+{typeItems.length - 5} more {type}
									{typeItems.length - 5 !== 1 ? "s" : ""}
								</div>
							)}
						</div>
					))}

					{items.length === 0 && (
						<div className="empty-items">
							<div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✓</div>
							<div>No items to display</div>
						</div>
					)}
				</div>

				<div className="sidebar">
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
				</div>
			</div>
		</div>
	);
}
