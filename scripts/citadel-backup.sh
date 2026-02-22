#!/bin/bash
# Identity Backup — Encrypted off-machine backup
# Adapted from sene1337/digital-citadel
#
# Decrypt: age -d -i key.txt -o restore.tar.gz <backup-file> && tar xzf restore.tar.gz

set -euo pipefail

WORKSPACE="${WORKSPACE:-$HOME/.openclaw/workspace}"
AGE_PUBLIC_KEY="${AGE_PUBLIC_KEY:-}"
BACKUP_DIR="${BACKUP_DIR:-$HOME/citadel-backups}"
RETENTION=${RETENTION:-7}
INCLUDE_SESSIONS="${INCLUDE_SESSIONS:-true}"

if [ -z "$AGE_PUBLIC_KEY" ]; then
  echo "ERROR: AGE_PUBLIC_KEY required. Generate: age-keygen -o key.txt"
  exit 1
fi

command -v age &>/dev/null || { echo "ERROR: age not found. brew install age"; exit 1; }
[ -d "$WORKSPACE" ] || { echo "ERROR: Workspace not found at $WORKSPACE"; exit 1; }

mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
STAGING="/tmp/citadel-staging-${TIMESTAMP}"
ENCRYPTED="${BACKUP_DIR}/citadel-backup-${TIMESTAMP}.tar.gz.age"

mkdir -p "$STAGING/workspace" "$STAGING/sessions"

# Workspace files
FILES="SOUL.md MEMORY.md AGENTS.md USER.md TOOLS.md IDENTITY.md HEARTBEAT.md"
DIRS="memory scripts"
FOUND=()

for f in $FILES; do [ -f "$WORKSPACE/$f" ] && FOUND+=("$f"); done
for d in $DIRS; do [ -d "$WORKSPACE/$d" ] && FOUND+=("$d/"); done

echo "Backing up ${#FOUND[@]} items: ${FOUND[*]}"
tar -czf - -C "$WORKSPACE" "${FOUND[@]}" | tar -xzf - -C "$STAGING/workspace" 2>/dev/null || true

# Session history
OPENCLAW_DIR="${OPENCLAW_DIR:-$HOME/.openclaw}"
if [ "$INCLUDE_SESSIONS" = "true" ] && [ -d "$OPENCLAW_DIR/agents" ]; then
  echo "Backing up session history..."
  cp -r "$OPENCLAW_DIR/agents" "$STAGING/sessions/" 2>/dev/null || true
  SESSION_COUNT=$(find "$STAGING/sessions" -name "*.jsonl" 2>/dev/null | wc -l | tr -d ' ')
  echo "Session files: $SESSION_COUNT"
fi

# Archive + encrypt
tar -czf "/tmp/citadel-${TIMESTAMP}.tar.gz" -C "$STAGING" .
age -r "$AGE_PUBLIC_KEY" -o "$ENCRYPTED" "/tmp/citadel-${TIMESTAMP}.tar.gz"

# Cleanup staging
rm -rf "$STAGING" "/tmp/citadel-${TIMESTAMP}.tar.gz"

# Prune old backups
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/citadel-backup-*.age 2>/dev/null | wc -l | tr -d ' ')
if [ "$BACKUP_COUNT" -gt "$RETENTION" ]; then
  PRUNE=$((BACKUP_COUNT - RETENTION))
  ls -1t "$BACKUP_DIR"/citadel-backup-*.age | tail -n "$PRUNE" | xargs rm -f
  echo "Pruned $PRUNE old backups"
fi

SIZE=$(du -h "$ENCRYPTED" | cut -f1)
echo "✅ Backup complete: $ENCRYPTED ($SIZE)"
