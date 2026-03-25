/**
 * Stripe Integration Module
 *
 * Handles:
 * - Creating checkout sessions
 * - Syncing customer data
 * - Webhook validation
 * - Subscription management
 */

import Stripe from "stripe";

// Initialize Stripe client (stub for MVP with test keys)
function getStripeClient(apiKey: string): Stripe {
	if (!apiKey || apiKey === "sk_test_mock") {
		// Return mock client for development
		console.warn("Using mock Stripe client - no real charges will be made");
		return new Stripe(apiKey || "sk_test_mock", {
			apiVersion: "2024-04-10" as any,
		});
	}
	return new Stripe(apiKey, {
		apiVersion: "2024-04-10" as any,
	});
}

// ============================================================================
// Pricing Configuration
// ============================================================================

export const STRIPE_PRICES = {
	starter: {
		priceId: "price_starter_monthly", // Will be replaced with real ID
		displayName: "Starter",
		monthlyPrice: 49,
		description: "3 brands, 3 users, 5 competitors per brand",
	},
	pro: {
		priceId: "price_pro_monthly", // Will be replaced with real ID
		displayName: "Pro",
		monthlyPrice: 199,
		description: "10 brands, 10 users, 20 competitors per brand",
	},
	enterprise: {
		priceId: "price_enterprise_monthly", // Will be replaced with real ID
		displayName: "Enterprise",
		monthlyPrice: 0,
		description: "Unlimited brands, users, competitors",
	},
};

// ============================================================================
// Checkout Session Creation
// ============================================================================

interface CreateCheckoutSessionParams {
	stripeApiKey: string;
	orgId: string;
	orgName: string;
	userEmail: string;
	tier: "starter" | "pro";
	successUrl: string;
	cancelUrl: string;
}

/**
 * Create Stripe checkout session for subscription
 *
 * Returns checkout session URL (hosted checkout) or session ID (custom)
 */
export async function createCheckoutSession(
	params: CreateCheckoutSessionParams
): Promise<{ url: string; sessionId: string }> {
	const stripe = getStripeClient(params.stripeApiKey);

	const priceConfig = STRIPE_PRICES[params.tier];
	if (!priceConfig) {
		throw new Error(`Invalid tier: ${params.tier}`);
	}

	try {
		const session = await stripe.checkout.sessions.create({
			customer_email: params.userEmail,
			mode: "subscription",
			payment_method_types: ["card"],

			// Line items
			line_items: [
				{
					price: priceConfig.priceId,
					quantity: 1,
				},
			],

			// Success/cancel URLs
			success_url: params.successUrl,
			cancel_url: params.cancelUrl,

			// Metadata for webhook correlation
			metadata: {
				orgId: params.orgId,
				orgName: params.orgName,
				tier: params.tier,
			},
		});

		return {
			url: session.url || "",
			sessionId: session.id,
		};
	} catch (error) {
		console.error("Failed to create Stripe checkout session:", error);
		throw error;
	}
}

// ============================================================================
// Webhook Validation
// ============================================================================

/**
 * Verify Stripe webhook signature
 *
 * Ensures webhook came from Stripe and hasn't been tampered with
 */
export function verifyWebhookSignature(
	body: string,
	signature: string,
	webhookSecret: string
): boolean {
	if (!signature || !webhookSecret) {
		return false;
	}

	try {
		const crypto = require("crypto");
		const parts = signature.split(",");

		for (const part of parts) {
			const [key, value] = part.trim().split("=");
			if (key === "t") {
				const timestamp = value;
				const signed = `${timestamp}.${body}`;

				const hash = crypto
					.createHmac("sha256", webhookSecret)
					.update(signed)
					.digest("hex");

				// Compare with signature value
				if (hash === parts.find((p) => p.startsWith("v1="))?.split("=")[1]) {
					// Also check timestamp is recent (within 5 minutes)
					const now = Math.floor(Date.now() / 1000);
					const ts = parseInt(timestamp);
					return now - ts < 300;
				}
			}
		}

		return false;
	} catch (error) {
		console.error("Failed to verify webhook signature:", error);
		return false;
	}
}

// ============================================================================
// Customer Sync
// ============================================================================

interface SyncStripeCustomerParams {
	stripeApiKey: string;
	orgId: string;
	orgName: string;
	userEmail: string;
}

/**
 * Create or sync Stripe customer
 */
export async function syncStripeCustomer(
	params: SyncStripeCustomerParams
): Promise<string> {
	const stripe = getStripeClient(params.stripeApiKey);

	try {
		// Try to find existing customer by org metadata
		const customers = await stripe.customers.list({
			email: params.userEmail,
			limit: 1,
		});

		if (customers.data.length > 0) {
			return customers.data[0].id;
		}

		// Create new customer
		const customer = await stripe.customers.create({
			email: params.userEmail,
			name: params.orgName,
			metadata: {
				orgId: params.orgId,
				orgName: params.orgName,
			},
		});

		return customer.id;
	} catch (error) {
		console.error("Failed to sync Stripe customer:", error);
		throw error;
	}
}

// ============================================================================
// Subscription Management
// ============================================================================

/**
 * Get subscription details from Stripe
 */
export async function getStripeSubscription(
	stripeApiKey: string,
	subscriptionId: string
): Promise<Stripe.Subscription | null> {
	const stripe = getStripeClient(stripeApiKey);

	try {
		return await stripe.subscriptions.retrieve(subscriptionId);
	} catch (error) {
		console.error("Failed to retrieve subscription:", error);
		return null;
	}
}

/**
 * Cancel subscription in Stripe
 */
export async function cancelStripeSubscription(
	stripeApiKey: string,
	subscriptionId: string
): Promise<void> {
	const stripe = getStripeClient(stripeApiKey);

	try {
		await stripe.subscriptions.cancel(subscriptionId);
	} catch (error) {
		console.error("Failed to cancel subscription:", error);
		throw error;
	}
}

// ============================================================================
// Stub Implementation (For MVP)
// ============================================================================

/**
 * For MVP: Creates stub Stripe data without real API calls
 *
 * Useful for testing without API keys or quota
 */
export function createStubCheckoutSession(params: CreateCheckoutSessionParams): {
	url: string;
	sessionId: string;
} {
	const priceConfig = STRIPE_PRICES[params.tier];
	return {
		url: `https://checkout.stripe.com/pay/stub_${params.orgId}_${Date.now()}`,
		sessionId: `cs_test_${params.orgId}_${Date.now()}`,
	};
}
