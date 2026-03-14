import { useSyncExternalStore, useCallback } from 'react'
import type { HudState, CardDirective, Machine, Brand, ActivityEvent, StatusMetric } from './types'

/**
 * Minimal reactive store for HUD state.
 * Chat responses mutate this; panels subscribe and re-render.
 * No external dependency needed — just useSyncExternalStore.
 */

type Listener = () => void

const listeners = new Set<Listener>()

let state: HudState = {
  mode: 'operating',
  machines: [],
  brands: [],
  events: [],
  metrics: [],
  cards: [],
}

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

function subscribe(listener: Listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return state
}

/** React hook — components re-render when state changes */
export function useHudState(): HudState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

/** Select a slice to avoid unnecessary re-renders */
export function useHudSelect<T>(selector: (s: HudState) => T): T {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return selector(snap)
}

// --- Mutations (called by server data + chat responses) ---

export function setMode(mode: HudState['mode']) {
  state = { ...state, mode }
  emit()
}

export function setMachines(machines: Machine[]) {
  state = { ...state, machines }
  emit()
}

export function setBrands(brands: Brand[]) {
  state = { ...state, brands }
  emit()
}

export function setEvents(events: ActivityEvent[]) {
  state = { ...state, events }
  emit()
}

export function addEvent(event: ActivityEvent) {
  state = { ...state, events: [event, ...state.events].slice(0, 50) }
  emit()
}

export function setMetrics(metrics: StatusMetric[]) {
  state = { ...state, metrics }
  emit()
}

export function setCards(cards: CardDirective[]) {
  state = { ...state, cards }
  emit()
}

export function addCards(cards: CardDirective[]) {
  state = { ...state, cards: [...state.cards, ...cards] }
  emit()
}

export function clearCards() {
  state = { ...state, cards: [] }
  emit()
}

/** Apply a full HUD response from the AI */
export function applyHudResponse(response: { mode?: string; cards?: CardDirective[] }) {
  const updates: Partial<HudState> = {}
  if (response.mode && ['operating', 'building', 'analyzing', 'reviewing', 'alert'].includes(response.mode)) {
    updates.mode = response.mode as HudState['mode']
  }
  if (response.cards?.length) {
    updates.cards = [...state.cards, ...response.cards]
  }
  if (Object.keys(updates).length > 0) {
    state = { ...state, ...updates }
    emit()
  }
}
