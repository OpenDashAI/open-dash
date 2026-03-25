/**
 * Error Logging Utility with RequestId Tracking
 *
 * Provides centralized error logging with requestId correlation for debugging.
 * - Server logs include full details (message, stack, URL, method)
 * - Client responses contain only generic message and requestId
 * - Never exposes stack traces or sensitive data to clients
 */

export interface ErrorLogContext {
	requestId: string;
	url: string;
	method: string;
	timestamp: number;
}

export interface ErrorDetails {
	message: string;
	stack?: string;
	context: ErrorLogContext;
}

/**
 * Log error server-side with full details
 * Only called on server, stack traces stay in server logs
 */
export function logErrorServer(error: unknown, context: ErrorLogContext): void {
	const timestamp = new Date(context.timestamp).toISOString();
	const errorMessage = error instanceof Error ? error.message : String(error);
	const errorStack = error instanceof Error ? error.stack : "No stack trace";

	// Format for structured logging (can be sent to logging service)
	const logEntry = {
		level: "error",
		requestId: context.requestId,
		timestamp,
		message: errorMessage,
		stack: errorStack,
		url: context.url,
		method: context.method,
	};

	// Log to console in development
	console.error(
		`[${context.requestId}] ${context.method} ${context.url}: ${errorMessage}`,
		errorStack
	);

	// TODO: Send to external logging service (Sentry, LogRocket, etc.)
	// await logToService(logEntry);
}

/**
 * Get generic error response for client
 * Never exposes internal details or stack traces
 */
export function getClientErrorResponse(
	requestId: string,
	statusCode: number = 500
): {
	status: number;
	body: { error: string; requestId: string };
	headers: { "Content-Type": string; "X-Request-ID": string };
} {
	const errorMessages: Record<number, string> = {
		400: "Bad request",
		401: "Unauthorized",
		403: "Forbidden",
		404: "Not found",
		429: "Too many requests",
		500: "Internal server error",
		503: "Service unavailable",
	};

	const message = errorMessages[statusCode] || errorMessages[500];

	return {
		status: statusCode,
		body: {
			error: message,
			requestId,
		},
		headers: {
			"Content-Type": "application/json",
			"X-Request-ID": requestId,
		},
	};
}

/**
 * Parse HTTP error to determine status code
 */
export function getErrorStatusCode(error: unknown): number {
	// Check for custom status code
	if (typeof error === "object" && error !== null) {
		const err = error as Record<string, unknown>;
		if (typeof err.status === "number") return err.status;
		if (typeof err.statusCode === "number") return err.statusCode;
	}

	// Specific error types
	if (error instanceof Error) {
		// Check error message for status code hints
		if (error.message.includes("Unauthorized")) return 401;
		if (error.message.includes("Forbidden")) return 403;
		if (error.message.includes("Not found")) return 404;
		if (error.message.includes("Too many")) return 429;
	}

	// Default to 500
	return 500;
}

/**
 * Create error context from request
 */
export function createErrorContext(request: Request): Omit<ErrorLogContext, "requestId"> {
	return {
		url: request.url,
		method: request.method,
		timestamp: Date.now(),
	};
}
