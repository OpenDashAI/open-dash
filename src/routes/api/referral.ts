/**
 * Referral Code API
 *
 * POST /api/referral/validate — Validate a code (check if active, not expired, uses available)
 * POST /api/referral/redeem — Redeem a code for the current user
 *
 * Both endpoints require authentication via auth context.
 */

import { createServerFn } from "@tanstack/start";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import type { D1Database } from "@cloudflare/workers-types";

import { getRequestAuthContext } from "@/server/auth";
import {
	referralCodesTable,
	campaignsTable,
	redemptionsTable,
	referralRewardsTable,
	type RedemptionInsert,
	type ReferralRewardInsert,
} from "@/lib/db/schema";

// ============================================================================
// Input Schemas
// ============================================================================

const validateCodeSchema = z.object({
	code: z.string().length(8, "Code must be 8 characters").toUpperCase(),
});

const redeemCodeSchema = z.object({
	code: z.string().length(8, "Code must be 8 characters").toUpperCase(),
	orgId: z.string().min(1, "Organization ID required"),
});

// ============================================================================
// Validation Endpoint
// ============================================================================

export const validateCodeFn = createServerFn(
	{ method: "POST" },
	async (request: Request, context: any) => {
		const body = await request.json();
		const { code } = validateCodeSchema.parse(body);

		const db = drizzle(context.env.DB);

		// Find the code
		const referralCode = await db
			.select()
			.from(referralCodesTable)
			.where(eq(referralCodesTable.code, code))
			.get();

		if (!referralCode) {
			return {
				valid: false,
				error: "Code not found",
			};
		}

		// Check if active
		if (!referralCode.isActive) {
			return {
				valid: false,
				error: "Code is inactive",
			};
		}

		// Check if expired
		if (referralCode.expiresAt && referralCode.expiresAt < Date.now()) {
			return {
				valid: false,
				error: "Code has expired",
			};
		}

		// Check if max uses exceeded
		if (
			referralCode.maxUses &&
			referralCode.currentUses >= referralCode.maxUses
		) {
			return {
				valid: false,
				error: "Code has reached maximum uses",
			};
		}

		// Get campaign details
		const campaign = await db
			.select()
			.from(campaignsTable)
			.where(eq(campaignsTable.id, referralCode.campaignId))
			.get();

		if (!campaign) {
			return {
				valid: false,
				error: "Campaign not found",
			};
		}

		return {
			valid: true,
			discount: campaign.refereeDiscount,
			referrerReward: campaign.referrerReward,
			code: referralCode.code,
		};
	}
);

// ============================================================================
// Redemption Endpoint
// ============================================================================

export const redeemCodeFn = createServerFn(
	{ method: "POST" },
	async (request: Request, context: any) => {
		// Require authentication
		const auth = getRequestAuthContext(request);
		const userId = auth?.userId;

		if (!userId) {
			throw new Error("Unauthorized: No user context");
		}

		// Parse input
		const body = await request.json();
		const { code, orgId } = redeemCodeSchema.parse(body);

		const db = drizzle(context.env.DB);

		// Get the IP address for fraud detection
		const ipAddress = request.headers.get("cf-connecting-ip") || "unknown";

		// Find the code
		const referralCode = await db
			.select()
			.from(referralCodesTable)
			.where(eq(referralCodesTable.code, code))
			.get();

		if (!referralCode || !referralCode.isActive) {
			throw new Error("Code is invalid or inactive");
		}

		// Check expiration
		if (referralCode.expiresAt && referralCode.expiresAt < Date.now()) {
			throw new Error("Code has expired");
		}

		// Check max uses
		if (
			referralCode.maxUses &&
			referralCode.currentUses >= referralCode.maxUses
		) {
			throw new Error("Code has reached maximum uses");
		}

		// Check for duplicate redemption by same user
		const existingRedemption = await db
			.select()
			.from(redemptionsTable)
			.where(
				and(
					eq(redemptionsTable.codeId, referralCode.id),
					eq(redemptionsTable.userId, userId)
				)
			)
			.get();

		if (existingRedemption) {
			throw new Error("You have already redeemed this code");
		}

		// Get campaign
		const campaign = await db
			.select()
			.from(campaignsTable)
			.where(eq(campaignsTable.id, referralCode.campaignId))
			.get();

		if (!campaign) {
			throw new Error("Campaign not found");
		}

		// Record the redemption
		const redemptionId = `redemption_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
		const redemptionRecord: RedemptionInsert = {
			id: redemptionId,
			codeId: referralCode.id,
			userId,
			redeemedAt: Date.now(),
			discountApplied: campaign.refereeDiscount,
			status: "applied",
			ipAddress,
		};

		await db.insert(redemptionsTable).values(redemptionRecord);

		// Update code use count
		await db
			.update(referralCodesTable)
			.set({ currentUses: referralCode.currentUses + 1 })
			.where(eq(referralCodesTable.id, referralCode.id));

		// TODO: Apply discount to Stripe (if user has a Stripe customer)
		// For now, just return success
		console.log(
			`Applied $${campaign.refereeDiscount} discount to user ${userId}`
		);

		// Reward the referrer if we can identify them
		// For MVP, we need to track which user created the code
		// This would require adding creator_user_id to referral_codes table in next phase

		return {
			success: true,
			discountApplied: campaign.refereeDiscount,
			message: `Successfully redeemed! You've received $${campaign.refereeDiscount} credit.`,
		};
	}
);

// ============================================================================
// Get Campaign Info (Helper endpoint)
// ============================================================================

export const getCampaignFn = createServerFn(
	{ method: "POST" },
	async (request: Request, context: any) => {
		const body = await request.json();
		const { orgId } = z.object({ orgId: z.string() }).parse(body);

		const db = drizzle(context.env.DB);

		const campaign = await db
			.select()
			.from(campaignsTable)
			.where(eq(campaignsTable.orgId, orgId))
			.get();

		if (!campaign) {
			throw new Error("Campaign not found for organization");
		}

		// Get the code for this campaign
		const code = await db
			.select()
			.from(referralCodesTable)
			.where(eq(referralCodesTable.campaignId, campaign.id))
			.get();

		return {
			campaign,
			code: code?.code || null,
			redeemUrl: code
				? `https://opendash.ai/signup?ref=${code.code}`
				: null,
		};
	}
);
