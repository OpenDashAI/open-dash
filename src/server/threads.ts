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

export interface ThreadSummary {
	id: string;
	title: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface StoredMessage {
	id: string;
	role: "user" | "assistant";
	parts: Array<{ type: string; text?: string }>;
	createdAt: string;
}

/** List all threads, most recent first. */
export const listThreads = createServerFn(
	{ method: "POST" },
	async (request: Request, context: any): Promise<ThreadSummary[]> => {
		const db = getDB();
		if (!db)
			return [
				{ id: "default", title: "Default", createdAt: "", updatedAt: "" },
			];

		try {
			const { results } = await db
				.prepare("SELECT * FROM threads ORDER BY updated_at DESC LIMIT 50")
				.all<{
					id: string;
					title: string | null;
					created_at: string;
					updated_at: string;
				}>();

			// Always ensure 'default' thread exists in list
			const hasDefault = results.some((r) => r.id === "default");
			const threads = results.map((r) => ({
				id: r.id,
				title: r.title,
				createdAt: r.created_at,
				updatedAt: r.updated_at,
			}));
			if (!hasDefault) {
				threads.unshift({
					id: "default",
					title: "Default",
					createdAt: "",
					updatedAt: "",
				});
			}
			return threads;
		} catch {
			return [
				{ id: "default", title: "Default", createdAt: "", updatedAt: "" },
			];
		}
	},
);

/** Load messages for a thread from D1. Returns empty array if DB unavailable. */
export const getThreadMessages = createServerFn(
	{ method: "POST" },
	async (request: Request, context: any): Promise<StoredMessage[]> => {
		const threadId = (await request.json()) as string;
		const db = getDB();
		if (!db) return [];

		try {
			const { results } = await db
				.prepare(
					"SELECT * FROM messages WHERE thread_id = ? ORDER BY created_at ASC",
				)
				.bind(threadId)
				.all<{
					id: string;
					thread_id: string;
					role: string;
					parts: string;
					created_at: string;
				}>();

			return results.map((r) => ({
				id: r.id,
				role: r.role as "user" | "assistant",
				parts: JSON.parse(r.parts),
				createdAt: r.created_at,
			}));
		} catch {
			return [];
		}
	},
);

export interface SaveMessageInput {
	threadId: string;
	messageId: string;
	role: string;
	parts: unknown[];
	title?: string;
}

/** Save a message to D1 and upsert the thread. */
export const saveMessage = createServerFn({ method: "POST" }).handler(
	async ({
		data,
	}: {
		data: SaveMessageInput;
	}): Promise<{ success: boolean }> => {
		const db = getDB();
		if (!db) return { success: false };

		try {
			// Upsert thread
			await db
				.prepare(
					`INSERT INTO threads (id, title, created_at, updated_at) VALUES (?, ?, datetime('now'), datetime('now'))
				 ON CONFLICT(id) DO UPDATE SET updated_at = datetime('now'), title = COALESCE(excluded.title, threads.title)`,
				)
				.bind(data.threadId, data.title ?? null)
				.run();

			// Insert message
			await db
				.prepare(
					"INSERT OR REPLACE INTO messages (id, thread_id, role, parts, created_at) VALUES (?, ?, ?, ?, datetime('now'))",
				)
				.bind(
					data.messageId,
					data.threadId,
					data.role,
					JSON.stringify(data.parts),
				)
				.run();

			return { success: true };
		} catch {
			return { success: false };
		}
	},
);

/** Update a thread's title. */
export const updateThreadTitle = createServerFn({ method: "POST" }).handler(
	async ({
		data,
	}: {
		data: { threadId: string; title: string };
	}): Promise<{ success: boolean }> => {
		const db = getDB();
		if (!db) return { success: false };

		try {
			await db
				.prepare(
					"UPDATE threads SET title = ?, updated_at = datetime('now') WHERE id = ?",
				)
				.bind(data.title, data.threadId)
				.run();
			return { success: true };
		} catch {
			return { success: false };
		}
	},
);
