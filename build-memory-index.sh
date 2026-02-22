#!/bin/bash
# Builds memory-index.json from MEMORY.md + memory/*.md for Mission Control
cd /Users/knut/.openclaw/workspace

python3 << 'PYEOF'
import json, os, glob, re
from datetime import datetime

files = []

# MEMORY.md (long-term)
if os.path.exists("MEMORY.md"):
    with open("MEMORY.md") as f:
        content = f.read()
    files.append({
        "path": "MEMORY.md",
        "name": "Long-Term Memory",
        "type": "longterm",
        "date": datetime.fromtimestamp(os.path.getmtime("MEMORY.md")).strftime("%Y-%m-%d"),
        "modified": datetime.fromtimestamp(os.path.getmtime("MEMORY.md")).isoformat(),
        "size": len(content),
        "content": content,
        "sections": [s.strip() for s in re.findall(r'^## (.+)$', content, re.MULTILINE)]
    })

# Daily logs
for path in sorted(glob.glob("memory/*.md"), reverse=True):
    fname = os.path.basename(path)
    if not fname.endswith('.md'):
        continue
    with open(path) as f:
        content = f.read()
    
    # Extract date from filename
    date_match = re.match(r'(\d{4}-\d{2}-\d{2})', fname)
    date = date_match.group(1) if date_match else fname.replace('.md','')
    
    # Friendly name
    name = fname.replace('.md','')
    
    files.append({
        "path": "memory/" + fname,
        "name": name,
        "type": "daily",
        "date": date,
        "modified": datetime.fromtimestamp(os.path.getmtime(path)).isoformat(),
        "size": len(content),
        "content": content,
        "sections": [s.strip() for s in re.findall(r'^## (.+)$', content, re.MULTILINE)]
    })

# Identity + Soul + User (reference docs)
for ref in ["IDENTITY.md", "SOUL.md", "USER.md"]:
    if os.path.exists(ref):
        with open(ref) as f:
            content = f.read()
        files.append({
            "path": ref,
            "name": ref.replace('.md',''),
            "type": "reference",
            "date": datetime.fromtimestamp(os.path.getmtime(ref)).strftime("%Y-%m-%d"),
            "modified": datetime.fromtimestamp(os.path.getmtime(ref)).isoformat(),
            "size": len(content),
            "content": content,
            "sections": [s.strip() for s in re.findall(r'^## (.+)$', content, re.MULTILINE)]
        })

index = {
    "lastUpdated": datetime.now().isoformat(),
    "totalFiles": len(files),
    "totalSize": sum(f["size"] for f in files),
    "files": files
}

with open("memory-index.json", "w") as f:
    json.dump(index, f, indent=2, ensure_ascii=False)

print(f"Indexed {len(files)} files, {sum(f['size'] for f in files)} bytes")
PYEOF
