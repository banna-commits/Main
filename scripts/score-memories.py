#!/usr/bin/env python3
"""Importance scoring for memory sections — heuristic-based (no LLM needed).

Scores each H2/H3 section 1-10 based on signals:
- Contains decision/lesson keywords → +3
- Mentions people → +2
- Mentions money/stocks/investments → +2
- Contains action items/todos → +1
- Is a routine log entry → -2
- Section length (longer = more substantial) → +1 if >200 chars
- Recency bonus → +1 if < 3 days old
"""

import json, os, re
from datetime import datetime, timedelta
from pathlib import Path

MEMORY_DIR = Path("/Users/knut/.openclaw/workspace/memory")
SCORES_FILE = MEMORY_DIR / "importance-scores.json"
DAYS = 14

DECISION_WORDS = re.compile(
    r'\b(decided|decision|chose|switched|migrated|launched|deployed|fixed|'
    r'lesson|learned|mistake|insight|important|critical|breakthrough|'
    r'bestemt|valgte|lærte|viktig)\b', re.I)
PEOPLE_WORDS = re.compile(
    r'\b(Knut|Melissa|Martin|Andre|Dag|Eloise)\b')
MONEY_WORDS = re.compile(
    r'\b(invest|stock|portfolio|MACD|crossover|aksje|PE \d|ROE|'
    r'price|earnings|dividend|SAMPO|NOVO|PROT|BRAV|COOR|SECU|'
    r'BTC|ETH|crypto|USD|NOK|EUR)\b', re.I)
ACTION_WORDS = re.compile(
    r'\b(TODO|FIXME|action item|need to|must|should|blocked|waiting)\b', re.I)
ROUTINE_WORDS = re.compile(
    r'\b(heartbeat|HEARTBEAT_OK|routine check|no new|nothing)\b', re.I)


def find_files():
    cutoff = datetime.now() - timedelta(days=DAYS)
    files = []
    for f in sorted(MEMORY_DIR.glob("2???-??-??*.md")):
        try:
            d = datetime.strptime(f.name[:10], "%Y-%m-%d")
            if d >= cutoff:
                files.append(f)
        except ValueError:
            continue
    return files


def extract_sections(path):
    text = path.read_text(encoding="utf-8")
    sections = []
    current_title = None
    current_lines = []

    for line in text.split("\n"):
        m = re.match(r'^(#{2,3})\s+(.+)$', line)
        if m:
            if current_title and current_lines:
                content = "\n".join(current_lines).strip()
                if content:
                    sections.append((current_title, content))
            current_title = m.group(2).strip()
            current_lines = []
        elif current_title is not None:
            current_lines.append(line)

    if current_title and current_lines:
        content = "\n".join(current_lines).strip()
        if content:
            sections.append((current_title, content))
    return sections


def score_section(title, content, file_date):
    score = 3  # baseline

    if DECISION_WORDS.search(content) or DECISION_WORDS.search(title):
        score += 3
    if PEOPLE_WORDS.search(content):
        score += 2
    if MONEY_WORDS.search(content):
        score += 2
    if ACTION_WORDS.search(content):
        score += 1
    if ROUTINE_WORDS.search(content):
        score -= 2
    if len(content) > 200:
        score += 1
    if (datetime.now() - file_date).days < 3:
        score += 1

    # Build reason
    reasons = []
    if DECISION_WORDS.search(content) or DECISION_WORDS.search(title):
        reasons.append("decision/lesson")
    if PEOPLE_WORDS.search(content):
        reasons.append("mentions people")
    if MONEY_WORDS.search(content):
        reasons.append("financial")
    if ACTION_WORDS.search(content):
        reasons.append("action items")
    if ROUTINE_WORDS.search(content):
        reasons.append("routine")

    return max(1, min(10, score)), ", ".join(reasons) or "general"


def main():
    files = find_files()
    print(f"Found {len(files)} memory files (last {DAYS} days)")

    existing = {}
    if SCORES_FILE.exists():
        existing = json.loads(SCORES_FILE.read_text()).get("scores", {})

    new_count = 0
    all_scores = dict(existing)

    for f in files:
        try:
            file_date = datetime.strptime(f.name[:10], "%Y-%m-%d")
        except ValueError:
            continue
        sections = extract_sections(f)
        for title, content in sections:
            key = f"{f.name}#{title}"
            if key in all_scores:
                continue
            score, reason = score_section(title, content, file_date)
            all_scores[key] = {
                "score": score,
                "reason": reason,
                "scoredAt": datetime.now().isoformat(),
                "accessCount": 0,
                "lastAccessed": None
            }
            new_count += 1

    # Save
    data = {"scores": all_scores, "updatedAt": datetime.now().isoformat()}
    SCORES_FILE.write_text(json.dumps(data, indent=2, ensure_ascii=False))

    # Summary
    vals = [v["score"] for v in all_scores.values()]
    avg = sum(vals) / len(vals) if vals else 0
    top5 = sorted(all_scores.items(), key=lambda x: x[1]["score"], reverse=True)[:5]

    print(f"New: {new_count} | Total: {len(all_scores)} | Avg: {avg:.1f}")
    print("\nTop 5:")
    for key, v in top5:
        print(f"  [{v['score']}] {key} — {v['reason']}")


if __name__ == "__main__":
    main()
