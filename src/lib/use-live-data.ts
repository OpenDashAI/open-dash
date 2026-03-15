import { useCallback, useEffect, useRef } from "react";
import { getActivity, getMetrics } from "../server/activity";
import { getBriefing } from "../server/briefing";
import { getIssues } from "../server/issues";
import { getMachines } from "../server/machines";
import type { BriefingItem } from "./briefing";
import {
	setBriefingItems,
	setEvents,
	setIssues,
	setMachines,
	setMetrics,
} from "./hud-store";

const POLL_INTERVAL = 60_000; // 60s fallback (was 15s before WebSocket)
const WS_RECONNECT_DELAY = 3_000;
const WS_PING_INTERVAL = 30_000;

/**
 * Live data hook — WebSocket primary, polling fallback.
 * WebSocket receives push events from HudSocket DO.
 * Polling runs at 60s as a safety net (was 15s before WS).
 */
export function useLiveData() {
	const wsRef = useRef<WebSocket | null>(null);
	const intervalRef = useRef<ReturnType<typeof setInterval>>();
	const pingRef = useRef<ReturnType<typeof setInterval>>();
	const reconnectRef = useRef<ReturnType<typeof setTimeout>>();
	const mountedRef = useRef(true);

	const fetchAll = useCallback(async () => {
		try {
			const [machines, events, metrics, issues] = await Promise.all([
				getMachines(),
				getActivity(),
				getMetrics(),
				getIssues(),
			]);
			setMachines(machines);
			setEvents(events);
			setMetrics(metrics);
			setIssues(issues);

			// Regenerate briefing with fresh data
			const briefing = await getBriefing({
				data: { machines, brands: [], issues, events },
			});
			setBriefingItems(briefing);
		} catch {
			// Silently fail — display stale data
		}
	}, []);

	const connectWebSocket = useCallback(() => {
		if (!mountedRef.current) return;
		if (wsRef.current?.readyState === WebSocket.OPEN) return;

		const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
		const ws = new WebSocket(`${protocol}//${window.location.host}/api/ws`);

		ws.onopen = () => {
			// WebSocket connected — slow down polling
			if (intervalRef.current) clearInterval(intervalRef.current);
			intervalRef.current = setInterval(fetchAll, POLL_INTERVAL);

			// Start ping heartbeat
			pingRef.current = setInterval(() => {
				if (ws.readyState === WebSocket.OPEN) {
					ws.send(JSON.stringify({ type: "ping" }));
				}
			}, WS_PING_INTERVAL);
		};

		ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data) as {
					type: string;
					payload?: unknown;
				};

				switch (data.type) {
					case "refresh":
						// Server signals data has changed — fetch fresh data
						fetchAll();
						break;
					case "escalation": {
						// L2 pushed a new escalation — add to briefing immediately
						const esc = data.payload as {
							id: string;
							priority?: string;
							category?: string;
							title: string;
							detail?: string;
							brand?: string;
							action?: string;
							actionUrl?: string;
							requiresApproval?: boolean;
						};
						if (esc?.title) {
							const item: BriefingItem = {
								id: `esc-${esc.id}`,
								priority:
									(esc.priority as BriefingItem["priority"]) ?? "normal",
								category:
									(esc.category as BriefingItem["category"]) ?? "health",
								title: esc.title,
								detail: esc.detail,
								brand: esc.brand,
								time: new Date().toISOString(),
								action: esc.requiresApproval
									? "Approve"
									: (esc.action ?? "View"),
								actionUrl: esc.actionUrl,
							};
							// Prepend to current briefing items
							setBriefingItems([item]);
						}
						break;
					}
					case "pong":
						// Heartbeat response — connection alive
						break;
				}
			} catch {
				// Ignore malformed messages
			}
		};

		ws.onclose = () => {
			wsRef.current = null;
			if (pingRef.current) clearInterval(pingRef.current);

			if (mountedRef.current) {
				// Reconnect after delay
				reconnectRef.current = setTimeout(connectWebSocket, WS_RECONNECT_DELAY);

				// Resume fast polling while disconnected
				if (intervalRef.current) clearInterval(intervalRef.current);
				intervalRef.current = setInterval(fetchAll, 15_000);
			}
		};

		ws.onerror = () => {
			ws.close();
		};

		wsRef.current = ws;
	}, [fetchAll]);

	useEffect(() => {
		mountedRef.current = true;

		// Initial fetch
		fetchAll();

		// Start polling (will be slowed down when WebSocket connects)
		intervalRef.current = setInterval(fetchAll, 15_000);

		// Attempt WebSocket connection
		connectWebSocket();

		const onVisibilityChange = () => {
			if (document.hidden) {
				// Pause polling when tab hidden
				if (intervalRef.current) clearInterval(intervalRef.current);
			} else {
				// Tab visible again — fetch and reconnect if needed
				fetchAll();
				if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
					connectWebSocket();
				}
				intervalRef.current = setInterval(
					fetchAll,
					wsRef.current?.readyState === WebSocket.OPEN ? POLL_INTERVAL : 15_000,
				);
			}
		};

		const onOnline = () => {
			fetchAll();
			connectWebSocket();
		};

		document.addEventListener("visibilitychange", onVisibilityChange);
		window.addEventListener("online", onOnline);

		return () => {
			mountedRef.current = false;
			if (intervalRef.current) clearInterval(intervalRef.current);
			if (pingRef.current) clearInterval(pingRef.current);
			if (reconnectRef.current) clearTimeout(reconnectRef.current);
			if (wsRef.current) wsRef.current.close();
			document.removeEventListener("visibilitychange", onVisibilityChange);
			window.removeEventListener("online", onOnline);
		};
	}, [fetchAll, connectWebSocket]);
}
