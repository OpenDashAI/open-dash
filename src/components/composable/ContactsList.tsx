import { useEffect, useState } from 'react'
import { useCompositionContext } from '../../hooks/useCompositionContext'

export interface ContactsListProps {
  /** Unique ID for this component instance */
  componentId: string
  /** Label */
  label?: string
}

const SAMPLE_CONTACTS = [
  'alice@example.com',
  'bob@example.com',
  'charlie@example.com',
  'david@example.com',
  'eve@example.com',
]

/**
 * ContactsList Component - Manage and display contacts.
 *
 * This component demonstrates:
 * - Managing a list of contacts
 * - Emitting contact-selected events
 * - Quick access to frequently used addresses
 * - Sidebar-style component
 *
 * Other components can listen for contact selection.
 */
export function ContactsList({
  componentId,
  label = 'Contacts',
}: ContactsListProps) {
  const ctx = useCompositionContext()
  const [contacts] = useState(SAMPLE_CONTACTS)
  const [selectedContact, setSelectedContact] = useState<string | null>(null)

  // Register this component with the context
  useEffect(() => {
    ctx.registerComponent(componentId, {
      id: componentId,
      type: 'contactslist',
      enabled: true,
      state: { selectedContact, contactCount: contacts.length },
      props: { label },
    })
  }, [componentId, selectedContact, contacts.length, label, ctx])

  /**
   * Handle contact selection
   */
  const handleSelectContact = (contact: string) => {
    setSelectedContact(contact)
    ctx.emitEvent(componentId, 'contact-selected', {
      contact,
      timestamp: new Date().toISOString(),
    })
  }

  return (
    <div className="flex flex-col gap-3 p-4 border border-violet-200 rounded-lg bg-white h-fit">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-gray-700">{label}</div>
        <div className="text-xs text-gray-500">{contacts.length}</div>
      </div>

      {/* Contact List */}
      <div className="space-y-1">
        {contacts.map(contact => (
          <button
            key={contact}
            onClick={() => handleSelectContact(contact)}
            className={`w-full text-left px-3 py-2 rounded-md transition-colors text-xs truncate ${
              selectedContact === contact
                ? 'bg-violet-100 text-violet-700 border border-violet-300'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className="truncate">{contact}</div>
            <div className="text-2xs text-gray-500">
              {contact.split('@')[0]}
            </div>
          </button>
        ))}
      </div>

      {/* Add Contact Button */}
      <button className="mt-2 pt-2 border-t border-gray-200 w-full px-3 py-2 text-xs bg-violet-100 text-violet-700 rounded hover:bg-violet-200 transition-colors font-medium">
        + Add Contact
      </button>
    </div>
  )
}
