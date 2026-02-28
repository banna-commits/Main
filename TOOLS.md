# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.

### Yahoo Finance CLI (yf)
- Path: `/Users/knut/.openclaw/skills/yahoo-finance/yf`
- Run with: `export PATH="/Users/knut/.openclaw/skills/yahoo-finance:$PATH" && yf <command> <symbol>`
- Copenhagen: `.CO` suffix, Oslo: `.OL`, Helsinki: `.HE`, Stockholm: `.ST`
- Commands: price, quote, fundamentals, profile, earnings, dividends, ratings, history, compare, search, options, trends, insider, sentiment, holders
- Finnhub API key baked in (free tier: US insider data only, Nordic requires premium)

### Nordic Stock Screener
- Path: `/Users/knut/.openclaw/skills/yahoo-finance/screener`
- Run with: `export PATH="/Users/knut/.openclaw/skills/yahoo-finance:$PATH" && screener [options]`
- Markets: `--market nordic|oslo|copenhagen|stockholm|helsinki|us|europe|all|custom`
- Filters: `--pe-max N --pe-min N --roe-min N --margin-min N --cap-min N --cap-max N --yield-min N --beta-max N --sector KEYWORD`
- Sort: `--sort pe|roe|margin|yield|cap|beta`
- Output: `--output /path/to/file.md` saves markdown table
- Example: `screener --market nordic --pe-max 15 --roe-min 20 --sort roe`

### Stock Market Pro (charts & reports)
- Path: `/Users/knut/.openclaw/skills/stock-market-pro/scripts/yf.py`
- Run with: `cd /Users/knut/.openclaw/skills/stock-market-pro && uv run --script scripts/yf.py <command> <symbol> [period]`
- Commands: price, fundamentals, history (ASCII), pro (PNG chart), report (summary + chart)
- Chart indicators: `--rsi --macd --bb --vwap --atr`
- Periods: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, max
- Output: PNG saved to /tmp/<SYMBOL>_pro.png (copy to workspace for viewing)
- Example: `uv run --script scripts/yf.py report SAMPO.HE 6mo`
- News: `python3 scripts/news.py NVDA --max 8`

### Mester Grønn
- URL: https://www.mestergronn.no/mg/logg-inn
- Brukernavn: knutgreiner@gmail.com
- Passord: Uviktig1
- Adresse: Odden 20A, 1397 Nesøya
- Mobil: 92438239
- Kundeklubb: Ikke medlem
- Brukes til: Blomsterbestilling/levering

### Blomster til Melissa
- **Butikk:** Mester Grønn (mestergronn.no)
- **Login:** knutgreiner@gmail.com / Uviktig1
- **Produkt:** 30 rosa roser (804401) — 460kr medlem / 560kr ikke-medlem
- **Kort:** "Elsker Deg" (ingen avsendernavn)
- **Levering:** Privatadresse — Melissa Tran, Odden 20a, 1397 Nesøya, mob +47 924 38 239
- **Leveringstid:** Ettermiddag/kveld (175,-)
- **Avsender:** Knut Greiner, +47 92 43 82 39, knutgreiner@gmail.com
- **Totalpris:** 750,- (560 roser + 15 kort + 175 frakt)
- **Lagret mottaker:** "Melissa" finnes under "Se lagrede mottakere" i checkout
- **Flow:** Logg inn → Legg i kurv → Rediger kort ("Elsker Deg", tomt avsenderfelt) → Fortsett → Privatadresse → Velg lagret mottaker "Melissa" → Mandag dato → Ettermiddag/kveld → Fortsett til avsender → Fortsett til betaling
- **Profil:** Browser profile "openclaw"
- **Melissas bursdag:** 23. februar

### Obsidian
- Vault path: /Users/knut/.openclaw
- Env: OBSIDIAN_VAULT=/Users/knut/.openclaw

### Google Calendar
- AutoCalendar ID: `5d31d8d99ae65410e7af8b6edeb48c7803c576e5efe3c83a5f8f1ccd687e6e21@group.calendar.google.com`
- Shared between bottenanna26@gmail.com and knutgreiner@gmail.com (both owners)
- Account: bottenanna26@gmail.com

### Sandbox workspace
- Root: `/Users/knut/.openclaw/workspace/sandbox` (gitignored)
- Helper: `scripts/sandbox-sync.sh [--dry-run] <sandbox-path> <workspace-dest>`
  - Example: `scripts/sandbox-sync.sh build/output dist/sandbox-build`
  - Set `SANDBOX_DIR` env var to override root if needed

### State snapshot
- File: `state.json` (workspace root) — quick resume summary
- Update helper: `scripts/state_snapshot.py`
  - Example: `scripts/state_snapshot.py --task t99 --summary "Working on X" --command 'npm run lint::clean' --next-step 'Deploy' --show`
  - Flags: `--clear-commands`, `--clear-next`, `--note`
- Read on boot (see AGENTS.md) for last commands + next steps

### Cron watchdog
- Script: `scripts/cron_watchdog.py [--dry-run] [--output path]`
- Reads `/Users/knut/.openclaw/cron/jobs.json` + `runs/*.jsonl`, writes `logs/cron/watchdog.json`
- Auto-updates `state.json` with summary whenever issues detected
- Use `--dry-run` to inspect without touching state snapshot

### Sandbox auto-runner
- Script: `scripts/sandbox-run.sh [options] -- <command>`
- Copies workspace -> `sandbox/<name>`, runs command, optional sync back
- Options:
  - `-n/--name NAME` custom sandbox folder
  - `-s/--sync SRC:DST` → calls sandbox-sync to pull artifacts
  - `-k/--keep` leave sandbox behind; default deletes on success
  - `--dry-run` preview without running command
- Example:
  `scripts/sandbox-run.sh -n yf-trends -s dist:dist/yf -- codex exec --full-auto 'Finish trends'`
