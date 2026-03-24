/**
 * Email service for OpenDash.
 * Uses Resend to send transactional and onboarding emails.
 */

import { Resend } from "resend";

export type EmailType = "welcome" | "setup_reminder" | "feature_discovery";

interface EmailUser {
	email: string;
	firstName?: string;
	lastName?: string;
}

/**
 * Initialize Resend client with API key from environment.
 */
function getResendClient(apiKey: string): Resend {
	return new Resend(apiKey);
}

/**
 * Welcome email template (sent immediately after signup).
 */
function welcomeEmailTemplate(user: EmailUser): string {
	const firstName = user.firstName || "there";
	return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 40px 20px; border-radius: 0 0 8px 8px; }
    .cta { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { color: #6b7280; font-size: 12px; margin-top: 20px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">Welcome to OpenDash! 🎉</h1>
    </div>
    <div class="content">
      <p>Hi ${firstName},</p>

      <p>You're in! You can now see all your projects in 5 minutes with OpenDash.</p>

      <h2>What you can do:</h2>
      <ul>
        <li><strong>Morning Briefing</strong> — See what changed overnight across all your projects</li>
        <li><strong>Live Analytics</strong> — Track health scores, deployments, and revenue in real-time</li>
        <li><strong>AI Chat</strong> — Ask questions about your metrics and get insights instantly</li>
      </ul>

      <h2>Get started in 3 steps:</h2>
      <ol>
        <li>Log in to OpenDash</li>
        <li>Connect your first datasource (GitHub, Stripe, etc.)</li>
        <li>View your morning briefing</li>
      </ol>

      <p>
        <a href="https://opendash.ai" class="cta">Get Started →</a>
      </p>

      <p><strong>Need help?</strong> Check out our <a href="https://opendash.ai/guide">getting started guide</a> or email support@opendash.ai</p>

      <p>Happy analyzing!<br>The OpenDash Team</p>
    </div>
    <div class="footer">
      <p>You received this email because you signed up for OpenDash at opendash.ai</p>
      <p>&copy; 2026 OpenDash. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Setup reminder email (sent 24h after signup if user hasn't logged in).
 */
function setupReminderEmailTemplate(user: EmailUser): string {
	const firstName = user.firstName || "there";
	return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 40px 20px; border-radius: 0 0 8px 8px; }
    .cta { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .step { background: white; padding: 20px; margin: 15px 0; border-left: 4px solid #3b82f6; border-radius: 4px; }
    .footer { color: #6b7280; font-size: 12px; margin-top: 20px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">Need help getting started?</h1>
    </div>
    <div class="content">
      <p>Hi ${firstName},</p>

      <p>We noticed you haven't logged in to OpenDash yet. Setting up takes just <strong>5 minutes</strong> — here's how:</p>

      <div class="step">
        <h3 style="margin-top: 0;">Step 1: Log in</h3>
        <p><a href="https://opendash.ai/login">Log in to your OpenDash account</a></p>
      </div>

      <div class="step">
        <h3 style="margin-top: 0;">Step 2: Connect GitHub</h3>
        <p>Click "Connect GitHub" — it's automatic and takes 30 seconds.</p>
      </div>

      <div class="step">
        <h3 style="margin-top: 0;">Step 3: See your briefing</h3>
        <p>Refresh the page and you'll see your live morning briefing with issues, PRs, and activity.</p>
      </div>

      <p>
        <a href="https://opendash.ai" class="cta">Open OpenDash →</a>
      </p>

      <p>Questions? <a href="https://opendash.ai/guide">View the setup guide</a> or email support@opendash.ai</p>

      <p>See you soon!<br>The OpenDash Team</p>
    </div>
    <div class="footer">
      <p>&copy; 2026 OpenDash. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Feature discovery email (sent 7 days after signup if user is active).
 */
function featureDiscoveryEmailTemplate(user: EmailUser): string {
	const firstName = user.firstName || "there";
	return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 40px 20px; border-radius: 0 0 8px 8px; }
    .cta { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .tip { background: white; padding: 20px; margin: 15px 0; border-left: 4px solid #10b981; border-radius: 4px; }
    .footer { color: #6b7280; font-size: 12px; margin-top: 20px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">Pro tip: Try the AI Chat! 💡</h1>
    </div>
    <div class="content">
      <p>Hi ${firstName},</p>

      <p>We've noticed you're using OpenDash regularly. Did you know the AI Chat can answer questions about your metrics?</p>

      <div class="tip">
        <h3 style="margin-top: 0;">Try asking:</h3>
        <ul>
          <li>"Why did my error rate spike?"</li>
          <li>"Which datasource needs attention?"</li>
          <li>"Show me my health trends"</li>
          <li>"Summarize what changed overnight"</li>
        </ul>
      </div>

      <p>The AI analyzes your live data and gives you instant insights — no dashboards to click through.</p>

      <p>
        <a href="https://opendash.ai" class="cta">Open OpenDash & Try It →</a>
      </p>

      <p>Questions? Email support@opendash.ai</p>

      <p>Happy analyzing!<br>The OpenDash Team</p>
    </div>
    <div class="footer">
      <p>&copy; 2026 OpenDash. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Send an email using Resend.
 */
export async function sendEmail(
	apiKey: string,
	options: {
		to: string;
		type: EmailType;
		user: EmailUser;
		from?: string;
	},
): Promise<{ success: boolean; id?: string; error?: string }> {
	try {
		if (!apiKey) {
			return { success: false, error: "Resend API key not configured" };
		}

		const resend = getResendClient(apiKey);

		let subject = "";
		let html = "";

		switch (options.type) {
			case "welcome":
				subject = "Welcome to OpenDash! 🎉";
				html = welcomeEmailTemplate(options.user);
				break;
			case "setup_reminder":
				subject = "Need help getting started with OpenDash?";
				html = setupReminderEmailTemplate(options.user);
				break;
			case "feature_discovery":
				subject = "Pro tip: Try the AI Chat! 💡";
				html = featureDiscoveryEmailTemplate(options.user);
				break;
		}

		const response = await resend.emails.send({
			from: options.from || "OpenDash <onboarding@opendash.ai>",
			to: options.to,
			subject,
			html,
		});

		if (response.error) {
			return { success: false, error: response.error.message };
		}

		return {
			success: true,
			id: response.data?.id,
		};
	} catch (err) {
		console.error("Failed to send email:", err);
		return {
			success: false,
			error: err instanceof Error ? err.message : "Unknown error",
		};
	}
}
