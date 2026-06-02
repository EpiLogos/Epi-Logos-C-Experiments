# Wave-A M2 (Paraśakti) — Cycle-3 Reconciliation Matrix

**Task:** `wave-a-m2`
**Domain:** M2 — Paraśakti, the harmonic-correspondential instrument (72-invariant + six addressing-axes)
**Authored:** 2026-06-02
**Method:** four-way trace (UX doc ↔ M' Seed spec ↔ Body/S substrate ↔ Body/M/epi-theia surface), anti-greenfield.

## Source list (corpora actually consulted)

- **Corpus 1 (UX intent):** `Idea/Pratibimba/System/Subsystems/Parashakti/parashakti-ux-full-m2-branch.md` (249 LOC)
- **Corpus 2 (M' Seed authority):**
  - `Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md` (430 LOC, the canonical domain spec)
  - `Idea/Bimba/Seeds/M/M2'/m2-prime-parashakti-cymatic-engine.md` (companion, 600 LOC — read targeted)
  - `Idea/Bimba/Seeds/M/M2'/m2-prime-frequency-meaning-research.md` (companion, 608 LOC — read targeted)
- **Corpus 3 (substrate truth):**
  - `Body/S/S0/epi-lib/include/m2.h` (`_Static_assert`s for 72, the six LUTs `M2_MEF_DESC`, `M2_DECAN_DESC`, `M2_SHEM_DESC`, `M2_MAQAM_DESC`, `M2_ASMA_LUT`, `M2_MANTRA_LUT`, `M2_PLANET_LUT[10]`, and `M2_TO_M3_CYMATIC_PROJECTION[72]`)
  - `Body/S/S0/epi-lib/src/m2.c` (~1092 LOC, the `.rodata` LUT contents)
  - `Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs` (132 LOC — Vimarśa kernel: writes `audio_octet[8]` + `nodal_quartet[4]` from `(tick, lens_mode)`)
  - `Body/S/S0/portal-core/src/harmonic_profile.rs` (14 LOC re-export shim)
  - `Body/S/S0/portal-core/src/kernel.rs` (`MathemeHarmonicProfile` definition, `MathemePlanetaryChakralProjection`, `MathemeResonance72Projection`, `MathemeLensMode`, etc.)
  - `Body/S/S0/portal-core/src/events.rs` (`klein_flip: bool` on relation descriptors)
  - `Idea/Bimba/Map/datasets/parashakti-deep/{relations.json,nodes-full-detail.json,parashakti-planets.json}` (271 matches for Decan/Shem/Maqam/Mantra/Planet/Modal/Ananda/Spanda/Quantum-Field relation families)
- **Corpus 4 (Theia surface):**
  - `Body/M/epi-theia/extensions/m2-parashakti/src/common/meaning-packet.ts` (375 LOC — `buildM2PrimeMeaningPacket`, six `addressView` stubs, `renderM2CymaticFrame`, packet blockers/pending tracking)
  - `Body/M/epi-theia/extensions/m2-parashakti/src/common/index.ts` (EXTENSION_ID, PRIVACY_CLASS)
  - `Body/M/epi-theia/extensions/m2-parashakti/src/browser/{frontend-module.ts, m2-parashakti-widget.tsx}` (widget renders packet, but no per-axis inspector panels for shem/maqam/mantra/decan/etc.)
- **Reference (cycle-2):** `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-2-canonical/04-m2-parashakti-extension.md` (T0–T3: packet/surface, 72-fold tree, F_routing, cymatic) — substrate inheritance for cycle-3.

## Standing invariants honored (not re-derived)

- 72 is one invariant, six addressing-axes (MEF×QL · tattva · decan · Shem · maqam · planetary). Mantra is 100 (50+50), not a 72-axis — it is a sonic-correspondence overlay onto the 72 (UX §3 lists it as the seventh enumerated row, but spec §8.4 keeps it at 100).
- Matheme spine: M1 (+1) → M2 (72) → M3 (64). The 9:8 epogdoon bridges 72→64 via `floor(index72 × 8 / 9) = 64`, baked at `m2_epogdoon_compress` in m2.h.
- +1 parent is M1-5, NOT M0 — `137 = 64 + 72 + 1` ascribes the +1 to Paramaśiva's parent, not Anuttara.
- S0 is the membrane; M2-1' Vimarśa kernel lives at S0/portal-core; M2'-SPEC retains specification authority (DCC-05/IOD-17).
- Theia shell authority: `/pratibimba/system` + `Body/M/epi-theia`. `Body/M/epi-tauri` is deprecated.

---

## The Four-Way Alignment Matrix

| # | Claim (UX doc) | Spec authority (M2'-SPEC) | Code/substrate evidence | Theia surface (m2-parashakti) | Status |
|---|---|---|---|---|---|
| M2.01 | One 72-invariant, six addressing-axes (`12×6 = 36×2 = 8×9 = 72`) | §0 commitment 1 + §8 lists six axes (MEF, tattva, decan, Shem, maqam — `9+8+8+5+7+8+6+7+9+5=72` — planetary 10-LUT); §10 round-trip test required | m2.h `_Static_assert(sizeof M2_Vibrational_72_Space == 72)`, `_Static_assert(12*6==72)`, `_Static_assert(8*9==72)`, `_Static_assert(sizeof M2_MEF_DESC[72])`; six LUTs all present as `.rodata` | **Address views in code-name only** — `meaning-packet.ts:220-228` emits 6 `M2AddressView` entries (`mef`, `tattva-phase`, `decan-face`, `shem-asma`, `maqam`, `det-projection`) but **all six point to the same `profile.resonance72.lensAnchorIndex`** field; no per-axis decoding is happening | **SPEC-AHEAD** — substrate carries six LUTs; the Theia "axis view" is a stub. Code-pending axis-decoder. |
| M2.02 | "M2-1' is the audio-genesis layer: reads Prakāśa cloud and writes `audio_octet[8]` + `nodal_quartet[4]`" | §1 / §3 backend contract names `vimarsha_reading.rs` as the Vimarśa bus-writing function; §10 readiness gate on bus | `vimarsha_reading.rs` `vimarsha_read_profile(tick, lens_mode)` → `VimarshaReading { audio_octet:[f32;8], nodal_quartet:[MathemeNodalConstraint;4] }`; kernel.rs:411 calls it and populates `MathemeHarmonicProfile.audio_octet/nodal_quartet` | Widget consumes `profile.audioOctet[8]` / `profile.nodalQuartet[4]` exactly (no re-synthesis); `renderM2CymaticFrame` throws if not size-8/size-4 | **ALIGNED** |
| M2.03 | "M2-1' Klein L↔L' meaning-flip: `kleinFlipState` signalled by M1', M2' inverts surface valence" | §4 lists `kleinFlipState` as required profile field; §7 enumerates the flip's per-panel effects; §10 requires test for flip-then-return | `klein_flip: bool` lives ONLY on `events.rs` relation descriptors, NOT on `MathemeHarmonicProfile`; no `kleinFlipState` profile field in kernel.rs | `meaning-packet.ts:325-332` `kleinFlipFrame` reads `payload.kleinFlipState ?? lensMode.kleinFlipState` and falls back to `'pending-M1-kleinFlipState'`; surfaceValence inversion logic exists but is gated on the missing field | **CODE-PENDING** — owning spec M1'-SPEC §6 (M1' must emit `kleinFlipState` on the harmonic profile); cycle-2 closure tranche needed for the profile field. |
| M2.04 | "Cymatic surface is the visible Chladni standing-wave" derived from the bus | §1 commitment 3 + §6 + §10 tests for deterministic Chladni from real grids; cymatics is a *module* within M2', not its identity | `vimarsha_reading.rs` produces both streams; m2.h defines `M2_TO_M3_CYMATIC_PROJECTION[72]` masks | `meaning-packet.ts:251-271` `buildStandingWavePoints` deterministically generates 72-sample wave from `audioOctet × nodalQuartet × address72`; widget renders deterministic-stylised wave | **ALIGNED** (visual sufficiency — "deterministic stylised" register matches the spec's "deterministic numeric nodal lines before GPU"). |
| M2.05 | "Dual cymatic registers: cosmic-facing + personal-Pratibimba #4.4.4.4 reading same bus; personal blocked outside M4'" | §2 dual-cymatic-registers; §6 personal register requires Vimarśa bus live; §10 tests block personal outside M4' | No substrate distinction — same audio_octet/nodal_quartet for any consumer | `renderM2CymaticFrame` enforces `scope === 'personal-pratibimba'` blocked with reason "personal-Pratibimba cymatic rendering requires protected-m4"; `M2CymaticScope = 'cosmic-public' | 'protected-m4' | 'personal-pratibimba'` | **ALIGNED** |
| M2.06 | "Symbolic correspondences are graph edges, not hardcoded tables (M0-2' relation-web)" | §3 backend contract: S2 graph law supplies planetary/chakral/musical correspondences; §10 readiness blocks defaults | `Idea/Bimba/Map/datasets/parashakti-deep/relations.json` carries 271 matches for the named relation families (Decan-Level Divine, Chaldean Decan Rulership, Spanda Rhythmic Pulsation, Quantum Field Operation, Modal-Harmonic Resonance, Ananda Vortex, Traditional Planetary Rulership, etc.); seed data exists | `meaning-packet.ts:23-30` defines `M2S2CorrespondencePayload { decanFace?, sacredSonic?, planetaryChakral?, earthObserverHandle? }` but values arrive as `Record<string, unknown>` from outside; `frameOrPending` treats absence as pending; **no kernel-bridge / graph-services adapter call wired** | **SPEC-AHEAD** — substrate seed exists, Theia contract awaits S2 graph-services adapter (cycle-2 Track 02). |
| M2.07 | "Ficinian-Kerykeion routing protocol: `F_routing(intent, kerykeion_state, time)` → planetary hour → decan → Shem pair → maqam → mantra → 72-state → DET → M3 → emissions" | §9.1–9.4 names Kerykeion @ `Body/S/S0/epi-cli/src/nara/wind.rs` and `Body/S/S4/ta-onta/S4-3p-chronos/S3'/kairos-python-adapter.ts`; §10 routing-trace tests | Kerykeion CLI is landed substrate (referenced by spec). **No `f_routing` function in portal-core or anywhere routable**; six axes exist as LUTs but no traversal function chains them | `meaning-packet.ts:32-37` defines `M2KerykeionRuntimePayload { worldClockHandle?, planetaryHourRuler?, transitHandle? }`; `packetBlockers` declares "Track 03 Kerykeion/world_clock provenance missing"; no actual F_routing call in widget | **DOC-AHEAD** — UX doc + spec §9 describe a full traversal; substrate has LUTs but no chained `F_routing` carrier; Theia awaits a kernel-bridge `routing` method. Cycle-3 landing tranche needed. |
| M2.08 | "Parashakti serves Nara: M4-1 somatic/transit · M4-2 oracle/angels/maqam/mantra · M4-3 Klein-flip · #4.4.4.4 personal cymatic" | §2 + UX doc §8.1; M4'-SPEC §5/§7/§16.2 cross-reference; `nara::medicine` shares DECAN_BODY_PARTS/DECAN_HERBS/PLANET_CHAKRA LUTs | `portal-core/src/nara_journal.rs` exists; LUT sharing with `nara::medicine` per spec, but cymatic→Nara routing not wired in code | `m2-parashakti-widget.tsx` has no Nara-bridge contract; deposit-handle emission absent | **DOC-AHEAD** — cross-extension `M4' deposit handle` and the `Q_composed` personal-quaternion daimon over solar field are integrated-plugin (4-5-0) work, not the m2 extension alone. Cycle-3 integration tranche needed (likely in 4-5-0 plugin closure). |
| M2.09 | "Venus carries the 9:8 epogdoon — the beauty-operator that compresses 72→64" | §8.5 Planet LUT row Venus carries 9:8; §9.5 names Earth observer-ground; m2.h `m2_epogdoon_compress(val)= (val*8)/9` baked | m2.h:269-548 — full `M2_PLANET_LUT[10]` + `m2_epogdoon_compress`/`m2_epogdoon_expand` integer transforms + `M2_TO_M3_CYMATIC_PROJECTION[72]` masks. Substrate complete. | `meaning-packet.ts:147-151` packs `detEvidence { source: 'profile.mahamaya/profile.binary', finalClassificationAuthority: 'M3/M3-prime' }`; uses `payload.mahamaya.m2VibrationIndex` for the address view, but does not compute the 9:8 projection itself | **ALIGNED** (M2' renders evidence; M3'/M3 classifies — clean handoff). |
| M2.10 | "Earth observer-ground is the embodied side of the M2→M3 bridge — not decorative" | §9.5 Earth-as-observer-ground is required; §10 test: M2-5' exposes 9:8 + Earth observer as separate required facts; §9.8 open question on Sun-identity-root vs Earth-observer | m2.h includes Sun as identity root (row 0 of `M2_PLANET_LUT[10]`); Earth listed as `EarthBodyState` separate from PlanetState; **no surfaced `earthObserverHandle`** in profile | `meaning-packet.ts:140-146` `planetaryChakralFrame` records `earthObserverHandle: input.s2?.earthObserverHandle ?? null` and emits `planetCountDecision: 'pending-DCC-03'` | **CONTRADICTION (DCC-03)** — Spec §9.8 explicitly holds this open: production mapping of 10-entry LUT vs Sun-as-identity-root vs Earth-observer-handle. Cycle-3 decision-register entry. |
| M2.11 | "M2 = frequency-space; M3 = matter; M2' produces frequency space, M3' classifies as codon-rotation" | §0 commitment 3: M2' does NOT classify codons; M3'/M3'-SPEC §7 owns codon class; §9.8 §M2→M3 symbolic finality open | `codon_rotation_projection.rs` is the M3-owned classifier; `vimarsha_reading.rs` imports `codon_rotation_from_lens_mode` to seed audio (not to classify) | `meaning-packet.ts:147` `detEvidence.finalClassificationAuthority: 'M3/M3-prime'` declares boundary explicitly | **ALIGNED** |
| M2.12 | "M2PrimeMeaningPacket is the canonical frequency-to-meaning annotation/handoff atom" | §4.1 mandates `index72`, `address_views`, `mef_semantic_frame`, `elemental_medium_frame`, `planetary_chakral_frame`, `sacred_sonic_frame`, `maqam_mode_frame`, `cymatic_signature`, `m3_projection_evidence`, `provenance`, `pending_fields`; §4.2 S5 surface field `m2_meaning_packet` on candidate DTO | No substrate-side packet builder; profile fields used as inputs only | `meaning-packet.ts:69-93` `M2PrimeMeaningPacket` shape implements every field; contract version `'2026-06-01.07-T5'`; builder enforces missing-field errors per §4.2; `Object.freeze` enforces immutability; observability events `m2.meaning_packet` + `m2.routing_trace` emitted | **ALIGNED** (Theia owns this packet shape, cycle-2 T0 landed it). |
| M2.13 | "Tuning-aware music-tech bridge: maqam needs MPE/MIDI 2.0/MTS-ESP/Scala/OSC (12-TET MIDI insufficient)" | §2 surface bullet; §10 readiness test for real tuning conversion | No MIDI/MPE adapter in `portal-core` or `Body/S/S0`; `M2_MAQAM_DESC[72]` has 24-TET interval patterns in `.rodata` but no synth bridge | No `m2-parashakti` widget MIDI/MPE binding | **CODE-PENDING** — owning spec M2'-SPEC §2; integration blocker is the absent MIDI-2 / MTS-ESP adapter on S0. Cycle-3 names this as a deferred integration carrier, not a greenfield rebuild. |
| M2.14 | "Mantra LUT is 50 Matrika + 50 Malini = 100 (96 active + 4 control), spanning 144 Hz Muladhara → 432 Hz Sahasrara — the chakra-activation gradient" | §8.4 explicit; m2.h `M2_MANTRA_LUT[100]`; UX doc §3 enumerates "Mantra entry M2-4 50+50=100" alongside the 72-axes (it is NOT a 72-axis) | m2.h:472-476 declares `M2_MANTRA_FREQ_MIN=144`, `M2_MANTRA_FREQ_MAX=432`, `M2_MANTRA_FREQ_BASE=256`, `Mantra_Entry_Desc[100]` (`_Static_assert(sizeof==8)`) | No mantra-frequency panel in widget; `sacredSonicFrame` is a pending generic record | **SPEC-AHEAD** — substrate complete; surface doesn't decode the LUT into a mantra-panel. |
| M2.15 | "84-state `(lens, mode)` is the M1' overlay that M2-1' reads — NOT the 72; `16+1` belongs to M3" | §2 register disambiguation; m2.h enforces `12×6=72` (not 84); 84 is `12 lenses × 7 modes` from M1' landscape | `kernel.rs` `MathemeLensMode::new(lens, mode)` is the 84-state; `vimarsha_reading.rs` reads from it | Theia widget consumes `payload.lensMode` for `lensModeFrame` | **ALIGNED** |
| M2.16 | UX doc §3 lists seven enumerated rows "MEF · Tattva · Decan · Shem · Maqam · Mantra · Planetary" — one more than the canonical six-axes framing of the 72 | §0 + §8 carry the resolved framing: **six** addressing-axes of 72 (MEF, tattva, decan, Shem, maqam, planetary); mantra is a sonic overlay at 100 (not a 72-axis); Asma'ul-Husna is 99+1 with 36:64 split | m2.h carries six 72-cardinality LUTs (`M2_MEF_DESC[72]`, decan `[72]`, Shem `[72]`, maqam `[72]`, `M2_TO_M3_CYMATIC_PROJECTION[72]`) + planet LUT `[10]` (not 72) — so even "six axes onto 72" is uneven in practice (planetary `[10]` addresses 72-space via decan-link, not as 72-cardinality) | `meaning-packet.ts:50-54` `M2AddressView['name']` enum is **six**: `mef`, `tattva-phase`, `decan-face`, `shem-asma`, `maqam`, `det-projection` — but `shem-asma` collapses Shem and Asma'ul-Husna (which is 99+1, not 72) into one name | **CONTRADICTION (the "17th-lens-shaped" question for M2)** — UX-doc enumeration drifts to seven; spec resolves to six; Theia collapses Shem+Asma into one address-view; planetary is 10 not 72. Cycle-3 decision: ratify "six axes of 72 + 2 sonic overlays (mantra 100, asma 99+1) + 10 planetary keyings" as canonical, downgrade UX-doc 7-row table to 6-axes-plus-overlays. |
| M2.17 | UX doc §6 "the 12 MEF lenses pair into 6 tritone-mirror pairs (Lens N ↔ Lens N+3)" | §7 of spec restates: 6 tritone-pairs (0,3) (1,4) (2,5) + primed; per `ql-musical-derivation §6` | No `tritone_pair` or `klein_pair_for_lens(n)` helper in portal-core; M1' must compute and emit the crossing signal | Widget `surfaceValence` flips on `kleinFlipState` but pair logic is M1' authority | **SPEC-AHEAD** — M1'-SPEC owns pair table; need M1' to emit the signal (CODE-PENDING for M2.03). |
| M2.18 | "Cl(4,2) algebra runs at four scales: M1 ring · M3 codon · M4 personal · Kerykeion natal" — UX doc §8.1 "personal-quaternion and codon/cosmic-quaternion share the same Cl(4,2) algebra" | M2'-SPEC inherits this via cross-spec deps (M1'-SPEC, M3'-SPEC, M4'-SPEC); `alpha_quaternionic_integration_across_M_stack.md` is dep | `portal-core/src/quaternion.rs`, `codon.rs`, `mahamaya.rs`, `personal_identity.rs` all exist; is it ONE algebra or four separate impls? — not verified by this matrix's scope (kernel-bridge agent's call) | Out of M2 widget scope | **DEFER to Wave-B kernel-bridge agent** — flag as cross-cutting verification: `grep -r "Cl(4,2)\|cl42\|geometric_product" Body/S/S0/portal-core/src` and `cargo check -p portal-core`. |

---

## Anomalies

### CONTRADICTION

- **C-M2.10 (DCC-03 planet-count semantics).** Spec §9.8 holds open: `M2_PLANET_LUT[10]` includes Sun-as-identity-root and treats Earth as `EarthBodyState` (separate from PlanetState); UX doc and §9.5 require Earth as observer-ground for the M2→M3 9:8 bridge; the meaning-packet emits `planetCountDecision: 'pending-DCC-03'`. **Decision needed:** Sun-included identity-root + Earth-observer-handle dual semantics, or unify into 10 + observer?
- **C-M2.16 (UX seven-axes vs canonical six-axes — "17th-lens-shaped" for M2).** UX doc §3 enumerates seven rows; spec §0/§8 resolves to **six axes of 72** with mantra (100) and Asma'ul-Husna (99+1) as overlays and planet LUT (10) as a non-72-cardinality keying. **Decision needed:** ratify "six 72-axes + sonic overlays" as canon; downgrade UX-doc seven-row table to six + overlays; collapse-or-split `'shem-asma'` Theia address view (it currently fuses two distinct invariants — 8×9=72 Shem vs 99+1 Asma).
- Latent: the `+1 parent` invariant — spec §0/§10 affirm "72 term of `137 = 64 + 72 + 1` *without assigning the +1 to M0*"; nothing in UX or substrate or surface contradicts this for M2. **No M2-local contradiction here** (this guards against drift; OK).

### CODE-PENDING (named with owning spec + unblocking contract)

- **CP-M2.03 `kleinFlipState` profile field.** Owner: M1'-SPEC §6 (M1' emits Klein-flip on tritone-pair crossing). Contract: add `klein_flip_state: KleinFlipState` to `MathemeHarmonicProfile` in `kernel.rs`; `vimarsha_reading.rs` does not need to compute it (M1' is the producer); m2.rs widget consumes via `payload.kleinFlipState`. **Unblocks:** §7 Klein-flip operative architecture, §10 round-trip flip-return test, and the UX-doc §6 "instrument plays meanings, not tones" claim.
- **CP-M2.13 Tuning-aware MIDI/MPE/MTS-ESP adapter.** Owner: M2'-SPEC §2. Contract: a `music_tech` adapter crate under `Body/S/S0/portal-core` exposing maqam interval patterns as MPE or MTS-ESP `.scl/.kbm` or MIDI 2.0 note-with-tuning events. **Unblocks:** §10 "real tuning conversion (MPE/MTS-ESP/Scala/OSC)" test.

### ORPHAN (no current owner)

- **O-M2.07 `F_routing` carrier.** Spec §9.2 names the chained traversal (planetary-hour ruler → active decan → Shem pair → maqam → mantra → 72-state → DET → emissions); UX doc §7 promises it; m2.h has every LUT it needs; no named function or carrier exists in `portal-core` or `Body/S/S4/ta-onta` to compose them. **Proposed owner:** the M2-1' Vimarśa kernel (extend it), or a new carrier `Body/S/S0/portal-core/src/parashakti/f_routing.rs` named explicitly in cycle-3.
- **O-M2.06 S2-graph→Theia correspondence adapter.** Spec §3 + Theia `meaning-packet.ts:23-30` define the payload shape; no graph-services adapter exposes `s2.decanFace`/`s2.sacredSonic`/`s2.planetaryChakral`/`s2.earthObserverHandle` to the kernel-bridge yet. **Proposed owner:** Wave-B integrated-bimba-graph agent; for M2, name the bridge method `kernelBridge.s2.parashaktiCorrespondences(address72, decan, planetCount)`.

---

## Proposed Cycle-3 Tranches (3.x-M2)

Cycle 2 substrate inheritance baseline: `Body/S/S0/epi-lib/include/m2.h` (six LUTs landed), `Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs` (M2-1' Vimarśa landed), `Body/M/epi-theia/extensions/m2-parashakti/` (packet builder + cymatic frame landed). All cycle-3 tranches consume these as-is — no substrate rebuild.

### Tranche 3.1-M2 — Klein-flip profile field closure (CODE-PENDING)

- **Classification:** code-pending-closure
- **Owning spec:** M1'-SPEC §6 (producer); M2'-SPEC §7 (consumer surface)
- **Cycle 2 substrate inheritance:** `vimarsha_reading.rs`, `meaning-packet.ts` `kleinFlipFrame` consumer already wired.
- **Deliverable:** add `klein_flip_state` field to `MathemeHarmonicProfile` in `Body/S/S0/portal-core/src/kernel.rs`; have M1' tick projection populate it; add round-trip test (flip on Lens N→N+3 crossing; flip back on N+3→N).
- **Verification:** `cargo check -p portal-core` and `cargo test -p portal-core --test klein_flip_round_trip`; `grep -n "klein_flip_state" Body/S/S0/portal-core/src/kernel.rs` returns ≥1 hit.

### Tranche 3.2-M2 — F_routing carrier landing (ORPHAN-fill / DOC-AHEAD)

- **Classification:** doc-ahead-landing (also no-orphan-fill)
- **Owning spec:** M2'-SPEC §9.2
- **Cycle 2 substrate inheritance:** all six LUTs in m2.h + Kerykeion CLI at `Body/S/S0/epi-cli/src/nara/wind.rs` + planet/decan/shem/maqam/mantra `.rodata` already landed; this is method-routing closure, not new substrate.
- **Deliverable:** named carrier `Body/S/S0/portal-core/src/parashakti/f_routing.rs` exposing `fn f_routing(intent: Intent, kerykeion: KerykeionState, t: KernelTick) -> RoutingTrace { planetary_hour_ruler, active_decan, shem_pair, maqam_family, maqam_mode, mantra_index, asma_name, index72, det64 }`; widget consumes via kernel-bridge as `m2.routing_trace` (the observability event slot already exists in `meaning-packet.ts:168-182`).
- **Verification:** `test -f Body/S/S0/portal-core/src/parashakti/f_routing.rs`; `cargo check -p portal-core`; trace test that for a fixed (intent, kerykeion, time) yields a deterministic `RoutingTrace` and the `index72` round-trips through all six axis views.

### Tranche 3.3-M2 — Six-axes address-view decoder (SPEC-AHEAD)

- **Classification:** spec-ahead-integration
- **Owning spec:** M2'-SPEC §0 + §8 + §10 "all packet address views round-trip through `[0, 71]` for MEF, tattva/phase, decan/face, Shem, maqam, and DET projection views"
- **Cycle 2 substrate inheritance:** `meaning-packet.ts` already emits 6 stub `M2AddressView`s; m2.h LUTs already decode each axis.
- **Deliverable:** replace the six identical `addressView(..., 'profile.resonance72.lensAnchorIndex')` calls (lines 220-228) with per-axis decoders sourcing from each LUT (MEF `M2_MEF_DESC[72]`, tattva `[36][2]`, decan `M2_DECAN_DESC[72]`, Shem `M2_SHEM_DESC[72]`, maqam `M2_MAQAM_DESC[72]`, DET via `M2_TO_M3_CYMATIC_PROJECTION[72]`); decode through a kernel-bridge method `m2.decodeAxisAt(address72, axis)`.
- **Verification:** `grep -c "sourceField: 'profile.resonance72" Body/M/epi-theia/extensions/m2-parashakti/src/common/meaning-packet.ts` returns 1 (only the MEF axis); five other axes have distinct `sourceField` entries; per-axis round-trip test.

### Tranche 3.4-M2 — S2 graph-correspondence Theia adapter (SPEC-AHEAD / ORPHAN-fill)

- **Classification:** spec-ahead-integration (also no-orphan-fill for O-M2.06)
- **Owning spec:** M2'-SPEC §3 backend contract + §3.1 of UX doc; substrate seed `Idea/Bimba/Map/datasets/parashakti-deep/` already populated.
- **Cycle 2 substrate inheritance:** the Theia payload contract (`M2S2CorrespondencePayload`) already exists; only the bridge method is missing.
- **Deliverable:** name the kernel-bridge method `s2.parashaktiCorrespondences(address72) → { decanFace, sacredSonic, planetaryChakral, earthObserverHandle }` and have the integrated `1-2-3` plugin call it; ensure `s2.provenanceHandle` is populated to unblock `packetBlockers` line 294.
- **Verification:** `grep -n "parashaktiCorrespondences" Body/M/epi-theia/extensions/kernel-bridge/src/`; widget `pendingFields` no longer includes `s2.decanFace`/`s2.sacredSonic`/`s2.earthObserverHandle` on a routed packet; integration test against the parashakti-deep dataset.

### Tranche 3.5-M2 — DCC-03 decision: planet-count + Earth-observer semantics (CONTRADICTION)

- **Classification:** contradiction-decision
- **Owning spec:** M2'-SPEC §9.5 + §9.8; UX doc §8.1
- **Cycle 2 substrate inheritance:** `M2_PLANET_LUT[10]` + `EarthBodyState` already exist.
- **Deliverable:** decision-register entry in cycle-3 tranche `13-decision-register.md` resolving Sun-as-identity-root vs Earth-as-observer-ground vs planet-count semantics. Recommend: keep `M2_PLANET_LUT[10]` (Sun included as identity root), add `earth_observer_handle` as a separate kernel-bridge field (NOT a planet-LUT row), document the 9 non-Sun planets × 8 chakras 9:8 epogdoon explicitly.
- **Verification:** user final-validation marker in decision register; downstream `planetCountDecision: 'pending-DCC-03'` removed from `meaning-packet.ts:145`.

### Tranche 3.6-M2 — "Six axes of 72 + overlays" canonicalisation (CONTRADICTION)

- **Classification:** contradiction-decision (the M2 17th-lens-shaped question)
- **Owning spec:** UX doc §3 (drifts to seven), M2'-SPEC §0/§8 (resolves to six axes of 72 + mantra-100 + asma-99+1 + planet-10 keying)
- **Cycle 2 substrate inheritance:** m2.h carries six 72-cardinality LUTs + mantra-100 + asma-99+1 + planet-10; the asymmetry is baked.
- **Deliverable:** decision-register entry ratifying "**six addressing-axes of 72** (MEF, tattva, decan, Shem, maqam, DET-projection) **+ two sonic overlays** (mantra 100, Asma'ul-Husna 99+1) **+ planetary keying via decan-link** (`M2_PLANET_LUT[10]`)" as canon. Downgrade UX doc §3 enumeration's seventh row (mantra) from "axis" to "overlay". Split Theia `'shem-asma'` `M2AddressView` into `'shem'` (72) and `'asma'` (99+1 with mask-routing).
- **Verification:** UX doc §3 patched to six-axes-plus-overlays; `meaning-packet.ts:50-54` `M2AddressView['name']` enum has `'shem'` and `'asma'` as separate entries; round-trip tests cover the asymmetry.

### Tranche 3.7-M2 — Tuning-aware music-tech bridge (CODE-PENDING, deferred)

- **Classification:** code-pending-closure (deferred to a later wave; named here so it does not become an orphan)
- **Owning spec:** M2'-SPEC §2 + §10
- **Cycle 2 substrate inheritance:** `M2_MAQAM_DESC[72]` 24-TET interval patterns already in `.rodata`.
- **Deliverable:** named integration blocker — `Body/S/S0/portal-core/src/music_tech.rs` (MPE / MTS-ESP / Scala emitter for maqam intervals). Do NOT rebuild; flag as integration carrier.
- **Verification:** decision-register or follow-on tranche reference; not executed in cycle-3 unless promoted.

### Tranche 3.8-M2 — Nara deposit-handle wiring (DOC-AHEAD, cross-extension)

- **Classification:** doc-ahead-landing (cross-extension; routed to integrated 4-5-0 plugin closure)
- **Owning spec:** M2'-SPEC §9.2 emissions list; M4'-SPEC §5/§7/§16.2; UX doc §8
- **Cycle 2 substrate inheritance:** `nara_journal.rs` exists; `nara::medicine` LUT-sharing established; the M4' deposit handle is part of the integrated `4-5-0` recognition plugin.
- **Deliverable:** ensure the F_routing trace (Tranche 3.2-M2) emits a deposit handle consumed by the M4' Nara surface; verify via the integrated `4-5-0` plugin's M4-1/M4-2/M4-3 / `#4.4.4.4` consumption path. Most of this lands in the cross-cutting plugin closure, but M2-side must emit the handle.
- **Verification:** `grep -n "deposit_handle\|m4.deposit" Body/S/S0/portal-core/src/parashakti/f_routing.rs` after 3.2-M2 lands; integration test that M4' journal receives the handle.

---

## Notes for the controller

- **No greenfield ownership proposed.** Every tranche above consumes landed substrate (m2.h, vimarsha_reading.rs, the meaning-packet builder, the parashakti-deep dataset) and only fills named gaps (klein_flip_state field, F_routing carrier, axis-decoder method, S2-bridge adapter) or makes contradictions decidable.
- **Wave-B handoff (kernel-bridge agent):** verify `kleinFlipState` is the M1' producer's responsibility and lives on `MathemeHarmonicProfile`; verify Cl(4,2) is one algebra at four scales (M1 ring / M3 codon / M4 personal / Kerykeion natal) — `grep -r "Cl(4,2)\|geometric_product\|cl42" Body/S/S0/portal-core/src`.
- **Wave-B handoff (integrated-bimba-graph agent):** the parashakti-deep dataset has 271 typed-relation matches across Decan/Shem/Maqam/Planet/Modal/Spanda/Quantum-Field/Ananda families; verify these are loaded into Neo4j with `:Bimba` label + `coordinate` property (per memory note) and that S2 graph-services exposes `parashaktiCorrespondences(address72)`.
- **Wave-B handoff (Theia shell / surface-hosting agent):** the `m2-parashakti` extension is landed (package.json + lib/ + src/ all present); verify `extension-contract preflight` includes m2's PRIVACY_CLASS and EXTENSION_ID; verify the integrated `1-2-3` cosmic-engine plugin composes M1'+M2'+M3' through the kernel-bridge.
