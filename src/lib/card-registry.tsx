import type { ComponentType } from 'react'
import { MachineCard } from '../components/cards/MachineCard'
import { BrandCard } from '../components/cards/BrandCard'
import { ActivityCard } from '../components/cards/ActivityCard'
import { StatusCard } from '../components/cards/StatusCard'

/**
 * Card Registry — maps card type names to React components.
 * The AI emits card directives like { type: "machine_card", props: {...} }
 * and the renderer looks up the component here.
 */

// biome-ignore lint/suspicious/noExplicitAny: card props vary by type
type CardComponent = ComponentType<any>

const registry: Record<string, CardComponent> = {
  machine_card: MachineCard,
  brand_card: BrandCard,
  activity_card: ActivityCard,
  status_card: StatusCard,
}

export function getCard(type: string): CardComponent | null {
  return registry[type] ?? null
}

export function renderCard(type: string, props: Record<string, unknown>, key: string) {
  const Card = getCard(type)
  if (!Card) return null
  return <Card key={key} {...props} />
}

/** Card directive from AI response */
export interface CardDirective {
  type: string
  props: Record<string, unknown>
  position?: 'left' | 'center' | 'inline'
}
