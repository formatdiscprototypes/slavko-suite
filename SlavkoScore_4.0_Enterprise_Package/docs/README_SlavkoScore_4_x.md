# 🎯 SlavkoScore 4.x – Evaluation & Compliance Layer

> **Deterministic scoring engine that produces audit-ready risk scores.**  

## 📜 Philosophy

The Score layer is the **heart** of S.L.A.V.K.O.™. It performs **risk scoring**, **compliance assessment**, and **recommendation generation** using a **deterministic reasoning pipeline** and an **extensible plugin rule engine**.

### Core Principles

1. **Deterministic Reasoning**: Temperature=0, top_p=0 for reproducibility
2. **Plugin Architecture**: Auto-discovered scoring rules
3. **Ensemble Voting**: Optional consensus from multiple models
4. **Audit Checkpoint**: Third checkpoint in the audit chain
5. **Configurable Thresholds**: Flexible risk scoring

## ✨ Core Features

| Feature | Description |
|---------|-------------|
| **Deterministic reasoning** | `temperature=0`, `top_p=0` |
| **Plugin scoring rules** | Auto-discovered classes in `plugins/scoring/` |
| **Multimodal scoring** | Consumes unified feature JSON from Fusion |
| **Ensemble voting (optional)** | Consensus of ≥2 reasoning models |
| **Audit checkpoint #3** | Adds `score` to the audit chain |
| **Configurable thresholds** | Via `SCORE_PASS_THRESHOLD` env var |

## 📦 Installation

```bash
git clone https://github.com/your-org/slavko-score
cd slavko-score
pip install -e .
```

### Dependencies

```
python>=3.11
ollama>=0.1.0
pydantic>=2.0.0
numpy>=1.24.0
scikit-learn>=1.3.0
```

## 🚀 Quick Start

```python
from slavko_score import ScoreEngine
import json

# Initialize the score engine
engine = ScoreEngine()

# Sample feature output from Fusion
predicted_json = {
    "modality": "text",
    "features": {
        "text": "This document contains sensitive customer data",
        "entities": ["customer data"],
        "sentiment": "neutral"
    },
    "metadata": {
        "timestamp": "2025-01-15T10:30:00Z"
    }
}

# Evaluate the content
result = engine.evaluate(predicted_json)

# Access results
print(f"Risk Score: {result['risk_score']}/100")
print(f"Compliance Pass: {result['compliance_pass']}")
print(f"Verdict: {result['verdict']}")
print(json.dumps(result, indent=2))
```

## 📊 Scoring Schema

### Input Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "SlavkoScore Input",
  "type": "object",
  "properties": {
    "modality": {
      "type": "string",
      "enum": ["text", "image", "pdf", "ui", "code"]
    },
    "features": {
      "type": "object",
      "properties": {
        "text": { "type": "string" },
        "objects": { "type": "array" },
        "layout": { "type": "object" },
        "ocr_text": { "type": "string" }
      }
    },
    "metadata": {
      "type": "object",
      "properties": {
        "timestamp": { "type": "string" }
      }
    }
  },
  "required": ["modality", "features"]
}
```

### Output Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "SlavkoScore Deterministic Output",
  "type": "object",
  "properties": {
    "risk_score": {
      "type": "integer",
      "minimum": 0,
      "maximum": 100
    },
    "compliance_pass": {
      "type": "boolean"
    },
    "rule_breakdown": {
      "type": "object",
      "additionalProperties": {
        "type": "number"
      }
    },
    "raw_reasoning": {
      "type": "object",
      "properties": {
        "intent": { "type": "string" },
        "risks": { "type": "string" },
        "compliance": { "type": "string" },
        "ux": { "type": "string" },
        "recommendations": { "type": "string" }
      },
      "required": ["intent", "risks", "compliance", "ux", "recommendations"]
    }
  },
  "required": ["risk_score", "compliance_pass", "rule_breakdown", "raw_reasoning"]
}
```

## 🔧 Plugin System

### Creating a Custom Scoring Rule

```python
from slavko_score.plugins import ScoringRule

class KeywordRiskRule(ScoringRule):
    """Detect high-risk keywords in text content."""
    
    def __init__(self, keywords=None, weight=1.0):
        self.keywords = keywords or [
            "password", "secret", "api_key", "token",
            "credit_card", "social_security", "private_key"
        ]
        self.weight = weight
    
    def evaluate(self, context: dict) -> float:
        """Evaluate risk based on keyword presence."""
        text = context.get("features", {}).get("text", "").lower()
        
        risk_score = 0
        found_keywords = []
        
        for keyword in self.keywords:
            if keyword in text:
                risk_score += 10
                found_keywords.append(keyword)
        
        return min(risk_score * self.weight, 100)
    
    def explain(self, context: dict, score: float) -> str:
        """Provide explanation for the score."""
        text = context.get("features", {}).get("text", "").lower()
        found = [kw for kw in self.keywords if kw in text]
        
        if found:
            return f"Found high-risk keywords: {', '.join(found)}"
        return "No high-risk keywords detected"

# Save as: plugins/scoring/keyword_risk_rule.py
```

### Registering Plugins

```python
from slavko_score import ScoreEngine

# Plugin discovery is automatic
# Place your plugin files in plugins/scoring/

engine = ScoreEngine()

# List all registered plugins
print("Registered rules:")
for rule in engine.rules:
    print(f"  - {rule.__class__.__name__}")
```

### Custom Rule with Advanced Logic

```python
from slavko_score.plugins import ScoringRule
import re

class PIIRegexRule(ScoringRule):
    """Detect personally identifiable information using regex patterns."""
    
    PATTERNS = {
        "email": r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
        "phone": r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',
        "ssn": r'\b\d{3}-\d{2}-\d{4}\b',
        "credit_card": r'\b(?:\d[ -]*?){13,16}\b'
    }
    
    def evaluate(self, context: dict) -> float:
        """Evaluate risk based on PII patterns."""
        text = context.get("features", {}).get("text", "")
        risk_score = 0
        
        for pattern_name, pattern in self.PATTERNS.items():
            matches = re.findall(pattern, text)
            if matches:
                risk_score += len(matches) * 5
        
        return min(risk_score, 100)
    
    def explain(self, context: dict, score: float) -> str:
        """Explain detected PII."""
        text = context.get("features", {}).get("text", "")
        detected = []
        
        for pattern_name, pattern in self.PATTERNS.items():
            if re.search(pattern, text):
                detected.append(pattern_name)
        
        if detected:
            return f"Detected potential PII: {', '.join(detected)}"
        return "No PII patterns detected"

# Save as: plugins/scoring/pii_regex_rule.py
```

## 🧮 Ensemble Voting

```python
from slavko_score import ScoreEngine, EnsembleConfig

# Configure ensemble voting
ensemble_config = EnsembleConfig(
    models=["deepseek-r1", "qwen2.5:14b"],
    consensus_threshold=0.8,  # 80% agreement required
    fallback_strategy="majority"
)

engine = ScoreEngine(ensemble_config=ensemble_config)

# Evaluate with ensemble
result = engine.evaluate(payload)

# Check consensus
print(f"Consensus achieved: {result['ensemble']['consensus']}")
print(f"Agreement score: {result['ensemble']['agreement']}")
```

## 📊 Performance Benchmarks

| Model | Avg. Latency | RAM | Use Case |
|-------|--------------|-----|----------|
| **deepseek-r1** | 1.5-3s | 8-10 GB | High-precision evaluation |
| **qwen2.5:14b** | 1-2s | 6-8 GB | Standard compliance |
| **llama3.1:8b** | 0.8-1.5s | 4-5 GB | Fast screening |

## 🔧 Configuration

### Environment Variables

```bash
# Model configuration
export OLLAMA_MODEL="deepseek-r1"
export OLLAMA_HOST="http://localhost:11434"

# Scoring thresholds
export SCORE_PASS_THRESHOLD=70
export SCORE_WARN_THRESHOLD=50

# Performance tuning
export MAX_CONCURRENT_REQUESTS=5
export REQUEST_TIMEOUT=30

# Ensemble settings
export ENABLE_ENSEMBLE=true
export ENSEMBLE_MODELS="deepseek-r1,qwen2.5:14b"
export ENSEMBLE_CONSENSUS_THRESHOLD=0.8
```

### Python Configuration

```python
from slavko_score import ScoreEngine, Config

config = Config(
    model="deepseek-r1",
    ollama_host="http://localhost:11434",
    pass_threshold=70,
    warn_threshold=50,
    max_concurrent_requests=5,
    timeout=30,
    enable_ensemble=True,
    ensemble_models=["deepseek-r1", "qwen2.5:14b"],
    ensemble_consensus_threshold=0.8
)

engine = ScoreEngine(config=config)
```

## 🧪 Testing

```bash
# Run unit tests
pytest tests/test_score.py -v

# Run integration tests
pytest tests/integration/test_score_integration.py -v

# Run plugin tests
pytest tests/plugins/test_plugins.py -v
```

## 📈 Performance

| Metric | Value |
|--------|-------|
| **Evaluation latency** | 0.8-3s (depends on model) |
| **Memory** | 4-10 GB (depends on model) |
| **Throughput** | 10-50 req/min (depends on model) |
| **Plugin overhead** | < 10ms |

## 📜 License

MIT – see `LICENSE` for details.

## 📞 Support

- **Documentation**: [Full Docs](https://docs.slavko.ai/score)
- **Issues**: [GitHub Issues](https://github.com/your-org/slavko-score/issues)
- **Email**: support@slavko.ai

---

**Built with S.L.A.V.K.O.™ – Precise. Auditable. Compliant.**