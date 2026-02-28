#!/bin/bash
set -euo pipefail

WORKSPACE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SANDBOX_ROOT="${SANDBOX_DIR:-$WORKSPACE_DIR/sandbox}"
COMMAND=""
TASK_NAME="sandbox-task-$(date +%Y%m%d-%H%M%S)"
KEEP=0
SYNC_ARGS=()

usage() {
  cat <<USAGE
Usage: $0 [options] -- <command...>

Options:
  -n, --name NAME        Name of sandbox folder (default: timestamp)
  -k, --keep             Keep sandbox directory after run (default: delete)
  -s, --sync SRC:DST     Sync paths back via sandbox-sync.sh (repeatable)
  --dry-run              Show actions without executing command
  -h, --help             Show this help

Examples:
  $0 -- sandbox-run "codex exec --full-auto 'Build feature X'"
  $0 -n yf-trends -s build/output:dist/yf -- codex exec --full-auto 'Finish trends'
USAGE
}

dry_run=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    -n|--name)
      TASK_NAME="$2"
      shift 2
      ;;
    -k|--keep)
      KEEP=1
      shift
      ;;
    -s|--sync)
      SYNC_ARGS+=("$2")
      shift 2
      ;;
    --dry-run)
      dry_run=1
      shift
      ;;
    --)
      shift
      COMMAND="$*"
      break
      ;;
    -h|--help)
      usage; exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage; exit 1
      ;;
  esac
done

if [[ -z "$COMMAND" ]]; then
  echo "Error: missing command" >&2
  usage
  exit 1
fi

mkdir -p "$SANDBOX_ROOT"
SANDBOX_DIR="$SANDBOX_ROOT/$TASK_NAME"

if [[ -e "$SANDBOX_DIR" ]]; then
  echo "Sandbox already exists: $SANDBOX_DIR" >&2
  exit 1
fi

echo "Creating sandbox: $SANDBOX_DIR"
mkdir -p "$SANDBOX_DIR"
rsync -a --exclude='.git' --exclude='node_modules' --exclude='mem0-db' --exclude='sandbox' --exclude='*.png' "$WORKSPACE_DIR/" "$SANDBOX_DIR/"

if [[ $dry_run -eq 1 ]]; then
  echo "[Dry run] Command: $COMMAND"
else
  echo "Running command in sandbox..."
  (cd "$SANDBOX_DIR" && eval "$COMMAND")
fi

if [[ ${#SYNC_ARGS[@]} -gt 0 ]]; then
  for pair in "${SYNC_ARGS[@]}"; do
  IFS=':' read -r src dst <<<"$pair"
  if [[ -z "$src" || -z "$dst" ]]; then
    echo "Invalid sync pair: $pair" >&2
    continue
  fi
  echo "Syncing $src -> $dst"
  "$WORKSPACE_DIR/scripts/sandbox-sync.sh" "$TASK_NAME/$src" "$dst"
  done
fi

if [[ $KEEP -eq 0 ]]; then
  echo "Removing sandbox $SANDBOX_DIR"
  rm -rf "$SANDBOX_DIR"
else
  echo "Sandbox kept at $SANDBOX_DIR"
fi
