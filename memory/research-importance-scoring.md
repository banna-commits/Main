# AI Agent Memory Importance Scoring & Spaced Repetition Research

## Key Concepts

### Importance Scoring Methods
- **LLM-based scoring**: GPT-3.5/4 rates memories from "mundane" (1) to "poignant" (10) 
- **Multi-factor scoring**: Weighted combination of recency, importance, and relevance (Generative Agents paper)
- **Access frequency tracking**: MongoDB AI-Memory uses reinforcement through repeated access
- **Priority scoring**: Mem0 uses contextual tagging and priority assessment to prevent memory bloat
- **Automatic assessment**: AI systems evaluate new information importance before storage

### Spaced Repetition for AI Memory
- **Memory decay mechanics**: Less useful memories fade while frequently accessed ones stay sharp (Memoripy)
- **Reinforcement cycles**: Memories strengthen through repeated retrieval and relevance
- **Threshold-based reflection**: Generative Agents generate reflections when cumulative importance scores exceed thresholds
- **Dynamic intervals**: Spaced repetition adapted from human learning with increasing intervals
- **Semantic clustering**: Similar memories grouped to optimize reinforcement patterns

### Memory Architecture Components
- **Hierarchical storage**: Short-term and long-term memory with different decay rates
- **Semantic search**: Vector embeddings for context-aware retrieval
- **Hybrid retrieval**: Combines vector similarity and keyword matching
- **Memory networks**: Connected knowledge structures that prioritize important information
- **Reflection generation**: Higher-level summaries created from accumulated experiences

### Forgetting Curve Adaptations
- **Momentum loss**: Discrete memories decay through reduced access momentum
- **Exponential decay**: Based on Ebbinghaus curve but adapted for AI context
- **Access-based reinforcement**: Recent and frequent access prevents decay
- **Contextual relevance**: Memories maintained based on current task relevance
- **Eviction policies**: Built-in expiration and cleanup mechanisms

## Practical Implementation Ideas

### For Our System
1. **Scoring pipeline**: Use LLM to rate daily events/decisions on 1-10 importance scale
2. **Multi-factor retrieval**: Score = α*recency + β*importance + γ*relevance (all α=1 initially)
3. **Reflection triggers**: Generate summaries when importance scores exceed threshold (e.g., sum > 50)
4. **Memory decay**: Implement exponential decay with access-based reinforcement counters
5. **Hierarchical structure**: Daily logs → weekly summaries → long-term memories
6. **Access tracking**: Log retrieval frequency and recency for each memory
7. **Semantic clustering**: Group related memories for batch reinforcement
8. **Eviction strategy**: Auto-archive low-importance, old memories to prevent bloat