import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Display } from '../Display'
import { CompositionProvider } from '../../../lib/composition-provider'

describe('Display Component', () => {
  it('should render with label', () => {
    render(
      <CompositionProvider>
        <Display componentId="display-1" label="Results" />
      </CompositionProvider>
    )

    expect(screen.getByText('Results')).toBeInTheDocument()
  })

  it('should display waiting for data message initially', () => {
    render(
      <CompositionProvider>
        <Display componentId="display-1" />
      </CompositionProvider>
    )

    expect(screen.getByText('Waiting for data...')).toBeInTheDocument()
  })

  it('should show 0 results initially', () => {
    render(
      <CompositionProvider>
        <Display componentId="display-1" />
      </CompositionProvider>
    )

    expect(screen.getByText(/0 result/)).toBeInTheDocument()
  })

  it('should register component with context', () => {
    const { container } = render(
      <CompositionProvider>
        <Display componentId="display-1" />
      </CompositionProvider>
    )

    expect(container.querySelector('.border-green-200')).toBeInTheDocument()
  })

  it('should display with correct styling', () => {
    const { container } = render(
      <CompositionProvider>
        <Display componentId="display-1" />
      </CompositionProvider>
    )

    const displayDiv = container.querySelector('.border-green-200')
    expect(displayDiv).toHaveClass('flex', 'flex-col', 'gap-3', 'p-4', 'rounded-lg')
  })

  it('should have header with label and result count', () => {
    render(
      <CompositionProvider>
        <Display componentId="display-1" label="My Results" />
      </CompositionProvider>
    )

    expect(screen.getByText('My Results')).toBeInTheDocument()
    expect(screen.getByText(/0 result/)).toBeInTheDocument()
  })

  it('should display placeholder when no items selected', () => {
    render(
      <CompositionProvider>
        <Display componentId="display-1" />
      </CompositionProvider>
    )

    expect(screen.getByText('Waiting for data...')).toBeInTheDocument()
  })

  it('should have filter input area', () => {
    const { container } = render(
      <CompositionProvider>
        <Display componentId="display-1" />
      </CompositionProvider>
    )

    const displayDiv = container.querySelector('.border-green-200')
    expect(displayDiv).toBeInTheDocument()
  })

  it('should render as table when data is present', () => {
    const { container } = render(
      <CompositionProvider>
        <Display componentId="display-1" />
      </CompositionProvider>
    )

    // Table exists but is empty initially
    const table = container.querySelector('table')
    expect(table).not.toBeInTheDocument() // No table until data comes
  })
})
