import { useCallback, useEffect, useRef, useState } from "react";
import {
	browserClick,
	browserClose,
	browserNavigate,
	browserScreenshot,
	browserScroll,
	type BrowserSessionResult,
} from "../../server/browser";

interface BrowserCardProps {
	session: BrowserSessionResult;
	onUpdate?: (session: BrowserSessionResult) => void;
	onClose?: () => void;
}

/**
 * BrowserCard — live screenshot viewer for a browser-agent session.
 * Auto-polls screenshots every 3 seconds when active.
 * Supports click-to-interact on the screenshot image.
 */
export function BrowserCard({ session, onUpdate, onClose }: BrowserCardProps) {
	const [current, setCurrent] = useState(session);
	const [polling, setPolling] = useState(true);
	const [navUrl, setNavUrl] = useState("");
	const [loading, setLoading] = useState(false);
	const imgRef = useRef<HTMLImageElement>(null);
	const pollRef = useRef<ReturnType<typeof setInterval>>();

	// Timestamp to bust image cache
	const [imgTs, setImgTs] = useState(Date.now());

	const refresh = useCallback(async () => {
		try {
			const result = await browserScreenshot({
				data: { sessionId: current.sessionId },
			});
			setCurrent(result);
			setImgTs(Date.now());
			onUpdate?.(result);
		} catch {
			// Session may have closed
		}
	}, [current.sessionId, onUpdate]);

	// Auto-poll screenshots
	useEffect(() => {
		if (!polling) {
			if (pollRef.current) clearInterval(pollRef.current);
			return;
		}
		pollRef.current = setInterval(refresh, 3000);
		return () => {
			if (pollRef.current) clearInterval(pollRef.current);
		};
	}, [polling, refresh]);

	const handleImageClick = useCallback(
		async (e: React.MouseEvent<HTMLImageElement>) => {
			if (!imgRef.current) return;
			const rect = imgRef.current.getBoundingClientRect();
			// Scale click to actual viewport coordinates
			const scaleX = 1280 / rect.width;
			const scaleY = 800 / rect.height;
			const x = Math.round((e.clientX - rect.left) * scaleX);
			const y = Math.round((e.clientY - rect.top) * scaleY);

			setLoading(true);
			try {
				const result = await browserClick({
					data: { sessionId: current.sessionId, x, y },
				});
				setCurrent(result);
				setImgTs(Date.now());
				onUpdate?.(result);
			} catch {
				// ignore
			}
			setLoading(false);
		},
		[current.sessionId, onUpdate],
	);

	const handleNavigate = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			if (!navUrl.trim()) return;
			setLoading(true);
			try {
				const url = navUrl.startsWith("http") ? navUrl : `https://${navUrl}`;
				const result = await browserNavigate({
					data: { sessionId: current.sessionId, url },
				});
				setCurrent(result);
				setImgTs(Date.now());
				setNavUrl("");
				onUpdate?.(result);
			} catch {
				// ignore
			}
			setLoading(false);
		},
		[current.sessionId, navUrl, onUpdate],
	);

	const handleScroll = useCallback(
		async (direction: "up" | "down") => {
			try {
				const result = await browserScroll({
					data: { sessionId: current.sessionId, direction },
				});
				setCurrent(result);
				setImgTs(Date.now());
				onUpdate?.(result);
			} catch {
				// ignore
			}
		},
		[current.sessionId, onUpdate],
	);

	const handleClose = useCallback(async () => {
		setPolling(false);
		await browserClose({
			data: { sessionId: current.sessionId },
		}).catch(() => {});
		onClose?.();
	}, [current.sessionId, onClose]);

	const screenshotSrc = current.screenshotUrl
		? `${current.screenshotUrl}?t=${imgTs}`
		: null;

	return (
		<div className="hud-card p-0 overflow-hidden">
			{/* Browser toolbar */}
			<div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-[var(--hud-border)] bg-[var(--hud-surface)]">
				<div className="flex gap-1">
					<button
						type="button"
						onClick={() => handleScroll("up")}
						className="text-[10px] px-1 text-[var(--hud-text-muted)] hover:text-[var(--hud-text)]"
						title="Scroll up"
					>
						{"\u25B2"}
					</button>
					<button
						type="button"
						onClick={() => handleScroll("down")}
						className="text-[10px] px-1 text-[var(--hud-text-muted)] hover:text-[var(--hud-text)]"
						title="Scroll down"
					>
						{"\u25BC"}
					</button>
				</div>

				<form
					onSubmit={handleNavigate}
					className="flex-1 flex items-center gap-1"
				>
					<input
						type="text"
						value={navUrl}
						onChange={(e) => setNavUrl(e.target.value)}
						placeholder={current.url ?? "Enter URL..."}
						className="flex-1 text-[10px] px-2 py-0.5 rounded bg-[var(--hud-bg)] border border-[var(--hud-border)] text-[var(--hud-text-bright)] outline-none focus:border-[var(--hud-accent)]"
					/>
					<button
						type="submit"
						className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--hud-accent-dim)] text-[var(--hud-accent)] hover:bg-[var(--hud-accent)] hover:text-[var(--hud-bg)] transition-colors"
					>
						Go
					</button>
				</form>

				<div className="flex items-center gap-1">
					<button
						type="button"
						onClick={refresh}
						className="text-[10px] px-1 text-[var(--hud-text-muted)] hover:text-[var(--hud-accent)]"
						title="Refresh screenshot"
					>
						{"\u21BB"}
					</button>
					<button
						type="button"
						onClick={() => setPolling((p) => !p)}
						className={`text-[10px] px-1 ${polling ? "text-[var(--hud-success)]" : "text-[var(--hud-text-muted)]"}`}
						title={polling ? "Pause auto-refresh" : "Resume auto-refresh"}
					>
						{polling ? "\u25CF" : "\u25CB"}
					</button>
					<button
						type="button"
						onClick={handleClose}
						className="text-[10px] px-1 text-[var(--hud-text-muted)] hover:text-[var(--hud-error)]"
						title="Close session"
					>
						{"\u2715"}
					</button>
				</div>
			</div>

			{/* Screenshot viewport */}
			<div className="relative bg-black cursor-crosshair">
				{loading && (
					<div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
						<span className="text-[11px] text-[var(--hud-text-muted)]">
							Loading...
						</span>
					</div>
				)}
				{screenshotSrc ? (
					<img
						ref={imgRef}
						src={screenshotSrc}
						alt="Browser view"
						onClick={handleImageClick}
						className="w-full h-auto block"
						draggable={false}
					/>
				) : (
					<div className="flex items-center justify-center h-48 text-[12px] text-[var(--hud-text-muted)]">
						No screenshot available
					</div>
				)}
			</div>

			{/* Status bar */}
			<div className="flex items-center justify-between px-2 py-1 border-t border-[var(--hud-border)] text-[9px] text-[var(--hud-text-muted)]">
				<span className="truncate flex-1">{current.title ?? current.url}</span>
				<span className="flex items-center gap-1.5 flex-shrink-0">
					<span
						className={`status-dot ${current.status === "ready" ? "online" : current.status === "error" ? "error" : "warning"}`}
					/>
					<span>{current.sessionId.slice(0, 8)}</span>
				</span>
			</div>
		</div>
	);
}
