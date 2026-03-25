import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Dashboard } from '../Dashboard'

describe('Dashboard Example App', () => {
  it('should render with title and description', () => {
    render(<Dashboard />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(
      screen.getByText(/Select data sources, filter results, and view aggregate statistics/)
    ).toBeInTheDocument()
  })

  it('should render all 5 components', () => {
    render(<Dashboard />)

    expect(screen.getByText('Available Data Sources')).toBeInTheDocument()
    expect(screen.getByText('Search Results')).toBeInTheDocument()
    expect(screen.getByText('Results')).toBeInTheDocument()
    expect(screen.getByText('Statistics')).toBeInTheDocument()
  })

  it('should display all sample data items', () => {
    render(<Dashboard />)

    expect(screen.getByText('Google Analytics Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Stripe Revenue Report')).toBeInTheDocument()
    expect(screen.getByText('GitHub Activity Feed')).toBeInTheDocument()
    expect(screen.getByText('CloudFlare Analytics')).toBeInTheDocument()
  })

  it('should show info section with instructions', () => {
    render(<Dashboard />)

    expect(screen.getByText('How this dashboard works:')).toBeInTheDocument()
    expect(screen.getByText(/Check boxes to select data sources/)).toBeInTheDocument()
    expect(screen.getByText(/Type to search selected items/)).toBeInTheDocument()
    expect(screen.getByText(/Results update automatically/)).toBeInTheDocument()
  })

  it('should show component pipeline explanation', () => {
    render(<Dashboard />)

    expect(screen.getByText('Component Pipeline')).toBeInTheDocument()
    expect(screen.getByText(/selection-changed/)).toBeInTheDocument()
    expect(screen.getByText(/filter-updated/)).toBeInTheDocument()
  })

  it('should show architecture explanation', () => {
    render(<Dashboard />)

    expect(screen.getByText('Why This Architecture?')).toBeInTheDocument()
    expect(screen.getByText(/Loosely coupled/)).toBeInTheDocument()
    expect(screen.getByText(/Easy to extend/)).toBeInTheDocument()
  })

  it('should allow selecting data items', () => {
    render(<Dashboard />)

    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0])

    expect(checkboxes[0]).toBeChecked()
  })

  it('should display selection count', () => {
    render(<Dashboard />)

    expect(screen.getByText(/0 of 10 selected/)).toBeInTheDocument()

    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0])

    expect(screen.getByText(/1 of 10 selected/)).toBeInTheDocument()
  })

  it('should have filter input', () => {
    render(<Dashboard />)

    const filterInputs = screen.getAllByPlaceholderText('Search selected items...')
    expect(filterInputs.length).toBeGreaterThan(0)
  })

  it('should have proper layout structure', () => {
    const { container } = render(<Dashboard />)

    expect(container.querySelector('.grid')).toBeInTheDocument()
    expect(container.querySelectorAll('.border-purple-200').length).toBeGreaterThan(0) // DataSelector
    expect(container.querySelectorAll('.border-blue-200').length).toBeGreaterThan(0) // Filter
    expect(container.querySelectorAll('.border-green-200').length).toBeGreaterThan(0) // Display
    expect(container.querySelectorAll('.border-orange-200').length).toBeGreaterThan(0) // Summary
  })

  it('should demonstrate event-driven architecture', () => {
    render(<Dashboard />)

    // Initially no items selected
    expect(screen.getByText('No items selected')).toBeInTheDocument()

    // Select an item
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0])

    // Selection updates
    expect(screen.getByText(/1 of 10 selected/)).toBeInTheDocument()
  })

  it('should show multiple selectable items', () => {
    render(<Dashboard />)

    const items = [
      'Google Analytics Dashboard',
      'Stripe Revenue Report',
      'GitHub Activity Feed',
      'CloudFlare Analytics',
      'Email Campaign Metrics',
    ]

    items.forEach(item => {
      expect(screen.getByText(item)).toBeInTheDocument()
    })
  })

  it('should have clear instructions for users', () => {
    render(<Dashboard />)

    const instructions = [
      'Select:',
      'Filter:',
      'Display:',
      'Summarize:',
      'Coordinate:',
    ]

    instructions.forEach(instruction => {
      expect(screen.getByText(instruction)).toBeInTheDocument()
    })
  })

  it('should display architecture benefits', () => {
    render(<Dashboard />)

    expect(screen.getByText(/Loosely coupled/)).toBeInTheDocument()
    expect(screen.getByText(/Easy to extend/)).toBeInTheDocument()
    expect(screen.getByText(/Reusable/)).toBeInTheDocument()
    expect(screen.getByText(/Testable/)).toBeInTheDocument()
  })
})
