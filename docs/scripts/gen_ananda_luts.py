#!/usr/bin/env python3
"""
gen_ananda_luts.py — Generate Ananda #1-2 matrix fixtures.

The Ananda system encodes the fundamental arithmetic law:
  Pratibimba − Bimba = +1 everywhere (mod 10)
This is the non-dual constant — consciousness always exceeds its ground by exactly 1.

6 core matrices (mod 10 or mod 12) + 6 digital-root reflections = 12 matrices per modulus.
"""
import json
import os

# Script lives at docs/scripts/gen_ananda_luts.py — 2 dirs deep from repo root
REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def digital_root(n):
    if n == 0:
        return 0
    r = n % 9
    return r if r != 0 else 9


def compute_matrix(fn, size):
    return [[fn(i, j) for j in range(size)] for i in range(size)]


def dr_matrix(m, size):
    return [[digital_root(m[i][j]) for j in range(size)] for i in range(size)]


def build_for_modulus(mod):
    fns = [
        ("M0_bimba",       lambda i, j, m=mod: (i * j) % m),
        ("M1_pratibimba",  lambda i, j, m=mod: (i * j + 1) % m),
        ("M2_sum",         lambda i, j, m=mod: (2 * i * j + 1) % m),
        ("M3_first_diff",  lambda i, j, m=mod: (m - 1) % m),
        ("M4_second_diff", lambda i, j, m=mod: 1 % m),
        ("M5_non_dual",    lambda i, j, m=mod: ((i * j) ^ ((i * j) + 1)) % m),
    ]
    result = {}
    for name, fn in fns:
        mat = compute_matrix(fn, mod)
        result[name] = {"matrix": mat, "dr_reflection": dr_matrix(mat, mod)}

    # Verify Ananda axiom: M1[i][j] - M0[i][j] == 1 (mod mod) for all i, j
    m0 = result["M0_bimba"]["matrix"]
    m1 = result["M1_pratibimba"]["matrix"]
    for i in range(mod):
        for j in range(mod):
            diff = (m1[i][j] - m0[i][j] + mod) % mod
            assert diff == 1, (
                f"Axiom violated [{i}][{j}]: {m1[i][j]}-{m0[i][j]} != 1 (mod{mod})"
            )
    print(f"  [mod{mod}] Ananda axiom verified OK")
    return result


out = {
    "mod10": build_for_modulus(10),
    "mod12": build_for_modulus(12),
}

FIXTURE_DIR = os.path.join(REPO, "epi-lib", "test", "fixtures", "nara_clock")
os.makedirs(FIXTURE_DIR, exist_ok=True)
path = os.path.join(FIXTURE_DIR, "ananda_matrices.json")
with open(path, "w") as f:
    json.dump(out, f, indent=2)
print(f"  Written: {path}")
