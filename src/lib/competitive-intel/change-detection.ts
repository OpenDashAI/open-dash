/**
 * Change Detection Service
 *
 * Detects competitive changes by comparing snapshots:
 * - Visual diffs (screenshot comparison)
 * - DOM diffs (HTML/JSON structure comparison)
 * - Metric diffs (SERP rank changes, pricing, content)
 *
 * Powers real-time competitive alerts and significance analysis.
 */

export interface Change {
	type: "visual" | "dom" | "metric" | "content";
	competitor: string;
	timestamp: number;
	severity: "critical" | "high" | "medium" | "low";
	title: string;
	description: string;
	evidence?: {
		before?: string | number | object;
		after?: string | number | object;
		diff?: string;
	};
}

/**
 * Detect metric changes (numeric comparisons)
 * e.g., SERP rank changes, traffic changes, keyword count changes
 */
export function detectMetricChange(
	metric: string,
	previousValue: number,
	currentValue: number,
	thresholds?: { critical?: number; high?: number; medium?: number }
): Change | null {
	if (previousValue === currentValue) {
		return null; // No change
	}

	const change = currentValue - previousValue;
	const percentChange = Math.abs((change / previousValue) * 100);

	// Determine severity based on thresholds or percentage change
	let severity: "critical" | "high" | "medium" | "low" = "low";

	if (thresholds) {
		if (
			thresholds.critical &&
			Math.abs(change) >= thresholds.critical
		) {
			severity = "critical";
		} else if (
			thresholds.high &&
			Math.abs(change) >= thresholds.high
		) {
			severity = "high";
		} else if (
			thresholds.medium &&
			Math.abs(change) >= thresholds.medium
		) {
			severity = "medium";
		}
	} else {
		// Default thresholds if not provided
		if (percentChange > 50) {
			severity = "critical";
		} else if (percentChange > 20) {
			severity = "high";
		} else if (percentChange > 10) {
			severity = "medium";
		}
	}

	const direction = change > 0 ? "increased" : "decreased";

	return {
		type: "metric",
		competitor: "",
		timestamp: Date.now(),
		severity,
		title: `${metric} ${direction}`,
		description: `${metric} changed from ${previousValue} to ${currentValue} (${direction} by ${Math.abs(percentChange).toFixed(1)}%)`,
		evidence: {
			before: previousValue,
			after: currentValue,
			diff: change.toString(),
		},
	};
}

/**
 * Detect DOM structure changes
 * Compare JSON representation of webpage structure/pricing/features
 */
export function detectDOMChange(
	domBefore: Record<string, unknown>,
	domAfter: Record<string, unknown>
): Change[] {
	const changes: Change[] = [];

	// Check for added/removed keys
	const keysBefore = Object.keys(domBefore);
	const keysAfter = Object.keys(domAfter);

	// Keys that were removed
	for (const key of keysBefore) {
		if (!keysAfter.includes(key)) {
			changes.push({
				type: "dom",
				competitor: "",
				timestamp: Date.now(),
				severity: "medium",
				title: `Element removed: ${key}`,
				description: `The "${key}" section is no longer present`,
				evidence: {
					before: domBefore[key],
				},
			});
		}
	}

	// Keys that were added
	for (const key of keysAfter) {
		if (!keysBefore.includes(key)) {
			changes.push({
				type: "dom",
				competitor: "",
				timestamp: Date.now(),
				severity: "high",
				title: `Element added: ${key}`,
				description: `A new "${key}" section has been added`,
				evidence: {
					after: domAfter[key],
				},
			});
		}
	}

	// Keys that changed
	for (const key of keysBefore) {
		if (keysAfter.includes(key)) {
			const before = JSON.stringify(domBefore[key]);
			const after = JSON.stringify(domAfter[key]);

			if (before !== after) {
				changes.push({
					type: "dom",
					competitor: "",
					timestamp: Date.now(),
					severity: "medium",
					title: `${key} modified`,
					description: `The "${key}" section has changed`,
					evidence: {
						before: domBefore[key],
						after: domAfter[key],
					},
				});
			}
		}
	}

	return changes;
}

/**
 * Detect content changes (new articles, removed pages, etc.)
 */
export function detectContentChange(
	contentBefore: string[],
	contentAfter: string[]
): Change[] {
	const changes: Change[] = [];

	// New content
	const newContent = contentAfter.filter((c) => !contentBefore.includes(c));
	for (const content of newContent) {
		changes.push({
			type: "content",
			competitor: "",
			timestamp: Date.now(),
			severity: "medium",
			title: "New content published",
			description: `New page/article: "${content}"`,
			evidence: {
				after: content,
			},
		});
	}

	// Removed content
	const removedContent = contentBefore.filter(
		(c) => !contentAfter.includes(c)
	);
	for (const content of removedContent) {
		changes.push({
			type: "content",
			competitor: "",
			timestamp: Date.now(),
			severity: "low",
			title: "Content removed",
			description: `Page/article removed: "${content}"`,
			evidence: {
				before: content,
			},
		});
	}

	return changes;
}

/**
 * Detect visual changes by comparing pixel data
 * Simplified version: compare image hash or key regions
 *
 * In production, would use:
 * - OpenCV for image processing
 * - Tesseract for OCR to detect text changes
 * - Image hashing for quick comparison
 */
export function detectVisualChange(
	imageBefore: string, // base64 or hash
	imageAfter: string,
	sensitivityThreshold: number = 0.05 // 5% pixel difference
): Change | null {
	// Simplified: compare hashes directly
	if (imageBefore === imageAfter) {
		return null; // No visible change
	}

	return {
		type: "visual",
		competitor: "",
		timestamp: Date.now(),
		severity: "high",
		title: "Website design changed",
		description:
			"The homepage or key pages have a new visual design",
		evidence: {
			before: "screenshot",
			after: "screenshot",
		},
	};
}

/**
 * Aggregate changes and score overall significance
 * Returns composite change score (0-1) for AI analysis
 */
export function aggregateChanges(changes: Change[]): {
	score: number;
	summary: string;
	changes: Change[];
} {
	if (changes.length === 0) {
		return {
			score: 0,
			summary: "No changes detected",
			changes: [],
		};
	}

	// Weight changes by severity
	const severityWeights = {
		critical: 1.0,
		high: 0.7,
		medium: 0.4,
		low: 0.1,
	};

	let totalScore = 0;
	const changeCounts = {
		critical: 0,
		high: 0,
		medium: 0,
		low: 0,
	};

	for (const change of changes) {
		totalScore +=
			severityWeights[change.severity as keyof typeof severityWeights];
		changeCounts[change.severity as keyof typeof changeCounts]++;
	}

	// Normalize score to 0-1 range
	const averageScore = Math.min(totalScore / changes.length, 1);

	// Generate summary
	const summaryParts: string[] = [];
	if (changeCounts.critical > 0)
		summaryParts.push(`${changeCounts.critical} critical`);
	if (changeCounts.high > 0) summaryParts.push(`${changeCounts.high} high`);
	if (changeCounts.medium > 0)
		summaryParts.push(`${changeCounts.medium} medium`);
	if (changeCounts.low > 0) summaryParts.push(`${changeCounts.low} low`);

	const summary = `Detected ${changes.length} changes: ${summaryParts.join(", ")}`;

	return {
		score: averageScore,
		summary,
		changes: changes.sort(
			(a, b) =>
				Object.values(severityWeights).indexOf(
					severityWeights[a.severity as keyof typeof severityWeights]
				) -
				Object.values(severityWeights).indexOf(
					severityWeights[b.severity as keyof typeof severityWeights]
				)
		),
	};
}

/**
 * Specific change detectors for common competitive signals
 */

export function detectPricingChange(
	pricingBefore: Record<string, number | null>,
	pricingAfter: Record<string, number | null>
): Change[] {
	const changes: Change[] = [];

	for (const tier of Object.keys(pricingAfter)) {
		const before = pricingBefore[tier];
		const after = pricingAfter[tier];

		if (before === undefined || before === null) {
			// New tier
			changes.push({
				type: "metric",
				competitor: "",
				timestamp: Date.now(),
				severity: "high",
				title: `New pricing tier: ${tier}`,
				description: `A new "${tier}" plan has been introduced at $${after}/month`,
				evidence: {
					after: after,
				},
			});
		} else if (after === undefined || after === null) {
			// Tier removed
			changes.push({
				type: "metric",
				competitor: "",
				timestamp: Date.now(),
				severity: "medium",
				title: `Pricing tier removed: ${tier}`,
				description: `The "${tier}" plan is no longer available`,
				evidence: {
					before: before,
				},
			});
		} else if (before !== after) {
			// Price changed
			const change = after - before;
			const percentChange = ((change / before) * 100).toFixed(1);
			const direction = change > 0 ? "increased" : "decreased";

			changes.push({
				type: "metric",
				competitor: "",
				timestamp: Date.now(),
				severity: change > before * 0.2 ? "high" : "medium", // 20%+ change is critical
				title: `${tier} pricing ${direction}`,
				description: `${tier} tier changed from $${before} to $${after} per month (${percentChange}% ${direction})`,
				evidence: {
					before: before,
					after: after,
					diff: change.toString(),
				},
			});
		}
	}

	return changes;
}

export function detectFeatureChange(
	featuresBefore: string[],
	featuresAfter: string[]
): Change[] {
	const changes: Change[] = [];

	// New features
	const newFeatures = featuresAfter.filter(
		(f) => !featuresBefore.includes(f)
	);
	for (const feature of newFeatures) {
		changes.push({
			type: "dom",
			competitor: "",
			timestamp: Date.now(),
			severity: "high",
			title: `New feature: ${feature}`,
			description: `Added capability: "${feature}"`,
			evidence: {
				after: feature,
			},
		});
	}

	// Removed features (rare but notable)
	const removedFeatures = featuresBefore.filter(
		(f) => !featuresAfter.includes(f)
	);
	for (const feature of removedFeatures) {
		changes.push({
			type: "dom",
			competitor: "",
			timestamp: Date.now(),
			severity: "medium",
			title: `Feature removed: ${feature}`,
			description: `Removed: "${feature}"`,
			evidence: {
				before: feature,
			},
		});
	}

	return changes;
}
