/**
 * User management server functions.
 * Handles user creation, updates, and queries for Clerk-authenticated users.
 */

import { getWorkerContext } from "../lib/worker-context";

export interface UserRecord {
	id: string;
	clerkId: string;
	email: string;
	firstName?: string;
	lastName?: string;
	avatar?: string;
	lastLogin: number;
	createdAt: number;
	updatedAt: number;
}

/**
 * Create or update user record in D1.
 * Called after Clerk signup or during first login.
 */
export async function upsertUser(userData: {
	clerkId: string;
	email: string;
	firstName?: string;
	lastName?: string;
	avatar?: string;
}): Promise<UserRecord | null> {
	const db = getWorkerContext();
	if (!db) {
		console.error("D1 database not available");
		return null;
	}

	try {
		const userId = `user-${userData.clerkId}`;
		const now = Date.now();

		// Check if user exists
		const existing = await db
			.prepare("SELECT * FROM users WHERE clerkId = ? LIMIT 1")
			.bind(userData.clerkId)
			.first<UserRecord>();

		if (existing) {
			// Update lastLogin
			await db
				.prepare(
					"UPDATE users SET lastLogin = ?, updatedAt = ? WHERE clerkId = ?",
				)
				.bind(now, now, userData.clerkId)
				.run();

			return { ...existing, lastLogin: now, updatedAt: now };
		}

		// Create new user
		await db
			.prepare(
				`INSERT INTO users (id, clerkId, email, firstName, lastName, avatar, lastLogin, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			)
			.bind(
				userId,
				userData.clerkId,
				userData.email,
				userData.firstName ?? null,
				userData.lastName ?? null,
				userData.avatar ?? null,
				now,
				now,
				now,
			)
			.run();

		return {
			id: userId,
			clerkId: userData.clerkId,
			email: userData.email,
			firstName: userData.firstName,
			lastName: userData.lastName,
			avatar: userData.avatar,
			lastLogin: now,
			createdAt: now,
			updatedAt: now,
		};
	} catch (err) {
		console.error("Failed to upsert user:", err);
		return null;
	}
}

/**
 * Get user by Clerk ID.
 */
export async function getUserByClerkId(
	clerkId: string,
): Promise<UserRecord | null> {
	const db = getWorkerContext();
	if (!db) return null;

	try {
		const user = await db
			.prepare("SELECT * FROM users WHERE clerkId = ? LIMIT 1")
			.bind(clerkId)
			.first<UserRecord>();

		return user ?? null;
	} catch (err) {
		console.error("Failed to get user:", err);
		return null;
	}
}

/**
 * Check if email has already been onboarded.
 */
export async function hasEmailBeenSent(
	userId: string,
	emailType: "welcome" | "setup_reminder" | "feature_discovery",
): Promise<boolean> {
	const db = getWorkerContext();
	if (!db) return false;

	try {
		const result = await db
			.prepare("SELECT id FROM emails_sent WHERE userId = ? AND emailType = ?")
			.bind(userId, emailType)
			.first();

		return !!result;
	} catch (err) {
		console.error("Failed to check email sent:", err);
		return false;
	}
}

/**
 * Mark email as sent.
 */
export async function markEmailSent(
	userId: string,
	emailType: "welcome" | "setup_reminder" | "feature_discovery",
): Promise<boolean> {
	const db = getWorkerContext();
	if (!db) return false;

	try {
		await db
			.prepare(
				`INSERT INTO emails_sent (id, userId, emailType, sentAt)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(userId, emailType) DO NOTHING`,
			)
			.bind(
				`email-${userId}-${emailType}`,
				userId,
				emailType,
				Date.now(),
			)
			.run();

		return true;
	} catch (err) {
		console.error("Failed to mark email sent:", err);
		return false;
	}
}
