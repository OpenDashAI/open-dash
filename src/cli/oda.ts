#!/usr/bin/env node

/**
 * ODA — Competitive Intelligence CLI
 *
 * Comprehensive command-line interface for managing competitive intelligence.
 * Designed to be driven by Claude Code and other AI systems via shell commands.
 *
 * Usage:
 *   oda competitors list
 *   oda serp check "business intelligence"
 *   oda insights opportunities
 *   oda jobs run daily
 *   oda dashboard
 *   oda costs breakdown
 *
 * Environment:
 *   - API_MOM_URL: API Mom proxy URL
 *   - API_MOM_KEY: API Mom project key
 *   - OPENROUTER_KEY: For direct Claude API calls
 */

import * as ciOrch from "../server/ci-orchestrator";

interface CLICommand {
	name: string;
	description: string;
	args?: string[];
	handler: (args: string[]) => Promise<void>;
}

// Color output helpers
const colors = {
	reset: "\x1b[0m",
	bright: "\x1b[1m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	red: "\x1b[31m",
	blue: "\x1b[34m",
	cyan: "\x1b[36m",
};

function log(message: string, color: keyof typeof colors = "reset") {
	console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(text: string) {
	log(`\n━━━ ${text} ━━━`, "bright");
}

function success(text: string) {
	log(`✓ ${text}`, "green");
}

function error(text: string) {
	log(`✗ ${text}`, "red");
}

function warn(text: string) {
	log(`⚠ ${text}`, "yellow");
}

function info(text: string) {
	log(`ℹ ${text}`, "blue");
}

// --- Competitor Commands ---

const competitorCommands: Record<string, CLICommand> = {
	list: {
		name: "ci competitors list",
		description: "List all monitored competitors",
		handler: async () => {
			header("Competitors");
			try {
				const { competitors } = await ciOrch.listCompetitors();

				if (competitors.length === 0) {
					warn("No competitors configured");
					return;
				}

				for (const comp of competitors) {
					log(
						`\n${colors.bright}${comp.name}${colors.reset} (${comp.id})`
					);
					log(`  Domain: ${comp.domain}`);
					log(`  Source: ${comp.dataSource}`);
					if (comp.lastChecked) {
						const date = new Date(comp.lastChecked).toLocaleDateString();
						log(`  Last Checked: ${date}`);
					}
				}

				log(`\nTotal: ${competitors.length}`, "cyan");
				success("Competitors listed");
			} catch (err) {
				error(
					`Failed to list competitors: ${err instanceof Error ? err.message : String(err)}`
				);
				process.exit(1);
			}
		},
	},

	add: {
		name: "ci competitors add <name> <domain>",
		description: "Add a new competitor",
		args: ["name", "domain"],
		handler: async (args: string[]) => {
			if (args.length < 2) {
				error("Usage: ci competitors add <name> <domain>");
				process.exit(1);
			}

			const [name, domain] = args;

			try {
				const result = await ciOrch.addCompetitor({
					name,
					domain,
					website: `https://${domain}`,
					dataSource: "manual",
				});

				success(`Added competitor: ${result.competitor.name}`);
				log(`ID: ${result.competitor.id}`);
			} catch (err) {
				error(
					`Failed to add competitor: ${err instanceof Error ? err.message : String(err)}`
				);
				process.exit(1);
			}
		},
	},

	metrics: {
		name: "ci competitors metrics <id>",
		description: "Get metrics for a competitor",
		args: ["id"],
		handler: async (args: string[]) => {
			if (args.length < 1) {
				error("Usage: ci competitors metrics <id>");
				process.exit(1);
			}

			const [competitorId] = args;

			try {
				const { competitor, metrics, trends } =
					await ciOrch.getCompetitorMetrics(competitorId);

				header(`Metrics: ${competitor.name}`);
				log(`Domain Authority: ${metrics.domainAuthority}`);
				log(`Monthly Traffic: ${metrics.traffic.toLocaleString()}`);
				log(`Organic Keywords: ${metrics.organicKeywords}`);
				log(`Backlinks: ${metrics.backlinks.toLocaleString()}`);

				log(`\nTrends:`, "cyan");
				log(
					`  Traffic: ${trends.trafficTrend === "up" ? "📈" : trends.trafficTrend === "down" ? "📉" : "➡️"} ${trends.trafficTrend}`
				);
				log(
					`  Keywords: ${trends.keywordsTrend === "up" ? "📈" : trends.keywordsTrend === "down" ? "📉" : "➡️"} ${trends.keywordsTrend}`
				);

				success("Metrics retrieved");
			} catch (err) {
				error(
					`Failed to get metrics: ${err instanceof Error ? err.message : String(err)}`
				);
				process.exit(1);
			}
		},
	},
};

// --- SERP Commands ---

const serpCommands: Record<string, CLICommand> = {
	check: {
		name: "ci serp check <keyword>",
		description: "Check SERP rankings for a keyword",
		args: ["keyword"],
		handler: async (args: string[]) => {
			if (args.length < 1) {
				error('Usage: ci serp check "<keyword>"');
				process.exit(1);
			}

			const keyword = args.join(" ");

			try {
				const result = await ciOrch.checkKeywordRanking(keyword);

				header(`SERP: "${keyword}"`);

				// Sort by rank
				const sorted = [...result.results].sort((a, b) => a.rank - b.rank);

				for (const item of sorted) {
					const rankColor =
						item.rank <= 10
							? "green"
							: item.rank <= 50
								? "yellow"
								: "red";
					log(`  #${item.rank}  ${item.competitor}`, rankColor);
				}

				success("Rankings retrieved");
			} catch (err) {
				error(
					`Failed to check rankings: ${err instanceof Error ? err.message : String(err)}`
				);
				process.exit(1);
			}
		},
	},

	rankings: {
		name: "ci serp rankings <competitor> [days]",
		description: "Get SERP rankings history for a competitor",
		args: ["competitor", "days"],
		handler: async (args: string[]) => {
			if (args.length < 1) {
				error("Usage: ci serp rankings <competitor> [days]");
				process.exit(1);
			}

			const competitorId = args[0];
			const days = parseInt(args[1] || "7");

			try {
				const { competitor, rankings, summary } =
					await ciOrch.getCompetitorRankings(competitorId, days);

				header(`Rankings: ${competitor} (${days} days)`);

				log(`Average Rank: ${summary.avgRank.toFixed(1)}`, "cyan");

				if (summary.improvingKeywords.length > 0) {
					log(`\nImproving (${summary.improvingKeywords.length}):`, "green");
					for (const kw of summary.improvingKeywords.slice(0, 5)) {
						log(`  📈 ${kw}`);
					}
				}

				if (summary.decliningKeywords.length > 0) {
					log(`\nDeclining (${summary.decliningKeywords.length}):`, "red");
					for (const kw of summary.decliningKeywords.slice(0, 5)) {
						log(`  📉 ${kw}`);
					}
				}

				success(`Retrieved ${rankings.length} ranking records`);
			} catch (err) {
				error(
					`Failed to get rankings: ${err instanceof Error ? err.message : String(err)}`
				);
				process.exit(1);
			}
		},
	},
};

// --- Insights Commands ---

const insightsCommands: Record<string, CLICommand> = {
	opportunities: {
		name: "ci insights opportunities",
		description: "Get market opportunities",
		handler: async () => {
			header("Market Opportunities");

			try {
				const { opportunities, total, highConfidence } =
					await ciOrch.getMarketOpportunities();

				if (opportunities.length === 0) {
					warn("No open opportunities");
					return;
				}

				for (const opp of opportunities.slice(0, 10)) {
					const confidence = `${Math.round(opp.confidence * 100)}%`;
					const confidenceColor =
						opp.confidence > 0.8 ? "green" : "yellow";

					log(`\n${opp.title}`, "bright");
					log(`  Confidence: ${confidence}`, confidenceColor);
					log(`  ${opp.description}`);
					log(
						`  Competitors: ${opp.relatedCompetitors.join(", ")}`
					);
				}

				log(`\nTotal: ${total} | High Confidence: ${highConfidence}`, "cyan");
				success("Opportunities retrieved");
			} catch (err) {
				error(
					`Failed to get opportunities: ${err instanceof Error ? err.message : String(err)}`
				);
				process.exit(1);
			}
		},
	},

	threats: {
		name: "ci insights threats",
		description: "Get competitive threats",
		handler: async () => {
			header("Competitive Threats");

			try {
				const { threats, total, critical } =
					await ciOrch.getCompetitiveThreats();

				if (threats.length === 0) {
					success("No active threats");
					return;
				}

				for (const threat of threats.slice(0, 10)) {
					const severity =
						critical > 0 ? (threats[0] === threat ? "red" : "yellow") : "yellow";

					log(`\n${threat.title}`, "bright");
					log(`  ${threat.description}`);
					log(
						`  Competitors: ${threat.relatedCompetitors.join(", ")}`
					);
				}

				log(`\nTotal: ${total} | Critical: ${critical}`, "cyan");
				success("Threats retrieved");
			} catch (err) {
				error(
					`Failed to get threats: ${err instanceof Error ? err.message : String(err)}`
				);
				process.exit(1);
			}
		},
	},

	gaps: {
		name: "ci insights gaps",
		description: "Analyze content gaps vs competitors",
		handler: async () => {
			header("Content Gap Analysis");

			try {
				const { gaps, recommendations } = await ciOrch.analyzeContentGaps();

				if (gaps.length === 0) {
					success("No significant gaps found");
					return;
				}

				for (const gap of gaps.slice(0, 10)) {
					const priorityColor =
						gap.priority === "high"
							? "red"
							: gap.priority === "medium"
								? "yellow"
								: "cyan";

					log(`\n${gap.topic}`, "bright");
					log(
						`  Priority: ${gap.priority.toUpperCase()}`,
						priorityColor
					);
					log(
						`  Competitors Covering: ${gap.competitorsCovering.length}`
					);
					log(
						`  You: ${gap.yourCoverage ? "✓ Covered" : "✗ Not covered"}`,
						gap.yourCoverage ? "green" : "red"
					);
				}

				if (recommendations.length > 0) {
					log(`\nRecommendations:`, "cyan");
					for (const rec of recommendations.slice(0, 5)) {
						log(`  • ${rec}`);
					}
				}

				success("Gap analysis complete");
			} catch (err) {
				error(
					`Failed to analyze gaps: ${err instanceof Error ? err.message : String(err)}`
				);
				process.exit(1);
			}
		},
	},
};

// --- Jobs Commands ---

const jobsCommands: Record<string, CLICommand> = {
	status: {
		name: "ci jobs status",
		description: "Get status of all scheduled jobs",
		handler: async () => {
			header("Job Status");

			try {
				const { jobs, apiQuota } = await ciOrch.getJobStatus();

				for (const [type, job] of Object.entries(jobs)) {
					const statusColor =
						job.status === "completed"
							? "green"
							: job.status === "running"
								? "cyan"
								: job.status === "failed"
									? "red"
									: "yellow";

					log(`\n${type.toUpperCase()}:`, "bright");
					log(`  Status: ${job.status}`, statusColor);

					if (job.lastRun) {
						const date = new Date(job.lastRun).toLocaleDateString();
						log(`  Last Run: ${date}`);
					}

					if (job.nextRun) {
						const date = new Date(job.nextRun).toLocaleDateString();
						log(`  Next Run: ${date}`);
					}

					if (job.itemsProcessed) {
						log(`  Items: ${job.itemsProcessed}`);
					}
				}

				log(`\nAPI Quota:`, "cyan");
				const quotaPercent = Math.round(
					(apiQuota.used / apiQuota.limit) * 100
				);
				log(`  Used: ${apiQuota.used}/${apiQuota.limit} (${quotaPercent}%)`);

				const resetDate = new Date(apiQuota.resetTime).toLocaleDateString();
				log(`  Reset: ${resetDate}`);

				success("Job status retrieved");
			} catch (err) {
				error(
					`Failed to get job status: ${err instanceof Error ? err.message : String(err)}`
				);
				process.exit(1);
			}
		},
	},

	run: {
		name: "ci jobs run <type>",
		description: "Manually trigger a job (daily|weekly|monthly)",
		args: ["type"],
		handler: async (args: string[]) => {
			if (args.length < 1) {
				error("Usage: ci jobs run <daily|weekly|monthly>");
				process.exit(1);
			}

			const jobType = args[0] as "daily" | "weekly" | "monthly";

			if (!["daily", "weekly", "monthly"].includes(jobType)) {
				error("Job type must be: daily, weekly, or monthly");
				process.exit(1);
			}

			try {
				info(`Triggering ${jobType} job...`);
				const result = await ciOrch.triggerJob(jobType);

				success(result.message);
				log(`Job ID: ${result.jobId}`);
				log(
					`Estimated Duration: ${Math.round(result.estimatedDuration / 1000)}s`
				);
			} catch (err) {
				error(
					`Failed to trigger job: ${err instanceof Error ? err.message : String(err)}`
				);
				process.exit(1);
			}
		},
	},
};

// --- Dashboard Command ---

async function dashboard() {
	header("Competitive Intelligence Dashboard");

	try {
		const dash = await ciOrch.getDashboard();

		log("\nCOMPETITORS", "bright");
		log(`  Total: ${dash.competitors.total}`);
		log(
			`  Active: ${dash.competitors.active}`,
			dash.competitors.active > 0 ? "green" : "yellow"
		);

		log("\nSERP RANKINGS", "bright");
		if (dash.serp.topMovers.length > 0) {
			log("  Top Movers:");
			for (const mover of dash.serp.topMovers.slice(0, 3)) {
				log(
					`    ${mover.competitor}: ${mover.change > 0 ? "📈 +" : "📉"}${mover.change}`,
					mover.change > 0 ? "green" : "red"
				);
			}
		}

		log("\nMARKET INSIGHTS", "bright");
		log(`  Opportunities: ${dash.insights.openOpportunities}`);
		log(
			`  Threats: ${dash.insights.activeThreats}`,
			dash.insights.activeThreats > 0 ? "red" : "green"
		);
		log(`  Recent Content: ${dash.insights.recentContent}`);

		log("\nALERTS", "bright");
		log(`  Recent: ${dash.alerts.recent}`);
		log(
			`  Critical: ${dash.alerts.critical}`,
			dash.alerts.critical > 0 ? "red" : "green"
		);

		log("\nAPI USAGE & COSTS", "bright");
		log(
			`  Quota: ${Math.round(dash.apiUsage.percentOfQuota)}% of monthly`
		);
		log(`  Calls: ${dash.apiUsage.callsThisMonth}`);
		log(
			`  Est. Cost: $${dash.apiUsage.estimatedCost.toFixed(2)}/month`,
			"cyan"
		);

		success("Dashboard displayed");
	} catch (err) {
		error(
			`Failed to load dashboard: ${err instanceof Error ? err.message : String(err)}`
		);
		process.exit(1);
	}
}

// --- Help and Main ---

function showHelp() {
	log("Competitive Intelligence CLI\n", "bright");
	log("USAGE: oda <command> [options]\n");

	log("COMMANDS:", "cyan");
	log("\n  Competitors:");
	log("    oda competitors list           List all competitors");
	log("    oda competitors add <name> <domain>");
	log("    oda competitors metrics <id>   Get competitor metrics");

	log("\n  SERP Tracking:");
	log('    oda serp check "<keyword>"     Check SERP rankings');
	log("    oda serp rankings <id> [days]  Get ranking history");

	log("\n  Insights:");
	log("    oda insights opportunities     Market opportunities");
	log("    oda insights threats          Competitive threats");
	log("    oda insights gaps             Content gaps");

	log("\n  Jobs:");
	log("    oda jobs status               Job status & quota");
	log("    oda jobs run <type>           Trigger job (daily|weekly|monthly)");

	log("\n  General:");
	log("    oda dashboard                 Show dashboard");
	log("    oda costs breakdown           Cost breakdown");
	log("    oda help                      Show this help");

	log("\nEXAMPLES:", "cyan");
	log('  oda serp check "business intelligence"\n');
	log("  oda competitors list\n");
	log("  oda insights opportunities\n");
	log("  oda jobs run daily\n");
}

// --- Main CLI Router ---

async function main() {
	const args = process.argv.slice(2);

	if (args.length === 0 || args[0] === "help" || args[0] === "-h") {
		showHelp();
		return;
	}

	const [command, subcommand, ...rest] = args;

	try {
		// Route commands
		if (command === "competitors" && competitorCommands[subcommand]) {
			await competitorCommands[subcommand].handler(rest);
		} else if (command === "serp" && serpCommands[subcommand]) {
			await serpCommands[subcommand].handler(rest);
		} else if (command === "insights" && insightsCommands[subcommand]) {
			await insightsCommands[subcommand].handler(rest);
		} else if (command === "jobs" && jobsCommands[subcommand]) {
			await jobsCommands[subcommand].handler(rest);
		} else if (command === "dashboard") {
			await dashboard();
		} else if (command === "costs" && subcommand === "breakdown") {
			await costBreakdown();
		} else {
			error(`Unknown command: ${command} ${subcommand}`);
			showHelp();
			process.exit(1);
		}
	} catch (err) {
		error(`Error: ${err instanceof Error ? err.message : String(err)}`);
		process.exit(1);
	}
}

async function costBreakdown() {
	header("API Cost Breakdown");

	try {
		const { period, totalCost, estimatedMonthly, breakdown, quota } =
			await ciOrch.getCostBreakdown();

		log(`Period: ${period}`);
		log(`Total Cost: $${totalCost.toFixed(2)}`);
		log(`Est. Monthly: $${estimatedMonthly.toFixed(2)}\n`);

		log("Cost by Provider:", "cyan");
		for (const provider of breakdown) {
			const bar =
				"█".repeat(Math.round(provider.percentage / 5)) +
				"░".repeat(20 - Math.round(provider.percentage / 5));
			log(
				`  ${provider.provider.padEnd(15)} ${bar} $${provider.cost.toFixed(2)} (${provider.percentage}%)`
			);
		}

		log(`\nQuota:`, "cyan");
		log(
			`  Daily: ${quota.remaining}/${quota.daily} remaining`
		);
		const resetDate = new Date(quota.resetTime).toLocaleDateString();
		log(`  Resets: ${resetDate}`);

		success("Cost breakdown displayed");
	} catch (err) {
		error(
			`Failed to get cost breakdown: ${err instanceof Error ? err.message : String(err)}`
		);
		process.exit(1);
	}
}

main().catch(console.error);
