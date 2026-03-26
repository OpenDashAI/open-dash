/**
 * GENERATED from: tools/design-extractor/extracted/cal-booking.json
 * Domain: Booking (cal.com style)
 * Hook: useComposableList
 */

import { useComposableList } from '../../hooks/composable'

interface TimeSlot {
  time: string
  display: string
  available: boolean
}

const DEFAULT_SLOTS: TimeSlot[] = [
  { time: '09:00', display: '9:00am', available: true },
  { time: '09:30', display: '9:30am', available: true },
  { time: '10:00', display: '10:00am', available: true },
  { time: '10:30', display: '10:30am', available: false },
  { time: '11:00', display: '11:00am', available: true },
  { time: '11:30', display: '11:30am', available: true },
  { time: '13:00', display: '1:00pm', available: true },
  { time: '13:30', display: '1:30pm', available: true },
  { time: '14:00', display: '2:00pm', available: true },
  { time: '14:30', display: '2:30pm', available: false },
  { time: '15:00', display: '3:00pm', available: true },
  { time: '15:30', display: '3:30pm', available: true },
  { time: '16:00', display: '4:00pm', available: true },
]

interface TimeSlotPickerProps {
  componentId: string
  listenToComponent?: string
}

export function TimeSlotPicker({ componentId, listenToComponent }: TimeSlotPickerProps) {
  const { items, selectedIndex, emitSelection } = useComposableList<TimeSlot>({
    componentId,
    listenToComponent,
    initialItems: DEFAULT_SLOTS,
  })

  const availableSlots = items.filter(s => s.available)

  return (
    <div className="flex flex-col gap-3">
      <div className="text-sm text-gray-500">
        {availableSlots.length} available time{availableSlots.length !== 1 ? 's' : ''}
      </div>
      <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
        {items.filter(s => s.available).map((slot, index) => (
          <button
            key={slot.time}
            onClick={() => emitSelection(slot, index)}
            className={`
              px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors
              ${selectedIndex === index
                ? 'bg-blue-600 text-white border-blue-600'
                : 'text-blue-600 border-blue-200 hover:border-blue-400 hover:bg-blue-50'
              }
            `}
          >
            {slot.display}
          </button>
        ))}
      </div>
    </div>
  )
}
