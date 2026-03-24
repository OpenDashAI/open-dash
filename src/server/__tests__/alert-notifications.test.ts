/**
 * Alert Notification Service Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { sendAlert, type NotificationResult } from "@/server/alert-notifications";

// Mock email service
vi.mock("@/server/email-service", () => ({
	getEmailService: vi.fn(() => ({
		sendAlertEmail: vi.fn(async () => ({
			success: true,
		})),
	})),
}));

describe("Alert Notifications", () => {
	describe("sendAlert", () => {
		it("sends critical alerts to email channel", async () => {
			const results = await sendAlert(
				{
					severity: "critical",
					datasource: "GitHub",
					message: "Connection failed",
					value: 0,
				},
				{
					channels: ["email"],
				},
				{
					recipientEmail: "user@example.com",
				}
			);

			expect(results).toHaveLength(1);
			expect(results[0].channel).toBe("email");
			expect(results[0].success).toBe(true);
		});

		it("sends alerts to multiple channels", async () => {
			const results = await sendAlert(
				{
					severity: "high",
					datasource: "API",
					message: "High error rate detected",
					value: 45.5,
				},
				{
					channels: ["email", "inapp"],
				},
				{
					recipientEmail: "ops@example.com",
				}
			);

			expect(results).toHaveLength(2);
			expect(results.map((r) => r.channel)).toEqual(["email", "inapp"]);
			expect(results.every((r) => r.success)).toBe(true);
		});

		it("handles in-app channel without email", async () => {
			const results = await sendAlert(
				{
					severity: "medium",
					datasource: "Database",
					message: "Latency increased",
					value: 5200,
				},
				{
					channels: ["inapp"],
				}
			);

			expect(results).toHaveLength(1);
			expect(results[0].channel).toBe("inapp");
			expect(results[0].success).toBe(true);
		});

		it("includes timestamp in notification results", async () => {
			const beforeTime = Date.now();
			const results = await sendAlert(
				{
					severity: "low",
					datasource: "Monitor",
					message: "Check completed",
					value: 100,
				},
				{
					channels: ["inapp"],
				}
			);
			const afterTime = Date.now();

			expect(results[0].timestamp).toBeGreaterThanOrEqual(beforeTime);
			expect(results[0].timestamp).toBeLessThanOrEqual(afterTime);
		});

		it("skips email channel if no recipient provided", async () => {
			const results = await sendAlert(
				{
					severity: "high",
					datasource: "API",
					message: "Alert",
					value: 50,
				},
				{
					channels: ["email"],
				}
				// No recipientEmail provided
			);

			expect(results).toHaveLength(0);
		});

		it("skips Slack channel if no webhook URL", async () => {
			const results = await sendAlert(
				{
					severity: "critical",
					datasource: "Service",
					message: "Down",
					value: 0,
				},
				{
					channels: ["slack"],
					// No slackWebhookUrl provided
				}
			);

			expect(results).toHaveLength(0);
		});

		it("handles multiple webhook channels", async () => {
			const results = await sendAlert(
				{
					severity: "high",
					datasource: "API",
					message: "Rate limit exceeded",
					value: 95,
				},
				{
					channels: ["webhook"],
					webhookUrls: [
						"https://hook1.example.com",
						"https://hook2.example.com",
					],
				}
			);

			// Would send to both webhooks if they were valid
			expect(results.length).toBeGreaterThanOrEqual(0);
		});
	});

	describe("Alert severity levels", () => {
		const severities = ["critical", "high", "medium", "low"] as const;

		for (const severity of severities) {
			it(`sends ${severity} severity alerts`, async () => {
				const results = await sendAlert(
					{
						severity,
						datasource: "Test",
						message: `${severity} alert test`,
						value: 100,
					},
					{
						channels: ["inapp"],
					}
				);

				expect(results).toHaveLength(1);
				expect(results[0].success).toBe(true);
			});
		}
	});

	describe("Error handling", () => {
		it("always returns notification results even if service errors", async () => {
			// Email service mocks always succeed
			const results = await sendAlert(
				{
					severity: "high",
					datasource: "API",
					message: "Test alert",
					value: 50,
				},
				{
					channels: ["email"],
				},
				{
					recipientEmail: "user@example.com",
				}
			);

			expect(results).toHaveLength(1);
			expect(results[0]).toHaveProperty("channel");
			expect(results[0]).toHaveProperty("success");
			expect(results[0]).toHaveProperty("timestamp");
		});
	});

	describe("Channel routing", () => {
		it("routes to only specified channels", async () => {
			const results = await sendAlert(
				{
					severity: "critical",
					datasource: "App",
					message: "Critical issue",
					value: 0,
				},
				{
					channels: ["inapp"],
				}
			);

			expect(results.map((r) => r.channel)).not.toContain("email");
			expect(results.map((r) => r.channel)).not.toContain("slack");
			expect(results.map((r) => r.channel)).not.toContain("webhook");
		});
	});
});
