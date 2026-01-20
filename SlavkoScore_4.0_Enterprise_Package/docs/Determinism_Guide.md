# Determinism in S.L.A.V.K.O.™

> Ensuring reproducible, auditable, and trustworthy AI outputs.

## 📜 What is Determinism?

A decision is **deterministic** iff all of the following hold:

1. **Model inference** – `temperature=0` and `top_p=0`
2. **Prompt template** – identical literal string for identical input shape
3. **Caching** – if a cached entry exists, it is returned **before** any LLM call
4. **Random seed** – `random.seed(0)` is set at process start
5. **Concurrency** – the orchestrator processes requests **sequentially** per container

If any of the above is altered, the `meta.deterministic` flag in the output will become `false` and should be rejected by compliance pipelines.

## 🔑 Why Determinism Matters

| Aspect | Deterministic | Non-Deterministic |
|--------|--------------|-------------------|
| **Reproducibility** | ✅ Same input → same output | ❌ Same input → different output |
| **Auditing** | ✅ Exact trace possible | ❌ Cannot verify decisions |
| **Compliance** | ✅ Meets regulatory requirements | ❌ Fails compliance checks |
| **Testing** | ✅ Reliable unit tests | ❌ Flaky tests |
| **Debugging** | ✅ Predictable behavior | ❌ Hard to reproduce issues |

## 🛠️ Implementation Details

### 1. Model Configuration

```python
from slavko_score import ScoreEngine

# Deterministic configuration
config = {
    "temperature": 0.0,
    "top_p": 0.0,
    "top_k": 1,
    "repeat_penalty": 1.0,
    "stream": False
}

engine = ScoreEngine(config=config)
```

### 2. Prompt Template Management

```python
from slavko_score.prompts import PromptTemplate

template = PromptTemplate.load("prompts/scoring.j2")

context = {
    "text": "Input text",
    "features": extracted_features
}

prompt = template.render(context)
```

### 3. Caching Strategy

```python
from slavko_score.cache import LRUCache

cache = LRUCache(max_size=1000)

cache_key = hashlib.sha256(
    json.dumps(input_data).encode()
).hexdigest()

if cache_key in cache:
    return cache[cache_key]

result = evaluate(input_data)
cache[cache_key] = result
return result
```

### 4. Random Seed Management

```python
import random
import numpy as np

def initialize_determinism():
    random.seed(0)
    np.random.seed(0)
    os.environ['PYTHONHASHSEED'] = '0'

initialize_determinism()
```

### 5. Sequential Processing

```python
from slavko_score.orchestrator import Orchestrator

orchestrator = Orchestrator(
    max_concurrent_requests=1,
    queue_size=100
)

for request in requests:
    result = orchestrator.process(request)
```

## ✅ Determinism Checklist

### Before Deployment

- [ ] All models configured with `temperature=0`
- [ ] All models configured with `top_p=0`
- [ ] All prompt templates are read-only
- [ ] Caching is enabled and configured
- [ ] Random seeds are set at startup
- [ ] Concurrent requests are processed sequentially
- [ ] No external random data sources
- [ ] All dependencies are pinned to specific versions

### Runtime Verification

- [ ] Check `meta.deterministic` flag in output
- [ ] Verify audit chain is complete
- [ ] Confirm cache hit rate is > 80%
- [ ] Monitor for random seed changes
- [ ] Log all model parameters

### Testing

```python
def test_determinism():
    payload = {"text": "Test input"}
    
    result1 = engine.evaluate(payload)
    result2 = engine.evaluate(payload)
    
    assert result1 == result2
    assert result1["meta"]["deterministic"] == True
```

## 📊 Measuring Determinism

### Cache Hit Rate

```python
from slavko_score.monitoring import Metrics

metrics = Metrics()

cache_hits = metrics.get_cache_hits()
cache_misses = metrics.get_cache_misses()
hit_rate = cache_hits / (cache_hits + cache_misses)

assert hit_rate > 0.8
```

## 🚨 Common Pitfalls

### 1. Using Streaming

```python
# ❌ NON-DETERMINISTIC
config = {"stream": True}

# ✅ DETERMINISTIC
config = {"stream": False}
```

### 2. Modifying Prompt Templates

```python
# ❌ NON-DETERMINISTIC
prompt = f"Analyze: {user_input}"

# ✅ DETERMINISTIC
prompt = template.render({"text": user_input})
```

### 3. Parallel Processing

```python
# ❌ NON-DETERMINISTIC
with ThreadPoolExecutor(max_workers=5) as executor:
    results = executor.map(process, requests)

# ✅ DETERMINISTIC
results = [process(r) for r in requests]
```

### 4. Using Time-Based Randomness

```python
# ❌ NON-DETERMINISTIC
import time
random.seed(int(time.time()))

# ✅ DETERMINISTIC
random.seed(0)
```

## 📈 Performance Impact

| Configuration | Latency | Throughput | Determinism |
|--------------|---------|------------|-------------|
| **Sequential + Cache** | 50-200ms | 5-20 req/sec | ✅ Yes |
| **Sequential + No Cache** | 1-3s | 0.3-1 req/sec | ✅ Yes |
| **Parallel + No Cache** | 200-800ms | 5-20 req/sec | ❌ No |
| **Parallel + Cache** | 50-200ms | 10-40 req/sec | ❌ No |

## 🔍 Monitoring Determinism

### Dashboard Metrics

```python
from slavko_score.monitoring import Dashboard

dashboard = Dashboard()

dashboard.show_metrics([
    "determinism_rate",
    "cache_hit_rate",
    "reproducibility_score",
    "audit_chain_completeness"
])
```

## 📚 Further Reading

- [Audit Chain Documentation](./KernelBus_v2_Audit_Standard.md)
- [API Reference](./API_Reference.md)
- [Deployment Guide](./Deployment_Guide.md)

---

**Built with S.L.A.V.K.O.™ – Deterministic by Design.**