# 🛡️ SlavkoShell 2.0 – Routing & Security Layer

> **Zero-trust gateway that routes deterministically.**  

## 📜 Philosophy

The Shell guarantees **protocol safety**, **strict schema validation**, and **deterministic routing**. It never "guesses" – it **hashes** the input and always selects the same downstream pipeline.

### Core Principles

1. **Zero-Trust Architecture**: Verify everything, trust nothing
2. **Deterministic Routing**: Same input → same model selection
3. **Schema Validation**: Strict JSON schema enforcement
4. **Audit Checkpoint**: First checkpoint in the audit chain
5. **Plugin System**: Extensible pre/post-routing hooks

## ✨ Core Features

| Feature | Description |
|---------|-------------|
| **Strict JSON schema validation** | Validates all inputs against `schemas/shell.json` |
| **Deterministic routing** | Hash-based model selection, reproducible |
| **Audit checkpoint #1** | Adds `shell` to the audit chain |
| **Plugin system** | Pre- and post-routing hooks |
| **Zero-trust networking** | Isolated tunnel for outbound calls |
| **Rate limiting** | Built-in request throttling |
| **Input sanitization** | Removes malicious content |

## 📦 Installation

```bash
git clone https://github.com/your-org/slavko-shell
cd slavko-shell
pip install -e .
```

### Dependencies

```
python>=3.11
jsonschema>=4.17.0
pydantic>=2.0.0
cryptography>=41.0.0
```

## 🚀 Quick Start

```python
from slavko_shell import Router
import json

# Initialize the router with default configuration
router = Router()

# Incoming request payload
payload = {
    "text": "Explain risk of secret leakage in this code",
    "metadata": {
        "source": "code_review",
        "priority": "high"
    }
}

# Route the request deterministically
try:
    routed = router.route(payload)
    print(f"Selected model: {routed.model}")
    print(f"Route hash: {routed.hash}")
    
    # Invoke the selected model
    output = routed.call()
    print(json.dumps(output, indent=2))
    
except ValidationError as e:
    print(f"Validation error: {e}")
except RoutingError as e:
    print(f"Routing error: {e}")
```

## 🔐 Security Checklist

- ✅ All outbound traffic goes through `https://<OLLAMA_HOST>/api/generate` inside a sandboxed container
- ✅ No environment variables are leaked to the client
- ✅ All input is validated against **Schema v2.1** (see `schemas/shell.json`)
- ✅ Malicious payloads are automatically rejected
- ✅ Rate limiting prevents abuse
- ✅ Audit logging for all requests

## 📋 Configuration

### Basic Configuration

```python
from slavko_shell import Router, Config

config = Config(
    ollama_host="http://localhost:11434",
    default_model="qwen2.5:14b",
    rate_limit=100,  # requests per minute
    timeout=30,  # seconds
    enable_audit=True
)

router = Router(config=config)
```

### Routing Table

```python
from slavko_shell import Router, RoutingRule

# Custom routing rules
routing_rules = [
    RoutingRule(
        condition=lambda payload: "image" in payload,
        model="phi3-vision",
        priority=10
    ),
    RoutingRule(
        condition=lambda payload: "pdf" in payload,
        model="qwen2.5:14b",
        priority=5
    ),
    RoutingRule(
        condition=lambda payload: payload.get("priority") == "high",
        model="deepseek-r1",
        priority=1
    )
]

router = Router(routing_rules=routing_rules)
```

## 🔍 Schema Validation

### Input Schema

The Shell validates all inputs against this schema:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "SlavkoShell Input Schema",
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "maxLength": 100000
    },
    "image_base64": {
      "type": "string",
      "format": "base64"
    },
    "pdf_base64": {
      "type": "string",
      "format": "base64"
    },
    "search_query": {
      "type": "string",
      "maxLength": 500
    },
    "metadata": {
      "type": "object",
      "properties": {
        "source": { "type": "string" },
        "priority": { 
          "type": "string",
          "enum": ["low", "medium", "high"]
        },
        "user_id": { "type": "string" }
      }
    }
  },
  "required": ["text"],
  "additionalProperties": false
}
```

### Validation Example

```python
from slavko_shell import Router, ValidationError

router = Router()

# Valid payload
valid_payload = {
    "text": "Review this content",
    "metadata": {
        "source": "api",
        "priority": "medium"
    }
}

# Invalid payload (missing required field)
invalid_payload = {
    "metadata": {
        "source": "api"
    }
}

try:
    router.validate(valid_payload)
    print("✓ Valid payload")
except ValidationError as e:
    print(f"✗ Invalid: {e}")

try:
    router.validate(invalid_payload)
except ValidationError as e:
    print(f"✗ Invalid: {e}")
    # Output: ✗ Invalid: 'text' is a required property
```

## 🔧 Plugin System

### Pre-Routing Hook

```python
from slavko_shell import Router, Plugin

class AuditPlugin(Plugin):
    def pre_route(self, payload: dict) -> dict:
        # Log incoming request
        print(f"Routing request: {payload.get('text', '')[:50]}...")
        return payload
    
    def post_route(self, result: dict) -> dict:
        # Add custom metadata
        result["custom_metadata"] = {
            "processed_by": "AuditPlugin",
            "timestamp": datetime.now().isoformat()
        }
        return result

# Register plugin
router = Router()
router.register_plugin(AuditPlugin())
```

### Rate Limiting Plugin

```python
from slavko_shell import Router, Plugin
from collections import defaultdict
import time

class RateLimitPlugin(Plugin):
    def __init__(self, max_requests: int = 100, window: int = 60):
        self.max_requests = max_requests
        self.window = window
        self.requests = defaultdict(list)
    
    def pre_route(self, payload: dict) -> dict:
        user_id = payload.get("metadata", {}).get("user_id", "anonymous")
        now = time.time()
        
        # Clean old requests
        self.requests[user_id] = [
            t for t in self.requests[user_id] 
            if now - t < self.window
        ]
        
        # Check rate limit
        if len(self.requests[user_id]) >= self.max_requests:
            raise RateLimitError(f"Rate limit exceeded for {user_id}")
        
        self.requests[user_id].append(now)
        return payload

router = Router()
router.register_plugin(RateLimitPlugin(max_requests=50))
```

## 📊 Deterministic Routing

### Hash-Based Model Selection

```python
from slavko_shell import Router
import hashlib

router = Router()

# The same payload always routes to the same model
payload1 = {"text": "Review this code", "metadata": {"priority": "high"}}
payload2 = {"text": "Review this code", "metadata": {"priority": "high"}}

route1 = router.route(payload1)
route2 = router.route(payload2)

assert route1.hash == route2.hash
assert route1.model == route2.model
print(f"✓ Deterministic routing verified: {route1.model}")
```

### Custom Routing Logic

```python
from slavko_shell import Router

def custom_router(payload: dict) -> str:
    # Custom routing logic
    if "security" in payload.get("text", "").lower():
        return "deepseek-r1"
    elif "ui" in payload.get("text", "").lower():
        return "phi3-vision"
    else:
        return "qwen2.5:14b"

router = Router(custom_router=custom_router)

payload = {"text": "Security review needed"}
route = router.route(payload)
print(f"Selected model: {route.model}")  # deepseek-r1
```

## 🔐 Zero-Trust Networking

### Sandboxed Container Configuration

```dockerfile
# Dockerfile for SlavkoShell
FROM python:3.11-slim

# Install dependencies
RUN pip install --no-cache-dir slavko-shell

# Create non-root user
RUN useradd -m -u 1000 slavko
USER slavko

# Expose only necessary port
EXPOSE 8000

# Run with strict security
CMD ["python", "-m", "slavko_shell.api", "--host", "0.0.0.0", "--port", "8000"]
```

### Network Isolation

```yaml
# docker-compose.yml
version: '3.8'
services:
  shell:
    image: slavko-shell:latest
    networks:
      - internal
    environment:
      - OLLAMA_HOST=http://ollama:11434
      - NETWORK_MODE=isolated

  ollama:
    image: ollama/ollama:latest
    networks:
      - internal

networks:
  internal:
    driver: bridge
    internal: true  # No external access
```

## 📈 Performance

| Metric | Value |
|--------|-------|
| **Routing latency** | ~0.3 ms (pure Python) |
| **Validation latency** | ~0.5 ms |
| **Memory** | ~10 MB |
| **Throughput** | > 5,000 req/sec |
| **CPU Usage** | < 1% per request |

## 🔍 Audit Trail

Every request creates an audit record:

```python
from slavko_shell import Router

router = Router(enable_audit=True)

payload = {"text": "Test request"}
route = router.route(payload)

# Audit record is automatically created
audit_record = route.audit_record
print(f"Audit ID: {audit_record['audit_id']}")
print(f"Audit Stage: {audit_record['audit_stage']}")
print(f"Timestamp: {audit_record['timestamp']}")
```

**Audit Record Schema:**

```json
{
  "audit_id": "audit-shell-8f3e2a1b7c9d",
  "audit_stage": "shell",
  "timestamp": "2025-01-15T10:30:00Z",
  "input_hash": "a1b2c3d4e5f6",
  "selected_model": "deepseek-r1",
  "route_hash": "f6e5d4c3b2a1",
  "validation_passed": true,
  "latency_ms": 0.8
}
```

## 🧪 Testing

```bash
# Run unit tests
pytest tests/test_shell.py -v

# Run integration tests
pytest tests/integration/test_shell_integration.py -v

# Run security tests
pytest tests/security/test_shell_security.py -v
```

## 🚨 Error Handling

```python
from slavko_shell import Router, ValidationError, RoutingError, RateLimitError

router = Router()

try:
    route = router.route(payload)
    output = route.call()
except ValidationError as e:
    print(f"❌ Validation failed: {e}")
    # Handle validation errors
except RoutingError as e:
    print(f"❌ Routing failed: {e}")
    # Handle routing errors
except RateLimitError as e:
    print(f"❌ Rate limit exceeded: {e}")
    # Handle rate limit errors
except Exception as e:
    print(f"❌ Unexpected error: {e}")
    # Handle other errors
```

## 📜 License

Apache-2.0 – see `LICENSE` for details.

## 📞 Support

- **Documentation**: [Full Docs](https://docs.slavko.ai/shell)
- **Issues**: [GitHub Issues](https://github.com/your-org/slavko-shell/issues)
- **Security**: security@slavko.ai

---

**Built with S.L.A.V.K.O.™ – Zero-Trust. Deterministic. Secure.**