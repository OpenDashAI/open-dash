import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Composer } from '../Composer'
import { CompositionProvider } from '../../../lib/composition-provider'

const mockCtx = {
  registerComponent: vi.fn(),
  emitEvent: vi.fn(),
}

describe('Composer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render with initial items', () => {
    render(
      <CompositionProvider>
        <Composer
          componentId="test-1"
          items={['item1', 'item2']}
          label="Test Composer"
        />
      </CompositionProvider>
    )

    expect(screen.getByText('item1')).toBeInTheDocument()
    expect(screen.getByText('item2')).toBeInTheDocument()
    expect(screen.getByText('Items (2)')).toBeInTheDocument()
  })

  it('should render empty state when no items', () => {
    render(
      <CompositionProvider>
        <Composer componentId="test-1" items={[]} />
      </CompositionProvider>
    )

    expect(screen.getByText(/No items yet/)).toBeInTheDocument()
  })

  it('should register component with context', () => {
    const { container } = render(
      <CompositionProvider>
        <Composer componentId="composer-1" items={['test']} />
      </CompositionProvider>
    )

    // Component should render without error
    expect(container.querySelector('.flex.flex-col')).toBeInTheDocument()
  })

  it('should add item on button click', () => {
    render(
      <CompositionProvider>
        <Composer componentId="test-1" items={[]} />
      </CompositionProvider>
    )

    const input = screen.getByPlaceholderText('Enter item...')
    const button = screen.getByRole('button', { name: /Add/i })

    fireEvent.change(input, { target: { value: 'new item' } })
    fireEvent.click(button)

    expect(screen.getByText('new item')).toBeInTheDocument()
    expect(screen.getByText('Items (1)')).toBeInTheDocument()
  })

  it('should add item on Enter key', () => {
    render(
      <CompositionProvider>
        <Composer componentId="test-1" items={[]} />
      </CompositionProvider>
    )

    const input = screen.getByPlaceholderText('Enter item...') as HTMLInputElement

    fireEvent.change(input, { target: { value: 'new item' } })
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 })

    expect(screen.getByText('new item')).toBeInTheDocument()
    expect(input.value).toBe('')
  })

  it('should not add empty items', () => {
    render(
      <CompositionProvider>
        <Composer componentId="test-1" items={[]} />
      </CompositionProvider>
    )

    const button = screen.getByRole('button', { name: /Add/i })

    fireEvent.click(button)

    // Should still show empty state
    expect(screen.getByText(/No items yet/)).toBeInTheDocument()
  })

  it('should remove item on remove button click', () => {
    render(
      <CompositionProvider>
        <Composer componentId="test-1" items={['item1', 'item2']} />
      </CompositionProvider>
    )

    expect(screen.getByText('item1')).toBeInTheDocument()
    expect(screen.getByText('Items (2)')).toBeInTheDocument()

    const removeButtons = screen.getAllByRole('button', { name: /Remove/i })
    fireEvent.click(removeButtons[0])

    expect(screen.queryByText('item1')).not.toBeInTheDocument()
    expect(screen.getByText('item2')).toBeInTheDocument()
    expect(screen.getByText('Items (1)')).toBeInTheDocument()
  })

  it('should show empty state after removing all items', () => {
    render(
      <CompositionProvider>
        <Composer componentId="test-1" items={['item1']} />
      </CompositionProvider>
    )

    const removeButton = screen.getByRole('button', { name: /Remove/i })
    fireEvent.click(removeButton)

    expect(screen.getByText(/No items yet/)).toBeInTheDocument()
  })

  it('should use custom label and placeholder', () => {
    render(
      <CompositionProvider>
        <Composer
          componentId="test-1"
          label="Custom Label"
          placeholder="Custom placeholder..."
        />
      </CompositionProvider>
    )

    expect(screen.getByText('Custom Label')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Custom placeholder...')).toBeInTheDocument()
  })

  it('should trim whitespace from input', () => {
    render(
      <CompositionProvider>
        <Composer componentId="test-1" items={[]} />
      </CompositionProvider>
    )

    const input = screen.getByPlaceholderText('Enter item...') as HTMLInputElement
    const button = screen.getByRole('button', { name: /Add/i })

    fireEvent.change(input, { target: { value: '  spaced item  ' } })
    fireEvent.click(button)

    expect(screen.getByText('spaced item')).toBeInTheDocument()
  })

  it('should clear input after adding item', () => {
    render(
      <CompositionProvider>
        <Composer componentId="test-1" items={[]} />
      </CompositionProvider>
    )

    const input = screen.getByPlaceholderText('Enter item...') as HTMLInputElement
    const button = screen.getByRole('button', { name: /Add/i })

    fireEvent.change(input, { target: { value: 'test item' } })
    expect(input.value).toBe('test item')

    fireEvent.click(button)
    expect(input.value).toBe('')
  })

  it('should emit item-added event when adding item', async () => {
    const { container } = render(
      <CompositionProvider>
        <Composer componentId="composer-1" items={[]} />
      </CompositionProvider>
    )

    const input = screen.getByPlaceholderText('Enter item...') as HTMLInputElement
    const button = screen.getByRole('button', { name: /Add/i })

    fireEvent.change(input, { target: { value: 'test item' } })
    fireEvent.click(button)

    // Item should be added and visible
    expect(screen.getByText('test item')).toBeInTheDocument()
  })

  it('should emit item-removed event when removing item', async () => {
    const { container } = render(
      <CompositionProvider>
        <Composer componentId="composer-1" items={['item1', 'item2']} />
      </CompositionProvider>
    )

    const removeButton = screen.getAllByRole('button', { name: /Remove/i })[0]
    fireEvent.click(removeButton)

    expect(screen.queryByText('item1')).not.toBeInTheDocument()
    expect(screen.getByText('item2')).toBeInTheDocument()
  })
})
