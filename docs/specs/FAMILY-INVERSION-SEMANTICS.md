# Family Inversion Semantics (F / F')

**Status:** Canonical Reference
**Date:** 2026-03-05
**Context:** Documents the semantic meaning of the `#` inversion operation applied to each of the six coordinate families.

---

## Principle

The `#` operator is universal in mechanism (`SET_INVERTED` / `IS_INVERTED` tagged pointer bit 63) but **per-family in semantics**. Applying `#` to coordinate X produces X', phase-shifting from the archetypal/structural pole (F) to the instantiated/operational pole (F').

## The Six Families

| Family | Enum | F (Normal / Bimba) | F' (Inverse / Pratibimba) |
|--------|------|--------------------|---------------------------|
| **C** (#0) | `FAMILY_C = 0` | Categorical Essence -- immutable philosophical categories, ontological bins | Context Frame Coordinates -- reflective framing, VAK's native home |
| **P** (#1) | `FAMILY_P = 1` | QL Positions -- structural nodes on the Mod-6 Torus, outward phase | QL Positions -- psychoid identities on the Torus, inward return phase |
| **L** (#2) | `FAMILY_L = 2` | MEF Lenses -- 6 epistemic lenses, normal aperture | MEF Lenses -- 6 epistemic lenses, inverse aperture |
| **S** (#3) | `FAMILY_S = 3` | Tech Stack -- objective capacities, paradigms, infrastructure ideals | CLI/API Layers -- actualized project-specific implementation stack |
| **T** (#4) | `FAMILY_T = 4` | Thoughts -- agent artifact workspace, internal processing categories (via CT) | Thoughts -- user-facing distilled artifacts, pithy crystallized outputs |
| **M** (#5) | `FAMILY_M = 5` | Bimba Map -- architectural blocks of the system (M0-M5) | Application Domains -- WebMCP/UI/Browser, agent operational arena |

## Enum Alignment

The `Coordinate_Family` enum values now directly encode **archetype resonance numbers**:

```
FAMILY_C = 0  --> resonates with #0 (Ground / Ontological foundation)
FAMILY_P = 1  --> resonates with #1 (Form / Functional semantics)
FAMILY_L = 2  --> resonates with #2 (Operation / Epistemic modes)
FAMILY_S = 3  --> resonates with #3 (Pattern / Technology layers)
FAMILY_T = 4  --> resonates with #4 (Context / Artifacts-cognition)
FAMILY_M = 5  --> resonates with #5 (Integration / Consciousness domains)
FAMILY_NONE = 7  --> raw psychoid (pre-categorical, no resonance)
```

This eliminates the indirection between family enum value and archetype position. `coord->family` directly gives the archetype resonance number (for families 0-5).

## Implementation

```c
/* Tagged pointer bit 63 carries the inversion flag */
#define SET_INVERTED(ptr)  ((HC*)((uintptr_t)(ptr) | 0x8000000000000000))
#define IS_INVERTED(ptr)   ((uintptr_t)(ptr) & 0x8000000000000000)

/* The inversion_state field (byte offset 2) records whether
 * the coordinate itself is in its inverted phase */
```

The `#` operation (Execute_Hash) toggles `inversion_state` on a PRATIBIMBA copy. BIMBA entities are immutable -- to invert them, create a mutable copy first.

## The 18-fold Totality

With the addition of `Weave_0_0` (the pure ground implicate), the BIMBA bedrock now contains:

- 7 psychoid-numbers (#0-#5 + Hash)
- 4 weave interleaves (0.0, 0.5, 5.0, 5.5)
- 7 context frame roots (CF_0000 through CF_50)
- **Total: 18 BIMBA entities** -- the Anuttara 18-fold totality
