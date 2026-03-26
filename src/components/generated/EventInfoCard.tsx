/**
 * GENERATED from: tools/design-extractor/extracted/cal-booking.json
 * Domain: Booking (cal.com style)
 * Hook: useComposableCard
 */

import { useComposableCard } from '../../hooks/composable'

interface EventInfo {
  title: string
  host: string
  duration: number
  location: string
  description: string
}

interface EventInfoCardProps {
  componentId: string
  listenToComponent?: string
}

export function EventInfoCard({ componentId, listenToComponent }: EventInfoCardProps) {
  const { data } = useComposableCard<EventInfo>({
    componentId,
    listenToComponent,
    initialData: {
      title: '30 Minute Meeting',
      host: 'Gary Wu',
      duration: 30,
      location: 'Google Meet',
      description: 'A quick chat to discuss your project requirements and how we can help.',
    },
  })

  if (!data) return null

  return (
    <div className="flex flex-col gap-4">
      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
        {data.host.charAt(0)}
      </div>
      <div>
        <div className="text-sm text-gray-500">{data.host}</div>
        <h2 className="text-xl font-semibold text-gray-900 mt-1">{data.title}</h2>
      </div>
      <div className="flex flex-col gap-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span>🕐</span>
          <span>{data.duration} min</span>
        </div>
        <div className="flex items-center gap-2">
          <span>📍</span>
          <span>{data.location}</span>
        </div>
      </div>
      <p className="text-sm text-gray-500 leading-relaxed">{data.description}</p>
    </div>
  )
}
