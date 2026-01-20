# 🎩 SlavkoKernel v8 – Presentation & Governance Layer

> **Deterministic reporting. Governance-first summaries.**  
> Every output is both **human-readable** *and* **machine-readable** in a single JSON payload.

## 📜 Philosophy

S.L.A.V.K.O.™ treats every AI decision as a **governance event**. The Kernel translates that decision into a format that satisfies auditors, executives, and developers alike.

### Core Principles

1. **Deterministic Formatting**: Identical indentation, ordering, and wording on every run
2. **Audit-Chain Extension**: Adds its own audit ID to the global chain
3. **Governance Summaries**: Bullet-point mapping of each rule → compliance outcome
4. **Dual-Output**: Markdown for humans, JSON for machines

## ✨ Core Features

| Feature | Description |
|---------|-------------|
| **Dual-Output** | Markdown for people, JSON for machines |
| **Deterministic formatting** | Identical indentation, ordering, and wording |
| **Audit-chain extension** | Adds its own audit ID to the global chain |
| **Governance summaries** | Maps each rule to compliance outcome |
| **Plug-in extensible** | Add new presentation styles without touching core code |

## 📦 Installation

```bash
git clone https://github.com/your-org/slavko-kernel
cd slavko-kernel
pip install -e .
```

### Dependencies

```
python>=3.11
jinja2>=3.1.0
pydantic>=2.0.0
markdown>=3.5.0
```

## 🚀 Quick Start

```python
from slavko_kernel import Kernel
import json

# Initialize the kernel
kernel = Kernel()

# Sample input from SlavkoScore
payload = {
    "summary": "Content review completed successfully",
    "details": {
        "risk_score": 45,
        "compliance_pass": True,
        "rule_breakdown": {
            "KeywordRiskRule": 45,
            "ContrastUXRule": 0,
            "PolicyRule": 0
        }
    },
    "verdict": "PASS",
    "confidence": 0.92
}

# Generate both outputs
report_md, report_json = kernel.render(payload)

# Human-readable markdown
print(report_md)

# Machine-readable JSON
print(json.dumps(report_json, indent=2))
```

## 📚 Usage Examples

### Compliance Audit

```python
from slavko_kernel import Kernel

kernel = Kernel()
compliance_output = {
    "summary": "Document complies with all regulatory requirements",
    "details": {
        "risk_score": 15,
        "compliance_pass": True,
        "rule_breakdown": {
            "GDPR_Compliance": 10,
            "HIPAA_Compliance": 5
        }
    },
    "verdict": "PASS",
    "confidence": 0.95
}

report_md, report_json = kernel.render(compliance_output)
print(report_md)
```

**Output:**
```markdown
## 🔐 Compliance Report

### Verdict
✅ **PASS**

### Risk Score
15/100 (Low Risk)

### Rules Applied
- **GDPR_Compliance** → `risk_score: 10`  
- **HIPAA_Compliance** → `risk_score: 5`

### Action Items
- None (all checks passed)

### Audit ID
audit-kernel-8f3e2a1b7c9d
```

### UX Review

```python
ux_output = {
    "summary": "UI meets accessibility standards with minor improvements needed",
    "details": {
        "risk_score": 25,
        "compliance_pass": True,
        "rule_breakdown": {
            "ContrastUXRule": 25,
            "WCAG_Compliance": 0
        }
    },
    "verdict": "PASS",
    "confidence": 0.88
}

report_md, report_json = kernel.render(ux_output)
print(report_md)
```

**Output:**
```markdown
## 👁️ UX Review Report

### Verdict
✅ **PASS**

### Risk Score
25/100 (Low Risk)

### Rules Applied
- **ContrastUXRule** → `penalty: 25`
- **WCAG_Compliance** → `penalty: 0`

### Action Items
- Consider improving contrast for better AAA compliance (current ratio: 4.5:1)

### Audit ID
audit-kernel-3d8f1c9b4e2a
```

## 📋 Governance Summary Template

The Kernel automatically generates governance summaries in this format:

```markdown
## Governance Summary

### Verdict
<PASS|FAIL|WARN>

### Risk Assessment
- **Overall Risk Score**: X/100
- **Risk Level**: <Low|Medium|High|Critical>

### Rules Applied
- **RuleName1** → `score: X`  
- **RuleName2** → `score: Y`

### Compliance Status
<Compliant|Non-Compliant|Partial>

### Action Items
- **If PASS**: No action required
- **If FAIL**: Remediate according to the `recommendations` field
- **If WARN**: Review and address within SLA

### Audit Trail
- **Audit ID**: `audit-kernel-XXXXXXXX`
- **Timestamp**: ISO-8601
- **Chain**: [audit-shell-XXX, audit-fusion-XXX, audit-score-XXX, audit-kernel-XXX]
```

## 🔧 API Reference

### `Kernel`

#### `__init__(self, template_dir: str = None)`

Initialize the Kernel with optional custom templates.

**Parameters:**
- `template_dir` (str, optional): Path to custom Jinja2 templates

**Example:**
```python
kernel = Kernel(template_dir="custom_templates/")
```

#### `render(self, payload: dict) -> Tuple[str, dict]`

Render the input payload into Markdown and JSON outputs.

**Parameters:**
- `payload` (dict): Input payload matching the unified schema

**Returns:**
- `Tuple[str, dict]`: (markdown_report, json_report)

**Example:**
```python
report_md, report_json = kernel.render(payload)
```

#### `set_template(self, name: str, content: str)`

Set a custom template for rendering.

**Parameters:**
- `name` (str): Template name
- `content` (str): Jinja2 template content

**Example:**
```python
kernel.set_template("governance", """
## Custom Report
{{ payload.summary }}
""")
```

## 🎨 Custom Templates

You can create custom presentation templates using Jinja2:

```python
from slavko_kernel import Kernel

# Custom template for executive reports
executive_template = """
# Executive Summary

{{ payload.summary }}

## Risk Score: {{ payload.details.risk_score }}/100

{% if payload.verdict == "PASS" %}
✅ Approved
{% elif payload.verdict == "FAIL" %}
❌ Rejected
{% else %}
⚠️ Review Required
{% endif %}
"""

kernel = Kernel()
kernel.set_template("executive", executive_template)
report_md, report_json = kernel.render(payload, template="executive")
```

## 📊 Output Schema

The Kernel outputs a unified JSON schema:

```json
{
  "slavko_version": "1.0",
  "component": "Kernel",
  "timestamp": "2025-01-15T10:30:00Z",
  "audit_id": "audit-kernel-8f3e2a1b7c9d",
  "audit_stage": "kernel",
  "audit_chain": [
    "audit-shell-abc123",
    "audit-fusion-def456",
    "audit-score-ghi789",
    "audit-kernel-8f3e2a1b7c9d"
  ],
  "input": {
    "summary": "Content review completed",
    "details": { ... },
    "verdict": "PASS",
    "confidence": 0.92
  },
  "output": {
    "markdown": "# Governance Report\n...",
    "verdict": "PASS",
    "confidence": 0.92
  },
  "meta": {
    "deterministic": true,
    "pipeline_stage": "kernel",
    "runtime_ms": 1.5
  }
}
```

## 🔍 Audit Chain Integration

The Kernel automatically extends the audit chain:

```python
# Input audit chain from Score component
input_payload = {
    "audit_chain": [
        "audit-shell-abc123",
        "audit-fusion-def456",
        "audit-score-ghi789"
    ]
}

# Kernel adds its own audit ID
kernel = Kernel()
report_md, report_json = kernel.render(input_payload)

# Output includes extended chain
print(report_json["audit_chain"])
# [
#   "audit-shell-abc123",
#   "audit-fusion-def456",
#   "audit-score-ghi789",
#   "audit-kernel-8f3e2a1b7c9d"
# ]
```

## 📈 Performance

| Metric | Value |
|--------|-------|
| **Latency** | < 2 ms (pure formatting) |
| **Memory** | < 5 MB |
| **Throughput** | > 10,000 ops/sec |
| **CPU Usage** | Negligible |

## 🔐 Security Considerations

- **No external dependencies**: Kernel runs purely in Python
- **No network calls**: All processing is local
- **Deterministic output**: Same input always produces same output
- **Audit trail**: Every operation is logged
- **Template validation**: Custom templates are sanitized

## 🧪 Testing

```bash
# Run unit tests
pytest tests/test_kernel.py -v

# Run integration tests
pytest tests/integration/test_kernel_integration.py -v

# Run performance tests
pytest tests/performance/test_kernel_performance.py -v
```

## 🤝 Contributing

To add new presentation templates:

1. Create a new template file in `templates/`
2. Follow the Jinja2 syntax
3. Add tests in `tests/test_templates.py`
4. Submit a pull request

## 📜 License

MIT License – see `LICENSE` for details.

## 📞 Support

- **Documentation**: [Full Docs](https://docs.slavko.ai/kernel)
- **Issues**: [GitHub Issues](https://github.com/your-org/slavko-kernel/issues)
- **Email**: support@slavko.ai

---

**Built with S.L.A.V.K.O.™ – Deterministic AI. Sovereign Control.**