#!/bin/bash
# memory-consolidate.sh — Categorize and consolidate memory files
# Usage: ./memory-consolidate.sh [--dry-run]
# Runs categorization then calls memory-decay.py for actual consolidation

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DRY_RUN=""
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN="--dry-run"

echo "=== Memory Decay Pipeline ==="
echo "Date: $(date '+%Y-%m-%d %H:%M')"
echo ""

# Step 1: Categorize
python3 "$SCRIPT_DIR/memory-decay.py" --categorize $DRY_RUN

# Step 2: Process (if not dry-run, categorize already outputs the plan)
if [[ -z "$DRY_RUN" ]]; then
  python3 "$SCRIPT_DIR/memory-decay.py" --auto
fi
