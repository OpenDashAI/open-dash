import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MorningFlow } from "../components/MorningFlow";
import { PanelResizer } from "../components/PanelResizer";
import { ChatPanel } from "../components/panels/ChatPanel";
import { ContextPanel } from "../components/panels/ContextPanel";
import { FocusPanel } from "../components/panels/FocusPanel";
import { EXPERIENCES, type HudExperience } from "../lib/briefing";
import {
	setBrands,
	setBriefingItems,
	setDataSources,
	setEvents,
	setExperience,
	setIssues,
	setLastVisited,
	setMachines,
	setMetrics,
	useHudState,
} from "../lib/hud-store";
import { useKeyboardShortcuts } from "../lib/use-keyboard";
import { useLiveData } from "../lib/use-live-data";
import { getActivity, getMetrics } from "../server/activity";
import { getBrands } from "../server/brands";
import type { DataSourceInfo } from "../server/datasources";
import { fetchAllSources } from "../server/datasources";
import { getPendingEscalations } from "../server/escalations";
import { getIssues } from "../server/issues";
import { getMachines } from "../server/machines";
import {
	getThreadMessages,
	listThreads,
	type StoredMessage,
	type ThreadSummary,
} from "../server/threads";
import { getLastVisited, updateLastVisited } from "../server/user-state";

export const Route = createFileRoute("/")({
	component: HUD,
	loader: async () => {
		const [
			machines,
			brands,
			events,
			metrics,
			issues,
			chatHistory,
			threads,
			lastVisited,
		] = await Promise.all([
			getMachines(),
			getBrands(),
			getActivity(),
			getMetrics(),
			getIssues(),
			getThreadMessages({ data: "default" }),
			listThreads(),
			getLastVisited(),
		]);

		// Fetch briefing items from DataSource registry
		// TODO: getPendingEscalations returns non-iterable - needs debug
		let briefing: any[] = [];
		let dataSources: any[] = [];
		try {
			const sourceResult = await fetchAllSources({ data: { lastVisited } });
			briefing = Array.isArray(sourceResult?.items) ? sourceResult.items : [];
			dataSources = Array.isArray(sourceResult?.sources) ? sourceResult.sources : [];
		} catch (e) {
			console.error("Error fetching sources:", e);
		}

		// Update last visited timestamp (fire-and-forget)
		// TODO: updateLastVisited is a server function that doesn't work in loader context
		// updateLastVisited().catch(() => {});

		return {
			machines,
			brands,
			events,
			metrics,
			issues,
			chatHistory,
			threads,
			briefing,
			lastVisited,
			dataSources,
		};
	},
});

const MIN_PANEL = 180;
const DEFAULT_LEFT = 280;
const DEFAULT_RIGHT = 320;

/** Should we show the morning flow? Only on first daily visit (6+ hours since last) */
function shouldShowMorningFlow(lastVisited: string | null): boolean {
	if (!lastVisited) return true;
	const diff = Date.now() - new Date(lastVisited).getTime();
	return diff > 6 * 3600 * 1000; // 6 hours
}

function HUD() {
	const loaderData = Route.useLoaderData();
	const { experience } = useHudState();
	const navigate = useNavigate({ from: "/" });
	useKeyboardShortcuts();
	useLiveData();

	const showFlow = useMemo(
		() => shouldShowMorningFlow(loaderData.lastVisited),
		[loaderData.lastVisited],
	);
	const [morningFlowActive, setMorningFlowActive] = useState(showFlow);

	const [leftWidth, setLeftWidth] = useState(DEFAULT_LEFT);
	const [rightWidth, setRightWidth] = useState(DEFAULT_RIGHT);
	const [activeThreadId, setActiveThreadId] = useState("default");
	const [threadMessages, setThreadMessages] = useState<StoredMessage[]>(
		loaderData.chatHistory,
	);
	const [threadList, setThreadList] = useState<ThreadSummary[]>(
		loaderData.threads,
	);

	const switchThread = useCallback(
		async (threadId: string) => {
			setActiveThreadId(threadId);
			if (
				threadId === "default" &&
				loaderData.chatHistory.length > 0 &&
				activeThreadId === "default"
			) {
				return;
			}
			const messages = await getThreadMessages({ data: threadId });
			setThreadMessages(messages);
		},
		[loaderData.chatHistory, activeThreadId],
	);

	const createThread = useCallback(async () => {
		const id = `thread-${Date.now()}`;
		setActiveThreadId(id);
		setThreadMessages([]);
		setThreadList((prev) => [
			{
				id,
				title: null,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
			...prev,
		]);
	}, []);

	const handleThreadTitleUpdate = useCallback((tid: string, title: string) => {
		setThreadList((prev) =>
			prev.map((t) => (t.id === tid ? { ...t, title } : t)),
		);
	}, []);

	const handleLeftResize = useCallback((delta: number) => {
		setLeftWidth((w) => Math.max(MIN_PANEL, w + delta));
	}, []);

	const handleRightResize = useCallback((delta: number) => {
		setRightWidth((w) => Math.max(MIN_PANEL, w - delta));
	}, []);

	// Hydrate store from SSR loader data
	useEffect(() => {
		setMachines(loaderData.machines);
		setBrands(loaderData.brands);
		setEvents(loaderData.events);
		setMetrics(loaderData.metrics);
		setIssues(loaderData.issues);
		setBriefingItems(loaderData.briefing);
		setLastVisited(loaderData.lastVisited);
		setDataSources(loaderData.dataSources);
	}, [loaderData]);

	const onlineMachines = loaderData.machines.filter(
		(m) => m.status === "online",
	).length;

	return (
		<>
		{morningFlowActive && (
			<MorningFlow
				lastVisited={loaderData.lastVisited}
				onComplete={() => setMorningFlowActive(false)}
			/>
		)}
		<div
			className="hud-layout"
			style={{
				gridTemplateColumns: `${leftWidth}px 6px 1fr 6px ${rightWidth}px`,
			}}
		>
			<div className="hud-topbar">
				<div className="flex items-center gap-3">
					<span className="font-semibold text-[var(--hud-text-bright)] tracking-wide">
						OPENDASH
					</span>
					<span className="text-[var(--hud-border)]">|</span>
					<div className="flex gap-1">
						{(
							Object.entries(EXPERIENCES) as Array<
								[HudExperience, (typeof EXPERIENCES)[HudExperience]]
							>
						).map(([key, config], i) => (
							<button
								key={key}
								type="button"
								onClick={() => setExperience(key)}
								title={`${config.description} (Alt+${i + 1})`}
								className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider transition-colors ${
									experience === key
										? "bg-[var(--hud-accent-dim)] text-[var(--hud-accent)]"
										: "text-[var(--hud-text-muted)] hover:text-[var(--hud-text)]"
								}`}
							>
								<span className="mr-1">{config.icon}</span>
								{config.label}
							</button>
						))}
					</div>
				</div>
				<div className="flex items-center gap-3 text-[12px]">
					<span className="flex items-center gap-1.5">
						<span
							className={`status-dot ${onlineMachines > 0 ? "online" : "offline"}`}
						/>
						<span>
							{onlineMachines}/{loaderData.machines.length} machines
						</span>
					</span>
					<span className="text-[var(--hud-border)]">|</span>
					<button
						type="button"
						onClick={() => navigate({ to: "/brands" })}
						className="text-[var(--hud-text-muted)] hover:text-[var(--hud-accent)] cursor-pointer transition-colors"
					>
						{loaderData.brands.length} brands
					</button>
					<span className="text-[var(--hud-border)]">|</span>
					<span>{loaderData.issues.length} issues</span>
				</div>
			</div>

			<ContextPanel />
			<PanelResizer onResize={handleLeftResize} />
			<FocusPanel />
			<PanelResizer onResize={handleRightResize} />
			<ChatPanel
				key={activeThreadId}
				threadId={activeThreadId}
				initialMessages={threadMessages}
				threads={threadList}
				onSwitchThread={switchThread}
				onNewThread={createThread}
				onThreadTitleUpdate={handleThreadTitleUpdate}
			/>
		</div>
		</>
	);
}
