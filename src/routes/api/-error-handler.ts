/**
 * Error Handler Server Function
 *
 * Client-side errors can be logged server-side using this function,
 * ensuring all errors (client and server) are logged with requestId.
 *
 * Usage from client:
 * ```typescript
 * try {
 *   // some client code
 * } catch (error) {
 *   await logClientError(error)
 * }
 * ```
 */

import { createServerFn } from "@tanstack/start";
import { logErrorServer, createErrorContext } from "../../server/error-logger";

export const logClientError = createServerFn(
	{ method: "POST" },
	async (
		error: {
			message: string;
			stack?: string;
			url?: string;
		},
		context: any
	) => {
		// Generate requestId for this error
		const requestId = `client-${crypto.randomUUID()}`;

		// Log the error server-side with minimal context
		logErrorServer(
			new Error(error.message + (error.stack ? `\n${error.stack}` : "")),
			{
				requestId,
				url: error.url || "unknown",
				source: "client",
			}
		);

		return {
			requestId,
			logged: true,
		};
	}
);
