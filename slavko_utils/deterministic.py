"""Deterministic RNG helper for S.L.A.V.K.O.

Provides a small, deterministic PRNG and helpers to replace uses of
non-deterministic randomness in the codebase. Designed to be seeded
at process start and used throughout evaluation and orchestration.

Example:
    from slavko_utils.deterministic import seed_global, random, randint, shuffle
    seed_global('node-01')
    r = random()
    items = shuffle([1,2,3])
"""
from typing import Callable, List, TypeVar
import math
import random as _py_random

T = TypeVar('T')

_RNG = None  # type: Callable[[], float]


def _mulberry32_factory(seed: int) -> Callable[[], float]:
    state = seed & 0xFFFFFFFF

    def rnd() -> float:
        nonlocal state
        state = (state + 0x6D2B79F5) & 0xFFFFFFFF
        t = state
        t = (t ^ (t >> 15)) * (t | 1) & 0xFFFFFFFF
        t ^= t + ((t ^ (t >> 7)) * (t | 61) & 0xFFFFFFFF)
        return ((t ^ (t >> 14)) & 0xFFFFFFFF) / 4294967296.0

    return rnd


def _hash_string_to_seed(s: str) -> int:
    h = 2166136261
    for ch in s:
        h ^= ord(ch)
        h = (h * 16777619) & 0xFFFFFFFF
    return h


def seed_global(seed) -> None:
    """Seed the global deterministic RNG.

    Accepts an int or string. Also seeds Python's random and numpy (if present).
    """
    global _RNG
    s = seed if isinstance(seed, int) else _hash_string_to_seed(str(seed))
    _RNG = _mulberry32_factory(int(s))

    try:
        import numpy as np
        np.random.seed(int(s))
    except Exception:
        pass

    _py_random.seed(int(s))


def random() -> float:
    """Return deterministic float in [0, 1)."""
    if _RNG is None:
        seed_global(0)
    return _RNG()


def randint(a: int, b: int) -> int:
    """Return deterministic integer in [a, b]."""
    return math.floor(random() * (b - a + 1)) + a


def shuffle(seq: List[T]) -> List[T]:
    """Deterministic Fisher–Yates shuffle; returns a new list."""
    a = list(seq)
    for i in range(len(a) - 1, 0, -1):
        j = int(random() * (i + 1))
        a[i], a[j] = a[j], a[i]
    return a


__all__ = [
    'seed_global',
    'random',
    'randint',
    'shuffle',
]
