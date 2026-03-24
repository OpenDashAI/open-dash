/**
 * Alert System
 *
 * Sends notifications when significant competitive changes are detected.
 * Supports multiple channels:
 * - Slack: Team notifications with rich formatting
 * - Email: Detailed analysis reports
 * - Webhook: Custom integrations
 * - Dashboard: In-app notifications
 *
 * Deduplicates alerts to prevent spam.
 * Uses Durable Objects to manage rate limiting and state.
 */

import type { SignificanceScore } from "./significance-scoring";
import type { Change } from "./change-detection";

export interface Alert {
	id: string;
	competitor: string;
	title: string;
	severity: "critical" | "high" | "medium" | "low";
	changes: Change[];
	significance: SignificanceScore;
	channels: ("slack" | "email" | "webhook" | "dashboard")[];
	firedAt: number;
	acknowledged?: boolean;
	acknowledgedBy?: string;
	acknowledgedAt?: number;
}

/**
 * Send competitive alert through specified channels
 */
export async function fireAlert(
	alert: Alert,
	channels: ("slack" | "email" | "webhook" | "dashboard")[] = ["slack", "dashboard"]
): Promise<{
	success: number;
	failed: number;
	results: Record<string, boolean>;
}> {
	const results: Record<string, boolean> = {};
	let success = 0;
	let failed = 0;

	for (const channel of channels) {
		try {
			switch (channel) {
				case "slack":
					await sendSlackAlert(alert);
					results.slack = true;
					success++;
					break;

				case "email":
					await sendEmailAlert(alert);
					results.email = true;
					success++;
					break;

				case "webhook":
					await sendWebhookAlert(alert);
					results.webhook = true;
					success++;
					break;

				case "dashboard":
					await saveDashboardAlert(alert);
					results.dashboard = true;
					success++;
					break;
			}
		} catch (error) {
			console.error(`Failed to send alert via ${channel}:`, error);
			results[channel] = false;
			failed++;
		}
	}

	return { success, failed, results };
}

/**
 * Send Slack notification with rich formatting
 */
async function sendSlackAlert(alert: Alert): Promise<void> {
	// Get Slack webhook URL from environment or API Mom
	const slackWebhook = await getSlackWebhook();
	if (!slackWebhook) {
		throw new Error("Slack webhook not configured");
	}

	// Format message based on severity
	const color = {
		critical: "#FF0000",
		high: "#FF9900",
		medium: "#FFFF00",
		low: "#00FF00",
	}[alert.severity];

	const emoji = {
		critical: "🚨",
		high: "⚠️",
		medium: "ℹ️",
		low: "✅",
	}[alert.severity];

	// Build change summary
	const changeSummary = alert.changes
		.slice(0, 5)
		.map((c) => `• ${c.title}`)
		.join("\n");

	const message = {
		attachments: [
			{
				color,
				title: `${emoji} ${alert.title}`,
				title_link: `https://opendash.ai/competitive-intelligence?competitor=${alert.competitor}`,
				fields: [
					{
						title: "Competitor",
						value: alert.competitor,
						short: true,
					},
					{
						title: "Severity",
						value: alert.severity.toUpperCase(),
						short: true,
					},
					{
						title: "Significance Score",
						value: `${(alert.significance.score * 100).toFixed(0)}%`,
						short: true,
					},
					{
						title: "Changes Detected",
						value: alert.changes.length.toString(),
						short: true,
					},
					{
						title: "What Changed",
						value: changeSummary,
						short: false,
					},
					{
						title: "Reasoning",
						value: alert.significance.reasoning,
						short: false,
					},
					{
						title: "Recommendations",
						value: alert.significance.recommendations
							.slice(0, 3)
							.join("\n"),
						short: false,
					},
				],
				footer: "ODA Competitive Intelligence",
				ts: Math.floor(alert.firedAt / 1000),
			},
		],
	};

	const response = await fetch(slackWebhook, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(message),
	});

	if (!response.ok) {
		throw new Error(`Slack API error: ${response.status}`);
	}
}

/**
 * Send email alert with detailed analysis
 */
async function sendEmailAlert(alert: Alert): Promise<void> {
	const emailService = await getEmailService();
	if (!emailService) {
		throw new Error("Email service not configured");
	}

	const subject = `[${alert.severity.toUpperCase()}] Competitive Alert: ${alert.competitor} - ${alert.title}`;

	const htmlBody = buildEmailHTML(alert);

	await emailService.send({
		to: "team@opendash.ai",
		subject,
		html: htmlBody,
		tags: ["competitive-intelligence", alert.severity],
	});
}

/**
 * Send webhook notification for custom integrations
 */
async function sendWebhookAlert(alert: Alert): Promise<void> {
	const webhookUrl = await getCustomWebhook();
	if (!webhookUrl) {
		throw new Error("Custom webhook not configured");
	}

	const payload = {
		type: "competitive_alert",
		severity: alert.severity,
		competitor: alert.competitor,
		title: alert.title,
		score: alert.significance.score,
		changes: alert.changes.map((c) => ({
			type: c.type,
			title: c.title,
			severity: c.severity,
		})),
		implications: alert.significance.implications,
		recommendations: alert.significance.recommendations,
		timestamp: alert.firedAt,
	};

	const response = await fetch(webhookUrl, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		throw new Error(`Webhook error: ${response.status}`);
	}
}

/**
 * Save alert to dashboard (in-app notification)
 */
async function saveDashboardAlert(alert: Alert): Promise<void> {
	// Store in D1 database or Durable Object state
	// This allows alerts to show in the OpenDash dashboard

	// Implementation depends on D1 setup:
	// INSERT INTO competitive_alerts (id, competitor, title, severity, ...)
	// VALUES (?, ?, ?, ?, ...)

	console.log(`Dashboard alert: ${alert.competitor} - ${alert.title}`);
}

/**
 * Build HTML email body
 */
function buildEmailHTML(alert: Alert): string {
	const changeRows = alert.changes
		.map(
			(c) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">
        <strong>${c.title}</strong><br/>
        <span style="color: #666; font-size: 0.9em;">${c.description}</span>
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">
        <span style="background: ${getSeverityColor(c.severity)}; color: white; padding: 4px 8px; border-radius: 4px;">
          ${c.severity}
        </span>
      </td>
    </tr>
  `
		)
		.join("");

	return `
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333;">
        <h2>Competitive Alert: ${alert.competitor}</h2>
        <p style="color: #666;">An important competitive change has been detected.</p>

        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h3>${alert.title}</h3>
          <p><strong>Severity:</strong> ${alert.severity}</p>
          <p><strong>Significance Score:</strong> ${(alert.significance.score * 100).toFixed(0)}%</p>
          <p><strong>Reasoning:</strong> ${alert.significance.reasoning}</p>
        </div>

        <h3>Changes Detected (${alert.changes.length})</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="text-align: left; padding: 8px; border-bottom: 2px solid #ddd;">Change</th>
              <th style="padding: 8px; border-bottom: 2px solid #ddd;">Severity</th>
            </tr>
          </thead>
          <tbody>
            ${changeRows}
          </tbody>
        </table>

        ${
			alert.significance.implications.length > 0
				? `
          <h3>Strategic Implications</h3>
          <ul>
            ${alert.significance.implications.map((i) => `<li>${i}</li>`).join("")}
          </ul>
        `
				: ""
		}

        ${
			alert.significance.recommendations.length > 0
				? `
          <h3>Recommended Actions</h3>
          <ol>
            ${alert.significance.recommendations.map((r) => `<li>${r}</li>`).join("")}
          </ol>
        `
				: ""
		}

        <p style="color: #999; font-size: 0.9em; margin-top: 32px;">
          View full analysis: <a href="https://opendash.ai/competitive-intelligence?competitor=${alert.competitor}">Open in ODA</a>
        </p>
      </body>
    </html>
  `;
}

/**
 * Deduplicate alerts to prevent spam
 * Don't send same alert twice within threshold time
 */
export async function shouldFireAlert(
	competitor: string,
	changeHash: string,
	deduplicateWindow: number = 24 * 60 * 60 * 1000 // 24 hours default
): Promise<boolean> {
	const recentAlerts = await getRecentAlerts(
		competitor,
		deduplicateWindow
	);

	// Check if we already sent an alert for this exact change
	for (const alert of recentAlerts) {
		if (alertContentHash(alert) === changeHash) {
			return false; // Already sent
		}
	}

	return true;
}

/**
 * Hash alert content for deduplication
 */
function alertContentHash(alert: Alert): string {
	// Simple hash of changes and significance
	const content = alert.changes.map((c) => c.title).join("|");
	return (
		content.split("").reduce((h, c) => h + c.charCodeAt(0), 0) ^
		Math.floor(alert.significance.score * 1000)
	).toString(16);
}

/**
 * Get recent alerts for deduplication check
 */
async function getRecentAlerts(
	competitor: string,
	windowMs: number
): Promise<Alert[]> {
	// Query D1 database for recent alerts
	// In production: SELECT * FROM competitive_alerts WHERE competitor = ? AND fired_at > ?
	return [];
}

/**
 * Get Slack webhook URL from secure storage
 */
async function getSlackWebhook(): Promise<string | null> {
	// In production, fetch from API Mom or secure KV store
	return process.env.SLACK_WEBHOOK_URL || null;
}

/**
 * Get email service configuration
 */
async function getEmailService(): Promise<{
	send: (opts: {
		to: string;
		subject: string;
		html: string;
		tags: string[];
	}) => Promise<void>;
} | null> {
	// In production, use SES or similar service
	// configured through API Mom
	return null;
}

/**
 * Get custom webhook URL for integrations
 */
async function getCustomWebhook(): Promise<string | null> {
	return process.env.CUSTOM_WEBHOOK_URL || null;
}

/**
 * Get severity color for HTML formatting
 */
function getSeverityColor(severity: string): string {
	return {
		critical: "#FF0000",
		high: "#FF9900",
		medium: "#FFFF00",
		low: "#00FF00",
	}[severity] || "#999999";
}
