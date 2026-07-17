# M0 Anuttara Tunable Audit Report

This generated audit lists candidate hardcoded relations for manual `tunable.toml` review. It does not promote values into schema law.

## Summary

- Total candidates: 2327
- Genuinely tunable candidates: 16
- Structural invariant candidates: 875
- Manual review candidates: 1436

## Cycle Audit Triage Queue

First-pass queue capped at 25 candidates. Treat each row as a manual decision point before authoring `tunable.toml`.

1. `6` at `Body/S/S0/epi-lib/src/engine.c:42` — proposed action: review as a tunable knob; reject if this is coordinate cardinality or dataset law.
2. `6` at `Body/S/S0/epi-lib/src/engine.c:158` — proposed action: review as a tunable knob; reject if this is coordinate cardinality or dataset law.
3. `20` at `Body/S/S0/epi-lib/src/m4.c:219` — proposed action: review as a tunable knob; reject if this is coordinate cardinality or dataset law.
4. `40` at `Body/S/S0/epi-lib/src/m4.c:219` — proposed action: review as a tunable knob; reject if this is coordinate cardinality or dataset law.
5. `60` at `Body/S/S0/epi-lib/src/m4.c:219` — proposed action: review as a tunable knob; reject if this is coordinate cardinality or dataset law.
6. `80` at `Body/S/S0/epi-lib/src/m4.c:219` — proposed action: review as a tunable knob; reject if this is coordinate cardinality or dataset law.
7. `100` at `Body/S/S0/epi-lib/src/m4.c:219` — proposed action: review as a tunable knob; reject if this is coordinate cardinality or dataset law.
8. `120` at `Body/S/S0/epi-lib/src/m4.c:219` — proposed action: review as a tunable knob; reject if this is coordinate cardinality or dataset law.
9. `200` at `Body/S/S0/epi-lib/src/m4.c:475` — proposed action: review as a tunable knob; reject if this is coordinate cardinality or dataset law.
10. `0.5f` at `Body/S/S0/epi-lib/include/m0_verifier.h:42` — proposed action: review as a tunable knob; reject if this is coordinate cardinality or dataset law.
11. `4u` at `Body/S/S0/epi-lib/include/m0_verifier.h:55` — proposed action: review as a tunable knob; reject if this is coordinate cardinality or dataset law.
12. `4` at `Body/S/S0/epi-lib/include/m4.h:296` — proposed action: review as a tunable knob; reject if this is coordinate cardinality or dataset law.
13. `3600ull` at `Body/S/S0/epi-lib/include/m4.h:296` — proposed action: review as a tunable knob; reject if this is coordinate cardinality or dataset law.
14. `1000000000ull` at `Body/S/S0/epi-lib/include/m4.h:296` — proposed action: review as a tunable knob; reject if this is coordinate cardinality or dataset law.
15. `256u` at `Body/S/S0/epi-lib/include/m4.h:722` — proposed action: review as a tunable knob; reject if this is coordinate cardinality or dataset law.
16. `24u` at `Body/S/S0/epi-lib/include/m1.h:347` — proposed action: review as a tunable knob; reject if this is coordinate cardinality or dataset law.
17. `0.8660254f` at `Body/S/S0/epi-lib/src/m1.c:30` — proposed action: inspect before promotion; only author `tunable.toml` if this proves to be runtime policy rather than relation law.
18. `0.5f` at `Body/S/S0/epi-lib/src/m1.c:30` — proposed action: inspect before promotion; only author `tunable.toml` if this proves to be runtime policy rather than relation law.
19. `0.5f` at `Body/S/S0/epi-lib/src/m1.c:31` — proposed action: inspect before promotion; only author `tunable.toml` if this proves to be runtime policy rather than relation law.
20. `0.8660254f` at `Body/S/S0/epi-lib/src/m1.c:31` — proposed action: inspect before promotion; only author `tunable.toml` if this proves to be runtime policy rather than relation law.
21. `0.5f` at `Body/S/S0/epi-lib/src/m1.c:33` — proposed action: inspect before promotion; only author `tunable.toml` if this proves to be runtime policy rather than relation law.
22. `0.8660254f` at `Body/S/S0/epi-lib/src/m1.c:33` — proposed action: inspect before promotion; only author `tunable.toml` if this proves to be runtime policy rather than relation law.
23. `0.8660254f` at `Body/S/S0/epi-lib/src/m1.c:34` — proposed action: inspect before promotion; only author `tunable.toml` if this proves to be runtime policy rather than relation law.
24. `0.5f` at `Body/S/S0/epi-lib/src/m1.c:34` — proposed action: inspect before promotion; only author `tunable.toml` if this proves to be runtime policy rather than relation law.
25. `0.8660254f` at `Body/S/S0/epi-lib/src/m1.c:35` — proposed action: inspect before promotion; only author `tunable.toml` if this proves to be runtime policy rather than relation law.

## Genuinely Tunable Candidates

- `6` at `Body/S/S0/epi-lib/src/engine.c:42` — policy threshold/limit candidate. Context: `    uint32_t limit = (steps == 0) ? 6 : steps;
`
- `6` at `Body/S/S0/epi-lib/src/engine.c:158` — policy threshold/limit candidate. Context: `            uint32_t limit = (steps == 0) ? 6 : steps;
`
- `20` at `Body/S/S0/epi-lib/src/m4.c:219` — policy threshold/limit candidate. Context: `const uint8_t M4_LENS_MEF_THRESHOLD[6] = {20, 40, 60, 80, 100, 120};
`
- `40` at `Body/S/S0/epi-lib/src/m4.c:219` — policy threshold/limit candidate. Context: `const uint8_t M4_LENS_MEF_THRESHOLD[6] = {20, 40, 60, 80, 100, 120};
`
- `60` at `Body/S/S0/epi-lib/src/m4.c:219` — policy threshold/limit candidate. Context: `const uint8_t M4_LENS_MEF_THRESHOLD[6] = {20, 40, 60, 80, 100, 120};
`
- `80` at `Body/S/S0/epi-lib/src/m4.c:219` — policy threshold/limit candidate. Context: `const uint8_t M4_LENS_MEF_THRESHOLD[6] = {20, 40, 60, 80, 100, 120};
`
- `100` at `Body/S/S0/epi-lib/src/m4.c:219` — policy threshold/limit candidate. Context: `const uint8_t M4_LENS_MEF_THRESHOLD[6] = {20, 40, 60, 80, 100, 120};
`
- `120` at `Body/S/S0/epi-lib/src/m4.c:219` — policy threshold/limit candidate. Context: `const uint8_t M4_LENS_MEF_THRESHOLD[6] = {20, 40, 60, 80, 100, 120};
`
- `200` at `Body/S/S0/epi-lib/src/m4.c:475` — policy threshold/limit candidate. Context: `    root->pco.cycle.safety_threshold = 200;
`
- `0.5f` at `Body/S/S0/epi-lib/include/m0_verifier.h:42` — policy threshold/limit candidate. Context: `#define M0_VERIFIER_VIRTUE_THRESHOLD 0.5f
`
- `4u` at `Body/S/S0/epi-lib/include/m0_verifier.h:55` — default value candidate. Context: `#define M0_VERIFIER_DEFAULT_CONJUGATE_DEPTH 4u
`
- `4` at `Body/S/S0/epi-lib/include/m4.h:296` — default value candidate. Context: `#define M4_KAIROTIC_DEFAULT_TTL_NS ((uint64_t)4 * 3600ull * 1000000000ull)
`
- `3600ull` at `Body/S/S0/epi-lib/include/m4.h:296` — default value candidate. Context: `#define M4_KAIROTIC_DEFAULT_TTL_NS ((uint64_t)4 * 3600ull * 1000000000ull)
`
- `1000000000ull` at `Body/S/S0/epi-lib/include/m4.h:296` — default value candidate. Context: `#define M4_KAIROTIC_DEFAULT_TTL_NS ((uint64_t)4 * 3600ull * 1000000000ull)
`
- `256u` at `Body/S/S0/epi-lib/include/m4.h:722` — default value candidate. Context: `#define M4_SYMBOLIC_PROTEIN_DEFAULT_CAPACITY 256u
`
- `24u` at `Body/S/S0/epi-lib/include/m1.h:347` — policy threshold/limit candidate. Context: `#define VORTEX_5X_CEILING          24u
`

## Structural Invariant Candidates

Showing first 25 of 875 candidates in scan order.

- `12` at `Body/S/S0/epi-lib/src/m1.c:21` — array index/cardinality shape; review before declaring tunable. Context: `const uint8_t TOPOLOGICAL_ELEMENT_COUNT_LUT[12] = {
`
- `6` at `Body/S/S0/epi-lib/src/m1.c:26` — array index/cardinality shape; review before declaring tunable. Context: `const uint8_t SPANDA_CF_FOLD_COUNT[6] = { 4, 6, 8, 10, 12, 0 };
`
- `4` at `Body/S/S0/epi-lib/src/m1.c:26` — structural invariant shape; review before declaring tunable. Context: `const uint8_t SPANDA_CF_FOLD_COUNT[6] = { 4, 6, 8, 10, 12, 0 };
`
- `6` at `Body/S/S0/epi-lib/src/m1.c:26` — structural invariant shape; review before declaring tunable. Context: `const uint8_t SPANDA_CF_FOLD_COUNT[6] = { 4, 6, 8, 10, 12, 0 };
`
- `8` at `Body/S/S0/epi-lib/src/m1.c:26` — structural invariant shape; review before declaring tunable. Context: `const uint8_t SPANDA_CF_FOLD_COUNT[6] = { 4, 6, 8, 10, 12, 0 };
`
- `10` at `Body/S/S0/epi-lib/src/m1.c:26` — structural invariant shape; review before declaring tunable. Context: `const uint8_t SPANDA_CF_FOLD_COUNT[6] = { 4, 6, 8, 10, 12, 0 };
`
- `12` at `Body/S/S0/epi-lib/src/m1.c:26` — structural invariant shape; review before declaring tunable. Context: `const uint8_t SPANDA_CF_FOLD_COUNT[6] = { 4, 6, 8, 10, 12, 0 };
`
- `12` at `Body/S/S0/epi-lib/src/m1.c:28` — array index/cardinality shape; review before declaring tunable. Context: `const Quaternion RING_QUATERNION_LUT[12] = {
`
- `2` at `Body/S/S0/epi-lib/src/m1.c:31` — array index/cardinality shape; review before declaring tunable. Context: `    [2]  = { .w = 0.5f,    .x = 0.8660254f,  .y = 0.0f, .z = 0.0f },
`
- `3` at `Body/S/S0/epi-lib/src/m1.c:32` — array index/cardinality shape; review before declaring tunable. Context: `    [3]  = { .w = 0.0f,    .x = 1.0f,    .y = 0.0f, .z = 0.0f },
`
- `4` at `Body/S/S0/epi-lib/src/m1.c:33` — array index/cardinality shape; review before declaring tunable. Context: `    [4]  = { .w = -0.5f,   .x = 0.8660254f,  .y = 0.0f, .z = 0.0f },
`
- `5` at `Body/S/S0/epi-lib/src/m1.c:34` — array index/cardinality shape; review before declaring tunable. Context: `    [5]  = { .w = -0.8660254f, .x = 0.5f,    .y = 0.0f, .z = 0.0f },
`
- `6` at `Body/S/S0/epi-lib/src/m1.c:35` — array index/cardinality shape; review before declaring tunable. Context: `    [6]  = { .w = 0.8660254f,  .x = -0.5f,   .y = 0.0f, .z = 0.0f },
`
- `7` at `Body/S/S0/epi-lib/src/m1.c:36` — array index/cardinality shape; review before declaring tunable. Context: `    [7]  = { .w = 0.5f,    .x = -0.8660254f, .y = 0.0f, .z = 0.0f },
`
- `8` at `Body/S/S0/epi-lib/src/m1.c:37` — array index/cardinality shape; review before declaring tunable. Context: `    [8]  = { .w = 0.0f,    .x = -1.0f,   .y = 0.0f, .z = 0.0f },
`
- `9` at `Body/S/S0/epi-lib/src/m1.c:38` — array index/cardinality shape; review before declaring tunable. Context: `    [9]  = { .w = -0.5f,   .x = -0.8660254f, .y = 0.0f, .z = 0.0f },
`
- `10` at `Body/S/S0/epi-lib/src/m1.c:39` — array index/cardinality shape; review before declaring tunable. Context: `    [10] = { .w = -0.8660254f, .x = -0.5f,   .y = 0.0f, .z = 0.0f },
`
- `11` at `Body/S/S0/epi-lib/src/m1.c:40` — array index/cardinality shape; review before declaring tunable. Context: `    [11] = { .w = -1.0f,   .x = 0.0f,    .y = 0.0f, .z = 0.0f },
`
- `6` at `Body/S/S0/epi-lib/src/m1.c:43` — array index/cardinality shape; review before declaring tunable. Context: `const QL_Trig_Entry QL_TRIG_TABLE[6] = {
`
- `2` at `Body/S/S0/epi-lib/src/m1.c:46` — array index/cardinality shape; review before declaring tunable. Context: `    [2] = {     ",         ",     TRIG_UNITY, 5,          +1 },
`
- `3` at `Body/S/S0/epi-lib/src/m1.c:47` — array index/cardinality shape; review before declaring tunable. Context: `    [3] = {     ",             ",  5,          0,          +1 },
`
- `4` at `Body/S/S0/epi-lib/src/m1.c:48` — array index/cardinality shape; review before declaring tunable. Context: `    [4] = {     ",         ",     TRIG_UNITY, 0,          +1 },
`
- `5` at `Body/S/S0/epi-lib/src/m1.c:49` — array index/cardinality shape; review before declaring tunable. Context: `    [5] = {     ",       ",       5,          TRIG_UNITY, -1 },
`
- `6` at `Body/S/S0/epi-lib/src/m1.c:56` — array index/cardinality shape; review before declaring tunable. Context: `const Cl42_Basis_Entry CL42_BASIS[6] = {
`
- `2` at `Body/S/S0/epi-lib/src/m1.c:59` — array index/cardinality shape; review before declaring tunable. Context: `    [2] = { .position = 2, .signature = +1, .trig_fn = TRIG_SEC },
`

_Omitted 850 additional candidates in this group._

## Manual Review Candidates

Showing first 25 of 1436 candidates in scan order.

- `0.8660254f` at `Body/S/S0/epi-lib/src/m1.c:30` — const/default-shaped numeric literal. Context: `    [1]  = { .w = 0.8660254f,  .x = 0.5f,    .y = 0.0f, .z = 0.0f },
`
- `0.5f` at `Body/S/S0/epi-lib/src/m1.c:30` — const/default-shaped numeric literal. Context: `    [1]  = { .w = 0.8660254f,  .x = 0.5f,    .y = 0.0f, .z = 0.0f },
`
- `0.5f` at `Body/S/S0/epi-lib/src/m1.c:31` — const/default-shaped numeric literal. Context: `    [2]  = { .w = 0.5f,    .x = 0.8660254f,  .y = 0.0f, .z = 0.0f },
`
- `0.8660254f` at `Body/S/S0/epi-lib/src/m1.c:31` — const/default-shaped numeric literal. Context: `    [2]  = { .w = 0.5f,    .x = 0.8660254f,  .y = 0.0f, .z = 0.0f },
`
- `0.5f` at `Body/S/S0/epi-lib/src/m1.c:33` — const/default-shaped numeric literal. Context: `    [4]  = { .w = -0.5f,   .x = 0.8660254f,  .y = 0.0f, .z = 0.0f },
`
- `0.8660254f` at `Body/S/S0/epi-lib/src/m1.c:33` — const/default-shaped numeric literal. Context: `    [4]  = { .w = -0.5f,   .x = 0.8660254f,  .y = 0.0f, .z = 0.0f },
`
- `0.8660254f` at `Body/S/S0/epi-lib/src/m1.c:34` — const/default-shaped numeric literal. Context: `    [5]  = { .w = -0.8660254f, .x = 0.5f,    .y = 0.0f, .z = 0.0f },
`
- `0.5f` at `Body/S/S0/epi-lib/src/m1.c:34` — const/default-shaped numeric literal. Context: `    [5]  = { .w = -0.8660254f, .x = 0.5f,    .y = 0.0f, .z = 0.0f },
`
- `0.8660254f` at `Body/S/S0/epi-lib/src/m1.c:35` — const/default-shaped numeric literal. Context: `    [6]  = { .w = 0.8660254f,  .x = -0.5f,   .y = 0.0f, .z = 0.0f },
`
- `0.5f` at `Body/S/S0/epi-lib/src/m1.c:35` — const/default-shaped numeric literal. Context: `    [6]  = { .w = 0.8660254f,  .x = -0.5f,   .y = 0.0f, .z = 0.0f },
`
- `0.5f` at `Body/S/S0/epi-lib/src/m1.c:36` — const/default-shaped numeric literal. Context: `    [7]  = { .w = 0.5f,    .x = -0.8660254f, .y = 0.0f, .z = 0.0f },
`
- `0.8660254f` at `Body/S/S0/epi-lib/src/m1.c:36` — const/default-shaped numeric literal. Context: `    [7]  = { .w = 0.5f,    .x = -0.8660254f, .y = 0.0f, .z = 0.0f },
`
- `0.5f` at `Body/S/S0/epi-lib/src/m1.c:38` — const/default-shaped numeric literal. Context: `    [9]  = { .w = -0.5f,   .x = -0.8660254f, .y = 0.0f, .z = 0.0f },
`
- `0.8660254f` at `Body/S/S0/epi-lib/src/m1.c:38` — const/default-shaped numeric literal. Context: `    [9]  = { .w = -0.5f,   .x = -0.8660254f, .y = 0.0f, .z = 0.0f },
`
- `0.8660254f` at `Body/S/S0/epi-lib/src/m1.c:39` — const/default-shaped numeric literal. Context: `    [10] = { .w = -0.8660254f, .x = -0.5f,   .y = 0.0f, .z = 0.0f },
`
- `0.5f` at `Body/S/S0/epi-lib/src/m1.c:39` — const/default-shaped numeric literal. Context: `    [10] = { .w = -0.8660254f, .x = -0.5f,   .y = 0.0f, .z = 0.0f },
`
- `5` at `Body/S/S0/epi-lib/src/m1.c:45` — const/default-shaped numeric literal. Context: `    [1] = {     ",             ",  0,          5,          +1 },
`
- `5` at `Body/S/S0/epi-lib/src/m1.c:46` — const/default-shaped numeric literal. Context: `    [2] = {     ",         ",     TRIG_UNITY, 5,          +1 },
`
- `5` at `Body/S/S0/epi-lib/src/m1.c:47` — const/default-shaped numeric literal. Context: `    [3] = {     ",             ",  5,          0,          +1 },
`
- `5` at `Body/S/S0/epi-lib/src/m1.c:49` — const/default-shaped numeric literal. Context: `    [5] = {     ",       ",       5,          TRIG_UNITY, -1 },
`
- `12u` at `Body/S/S0/epi-lib/src/m1.c:87` — const/default-shaped numeric literal. Context: `    uint8_t flat = (uint8_t)((row_0_to_11 * 12u) + col_0_to_11);
`
- `12u` at `Body/S/S0/epi-lib/src/m1.c:93` — const/default-shaped numeric literal. Context: `    uint8_t flat = (uint8_t)((row_0_to_11 * 12u) + col_0_to_11);
`
- `12u` at `Body/S/S0/epi-lib/src/m1.c:99` — const/default-shaped numeric literal. Context: `    uint8_t flat = (uint8_t)((row_0_to_11 * 12u) + col_0_to_11);
`
- `11u` at `Body/S/S0/epi-lib/src/m1.c:120` — business-logic magic number candidate. Context: `    return ql_is_ascending(tick) ? tick : (uint8_t)(11u - tick);
`
- `0.9995f` at `Body/S/S0/epi-lib/src/m1.c:168` — business-logic magic number candidate. Context: `    if (dot > 0.9995f) {
`

_Omitted 1411 additional candidates in this group._

## Manual Triage Guidance

- Move only confirmed runtime-policy knobs into `tunable.toml`.
- Keep layout sizes, enum ordinals, ring counts, masks, and coordinate cardinalities as structural invariants unless canon explicitly changes.
- For review-required literals, inspect call-site behavior before deciding whether the value is relation law or operational policy.
