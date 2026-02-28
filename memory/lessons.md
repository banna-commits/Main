# Lessons Learned

## Write-Through Memory (⚠️ REPEATED FAILURE — READ THIS CAREFULLY)
**This is the #1 recurring mistake. It has been called out by Knut multiple times.**

### The Rule
Every time you complete an action that changes state — a port, a URL, a config, a new service, a lesson learned — **update the relevant memory file IN THE SAME TURN. Not after. Not when asked. Not in a batch at the end.**

### What "same turn" means
- You change MC from port 3000 → 3001? Update `memory/infra.md` AND `memory/YYYY-MM-DD.md` RIGHT NOW, before replying to Knut.
- You learn Tailscale strips subpath prefixes? Update `memory/patterns/tailscale-serve.md` RIGHT NOW, not 30 minutes later.
- You set up a new cron job? Write it to `memory/infra.md` in the same tool-call sequence.

### Why this keeps failing
- "I'll update memory after this is working" → session compacts → knowledge lost
- "Let me batch all the updates at the end" → Knut has to remind me → trust erodes
- "The daily log already covers it" → daily log had STALE info (port 3000) while actual state was port 3001

### The checklist (every state-changing action)
1. ✅ Did I update the relevant `memory/` file?
2. ✅ Did I update `memory/YYYY-MM-DD.md` daily log?
3. ✅ Did I update any affected pattern in `memory/patterns/`?
4. ✅ Is the OLD info removed/corrected (not just new info appended)?

**If you catch yourself thinking "I should remember this" — you've already failed. It should already be written.**

## Post-Compaction Recovery
- **ALWAYS run memory_search before resuming work** after compaction — especially when summary is empty
- Don't trust file locations alone; check daily logs for recent migrations/moves
- The HTML mission-control in pitch/ was superseded by Next.js on port 3000 (2026-02-22) — wasted time rebuilding HTML version because I didn't check

## Tools & CLI
- Desktop OAuth client type works; Web app causes redirect_uri_mismatch
- Gmail hook mapping needs `messageTemplate` or you get 400 errors
- python3 http.server dies between sessions — use launchd for persistence
- gog account is banna@bottenanna.no — bottenanna26 is alias, Google rejects it
- gog commands are interactive by default — export `PAGER=cat`/`GOG_PAGER=cat` + `--plain --no-input` to keep cron scripts non-blocking

## Architecture
- Heartbeats every 30m in main session block conversations — use cron jobs in isolated sessions
- Prefetch pattern: qwen3-fast (free) does data fetching, Sonnet only reads + formats
- Mac Mini sleep kills TCP connections silently — disable sleep with pmset

## Communication
- Confirm by reading back: show actual saved content, don't just say "done"
- Splitting long emails into 2 parts works well for complex responses
- Telegram webhook: removing config doesn't delete webhook — must call deleteWebhook API

## Sub-agents
- Open-ended research tasks burn 200k tokens — give strict constraints (max N searches, short timeout)
- For email tasks: do directly in main session or split into small focused sub-tasks
- If sub-agent fails: do it yourself, don't retry with another sub-agent
- **90s timeout kills most subagents** — use 300s for multi-tool, 120s for simple
- **Set default model in config** (`agents.defaults.subagents.model`) — don't let subagents inherit Opus
- **Atomic tasks only** — "build this one script + run it + show output, then stop" beats "build the whole system"
- **Max 5-7 tool calls** per subagent — more than that, do it yourself
- **Include full file paths** — subagents don't get SOUL/USER/MEMORY context
- **Parallel spawning works great** — 3 research agents at once all completed fine

## Domain Knowledge
- eTakst is NOT legally regulated — proprietary Eiendomsverdi AS product
- Utlånsforskriften §4 doesn't specify who must do property valuation
- ClawHub skills: ~27% of registry is spam/malicious
- Don't hand-draw SVG paths — use existing libraries
- PDF export from HTML is unreliable — hosted HTML links work better

## Ollama / Local LLM
- **Cold start = 22s** — OLLAMA_KEEP_ALIVE=30m prevents this
- **NUM_PARALLEL=2** — allows embedding + generation simultaneously
- **qwen3-fast ignores /no_think** — uses thinking tokens anyway, wastes output budget
- **stream:false hangs on large outputs** — Python urllib waits for all tokens, looks dead
- **Context window vs RAM:** 32K ctx × Q8 KV-cache = trivial on 24GB. Could go 64K if needed.
- **Warmup on boot is critical** — without it first cron job after reboot takes 22s+ extra
- **Q4_K_M quantization** is the sweet spot for speed/quality on Apple Silicon
- **8B models good for:** data fetching, heartbeats, simple formatting, running scripts
- **8B models bad for:** complex reasoning, nuanced analysis, multi-step planning → use Sonnet/Opus

## Memory Read/Write Discipline (2026-02-24 — Knut feedback)
**Problem:** Glitching on BOTH sides — not writing enough (download) and not reading enough (upload).

### Write failures (download to files):
- Conversations with substance (meta discussions, preference corrections, decisions) don't get logged
- After compaction, context from earlier in the day is gone if not written
- "I'll do it later" = never

### Read failures (upload from files):
- `memory_search` exists but isn't used proactively before answering
- After compaction, don't always read recent daily logs despite instructions
- Semantic search is only as good as what was written — garbage in, garbage out

### Fix:
1. **Every substantive exchange** → daily log entry BEFORE replying
2. **Any question touching past context** → `memory_search` FIRST
3. **Daily log quality** — log decisions, preferences, corrections, not just events
4. **Post-compaction** — ALWAYS read today + yesterday daily logs immediately

## Memory System
- **Gemini embeddings hit 429 quota** — switched to local Ollama nomic-embed-text via OpenAI-compatible API
- **OpenClaw has built-in hybrid search** (BM25 + vector) — just enable it in config, don't build your own
- **LLM-per-section scoring doesn't work with local Ollama** — qwen3-fast ignores /no_think, uses thinking tokens, hangs with stream:false. Heuristic scoring is 1000x faster and good enough.
- **Heuristic importance scoring** — keyword matching (decisions, people, money, actions) gives 1-10 scores instantly. No tokens needed.
- **Memory decay needs importance-guided prioritization** — high-score sections survive compression, low-score ones get archived
- **config.patch for memorySearch** — must nest under `agents.defaults.memorySearch`, not top-level `memorySearch`
- **Bash 3.2 on macOS** — no associative arrays, no mapfile. Always use Python for anything complex.

## Google Calendar (gog)
- Heldags-events trenger timezone i ISO-format: `2026-02-26T00:00:00+01:00` (ikke bare `2026-02-26`)
- Uten timezone → "Bad Request" (heldags) eller "Missing time zone definition" (tids-events)
- Vintertid: `+01:00`, sommertid: `+02:00` (Norge skifter siste søndag i mars)
- Heldags = midnatt til midnatt neste dag (`T00:00:00` → `T00:00:00` +1 dag)
- Flerdag = sett end til dagen ETTER siste dag (Google Calendar er exclusive-end)
- AutoCalendar ID: lang hash-streng, bruker `banna@bottenanna.no` som account

## Next.js / Node
- Node v24 incompatible with Next.js 16 — use v22 via fnm
- OpenClaw exec sandbox kills child processes — use nohup or launchd
