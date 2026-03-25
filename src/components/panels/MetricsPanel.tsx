/**
 * Scram Jet Metrics Panel - Dashboard section for Scram Jet pipeline metrics
 *
 * Shows:
 * - Real-time metrics from Scram Jet pipelines
 * - Source labels (stripe, ga4, ads, meta, hubspot, etc.)
 * - Priority indicators (high, normal, low)
 * - Last update timestamp
 */

import { useEffect, useState } from "react";
import type { BriefingItemPriority } from "../../lib/briefing";

export interface ScramJetMetric {
	id: string;
	source: string;
	priority: "high" | "normal" | "low";
	category: string;
	title: string;
	detail: string;
	timestamp: number;
	created_at: number;
	metadata?: string;
}

export interface MetricsPanelProps {
	/**
	 * Maximum number of metrics to display
	 */
	limit?: number;

	/**
	 * Filter by source (optional)
	 */
	source?: string;

	/**
	 * Filter by priority (optional)
	 */
	priority?: "high" | "normal" | "low";

	/**
	 * Custom title
	 */
	title?: string;

	/**
	 * Auto-refresh interval in ms (0 = disabled)
	 */
	refreshInterval?: number;

	/**
	 * Called when metrics are updated
	 */
	onMetricsUpdate?: (metrics: ScramJetMetric[]) => void;
}

const PRIORITY_COLORS: Record<string, string> = {
	high: "border-l-red-500 bg-red-500/5",
	normal: "border-l-blue-500 bg-blue-500/5",
	low: "border-l-gray-500 bg-gray-500/5",
};

const PRIORITY_TEXT: Record<string, string> = {
	high: "text-red-600",
	normal: "text-blue-600",
	low: "text-gray-600",
};

const SOURCE_COLORS: Record<string, string> = {
	stripe: "bg-purple-100 text-purple-700",
	ga4: "bg-orange-100 text-orange-700",
	ads: "bg-blue-100 text-blue-700",
	meta: "bg-indigo-100 text-indigo-700",
	hubspot: "bg-green-100 text-green-700",
	shopify: "bg-emerald-100 text-emerald-700",
	slack: "bg-pink-100 text-pink-700",
	default: "bg-gray-100 text-gray-700",
};

function getSourceColor(source: string): string {
	return SOURCE_COLORS[source.toLowerCase()] || SOURCE_COLORS.default;
}

export function MetricsPanel({
	limit = 10,
	source,
	priority,
	title = "Scram Jet Metrics",
	refreshInterval = 30000, // 30s default
	onMetricsUpdate,
}: MetricsPanelProps) {
	const [metrics, setMetrics] = useState<ScramJetMetric[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

	const fetchMetrics = async () => {
		try {
			setLoading(true);
			setError(null);

			// Build query string
			const params = new URLSearchParams();
			params.append("limit", limit.toString());
			if (source) params.append("source", source);
			if (priority) params.append("priority", priority);

			const response = await fetch(`/api/metrics?${params.toString()}`);

			if (!response.ok) {
				throw new Error(`Failed to fetch metrics: ${response.statusText}`);
			}

			const data = await response.json();

			if (data.success && Array.isArray(data.metrics)) {
				setMetrics(data.metrics);
				setLastRefresh(new Date());
				onMetricsUpdate?.(data.metrics);
			} else {
				setMetrics([]);
			}
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to fetch metrics"
			);
			console.error("Metrics fetch error:", err);
		} finally {
			setLoading(false);
		}
	};

	// Fetch on mount
	useEffect(() => {
		fetchMetrics();
	}, [limit, source, priority]);

	// Set up auto-refresh
	useEffect(() => {
		if (refreshInterval <= 0) return;

		const interval = setInterval(() => {
			fetchMetrics();
		}, refreshInterval);

		return () => clearInterval(interval);
	}, [refreshInterval, limit, source, priority]);

	if (error) {
		return (
			<div className="rounded-lg border border-red-200 bg-red-50 p-4">
				<p className="font-semibold text-red-900">{title}</p>
				<p className="text-sm text-red-700 mt-2">{error}</p>
				<button
					onClick={fetchMetrics}
					className="mt-3 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
				>
					Retry
				</button>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4">
			<div className="flex items-center justify-between">
				<h3 className="font-semibold text-gray-900">{title}</h3>
				<div className="flex items-center gap-2 text-xs text-gray-500">
					{loading && <span className="animate-pulse">Loading...</span>}
					{!loading && lastRefresh && (
						<>
							<span>
								Last refresh:{" "}
								{lastRefresh.toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit",
									second: "2-digit",
								})}
							</span>
							<button
								onClick={fetchMetrics}
								className="px-2 py-0.5 hover:bg-gray-100 rounded transition-colors"
								title="Refresh metrics"
							>
								↻
							</button>
						</>
					)}
				</div>
			</div>

			{metrics.length === 0 ? (
				<div className="text-center py-6 text-gray-500">
					<p className="text-sm">No metrics available</p>
					<p className="text-xs mt-1">
						Waiting for Scram Jet pipelines to report data...
					</p>
				</div>
			) : (
				<div className="space-y-2 max-h-96 overflow-y-auto">
					{metrics.map((metric) => (
						<div
							key={metric.id}
							className={`rounded border-l-4 p-3 transition-colors ${
								PRIORITY_COLORS[metric.priority] || PRIORITY_COLORS.normal
							}`}
						>
							<div className="flex items-start justify-between gap-2 mb-1">
								<h4 className="font-semibold text-sm text-gray-900">
									{metric.title}
								</h4>
								<div className="flex items-center gap-2">
									<span
										className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSourceColor(
											metric.source
										)}`}
									>
										{metric.source.toUpperCase()}
									</span>
									<span
										className={`px-2 py-0.5 rounded text-xs font-semibold ${
											PRIORITY_TEXT[metric.priority] || PRIORITY_TEXT.normal
										}`}
									>
										{metric.priority}
									</span>
								</div>
							</div>

							<p className="text-xs text-gray-700 mb-2">{metric.detail}</p>

							<div className="flex items-center justify-between text-xs text-gray-500">
								<span>{metric.category}</span>
								<span>
									{new Date(metric.created_at).toLocaleTimeString([], {
										hour: "2-digit",
										minute: "2-digit",
										second: "2-digit",
									})}
								</span>
							</div>

							{metric.metadata && (
								<details className="text-xs text-gray-600 mt-2 cursor-pointer">
									<summary className="hover:text-gray-900">Details</summary>
									<pre className="mt-1 bg-gray-100 rounded p-2 overflow-auto text-xs">
										{JSON.stringify(
											(() => {
												try {
													return JSON.parse(metric.metadata || "{}");
												} catch {
													return metric.metadata;
												}
											})(),
											null,
											2
										)}
									</pre>
								</details>
							)}
						</div>
					))}
				</div>
			)}

			<div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
				Showing {metrics.length} metric{metrics.length !== 1 ? "s" : ""}
				{limit && ` (limit: ${limit})`}
			</div>
		</div>
	);
}
