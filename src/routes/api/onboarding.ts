import { createFileRoute } from "@tanstack/react-router";
import { getSessionCookie } from "../../server/auth";
import { createOrgForUser } from "../../server/organizations";
import type { EventContext } from "@cloudflare/workers-types";

/**
 * POST /api/onboarding
 * Called after Clerk signup to create/update user and send welcome email.
 *
 * This endpoint:
 * 1. Verifies Clerk session exists
 * 2. Creates/updates user in D1 (via server function)
 * 3. Sends welcome email via Resend
 * 4. Returns success status
 */
export const Route = createFileRoute("/api/onboarding")({
	server: {
		handlers: {
			POST: async ({ request, context }) => {
				try {
					// Get Clerk session cookie
					const sessionCookie = getSessionCookie(request);
					if (!sessionCookie) {
						return new Response(
							JSON.stringify({ error: "No session found" }),
							{ status: 401, headers: { "Content-Type": "application/json" } },
						);
					}

					// Parse request body to get user info
					// In production, you'd decode the Clerk JWT token
					const body = await request.json().catch(() => ({}));
					const { clerkId, email, firstName, lastName } = body;

					if (!clerkId || !email) {
						return new Response(
							JSON.stringify({ error: "Missing required fields" }),
							{ status: 400, headers: { "Content-Type": "application/json" } },
						);
					}

					// Create default organization for user
					// Org slug will be derived from email (before @)
					const defaultOrgName = email.split("@")[0];
					const db = (context as EventContext).env.DB;

					const { orgId, slug } = await createOrgForUser(
						db,
						clerkId,
						defaultOrgName,
						clerkId
					);

					// TODO: In next phase:
					// 1. Create/update user in users table
					// 2. Send welcome email via Resend
					// 3. Log onboarding event

					return new Response(
						JSON.stringify({
							success: true,
							message: "Organization created successfully",
							orgId,
							slug,
							role: "owner",
						}),
						{
							status: 200,
							headers: { "Content-Type": "application/json" },
						},
					);
				} catch (err) {
					console.error("Onboarding error:", err);
					return new Response(
						JSON.stringify({
							success: false,
							error: err instanceof Error ? err.message : "Onboarding failed",
						}),
						{
							status: 500,
							headers: { "Content-Type": "application/json" },
						},
					);
				}
			},
		},
	},
});
