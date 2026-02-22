# Infrastructure

## Google Workspace (gog CLI)
- Primary account: banna@bottenanna.no (bottenanna26@gmail.com is alias)
- Services: gmail, calendar, drive, contacts, docs, sheets
- OAuth client: Desktop app (258225610371-hmm7cjhs8gglseg4g7luota14vmi7pta)
- GCP project in Testing mode — tokens expire every 7 days, need re-auth
- Pub/Sub topic: `projects/project-9906db25-afbf-4296-840/topics/gog-gmail-watch`
- Gmail push notifications → Tailscale Funnel → OpenClaw hooks → Telegram delivery
- Email draft flow: Knut forwards to banna → I draft reply → send to knutgreiner@gmail.com

## Calendar
- AutoCalendar ID: `5d31d8d99ae65410e7af8b6edeb48c7803c576e5efe3c83a5f8f1ccd687e6e21@group.calendar.google.com`
- Shared between banna and knutgreiner (both owners)
- Knut bruker ikke privat Google Calendar — AutoCalendar er primærkalenderen

## Mission Control
- Next.js app at `mission-control/` on port 3000
- Launchd: `com.openclaw.missioncontrol` (auto-start, auto-restart)
- Node v22 via fnm (Node v24 incompatible with Next.js 16)
- Data: tasks.json, schedule.json, investments.json, memory-index.json

## Hosting
- Tailscale hostname: knut-sin-mac-mini.tail37c89c.ts.net
- Pitch server: launchd (`com.openclaw.pitchserver`), port 8890
- Tailscale Funnel: `/pitch` → http://127.0.0.1:8890

## Mac Mini
- Sleep disabled via pmset (kills TCP connections silently)
- Full Disk Access granted to OpenClaw
