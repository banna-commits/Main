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

## Domain Knowledge
- eTakst is NOT legally regulated — proprietary Eiendomsverdi AS product
- Utlånsforskriften §4 doesn't specify who must do property valuation
- ClawHub skills: ~27% of registry is spam/malicious
- Don't hand-draw SVG paths — use existing libraries
- PDF export from HTML is unreliable — hosted HTML links work better

## Next.js / Node
- Node v24 incompatible with Next.js 16 — use v22 via fnm
- OpenClaw exec sandbox kills child processes — use nohup or launchd
