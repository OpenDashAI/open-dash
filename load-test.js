/**
 * Load Testing for OpenDash - Phase 1 Deployment Verification
 *
 * Tests realistic traffic patterns and verifies performance targets:
 * - Dashboard loads in <500ms
 * - API endpoints respond in <200ms
 * - No errors under sustained load
 * - Rate limiting works correctly
 *
 * Run with:
 *   k6 run load-test.js --vus 50 --duration 60s
 *   k6 run load-test.js --vus 100 --duration 120s
 *
 * Install k6: https://k6.io/docs/getting-started/installation/
 */

import http from "k6/http";
import { check, group, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const THINK_TIME = 2; // seconds between requests

export const options = {
	stages: [
		// Ramp up to target VUs
		{ duration: "30s", target: __ENV.VUS || 50 },
		// Stay at target
		{ duration: __ENV.DURATION || "60s", target: __ENV.VUS || 50 },
		// Ramp down
		{ duration: "30s", target: 0 },
	],
	thresholds: {
		// Dashboard should load in <500ms
		"http_req_duration{page:dashboard}": ["p(95)<500", "p(99)<1000"],
		// API endpoints should respond in <200ms
		"http_req_duration{page:api}": ["p(95)<200", "p(99)<500"],
		// Health check should be instant
		"http_req_duration{page:health}": ["p(95)<50"],
		// Error rate should be <1%
		http_req_failed: ["rate<0.01"],
	},
};

export default function () {
	// Health check (fast, no auth required)
	group("Health Check", () => {
		const res = http.get(`${BASE_URL}/health`, {
			tags: { page: "health" },
		});

		check(res, {
			"health check returns 200": (r) => r.status === 200,
			"health check is fast": (r) => r.timings.duration < 100,
		});
	});

	sleep(THINK_TIME);

	// Dashboard request (simulates page load)
	group("Dashboard Load", () => {
		const res = http.get(`${BASE_URL}/competitive-intelligence`, {
			tags: { page: "dashboard" },
		});

		check(res, {
			"dashboard loads": (r) =>
				r.status === 200 || r.status === 302, // 302 for redirect to login
			"dashboard is responsive": (r) => r.timings.duration < 500,
		});
	});

	sleep(THINK_TIME);

	// Competitors API endpoint
	group("Competitors API", () => {
		const res = http.get(
			`${BASE_URL}/api/ci-tools/listCompetitors`,
			{
				tags: { page: "api" },
				headers: {
					// Mock auth header (in real scenario, use valid token)
					Authorization: "Bearer test-token",
				},
			}
		);

		check(res, {
			"competitors endpoint responds": (r) => r.status !== 0,
			"competitors endpoint is fast": (r) => r.timings.duration < 200,
			"competitors endpoint returns data or auth error": (r) =>
				[200, 401, 403].includes(r.status),
		});
	});

	sleep(THINK_TIME);

	// Alerts API endpoint
	group("Alerts API", () => {
		const res = http.get(`${BASE_URL}/api/alerts`, {
			tags: { page: "api" },
			headers: {
				Authorization: "Bearer test-token",
			},
		});

		check(res, {
			"alerts endpoint responds": (r) => r.status !== 0,
			"alerts endpoint is fast": (r) => r.timings.duration < 200,
		});
	});

	sleep(THINK_TIME);

	// Rate limiting test (multiple rapid requests)
	group("Rate Limiting Verification", () => {
		// Send 5 rapid requests to same endpoint
		const responses = [];
		for (let i = 0; i < 5; i++) {
			const res = http.get(`${BASE_URL}/api/search?q=test`, {
				tags: { page: "api" },
				headers: {
					Authorization: "Bearer test-token",
				},
			});
			responses.push(res);
		}

		// Verify responses
		check(responses, {
			"most requests succeed": (r) =>
				r.filter((resp) => resp.status < 400).length >= 3,
			"rate limit header present on last requests": (r) => {
				const lastRes = r[r.length - 1];
				return (
					lastRes.headers["X-RateLimit-Remaining"] !== undefined ||
					lastRes.status === 429
				);
			},
		});
	});

	sleep(THINK_TIME);

	// Error scenario test
	group("Error Handling", () => {
		const res = http.get(`${BASE_URL}/api/nonexistent`, {
			tags: { page: "api" },
		});

		check(res, {
			"404 for nonexistent endpoint": (r) => r.status === 404,
			"error response includes requestId": (r) =>
				r.headers["X-Request-ID"] !== undefined,
			"error response is generic": (r) =>
				!r.body.includes("stack") && !r.body.includes("at "),
		});
	});

	sleep(THINK_TIME);
}

/**
 * Custom metric tracking
 */
export function handleSummary(data) {
	return {
		stdout: textSummary(data, { indent: " ", enableColors: true }),
		"summary.json": JSON.stringify(data),
	};
}

/**
 * Helper function for text summary
 */
function textSummary(data, options = {}) {
	const indent = options.indent || "";
	const lines = [];

	lines.push("\n=== Load Test Summary ===\n");

	// Metrics summary
	if (data.metrics) {
		lines.push(`${indent}HTTP Requests: ${data.metrics.http_reqs?.value || 0}`);
		lines.push(
			`${indent}Failed: ${data.metrics.http_req_failed?.value || 0}`
		);
		lines.push(
			`${indent}Duration: ${Math.round(data.metrics.iteration_duration?.values?.max || 0)}ms`
		);

		if (data.metrics.http_req_duration) {
			const dur = data.metrics.http_req_duration.values;
			lines.push(`${indent}Response Time P95: ${Math.round(dur.p95)}ms`);
			lines.push(`${indent}Response Time P99: ${Math.round(dur.p99)}ms`);
		}
	}

	// Checks summary
	if (data.checks) {
		lines.push(`\n${indent}Checks:`);
		Object.entries(data.checks).forEach(([name, check]) => {
			const passes = check.passes || 0;
			const fails = check.fails || 0;
			const status = fails === 0 ? "✅" : "❌";
			lines.push(
				`${indent}  ${status} ${name}: ${passes}/${passes + fails}`
			);
		});
	}

	lines.push(`\n${indent}=== End Summary ===\n`);

	return lines.join("\n");
}
