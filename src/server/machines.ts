import { createServerFn } from '@tanstack/react-start'
import type { Machine } from '../lib/types'

/**
 * Fetch machine status from Tailscale API.
 * Requires TAILSCALE_API_KEY env var (OAuth or API key).
 * Falls back to static data if API key is not set.
 */
export const getMachines = createServerFn().handler(async (): Promise<Machine[]> => {
  const apiKey = process.env.TAILSCALE_API_KEY
  if (!apiKey) {
    return fallbackMachines()
  }

  try {
    const res = await fetch('https://api.tailscale.com/api/v2/tailnet/-/devices', {
      headers: { Authorization: `Bearer ${apiKey}` },
    })

    if (!res.ok) {
      console.error(`Tailscale API error: ${res.status}`)
      return fallbackMachines()
    }

    const data = (await res.json()) as { devices: TailscaleDevice[] }

    return data.devices
      .filter((d) => !d.isExternal)
      .map((d) => ({
        hostname: d.hostname || d.name.split('.')[0],
        os: d.os || 'unknown',
        status: d.online ? 'online' : 'offline',
        ip: d.addresses?.[0] || '',
        tasks: 0, // Will be populated by heartbeat system
        lastSeen: d.lastSeen,
      }))
  } catch (err) {
    console.error('Tailscale API fetch failed:', err)
    return fallbackMachines()
  }
})

interface TailscaleDevice {
  name: string
  hostname: string
  os: string
  online: boolean
  addresses: string[]
  lastSeen: string
  isExternal?: boolean
}

function fallbackMachines(): Machine[] {
  return [
    { hostname: 'providence', os: 'macOS', status: 'online', ip: '100.84.211.58', tasks: 0 },
    { hostname: 'destiny', os: 'macOS', status: 'offline', ip: '100.84.253.65', tasks: 0 },
    { hostname: 'stargate', os: 'Windows', status: 'online', ip: '100.107.60.12', tasks: 0 },
    { hostname: 'stargate-wsl', os: 'Linux', status: 'online', ip: '100.92.249.32', tasks: 0 },
  ]
}
