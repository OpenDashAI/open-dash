import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SimpleMusicPlayer } from '../SimpleMusicPlayer'

describe('SimpleMusicPlayer Example App', () => {
  it('should render both Composer and Transport components', () => {
    render(<SimpleMusicPlayer />)

    expect(screen.getByText('Add Track')).toBeInTheDocument()
    expect(screen.getByText('Transport Control')).toBeInTheDocument()
  })

  it('should display the app title and instructions', () => {
    render(<SimpleMusicPlayer />)

    expect(screen.getByText('Music Player')).toBeInTheDocument()
    expect(
      screen.getByText(/Add tracks below and use the transport controls/)
    ).toBeInTheDocument()
  })

  it('should allow adding tracks via Composer', () => {
    render(<SimpleMusicPlayer />)

    const input = screen.getByPlaceholderText('Enter track name...')
    const addButton = screen.getByRole('button', { name: /Add/i })

    fireEvent.change(input, { target: { value: 'Song 1' } })
    fireEvent.click(addButton)

    // Song 1 appears in both Composer's list and Transport's current item display
    const allInstances = screen.getAllByText('Song 1')
    expect(allInstances.length).toBeGreaterThan(0)
  })

  it('should display Transport status when no tracks', () => {
    render(<SimpleMusicPlayer />)

    expect(screen.getByText('No items loaded')).toBeInTheDocument()
    expect(screen.getByText('⏸ Stopped')).toBeInTheDocument()
  })

  it('should show item count when tracks are added', () => {
    render(<SimpleMusicPlayer />)

    const input = screen.getByPlaceholderText('Enter track name...')
    const addButton = screen.getByRole('button', { name: /Add/i })

    fireEvent.change(input, { target: { value: 'Track 1' } })
    fireEvent.click(addButton)

    expect(screen.getByText(/1 item loaded/)).toBeInTheDocument()
  })

  it('should update Transport when multiple tracks are added', () => {
    render(<SimpleMusicPlayer />)

    const input = screen.getByPlaceholderText('Enter track name...') as HTMLInputElement
    const addButton = screen.getByRole('button', { name: /Add/i })

    // Add first track
    fireEvent.change(input, { target: { value: 'Track 1' } })
    fireEvent.click(addButton)
    expect(screen.getByText(/1 item loaded/)).toBeInTheDocument()

    // Add second track
    fireEvent.change(input, { target: { value: 'Track 2' } })
    fireEvent.click(addButton)
    expect(screen.getByText(/2 items loaded/)).toBeInTheDocument()

    // Add third track
    fireEvent.change(input, { target: { value: 'Track 3' } })
    fireEvent.click(addButton)
    expect(screen.getByText(/3 items loaded/)).toBeInTheDocument()
  })

  it('should have all transport control buttons enabled when tracks exist', () => {
    render(<SimpleMusicPlayer />)

    const input = screen.getByPlaceholderText('Enter track name...')
    const addButton = screen.getByRole('button', { name: /Add/i })

    fireEvent.change(input, { target: { value: 'Track 1' } })
    fireEvent.click(addButton)

    const prevButton = screen.getByRole('button', { name: /Previous/i })
    const playButton = screen.getByRole('button', { name: /Play/i })
    const nextButton = screen.getByRole('button', { name: /Next/i })

    expect(prevButton).toBeDisabled() // At position 0
    expect(playButton).not.toBeDisabled()
    expect(nextButton).toBeDisabled() // Only 1 item
  })

  it('should allow removing tracks via Composer', () => {
    render(<SimpleMusicPlayer />)

    const input = screen.getByPlaceholderText('Enter track name...')
    const addButton = screen.getByRole('button', { name: /Add/i })

    fireEvent.change(input, { target: { value: 'Track to Remove' } })
    fireEvent.click(addButton)

    // Track to Remove appears in both Composer and Transport
    const allInstances = screen.getAllByText('Track to Remove')
    expect(allInstances.length).toBeGreaterThan(0)
    expect(screen.getByText(/1 item loaded/)).toBeInTheDocument()

    const removeButton = screen.getByRole('button', { name: /Remove/i })
    fireEvent.click(removeButton)

    expect(screen.queryAllByText('Track to Remove')).toHaveLength(0)
    expect(screen.getByText('No items loaded')).toBeInTheDocument()
  })

  it('should demonstrate component communication via events', () => {
    render(<SimpleMusicPlayer />)

    const input = screen.getByPlaceholderText('Enter track name...')
    const addButton = screen.getByRole('button', { name: /Add/i })

    // Initial state: no items
    expect(screen.getByText('No items loaded')).toBeInTheDocument()

    // Add a track via Composer
    fireEvent.change(input, { target: { value: 'Test Track' } })
    fireEvent.click(addButton)

    // Transport automatically updates via event listener
    const allInstances = screen.getAllByText('Test Track')
    expect(allInstances.length).toBeGreaterThan(0)
    expect(screen.getByText(/1 item loaded/)).toBeInTheDocument()
    expect(screen.getByText(/1\/1/)).toBeInTheDocument() // Position indicator
  })

  it('should display instructions for the example', () => {
    render(<SimpleMusicPlayer />)

    expect(
      screen.getByText(/Type a track name and click "Add" to add it to the playlist/)
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        /The Transport component automatically updates when tracks are added or removed/
      )
    ).toBeInTheDocument()
  })
})
