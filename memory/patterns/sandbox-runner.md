# Sandbox Runner Pattern

**When to use:**
- Risky commands that might trash the workspace (npm install, large refactors, destructive scripts)
- Experiments that need temporary build artifacts before deciding what to sync back
- Any time we want clean diffs by copying only selected outputs into git

**Steps:**
1. `cd /Users/knut/.openclaw/workspace`
2. Run `scripts/sandbox-run.sh -n <name> [--sync SRC:DST ...] -- <command>`
   - Example: `scripts/sandbox-run.sh -n yf-trends -s dist:dist/yf -- npm run build`
3. Script rsyncs workspace → `sandbox/<name>` (gitignored), executes command, and reports status.
4. If `-s/--sync` used, artifacts copy back automatically after command succeeds.
5. Default cleans the sandbox folder on success; add `--keep` to inspect outputs.

**Gotchas:**
- Path arguments in `--sync` are relative to sandbox root on the left, workspace root on the right.
- Remember to add `--dry-run` when validating long sync lists.
- Sandbox inherits workspace `.env`; override vars inline if test-specific.

**Quality:** ⭐⭐⭐⭐ — reliable for isolating npm builds and cron script rewrites.
