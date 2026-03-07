# ARCHETYPE_LUT Ordering Fix

**Status:** Bug — Pre-existing in M0
**Severity:** Moderate — affects M4 oracle interpretation via `m0_resolve_archetypal_number()`
**File:** `src/m0.c` lines 119-252
**Discovered:** 2026-03-07, during M4 Nara design research
**Dataset Authority:** `docs/datasets/anuttara-deep/nodes-full-data.json` (#0-3 branch)

---

## Summary

`ARCHETYPE_LUT[12]` entries [5]-[11] have systematically shifted names, formulations, and sub-table assignments. The first 5 entries ([0]-[4]) are correct.

## Root Cause

The archetypal numbers 0-9 map to coordinates #0-3-2 through #0-3-11 in the dataset. The LUT index = number + 2 (because (-) and 0/1 occupy slots 0-1). Starting at index [5] (number 3), the names and data appear to have been assigned from a different ordering than the dataset's canonical coordinate mapping.

## Discrepancy Table

| Index | Number | C Code Name | Dataset Canonical Name | Coordinate |
|-------|--------|-------------|----------------------|------------|
| [0] | (-) | (-) Mirror | The Mirror | #0-3-0/1 |
| [1] | 0/1 | 0/1 Singularity | Non-Dual Binary | #0-3-4 |
| [2] | 0 | Sat (Potential) | Sat | #0-3-2 |
| [3] | 1 | The Magician (Actual) | The Magician | #0-3-3 |
| [4] | 2 | Sunyata (Empty Field) | Sunyata | #0-3-5 |
| **[5]** | **3** | **Purnata (Fullness)** | **Vak/Cit (Sacred Speech)** | **#0-3-6** |
| **[6]** | **4** | **Synthetic Emptiness** | **Purnata (Divine Fullness)** | **#0-3-7** |
| **[7]** | **5** | **Vak (Sacred Speech)** | **Dynamic Harmony / Mono-Poly** | **#0-3-8** |
| **[8]** | **6** | **Structural Reflection** | **Synthetic Emptiness** | **#0-3-9** |
| **[9]** | **7** | **Dynamic Harmony** | **Divine Action / Ananda-Tandava** | **#0-3-10** |
| **[10]** | **8** | **Wholeness Precursor** | **Structural Reflection** | **#0-3-11** |
| **[11]** | **9** | **Divine Action** | **Paramesvara / Wholeness** | **#0-2-9** |

## Sub-Table Assignment Errors

| Number | Currently Has | Should Have | Entries |
|--------|-------------|-------------|---------|
| 3 (Vak) | NONE | ZODIACAL | 12 |
| 5 (Dynamic Harmony) | ZODIACAL (wrong) | MONOPOLY | 7 |
| 7 (Divine Action) | MONOPOLY (wrong) | DIVINE_ACT | 7 |
| 9 (Paramesvara) | DIVINE_ACT (wrong) | VIRTUE (new) | 9 |

## Additional Issues

### Polarity Mismatches
- [2] (number 0): C=ADAM, dataset="Neither — Transcendent Root"
- [3] (number 1): C=EVE, dataset="Neither — Transcendent Root"
- [8] (number 6): C=NEUTRAL, dataset="Adam (Structural Resolution)"
- [11] (number 9): C=NEUTRAL, dataset="Eve (transcendent)"

### Asymmetric Complement Pairs
- [9].complement_idx=8 but [8].complement_idx=0xFF (not reciprocal)
- [10].complement_idx=11 but [11].complement_idx=0xFF (not reciprocal)

## Fix Plan

1. Reorder entries [5]-[11] to match dataset canonical names
2. Reassign sub-tables: ZODIACAL→[5], MONOPOLY→[7], DIVINE_ACT→[9]
3. Consider adding VIRTUE sub-table (9 entries) for [11] (Paramesvara)
4. Fix polarity values for [2], [3], [8], [11]
5. Fix complement pair symmetry for [8]↔[9] and [10]↔[11]
6. Update formulation source strings to match dataset
7. Update `src/test_m0_rodata.c` to verify corrected ordering

## Impact

- M4's `m0_resolve_archetypal_number()` will return wrong data until fixed
- M0 test suite (`test_m0_rodata`) may need updating if it validates current (wrong) ordering
- No other M-branch currently consumes ARCHETYPE_LUT, so blast radius is limited to M0 tests + future M4

## Blocked By

Nothing — can be fixed independently.

## Blocks

M4 implementation Task 4 (identity compute) and Task 5 (oracle primitives) which use archetypal number resolution.
