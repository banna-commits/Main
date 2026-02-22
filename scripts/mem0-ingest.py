#!/usr/bin/env python3
"""Ingest key memory files into Mem0 for semantic retrieval."""

from mem0 import Memory
from pathlib import Path
import time

WORKSPACE = Path("/Users/knut/.openclaw/workspace")

config = {
    'llm': {'provider': 'anthropic', 'config': {'model': 'claude-sonnet-4-20250514'}},
    'embedder': {'provider': 'ollama', 'config': {'model': 'snowflake-arctic-embed2'}},
    'vector_store': {'provider': 'qdrant', 'config': {
        'collection_name': 'banna_memories',
        'path': str(WORKSPACE / 'mem0-db'),
        'on_disk': True,
        'embedding_model_dims': 1024
    }},
    'version': 'v1.1'
}

m = Memory.from_config(config)

# Key files to ingest — split into logical chunks by section
FILES = [
    "MEMORY.md",
    "memory/people.md",
    "memory/projects.md",
    "memory/infra.md",
    "memory/lessons.md",
    "memory/preferences.md",
    "memory/patterns/flower-ordering.md",
    "memory/patterns/stock-research.md",
    "memory/patterns/email-drafting.md",
    "memory/patterns/subagent-spawning.md",
    "memory/patterns/cron-job-setup.md",
]

def split_sections(text):
    """Split markdown into sections by ## headers."""
    sections = []
    current = []
    for line in text.split('\n'):
        if line.startswith('## ') and current:
            sections.append('\n'.join(current).strip())
            current = [line]
        else:
            current.append(line)
    if current:
        sections.append('\n'.join(current).strip())
    return [s for s in sections if len(s) > 20]  # skip tiny fragments

total = 0
errors = 0

for fname in FILES:
    path = WORKSPACE / fname
    if not path.exists():
        print(f"⚠️  SKIP: {fname} not found")
        continue
    
    text = path.read_text(encoding='utf-8')
    sections = split_sections(text)
    print(f"\n📄 {fname} — {len(sections)} sections")
    
    for i, section in enumerate(sections):
        # Truncate very long sections
        if len(section) > 2000:
            section = section[:2000] + "..."
        
        try:
            result = m.add(section, user_id='knut', metadata={'source': fname, 'section': i})
            added = len(result.get('results', []))
            total += added
            print(f"  ✅ Section {i+1}/{len(sections)}: +{added} memories")
        except Exception as e:
            errors += 1
            print(f"  ❌ Section {i+1}/{len(sections)}: {e}")

print(f"\n{'='*40}")
print(f"✅ Done: {total} memories added, {errors} errors")

# Final count
all_memories = m.get_all(user_id='knut')
print(f"📊 Total memories in store: {len(all_memories.get('results', []))}")
