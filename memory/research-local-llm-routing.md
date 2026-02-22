# Local LLM Routing Best Practices Research - Feb 2026

## Key Findings

**7-8B Model Capabilities:**
- Strong at: Basic coding, simple Q&A, straightforward conversations, instruction following, basic reasoning
- Weak at: Complex multi-step reasoning, specialized domain knowledge, nuanced analysis, advanced math
- Sweet spot: General-purpose applications requiring 20+ tokens/second on consumer hardware (8-16GB RAM)

**Performance Benchmarks (M1 MacBook Pro, 16GB):**
- Cold start: ~22s, Warm start: ~2s
- Local Ollama: ~0.45s avg response time vs OpenAI: ~0.60s (including network)
- 7B models: 15-25 tokens/second, 8-16GB RAM usage
- 13B models: 8-15 tokens/second, 18-22GB RAM usage

**Task Complexity Thresholds:**
- Simple/Fast (1-7B): Basic assistance, quick lookups, simple coding, straightforward text completion
- Moderate (7-13B): Code generation, creative writing, tutoring, instruction following, decent reasoning
- Complex (13-30B): Advanced analysis, sophisticated coding, research tasks, nuanced conversations
- Expert (30B+): Multi-step reasoning, specialized domains, complex problem-solving, professional tasks

**Ollama Optimization Strategies:**
- Preload models on startup to avoid 20s cold boot penalty
- Use model hot-swapping: lightweight (mistral) + heavyweight (llama3) combo
- Quantization: FP16 halves memory, INT8 quarters it, INT4 reduces by 75%
- Batch processing: Group similar requests to improve throughput
- Environment variables for model switching without code changes

**Context Window Management:**
- Small models struggle with long contexts - keep prompts focused and concise
- Use "/no_think" or similar techniques to prevent verbose reasoning loops
- Rolling window for multi-turn conversations to preserve memory
- Compress context between turns rather than expanding indefinitely

**Cost Optimization Areas:**
- Code generation/review saves most money locally (frequent, repetitive)
- Data analysis and schema validation (privacy + cost benefits)
- Simple Q&A and documentation tasks
- Iterative workflows with fast feedback loops
- Development/testing environments (no per-token costs)

**Prompt Engineering for Small Models:**
- Be direct and specific - avoid verbose instructions
- Use examples more than explanations
- Single-shot over multi-shot when possible
- Shorter system prompts work better
- Structured outputs (JSON, lists) over free-form text

## Routing Rules for Our System

**Use Qwen3-Fast (local 8B) for:**
- Simple coding tasks (single function, debugging, refactoring)
- Quick Q&A and information lookup  
- Basic text editing and formatting
- Schema validation and data quality checks
- Fast iterations during development
- Batch processing of similar simple tasks
- Any task requiring <5s response time
- Privacy-sensitive operations

**Use Sonnet (cloud) for:**
- Complex reasoning and analysis
- Multi-step problem solving
- Creative writing requiring nuance
- Research synthesis and summarization
- Tasks requiring broad knowledge
- Code architecture and design decisions
- When accuracy is more important than speed

**Use Opus (cloud) for:**
- Expert-level analysis and consultation
- Complex multi-agent coordination
- High-stakes decision support
- Advanced research and writing
- When maximum capability is required regardless of cost
- Complex mathematical or technical reasoning

**Hybrid Patterns:**
- Route simple tasks to local, escalate complex ones to cloud
- Use local for first-pass filtering, cloud for refinement  
- Batch similar local tasks, then single cloud call for synthesis
- Local for development/testing, cloud for production quality