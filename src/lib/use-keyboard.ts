import { useEffect } from "react";
import type { HudExperience } from "./briefing";
import { setExperience } from "./hud-store";

/**
 * Global keyboard shortcuts for the HUD.
 * Alt+1-3: switch experiences
 * Alt+/: focus chat input
 */
export function useKeyboardShortcuts() {
	useEffect(() => {
		const experiences: HudExperience[] = ["briefing", "focus", "portfolio"];

		function handleKeyDown(e: KeyboardEvent) {
			// Alt+1 through Alt+3: switch experiences
			if (e.altKey && e.key >= "1" && e.key <= "3") {
				e.preventDefault();
				const index = Number.parseInt(e.key) - 1;
				if (experiences[index]) setExperience(experiences[index]);
				return;
			}

			// Alt+/: focus chat input
			if (e.altKey && e.key === "/") {
				e.preventDefault();
				const chatInput = document.querySelector(
					".aui-composer-input",
				) as HTMLTextAreaElement | null;
				chatInput?.focus();
				return;
			}
		}

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);
}
