#!/usr/bin/env python3
"""
SlavkoScore 4.0 - Quick Start Example

This example demonstrates the basic usage of SlavkoScore 4.0
for content evaluation and compliance checking.
"""

import json
from slavko_shell import Router
from slavko_fusion import Fusion
from slavko_score import ScoreEngine
from slavko_kernel import Kernel


def main():
    """Run a complete SlavkoScore evaluation pipeline."""
    
    # 1. Create sample input payload
    payload = {
        "text": "This document contains sensitive customer information including email addresses and phone numbers.",
        "metadata": {
            "source": "user_upload",
            "priority": "high",
            "user_id": "user_123"
        }
    }
    
    print("=" * 80)
    print("SlavkoScore 4.0 - Quick Start Example")
    print("=" * 80)
    print()
    
    # 2. SlavkoShell - Routing & Validation
    print("Step 1: SlavkoShell - Routing & Validation")
    print("-" * 80)
    router = Router()
    try:
        route = router.route(payload)
        print(f"✓ Validation passed")
        print(f"✓ Selected model: {route.model}")
        print(f"✓ Route hash: {route.hash}")
    except Exception as e:
        print(f"✗ Routing failed: {e}")
        return
    print()
    
    # 3. SlavkoFusion - Feature Extraction
    print("Step 2: SlavkoFusion - Feature Extraction")
    print("-" * 80)
    fusion = Fusion()
    features = fusion.extract(payload)
    print(f"✓ Modality detected: {features['modality']}")
    print(f"✓ Features extracted:")
    print(json.dumps(features, indent=2))
    print()
    
    # 4. SlavkoScore - Risk Evaluation
    print("Step 3: SlavkoScore - Risk Evaluation")
    print("-" * 80)
    engine = ScoreEngine()
    result = engine.evaluate(features)
    print(f"✓ Risk Score: {result['risk_score']}/100")
    print(f"✓ Verdict: {result['verdict']}")
    print(f"✓ Compliance Pass: {result['compliance_pass']}")
    print(f"✓ Confidence: {result['confidence']:.2f}")
    print()
    print("Rule Breakdown:")
    for rule, score in result['rule_breakdown'].items():
        print(f"  - {rule}: {score}")
    print()
    print("Raw Reasoning:")
    print(f"  Intent: {result['raw_reasoning']['intent']}")
    print(f"  Risks: {result['raw_reasoning']['risks']}")
    print(f"  Compliance: {result['raw_reasoning']['compliance']}")
    print(f"  Recommendations: {result['raw_reasoning']['recommendations']}")
    print()
    
    # 5. SlavkoKernel - Governance Reporting
    print("Step 4: SlavkoKernel - Governance Reporting")
    print("-" * 80)
    kernel = Kernel()
    report_md, report_json = kernel.render(result)
    
    print("Markdown Report:")
    print("-" * 40)
    print(report_md)
    print()
    
    print("JSON Report:")
    print("-" * 40)
    print(json.dumps(report_json, indent=2))
    print()
    
    # 6. Complete Audit Chain
    print("=" * 80)
    print("Complete Audit Chain")
    print("=" * 80)
    audit_chain = report_json['audit_chain']
    for i, audit_id in enumerate(audit_chain, 1):
        print(f"{i}. {audit_id}")
    print()
    
    print("=" * 80)
    print("Evaluation Complete!")
    print("=" * 80)


if __name__ == "__main__":
    main()