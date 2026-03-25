import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Summary } from '../Summary'
import { CompositionProvider } from '../../../lib/composition-provider'

describe('Summary Component', () => {
  it('should render with label', () => {
    render(
      <CompositionProvider>
        <Summary componentId="summary-1" label="Summary" />
      </CompositionProvider>
    )

    expect(screen.getByText('Summary')).toBeInTheDocument()
  })

  it('should display no data message initially', () => {
    render(
      <CompositionProvider>
        <Summary componentId="summary-1" />
      </CompositionProvider>
    )

    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('should register component with context', () => {
    const { container } = render(
      <CompositionProvider>
        <Summary componentId="summary-1" />
      </CompositionProvider>
    )

    expect(container.querySelector('.border-orange-200')).toBeInTheDocument()
  })

  it('should display with correct styling', () => {
    const { container } = render(
      <CompositionProvider>
        <Summary componentId="summary-1" />
      </CompositionProvider>
    )

    const summaryDiv = container.querySelector('.border-orange-200')
    expect(summaryDiv).toHaveClass('flex', 'flex-col', 'gap-3', 'p-4', 'rounded-lg')
  })

  it('should have correct styling classes', () => {
    const { container } = render(
      <CompositionProvider>
        <Summary componentId="summary-1" />
      </CompositionProvider>
    )

    const summaryDiv = container.querySelector('.border-orange-200')
    expect(summaryDiv?.className).toContain('bg-white')
    expect(summaryDiv?.className).toContain('rounded-lg')
  })

  it('should accept custom label', () => {
    render(
      <CompositionProvider>
        <Summary componentId="summary-1" label="Custom Summary" />
      </CompositionProvider>
    )

    expect(screen.getByText('Custom Summary')).toBeInTheDocument()
  })

  it('should have placeholder for no data state', () => {
    const { container } = render(
      <CompositionProvider>
        <Summary componentId="summary-1" />
      </CompositionProvider>
    )

    const noDataMessage = screen.getByText('No data available')
    expect(noDataMessage).toBeInTheDocument()
    expect(noDataMessage.className).toContain('text-gray-500')
  })

  it('should render multiple instances independently', () => {
    render(
      <CompositionProvider>
        <Summary componentId="summary-1" label="Summary 1" />
        <Summary componentId="summary-2" label="Summary 2" />
      </CompositionProvider>
    )

    expect(screen.getByText('Summary 1')).toBeInTheDocument()
    expect(screen.getByText('Summary 2')).toBeInTheDocument()
  })
})
