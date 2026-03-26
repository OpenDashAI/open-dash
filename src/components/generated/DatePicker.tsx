/**
 * GENERATED from: tools/design-extractor/extracted/cal-booking.json
 * Domain: Booking (cal.com style)
 * Hook: useComposableList
 */

import { useComposableList } from '../../hooks/composable'

interface CalendarDay {
  date: string
  day: number
  available: boolean
  isToday: boolean
  isCurrentMonth: boolean
}

function generateDays(): CalendarDay[] {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const days: CalendarDay[] = []

  // Padding for days before month start
  for (let i = 0; i < firstDay; i++) {
    days.push({ date: '', day: 0, available: false, isToday: false, isCurrentMonth: false })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const isPast = d < today.getDate()
    const isWeekend = new Date(year, month, d).getDay() === 0 || new Date(year, month, d).getDay() === 6
    days.push({
      date,
      day: d,
      available: !isPast && !isWeekend,
      isToday: d === today.getDate(),
      isCurrentMonth: true,
    })
  }

  return days
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

interface DatePickerProps {
  componentId: string
  listenToComponent?: string
}

export function DatePicker({ componentId, listenToComponent }: DatePickerProps) {
  const { items, selectedIndex, emitSelection } = useComposableList<CalendarDay>({
    componentId,
    listenToComponent,
    initialItems: generateDays(),
  })

  const today = new Date()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {MONTHS[today.getMonth()]} {today.getFullYear()}
        </h3>
        <div className="flex gap-1">
          <button className="p-1.5 hover:bg-gray-100 rounded text-gray-400">←</button>
          <button className="p-1.5 hover:bg-gray-100 rounded text-gray-400">→</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
        {items.map((day, index) => (
          <button
            key={index}
            disabled={!day.available || !day.isCurrentMonth}
            onClick={() => day.available && emitSelection(day, index)}
            className={`
              aspect-square flex items-center justify-center text-sm rounded-full relative
              ${!day.isCurrentMonth ? 'invisible' : ''}
              ${!day.available ? 'text-gray-300 cursor-default' : 'hover:bg-blue-50 cursor-pointer'}
              ${selectedIndex === index ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
              ${day.isToday && selectedIndex !== index ? 'font-bold' : ''}
            `}
          >
            {day.day > 0 ? day.day : ''}
            {day.isToday && selectedIndex !== index && (
              <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-600" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
