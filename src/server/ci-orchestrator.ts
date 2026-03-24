/**
 * Competitive Intelligence Orchestrator
 *
 * Manages all CI operations through a unified interface.
 * Integrates with:
 * - API Mom: Cost-controlled API access via managed proxy
 * - BraveSearch: SERP tracking
 * - Claude AI: Significance analysis
 * - D1 Database: Data persistence
 * - Durable Objects: Job scheduling
 * - Slack/Email: Alerting
 *
 * All API calls route through API Mom for:
 * - Cost tracking and limits
 * - Rate limiting enforcement
 * - API key management (no local secrets)
 * - Request logging and audit trails
 */

interface CIConfig {
	apiMomUrl: string;
	apiMomKey: string;
	openrouterKey?: string; // For direct Claude calls
}

function getConfig(): CIConfig {
	const apiMomUrl = process.env.API_MOM_URL;
	const apiMomKey = process.env.API_MOM_KEY;

	if (!apiMomUrl || !apiMomKey) {
		throw new Error("API_MOM_URL and API_MOM_KEY required for CI orchestrator");
	}

	return {
		apiMomUrl,
		apiMomKey,
		openrouterKey: process.env.OPENROUTER_KEY,
	};
}

/**
 * Fetch through API Mom proxy for cost control and security
 * All external API calls route here
 */
async function apiMomFetch<T>(
	path: string,
	options?: RequestInit
): Promise<T> {
	const { apiMomUrl, apiMomKey } = getConfig();

	const response = await fetch(`${apiMomUrl}${path}`, {
		...options,
		headers: {
			"Content-Type": "application/json",
			"X-API-Key": apiMomKey,
			...options?.headers,
		},
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`API Mom ${response.status}: ${text}`);
	}

	return (await response.json()) as T;
}

// --- Competitor Management ---

export interface Competitor {
	id: string;
	name: string;
	domain: string;
	website: string;
	dataSource: "manual" | "ahrefs" | "similarweb" | "semrush";
	lastChecked?: number;
}

/**
 * List all competitors being monitored
 */
export async function listCompetitors(): Promise<{
	competitors: Competitor[];
	total: number;
}> {
	return apiMomFetch("/v1/ci/competitors");
}

/**
 * Add a competitor to monitoring
 */
export async function addCompetitor(
	competitor: Omit<Competitor, "id">
): Promise<{ success: boolean; competitor: Competitor }> {
	return apiMomFetch("/v1/ci/competitors", {
		method: "POST",
		body: JSON.stringify(competitor),
	});
}

/**
 * Get detailed metrics for a competitor
 */
export async function getCompetitorMetrics(competitorId: string): Promise<{
	competitor: Competitor;
	metrics: {
		domainAuthority: number;
		traffic: number;
		organicKeywords: number;
		backlinks: number;
		lastUpdated: number;
	};
	trends: {
		trafficTrend: "up" | "down" | "stable";
		keywordsTrend: "up" | "down" | "stable";
	};
}> {
	return apiMomFetch(`/v1/ci/competitors/${competitorId}/metrics`);
}

// --- SERP Tracking ---

export interface SerpRank {
	keyword: string;
	rank: number;
	searchVolume?: number;
	difficulty?: number;
	timestamp: number;
	change?: number; // from previous day
	trend?: "U" | "D" | "S";
}

/**
 * Get SERP rankings for a competitor
 */
export async function getCompetitorRankings(
	competitorId: string,
	days: number = 7
): Promise<{
	competitor: string;
	rankings: SerpRank[];
	summary: {
		avgRank: number;
		improvingKeywords: string[];
		decliningKeywords: string[];
	};
}> {
	return apiMomFetch(
		`/v1/ci/competitors/${competitorId}/rankings?days=${days}`
	);
}

/**
 * Check current ranking for a specific keyword
 */
export async function checkKeywordRanking(
	keyword: string,
	competitors?: string[]
): Promise<{
	keyword: string;
	results: Array<{
		competitor: string;
		rank: number;
	}>;
	timestamp: number;
}> {
	const params = new URLSearchParams({
		keyword,
		...(competitors && { competitors: competitors.join(",") }),
	});

	return apiMomFetch(`/v1/ci/serp/check?${params}`);
}

// --- Market Intelligence ---

export interface MarketInsight {
	id: string;
	type: "gap" | "threat" | "opportunity" | "trend";
	title: string;
	description: string;
	confidence: number;
	relatedCompetitors: string[];
	discoveredAt: number;
	addressed?: boolean;
}

/**
 * Get unaddressed market opportunities
 */
export async function getMarketOpportunities(): Promise<{
	opportunities: MarketInsight[];
	total: number;
	highConfidence: number;
}> {
	return apiMomFetch("/v1/ci/insights/opportunities");
}

/**
 * Get competitive threats
 */
export async function getCompetitiveThreats(): Promise<{
	threats: MarketInsight[];
	total: number;
	critical: number;
}> {
	return apiMomFetch("/v1/ci/insights/threats");
}

// --- Content Tracking ---

export interface CompetitorContent {
	id: string;
	competitor: string;
	url: string;
	title: string;
	type: "blog" | "case_study" | "tutorial" | "announcement";
	publishedAt: number;
	topics: string[];
	estimatedReach: number;
}

/**
 * Get recent content from competitors
 */
export async function getRecentCompetitorContent(limit: number = 20): Promise<{
	content: CompetitorContent[];
	total: number;
}> {
	return apiMomFetch(`/v1/ci/content?limit=${limit}`);
}

/**
 * Get content gap analysis
 */
export async function analyzeContentGaps(): Promise<{
	gaps: Array<{
		topic: string;
		competitorsCovering: string[];
		yourCoverage: boolean;
		priority: "high" | "medium" | "low";
	}>;
	recommendations: string[];
}> {
	return apiMomFetch("/v1/ci/analysis/content-gaps");
}

// --- AI Analysis ---

export interface AIAnalysis {
	summary: string;
	keyFindings: string[];
	recommendations: string[];
	confidenceScore: number;
	generatedAt: number;
}

/**
 * Analyze competitive changes using Claude AI
 * Routes through API Mom for cost control
 */
export async function analyzeCompetitiveChanges(
	timeframe: "daily" | "weekly" | "monthly" = "weekly"
): Promise<{
	analysis: AIAnalysis;
	changes: Array<{
		competitor: string;
		changeType: string;
		significance: "critical" | "high" | "medium" | "low";
		details: string;
	}>;
}> {
	return apiMomFetch("/v1/ci/analysis/ai", {
		method: "POST",
		body: JSON.stringify({ timeframe }),
	});
}

// --- Scheduled Jobs ---

export interface JobStatus {
	jobType: "daily" | "weekly" | "monthly";
	lastRun?: number;
	nextRun?: number;
	status: "pending" | "running" | "completed" | "failed";
	itemsProcessed?: number;
	errors?: string[];
}

/**
 * Get status of all scheduled jobs
 */
export async function getJobStatus(): Promise<{
	jobs: Record<string, JobStatus>;
	apiQuota: {
		used: number;
		limit: number;
		resetTime: number;
	};
}> {
	return apiMomFetch("/v1/ci/jobs/status");
}

/**
 * Manually trigger a job (for testing/admin)
 */
export async function triggerJob(
	jobType: "daily" | "weekly" | "monthly"
): Promise<{
	success: boolean;
	jobId: string;
	message: string;
	estimatedDuration: number;
}> {
	return apiMomFetch("/v1/ci/jobs/trigger", {
		method: "POST",
		body: JSON.stringify({ jobType }),
	});
}

// --- Alerts & Rules ---

export interface AlertRule {
	id: string;
	type: "rank_movement" | "content_published" | "pricing_change" | "threat";
	competitor?: string;
	threshold: number;
	enabled: boolean;
	channels: ("slack" | "email" | "webhook")[];
}

/**
 * List active alert rules
 */
export async function getAlertRules(): Promise<{
	rules: AlertRule[];
	total: number;
	enabled: number;
}> {
	return apiMomFetch("/v1/ci/alerts/rules");
}

/**
 * Get recent alerts fired
 */
export async function getAlerts(hours: number = 24): Promise<{
	alerts: Array<{
		id: string;
		ruleId: string;
		competitor: string;
		message: string;
		severity: "critical" | "high" | "medium" | "low";
		timestamp: number;
	}>;
	total: number;
}> {
	return apiMomFetch(`/v1/ci/alerts?hours=${hours}`);
}

// --- Dashboard Summary ---

export interface CIDashboard {
	competitors: {
		total: number;
		active: number;
		lastUpdated: number;
	};
	serp: {
		topMovers: Array<{ competitor: string; change: number }>;
		worstPerformers: Array<{ competitor: string; avgRank: number }>;
	};
	insights: {
		openOpportunities: number;
		activeThreats: number;
		recentContent: number;
	};
	alerts: {
		recent: number;
		critical: number;
	};
	apiUsage: {
		percentOfQuota: number;
		callsThisMonth: number;
		estimatedCost: number;
	};
}

/**
 * Get comprehensive CI dashboard
 */
export async function getDashboard(): Promise<CIDashboard> {
	return apiMomFetch("/v1/ci/dashboard");
}

// --- Cost Tracking ---

export interface CICost {
	provider: string;
	calls: number;
	cost: number;
	percentage: number;
}

/**
 * Get cost breakdown for all API calls
 */
export async function getCostBreakdown(): Promise<{
	period: string;
	totalCost: number;
	estimatedMonthly: number;
	breakdown: CICost[];
	quota: {
		daily: number;
		remaining: number;
		resetTime: number;
	};
}> {
	return apiMomFetch("/v1/ci/costs");
}

/**
 * Get API quota status
 */
export async function getQuotaStatus(): Promise<{
	provider: string;
	callsRemaining: number;
	callsLimit: number;
	resetTime: number;
	costRemaining: number;
	costLimit: number;
	status: "healthy" | "warning" | "critical";
}[]> {
	return apiMomFetch("/v1/ci/quota");
}
