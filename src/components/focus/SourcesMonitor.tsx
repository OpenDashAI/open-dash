import { useEffect, useState } from 'react'
import type { DataSourceInfo } from '../../server/datasources'
import { metricsTracker } from '../../lib/monitoring'

interface SourcesMonitorProps {
	sources: DataSourceInfo[]
}

export function SourcesMonitor({ sources }: SourcesMonitorProps) {
	const [lastFetchTimes, setLastFetchTimes] = useState<Map<string, string>>(
		new Map()
	)

	useEffect(() => {
		const interval = setInterval(() => {
			const times = new Map<string, string>()
			sources.forEach((source) => {
				times.set(source.id, metricsTracker.getLastFetchTime(source.id))
			})
			setLastFetchTimes(times)
		}, 1000)

		return () => clearInterval(interval)
	}, [sources])

	return (
		<div className="sources-monitor">
			{sources.map((source) => {
				const metric = metricsTracker.getMetric(source.id)
				const health = metricsTracker.getHealthStatus(source.id)
				const lastFetch = lastFetchTimes.get(source.id) || 'never'
				const statusText = source.status.connected ? 'Connected' : 'Offline'

				return (
					<div key={source.id} className="source-monitor-item">
						<div className="source-info">
							<span className="source-name">{source.name}</span>
							<span className="last-fetch">{lastFetch}</span>
						</div>
						<div className="source-health">
							<div className={`health-indicator health-${health}`} />
							<span className="status-text">{statusText}</span>
							{metric && (
								<span className="latency">{metric.fetchLatency}ms</span>
							)}
						</div>
					</div>
				)
			})}
		</div>
	)
}
