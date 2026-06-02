# Track 10 — Kernel-Bridge / Profile-Contract Readiness Ledger

The shared M' data spine. The `MathemeHarmonicProfile` struct at `Body/S/S0/portal-core/src/kernel.rs:346-387` and its typed Theia mirror (`Body/M/epi-theia/extensions/kernel-bridge/src/common/types.ts`) is substantially more landed than Wave-A digests suggested. **This tranche is the canonical cycle-3 source-of-truth profile-field ledger**; every Mn extension depending on a profile field reads against it.

## Source Specs and Matrix

- Canonical: `Body/S/S0/portal-core/src/kernel.rs` (struct + projections), `Body/S/S0/portal-core/src/harmonic_profile.rs` (re-export), `Body/S/S0/epi-cli/src/gate/kernel_bridge_runtime.rs` (JSON edge)
- Theia mirror: `Body/M/epi-theia/extensions/kernel-bridge/src/common/{types.ts,profile.ts,readiness-types.ts}`
- Full row-level evidence: `plan.runs/wave-b-kernel-bridge-matrix.md`

## Cycle 2 Substrate Inheritance

Consume as-is — `MathemeHarmonicProfile` struct (kernel.rs:346-387); resonance72 projection (lines 366, 605-628); `CODON_ROTATION_SURFACE_COUNT=472` codon-rotation (`codon_rotation_projection.rs:9`); `audio_octet[8]`/`nodal_quartet[4]` (kernel.rs:367-368 ← `vimarsha_reading.rs`); `pointerAnchor` (kernel.rs:379, 847-886); typed Theia mirror; readiness 9-state taxonomy; 7-capability allow-list; 3-table stream whitelist; opaque `MathemeHarmonicProfileBoundary.payload` (policy-correct — per-extension narrowing). Cycle 2 Tracks 11-12 closed S0/S1/S2 + S3/S4/S5 substrate; cycle 3 closes profile-field readiness over it.

## Profile-Field Readiness Ledger (digest — full matrix in plan.runs/)

| Field | Status | Owning Spec | Unblock Path |
|---|---|---|---|
| `MathemeHarmonicProfile` struct | ALIGNED | M'-SYSTEM-SPEC | n/a |
| `audio_octet[8]` / `nodal_quartet[4]` | ALIGNED | M1'-SPEC §6, M2'-SPEC §4.1 | n/a |
| 84-state `(lens, mode)` | ALIGNED | M1'-SPEC §1 | n/a |
| 72-invariant `resonance72` | ALIGNED (transport); M2 decode SPEC-AHEAD | M2'-SPEC §0/§8 | M2 Tranche 03.3 |
| 472-state `codonRotationProjection` | ALIGNED | M3'-SPEC §7 | n/a |
| `kleinFlipState` | **CODE-PENDING** | M2'-SPEC §4, §7 (consumer); M1'-SPEC §6 (producer) | Tranches 02.2 + 10.2 |
| `pointerAnchor` | ALIGNED | M0'-SPEC, M5'-SPEC | n/a |
| `depositionAnchor` | **SPEC-AHEAD** | M5'-SPEC | DR-KB-2 decision (10.4) |
| `mahamaya` dual-alias | ALIGNED | M3'-SPEC §8.13 (IOD-04) | n/a |
| `planetaryChakral` LUT cardinality | **CONTRADICTION** | M2'-SPEC §9.5 | DR-KB-1 decision (10.3) consolidating DR-M2-1 |
| `VakAddress` carrier | ALIGNED | M0'-SPEC, M5'-SPEC | n/a |
| `s2_anchor` / `s3_anchor` | **CODE-PENDING** | placeholder Option<MathemeFutureAnchor> never populated | Tranche 10.5 (audit + populate or remove) |
| `dataset_lut_state` pending literal | CODE-PENDING (downstream dataset) | M3'-SPEC §2 | Wave-A M0 1.4 (host struct: `MathemeBinaryProjection`, NOT Bedrock — see 10.9) |
| Capability allow-list + readiness 9-state taxonomy + 3-table stream whitelist | ALIGNED | shell contracts | n/a |
| `MathemeHarmonicProfileBoundary.payload` opacity | ORPHAN (intentional) | profile.ts:9-11 | Tranche 10.1 records that per-extension narrowing is each Mn's responsibility |
| Single session-held `#` `(Inversion_Operator)` carrier | CODE-PENDING | M1'-SPEC §0/1 commitment 2 | M1 Tranche 02.5 |

## Tranches

1. **10.1 — Profile-field readiness ledger (this document + matrix file)** *(code-pending-closure)*

   This tranche document + `plan.runs/wave-b-kernel-bridge-matrix.md` together become cycle-3's canonical profile-field source of truth. Cross-referenced from `00-overview` and every Mn tranche depending on a profile field.

   Verification: `test -f Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/wave-b-kernel-bridge-matrix.md`; `test -f 10-kernel-bridge-profile-contract.md`.

2. **10.2 — Land `MathemeHarmonicProfile.klein_flip` + bridge JSON emit** *(code-pending-closure; extends Tranche 02.2)*

   Add `klein_flip` field to `MathemeHarmonicProfile` at `kernel.rs:346-387`. Populate from `vimarsha_reading.rs`. Emit at `kernel_bridge_runtime.rs:615-622`. Drop `kleinFlipState` from contract preflight M2 blocker list (Tranche 10.8).

   Verification: `cargo check -p portal-core -p epi-cli && cargo test -p epi-cli --test kernel_bridge_runtime_contract`.

3. **10.3 — DR-KB-1: planetary projection LUT cardinality** *(contradiction-decision; consolidates DR-M2-1)*

   Register the choice carried forward from M2 DCC-03 so cycle-4 can extend `MathemePlanetaryChakralProjection::from_diatonic` at `kernel.rs:664-736`. Current code: 8 bodies via 7-degree diatonic + Pluto fallback. M2'-SPEC §9.5: 10-planet + Earth-observer.

   Verification: `grep -n 'DR-KB-1' 13-decision-register.md`.

4. **10.4 — DR-KB-2: `depositionAnchor` typed-field vs bridge-DTO** *(contradiction-decision)*

   Decide whether `depositionAnchor` becomes a typed `MathemeHarmonicProfile` field or is formalized as a contract DTO via `types.ts`. Resolves Wave-A M5 code-pending row. Currently synthesized at bridge JSON edge at `kernel_bridge_runtime.rs:625-631`.

   Verification: `grep -n 'DR-KB-2' 13-decision-register.md`.

5. **10.5 — Audit `s2_anchor` / `s3_anchor` future-anchor placeholder fields** *(code-pending-closure)*

   Either land emitters using cycle-2 S2/S3 anchor registries to populate `kernel.rs:384,386`, or downgrade to `#[deprecated]` and remove. No greenfield.

   Verification: `cargo check -p portal-core && grep -n 's2_anchor\|s3_anchor' Body/S/S0/portal-core/src/kernel.rs`.

6. **10.6 — Bridge contract test: six-axes-of-72 carrier round-trip** *(spec-ahead-integration)*

   Verify `Body/S/S0/epi-cli/tests/kernel_bridge_runtime_contract.rs` exercises the `resonance72` carrier shape. Extend if transport check is missing. **Decoder is M2 extension work (Tranche 03.3); bridge only proves transport.**

   Verification: `cargo test -p epi-cli --test kernel_bridge_runtime_contract`.

7. **10.7 — Audit four-scale Cl(4,2) one-algebra identity in `kernel.rs`** *(spec-ahead-integration; cross-link to Tranches 02.7, 04.7)*

   Audit memo confirming M1 ring / M3 codon / M4 personal / Kerykeion natal share ONE Cl(4,2) primitive. Touch points: `q_cosmic` kernel.rs:374, `codon_charge_quaternion` :410, `BioQuaternionState` events.rs:4, `slash_flip_bimba_prime` kernel.rs:1038.

   Verification: `grep -rn 'Cl(4,2)\|cl42\|clifford' Body/S/S0/portal-core/src/ --include='*.rs'`; audit memo file at `plan.runs/10.7-cl42-four-scale-audit.md`.

8. **10.8 — Update contract preflight blocker list after 10.2 lands** *(doc-ahead-landing)*

   Edit `Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.json:315` to drop `kleinFlipState` from M2 blocker list. Add `kleinFlip` example to `MathemeHarmonicProfileBoundary` payload-narrowing examples.

   Verification: `grep -n 'kleinFlipState' Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.json` (no active hits after patch).

9. **10.9 — Correction: `dataset_lut_state` / `m3_codec_provenance` host struct** *(doc-ahead-landing)*

   Wave-A M0 Tranche 01.4 attributed these literals to `MathemeBedrockProjection`; they actually live on `MathemeBinaryProjection` at `kernel.rs:797,805`. Record correction so M0/M3 closure tranches name the right struct.

   Verification: decision-register-adjacent correction note references `kernel.rs:797`.

10. **10.10 — Surface M1-2 ananda vortex state through the profile bus** *(code-pending-closure; new finding from Tranche 15 subagent research)*

    Per the M1-2 ananda vortex research (`plan.runs/15-m1-2-ananda-vortex-research.md` finding #5), **no `vortex_*` field exists on `MathemeHarmonicProfile`** (`kernel.rs:346-387`). The vortex is implicit via `tick12 + position6 + helix + lens_mode` and IS read by M2 (`m2.h:307`) and M3 (`m3.h:966`), but is NOT surfaced through the profile bus. This is the **largest substrate→profile gap** in the M' spine — the played-torus renderer (Tranche 15.8) needs to consume vortex state via a typed handle, not reconstruct it from coordinates.

    Add `pub ananda_vortex: AnandaVortexProjection` to `MathemeHarmonicProfile` exposing: `active_matrix_op: AnandaMatrixOp` (0-5 per `m1.h:735-756`), `active_cell: (u8, u8)` (12×12 indexed by tick12 × position6), `dr_ring_phase: { mahamaya_idx: u8, parashakti_idx: u8 }`, `cl42_signature_at_position: i8`. Anti-greenfield: the data is all already computed by `m1.c::m1_ananda_get` (m1.h:145, m1.c:297-345); this tranche only routes it through the profile bus.

    Verification: `cargo check -p portal-core && cargo test -p portal-core --test ananda_vortex_projection_round_trip`; `grep -n ananda_vortex Body/S/S0/portal-core/src/kernel.rs` returns the field declaration; kernel-bridge JSON emit at `kernel_bridge_runtime.rs` surfaces the projection; Theia mirror in `kernel-bridge/src/common/types.ts` reflects the new handle; Tranche 15.8 renderer reads the typed handle, not raw coordinates.
