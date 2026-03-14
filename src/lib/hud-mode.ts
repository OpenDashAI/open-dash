/**
 * HUD Modes — the AI selects a mode based on conversation context.
 * Each mode defines what cards appear in the left and center panels.
 * Mode transitions are smooth — no page loads, no tab switches.
 */

export type HudMode = 'operating' | 'building' | 'analyzing' | 'reviewing' | 'alert'

export interface ModeConfig {
  label: string
  leftCards: string[]
  centerCards: string[]
}

export const MODE_CONFIGS: Record<HudMode, ModeConfig> = {
  operating: {
    label: 'OPERATING',
    leftCards: ['machine_card', 'brand_card'],
    centerCards: ['activity_card', 'status_card'],
  },
  building: {
    label: 'BUILDING',
    leftCards: ['brand_card', 'status_card'],
    centerCards: ['activity_card'],
  },
  analyzing: {
    label: 'ANALYZING',
    leftCards: ['brand_card'],
    centerCards: ['status_card', 'activity_card'],
  },
  reviewing: {
    label: 'REVIEWING',
    leftCards: ['status_card'],
    centerCards: ['activity_card'],
  },
  alert: {
    label: 'ALERT',
    leftCards: ['machine_card'],
    centerCards: ['activity_card', 'status_card'],
  },
}
