# 💻 SlavkoShell 2.0

<p align="center">
  <img src="https://img.shields.io/badge/💻-SlavkoShell%202.0-3b82f6?style=for-the-badge" alt="SlavkoShell Badge" />
</p>

<p align="center">
  <strong>Routing & Security Layer</strong><br/>
  <em>Deterministic Orchestration for Secure Protocol Routing</em>
</p>

<p align="center">
  <a href="https://github.com/theOrchestrationAI/slavko-shell/releases"><img src="https://img.shields.io/badge/version-2.0.0-00ff88?style=for-the-badge" alt="Version" /></a>
  <a href="https://ollama.com/mladen-gertner/slavkoshell-v2"><img src="https://img.shields.io/badge/Ollama-mladen--gertner-white?style=for-the-badge&logo=ollama" alt="Ollama" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache%202.0-blue?style=for-the-badge" alt="License" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/🇭🇷-Made%20in%20Zagreb-000?style=for-the-badge" alt="Made in Zagreb" />
  <img src="https://img.shields.io/badge/🔒-Zero%20Trust-ef4444?style=for-the-badge" alt="Zero Trust" />
</p>

---

## 🎯 Overview

**SlavkoShell 2.0** is the routing and security gateway of the S.L.A.V.K.O.™ orchestration system. It validates all inputs, routes requests to appropriate pipelines, and enforces security policies with zero-trust architecture.

---

## 🚀 Quick Start

```bash
# Run with Ollama
ollama run mladen-gertner/slavkoshell-v2

# Validate Input
curl -X POST http://localhost:11434/api/generate \
  -d '{
    "model": "mladen-gertner/slavkoshell-v2",
    "prompt": "Validate: {\"input\": \"test data\", \"type\": \"text\"}"
  }'
```

---

## 🔒 Security Features

| Check                   | Description                 |
| :---------------------- | :-------------------------- |
| **Schema Validation**   | JSON contract conformance   |
| **Type Checking**       | Field type verification     |
| **Size Limits**         | Max 100KB input             |
| **Injection Detection** | SQL, XSS, command injection |
| **PII Screening**       | Personal data detection     |
| **Encoding Validation** | UTF-8 only                  |

---

## 🛡️ Zero Trust Principles

- **Validate First**: Never process unvalidated input
- **Schema Strict**: Reject malformed requests
- **Audit Everything**: Log all routing decisions
- **Fail Secure**: When in doubt, reject

---

## 📤 Output Format

```json
{
  "validation": {
    "status": "valid|invalid|suspicious",
    "checks_passed": [],
    "checks_failed": []
  },
  "routing": {
    "pipeline": "standard|multimodal|code|vision",
    "priority": "normal|high|critical"
  },
  "security": {
    "threat_level": "none|low|medium|high|critical",
    "pii_detected": false,
    "injection_detected": false
  },
  "audit": {
    "shell_version": "2.0",
    "request_hash": "sha256:..."
  }
}
```

---

## 📞 Contact

**Mladen Gertner** — FormatDisc™, Zagreb, Croatia  
📧 mladen@formatdisc.hr | 🌐 [formatdisc.hr](https://formatdisc.hr)

---

<p align="center">
  <sub>© 2026 FormatDisc™, vl. Mladen Gertner — All Rights Reserved</sub>
</p>
