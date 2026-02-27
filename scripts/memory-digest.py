#!/usr/bin/env python3
"""memory-digest.py — Summarize daily memory logs into structured weekly digests."""

from __future__ import annotations

import argparse
import json
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List
import urllib.request
import urllib.error

WORKDIR = Path("/Users/knut/.openclaw/workspace")
MEMORY_DIR = WORKDIR / "memory"
DIGEST_DIR = MEMORY_DIR / "digests"
LESSONS_FILE = MEMORY_DIR / "lessons.md"
OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://127.0.0.1:11434/api/generate")
MODEL = os.environ.get("MEMORY_DIGEST_MODEL", "qwen3-fast")


def call_ollama(prompt: str) -> str:
    payload = {
        "model": MODEL,
        "prompt": prompt,
        "stream": True,
        "options": {
            "temperature": 0.0,
            "num_predict": 900
        }
    }
    data = json.dumps(payload).encode()
    req = urllib.request.Request(OLLAMA_URL, data=data, headers={"Content-Type": "application/json"})

    chunks: List[str] = []
    buffer = b""

    done = False
    with urllib.request.urlopen(req, timeout=120) as resp:
        while True:
            chunk = resp.read(1024)
            if not chunk:
                break
            buffer += chunk
            while b"\n" in buffer:
                line, buffer = buffer.split(b"\n", 1)
                line = line.strip()
                if not line:
                    continue
                try:
                    obj = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if "response" in obj:
                    chunks.append(obj.get("response", ""))
                if obj.get("done"):
                    done = True
                    break
            if done:
                break

    if not done and buffer.strip():
        try:
            obj = json.loads(buffer)
            chunks.append(obj.get("response", ""))
            done = obj.get("done", False)
        except json.JSONDecodeError:
            pass

    if not done:
        raise RuntimeError("Ollama stream ended without done flag")

    return "".join(chunks).strip()


def extract_json(raw: str) -> Dict:
    start = raw.find("{")
    end = raw.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("No JSON object in model response")
    snippet = raw[start:end + 1]
    return json.loads(snippet)


def build_prompt(date_str: str, weekday: str, content: str) -> str:
    return f"""/no_think
You compress a daily operations log into structured highlights.
Return STRICT JSON with this schema (all arrays, even if empty):
{{
  "decisions": [],
  "incidents": [],
  "lessons": [],
  "next_steps": [],
  "people_updates": [],
  "project_updates": []
}}
Rules:
- Keep each bullet under 160 characters.
- Only include material consequences, not routine heartbeats.
- Mention owners / stakeholders when relevant.
- Prefer Norwegian names/terms as written.
- If a section has nothing useful, return an empty array.

Date: {date_str} ({weekday})
Log:
<<<LOG>>>
{content.strip()}
<<<END LOG>>>
"""


def format_section(title: str, items: List[str]) -> str:
    if not items:
        return ""
    body = "\n".join(f"- {item}" for item in items)
    return f"### {title}\n{body}\n\n"


def append_lessons(date_str: str, lessons: List[str]):
    if not lessons:
        return
    header = f"\n## {date_str}\n"
    body = "\n".join(f"- {item}" for item in lessons)
    with open(LESSONS_FILE, "a", encoding="utf-8") as f:
        f.write(header + body + "\n")


def write_digest(date_obj: datetime, data: Dict[str, List[str]], content_hash: str):
    DIGEST_DIR.mkdir(exist_ok=True)
    year, week, _ = date_obj.isocalendar()
    digest_file = DIGEST_DIR / f"{year}-W{week:02d}.md"
    date_str = date_obj.strftime("%Y-%m-%d")
    weekday = date_obj.strftime("%A")

    entry_header = f"## {date_str} ({weekday})\n"
    entry_body = (
        format_section("Decisions", data.get("decisions", [])) +
        format_section("Incidents", data.get("incidents", [])) +
        format_section("Lessons", data.get("lessons", [])) +
        format_section("Next", data.get("next_steps", [])) +
        format_section("People", data.get("people_updates", [])) +
        format_section("Projects", data.get("project_updates", []))
    )

    if not digest_file.exists():
        digest_file.write_text(f"# Weekly Digest {year}-W{week:02d}\n\n", encoding="utf-8")

    existing = digest_file.read_text(encoding="utf-8")
    if entry_header in existing:
        raise RuntimeError(f"Digest entry for {date_str} already exists")

    with open(digest_file, "a", encoding="utf-8") as f:
        f.write(entry_header)
        f.write(entry_body or "(Ingen nye punkter)\n\n")

    append_lessons(date_str, data.get("lessons", []))

    state = {
        "date": date_str,
        "digest": digest_file.name,
        "contentHash": content_hash,
        "sections": {k: len(v) for k, v in data.items()}
    }
    state_file = DIGEST_DIR / "state.json"
    if state_file.exists():
        try:
            history = json.loads(state_file.read_text())
        except json.JSONDecodeError:
            history = {}
    else:
        history = {}
    history[date_str] = state
    state_file.write_text(json.dumps(history, indent=2), encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description="Summarize daily memory into weekly digest")
    parser.add_argument("--date", help="Date (YYYY-MM-DD), default today")
    args = parser.parse_args()

    date_str = args.date or datetime.now().strftime("%Y-%m-%d")
    target = datetime.strptime(date_str, "%Y-%m-%d")
    daily_file = MEMORY_DIR / f"{date_str}.md"
    if not daily_file.exists():
        raise FileNotFoundError(f"Daily memory file missing: {daily_file}")

    content = daily_file.read_text(encoding="utf-8")
    prompt = build_prompt(date_str, target.strftime("%A"), content)
    raw = call_ollama(prompt)
    data = extract_json(raw)
    content_hash = f"{len(content)}:{hash(content)}"
    write_digest(target, data, content_hash)
    print(f"Digest entry created for {date_str}")


if __name__ == "__main__":
    main()
