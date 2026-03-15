import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
	AssistantChatTransport,
	useChatRuntime,
} from "@assistant-ui/react-ai-sdk";
import { StreamdownTextPrimitive } from "@assistant-ui/react-streamdown";
import { Thread } from "@assistant-ui/react-ui";
import { code } from "@streamdown/code";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import { applyHudResponse, useHudSelect } from "../../lib/hud-store";
import type { CardDirective } from "../../lib/types";
import {
	type StoredMessage,
	saveMessage,
	type ThreadSummary,
	updateThreadTitle,
} from "../../server/threads";
import { ToolCallFallback } from "../ToolCallFallback";

const HUD_MARKER = "---HUD---";

/** Parse and apply HUD directives from a completed assistant message */
function processHudDirectives(text: string) {
	const idx = text.indexOf(HUD_MARKER);
	if (idx === -1) return;
	const json = text.slice(idx + HUD_MARKER.length).trim();
	try {
		const directives = JSON.parse(json) as {
			mode?: string;
			cards?: CardDirective[];
		};
		applyHudResponse(directives);
	} catch {
		// Malformed HUD JSON — ignore
	}
}

/** Strip ---HUD--- block from displayed text */
function stripHudBlock(text: string): string {
	const idx = text.indexOf(HUD_MARKER);
	return idx === -1 ? text : text.slice(0, idx).trimEnd();
}

/** Extract a short title from the first user message */
function extractTitle(text: string): string {
	// Take first line, strip markdown, truncate to 50 chars
	const firstLine = text
		.split("\n")[0]
		.replace(/[#*_`]/g, "")
		.trim();
	if (firstLine.length <= 50) return firstLine;
	return `${firstLine.slice(0, 47)}...`;
}

const StreamdownText = memo(() => (
	<StreamdownTextPrimitive
		plugins={{ code }}
		shikiTheme={["github-dark", "github-dark"]}
		preprocess={stripHudBlock}
	/>
));
StreamdownText.displayName = "StreamdownText";

interface ChatPanelProps {
	threadId: string;
	initialMessages?: StoredMessage[];
	threads?: ThreadSummary[];
	onSwitchThread?: (threadId: string) => void;
	onNewThread?: () => void;
	onThreadTitleUpdate?: (threadId: string, title: string) => void;
}

export function ChatPanel({
	threadId,
	initialMessages = [],
	threads = [],
	onSwitchThread,
	onNewThread,
	onThreadTitleUpdate,
}: ChatPanelProps) {
	const [showThreadList, setShowThreadList] = useState(false);
	const titleSetRef = useRef(initialMessages.length > 0); // Skip title gen if thread already has messages
	const focusBrand = useHudSelect((s) => s.focusBrand);
	const focusBrandRef = useRef(focusBrand);
	focusBrandRef.current = focusBrand;

	// Convert stored messages to UIMessage format and pre-seed savedIds
	const { uiMessages, knownIds } = useMemo(() => {
		const ids = new Set<string>();
		const msgs = initialMessages.map((m) => {
			ids.add(m.id);
			return {
				id: m.id,
				role: m.role as "user" | "assistant",
				parts: m.parts,
				createdAt: new Date(m.createdAt),
			};
		});
		return { uiMessages: msgs, knownIds: ids };
	}, [initialMessages]);

	const savedIds = useRef(knownIds);

	const persistMessage = useCallback(
		(msg: { id: string; role: string; parts: unknown[] }) => {
			if (savedIds.current.has(msg.id)) return;
			savedIds.current.add(msg.id);
			saveMessage({
				data: {
					threadId,
					messageId: msg.id,
					role: msg.role,
					parts: msg.parts,
				},
			}).catch(() => {
				savedIds.current.delete(msg.id); // Retry next time
			});
		},
		[threadId],
	);

	const onFinish = useCallback(
		({
			message,
			messages,
		}: {
			message: {
				id: string;
				role: string;
				parts: Array<{ type: string; text?: string }>;
			};
			messages: Array<{
				id: string;
				role: string;
				parts: Array<{ type: string; text?: string }>;
			}>;
		}) => {
			// Apply HUD directives
			for (const part of message.parts) {
				if (part.type === "text" && part.text) {
					processHudDirectives(part.text);
				}
			}

			// Persist all unsaved messages (user + assistant)
			for (const msg of messages) {
				persistMessage(msg);
			}

			// Auto-generate thread title from the first user message
			if (!titleSetRef.current) {
				titleSetRef.current = true;
				const firstUserMsg = messages.find((m) => m.role === "user");
				if (firstUserMsg) {
					const textPart = firstUserMsg.parts.find(
						(p) => p.type === "text" && p.text,
					);
					if (textPart?.text) {
						const title = extractTitle(textPart.text);
						updateThreadTitle({
							data: { threadId, title },
						}).catch(() => {});
						onThreadTitleUpdate?.(threadId, title);
					}
				}
			}
		},
		[persistMessage, threadId, onThreadTitleUpdate],
	);

	const runtime = useChatRuntime({
		transport: new AssistantChatTransport({
			api: "/api/chat",
			body: () => ({
				focusBrand: focusBrandRef.current,
			}),
		}),
		initialMessages: uiMessages.length > 0 ? uiMessages : undefined,
		onFinish,
	});

	const threadLabel = threads.find((t) => t.id === threadId)?.title ?? threadId;

	return (
		<div className="hud-panel right flex flex-col h-full">
			<div className="panel-header relative">
				<div className="flex items-center gap-2 min-w-0">
					<button
						type="button"
						onClick={() => setShowThreadList(!showThreadList)}
						className="flex items-center gap-1 min-w-0 hover:text-[var(--hud-accent)] transition-colors"
						title="Switch thread"
					>
						<span className="truncate">{threadLabel}</span>
						<span className="text-[10px] flex-shrink-0">
							{showThreadList ? "▾" : "▸"}
						</span>
					</button>
				</div>
				<div className="flex items-center gap-2">
					{focusBrand && (
						<span
							className="text-[9px] font-semibold uppercase tracking-wider text-[var(--hud-accent)] bg-[var(--hud-accent-dim)] px-1.5 py-0.5 rounded"
							title={`Chat has context for ${focusBrand}`}
						>
							{focusBrand}
						</span>
					)}
					<button
						type="button"
						onClick={onNewThread}
						className="text-[10px] px-1.5 py-0.5 rounded border border-[var(--hud-border)] hover:border-[var(--hud-accent)] hover:text-[var(--hud-accent)] transition-colors"
						title="New thread"
					>
						+
					</button>
					<span className="status-dot online" />
				</div>

				{/* Thread list dropdown */}
				{showThreadList && threads.length > 0 && (
					<div className="absolute top-full left-0 right-0 z-50 border border-[var(--hud-border)] bg-[var(--hud-bg)] rounded-b shadow-lg max-h-48 overflow-y-auto">
						{threads.map((t) => (
							<button
								key={t.id}
								type="button"
								onClick={() => {
									setShowThreadList(false);
									onSwitchThread?.(t.id);
								}}
								className={`w-full text-left px-3 py-1.5 text-[11px] hover:bg-[var(--hud-accent-dim)] transition-colors truncate ${
									t.id === threadId
										? "text-[var(--hud-accent)] bg-[var(--hud-accent-dim)]"
										: "text-[var(--hud-text)]"
								}`}
							>
								{t.title ?? t.id}
							</button>
						))}
					</div>
				)}
			</div>
			<div className="flex-1 overflow-hidden">
				<AssistantRuntimeProvider runtime={runtime}>
					<Thread
						assistantMessage={{
							components: {
								Text: StreamdownText,
								ToolFallback: ToolCallFallback,
							},
						}}
					/>
				</AssistantRuntimeProvider>
			</div>
		</div>
	);
}
