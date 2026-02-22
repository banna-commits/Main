#!/usr/bin/env python3
"""Query Mem0 memory store with logging and configurable limits."""

import sys
import json
import time
from mem0 import Memory
from pathlib import Path
from datetime import datetime

WORKSPACE = Path("/Users/knut/.openclaw/workspace")
LOG_FILE = WORKSPACE / "memory" / "mem0-query-log.jsonl"

config = {
    'llm': {'provider': 'ollama', 'config': {'model': 'qwen3-fast', 'ollama_base_url': 'http://localhost:11434'}},
    'embedder': {'provider': 'ollama', 'config': {'model': 'snowflake-arctic-embed2'}},
    'vector_store': {'provider': 'qdrant', 'config': {
        'collection_name': 'banna_memories',
        'path': str(WORKSPACE / 'mem0-db'),
        'on_disk': True,
        'embedding_model_dims': 1024
    }},
    'version': 'v1.1'
}

MAX_RESULTS = 5  # Cap at 5 results per query
MIN_SCORE = 0.25  # Filter out low-relevance noise

def query(text, limit=MAX_RESULTS, min_score=MIN_SCORE):
    m = Memory.from_config(config)
    start = time.time()
    results = m.search(text, user_id='knut', limit=limit)
    elapsed = time.time() - start
    
    hits = results.get('results', [])
    # Filter by min score
    hits = [h for h in hits if h.get('score', 0) >= min_score]
    
    # Log query
    log_entry = {
        'timestamp': datetime.now().isoformat(),
        'query': text,
        'results': len(hits),
        'top_score': hits[0]['score'] if hits else 0,
        'elapsed_ms': round(elapsed * 1000),
        'filtered_out': len(results.get('results', [])) - len(hits)
    }
    LOG_FILE.parent.mkdir(exist_ok=True)
    with open(LOG_FILE, 'a') as f:
        f.write(json.dumps(log_entry) + '\n')
    
    return hits, elapsed

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: mem0-query.py <query> [limit]")
        sys.exit(1)
    
    q = sys.argv[1]
    limit = int(sys.argv[2]) if len(sys.argv) > 2 else MAX_RESULTS
    
    hits, elapsed = query(q, limit=limit)
    
    print(f"🔍 \"{q}\" → {len(hits)} results ({elapsed*1000:.0f}ms)")
    for h in hits:
        score = h.get('score', 0)
        mem = h.get('memory', '')[:120]
        meta = h.get('metadata', {})
        source = meta.get('source', '?')
        print(f"  [{score:.2f}] ({source}) {mem}")
