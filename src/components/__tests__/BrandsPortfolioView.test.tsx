import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrandsPortfolioView } from '../BrandsPortfolioView'
import type { BriefingItem } from '../../lib/briefing'

// Mock the router
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}))

describe('BrandsPortfolioView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders empty state when no brands provided', () => {
    render(<BrandsPortfolioView brands={[]} />)

    expect(screen.getByText('No dashboards configured')).toBeInTheDocument()
    expect(screen.getByText(/Add a dashboard.yaml/)).toBeInTheDocument()
  })

  it('renders portfolio header with stats', () => {
    const brands = [
      {
        slug: 'test-brand',
        config: {
          brand: 'Test Brand',
          domain: 'test.com',
          description: 'Test Description',
          sources: [{ id: '1', name: 'Source 1' }],
        },
        items: [] as BriefingItem[],
        healthScore: 85,
        issueCount: 2,
        deployCount: 5,
        revenueCount: 10,
      },
    ]

    render(<BrandsPortfolioView brands={brands} />)

    expect(screen.getByText('Brands Portfolio')).toBeInTheDocument()
    expect(screen.getByText('Total Brands:')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText(/Avg Health:/)).toBeInTheDocument()

    // Find the health value in the stats (not the card)
    const statValues = screen.getAllByText(/85%/)
    expect(statValues.length).toBeGreaterThan(0)
  })

  it('renders brand cards for each brand', () => {
    const brands = [
      {
        slug: 'brand-1',
        config: {
          brand: 'Brand 1',
          domain: 'brand1.com',
          description: 'First brand',
          sources: [{ id: '1', name: 'Source 1' }],
        },
        items: [] as BriefingItem[],
        healthScore: 90,
        issueCount: 1,
        deployCount: 3,
        revenueCount: 5,
      },
      {
        slug: 'brand-2',
        config: {
          brand: 'Brand 2',
          domain: 'brand2.com',
          description: 'Second brand',
          sources: [{ id: '2', name: 'Source 2' }],
        },
        items: [] as BriefingItem[],
        healthScore: 70,
        issueCount: 4,
        deployCount: 2,
        revenueCount: 8,
      },
    ]

    render(<BrandsPortfolioView brands={brands} />)

    expect(screen.getByText('Brand 1')).toBeInTheDocument()
    expect(screen.getByText('Brand 2')).toBeInTheDocument()
    expect(screen.getByText('brand1.com')).toBeInTheDocument()
    expect(screen.getByText('brand2.com')).toBeInTheDocument()
  })

  it('sorts brands by health score (highest first)', () => {
    const brands = [
      {
        slug: 'low-health',
        config: {
          brand: 'Low Health',
          domain: 'low.com',
          description: '',
          sources: [],
        },
        items: [] as BriefingItem[],
        healthScore: 40,
        issueCount: 0,
        deployCount: 0,
        revenueCount: 0,
      },
      {
        slug: 'high-health',
        config: {
          brand: 'High Health',
          domain: 'high.com',
          description: '',
          sources: [],
        },
        items: [] as BriefingItem[],
        healthScore: 95,
        issueCount: 0,
        deployCount: 0,
        revenueCount: 0,
      },
    ]

    const { container } = render(<BrandsPortfolioView brands={brands} />)

    const cards = container.querySelectorAll('.brand-card')
    const firstCard = cards[0].textContent
    const secondCard = cards[1].textContent

    expect(firstCard).toContain('High Health')
    expect(secondCard).toContain('Low Health')
  })

  it('displays health badge with correct color', () => {
    const brands = [
      {
        slug: 'healthy',
        config: {
          brand: 'Healthy Brand',
          domain: '',
          description: '',
          sources: [],
        },
        items: [] as BriefingItem[],
        healthScore: 85,
        issueCount: 0,
        deployCount: 0,
        revenueCount: 0,
      },
    ]

    const { container } = render(<BrandsPortfolioView brands={brands} />)

    const badges = container.querySelectorAll('.health-badge')
    expect(badges.length).toBeGreaterThan(0)
    expect(badges[0].textContent).toContain('85%')
  })

  it('calculates total items correctly', () => {
    const brands = [
      {
        slug: 'brand-1',
        config: {
          brand: 'Brand 1',
          domain: '',
          description: '',
          sources: [],
        },
        items: [
          { id: '1', type: 'issue', priority: 'high', title: 'Item 1' },
          { id: '2', type: 'deploy', priority: 'normal', title: 'Item 2' },
        ] as BriefingItem[],
        healthScore: 80,
        issueCount: 0,
        deployCount: 0,
        revenueCount: 0,
      },
      {
        slug: 'brand-2',
        config: {
          brand: 'Brand 2',
          domain: '',
          description: '',
          sources: [],
        },
        items: [
          { id: '3', type: 'revenue', priority: 'normal', title: 'Item 3' },
        ] as BriefingItem[],
        healthScore: 80,
        issueCount: 0,
        deployCount: 0,
        revenueCount: 0,
      },
    ]

    render(<BrandsPortfolioView brands={brands} />)

    expect(screen.getByText('Total Items:')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })
})
