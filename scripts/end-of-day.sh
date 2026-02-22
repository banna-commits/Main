#!/bin/bash
# End-of-day: gather raw data for the daily report
# Run by qwen3-fast, formatted by Sonnet

WORKSPACE="/Users/knut/.openclaw/workspace"
TODAY=$(date +%Y-%m-%d)
OUTPUT="$WORKSPACE/eod-data.txt"

echo "=== DATE ===" > "$OUTPUT"
echo "$TODAY" >> "$OUTPUT"

echo "=== DAILY LOG ===" >> "$OUTPUT"
cat "$WORKSPACE/memory/$TODAY.md" 2>/dev/null >> "$OUTPUT" || echo "(no daily log)" >> "$OUTPUT"

echo "=== TASKS ===" >> "$OUTPUT"
cat "$WORKSPACE/tasks.json" >> "$OUTPUT"

echo "=== GIT LOG ===" >> "$OUTPUT"
cd "$WORKSPACE" && git log --oneline --since="$TODAY" 2>/dev/null >> "$OUTPUT" || echo "(no git)" >> "$OUTPUT"

echo "=== CRON RUNS ===" >> "$OUTPUT"
# Will be filled by the agent reading cron history

# Auto-commit memory changes
bash "$WORKSPACE/scripts/memory-commit.sh" >> "$OUTPUT" 2>&1

echo "EOD data gathered for $TODAY"
