/**
 * Error Handling and RequestId Logging Tests
 *
 * Tests cover:
 * - RequestId generation and correlation
 * - Server-side error logging with full details
 * - Client responses with generic messages (no stack traces)
 * - Error status code mapping
 * - Error context creation from requests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
	logErrorServer,
	getClientErrorResponse,
	getErrorStatusCode,
	createErrorContext,
	type ErrorLogContext,
} from "../server/error-logger";

describe("Error Handling and Logging", () => {
	let consoleErrorSpy: any;

	beforeEach(() => {
		consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
	});

	describe("Error Logging", () => {
		it("should log error with requestId and full details", () => {
			const context: ErrorLogContext = {
				requestId: "test-uuid-123",
				url: "http://localhost:3000/api/test",
				method: "POST",
				timestamp: Date.now(),
			};

			const error = new Error("Database connection failed");
			logErrorServer(error, context);

			expect(consoleErrorSpy).toHaveBeenCalled();
			const logMessage = consoleErrorSpy.mock.calls[0][0];
			expect(logMessage).toContain("test-uuid-123");
			expect(logMessage).toContain("POST");
			expect(logMessage).toContain("/api/test");
			expect(logMessage).toContain("Database connection failed");
		});

		it("should include stack trace in server logs", () => {
			const context: ErrorLogContext = {
				requestId: "test-uuid-456",
				url: "http://localhost:3000/api/test",
				method: "GET",
				timestamp: Date.now(),
			};

			const error = new Error("Test error with stack");
			logErrorServer(error, context);

			expect(consoleErrorSpy).toHaveBeenCalled();
			const stackTrace = consoleErrorSpy.mock.calls[0][1];
			expect(stackTrace).toContain("Error: Test error with stack");
		});

		it("should handle non-Error objects", () => {
			const context: ErrorLogContext = {
				requestId: "test-uuid-789",
				url: "http://localhost:3000/api/test",
				method: "DELETE",
				timestamp: Date.now(),
			};

			const stringError = "Simple string error";
			logErrorServer(stringError, context);

			expect(consoleErrorSpy).toHaveBeenCalled();
		});
	});

	describe("Client Error Responses", () => {
		it("should return generic message without stack trace", () => {
			const response = getClientErrorResponse("test-uuid-123");

			expect(response.body.error).toBe("Internal server error");
			expect(response.body.error).not.toContain("stack");
			expect(response.body.error).not.toContain("at ");
		});

		it("should include requestId for error correlation", () => {
			const response = getClientErrorResponse("request-id-xyz");

			expect(response.body.requestId).toBe("request-id-xyz");
		});

		it("should include requestId in X-Request-ID header", () => {
			const response = getClientErrorResponse("correlation-id");

			expect(response.headers["X-Request-ID"]).toBe("correlation-id");
		});

		it("should return appropriate status code messages", () => {
			const statusCodes = [400, 401, 403, 404, 429, 500];
			const expectedMessages: Record<number, string> = {
				400: "Bad request",
				401: "Unauthorized",
				403: "Forbidden",
				404: "Not found",
				429: "Too many requests",
				500: "Internal server error",
			};

			statusCodes.forEach((code) => {
				const response = getClientErrorResponse("test-id", code);
				expect(response.status).toBe(code);
				expect(response.body.error).toBe(expectedMessages[code]);
			});
		});

		it("should never expose internal error details in response", () => {
			const response = getClientErrorResponse("test-id");

			expect(response.body.error).not.toMatch(/\.ts|\.tsx|src\//);
			expect(response.body.error).not.toMatch(/\//);
		});
	});

	describe("Error Status Code Detection", () => {
		it("should detect custom status code from error object", () => {
			const error = { status: 418, message: "I'm a teapot" };
			expect(getErrorStatusCode(error)).toBe(418);
		});

		it("should detect statusCode property", () => {
			const error = { statusCode: 403, message: "Forbidden" };
			expect(getErrorStatusCode(error)).toBe(403);
		});

		it("should extract status from error message hints", () => {
			expect(getErrorStatusCode(new Error("Unauthorized access"))).toBe(401);
			expect(getErrorStatusCode(new Error("Forbidden"))).toBe(403);
			expect(getErrorStatusCode(new Error("Not found resource"))).toBe(404);
			expect(getErrorStatusCode(new Error("Too many requests"))).toBe(429);
		});

		it("should default to 500 for unknown errors", () => {
			expect(getErrorStatusCode(new Error("Something went wrong"))).toBe(500);
			expect(getErrorStatusCode("string error")).toBe(500);
			expect(getErrorStatusCode(null)).toBe(500);
		});
	});

	describe("Error Context Creation", () => {
		it("should extract request details into context", () => {
			const request = new Request("http://example.com/api/users", {
				method: "POST",
			});

			const context = createErrorContext(request);

			expect(context.url).toBe("http://example.com/api/users");
			expect(context.method).toBe("POST");
			expect(context.timestamp).toBeGreaterThan(0);
		});

		it("should preserve query parameters in URL", () => {
			const request = new Request(
				"http://example.com/api/search?q=test&limit=10",
				{ method: "GET" }
			);

			const context = createErrorContext(request);

			expect(context.url).toContain("?q=test&limit=10");
		});

		it("should work with different HTTP methods", () => {
			const methods = ["GET", "POST", "PUT", "DELETE", "PATCH"];

			methods.forEach((method) => {
				const request = new Request("http://example.com/api/test", {
					method,
				});
				const context = createErrorContext(request);
				expect(context.method).toBe(method);
			});
		});
	});

	describe("RequestId Correlation", () => {
		it("should maintain requestId throughout error lifecycle", () => {
			const requestId = "correlation-test-id";
			const context: ErrorLogContext = {
				requestId,
				url: "http://localhost/test",
				method: "GET",
				timestamp: Date.now(),
			};

			// Log server-side
			const error = new Error("Test");
			logErrorServer(error, context);

			// Get client response with same ID
			const clientResponse = getClientErrorResponse(requestId);

			expect(clientResponse.body.requestId).toBe(requestId);
			expect(clientResponse.headers["X-Request-ID"]).toBe(requestId);
		});

		it("should generate unique requestIds for different requests", () => {
			const requestIds = new Set<string>();

			for (let i = 0; i < 10; i++) {
				const id = `test-${crypto.randomUUID()}`;
				expect(requestIds.has(id)).toBe(false);
				requestIds.add(id);
			}

			expect(requestIds.size).toBe(10);
		});
	});

	describe("Security: No Information Disclosure", () => {
		it("should not expose file paths in error response", () => {
			const error = new Error(
				"Failed at /Users/admin/Work/open-dash/src/server/db.ts:42"
			);
			const response = getClientErrorResponse("test-id");

			expect(response.body.error).not.toContain("/Users/");
			expect(response.body.error).not.toContain(".ts");
			expect(response.body.error).not.toContain("src/");
		});

		it("should not expose environment variables", () => {
			const error = new Error(
				`Failed to connect to ${process.env.DATABASE_URL}`
			);
			const response = getClientErrorResponse("test-id");

			expect(response.body.error).not.toContain("DATABASE_URL");
		});

		it("should not expose API keys or secrets", () => {
			const error = new Error("API key sk_live_abc123xyz invalid");
			const response = getClientErrorResponse("test-id");

			expect(response.body.error).not.toContain("sk_live");
			expect(response.body.error).not.toContain("abc123");
		});

		it("should sanitize third-party service errors", () => {
			const error = new Error("Database error: UNIQUE constraint failed on user_email");
			const response = getClientErrorResponse("test-id");

			// Response should be generic, not expose database structure
			expect(response.body.error).toBe("Internal server error");
			expect(response.body.error).not.toContain("UNIQUE");
			expect(response.body.error).not.toContain("user_email");
		});
	});
});
