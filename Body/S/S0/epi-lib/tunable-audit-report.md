# M0 Anuttara Tunable Audit Report

This generated audit lists candidate hardcoded relations for manual `tunable.toml` review. It does not promote values into schema law.

## Summary

- Total candidates: 1987
- Genuinely tunable candidates: 11
- Structural invariant candidates: 778
- Manual review candidates: 1198

## Cycle Audit Triage Queue

First-pass queue capped at 25 candidates. Treat each row as a manual decision point before authoring `tunable.toml`.

1. `6` at `Body/S/S0/epi-lib/src/engine.c:41` — proposed action: review as a tunable knob; reject if this is coordinate cardinality or dataset law.
2. `6` at `Body/S/S0/epi-lib/src/engine.c:157` — proposed action: review as a tunable knob; reject if this is coordinate cardinality or dataset law.
3. `20` at `Body/S/S0/epi-lib/src/m4.c:146` — proposed action: review as a tunable knob; reject if this is coordinate cardinality or dataset law.
4. `40` at `Body/S/S0/epi-lib/src/m4.c:146` — proposed action: review as a tunable knob; reject if this is coordinate cardinality or dataset law.
5. `60` at `Body/S/S0/epi-lib/src/m4.c:146` — proposed action: review as a tunable knob; reject if this is coordinate cardinality or dataset law.
6. `80` at `Body/S/S0/epi-lib/src/m4.c:146` — proposed action: review as a tunable knob; reject if this is coordinate cardinality or dataset law.
7. `100` at `Body/S/S0/epi-lib/src/m4.c:146` — proposed action: review as a tunable knob; reject if this is coordinate cardinality or dataset law.
8. `120` at `Body/S/S0/epi-lib/src/m4.c:146` — proposed action: review as a tunable knob; reject if this is coordinate cardinality or dataset law.
9. `200` at `Body/S/S0/epi-lib/src/m4.c:253` — proposed action: review as a tunable knob; reject if this is coordinate cardinality or dataset law.
10. `0.5f` at `Body/S/S0/epi-lib/include/m0_verifier.h:23` — proposed action: review as a tunable knob; reject if this is coordinate cardinality or dataset law.
11. `24u` at `Body/S/S0/epi-lib/include/m1.h:425` — proposed action: review as a tunable knob; reject if this is coordinate cardinality or dataset law.
12. `1.5f` at `Body/S/S0/epi-lib/src/m1.c:226` — proposed action: inspect before promotion; only author `tunable.toml` if this proves to be runtime policy rather than relation law.
13. `4.0f` at `Body/S/S0/epi-lib/src/m1.c:230` — proposed action: inspect before promotion; only author `tunable.toml` if this proves to be runtime policy rather than relation law.
14. `5.0f` at `Body/S/S0/epi-lib/src/m1.c:234` — proposed action: inspect before promotion; only author `tunable.toml` if this proves to be runtime policy rather than relation law.
15. `9` at `Body/S/S0/epi-lib/src/m1.c:258` — proposed action: inspect before promotion; only author `tunable.toml` if this proves to be runtime policy rather than relation law.
16. `9u` at `Body/S/S0/epi-lib/src/m1.c:258` — proposed action: inspect before promotion; only author `tunable.toml` if this proves to be runtime policy rather than relation law.
17. `3` at `Body/S/S0/epi-lib/src/m1.c:260` — proposed action: inspect before promotion; only author `tunable.toml` if this proves to be runtime policy rather than relation law.
18. `3` at `Body/S/S0/epi-lib/src/m1.c:260` — proposed action: inspect before promotion; only author `tunable.toml` if this proves to be runtime policy rather than relation law.
19. `2` at `Body/S/S0/epi-lib/src/m1.c:261` — proposed action: inspect before promotion; only author `tunable.toml` if this proves to be runtime policy rather than relation law.
20. `5u` at `Body/S/S0/epi-lib/src/m1.c:261` — proposed action: inspect before promotion; only author `tunable.toml` if this proves to be runtime policy rather than relation law.
21. `2` at `Body/S/S0/epi-lib/src/m1.c:263` — proposed action: inspect before promotion; only author `tunable.toml` if this proves to be runtime policy rather than relation law.
22. `2` at `Body/S/S0/epi-lib/src/m1.c:263` — proposed action: inspect before promotion; only author `tunable.toml` if this proves to be runtime policy rather than relation law.
23. `9` at `Body/S/S0/epi-lib/src/m1.c:303` — proposed action: inspect before promotion; only author `tunable.toml` if this proves to be runtime policy rather than relation law.
24. `9u` at `Body/S/S0/epi-lib/src/m1.c:304` — proposed action: inspect before promotion; only author `tunable.toml` if this proves to be runtime policy rather than relation law.
25. `10` at `Body/S/S0/epi-lib/src/m1.c:309` — proposed action: inspect before promotion; only author `tunable.toml` if this proves to be runtime policy rather than relation law.

## Genuinely Tunable Candidates

- `6` at `Body/S/S0/epi-lib/src/engine.c:41` — policy threshold/limit candidate. Context: `    uint32_t limit = (steps == 0) ? 6 : steps;
`
- `6` at `Body/S/S0/epi-lib/src/engine.c:157` — policy threshold/limit candidate. Context: `            uint32_t limit = (steps == 0) ? 6 : steps;
`
- `20` at `Body/S/S0/epi-lib/src/m4.c:146` — policy threshold/limit candidate. Context: `const uint8_t M4_LENS_MEF_THRESHOLD[6] = {20, 40, 60, 80, 100, 120};
`
- `40` at `Body/S/S0/epi-lib/src/m4.c:146` — policy threshold/limit candidate. Context: `const uint8_t M4_LENS_MEF_THRESHOLD[6] = {20, 40, 60, 80, 100, 120};
`
- `60` at `Body/S/S0/epi-lib/src/m4.c:146` — policy threshold/limit candidate. Context: `const uint8_t M4_LENS_MEF_THRESHOLD[6] = {20, 40, 60, 80, 100, 120};
`
- `80` at `Body/S/S0/epi-lib/src/m4.c:146` — policy threshold/limit candidate. Context: `const uint8_t M4_LENS_MEF_THRESHOLD[6] = {20, 40, 60, 80, 100, 120};
`
- `100` at `Body/S/S0/epi-lib/src/m4.c:146` — policy threshold/limit candidate. Context: `const uint8_t M4_LENS_MEF_THRESHOLD[6] = {20, 40, 60, 80, 100, 120};
`
- `120` at `Body/S/S0/epi-lib/src/m4.c:146` — policy threshold/limit candidate. Context: `const uint8_t M4_LENS_MEF_THRESHOLD[6] = {20, 40, 60, 80, 100, 120};
`
- `200` at `Body/S/S0/epi-lib/src/m4.c:253` — policy threshold/limit candidate. Context: `    root->pco.cycle.safety_threshold = 200;
`
- `0.5f` at `Body/S/S0/epi-lib/include/m0_verifier.h:23` — policy threshold/limit candidate. Context: `#define M0_VERIFIER_VIRTUE_THRESHOLD 0.5f
`
- `24u` at `Body/S/S0/epi-lib/include/m1.h:425` — policy threshold/limit candidate. Context: `#define VORTEX_5X_CEILING          24u                                                         
`

## Structural Invariant Candidates

Showing first 25 of 778 candidates in scan order.

- `6` at `Body/S/S0/epi-lib/src/m1.c:122` — array index/cardinality shape; review before declaring tunable. Context: `const uint8_t DR_RING_MAHAMAYA[6]   = { 1, 2, 4, 8, 7, 5 };
`
- `2` at `Body/S/S0/epi-lib/src/m1.c:122` — structural invariant shape; review before declaring tunable. Context: `const uint8_t DR_RING_MAHAMAYA[6]   = { 1, 2, 4, 8, 7, 5 };
`
- `4` at `Body/S/S0/epi-lib/src/m1.c:122` — structural invariant shape; review before declaring tunable. Context: `const uint8_t DR_RING_MAHAMAYA[6]   = { 1, 2, 4, 8, 7, 5 };
`
- `8` at `Body/S/S0/epi-lib/src/m1.c:122` — structural invariant shape; review before declaring tunable. Context: `const uint8_t DR_RING_MAHAMAYA[6]   = { 1, 2, 4, 8, 7, 5 };
`
- `7` at `Body/S/S0/epi-lib/src/m1.c:122` — structural invariant shape; review before declaring tunable. Context: `const uint8_t DR_RING_MAHAMAYA[6]   = { 1, 2, 4, 8, 7, 5 };
`
- `5` at `Body/S/S0/epi-lib/src/m1.c:122` — structural invariant shape; review before declaring tunable. Context: `const uint8_t DR_RING_MAHAMAYA[6]   = { 1, 2, 4, 8, 7, 5 };
`
- `6` at `Body/S/S0/epi-lib/src/m1.c:123` — array index/cardinality shape; review before declaring tunable. Context: `const uint8_t DR_RING_PARASHAKTI[6] = { 3, 6, 9, 3, 6, 9 };
`
- `3` at `Body/S/S0/epi-lib/src/m1.c:123` — structural invariant shape; review before declaring tunable. Context: `const uint8_t DR_RING_PARASHAKTI[6] = { 3, 6, 9, 3, 6, 9 };
`
- `6` at `Body/S/S0/epi-lib/src/m1.c:123` — structural invariant shape; review before declaring tunable. Context: `const uint8_t DR_RING_PARASHAKTI[6] = { 3, 6, 9, 3, 6, 9 };
`
- `9` at `Body/S/S0/epi-lib/src/m1.c:123` — structural invariant shape; review before declaring tunable. Context: `const uint8_t DR_RING_PARASHAKTI[6] = { 3, 6, 9, 3, 6, 9 };
`
- `3` at `Body/S/S0/epi-lib/src/m1.c:123` — structural invariant shape; review before declaring tunable. Context: `const uint8_t DR_RING_PARASHAKTI[6] = { 3, 6, 9, 3, 6, 9 };
`
- `6` at `Body/S/S0/epi-lib/src/m1.c:123` — structural invariant shape; review before declaring tunable. Context: `const uint8_t DR_RING_PARASHAKTI[6] = { 3, 6, 9, 3, 6, 9 };
`
- `9` at `Body/S/S0/epi-lib/src/m1.c:123` — structural invariant shape; review before declaring tunable. Context: `const uint8_t DR_RING_PARASHAKTI[6] = { 3, 6, 9, 3, 6, 9 };
`
- `6` at `Body/S/S0/epi-lib/src/m1.c:130` — array index/cardinality shape; review before declaring tunable. Context: `const M1_QL_Category M1_BRANCH_QL_CATEGORY[6] = {
`
- `12` at `Body/S/S0/epi-lib/src/m1.c:145` — array index/cardinality shape; review before declaring tunable. Context: `const Holographic_Coordinate* const M1_M0_CROSSLINK[12] = {
`
- `6` at `Body/S/S0/epi-lib/src/m1.c:165` — array index/cardinality shape; review before declaring tunable. Context: `const CF_Substage_Entry SPANDA_CF_SUBSTAGE_LUT[6] = {
`
- `6` at `Body/S/S0/epi-lib/src/m1.c:198` — array index/cardinality shape; review before declaring tunable. Context: `const QL_Stage QL_FLOWERING[6] = {
`
- `6` at `Body/S/S0/epi-lib/src/m1.c:243` — array index/cardinality shape; review before declaring tunable. Context: `const Spanda_Mutator SPANDA_COMPILER_PASSES[6] = {
`
- `3` at `Body/S/S0/epi-lib/src/m1.c:264` — array index/cardinality shape; review before declaring tunable. Context: `    if (DR_RING_MAHAMAYA[0] != 1u || DR_RING_MAHAMAYA[3] != 8u) return false;
`
- `8u` at `Body/S/S0/epi-lib/src/m1.c:264` — structural invariant shape; review before declaring tunable. Context: `    if (DR_RING_MAHAMAYA[0] != 1u || DR_RING_MAHAMAYA[3] != 8u) return false;
`
- `3u` at `Body/S/S0/epi-lib/src/m1.c:265` — structural invariant shape; review before declaring tunable. Context: `    if (DR_RING_PARASHAKTI[0] != 3u || DR_RING_PARASHAKTI[2] != 9u) return false;
`
- `2` at `Body/S/S0/epi-lib/src/m1.c:265` — array index/cardinality shape; review before declaring tunable. Context: `    if (DR_RING_PARASHAKTI[0] != 3u || DR_RING_PARASHAKTI[2] != 9u) return false;
`
- `9u` at `Body/S/S0/epi-lib/src/m1.c:265` — structural invariant shape; review before declaring tunable. Context: `    if (DR_RING_PARASHAKTI[0] != 3u || DR_RING_PARASHAKTI[2] != 9u) return false;
`
- `2` at `Body/S/S0/epi-lib/src/m1.c:313` — array index/cardinality shape; review before declaring tunable. Context: `            _ananda_core[2][i][j] = (uint8_t)(((2 * i * j) + 1) % 10);
`
- `3` at `Body/S/S0/epi-lib/src/m1.c:314` — array index/cardinality shape; review before declaring tunable. Context: `            _ananda_core[3][i][j] = 9u;
`

_Omitted 753 additional candidates in this group._

## Manual Review Candidates

Showing first 25 of 1198 candidates in scan order.

- `1.5f` at `Body/S/S0/epi-lib/src/m1.c:226` — const/default-shaped numeric literal. Context: `    hc->weave_state     = 1.5f;
`
- `4.0f` at `Body/S/S0/epi-lib/src/m1.c:230` — const/default-shaped numeric literal. Context: `    hc->weave_state     = 4.0f;
`
- `5.0f` at `Body/S/S0/epi-lib/src/m1.c:234` — const/default-shaped numeric literal. Context: `    hc->weave_state     = 5.0f;
`
- `9` at `Body/S/S0/epi-lib/src/m1.c:258` — const/default-shaped numeric literal. Context: `    if (get_ananda_harmonic(&ANANDA_BIMBA, 9, 1) != 9u) return false;
`
- `9u` at `Body/S/S0/epi-lib/src/m1.c:258` — const/default-shaped numeric literal. Context: `    if (get_ananda_harmonic(&ANANDA_BIMBA, 9, 1) != 9u) return false;
`
- `3` at `Body/S/S0/epi-lib/src/m1.c:260` — const/default-shaped numeric literal. Context: `    if (get_ananda_harmonic(&ANANDA_PRATIBIMBA, 3, 3) != 1u) return false;
`
- `3` at `Body/S/S0/epi-lib/src/m1.c:260` — const/default-shaped numeric literal. Context: `    if (get_ananda_harmonic(&ANANDA_PRATIBIMBA, 3, 3) != 1u) return false;
`
- `2` at `Body/S/S0/epi-lib/src/m1.c:261` — const/default-shaped numeric literal. Context: `    if (get_ananda_harmonic(&ANANDA_SUM, 1, 2) != 5u) return false;
`
- `5u` at `Body/S/S0/epi-lib/src/m1.c:261` — const/default-shaped numeric literal. Context: `    if (get_ananda_harmonic(&ANANDA_SUM, 1, 2) != 5u) return false;
`
- `2` at `Body/S/S0/epi-lib/src/m1.c:263` — const/default-shaped numeric literal. Context: `    if (get_quint_sum(1, 2) != get_ananda_harmonic(&ANANDA_SUM, 1, 2)) return false;
`
- `2` at `Body/S/S0/epi-lib/src/m1.c:263` — const/default-shaped numeric literal. Context: `    if (get_quint_sum(1, 2) != get_ananda_harmonic(&ANANDA_SUM, 1, 2)) return false;
`
- `9` at `Body/S/S0/epi-lib/src/m1.c:303` — const/default-shaped numeric literal. Context: `    uint8_t r = n % 9;
`
- `9u` at `Body/S/S0/epi-lib/src/m1.c:304` — const/default-shaped numeric literal. Context: `    return (r == 0) ? 9u : r;
`
- `10` at `Body/S/S0/epi-lib/src/m1.c:309` — const/default-shaped numeric literal. Context: `    for (int i = 0; i < 10; i++) {
`
- `10` at `Body/S/S0/epi-lib/src/m1.c:310` — const/default-shaped numeric literal. Context: `        for (int j = 0; j < 10; j++) {
`
- `10` at `Body/S/S0/epi-lib/src/m1.c:311` — const/default-shaped numeric literal. Context: `            _ananda_core[0][i][j] = (uint8_t)((i * j) % 10);
`
- `10` at `Body/S/S0/epi-lib/src/m1.c:312` — const/default-shaped numeric literal. Context: `            _ananda_core[1][i][j] = (uint8_t)(((i * j) + 1) % 10);
`
- `2` at `Body/S/S0/epi-lib/src/m1.c:313` — const/default-shaped numeric literal. Context: `            _ananda_core[2][i][j] = (uint8_t)(((2 * i * j) + 1) % 10);
`
- `10` at `Body/S/S0/epi-lib/src/m1.c:313` — const/default-shaped numeric literal. Context: `            _ananda_core[2][i][j] = (uint8_t)(((2 * i * j) + 1) % 10);
`
- `9u` at `Body/S/S0/epi-lib/src/m1.c:314` — const/default-shaped numeric literal. Context: `            _ananda_core[3][i][j] = 9u;
`
- `10` at `Body/S/S0/epi-lib/src/m1.c:316` — const/default-shaped numeric literal. Context: `            _ananda_core[5][i][j] = (uint8_t)(((i * j) ^ ((i * j) + 1)) % 10);
`
- `6` at `Body/S/S0/epi-lib/src/m1.c:319` — const/default-shaped numeric literal. Context: `    for (int m = 0; m < 6; m++)
`
- `10` at `Body/S/S0/epi-lib/src/m1.c:320` — const/default-shaped numeric literal. Context: `        for (int i = 0; i < 10; i++)
`
- `10` at `Body/S/S0/epi-lib/src/m1.c:321` — const/default-shaped numeric literal. Context: `            for (int j = 0; j < 10; j++)
`
- `6` at `Body/S/S0/epi-lib/src/m1.c:328` — const/default-shaped numeric literal. Context: `    if (matrix_idx >= 6 || row >= 10 || col >= 10) return 0;
`

_Omitted 1173 additional candidates in this group._

## Manual Triage Guidance

- Move only confirmed runtime-policy knobs into `tunable.toml`.
- Keep layout sizes, enum ordinals, ring counts, masks, and coordinate cardinalities as structural invariants unless canon explicitly changes.
- For review-required literals, inspect call-site behavior before deciding whether the value is relation law or operational policy.
