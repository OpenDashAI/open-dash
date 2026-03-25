/**
 * Billing System Queries
 *
 * Subscription management, tier enforcement, and Stripe integration
 */

import { drizzle } from "drizzle-orm/d1";
import { eq, and, isNull } from "drizzle-orm";
import {
	subscriptionsTable,
	tierLimitsTable,
	stripeEventsTable,
	Subscription,
	SubscriptionInsert,
	TierLimit,
	StripeEvent,
	StripeEventInsert,
	organizationsTable,
	brandsTable,
	teamMembersTable,
} from "./schema";

// Generate UUIDs (stub for MVP)
function generateUUID(): string {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

// ============================================================================
// Subscription Management
// ============================================================================

/**
 * Get organization subscription (or create default)
 */
export async function getOrgSubscription(
	db: ReturnType<typeof drizzle>,
	orgId: string
): Promise<Subscription> {
	const existing = await db
		.select()
		.from(subscriptionsTable)
		.where(eq(subscriptionsTable.orgId, orgId))
		.get();

	if (existing) return existing;

	// Create default starter tier subscription
	const newSub: SubscriptionInsert = {
		id: generateUUID(),
		orgId,
		tier: "starter",
		status: "active",
		paymentStatus: "paid",
	};

	await db.insert(subscriptionsTable).values(newSub);
	return (await getOrgSubscription(db, orgId)) as Subscription;
}

/**
 * Update subscription tier (e.g., after payment)
 */
export async function upgradeSubscriptionTier(
	db: ReturnType<typeof drizzle>,
	orgId: string,
	newTier: "starter" | "pro" | "enterprise",
	stripeData?: {
		subscriptionId: string;
		customerId: string;
		billingStart: number;
		billingEnd: number;
	}
): Promise<Subscription> {
	const update: Partial<SubscriptionInsert> = {
		tier: newTier,
		status: "active",
		paymentStatus: "paid",
	};

	if (stripeData) {
		update.stripeSubscriptionId = stripeData.subscriptionId;
		update.stripeCustomerId = stripeData.customerId;
		update.billingCycleStart = stripeData.billingStart;
		update.billingCycleEnd = stripeData.billingEnd;
		update.nextBillingDate =
			stripeData.billingEnd + 30 * 24 * 60 * 60 * 1000; // ~30 days later
	}

	await db
		.update(subscriptionsTable)
		.set({
			...update,
			updatedAt: Date.now(),
		})
		.where(eq(subscriptionsTable.orgId, orgId));

	return (await getOrgSubscription(db, orgId)) as Subscription;
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
	db: ReturnType<typeof drizzle>,
	orgId: string
): Promise<void> {
	await db
		.update(subscriptionsTable)
		.set({
			status: "canceled",
			canceledAt: Date.now(),
			updatedAt: Date.now(),
		})
		.where(eq(subscriptionsTable.orgId, orgId));
}

// ============================================================================
// Tier Enforcement
// ============================================================================

/**
 * Get tier limits
 */
export async function getTierLimits(
	db: ReturnType<typeof drizzle>,
	tier: "starter" | "pro" | "enterprise"
): Promise<TierLimit | null> {
	return db
		.select()
		.from(tierLimitsTable)
		.where(eq(tierLimitsTable.tier, tier))
		.get();
}

/**
 * Check if org can add more brands
 */
export async function canAddBrand(
	db: ReturnType<typeof drizzle>,
	orgId: string
): Promise<{ allowed: boolean; current: number; limit: number }> {
	const subscription = await getOrgSubscription(db, orgId);
	const limits = await getTierLimits(db, subscription.tier as any);

	if (!limits) {
		return { allowed: false, current: 0, limit: 0 };
	}

	const current = await db
		.select({ count: 1 })
		.from(brandsTable)
		.where(eq(brandsTable.orgId, orgId))
		.all();

	const count = current.length;
	return {
		allowed: count < limits.maxBrands,
		current: count,
		limit: limits.maxBrands,
	};
}

/**
 * Check if org can add more users
 */
export async function canAddUser(
	db: ReturnType<typeof drizzle>,
	orgId: string
): Promise<{ allowed: boolean; current: number; limit: number }> {
	const subscription = await getOrgSubscription(db, orgId);
	const limits = await getTierLimits(db, subscription.tier as any);

	if (!limits) {
		return { allowed: false, current: 0, limit: 0 };
	}

	const current = await db
		.select()
		.from(teamMembersTable)
		.where(eq(teamMembersTable.orgId, orgId))
		.all();

	const count = current.length;
	return {
		allowed: count < limits.maxUsers,
		current: count,
		limit: limits.maxUsers,
	};
}

/**
 * Enforce tier limits for an operation
 *
 * Throws if org exceeds tier limits
 */
export async function enforceTierLimit(
	db: ReturnType<typeof drizzle>,
	orgId: string,
	resource: "brands" | "users" | "competitors" | "alert_rules",
	amount: number = 1
): Promise<void> {
	switch (resource) {
		case "brands": {
			const check = await canAddBrand(db, orgId);
			if (!check.allowed) {
				throw new Error(
					`Brand limit reached (${check.limit}) for your tier. Upgrade to add more.`
				);
			}
			break;
		}
		case "users": {
			const check = await canAddUser(db, orgId);
			if (!check.allowed) {
				throw new Error(
					`User limit reached (${check.limit}) for your tier. Upgrade to add more.`
				);
			}
			break;
		}
		// TODO: Add competitors and alert_rules limits
	}
}

// ============================================================================
// Stripe Webhook Handling
// ============================================================================

/**
 * Store Stripe webhook event
 */
export async function storeStripeEvent(
	db: ReturnType<typeof drizzle>,
	stripeEventId: string,
	eventType: string,
	eventData: Record<string, any>,
	orgId?: string
): Promise<StripeEvent> {
	const event: StripeEventInsert = {
		id: generateUUID(),
		stripeEventId,
		eventType,
		eventData: JSON.stringify(eventData),
		orgId,
		processed: false,
	};

	await db.insert(stripeEventsTable).values(event);

	return (await db
		.select()
		.from(stripeEventsTable)
		.where(eq(stripeEventsTable.id, event.id))
		.get()) as StripeEvent;
}

/**
 * Process Stripe event (subscription changes, payments, etc.)
 */
export async function processStripeEvent(
	db: ReturnType<typeof drizzle>,
	eventId: string,
	eventType: string,
	eventData: Record<string, any>
): Promise<void> {
	try {
		switch (eventType) {
			case "customer.subscription.created":
			case "customer.subscription.updated": {
				const subscription = eventData.data?.object;
				if (!subscription?.id) {
					throw new Error("Missing subscription ID in event");
				}

				// Find org by Stripe customer ID
				const org = await db
					.select()
					.from(subscriptionsTable)
					.where(
						eq(
							subscriptionsTable.stripeCustomerId,
							subscription.customer
						)
					)
					.get();

				if (!org) {
					throw new Error(
						`No org found for Stripe customer ${subscription.customer}`
					);
				}

				// Determine tier from Stripe price
				const priceId = subscription.items?.data?.[0]?.price?.id;
				let tier: "starter" | "pro" | "enterprise" = "starter";
				if (priceId?.includes("pro")) tier = "pro";
				if (priceId?.includes("enterprise")) tier = "enterprise";

				// Update subscription
				await upgradeSubscriptionTier(db, org.orgId, tier, {
					subscriptionId: subscription.id,
					customerId: subscription.customer,
					billingStart: subscription.current_period_start * 1000,
					billingEnd: subscription.current_period_end * 1000,
				});

				break;
			}

			case "invoice.payment_succeeded": {
				// Mark invoice as paid
				break;
			}

			case "customer.subscription.deleted": {
				const subscription = eventData.data?.object;
				if (subscription?.id) {
					const sub = await db
						.select()
						.from(subscriptionsTable)
						.where(
							eq(
								subscriptionsTable.stripeSubscriptionId,
								subscription.id
							)
						)
						.get();

					if (sub) {
						await cancelSubscription(db, sub.orgId);
					}
				}
				break;
			}

			default:
				// Ignore unknown events
				break;
		}

		// Mark event as processed
		await db
			.update(stripeEventsTable)
			.set({
				processed: true,
				processedAt: Date.now(),
			})
			.where(eq(stripeEventsTable.stripeEventId, eventId));
	} catch (error) {
		const errorMsg =
			error instanceof Error ? error.message : String(error);

		// Log error but don't throw - webhook must return 200
		await db
			.update(stripeEventsTable)
			.set({
				processed: true,
				error: errorMsg,
				processedAt: Date.now(),
			})
			.where(eq(stripeEventsTable.stripeEventId, eventId));

		console.error(`Failed to process Stripe event ${eventId}:`, errorMsg);
	}
}
