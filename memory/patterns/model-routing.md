# Pattern: Model Routing

## When
Deciding which model to use for a task.

## Routing Table

| Model | Use for | Cost |
|-------|---------|------|
| **qwen3-fast** (local 8B) | Heartbeats, cron data-fetching, running scripts, simple formatting, health checks | Free |
| **Sonnet** (cloud) | Subagents, research synthesis, morning briefing, complex formatting, multi-tool work | $$ |
| **Opus** (cloud) | Direct conversation with Knut, high-stakes decisions, expert analysis | $$$ |

## Decision Tree
1. Can a bash script do it? → **No model needed**
2. Just run commands and report output? → **qwen3-fast**
3. Needs reasoning + tool use? → **Sonnet**
4. Talking to Knut directly? → **Opus** (set in config as primary)

## Config
- Main session: Opus (agents.defaults.model.primary)
- Subagents: Sonnet (agents.defaults.subagents.model)
- Heartbeats: qwen3-fast (agents.defaults.heartbeat.model)
- Gmail hooks: qwen3-fast (hooks.gmail.model)
- Cron jobs: specified per job (most use qwen3-fast for data, Sonnet for analysis)

## Gotchas
- qwen3-fast ignores /no_think — don't rely on it for structured JSON output
- stream:false + qwen3-fast can look hung — it's just slow, not dead
- Sonnet is 5-10x faster than Opus for tool-heavy work
- Don't specify model in sessions_spawn unless you need something other than config default

## Quality Rating: ⭐⭐⭐⭐⭐
