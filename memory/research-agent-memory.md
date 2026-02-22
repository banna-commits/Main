# AI Agent Memory Systems Research

## MemGPT/Letta
- **Architecture**: Two-tier memory system inspired by OS virtual memory
- **Tier 1 (Main Context)**: Core memories kept in LLM's context window (like RAM)
- **Tier 2 (External Context)**: Recall storage + archival storage (like disk storage)
- **Memory Management**: Agent uses function calls to move data between tiers
- **Retrieval**: FIFO queue for working context, semantic search for archival
- **Novel Technique**: "Interrupts" to pause agent and manage control flow
- **Forgetting**: Manual management via function calls (archival_memory_search, core_memory_replace)

## Zep
- **Architecture**: Temporal knowledge graph (Graph RAG) powered by Graphiti engine
- **Memory Structure**: Dynamic knowledge graph with temporal awareness
- **Entities & Relations**: Automatically extracts entities and relationships over time
- **Retrieval**: 200ms context retrieval optimized for voice AI, Graph RAG queries
- **Novel Technique**: Temporally-aware KG that evolves relationships dynamically
- **Benchmark**: Outperforms MemGPT on Deep Memory Retrieval (DMR) tasks
- **Forgetting**: Graph decay mechanisms (implicit through temporal scoring)

## Mem0
- **Architecture**: Hierarchical memory at user/session/agent levels
- **Memory Types**: Factual (preferences), Episodic (summaries), Semantic (concepts)
- **Short-term**: Session-based working memory that fades after conversations
- **Long-term**: Cross-session persistent memory with user profiles
- **Retrieval**: Dual-tower dense retrieval model for contextual relevance
- **Novel Technique**: Dynamic forgetting with relevance decay over time
- **Updating**: Human-like forgetting mechanism that decays low-relevance entries
- **Personalization**: Evolving user personality profiles across interactions

## Key Takeaways
- **Hierarchical Tiers**: All systems use multiple memory levels (working/archival)
- **Temporal Awareness**: Time-based relevance scoring improves retrieval accuracy
- **Graph Relationships**: Knowledge graphs capture entity connections better than vectors alone
- **Dynamic Forgetting**: Active decay prevents memory pollution, maintains relevance
- **Function-Based Control**: Agent-initiated memory operations enable intelligent management
- **Hybrid Retrieval**: Combining semantic search with graph traversal improves context assembly
- **Personalization Layers**: User/session/global scoping enables appropriate context boundaries
- **Performance Focus**: Sub-200ms retrieval is critical for real-time applications