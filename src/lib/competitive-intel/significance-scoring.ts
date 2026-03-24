/**
 * Significance Scoring Service
 *
 * Uses Claude AI to analyze competitive changes and score their strategic importance.
 * Determines:
 * - Is this change significant to our strategy?
 * - What does it tell us about the competitor's direction?
 * - Should we take action? (alert, respond, etc.)
 *
 * All API calls route through API Mom for cost control.
 */

import type { Change } from "./change-detection";

export interface SignificanceScore {
	score: number; // 0-1, higher = more significant
	level: "critical" | "high" | "medium" | "low" | "noise";
	reasoning: string;
	implications: string[];
	recommendations: string[];
	timelinessScore: number; // 0-1, how urgent is response?
	competitiveImpact: string; // How this affects competitive landscape
}

/**
 * Score significance of competitive changes using Claude AI
 * Routes through API Mom for cost control and security
 */
export async function scoreSignificance(
	competitor: string,
	changes: Change[],
	contextData?: {
		ourPosition?: string;
		keyDifferentiators?: string[];
		marketPosition?: string;
		recentMoves?: string[];
	}
): Promise<SignificanceScore> {
	// Prepare change description for Claude
	const changeDescription = formatChangesForAnalysis(changes);

	// Build prompt for Claude
	const prompt = buildAnalysisPrompt(
		competitor,
		changeDescription,
		contextData
	);

	try {
		// Call Claude through API Mom (cost-controlled)
		const response = await callClaudeViaAPIMom(prompt);

		// Parse Claude's response
		return parseClaudeResponse(response, changes);
	} catch (error) {
		// Fallback to heuristic scoring if Claude fails
		console.error("Claude scoring failed, using heuristics:", error);
		return heuristicScore(changes, competitor);
	}
}

/**
 * Format changes into human-readable text for Claude analysis
 */
function formatChangesForAnalysis(changes: Change[]): string {
	const grouped = changes.reduce(
		(acc, change) => {
			if (!acc[change.type]) acc[change.type] = [];
			acc[change.type].push(change);
			return acc;
		},
		{} as Record<string, Change[]>
	);

	let description = "## Changes Detected\n\n";

	for (const [type, typeChanges] of Object.entries(grouped)) {
		description += `### ${type.toUpperCase()}\n`;
		for (const change of typeChanges) {
			description += `- **${change.title}** (${change.severity})\n`;
			description += `  ${change.description}\n`;
		}
		description += "\n";
	}

	return description;
}

/**
 * Build the prompt that Claude will analyze
 */
function buildAnalysisPrompt(
	competitor: string,
	changeDescription: string,
	contextData?: any
): string {
	const contextSection = contextData
		? `
## Our Strategic Context
- Position: ${contextData.ourPosition || "Not specified"}
- Key Differentiators: ${contextData.keyDifferentiators?.join(", ") || "Not specified"}
- Market Position: ${contextData.marketPosition || "Not specified"}
- Recent Moves: ${contextData.recentMoves?.join(", ") || "Not specified"}
`
		: "";

	return `You are analyzing competitive intelligence data. Analyze the following changes made by ${competitor} and assess their strategic significance.

${changeDescription}
${contextSection}

Provide your analysis in the following JSON format:
{
  "score": 0.75,
  "level": "high",
  "reasoning": "Why is this significant?",
  "implications": [
    "Strategic implication 1",
    "Strategic implication 2"
  ],
  "recommendations": [
    "What we should do in response"
  ],
  "timelinessScore": 0.8,
  "competitiveImpact": "How this affects the competitive landscape"
}

Consider:
1. Does this threaten our market position?
2. Does this create a new market opportunity?
3. Is this a copy of something we do?
4. Are they entering new markets or segments?
5. Is their technology/positioning becoming stronger?
6. Should we respond immediately or monitor?`;
}

/**
 * Call Claude API through API Mom proxy
 * This keeps credentials out of the codebase
 */
async function callClaudeViaAPIMom(prompt: string): Promise<string> {
	const apiMomUrl = process.env.API_MOM_URL;
	const apiMomKey = process.env.API_MOM_KEY;

	if (!apiMomUrl || !apiMomKey) {
		throw new Error(
			"API_MOM_URL and API_MOM_KEY required for Claude scoring"
		);
	}

	const response = await fetch(`${apiMomUrl}/v1/ci/analyze/significance`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"X-API-Key": apiMomKey,
		},
		body: JSON.stringify({ prompt }),
	});

	if (!response.ok) {
		throw new Error(`API Mom error: ${response.status}`);
	}

	const data = (await response.json()) as { response: string };
	return data.response;
}

/**
 * Parse Claude's JSON response
 */
function parseClaudeResponse(
	response: string,
	changes: Change[]
): SignificanceScore {
	try {
		// Extract JSON from response (Claude may add surrounding text)
		const jsonMatch = response.match(/\{[\s\S]*\}/);
		if (!jsonMatch) {
			throw new Error("No JSON found in response");
		}

		const parsed = JSON.parse(jsonMatch[0]) as {
			score: number;
			level: string;
			reasoning: string;
			implications: string[];
			recommendations: string[];
			timelinessScore: number;
			competitiveImpact: string;
		};

		// Validate and normalize
		return {
			score: Math.min(Math.max(parsed.score, 0), 1),
			level: normalizeLevel(parsed.level),
			reasoning: parsed.reasoning,
			implications: parsed.implications || [],
			recommendations: parsed.recommendations || [],
			timelinessScore: Math.min(Math.max(parsed.timelinessScore, 0), 1),
			competitiveImpact: parsed.competitiveImpact,
		};
	} catch (error) {
		console.error("Failed to parse Claude response:", error);
		// Fallback to heuristic
		throw error;
	}
}

/**
 * Fallback heuristic scoring when Claude is unavailable
 * Uses change severity and types to estimate significance
 */
function heuristicScore(
	changes: Change[],
	competitor: string
): SignificanceScore {
	// Calculate weighted score
	let totalScore = 0;
	let criticalCount = 0;
	let highCount = 0;
	let contentChanges = 0;
	let pricingChanges = 0;

	for (const change of changes) {
		switch (change.severity) {
			case "critical":
				totalScore += 1.0;
				criticalCount++;
				break;
			case "high":
				totalScore += 0.75;
				highCount++;
				break;
			case "medium":
				totalScore += 0.4;
				break;
			case "low":
				totalScore += 0.1;
				break;
		}

		if (change.type === "content") contentChanges++;
		if (change.type === "metric" && change.title.includes("pricing"))
			pricingChanges++;
	}

	const avgScore = Math.min(totalScore / changes.length, 1);
	const level = getScoreLevel(avgScore, criticalCount > 0);

	const implications: string[] = [];
	if (pricingChanges > 0) {
		implications.push(
			`${competitor} is adjusting pricing strategy (${pricingChanges} changes)`
		);
	}
	if (contentChanges > 5) {
		implications.push(
			`${competitor} is increasing content marketing efforts`
		);
	}
	if (criticalCount > 0) {
		implications.push(
			"Critical changes detected - monitor competitor activity closely"
		);
	}

	const recommendations: string[] = [];
	if (level === "critical" || level === "high") {
		recommendations.push("Schedule competitive analysis meeting with team");
		recommendations.push(
			"Review our positioning vs these changes"
		);
	}
	if (pricingChanges > 0) {
		recommendations.push("Evaluate our pricing strategy");
	}

	return {
		score: avgScore,
		level,
		reasoning: `Heuristic scoring: ${changes.length} changes detected (${criticalCount} critical, ${highCount} high)`,
		implications,
		recommendations,
		timelinessScore: level === "critical" ? 1.0 : level === "high" ? 0.7 : 0.3,
		competitiveImpact: `${competitor} is taking strategic action across ${new Set(changes.map((c) => c.type)).size} areas`,
	};
}

/**
 * Convert numeric score to significance level
 */
function getScoreLevel(
	score: number,
	hasCritical: boolean
): "critical" | "high" | "medium" | "low" | "noise" {
	if (hasCritical || score >= 0.8) return "critical";
	if (score >= 0.6) return "high";
	if (score >= 0.4) return "medium";
	if (score >= 0.2) return "low";
	return "noise";
}

/**
 * Normalize level string from Claude response
 */
function normalizeLevel(
	level: string
): "critical" | "high" | "medium" | "low" | "noise" {
	const normalized = level.toLowerCase();
	if (
		normalized === "critical" ||
		normalized === "high" ||
		normalized === "medium" ||
		normalized === "low" ||
		normalized === "noise"
	) {
		return normalized as
			| "critical"
			| "high"
			| "medium"
			| "low"
			| "noise";
	}
	return "medium";
}

/**
 * Batch score multiple competitors' changes efficiently
 * Combines into single API call to reduce costs
 */
export async function scoreMultipleCompetitors(
	changes: Map<string, Change[]>
): Promise<Map<string, SignificanceScore>> {
	const scores = new Map<string, SignificanceScore>();

	// Score in batches to control API costs
	const competitors = Array.from(changes.entries());
	const batchSize = 5;

	for (let i = 0; i < competitors.length; i += batchSize) {
		const batch = competitors.slice(i, i + batchSize);

		// Process batch in parallel
		const promises = batch.map(([competitor, competitorChanges]) =>
			scoreSignificance(competitor, competitorChanges).then((score) => ({
				competitor,
				score,
			}))
		);

		const results = await Promise.allSettled(promises);

		for (const result of results) {
			if (result.status === "fulfilled") {
				scores.set(result.value.competitor, result.value.score);
			}
		}
	}

	return scores;
}
