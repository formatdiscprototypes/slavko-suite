# 🌐 SlavkoFusion 1.0 – Multimodal Integration Layer

> **Extract → Normalise → Unify** all modalities into a single JSON object.  

## 📜 Philosophy

Multimodal AI must be **deterministic** and **reproducible**. Fusion normalises images, PDFs, UI mock-ups, and code snippets into a **canonical feature set** that can be fed to any downstream evaluator.

### Core Principles

1. **Unified Schema**: All modalities produce the same JSON structure
2. **Deterministic Extraction**: Same input always yields same output
3. **Modality Detection**: Automatic detection of input type
4. **Plugin Architecture**: Extensible extractors for new modalities
5. **Audit Checkpoint**: Second checkpoint in the audit chain

## ✨ Core Features

| Feature | Description |
|---------|-------------|
| **Automatic modality detection** | Detects text, image, pdf, ui, code automatically |
| **Feature extraction** | Objects, layout, OCR, syntax tree extraction |
| **Deterministic output** | Always the same JSON shape for same input |
| **Audit checkpoint #2** | Adds `fusion` to the audit chain |
| **Plug-in extractor framework** | Add custom parsers without touching core code |

## 📦 Installation

```bash
git clone https://github.com/your-org/slavko-fusion
cd slavko-fusion
pip install -e .
```

### Dependencies

```
python>=3.11
pillow>=10.0.0
pytesseract>=0.3.10
pdfplumber>=0.10.0
opencv-python>=4.8.0
transformers>=4.35.0
torch>=2.0.0
```

## 🚀 Quick Start

```python
from slavko_fusion import Fusion
import json

# Initialize the fusion engine
fusion = Fusion()

# Sample payload with image
payload = {
    "image_base64": "<BASE64-PNG-IMAGE-DATA>",
    "text": "Review this dashboard"
}

# Extract features
features = fusion.extract(payload)
print(json.dumps(features, indent=2))
```

## 📚 Usage Examples

### Text Extraction

```python
fusion = Fusion()

text_payload = {
    "text": "This is a sample text document for analysis."
}

features = fusion.extract(text_payload)
print(features)
```

### Image Analysis

```python
fusion = Fusion()

image_payload = {
    "image_base64": "<BASE64-IMAGE>",
    "text": "Analyze this UI screenshot"
}

features = fusion.extract(image_payload)

# Access detected objects
for obj in features["features"]["objects"]:
    print(f"Found {obj['label']} at {obj['bbox']}")

# Access layout information
print(f"Aspect ratio: {features['features']['layout']['aspectRatio']}")
```

### PDF Processing

```python
fusion = Fusion()

pdf_payload = {
    "pdf_base64": "<BASE64-PDF>",
    "text": "Extract content from this PDF"
}

features = fusion.extract(pdf_payload)

# Access extracted text
print(f"Text: {features['features']['text']}")
```

### Code Analysis

```python
fusion = Fusion()

code_payload = {
    "code": """
def calculate_risk(data):
    if data['risk_factor'] > 0.8:
        return 'HIGH'
    return 'LOW'
""",
    "language": "python",
    "text": "Analyze this code"
}

features = fusion.extract(code_payload)

# Access syntax tree
print(f"Functions: {features['features']['functions']}")
print(f"Complexity: {features['features']['complexity']}")
```

## 📊 Performance

| Modality | Avg. Latency | Memory | Model |
|----------|--------------|--------|-------|
| **Text** | 5-10 ms | < 100 MB | N/A |
| **Image** | 300-700 ms | 4-5 GB | phi3-vision |
| **PDF** | 500-1000 ms | 2-3 GB | pdfplumber + OCR |
| **UI** | 400-800 ms | 4-5 GB | phi3-vision |
| **Code** | 10-20 ms | < 200 MB | AST parser |

## 📜 License

BSD-3-Clause – see `LICENSE` for details.

## 📞 Support

- **Documentation**: [Full Docs](https://docs.slavko.ai/fusion)
- **Issues**: [GitHub Issues](https://github.com/your-org/slavko-fusion/issues)
- **Email**: support@slavko.ai

---

**Built with S.L.A.V.K.O.™ – Unified. Deterministic. Extensible.**