# Infrastructure

## Discord
- Bot name: @Bannabot
- Server ID: 1475147053549228032
- Channels: mainchat (1475149600133484614), mainforum (1475149673416097894)
- Mode: mention-only (@Bannabot) in allowlisted channels
- DMs: pairing mode

## Ollama Config (updated 2026-02-22)
- **Hardware:** Mac Mini M4, 24GB RAM
- **OLLAMA_NUM_PARALLEL=2** — concurrent embedding + generation
- **OLLAMA_KEEP_ALIVE=30m** — avoids 22s cold start
- **OLLAMA_FLASH_ATTENTION=1** — already enabled
- **OLLAMA_KV_CACHE_TYPE=q8_0** — already enabled
- **Models loaded:** qwen3-fast (32K ctx, 8K output), nomic-embed-text (768 dims)
- **Warmup:** Boot plist loads nomic-embed-text + qwen3-fast on startup
- **RAM usage:** ~5.5GB for both models, 18GB+ free for macOS
- **Plist:** ~/Library/LaunchAgents/homebrew.mxcl.ollama.plist

## Memory System (updated 2026-02-22)
- **Embeddings:** nomic-embed-text via Ollama (OpenAI-compat at localhost:11434/v1)
- **Search:** Hybrid BM25 + vector (70/30 weighting)
- **Importance scoring:** Heuristic-based (keywords: decisions, people, money, actions), every 6h
- **Context index:** 311+ topics → file/line refs (context-index.json), every 6h
- **Relations graph:** 20 entities, 14 edges (relations.json), every 6h
- **Decay:** Sun 21:00 — compress 7-30d files → weekly digests, archive >30d
- **Infra Sync cron:** 6 scripts every 6h (memory-index, investments, context-index, relations, scoring, mission-control)

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
