import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BrandFocusView } from "../../components/BrandFocusView";
import { ChatPanel } from "../../components/panels/ChatPanel";
import { PanelResizer } from "../../components/PanelResizer";
import { useKeyboardShortcuts } from "../../lib/use-keyboard";
import { useLiveData } from "../../lib/use-live-data";
import {
	getThreadMessages,
	listThreads,
	type StoredMessage,
	type ThreadSummary,
} from "../../server/threads";
import { fetchBrandDashboard } from "../../server/datasources";
import type { DashboardYaml } from "../../lib/dashboard-config";
import type { BriefingItem } from "../../lib/briefing";
import type { DataSourceInfo } from "../../server/datasources";

export const Route = createFileRoute("/brands/$slug")({
	component: BrandDashboard,
	loader: async ({ params }) => {
		const [brandData, chatHistory, threads] = await Promise.all([
			fetchBrandDashboard({
				data: { brandSlug: params.slug, lastVisited: null },
			}),
			getThreadMessages({ data: `brand-${params.slug}` }),
			listThreads(),
		]);

		return {
			slug: params.slug,
			config: brandData.config,
			items: brandData.items,
			sources: brandData.sources,
			error: brandData.error,
			chatHistory,
			threads,
		};
	},
});

const MIN_PANEL = 180;
const DEFAULT_RIGHT = 320;

function BrandDashboard() {
	const loaderData = Route.useLoaderData();
	useKeyboardShortcuts();
	useLiveData();

	const [rightWidth, setRightWidth] = useState(DEFAULT_RIGHT);
	const [activeThreadId, setActiveThreadId] = useState(
		`brand-${loaderData.slug}`
	);
	const [threadMessages, setThreadMessages] = useState<StoredMessage[]>(
		loaderData.chatHistory
	);
	const [threadList, setThreadList] = useState<ThreadSummary[]>(
		loaderData.threads
	);

	const switchThread = useCallback(
		async (threadId: string) => {
			setActiveThreadId(threadId);
			const messages = await getThreadMessages({ data: threadId });
			setThreadMessages(messages);
		},
		[]
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
			prev.map((t) => (t.id === tid ? { ...t, title } : t))
		);
	}, []);

	const handleRightResize = useCallback((delta: number) => {
		setRightWidth((w) => Math.max(MIN_PANEL, w - delta));
	}, []);

	// Compute brand metrics
	const metrics = useMemo(() => {
		const items = loaderData.items || [];
		return {
			totalItems: items.length,
			issues: items.filter((i) => i.type === "issue").length,
			deploys: items.filter((i) => i.type === "deploy").length,
			revenue: items.filter((i) => i.type === "revenue").length,
			highPriority: items.filter((i) => i.priority === "high").length,
			alerts: items.filter((i) => i.type === "alert").length,
		};
	}, [loaderData.items]);

	if (loaderData.error) {
		return (
			<div className="flex items-center justify-center h-screen bg-[var(--hud-bg)]">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-[var(--hud-text)]">
						Brand Not Found
					</h1>
					<p className="text-[var(--hud-text-muted)] mt-2">
						{loaderData.error}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div
			className="brand-dashboard-layout"
			style={{
				display: "grid",
				gridTemplateColumns: `1fr 6px ${rightWidth}px`,
				height: "100vh",
			}}
		>
			<BrandFocusView
				config={loaderData.config}
				items={loaderData.items}
				sources={loaderData.sources}
				metrics={metrics}
			/>
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
	);
}
