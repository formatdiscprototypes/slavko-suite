# Contributing to SlavkoScore 4.0

> Thank you for your interest in contributing to SlavkoScore!

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing Guidelines](#testing-guidelines)
6. [Documentation](#documentation)
7. [Pull Request Process](#pull-request-process)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors.

### Our Standards

- Respect different viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

### Reporting Issues

If you encounter any issues, please email: conduct@slavko.ai

---

## Getting Started

### Prerequisites

- Python 3.11+
- Docker 24.0+
- Git

### Setup Development Environment

```bash
# Fork and clone the repository
git clone https://github.com/your-username/slavko-score.git
cd slavko-score

# Add upstream remote
git remote add upstream https://github.com/your-org/slavko-score.git

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install development dependencies
pip install -e ".[dev]"

# Install pre-commit hooks
pre-commit install
```

### Project Structure

```
slavko-score/
├── docs/               # Documentation
├── schemas/            # JSON schemas
├── ollama/             # Ollama integration
├── branding/           # Branding assets
├── src/                # Source code
│   ├── slavko_kernel/
│   ├── slavko_shell/
│   ├── slavko_fusion/
│   └── slavko_score/
├── tests/              # Tests
├── examples/           # Example usage
└── scripts/            # Utility scripts
```

---

## Development Workflow

### 1. Create a Branch

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Or bugfix branch
git checkout -b bugfix/your-bugfix-name
```

### 2. Make Changes

- Write clean, readable code
- Add tests for new functionality
- Update documentation as needed
- Follow coding standards

### 3. Test Your Changes

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_kernel.py

# Run with coverage
pytest --cov=src --cov-report=html

# Run linting
flake8 src/
black src/
isort src/

# Run type checking
mypy src/
```

### 4. Commit Changes

```bash
# Stage changes
git add .

# Commit with conventional commit message
git commit -m "feat: add new scoring rule for PII detection"

# Or for bugfix
git commit -m "fix: resolve issue with audit chain ordering"
```

### Conventional Commits

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Test changes
- `chore:` Build process or auxiliary tool changes

Examples:
```
feat(kernel): add custom template support
fix(shell): resolve routing hash collision
docs(api): update API reference
test(fusion): add integration tests
```

---

## Coding Standards

### Python Style Guide

We follow [PEP 8](https://pep8.org/) with additional guidelines:

```python
# Use type hints
def evaluate(payload: dict) -> dict:
    """Evaluate the payload and return results."""
    pass

# Use docstrings
class ScoringRule:
    """Base class for scoring rules."""
    
    def evaluate(self, context: dict) -> float:
        """
        Evaluate the context and return a score.
        
        Args:
            context: Evaluation context
            
        Returns:
            float: Score between 0 and 100
        """
        pass

# Use meaningful variable names
risk_score = calculate_risk(features)
# Not:
x = calc(f)
```

### Code Formatting

We use:
- **Black** for code formatting
- **isort** for import sorting
- **flake8** for linting

```bash
# Format code
black src/
isort src/

# Check linting
flake8 src/
```

### Type Hints

All functions must include type hints:

```python
from typing import Dict, List, Optional

def process_features(
    features: Dict[str, Any],
    threshold: float = 0.5
) -> Optional[Dict[str, Any]]:
    """Process features with optional threshold."""
    pass
```

### Error Handling

```python
# Use specific exceptions
try:
    result = evaluate(payload)
except ValidationError as e:
    logger.error(f"Validation failed: {e}")
    raise
except Exception as e:
    logger.error(f"Unexpected error: {e}")
    raise EvaluationError(f"Evaluation failed: {e}")
```

---

## Testing Guidelines

### Test Structure

```python
# tests/test_kernel.py
import pytest
from slavko_kernel import Kernel

class TestKernel:
    """Test suite for Kernel component."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.kernel = Kernel()
    
    def test_render_valid_payload(self):
        """Test rendering with valid payload."""
        payload = {
            "summary": "Test",
            "details": {},
            "verdict": "PASS",
            "confidence": 0.95
        }
        
        md, json_output = self.kernel.render(payload)
        
        assert md is not None
        assert json_output is not None
        assert json_output["verdict"] == "PASS"
    
    def test_render_invalid_payload(self):
        """Test rendering with invalid payload."""
        with pytest.raises(ValidationError):
            self.kernel.render({})
```

### Test Coverage

We require > 95% test coverage:

```bash
# Generate coverage report
pytest --cov=src --cov-report=html

# Check coverage threshold
pytest --cov=src --cov-fail-under=95
```

### Integration Tests

```python
# tests/integration/test_pipeline.py
def test_full_pipeline():
    """Test the complete evaluation pipeline."""
    from slavko_shell import Shell
    from slavko_fusion import Fusion
    from slavko_score import ScoreEngine
    from slavko_kernel import Kernel
    
    payload = {"text": "Test content"}
    
    # Shell
    shell = Shell()
    routed = shell.route(payload)
    
    # Fusion
    fusion = Fusion()
    features = fusion.extract(payload)
    
    # Score
    engine = ScoreEngine()
    result = engine.evaluate(features)
    
    # Kernel
    kernel = Kernel()
    md, json_output = kernel.render(result)
    
    assert json_output is not None
```

---

## Documentation

### Docstrings

All functions and classes must have docstrings:

```python
def calculate_risk(features: Dict[str, Any]) -> float:
    """
    Calculate risk score from features.
    
    Analyzes the provided features and computes a risk score
    between 0 and 100 based on detected patterns and anomalies.
    
    Args:
        features: Dictionary containing extracted features
        
    Returns:
        float: Risk score between 0 (no risk) and 100 (critical risk)
        
    Raises:
        ValueError: If features are invalid or missing required fields
        
    Example:
        >>> features = {"text": "Sensitive data", "risk_level": "high"}
        >>> calculate_risk(features)
        85.0
    """
    pass
```

### README Updates

Update relevant README when:
- Adding new features
- Changing APIs
- Updating dependencies
- Changing configuration options

### Examples

Add usage examples for new features:

```python
# examples/custom_rule.py
from slavko_score import ScoreEngine
from slavko_score.plugins import ScoringRule

class CustomRule(ScoringRule):
    """Custom scoring rule example."""
    
    def evaluate(self, context: dict) -> float:
        """Evaluate custom logic."""
        return 50.0

# Use the custom rule
engine = ScoreEngine()
engine.register_plugin(CustomRule())
result = engine.evaluate(payload)
```

---

## Pull Request Process

### Before Submitting

1. **Update Documentation**
   - Add/update docstrings
   - Update README if needed
   - Add examples

2. **Run Tests**
   ```bash
   pytest
   ```

3. **Run Linting**
   ```bash
   black src/
   isort src/
   flake8 src/
   ```

4. **Update Changelog**
   - Add entry to CHANGELOG.md

### Creating a Pull Request

1. Push your branch
   ```bash
   git push origin feature/your-feature-name
   ```

2. Create pull request on GitHub
   - Use descriptive title
   - Reference related issues
   - Add description of changes
   - Include screenshots if applicable

3. Fill out PR template
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Testing
   - [ ] Unit tests added/updated
   - [ ] Integration tests added/updated
   - [ ] All tests passing
   
   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Documentation updated
   - [ ] No new warnings generated
   ```

### Review Process

1. **Automated Checks**
   - CI/CD pipeline runs tests
   - Code coverage verified
   - Linting checks pass

2. **Code Review**
   - At least one approval required
   - Address reviewer comments
   - Update code as needed

3. **Merge**
   - Squash and merge to main
   - Delete feature branch
   - Update changelog

---

## Getting Help

### Resources

- **Documentation**: https://docs.slavko.ai
- **Discord**: https://discord.gg/slavko
- **GitHub Issues**: https://github.com/your-org/slavko-score/issues

### Questions?

Feel free to:
- Open an issue for bugs or feature requests
- Start a discussion in GitHub Discussions
- Join our Discord community
- Email us at: dev@slavko.ai

---

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation

Thank you for contributing to SlavkoScore! 🎉

---

**Built with S.L.A.V.K.O.™ – Deterministic AI. Sovereign Control.**