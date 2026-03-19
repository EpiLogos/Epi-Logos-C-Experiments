import numpy as np

# ============================================================
# EXPLICIT M(8,ℝ) GAMMA MATRICES FOR Cl(4,2)
# ============================================================
# 
# We need six 8×8 real matrices γ₀,...,γ₅ satisfying:
#   γᵢγⱼ + γⱼγᵢ = 2ηᵢⱼ · I₈
# where η = diag(-1,+1,+1,+1,+1,-1)
#
# Construction: tensor products of 2×2 matrices over 3 levels

# Base 2×2 matrices
I2 = np.eye(2)
# σ₁-like (squares to +I, real, symmetric)
e = np.array([[0, 1], [1, 0]], dtype=float)
# "imaginary unit" (squares to -I, real, antisymmetric)  
f = np.array([[0, -1], [1, 0]], dtype=float)
# σ₃-like (squares to +I, real, diagonal, anticommutes with e and f)
d = np.array([[1, 0], [0, -1]], dtype=float)

# Verify base properties
assert np.allclose(e @ e, I2), "e² should be I"
assert np.allclose(f @ f, -I2), "f² should be -I"
assert np.allclose(d @ d, I2), "d² should be I"
assert np.allclose(e @ d + d @ e, 0), "e,d should anticommute"
assert np.allclose(f @ d + d @ f, 0), "f,d should anticommute"
assert np.allclose(e @ f + f @ e, 0), "e,f should anticommute"

def kron3(A, B, C):
    """Three-level tensor product"""
    return np.kron(A, np.kron(B, C))

# ============================================================
# CONSTRUCTION
# ============================================================
# 
# Strategy: Build 6 anticommuting matrices using tensor products.
# Each generator uses a non-identity matrix at one "active" level
# and d (the anticommuter) at all LOWER levels to ensure 
# anticommutation with generators from those levels.
#
# Level 0 (positions 0,1): active at tensor position 0
# Level 1 (positions 2,3): active at tensor position 1  
# Level 2 (positions 4,5): active at tensor position 2
#
# Within each level, use e (for +1 square) or f (for -1 square)
# for the first generator of that level, and d⊗(active) for the 
# second, ensuring intra-level anticommutation.

# Position 0 (Ground, e₀² = -1): f at level 0
gamma0 = kron3(f, I2, I2)

# Position 1 (Material, e₁² = +1): e at level 0  
gamma1 = kron3(e, I2, I2)

# Position 2 (Efficient, e₂² = +1): d at level 0, e at level 1
gamma2 = kron3(d, e, I2)

# Position 3 (Formal, e₃² = +1): d at level 0, d at level 1... 
# Wait, this would give d⊗d⊗I which squares to +I (correct for +1),
# but we need it to anticommute with gamma2 = d⊗e⊗I.
# (d⊗d⊗I)(d⊗e⊗I) = (dd)⊗(de)⊗(II) = I⊗(-ed)⊗I
# (d⊗e⊗I)(d⊗d⊗I) = (dd)⊗(ed)⊗(II) = I⊗(ed)⊗I
# Sum = I⊗(-ed+ed)⊗I = 0 ✓ They anticommute!
# But wait, d⊗d⊗I squares to I⊗I⊗I = I₈, giving +1. But we could 
# also use d⊗f⊗I for a -1 square. Let's use the right signatures.

# For Position 3 (e₃² = +1), we need a matrix that:
# - Squares to +I₈
# - Anticommutes with γ₀, γ₁, γ₂

# Try: d⊗d⊗I
gamma3_candidate = kron3(d, d, I2)
# Check: (d⊗d⊗I)² = I⊗I⊗I = I₈ ✓ (squares to +1)

# But we need another option for the second pair at level 1.
# Actually, at level 1 we have two generators to place: e₂ and e₃.
# Using e and d at level 1 (with d at level 0 for both):
# γ₂ = d⊗e⊗I  (uses e at level 1)
# γ₃ = d⊗d⊗I  ... but this doesn't use a "new" matrix at level 1.
# Let's check if it works.

# Alternative approach: be more systematic.
# For 6 generators across 3 tensor levels:
# Level 0: two generators using {e or f} and {d} 
# Level 1: two generators using d⊗{e or f} and d⊗{d}... no.
#
# Standard method: 
# γ_{2k} = d^⊗k ⊗ σ_a ⊗ I^⊗(m-k-1)
# γ_{2k+1} = d^⊗k ⊗ σ_b ⊗ I^⊗(m-k-1)
# where (σ_a, σ_b) is chosen based on desired signatures
# and m = n/2 = 3

# For pair at level k with signatures (s_{2k}, s_{2k+1}):
# If both +1: use (e, d) [since e²=I, d²=I, ed+de=0]
# If (+1, -1): use (e, f) [since e²=I, f²=-I, ef+fe=0]  
# If (-1, +1): use (f, e) [since f²=-I, e²=I, fe+ef=0]
# If both -1: use (f, d·f) ... need to check

# Our signature pairs:
# Level 0: e₀²=-1, e₁²=+1 → pair (-1,+1) → use (f, e)
# Level 1: e₂²=+1, e₃²=+1 → pair (+1,+1) → use (e, d)  
# Level 2: e₄²=+1, e₅²=-1 → pair (+1,-1) → use (e, f)

# Construction:
# γ₀ = f ⊗ I ⊗ I        (level 0, first, f²=-I)
# γ₁ = e ⊗ I ⊗ I        (level 0, second, e²=+I)
# γ₂ = d ⊗ e ⊗ I        (level 1, first, e²=+I, d for level 0)
# γ₃ = d ⊗ d ⊗ I        (level 1, second, d²=+I, d for level 0)
# γ₄ = d ⊗ d ⊗ e        (level 2, first, e²=+I, d for levels 0,1) -- WAIT
# 
# Hmm, γ₃ = d⊗d⊗I and γ₄ would need d at levels 0 and 1.
# But γ₃ already uses d at both levels 0 and 1.
# γ₄ = d⊗d⊗e would be: (d⊗d⊗e)(d⊗d⊗e) = I⊗I⊗I = I₈ ✓
# But does γ₄ anticommute with γ₃?
# (d⊗d⊗e)(d⊗d⊗I) = I⊗I⊗e
# (d⊗d⊗I)(d⊗d⊗e) = I⊗I⊗e
# Sum = 2·I⊗I⊗e ≠ 0 ✗ FAIL!

# The problem is that γ₃ and γ₄ have the SAME structure at levels 0,1.
# Need to fix the construction.

# Correct systematic approach for m=3 levels:
# 
# γ₀ = A₀ ⊗ I₂ ⊗ I₂
# γ₁ = B₀ ⊗ I₂ ⊗ I₂
# γ₂ = C₀ ⊗ A₁ ⊗ I₂
# γ₃ = C₀ ⊗ B₁ ⊗ I₂
# γ₄ = C₀ ⊗ C₁ ⊗ A₂
# γ₅ = C₀ ⊗ C₁ ⊗ B₂
#
# Where at each level, (Aₖ, Bₖ) anticommute and Cₖ anticommutes 
# with both Aₖ and Bₖ (Cₖ is the "chirality" of that level).
# 
# For each level, we need {A, B, C} mutually anticommuting with 
# A²=s₁·I, B²=s₂·I, C²=I.
#
# The set {e, f, d} works: e²=I, f²=-I, d²=I, all mutually anticommute.
# Also {e, d} anticommute with each other, and we can use f as the third.
# Or more precisely: any permutation of {e, f, d} where C must square to +I.
# So C ∈ {e, d}.

# Level 0: signatures (-1, +1). Need A₀²=-I, B₀²=+I, C₀²=+I.
# A₀=f, B₀=e, C₀=d. (f²=-I ✓, e²=+I ✓, d²=+I ✓)
# Check: all three mutually anticommute ✓

# Level 1: signatures (+1, +1). Need A₁²=+I, B₁²=+I, C₁²=+I.
# Can we have A,B,C all squaring to +I? 
# e²=+I, d²=+I, but e and d anticommute (ed+de=0 ✓).
# Need a third that anticommutes with both and squares to +I.
# f anticommutes with both but f²=-I. 
# No real 2×2 matrix anticommutes with both e and d and squares to +I
# (since {e,f,d} span the traceless 2×2 matrices up to I).
# 
# Solution: use C₁ = the product. If C₁ = e·d = [[0,1],[-1,0]]... 
# wait, that's -f. And (-f)² = f² = -I. Doesn't square to +I.
#
# Actually this is a known issue: for Cl(2,0), you can't get 
# all three matrices to square to +I in 2×2. The maximum signature
# for 2×2 is (1,1) (one positive, one negative, with chirality).
#
# For (+1,+1) at one level, we need to use the chirality differently.
# 
# Alternative: use C₁ = e·d = f·(−1)... hmm.
# 
# Let me try a DIFFERENT grouping of the 6 generators into 3 pairs.
# Instead of pairing (e₀,e₁), (e₂,e₃), (e₄,e₅), try to pair
# generators such that each pair has signatures (+1,-1) or (-1,+1).
#
# Pair each negative-signature generator with a positive one:
# Pair A: (e₀, e₁) → (-1, +1) ✓
# Pair B: (e₂, e₅) → (+1, -1) ✓  
# Pair C: (e₃, e₄) → (+1, +1) ✗ ... still have one (+1,+1) pair.
#
# Or: (e₀, e₂), (e₅, e₃), (e₁, e₄)
# → (-1,+1), (-1,+1), (+1,+1) ... same issue.
#
# With 4 positive and 2 negative generators, we can only make 
# 2 mixed pairs, leaving one (+1,+1) pair.
#
# For the (+1,+1) pair, we use (e, d) with C = f (which squares to -I).
# This means C₂² = -I for the last level. Let's see if that still works.

# Revised construction:
# Level 0: sigs (-1,+1). A₀=f, B₀=e, C₀=d.    C₀²=+I ✓
# Level 1: sigs (+1,-1). A₁=e, B₁=f, C₁=d.     C₁²=+I ✓
# Level 2: sigs (+1,+1). A₂=e, B₂=d, C₂=f.     C₂²=-I
#
# But C₂ is only used internally, not as a generator. 
# It's the "chirality" that propagates anticommutation to higher levels.
# But there IS no higher level for level 2. So C₂ is never used!

# Pairing: (e₀,e₁) at level 0, (e₂,e₅) at level 1, (e₃,e₄) at level 2
# Note: I'm reordering which generators go where.
# Level 0: e₀ (-1) and e₁ (+1)
# Level 1: e₂ (+1) and e₅ (-1)  [moved e₅ here]
# Level 2: e₃ (+1) and e₄ (+1)

print("=" * 70)
print("CONSTRUCTING GAMMA MATRICES FOR Cl(4,2)")
print("Signature η = diag(-1,+1,+1,+1,+1,-1)")
print("=" * 70)

# Level 0: pair (e₀, e₁) with sigs (-1, +1)
A0, B0, C0 = f, e, d  # f²=-I, e²=+I, d²=+I

# Level 1: pair (e₂, e₅) with sigs (+1, -1)  
A1, B1, C1 = e, f, d  # e²=+I, f²=-I, d²=+I

# Level 2: pair (e₃, e₄) with sigs (+1, +1)
A2, B2 = e, d  # e²=+I, d²=+I (no C₂ needed - last level)

# Build gamma matrices:
gamma = {}
gamma[0] = kron3(A0, I2, I2)           # e₀: f⊗I⊗I
gamma[1] = kron3(B0, I2, I2)           # e₁: e⊗I⊗I  
gamma[2] = kron3(C0, A1, I2)           # e₂: d⊗e⊗I
gamma[5] = kron3(C0, B1, I2)           # e₅: d⊗f⊗I  [NOTE: e₅ at level 1!]
gamma[3] = kron3(C0, C1, A2)           # e₃: d⊗d⊗e
gamma[4] = kron3(C0, C1, B2)           # e₄: d⊗d⊗d

print("\nGenerator pairing for tensor product construction:")
print("  Level 0: (e₀, e₁) — sigs (-1, +1) — matrices (f, e), chirality d")
print("  Level 1: (e₂, e₅) — sigs (+1, -1) — matrices (e, f), chirality d")
print("  Level 2: (e₃, e₄) — sigs (+1, +1) — matrices (e, d)")
print("\n  Note: e₅ placed at level 1 (paired with e₂) to balance signatures.")

# ============================================================
# VERIFICATION
# ============================================================
I8 = np.eye(8)
eta = {0: -1, 1: +1, 2: +1, 3: +1, 4: +1, 5: -1}

print("\n" + "=" * 70)
print("VERIFICATION: γᵢγⱼ + γⱼγᵢ = 2ηᵢⱼ·I₈")
print("=" * 70)

all_pass = True
for i in range(6):
    for j in range(6):
        anticomm = gamma[i] @ gamma[j] + gamma[j] @ gamma[i]
        expected = 2 * (eta[i] if i == j else 0) * I8
        if np.allclose(anticomm, expected):
            if i == j:
                sq_val = "+" if eta[i] > 0 else "-"
                print(f"  γ{i}² = {sq_val}I₈ ✓")
        else:
            print(f"  FAIL: γ{i}γ{j} + γ{j}γ{i} ≠ 2η{i}{j}·I₈ ✗")
            all_pass = False
            
if all_pass:
    print("\n  ★ ALL CLIFFORD RELATIONS SATISFIED ★")
else:
    print("\n  ✗ SOME RELATIONS FAILED")

# ============================================================
# DISPLAY THE MATRICES
# ============================================================
print("\n" + "=" * 70)
print("THE SIX GAMMA MATRICES (8×8, integer entries)")
print("=" * 70)

position_names = {0: "Ground", 1: "Material/A", 2: "Efficient/U", 
                  3: "Formal/G", 4: "Context/C", 5: "Synthesis"}

for i in range(6):
    G = gamma[i].astype(int)
    sig = "−" if eta[i] < 0 else "+"
    print(f"\nγ{i} — Position {i} ({position_names[i]}), γ{i}² = {sig}I₈")
    for row in range(8):
        entries = [f"{G[row,col]:+d}" for col in range(8)]
        print(f"  [{' '.join(f'{x:>3}' for x in entries)}]")

# ============================================================
# KEY PRODUCTS: BIVECTORS FROM COMPLEMENTARY PAIRS
# ============================================================
print("\n" + "=" * 70)
print("COMPLEMENTARY-PAIR BIVECTOR MATRICES")
print("=" * 70)

for name, i, j in [("Frame: γ₀₅ = γ₀·γ₅", 0, 5), 
                     ("Inner: γ₁₄ = γ₁·γ₄", 1, 4),
                     ("Inner: γ₂₃ = γ₂·γ₃", 2, 3)]:
    bv = gamma[i] @ gamma[j]
    bv_sq = bv @ bv
    sq_val = np.trace(bv_sq) / 8  # should be ±1
    print(f"\n{name}  — squares to {'+' if sq_val > 0 else '-'}I₈")
    G = bv.astype(int)
    for row in range(8):
        entries = [f"{G[row,col]:+d}" for col in range(8)]
        print(f"  [{' '.join(f'{x:>3}' for x in entries)}]")

# ============================================================
# INNER VOLUME ELEMENT (split quaternion check)
# ============================================================
print("\n" + "=" * 70)
print("INNER VOLUME ELEMENT γ₁₂₃₄ = γ₁·γ₂·γ₃·γ₄")
print("=" * 70)

vol_inner = gamma[1] @ gamma[2] @ gamma[3] @ gamma[4]
vol_inner_sq = vol_inner @ vol_inner
sq_val = np.trace(vol_inner_sq) / 8
print(f"\n(γ₁₂₃₄)² = {'+' if sq_val > 0 else '-'}I₈  (split quaternion: +1 confirms)")
G = vol_inner.astype(int)
for row in range(8):
    entries = [f"{G[row,col]:+d}" for col in range(8)]
    print(f"  [{' '.join(f'{x:>3}' for x in entries)}]")

# ============================================================
# PSEUDOSCALAR
# ============================================================
print("\n" + "=" * 70)
print("PSEUDOSCALAR ω = γ₀·γ₁·γ₂·γ₃·γ₄·γ₅")
print("=" * 70)

omega = gamma[0] @ gamma[1] @ gamma[2] @ gamma[3] @ gamma[4] @ gamma[5]
omega_sq = omega @ omega
sq_val = np.trace(omega_sq) / 8
print(f"\nω² = {'+' if sq_val > 0 else '-'}I₈")
G = omega.astype(int)
for row in range(8):
    entries = [f"{G[row,col]:+d}" for col in range(8)]
    print(f"  [{' '.join(f'{x:>3}' for x in entries)}]")

# ============================================================
# EIGENVALUE STRUCTURE OF INNER VOLUME ELEMENT
# ============================================================
print("\n" + "=" * 70)
print("EIGENSTRUCTURE OF γ₁₂₃₄ (the split quaternion element)")
print("=" * 70)

eigenvalues = np.linalg.eigvalsh(vol_inner)
print(f"\nEigenvalues: {sorted(set(np.round(eigenvalues, 6)))}")
print(f"Multiplicity of +1: {np.sum(np.abs(eigenvalues - 1) < 0.01)}")
print(f"Multiplicity of -1: {np.sum(np.abs(eigenvalues + 1) < 0.01)}")
print("\nThis splits ℝ⁸ into two 4-dimensional eigenspaces:")
print("  +1 eigenspace: the 'forward' strand (P)")
print("  -1 eigenspace: the 'return' strand (P')")
print("  4 + 4 = 8 trigrams split into two complementary quartets")

# ============================================================
# THE THREE INVOLUTIONS AS MATRIX OPERATIONS
# ============================================================
print("\n" + "=" * 70)
print("THE THREE INVOLUTIONS ON GAMMA MATRICES")
print("=" * 70)

def grade_inv_sign(grade):
    return (-1)**grade

def reversion_sign(grade):
    k = grade
    return (-1)**(k*(k-1)//2)

def conjugation_sign(grade):
    return grade_inv_sign(grade) * reversion_sign(grade)

print("\nInvolution signs by grade:")
print(f"{'Grade':>5} | {'α (grade)':>10} | {'† (reversion)':>14} | {'ᾱ (conjugation)':>16}")
print("-" * 55)
for g in range(7):
    gi = "+" if grade_inv_sign(g) > 0 else "-"
    rv = "+" if reversion_sign(g) > 0 else "-"
    cj = "+" if conjugation_sign(g) > 0 else "-"
    print(f"  {g:>3} | {gi:>10} | {rv:>14} | {cj:>16}")

print("""
Involution action on generators (grade 1):
  α: negates ALL generators (grade involution flips sign of grade-1)
  †: preserves ALL generators (reversion sign for grade 1 = (-1)^0 = +1)
  ᾱ: negates ALL generators (conjugation = α·† = negate·preserve = negate)

On bivectors (grade 2):
  α: preserves (even grade)
  †: negates (reversion sign for grade 2 = (-1)^1 = -1)
  ᾱ: negates (both negate and negate cancel? No: preserve·negate = negate)

This means:
  Matrix 1 (reversion †): preserves generators, negates bivectors
    → Preserves individual nucleotides, reverses their PAIRINGS
  Matrix 2 (grade involution α): negates generators, preserves bivectors
    → Flips individual nucleotides, preserves their PAIRINGS  
  Matrix 3 (conjugation ᾱ): negates both generators and bivectors
    → Flips everything — the "double inversion"
""")

# ============================================================
# SAMPLE HEXAGRAM MATRICES
# ============================================================
print("=" * 70)
print("SAMPLE HEXAGRAM-OPERATOR MATRICES")
print("=" * 70)

def hexagram_matrix(active_positions):
    """Compute the 8×8 matrix for a hexagram with given active positions"""
    if len(active_positions) == 0:
        return I8
    result = gamma[active_positions[0]]
    for p in active_positions[1:]:
        result = result @ gamma[p]
    return result

samples = [
    ([], "☷☷ (000000) — Scalar identity"),
    ([0], "Ground only (000001) — Dec 1"),
    ([5], "Synthesis only (100000) — Dec 32"),
    ([0,5], "Frame bivector (100001) — Dec 33"),
    ([1,4], "Material-Context (010010) — Dec 18"),
    ([2,3], "Efficient-Formal (001100) — Dec 12"),
    ([1,2,3,4], "Full inner (011110) — Dec 30"),
    ([0,1,2,3,4,5], "☰☰ Pseudoscalar (111111) — Dec 63"),
]

for positions, name in samples:
    M = hexagram_matrix(positions)
    print(f"\nHexagram {name}")
    G = M.astype(int)
    # Check if it's diagonal, identity, etc.
    is_diag = np.allclose(G, np.diag(np.diag(G)))
    sq = M @ M
    sq_trace = np.trace(sq) / 8
    print(f"  Trace: {int(np.trace(M)):+d}, Sq trace/8: {sq_trace:+.0f}", end="")
    if is_diag:
        print(f"  [DIAGONAL]", end="")
    print()
    for row in range(8):
        entries = [f"{G[row,col]:+d}" for col in range(8)]
        print(f"  [{' '.join(f'{x:>3}' for x in entries)}]")

# ============================================================
# TRIGRAM ACTION: γᵢ on basis vectors
# ============================================================
print("\n" + "=" * 70)
print("GENERATOR ACTION ON TRIGRAM BASIS VECTORS")
print("=" * 70)

trigram_names = ["☷Kūn", "☳Zhèn", "☵Kǎn", "☱Duì", 
                 "☶Gèn", "☲Lí", "☴Xùn", "☰Qián"]

print("\nγᵢ|T⟩ = |T'⟩ — which trigram does each generator send each trigram to?\n")

for i in range(6):
    print(f"γ{i} ({position_names[i]}):")
    for t in range(8):
        basis_vec = np.zeros(8)
        basis_vec[t] = 1
        result = gamma[i] @ basis_vec
        # Find which basis vector it maps to (should be ±1 times a basis vector)
        nonzero = np.nonzero(np.abs(result) > 0.5)[0]
        if len(nonzero) == 1:
            target = nonzero[0]
            sign = "+" if result[target] > 0 else "-"
            print(f"  |{trigram_names[t]:>5}⟩ → {sign}|{trigram_names[target]:>5}⟩")
        else:
            print(f"  |{trigram_names[t]:>5}⟩ → (mixed)")
    print()

# ============================================================
# EXPORT FOR CODING AGENTS
# ============================================================
print("=" * 70)
print("GAMMA MATRICES AS INTEGER ARRAYS (for C/Rust implementation)")
print("=" * 70)

print("\n// Signature: eta[6] = {-1, +1, +1, +1, +1, -1}")
print("// Each gamma[i] is 8x8 with entries in {-1, 0, +1}")
print()
for i in range(6):
    G = gamma[i].astype(int)
    print(f"static const int8_t gamma{i}[8][8] = {{")
    for row in range(8):
        entries = ", ".join(f"{G[row,col]:+d}" for col in range(8))
        comma = "," if row < 7 else ""
        print(f"  {{{entries}}}{comma}")
    print("};")
    print()

