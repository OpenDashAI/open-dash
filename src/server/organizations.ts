/**
 * Organization management operations for B2B multi-tenant platform
 *
 * Handles:
 * - Creating organizations
 * - Managing team members (invite, accept, remove)
 * - Managing brands
 * - Tier limit enforcement
 */

import { randomUUID } from "crypto";
import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";
import {
	createOrganization,
	addTeamMember,
	getTeamMembers,
	getOrganizationBySlug,
	createBrand,
	getBrandsByOrg,
} from "@/lib/db/queries";
import type {
	OrganizationInsert,
	TeamMemberInsert,
	BrandInsert,
} from "@/lib/db/schema";

/**
 * Tier limits by plan
 */
export const TIER_LIMITS = {
	starter: {
		brands: 3,
		users: 3,
		competitors_per_brand: 5,
		keywords_per_competitor: 10,
		alerts: 5,
	},
	pro: {
		brands: 10,
		users: 10,
		competitors_per_brand: 20,
		keywords_per_competitor: 50,
		alerts: 50,
	},
	enterprise: {
		brands: 999,
		users: 999,
		competitors_per_brand: 999,
		keywords_per_competitor: 999,
		alerts: 999,
	},
};

/**
 * Create new organization
 *
 * Called on:
 * 1. User signup (creates default org)
 * 2. User creates org via dashboard
 */
export async function createOrgForUser(
	db: D1Database,
	userId: string,
	orgName: string,
	clerkId?: string
): Promise<{ orgId: string; slug: string }> {
	const drizzleDb = drizzle(db);

	const orgId = randomUUID();
	const slug = sanitizeSlug(orgName);

	// Verify slug is unique
	const existing = await getOrganizationBySlug(drizzleDb, slug);
	if (existing.length > 0) {
		throw new Error(`Slug "${slug}" already in use`);
	}

	const org: OrganizationInsert = {
		id: orgId,
		clerkId: clerkId || undefined,
		name: orgName,
		slug,
		plan: "starter", // Default plan for new orgs
		createdAt: Date.now(),
		updatedAt: Date.now(),
	};

	await createOrganization(drizzleDb, org);

	// Add creator as owner
	const memberId = randomUUID();
	const member: TeamMemberInsert = {
		id: memberId,
		orgId,
		userId,
		role: "owner",
		invitedBy: userId, // Self-added
		invitedAt: Date.now(),
		acceptedAt: Date.now(), // Already accepted
		active: true,
		createdAt: Date.now(),
		updatedAt: Date.now(),
	};

	await addTeamMember(drizzleDb, member);

	return { orgId, slug };
}

/**
 * Invite user to organization
 *
 * Creates pending invitation (acceptedAt = null)
 * Email sent separately via Resend
 */
export async function inviteUserToOrg(
	db: D1Database,
	orgId: string,
	email: string,
	role: "editor" | "viewer",
	invitedByUserId: string
): Promise<{ memberId: string; email: string; status: "pending" }> {
	const drizzleDb = drizzle(db);

	// NOTE: In production, you'd:
	// 1. Check if email matches existing user (via Clerk)
	// 2. If user exists, create team member
	// 3. If user doesn't exist, create invite record + send email with signup link
	// For MVP, simplified to just create team member with NULL userId

	const memberId = randomUUID();
	// Using a deterministic placeholder for invitedUserId
	// In production, this would be the Clerk user ID after signup
	const invitedUserId = `pending-${randomUUID()}`;

	const member: TeamMemberInsert = {
		id: memberId,
		orgId,
		userId: invitedUserId, // Placeholder until user signs up
		role,
		invitedBy: invitedByUserId,
		invitedAt: Date.now(),
		acceptedAt: null, // Pending acceptance
		active: true,
		createdAt: Date.now(),
		updatedAt: Date.now(),
	};

	await addTeamMember(drizzleDb, member);

	return { memberId, email, status: "pending" };
}

/**
 * Enforce tier limits before creating resource
 */
export function checkTierLimit(
	plan: string,
	resource: "brands" | "users" | "competitors_per_brand" | "keywords_per_competitor" | "alerts",
	currentCount: number
): { allowed: boolean; limit: number; message?: string } {
	const limits = TIER_LIMITS[plan as keyof typeof TIER_LIMITS];
	if (!limits) {
		return { allowed: false, limit: 0, message: `Unknown plan: ${plan}` };
	}

	const limit = limits[resource as keyof typeof limits];
	const allowed = currentCount < limit;

	if (!allowed) {
		return {
			allowed: false,
			limit,
			message: `${plan} plan limited to ${limit} ${resource}`,
		};
	}

	return { allowed: true, limit };
}

/**
 * Create brand with tier limit enforcement
 */
export async function createBrandInOrg(
	db: D1Database,
	orgId: string,
	plan: string,
	brandData: {
		name: string;
		domain: string;
		logo?: string;
		datasources?: string[];
		competitors?: string[];
		keywords?: string[];
	}
): Promise<{ brandId: string; slug: string }> {
	const drizzleDb = drizzle(db);

	// Get existing brands
	const existingBrands = await getBrandsByOrg(drizzleDb, orgId);

	// Check tier limit
	const limitCheck = checkTierLimit(plan, "brands", existingBrands.length);
	if (!limitCheck.allowed) {
		throw new Error(limitCheck.message);
	}

	const brandId = randomUUID();
	const slug = sanitizeSlug(brandData.name);

	const brand: BrandInsert = {
		id: brandId,
		orgId,
		name: brandData.name,
		slug,
		domain: brandData.domain,
		logo: brandData.logo,
		datasources: JSON.stringify(brandData.datasources || []),
		competitors: JSON.stringify(brandData.competitors || []),
		keywords: JSON.stringify(brandData.keywords || []),
		active: true,
		archived: false,
		createdAt: Date.now(),
		updatedAt: Date.now(),
	};

	await createBrand(drizzleDb, brand);

	return { brandId, slug };
}

/**
 * Sanitize string for use as slug
 *
 * Converts "Nike Store" → "nike-store"
 */
function sanitizeSlug(input: string): string {
	return input
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with dash
		.replace(/^-+|-+$/g, "") // Remove leading/trailing dashes
		.substring(0, 50); // Limit length
}

/**
 * Validate org slug
 */
export function isValidSlug(slug: string): boolean {
	// Must be 3-50 chars, alphanumeric + dashes, no leading/trailing dashes
	const regex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
	return regex.test(slug) && slug.length >= 3 && slug.length <= 50;
}

/**
 * Validate brand domain
 */
export function isValidDomain(domain: string): boolean {
	try {
		new URL(`https://${domain}`);
		return true;
	} catch {
		return false;
	}
}

/**
 * Prepare org data for API response (exclude sensitive fields)
 */
export function sanitizeOrgResponse(org: any) {
	return {
		id: org.id,
		name: org.name,
		slug: org.slug,
		plan: org.plan,
		website: org.website,
		logo: org.logo,
		createdAt: org.createdAt,
		updatedAt: org.updatedAt,
		// Do NOT return stripeCustomerId, stripeSubscriptionId
	};
}

/**
 * Prepare team member data for API response
 */
export function sanitizeTeamMemberResponse(member: any) {
	return {
		id: member.id,
		orgId: member.orgId,
		userId: member.userId,
		role: member.role,
		active: member.active,
		acceptedAt: member.acceptedAt,
		invitedAt: member.invitedAt,
		// Do NOT return invitedBy (server-only)
	};
}

/**
 * Prepare brand data for API response
 */
export function sanitizeBrandResponse(brand: any) {
	return {
		id: brand.id,
		orgId: brand.orgId,
		name: brand.name,
		slug: brand.slug,
		domain: brand.domain,
		logo: brand.logo,
		favicon: brand.favicon,
		themeColor: brand.themeColor,
		datasources: tryParseJson(brand.datasources),
		competitors: tryParseJson(brand.competitors),
		keywords: tryParseJson(brand.keywords),
		active: brand.active,
		archived: brand.archived,
		createdAt: brand.createdAt,
		updatedAt: brand.updatedAt,
	};
}

/**
 * Safe JSON parse with fallback
 */
function tryParseJson(jsonString: string | null, fallback: any[] = []): any {
	if (!jsonString) return fallback;
	try {
		return JSON.parse(jsonString);
	} catch {
		return fallback;
	}
}
