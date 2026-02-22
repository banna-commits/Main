#!/bin/bash
# Auto-commit memory changes to git
cd /Users/knut/.openclaw/workspace

# Only commit memory-related files
git add MEMORY.md memory/ 2>/dev/null

# Check if there are changes to commit
if git diff --cached --quiet 2>/dev/null; then
  echo "No memory changes to commit"
  exit 0
fi

git commit -m "memory: auto-commit $(date +%Y-%m-%d)" --no-verify 2>/dev/null
echo "Memory committed: $(date +%Y-%m-%d)"
