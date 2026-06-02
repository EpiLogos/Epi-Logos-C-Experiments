# Track 03 — M2 Paraśakti Reconciliation

Reconciles [[M2']] across the four corpora. The harmonic-correspondential instrument is well-grounded: `m2.h` enforces the 72-invariant via `_Static_assert` and lands all six 72-cardinality LUTs (MEF, tattva, decan, Shem, maqam, M2→M3 cymatic projection) plus the planet-LUT[10], Asma 99+1, mantra 100. `vimarsha_reading.rs` implements M2-1' Vimarśa correctly, producing `audio_octet[8]` + `nodal_quartet[4]`. The Theia extension's meaning-packet builder lands the full `M2PrimeMeaningPacket` shape with cymatic frame, deterministic standing-wave, and personal-scope blocking. The chief gaps are: the F_routing carrier (every LUT and Kerykeion CLI landed, but no chained-traversal function in portal-core) and the S2 graph-correspondence kernel-bridge adapter.

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

5. **3.5 — Decision: planet-count + Earth-observer semantics (DCC-03)** *(contradiction-decision; routes to DR-M2-1)*

   Decision-register entry resolving Sun-as-identity-root (`M2_PLANET_LUT[10]` includes Sun + Earth listed as separate `EarthBodyState`) vs UX/spec §9.5 Earth-as-observer-ground for the 9:8 M2→M3 bridge. Recommend: keep `M2_PLANET_LUT[10]` (Sun as identity root) + separate `earth_observer_handle` kernel-bridge field (NOT a planet-LUT row); document 9 non-Sun × 8 chakras 9:8 epogdoon explicitly. Consolidates with kernel-bridge DR-KB-1 (Tranche 10.3).

   Verification: user final-validation marker in decision register DR-M2-1; downstream `planetCountDecision: 'pending-DCC-03'` removed from `meaning-packet.ts:145`.

6. **3.6 — Decision: six axes of 72 + overlays canon (M2 17th-lens question)** *(contradiction-decision; routes to DR-M2-2)*

   Decision-register entry ratifying: six addressing-axes of 72 (MEF, tattva, decan, Shem, maqam, DET-projection) + two sonic overlays (mantra 100, Asma'ul-Husna 99+1) + planetary keying via decan-link (planet LUT [10]). Downgrade UX doc §3 seventh row (mantra) from "axis" to "overlay". Split Theia `shem-asma` `M2AddressView` into separate `shem` and `asma`.

   Verification: UX doc §3 patched to six-axes-plus-overlays; `meaning-packet.ts:50-54` `M2AddressView['name']` enum has `shem` and `asma` as separate entries; round-trip tests cover the asymmetry.

7. **3.7 — Tuning-aware music-tech bridge (deferred CODE-PENDING)** *(code-pending-closure; flagged not greenfield)*

   Named integration blocker: `Body/S/S0/portal-core/src/music_tech.rs` MPE / MTS-ESP / Scala emitter for maqam intervals. `M2_MAQAM_DESC[72]` 24-TET interval patterns already in `.rodata`. Flagged not executed in cycle-3 unless promoted by user.

   Verification: decision-register or follow-on tranche reference; `M2_MAQAM_DESC[72]` interval patterns surface in MPE/MTS-ESP test stream once promoted.

8. **3.8 — Nara deposit-handle wiring** *(doc-ahead-landing; cross-extension; cross-link to Tranche 08)*

   Ensure F_routing trace (3.2) emits an M4' deposit handle consumed by Nara surface. Most of this lands in integrated 4-5-0 plugin closure (Tranche 08) but M2-side must emit the handle.

   Verification: `grep -n 'deposit_handle\|m4.deposit' Body/S/S0/portal-core/src/parashakti/f_routing.rs` after 3.2 lands; integration test M4' journal receives the handle.
