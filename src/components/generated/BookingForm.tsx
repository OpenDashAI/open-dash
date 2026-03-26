/**
 * GENERATED from: tools/design-extractor/extracted/cal-booking.json
 * Domain: Booking (cal.com style)
 * Hook: useComposableForm
 */

import { useComposableForm } from '../../hooks/composable'

interface BookingFormProps {
  componentId: string
  listenToComponent?: string
}

export function BookingForm({ componentId, listenToComponent }: BookingFormProps) {
  const { values, errors, setValue, emitSubmit, dirty } = useComposableForm({
    componentId,
    listenToComponent,
    fields: [
      { name: 'name', label: 'Your Name', type: 'text', required: true },
      { name: 'email', label: 'Email Address', type: 'email', required: true },
      { name: 'notes', label: 'Additional Notes', type: 'textarea' },
    ],
  })

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-gray-900">Confirm Booking</h3>

      <div className="flex flex-col gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Name *
          </label>
          <input
            type="text"
            value={(values.name as string) ?? ''}
            onChange={e => setValue('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="John Doe"
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            value={(values.email as string) ?? ''}
            onChange={e => setValue('email', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="john@example.com"
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes
          </label>
          <textarea
            value={(values.notes as string) ?? ''}
            onChange={e => setValue('notes', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
            placeholder="Any details you'd like to share..."
          />
        </div>
      </div>

      <button
        onClick={() => emitSubmit()}
        className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        Confirm Booking
      </button>
    </div>
  )
}
