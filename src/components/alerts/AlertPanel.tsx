/**
 * Alert Panel Component
 *
 * Displays recent alerts with severity colors, states, and quick actions.
 * Used in dashboard HUD for at-a-glance alert status.
 */

import { useQuery } from "@tanstack/react-query";
import { getAlertHistoryFn } from "@/routes/api/alerts";
import { formatDistanceToNow } from "date-fns";

interface Alert {
	id: string;
	ruleId: string;
	datasourceId: string;
	state: "triggered" | "acknowledged" | "resolved";
	triggeredAt: number;
	acknowledgedAt?: number;
	acknowledgedBy?: string;
	message?: string;
	context?: Record<string, unknown>;
}

const severityColorMap = {
	critical: "bg-red-900 border-red-600 text-red-100",
	high: "bg-orange-900 border-orange-600 text-orange-100",
	medium: "bg-amber-900 border-amber-600 text-amber-100",
	low: "bg-green-900 border-green-600 text-green-100",
};

const stateColorMap = {
	triggered: "bg-red-500",
	acknowledged: "bg-yellow-500",
	resolved: "bg-green-500",
};

export function AlertPanel() {
	const { data, isLoading, error } = useQuery({
		queryKey: ["alerts-history"],
		queryFn: async () => {
			const response = await getAlertHistoryFn();
			return response.history as Alert[];
		},
		refetchInterval: 30000, // Refresh every 30 seconds
	});

	if (isLoading) {
		return (
			<div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
				<h3 className="text-sm font-semibold text-gray-300 mb-2">
					Alerts
				</h3>
				<div className="text-xs text-gray-500">Loading...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-gray-900 border border-red-700 rounded-lg p-4">
				<h3 className="text-sm font-semibold text-red-300 mb-2">
					Alerts (Error)
				</h3>
				<div className="text-xs text-red-500">Failed to load alerts</div>
			</div>
		);
	}

	const alerts = data || [];
	const triggeredCount = alerts.filter((a) => a.state === "triggered").length;
	const acknowledgedCount = alerts.filter(
		(a) => a.state === "acknowledged"
	).length;

	return (
		<div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-sm font-semibold text-gray-200">Alerts</h3>
				{triggeredCount > 0 && (
					<span className="inline-block px-2 py-1 text-xs font-bold text-white bg-red-600 rounded">
						{triggeredCount} Active
					</span>
				)}
			</div>

			{alerts.length === 0 ? (
				<div className="text-xs text-gray-500">No alerts</div>
			) : (
				<div className="space-y-2 max-h-96 overflow-y-auto">
					{alerts.slice(0, 5).map((alert) => (
						<AlertItem key={alert.id} alert={alert} />
					))}
					{alerts.length > 5 && (
						<div className="text-xs text-gray-500 pt-2 border-t border-gray-700">
							+{alerts.length - 5} more alerts
						</div>
					)}
				</div>
			)}

			<div className="mt-4 pt-4 border-t border-gray-700">
				<div className="grid grid-cols-3 gap-2 text-xs">
					<div>
						<div className="text-gray-500">Active</div>
						<div className="text-red-400 font-semibold">
							{triggeredCount}
						</div>
					</div>
					<div>
						<div className="text-gray-500">Acknowledged</div>
						<div className="text-yellow-400 font-semibold">
							{acknowledgedCount}
						</div>
					</div>
					<div>
						<div className="text-gray-500">Total</div>
						<div className="text-gray-300 font-semibold">
							{alerts.length}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function AlertItem({ alert }: { alert: Alert }) {
	const severity = extractSeverity(alert.message || "");
	const stateColor = stateColorMap[alert.state];
	const timeAgo = formatDistanceToNow(alert.triggeredAt, {
		addSuffix: true,
	});

	return (
		<div
			className={`border-l-4 pl-3 py-2 text-xs ${
				severityColorMap[severity as keyof typeof severityColorMap] ||
				"bg-gray-800 border-gray-600 text-gray-300"
			}`}
		>
			<div className="flex items-start justify-between mb-1">
				<span className="font-semibold truncate">
					{alert.datasourceId}
				</span>
				<span className={`inline-block w-2 h-2 rounded-full ${stateColor}`} />
			</div>
			<div className="text-gray-300 line-clamp-2">
				{alert.message || "Alert triggered"}
			</div>
			<div className="text-gray-400 mt-1">{timeAgo}</div>
		</div>
	);
}

function extractSeverity(
	message: string
): "critical" | "high" | "medium" | "low" {
	if (message.toLowerCase().includes("critical")) return "critical";
	if (message.toLowerCase().includes("high")) return "high";
	if (message.toLowerCase().includes("medium")) return "medium";
	return "low";
}
