import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DataSelector } from '../DataSelector'
import { CompositionProvider } from '../../../lib/composition-provider'

describe('DataSelector Component', () => {
  const defaultItems = ['Item A', 'Item B', 'Item C']

  it('should render with initial items', () => {
    render(
      <CompositionProvider>
        <DataSelector componentId="selector-1" items={defaultItems} />
      </CompositionProvider>
    )

    expect(screen.getByText('Item A')).toBeInTheDocument()
    expect(screen.getByText('Item B')).toBeInTheDocument()
    expect(screen.getByText('Item C')).toBeInTheDocument()
  })

  it('should display the label', () => {
    render(
      <CompositionProvider>
        <DataSelector
          componentId="selector-1"
          items={defaultItems}
          label="Select Data"
        />
      </CompositionProvider>
    )

    expect(screen.getByText('Select Data')).toBeInTheDocument()
  })

  it('should show selection count', () => {
    render(
      <CompositionProvider>
        <DataSelector componentId="selector-1" items={defaultItems} />
      </CompositionProvider>
    )

    expect(screen.getByText(/0 of 3 selected/)).toBeInTheDocument()
  })

  it('should allow selecting items', () => {
    render(
      <CompositionProvider>
        <DataSelector componentId="selector-1" items={defaultItems} />
      </CompositionProvider>
    )

    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0])

    expect(checkboxes[0]).toBeChecked()
    expect(screen.getByText(/1 of 3 selected/)).toBeInTheDocument()
  })

  it('should allow deselecting items', () => {
    render(
      <CompositionProvider>
        <DataSelector componentId="selector-1" items={defaultItems} />
      </CompositionProvider>
    )

    const checkboxes = screen.getAllByRole('checkbox')

    // Select
    fireEvent.click(checkboxes[0])
    expect(checkboxes[0]).toBeChecked()

    // Deselect
    fireEvent.click(checkboxes[0])
    expect(checkboxes[0]).not.toBeChecked()
    expect(screen.getByText(/0 of 3 selected/)).toBeInTheDocument()
  })

  it('should show clear selection button when items are selected', () => {
    render(
      <CompositionProvider>
        <DataSelector componentId="selector-1" items={defaultItems} />
      </CompositionProvider>
    )

    expect(screen.queryByText('Clear Selection')).not.toBeInTheDocument()

    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0])

    expect(screen.getByText('Clear Selection')).toBeInTheDocument()
  })

  it('should clear all selections when clear button clicked', () => {
    render(
      <CompositionProvider>
        <DataSelector componentId="selector-1" items={defaultItems} />
      </CompositionProvider>
    )

    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0])
    fireEvent.click(checkboxes[1])

    expect(screen.getByText(/2 of 3 selected/)).toBeInTheDocument()

    const clearButton = screen.getByText('Clear Selection')
    fireEvent.click(clearButton)

    expect(screen.getByText(/0 of 3 selected/)).toBeInTheDocument()
    expect(checkboxes[0]).not.toBeChecked()
    expect(checkboxes[1]).not.toBeChecked()
  })

  it('should render with no items', () => {
    render(
      <CompositionProvider>
        <DataSelector componentId="selector-1" items={[]} />
      </CompositionProvider>
    )

    expect(screen.getByText('No items available')).toBeInTheDocument()
    expect(screen.getByText(/0 of 0 selected/)).toBeInTheDocument()
  })

  it('should allow multiple selections', () => {
    render(
      <CompositionProvider>
        <DataSelector componentId="selector-1" items={defaultItems} />
      </CompositionProvider>
    )

    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0])
    fireEvent.click(checkboxes[1])
    fireEvent.click(checkboxes[2])

    expect(screen.getByText(/3 of 3 selected/)).toBeInTheDocument()
    checkboxes.forEach(checkbox => {
      expect(checkbox).toBeChecked()
    })
  })
})
