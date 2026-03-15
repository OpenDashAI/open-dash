import { createServerFn } from "@tanstack/react-start";

function getBrowserAgent(): { url: string; key: string } | null {
	const url = process.env.BROWSER_AGENT_URL;
	const key = process.env.BROWSER_AGENT_KEY;
	if (!url || !key) return null;
	return { url, key };
}

async function browserFetch(
	path: string,
	body?: unknown,
): Promise<unknown> {
	const agent = getBrowserAgent();
	if (!agent) throw new Error("BROWSER_AGENT not configured");

	const res = await fetch(`${agent.url}${path}`, {
		method: body ? "POST" : "GET",
		headers: {
			"X-Auth-Key": agent.key,
			"Content-Type": "application/json",
		},
		body: body ? JSON.stringify(body) : undefined,
	});

	if (!res.ok) {
		const err = await res.text();
		throw new Error(`browser-agent ${res.status}: ${err}`);
	}

	return res.json();
}

export interface BrowserSessionResult {
	sessionId: string;
	status: string;
	url: string | null;
	title?: string;
	screenshotUrl: string | null;
	timestamp?: string;
	evalResult?: unknown;
}

function toResult(
	sessionId: string,
	data: Record<string, unknown>,
): BrowserSessionResult {
	const agent = getBrowserAgent();
	const screenshotKey = data.screenshotKey as string | undefined;
	return {
		sessionId,
		status: (data.status as string) ?? "unknown",
		url: (data.url as string) ?? null,
		title: data.title as string | undefined,
		screenshotUrl: screenshotKey
			? `${agent?.url}/screenshots/${screenshotKey}`
			: null,
		timestamp: (data.timestamp as string) ?? new Date().toISOString(),
		evalResult: data.evalResult,
	};
}

/** Launch or reconnect to a browser session */
export const browserLaunch = createServerFn({ method: "POST" }).handler(
	async ({
		data,
	}: {
		data: {
			sessionId?: string;
			url?: string;
			viewport?: { width: number; height: number };
			cookies?: Array<{
				name: string;
				value: string;
				domain: string;
				path?: string;
			}>;
		};
	}): Promise<BrowserSessionResult> => {
		const result = (await browserFetch("/sessions", {
			sessionId: data.sessionId,
			url: data.url,
			viewport: data.viewport,
			cookies: data.cookies,
		})) as Record<string, unknown>;

		return toResult(result.sessionId as string, result);
	},
);

/** Navigate to a URL */
export const browserNavigate = createServerFn({ method: "POST" }).handler(
	async ({
		data,
	}: {
		data: { sessionId: string; url: string };
	}): Promise<BrowserSessionResult> => {
		const result = (await browserFetch(
			`/sessions/${data.sessionId}/navigate`,
			{ url: data.url },
		)) as Record<string, unknown>;
		return toResult(data.sessionId, result);
	},
);

/** Take a screenshot */
export const browserScreenshot = createServerFn({ method: "POST" }).handler(
	async ({
		data,
	}: {
		data: { sessionId: string };
	}): Promise<BrowserSessionResult> => {
		const result = (await browserFetch(
			`/sessions/${data.sessionId}/screenshot`,
			{},
		)) as Record<string, unknown>;
		return toResult(data.sessionId, result);
	},
);

/** Click an element or coordinate */
export const browserClick = createServerFn({ method: "POST" }).handler(
	async ({
		data,
	}: {
		data: { sessionId: string; selector?: string; x?: number; y?: number };
	}): Promise<BrowserSessionResult> => {
		const result = (await browserFetch(
			`/sessions/${data.sessionId}/click`,
			{ selector: data.selector, x: data.x, y: data.y },
		)) as Record<string, unknown>;
		return toResult(data.sessionId, result);
	},
);

/** Type text into an element */
export const browserType = createServerFn({ method: "POST" }).handler(
	async ({
		data,
	}: {
		data: {
			sessionId: string;
			selector: string;
			text: string;
			pressEnter?: boolean;
		};
	}): Promise<BrowserSessionResult> => {
		const result = (await browserFetch(
			`/sessions/${data.sessionId}/type`,
			{
				selector: data.selector,
				text: data.text,
				pressEnter: data.pressEnter,
			},
		)) as Record<string, unknown>;
		return toResult(data.sessionId, result);
	},
);

/** Execute JavaScript in the browser */
export const browserEvaluate = createServerFn({ method: "POST" }).handler(
	async ({
		data,
	}: {
		data: { sessionId: string; script: string };
	}): Promise<BrowserSessionResult> => {
		const result = (await browserFetch(
			`/sessions/${data.sessionId}/evaluate`,
			{ script: data.script },
		)) as Record<string, unknown>;
		return toResult(data.sessionId, result);
	},
);

/** Scroll the page */
export const browserScroll = createServerFn({ method: "POST" }).handler(
	async ({
		data,
	}: {
		data: { sessionId: string; direction: "up" | "down"; amount?: number };
	}): Promise<BrowserSessionResult> => {
		const result = (await browserFetch(
			`/sessions/${data.sessionId}/scroll`,
			{ direction: data.direction, amount: data.amount },
		)) as Record<string, unknown>;
		return toResult(data.sessionId, result);
	},
);

/** Close a browser session */
export const browserClose = createServerFn({ method: "POST" }).handler(
	async ({
		data,
	}: {
		data: { sessionId: string };
	}): Promise<{ closed: boolean }> => {
		const result = (await browserFetch(
			`/sessions/${data.sessionId}/close`,
			{},
		)) as Record<string, unknown>;
		return { closed: Boolean(result.closed) };
	},
);
