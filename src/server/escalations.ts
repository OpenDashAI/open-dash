import { createServerFn } from "@tanstack/react-start";
import type {
	BriefingCategory,
	BriefingItem,
	BriefingPriority,
} from "../lib/briefing";

interface D1Database {
	prepare(query: string): {
		bind(...values: unknown[]): {
			all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
			run(): Promise<{ success: boolean }>;
			first<T = Record<string, unknown>>(): Promise<T | null>;
		};
	};
}

function getDB(): D1Database | null {
	const db = (process.env as Record<string, unknown>).DB as
		| D1Database
		| undefined;
	return db ?? null;
}

export interface Escalation {
	id: string;
	priority: BriefingPriority;
	category: BriefingCategory;
	title: string;
	detail?: string;
	brand?: string;
	source: string;
	action?: string;
	actionUrl?: string;
	requiresApproval: boolean;
	status: "pending" | "approved" | "rejected" | "dismissed";
	decision?: string;
	decidedAt?: string;
	createdAt: string;
}

interface EscalationRow {
	id: string;
	priority: string;
	category: string;
	title: string;
	detail: string | null;
	brand: string | null;
	source: string;
	action: string | null;
	action_url: string | null;
	requires_approval: number;
	status: string;
	decision: string | null;
	decided_at: string | null;
	created_at: string;
}

function rowToEscalation(row: EscalationRow): Escalation {
	return {
		id: row.id,
		priority: row.priority as BriefingPriority,
		category: row.category as BriefingCategory,
		title: row.title,
		detail: row.detail ?? undefined,
		brand: row.brand ?? undefined,
		source: row.source,
		action: row.action ?? undefined,
		actionUrl: row.action_url ?? undefined,
		requiresApproval: row.requires_approval === 1,
		status: row.status as Escalation["status"],
		decision: row.decision ?? undefined,
		decidedAt: row.decided_at ?? undefined,
		createdAt: row.created_at,
	};
}

/** Get all pending escalations as briefing items */
export const getPendingEscalations = createServerFn(
	{ method: "POST" },
	async (request: Request, context: any): Promise<BriefingItem[]> => {
		const db = getDB();
		if (!db) return [];

		try {
			const { results } = await db
				.prepare(
					"SELECT * FROM escalations WHERE status = 'pending' ORDER BY CASE priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'normal' THEN 2 ELSE 3 END, created_at DESC LIMIT 50",
				)
				.bind()
				.all<EscalationRow>();

			return results.map((row) => ({
				id: `esc-${row.id}`,
				priority: row.priority as BriefingPriority,
				category: row.category as BriefingCategory,
				title: row.title,
				detail: row.detail ?? undefined,
				brand: row.brand ?? undefined,
				time: row.created_at,
				action: row.requires_approval ? "Approve" : (row.action ?? "View"),
				actionUrl: row.action_url ?? undefined,
			}));
		} catch {
			return [];
		}
	},
);

/** Create a new escalation (called by SM webhook or internal) */
export const createEscalation = createServerFn(
	{ method: "POST" },
	async (request: Request, context: any): Promise<{ success: boolean; id: string }> => {
		const data = (await request.json()) as {
			id?: string;
			priority?: BriefingPriority;
			category?: BriefingCategory;
			title: string;
			detail?: string;
			brand?: string;
			source?: string;
			action?: string;
			actionUrl?: string;
			requiresApproval?: boolean;
		};
		const db = getDB();
		const id =
			data.id ?? `esc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
		if (!db) return { success: false, id };

		try {
			await db
				.prepare(
					"INSERT INTO escalations (id, priority, category, title, detail, brand, source, action, action_url, requires_approval) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
				)
				.bind(
					id,
					data.priority ?? "normal",
					data.category ?? "health",
					data.title,
					data.detail ?? null,
					data.brand ?? null,
					data.source ?? "system",
					data.action ?? null,
					data.actionUrl ?? null,
					data.requiresApproval ? 1 : 0,
				)
				.run();

			return { success: true, id };
		} catch {
			return { success: false, id };
		}
	},
);

/** Resolve an escalation (approve, reject, or dismiss) */
export const resolveEscalation = createServerFn({ method: "POST" }).handler(
	async ({
		data,
	}: {
		data: {
			id: string;
			decision: "approved" | "rejected" | "dismissed";
		};
	}): Promise<{ success: boolean }> => {
		const db = getDB();
		if (!db) return { success: false };

		// Strip the "esc-" prefix if present (briefing items prefix it)
		const dbId = data.id.startsWith("esc-") ? data.id.slice(4) : data.id;

		try {
			await db
				.prepare(
					"UPDATE escalations SET status = ?, decision = ?, decided_at = datetime('now'), updated_at = datetime('now') WHERE id = ?",
				)
				.bind(data.decision, data.decision, dbId)
				.run();

			return { success: true };
		} catch {
			return { success: false };
		}
	},
);
