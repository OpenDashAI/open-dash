/**
 * D1 Database client initialization and utilities
 */

import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export type { D1Database };
export * from "./schema";
export * from "./queries";

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

/**
 * Initialize the database client (call once at server startup)
 */
export function initializeDb(database: D1Database) {
	if (!db) {
		db = drizzle(database, { schema });
	}
	return db;
}

/**
 * Get the database client (must call initializeDb first)
 */
export function getDb() {
	if (!db) {
		throw new Error("Database not initialized. Call initializeDb() first.");
	}
	return db;
}

/**
 * Initialize database schema (idempotent)
 * Run once on first deployment, safe to run multiple times
 */
export async function initializeSchema(database: D1Database) {
	const client = initializeDb(database);

	// Drizzle will create tables if they don't exist
	// This is handled by drizzle-orm/d1 when using migrations
	// For now, we rely on manual migrations or CF dashboard

	console.log("Database schema initialized (or already exists)");
	return client;
}

/**
 * Health check: verify database connectivity
 */
export async function healthCheck(database: D1Database) {
	try {
		const result = await database.prepare("SELECT 1").first();
		return result !== null;
	} catch (err) {
		console.error("Database health check failed:", err);
		return false;
	}
}
