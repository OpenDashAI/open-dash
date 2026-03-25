/**
 * Error Handling Middleware for TanStack Start
 *
 * Handles errors with request IDs for debugging.
 * Logs full details server-side, returns generic message to client.
 */

export interface ErrorDetails {
	requestId: string;
	message: string;
	stack?: string;
	url: string;
	method: string;
	timestamp: string;
}

/**
 * Create error response with request ID
 * Use in catch blocks to return proper error responses
 */
export function handleError(
	error: unknown,
	request: Request,
	status: number = 500
): Response {
	const requestId = crypto.randomUUID();
	const errorMsg = error instanceof Error ? error.message : String(error);
	const errorStack = error instanceof Error ? error.stack : undefined;
	const url = new URL(request.url).pathname;
	const method = request.method;
	const timestamp = new Date().toISOString();

	// Log full details server-side
	const logEntry: ErrorDetails = {
		requestId,
		message: errorMsg,
		stack: errorStack,
		url,
		method,
		timestamp,
	};

	console.error(`[${requestId}] Error:`, logEntry);

	// Return generic error to client (never expose stack traces)
	return Response.json(
		{
			error: getErrorMessage(status),
			requestId,
			timestamp,
		},
		{
			status,
			headers: {
				"Content-Type": "application/json",
				"X-Request-ID": requestId,
			},
		}
	);
}

/**
 * Get user-friendly error message based on status code
 */
function getErrorMessage(status: number): string {
	switch (status) {
		case 400:
			return "Bad Request";
		case 401:
			return "Unauthorized";
		case 403:
			return "Forbidden";
		case 404:
			return "Not Found";
		case 429:
			return "Too Many Requests";
		case 500:
			return "Internal Server Error";
		case 503:
			return "Service Unavailable";
		default:
			return "Error";
	}
}

/**
 * Log error with request ID (for manual logging)
 */
export function logError(
	requestId: string,
	error: unknown,
	context?: Record<string, unknown>
): void {
	const message = error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack : undefined;

	console.error(
		JSON.stringify({
			requestId,
			timestamp: new Date().toISOString(),
			message,
			stack,
			...context,
		})
	);
}

/**
 * Usage example:
 *
 * ```typescript
 * import { handleError } from '../../server/error-handler-middleware';
 *
 * export const Route = createAPIFileRoute("/api/data")({
 *   handlers: {
 *     GET: async ({ request }) => {
 *       try {
 *         // ... business logic ...
 *       } catch (error) {
 *         return handleError(error, request, 500);
 *       }
 *     }
 *   }
 * });
 * ```
 */
