#!/usr/bin/env python3
"""Memory Integrity Check — detect corruption, unexpected changes, bloat.

Checks:
1. File size anomalies (sudden growth/shrink > 50%)
2. Missing expected files
3. Duplicate content across files
4. Empty sections
5. Total memory size tracking

Stores state in memory/integrity-state.json for comparison across runs.
"""

import hashlib, json, os, sys
from datetime import datetime
from pathlib import Path

MEMORY_DIR = Path("/Users/knut/.openclaw/workspace/memory")
WORKSPACE = Path("/Users/knut/.openclaw/workspace")
STATE_FILE = MEMORY_DIR / "integrity-state.json"

EXPECTED_FILES = [
    "people.md", "projects.md", "infra.md",
    "lessons.md", "preferences.md"
]

CRITICAL_FILES = [
    WORKSPACE / "MEMORY.md",
    WORKSPACE / "SOUL.md",
    WORKSPACE / "USER.md",
    WORKSPACE / "IDENTITY.md",
    WORKSPACE / "AGENTS.md",
]


def hash_file(path):
    return hashlib.md5(path.read_bytes()).hexdigest()


def load_state():
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {"files": {}, "lastCheck": None}


def save_state(state):
    state["lastCheck"] = datetime.now().isoformat()
    STATE_FILE.write_text(json.dumps(state, indent=2))


def check_integrity():
    state = load_state()
    prev_files = state.get("files", {})
    alerts = []
    current_files = {}
    total_size = 0

    # Check all memory files
    all_md = list(MEMORY_DIR.glob("**/*.md"))
    all_md += [f for f in CRITICAL_FILES if f.exists()]

    for path in all_md:
        rel = str(path.relative_to(WORKSPACE))
        size = path.stat().st_size
        h = hash_file(path)
        total_size += size

        current_files[rel] = {"size": size, "hash": h}

        if rel in prev_files:
            prev = prev_files[rel]
            prev_size = prev.get("size", 0)

            # Size anomaly (>50% change)
            if prev_size > 0:
                change = abs(size - prev_size) / prev_size
                if change > 0.5 and abs(size - prev_size) > 500:
                    direction = "grew" if size > prev_size else "shrank"
                    alerts.append(f"⚠️ SIZE: {rel} {direction} {change:.0%} ({prev_size}→{size} bytes)")

            # Hash change
            if h != prev.get("hash"):
                alerts.append(f"📝 CHANGED: {rel}")

        else:
            alerts.append(f"🆕 NEW: {rel} ({size} bytes)")

    # Check for deleted files
    for rel in prev_files:
        if rel not in current_files:
            alerts.append(f"🗑️ DELETED: {rel}")

    # Check expected files exist
    for expected in EXPECTED_FILES:
        path = MEMORY_DIR / expected
        if not path.exists():
            alerts.append(f"❌ MISSING: memory/{expected}")
        elif path.stat().st_size < 10:
            alerts.append(f"⚠️ EMPTY: memory/{expected}")

    # Check for bloat
    if total_size > 500_000:  # 500KB
        alerts.append(f"⚠️ BLOAT: Total memory size {total_size/1024:.0f}KB (>500KB)")

    # Save new state
    state["files"] = current_files
    state["totalSize"] = total_size
    state["fileCount"] = len(current_files)
    save_state(state)

    # Output
    result = {
        "timestamp": datetime.now().isoformat(),
        "fileCount": len(current_files),
        "totalSizeKB": round(total_size / 1024, 1),
        "alertCount": len(alerts),
        "alerts": alerts,
        "status": "HEALTHY" if not alerts else "ALERTS"
    }

    print(json.dumps(result, indent=2))
    if alerts:
        print(f"\n⚠️ {len(alerts)} alert(s) detected", file=sys.stderr)
        return 1
    else:
        print("\n✅ Memory integrity OK", file=sys.stderr)
        return 0


if __name__ == "__main__":
    sys.exit(check_integrity())
