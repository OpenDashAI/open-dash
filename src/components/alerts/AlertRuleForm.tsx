/**
 * Alert Rule Form Component
 *
 * Create and edit alert rules with threshold and notification channel selection.
 */

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createAlertRuleFn, updateAlertRuleFn } from "@/routes/api/alerts";

interface AlertRuleFormProps {
	datasourceId: string;
	datasourceName?: string;
	onSuccess?: () => void;
	existingRule?: {
		id: string;
		datasourceId: string;
		ruleType: "latency" | "error_rate" | "downtime" | "sla";
		threshold: number;
		alertChannels: string[];
		enabled: boolean;
		cooldownSeconds?: number;
	};
}

const ruleTypeDescriptions = {
	latency:
		"Alert when response time exceeds threshold (milliseconds, e.g., 5000 for 5 seconds)",
	error_rate:
		"Alert when error rate exceeds threshold (0-1, e.g., 0.1 for 10%)",
	downtime:
		"Alert when service is down for longer than threshold (minutes, e.g., 5)",
	sla: "Alert when SLA drops below threshold (percentage, e.g., 0.99 for 99%)",
};

export function AlertRuleForm({
	datasourceId,
	datasourceName,
	onSuccess,
	existingRule,
}: AlertRuleFormProps) {
	const [ruleType, setRuleType] = useState<
		"latency" | "error_rate" | "downtime" | "sla"
	>(existingRule?.ruleType || "latency");
	const [threshold, setThreshold] = useState(
		existingRule?.threshold || 5000
	);
	const [channels, setChannels] = useState<string[]>(
		existingRule?.alertChannels || ["inapp"]
	);
	const [cooldownSeconds, setCooldownSeconds] = useState(
		existingRule?.cooldownSeconds || 3600
	);
	const [enabled, setEnabled] = useState(existingRule?.enabled !== false);

	const createMutation = useMutation({
		mutationFn: async () => {
			const response = await createAlertRuleFn(new Request("", {}));
			return response;
		},
		onSuccess: () => {
			onSuccess?.();
		},
	});

	const updateMutation = useMutation({
		mutationFn: async () => {
			if (!existingRule) throw new Error("No rule to update");
			const response = await updateAlertRuleFn(new Request("", {}));
			return response;
		},
		onSuccess: () => {
			onSuccess?.();
		},
	});

	const isLoading =
		createMutation.isPending || updateMutation.isPending;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (existingRule) {
			await updateMutation.mutateAsync();
		} else {
			await createMutation.mutateAsync();
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{/* Datasource Info */}
			<div>
				<label className="block text-sm font-medium text-gray-300 mb-1">
					Datasource
				</label>
				<input
					type="text"
					value={datasourceName || datasourceId}
					disabled
					className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-gray-400 text-sm"
				/>
			</div>

			{/* Rule Type */}
			<div>
				<label className="block text-sm font-medium text-gray-300 mb-1">
					Alert Type
				</label>
				<select
					value={ruleType}
					onChange={(e) =>
						setRuleType(
							e.target.value as
								| "latency"
								| "error_rate"
								| "downtime"
								| "sla"
						)
					}
					className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-gray-200 text-sm"
				>
					<option value="latency">High Latency</option>
					<option value="error_rate">High Error Rate</option>
					<option value="downtime">Extended Downtime</option>
					<option value="sla">SLA Breach</option>
				</select>
				<p className="text-xs text-gray-500 mt-1">
					{
						ruleTypeDescriptions[
							ruleType as keyof typeof ruleTypeDescriptions
						]
					}
				</p>
			</div>

			{/* Threshold */}
			<div>
				<label className="block text-sm font-medium text-gray-300 mb-1">
					Threshold Value
				</label>
				<input
					type="number"
					value={threshold}
					onChange={(e) => setThreshold(Number(e.target.value))}
					step={ruleType === "error_rate" || ruleType === "sla" ? "0.01" : "1"}
					min="0"
					className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-gray-200 text-sm"
					placeholder="e.g., 5000"
				/>
				<p className="text-xs text-gray-500 mt-1">
					Alert triggers when metric exceeds this value
				</p>
			</div>

			{/* Notification Channels */}
			<div>
				<label className="block text-sm font-medium text-gray-300 mb-2">
					Notification Channels
				</label>
				<div className="space-y-2">
					{["inapp", "email", "slack", "webhook"].map((channel) => (
						<label
							key={channel}
							className="flex items-center text-sm text-gray-300"
						>
							<input
								type="checkbox"
								checked={channels.includes(channel)}
								onChange={(e) => {
									if (e.target.checked) {
										setChannels([...channels, channel]);
									} else {
										setChannels(
											channels.filter((c) => c !== channel)
										);
									}
								}}
								className="mr-2 rounded"
							/>
							<span className="capitalize">{channel}</span>
							<span className="text-xs text-gray-500 ml-2">
								{channel === "inapp"
									? "(Dashboard)"
									: channel === "email"
										? "(Email)"
										: channel === "slack"
											? "(Slack Webhook)"
											: "(Custom Endpoint)"}
							</span>
						</label>
					))}
				</div>
			</div>

			{/* Cooldown Period */}
			<div>
				<label className="block text-sm font-medium text-gray-300 mb-1">
					Cooldown Period (seconds)
				</label>
				<input
					type="number"
					value={cooldownSeconds}
					onChange={(e) => setCooldownSeconds(Number(e.target.value))}
					min="60"
					step="60"
					className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-gray-200 text-sm"
					placeholder="3600"
				/>
				<p className="text-xs text-gray-500 mt-1">
					Prevent duplicate alerts within this time window
				</p>
			</div>

			{/* Enabled Toggle */}
			<div className="flex items-center">
				<label className="flex items-center text-sm text-gray-300">
					<input
						type="checkbox"
						checked={enabled}
						onChange={(e) => setEnabled(e.target.checked)}
						className="mr-2 rounded"
					/>
					Enabled
				</label>
			</div>

			{/* Error Message */}
			{(createMutation.error || updateMutation.error) && (
				<div className="p-3 bg-red-900 border border-red-600 rounded text-sm text-red-100">
					{(createMutation.error || updateMutation.error)?.message ||
						"Failed to save rule"}
				</div>
			)}

			{/* Submit Button */}
			<button
				type="submit"
				disabled={isLoading || channels.length === 0}
				className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm font-medium rounded"
			>
				{isLoading
					? "Saving..."
					: existingRule
						? "Update Rule"
						: "Create Rule"}
			</button>
		</form>
	);
}
