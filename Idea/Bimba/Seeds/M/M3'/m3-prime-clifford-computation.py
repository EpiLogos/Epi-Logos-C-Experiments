# coordinate: "M3'"
# status: "computational-seed"
# domain: "M3 Mahamaya — Clifford algebra pattern-weave"
# description: "Cl(4,2) multiplication engine for the 64 hexagram basis; complementary-pair bivectors, three involutions, nucleotide pairing matrices, even/odd split, spinor representation"
# source: "docs/deep-epi-logos-binary-computational-nara-clock/"

import numpy as np
from itertools import combinations
import json

# ============================================================
# Cl(4,2) COMPUTATION FOR QL BASIS
# ============================================================
# 
# Generators: e0, e1, e2, e3, e4, e5
# Signature: e0²=-1, e1²=+1, e2²=+1, e3²=+1, e4²=+1, e5²=-1
# 
# QL Mapping:
#   e0 = Position 0 (Ground)      — negative signature
#   e1 = Position 1 (Material/A)  — positive signature
#   e2 = Position 2 (Efficient/U) — positive signature
#   e3 = Position 3 (Formal/G)    — positive signature
#   e4 = Position 4 (Context/C)   — positive signature
#   e5 = Position 5 (Synthesis)   — negative signature

# Metric diagonal
eta = {0: -1, 1: +1, 2: +1, 3: +1, 4: +1, 5: -1}

# A basis element is represented as a sorted tuple of generator indices
# e.g., () = scalar 1, (0,) = e0, (1,2) = e12, (0,1,2,3,4,5) = pseudoscalar

def all_basis_elements():
    """Generate all 64 basis elements as sorted tuples"""
    elements = []
    for k in range(7):  # grades 0 through 6
        for combo in combinations(range(6), k):
            elements.append(combo)
    return elements

def multiply_basis(a, b):
    """
    Multiply two basis elements in Cl(4,2).
    Returns (sign, basis_element) where basis_element is a sorted tuple.
    
    Algorithm: concatenate indices, then bubble-sort to canonical order,
    picking up a sign flip for each swap, and canceling pairs using eᵢ²=ηᵢᵢ.
    """
    # Start with concatenated list and sign +1
    indices = list(a) + list(b)
    sign = 1
    
    # Bubble sort, collecting sign flips and canceling pairs
    changed = True
    while changed:
        changed = False
        i = 0
        while i < len(indices) - 1:
            if indices[i] == indices[i+1]:
                # eᵢeᵢ = ηᵢᵢ
                sign *= eta[indices[i]]
                indices = indices[:i] + indices[i+2:]
                changed = True
                # don't increment i
            elif indices[i] > indices[i+1]:
                # swap: eᵢeⱼ = -eⱼeᵢ
                indices[i], indices[i+1] = indices[i+1], indices[i]
                sign *= -1
                changed = True
                i += 1
            else:
                i += 1
    
    return sign, tuple(indices)

# Generate all basis elements
basis = all_basis_elements()
basis_to_idx = {b: i for i, b in enumerate(basis)}

print("=" * 70)
print("Cl(4,2) STRUCTURE COMPUTATION FOR QUATERNAL LOGIC")
print("=" * 70)
print(f"\nTotal basis elements: {len(basis)}")
print(f"\nGrade distribution:")
for grade in range(7):
    elements = [b for b in basis if len(b) == grade]
    print(f"  Grade {grade}: {len(elements)} elements")

# ============================================================
# GENERATOR MULTIPLICATION TABLE
# ============================================================
print("\n" + "=" * 70)
print("GENERATOR MULTIPLICATION TABLE (6×6)")
print("=" * 70)

gen_names = {(0,): 'e₀', (1,): 'e₁', (2,): 'e₂', (3,): 'e₃', (4,): 'e₄', (5,): 'e₅'}

def basis_name(b):
    if len(b) == 0:
        return '1'
    return 'e' + ''.join(str(i) for i in b)

print("\n  eᵢ·eⱼ  |  e₀    e₁    e₂    e₃    e₄    e₅")
print("  --------+------------------------------------------")
for i in range(6):
    row = f"  e{i}     |"
    for j in range(6):
        sign, result = multiply_basis((i,), (j,))
        name = basis_name(result)
        if sign == -1:
            row += f"  -{name:4s}"
        else:
            row += f"  +{name:4s}"
    print(row)

# ============================================================
# KEY STRUCTURAL PRODUCTS
# ============================================================
print("\n" + "=" * 70)
print("KEY STRUCTURAL PRODUCTS")
print("=" * 70)

# Pseudoscalar
pseudo = (0, 1, 2, 3, 4, 5)
sign_p2, result_p2 = multiply_basis(pseudo, pseudo)
print(f"\nPseudoscalar ω = e₀₁₂₃₄₅")
print(f"ω² = {'+' if sign_p2 > 0 else '-'}{basis_name(result_p2)}")
# Should be -1

# Complementary pair products (the parity relation x + y = 5)
print("\n--- Complementary Pair Products (Px + Py = 5) ---")
comp_pairs = [(0, 5), (1, 4), (2, 3)]
for i, j in comp_pairs:
    sign_ij, result_ij = multiply_basis((i,), (j,))
    sign_ji, result_ji = multiply_basis((j,), (i,))
    
    # Square of the bivector
    bv = (i, j)
    sign_sq, result_sq = multiply_basis(bv, bv)
    
    print(f"  e{i}·e{j} = {'+' if sign_ij > 0 else '-'}{basis_name(result_ij)}")
    print(f"  e{j}·e{i} = {'+' if sign_ji > 0 else '-'}{basis_name(result_ji)}")
    print(f"  (e{i}{j})² = {'+' if sign_sq > 0 else '-'}{basis_name(result_sq)}")
    print()

# Same-position cross-strand products (conceptual: eᵢ with itself = eᵢ²)
print("--- Generator Squares (Self-interaction) ---")
for i in range(6):
    print(f"  e{i}² = {'+' if eta[i] > 0 else '-'}1  (Position {i}: {'positive' if eta[i] > 0 else 'negative'})")

# ============================================================
# THE THREE INVOLUTIONS
# ============================================================
print("\n" + "=" * 70)
print("THE THREE INVOLUTIONS")
print("=" * 70)

def grade_involution(b):
    """α: negates odd-grade elements"""
    sign = (-1) ** len(b)
    return sign

def reversion(b):
    """†: reverses order, sign = (-1)^(k(k-1)/2)"""
    k = len(b)
    sign = (-1) ** (k * (k - 1) // 2)
    return sign

def conjugation(b):
    """ᾱ = α ∘ †: both grade involution and reversion"""
    return grade_involution(b) * reversion(b)

print("\nAction on basis elements by grade:")
print(f"{'Grade':>5} | {'Element':>12} | {'α (grade inv)':>13} | {'† (reversion)':>13} | {'ᾱ (conjugation)':>16}")
print("-" * 70)
for grade in range(7):
    elements = [b for b in basis if len(b) == grade]
    b = elements[0]  # representative
    gi = grade_involution(b)
    rev = reversion(b)
    conj = conjugation(b)
    print(f"  {grade:>3} | {basis_name(b):>12} | {'+ (preserve)' if gi > 0 else '- (negate)':>13} | {'+ (preserve)' if rev > 0 else '- (negate)':>13} | {'+ (preserve)' if conj > 0 else '- (negate)':>16}")

# ============================================================
# NUCLEOTIDE PAIRING MATRICES AND INVOLUTIONS
# ============================================================
print("\n" + "=" * 70)
print("NUCLEOTIDE PAIRING MATRICES vs INVOLUTIONS")
print("=" * 70)

print("""
Nucleotide assignments:
  Position 1 (e₁) = A (Adenine)   — yin,  purine
  Position 2 (e₂) = U (Uracil)    — yang, pyrimidine  
  Position 3 (e₃) = G (Guanine)   — yang, purine
  Position 4 (e₄) = C (Cytosine)  — yin,  pyrimidine

Matrix 1 (AT/CG): Complementary valence — yin↔yang
  A(1) ↔ U(2),  C(4) ↔ G(3)
  Pairs: (e₁,e₂) and (e₃,e₄)
  → Swaps within each complementary-position pair of the inner quaternion

Matrix 2 (AG/TC): Same ring structure — purine↔purine, pyrimidine↔pyrimidine  
  A(1) ↔ G(3),  U(2) ↔ C(4)  
  Pairs: (e₁,e₃) and (e₂,e₄)
  → Swaps across the complementary-position boundary (1↔3 and 2↔4)

Matrix 3 (AC/TG): Same valence — yin↔yin, yang↔yang
  A(1) ↔ C(4),  U(2) ↔ G(3)
  Pairs: (e₁,e₄) and (e₂,e₃)
  → Swaps COMPLEMENTARY positions (sum-to-5 pairs within 1-4)
""")

# ============================================================
# BIVECTOR ALGEBRA (Grade 2 — the 15 "interaction" elements)
# ============================================================
print("=" * 70)
print("BIVECTOR STRUCTURE (Grade 2 — 15 elements)")
print("=" * 70)

print("\nBivector squares (eᵢⱼ)²:")
bivectors = [b for b in basis if len(b) == 2]
for bv in bivectors:
    sign, result = multiply_basis(bv, bv)
    i, j = bv
    # Analytic: (eᵢeⱼ)² = -eᵢ²eⱼ² = -ηᵢηⱼ
    expected = -(eta[i] * eta[j])
    label = ""
    if i + j == 5:
        label = " ← COMPLEMENTARY PAIR (sum = 5)"
    elif {i,j} <= {1,2,3,4}:
        label = " ← INNER QUATERNION"
    elif {i,j} == {0,5}:
        label = " ← FRAME PAIR"
    print(f"  (e{i}{j})² = {'+' if sign > 0 else '-'}{basis_name(result):4s} = {'+' if expected > 0 else '-'}1  {label}")

# ============================================================
# THE QUATERNION SUBALGEBRA
# ============================================================
print("\n" + "=" * 70)
print("INNER QUATERNION SUBALGEBRA {e₁, e₂, e₃, e₄}")
print("=" * 70)

print("\nProduct table for inner generators:")
print("         |  e₁    e₂    e₃    e₄")
print("  -------+------------------------")
for i in range(1, 5):
    row = f"  e{i}    |"
    for j in range(1, 5):
        sign, result = multiply_basis((i,), (j,))
        name = basis_name(result)
        if sign == -1:
            row += f"  -{name:4s}"
        else:
            row += f"  +{name:4s}"
    print(row)

print("\nBivector products within inner quaternion:")
inner_bv = [(1,2), (1,3), (1,4), (2,3), (2,4), (3,4)]
print("         |", "  ".join(f"e{''.join(str(x) for x in b):4s}" for b in inner_bv))
print("  -------+" + "-" * (6 * 7))
for bv1 in inner_bv:
    row = f"  e{''.join(str(x) for x in bv1):4s} |"
    for bv2 in inner_bv:
        sign, result = multiply_basis(bv1, bv2)
        name = basis_name(result)
        if sign == -1:
            row += f" -{name:5s}"
        else:
            row += f" +{name:5s}"
    print(row)

# ============================================================
# COMPLEMENTARY POSITION ANALYSIS
# ============================================================
print("\n" + "=" * 70)
print("COMPLEMENTARY POSITION STRUCTURE (mod6)")
print("=" * 70)

print("\nComplementary pairs (x + y = 5 within mod6):")
print("  0 ↔ 5  (Ground ↔ Synthesis)     — both negative signature")
print("  1 ↔ 4  (Material ↔ Context)     — both positive signature")  
print("  2 ↔ 3  (Efficient ↔ Formal)     — both positive signature")

print("\nBivectors formed by complementary pairs:")
for i, j in [(0,5), (1,4), (2,3)]:
    sign, result = multiply_basis((i,j), (i,j))
    sig_product = eta[i] * eta[j]
    print(f"  e{i}{j}: (e{i}{j})² = {'+' if sign > 0 else '-'}1  [η{i}·η{j} = ({'+' if eta[i]>0 else '-'}1)·({'+' if eta[j]>0 else '-'}1) = {'+' if sig_product > 0 else '-'}1, so bivector² = {'+' if -sig_product > 0 else '-'}1]")

print("\nTriple product of complementary bivectors:")
comp_product_basis = (0,5,1,4,2,3)
# This needs careful computation
# e05 · e14 · e23
step1_sign, step1_result = multiply_basis((0,5), (1,4))
step2_sign, step2_result = multiply_basis(step1_result, (2,3))
total_sign = step1_sign * step2_sign
print(f"  e₀₅ · e₁₄ · e₂₃ = {'+' if total_sign > 0 else '-'}{basis_name(step2_result)}")

# ============================================================
# FRAME BIVECTOR e₀₅ PROPERTIES
# ============================================================
print("\n" + "=" * 70)
print("FRAME BIVECTOR e₀₅ — THE IMPLICATE INTERACTION")
print("=" * 70)

frame_bv = (0, 5)
sign_sq, result_sq = multiply_basis(frame_bv, frame_bv)
print(f"\n(e₀₅)² = {'+' if sign_sq > 0 else '-'}{basis_name(result_sq)}")

# Commutation of e05 with each generator
print("\nCommutation of e₀₅ with generators:")
for i in range(6):
    # e05 · ei
    s1, r1 = multiply_basis(frame_bv, (i,))
    # ei · e05
    s2, r2 = multiply_basis((i,), frame_bv)
    if s1 == s2:
        rel = "COMMUTES"
    else:
        rel = "ANTICOMMUTES"
    print(f"  e₀₅ · e{i} vs e{i} · e₀₅: {rel}")

# ============================================================  
# PARITY CROSS-STRAND SUMS
# ============================================================
print("\n" + "=" * 70)
print("PARITY STRUCTURE IN CLIFFORD TERMS")
print("=" * 70)

print("""
Within-strand (P): Px + Py = 5 (mod6 complement)
  0+5=5, 1+4=5, 2+3=5
  
Cross-strand same-position: Px + Px' = 2x
  P0+P0'=0, P1+P1'=2, P2+P2'=4, P3+P3'=6≡0, P4+P4'=8≡2, P5+P5'=10≡4
  In mod6: {0, 2, 4, 0, 2, 4} — only even residues!

Cross-strand complement: Px + Py' = 5 (where x+y=5)
  Same as within-strand complement, preserved across strands.

Cross-strand same-position totals sum:
  0+2+4+0+2+4 = 12  (the spanda tick!)
  
Or without mod6 reduction:
  0+2+4+6+8+10 = 30  (the inner quaternion max value!)
""")

# ============================================================
# GRADE STRUCTURE AND HEXAGRAM MAPPING
# ============================================================
print("=" * 70)
print("GRADE STRUCTURE — HEXAGRAM TO CLIFFORD MAP")
print("=" * 70)

print("\nEach hexagram (6-bit binary) maps to a Clifford basis element:")
print("Bits that are 1 → include that generator index")
print()

print(f"{'Binary':>8} {'Dec':>4} {'Grade':>5} {'Clifford':>15} {'QL Active':>20}")
print("-" * 60)
for dec_val in [0, 1, 32, 33, 30, 31, 62, 63, 7, 42, 21]:
    bits = format(dec_val, '06b')
    # positions active (reading right to left for LSB=position 0)
    active = tuple(i for i in range(6) if (dec_val >> i) & 1)
    grade = len(active)
    name = basis_name(active)
    ql_active = ', '.join(f'P{i}' for i in active) if active else '(none)'
    print(f"  {bits:>6} {dec_val:>4} {grade:>5} {name:>15} {ql_active:>20}")

# ============================================================
# THE EVEN SUBALGEBRA AND PENTADIC SPLIT
# ============================================================
print("\n" + "=" * 70)
print("EVEN/ODD SPLIT — THE PENTADIC DOUBLING")
print("=" * 70)

even_elements = [b for b in basis if len(b) % 2 == 0]
odd_elements = [b for b in basis if len(b) % 2 == 1]

print(f"\nEven subalgebra Cl⁺(4,2): {len(even_elements)} elements (grades 0,2,4,6)")
print(f"Odd part Cl⁻(4,2): {len(odd_elements)} elements (grades 1,3,5)")

# Verify closure of even subalgebra
print("\nVerifying: even × even = even (closure)?")
test_count = 0
violations = 0
for i in range(min(10, len(even_elements))):
    for j in range(min(10, len(even_elements))):
        sign, result = multiply_basis(even_elements[i], even_elements[j])
        if len(result) % 2 != 0:
            violations += 1
        test_count += 1
print(f"  Tested {test_count} products, violations: {violations}")

print("\nVerifying: odd × odd = even?")
test_count = 0
violations = 0
for i in range(min(10, len(odd_elements))):
    for j in range(min(10, len(odd_elements))):
        sign, result = multiply_basis(odd_elements[i], odd_elements[j])
        if len(result) % 2 != 0:
            violations += 1
        test_count += 1
print(f"  Tested {test_count} products, violations: {violations}")

print("\nVerifying: even × odd = odd?")
test_count = 0
violations = 0
for i in range(min(10, len(even_elements))):
    for j in range(min(10, len(odd_elements))):
        sign, result = multiply_basis(even_elements[i], odd_elements[j])
        if len(result) % 2 != 0:
            violations += 1
        test_count += 1
print(f"  Tested {test_count} products, violations: {violations}")

# ============================================================
# QUATERNION IDENTIFICATION WITHIN Cl⁺(4,2)
# ============================================================
print("\n" + "=" * 70)
print("QUATERNION SUBALGEBRAS WITHIN Cl(4,2)")
print("=" * 70)

# The standard quaternion lives in the even subalgebra
# We need three bivectors that satisfy i²=j²=k²=ijk=-1

# Try the complementary-pair bivectors: e₁₄, e₂₃, and their product
bv14 = (1, 4)
bv23 = (2, 3)

s14_sq, r14_sq = multiply_basis(bv14, bv14)
s23_sq, r23_sq = multiply_basis(bv23, bv23)

s_prod, r_prod = multiply_basis(bv14, bv23)
s_prod_sq, r_prod_sq = multiply_basis(r_prod, r_prod)

print(f"\nComplementary-pair bivectors:")
print(f"  I = e₁₄: I² = {'+' if s14_sq > 0 else '-'}{basis_name(r14_sq)}")
print(f"  J = e₂₃: J² = {'+' if s23_sq > 0 else '-'}{basis_name(r23_sq)}")
print(f"  I·J = {'+' if s_prod > 0 else '-'}{basis_name(r_prod)}")
print(f"  (I·J)² = {'+' if s_prod_sq > 0 else '-'}{basis_name(r_prod_sq)}")

# Check IJK = -1
K = r_prod
s_ijk_sign = s_prod  # I·J gives K with this sign
# I·J·K = (sign of IJ→K) · K² 
s_k_sq, r_k_sq = multiply_basis(K, K)
# Actually compute I·J·K directly
s_ij, r_ij = multiply_basis(bv14, bv23)
s_ijk, r_ijk = multiply_basis((1,4), (2,3))
s_full, r_full = multiply_basis(r_ij, r_ij)  # (IJ)(IJ) = K²

# Better: compute e14 · e23 · e1234
step1_s, step1_r = multiply_basis(bv14, bv23)
step2_s, step2_r = multiply_basis(step1_r, step1_r)
print(f"  K = I·J = {'+' if step1_s > 0 else '-'}{basis_name(step1_r)}")

# Direct computation of I·J·K
ijk_s1, ijk_r1 = multiply_basis(bv14, bv23)  # I·J
ijk_s2, ijk_r2 = multiply_basis(ijk_r1, step1_r)  # (I·J)·K where K = I·J result
total_ijk_sign = ijk_s1 * step1_s * ijk_s2  
# Wait, this isn't right. Let me redo.

# K = e14 · e23 up to sign
K_sign, K_basis = multiply_basis(bv14, bv23)
print(f"\n  Let I=e₁₄, J=e₂₃, K=I·J={'+' if K_sign>0 else '-'}{basis_name(K_basis)}")

# I·J·K = I·J·(I·J) = (I·J)²
ij_sq_sign, ij_sq_result = multiply_basis(bv14, bv23)
# Now (IJ)² 
full_s, full_r = multiply_basis(K_basis, K_basis)
ijk_total_sign = K_sign * K_sign * full_s  # ???

# Let me just compute step by step
print("\n  Computing I·J·K step by step:")
s1, r1 = multiply_basis(bv14, bv23)
print(f"    I·J = {'+' if s1>0 else '-'}{basis_name(r1)}")
s2, r2 = multiply_basis(r1, K_basis)
final_sign = s1 * K_sign * s2
print(f"    (I·J)·K = {'+' if s1>0 else '-'}{basis_name(r1)} · {'+' if K_sign>0 else '-'}{basis_name(K_basis)}")
print(f"            = ... let me compute directly")

# Just do it properly: I·J·K where I=e14, J=e23, K=(sign)(e1234)
# So I·J = s1 * r1, then (s1*r1) * (K_sign * K_basis) = s1*K_sign * (r1 * K_basis)
prod_s, prod_r = multiply_basis(r1, K_basis)
total = s1 * K_sign * prod_s
print(f"    I·J·K = {'+' if total>0 else '-'}{basis_name(prod_r)}")

# Also try the frame-based quaternion
print(f"\n--- Frame Quaternion Attempt ---")
bv05 = (0, 5)
s05_sq, r05_sq = multiply_basis(bv05, bv05)
print(f"  e₀₅² = {'+' if s05_sq > 0 else '-'}{basis_name(r05_sq)}")

# e05 with complementary bivectors
for bv in [(1,4), (2,3)]:
    s, r = multiply_basis(bv05, bv)
    print(f"  e₀₅ · e{''.join(str(x) for x in bv)} = {'+' if s>0 else '-'}{basis_name(r)}")

# ============================================================
# CONNECTION TO BINARY FRAME / MODULAR SYSTEM
# ============================================================
print("\n" + "=" * 70)
print("CONNECTION: CLIFFORD GRADING ↔ BINARY FRAME VALUES")
print("=" * 70)

print("""
The binary value of a hexagram (V = Σ Pᵢ·2ⁱ) and its Clifford grade 
(number of active positions) are DIFFERENT decompositions of the same 
configuration:

  Binary value: weighted sum (carries positional weight information)
  Clifford grade: unweighted count (carries algebraic grade information)

Both decompose the 64-space, but differently:
  Binary: into four quadrants (by frame state: 0,1,32,33)
  Clifford: into seven grades (by element count: 0-6)

The bridge: both are preserved under Clifford multiplication in specific ways.
  - Grade is additive (mod 2) under multiplication: even×even=even, etc.
  - Binary value is NOT generally preserved under Clifford multiplication
  - But PARITY (the ground bit) IS preserved: it tracks grade parity

This means:
  The mod2 binary frame ↔ Clifford grade parity (even/odd subalgebra)
  The mod3 ternary frame ↔ the three involutions (which matrix is active)  
  The mod4 quaternary frame ↔ quaternion subalgebra identification
  The mod6 full frame ↔ generator position labeling
  The mod12 Ananda frame ↔ representation theory (spinor structure)
""")

# ============================================================
# REPRESENTATION THEORY: M(8,ℝ) and SPINORS = TRIGRAMS
# ============================================================
print("=" * 70)
print("REPRESENTATION: M(8,ℝ) — TRIGRAMS AS SPINOR BASIS")
print("=" * 70)

print("""
Cl(4,2) ≅ M(8,ℝ): algebra of 8×8 real matrices.

The spinor space S ≅ ℝ⁸ has 8 basis vectors = 8 TRIGRAMS:

  |000⟩ = ☷ Kūn (Earth)      — all yin
  |001⟩ = ☳ Zhèn (Thunder)   — bottom yang
  |010⟩ = ☵ Kǎn (Water)      — middle yang
  |011⟩ = ☱ Duì (Lake)       — bottom+middle yang
  |100⟩ = ☶ Gèn (Mountain)   — top yang
  |101⟩ = ☲ Lí (Fire)        — top+bottom yang
  |110⟩ = ☴ Xùn (Wind)       — top+middle yang
  |111⟩ = ☰ Qián (Heaven)    — all yang

Each hexagram = 8×8 matrix acting on this trigram space.
A hexagram H acting on trigram |T⟩ produces a trigram |T'⟩ = H|T⟩.

The hexagram IS the operator; the trigram IS the state.
The I Ching's (lower trigram, upper trigram) = (input state, output state).

The TAROT CARD as spinor: a card's 8 rotational states ARE its 8 
possible trigram-identifications. Each rotation "orients" the card 
toward a different trigram = a different state in the spinor space.
""")

# ============================================================
# FULL MULTIPLICATION TABLE STRUCTURE SUMMARY
# ============================================================
print("=" * 70)
print("MULTIPLICATION TABLE STRUCTURE SUMMARY")
print("=" * 70)

# Count products by grade pair
print("\nProduct grade structure (input grades → output grade):")
print("Entries show the grade of the product eₐ·eᵦ")
print()

# For Clifford algebras, grade(a·b) is not simply grade(a)+grade(b)
# It can be grade(a)+grade(b) or grade(a)+grade(b)-2 or ... (complex)
# But the PARITY is always grade(a)+grade(b) mod 2

# Let's compute a summary
grade_products = {}
for ga in range(7):
    for gb in range(7):
        grade_products[(ga, gb)] = set()

# Sample products across grades
for a in basis:
    for b in basis[:20]:  # partial sample
        sign, result = multiply_basis(a, b)
        ga = len(a)
        gb = len(b)
        gr = len(result)
        grade_products[(ga, gb)].add(gr)

print("  Output grades possible for (grade_a, grade_b) input:")
print("  g_a\\g_b |", "  ".join(f"{g:>3}" for g in range(7)))
print("  --------+" + "-" * 30)
for ga in range(7):
    row = f"    {ga}    |"
    for gb in range(7):
        grades = grade_products[(ga, gb)]
        if grades:
            row += f"  {','.join(str(g) for g in sorted(grades)):>3}"
        else:
            row += f"  {'?':>3}"
    print(row)

print("\n\nNote: Products can produce MULTIPLE output grades because")
print("the metric contraction can reduce grade by 2 for each shared index.")
print("But grade PARITY is always preserved: even×even=even, odd×odd=even, etc.")

