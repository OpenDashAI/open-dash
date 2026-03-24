import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrandFocusView } from '../BrandFocusView'
import type { BriefingItem } from '../../lib/briefing'
import type { DataSourceInfo } from '../../server/datasources'

// Mock the router
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}))

describe('BrandFocusView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders config not found when config is null', () => {
    render(
      <BrandFocusView
        config={null}
        items={[]}
        sources={[]}
        metrics={{
          totalItems: 0,
          issues: 0,
          deploys: 0,
          revenue: 0,
          highPriority: 0,
          alerts: 0,
        }}
      />
    )

    expect(screen.getByText('Brand configuration not found')).toBeInTheDocument()
  })

  it('renders brand header with config details', () => {
    const config = {
      brand: 'Test Brand',
      domain: 'test.com',
      description: 'Test Description',
      sources: [{ id: '1', name: 'Source 1' }],
    }

    render(
      <BrandFocusView
        config={config}
        items={[]}
        sources={[]}
        metrics={{
          totalItems: 5,
          issues: 2,
          deploys: 1,
          revenue: 3,
          highPriority: 1,
          alerts: 0,
        }}
      />
    )

    expect(screen.getByText('Test Brand')).toBeInTheDocument()
    expect(screen.getByText('test.com')).toBeInTheDocument()

    // Look for the back button which contains "← Brands"
    const backButton = screen.getByRole('button', { name: /Brands/ })
    expect(backButton).toBeInTheDocument()
  })

  it('renders high priority items first', () => {
    const config = {
      brand: 'Test Brand',
      domain: 'test.com',
      description: '',
      sources: [],
    }

    const items: BriefingItem[] = [
      { id: '1', type: 'issue', priority: 'high', title: 'High Priority Item' },
      { id: '2', type: 'deploy', priority: 'normal', title: 'Normal Priority Item' },
    ]

    render(
      <BrandFocusView
        config={config}
        items={items}
        sources={[]}
        metrics={{
          totalItems: 2,
          issues: 1,
          deploys: 1,
          revenue: 0,
          highPriority: 1,
          alerts: 0,
        }}
      />
    )

    expect(screen.getByText('⚠️ High Priority')).toBeInTheDocument()
  })

  it('renders sidebar metrics', () => {
    const config = {
      brand: 'Test Brand',
      domain: 'test.com',
      description: '',
      sources: [],
    }

    render(
      <BrandFocusView
        config={config}
        items={[]}
        sources={[]}
        metrics={{
          totalItems: 5,
          issues: 2,
          deploys: 3,
          revenue: 4,
          highPriority: 1,
          alerts: 0,
        }}
      />
    )

    expect(screen.getByText('Metrics')).toBeInTheDocument()
    expect(screen.getByText('Issues')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('Deploys')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('renders data sources with connection status', () => {
    const config = {
      brand: 'Test Brand',
      domain: 'test.com',
      description: '',
      sources: [{ id: '1', name: 'Source 1' }],
    }

    const sources: DataSourceInfo[] = [
      {
        id: '1',
        name: 'Source 1',
        status: { connected: true },
      },
      {
        id: '2',
        name: 'Source 2',
        status: { connected: false },
      },
    ]

    render(
      <BrandFocusView
        config={config}
        items={[]}
        sources={sources}
        metrics={{
          totalItems: 0,
          issues: 0,
          deploys: 0,
          revenue: 0,
          highPriority: 0,
          alerts: 0,
        }}
      />
    )

    expect(screen.getByText('Data Sources')).toBeInTheDocument()
    expect(screen.getByText('Source 1')).toBeInTheDocument()
    expect(screen.getByText('Source 2')).toBeInTheDocument()
    expect(screen.getByText('Connected')).toBeInTheDocument()
    expect(screen.getByText('Offline')).toBeInTheDocument()
  })

  it('renders empty state when no items', () => {
    const config = {
      brand: 'Test Brand',
      domain: 'test.com',
      description: '',
      sources: [],
    }

    render(
      <BrandFocusView
        config={config}
        items={[]}
        sources={[]}
        metrics={{
          totalItems: 0,
          issues: 0,
          deploys: 0,
          revenue: 0,
          highPriority: 0,
          alerts: 0,
        }}
      />
    )

    expect(screen.getByText('No items to display')).toBeInTheDocument()
  })

  it('groups items by type', () => {
    const config = {
      brand: 'Test Brand',
      domain: 'test.com',
      description: '',
      sources: [],
    }

    const items: BriefingItem[] = [
      { id: '1', type: 'issue', priority: 'normal', title: 'Issue 1' },
      { id: '2', type: 'deploy', priority: 'normal', title: 'Deploy 1' },
      { id: '3', type: 'issue', priority: 'normal', title: 'Issue 2' },
    ]

    render(
      <BrandFocusView
        config={config}
        items={items}
        sources={[]}
        metrics={{
          totalItems: 3,
          issues: 2,
          deploys: 1,
          revenue: 0,
          highPriority: 0,
          alerts: 0,
        }}
      />
    )

    expect(screen.getByText('issue')).toBeInTheDocument()
    expect(screen.getByText('deploy')).toBeInTheDocument()
  })

  it('truncates items list to 5 per group', () => {
    const config = {
      brand: 'Test Brand',
      domain: 'test.com',
      description: '',
      sources: [],
    }

    const items: BriefingItem[] = Array.from({ length: 10 }, (_, i) => ({
      id: `${i}`,
      type: 'issue',
      priority: 'normal',
      title: `Issue ${i}`,
    }))

    render(
      <BrandFocusView
        config={config}
        items={items}
        sources={[]}
        metrics={{
          totalItems: 10,
          issues: 10,
          deploys: 0,
          revenue: 0,
          highPriority: 0,
          alerts: 0,
        }}
      />
    )

    expect(screen.getByText(/\+5 more issue/)).toBeInTheDocument()
  })
})
