# HMS Quaternionic Overlay Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Land the quaternionic overlay foundations described in `docs/specs/M/HMS-quaternionic-overlay.md` across M0, M1, and M3 without fabricating unresolved source data.

**Architecture:** Extend the existing M-layer C core instead of replacing it. M0 gains the quaternionic seed and 12-step helix metadata, M1 gains actual quaternion arithmetic plus the 12-step ring LUT, and M3 gains codon quaternion encoding, matrix-axis metadata, prime-attractor checks, and a second-pass DET overlay that preserves the existing bitwise DET exactly.

**Tech Stack:** C11, header-first inline math helpers, existing `epi-lib` unit tests, Rust/C integration build via `make rust-test`.

---

### Task 1: Plan And Scope Guardrails

**Files:**
- Create: `docs/plans/2026-03-11-hms-quaternionic-overlay.md`
- Reference: `docs/specs/M/HMS-quaternionic-overlay.md`
- Reference: `epi-lib/include/m0.h`
- Reference: `epi-lib/include/m1.h`
- Reference: `epi-lib/include/m3.h`

**Step 1: Record the implementation boundary**

Capture which FRs are fully derivable from the current repo and which remain blocked by open source-data questions:
- In scope now: FR 2.Q.0, 2.Q.1, 2.Q.2, 2.Q.3, 2.Q.4, 2.Q.8, 2.Q.9, 2.Q.10, 2.Q.15, 2.Q.17, 2.Q.18, plus the RNA-capable 37/27 split if it can be derived from codon structure rather than invented data.
- Explicitly avoid invented canonical data for unresolved tarot quaternion rotations or undocumented major-arcana pathway mappings.

**Step 2: Verify the clean baseline**

Run: `make rust-test`
Expected: Rust/C integration tests pass before feature changes.

Note the existing unrelated baseline issue:
- `make test` fails on arm64 in `vendor/blake3/blake3_dispatch.c` because `_blake3_hash_many_neon` is unresolved in the standalone Makefile path.

**Step 3: Keep work isolated**

Run in worktree: `/Users/admin/Documents/Epi-Logos C Experiments/.worktrees/codex/hms-quaternionic-overlay`

**Step 4: Commit after plan if desired**

```bash
git add docs/plans/2026-03-11-hms-quaternionic-overlay.md
git commit -m "docs: add quaternionic overlay implementation plan"
```

### Task 2: Write The Failing Quaternion Tests

**Files:**
- Modify: `epi-lib/test/m0/test_m0_rodata.c`
- Modify: `epi-lib/test/m1/test_m1.c`
- Modify: `epi-lib/test/m3/test_m3.c`

**Step 1: Add M0 failing tests**

Add tests for:
- `PURNATA_QUATERNION_SEED` is the all-zero quaternion seed.
- `CONCRESCENCE_STEPS == 12`.
- `Concrescence_Trace` exposes `is_descending`.

**Step 2: Add M1 failing tests**

Add tests for:
- `quat_mul()` obeys Hamilton rules: `i*j = k`, `j*i = -k`.
- `quat_conj()`, `quat_neg()`, and `quat_normalize()` preserve expected algebra.
- `quat_from_ring_pos(11)` is `-identity`.
- `quat_from_ring_pos(0)` and `quat_from_ring_pos(11)` prove the one-cycle negation property.
- `M1_FULL_DOUBLE_COVER_STEPS == 24`.

**Step 3: Add M3 failing tests**

Add tests for:
- complementary nucleotide sum assertions: `A+T == 15`, `C+G == 15`.
- matrix-2 directional diffs are antisymmetric: `AG=-2`, `GA=+2`, `TC=+2`, `CT=-2`.
- `M3_Matrix_Type`, `M3_MATRIX_PAIR`, and `M3_MATRIX_QUATERNION_AXIS` exist and match the spec.
- `m3_quat_from_codon()`, `m3_quat_codon_state()`, `m3_quat_active_state()`.
- `m3_is_prime_attractor()` detects 41 and 43 pair locks.
- `m3_eval_to_quat()` and `m3_quat_to_eval()` round-trip.
- `m3_det_with_quaternion()` preserves Pass 1 active bits and assigns 0-7 states only to active codons.
- If derivable: RNA functional/dark masks split 37/27.

**Step 4: Run only the new failing tests**

Run:
- `clang -std=c11 -Wall -Wextra -Werror -pedantic -Iepi-lib/include -Ivendor/blake3 -DBLAKE3_NO_SSE2 -DBLAKE3_NO_SSE41 -DBLAKE3_NO_AVX2 -DBLAKE3_NO_AVX512 -fsanitize=address,undefined -g -O0 epi-lib/src/psychoid_numbers.c epi-lib/src/engine.c epi-lib/src/arena.c epi-lib/src/families.c epi-lib/src/m0.c epi-lib/src/m1.c epi-lib/src/m2.c epi-lib/src/m3.c epi-lib/src/m4.c epi-lib/src/m5.c vendor/blake3/blake3.c vendor/blake3/blake3_dispatch.c vendor/blake3/blake3_portable.c epi-lib/test/m1/test_m1.c -lm -o /tmp/test_m1_quat && /tmp/test_m1_quat`
- `clang -std=c11 -Wall -Wextra -Werror -pedantic -Iepi-lib/include -Ivendor/blake3 -DBLAKE3_NO_SSE2 -DBLAKE3_NO_SSE41 -DBLAKE3_NO_AVX2 -DBLAKE3_NO_AVX512 -fsanitize=address,undefined -g -O0 epi-lib/src/psychoid_numbers.c epi-lib/src/engine.c epi-lib/src/arena.c epi-lib/src/families.c epi-lib/src/m0.c epi-lib/src/m1.c epi-lib/src/m2.c epi-lib/src/m3.c epi-lib/src/m4.c epi-lib/src/m5.c vendor/blake3/blake3.c vendor/blake3/blake3_dispatch.c vendor/blake3/blake3_portable.c epi-lib/test/m3/test_m3.c -lm -o /tmp/test_m3_quat && /tmp/test_m3_quat`

Expected: FAIL for missing quaternion overlay APIs or mismatched matrix semantics.

### Task 3: Implement M0 And M1 Groundwork

**Files:**
- Modify: `epi-lib/include/m0.h`
- Modify: `epi-lib/include/m1.h`

**Step 1: Add the M0 quaternion seed**

In `epi-lib/include/m0.h`:
- add `PURNATA_QUATERNION_SEED`.
- extend `Concrescence_Trace` with 12-step storage and `is_descending`.
- add compile-time linkage to `RING_SIZE`.

**Step 2: Implement quaternion algebra in M1**

In `epi-lib/include/m1.h`:
- add `quat_mul()`, `quat_conj()`, `quat_neg()`, `quat_normalize()`, `quat_rotate()`, `quat_slerp()`.
- add `RING_QUATERNION_LUT[12]`.
- add `quat_from_ring_pos()`.
- add `M1_FULL_DOUBLE_COVER_STEPS`.

**Step 3: Re-run focused M0/M1 tests**

Run the `clang ... test_m1.c -lm` command again.
Expected: the quaternion arithmetic and ring LUT tests pass.

### Task 4: Implement M3 Quaternion Overlay

**Files:**
- Modify: `epi-lib/include/m3.h`
- Modify: `epi-lib/src/m3.c`

**Step 1: Correct and expose matrix semantics**

Add:
- `M3_Matrix_Type`
- `M3_MATRIX_PAIR[3][4]`
- `M3_MATRIX_QUATERNION_AXIS[3]`

Fix directional diffs in `M3_PAIR_MATRIX` where current values do not satisfy the spec’s antisymmetry.

**Step 2: Add codon quaternion encoding**

Add:
- `M3_Codon_Quaternion`
- `m3_quat_from_codon()`
- `m3_quat_codon_state()`
- `m3_quat_active_state()`
- `m3_is_prime_attractor()`
- `m3_eval_to_quat()`
- `m3_quat_to_eval()`

**Step 3: Add the DET overlay**

Add:
- `M3_DET_Overlay_Result`
- `m3_det_with_quaternion(const M2_Root*, const M3_Root*, QL_Tick, M3_Matrix_Type)`

Behavior:
- Pass 1 must remain `M2_project_to_M3()`.
- Pass 2 must assign rotational states only to active codons.
- The composed quaternion should combine ring position, matrix axis, and a deterministic element quaternion derived from `m2->active_elem`.

**Step 4: Add derivable RNA masks if canonical**

If the 37/27 split matches codons that do or do not contain `T`, add:
- `M3_RNA_FUNCTIONAL_MASK`
- `M3_RNA_DARK_MASK`

Otherwise skip rather than inventing data.

**Step 5: Re-run focused M3 tests**

Run the `clang ... test_m3.c -lm` command again.
Expected: PASS.

### Task 5: Full Verification And Honest Gap Report

**Files:**
- Modify if needed: `epi-lib/test/m0/test_m0_rodata.c`
- Modify if needed: `epi-lib/test/m1/test_m1.c`
- Modify if needed: `epi-lib/test/m3/test_m3.c`

**Step 1: Run the focused C verification again**

Run:
- `/tmp/test_m1_quat`
- `/tmp/test_m3_quat`

Expected: PASS.

**Step 2: Run the full maintained integration suite**

Run: `make rust-test`
Expected: PASS.

**Step 3: Re-read the spec and check off implemented FRs**

Verify line-by-line against the implemented scope and report anything intentionally not landed because it would require invented canonical data.

**Step 4: Commit**

```bash
git add epi-lib/include/m0.h epi-lib/include/m1.h epi-lib/include/m3.h epi-lib/src/m3.c epi-lib/test/m0/test_m0_rodata.c epi-lib/test/m1/test_m1.c epi-lib/test/m3/test_m3.c docs/plans/2026-03-11-hms-quaternionic-overlay.md
git commit -m "feat: add quaternionic overlay foundations"
```
