# SlavkoScore 4.x API Reference

> Complete API documentation for all SlavkoScore components.

## Table of Contents

- [SlavkoKernel API](#slavkokernel-api)
- [SlavkoShell API](#slavkoshell-api)
- [SlavkoFusion API](#slavkofusion-api)
- [SlavkoScore API](#slavkoscore-api)
- [Unified JSON Schema](#unified-json-schema)

---

## SlavkoKernel API

### `Kernel`

#### `__init__(self, template_dir: str = None)`

Initialize the Kernel with optional custom templates.

**Parameters:**
- `template_dir` (str, optional): Path to custom Jinja2 templates directory

**Returns:** `Kernel` instance

**Example:**
```python
from slavko_kernel import Kernel

kernel = Kernel(template_dir="custom_templates/")
```

---

#### `render(self, payload: dict) -> Tuple[str, dict]`

Render the input payload into Markdown and JSON outputs.

**Parameters:**
- `payload` (dict): Input payload matching the unified schema

**Returns:** `Tuple[str, dict]`
- First element: Markdown report (str)
- Second element: JSON report (dict)

**Raises:**
- `ValidationError`: If payload does not match schema
- `RenderingError`: If template rendering fails

**Example:**
```python
payload = {
    "summary": "Content review completed",
    "details": {"risk_score": 45},
    "verdict": "PASS",
    "confidence": 0.92
}

report_md, report_json = kernel.render(payload)
```

---

## Support

- **Documentation**: [Full Docs](https://docs.slavko.ai)
- **API Status**: [status.slavko.ai](https://status.slavko.ai)
- **Issues**: [GitHub Issues](https://github.com/your-org/slavko-score/issues)
- **Email**: api@slavko.ai

---

**Built with S.L.A.V.K.O.™ – Deterministic AI. Sovereign Control.**