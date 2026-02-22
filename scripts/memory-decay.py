#!/usr/bin/env python3
"""memory-decay.py — Consolidate weekly memory files via Ollama summarization.

Usage:
  python3 memory-decay.py --week 2026-W07          # consolidate one week
  python3 memory-decay.py --archive 2026-02-14.md   # extract highlights + archive
  python3 memory-decay.py --auto                    # process all pending (from consolidate.sh)
  python3 memory-decay.py --dry-run --auto          # show what would happen
"""

import argparse, glob, json, os, shutil, sys
from datetime import datetime
from pathlib import Path
import urllib.request, urllib.error

MEMORY_DIR = Path("/Users/knut/.openclaw/workspace/memory")
ARCHIVE_DIR = MEMORY_DIR / "archive"
WEEKLY_DIR = MEMORY_DIR / "weekly"
OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
MODEL = "qwen3-fast"


def ollama_summarize(prompt: str) -> str:
    """Call Ollama for summarization."""
    data = json.dumps({
        "model": MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": 0.3, "num_predict": 1024}
    }).encode()
    req = urllib.request.Request(OLLAMA_URL, data=data,
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read()).get("response", "").strip()


def read_files(filenames: list[str]) -> dict[str, str]:
    """Read memory files, return {filename: content}."""
    result = {}
    for fn in filenames:
        path = MEMORY_DIR / fn
        if path.exists():
            result[fn] = path.read_text(encoding="utf-8")
    return result


def load_importance_scores() -> dict:
    """Load importance scores to prioritize what survives decay."""
    scores_file = MEMORY_DIR / "importance-scores.json"
    if scores_file.exists():
        return json.loads(scores_file.read_text()).get("scores", {})
    return {}


def consolidate_week(week: str, filenames: list[str], dry_run: bool = False):
    """Consolidate daily files into a weekly digest."""
    outfile = WEEKLY_DIR / f"{week}.md"
    if outfile.exists():
        print(f"  ⏭  {week} already exists, skipping")
        return

    contents = read_files(filenames)
    if not contents:
        print(f"  ⚠  No files found for {week}")
        return

    # Load importance scores to guide summarization
    scores = load_importance_scores()
    high_importance = []
    for fn in sorted(contents):
        for key, data in scores.items():
            if key.startswith(fn) and data.get("score", 0) >= 7:
                high_importance.append(f"[IMPORTANT] {key}: {data.get('reason', '')}")

    combined = "\n\n---\n\n".join(
        f"## {fn}\n{text}" for fn, text in sorted(contents.items())
    )

    if dry_run:
        print(f"  🔍 Would consolidate {len(contents)} files → {outfile.name}")
        for fn in sorted(contents): print(f"     - {fn}")
        return

    importance_hint = ""
    if high_importance:
        importance_hint = "\n\nHigh-importance sections to preserve:\n" + "\n".join(high_importance[:10])

    prompt = f"""/no_think
Summarize these daily memory logs into a concise weekly digest.
Focus on: key decisions, important events, lessons learned, people/projects mentioned, unresolved items.
Use markdown. Be concise — max 40 lines. Skip routine/repetitive entries.
Week: {week}{importance_hint}

{combined}"""

    print(f"  🔄 Summarizing {len(contents)} files for {week}...")
    summary = ollama_summarize(prompt)

    header = f"# Weekly Digest: {week}\n\n*Consolidated from {len(contents)} daily files on {datetime.now().strftime('%Y-%m-%d')}*\n\n"
    outfile.write_text(header + summary, encoding="utf-8")
    print(f"  ✅ Written {outfile.name}")

    # Archive originals
    for fn in contents:
        src = MEMORY_DIR / fn
        dst = ARCHIVE_DIR / fn
        shutil.move(str(src), str(dst))
        print(f"  📦 Archived {fn}")


def archive_old(filename: str, dry_run: bool = False):
    """Extract highlights from old file and archive it."""
    path = MEMORY_DIR / filename
    if not path.exists():
        print(f"  ⚠  {filename} not found")
        return

    if dry_run:
        print(f"  🔍 Would extract highlights from {filename} → archive")
        return

    content = path.read_text(encoding="utf-8")

    prompt = f"""/no_think
Extract only the most significant highlights from this daily log.
Return max 5 bullet points of things worth remembering long-term.
Skip routine tasks, failed attempts, and temporary details.

{content}"""

    print(f"  🔄 Extracting highlights from {filename}...")
    highlights = ollama_summarize(prompt)

    # Append highlights to a highlights file
    highlights_file = WEEKLY_DIR / "highlights-archive.md"
    with open(highlights_file, "a", encoding="utf-8") as f:
        f.write(f"\n## {filename}\n{highlights}\n")

    shutil.move(str(path), str(ARCHIVE_DIR / filename))
    print(f"  ✅ Archived {filename}, highlights saved")


def auto_process(dry_run: bool = False):
    """Process all pending files from consolidate.sh output."""
    # Process weekly consolidations
    for wf in sorted(glob.glob("/tmp/memory-week-*.txt")):
        week = Path(wf).stem.replace("memory-week-", "")
        files = Path(wf).read_text().strip().split()
        files = [f for f in files if f]
        if files:
            print(f"\n📙 Week {week}:")
            consolidate_week(week, files, dry_run)
            if not dry_run:
                os.remove(wf)

    # Process old files
    old_file = Path("/tmp/memory-old.txt")
    if old_file.exists():
        files = old_file.read_text().strip().split()
        files = [f for f in files if f]
        if files:
            print(f"\n📕 Archiving {len(files)} old files:")
            for fn in files:
                archive_old(fn, dry_run)
            if not dry_run:
                os.remove(str(old_file))


def categorize(dry_run: bool = False):
    """Scan memory files and categorize by age."""
    import re
    from datetime import timedelta

    now = datetime.now()
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)

    fresh, recent, old = [], [], []
    weekly_groups: dict[str, list[str]] = {}

    pattern = re.compile(r"^(\d{4}-\d{2}-\d{2})")
    for fn in sorted(os.listdir(MEMORY_DIR)):
        m = pattern.match(fn)
        if not m or not fn.endswith(".md"):
            continue
        file_date = datetime.strptime(m.group(1), "%Y-%m-%d")

        if file_date >= week_ago:
            fresh.append(fn)
        elif file_date >= month_ago:
            recent.append(fn)
            week = file_date.strftime("%G-W%V")
            weekly_groups.setdefault(week, []).append(fn)
        else:
            old.append(fn)

    print(f"📗 FRESH (< 7 days) — keep as-is: {len(fresh)} files")
    for f in fresh: print(f"  {f}")
    print()

    print(f"📙 RECENT (7-30 days) — consolidate to weekly: {len(recent)} files")
    for week in sorted(weekly_groups):
        files = weekly_groups[week]
        print(f"  {week} ({len(files)} files): {' '.join(files)}")
    print()

    print(f"📕 OLD (> 30 days) — archive after highlights: {len(old)} files")
    for f in old: print(f"  {f}")
    print()

    if dry_run:
        print("[DRY RUN] No changes made.")
        return

    # Write file lists for --auto to consume
    for week, files in weekly_groups.items():
        Path(f"/tmp/memory-week-{week}.txt").write_text(" ".join(files))
    Path("/tmp/memory-old.txt").write_text(" ".join(old))
    Path("/tmp/memory-recent.txt").write_text(" ".join(recent))
    print("File lists written to /tmp/memory-*.txt")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Memory decay consolidation")
    parser.add_argument("--week", help="Consolidate specific week (e.g. 2026-W07)")
    parser.add_argument("--archive", help="Archive specific file")
    parser.add_argument("--auto", action="store_true", help="Process all pending")
    parser.add_argument("--categorize", action="store_true", help="Categorize files by age")
    parser.add_argument("--dry-run", action="store_true", help="Show what would happen")
    args = parser.parse_args()

    ARCHIVE_DIR.mkdir(exist_ok=True)
    WEEKLY_DIR.mkdir(exist_ok=True)

    if args.categorize:
        categorize(args.dry_run)
    elif args.week:
        files = [f for f in os.listdir(MEMORY_DIR)
                 if f.startswith("20") and f.endswith(".md")]
        consolidate_week(args.week, files, args.dry_run)
    elif args.archive:
        archive_old(args.archive, args.dry_run)
    elif args.auto:
        auto_process(args.dry_run)
    else:
        parser.print_help()
