import type { ToolCallMessagePartComponent } from "@assistant-ui/react";
import { useState } from "react";

/** Generic tool call renderer — shows tool name, args (collapsible), and result */
export const ToolCallFallback: ToolCallMessagePartComponent = ({
	toolName,
	argsText,
	result,
	status,
}) => {
	const [expanded, setExpanded] = useState(false);
	const isRunning = status.type === "running";
	const hasError = status.type === "incomplete" && status.reason === "error";

	// Friendly display names for orchestrator tools
	const displayName = TOOL_LABELS[toolName] ?? toolName;

	return (
		<div className="my-2 rounded border border-[var(--hud-border)] bg-[var(--hud-panel-bg)] text-[12px]">
			<button
				type="button"
				onClick={() => setExpanded(!expanded)}
				className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-[var(--hud-accent-dim)] transition-colors"
			>
				<span
					className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isRunning ? "bg-yellow-400 animate-pulse" : hasError ? "bg-red-400" : "bg-green-400"}`}
				/>
				<span className="font-medium text-[var(--hud-text)]">
					{displayName}
				</span>
				{isRunning && (
					<span className="text-[var(--hud-text-muted)] ml-auto">
						running...
					</span>
				)}
				{!isRunning && (
					<span className="text-[var(--hud-text-muted)] ml-auto">
						{expanded ? "▾" : "▸"}
					</span>
				)}
			</button>
			{expanded && (
				<div className="border-t border-[var(--hud-border)] px-3 py-2 space-y-2">
					{argsText && argsText !== "{}" && (
						<div>
							<span className="text-[var(--hud-text-muted)] text-[10px] uppercase tracking-wider">
								Args
							</span>
							<pre className="mt-0.5 text-[11px] text-[var(--hud-text)] whitespace-pre-wrap break-all">
								{formatJson(argsText)}
							</pre>
						</div>
					)}
					{hasError && (
						<div className="text-red-400 text-[11px]">
							Tool execution failed
						</div>
					)}
					{result !== undefined && (
						<div>
							<span className="text-[var(--hud-text-muted)] text-[10px] uppercase tracking-wider">
								Result
							</span>
							<pre className="mt-0.5 text-[11px] text-[var(--hud-text)] whitespace-pre-wrap break-all max-h-48 overflow-y-auto">
								{typeof result === "string"
									? result
									: JSON.stringify(result, null, 2)}
							</pre>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

function formatJson(text: string): string {
	try {
		return JSON.stringify(JSON.parse(text), null, 2);
	} catch {
		return text;
	}
}

const TOOL_LABELS: Record<string, string> = {
	listBrands: "List Brands",
	brandStatus: "Brand Status",
	triggerResearch: "Research Pipeline",
	runAudit: "Site Audit",
	auditAll: "Audit All Brands",
	auditHistory: "Audit History",
	triggerSocial: "Social Drafts",
	regenerateContent: "Regenerate Content",
	revenueDashboard: "Revenue Dashboard",
	fullPipeline: "Full Pipeline",
};
