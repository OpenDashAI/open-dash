import { useSyncExternalStore } from "react";
import type { BriefingItem, HudExperience } from "./briefing";
import { sortBriefingItems } from "./briefing";
import type { DataSourceStatus } from "./datasource";
import type {
	ActivityEvent,
	Brand,
	CardDirective,
	HudState,
	Issue,
	Machine,
	StatusMetric,
} from "./types";

/**
 * Minimal reactive store for HUD state.
 * Chat responses mutate this; panels subscribe and re-render.
 * No external dependency needed — just useSyncExternalStore.
 */

type Listener = () => void;

const listeners = new Set<Listener>();

export interface DataSourceInfo {
	id: string;
	name: string;
	icon: string;
	description: string;
	requiresConfig: boolean;
	status: DataSourceStatus;
}

export interface HudStoreState extends HudState {
	experience: HudExperience;
	briefingItems: BriefingItem[];
	dismissedIds: Set<string>;
	snoozedIds: Map<string, string>; // id → snoozedUntil ISO
	focusBrand: string | null;
	lastVisited: string | null;
	dataSources: DataSourceInfo[];
}

let state: HudStoreState = {
	mode: "operating",
	experience: "briefing",
	machines: [],
	brands: [],
	events: [],
	metrics: [],
	issues: [],
	cards: [],
	briefingItems: [],
	dismissedIds: new Set(),
	snoozedIds: new Map(),
	focusBrand: null,
	lastVisited: null,
	dataSources: [],
};

function emit() {
	for (const listener of listeners) {
		listener();
	}
}

function subscribe(listener: Listener) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

function getSnapshot() {
	return state;
}

/** React hook — components re-render when state changes */
export function useHudState(): HudStoreState {
	return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Select a slice to avoid unnecessary re-renders */
export function useHudSelect<T>(selector: (s: HudStoreState) => T): T {
	const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
	return selector(snap);
}

// --- Experience ---

export function setExperience(experience: HudExperience) {
	state = { ...state, experience, focusBrand: null };
	emit();
}

export function setFocusBrand(slug: string) {
	state = { ...state, experience: "focus", focusBrand: slug };
	emit();
}

// --- Briefing ---

export function setBriefingItems(items: BriefingItem[]) {
	state = { ...state, briefingItems: sortBriefingItems(items) };
	emit();
}

export function dismissBriefingItem(id: string) {
	const dismissed = new Set(state.dismissedIds);
	dismissed.add(id);
	state = { ...state, dismissedIds: dismissed };
	emit();
}

/** Snooze a briefing item until a specific time */
export function snoozeBriefingItem(id: string, until: string) {
	const snoozed = new Map(state.snoozedIds);
	snoozed.set(id, until);
	state = { ...state, snoozedIds: snoozed };
	emit();
}

/** Get visible (non-dismissed, non-snoozed) briefing items */
export function getVisibleBriefingItems(s: HudStoreState): BriefingItem[] {
	const now = Date.now();
	return s.briefingItems.filter((item) => {
		if (s.dismissedIds.has(item.id)) return false;
		const snoozedUntil = s.snoozedIds.get(item.id);
		if (snoozedUntil && new Date(snoozedUntil).getTime() > now) return false;
		return true;
	});
}

// --- Last visited ---

export function setLastVisited(lastVisited: string | null) {
	state = { ...state, lastVisited };
	emit();
}

// --- Data Sources ---

export function setDataSources(dataSources: DataSourceInfo[]) {
	state = { ...state, dataSources };
	emit();
}

// --- Legacy mode (kept for chat HUD directives) ---

export function setMode(mode: HudState["mode"]) {
	state = { ...state, mode };
	emit();
}

// --- Data setters ---

export function setMachines(machines: Machine[]) {
	state = { ...state, machines };
	emit();
}

export function setBrands(brands: Brand[]) {
	state = { ...state, brands };
	emit();
}

export function setEvents(events: ActivityEvent[]) {
	state = { ...state, events };
	emit();
}

export function addEvent(event: ActivityEvent) {
	state = { ...state, events: [event, ...state.events].slice(0, 50) };
	emit();
}

export function setMetrics(metrics: StatusMetric[]) {
	state = { ...state, metrics };
	emit();
}

export function setIssues(issues: Issue[]) {
	state = { ...state, issues };
	emit();
}

export function setCards(cards: CardDirective[]) {
	state = { ...state, cards };
	emit();
}

export function addCards(cards: CardDirective[]) {
	state = { ...state, cards: [...state.cards, ...cards] };
	emit();
}

export function clearCards() {
	state = { ...state, cards: [] };
	emit();
}

/** Apply a full HUD response from the AI */
export function applyHudResponse(response: {
	mode?: string;
	cards?: CardDirective[];
}) {
	const updates: Partial<HudStoreState> = {};
	if (
		response.mode &&
		["operating", "building", "analyzing", "reviewing", "alert"].includes(
			response.mode,
		)
	) {
		updates.mode = response.mode as HudState["mode"];
	}
	if (response.cards?.length) {
		updates.cards = [...state.cards, ...response.cards];
	}
	if (Object.keys(updates).length > 0) {
		state = { ...state, ...updates };
		emit();
	}
}
