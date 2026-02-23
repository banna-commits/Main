# Tailscale Serve — Secure Local Service Exposure

**When to use:** Expose local web services (localhost:PORT) to other devices on your tailnet without public internet access.

## Steps

1. **Start the local service** (e.g., Mission Control on localhost:3001)
2. **Enable Tailscale serve (same port):**
   ```bash
   tailscale serve --bg --https 3001 http://127.0.0.1:3001
   ```
3. **Access via Tailscale hostname:**
   ```
   https://your-machine-name.tailXXXXXX.ts.net:3001/
   ```
4. **To disable:**
   ```bash
   tailscale serve --https=3001 off
   ```

## Gotchas
- **`--set-path` strips the prefix!** `/mc` → backend sees `/`. SPAs with client-side routing break. Use a separate port instead of subpaths for SPAs.
- `basePath` in Next.js doesn't help because Tailscale sends `/` not `/mc` to the backend
- Uses HTTPS by default (Tailscale handles certificates)
- Only accessible to devices on your tailnet
- Tailscale serve config persists across reboots
- Different from `tailscale funnel` (which exposes to public internet)
- If Tailscale serve binds a port, Next.js can't also bind it — disable serve first, then restart app

## Quality Rating: ⭐⭐⭐⭐⭐
Updated after learning the subpath stripping lesson the hard way.
