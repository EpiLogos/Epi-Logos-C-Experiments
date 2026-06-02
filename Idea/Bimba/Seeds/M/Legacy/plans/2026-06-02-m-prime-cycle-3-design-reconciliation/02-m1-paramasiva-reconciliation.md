# Track 02 — M1 Paramaśiva Reconciliation

Reconciles [[M1']] across the four corpora. The substrate is rich and the Theia surface is intentionally shallow: `epi-lib/include/m1.h` carries `ANANDA_BIMBA`/`PRATIBIMBA`, `SPANDA_SEED_BITS=0x03`, `TORUS_GENUS=1`, `DOUBLE_COVER_DEG=720`, `RING_QUATERNION_LUT[12]`, `CL42_BASIS[6]`, `QL_TRIG_TABLE[6]` with static asserts; `portal-core/src/kernel.rs:346` owns `MathemeHarmonicProfile` with `tick12`, `degree720`, `lens_mode`, `resonance72`, `audio_octet[8]`, `nodal_quartet[4]`; `portal-core/src/parashakti/vimarsha_reading.rs` writes the audio bus (resolving the M2-1' Vimarsha-writes / M1' consumes architecture); `hopf.rs` + `quaternion.rs` land the Hopf bundle and SU(2) math. The m1-paramasiva extension is a scaffold with all the right slot names and explicit `DECLARED_BLOCKERS`.

## Source Specs and Matrix

- Canonical: `Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md`, `Idea/Pratibimba/System/Subsystems/Paramasiva/paramasiva-ux-full-m1-branch.md`
- Companions: `Idea/Bimba/Seeds/M/M1'/m1-prime-paramasiva-instrument.md`, `Idea/Bimba/Seeds/M/M1'/m1-prime-audio-generative-research.md`, `Idea/Bimba/Seeds/M/M1'/physical-pole-stack-architecture.md`
- Full row-level reconciliation: `plan.runs/wave-a-m1-reconciliation-matrix.md`

## Cycle 2 Substrate Inheritance

Consume as-is — `epi-lib/include/m1.h` LUTs; `portal-core/src/{kernel.rs,quaternion.rs,hopf.rs,spanda.rs,parashakti/vimarsha_reading.rs}`; `Body/M/epi-theia/extensions/m1-paramasiva` scaffold with `clockInstrument` + `kleinTopology` + `audioBusInspector` views. Cycle 2 Track 03 (T1 audio-genesis, T3 Cl(4,2)/Klein/inspector depth) named the deliverables — cycle 3 closes them.

## Tranches

1. **2.1 — Audit and downgrade residual M0-witness wording** *(contradiction-decision; routes to DR-M1-1)*

   Decision-register entry routing `Idea/Bimba/Seeds/M/alpha_quaternionic_integration_across_M_stack.md §1.1` to user final-validation. On validation, single-line patch replacing `M0 Anuttara witness-axis` with `M1-5 (the +1 parent) per M1'-SPEC §1`. Standing invariant.

   Verification: `grep -n "M0 Anuttara witness-axis\|witness-axis" Idea/Bimba/Seeds/M/alpha_quaternionic_integration_across_M_stack.md` returns no live-attribution matches after patch.

2. **2.2 — Land `klein_flip` field + emitter on `MathemeHarmonicProfile`/`vimarsha_reading`** *(code-pending-closure; cross-link to Tranche 10.2)*

   Add `pub klein_flip: Option<KleinFlipEvent>` to `MathemeHarmonicProfile` in `Body/S/S0/portal-core/src/kernel.rs`. Detector in `vimarsha_read_profile` firing precisely at Lens N ↔ Lens N+3 (mod 12); contract test rejecting false positives on other lens transitions. Tranche 10.2 owns the kernel-bridge JSON emit completion.

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

   First-build M' product surface (anti-greenfield exception): `Body/M/epi-theia/extensions/m1-paramasiva-played-torus/` with Bevy/wgpu renderer consuming the landed math at `portal-core/src/{quaternion.rs, hopf.rs}` + `m1.h CL42_BASIS[6]` + `RING_QUATERNION_LUT[12]` + the **six Ananda vortex matrices** at `m1.c:22-114` (surfaced through profile bus per Tranche 10.10). M1 is a topological system — 2D never would have sufficed.

   **Boundary contract (per Tranche 15 subagent research)**: the played-torus renders a **single K² only**. The downstream `K² × T²_Mahāmāyā` double-torus belongs to M3-5 (`M1'-SPEC.md:56, 64`); this build must NOT cross that boundary. Tranche 15.8 + 15.9 own the visual + tick choreography contracts.

   **M1↔M2 Vimarśa-window contract**: `audio_octet[8]` particle emitters and `nodal_quartet[4]` satellite glyphs in the played-torus renderer are **windows onto M2-1' Vimarśa's writes**, never locally re-derived. `vimarsha_reading.rs:17-93` is the single source of truth; the renderer subscribes to the profile bus. This is the central M1↔M2 contract for cycle-3 (cross-link Tranche 03 substrate inheritance).

   Verification: `test -d Body/M/epi-theia/extensions/m1-paramasiva-played-torus`; Bevy/wgpu toolchain declared in `package.json`; render-test asserts K² topology with `DOUBLE_COVER_DEG=720` and `TORUS_GENUS=1` from substrate; boundary-audit asserts no `T²_Mahāmāyā` rendering primitive in extension src (M3-5 territory); Vimarśa-window audit asserts `audio_octet`/`nodal_quartet` consumed via profile-bus subscription, not derived from local LUT lookups.

7. **2.7 — Audit four-scale Cl(4,2) identity** *(spec-ahead-integration; cross-link to Tranche 10.7)*

   Audit document asserting the same `Cl42_Basis_Entry` shape and `+2` signature is used at M1 ring, M3 codon, M4 personal, Kerykeion natal scales; identify any duplicated definition; name the Kerykeion natal scale owner (likely `M4'-SPEC` ↔ `personal_identity.rs`). Cross-cuts with kernel-bridge 10.7 — this tranche owns the M-side audit memo; 10.7 owns the kernel-side.

   Verification: `grep -rn "CL42_BASIS|Cl42_Basis_Entry|cl42_signature" Body/S/S0/` enumerates exactly one source-of-truth; audit file lists four scales with code-paths.

8. **2.8 — Resolve audio-research open question on `MathemeHarmonicProfile` type owner** *(doc-ahead-landing)*

   One-line update to `m1-prime-audio-generative-research.md §Open Research Questions` first item: canonical `MathemeHarmonicProfile` defined at `Body/S/S0/portal-core/src/kernel.rs:346`, re-exported via `portal-core/src/harmonic_profile.rs`.

   Verification: `grep -n "MathemeHarmonicProfile type defined\|portal-core/src/kernel.rs" Idea/Bimba/Seeds/M/M1'/m1-prime-audio-generative-research.md` shows resolved attribution.
