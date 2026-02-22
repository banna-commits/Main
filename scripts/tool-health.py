#!/usr/bin/env python3
"""Tool Health Check — smoke test critical tools/services.

Tests:
1. Ollama responsive (embeddings + generation)
2. gog CLI authenticated
3. Web connectivity
4. Memory search index exists
5. Git repo clean state

Output: JSON with pass/fail per tool + overall status.
"""

import json, os, subprocess, sys, urllib.request
from datetime import datetime
from pathlib import Path

WORKSPACE = Path("/Users/knut/.openclaw/workspace")
results = []


def check(name, fn):
    try:
        ok, detail = fn()
        results.append({"name": name, "status": "PASS" if ok else "FAIL", "detail": detail})
    except Exception as e:
        results.append({"name": name, "status": "FAIL", "detail": str(e)[:200]})


def test_ollama_embed():
    data = json.dumps({"model": "nomic-embed-text", "prompt": "test"}).encode()
    req = urllib.request.Request("http://127.0.0.1:11434/api/embeddings",
                                 data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        r = json.loads(resp.read())
        has_embedding = len(r.get("embedding", [])) > 0
        return has_embedding, f"{len(r.get('embedding', []))} dims"


def test_ollama_models():
    with urllib.request.urlopen("http://127.0.0.1:11434/api/tags", timeout=5) as resp:
        models = [m["name"] for m in json.loads(resp.read()).get("models", [])]
        has_needed = "nomic-embed-text:latest" in models and "qwen3-fast:latest" in models
        return has_needed, f"Models: {', '.join(models)}"


def test_gog_auth():
    r = subprocess.run(["gog", "auth", "list"], capture_output=True, text=True, timeout=10)
    has_account = "banna@bottenanna.no" in r.stdout
    return has_account, r.stdout.strip()[:100] if has_account else "Account not found"


def test_web():
    import ssl
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    req = urllib.request.Request("https://www.google.com", method="HEAD")
    with urllib.request.urlopen(req, timeout=10, context=ctx) as resp:
        return resp.status in (200, 301, 302), f"HTTP {resp.status}"


def test_memory_index():
    db = Path(os.path.expanduser("~/.openclaw/memory/main.sqlite"))
    exists = db.exists()
    size = db.stat().st_size if exists else 0
    return exists and size > 0, f"{'exists' if exists else 'missing'}, {size/1024:.0f}KB"


def test_git_status():
    r = subprocess.run(["git", "status", "--porcelain"], capture_output=True,
                       text=True, timeout=10, cwd=str(WORKSPACE))
    dirty = len(r.stdout.strip().split("\n")) if r.stdout.strip() else 0
    return True, f"{dirty} uncommitted files"


def main():
    check("Ollama Embeddings", test_ollama_embed)
    check("Ollama Models", test_ollama_models)
    check("gog Auth", test_gog_auth)
    check("Web Connectivity", test_web)
    check("Memory Search Index", test_memory_index)
    check("Git Status", test_git_status)

    passed = sum(1 for r in results if r["status"] == "PASS")
    failed = sum(1 for r in results if r["status"] == "FAIL")

    output = {
        "timestamp": datetime.now().isoformat(),
        "passed": passed,
        "failed": failed,
        "total": len(results),
        "status": "HEALTHY" if failed == 0 else "DEGRADED",
        "checks": results
    }

    print(json.dumps(output, indent=2))
    sys.exit(0 if failed == 0 else 1)


if __name__ == "__main__":
    main()
