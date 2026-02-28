# Infrastructure

## Discord
- Bot name: @Bannabot
- Server ID: 1475147053549228032
- Channels: mainchat (1475149600133484614), mainforum (1475149673416097894)
- Mode: mention-only (@Bannabot) in allowlisted channels
- DMs: pairing mode

## Document Tools
- **pdftotext** (poppler 26.02.0): `pdftotext file.pdf -` for text extraction
- **pdfinfo**: `pdfinfo file.pdf` for metadata (pages, size, author)
- Installed via brew, path: /opt/homebrew/bin/pdftotext

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
- GCP project in Testing mode — tokens expire every 7 days, need re-auth (as of 2026-02-22 the Gmail token is expired; rerun `gog auth add bottenanna26@gmail.com --services gmail,calendar,...` when Knut is available)
- Pub/Sub topic: `projects/project-9906db25-afbf-4296-840/topics/gog-gmail-watch`
- Gmail push notifications → Tailscale Funnel → OpenClaw hooks → Telegram delivery
- Email draft flow: Knut forwards to banna → I draft reply → send to knutgreiner@gmail.com

## Calendar
- AutoCalendar ID: `5d31d8d99ae65410e7af8b6edeb48c7803c576e5efe3c83a5f8f1ccd687e6e21@group.calendar.google.com`
- Shared between banna and knutgreiner (both owners)
- Knut bruker ikke privat Google Calendar — AutoCalendar er primærkalenderen

## Mission Control
- **Stack:** Next.js 16 + TypeScript + Tailwind v4 + App Router
- **Path:** `mission-control/` (workspace)
- **Port:** 3001 (launchd `com.openclaw.missioncontrol`)
- **Node:** v22 via fnm (Node v24 incompatible with Next.js 16)
- **URL (Tailscale):** https://knut-sin-mac-mini.tail74a1a0.ts.net:3001 (tailnet-only, no Funnel)
- **URL (local):** http://localhost:3001
- **Data files (workspace root):** tasks.json, schedule.json, investments.json, memory-index.json, system-health.json, activity.json
- **Tabs:** Tasks (kanban), Activity (feed), Schedule (cron), System (health), Calendar, Investments, Trenger Knut, Memory, Cron
- **Recent upgrades (Feb 23–27):**
  - Trenger Knut tab now fully interactive (modal edits, mark done, delete, "⚡ Jobbe med")
  - Context strip widget shows state.json summary + heartbeat timestamps (t26)
  - Cron tab scaffolding + log API to surface cron health (t21 in progress)
  - Tabs widened (220px) with wrap + uppercase adjustments to prevent overlap
- **Automation:** Infra Sync cron regenerates JSON data every 6h; sync-mission-control.sh pushes updates to pitch mirror.

## Hosting & Tailscale
- Tailscale hostname: knut-sin-mac-mini.tail74a1a0.ts.net
- Tailscale serve routes:
  - `:443 /` → OpenClaw Gateway (port 18789)
  - `:443 /gmail-pubsub` → Gmail webhook (port 8788)
  - `:3001` → Mission Control (port 3001)
- Mode: Tailnet-only (NO Funnel — not exposed to internet)
- Note: Tailscale `--set-path` strips the prefix before proxying — subpath SPAs need their own port instead
- **LAN fallback:** http://10.0.0.28:3001 (when Tailscale tunnel is down, same Wi-Fi required)
- **Tailscale tunnel fix** (needs sudo): `sudo tailscale down && sleep 2 && sudo tailscale up`
- To disable: `tailscale serve --https=443 off` / `tailscale serve --https=3001 off`

## Embeddings
- Model: snowflake-arctic-embed2 (1024 dims, 1.2GB, multilingual inkl norsk)
- Brukes av: OpenClaw memorySearch + Mem0
- Forrige: nomic-embed-text (768 dims, svak på norsk/egennavn)
- Mem0: Qdrant lokal DB i `workspace/mem0-db/`, 100 memories, Sonnet for extraction

## Git Backup
- Remote: https://github.com/banna-commits/Main.git (private)
- GitHub user: banna-commits
- Auth: gh CLI (credential helper)
- Cron: hver 12. time (03:00 + 15:00) — auto-commit + push
- Recovery: `git clone` → `openclaw gateway start`

## Automation / Cron (2026-02-27)
- **Morning Prefetch Watchdog (07:35)** — runs `python3 scripts/morning_watchdog.py --expected-date $(date +%Y-%m-%d) --max-age-minutes 75 --state-max-age-minutes 90 --window-start 07:30 --window-end 10:00`; alerts Telegram if briefing prefetch or state file stale.
- **Daily Memory Digest (23:10)** — `python3 scripts/memory-digest.py --date $(date +%Y-%m-%d)`; sends ⚠️ Telegram alert with log if it fails.
- **Cron Watchdog script** — `scripts/cron_watchdog.py` scans cron jobs/run logs, writes `logs/cron/watchdog.json`, and auto-updates state.json via `state_snapshot.py` when issues found.
- **Sandbox tooling** — `scripts/sandbox-run.sh` + `scripts/sandbox-sync.sh` manage gitignored `/workspace/sandbox/` experiments and sync artifacts back safely.
- **State snapshot helper** — `scripts/state_snapshot.py` keeps `state.json` current; Infra Sync cron invokes it each run.

## Mac Mini
- Sleep disabled via pmset (kills TCP connections silently)
- Full Disk Access granted to OpenClaw
