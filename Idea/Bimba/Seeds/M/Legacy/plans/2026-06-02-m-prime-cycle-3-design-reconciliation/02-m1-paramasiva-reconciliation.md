# Track 02 — M1 Paramaśiva Reconciliation

Reconciles [[M1']] across the four corpora. The substrate is rich and the Theia surface is intentionally shallow: `epi-lib/include/m1.h` carries `ANANDA_BIMBA`/`PRATIBIMBA`, `SPANDA_SEED_BITS=0x03`, `TORUS_GENUS=1`, `DOUBLE_COVER_DEG=720`, `RING_QUATERNION_LUT[12]`, `CL42_BASIS[6]`, `QL_TRIG_TABLE[6]` with static asserts; `portal-core/src/kernel.rs:346` owns `MathemeHarmonicProfile` with `tick12`, `degree720`, `lens_mode`, `resonance72`, `audio_octet[8]`, `nodal_quartet[4]`; `portal-core/src/parashakti/vimarsha_reading.rs` writes the audio bus (resolving the M2-1' Vimarsha-writes / M1' consumes architecture); `hopf.rs` + `quaternion.rs` land the Hopf bundle and SU(2) math. The m1-paramasiva extension is a scaffold with all the right slot names and explicit `DECLARED_BLOCKERS`.

## Total-Shape Architecture (Phase A)

Canonical total-shape document for M1' (all six M1-X' strata): [`Idea/Bimba/Seeds/M/M1'/M1-ARCHITECTURE.md`](Idea/Bimba/Seeds/M/M1'/M1-ARCHITECTURE.md) (986 lines). M1-2' Harmonic Engine deep architecture: [`Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md`](Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md) (pattern exemplar). Profile-bus projections (six new fields) per Tranche 10.M1. Phase-B PROPOSED: DR-M1-3 (`#` carrier as bus field), DR-M1-4 (Hen vault-instance contract). M1↔M2 Vimarśa-window boundary PASSES; M3-5 / M1-5 K²×T² boundary PASSES bilaterally.

## Source Specs and Matrix

- Canonical: `Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md`, `Idea/Pratibimba/System/Subsystems/Paramasiva/paramasiva-ux-full-m1-branch.md`
- Companions: `Idea/Bimba/Seeds/M/M1'/m1-prime-paramasiva-instrument.md`, `Idea/Bimba/Seeds/M/M1'/m1-prime-audio-generative-research.md`, `Idea/Bimba/Seeds/M/M1'/physical-pole-stack-architecture.md`
- Full row-level reconciliation: `plan.runs/wave-a-m1-reconciliation-matrix.md`

## Cycle 2 Substrate Inheritance

Consume as-is — `epi-lib/include/m1.h` LUTs; `portal-core/src/{kernel.rs,quaternion.rs,hopf.rs,spanda.rs,parashakti/vimarsha_reading.rs}`; `Body/M/epi-theia/extensions/m1-paramasiva` scaffold with `clockInstrument` + `kleinTopology` + `audioBusInspector` views. Cycle 2 Track 03 (T1 audio-genesis, T3 Cl(4,2)/Klein/inspector depth) named the deliverables — cycle 3 closes them.

## Tranches

1. **2.1 — Audit and downgrade residual M0-witness wording** *(contradiction-decision; routes to DR-M1-1)*

   Decision-register entry routing `Idea/Bimba/Seeds/M/alpha_quaternionic_integration_across_M_stack.md §1.1` to user final-validation. On validation, single-line patch replacing `M0 Anuttara witness-axis` with `M1-5 (the +1 parent) per M1'-SPEC §1`. Standing invariant.

   **Synthesis-level evidence strengthening the M1-5 attribution** (per `ql_m0_m3_third_spanda_integral_quilting_v2.md` §execution-order): the Third Spanda Equation's hidden order makes the +1 attribution operationally decisive. The execution traverses `64 + 72 = 136 → (−9) → 127 = 2^7−1 = M_7 → (+1) → 128 = 2^7 → (+9) → 137`. The Mersenne prime substrate 127 is exposed *only after* the 9-gap withdrawal; the +1 is the parent-seal that effects binary closure of 127 into 128; the +9 then restores wholeness as atomic dressing into 137. The +1 cannot be M0-witness because M0 is the source-syntax *above* this entire execution chain — the +1 sits *inside* the chain at the M_7 → 2^7 step. Mersenne hierarchy: 127's prime-index is 31 = M_5 = 2^5−1, so 127 = M_7 sits with prime-index M_5, evidencing actional-Archetype-7 grounding at the Mersenne layer. This is M1-5's K² topological-necessity made matheme-explicit.

   Verification: `grep -n "M0 Anuttara witness-axis\|witness-axis" Idea/Bimba/Seeds/M/alpha_quaternionic_integration_across_M_stack.md` returns no live-attribution matches after patch; `grep -n "127 = 2\^7\|M_7\|Mersenne" Idea/Bimba/Seeds/M/ql_m0_m3_third_spanda_integral_quilting_v2.md` returns the matheme execution-order section.

2. **2.2 — Land `klein_flip` field + emitter on `MathemeHarmonicProfile`/`vimarsha_reading`** *(code-pending-closure; cross-link to Tranche 10.2)*

   Add `pub klein_flip: Option<KleinFlipEvent>` to `MathemeHarmonicProfile` in `Body/S/S0/portal-core/src/kernel.rs`. Detector in `vimarsha_read_profile` fires the M1 tritone-crossing variant precisely at Lens N ↔ Lens N+3 (mod 12); contract test rejects false positives on other lens transitions. The event type is shared per DR-IG-2 and lands as the three-variant enum in Tranche 18.2 (`M1TritoneCrossing`, `M2CymaticValenceInvert`, `M3CodonRotationCross`) so M1 does not silently define a local-only shape. Tranche 10.2 / 18.2 own the kernel-bridge JSON emit completion.

   Verification: `cargo check -p portal-core`; `cargo test -p portal-core klein_flip`; `grep -n klein_flip Body/S/S0/portal-core/src/kernel.rs Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs`.

3. **2.3 — Wire Klein-flip + topology values into `m1.paramasiva.kleinTopology` view** *(spec-ahead-integration)*

   Populate `M1ProfileClockModel.topology` fields (`m1OriginKleinFlip`, `k2TritoneCrossing`, `hopfIdentity`, `doubleCoverDeg`, `torusGenus`) from real bridge values. Render `m1.paramasiva.kleinTopology` as a second widget body. Emit `OBSERVABILITY_EVENT_TYPES 'm1.klein_flip.source'` on event arrival.

   Verification: `test -f Body/M/epi-theia/extensions/m1-paramasiva/src/browser/m1-klein-topology-view.tsx`; widget test asserts `doubleCoverDeg===720` and `torusGenus===1`; observability event fires on synthetic profile with `klein_flip=Some(...)`.

4. **2.4 — Verify `m1_performance_event_from_profile` + `MPrimePerformanceEvent` replay** *(spec-ahead-integration)*

   Confirm `Body/S/S0/epi-cli/src/gate/kernel_bridge_runtime.rs::m1_performance_event_from_profile` exists; produce `MPrimePerformanceEvent` envelope per audio-research file (event_id, session_id, tick fields, lens, mode, audio_octet_hz[8], nodal_quartet[4], klein_flip, privacy/deposition); replay-test asserts deterministic reconstruction.

   Verification: `test -f Body/S/S0/epi-cli/src/gate/kernel_bridge_runtime.rs`; `grep -n m1_performance_event_from_profile` that file; `cargo test -p epi-cli m1_performance_event_replay`.

5. **2.5 — Surface the single session-held # (Inversion_Operator) carrier** *(code-pending-closure)*

   Named contract on the M1 kernel-bridge exposing `invert(coordinate)` as a single session-held operator (no per-coordinate forks). Extension affordance reachable from `m1.startWalk`. M1'-SPEC §14 `(0/1)`-wiring readiness test landed.

   Verification: `cargo check -p portal-core`; integration test `invert reaches the single session-held operator` passes; extension data-test selector `m1-invert-current-coordinate` round-trips.

6. **2.6 — K² played-torus 3D surface — full Bevy/wgpu extension** *(no-orphan-fill; DR-M1-2 VALIDATED)*

   First-build M' product surface (anti-greenfield exception): `Body/M/epi-theia/extensions/m1-paramasiva-played-torus/` with Bevy/wgpu renderer consuming the landed math at `portal-core/src/{quaternion.rs, hopf.rs}` + `m1.h CL42_BASIS[6]` + `RING_QUATERNION_LUT[12]` + the **six Ananda matrix families** surfaced through profile bus per Tranche 10.10. Correction: `m1.c:22-114` currently carries the digit-root `.rodata` face only; the raw/no-digit-root 12x12 affine face and rule/tuple family must be carried from the canonical Vortex Modulae CSV into the C generator/API before the played-torus treats Ananda as complete. M1 is a topological system — 2D never would have sufficed.

   **Canonical contract:** [`Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md`](Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md) is the substrate-side total-shape document; [`Body/M/epi-theia/extensions/m1-paramasiva-played-torus/ARCHITECTURE.md`](Body/M/epi-theia/extensions/m1-paramasiva-played-torus/ARCHITECTURE.md) is the IDE-side contract. Both are landed in cycle-3; the build follows them.

   **Boundary contract**: the played-torus renders a **single K² only**. The downstream `K² × T²_Mahāmāyā` double-torus belongs to M3-5 (`M1'-SPEC §1, §13.6`); this build must NOT cross that boundary. Tranche 15.8 + 15.9 own the visual + tick choreography contracts.

   **M1↔M2 Vimarśa-window contract**: `audio_octet[8]` particle emitters and `nodal_quartet[4]` satellite glyphs are **windows onto M2-1' Vimarśa's writes**, never locally re-derived. `vimarsha_reading.rs:17-93` is the single source of truth; the renderer subscribes to the profile bus. This is the central M1↔M2 contract for cycle-3 (cross-link Tranche 03 substrate inheritance).

   Verification: `test -d Body/M/epi-theia/extensions/m1-paramasiva-played-torus`; `test -f Body/M/epi-theia/extensions/m1-paramasiva-played-torus/ARCHITECTURE.md`; Bevy/wgpu toolchain declared in `package.json` / `wgpu/Cargo.toml`; render-test asserts K² topology with `DOUBLE_COVER_DEG=720` and `TORUS_GENUS=1` from substrate; boundary-audit asserts no `T²_Mahāmāya` rendering primitive in extension src (M3-5 territory); Vimarśa-window audit asserts `audio_octet`/`nodal_quartet` consumed via profile-bus subscription, not derived from local LUT lookups; substrate-derivation audit asserts no `RING_QUATERNION_LUT|CL42_BASIS|DR_RING_*` local definitions in extension src (all reads via profile/bridge); Ananda source-fidelity audit asserts `7X+1` and `8X+0` raw + digit-root cells arrive through `AnandaVortexProjection.active_cell_value`, not local UI math.

7. **2.9 — M1-2 Ananda Vortex architecture landing in M1' spec + Paramasiva UX** *(doc-ahead-landing; landed in cycle-3 controller, ratified here)*

   The canonical M1-2 architecture document is landed at `Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md`. M1'-SPEC §1 (six-strata table) is patched to reference the six canonical Ananda matrix families, each with raw/no-digit-root and digit-root faces, dual DR rings, Spanda↔Ananda parallel-track invariant, profile-bus contract, and architecture cross-reference. A new M1'-SPEC §15a is added as the architecture cross-reference section. The Paramasiva UX doc is patched with a new §5b "M1-2 Ananda Vortex — The Visible Heartbeat" covering what the user sees, the six-perspex matrix-family stack, the raw proof overlay, the digit-root heatmap, the Cl(4,2) colour-binary, the 720° identity-return as pedagogical recognition, the Klein-flip at tick 5→6, the Möbius-return at tick 11→0, the diamond centre, and the user-interaction patterns.

   These patches are the **doc-side total shape** the build (Tranches 02.6 / 10.10 / 15.8 / 15.9) follows. No further M1-2 architectural decision is open after this tranche; what remains is implementation correction so C, Rust, JSON, and UI preserve the full CSV-derived dual-register data instead of the current partial digit-root-only runtime face.

   Verification: `test -f Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md`; `grep -n "M1-2-ANANDA-VORTEX-ARCHITECTURE" Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md` returns the §1 row + §15a cross-reference; `grep -n "M1-2 Ananda Vortex — The Visible Heartbeat\|5b\\." Idea/Pratibimba/System/Subsystems/Paramasiva/paramasiva-ux-full-m1-branch.md` returns the new section; `grep -n "AnandaVortexProjection\|AnandaVortexCell" Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md` returns the profile-bus contract spec; C-side fixture test proves `7X+1` and `8X+0` raw + digit-root values against the Vortex Modulae CSV; `test -f Body/M/epi-theia/extensions/m1-paramasiva-played-torus/ARCHITECTURE.md` (IDE-side companion).

7. **2.7 — Audit four-scale Cl(4,2) identity** *(spec-ahead-integration; cross-link to Tranche 10.7)*

   Audit document asserting the same `Cl42_Basis_Entry` shape and `+2` signature is used at M1 ring, M3 codon, M4 personal, Kerykeion natal scales; identify any duplicated definition; name the Kerykeion natal scale owner (likely `M4'-SPEC` ↔ `personal_identity.rs`). Cross-cuts with kernel-bridge 10.7 — this tranche owns the M-side audit memo; 10.7 owns the kernel-side.

   Verification: `grep -rn "CL42_BASIS|Cl42_Basis_Entry|cl42_signature" Body/S/S0/` enumerates exactly one source-of-truth; audit file lists four scales with code-paths.

8. **2.8 — Resolve audio-research open question on `MathemeHarmonicProfile` type owner** *(doc-ahead-landing)*

   One-line update to `m1-prime-audio-generative-research.md §Open Research Questions` first item: canonical `MathemeHarmonicProfile` defined at `Body/S/S0/portal-core/src/kernel.rs:346`, re-exported via `portal-core/src/harmonic_profile.rs`.

   Verification: `grep -n "MathemeHarmonicProfile type defined\|portal-core/src/kernel.rs" Idea/Bimba/Seeds/M/M1'/m1-prime-audio-generative-research.md` shows resolved attribution.

## Track 19 Cross-Reference

Track 19 (Contemplation Surface Integration) consumes M1 substrate at **T19.8**: pedagogical Kaprekar 6174 seed landed LEAN at [`m1-prime-kaprekar-pedagogy.md`](../../M1'/m1-prime-kaprekar-pedagogy.md) (digits {1,4,6,7} → kernel primitives, factorization `7² × 9 × 14`, archetype-7 binding via `QL_DIVINE_ACT_RATIO 16/9`), with `AnandaSkeletonEvent::KaprekarPedagogyHit = 6` added to the enum at [M1-2-ANANDA-VORTEX-ARCHITECTURE.md:261-272](../../M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md). Full freight (four-register law: Kaprekar 7-step / parent-as-7th / Cl(4,2)+2 / Möbius twist; and `137 = 64 + 72 + 1` reading per `alpha_quaternionic_integration_across_M_stack.md`) stays in the integration plan, NOT the pedagogy seed. See [`19-contemplation-surface-integration.md`](19-contemplation-surface-integration.md).
