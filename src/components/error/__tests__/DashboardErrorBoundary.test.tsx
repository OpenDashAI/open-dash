import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DashboardErrorBoundary } from '../DashboardErrorBoundary'

// Suppress console.error for these tests
const originalError = console.error
beforeEach(() => {
	console.error = vi.fn()
})

afterEach(() => {
	console.error = originalError
})

const ThrowError = ({ message }: { message: string }) => {
	throw new Error(message)
}

describe('DashboardErrorBoundary', () => {
	it('renders children when no error occurs', () => {
		render(
			<DashboardErrorBoundary>
				<div>Safe content</div>
			</DashboardErrorBoundary>
		)

		expect(screen.getByText('Safe content')).toBeInTheDocument()
	})

	it('catches errors and shows fallback', () => {
		render(
			<DashboardErrorBoundary>
				<ThrowError message="Test error message" />
			</DashboardErrorBoundary>
		)

		expect(screen.getByText('Something went wrong')).toBeInTheDocument()
		expect(screen.getByText('Test error message')).toBeInTheDocument()
	})

	it('displays reset button in fallback', () => {
		render(
			<DashboardErrorBoundary>
				<ThrowError message="Error" />
			</DashboardErrorBoundary>
		)

		const resetButton = screen.getByRole('button', { name: /Try again/ })
		expect(resetButton).toBeInTheDocument()
	})

	it('displays error icon with fallback content', () => {
		render(
			<DashboardErrorBoundary>
				<ThrowError message="Test error" />
			</DashboardErrorBoundary>
		)

		expect(screen.getByText('⚠️')).toBeInTheDocument()
		expect(screen.getByText('Something went wrong')).toBeInTheDocument()
	})

	it('accepts custom fallback component', () => {
		render(
			<DashboardErrorBoundary
				fallback={(error) => (
					<div>Custom error: {error.message}</div>
				)}
			>
				<ThrowError message="Custom error" />
			</DashboardErrorBoundary>
		)

		expect(screen.getByText('Custom error: Custom error')).toBeInTheDocument()
	})

	it('logs error to console', () => {
		const consoleErrorSpy = vi.spyOn(console, 'error')

		render(
			<DashboardErrorBoundary>
				<ThrowError message="Logged error" />
			</DashboardErrorBoundary>
		)

		expect(consoleErrorSpy).toHaveBeenCalledWith(
			'DashboardErrorBoundary caught error:',
			expect.any(Error)
		)
	})
})
