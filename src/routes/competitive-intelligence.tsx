import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { server$ } from '@tanstack/start'
import * as ciOrch from '../server/ci-orchestrator'

// Server functions wrapped for client access
const fetchDashboard = server$(async () => {
	try {
		return await ciOrch.getDashboard()
	} catch (error) {
		console.error('Failed to fetch dashboard:', error)
		return null
	}
})

const fetchAlerts = server$(async (hours: number = 24) => {
	try {
		return await ciOrch.getAlerts(hours)
	} catch (error) {
		console.error('Failed to fetch alerts:', error)
		return { alerts: [], total: 0 }
	}
})

const fetchCompetitors = server$(async () => {
	try {
		const result = await ciOrch.listCompetitors()
		return result.competitors || []
	} catch (error) {
		console.error('Failed to fetch competitors:', error)
		return []
	}
})

export const Route = createFileRoute('/competitive-intelligence')({
  component: CompetitiveIntelligencePage,
})

export default function CompetitiveIntelligencePage() {
  const [dashboard, setDashboard] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCompetitor, setSelectedCompetitor] = useState<string | null>(null)
  const [alerts, setAlerts] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'competitors' | 'alerts' | 'insights'>('overview')

  useEffect(() => {
    loadDashboard()
    loadAlerts()

    // Poll for updates every 30 seconds
    const interval = setInterval(() => {
      loadDashboard()
      loadAlerts()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  async function loadDashboard() {
    try {
      const data = await fetchDashboard()
      setDashboard(data)
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadAlerts() {
    try {
      const data = await fetchAlerts(24)
      setAlerts(data.alerts || [])
    } catch (error) {
      console.error('Failed to load alerts:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading competitive intelligence...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Competitive Intelligence</h1>
          <p className="text-gray-600 mt-2">Monitor competitor activity, track market changes, and identify opportunities</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 border-b-2 transition ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('competitors')}
              className={`py-4 border-b-2 transition ${
                activeTab === 'competitors'
                  ? 'border-blue-500 text-blue-600 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Competitors
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`py-4 border-b-2 transition ${
                activeTab === 'alerts'
                  ? 'border-blue-500 text-blue-600 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Alerts {alerts.length > 0 && <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">{alerts.length}</span>}
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`py-4 border-b-2 transition ${
                activeTab === 'insights'
                  ? 'border-blue-500 text-blue-600 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Insights
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && <OverviewTab dashboard={dashboard} />}
        {activeTab === 'competitors' && <CompetitorsTab dashboard={dashboard} />}
        {activeTab === 'alerts' && <AlertsTab alerts={alerts} />}
        {activeTab === 'insights' && <InsightsTab dashboard={dashboard} />}
      </div>
    </div>
  )
}

function OverviewTab({ dashboard }: any) {
  if (!dashboard) return null

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Competitors Monitored"
          value={dashboard.competitors.total}
          subtext={`${dashboard.competitors.active} active`}
          color="blue"
        />
        <MetricCard
          title="Recent Alerts"
          value={dashboard.alerts.recent}
          subtext={`${dashboard.alerts.critical} critical`}
          color="red"
        />
        <MetricCard
          title="Open Opportunities"
          value={dashboard.insights.openOpportunities}
          subtext="Market gaps identified"
          color="green"
        />
        <MetricCard
          title="API Usage"
          value={`${dashboard.apiUsage.percentOfQuota}%`}
          subtext={`$${dashboard.apiUsage.estimatedCost.toFixed(2)}/mo`}
          color="purple"
        />
      </div>

      {/* Top Movers */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top SERP Movers</h2>
        <div className="space-y-3">
          {dashboard.serp.topMovers.length > 0 ? (
            dashboard.serp.topMovers.map((mover: any) => (
              <div key={mover.competitor} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-medium text-gray-900">{mover.competitor}</span>
                <span className={mover.change > 0 ? 'text-green-600' : 'text-red-600'}>
                  {mover.change > 0 ? '📈' : '📉'} {Math.abs(mover.change)} positions
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No significant ranking changes this period</p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Content</h2>
          <p className="text-4xl font-bold text-blue-600">{dashboard.insights.recentContent}</p>
          <p className="text-gray-600 text-sm mt-2">New articles/pages detected</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Threats</h2>
          <p className="text-4xl font-bold text-red-600">{dashboard.insights.activeThreats}</p>
          <p className="text-gray-600 text-sm mt-2">Competitive threats identified</p>
        </div>
      </div>
    </div>
  )
}

function CompetitorsTab({ dashboard }: any) {
  const [competitors, setCompetitors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCompetitors()
  }, [])

  async function loadCompetitors() {
    try {
      const data = await fetchCompetitors()
      setCompetitors(data)
    } catch (error) {
      console.error('Failed to load competitors:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center py-8">Loading competitors...</div>

  return (
    <div className="space-y-4">
      {competitors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {competitors.map((comp) => (
            <div key={comp.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition">
              <h3 className="text-lg font-semibold text-gray-900">{comp.name}</h3>
              <p className="text-gray-600 text-sm mt-1">{comp.domain}</p>

              <div className="mt-4 space-y-2 text-sm">
                {comp.domainAuthority && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Domain Authority</span>
                    <span className="font-medium">{comp.domainAuthority}</span>
                  </div>
                )}
                {comp.trafficEstimate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Traffic</span>
                    <span className="font-medium">{(comp.trafficEstimate / 1000).toFixed(0)}K</span>
                  </div>
                )}
                {comp.organicKeywords && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Organic Keywords</span>
                    <span className="font-medium">{comp.organicKeywords.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {comp.lastChecked && (
                <p className="text-xs text-gray-500 mt-4">
                  Last updated: {new Date(comp.lastChecked).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-gray-700">No competitors configured yet.</p>
          <p className="text-gray-600 text-sm mt-2">Use ODA CLI to add competitors: <code className="bg-white px-2 py-1 rounded">oda competitors add "Name" "domain.com"</code></p>
        </div>
      )}
    </div>
  )
}

function AlertsTab({ alerts }: any) {
  const criticalAlerts = alerts.filter((a: any) => a.severity === 'critical')
  const highAlerts = alerts.filter((a: any) => a.severity === 'high')
  const mediumAlerts = alerts.filter((a: any) => a.severity === 'medium')

  return (
    <div className="space-y-6">
      {criticalAlerts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-red-900 mb-3">🚨 Critical Alerts ({criticalAlerts.length})</h2>
          <div className="space-y-3">
            {criticalAlerts.map((alert: any) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      )}

      {highAlerts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-orange-900 mb-3">⚠️ High Priority ({highAlerts.length})</h2>
          <div className="space-y-3">
            {highAlerts.map((alert: any) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      )}

      {mediumAlerts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-yellow-900 mb-3">ℹ️ Medium ({mediumAlerts.length})</h2>
          <div className="space-y-3">
            {mediumAlerts.map((alert: any) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      )}

      {alerts.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <p className="text-green-900 font-medium">✓ All clear - no recent alerts</p>
          <p className="text-green-700 text-sm mt-2">Your competitive landscape is stable</p>
        </div>
      )}
    </div>
  )
}

function AlertCard({ alert }: any) {
  const colorMap = {
    critical: 'bg-red-50 border-red-200',
    high: 'bg-orange-50 border-orange-200',
    medium: 'bg-yellow-50 border-yellow-200',
    low: 'bg-blue-50 border-blue-200',
  }

  return (
    <div className={`border rounded-lg p-4 ${colorMap[alert.severity as keyof typeof colorMap] || colorMap.medium}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{alert.competitor}</h3>
          <p className="text-gray-700 mt-1">{alert.message}</p>
          <p className="text-xs text-gray-600 mt-2">
            {new Date(alert.timestamp).toLocaleString()}
          </p>
        </div>
        <span className={`px-3 py-1 rounded text-sm font-medium whitespace-nowrap ml-4 ${
          alert.severity === 'critical' ? 'bg-red-200 text-red-900' :
          alert.severity === 'high' ? 'bg-orange-200 text-orange-900' :
          alert.severity === 'medium' ? 'bg-yellow-200 text-yellow-900' :
          'bg-blue-200 text-blue-900'
        }`}>
          {alert.severity.toUpperCase()}
        </span>
      </div>
    </div>
  )
}

function InsightsTab({ dashboard }: any) {
  if (!dashboard) return null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🎯 Market Opportunities</h2>
          <p className="text-3xl font-bold text-green-600">{dashboard.insights.openOpportunities}</p>
          <p className="text-gray-600 text-sm mt-2">Unaddressed gaps in market</p>
          <button className="mt-4 px-4 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100 transition text-sm font-medium">
            View Opportunities
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🚨 Active Threats</h2>
          <p className="text-3xl font-bold text-red-600">{dashboard.insights.activeThreats}</p>
          <p className="text-gray-600 text-sm mt-2">Competitive threats identified</p>
          <button className="mt-4 px-4 py-2 bg-red-50 text-red-700 rounded hover:bg-red-100 transition text-sm font-medium">
            View Threats
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">💡 How to Use ODA</h2>
        <div className="space-y-3 text-sm">
          <div>
            <p className="font-medium text-gray-900">Command Line:</p>
            <code className="bg-gray-100 px-2 py-1 rounded text-xs">oda dashboard</code>
            <p className="text-gray-600 mt-1">Run <code className="bg-gray-100 px-1">oda --help</code> for all commands</p>
          </div>
          <div className="mt-4">
            <p className="font-medium text-gray-900">Chat with AI:</p>
            <p className="text-gray-600">Ask directly in OpenDash chat: "What are our top competitive threats?"</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, subtext, color }: any) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
  }

  return (
    <div className={`rounded-lg border p-6 ${colorMap[color as keyof typeof colorMap] || colorMap.blue}`}>
      <p className="text-sm font-medium opacity-75">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
      {subtext && <p className="text-xs mt-2 opacity-75">{subtext}</p>}
    </div>
  )
}
