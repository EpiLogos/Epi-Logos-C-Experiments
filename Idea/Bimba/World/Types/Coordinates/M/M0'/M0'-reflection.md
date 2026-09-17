---
coordinate: "M0'"
c_4_artifact_role: "coordinate-reflection"
c_1_ct_type: "CT4a"
c_5_crystallisation_state: "active-reflection"
created: "2026-06-13"
updated: "2026-06-13"
source_spec: "[[M0'-SPEC]]"
source_architecture: "[[M0-ARCHITECTURE]]"
---

# M0' — Anuttara Witness-Axis Coordinate Reflection

## §4 — Current State & Emergent Changes

### 2026-06-13 — Cycle 3 baseline (221/459 tasks done, 48.1%)
- **Source:** 2026-06-02-m-prime-cycle-3-design-reconciliation plan
- **What changed:** 191 tasks landed in baseline (ee05521); 30 additional tasks in subsequent sessions
- **Track 01 (M0 Anuttara reconciliation):** 13 done. M0 LUTs verified, Anuttara term-rewriting calculus scaffolded, M# person-grammar landed, ARCHETYPE_LUT ordering fix verified
- **Track 21 (M0 Anuttara frontend deep):** Per-layer provenance pills, M0ProvenanceState union, active-layer state persistence
- **Affected files:** Body/S/S0/epi-lib/src/m0.c, Body/S/S0/epi-lib/include/m0.h, Body/S/S0/epi-lib/src/m0_calculus.c, Body/M/epi-theia/extensions/m0-anuttara/
- **Spec updated:** Not yet. Pending Phase 5 remediation.

## §5 — Synthesised State

M0' is the Anuttara witness-axis — the 0/1 toggle's ground pole. It serves as the Verifier position (0') in the 4'-5'-0' mental-pole triplet per DR-MP-1. The module provides:

- **Anuttara term-rewriting calculus** — the kernel computational-substrate language (m0_calculus.c)
- **ARCHETYPE_LUT[12]** — corrected routing: Arch 3→ZODIACAL, Arch 5→MONOPOLY, Arch 7→DIVINE_ACT, Arch 9→VIRTUE_LUT
- **CONTEMPLATION_PROMPT_LUT[12]** — canonical question-strings for the four syntax-layers (3 speech/5 relationship/7 action/9 completion)
- **M0VerifierReport** — virtue_witness_vector (9-bit) + unsatisfied_constraints + coherence_score
- **M# person-grammar + kinship-grammar** — 6-fold kernel LUTs for coordinate addressing
- **m0-anuttara Theia extension** — provenance pills, M0ProvenanceState union, active-layer state persistence across daily-0-1/ide-deep toggle

Neighbour relations: M1' consumes M0's 0/1 ground. M5' Möbius return lands at M0. Anuttara is the ground of verification — every contemplation closes through it.

## §0 — Open Questions, Future Tracks & Plan Files

### Open Questions
- 96 unlifted Anuttara nodes remain in S2 graph per lazy strategy — when to lift?
- M0 verifier integration with gateway contemplation RPC (T19.6) — partially landed

### Active Plan Files
- [[01-m0-anuttara-reconciliation]] — Track 01 M0 reconciliation (13/17 done)
- [[21-m0-anuttara-frontend-deep]] — Track 21 frontend (progress tracked in ledger)

### Archived Plan Files
- None yet — Cycle 3 active
