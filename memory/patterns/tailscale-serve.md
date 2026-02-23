# Tailscale Serve — Secure Local Service Exposure

**When to use:** Expose local web services (localhost:PORT) to other devices on your tailnet without public internet access.

## Steps

1. **Start the local service** (e.g., Mission Control on localhost:3000)
2. **Enable Tailscale serve:**
   ```bash
   tailscale serve --bg http://127.0.0.1:3000
   ```
3. **Access via Tailscale hostname:**
   ```
   https://your-machine-name.tailXXXXXX.ts.net/
   ```
4. **To disable:**
   ```bash
   tailscale serve --https=443 off
   ```

## Gotchas
- Uses HTTPS by default (Tailscale handles certificates)
- Only accessible to devices on your tailnet
- Runs in background (--bg flag)
- Different from `tailscale funnel` (which exposes to public internet)

## Quality Rating: ⭐⭐⭐⭐
Clean, secure, zero-config solution for internal service access.