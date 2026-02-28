#!/bin/bash
set -euo pipefail

WORKSPACE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SANDBOX_DIR="${SANDBOX_DIR:-$WORKSPACE_DIR/sandbox}"
DRY_RUN=0

usage() {
  cat <<USAGE
Usage: $0 [--dry-run] <sandbox-path> <workspace-destination>

  <sandbox-path>           Path inside \"${SANDBOX_DIR}\" (file or folder) to export
  <workspace-destination>  Destination relative to workspace root (${WORKSPACE_DIR})

Examples:
  $0 build/output dist/latest-build
  $0 --dry-run tmp/report.md reports/today.md

Environment:
  SANDBOX_DIR  Override sandbox root (default: ${SANDBOX_DIR})
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      usage
      exit 0
      ;;
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    --)
      shift
      break
      ;;
    -*)
      echo "Unknown option: $1" >&2
      usage
      exit 1
      ;;
    *)
      break
      ;;
  esac
done

if [[ $# -lt 2 ]]; then
  usage >&2
  exit 1
fi

SRC_REL="$1"
DST_REL="$2"
SRC_PATH="$SANDBOX_DIR/$SRC_REL"
DST_PATH="$WORKSPACE_DIR/$DST_REL"

if [[ ! -e "$SRC_PATH" ]]; then
  echo "Sandbox source does not exist: $SRC_PATH" >&2
  exit 1
fi

mkdir -p "$(dirname "$DST_PATH")"
RSYNC_OPTS=(-avh --progress --delete-after --exclude='.git' --exclude='node_modules')
[[ $DRY_RUN -eq 1 ]] && RSYNC_OPTS+=(--dry-run)

if [[ -d "$SRC_PATH" ]]; then
  SRC_ARG="$SRC_PATH/"
  DST_ARG="$DST_PATH/"
else
  SRC_ARG="$SRC_PATH"
  DST_ARG="$DST_PATH"
fi

echo "Syncing $SRC_ARG -> $DST_ARG"
rsync "${RSYNC_OPTS[@]}" "$SRC_ARG" "$DST_ARG"

echo "Done."
