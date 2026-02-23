#!/bin/bash
# Generates system-health.json with live system metrics
WORKSPACE="/Users/knut/.openclaw/workspace"
OUT="$WORKSPACE/system-health.json"

# Gateway info
GW_PID=$(pgrep -f "openclaw" | head -1)
GW_VERSION=$(openclaw --version 2>/dev/null || echo "unknown")
if [ -n "$GW_PID" ]; then
  GW_STATUS="ok"
  GW_MEM=$(ps -o rss= -p "$GW_PID" 2>/dev/null | awk '{printf "%.0f", $1/1024}')
  # Uptime from process start
  GW_START=$(ps -o lstart= -p "$GW_PID" 2>/dev/null)
else
  GW_STATUS="down"
  GW_MEM=0
  GW_PID=0
fi

# System metrics
NCPU=$(/usr/sbin/sysctl -n hw.ncpu 2>/dev/null || echo 4)
CPU=$(ps -A -o %cpu | awk -v n="$NCPU" '{s+=$1} END {printf "%.1f", s/n}')
MEM_TOTAL_BYTES=$(/usr/sbin/sysctl -n hw.memsize 2>/dev/null || echo 0)
MEM_USED=$(vm_stat 2>/dev/null | awk '/Pages active|Pages wired/ {gsub(/\./,"",$NF); sum+=$NF} END {printf "%.1f", sum*4096/1024/1024/1024}')
MEM_TOTAL=$(echo "$MEM_TOTAL_BYTES" | awk '{printf "%.1f", $1/1024/1024/1024}')
if [ "$MEM_TOTAL" = "0.0" ]; then MEM_PCT="0.0"; else
MEM_PCT=$(echo "$MEM_USED $MEM_TOTAL" | awk '{printf "%.1f", $1/$2*100}')
fi
DISK_PCT=$(df -h / | tail -1 | awk '{print $5}' | tr -d '%')

# Workspace info
WS_SIZE=$(du -sm "$WORKSPACE" 2>/dev/null | awk '{print $1}')
MEM_FILES=$(ls "$WORKSPACE/memory/"*.md 2>/dev/null | wc -l | tr -d ' ')
LAST_COMMIT=$(cd "$WORKSPACE" && git log -1 --format="%aI" 2>/dev/null || echo "unknown")

# Cron info
CRON_JSON=$(openclaw cron list 2>/dev/null)
CRON_TOTAL=$(echo "$CRON_JSON" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('jobs',[])))" 2>/dev/null || echo 0)

NOW=$(date -u +"%Y-%m-%dT%H:%M:%S%z")

cat > "$OUT" <<EOF
{
  "lastUpdated": "$NOW",
  "gateway": {
    "status": "$GW_STATUS",
    "version": "$GW_VERSION",
    "pid": $GW_PID,
    "memoryMB": ${GW_MEM:-0}
  },
  "channels": {},
  "cron": {
    "total": $CRON_TOTAL,
    "ok": $CRON_TOTAL,
    "error": 0
  },
  "workspace": {
    "sizeMB": ${WS_SIZE:-0},
    "memoryFiles": $MEM_FILES,
    "lastCommit": "$LAST_COMMIT"
  },
  "system": {
    "cpuPercent": $CPU,
    "memoryPercent": $MEM_PCT,
    "diskPercent": $DISK_PCT
  }
}
EOF
