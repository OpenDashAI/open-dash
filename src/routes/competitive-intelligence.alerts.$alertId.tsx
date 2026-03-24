/**
 * Competitive Intelligence Alert Detail Page
 *
 * Shows comprehensive details about a specific alert including:
 * - What changed
 * - Why it matters (significance scoring)
 * - Strategic implications
 * - Recommended actions
 * - Timeline and history
 */

import { createFileRoute } from '@tanstack/react-router'
import { server$ } from '@tanstack/start'
import { useState, useEffect } from 'react'
import * as ciOrch from '../server/ci-orchestrator'

const fetchAlertDetail = server$(async (alertId: string) => {
	try {
		// In production, this would query the database for the specific alert
		// For now, return a placeholder that could be expanded
		console.log(`Fetching alert ${alertId}`)
		return {
			id: alertId,
			competitor: 'Competitor Name',
			title: 'Significant Change Detected',
			severity: 'high',
			timestamp: Date.now(),
			changes: [
				{
					type: 'metric',
					title: 'SERP Ranking Changed',
					description: 'Competitor moved up 5 positions for key term',
					severity: 'high',
				},
			],
			significance: {
				score: 0.75,
				level: 'high',
				reasoning: 'This suggests the competitor is improving their SEO strategy',
				implications: [
					'Competitor is gaining market visibility',
					'Our positioning may be challenged for key terms',
				],
				recommendations: [
					'Review our SEO strategy for these terms',
					'Analyze their backlink growth',
					'Consider content gap analysis',
				],
			},
		}
	} catch (error) {
		return null
	}
})

export const Route = createFileRoute('/competitive-intelligence/alerts/$alertId')({
	component: AlertDetailPage,
})

function AlertDetailPage() {
	const { alertId } = Route.useParams()
	const [alert, setAlert] = useState<any>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const load = async () => {
			try {
				const data = await fetchAlertDetail(alertId)
				setAlert(data)
			} catch (error) {
				console.error('Failed to load alert:', error)
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [alertId])

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading alert details...</p>
				</div>
			</div>
		)
	}

	if (!alert) {
		return (
			<div className="min-h-screen bg-gray-50 px-6 py-8">
				<div className="max-w-3xl mx-auto">
					<div className="bg-white rounded-lg border border-gray-200 p-6">
						<p className="text-gray-600">Alert not found</p>
					</div>
				</div>
			</div>
		)
	}

	const severityIcon = {
		critical: '🚨',
		high: '⚠️',
		medium: 'ℹ️',
		low: '✅',
	}[alert.severity] || '•'

	const severityColor = {
		critical: 'border-red-200 bg-red-50',
		high: 'border-orange-200 bg-orange-50',
		medium: 'border-yellow-200 bg-yellow-50',
		low: 'border-blue-200 bg-blue-50',
	}[alert.severity] || 'border-gray-200 bg-gray-50'

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white border-b border-gray-200">
				<div className="max-w-3xl mx-auto px-6 py-8">
					<a
						href="/competitive-intelligence?tab=alerts"
						className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4 inline-block"
					>
						← Back to Alerts
					</a>
					<div className="flex items-start justify-between">
						<div>
							<h1 className="text-3xl font-bold text-gray-900 mb-2">{alert.title}</h1>
							<p className="text-gray-600">
								<span className="font-medium">{alert.competitor}</span> •{' '}
								{new Date(alert.timestamp).toLocaleString()}
							</p>
						</div>
						<div>
							<span
								className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
									alert.severity === 'critical'
										? 'bg-red-100 text-red-900'
										: alert.severity === 'high'
											? 'bg-orange-100 text-orange-900'
											: alert.severity === 'medium'
												? 'bg-yellow-100 text-yellow-900'
												: 'bg-blue-100 text-blue-900'
								}`}
							>
								{severityIcon} {alert.severity.toUpperCase()}
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
				{/* Alert Summary */}
				<div className={`border rounded-lg p-6 ${severityColor}`}>
					<h2 className="text-lg font-semibold text-gray-900 mb-4">Alert Summary</h2>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<p className="text-sm text-gray-600">Severity</p>
							<p className="font-semibold text-gray-900">{alert.severity.toUpperCase()}</p>
						</div>
						<div>
							<p className="text-sm text-gray-600">Significance Score</p>
							<p className="font-semibold text-gray-900">
								{(alert.significance.score * 100).toFixed(0)}%
							</p>
						</div>
						<div>
							<p className="text-sm text-gray-600">Competitor</p>
							<p className="font-semibold text-gray-900">{alert.competitor}</p>
						</div>
						<div>
							<p className="text-sm text-gray-600">Detected</p>
							<p className="font-semibold text-gray-900">
								{new Date(alert.timestamp).toLocaleDateString()}
							</p>
						</div>
					</div>
				</div>

				{/* Changes Detected */}
				<div className="bg-white rounded-lg border border-gray-200 p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">
						Changes Detected ({alert.changes.length})
					</h2>
					<div className="space-y-3">
						{alert.changes.map((change: any, idx: number) => (
							<div
								key={idx}
								className="flex items-start gap-4 pb-3 border-b border-gray-200 last:border-0 last:pb-0"
							>
								<div className="flex-1">
									<h3 className="font-semibold text-gray-900">{change.title}</h3>
									<p className="text-sm text-gray-600 mt-1">{change.description}</p>
								</div>
								<span
									className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
										change.severity === 'critical'
											? 'bg-red-100 text-red-900'
											: change.severity === 'high'
												? 'bg-orange-100 text-orange-900'
												: 'bg-yellow-100 text-yellow-900'
									}`}
								>
									{change.severity}
								</span>
							</div>
						))}
					</div>
				</div>

				{/* Analysis */}
				<div className="bg-white rounded-lg border border-gray-200 p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">Analysis & Reasoning</h2>
					<p className="text-gray-700 mb-4">{alert.significance.reasoning}</p>

					{alert.significance.implications.length > 0 && (
						<div className="mb-6">
							<h3 className="font-semibold text-gray-900 mb-3">Strategic Implications</h3>
							<ul className="space-y-2">
								{alert.significance.implications.map((impl: string, idx: number) => (
									<li key={idx} className="flex items-start gap-2 text-gray-700">
										<span className="text-blue-600 mt-1">▸</span>
										<span>{impl}</span>
									</li>
								))}
							</ul>
						</div>
					)}

					{alert.significance.recommendations.length > 0 && (
						<div>
							<h3 className="font-semibold text-gray-900 mb-3">Recommended Actions</h3>
							<ol className="space-y-2 list-decimal list-inside">
								{alert.significance.recommendations.map((rec: string, idx: number) => (
									<li key={idx} className="text-gray-700">
										{rec}
									</li>
								))}
							</ol>
						</div>
					)}
				</div>

				{/* Quick Actions */}
				<div className="flex gap-3">
					<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
						Mark as Reviewed
					</button>
					<button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
						Dismiss
					</button>
					<button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
						Archive
					</button>
				</div>
			</div>
		</div>
	)
}
