/**
 * Competitor Detail Page
 *
 * Shows comprehensive information about a specific competitor:
 * - Domain metrics (DA, traffic, backlinks)
 * - SERP rankings for key terms
 * - Content activity and publishing patterns
 * - Recent changes and alerts
 * - Historical trends
 * - Strategic positioning
 */

import { createFileRoute } from '@tanstack/react-router'
import { server$ } from '@tanstack/start'
import { useState, useEffect } from 'react'

const fetchCompetitorDetail = server$(async (competitorId: string) => {
	try {
		console.log(`Fetching competitor ${competitorId}`)
		return {
			id: competitorId,
			name: 'Competitor Name',
			domain: 'competitor.com',
			website: 'https://competitor.com',
			metrics: {
				domainAuthority: 65,
				trafficEstimate: 150000,
				organicKeywords: 3000,
				backlinksCount: 10000,
				lastUpdated: Date.now(),
			},
			serpRankings: [
				{ keyword: 'key term 1', rank: 2, change: 1 },
				{ keyword: 'key term 2', rank: 5, change: -2 },
				{ keyword: 'key term 3', rank: 3, change: 0 },
			],
			recentActivity: [
				{ type: 'content', title: 'New Blog Post Published', date: Date.now() - 86400000 },
				{ type: 'pricing', title: 'Price Tier Updated', date: Date.now() - 172800000 },
			],
			alerts: [
				{ id: 'alert-1', title: 'SERP Ranking Change', severity: 'high', date: Date.now() - 86400000 },
			],
		}
	} catch (error) {
		return null
	}
})

export const Route = createFileRoute('/competitive-intelligence/competitors/$competitorId')({
	component: CompetitorDetailPage,
})

function CompetitorDetailPage() {
	const { competitorId } = Route.useParams()
	const [competitor, setCompetitor] = useState<any>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const load = async () => {
			try {
				const data = await fetchCompetitorDetail(competitorId)
				setCompetitor(data)
			} catch (error) {
				console.error('Failed to load competitor:', error)
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [competitorId])

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading competitor details...</p>
				</div>
			</div>
		)
	}

	if (!competitor) {
		return (
			<div className="min-h-screen bg-gray-50 px-6 py-8">
				<div className="max-w-4xl mx-auto">
					<div className="bg-white rounded-lg border border-gray-200 p-6">
						<p className="text-gray-600">Competitor not found</p>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white border-b border-gray-200">
				<div className="max-w-4xl mx-auto px-6 py-8">
					<a
						href="/competitive-intelligence?tab=competitors"
						className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4 inline-block"
					>
						← Back to Competitors
					</a>
					<div className="flex items-start justify-between">
						<div>
							<h1 className="text-3xl font-bold text-gray-900">{competitor.name}</h1>
							<a
								href={competitor.website}
								target="_blank"
								rel="noopener noreferrer"
								className="text-blue-600 hover:text-blue-700 mt-2 inline-block"
							>
								{competitor.domain} ↗
							</a>
						</div>
						<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
							Configure Monitoring
						</button>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
				{/* Key Metrics */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<MetricTile
						label="Domain Authority"
						value={competitor.metrics.domainAuthority}
						format={(v) => v}
					/>
					<MetricTile
						label="Monthly Traffic"
						value={competitor.metrics.trafficEstimate}
						format={(v) => `${(v / 1000).toFixed(0)}K`}
					/>
					<MetricTile
						label="Organic Keywords"
						value={competitor.metrics.organicKeywords}
						format={(v) => v.toLocaleString()}
					/>
					<MetricTile
						label="Backlinks"
						value={competitor.metrics.backlinksCount}
						format={(v) => (v / 1000).toFixed(1) + 'K'}
					/>
				</div>

				{/* SERP Rankings */}
				<div className="bg-white rounded-lg border border-gray-200 p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">SERP Rankings</h2>
					<div className="space-y-3">
						{competitor.serpRankings.map((ranking: any, idx: number) => (
							<div
								key={idx}
								className="flex items-center justify-between p-3 bg-gray-50 rounded"
							>
								<div>
									<p className="font-medium text-gray-900">{ranking.keyword}</p>
									<p className="text-sm text-gray-600">Rank #{ranking.rank}</p>
								</div>
								<div className="flex items-center gap-2">
									<span
										className={`text-sm font-medium ${
											ranking.change > 0
												? 'text-red-600'
												: ranking.change < 0
													? 'text-green-600'
													: 'text-gray-600'
										}`}
									>
										{ranking.change > 0 ? '↓' : ranking.change < 0 ? '↑' : '–'}{' '}
										{Math.abs(ranking.change)}
									</span>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Recent Activity */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Activity Timeline */}
					<div className="bg-white rounded-lg border border-gray-200 p-6">
						<h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
						<div className="space-y-3">
							{competitor.recentActivity.map((activity: any, idx: number) => (
								<div key={idx} className="flex items-start gap-3 pb-3 border-b border-gray-200 last:border-0 last:pb-0">
									<div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
									<div className="flex-1">
										<p className="font-medium text-gray-900">{activity.title}</p>
										<p className="text-sm text-gray-600">
											{new Date(activity.date).toLocaleDateString()}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Recent Alerts */}
					<div className="bg-white rounded-lg border border-gray-200 p-6">
						<h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h2>
						<div className="space-y-3">
							{competitor.alerts.map((alert: any, idx: number) => (
								<a
									key={idx}
									href={`/competitive-intelligence/alerts/${alert.id}`}
									className="block p-3 bg-gray-50 rounded hover:bg-gray-100 transition"
								>
									<div className="flex items-start justify-between">
										<div>
											<p className="font-medium text-gray-900">{alert.title}</p>
											<p className="text-sm text-gray-600">
												{new Date(alert.date).toLocaleDateString()}
											</p>
										</div>
										<span
											className={`px-2 py-1 rounded text-xs font-medium ${
												alert.severity === 'high'
													? 'bg-orange-100 text-orange-900'
													: 'bg-yellow-100 text-yellow-900'
											}`}
										>
											{alert.severity.toUpperCase()}
										</span>
									</div>
								</a>
							))}
						</div>
					</div>
				</div>

				{/* Content Strategy */}
				<div className="bg-white rounded-lg border border-gray-200 p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">Content Strategy Analysis</h2>
					<div className="space-y-4">
						<div>
							<p className="text-sm font-medium text-gray-600 mb-2">Publishing Frequency</p>
							<p className="text-gray-900">~5 articles per week (estimated)</p>
						</div>
						<div>
							<p className="text-sm font-medium text-gray-600 mb-2">Top Content Categories</p>
							<div className="flex flex-wrap gap-2">
								{['Blog', 'Case Studies', 'Whitepapers', 'Product Updates'].map((cat) => (
									<span key={cat} className="px-3 py-1 bg-blue-100 text-blue-900 rounded text-sm">
										{cat}
									</span>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* Quick Actions */}
				<div className="flex gap-3">
					<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
						View on ODA
					</button>
					<button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
						Compare Competitors
					</button>
					<button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
						Export Report
					</button>
				</div>
			</div>
		</div>
	)
}

function MetricTile({ label, value, format }: any) {
	return (
		<div className="bg-white rounded-lg border border-gray-200 p-4">
			<p className="text-sm text-gray-600 mb-2">{label}</p>
			<p className="text-2xl font-bold text-gray-900">{format ? format(value) : value}</p>
		</div>
	)
}
