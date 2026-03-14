#!/bin/bash
# Snapshot Tailscale status to a JSON file for the dev server.
# Run before/during dev, or as a cron for production heartbeat.
# Output: public/tailscale-status.json

set -euo pipefail

OUT="$(dirname "$0")/../public/tailscale-status.json"

tailscale status --json 2>/dev/null | python3 -c "
import sys, json

data = json.load(sys.stdin)
self_node = data.get('Self', {})
peers = data.get('Peer', {})

machines = []

# Self
machines.append({
    'hostname': self_node.get('HostName', 'unknown'),
    'os': self_node.get('OS', 'unknown'),
    'status': 'online' if self_node.get('Online') else 'offline',
    'ip': (self_node.get('TailscaleIPs') or [''])[0],
    'tasks': 0
})

# Peers
for _, peer in peers.items():
    hostname = peer.get('HostName', 'unknown')
    # Distinguish stargate vs stargate-wsl by OS
    if hostname == 'stargate' and peer.get('OS') == 'linux':
        hostname = 'stargate-wsl'
    machines.append({
        'hostname': hostname,
        'os': peer.get('OS', 'unknown'),
        'status': 'online' if peer.get('Online') else 'offline',
        'ip': (peer.get('TailscaleIPs') or [''])[0],
        'tasks': 0
    })

json.dump({'machines': machines, 'ts': __import__('datetime').datetime.utcnow().isoformat() + 'Z'}, sys.stdout, indent=2)
" > "$OUT"

echo "Wrote $(wc -l < "$OUT") lines to $OUT"
