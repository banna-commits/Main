#!/bin/bash
# Morning briefing data gatherer
# Collects investments, email, research, calendars, weather into briefing-data.txt

set -uo pipefail

WORKDIR="/Users/knut/.openclaw/workspace"
OUTFILE="${WORKDIR}/briefing-data.txt"
STATE_DIR="${WORKDIR}/state"
STATE_FILE="${STATE_DIR}/morning_prefetch.json"
ISO_NOW=$(date -u +%Y-%m-%dT%H:%M:%S)
ISO_PLUS48=$(date -u -v+48H +%Y-%m-%dT%H:%M:%S)
PAGER_CMD="cat"
FAIL=0
ERROR_COUNT=0
START_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)

mkdir -p "$STATE_DIR"

export PAGER="$PAGER_CMD"
export GOG_PAGER="$PAGER_CMD"

TMPFILE=$(mktemp)
cleanup() {
  rm -f "$TMPFILE"
}
trap cleanup EXIT

write_error() {
  local msg="$1"
  echo "ERROR: ${msg}"
  FAIL=1
  ERROR_COUNT=$((ERROR_COUNT + 1))
}

write_state() {
  local exit_code="$1"
  local end_time="$2"
  local file_exists="false"
  local file_size=0
  local file_mtime_iso=""
  local file_mtime_epoch=""

  if [ -f "$OUTFILE" ]; then
    file_exists="true"
    file_size=$(stat -f %z "$OUTFILE" 2>/dev/null || echo 0)
    file_mtime_epoch=$(stat -f %m "$OUTFILE" 2>/dev/null || echo 0)
    if [ -n "$file_mtime_epoch" ] && [ "$file_mtime_epoch" -ne 0 ]; then
      file_mtime_iso=$(python3 - <<'PY'
import datetime
epoch = int("${file_mtime_epoch}")
dt = datetime.datetime.fromtimestamp(epoch, datetime.timezone.utc)
print(dt.strftime('%Y-%m-%dT%H:%M:%SZ'))
PY
)
    fi
  fi

  cat <<JSON > "$STATE_FILE"
{
  "startTime": "${START_TIME}",
  "endTime": "${end_time}",
  "exitCode": ${exit_code},
  "errorCount": ${ERROR_COUNT},
  "output": {
    "path": "${OUTFILE}",
    "exists": ${file_exists},
    "size": ${file_size},
    "mtime": "${file_mtime_iso}"
  }
}
JSON
}

{
  echo '=== INVESTMENTS ==='
  if ! cat "${WORKDIR}/investments.json"; then
    write_error "Unable to read investments.json"
  fi
  echo

  echo '=== EMAIL ==='
  if ! gog gmail search 'newer_than:24h is:unread' --max 10 --plain --no-input --account banna@bottenanna.no; then
    write_error "Email search failed"
  fi
  echo

  echo '=== RESEARCH MAIL ==='
  research_tmp=$(mktemp)
  if gog gmail search 'from:knut.greiner@seb.no OR from:*bloomberg* newer_than:24h' --max 10 --plain --no-input --account banna@bottenanna.no | tee "$research_tmp"; then
    echo
    while read -r id; do
      if [[ -n "$id" ]]; then
        echo "--- RESEARCH MESSAGE $id ---"
        if ! gog gmail read "$id" --plain --no-input --account banna@bottenanna.no; then
          write_error "Failed to read research email $id"
        fi
        echo
      fi
    done < <(awk 'NR>1 && $1 !~ /^#/ {print $1}' "$research_tmp")
  else
    write_error "Research search failed"
  fi
  rm -f "$research_tmp"

  echo '=== CALENDAR PRIMARY ==='
  if ! gog calendar events primary --from "$ISO_NOW" --to "$ISO_PLUS48" --plain --no-input --account banna@bottenanna.no; then
    write_error "Primary calendar fetch failed"
  fi
  echo

  echo '=== CALENDAR AUTO ==='
  if ! gog calendar events 5d31d8d99ae65410e7af8b6edeb48c7803c576e5efe3c83a5f8f1ccd687e6e21@group.calendar.google.com --from "$ISO_NOW" --to "$ISO_PLUS48" --plain --no-input --account banna@bottenanna.no; then
    write_error "AutoCalendar fetch failed"
  fi
  echo

  echo '=== WEATHER ==='
  WEATHER_JSON=$(curl -s --connect-timeout 5 --max-time 15 'wttr.in/Oslo?format=j1')
  if [[ -n "$WEATHER_JSON" ]]; then
    if ! printf '%s' "$WEATHER_JSON" | python3 - <<'PYCODE'
import json, sys

data = json.loads(sys.stdin.read())
try:
    curr = data['current_condition'][0]
    today = data['weather'][0]
    tomorrow = data['weather'][1]
    print(f"Now: {curr['temp_C']}C {curr['weatherDesc'][0]['value']}")
    print(f"Today: {today['maxtempC']}/{today['mintempC']}C")
    print(f"Tomorrow: {tomorrow['maxtempC']}/{tomorrow['mintempC']}C {tomorrow['hourly'][4]['weatherDesc'][0]['value']}")
except (KeyError, IndexError, ValueError) as exc:
    print(f"Weather data unavailable (parse error: {exc})")
PYCODE
    then
      : # python already printed a friendly message
    fi
  else
    echo 'Weather data unavailable (empty response)'
  fi
} >"$TMPFILE"

mv "$TMPFILE" "$OUTFILE"

END_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)
write_state "$FAIL" "$END_TIME"

exit $FAIL
