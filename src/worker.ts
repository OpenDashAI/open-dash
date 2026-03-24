// Import TanStack Start's server entry
import startEntry from "@tanstack/react-start/server-entry";
import {
	buildClearCookie,
	getSessionCookie,
	loginPage,
	verifyClerkSession,
} from "./server/auth";
import { initWorkerContext } from "./lib/worker-context";
import { metricsTracker } from "./lib/monitoring";

// Export Durable Object classes for Cloudflare bindings
export { HudSocket } from "./server/hud-socket";

interface Env {
	HUD_SOCKET: DurableObjectNamespace;
	CLERK_SECRET_KEY: string;
	CLERK_PUBLISHABLE_KEY: string;
	ALLOWED_IPS: string; // Comma-separated IPs that bypass auth
	SM_SERVICE_KEY: string; // Service key for SM webhook auth
	DB: D1Database;
	[key: string]: unknown;
}

interface D1Database {
	prepare(query: string): {
		bind(...values: unknown[]): {
			run(): Promise<{ success: boolean }>;
		};
	};
}

type WorkerHandler = {
	fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response>;
};

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext,
	): Promise<Response> {
		try {
			// Initialize worker context with D1 database
			if (env.DB) {
				initWorkerContext(env.DB);
				metricsTracker.initialize(env.DB);
			}

			const url = new URL(request.url);
			const isSecure = url.protocol === "https:";

			// Health check — always public, minimal info
			if (url.pathname === "/health") {
				return Response.json({ status: "ok" });
			}

			// IP allowlist bypass — trusted IPs skip auth entirely
			const clientIp = request.headers.get("CF-Connecting-IP") ?? "";
			const allowedIps = env.ALLOWED_IPS
				? new Set(env.ALLOWED_IPS.split(",").map((ip) => ip.trim()))
				: new Set<string>();
			const ipAllowed = clientIp !== "" && allowedIps.has(clientIp);

			// Auth gate — Clerk session verification
			if (env.CLERK_SECRET_KEY && !ipAllowed) {
				// Public routes that don't require auth
				const publicRoutes = [
					"/login",
					"/sign-up",
					"/sign-in",
					"/landing",
					"/health",
				];
				const isPublicRoute = publicRoutes.some((route) =>
					url.pathname.startsWith(route),
				);

				// Login page (GET)
				if (url.pathname === "/login" && request.method === "GET") {
					return new Response(loginPage(), {
						headers: { "Content-Type": "text/html" },
					});
				}

				// Logout
				if (url.pathname === "/logout" && request.method === "GET") {
					return new Response(null, {
						status: 302,
						headers: {
							Location: "/login",
							"Set-Cookie": buildClearCookie(),
						},
					});
				}

				// Verify Clerk session for protected routes
				if (!isPublicRoute) {
					const sessionVerification = verifyClerkSession(request, env);
					if (!sessionVerification.valid) {
						// WebSocket and API requests get 401, browser requests redirect
						const accept = request.headers.get("Accept") ?? "";
						if (accept.includes("text/html") && request.method === "GET") {
							return new Response(null, {
								status: 302,
								headers: { Location: "/login" },
							});
						}
						return new Response("Unauthorized", { status: 401 });
					}
				}
			}

			// WebSocket upgrade — handle before TanStack Start
			if (
				url.pathname === "/api/ws" &&
				request.headers.get("Upgrade") === "websocket"
			) {
				if (!env.HUD_SOCKET) {
					return new Response("HUD_SOCKET binding not available", {
						status: 503,
					});
				}
				const id = env.HUD_SOCKET.idFromName("global");
				const stub = env.HUD_SOCKET.get(id);
				return stub.fetch(request);
			}

			// L2 → L1 webhook: SM posts escalations here
			if (url.pathname === "/api/events" && request.method === "POST") {
				// Authenticate via service key (same key SM uses)
				const serviceKey = request.headers.get("X-Service-Key");
				if (!env.SM_SERVICE_KEY || serviceKey !== env.SM_SERVICE_KEY) {
					return new Response("Unauthorized", { status: 401 });
				}

				const body = (await request.json()) as {
					id?: string;
					priority?: string;
					category?: string;
					title: string;
					detail?: string;
					brand?: string;
					source?: string;
					action?: string;
					actionUrl?: string;
					requiresApproval?: boolean;
				};

				if (!body.title) {
					return Response.json({ error: "title required" }, { status: 400 });
				}

				const id =
					body.id ??
					`esc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

				// Save to D1
				if (env.DB) {
					try {
						await env.DB.prepare(
							"INSERT INTO escalations (id, priority, category, title, detail, brand, source, action, action_url, requires_approval) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
						)
							.bind(
								id,
								body.priority ?? "normal",
								body.category ?? "health",
								body.title,
								body.detail ?? null,
								body.brand ?? null,
								body.source ?? "l2",
								body.action ?? null,
								body.actionUrl ?? null,
								body.requiresApproval ? 1 : 0,
							)
							.run();
					} catch (err) {
						console.error("D1 insert failed:", err);
					}
				}

				// Broadcast to connected browsers via DO
				if (env.HUD_SOCKET) {
					try {
						const doId = env.HUD_SOCKET.idFromName("global");
						const stub = env.HUD_SOCKET.get(doId);
						await stub.fetch(
							new Request("https://do/broadcast", {
								method: "POST",
								body: JSON.stringify({
									type: "escalation",
									payload: { id, ...body },
								}),
							}),
						);
					} catch {
						// DO broadcast is best-effort
					}
				}

				return Response.json({ success: true, id });
			}

			// Delegate to TanStack Start
			return await (startEntry as WorkerHandler).fetch(request, env, ctx);
		} catch (err) {
			console.error("Worker error:", err);
			return new Response("Internal Server Error", { status: 500 });
		}
	},
};
