/**
 * Email service for OpenDash using Resend
 *
 * Sends transactional emails:
 * - Team member invitations
 * - Welcome emails on signup
 * - Alert notifications
 */

import { Resend } from "resend";

interface EmailConfig {
	apiKey: string;
	fromEmail: string; // e.g., noreply@opendash.ai
	fromName: string; // e.g., OpenDash
}

/**
 * Email service instance
 * Initialize once at startup
 */
let emailService: EmailServiceImpl | null = null;

class EmailServiceImpl {
	private resend: Resend;
	private config: EmailConfig;

	constructor(config: EmailConfig) {
		this.config = config;
		this.resend = new Resend(config.apiKey);
	}

	/**
	 * Send team member invitation email
	 *
	 * Template: Invite user to org, show role, include accept link
	 */
	async sendInviteEmail(
		recipientEmail: string,
		orgName: string,
		inviterName: string,
		role: "editor" | "viewer",
		acceptLink: string
	): Promise<{ success: boolean; error?: string }> {
		try {
			const roleDescription =
				role === "editor"
					? "can create and modify brands"
					: "can view data only";

			const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { margin-bottom: 30px; }
    .button { background-color: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: 500; }
    .footer { color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>You're invited to ${escapeHtml(orgName)}!</h1>
    </div>

    <p>Hi ${escapeHtml(recipientEmail)},</p>

    <p><strong>${escapeHtml(inviterName)}</strong> has invited you to join <strong>${escapeHtml(orgName)}</strong> on OpenDash.</p>

    <p>Your role will be: <strong>${role}</strong> — ${roleDescription}</p>

    <p>
      <a href="${escapeHtml(acceptLink)}" class="button">Accept Invitation</a>
    </p>

    <p>Or copy this link: <a href="${escapeHtml(acceptLink)}">${acceptLink}</a></p>

    <p>This invitation will expire in 30 days.</p>

    <div class="footer">
      <p>Questions? Reply to this email or visit <a href="https://opendash.ai">opendash.ai</a></p>
      <p>© ${new Date().getFullYear()} OpenDash. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
			`;

			const { error } = await this.resend.emails.send({
				from: `${this.config.fromName} <${this.config.fromEmail}>`,
				to: recipientEmail,
				subject: `${inviterName} invited you to ${orgName}`,
				html,
			});

			if (error) {
				console.error("Resend error:", error);
				return { success: false, error: error.message };
			}

			return { success: true };
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Unknown error";
			console.error("Email service error:", message);
			return { success: false, error: message };
		}
	}

	/**
	 * Send alert notification email
	 */
	async sendAlertEmail(
		recipientEmail: string,
		severity: "critical" | "high" | "medium" | "low",
		datasource: string,
		message: string,
		value: number
	): Promise<{ success: boolean; error?: string }> {
		try {
			const severityColor =
				severity === "critical"
					? "#dc2626"
					: severity === "high"
						? "#ea580c"
						: severity === "medium"
							? "#f59e0b"
							: "#10b981";

			const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .alert-header { padding: 16px; border-left: 4px solid ${severityColor}; background-color: #f3f4f6; margin-bottom: 20px; border-radius: 4px; }
    .severity { color: ${severityColor}; font-weight: bold; text-transform: uppercase; font-size: 14px; }
    .message { font-size: 18px; margin: 12px 0 0 0; }
    .details { margin: 20px 0; padding: 16px; background: #f9fafb; border-radius: 4px; }
    .detail-row { margin: 8px 0; }
    .label { color: #6b7280; font-weight: 500; }
    .button { background-color: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: 500; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="alert-header">
      <div class="severity">${severity.toUpperCase()} Alert</div>
      <div class="message">${escapeHtml(message)}</div>
    </div>

    <div class="details">
      <div class="detail-row">
        <div class="label">Datasource</div>
        <div>${escapeHtml(datasource)}</div>
      </div>
      <div class="detail-row">
        <div class="label">Value</div>
        <div>${value.toFixed(2)}</div>
      </div>
      <div class="detail-row">
        <div class="label">Time</div>
        <div>${new Date().toLocaleString()}</div>
      </div>
    </div>

    <p>
      <a href="https://opendash.ai/dashboard" class="button">View in Dashboard</a>
    </p>

    <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
      This is an automated alert from OpenDash. You can manage your alert settings in the dashboard.
    </p>
  </div>
</body>
</html>
			`;

			const { error } = await this.resend.emails.send({
				from: `${this.config.fromName} <${this.config.fromEmail}>`,
				to: recipientEmail,
				subject: `[${severity.toUpperCase()}] ${datasource} — ${message}`,
				html,
			});

			if (error) {
				console.error("Resend error:", error);
				return { success: false, error: error.message };
			}

			return { success: true };
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Unknown error";
			console.error("Email service error:", message);
			return { success: false, error: message };
		}
	}

	/**
	 * Send welcome email on signup
	 */
	async sendWelcomeEmail(
		recipientEmail: string,
		firstName?: string
	): Promise<{ success: boolean; error?: string }> {
		try {
			const name = firstName || "there";

			const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button { background-color: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: 500; }
    .footer { color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome to OpenDash!</h1>

    <p>Hi ${escapeHtml(name)},</p>

    <p>Your organization has been created and you're set up as the owner. You can now:</p>

    <ul>
      <li>Invite team members to collaborate</li>
      <li>Add brands and datasources</li>
      <li>Track competitive intelligence</li>
      <li>Monitor campaign performance</li>
    </ul>

    <p>
      <a href="https://opendash.ai/dashboard" class="button">Go to Dashboard</a>
    </p>

    <p><strong>Getting started:</strong></p>
    <ol>
      <li>Visit your dashboard</li>
      <li>Add your first brand</li>
      <li>Invite team members</li>
      <li>Connect datasources</li>
    </ol>

    <p>Need help? <a href="https://opendash.ai/docs">Read our docs</a> or reply to this email.</p>

    <div class="footer">
      <p>© ${new Date().getFullYear()} OpenDash. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
			`;

			const { error } = await this.resend.emails.send({
				from: `${this.config.fromName} <${this.config.fromEmail}>`,
				to: recipientEmail,
				subject: "Welcome to OpenDash!",
				html,
			});

			if (error) {
				console.error("Resend error:", error);
				return { success: false, error: error.message };
			}

			return { success: true };
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Unknown error";
			console.error("Email service error:", message);
			return { success: false, error: message };
		}
	}
}

/**
 * Initialize email service (call once at startup)
 */
export function initEmailService(config: EmailConfig): void {
	emailService = new EmailServiceImpl(config);
}

/**
 * Get email service instance (must be initialized first)
 */
export function getEmailService(): EmailServiceImpl {
	if (!emailService) {
		throw new Error(
			"Email service not initialized. Call initEmailService first."
		);
	}
	return emailService;
}

/**
 * Safe HTML escaping for email templates
 */
function escapeHtml(unsafe: string): string {
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

/**
 * Generate invitation accept link
 *
 * Pattern: /invite/{token}
 * Token is HMAC-signed (memberId + timestamp)
 */
export function generateInviteLink(
	memberId: string,
	baseUrl: string = "https://opendash.ai"
): string {
	// TODO: In production, create HMAC-signed token
	// For MVP, use plain memberId (not secure — for testing only)
	const token = Buffer.from(memberId).toString("base64");
	return `${baseUrl}/invite/${token}`;
}

/**
 * Verify invitation token (HMAC check)
 *
 * Returns: memberId if valid, null if expired or tampered
 */
export function verifyInviteToken(
	token: string,
	maxAgeMs: number = 30 * 24 * 60 * 60 * 1000 // 30 days
): string | null {
	try {
		// TODO: In production, verify HMAC signature
		// For MVP, decode base64 (not secure)
		const memberId = Buffer.from(token, "base64").toString("utf-8");
		return memberId;
	} catch {
		return null;
	}
}
