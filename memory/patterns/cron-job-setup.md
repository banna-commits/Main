# Pattern: Cron Job Setup

## When
Setting up a new scheduled task.

## Decision: Cron vs Heartbeat
- **Cron** for: exact timing, isolated execution, different model, one-shot reminders
- **Heartbeat** for: batched checks, needs conversation context, timing can drift

## Steps
1. Decide model: qwen3-fast (free) for CLI/data work, Sonnet for analysis/formatting
2. Write EXACT commands in the prompt — isolated sessions have NO memory
3. Set appropriate timeout (60-120s for scripts, 180s for complex analysis)
4. Set delivery: "none" for silent, "announce" + channel/to for notifications
5. Test with `cron run <jobId>`

## Prefetch Pattern (for expensive tasks)
1. Create cheap job (qwen3-fast) that gathers data → writes to file
2. Create expensive job (Sonnet) 5 min later that reads the file
3. Saves 80%+ on token costs

## Gotchas
- ALWAYS spell out full commands — don't rely on agent knowing paths
- isolated sessions can't read TOOLS.md or MEMORY.md
- sessionTarget="main" requires payload.kind="systemEvent"
- sessionTarget="isolated" requires payload.kind="agentTurn"
- Test after creating — don't assume it works

## Quality: ⭐⭐⭐⭐⭐ (battle-tested)
