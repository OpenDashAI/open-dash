/**
 * Alert Management — Rule evaluation and alert triggering
 */

import { detectAnomalies, detectThresholdViolation, type AnomalyAlert } from "./anomaly";
import type { DatasourceMetric } from "../db/queries";

export interface AlertRule {
	id: string;
	datasourceId: string;
	type: "anomaly" | "threshold";
	metric: "latency" | "errorRate" | "connectivity";
	threshold?: number;
	zScoreThreshold?: number;
	enabled: boolean;
	notifyChannels?: ("email" | "slack" | "dashboard")[];
	acknowledgeable: boolean;
}

export interface Alert {
	id: string;
	ruleId: string;
	datasourceId: string;
	severity: "low" | "medium" | "high" | "critical";
	message: string;
	value: number;
	timestamp: number;
	acknowledged: boolean;
	acknowledgedAt?: number;
	"acknowledged By"?: string;
	resolved: boolean;
	resolvedAt?: number;
}

/**
 * Evaluate all rules for a datasource
 */
export function evaluateRules(
	metric: DatasourceMetric,
	rules: AlertRule[]
): Alert[] {
	const alerts: Alert[] = [];
	const datasourceRules = rules.filter((r) => r.datasourceId === metric.id && r.enabled);

	for (const rule of datasourceRules) {
		const alert = evaluateRule(metric, rule);
		if (alert) {
			alerts.push(alert);
		}
	}

	return alerts;
}

/**
 * Evaluate a single rule
 */
function evaluateRule(metric: DatasourceMetric, rule: AlertRule): Alert | null {
	if (rule.type === "threshold") {
		const thresholds: Record<string, number | boolean> = {};

		if (rule.metric === "latency" && rule.threshold) {
			thresholds.maxLatency = rule.threshold;
		} else if (rule.metric === "errorRate" && rule.threshold) {
			thresholds.maxErrorRate = rule.threshold;
		} else if (rule.metric === "connectivity") {
			thresholds.minConnectivity = metric.connected ? 1 : 0;
		}

		const anomaly = detectThresholdViolation(metric, thresholds as any);
		if (anomaly) {
			return {
				id: `alert-${rule.id}-${Date.now()}`,
				ruleId: rule.id,
				datasourceId: metric.id,
				severity: anomaly.severity,
				message: anomaly.description,
				value: anomaly.value,
				timestamp: Date.now(),
				acknowledged: false,
				resolved: false,
			};
		}
	} else if (rule.type === "anomaly") {
		// For anomaly type, would need historical data
		// This is a simplified version - real implementation would fetch history
		const zThreshold = rule.zScoreThreshold || 3;
		// Would call detectAnomalies with historical data here
		// For now, return null
	}

	return null;
}

/**
 * Create default rules for a datasource
 */
export function createDefaultRules(datasourceId: string): AlertRule[] {
	return [
		{
			id: `${datasourceId}-latency-high`,
			datasourceId,
			type: "threshold",
			metric: "latency",
			threshold: 5000, // 5 seconds
			enabled: true,
			notifyChannels: ["dashboard"],
			acknowledgeable: true,
		},
		{
			id: `${datasourceId}-error-rate-high`,
			datasourceId,
			type: "threshold",
			metric: "errorRate",
			threshold: 0.5, // 50% errors
			enabled: true,
			notifyChannels: ["dashboard"],
			acknowledgeable: true,
		},
		{
			id: `${datasourceId}-disconnected`,
			datasourceId,
			type: "threshold",
			metric: "connectivity",
			enabled: true,
			notifyChannels: ["dashboard"],
			acknowledgeable: true,
		},
	];
}

/**
 * Format alert message for display
 */
export function formatAlertMessage(alert: Alert): string {
	let message = alert.message;
	if (alert.acknowledged) {
		const acknowledgedBy = alert["acknowledged By"] || "unknown";
		message += ` (acknowledged by ${acknowledgedBy})`;
	}
	if (alert.resolved) {
		message += " [RESOLVED]";
	}
	return message;
}

/**
 * Get alert color based on severity
 */
export function getSeverityColor(severity: string): string {
	switch (severity) {
		case "critical":
			return "#dc2626"; // red-600
		case "high":
			return "#ea580c"; // orange-600
		case "medium":
			return "#eab308"; // yellow-400
		case "low":
			return "#3b82f6"; // blue-500
		default:
			return "#6b7280"; // gray-500
	}
}
