# Ollama Integration for SlavkoScore 4.0

> Complete Ollama model integration package for SlavkoScore 4.0

## 📦 Overview

This directory contains pre-configured Modelfiles for running SlavkoScore 4.0 with Ollama. Each model is optimized for deterministic, auditable AI evaluation.

## 🚀 Quick Start

### 1. Install Ollama

```bash
# Linux/macOS
curl -fsSL https://ollama.com/install.sh | sh

# Or download from https://ollama.com/download
```

### 2. Pull Models

```bash
# Pull evaluation models
ollama pull deepseek-r1
ollama pull phi3-vision
ollama pull qwen2.5:14b

# Verify installation
ollama list
```

### 3. Use with SlavkoScore

```bash
# Set environment variables
export OLLAMA_HOST=http://localhost:11434
export OLLAMA_MODEL=deepseek-r1

# Run SlavkoScore
python -m slavko_score.api
```

## 📋 Available Models

### deepseek-r1
- **Purpose**: High-precision chain-of-thought reasoning
- **Use Case**: Critical compliance evaluations, detailed risk assessment
- **Latency**: 1.5-3s
- **Memory**: 8-10 GB
- **Modelfile**: `modelfiles/Modelfile.deepseek-r1`

### phi3-vision
- **Purpose**: Fast vision model for UI/UX extraction
- **Use Case**: UI mock-up analysis, image content extraction
- **Latency**: 300-700ms
- **Memory**: 4-5 GB
- **Modelfile**: `modelfiles/Modelfile.phi3-vision`

### qwen2.5:14b
- **Purpose**: Balanced reasoning model
- **Use Case**: Standard compliance workflows, medium-scale evaluations
- **Latency**: 1-2s
- **Memory**: 6-8 GB
- **Modelfile**: `modelfiles/Modelfile.qwen2.5`

## 🔧 Custom Modelfiles

### Building Custom Models

```bash
# Build from Modelfile
cd ollama/modelfiles
ollama create slavko-deepseek -f Modelfile.deepseek-r1

# Run custom model
ollama run slavko-deepseek
```

### Model Parameters

All SlavkoScore models use deterministic parameters:

```yaml
PARAMETER temperature 0    # No randomness
PARAMETER top_p 0          # No nucleus sampling
PARAMETER top_k 1          # Always pick best token
PARAMETER repeat_penalty 1.0  # No repetition penalty
```

## 📊 Performance Tuning

### GPU Acceleration

```bash
# Check GPU availability
ollama ps

# Enable GPU (automatic if detected)
# For manual configuration, set:
CUDA_VISIBLE_DEVICES=0 ollama serve
```

### Batch Processing

```bash
# Run multiple evaluations in parallel
for file in inputs/*.json; do
    ollama run deepseek-r1 "Evaluate: $(cat $file)" &
done
wait
```

## 🔐 Security Best Practices

### Network Isolation

```bash
# Bind to localhost only
ollama serve --host 127.0.0.1 --port 11434
```

### Authentication

```bash
# Use reverse proxy with authentication
# Example with nginx:
location /ollama/ {
    proxy_pass http://localhost:11434;
    auth_basic "Restricted";
    auth_basic_user_file .htpasswd;
}
```

## 📈 Monitoring

### Model Statistics

```bash
# View running models
ollama ps

# View model information
ollama show deepseek-r1

# Check model size
ollama list --verbose
```

### Logging

```bash
# Enable verbose logging
OLLAMA_DEBUG=1 ollama serve

# Log to file
OLLAMA_DEBUG=1 ollama serve > ollama.log 2>&1
```

## 🧪 Testing

### Test Model Response

```bash
# Test deepseek-r1
echo '{"text": "Test input"}' | ollama run deepseek-r1

# Test phi3-vision
ollama run phi3-vision "Analyze this image" < image.png
```

### Benchmark Performance

```bash
# Benchmark script
time for i in {1..10}; do
    echo "Test $i" | ollama run deepseek-r1 > /dev/null
done
```

## 📚 API Integration

### Python Example

```python
import ollama

# Initialize client
client = ollama.Client(host='http://localhost:11434')

# Evaluate content
response = client.chat(model='deepseek-r1', messages=[
    {
        'role': 'user',
        'content': 'Evaluate this content for compliance risks'
    }
])

print(response['message']['content'])
```

### REST API

```bash
# REST endpoint
curl http://localhost:11434/api/generate -d '{
  "model": "deepseek-r1",
  "prompt": "Evaluate this content",
  "stream": false
}'
```

## 🔄 Updating Models

```bash
# Pull latest version
ollama pull deepseek-r1

# Remove old models
ollama rm old-model-name

# Rebuild from Modelfile
cd ollama/modelfiles
ollama create slavko-deepseek -f Modelfile.deepseek-r1
```

## 📞 Support

- **Ollama Docs**: https://ollama.com/docs
- **SlavkoScore Docs**: https://docs.slavko.ai
- **Issues**: https://github.com/your-org/slavko-score/issues

---

**Built with S.L.A.V.K.O.™ – Deterministic AI. Sovereign Control.**