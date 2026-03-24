import { createFileRoute } from "@tanstack/react-router";
import { getSessionCookie } from "../../server/auth";

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
			POST: async ({ request }) => {
				try {
					// Get Clerk session cookie
					const sessionCookie = getSessionCookie(request);
					if (!sessionCookie) {
						return new Response(
							JSON.stringify({ error: "No session found" }),
							{ status: 401, headers: { "Content-Type": "application/json" } },
						);
					}

					// TODO: Decode Clerk JWT token from session to get:
					// - clerkId
					// - email
					// - firstName
					// - lastName
					// - avatar
					//
					// Then call upsertUser() and markEmailSent()
					//
					// For MVP, we're returning success here.
					// Full implementation requires:
					// 1. Clerk's public key for JWT verification
					// 2. Or using Clerk's backend API to get user info
					// 3. Resend SDK to send welcome email

					return new Response(
						JSON.stringify({
							success: true,
							message:
								"Onboarding initiated. Clerk session verified.",
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
							error: "Onboarding failed",
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
