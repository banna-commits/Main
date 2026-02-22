#!/bin/bash
# Sync Mission Control files to pitch server
SRC="/Users/knut/.openclaw/workspace"
DST="/Users/knut/.openclaw/workspace/pitch"

cp "$SRC/taskboard.html" "$DST/mission-control.html"
cp "$SRC/tasks.json" "$DST/tasks.json"
cp "$SRC/investments.json" "$DST/investments.json" 2>/dev/null
cp "$SRC/memory-index.json" "$DST/memory-index.json" 2>/dev/null
cp "$SRC/schedule.json" "$DST/schedule.json" 2>/dev/null
echo "Mission Control synced"
