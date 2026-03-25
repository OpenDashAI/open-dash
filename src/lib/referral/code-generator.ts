/**
 * Referral Code Generation
 *
 * Creates unique, collision-free 8-character friend codes.
 * Uses nanoid with alphanumeric alphabet: 36^8 = 2.8 trillion combinations.
 *
 * Collision probability: < 1 in 2.8 trillion even with 1M codes.
 */

import { customAlphabet } from "nanoid";
import { eq } from "drizzle-orm";
import type { D1Database } from "@cloudflare/workers-types";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import {
	campaignsTable,
	referralCodesTable,
	type ReferralCodeInsert,
} from "@/lib/db/schema";

// 8-character codes, alphanumeric (36 possible values per character)
// Examples: OPENDASH, FRIEND42, EARLY99
const generateCode = customAlphabet(
	"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
	8
);

/**
 * Create a unique referral code for an organization
 *
 * @param db - Drizzle D1 database instance
 * @param orgId - Organization ID
 * @returns The generated unique code (e.g., "OPENDASH")
 */
export async function createReferralCode(
	db: DrizzleD1Database,
	orgId: string
): Promise<string> {
	// Ensure organization has a campaign
	const campaign = await db
		.select()
		.from(campaignsTable)
		.where(eq(campaignsTable.orgId, orgId))
		.get();

	if (!campaign) {
		// Create default campaign for this org
		const campaignId = `campaign_${orgId}`;
		await db.insert(campaignsTable).values({
			id: campaignId,
			orgId,
			name: "Friend Referral",
			status: "active",
			referrerReward: 10,
			refereeDiscount: 10,
			createdAt: Date.now(),
		});
	}

	// Generate unique code with collision checking
	let code = generateCode();
	let collision = true;
	let attempts = 0;
	const maxAttempts = 10; // Safety limit

	while (collision && attempts < maxAttempts) {
		const existing = await db
			.select()
			.from(referralCodesTable)
			.where(eq(referralCodesTable.code, code))
			.get();

		if (!existing) {
			collision = false;
		} else {
			code = generateCode();
			attempts++;
		}
	}

	if (collision) {
		throw new Error("Unable to generate unique code after 10 attempts");
	}

	// Insert the new code
	const codeRecord: ReferralCodeInsert = {
		id: `code_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
		campaignId: campaign?.id || `campaign_${orgId}`,
		code,
		maxUses: null, // Unlimited uses for MVP
		currentUses: 0,
		expiresAt: null, // Never expires for MVP
		isActive: true,
		createdAt: Date.now(),
	};

	await db.insert(referralCodesTable).values(codeRecord);

	return code;
}

/**
 * Get or create a referral code for an organization
 *
 * If org already has a code, returns it.
 * Otherwise, generates a new one.
 *
 * @param db - Drizzle D1 database instance
 * @param orgId - Organization ID
 * @returns The organization's referral code
 */
export async function getOrCreateReferralCode(
	db: DrizzleD1Database,
	orgId: string
): Promise<string> {
	const campaign = await db
		.select()
		.from(campaignsTable)
		.where(eq(campaignsTable.orgId, orgId))
		.get();

	if (campaign) {
		const code = await db
			.select()
			.from(referralCodesTable)
			.where(eq(referralCodesTable.campaignId, campaign.id))
			.get();

		if (code?.isActive) {
			return code.code;
		}
	}

	// Generate new code
	return createReferralCode(db, orgId);
}
