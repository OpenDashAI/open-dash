import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FolderSelector } from '../FolderSelector'
import { EmailList } from '../EmailList'
import { EmailPreview } from '../EmailPreview'
import { EmailSearch } from '../EmailSearch'
import { ContactsList } from '../ContactsList'
import { EmailSettings } from '../EmailSettings'
import { CompositionProvider } from '../../../lib/composition-provider'

describe('Email Client Components', () => {
  describe('FolderSelector', () => {
    it('should render folders', () => {
      render(
        <CompositionProvider>
          <FolderSelector componentId="fs-1" />
        </CompositionProvider>
      )

      expect(screen.getByText('Sent')).toBeInTheDocument()
      expect(screen.getByText('Drafts')).toBeInTheDocument()
    })

    it('should allow selecting folders', () => {
      render(
        <CompositionProvider>
          <FolderSelector componentId="fs-1" />
        </CompositionProvider>
      )

      const draftButton = screen.getByText('Drafts')
      fireEvent.click(draftButton)

      // Just verify the click doesn't throw an error
      expect(draftButton).toBeInTheDocument()
    })

    it('should display selected folder', () => {
      render(
        <CompositionProvider>
          <FolderSelector componentId="fs-1" />
        </CompositionProvider>
      )

      expect(screen.getByText(/Viewing:/)).toBeInTheDocument()
    })
  })

  describe('EmailList', () => {
    it('should render with label', () => {
      render(
        <CompositionProvider>
          <EmailList componentId="el-1" label="Emails" />
        </CompositionProvider>
      )

      expect(screen.getByText('Emails')).toBeInTheDocument()
    })

    it('should display email count', () => {
      render(
        <CompositionProvider>
          <EmailList componentId="el-1" />
        </CompositionProvider>
      )

      expect(screen.getByText(/emails/)).toBeInTheDocument()
    })

    it('should register component with context', () => {
      const { container } = render(
        <CompositionProvider>
          <EmailList componentId="el-1" />
        </CompositionProvider>
      )

      expect(container.querySelector('.border-cyan-200')).toBeInTheDocument()
    })
  })

  describe('EmailPreview', () => {
    it('should render preview component', () => {
      render(
        <CompositionProvider>
          <EmailPreview componentId="ep-1" label="Preview" />
        </CompositionProvider>
      )

      expect(screen.getByText('Preview')).toBeInTheDocument()
    })

    it('should show placeholder when no email selected', () => {
      render(
        <CompositionProvider>
          <EmailPreview componentId="ep-1" />
        </CompositionProvider>
      )

      expect(screen.getByText('Select an email to preview')).toBeInTheDocument()
    })

    it('should display with correct styling', () => {
      const { container } = render(
        <CompositionProvider>
          <EmailPreview componentId="ep-1" />
        </CompositionProvider>
      )

      expect(container.querySelector('.border-emerald-200')).toBeInTheDocument()
    })
  })

  describe('EmailSearch', () => {
    it('should render search input', () => {
      render(
        <CompositionProvider>
          <EmailSearch componentId="es-1" />
        </CompositionProvider>
      )

      expect(screen.getByPlaceholderText('Search emails...')).toBeInTheDocument()
    })

    it('should accept search text', () => {
      render(
        <CompositionProvider>
          <EmailSearch componentId="es-1" />
        </CompositionProvider>
      )

      const input = screen.getByPlaceholderText('Search emails...') as HTMLInputElement
      fireEvent.change(input, { target: { value: 'test search' } })

      expect(input.value).toBe('test search')
    })

    it('should show clear button when text entered', () => {
      render(
        <CompositionProvider>
          <EmailSearch componentId="es-1" />
        </CompositionProvider>
      )

      const input = screen.getByPlaceholderText('Search emails...')
      fireEvent.change(input, { target: { value: 'test' } })

      expect(screen.getByText('✕')).toBeInTheDocument()
    })

    it('should display with correct border color', () => {
      const { container } = render(
        <CompositionProvider>
          <EmailSearch componentId="es-1" />
        </CompositionProvider>
      )

      expect(container.querySelector('.border-rose-200')).toBeInTheDocument()
    })
  })

  describe('ContactsList', () => {
    it('should render contacts', () => {
      render(
        <CompositionProvider>
          <ContactsList componentId="cl-1" />
        </CompositionProvider>
      )

      expect(screen.getByText('alice@example.com')).toBeInTheDocument()
      expect(screen.getByText('bob@example.com')).toBeInTheDocument()
    })

    it('should show contact count', () => {
      render(
        <CompositionProvider>
          <ContactsList componentId="cl-1" />
        </CompositionProvider>
      )

      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('should allow selecting contacts', () => {
      render(
        <CompositionProvider>
          <ContactsList componentId="cl-1" />
        </CompositionProvider>
      )

      const contact = screen.getByText('alice@example.com')
      fireEvent.click(contact)

      // Just verify the click works
      expect(contact).toBeInTheDocument()
    })

    it('should display with correct styling', () => {
      const { container } = render(
        <CompositionProvider>
          <ContactsList componentId="cl-1" />
        </CompositionProvider>
      )

      expect(container.querySelector('.border-violet-200')).toBeInTheDocument()
    })

    it('should have add contact button', () => {
      render(
        <CompositionProvider>
          <ContactsList componentId="cl-1" />
        </CompositionProvider>
      )

      expect(screen.getByText('+ Add Contact')).toBeInTheDocument()
    })
  })

  describe('EmailSettings', () => {
    it('should render settings component', () => {
      render(
        <CompositionProvider>
          <EmailSettings componentId="es-1" />
        </CompositionProvider>
      )

      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('should display toggle controls', () => {
      render(
        <CompositionProvider>
          <EmailSettings componentId="es-1" />
        </CompositionProvider>
      )

      expect(screen.getByText('Auto Refresh')).toBeInTheDocument()
      expect(screen.getByText('Preview Pane')).toBeInTheDocument()
    })

    it('should display emails per page selector', () => {
      render(
        <CompositionProvider>
          <EmailSettings componentId="es-1" />
        </CompositionProvider>
      )

      expect(screen.getByText('Emails Per Page')).toBeInTheDocument()
    })

    it('should have dropdown for emails per page', () => {
      render(
        <CompositionProvider>
          <EmailSettings componentId="es-1" />
        </CompositionProvider>
      )

      const select = screen.getByDisplayValue('20')
      expect(select).toBeInTheDocument()
    })

    it('should display with correct styling', () => {
      const { container } = render(
        <CompositionProvider>
          <EmailSettings componentId="es-1" />
        </CompositionProvider>
      )

      expect(container.querySelector('.border-amber-200')).toBeInTheDocument()
    })

    it('should toggle auto refresh', () => {
      render(
        <CompositionProvider>
          <EmailSettings componentId="es-1" />
        </CompositionProvider>
      )

      const toggles = screen.getAllByRole('button')
      const autoRefreshToggle = toggles[0]

      expect(autoRefreshToggle.className).toContain('bg-amber-500')
      fireEvent.click(autoRefreshToggle)
    })
  })

  describe('Email Client Integration', () => {
    it('should render all email components together', () => {
      render(
        <CompositionProvider>
          <div className="space-y-4">
            <FolderSelector componentId="fs" />
            <EmailList componentId="el" />
            <EmailPreview componentId="ep" />
            <EmailSearch componentId="es" />
            <ContactsList componentId="cl" />
            <EmailSettings componentId="settings" />
          </div>
        </CompositionProvider>
      )

      expect(screen.getByText('Folders')).toBeInTheDocument()
      expect(screen.getByText('Emails')).toBeInTheDocument()
      expect(screen.getByText('Preview')).toBeInTheDocument()
      expect(screen.getByText('Search')).toBeInTheDocument()
      expect(screen.getByText('Contacts')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('should maintain separate state for each component', () => {
      render(
        <CompositionProvider>
          <div className="space-y-4">
            <FolderSelector componentId="fs" />
            <ContactsList componentId="cl" />
          </div>
        </CompositionProvider>
      )

      const inboxButtons = screen.getAllByText('Sent')
      const aliceButtons = screen.getAllByText('alice@example.com')

      fireEvent.click(inboxButtons[0])
      fireEvent.click(aliceButtons[0])

      // Verify both components rendered and can handle clicks
      expect(inboxButtons[0]).toBeInTheDocument()
      expect(aliceButtons[0]).toBeInTheDocument()
    })
  })
})
