import { FolderSelector } from '../../components/composable/FolderSelector'
import { EmailList } from '../../components/composable/EmailList'
import { EmailPreview } from '../../components/composable/EmailPreview'
import { EmailSearch } from '../../components/composable/EmailSearch'
import { ContactsList } from '../../components/composable/ContactsList'
import { EmailSettings } from '../../components/composable/EmailSettings'
import { CompositionProvider } from '../../lib/composition-provider'

/**
 * EmailClient Example App
 *
 * Demonstrates a sophisticated 7-component email client architecture:
 * 1. FolderSelector: Choose email folder (Inbox, Sent, etc.)
 * 2. EmailList: Display emails in selected folder
 * 3. EmailPreview: Show selected email content
 * 4. EmailSearch: Search and filter emails
 * 5. ContactsList: Quick access to contacts
 * 6. EmailSettings: Configure client settings
 * 7. Plus integration with Summary for statistics
 *
 * This example shows:
 * - Complex multi-component coordination
 * - Sidebar and main content layout
 * - Multiple event sources and listeners
 * - Component hierarchy and nesting
 * - Advanced UI patterns (folders, search, preview)
 *
 * Event Flow:
 * FolderSelector → folder-selected → EmailList
 * EmailList → email-selected → EmailPreview
 * ContactsList → contact-selected → (Can trigger compose)
 * EmailSearch → search-updated/cleared → (Can filter EmailList)
 * EmailSettings → settings-changed → (All components respond)
 */
export function EmailClient() {
  return (
    <CompositionProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-white mb-2">Email Client</h1>
            <p className="text-gray-400">
              A composable email client demonstrating complex component coordination
            </p>
          </div>

          {/* Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar: Folders, Contacts, Settings */}
            <div className="lg:col-span-1 space-y-6">
              {/* Folders */}
              <FolderSelector
                componentId="folder-selector"
                label="Folders"
              />

              {/* Contacts */}
              <ContactsList
                componentId="contacts-list"
                label="Contacts"
              />

              {/* Settings */}
              <EmailSettings
                componentId="email-settings"
                label="Preferences"
              />
            </div>

            {/* Center Column: Search and Email List */}
            <div className="lg:col-span-1 space-y-6">
              {/* Search */}
              <EmailSearch
                componentId="email-search"
                label="Search"
              />

              {/* Email List */}
              <EmailList
                componentId="email-list"
                listenToComponent="folder-selector"
                label="Inbox"
              />
            </div>

            {/* Right Column: Email Preview */}
            <div className="lg:col-span-2">
              <EmailPreview
                componentId="email-preview"
                listenToComponent="email-list"
                label="Message"
              />
            </div>
          </div>

          {/* Architecture Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Event Flow */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Event Flow</h2>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start gap-3">
                  <span className="text-indigo-400 font-semibold min-w-fit">Folders:</span>
                  <span>Emit 'folder-selected' when user picks a folder</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-cyan-400 font-semibold min-w-fit">Email List:</span>
                  <span>Listen for 'folder-selected', emit 'email-selected'</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-emerald-400 font-semibold min-w-fit">Preview:</span>
                  <span>Listen for 'email-selected', display content</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-rose-400 font-semibold min-w-fit">Search:</span>
                  <span>Emit 'search-updated' when user searches</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-violet-400 font-semibold min-w-fit">Contacts:</span>
                  <span>Emit 'contact-selected' for quick access</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-amber-400 font-semibold min-w-fit">Settings:</span>
                  <span>Emit 'settings-changed' for preferences</span>
                </div>
              </div>
            </div>

            {/* Component Benefits */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Why This Works</h2>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-green-400 text-lg">✓</span>
                  <span>
                    <strong>Loose Coupling:</strong> Components don't know about each other
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 text-lg">✓</span>
                  <span>
                    <strong>Easy to Extend:</strong> Add folders, contacts, or features instantly
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 text-lg">✓</span>
                  <span>
                    <strong>Independent Updates:</strong> Each component manages its own state
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 text-lg">✓</span>
                  <span>
                    <strong>Real-time Sync:</strong> Changes in one component instantly propagate
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 text-lg">✓</span>
                  <span>
                    <strong>User Customizable:</strong> Enable/disable features via feature flags
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Feature Flags Example */}
          <div className="mt-8 bg-blue-900 border border-blue-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-3">Feature Flags in Action</h2>
            <p className="text-blue-200 text-sm mb-4">
              Different users could have different experiences with the same components:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-blue-800 rounded p-3">
                <h3 className="font-semibold text-white mb-2">Basic User</h3>
                <ul className="text-blue-200 space-y-1">
                  <li>✓ Folders</li>
                  <li>✓ Email List</li>
                  <li>✓ Preview</li>
                </ul>
              </div>
              <div className="bg-blue-800 rounded p-3">
                <h3 className="font-semibold text-white mb-2">Power User</h3>
                <ul className="text-blue-200 space-y-1">
                  <li>✓ Folders</li>
                  <li>✓ Email List</li>
                  <li>✓ Preview</li>
                  <li>✓ Search</li>
                  <li>✓ Contacts</li>
                </ul>
              </div>
              <div className="bg-blue-800 rounded p-3">
                <h3 className="font-semibold text-white mb-2">Enterprise</h3>
                <ul className="text-blue-200 space-y-1">
                  <li>✓ All features</li>
                  <li>✓ Custom folders</li>
                  <li>✓ Team contacts</li>
                  <li>✓ Advanced settings</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CompositionProvider>
  )
}
