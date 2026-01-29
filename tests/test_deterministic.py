"""Unit tests for deterministic RNG helper.

Demonstrates reproducibility: identical seed → identical sequences

For documentation and usage examples, see:
- ROOT_README § Deterministic RNG Helpers
- slavko_utils/deterministic.py (implementation)
- TEST_RESULTS.md (test results and integration guide)
"""
import pytest
from slavko_utils.deterministic import (
    seed_global,
    random,
    randint,
    shuffle,
    _mulberry32_factory,
)


class TestMulberry32Factory:
    def test_produces_reproducible_sequence(self):
        """Identical seed produces identical sequences."""
        rng1 = _mulberry32_factory(42)
        rng2 = _mulberry32_factory(42)

        seq1 = [rng1() for _ in range(10)]
        seq2 = [rng2() for _ in range(10)]

        assert seq1 == seq2

    def test_different_seeds_produce_different_sequences(self):
        """Different seeds produce different sequences."""
        rng1 = _mulberry32_factory(42)
        rng2 = _mulberry32_factory(100)

        seq1 = [rng1() for _ in range(10)]
        seq2 = [rng2() for _ in range(10)]

        assert seq1 != seq2

    def test_outputs_in_range(self):
        """All outputs in [0, 1)."""
        rng = _mulberry32_factory(999)
        for _ in range(100):
            v = rng()
            assert 0.0 <= v < 1.0


class TestSeedGlobal:
    def test_accepts_numeric_seed(self):
        """Numeric seed produces reproducible results."""
        seed_global(42)
        seq1 = [random() for _ in range(5)]

        seed_global(42)
        seq2 = [random() for _ in range(5)]

        assert seq1 == seq2

    def test_accepts_string_seed(self):
        """String seed is hashed and produces reproducible results."""
        seed_global("node-01")
        seq1 = [random() for _ in range(5)]

        seed_global("node-01")
        seq2 = [random() for _ in range(5)]

        assert seq1 == seq2

    def test_different_string_seeds_produce_different_sequences(self):
        """Different string seeds produce different sequences."""
        seed_global("node-01")
        seq1 = [random() for _ in range(5)]

        seed_global("node-02")
        seq2 = [random() for _ in range(5)]

        assert seq1 != seq2

    def test_synchronizes_numpy_if_available(self):
        """seedGlobal also seeds numpy.random if available."""
        try:
            import numpy as np

            seed_global(42)
            v1 = np.random.random()

            seed_global(42)
            v2 = np.random.random()

            assert v1 == v2
        except ImportError:
            pass


class TestRandom:
    def test_returns_value_in_range(self):
        """All values in [0, 1)."""
        seed_global(0)
        for _ in range(100):
            v = random()
            assert 0.0 <= v < 1.0

    def test_produces_reproducible_sequence(self):
        """Identical seed produces identical sequence."""
        seed_global(123)
        seq1 = [random() for _ in range(10)]

        seed_global(123)
        seq2 = [random() for _ in range(10)]

        assert seq1 == seq2


class TestRandint:
    def test_returns_values_in_range(self):
        """All values in [min, max]."""
        seed_global(0)
        for _ in range(100):
            v = randint(5, 15)
            assert 5 <= v <= 15
            assert isinstance(v, int)

    def test_produces_reproducible_sequence(self):
        """Identical seed produces identical sequence."""
        seed_global(456)
        seq1 = [randint(1, 100) for _ in range(10)]

        seed_global(456)
        seq2 = [randint(1, 100) for _ in range(10)]

        assert seq1 == seq2

    def test_handles_single_value_range(self):
        """When min == max, always returns that value."""
        v = randint(42, 42)
        assert v == 42


class TestShuffle:
    def test_returns_same_length(self):
        """Shuffled array has same length as original."""
        original = [1, 2, 3, 4, 5]
        result = shuffle(original)
        assert len(result) == len(original)

    def test_does_not_mutate_original(self):
        """shuffle() does not modify the input list."""
        original = [1, 2, 3, 4, 5]
        original_copy = original.copy()
        shuffle(original)
        assert original == original_copy

    def test_produces_reproducible_permutation(self):
        """Identical seed produces identical permutation."""
        seed_global(789)
        arr = [1, 2, 3, 4, 5]
        perm1 = shuffle(arr)

        seed_global(789)
        perm2 = shuffle(arr)

        assert perm1 == perm2

    def test_produces_different_permutations_with_different_seeds(self):
        """Different seeds produce different permutations."""
        seed_global(100)
        arr = [1, 2, 3, 4, 5]
        perm1 = shuffle(arr)

        seed_global(200)
        perm2 = shuffle(arr)

        assert perm1 != perm2

    def test_contains_all_original_elements(self):
        """Shuffled array contains all original elements."""
        seed_global(999)
        original = [10, 20, 30, 40]
        result = shuffle(original)
        assert sorted(result) == sorted(original)

    def test_handles_empty_array(self):
        """Empty array shuffles to empty array."""
        result = shuffle([])
        assert result == []

    def test_handles_single_element(self):
        """Single-element array shuffles to itself."""
        result = shuffle([42])
        assert result == [42]


class TestIntegration:
    def test_complex_sequence_reproduces_with_identical_seed(self):
        """Multi-step sequence reproduces exactly with same seed."""
        seed_global("test-run-1")
        r1 = random()
        i1 = randint(1, 50)
        s1 = shuffle([1, 2, 3, 4, 5])
        r2 = random()

        seed_global("test-run-1")
        r1b = random()
        i1b = randint(1, 50)
        s1b = shuffle([1, 2, 3, 4, 5])
        r2b = random()

        assert (r1, i1, s1, r2) == (r1b, i1b, s1b, r2b)

    def test_different_seeds_produce_different_outcomes(self):
        """Multi-step sequence differs with different seed."""
        seed_global("run-A")
        seq_a = [random() for _ in range(5)]

        seed_global("run-B")
        seq_b = [random() for _ in range(5)]

        assert seq_a != seq_b
