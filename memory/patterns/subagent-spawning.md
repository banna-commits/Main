# Pattern: Subagent Spawning

## When
Delegating work to a background subagent via `sessions_spawn`.

## Key Settings
- **Default model:** Sonnet (set in config: `agents.defaults.subagents.model`)
- **Timeout:** `runTimeoutSeconds: 300` for multi-tool tasks, `120` for simple ones
- **Don't specify `model`** unless you need something other than the config default

## Task Prompt Rules
- **Atomic:** One clear deliverable. "Do X. Output Y. Then stop."
- **Max 5-7 tool calls** per subagent. If it needs more, do it yourself.
- **Include full paths** — subagents don't have your context about workspace layout
- **Specify exact output format** — don't leave it open-ended
- **End with "Then stop."** — prevents the agent from doing extra unnecessary work

## What Caused Timeouts (Lessons Learned)
1. **90s timeout was too short** — Sonnet with 4-5 tool calls easily takes 60-90s
2. **Inheriting Opus** — before config fix, subagents got Opus (slower, more expensive)
3. **Tasks too big** — "build the whole system" vs "build this one script"
4. **No explicit deliverable** — agent kept iterating instead of finishing
5. **Bash 3.2 on macOS** — no associative arrays, no `mapfile`. Use Python instead.

## Good vs Bad Task Examples

### ❌ Bad (too big, vague)
```
Build a memory decay system with two scripts, a consolidation pipeline, 
weekly digests, archival, and integrate with cron.
```

### ✅ Good (atomic, clear output)
```
Build scripts/build-context-index.py that scans memory/*.md files, 
extracts H2/H3 headings and names as topic keys, and writes a JSON 
index to memory/context-index.json. Make it executable. Run it and 
show the topic count. Then stop.
```

## Decision Tree
- **2-3 tool calls?** → Do it yourself. Subagent overhead isn't worth it.
- **4-7 tool calls, parallelizable?** → Spawn subagent.
- **8+ tool calls?** → Break into smaller pieces or do it yourself.
- **Needs main session context?** → Do it yourself (subagents don't get SOUL/USER/MEMORY).
- **Research (web search)?** → Good subagent task. Max 3 searches.

## Quality Rating: ⭐⭐⭐⭐⭐
After fixing config defaults and timeout, subagents reliably complete. The key insight was atomic tasks + adequate timeout + correct model.
