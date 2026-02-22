# Lessons Learned

## Tools & CLI
- Desktop OAuth client type works; Web app causes redirect_uri_mismatch
- Gmail hook mapping needs `messageTemplate` or you get 400 errors
- python3 http.server dies between sessions — use launchd for persistence
- gog account is banna@bottenanna.no — bottenanna26 is alias, Google rejects it

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
