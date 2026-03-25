import { createServerFn } from "@tanstack/react-start";

interface D1Database {
	prepare(query: string): {
		bind(...values: unknown[]): {
			all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
			run(): Promise<{ success: boolean }>;
		};
	};
}

function getDB(): D1Database | null {
	const db = (process.env as Record<string, unknown>).DB as
		| D1Database
		| undefined;
	return db ?? null;
}

/** Get the last time the user visited the dashboard */
export const getLastVisited = createServerFn(
	{ method: "POST" },
	async (request: Request, context: any): Promise<string | null> => {
		const db = getDB();
		if (!db) return null;

		try {
			const { results } = await db
				.prepare("SELECT value FROM user_state WHERE key = ?")
				.bind("last_visited")
				.all<{ value: string }>();
			return results[0]?.value ?? null;
		} catch {
			return null;
		}
	},
);

/** Update the last visited timestamp to now */
export const updateLastVisited = createServerFn(
	{ method: "POST" },
	async (request: Request, context: any): Promise<{ success: boolean }> => {
		const db = getDB();
		if (!db) return { success: false };

		try {
			await db
				.prepare(
					"INSERT INTO user_state (key, value, updated_at) VALUES ('last_visited', datetime('now'), datetime('now')) ON CONFLICT(key) DO UPDATE SET value = datetime('now'), updated_at = datetime('now')",
				)
				.run();
			return { success: true };
		} catch {
			return { success: false };
		}
	},
);
