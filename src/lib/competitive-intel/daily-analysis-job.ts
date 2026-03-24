/**
 * Daily Analysis Job
 *
 * Comprehensive daily competitive intelligence job:
 * 1. Collect current data from all competitors
 * 2. Compare to previous day snapshots
 * 3. Detect changes across all dimensions
 * 4. Score significance of changes with Claude AI
 * 5. Fire alerts for significant findings
 * 6. Generate insights and store in database
 * 7. Broadcast to HudSocket for real-time updates
 *
 * Scheduled to run daily at 00:00 UTC via Durable Object
 */

import * as changeDetection from "./change-detection";
import * as significanceScoring from "./significance-scoring";
import * as alertSystem from "./alert-system";

export interface JobResult {
	jobId: string;
	runAt: number;
	duration: number;
	competitorsProcessed: number;
	changesDetected: number;
	alertsFired: number;
	errors: string[];
	summary: {
		totalScore: number;
		criticalAlerts: number;
		highAlerts: number;
		topThreats: Array<{
			competitor: string;
			change: string;
			score: number;
		}>;
		topOpportunities: Array<{
			source: string;
			insight: string;
		}>;
	};
}

/**
 * Run the daily competitive intelligence analysis job
 */
export async function runDailyAnalysis(db: any): Promise<JobResult> {
	const jobId = generateJobId();
	const startTime = Date.now();
	const errors: string[] = [];
	let competitorsProcessed = 0;
	let changesDetected = 0;
	let alertsFired = 0;

	const allChanges = new Map<string, changeDetection.Change[]>();
	const allScores = new Map<string, significanceScoring.SignificanceScore>();
	const firedAlerts: alertSystem.Alert[] = [];

	try {
		// 1. Get list of competitors to analyze
		const competitors = await getCompetitorsToAnalyze(db);
		console.log(`Daily analysis: Processing ${competitors.length} competitors`);

		// 2. Collect current data and detect changes for each competitor
		for (const competitor of competitors) {
			try {
				const changes = await collectAndDetectChanges(
					db,
					competitor
				);

				if (changes.length > 0) {
					allChanges.set(competitor.id, changes);
					changesDetected += changes.length;
					competitorsProcessed++;
				}
			} catch (error) {
				const msg = `Error processing ${competitor.name}: ${error instanceof Error ? error.message : String(error)}`;
				errors.push(msg);
				console.error(msg);
			}
		}

		// 3. Score significance of all detected changes with Claude AI
		// Batch to reduce API calls
		const scores = await significanceScoring.scoreMultipleCompetitors(
			allChanges
		);
		scores.forEach((score, competitor) => {
			allScores.set(competitor, score);
		});

		// 4. Fire alerts for significant changes
		for (const [competitor, changes] of allChanges.entries()) {
			const score = allScores.get(competitor);
			if (!score) continue;

			// Check if should fire (deduplicate)
			const changeHash = hashChanges(changes);
			const shouldFire = await alertSystem.shouldFireAlert(
				competitor,
				changeHash
			);

			if (shouldFire && shouldFireBasedOnSignificance(score)) {
				const alert: alertSystem.Alert = {
					id: generateAlertId(),
					competitor,
					title: `${competitor}: ${score.level} significance changes`,
					severity: normalizeSeverity(score.level),
					changes,
					significance: score,
					channels: ["slack", "dashboard"],
					firedAt: Date.now(),
				};

				try {
					await alertSystem.fireAlert(alert);
					firedAlerts.push(alert);
					alertsFired++;

					// Store alert in database
					await storeAlert(db, alert);
				} catch (alertError) {
					errors.push(
						`Failed to fire alert for ${competitor}: ${alertError}`
					);
				}
			}
		}

		// 5. Store insights in market_insights table
		const insights = generateInsights(
			Array.from(allScores.entries()),
			allChanges
		);
		for (const insight of insights) {
			try {
				await storeInsight(db, insight);
			} catch (error) {
				errors.push(
					`Failed to store insight: ${error instanceof Error ? error.message : String(error)}`
				);
			}
		}

		// 6. Broadcast to HudSocket if changes were significant
		if (alertsFired > 0) {
			await broadcastToHudSocket({
				type: "competitive_alerts",
				count: alertsFired,
				timestamp: Date.now(),
			});
		}

		// 7. Build summary
		const summary = {
			totalScore:
				Array.from(allScores.values()).reduce((sum, s) => sum + s.score, 0) /
				Math.max(allScores.size, 1),
			criticalAlerts: firedAlerts.filter(
				(a) => a.severity === "critical"
			).length,
			highAlerts: firedAlerts.filter((a) => a.severity === "high")
				.length,
			topThreats: extractTopThreats(firedAlerts),
			topOpportunities: extractTopOpportunities(insights),
		};

		const duration = Date.now() - startTime;

		return {
			jobId,
			runAt: startTime,
			duration,
			competitorsProcessed,
			changesDetected,
			alertsFired,
			errors,
			summary,
		};
	} catch (error) {
		const duration = Date.now() - startTime;
		const errorMsg = error instanceof Error ? error.message : String(error);
		errors.push(`Job failed: ${errorMsg}`);

		return {
			jobId,
			runAt: startTime,
			duration,
			competitorsProcessed,
			changesDetected,
			alertsFired,
			errors,
			summary: {
				totalScore: 0,
				criticalAlerts: 0,
				highAlerts: 0,
				topThreats: [],
				topOpportunities: [],
			},
		};
	}
}

/**
 * Get list of competitors to analyze
 */
async function getCompetitorsToAnalyze(
	db: any
): Promise<
	Array<{ id: string; name: string; domain: string; websiteUrl: string }>
> {
	// Query D1 for all active competitors
	const result = await db
		.prepare(
			`
    SELECT id, name, domain, website_url
    FROM competitor_domains
    WHERE active = 1 OR active IS NULL
    LIMIT 50
  `
		)
		.all();

	return (result.results || []).map((r: any) => ({
		id: r.id,
		name: r.name,
		domain: r.domain,
		websiteUrl: r.website_url,
	}));
}

/**
 * Collect current data and detect changes for a competitor
 */
async function collectAndDetectChanges(
	db: any,
	competitor: { id: string; name: string; domain: string }
): Promise<changeDetection.Change[]> {
	// 1. Collect current SERP data
	const currentSerp = await collectSerpData(competitor);

	// 2. Collect current domain metrics
	const currentMetrics = await collectDomainMetrics(competitor);

	// 3. Collect recent content
	const currentContent = await collectRecentContent(competitor);

	// 4. Get previous snapshots
	const previousSerp = await getPreviousSerp(db, competitor.id);
	const previousMetrics = await getPreviousMetrics(db, competitor.id);
	const previousContent = await getPreviousContent(db, competitor.id);

	// 5. Detect changes
	const changes: changeDetection.Change[] = [];

	// SERP changes
	if (previousSerp && currentSerp) {
		for (const keyword of Object.keys(currentSerp)) {
			const prev = previousSerp[keyword];
			const current = currentSerp[keyword];

			const change = changeDetection.detectMetricChange(
				`SERP: ${keyword}`,
				prev || 0,
				current || 0,
				{ critical: 10, high: 5, medium: 2 } // rank change thresholds
			);

			if (change) {
				change.competitor = competitor.name;
				changes.push(change);
			}
		}
	}

	// Metric changes
	if (previousMetrics && currentMetrics) {
		const metricChanges = changeDetection.detectDOMChange(
			previousMetrics,
			currentMetrics
		);
		metricChanges.forEach((c) => {
			c.competitor = competitor.name;
			changes.push(c);
		});
	}

	// Content changes
	if (previousContent && currentContent) {
		const contentChanges = changeDetection.detectContentChange(
			previousContent,
			currentContent
		);
		contentChanges.forEach((c) => {
			c.competitor = competitor.name;
			changes.push(c);
		});
	}

	// Store current snapshot for next comparison
	await storeSnapshot(db, competitor.id, {
		serp: currentSerp,
		metrics: currentMetrics,
		content: currentContent,
		timestamp: Date.now(),
	});

	return changes;
}

/**
 * Collect SERP data for competitor (placeholder)
 * In production, uses BraveSearch API
 */
async function collectSerpData(
	competitor: any
): Promise<Record<string, number>> {
	// Call BraveSearch for key terms
	// Return { keyword: rank_position }
	return {};
}

/**
 * Collect domain metrics (placeholder)
 * In production, uses SimilarWeb, Ahrefs, etc.
 */
async function collectDomainMetrics(
	competitor: any
): Promise<Record<string, unknown>> {
	// Call domain metrics APIs
	// Return { da, traffic, keywords, backlinks, ... }
	return {
		domainAuthority: 65,
		traffic: 150000,
		organicKeywords: 3000,
		backlinks: 10000,
	};
}

/**
 * Collect recent content (placeholder)
 */
async function collectRecentContent(competitor: any): Promise<string[]> {
	// Crawl blog, news, etc.
	// Return list of content URLs
	return [];
}

/**
 * Get previous SERP snapshot from database
 */
async function getPreviousSerp(
	db: any,
	competitorId: string
): Promise<Record<string, number> | null> {
	// Query most recent SERP snapshot
	const result = await db
		.prepare(
			`
    SELECT keyword, rank_position
    FROM competitor_serp
    WHERE competitor_id = ?
    ORDER BY created_at DESC
    LIMIT 50
  `
		)
		.bind(competitorId)
		.all();

	if (!result.results || result.results.length === 0) return null;

	return Object.fromEntries(
		(result.results as any[]).map((r) => [r.keyword, r.rank_position])
	);
}

/**
 * Get previous metrics snapshot
 */
async function getPreviousMetrics(
	db: any,
	competitorId: string
): Promise<Record<string, unknown> | null> {
	const result = await db
		.prepare(
			`
    SELECT domain_authority, traffic_estimate, organic_keywords, backlinks_count
    FROM competitor_domains
    WHERE id = ?
  `
		)
		.bind(competitorId)
		.first();

	if (!result) return null;

	return {
		da: result.domain_authority,
		traffic: result.traffic_estimate,
		keywords: result.organic_keywords,
		backlinks: result.backlinks_count,
	};
}

/**
 * Get previous content snapshot
 */
async function getPreviousContent(
	db: any,
	competitorId: string
): Promise<string[] | null> {
	const result = await db
		.prepare(
			`
    SELECT url FROM competitor_content
    WHERE competitor_id = ?
    ORDER BY created_at DESC
    LIMIT 100
  `
		)
		.bind(competitorId)
		.all();

	return (result.results || []).map((r: any) => r.url);
}

/**
 * Store snapshot for next comparison
 */
async function storeSnapshot(
	db: any,
	competitorId: string,
	snapshot: any
): Promise<void> {
	// Update competitor_domains with latest metrics
	// Insert into competitor_serp for each keyword
	// Insert into competitor_content for each article
}

/**
 * Store alert in database
 */
async function storeAlert(db: any, alert: alertSystem.Alert): Promise<void> {
	await db
		.prepare(
			`
    INSERT INTO competitive_alerts
    (id, competitor_id, alert_type, severity, triggered_at)
    VALUES (?, ?, ?, ?, ?)
  `
		)
		.bind(
			alert.id,
			alert.competitor,
			"competitive_change",
			alert.severity,
			alert.firedAt
		)
		.run();
}

/**
 * Store market insight
 */
async function storeInsight(
	db: any,
	insight: any
): Promise<void> {
	await db
		.prepare(
			`
    INSERT INTO market_insights
    (id, insight_type, title, description, confidence_score, generated_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `
		)
		.bind(
			insight.id,
			insight.type,
			insight.title,
			insight.description,
			insight.confidence,
			"claude"
		)
		.run();
}

/**
 * Generate insights from scores and changes
 */
function generateInsights(
	scores: Array<[string, significanceScoring.SignificanceScore]>,
	allChanges: Map<string, changeDetection.Change[]>
): any[] {
	const insights: any[] = [];

	// Group by implication and extract unique insights
	const implications = new Set<string>();
	for (const [, score] of scores) {
		score.implications.forEach((i) => implications.add(i));
	}

	for (const implication of implications) {
		insights.push({
			id: generateInsightId(),
			type: "insight",
			title: implication.split(":")[0],
			description: implication,
			confidence: 0.75,
			source: "daily_analysis",
		});
	}

	return insights;
}

/**
 * Broadcast to HudSocket for real-time updates
 */
async function broadcastToHudSocket(data: any): Promise<void> {
	// Send to HudSocket via Durable Object if available
	// This updates all connected dashboard clients in real-time
	console.log("Broadcasting to HudSocket:", data);
}

/**
 * Check if alert should fire based on significance
 */
function shouldFireBasedOnSignificance(
	score: significanceScoring.SignificanceScore
): boolean {
	return (
		score.level === "critical" ||
		score.level === "high" ||
		(score.level === "medium" && score.score > 0.6)
	);
}

/**
 * Normalize score level to alert severity
 */
function normalizeSeverity(
	level: string
): "critical" | "high" | "medium" | "low" {
	return level === "critical"
		? "critical"
		: level === "high"
			? "high"
			: level === "medium"
				? "medium"
				: "low";
}

/**
 * Extract top threats from alerts
 */
function extractTopThreats(
	alerts: alertSystem.Alert[]
): Array<{
	competitor: string;
	change: string;
	score: number;
}> {
	return alerts
		.slice(0, 5)
		.map((a) => ({
			competitor: a.competitor,
			change: a.title,
			score: a.significance.score,
		}));
}

/**
 * Extract top opportunities from insights
 */
function extractTopOpportunities(
	insights: any[]
): Array<{ source: string; insight: string }> {
	return insights
		.filter((i) => i.type === "opportunity")
		.slice(0, 3)
		.map((i) => ({
			source: i.source || "analysis",
			insight: i.title,
		}));
}

/**
 * Utility: Generate unique IDs
 */
function generateJobId(): string {
	return `daily-${new Date().toISOString().split("T")[0]}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateAlertId(): string {
	return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateInsightId(): string {
	return `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function hashChanges(changes: changeDetection.Change[]): string {
	const content = changes.map((c) => c.title).sort().join("|");
	return content
		.split("")
		.reduce((h, c) => h + c.charCodeAt(0), 0)
		.toString(16);
}
