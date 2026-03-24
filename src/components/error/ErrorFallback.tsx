interface ErrorFallbackProps {
	error: Error
	resetError: () => void
}

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
	return (
		<div className="error-fallback">
			<div className="error-icon">⚠️</div>
			<div className="error-title">Something went wrong</div>
			<div className="error-message">{error.message}</div>
			<button className="error-reset-button" onClick={resetError}>
				Try again
			</button>
		</div>
	)
}
