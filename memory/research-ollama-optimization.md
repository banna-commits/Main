# Ollama Performance Optimization for Mac Mini M-Series

## Key Configuration Settings

### Concurrent Request Management
- **OLLAMA_NUM_PARALLEL**: Default 1, increase to 2-4 for Mac Mini M-series
- **OLLAMA_MAX_LOADED_MODELS**: Default 3 × GPU count (set to 2-3 for Mac Mini)
- **OLLAMA_MAX_QUEUE**: Default 512, handles request queuing

### Memory Management
- **OLLAMA_KEEP_ALIVE**: Default 5m, set to 30m-60m for frequent use
- **OLLAMA_GPU_OVERHEAD**: Reserve GPU memory for system operations
- **OLLAMA_NUM_GPU**: Set to 999 to use all available GPU cores

### Model Loading & Context
- **num_ctx**: 
  - 8K-16K for general tasks
  - 32K-40K for coding/complex reasoning (Qwen3 supports up to 40960)
  - Higher contexts = more RAM usage (scales with OLLAMA_NUM_PARALLEL)
- **OLLAMA_CONTEXT_LENGTH**: Global context setting

### Sampling Parameters
- **temperature**: 0.6-0.7 for structured output, 0.8-1.0 for creative tasks
- **top_p**: 0.8-0.9 for balanced coherence
- **top_k**: 20-40 for focused responses
- **repeat_penalty**: 1.05-1.1 to reduce repetition

### Model Quantization Tradeoffs
- **Q4_K_M**: Best speed/quality balance, ~4GB for 7B models
- **Q8**: Higher quality, ~2x memory usage, 10-20% slower
- **FP16**: Maximum quality, ~4x memory, significant slowdown

## Recommended Config for Mac Mini

### Environment Variables
```bash
export OLLAMA_NUM_PARALLEL=2
export OLLAMA_MAX_LOADED_MODELS=2
export OLLAMA_KEEP_ALIVE=30m
export OLLAMA_NUM_GPU=999
export OLLAMA_METAL=1
```

### Model Setup (Qwen3 Example)
```bash
# Create optimized model
cat > Modelfile << 'EOF'
FROM qwen3:8b
PARAMETER temperature 0.7
PARAMETER top_p 0.8
PARAMETER num_ctx 16384
PARAMETER repeat_penalty 1.05
EOF

ollama create qwen3-optimized -f Modelfile
```

### Performance Tips
- Use Q4_K_M quantization for optimal balance
- Set context to actual needs (16K max for most tasks)
- Keep 1-2 frequently used models loaded
- MLX framework is 20-30% faster than Ollama on Apple Silicon