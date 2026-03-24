/**
 * Competitive Intelligence Metrics Endpoint
 *
 * Exports CI metrics in Prometheus format for Grafana scraping
 * Endpoint: GET /api/ci-metrics
 *
 * Metrics exported:
 * - ci_competitors_total - Total competitors being monitored
 * - ci_alerts_total - Total alerts (by severity)
 * - ci_competitor_domain_authority - DA scores for each competitor
 * - ci_competitor_traffic - Estimated traffic for each competitor
 * - ci_competitor_organic_keywords - Organic keyword count per competitor
 * - ci_competitor_serp_rank - SERP position for key terms
 * - ci_api_calls_total - Total API calls made
 * - ci_api_cost_usd - Estimated cost in USD
 */

import { createAPIFileRoute } from '@tanstack/start/api'
import { server$ } from '@tanstack/start'
import * as ciOrch from '../../server/ci-orchestrator'

const metricsHandler = server$(async () => {
	try {
		const dashboard = await ciOrch.getDashboard()
		const alerts = await ciOrch.getAlerts(24)
		const { competitors } = await ciOrch.listCompetitors()
		const costs = await ciOrch.getCostBreakdown()

		// Generate Prometheus metrics
		let metrics = '# HELP ci_competitors_total Total number of competitors being monitored\n'
		metrics += '# TYPE ci_competitors_total gauge\n'
		metrics += `ci_competitors_total ${dashboard.competitors.total}\n\n`

		// Competitor alerts
		metrics += '# HELP ci_alerts_total Total alerts by severity\n'
		metrics += '# TYPE ci_alerts_total gauge\n'
		metrics += `ci_alerts_critical ${dashboard.alerts.critical}\n`
		metrics += `ci_alerts_recent ${dashboard.alerts.recent}\n\n`

		// Domain metrics
		metrics += '# HELP ci_competitor_domain_authority Domain authority score (0-100)\n'
		metrics += '# TYPE ci_competitor_domain_authority gauge\n'
		for (const comp of competitors) {
			if (comp.domainAuthority) {
				metrics += `ci_competitor_domain_authority{competitor="${comp.name.replace(/"/g, '\\"')}"} ${comp.domainAuthority}\n`
			}
		}
		metrics += '\n'

		// Traffic metrics
		metrics += '# HELP ci_competitor_traffic_estimate Monthly traffic estimate\n'
		metrics += '# TYPE ci_competitor_traffic_estimate gauge\n'
		for (const comp of competitors) {
			if (comp.trafficEstimate) {
				metrics += `ci_competitor_traffic_estimate{competitor="${comp.name.replace(/"/g, '\\"')}"} ${comp.trafficEstimate}\n`
			}
		}
		metrics += '\n'

		// Organic keywords
		metrics += '# HELP ci_competitor_organic_keywords Organic keywords ranking\n'
		metrics += '# TYPE ci_competitor_organic_keywords gauge\n'
		for (const comp of competitors) {
			if (comp.organicKeywords) {
				metrics += `ci_competitor_organic_keywords{competitor="${comp.name.replace(/"/g, '\\"')}"} ${comp.organicKeywords}\n`
			}
		}
		metrics += '\n'

		// API metrics
		metrics += '# HELP ci_api_calls_total Total API calls made this month\n'
		metrics += '# TYPE ci_api_calls_total gauge\n'
		metrics += `ci_api_calls_total ${costs.breakdown.reduce((sum: number, item: any) => sum + item.calls, 0)}\n\n`

		// Cost metrics
		metrics += '# HELP ci_api_cost_usd Total API cost in USD\n'
		metrics += '# TYPE ci_api_cost_usd gauge\n'
		metrics += `ci_api_cost_usd ${costs.totalCost}\n\n`

		// Quota metrics
		metrics += '# HELP ci_quota_remaining Daily quota remaining\n'
		metrics += '# TYPE ci_quota_remaining gauge\n'
		metrics += `ci_quota_remaining ${costs.quota.remaining}\n\n`

		return {
			status: 200,
			headers: { 'content-type': 'text/plain; version=0.0.4' },
			body: metrics,
		}
	} catch (error) {
		console.error('Error generating metrics:', error)
		return {
			status: 500,
			headers: { 'content-type': 'text/plain' },
			body: `# Error generating metrics\nerror_message="${error instanceof Error ? error.message : 'Unknown error'}"`,
		}
	}
})

export const Route = createAPIFileRoute('/api/ci-metrics')({
	GET: async () => {
		return metricsHandler()
	},
})
