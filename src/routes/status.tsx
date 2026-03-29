/**
 * Agent Status Page
 *
 * Navigate to: /status
 *
 * Displays a dashboard of all Atlas board agents, runners, and Jane health.
 */

import { createFileRoute } from "@tanstack/react-router";

// ── Types ──────────────────────────────────────────────────────────────────────

interface LastEvent {
	type: string;
	timestamp: string;
	summary: string | null;
}

interface Agent {
	name: string;
	label: string;
	domain: string;
	status: "ok" | "error" | "unknown" | "unreachable";
	lastEvent: LastEvent | null;
}

interface Runner {
	name: string;
	label: string;
	status: "ok" | "unreachable";
	data: Record<string, unknown> | null;
}

interface AgentStatusResponse {
	agents: Agent[];
	runners: Runner[];
	jane: Record<string, unknown> | null;
	timestamp: string;
}

// ── Route ─────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/status")({
	component: StatusPage,
	loader: async (): Promise<AgentStatusResponse> => {
		const res = await fetch("/api/agent-status");
		if (!res.ok) throw new Error(`Failed to fetch agent status: ${res.status}`);
		return res.json() as Promise<AgentStatusResponse>;
	},
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusColor(status: string) {
	switch (status) {
		case "ok":
			return "bg-green-500";
		case "error":
			return "bg-red-500";
		case "unreachable":
			return "bg-red-400";
		default:
			return "bg-yellow-400";
	}
}

function statusLabel(status: string) {
	switch (status) {
		case "ok":
			return "OK";
		case "error":
			return "Error";
		case "unreachable":
			return "Unreachable";
		default:
			return "Unknown";
	}
}

function formatTimestamp(ts: string | null | undefined): string {
	if (!ts) return "—";
	try {
		return new Date(ts).toLocaleString(undefined, {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	} catch {
		return ts;
	}
}

function truncate(text: string | null | undefined, max = 120): string {
	if (!text) return "—";
	return text.length > max ? `${text.slice(0, max)}…` : text;
}

// ── Components ────────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: string }) {
	return (
		<span
			className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusColor(status)}`}
			title={statusLabel(status)}
		/>
	);
}

function AgentCard({ agent }: { agent: Agent }) {
	return (
		<div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-2 shadow-sm">
			<div className="flex items-center justify-between gap-2">
				<div className="flex items-center gap-2 min-w-0">
					<StatusDot status={agent.status} />
					<span className="font-semibold text-gray-900 truncate capitalize">
						{agent.name}
					</span>
				</div>
				<div className="flex items-center gap-1.5 flex-shrink-0">
					<span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
						{agent.label}
					</span>
					<span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
						{agent.domain}
					</span>
				</div>
			</div>

			<div className="flex items-center gap-2 text-xs">
				<span
					className={`font-medium ${
						agent.status === "ok"
							? "text-green-600"
							: agent.status === "error" || agent.status === "unreachable"
								? "text-red-500"
								: "text-yellow-500"
					}`}
				>
					{statusLabel(agent.status)}
				</span>
				{agent.lastEvent && (
					<>
						<span className="text-gray-300">·</span>
						<span className="text-gray-400">{agent.lastEvent.type}</span>
						<span className="text-gray-300">·</span>
						<span className="text-gray-400">
							{formatTimestamp(agent.lastEvent.timestamp)}
						</span>
					</>
				)}
			</div>

			{agent.lastEvent?.summary && (
				<p className="text-xs text-gray-500 leading-relaxed">
					{truncate(agent.lastEvent.summary)}
				</p>
			)}

			{!agent.lastEvent && (
				<p className="text-xs text-gray-400 italic">No events recorded</p>
			)}
		</div>
	);
}

function RunnerRow({ runner }: { runner: Runner }) {
	return (
		<div className="flex items-center gap-3 py-2 px-3 border border-gray-200 rounded-lg bg-white">
			<StatusDot status={runner.status} />
			<span className="font-medium text-gray-800 text-sm">{runner.label}</span>
			<span className="text-xs text-gray-400 capitalize">{runner.name}</span>
			<span
				className={`ml-auto text-xs font-medium ${
					runner.status === "ok" ? "text-green-600" : "text-red-500"
				}`}
			>
				{statusLabel(runner.status)}
			</span>
		</div>
	);
}

// ── Page ──────────────────────────────────────────────────────────────────────

function StatusPage() {
	const data = Route.useLoaderData();

	const allOk =
		data.agents.every((a) => a.status === "ok") &&
		data.runners.every((r) => r.status === "ok");

	const errorCount = [
		...data.agents.filter((a) => a.status === "error" || a.status === "unreachable"),
		...data.runners.filter((r) => r.status === "unreachable"),
	].length;

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white border-b border-gray-200 shadow-sm">
				<div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<h1 className="text-xl font-bold text-gray-900">Agent Status</h1>
						<div
							className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
								allOk
									? "bg-green-100 text-green-700"
									: errorCount > 0
										? "bg-red-100 text-red-700"
										: "bg-yellow-100 text-yellow-700"
							}`}
						>
							<span
								className={`w-2 h-2 rounded-full ${allOk ? "bg-green-500" : errorCount > 0 ? "bg-red-500" : "bg-yellow-400"}`}
							/>
							{allOk ? "All systems OK" : errorCount > 0 ? `${errorCount} issues` : "Degraded"}
						</div>
					</div>
					<span className="text-xs text-gray-400" suppressHydrationWarning>
						Updated {formatTimestamp(data.timestamp)}
					</span>
				</div>
			</div>

			<div className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-8">
				{/* Board Agents */}
				<section>
					<h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
						Board Agents
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
						{data.agents.map((agent) => (
							<AgentCard key={agent.name} agent={agent} />
						))}
					</div>
				</section>

				{/* Runners */}
				{data.runners.length > 0 && (
					<section>
						<h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
							Runners
						</h2>
						<div className="flex flex-col gap-2">
							{data.runners.map((runner) => (
								<RunnerRow key={runner.name} runner={runner} />
							))}
						</div>
					</section>
				)}

				{/* Jane */}
				{data.jane && (
					<section>
						<h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
							Jane
						</h2>
						<div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
							<pre className="text-xs text-gray-600 overflow-auto whitespace-pre-wrap">
								{JSON.stringify(data.jane, null, 2)}
							</pre>
						</div>
					</section>
				)}
			</div>
		</div>
	);
}
