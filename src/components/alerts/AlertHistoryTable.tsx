/**
 * Alert History Table Component
 *
 * Browse and manage alert history with pagination, filtering, and quick actions.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAlertHistoryFn, acknowledgeAlertFn, resolveAlertFn } from "@/routes/api/alerts";
import { formatDistanceToNow, format } from "date-fns";
import { useState } from "react";

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

const stateStyles = {
	triggered: "bg-red-100 text-red-800",
	acknowledged: "bg-yellow-100 text-yellow-800",
	resolved: "bg-green-100 text-green-800",
};

export function AlertHistoryTable() {
	const queryClient = useQueryClient();
	const [filter, setFilter] = useState<"all" | "triggered" | "acknowledged" | "resolved">("all");
	const [pageSize, setPageSize] = useState(20);

	const { data, isLoading, error } = useQuery({
		queryKey: ["alerts-history-table"],
		queryFn: async () => {
			const response = await getAlertHistoryFn();
			return response.history as Alert[];
		},
		refetchInterval: 30000,
	});

	const acknowledgeMutation = useMutation({
		mutationFn: async (alertId: string) => {
			await acknowledgeAlertFn();
			return alertId;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["alerts-history-table"] });
		},
	});

	const resolveMutation = useMutation({
		mutationFn: async (alertId: string) => {
			await resolveAlertFn();
			return alertId;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["alerts-history-table"] });
		},
	});

	if (isLoading) {
		return <div className="text-center text-gray-500 py-8">Loading alerts...</div>;
	}

	if (error) {
		return (
			<div className="p-4 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
				Failed to load alert history
			</div>
		);
	}

	const alerts = data || [];
	const filteredAlerts =
		filter === "all" ? alerts : alerts.filter((a) => a.state === filter);
	const displayedAlerts = filteredAlerts.slice(0, pageSize);

	return (
		<div className="space-y-4">
			{/* Filter Bar */}
			<div className="flex items-center gap-2 flex-wrap">
				<span className="text-sm text-gray-600">Filter:</span>
				{(["all", "triggered", "acknowledged", "resolved"] as const).map((f) => (
					<button
						key={f}
						onClick={() => setFilter(f)}
						className={`px-3 py-1 text-sm rounded-full border transition-colors ${
							filter === f
								? "bg-blue-600 text-white border-blue-600"
								: "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
						}`}
					>
						{f.charAt(0).toUpperCase() + f.slice(1)}
						<span className="text-xs ml-1">
							({filteredAlerts.filter((a) => a.state === f || (f === "all")).length})
						</span>
					</button>
				))}
			</div>

			{/* Table */}
			<div className="overflow-x-auto border border-gray-200 rounded-lg">
				<table className="w-full text-sm">
					<thead className="bg-gray-50 border-b border-gray-200">
						<tr>
							<th className="px-4 py-3 text-left font-medium text-gray-700">
								Datasource
							</th>
							<th className="px-4 py-3 text-left font-medium text-gray-700">
								Message
							</th>
							<th className="px-4 py-3 text-left font-medium text-gray-700">
								State
							</th>
							<th className="px-4 py-3 text-left font-medium text-gray-700">
								Triggered
							</th>
							<th className="px-4 py-3 text-right font-medium text-gray-700">
								Actions
							</th>
						</tr>
					</thead>
					<tbody>
						{displayedAlerts.length === 0 ? (
							<tr>
								<td colSpan={5} className="px-4 py-8 text-center text-gray-500">
									No alerts found
								</td>
							</tr>
						) : (
							displayedAlerts.map((alert) => (
								<tr key={alert.id} className="border-b border-gray-200 hover:bg-gray-50">
									<td className="px-4 py-3 text-gray-900 font-medium">
										{alert.datasourceId}
									</td>
									<td className="px-4 py-3 text-gray-700 max-w-xs truncate">
										{alert.message || "Alert triggered"}
									</td>
									<td className="px-4 py-3">
										<span
											className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
												stateStyles[
													alert.state as keyof typeof stateStyles
												]
											}`}
										>
											{alert.state}
										</span>
									</td>
									<td className="px-4 py-3 text-gray-600 text-xs">
										<div>
											{format(alert.triggeredAt, "MMM dd, HH:mm")}
										</div>
										<div className="text-gray-500">
											{formatDistanceToNow(alert.triggeredAt, {
												addSuffix: true,
											})}
										</div>
									</td>
									<td className="px-4 py-3 text-right space-x-2">
										{alert.state === "triggered" && (
											<button
												onClick={() =>
													acknowledgeMutation.mutate(alert.id)
												}
												disabled={acknowledgeMutation.isPending}
												className="px-2 py-1 text-xs bg-yellow-600 hover:bg-yellow-700 text-white rounded disabled:bg-gray-400"
											>
												Ack
											</button>
										)}
										{alert.state !== "resolved" && (
											<button
												onClick={() =>
													resolveMutation.mutate(alert.id)
												}
												disabled={resolveMutation.isPending}
												className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded disabled:bg-gray-400"
											>
												Resolve
											</button>
										)}
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			{filteredAlerts.length > pageSize && (
				<div className="flex items-center justify-between">
					<p className="text-sm text-gray-600">
						Showing {displayedAlerts.length} of {filteredAlerts.length} alerts
					</p>
					<button
						onClick={() => setPageSize(pageSize + 20)}
						className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded text-gray-900"
					>
						Load More
					</button>
				</div>
			)}
		</div>
	);
}
