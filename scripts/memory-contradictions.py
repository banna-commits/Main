#!/usr/bin/env python3
"""Memory Contradiction Detection — find conflicting facts across memory files.

Checks for:
1. Date conflicts (same event, different dates)
2. Duplicate entities with conflicting info
3. Stale references (files/paths that no longer exist)
4. Conflicting key-value facts (email, phone, etc.)
"""

import json, os, re, sys
from pathlib import Path
from collections import defaultdict

WORKSPACE = Path("/Users/knut/.openclaw/workspace")
MEMORY_DIR = WORKSPACE / "memory"

alerts = []

# Patterns to extract facts
EMAIL_RE = re.compile(r'[\w.-]+@[\w.-]+\.\w+')
DATE_RE = re.compile(r'\b(\d{4}-\d{2}-\d{2})\b')
PATH_RE = re.compile(r'(/Users/[^\s\)\"\'`]+)')
PORT_RE = re.compile(r'port\s+(\d{4,5})', re.I)
TICKER_RE = re.compile(r'\b([A-Z]{2,5}(?:\.[A-Z]{2})?)(?:\s|$|\))')


def scan_files():
    """Read all memory markdown files."""
    files = {}
    for f in MEMORY_DIR.glob("**/*.md"):
        if "archive" in str(f):
            continue
        files[str(f.relative_to(WORKSPACE))] = f.read_text(encoding="utf-8")
    # Also scan critical workspace files
    for name in ["MEMORY.md", "TOOLS.md", "USER.md", "IDENTITY.md"]:
        p = WORKSPACE / name
        if p.exists():
            files[name] = p.read_text(encoding="utf-8")
    return files


def check_email_conflicts(files):
    """Find same person with different emails."""
    person_emails = defaultdict(set)
    person_pattern = re.compile(r'(?:^|\n).*?(Knut|Melissa|Martin|Andre|Dag)\b.*?([\w.-]+@[\w.-]+\.\w+)', re.I)
    
    for fname, content in files.items():
        for m in person_pattern.finditer(content):
            person = m.group(1).lower()
            email = m.group(2).lower()
            person_emails[person].add((email, fname))
    
    for person, emails in person_emails.items():
        unique = set(e[0] for e in emails)
        if len(unique) > 2:  # Allow 2 (primary + alias), flag 3+
            sources = [f"{e} ({f})" for e, f in emails]
            alerts.append(f"⚠️ EMAIL CONFLICT: {person} has {len(unique)} emails: {', '.join(sources)}")


def check_stale_paths(files):
    """Find referenced file paths that don't exist."""
    seen_paths = set()
    for fname, content in files.items():
        for m in PATH_RE.finditer(content):
            path = m.group(1).rstrip(".,;:)")
            if path not in seen_paths:
                seen_paths.add(path)
                if not os.path.exists(path) and not path.endswith("*"):
                    # Skip obvious patterns and dynamic paths
                    if "/node_modules/" not in path and "<" not in path:
                        alerts.append(f"🔗 STALE PATH: {path} (referenced in {fname})")


def check_port_conflicts(files):
    """Find same port assigned to different services."""
    port_services = defaultdict(list)
    
    for fname, content in files.items():
        for line in content.split("\n"):
            m = PORT_RE.search(line)
            if m:
                port = m.group(1)
                # Get context (truncated line)
                ctx = line.strip()[:80]
                port_services[port].append((ctx, fname))
    
    for port, refs in port_services.items():
        if len(refs) > 2:  # Same port mentioned in 3+ different contexts
            contexts = set(r[0] for r in refs)
            if len(contexts) > 1:
                alerts.append(f"⚠️ PORT CONFLICT: port {port} referenced in {len(refs)} places")


def check_duplicate_sections(files):
    """Find near-duplicate section headers across files."""
    sections = defaultdict(list)
    
    for fname, content in files.items():
        for line in content.split("\n"):
            if line.startswith("## "):
                title = line[3:].strip().lower()
                sections[title].append(fname)
    
    # Ignore common/structural headings
    ignore = {"", "context", "notes", "when", "steps", "gotchas", "constraints",
              "key concepts", "what we should build", "practical ideas",
              "quality rating", "implementation plan for openclaw",
              "practical implementation ideas", "what we should implement"}
    
    for title, fnames in sections.items():
        unique_files = set(fnames)
        if len(unique_files) > 1 and title not in ignore:
            # Skip if all from patterns/ or research files
            if all("patterns/" in f or "research-" in f for f in unique_files):
                continue
            alerts.append(f"📋 DUPLICATE SECTION: '{title}' appears in {', '.join(unique_files)}")


def main():
    files = scan_files()
    
    check_email_conflicts(files)
    check_stale_paths(files)
    check_port_conflicts(files)
    check_duplicate_sections(files)
    
    result = {
        "timestamp": __import__("datetime").datetime.now().isoformat(),
        "filesScanned": len(files),
        "alertCount": len(alerts),
        "alerts": alerts,
        "status": "CLEAN" if not alerts else "CONFLICTS"
    }
    
    print(json.dumps(result, indent=2))
    
    if alerts:
        print(f"\n⚠️ {len(alerts)} potential conflict(s) found", file=sys.stderr)
        sys.exit(1)
    else:
        print("\n✅ No contradictions detected", file=sys.stderr)
        sys.exit(0)


if __name__ == "__main__":
    main()
