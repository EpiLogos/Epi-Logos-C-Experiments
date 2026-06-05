# Track 03 — M2 Paraśakti Reconciliation

Reconciles [[M2']] across the four corpora. The harmonic-correspondential instrument is well-grounded: `m2.h` enforces the 72-invariant via `_Static_assert` and lands all six 72-cardinality LUTs (MEF, tattva, decan, Shem, maqam, M2→M3 cymatic projection) plus the planet-LUT[10], Asma 99+1, mantra 100. `vimarsha_reading.rs` implements M2-1' Vimarśa correctly, producing `audio_octet[8]` + `nodal_quartet[4]`. The Theia extension's meaning-packet builder lands the full `M2PrimeMeaningPacket` shape with cymatic frame, deterministic standing-wave, and personal-scope blocking. The chief gaps are: the F_routing carrier (every LUT and Kerykeion CLI landed, but no chained-traversal function in portal-core) and the S2 graph-correspondence kernel-bridge adapter.

## Total-Shape Architecture (Phase A)

Canonical total-shape document for M2' (all six addressing axes + F_routing + cymatic engine): [`Idea/Bimba/Seeds/M/M2'/M2-ARCHITECTURE.md`](Idea/Bimba/Seeds/M/M2'/M2-ARCHITECTURE.md) (734 lines). Profile-bus projection `ParashaktiMeaningProjection` per Tranche 10.M2; Earth-at-centre is documented semantics on the planetary axis, not a separate projection. DR-M2-3 owns F_routing carrier signature. M1↔M2 Vimarśa-window boundary: M2-1' is the canonical writer at `vimarsha_reading.rs:17-93`; M1 reads (never re-derives). M2↔M3 epogdoon 9:8 PASSES.

## Source Specs and Matrix

- Canonical: `Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md`, `Idea/Pratibimba/System/Subsystems/Parashakti/parashakti-ux-full-m2-branch.md`
- Companions: `Idea/Bimba/Seeds/M/M2'/m2-prime-parashakti-cymatic-engine.md`, `Idea/Bimba/Seeds/M/M2'/m2-prime-frequency-meaning-research.md`
- Full row-level reconciliation: `plan.runs/wave-a-m2-reconciliation-matrix.md`

## Cycle 2 Substrate Inheritance

Consume as-is — `epi-lib/include/m2.h` six 72-cardinality LUTs + planet-LUT[10] + mantra-100 + Asma-99+1; `Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs`; `Body/S/S0/portal-core/src/harmonic_profile.rs`; `Body/S/S0/epi-cli/src/nara/wind.rs` Kerykeion CLI; `Body/M/epi-theia/extensions/m2-parashakti/src/common/meaning-packet.ts` M2PrimeMeaningPacket scaffold. Cycle 2 Track 04 owns the cymatic-engine extension spine.

## Tranches

1. **3.1 — Klein-flip profile field closure** *(code-pending-closure; cross-link to Tranches 02.2, 10.2)*

   Pass-through: M1' (Track 02.2) produces `klein_flip` on `MathemeHarmonicProfile`; kernel-bridge (Track 10.2) emits it. M2' consumes — round-trip flip-return test asserting M2-side `kleinFlipFrame` consumer fires.

   Verification: `cargo check -p portal-core && cargo test -p portal-core --test klein_flip_round_trip`; `grep -n klein_flip_state Body/S/S0/portal-core/src/kernel.rs` returns ≥1 hit; M2 meaning-packet consumes the field.

2. **3.2 — F_routing carrier landing** *(no-orphan-fill; method-routing closure)*

   Author `Body/S/S0/portal-core/src/parashakti/f_routing.rs` exposing `f_routing(intent, kerykeion, t) -> RoutingTrace { planetary_hour_ruler, active_decan, shem_pair, maqam_family/mode, mantra_index, asma_name, index72, det64 }`. Widget consumes via kernel-bridge `m2.routing_trace` observability event (slot already present). Anti-greenfield: this is method-routing closure over six landed LUTs, NOT new substrate.

   Verification: `test -f Body/S/S0/portal-core/src/parashakti/f_routing.rs && cargo check -p portal-core`; deterministic-trace test for fixed `(intent, kerykeion, time)`; `index72` round-trips through six axis views.

3. **3.3 — Six-axes address-view decoder** *(spec-ahead-integration)*

   Replace `meaning-packet.ts:220-228` six identical address-view stubs (all pointing at `profile.resonance72.lensAnchorIndex`) with per-axis decoders sourcing each LUT via kernel-bridge `m2.decodeAxisAt(address72, axis)`. Per-axis [0,71] round-trip test.

   Verification: `grep -c "sourceField: 'profile.resonance72" Body/M/epi-theia/extensions/m2-parashakti/src/common/meaning-packet.ts` returns 1 (only MEF); five other axes have distinct `sourceField` entries; per-axis round-trip test passes.

4. **3.4 — S2 graph-correspondence Theia adapter** *(spec-ahead-integration; cross-link to Tranche 09)*

   Name kernel-bridge method `s2.parashaktiCorrespondences(address72)` returning `{decanFace, sacredSonic, planetaryChakral, earthObserverHandle}`. Integrated 1-2-3 plugin invokes it. Populate `s2.provenanceHandle` to unblock `packetBlockers` line 294.

   Verification: `grep -n parashaktiCorrespondences Body/M/epi-theia/extensions/kernel-bridge/src/`; widget `pendingFields` no longer includes `s2.decanFace`/`s2.sacredSonic`/`s2.earthObserverHandle` on a routed packet; integration test against `parashakti-deep` dataset.

5. **3.5 — Execute DR-M2-1: planet-count + Earth-at-centre semantics** *(doc-ahead-landing; DR-M2-1 VALIDATED)*

   Strip `planetCountDecision: 'pending-DCC-03'` from `meaning-packet.ts:145` and document the ratified semantics in M2'-SPEC §9.5 plus the cymatic-engine companion: `M2_PLANET_LUT[10]` is canon and **Earth is the 10th planet as observer-centre**, not a separate handle on top of a 10-planet list. The 9:8 epogdoon is 9 non-Earth planets to 8 chakras, with Earth as the clock/map centre. Consolidates with DR-KB-1 / Tranche 10.3 as a doc-ahead downgrade; no new bridge field is required.

   Verification: downstream `planetCountDecision: 'pending-DCC-03'` removed from `meaning-packet.ts:145`; `grep -n "Earth.*centre\|10th planet" Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md` reflects the ratified semantics.

6. **3.6 — Decision: six axes of 72 + overlays canon (M2 17th-lens question)** *(contradiction-decision; routes to DR-M2-2)*

   Decision-register entry ratifying: six addressing-axes of 72 (MEF, tattva, decan, Shem, maqam, DET-projection) + two sonic overlays (mantra 100, Asma'ul-Husna 99+1) + planetary keying via decan-link (planet LUT [10]). Downgrade UX doc §3 seventh row (mantra) from "axis" to "overlay". Split Theia `shem-asma` `M2AddressView` into separate `shem` and `asma`.

   Verification: UX doc §3 patched to six-axes-plus-overlays; `meaning-packet.ts:50-54` `M2AddressView['name']` enum has `shem` and `asma` as separate entries; round-trip tests cover the asymmetry.

7. **3.7 — Tuning-aware music-tech bridge (deferred CODE-PENDING)** *(code-pending-closure; flagged not greenfield)*

   Named integration blocker: `Body/S/S0/portal-core/src/music_tech.rs` MPE / MTS-ESP / Scala emitter for maqam intervals. `M2_MAQAM_DESC[72]` 24-TET interval patterns already in `.rodata`. Flagged not executed in cycle-3 unless promoted by user.

   Verification: decision-register or follow-on tranche reference; `M2_MAQAM_DESC[72]` interval patterns surface in MPE/MTS-ESP test stream once promoted.

8. **3.8 — Nara deposit-handle wiring** *(doc-ahead-landing; cross-extension; cross-link to Tranche 08)*

   Ensure F_routing trace (3.2) emits an M4' deposit handle consumed by Nara surface. Most of this lands in integrated 4-5-0 plugin closure (Tranche 08) but M2-side must emit the handle.

   Verification: `grep -n 'deposit_handle\|m4.deposit' Body/S/S0/portal-core/src/parashakti/f_routing.rs` after 3.2 lands; integration test M4' journal receives the handle.

9. **3.9 — M2'-SPEC §9.8 open-question cleanup** *(doc-ahead-landing; DR-M2-1 VALIDATED)*

   Remove the planet-count open question from M2'-SPEC §9.8 now that DR-M2-1 has closed it. Cross-link §9.8 to §9.5 Earth-at-centre semantics instead of leaving DCC-03 as a live decision.

   Verification: `grep -n "DCC-03\|planet-count" Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md` returns only historical/caveated references; §9.5 names Earth as centre / 10th planet.
