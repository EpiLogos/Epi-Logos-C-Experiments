---
coordinate: "M3'"
status: "seed"
domain: "M3 Mahamaya — binary frame tabulation"
description: "Full tabulation of the 6-bit QL binary frame: hexagram-to-value mapping, four outer frame states, toroidal quadrants, quaternion core, symmetry operations, codon mapping"
source: "docs/deep-epi-logos-binary-computational-nara-clock/"
---

# QL 6-Bit Binary Frame: The 4+2 as 2⁶

## Structural Decomposition

```
Bit layout (MSB → LSB):  P₅  P₄  P₃  P₂  P₁  P₀
Binary weight:            32  16   8   4   2   1
QL Position:               5   4   3   2   1   0
Role:                   Synth|----Inner Core----|Ground
Quaternion map:          [w₅] k    j    i    1  [w₀]
Nucleotide map:          [—]  C    G    U    A  [—]
Cause:                  Final|Ctxt Frml Effc Mat|Ground
```

**Total Value = P₅·32 + P₄·16 + P₃·8 + P₂·4 + P₁·2 + P₀·1**

- Inner Core (positions 1-4): contributes [0, 30] in even increments
- Outer Frame (positions 0,5): contributes {0, 1, 32, 33}

---

## The Four Outer Frame States

| P₀ (Ground) | P₅ (Synthesis) | Frame Label | Offset | Value Range | Parity |
|:---:|:---:|:---|:---:|:---:|:---|
| 0 | 0 | **Void** — neither grounded nor synthesized | +0 | 0–30 | Even only |
| 1 | 0 | **Grounded** — potential without integration | +1 | 1–31 | Odd only |
| 0 | 1 | **Telic** — synthesis without ground | +32 | 32–62 | Even only |
| 1 | 1 | **Complete** — full toroidal circuit | +33 | 33–63 | Odd only |

**Key insight**: P₀ controls **parity** (even/odd = finest distinction)
P₅ controls **hemisphere** (lower/upper = coarsest division)

---

## Full Tabulation: 16 Inner Configurations × 4 Outer States = 64

### Legend
- Positions 1-4 mapped to quaternion: P₁=1(real), P₂=i, P₃=j, P₄=k
- Active elements shown in the "Elements" column
- Dec = decimal value of the full 6-bit number

| # | P₄ | P₃ | P₂ | P₁ | Elements | Inner Val | Void (00) | Ground (10) | Telic (01) | Complete (11) |
|:---:|:---:|:---:|:---:|:---:|:---|:---:|:---:|:---:|:---:|:---:|
| 0 | 0 | 0 | 0 | 0 | ∅ (empty) | 0 | **0** | **1** | **32** | **33** |
| 1 | 0 | 0 | 0 | 1 | 1 | 2 | **2** | **3** | **34** | **35** |
| 2 | 0 | 0 | 1 | 0 | i | 4 | **4** | **5** | **36** | **37** |
| 3 | 0 | 0 | 1 | 1 | 1+i | 6 | **6** | **7** | **38** | **39** |
| 4 | 0 | 1 | 0 | 0 | j | 8 | **8** | **9** | **40** | **41** |
| 5 | 0 | 1 | 0 | 1 | 1+j | 10 | **10** | **11** | **42** | **43** |
| 6 | 0 | 1 | 1 | 0 | i+j | 12 | **12** | **13** | **44** | **45** |
| 7 | 0 | 1 | 1 | 1 | 1+i+j | 14 | **14** | **15** | **46** | **47** |
| 8 | 1 | 0 | 0 | 0 | k | 16 | **16** | **17** | **48** | **49** |
| 9 | 1 | 0 | 0 | 1 | 1+k | 18 | **18** | **19** | **50** | **51** |
| 10 | 1 | 0 | 1 | 0 | i+k | 20 | **20** | **21** | **52** | **53** |
| 11 | 1 | 0 | 1 | 1 | 1+i+k | 22 | **22** | **23** | **54** | **55** |
| 12 | 1 | 1 | 0 | 0 | j+k | 24 | **24** | **25** | **56** | **57** |
| 13 | 1 | 1 | 0 | 1 | 1+j+k | 26 | **26** | **27** | **58** | **59** |
| 14 | 1 | 1 | 1 | 0 | i+j+k | 28 | **28** | **29** | **60** | **61** |
| 15 | 1 | 1 | 1 | 1 | 1+i+j+k | 30 | **30** | **31** | **62** | **63** |

---

## Mathematical Patterns

### 1. Parity as Ground-Signature

Every value in the "Void" and "Telic" columns is **even**.
Every value in the "Ground" and "Complete" columns is **odd**.

Position 0 (ground/why.) acts as the **parity bit** — the subtlest possible distinction. Philosophically: the ground doesn't change WHAT is present (the inner configuration stays the same), it changes the **quality** of presence — grounded vs. ungrounded. In binary terms, it's the difference between standing on even (symmetric, balanced, closed) vs. odd (asymmetric, open, generative).

### 2. Hemisphere as Telic-Signature

Position 5 (synthesis/why) acts as the **most significant modulator** — adding 32 flips the entire value into the upper hemisphere. This is the coarsest distinction: has synthesis occurred or not? The telos doesn't refine the inner content, it **recontextualizes the entire configuration** at a different scale.

### 3. The Four Quadrants as Toroidal Sectors

```
         P₅ = 0              P₅ = 1
      (Pre-synthesis)      (Post-synthesis)
      ┌─────────────┐     ┌─────────────┐
P₀=0  │  VOID       │     │  TELIC       │
      │  Dec: 0-30  │     │  Dec: 32-62  │
      │  Even only  │     │  Even only   │
      │  Ungrounded │     │  Ungrounded  │
      │  Unsynthesized│   │  Synthesized │
      ├─────────────┤     ├─────────────┤
P₀=1  │  GROUNDED   │     │  COMPLETE    │
      │  Dec: 1-31  │     │  Dec: 33-63  │
      │  Odd only   │     │  Odd only    │
      │  Grounded   │     │  Grounded    │
      │  Unsynthesized│   │  Synthesized │
      └─────────────┘     └─────────────┘
```

The toroidal circuit reads: Void → Grounded → (inner work) → Telic → Complete → (return to void)

### 4. Inner Core as Quaternion Signature

With the mapping P₁→1, P₂→i, P₃→j, P₄→k, each inner configuration gives a **quaternion element activation pattern**:

| Active Count | Configurations | Quaternion Type |
|:---:|:---|:---|
| 0 | ∅ | Null / pure potential |
| 1 | 1, i, j, k | Single basis element |
| 2 | 1+i, 1+j, 1+k, i+j, i+k, j+k | Paired elements |
| 3 | 1+i+j, 1+i+k, 1+j+k, i+j+k | Triple activations |
| 4 | 1+i+j+k | Full quaternion |

Distribution: 1 + 4 + 6 + 4 + 1 = 16 = Pascal's row 4

This is binomial coefficient C(4,n) — the inner core follows **Pascal's triangle** structure.

### 5. The Offset Arithmetic

For any inner configuration with value V (where V ∈ {0,2,4,...,30}):

| Frame State | Formula | Effect |
|:---|:---|:---|
| Void | V + 0 | Pure inner value |
| Grounded | V + 1 | Inner value + ground quantum |
| Telic | V + 32 | Inner value reflected to upper hemisphere |
| Complete | V + 33 | Inner value + ground quantum + telic reflection |

Note: 33 = 32 + 1, but also 33 = 3 × 11. The "complete" offset factorizes into 3 (triad/mediation) × 11 (prime of individuation). 

More structurally: the complete frame adds **the sum of the maximum and minimum binary weights** (32 + 1 = 33), bookending the inner range from both extremes.

---

## Nucleotide / Codon Mapping

If positions 1-4 map to nucleotides (A, U/T, G, C):

```
Position 1 (Material)  → A (Adenine)   — weight 2
Position 2 (Dynamic)   → U (Uracil)    — weight 4  
Position 3 (Formal)    → G (Guanine)   — weight 8
Position 4 (Context)   → C (Cytosine)  — weight 16
```

Then the 16 inner configurations represent all possible nucleotide **presence/absence** patterns, and the 4 outer frames represent the **epigenetic context** — whether the codon is grounded (expressed), telic (purposively directed), both, or neither.

The 64 total values = 64 codons, but organized differently from the standard codon table — here the organization is by **which nucleotides are active** (binary presence) rather than by **sequence position** (triplet ordering).

### Codon-Binary Correspondence

For the DNA/hexagram mapping, the standard approach uses triplet ordering (3 positions × 4 bases = 64). The QL binary frame instead uses **6 binary switches** = 64. The mathematical bridge:

- Standard: 4³ = 64 (three selections from four options)
- QL: 2⁶ = 64 (six binary switches)

These are the same 64-element space viewed through different algebraic structures:
- 4³ uses the **cyclic group** Z₄ × Z₄ × Z₄
- 2⁶ uses the **binary group** Z₂⁶ = Z₂ × Z₂ × Z₂ × Z₂ × Z₂ × Z₂

The algebraic homomorphism: Z₄ ≅ Z₂ × Z₂ (each nucleotide position decomposes into two binary features, e.g., purine/pyrimidine × amino/keto).

---

## Quaternion Weighting for Elemental Signatures

To compute an elemental signature as a weighted quaternion:

**q = w₀·P₀ + P₁·1 + P₂·i + P₃·j + P₄·k + w₅·P₅**

Where w₀ and w₅ are the modulating weights from positions 0 and 5.

### Option A: Binary Weights (Pure)
w₀ = 1, w₅ = 32 (raw binary position weights)

Example: Configuration 101101 (P₅=1, P₄=0, P₃=1, P₂=1, P₁=0, P₀=1)
- Ground active (P₀=1): +1
- i active (P₂=1): +4i  
- j active (P₃=1): +8j
- Synthesis active (P₅=1): +32
- q = 33 + 4i + 8j + 0k = (33, 4, 8, 0)
- Decimal value: 1 + 4 + 8 + 32 = 45

### Option B: Normalized Weights
Normalize so inner elements are unit: P₁→1, P₂→i, P₃→j, P₄→k
Then w₀ and w₅ act as scalar modulators on the real part:

q = (w₀·P₀ + w₅·P₅) + P₁·1 + P₂·i + P₃·j + P₄·k

With w₀ = ½ (ground = half-weight) and w₅ = ½ (synthesis = half-weight):
- The real part becomes: P₁ + ½·P₀ + ½·P₅
- Range of real: 0, ½, 1, 1½, 2

This makes ground and synthesis each contribute **half a unit** to the real axis — together they complete one full unit, reflecting the 4+2 where the two implicate poles together equal one explicate position.

### Option C: Reciprocal Weights (Ground as Root, Synthesis as Crown)
w₀ = 1/32 (ground = finest grain = 1/MSB)
w₅ = 32 (synthesis = coarsest = MSB itself)

This creates **extreme asymmetry**: ground barely perturbs, synthesis dominates. The quaternion signature then has synthesis controlling the overall magnitude while ground contributes a subtle "flavor."

---

## Summary of Modulation Effects

### Single Element Activations Under Four Frames

| Element | Position | Alone | +Ground | +Synthesis | +Both |
|:---|:---:|:---:|:---:|:---:|:---:|
| ∅ (nothing) | — | 0 | 1 | 32 | 33 |
| 1 (real) | P₁ | 2 | 3 | 34 | 35 |
| i | P₂ | 4 | 5 | 36 | 37 |
| j | P₃ | 8 | 9 | 40 | 41 |
| k | P₄ | 16 | 17 | 48 | 49 |
| Full (1+i+j+k) | all | 30 | 31 | 62 | 63 |

### Notable Values
- **0**: Total void — nothing active anywhere
- **1**: Pure ground, no content — potential without manifestation
- **32**: Pure synthesis, no content — telos without substance
- **33**: Ground + synthesis, no inner content — the toroidal frame itself with nothing framed
- **30**: All inner elements, no frame — full quaternion without ground or purpose
- **31**: All inner + ground — complete content, grounded but not synthesized  
- **62**: All inner + synthesis — complete content, synthesized but not grounded
- **63**: Everything active — full activation, the "saturated" hexagram

### The "Empty Frame" Values (inner = 0)
| Value | Binary | Meaning |
|:---:|:---:|:---|
| 0 | 000000 | Absolute void — K'un / Earth in I Ching (all yin) |
| 1 | 000001 | Pure ground — potential with no manifestation |
| 32 | 100000 | Pure telos — aim with no content |
| 33 | 100001 | Frame only — toroidal structure without inner elements |

### The "Full Content" Values (inner = 1111)
| Value | Binary | Meaning |
|:---:|:---:|:---|
| 30 | 011110 | All elements, unframed — raw quaternion |
| 31 | 011111 | All elements + ground — Ch'ien-like (all yang minus telos) |
| 62 | 111110 | All elements + synthesis — purposive but ungrounded |
| 63 | 111111 | Total saturation — Ch'ien / Heaven (all yang) |

---

## Toward Hexagram Mapping

The I Ching hexagram traditionally reads lines bottom to top:

```
Line 6 (top)    = P₅ (Synthesis)    ━━ or ━ ━
Line 5          = P₄ (Context/k)    ━━ or ━ ━
Line 4          = P₃ (Formal/j)     ━━ or ━ ━
Line 3          = P₂ (Dynamic/i)    ━━ or ━ ━
Line 2          = P₁ (Material/1)   ━━ or ━ ━
Line 1 (bottom) = P₀ (Ground)       ━━ or ━ ━
```

Yang (━━) = 1 = active
Yin (━ ━) = 0 = inactive

The lower trigram (lines 1-3) = P₀, P₁, P₂ = Ground + Material + Dynamic = **inner/earth/below**
The upper trigram (lines 4-6) = P₃, P₄, P₅ = Formal + Context + Synthesis = **outer/heaven/above**

This creates a different partition than the 4+2:
- Trigram split: [0,1,2] | [3,4,5] — three below, three above
- QL split: [0] | [1,2,3,4] | [5] — ground, quaternion, synthesis

Both partitions coexist in the same 6-bit structure. The trigram partition reveals **inner/outer** dynamics; the QL partition reveals **frame/content** dynamics.

### The 8 Trigrams as QL Sub-patterns

Lower trigram (P₀, P₁, P₂):
| Binary | Trigram | QL Reading |
|:---:|:---|:---|
| 000 | ☷ Kūn (Earth) | No ground, no material, no dynamics |
| 001 | ☳ Zhèn (Thunder) | Ground only — pure potential |
| 010 | ☵ Kǎn (Water) | Material only — bare substrate |
| 011 | ☱ Duì (Lake) | Ground + Material — grounded substance |
| 100 | ☶ Gèn (Mountain) | Dynamic only — pure process |
| 101 | ☲ Lí (Fire) | Ground + Dynamic — grounded transformation |
| 110 | ☴ Xùn (Wind) | Material + Dynamic — substance in process |
| 111 | ☰ Qián (Heaven) | Ground + Material + Dynamic — full lower |

Upper trigram (P₃, P₄, P₅):
| Binary | Trigram | QL Reading |
|:---:|:---|:---|
| 000 | ☷ Kūn | No form, no context, no synthesis |
| 001 | ☳ Zhèn | Formal only — pure pattern |
| 010 | ☵ Kǎn | Context only — pure field |
| 011 | ☱ Duì | Formal + Context — situated pattern |
| 100 | ☶ Gèn | Synthesis only — pure telos |
| 101 | ☲ Lí | Formal + Synthesis — purposive pattern |
| 110 | ☴ Xùn | Context + Synthesis — purposive field |
| 111 | ☰ Qián | Full upper — complete integration |

---

## Symmetry Operations

### Complement (bit-flip all 6)
Value V → 63 - V
Maps Void↔Complete and Grounded↔Telic
Every hexagram has its complement; QL-wise, this is the **shadow** operation.

### Inner Complement (flip only 1-4, keep 0,5)
Keeps the frame, inverts the content.
Value V with frame F and inner I: new value = F + (30 - I)
This is the **enantiodromia** within a given frame state.

### Frame Complement (flip only 0,5, keep 1-4)
Same content, different frame.
Swaps between grounded/ungrounded AND synthesized/unsynthesized.

### Single-Position Toggle
Flipping position n changes value by ±2ⁿ.
- Toggle ground (P₀): ±1
- Toggle P₁: ±2
- Toggle P₂: ±4
- Toggle P₃: ±8
- Toggle P₄: ±16
- Toggle synthesis (P₅): ±32

The ground toggle is the smallest possible change; the synthesis toggle is the largest. This confirms: **ground is the most local operation, synthesis the most global**.
