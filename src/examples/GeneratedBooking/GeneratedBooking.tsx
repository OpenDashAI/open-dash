/**
 * AI-Generated Booking Page (cal.com style)
 *
 * Extracted from: tools/design-extractor/extracted/cal-booking.json
 * 4 components generated from hooks:
 *   EventInfoCard (useComposableCard)
 *   DatePicker (useComposableList)
 *   TimeSlotPicker (useComposableList)
 *   BookingForm (useComposableForm)
 *
 * Proves: design extraction → composition JSON → generated components → working app
 */

import { CompositionRenderer } from '../../components/CompositionRenderer'
import type { ComponentMap } from '../../components/CompositionRenderer'
import type { Composition } from '../../lib/composition-schema'
import { EventInfoCard } from '../../components/generated/EventInfoCard'
import { DatePicker } from '../../components/generated/DatePicker'
import { TimeSlotPicker } from '../../components/generated/TimeSlotPicker'
import { BookingForm } from '../../components/generated/BookingForm'
import compositionJson from './composition.json'

const components: ComponentMap = {
  EventInfoCard,
  DatePicker,
  TimeSlotPicker,
  BookingForm,
}

export function GeneratedBooking() {
  return (
    <CompositionRenderer
      composition={compositionJson as Composition}
      components={components}
    />
  )
}
