import { Component, ReactNode } from 'react'
import { ErrorFallback } from './ErrorFallback'

interface Props {
	children: ReactNode
	fallback?: (error: Error, reset: () => void) => ReactNode
}

interface State {
	hasError: boolean
	error: Error | null
}

export class DashboardErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props)
		this.state = { hasError: false, error: null }
	}

	static getDerivedStateFromError(error: Error): State {
		return {
			hasError: true,
			error,
		}
	}

	componentDidCatch(error: Error) {
		// Log error for monitoring/debugging
		console.error('DashboardErrorBoundary caught error:', error)
	}

	resetError = () => {
		this.setState({ hasError: false, error: null })
	}

	render() {
		if (this.state.hasError && this.state.error) {
			if (this.props.fallback) {
				return this.props.fallback(this.state.error, this.resetError)
			}
			return <ErrorFallback error={this.state.error} resetError={this.resetError} />
		}

		return this.props.children
	}
}
