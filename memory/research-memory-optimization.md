# Memory System Optimization — Best Practices Research

**Date:** 2026-02-22
**Sources:** Mem0 paper (arxiv 2504.19413), Letta/MemGPT docs & blog, Weaviate chunking guide, Superlinked hybrid search guide, Snowflake Arctic Embed docs, Reddit/HuggingFace discussions

---

## 1. Memory Organization

### Hierarchy beats flat
Letta/MemGPT uses a 3-tier hierarchy inspired by OS memory:
- **Core memory** (in-context, always loaded) — identity, user prefs, current task. Analogous to our SOUL.md, USER.md, MEMORY.md
- **Recall memory** (searchable conversation history) — raw logs. Our `memory/YYYY-MM-DD.md`
- **Archival memory** (long-term vector store) — processed knowledge. Our Mem0/Qdrant store

**Our gap:** We load too much into core. MEMORY.md + all workspace files = context bloat. Should be more selective.

**Action:** Cap core memory at ~2000 tokens. Move everything else to retrieval-only.

### Optimal chunk sizes
From Weaviate's research:
- **Too large** (>500 tokens): embeddings become "averaged", lose specificity, retrieval degrades
- **Too small** (<50 tokens): lose context, fragment meaning
- **Sweet spot: 100-300 tokens per chunk** with semantic boundaries (paragraphs, sections)
- **Test:** "If a chunk makes sense when read alone, it'll make sense to the LLM"

**Our status:** Mem0 extracts atomic facts (~1 sentence each). OpenClaw memory_search chunks by ~200 tokens. Both are in the sweet spot.

### When to split files
- Split when a file exceeds ~60 lines or covers >3 distinct topics
- Use H2 headings as natural chunk boundaries
- Keep one topic per file section minimum

---

## 2. Retrieval Optimization

### Hybrid search weights
Industry consensus from Superlinked, Meilisearch, Microsoft:
- **General purpose:** 60-70% vector + 30-40% keyword (our current 70/30 is good)
- **Names/codes/exact terms:** Flip to 30% vector + 70% keyword
- **Semantic/conceptual queries:** 80% vector + 20% keyword
- **RRF (Reciprocal Rank Fusion)** with k=60 is industry standard for merging

**Key insight:** Vector search is bad at names, abbreviations, and exact codes. Keyword search catches these. This explains why "Melissa" failed with pure nomic — even with snowflake, keyword component is critical.

**Our config:** `vectorWeight: 0.7, textWeight: 0.3` — good default. Consider query-adaptive weights if OpenClaw supports it.

### Re-ranking
- Cross-encoder re-rankers (like Cohere rerank, bge-reranker) can boost precision 10-25%
- Works by scoring query-document pairs more deeply than embedding similarity
- **Trade-off:** Adds ~100-200ms latency per query
- **Recommendation:** Skip for now — our corpus is small enough (~100 memories) that top-k retrieval is sufficient. Add re-ranking if corpus grows past 1000 chunks.

### Query expansion
- Reformulating queries with synonyms/translations improves multilingual recall
- For Norwegian: query in both Norwegian AND English, merge results
- **Practical:** OpenClaw could pre-expand "blomster" → "blomster OR flowers OR flower ordering"

---

## 3. Memory Lifecycle

### Mem0's approach (from the paper)
Mem0 uses LLM-driven memory management with 4 operations:
1. **ADD** — new fact extracted from conversation
2. **UPDATE** — existing memory refined with new info
3. **DELETE** — contradicted or outdated memory removed
4. **NOOP** — no change needed

This happens automatically on every `m.add()` call. The LLM decides which operation to apply by comparing new info against existing memories.

**Key metric:** Mem0 achieves 26% better accuracy than OpenAI's memory, with 91% lower latency and 90% fewer tokens than full-context approaches.

### Consolidation timing
- **Daily:** Raw conversation → extract key facts (what we do with daily logs)
- **Weekly:** Review extracted facts → merge duplicates, resolve contradictions
- **Monthly:** Prune memories with low access count or outdated info

### Importance scoring that works
From Mem0 paper + Letta's sleep-time compute:
- **Recency** — recently accessed memories score higher
- **Frequency** — memories retrieved often are more important
- **Relevance** — semantic similarity to current context
- **Explicitly stated importance** — user says "remember this" = high priority

**Anti-pattern:** Pure time-based decay. Memories like "Melissa's birthday is Feb 23" should never decay regardless of recency.

### Sleep-time agents (Letta's innovation)
- Run memory maintenance during idle periods (between conversations)
- Reorganize, consolidate, and improve memory blocks asynchronously
- **Non-blocking:** Don't slow down active conversations with memory operations
- **Our equivalent:** Heartbeat-triggered memory maintenance, cron jobs for consolidation

---

## 4. Embedding Best Practices

### Query/document prefixes — CRITICAL
Many embedding models are trained with asymmetric prefixes:
- **nomic-embed-text:** `search_query:` for queries, `search_document:` for documents
- **Snowflake Arctic Embed v1:** `Represent this sentence for searching relevant passages:` prefix for queries
- **Snowflake Arctic Embed v2:** Trained without mandatory prefixes but may benefit from task-specific instructions

**Our status:** Need to verify if Ollama's snowflake-arctic-embed2 wrapper handles prefixes. If Mem0/OpenClaw aren't adding prefixes, we're leaving quality on the table.

**Action:** Test with and without prefixes, measure score differences.

### Metadata enrichment
- Add source file, section heading, date, and topic tags as metadata
- Filter by metadata before vector search to narrow the search space
- Example: searching for "calendar" → filter to source=infra.md first, then vector search

### Cross-lingual tricks
- Snowflake Arctic Embed 2 supports 100+ languages natively — major win for us
- For mixed-language corpora (Norwegian + English): embed in original language, don't translate
- Query expansion (search both languages) is more effective than translation

---

## 5. What Top Builders Are Doing

### Letta/MemGPT patterns
- **Memory blocks with character limits** — allocate fixed context budget per memory type
- **Agent-managed memory** — the agent itself decides what to remember via tool calls
- **Sleep-time compute** — background agents that improve memory quality during idle time
- **Perpetual thread** — single continuous conversation, not session-based

### Mem0 patterns
- **Dual store:** Vector DB for semantic search + Graph DB for relationships (+2% accuracy)
- **LLM-driven extraction** — Sonnet/GPT-4 extracts memories, not rules-based
- **Deduplication** — automatic via semantic similarity before insert
- **Selective retrieval** — only fetch memories above relevance threshold

### CrewAI / LangChain patterns
- **Shared memory** between agents — memories accessible across different agent roles
- **Short-term + long-term split** — conversation buffer (last N messages) + persistent store
- **Memory tools** — explicit `remember()` and `recall()` tools agents can call

### MARVIN (Reddit power user)
- **Skills system** — encode successful workflows as reusable memory (we have this: patterns/)
- **End-of-day reports** — auto-generated summary committed to git (we have end-of-day.sh)
- **Personality drives engagement** — the more personality, the more the user interacts, the better the memory gets

---

## 6. Anti-Patterns

### Memory poisoning
- Ingesting raw conversation (including errors, corrections, abandoned ideas) pollutes the store
- **Fix:** Only extract confirmed facts, not tentative statements

### Context overload
- Loading all memories into prompt destroys performance — "lost in the middle" effect
- LLMs struggle with info buried in long contexts
- **Fix:** Retrieve max 5-10 relevant memories per query, not all

### Duplicate/contradictory memories
- Without dedup, the same fact gets stored 10x with slight variations
- Contradictions confuse retrieval
- **Fix:** Mem0 handles this automatically. For manual systems: run contradiction scanner (we have this)

### Over-engineering
- Building complex memory systems before having enough data to justify them
- **Fix:** Start simple (files), add layers (vector search, graph) only when retrieval quality drops

### Ignoring evaluation
- No way to know if memory is actually helping without measuring
- **Fix:** Track: retrieval precision (% relevant results in top-3), response accuracy, user corrections per session

---

## 7. Concrete Recommendations for Our Setup

### Quick wins (do now)
1. **Verify snowflake prefix handling** — test if adding query prefixes improves scores
2. **Add metadata to Mem0 memories** — source file, date, topic tags
3. **Set memory retrieval limit** — max 5 memories per search, not unlimited
4. **Log memory search quality** — track hit rates over time

### Medium-term (this week)
5. **Enable graph memory in Mem0** — +2% accuracy for relational queries (who knows who, what connects to what)
6. **Build query expansion** — auto-search both Norwegian and English terms
7. **Create memory evaluation set** — 20 test queries with expected answers, run weekly

### Long-term (this month)
8. **Sleep-time memory agent** — during heartbeats, review and improve memory quality
9. **Adaptive hybrid weights** — detect query type (name vs concept) and adjust vector/keyword balance
10. **Cross-session memory extraction** — auto-extract memories from every conversation, not just manual ingestion
