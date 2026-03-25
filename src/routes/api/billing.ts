/**
 * Billing API Routes
 *
 * POST   /api/billing/checkout         - Create checkout session
 * POST   /api/billing/webhook          - Stripe webhook
 * GET    /api/billing/subscription     - Get current subscription
 * POST   /api/billing/subscription/cancel - Cancel subscription
 */

import { createServerFn } from "@tanstack/start";
import { getRequestAuthContext } from "@/lib/worker-context";
import { verifyClerkSession } from "@/server/auth";
import type { EventContext } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";
import {
	getOrgSubscription,
	enforceTierLimit,
	storeStripeEvent,
	processStripeEvent,
} from "@/lib/db/billing-queries";
import {
	createCheckoutSession,
	verifyWebhookSignature,
	createStubCheckoutSession,
} from "@/server/stripe-integration";

// ============================================================================
// Create Checkout Session
// ============================================================================

export const createCheckoutSessionFn = createServerFn(
	{ method: "POST" },
	async (
		request: Request & {
			json: () => Promise<{
				tier: "starter" | "pro";
				successUrl: string;
				cancelUrl: string;
			}>;
		},
		context: EventContext
	) => {
		const session = await verifyClerkSession(request, context.env);
		if (!session) {
			throw new Response("Unauthorized", { status: 401 });
		}

		const body = await request.json();
		const auth = getRequestAuthContext(request);
		const orgId = auth?.orgId;

		if (!orgId) {
			throw new Error("Missing org context");
		}

		const stripeApiKey = context.env.STRIPE_SECRET_KEY || "sk_test_mock";

		try {
			// Use stub or real Stripe based on API key
			const session =
				stripeApiKey === "sk_test_mock"
					? createStubCheckoutSession({
							stripeApiKey,
							orgId,
							orgName: auth.orgName || "Organization",
							userEmail: auth.userEmail || "user@example.com",
							tier: body.tier,
							successUrl: body.successUrl,
							cancelUrl: body.cancelUrl,
					  })
					: await createCheckoutSession({
							stripeApiKey,
							orgId,
							orgName: auth.orgName || "Organization",
							userEmail: auth.userEmail || "user@example.com",
							tier: body.tier,
							successUrl: body.successUrl,
							cancelUrl: body.cancelUrl,
					  });

			return {
				url: session.url,
				sessionId: session.sessionId,
			};
		} catch (error) {
			console.error("Checkout session error:", error);
			throw new Response("Failed to create checkout session", {
				status: 500,
			});
		}
	}
);

// ============================================================================
// Webhook Handler
// ============================================================================

export const stripeWebhookFn = createServerFn(
	{ method: "POST" },
	async (
		request: Request & {
			text: () => Promise<string>;
		},
		context: EventContext
	) => {
		const body = await request.text();
		const signature = request.headers.get("stripe-signature") || "";
		const webhookSecret =
			context.env.STRIPE_WEBHOOK_SECRET || "whsec_test_mock";

		// Verify signature
		if (webhookSecret !== "whsec_test_mock") {
			if (!verifyWebhookSignature(body, signature, webhookSecret)) {
				throw new Response("Invalid signature", { status: 401 });
			}
		}

		const db = drizzle(context.env.DB);

		try {
			const event = JSON.parse(body);
			const { id: eventId, type: eventType, data } = event;

			// Extract org ID from event metadata
			const orgId =
				event.data?.object?.metadata?.orgId ||
				event.data?.object?.customer_metadata?.orgId;

			// Store event
			await storeStripeEvent(db, eventId, eventType, event, orgId);

			// Process event async (fire and forget for now)
			await processStripeEvent(db, eventId, eventType, event);

			return { received: true };
		} catch (error) {
			console.error("Webhook processing error:", error);
			// Return 200 anyway so Stripe doesn't retry
			return { received: true };
		}
	}
);

// ============================================================================
// Get Current Subscription
// ============================================================================

export const getSubscriptionFn = createServerFn(
	{ method: "GET" },
	async (request: Request, context: EventContext) => {
		const session = await verifyClerkSession(request, context.env);
		if (!session) {
			throw new Response("Unauthorized", { status: 401 });
		}

		const auth = getRequestAuthContext(request);
		const orgId = auth?.orgId;

		if (!orgId) {
			throw new Error("Missing org context");
		}

		const db = drizzle(context.env.DB);

		try {
			const subscription = await getOrgSubscription(db, orgId);

			return {
				id: subscription.id,
				tier: subscription.tier,
				status: subscription.status,
				paymentStatus: subscription.paymentStatus,
				billingCycleStart: subscription.billingCycleStart,
				billingCycleEnd: subscription.billingCycleEnd,
				nextBillingDate: subscription.nextBillingDate,
				createdAt: subscription.createdAt,
			};
		} catch (error) {
			console.error("Failed to get subscription:", error);
			throw new Response("Failed to load subscription", { status: 500 });
		}
	}
);

// ============================================================================
// Cancel Subscription
// ============================================================================

export const cancelSubscriptionFn = createServerFn(
	{ method: "POST" },
	async (request: Request, context: EventContext) => {
		const session = await verifyClerkSession(request, context.env);
		if (!session) {
			throw new Response("Unauthorized", { status: 401 });
		}

		const auth = getRequestAuthContext(request);
		const orgId = auth?.orgId;

		if (!orgId) {
			throw new Error("Missing org context");
		}

		const db = drizzle(context.env.DB);

		try {
			const subscription = await getOrgSubscription(db, orgId);

			// Cancel in Stripe if it exists
			if (subscription.stripeSubscriptionId) {
				const stripeApiKey =
					context.env.STRIPE_SECRET_KEY || "sk_test_mock";
				// Would call Stripe API here
				console.log(
					"Would cancel Stripe subscription:",
					subscription.stripeSubscriptionId
				);
			}

			// Cancel in DB
			await db
				.update(drizzle(context.env.DB).select().from({} as any))
				.set({
					status: "canceled",
					canceledAt: Date.now(),
					updatedAt: Date.now(),
				});

			return { success: true };
		} catch (error) {
			console.error("Failed to cancel subscription:", error);
			throw new Response("Failed to cancel subscription", {
				status: 500,
			});
		}
	}
);
