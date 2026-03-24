/**
 * Competitive Intelligence Admin Settings
 *
 * Manage:
 * - Alert rules and thresholds
 * - Competitor monitoring configuration
 * - API cost budgets and quotas
 * - Notification channels
 */

import { createFileRoute } from '@tanstack/react-router'
import { server$ } from '@tanstack/start'
import { useState, useEffect } from 'react'
import * as ciOrch from '../server/ci-orchestrator'

const fetchAlertRules = server$(async () => {
	try {
		return await ciOrch.getAlertRules()
	} catch (error) {
		console.error('Failed to fetch alert rules:', error)
		return { rules: [], total: 0, enabled: 0 }
	}
})

const fetchQuotaStatus = server$(async () => {
	try {
		const costs = await ciOrch.getCostBreakdown()
		return {
			daily: costs.quota.daily,
			remaining: costs.quota.remaining,
			resetTime: costs.quota.resetTime,
		}
	} catch (error) {
		return { daily: 0, remaining: 0, resetTime: 0 }
	}
})

export const Route = createFileRoute('/competitive-intelligence/admin')({
	component: AdminPage,
})

function AdminPage() {
	const [activeTab, setActiveTab] = useState<'alerts' | 'competitors' | 'budget' | 'channels'>('alerts')
	const [alertRules, setAlertRules] = useState<any[]>([])
	const [quota, setQuota] = useState<any>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const load = async () => {
			try {
				const [rules, quotaData] = await Promise.all([
					fetchAlertRules(),
					fetchQuotaStatus(),
				])
				setAlertRules(rules.rules || [])
				setQuota(quotaData)
			} catch (error) {
				console.error('Failed to load admin data:', error)
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [])

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading settings...</p>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white border-b border-gray-200 px-6 py-8">
				<div className="max-w-7xl mx-auto">
					<h1 className="text-3xl font-bold text-gray-900">Competitive Intelligence Settings</h1>
					<p className="text-gray-600 mt-2">Manage alerts, competitors, budgets, and notifications</p>
				</div>
			</div>

			{/* Tabs */}
			<div className="bg-white border-b border-gray-200 sticky top-0 z-40">
				<div className="max-w-7xl mx-auto px-6">
					<div className="flex gap-8">
						{(['alerts', 'competitors', 'budget', 'channels'] as const).map((tab) => (
							<button
								key={tab}
								onClick={() => setActiveTab(tab)}
								className={`py-4 border-b-2 transition capitalize ${
									activeTab === tab
										? 'border-blue-500 text-blue-600 font-medium'
										: 'border-transparent text-gray-600 hover:text-gray-900'
								}`}
							>
								{tab === 'alerts' && 'Alert Rules'}
								{tab === 'competitors' && 'Competitors'}
								{tab === 'budget' && 'Budget & Quota'}
								{tab === 'channels' && 'Notifications'}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="max-w-7xl mx-auto px-6 py-8">
				{activeTab === 'alerts' && <AlertRulesTab rules={alertRules} />}
				{activeTab === 'competitors' && <CompetitorsTab />}
				{activeTab === 'budget' && <BudgetTab quota={quota} />}
				{activeTab === 'channels' && <ChannelsTab />}
			</div>
		</div>
	)
}

function AlertRulesTab({ rules }: any) {
	return (
		<div className="space-y-6">
			<div className="bg-white rounded-lg border border-gray-200 p-6">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-lg font-semibold text-gray-900">Alert Rules ({rules.length})</h2>
					<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
						+ New Rule
					</button>
				</div>

				{rules.length > 0 ? (
					<div className="space-y-3">
						{rules.map((rule: any) => (
							<div key={rule.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
								<div className="flex-1">
									<h3 className="font-medium text-gray-900">{rule.name}</h3>
									<p className="text-sm text-gray-600">{rule.condition}</p>
								</div>
								<div className="flex items-center gap-2">
									<label className="flex items-center gap-2 cursor-pointer">
										<input type="checkbox" defaultChecked={rule.enabled} />
										<span className="text-sm text-gray-600">Enabled</span>
									</label>
									<button className="px-3 py-1 text-gray-600 hover:text-gray-900">Edit</button>
									<button className="px-3 py-1 text-red-600 hover:text-red-900">Delete</button>
								</div>
							</div>
						))}
					</div>
				) : (
					<p className="text-gray-600 py-8 text-center">No alert rules configured yet</p>
				)}
			</div>

			<div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
				<h3 className="font-semibold text-blue-900 mb-2">Common Alert Rules</h3>
				<ul className="space-y-2 text-sm text-blue-900">
					<li>• SERP ranking drop &gt; 5 positions for key terms</li>
					<li>• Domain Authority increase &gt; 2 points</li>
					<li>• Pricing change detected (any tier)</li>
					<li>• New content published (&gt; 3 articles/week)</li>
					<li>• Backlink growth &gt; 100/month</li>
				</ul>
			</div>
		</div>
	)
}

function CompetitorsTab() {
	return (
		<div className="space-y-6">
			<div className="bg-white rounded-lg border border-gray-200 p-6">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-lg font-semibold text-gray-900">Competitor Configuration</h2>
					<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
						+ Add Competitor
					</button>
				</div>

				<div className="space-y-3">
					{['Metabase', 'Grafana', 'Tableau'].map((comp) => (
						<div key={comp} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
							<div>
								<h3 className="font-medium text-gray-900">{comp}</h3>
								<p className="text-sm text-gray-600">Active • Last checked 1h ago</p>
							</div>
							<div className="flex gap-2">
								<button className="px-3 py-1 text-gray-600 hover:text-gray-900 text-sm">Edit</button>
								<button className="px-3 py-1 text-red-600 hover:text-red-900 text-sm">Remove</button>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

function BudgetTab({ quota }: any) {
	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="bg-white rounded-lg border border-gray-200 p-6">
					<p className="text-sm text-gray-600 mb-2">Daily Quota</p>
					<p className="text-3xl font-bold text-gray-900">${quota?.daily || 0}</p>
					<p className="text-xs text-gray-600 mt-2">API call budget per day</p>
				</div>
				<div className="bg-white rounded-lg border border-gray-200 p-6">
					<p className="text-sm text-gray-600 mb-2">Remaining Today</p>
					<p className="text-3xl font-bold text-green-600">${quota?.remaining || 0}</p>
					<p className="text-xs text-gray-600 mt-2">Until {quota?.resetTime ? new Date(quota.resetTime).toLocaleTimeString() : 'next reset'}</p>
				</div>
				<div className="bg-white rounded-lg border border-gray-200 p-6">
					<p className="text-sm text-gray-600 mb-2">Usage Today</p>
					<p className="text-3xl font-bold text-blue-600">
						{quota ? Math.round(((quota.daily - quota.remaining) / quota.daily) * 100) : 0}%
					</p>
					<p className="text-xs text-gray-600 mt-2">Reset at midnight UTC</p>
				</div>
			</div>

			<div className="bg-white rounded-lg border border-gray-200 p-6">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">Budget Settings</h2>
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-900 mb-2">Daily API Budget</label>
						<div className="flex gap-2">
							<span className="text-gray-600">$</span>
							<input
								type="number"
								defaultValue={quota?.daily || 5}
								className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
								min="1"
								max="100"
							/>
						</div>
						<p className="text-xs text-gray-600 mt-1">Hard limit on API spending per day</p>
					</div>
					<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
						Save Settings
					</button>
				</div>
			</div>
		</div>
	)
}

function ChannelsTab() {
	return (
		<div className="space-y-6">
			<div className="bg-white rounded-lg border border-gray-200 p-6">
				<h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Channels</h2>

				<div className="space-y-6">
					{/* Slack */}
					<div className="border-t pt-6 first:border-0 first:pt-0">
						<div className="flex items-center justify-between mb-4">
							<div>
								<h3 className="font-medium text-gray-900">Slack</h3>
								<p className="text-sm text-gray-600">Send alerts to Slack channel</p>
							</div>
							<label className="flex items-center gap-2 cursor-pointer">
								<input type="checkbox" defaultChecked />
								<span className="text-sm text-gray-600">Enabled</span>
							</label>
						</div>
						<input
							type="text"
							placeholder="Enter Slack webhook URL"
							defaultValue="https://hooks.slack.com/services/..."
							className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
						/>
					</div>

					{/* Email */}
					<div className="border-t pt-6">
						<div className="flex items-center justify-between mb-4">
							<div>
								<h3 className="font-medium text-gray-900">Email</h3>
								<p className="text-sm text-gray-600">Send alerts via email</p>
							</div>
							<label className="flex items-center gap-2 cursor-pointer">
								<input type="checkbox" />
								<span className="text-sm text-gray-600">Enabled</span>
							</label>
						</div>
						<input
							type="email"
							placeholder="recipient@example.com"
							className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
						/>
					</div>

					{/* Webhook */}
					<div className="border-t pt-6">
						<div className="flex items-center justify-between mb-4">
							<div>
								<h3 className="font-medium text-gray-900">Custom Webhook</h3>
								<p className="text-sm text-gray-600">Send JSON payloads to custom endpoint</p>
							</div>
							<label className="flex items-center gap-2 cursor-pointer">
								<input type="checkbox" />
								<span className="text-sm text-gray-600">Enabled</span>
							</label>
						</div>
						<input
							type="url"
							placeholder="https://your-system.com/webhook"
							className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
						/>
					</div>

					<button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
						Save Channels
					</button>
				</div>
			</div>
		</div>
	)
}
