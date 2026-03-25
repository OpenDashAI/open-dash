import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmailClient } from '../EmailClient'

describe('EmailClient Example App', () => {
  it('should render with title and description', () => {
    render(<EmailClient />)

    expect(screen.getByText('Email Client')).toBeInTheDocument()
    expect(
      screen.getByText(/A composable email client demonstrating complex component coordination/)
    ).toBeInTheDocument()
  })

  it('should display all 7 email components', () => {
    render(<EmailClient />)

    expect(screen.getByText('Folders')).toBeInTheDocument()
    expect(screen.getByText('Contacts')).toBeInTheDocument()
    expect(screen.getByText('Preferences')).toBeInTheDocument()
    // Search appears multiple times
    expect(screen.getAllByText(/Search/).length).toBeGreaterThan(0)
    // Inbox and Message appear multiple times
    expect(screen.getAllByText('Inbox').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Message').length).toBeGreaterThan(0)
  })

  it('should render architecture sections', () => {
    render(<EmailClient />)

    expect(screen.getByText('Event Flow')).toBeInTheDocument()
    expect(screen.getByText('Why This Works')).toBeInTheDocument()
  })

  it('should show event flow explanations', () => {
    render(<EmailClient />)

    expect(screen.getByText(/Emit.*folder-selected/)).toBeInTheDocument()
    expect(screen.getByText(/Listen for.*folder-selected/)).toBeInTheDocument()
  })

  it('should display component benefits', () => {
    render(<EmailClient />)

    expect(screen.getByText(/Loose Coupling/)).toBeInTheDocument()
    expect(screen.getByText(/Easy to Extend/)).toBeInTheDocument()
    expect(screen.getByText(/Independent Updates/)).toBeInTheDocument()
    expect(screen.getByText(/Real-time Sync/)).toBeInTheDocument()
  })

  it('should show feature flags examples', () => {
    render(<EmailClient />)

    expect(screen.getByText('Feature Flags in Action')).toBeInTheDocument()
    expect(screen.getByText('Basic User')).toBeInTheDocument()
    expect(screen.getByText('Power User')).toBeInTheDocument()
    expect(screen.getByText('Enterprise')).toBeInTheDocument()
  })

  it('should display all sample folders', () => {
    render(<EmailClient />)

    expect(screen.getAllByText('Inbox').length).toBeGreaterThan(0)
    expect(screen.getByText('Sent')).toBeInTheDocument()
    expect(screen.getByText('Drafts')).toBeInTheDocument()
    expect(screen.getByText('Archive')).toBeInTheDocument()
    expect(screen.getByText('Spam')).toBeInTheDocument()
  })

  it('should display all sample contacts', () => {
    render(<EmailClient />)

    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
    expect(screen.getByText('bob@example.com')).toBeInTheDocument()
    expect(screen.getByText('charlie@example.com')).toBeInTheDocument()
  })

  it('should have search functionality', () => {
    render(<EmailClient />)

    expect(screen.getByPlaceholderText('Search emails...')).toBeInTheDocument()
  })

  it('should display settings options', () => {
    render(<EmailClient />)

    expect(screen.getByText('Auto Refresh')).toBeInTheDocument()
    expect(screen.getByText('Preview Pane')).toBeInTheDocument()
    expect(screen.getByText('Emails Per Page')).toBeInTheDocument()
  })

  it('should have proper grid layout', () => {
    const { container } = render(<EmailClient />)

    const gridElement = container.querySelector('.grid')
    expect(gridElement).toBeInTheDocument()
    expect(gridElement).toHaveClass('lg:grid-cols-4')
  })

  it('should show component color coding', () => {
    const { container } = render(<EmailClient />)

    expect(container.querySelector('.border-indigo-200')).toBeInTheDocument() // FolderSelector
    expect(container.querySelector('.border-cyan-200')).toBeInTheDocument() // EmailList
    expect(container.querySelector('.border-emerald-200')).toBeInTheDocument() // EmailPreview
    expect(container.querySelector('.border-rose-200')).toBeInTheDocument() // EmailSearch
    expect(container.querySelector('.border-violet-200')).toBeInTheDocument() // ContactsList
    expect(container.querySelector('.border-amber-200')).toBeInTheDocument() // EmailSettings
  })

  it('should display messaging about loose coupling', () => {
    render(<EmailClient />)

    expect(
      screen.getByText(/Components don't know about each other/)
    ).toBeInTheDocument()
  })

  it('should explain the component pipeline', () => {
    render(<EmailClient />)

    const eventFlowSection = screen.getByText('Event Flow').parentElement
    expect(eventFlowSection).toBeInTheDocument()
  })

  it('should display use case examples', () => {
    render(<EmailClient />)

    expect(screen.getByText('Basic User')).toBeInTheDocument()
    expect(screen.getByText('Power User')).toBeInTheDocument()
    expect(screen.getByText('Enterprise')).toBeInTheDocument()
  })

  it('should have all folders selectable', () => {
    render(<EmailClient />)

    const folders = ['Sent', 'Drafts', 'Archive', 'Spam']
    folders.forEach(folder => {
      expect(screen.getByText(folder)).toBeInTheDocument()
    })
    // Inbox appears multiple times, so use getAllByText
    expect(screen.getAllByText('Inbox').length).toBeGreaterThan(0)
  })
})
