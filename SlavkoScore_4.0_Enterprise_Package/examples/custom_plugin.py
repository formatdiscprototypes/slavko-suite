#!/usr/bin/env python3
"""
SlavkoScore 4.0 - Custom Plugin Example

This example demonstrates how to create and use custom scoring plugins
in SlavkoScore 4.0.
"""

from slavko_score import ScoreEngine
from slavko_score.plugins import ScoringRule
import json


class KeywordRiskRule(ScoringRule):
    """Detect high-risk keywords in text content."""
    
    def __init__(self, keywords=None, weight=1.0):
        """
        Initialize the keyword risk rule.
        
        Args:
            keywords: List of high-risk keywords to detect
            weight: Weight multiplier for the score
        """
        self.keywords = keywords or [
            "password", "secret", "api_key", "token",
            "credit_card", "social_security", "private_key"
        ]
        self.weight = weight
    
    def evaluate(self, context: dict) -> float:
        """
        Evaluate risk based on keyword presence.
        
        Args:
            context: Evaluation context with features
            
        Returns:
            float: Risk score between 0 and 100
        """
        text = context.get("features", {}).get("text", "").lower()
        
        risk_score = 0.0
        found_keywords = []
        
        for keyword in self.keywords:
            if keyword in text:
                risk_score += 10
                found_keywords.append(keyword)
        
        # Store found keywords for explanation
        self._found_keywords = found_keywords
        
        return min(risk_score * self.weight, 100.0)
    
    def explain(self, context: dict, score: float) -> str:
        """
        Provide explanation for the score.
        
        Args:
            context: Evaluation context
            score: Calculated risk score
            
        Returns:
            str: Human-readable explanation
        """
        if hasattr(self, '_found_keywords') and self._found_keywords:
            return f"Found high-risk keywords: {', '.join(self._found_keywords)}"
        return "No high-risk keywords detected"


class LengthComplexityRule(ScoringRule):
    """Assess complexity based on text length."""
    
    def __init__(self, max_length=10000, weight=0.5):
        """
        Initialize the length complexity rule.
        
        Args:
            max_length: Maximum length before risk increases
            weight: Weight multiplier for the score
        """
        self.max_length = max_length
        self.weight = weight
    
    def evaluate(self, context: dict) -> float:
        """
        Evaluate complexity based on text length.
        
        Args:
            context: Evaluation context with features
            
        Returns:
            float: Complexity score between 0 and 100
        """
        text = context.get("features", {}).get("text", "")
        length = len(text)
        
        if length <= self.max_length:
            return 0.0
        
        # Linear scaling beyond max length
        excess = length - self.max_length
        score = (excess / self.max_length) * 100
        
        return min(score * self.weight, 100.0)
    
    def explain(self, context: dict, score: float) -> str:
        """Provide explanation for the score."""
        text = context.get("features", {}).get("text", "")
        length = len(text)
        
        if length > self.max_length:
            return f"Text length ({length}) exceeds recommended maximum ({self.max_length})"
        return "Text length is within acceptable limits"


def main():
    """Demonstrate custom plugin usage."""
    
    print("=" * 80)
    print("SlavkoScore 4.0 - Custom Plugin Example")
    print("=" * 80)
    print()
    
    # 1. Initialize the score engine
    print("Initializing Score Engine with custom plugins...")
    engine = ScoreEngine()
    
    # 2. Register custom plugins
    print("\nRegistering custom plugins...")
    keyword_rule = KeywordRiskRule(weight=1.5)
    length_rule = LengthComplexityRule(max_length=500, weight=0.8)
    
    engine.register_plugin(keyword_rule)
    engine.register_plugin(length_rule)
    
    print(f"✓ Registered: KeywordRiskRule")
    print(f"✓ Registered: LengthComplexityRule")
    print()
    
    # 3. List all registered plugins
    print("All registered plugins:")
    print("-" * 40)
    for rule in engine.rules:
        print(f"  - {rule.__class__.__name__}")
    print()
    
    # 4. Test with sample payload
    test_payload = {
        "modality": "text",
        "features": {
            "text": "This document contains sensitive information including passwords and secret API keys. " * 10,
            "entities": ["passwords", "api keys"]
        },
        "metadata": {
            "timestamp": "2025-01-15T10:30:00Z"
        }
    }
    
    print("Evaluating test payload...")
    print("-" * 40)
    print(f"Text: {test_payload['features']['text'][:100]}...")
    print(f"Length: {len(test_payload['features']['text'])} characters")
    print()
    
    # 5. Run evaluation
    result = engine.evaluate(test_payload)
    
    # 6. Display results
    print("Evaluation Results:")
    print("-" * 40)
    print(f"Risk Score: {result['risk_score']}/100")
    print(f"Verdict: {result['verdict']}")
    print(f"Confidence: {result['confidence']:.2f}")
    print()
    
    print("Rule Breakdown:")
    for rule, score in result['rule_breakdown'].items():
        print(f"  - {rule}: {score:.1f}")
    print()
    
    # 7. Get explanations from custom rules
    print("Rule Explanations:")
    print("-" * 40)
    
    context = test_payload
    for rule in [keyword_rule, length_rule]:
        score = rule.evaluate(context)
        explanation = rule.explain(context, score)
        print(f"  {rule.__class__.__name__}:")
        print(f"    Score: {score:.1f}")
        print(f"    Explanation: {explanation}")
    print()
    
    print("=" * 80)
    print("Custom Plugin Example Complete!")
    print("=" * 80)


if __name__ == "__main__":
    main()