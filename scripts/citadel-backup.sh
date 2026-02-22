#!/bin/bash
# Digital Citadel — Encrypted Identity Backup for BottenAnna
set -euo pipefail

WORKSPACE="$HOME/.openclaw/workspace"
AGE_PUBLIC_KEY="age135f3zjhrq849trds9699ymzr65tawkyyjmm3pgmhw0yq4q4aq5hq236s04"
BACKUP_DIR="$HOME/citadel-backups"
RETENTION=7

mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
ARCHIVE="/tmp/citadel-backup-${TIMESTAMP}.tar.gz"
ENCRYPTED="${BACKUP_DIR}/citadel-backup-${TIMESTAMP}.tar.gz.age"

EXPECTED_FILES="SELF.md SOUL.md MEMORY.md AGENTS.md USER.md TOOLS.md IDENTITY.md HEARTBEAT.md"
EXPECTED_DIRS="memory scripts"
FOUND=()
MISSING=()

for f in $EXPECTED_FILES; do
  [ -f "$WORKSPACE/$f" ] && FOUND+=("$f") || MISSING+=("$f")
done
for d in $EXPECTED_DIRS; do
  [ -d "$WORKSPACE/$d" ] && FOUND+=("$d/") || MISSING+=("$d/")
done

echo "Found ${#FOUND[@]} items: ${FOUND[*]}"
[ ${#MISSING[@]} -gt 0 ] && echo "Missing: ${MISSING[*]}"
[ ${#FOUND[@]} -eq 0 ] && echo "ERROR: Nothing to back up." && exit 1

tar -czf "$ARCHIVE" -C "$WORKSPACE" "${FOUND[@]}"
age -r "$AGE_PUBLIC_KEY" -o "$ENCRYPTED" "$ARCHIVE"
rm -f "$ARCHIVE"

SIZE=$(du -h "$ENCRYPTED" | cut -f1)
echo "Backup: $ENCRYPTED ($SIZE)"

# Prune old backups
COUNT=$(find "$BACKUP_DIR" -name "citadel-backup-*.age" -type f | wc -l | tr -d ' ')
if [ "$COUNT" -gt "$RETENTION" ]; then
  PRUNE=$((COUNT - RETENTION))
  echo "Pruning $PRUNE old backup(s)..."
  find "$BACKUP_DIR" -name "citadel-backup-*.age" -type f | sort | head -n "$PRUNE" | xargs rm -f
fi

echo "Done. $COUNT backup(s), retention: $RETENTION"
