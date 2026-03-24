/**
 * Alert Notification Service
 *
 * Sends alerts to multiple channels:
 * - Email (via Resend)
 * - Slack (via Slack API or webhook)
 * - Webhooks (custom)
 * - In-app (stored in database)
 */

import type { Alert, AlertRule } from "@/lib/analytics/alerts";
import { getEmailService } from "./email-service";

export interface AlertNotificationConfig {
	channels: AlertChannel[];
	slackWebhookUrl?: string;
	webhookUrls?: string[];
}

export type AlertChannel = "email" | "slack" | "webhook" | "inapp";

export interface NotificationResult {
	channel: AlertChannel;
	success: boolean;
	error?: string;
	timestamp: number;
}

/**
 * Send alert through email
 */
async function sendEmailAlert(
	alertMessage: {
		severity: "critical" | "high" | "medium" | "low";
		datasource: string;
		message: string;
		value: number;
	},
	recipientEmail: string
): Promise<NotificationResult> {
	try {
		const emailService = getEmailService();
		const result = await emailService.sendAlertEmail(
			recipientEmail,
			alertMessage.severity,
			alertMessage.datasource,
			alertMessage.message,
			alertMessage.value
		);

		return {
			channel: "email",
			success: result.success,
			error: result.error,
			timestamp: Date.now(),
		};
	} catch (err) {
		return {
			channel: "email",
			success: false,
			error: err instanceof Error ? err.message : "Unknown error",
			timestamp: Date.now(),
		};
	}
}

/**
 * Send alert through Slack
 */
async function sendSlackAlert(
	alertMessage: {
		severity: string;
		datasource: string;
		message: string;
		value: number;
	},
	slackWebhookUrl: string
): Promise<NotificationResult> {
	try {
		const colorMap = {
			critical: "#dc2626",
			high: "#ea580c",
			medium: "#f59e0b",
			low: "#10b981",
		};

		const payload = {
			attachments: [
				{
					color: colorMap[alertMessage.severity as keyof typeof colorMap] || "#6366f1",
					title: `${alertMessage.severity.toUpperCase()} Alert`,
					text: alertMessage.message,
					fields: [
						{
							title: "Datasource",
							value: alertMessage.datasource,
							short: true,
						},
						{
							title: "Value",
							value: alertMessage.value.toFixed(2),
							short: true,
						},
						{
							title: "Time",
							value: new Date().toLocaleString(),
							short: false,
						},
					],
					footer: "OpenDash Alerts",
					ts: Math.floor(Date.now() / 1000),
				},
			],
		};

		const response = await fetch(slackWebhookUrl, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			return {
				channel: "slack",
				success: false,
				error: `HTTP ${response.status}`,
				timestamp: Date.now(),
			};
		}

		return {
			channel: "slack",
			success: true,
			timestamp: Date.now(),
		};
	} catch (err) {
		return {
			channel: "slack",
			success: false,
			error: err instanceof Error ? err.message : "Unknown error",
			timestamp: Date.now(),
		};
	}
}

/**
 * Send alert through custom webhook
 */
async function sendWebhookAlert(
	alertMessage: {
		severity: string;
		datasource: string;
		message: string;
		value: number;
		timestamp: number;
	},
	webhookUrl: string
): Promise<NotificationResult> {
	try {
		const response = await fetch(webhookUrl, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				type: "alert",
				severity: alertMessage.severity,
				datasource: alertMessage.datasource,
				message: alertMessage.message,
				value: alertMessage.value,
				timestamp: alertMessage.timestamp,
			}),
		});

		if (!response.ok) {
			return {
				channel: "webhook",
				success: false,
				error: `HTTP ${response.status}`,
				timestamp: Date.now(),
			};
		}

		return {
			channel: "webhook",
			success: true,
			timestamp: Date.now(),
		};
	} catch (err) {
		return {
			channel: "webhook",
			success: false,
			error: err instanceof Error ? err.message : "Unknown error",
			timestamp: Date.now(),
		};
	}
}

/**
 * Send alert through multiple channels
 */
export async function sendAlert(
	alertMessage: {
		severity: "critical" | "high" | "medium" | "low";
		datasource: string;
		message: string;
		value: number;
	},
	config: AlertNotificationConfig,
	options?: {
		recipientEmail?: string;
	}
): Promise<NotificationResult[]> {
	const results: NotificationResult[] = [];

	for (const channel of config.channels) {
		if (channel === "email" && options?.recipientEmail) {
			const result = await sendEmailAlert(alertMessage, options.recipientEmail);
			results.push(result);
		} else if (channel === "slack" && config.slackWebhookUrl) {
			const result = await sendSlackAlert(alertMessage, config.slackWebhookUrl);
			results.push(result);
		} else if (channel === "webhook" && config.webhookUrls) {
			for (const webhookUrl of config.webhookUrls) {
				const result = await sendWebhookAlert(
					{
						...alertMessage,
						timestamp: Date.now(),
					},
					webhookUrl
				);
				results.push(result);
			}
		} else if (channel === "inapp") {
			// In-app alerts are stored in database, handled separately
			results.push({
				channel: "inapp",
				success: true,
				timestamp: Date.now(),
			});
		}
	}

	return results;
}

/**
 * HTML escape for safe email rendering
 */
function escapeHtml(unsafe: string): string {
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}
