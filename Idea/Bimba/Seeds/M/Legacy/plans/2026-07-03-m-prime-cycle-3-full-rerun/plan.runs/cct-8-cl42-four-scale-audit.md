# CCT-8 — One-Cl(4,2)-type audit across four scales (16.T16.8)

**Date:** 2026-07-12 · **Auditor:** opus-a-m3 · **Consolidates:** Tranches 02.7 (M1), 04.7 (M3), 10.7 (kernel-bridge — closed done in this rerun).

## Finding: ONE algebra, two planes, four scales — no parallel primitive

The Cl(4,2) quaternion algebra has exactly one authority per language plane, and the Rust plane is a byte-faithful mirror of the C kernel (parity pinned by the 10.T10.7 kernel-bridge audit and the `kernel_truth` suites):

- **C kernel authority:** `Body/S/S0/epi-lib/src/m1.c` — `quat_mul` (:127), `quat_normalize` (:144), rotation-through-conjugation (:159), `quat_slerp` (:162), `quat_from_ring_pos` (:194). Declared for the kernel bioquaternion at `Body/S/S0/epi-lib/include/kernel.h:38-70` (`q_b`/`q_p`, `kernel_quat_distance_sq`).
- **Rust plane single primitive:** `Body/S/S0/portal-core/src/quaternion.rs` — `quat_mul` (:4), `quat_normalize` (:16), `derive_walk_mode` (:27), `derive_bifurcation` (:45). Re-exported once at `portal-core/src/lib.rs:66`.

## Per-scale consumer call sites (Rust plane)

| Scale | Consumer | Call site |
|---|---|---|
| **M1 ring** | Profile projections (ring/topology quats feeding `m1Topology`) | `portal-core/src/profile_projections.rs:7` (`quat_mul`, `quat_normalize`, `derive_walk_mode`, `derive_bifurcation`) |
| **M1 ring (state walk)** | Engine state walk-mode/bifurcation | `portal-core/src/state.rs:4` |
| **M3 codon** | Codon → quaternion transcription rides the C kernel directly (`m3_quat_from_codon` path: `epi-lib/src/m3.c:136` `quat_mul(rot, base)`); the Rust bridge consumes it via FFI (`m3_transcription_bridge.rs::bioquaternion_transcription` → `m3_eval_to_quat`) | `epi-lib/src/m3.c:136`; `portal-core/src/m3_transcription_bridge.rs` (FFI seam) |
| **M4 personal** | Personal identity quaternion composition | `portal-core/src/personal_identity.rs:8` (`quat_mul`, `quat_normalize`) |
| **M4 personal (arena)** | Vama Shakti arena factory | `portal-core/src/vama_shakti.rs:2` |
| **Kerykeion natal** | Birthdate identity synthesis (natal chart → quaternion) | `portal-core/src/birthdate_identity.rs:8` (`quat_normalize`) |

## Violation FOUND and FIXED during this audit

The audit grep caught a parallel Cl(4,2) implementation the first draft of
this memo missed: the epi-cli portal TUI carried its own `quat_mul` +
`quat_normalize` (`src/portal/clock_state.rs:215`) and a fused
`quat_mul_norm` (`src/portal/clock_renderer.rs:76`). **Fixed in this
close:** all three now delegate to / compose from the portal-core
primitive (the local identity/ij=k tests stay as parity pins on the
delegation); 115 portal tests green after the change.

## Negative findings (post-fix)

- `grep -rn "fn quat_mul" Body --include="*.rs"` now returns only the
  portal-core primitive plus the two DELEGATING wrappers above (each
  one-line calls into `portal_core::`); the frozen `epi-theia` warehouse
  is excluded by the rerun carrier contract.
- The carrier (`pratibimba-app`) computes NO quaternion algebra locally — it consumes bussed projections only (one-clock/one-algebra discipline; the engine's carriers read `frame.*` values verbatim).
- The kernel-bridge (`epi-cli/src/gate/kernel_bridge_runtime.rs`) serialises kernel-computed quats; it does not re-derive (10.T10.7's closed audit).

**Verdict:** the one-Cl(4,2)-type invariant HOLDS across M1 ring · M3 codon · M4 personal · Kerykeion natal.
