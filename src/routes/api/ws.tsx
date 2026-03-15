import { createFileRoute } from "@tanstack/react-router";

interface DurableObjectNamespace {
	idFromName(name: string): { toString(): string };
	get(id: { toString(): string }): { fetch(req: Request): Promise<Response> };
}

function getHudSocket(): DurableObjectNamespace | null {
	const ns = (process.env as Record<string, unknown>).HUD_SOCKET as
		| DurableObjectNamespace
		| undefined;
	return ns ?? null;
}

export const Route = createFileRoute("/api/ws")({
	server: {
		handlers: {
			/** GET /api/ws — WebSocket upgrade, forwarded to HudSocket DO */
			GET: async ({ request }) => {
				if (request.headers.get("Upgrade") !== "websocket") {
					return new Response("Expected WebSocket upgrade", { status: 426 });
				}

				const ns = getHudSocket();
				if (!ns) {
					return new Response("HUD_SOCKET binding not available", {
						status: 503,
					});
				}

				// Single global DO instance (all clients share one hub)
				const id = ns.idFromName("global");
				const stub = ns.get(id);

				// Forward the WebSocket upgrade request to the DO
				return stub.fetch(request);
			},
		},
	},
});
