import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Filter } from '../Filter'
import { CompositionProvider } from '../../../lib/composition-provider'

describe('Filter Component', () => {
  it('should render with label', () => {
    render(
      <CompositionProvider>
        <Filter componentId="filter-1" label="Filter Results" />
      </CompositionProvider>
    )

    expect(screen.getByText('Filter Results')).toBeInTheDocument()
  })

  it('should display filter input', () => {
    render(
      <CompositionProvider>
        <Filter componentId="filter-1" />
      </CompositionProvider>
    )

    expect(screen.getByPlaceholderText('Search selected items...')).toBeInTheDocument()
  })

  it('should show no items selected message initially', () => {
    render(
      <CompositionProvider>
        <Filter componentId="filter-1" />
      </CompositionProvider>
    )

    expect(screen.getByText('No items selected')).toBeInTheDocument()
  })

  it('should accept filter text', () => {
    render(
      <CompositionProvider>
        <Filter componentId="filter-1" />
      </CompositionProvider>
    )

    const input = screen.getByPlaceholderText(
      'Search selected items...'
    ) as HTMLInputElement

    fireEvent.change(input, { target: { value: 'test' } })

    expect(input.value).toBe('test')
  })

  it('should show clear filter button when filter text exists', () => {
    render(
      <CompositionProvider>
        <Filter componentId="filter-1" />
      </CompositionProvider>
    )

    expect(screen.queryByText('Clear Filter')).not.toBeInTheDocument()

    const input = screen.getByPlaceholderText('Search selected items...')
    fireEvent.change(input, { target: { value: 'test' } })

    expect(screen.getByText('Clear Filter')).toBeInTheDocument()
  })

  it('should clear filter text when clear button clicked', () => {
    render(
      <CompositionProvider>
        <Filter componentId="filter-1" />
      </CompositionProvider>
    )

    const input = screen.getByPlaceholderText(
      'Search selected items...'
    ) as HTMLInputElement
    fireEvent.change(input, { target: { value: 'test' } })

    expect(input.value).toBe('test')

    const clearButton = screen.getByText('Clear Filter')
    fireEvent.click(clearButton)

    expect(input.value).toBe('')
  })

  it('should register component with context', () => {
    const { container } = render(
      <CompositionProvider>
        <Filter componentId="filter-1" />
      </CompositionProvider>
    )

    expect(container.querySelector('.border-blue-200')).toBeInTheDocument()
  })

  it('should display with correct styling', () => {
    const { container } = render(
      <CompositionProvider>
        <Filter componentId="filter-1" />
      </CompositionProvider>
    )

    const filterDiv = container.querySelector('.border-blue-200')
    expect(filterDiv).toHaveClass('flex', 'flex-col', 'gap-3', 'p-4', 'rounded-lg')
  })

  it('should handle multiple filter changes', () => {
    render(
      <CompositionProvider>
        <Filter componentId="filter-1" />
      </CompositionProvider>
    )

    const input = screen.getByPlaceholderText(
      'Search selected items...'
    ) as HTMLInputElement

    fireEvent.change(input, { target: { value: 'first' } })
    expect(input.value).toBe('first')

    fireEvent.change(input, { target: { value: 'second' } })
    expect(input.value).toBe('second')

    fireEvent.change(input, { target: { value: 'third' } })
    expect(input.value).toBe('third')
  })
})
