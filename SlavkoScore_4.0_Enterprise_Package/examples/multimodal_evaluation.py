#!/usr/bin/env python3
"""
SlavkoScore 4.0 - Multimodal Evaluation Example

This example demonstrates how to use SlavkoScore 4.0
for evaluating different content modalities.
"""

import json
from slavko_shell import Router
from slavko_fusion import Fusion
from slavko_score import ScoreEngine
from slavko_kernel import Kernel


def evaluate_text():
    """Evaluate text content."""
    print("=" * 80)
    print("Example 1: Text Evaluation")
    print("=" * 80)
    print()
    
    payload = {
        "text": "This confidential document contains trade secrets and proprietary information.",
        "metadata": {
            "source": "document_upload",
            "priority": "high"
        }
    }
    
    # Run through pipeline
    router = Router()
    fusion = Fusion()
    engine = ScoreEngine()
    kernel = Kernel()
    
    # Route
    route = router.route(payload)
    print(f"Routed to model: {route.model}")
    
    # Extract features
    features = fusion.extract(payload)
    print(f"Modality: {features['modality']}")
    
    # Evaluate
    result = engine.evaluate(features)
    print(f"Risk Score: {result['risk_score']}/100")
    print(f"Verdict: {result['verdict']}")
    
    # Generate report
    report_md, _ = kernel.render(result)
    print(f"\n{report_md}")
    print()


def evaluate_image():
    """Evaluate image content."""
    print("=" * 80)
    print("Example 2: Image Evaluation")
    print("=" * 80)
    print()
    
    # Simulated base64 image (in real usage, provide actual base64 data)
    payload = {
        "image_base64": "<BASE64_ENCODED_IMAGE_DATA>",
        "text": "Analyze this UI screenshot for accessibility issues",
        "metadata": {
            "source": "ui_review",
            "priority": "medium"
        }
    }
    
    print("Image evaluation requires actual image data.")
    print("In production, provide real base64-encoded image data.")
    print()
    print("Expected modality detection: image")
    print("Expected features extraction:")
    print("  - Objects (buttons, inputs, labels)")
    print("  - Layout analysis")
    print("  - OCR text extraction")
    print("  - Color contrast analysis")
    print()


def evaluate_pdf():
    """Evaluate PDF content."""
    print("=" * 80)
    print("Example 3: PDF Evaluation")
    print("=" * 80)
    print()
    
    # Simulated base64 PDF
    payload = {
        "pdf_base64": "<BASE64_ENCODED_PDF_DATA>",
        "text": "Review this PDF document for compliance",
        "metadata": {
            "source": "document_review",
            "priority": "high"
        }
    }
    
    print("PDF evaluation requires actual PDF data.")
    print("In production, provide real base64-encoded PDF data.")
    print()
    print("Expected modality detection: pdf")
    print("Expected features extraction:")
    print("  - Page-by-page text extraction")
    print("  - OCR for scanned PDFs")
    print("  - Document metadata")
    print("  - Layout analysis")
    print()


def evaluate_code():
    """Evaluate code content."""
    print("=" * 80)
    print("Example 4: Code Evaluation")
    print("=" * 80)
    print()
    
    payload = {
        "code": """
def authenticate_user(username, password):
    # Direct password comparison (insecure!)
    if users[username]['password'] == password:
        return True
    return False
""",
        "language": "python",
        "text": "Review this code for security vulnerabilities",
        "metadata": {
            "source": "code_review",
            "priority": "high"
        }
    }
    
    # Run through pipeline
    router = Router()
    fusion = Fusion()
    engine = ScoreEngine()
    kernel = Kernel()
    
    # Route
    route = router.route(payload)
    print(f"Routed to model: {route.model}")
    
    # Extract features
    features = fusion.extract(payload)
    print(f"Modality: {features['modality']}")
    print(f"Language: {features['features'].get('language', 'unknown')}")
    
    # Evaluate
    result = engine.evaluate(features)
    print(f"Risk Score: {result['risk_score']}/100")
    print(f"Verdict: {result['verdict']}")
    
    # Generate report
    report_md, _ = kernel.render(result)
    print(f"\n{report_md}")
    print()


def evaluate_ui_mockup():
    """Evaluate UI mockup."""
    print("=" * 80)
    print("Example 5: UI Mockup Evaluation")
    print("=" * 80)
    print()
    
    # Simulated base64 UI mockup
    payload = {
        "ui_base64": "<BASE64_ENCODED_UI_MOCKUP>",
        "text": "Evaluate this UI mockup for UX and accessibility",
        "metadata": {
            "source": "ux_review",
            "priority": "medium"
        }
    }
    
    print("UI mockup evaluation requires actual image data.")
    print("In production, provide real base64-encoded UI mockup data.")
    print()
    print("Expected modality detection: ui")
    print("Expected features extraction:")
    print("  - UI elements (buttons, forms, navigation)")
    print("  - Layout structure")
    print("  - Color scheme analysis")
    print("  - Accessibility assessment")
    print("  - UX recommendations")
    print()


def main():
    """Run all multimodal evaluation examples."""
    
    print("""
    ╔══════════════════════════════════════════════════════════════════════╗
    ║                                                                    ║
    ║                  SlavkoScore 4.0 - Multimodal Examples             ║
    ║                                                                    ║
    ╚══════════════════════════════════════════════════════════════════════╝
    """)
    
    # Run examples
    evaluate_text()
    evaluate_image()
    evaluate_pdf()
    evaluate_code()
    evaluate_ui_mockup()
    
    print("=" * 80)
    print("All Multimodal Evaluation Examples Complete!")
    print("=" * 80)
    print()
    print("Key Takeaways:")
    print("  ✓ SlavkoScore supports multiple content modalities")
    print("  ✓ Each modality has specialized feature extraction")
    print("  ✓ Unified evaluation pipeline for all modalities")
    print("  ✓ Consistent audit trail across all content types")
    print()


if __name__ == "__main__":
    main()