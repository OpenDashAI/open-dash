/**
 * HudSocket Durable Object — WebSocket hub for real-time HUD updates.
 * All browser tabs connect here. Server-side events broadcast to all clients.
 */
export class HudSocket {
	private state: DurableObjectState;
	private sessions: Set<WebSocket> = new Set();

	constructor(state: DurableObjectState) {
		this.state = state;
		// Restore any hibernated WebSockets
		for (const ws of this.state.getWebSockets()) {
			this.sessions.add(ws);
		}
	}

	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);

		// WebSocket upgrade
		if (request.headers.get("Upgrade") === "websocket") {
			const pair = new WebSocketPair();
			const [client, server] = Object.values(pair);

			this.state.acceptWebSocket(server);
			this.sessions.add(server);

			return new Response(null, { status: 101, webSocket: client });
		}

		// POST /broadcast — push an event to all connected clients
		if (request.method === "POST" && url.pathname === "/broadcast") {
			const body = await request.text();
			this.broadcast(body);
			return new Response("ok");
		}

		// GET /connections — connection count for diagnostics
		if (url.pathname === "/connections") {
			return Response.json({ connections: this.sessions.size });
		}

		return new Response("not found", { status: 404 });
	}

	webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): void {
		// Handle client messages
		if (typeof message !== "string") return;

		try {
			const data = JSON.parse(message) as { type: string; payload?: unknown };

			switch (data.type) {
				case "ping":
					ws.send(JSON.stringify({ type: "pong" }));
					break;
				case "broadcast":
					// Client-initiated broadcast (e.g., mode change from one tab)
					this.broadcast(message, ws);
					break;
			}
		} catch {
			// Ignore malformed messages
		}
	}

	webSocketClose(ws: WebSocket): void {
		this.sessions.delete(ws);
	}

	webSocketError(ws: WebSocket): void {
		this.sessions.delete(ws);
	}

	private broadcast(message: string, exclude?: WebSocket): void {
		for (const ws of this.sessions) {
			if (ws === exclude) continue;
			try {
				ws.send(message);
			} catch {
				// Dead connection — clean up
				this.sessions.delete(ws);
			}
		}
	}
}
