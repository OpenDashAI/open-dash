/**
 * Agent & Runner Status API
 *
 * GET /api/agent-status — Proxies to atlas-serve to fetch consolidated
 * status for all 5 board agents, runners (Providence, Stargate), and Jane health.
 */

import { createFileRoute } from "@tanstack/react-router";

const ATLAS_BASE = "https://atlas-serve.apiservices.workers.dev";

const AGENTS = [
	{ name: "hephaestus", label: "CTO", domain: "eng" },
	{ name: "kong-ming", label: "COO", domain: "ops" },
	{ name: "hermes", label: "CMO", domain: "brand" },
	{ name: "gongming", label: "CFO", domain: "finance" },
	{ name: "athena", label: "CEO", domain: "all" },
] as const;

const RUNNERS = [
	{ name: "providence", label: "Providence" },
	{ name: "stargate", label: "Stargate" },
] as const;

export const Route = createFileRoute("/api/agent-status")({
	server: {
		handlers: {
			GET: async () => {
				// Fetch events for all 5 board agents in parallel
				const agentResults = await Promise.allSettled(
					AGENTS.map(async (agent) => {
						const eventsRes = await fetch(
							`${ATLAS_BASE}/agent/${agent.name}/events`,
						);
						const events = eventsRes.ok
							? await eventsRes.json<{
									events?: Array<{
										type: string;
										ts: string;
										data?: Record<string, unknown>;
									}>;
								}>()
							: { events: [] };
						const lastEvent = events.events?.slice(-1)[0] ?? null;

						return {
							...agent,
							status:
								lastEvent?.type === "heartbeat"
									? "ok"
									: lastEvent?.type === "cycle_error"
										? "error"
										: "unknown",
							lastEvent: lastEvent
								? {
										type: lastEvent.type,
										timestamp: lastEvent.ts,
										summary:
											(lastEvent.data?.summary as string | undefined)?.slice(
												0,
												200,
											) ??
											(lastEvent.data?.error as string | undefined) ??
											null,
									}
								: null,
						};
					}),
				);

				const agents = agentResults.map((r, i) =>
					r.status === "fulfilled"
						? r.value
						: { ...AGENTS[i], status: "unreachable", lastEvent: null },
				);

				// Fetch runner status in parallel
				const runnerResults = await Promise.allSettled(
					RUNNERS.map(async (runner) => {
						const res = await fetch(
							`${ATLAS_BASE}/runner/${runner.name}/status`,
						);
						const data = res.ok
							? await res.json<Record<string, unknown>>()
							: null;

						return {
							...runner,
							status: res.ok ? "ok" : "unreachable",
							data,
						};
					}),
				);

				const runners = runnerResults.map((r, i) =>
					r.status === "fulfilled"
						? r.value
						: { ...RUNNERS[i], status: "unreachable", data: null },
				);

				// Jane health
				let jane: Record<string, unknown> | null = null;
				try {
					const janeRes = await fetch(`${ATLAS_BASE}/jane/context`);
					if (janeRes.ok) jane = await janeRes.json<Record<string, unknown>>();
				} catch {
					// Jane unavailable — leave null
				}

				return new Response(
					JSON.stringify({
						agents,
						runners,
						jane,
						timestamp: new Date().toISOString(),
					}),
					{
						status: 200,
						headers: {
							"Content-Type": "application/json",
							"Access-Control-Allow-Origin": "*",
						},
					},
				);
			},
		},
	},
});
