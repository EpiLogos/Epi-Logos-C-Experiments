# Wave A — M1 Paramaśiva Reconciliation Matrix

**Subsystem:** M1 — Paramaśiva (the engine + instrument: ring, tick, K², Cl(4,2), 84-state, Hopf, Klein flip)
**Task ID:** wave-a-m1
**Date:** 2026-06-02
**Reconciliation method:** four-way trace UX-doc ↔ M' Seed ↔ Body/S substrate ↔ Body/M epi-theia extension; classify each load-bearing claim.

## Sources Consulted

- **Corpus 1 (UX doc):** `Idea/Pratibimba/System/Subsystems/Paramasiva/paramasiva-ux-full-m1-branch.md` (189 LOC, full)
- **Corpus 2 (Seeds):**
  - `Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md` (380 LOC, full)
  - `Idea/Bimba/Seeds/M/M1'/m1-prime-paramasiva-instrument.md` (head + structural §§0/1, 1; long-form companion)
  - `Idea/Bimba/Seeds/M/M1'/m1-prime-audio-generative-research.md` (head + integration seams + open questions)
  - `Idea/Bimba/Seeds/M/M1'/physical-pole-stack-architecture.md` (frontmatter + §§0/1, 1, 2 — tick/torus/Bevy)
- **Corpus 3 (Body/S substrate):**
  - `Body/S/S0/epi-lib/include/m1.h` — `ANANDA_BIMBA`, `ANANDA_PRATIBIMBA`, `SPANDA_SEED_BITS`, `TORUS_GENUS`, `DOUBLE_COVER_DEG`, `RING_QUATERNION_LUT[12]`, `CL42_BASIS[6]`, `QL_TRIG_TABLE[6]`, static asserts (landed)
  - `Body/S/S0/portal-core/src/kernel.rs` — `MathemeHarmonicProfile` (line 346) with `tick12`, `degree720`, `lens_mode`, `resonance72`, `audio_octet[8]`, `nodal_quartet[4]`, `conjugate_form_character` (landed)
  - `Body/S/S0/portal-core/src/harmonic_profile.rs` — 14-LOC re-export module pointing at `crate::kernel` (canonical-shape facade landed)
  - `Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs` — `vimarsha_read_profile(tick, lens_mode)` writing both `audio_octet` and `nodal_quartet` (Vimarsha read of Prakāśa cloud — landed)
  - `Body/S/S0/portal-core/src/hopf.rs` — `hopf_project`, `hopf_fiber`, `validate_quaternion_unity`, `get_topological_element_count` (landed)
  - `Body/S/S0/portal-core/src/quaternion.rs` — `quat_mul`, `quat_normalize`, `derive_walk_mode`, `derive_bifurcation` (landed)
  - `Body/S/S0/portal-core/src/spanda.rs` (presence confirmed by `ls`)
- **Corpus 4 (Theia surface):** `Body/M/epi-theia/extensions/m1-paramasiva/`
  - `package.json` — `@pratibimba/m1-paramasiva` v0.1.0 declares "First-slice priority: Profile clock instrument with 84-state walk, exact audio bus consumption, and typed relation-walk evidence"
  - `src/common/index.ts` — `EXTENSION_ID='m1-paramasiva'`, `PRIMARY_VIEW_ID='m1.paramasiva.clockInstrument'`, `ALL_VIEW_IDS=[clockInstrument, kleinTopology, audioBusInspector]`, `PRIVACY_CLASS='public_current_audio_metadata_only'`, `OBSERVABILITY_EVENT_TYPES=['m1.walk.step','m1.klein_flip.source']`, `DECLARED_BLOCKERS=['Track 01 profile fields and audio bus','Track 02 typed harmonic pointer relation descriptors','M1/M2 authority split on audio-genesis must stay explicit in UI provenance']`, `TRACK_08_EXPORTS=['M1WalkStrip','M1TopologyMiniView']`
  - `src/common/clock-instrument.ts` — `M1ProfileClockModel` with `landscape` (12×7=84), `audioBus` ({audioOctetHz, nodalQuartet, exactProfileSource, authority:'S0/S2 profile bus'}), `topology` ({doubleCoverDeg, torusGenus, hopfIdentity, k2TritoneCrossing, m1OriginKleinFlip, parentAttribution, priorGround, downstreamDoubleTorus, source}), `relationWalkBlockers()` checks audio_octet / nodal_quartet / typed relations
  - `src/browser/m1-paramasiva-extension-body.tsx` — renders profile clock, 84-state landscape, lens-mode, CF/VAK projection, audio bus, topology pane; falls back to "No MathemeHarmonicProfile available yet" when bridge has nothing
- **Reference (cycle-2):** `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-2-canonical/03-m1-paramasiva-extension.md` (T0 played traversal surface; T1 profile-to-performance stream; T2 84-state landscape, pairing families, K²; T3 Cl(4,2)/Klein/inspector depth)

## Anti-greenfield posture

All four corners — `Body/S/S0/epi-lib/include/m1.h`, `Body/S/S0/portal-core/{kernel.rs,hopf.rs,quaternion.rs,parashakti/vimarsha_reading.rs,harmonic_profile.rs}`, `Idea/Pratibimba/System` (now Body/M/epi-theia per memory note), and `Body/M/epi-theia/extensions/m1-paramasiva` — are landed substrate. Cycle-3 tranches consume / audit / extend; first-build is restricted to a named M1 product surface, a named carrier, a method-routing closure, or a named integration blocker.

---

## The Four-Way Matrix

| # | Claim (UX doc) | Spec authority (M1'-SPEC + companions) | Code/substrate evidence | Theia surface | Status |
|---|---|---|---|---|---|
| 1 | M1 (engine) vs M1' (instrument): M1' renders, never invents pitch (UX §2, §0) | M1'-SPEC §0/1 commitment 1 ("M1' never invents pitch — every sounded frequency comes from the shared `MathemeHarmonicProfile`"); audio-genesis "two-layer split", Vimarśa at M2-1' writes the bus | `parashakti/vimarsha_reading.rs::vimarsha_read_profile` produces `audio_octet[8]` + `nodal_quartet[4]`; `MathemeHarmonicProfile` consumes it at `kernel.rs:442-443` | `clock-instrument.ts::audioBus.authority='S0/S2 profile bus'`, `exactProfileSource` flag; extension body falls back to "No MathemeHarmonicProfile available yet" rather than synthesizing | **ALIGNED** |
| 2 | 9/8 epogdoon tick is self-derived from 4:2 ↔ 3:3 partition (UX §6, §4) | M1'-SPEC §9 ("(4/3)×(3/2)=2/1 octave; (3/2)÷(4/3)=9/8 tick"); companion instrument doc §0 chain | `m1.h` `SPANDA_SEED_BITS=0x03`; `QL_Tick` machinery present (m1.h §250); 9/8 ratio not surfaced as a named constant in `harmonic_profile.rs` profile fields | Not directly rendered in current extension body (no 9/8 readout in `M1ProfileClockModel`); topology pane lacks an epogdoon-derivation panel | **DOC-AHEAD** |
| 3 | 84-state `(lens, mode)` = 12 MEF lenses × 7 CF modes is the shared playing surface (UX §8) | M1'-SPEC §7 mandates `profile.lensMode` and round-trippable 84-cell landscape | `kernel.rs:363` `pub lens_mode: MathemeLensMode`; `kernel.rs:411` `vimarsha_read_profile(tick, lens_mode)` keyed on it | `clock-instrument.ts::landscape.totalCells === 84` check; `M1LensModeCell` (lens, mode, cellIndex, label, active); body renders "blocked: profile exposes N cells" when ≠ 84; data-test=`m1-active-lens-mode` | **ALIGNED** |
| 4 | M1-5 is the **+1** in `137 = 64 + 72 + 1`; the +1 parent is M1-5, NOT M0 (UX §9, §5 "the +1 of 137") | M1'-SPEC §1 sub-section "M1-5 As The +1 Of The 137 Architecture": "M0 is the prior ground M1 receives from; M0 is not the +1 term"; §13.6 open-contradiction note still flags residual "M0 Anuttara witness-axis" wording in `alpha_quaternionic_integration_across_M_stack` §1.1 | `m1.h` carries `TORUS_GENUS=1`, `DOUBLE_COVER_DEG=720`, `RING_QUATERNION_LUT[12]` and the Hopf bundle — the +1 substrate is in m1.h, not m0.h | `clock-instrument.ts::topology.parentAttribution`, `priorGround`, `downstreamDoubleTorus` fields exist as explicit attribution slots in the model — the surface is wired to carry the M1-5 attribution but the actual rendered string is not visible in the body excerpt | **CONTRADICTION** (residual M0-witness wording in alpha-paper §1.1 must be downgraded; standing invariant confirms M1-5 is the +1 parent) |
| 5 | M1' uses `audio_octet[8]` + `harmonic.ratio_role`; never re-synthesizes (UX §4, §10) | M1'-SPEC §3 ("M1' uses `audio_octet` to sound the current coordinate; it never computes pitch locally and never owns or re-synthesizes the bus"); §14 test "audio_octet/nodal_quartet consumed match kernel profile values exactly" | `kernel.rs:367-368`: `pub audio_octet: [f32; 8]`, `pub nodal_quartet: [MathemeNodalConstraint; 4]`; written by `vimarsha_reading.rs` lines 13-14, 27-35 | `clock-instrument.ts::audioBus` block reads through; `relationWalkBlockers()` (clock-instrument.ts:294-295) explicitly flags missing `audioOctet` / `nodalQuartet` as Track-01 blockers | **ALIGNED** |
| 6 | Hopf identity `S³ → S² → S¹`; 720° SU(2) double-cover (UX §5) | M1'-SPEC §10 ("The quaternionic state at each ring-position is a point in S³ that double-covers SO(3) rotations of K². The Hopf bundle S³ → S² → S¹ projects from the quaternion through K² to the played phase via `portal-core/src/hopf.rs`"); §14 test asserts `DOUBLE_COVER_DEG=720`, `TORUS_GENUS=1` | `m1.h:526-551` `TORUS_GENUS=1`, `DOUBLE_COVER_DEG=720`, `RING_QUATERNION_LUT[12]` with static assert; `hopf.rs::hopf_project`, `hopf_fiber`, `validate_quaternion_unity`, `get_topological_element_count`; `quaternion.rs::quat_mul/normalize/derive_walk_mode/derive_bifurcation` | `clock-instrument.ts::topology.doubleCoverDeg`, `torusGenus`, `hopfIdentity` slots present in `M1ProfileClockModel`; no Hopf inspector widget reads from `hopf.rs` runtime values yet — slots are placeholder strings | **SPEC-AHEAD** (substrate present + slot present; the live Hopf identity readout from runtime is not yet wired to a `kleinTopology` view) |
| 7 | Klein-flip is visible at Lens N ↔ Lens N+3 tritone crossings; M1' is *origin* of the flip that M2' consumes (UX §5, M1'-SPEC §6 "Klein-Flip Visibility on Tritone Crossing") | M1'-SPEC §6, §10, §14 test "Klein-flip indicator fires precisely at Lens N ↔ Lens N+3 crossings and not at other lens transitions" | No Klein-flip event emitter in `kernel.rs`/`vimarsha_reading.rs` excerpts; the `MathemeHarmonicProfile` does not expose a `klein_flip` field by name; `conjugate_form_character` is the closest landed signal | `OBSERVABILITY_EVENT_TYPES` declares `'m1.klein_flip.source'`; `clock-instrument.ts::topology.k2TritoneCrossing` and `m1OriginKleinFlip` slots exist; second view id `m1.paramasiva.kleinTopology` reserved; **no emitter wires runtime flips to the event yet** | **CODE-PENDING** (named blocker: `klein_flip` field on `MathemeHarmonicProfile` + detector inside `vimarsha_reading.rs`; the contract slot is landed both sides) |
| 8 | Cl(4,2) algebra: 4 explicate (+1) + 2 implicate (−1), `4·(+1)+2·(−1) = +2` signature; each QL position carries a trig identity (UX §6, M1'-SPEC §11) | M1'-SPEC §11 ("Cl(4,2) is the substrate-algebra that all higher layers inherit … M1's 720° SU(2) double-cover lives in Cl(4,2)"); §13.5 names `CL42_BASIS`, `QL_TRIG_TABLE` as substrate authority | `m1.h:629-664`: `CL42_BASIS[6]` with static assert; `QL_TRIG_TABLE[6]` with static assert; the +2 signature partition encoded; `quaternion.rs` provides SU(2)/Cl(4,2) math | Inspector depth (cycle-2 T3) referenced but not visible in `M1ProfileClockModel`; no Cl(4,2) inspector widget surfaces the trig identity per position | **SPEC-AHEAD** |
| 9 | The 6 pairing-families (A/B/C within-helix + D1/D2/D3 Klein-crossing); "three squares" are derived C ∪ D1 (UX §6, M1'-SPEC §12) | M1'-SPEC §12 names the universal pairing-grammar; matches 3:3 partition (1,2,3 physical-pole ↔ 4,5,0 mental-pole) | No pairing-family enum in the `kernel.rs` profile struct as surfaced; the pairing-grammar lives in spec text + planned S2 typed pointer relation descriptors | Extension `DECLARED_BLOCKERS` includes "Track 02 typed harmonic pointer relation descriptors"; `clock-instrument.ts::relationWalkBlockers()` line 297 explicitly flags missing relation descriptors | **CODE-PENDING** (S2 typed harmonic pointer relations are the named blocker that unblocks pairing-family rendering) |
| 10 | M1-1' (Instance Manager) ↔ S1/Obsidian vault alignment: the coordinate IS the file structure; vault writes go through Hen (UX §7) | M1'-SPEC §1 stratum table names M1-1' as "mutable session-state: current walk, (lens, mode), current coordinate"; UX claim about Hen-mediated writes lives in Nara/Epii docs, not M1'-SPEC | No M1-1'-side vault-write integration in M1 substrate code; S1/Hen is an S-stack concern | Extension does not yet route vault writes; M1-1' instance lifecycle not exposed as a Theia command beyond `m1.startWalk` / read-only / deposit-only | **DOC-AHEAD** (UX makes S1 alignment claim that M1'-SPEC under-specifies for M1' side; landing requires a named carrier — Hen — and a documented contract edge to S1, not a build) |
| 11 | The `(0/1) = raw #` is wired at every coordinate's `invert: Inversion_Operator` field (UX §10, M1'-SPEC §0/1 commitment 2) | M1'-SPEC §0/1 commitment 2 — single session-held Psychoid_Hash per `S0-HARMONIC-POINTER-WEB36-SPEC`; §14 test "(0/1) wiring: when the user inverts the current coordinate, the invocation reaches the single session-held inversion-operator" | `m1.h:250` `SPANDA_SEED_BITS=0x03` (both poles fused at seed) is the substrate-side single `#`; the `Inversion_Operator` typedef is described in `CLAUDE.md` Coordinate struct; runtime invocation surface not yet visible in the M1 portal-core excerpts | No `invert` UI affordance visible in `M1ProfileClockModel`; the bottom-up wire from extension UI → kernel `#` operator is not exposed by current bridge selectors | **CODE-PENDING** (the single `#`/`Inversion_Operator` runtime carrier needs a named owner; M1'-SPEC §14 readiness test depends on it) |
| 12 | The deterministic `MPrimePerformanceEvent` stream is the first production artifact (audio-research file §"Operational Surface Summary"; M1'-SPEC §6, §13.1) | M1'-SPEC §6 ("the first production-ready artifact is a deterministic profile-to-performance event stream"); §13.1 "Profile-to-Performance Stream"; audio-research file specifies frame shape `M1PrimeAudioFrame` and the `MPrimePerformanceEvent` envelope | `kernel.rs:276` exposes contract string `"MathemeHarmonicProfile.public-current"`; `Body/S/S0/epi-cli/src/gate/kernel_bridge_runtime.rs::m1_performance_event_from_profile` is referenced by M1'-SPEC §3 (file not yet verified in this pass) | Extension `OBSERVABILITY_EVENT_TYPES=['m1.walk.step','m1.klein_flip.source']` declares the surface event types; replay path / event envelope not visible in widget body | **SPEC-AHEAD** (contract bridge event named in spec; surface event names landed; verification that `kernel_bridge_runtime::m1_performance_event_from_profile` exists + tests is the closing tranche) |
| 13 | M1 audio bus is `audio_octet[8]` (8 explicate-sung positions) + `nodal_quartet[4]` (4 implicate-nodal positions as cymatic boundary conditions) (UX §4, M1'-SPEC §9 "audio_octet are 4+4'") | M1'-SPEC §0/1, §3, §4 fields list; companion instrument §0/1 fixes M2-1' as the bus-writer | `vimarsha_reading.rs::VimarshaReading { audio_octet: [f32; 8], nodal_quartet: [MathemeNodalConstraint; 4] }`; `kernel.rs:367-368, 442-443, 511 (MathemeNodalConstraint struct)` | `clock-instrument.ts::audioBus.audioOctetHz: readonly number[] \| null` and `nodalQuartet: readonly Readonly<Record<string, unknown>>[] \| null`; third view id `m1.paramasiva.audioBusInspector` reserved | **ALIGNED** |
| 14 | The played K² torus visualisation (Klein-double-cover-of-chromatic-fifths-torus) is the visible-and-audible form (UX §5, M1'-SPEC §10) | M1'-SPEC §10 declares K² = T² with bimba↔pratibimba non-orientable identification; Pythagorean comma is the aletheic-evolution slack; M1' renders K² | `m1.h` provides the substrate constants (`TORUS_GENUS=1`, `RING_QUATERNION_LUT`); no K² mesh/renderer code in `portal-core`; physical-pole-stack-architecture.md proposes Bevy + wgpu for the rendering (research draft only) | `clock-instrument.ts::topology.k2TritoneCrossing`, `m1OriginKleinFlip` slots in the model; `ALL_VIEW_IDS` includes `m1.paramasiva.kleinTopology` but the actual played torus 3D surface is not implemented in this Theia/React surface | **DOC-AHEAD** (the played K² torus is the largest "renderer absence" — physical-pole research is a candidate; cycle-3 must either downgrade to a 2D representation or name the K² renderer owner — Bevy/wgpu surface in epi-theia vs. a deferred decision) |
| 15 | "The coordinate system is the file structure" / vault navigation = M1' graph walk (UX §7) | UX §7 paragraph; M1'-SPEC mentions S2 pointer web as relation law of record; cross-claim with Nara/Epii on Hen-mediated writes | S2 pointer web (graph-services) is the relation law of record per M1'-SPEC §3; the bridge between S2 walk and S1 vault file = a method-routing closure, not built | Extension declares blocker "Track 02 typed harmonic pointer relation descriptors"; no S1/vault routing in M1 extension | **DOC-AHEAD** (the UX claim is louder than the spec contract; cycle-3 should either land an M1-1'/S1 routing-closure or downgrade the UX claim) |
| 16 | Audio-research file open question: canonical `MathemeHarmonicProfile` type owner unresolved (S0 `epi-lib` vs `portal-core` vs extracted Rust profile service) | Audio-research §"Open Research Questions"; M1'-SPEC §13.6 open-contradiction note | **Resolved by code as of read date.** `Body/S/S0/portal-core/src/kernel.rs:346` `pub struct MathemeHarmonicProfile { … }`; re-exported by `Body/S/S0/portal-core/src/harmonic_profile.rs` (14-LOC facade with crate-root re-exports). Owner is `portal-core::kernel` with a contract-facade in `harmonic_profile` | Extension imports `MathemeHarmonicProfileBoundary` via `@pratibimba/m-extension-runtime`; consumes through `SharedBridgeAdapter` | **ALIGNED** (research-file question is stale; the code owns the answer — audio-research doc needs a one-line update) |
| 17 | Cl(4,2) runs at four scales (M1 ring · M3 codon · M4 personal · Kerykeion natal) — one algebra, four scales (UX §9, M1'-SPEC §11) | M1'-SPEC §11 explicit four-scale list; standing invariant in kickoff prompt | `m1.h::CL42_BASIS[6]` (M1 ring scale, landed); `portal-core/src/codon.rs` + `codon_rotation_projection.rs` present (M3 codon scale, used at `kernel.rs:5`); `personal_identity.rs` present (M4 personal scale, presence confirmed by `ls`); Kerykeion natal-quaternion projection not visible in M1-side excerpts | Extension has no surface that exhibits the four-scale identity; the `topology` slot in `M1ProfileClockModel` is M1-ring-only | **SPEC-AHEAD** (the four-scale identity is asserted in spec, the substrate has three of four scales co-located in `portal-core/src/`, and the verification "Cl(4,2) is one algebra in code, not four" is exactly the standing-invariant audit the cycle-3 cross-cutting agent owns) |
| 18 | M2-1' Vimarsha reads the Prakāśa cloud and *writes* the audio bus; M1' walks-as-melody (M1'-SPEC §0/1 corrected 2026-05-29; UX §4) | M1'-SPEC §0/1 corrected authority boundary | `parashakti/vimarsha_reading.rs::vimarsha_read_profile(tick, lens_mode) -> VimarshaReading { audio_octet, nodal_quartet }`; called from `kernel.rs:411`, written into profile at `kernel.rs:442-443` | Extension `audioBus.authority='S0/S2 profile bus'`; consumer-only flag respected | **ALIGNED** |

---

## Anomalies

### CONTRADICTION (route to decision register, not to a build)

- **Row 4 — Residual M0-witness wording for the +1 parent.** The standing invariant (and M1'-SPEC §13.6) state the +1 parent is M1-5. `alpha_quaternionic_integration_across_M_stack.md` §1.1 still carries legacy "M0 Anuttara witness-axis" framing. This is a documentation cleanup, not a substrate change. Cycle-3 decision register entry must downgrade the alpha-paper §1.1 wording and route through user final-validation; substrate is already correct (m1.h holds `TORUS_GENUS=1`, `DOUBLE_COVER_DEG=720`, `RING_QUATERNION_LUT[12]`).

### CODE-PENDING (named, not rebuilt)

- **Row 7 — Klein-flip emitter.** Contract slot landed both at `MathemeHarmonicProfile` consumer side (extension `topology.m1OriginKleinFlip`, `OBSERVABILITY_EVENT_TYPES['m1.klein_flip.source']`) and at the spec (M1'-SPEC §6, §14). The missing piece is a `klein_flip` field/event in `vimarsha_reading.rs` or `kernel.rs` firing precisely at Lens N ↔ Lens N+3. **Unblocking contract:** add `klein_flip: Option<KleinFlipEvent>` to `MathemeHarmonicProfile` and detect inside `vimarsha_reading.rs`.
- **Row 9 — S2 typed harmonic pointer relation descriptors.** Both `clock-instrument.ts::relationWalkBlockers()` and `DECLARED_BLOCKERS[1]` name this explicitly. Owning spec: S2'-SPEC. Without typed relations, the 6 pairing-families and "relation = interval" claim cannot be surfaced in route preview.
- **Row 11 — Single session-held `#` (Inversion_Operator) runtime carrier.** M1'-SPEC §14 readiness test names it; substrate root is `SPANDA_SEED_BITS=0x03` in m1.h, but the runtime invocation surface from extension → portal-core `#` operator is not yet a named contract.

### DOC-AHEAD (land it or downgrade)

- **Row 2 — 9/8 self-derivation from 4:2 ↔ 3:3.** UX makes it load-bearing pedagogy; substrate has the constants but no derivation panel. Landing: add a `derivation` slot to `topology` model in `clock-instrument.ts`; data is profile-derivable.
- **Row 10 / Row 15 — S1/Obsidian vault alignment / "coordinate system IS file structure".** UX §7 is strong; M1'-SPEC under-specifies the M1' side. Cycle-3: either name a Hen (S1) carrier with a documented `M1-1' ↔ S1 vault` contract edge, or downgrade the UX §7 claim to "navigational analogy". Note: per the user-memory note, Idea/Pratibimba/System → Body/M/epi-theia has migrated; the "/pratibimba/system" invariant text in the kickoff prompt is now stale and is itself a doc-ahead artifact.
- **Row 14 — The played K² torus 3D surface.** Largest unimplemented UX claim. Physical-pole-stack research proposes Bevy + wgpu; the M1 Theia extension is React/Inversify, not Bevy. Decision needed: 2D K² representation in React (downgrade), or named Bevy/wgpu surface as an epi-theia extension stretch (build owner).

### ORPHAN

- **None identified** in M1. Every load-bearing claim has at least one of {spec authority, substrate code, Theia surface slot}. The S1 vault carrier (Row 10/15) is the closest to orphan but is owned by S1/Hen, not M1.

### ALIGNED (note only)

Rows 1, 3, 5, 13, 16, 18. These cohere cleanly: audio-genesis split (M2-1' writes, M1' consumes), 84-state landscape, `audio_octet`+`nodal_quartet` bus, profile-type ownership, Vimarsha-reading flow. The cycle-3 surface for these is *audit / no rebuild*.

---

## Proposed Cycle-3 Tranches for M1

Tranche numbering uses `2.x` for M1 per the kickoff convention.

### 2.1 — Audit and downgrade residual M0-witness wording (CONTRADICTION decision)

- **Classification:** contradiction-decision
- **Cycle 2 substrate inheritance:** consumes substrate as-is (m1.h `TORUS_GENUS=1`, `DOUBLE_COVER_DEG=720`, `RING_QUATERNION_LUT[12]`); cycle-2 Track 03 T3 already owns Cl(4,2)/Klein/inspector depth
- **Deliverable:** decision-register entry routing `alpha_quaternionic_integration_across_M_stack.md` §1.1 legacy wording to user final-validation; on validation, single-line patch downgrading "M0 Anuttara witness-axis" to "M1-5 (the +1 parent) per M1'-SPEC §1"
- **Verification:** `grep -n "M0 Anuttara witness-axis\|witness-axis" "Idea/Bimba/Seeds/M/alpha_quaternionic_integration_across_M_stack.md"` returns no live-attribution matches after patch
- **Cycle2 inheritance line:** Cycle 2 substrate inheritance: extends cycle 1 mathematical substrate without forcing it into default UI; cycle 2 Track 03 T3 inspector depth covers the rendering side.

### 2.2 — Land `klein_flip` field on `MathemeHarmonicProfile` + emitter in `vimarsha_reading.rs` (CODE-PENDING closure)

- **Classification:** code-pending-closure
- **Cycle 2 substrate inheritance:** consumes `MathemeHarmonicProfile` + `MathemeLensMode` as-is; extends the profile with one new field
- **Deliverable:** add `pub klein_flip: Option<KleinFlipEvent>` (struct fields: `from_lens: u8`, `to_lens: u8`, `tick: u64`, `kind: KleinFlipKind`) to `MathemeHarmonicProfile` in `kernel.rs`; detector logic inside `vimarsha_read_profile` firing precisely at Lens N ↔ Lens N+3 (mod 12); contract test asserting no false positives on other lens transitions
- **Verification:** `cargo check -p portal-core` clean; `cargo test -p portal-core klein_flip` passes; `grep -n "klein_flip" Body/S/S0/portal-core/src/kernel.rs Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs` shows both struct field and detector

### 2.3 — Wire Klein-flip + topology runtime values into the `m1.paramasiva.kleinTopology` view (SPEC-AHEAD integration)

- **Classification:** spec-ahead-integration
- **Cycle 2 substrate inheritance:** extends cycle-2 Track 03 T3 (Cl(4,2)/Klein/inspector depth) using the field from 2.2
- **Deliverable:** populate `M1ProfileClockModel::topology.m1OriginKleinFlip`, `k2TritoneCrossing`, `hopfIdentity`, `doubleCoverDeg`, `torusGenus` from real bridge values (not placeholder strings); render `m1.paramasiva.kleinTopology` as a second widget body consuming the new `klein_flip` event; emit `OBSERVABILITY_EVENT_TYPES['m1.klein_flip.source']` from the React handler on event arrival
- **Verification:** `test -f "Body/M/epi-theia/extensions/m1-paramasiva/src/browser/m1-klein-topology-view.tsx"`; widget test asserts `doubleCoverDeg === 720` and `torusGenus === 1` when bridge supplies them; observability event fires on synthetic profile with `klein_flip = Some(...)`

### 2.4 — Verify `kernel_bridge_runtime::m1_performance_event_from_profile` exists and is consumed (SPEC-AHEAD integration)

- **Classification:** spec-ahead-integration
- **Cycle 2 substrate inheritance:** consumes cycle-1 `MathemeHarmonicProfile` + kernel-bridge landings; cycle-2 Track 03 T1 owns profile-to-performance stream
- **Deliverable:** confirm `Body/S/S0/epi-cli/src/gate/kernel_bridge_runtime.rs::m1_performance_event_from_profile` exists; produce `MPrimePerformanceEvent` shape per audio-research file (event_id, session_id, tick fields, lens, mode, audio_octet_hz[8], nodal_quartet[4], klein_flip, privacy/deposition policy); replay-test asserts deterministic reconstruction from event stream without UI state
- **Verification:** `test -f "Body/S/S0/epi-cli/src/gate/kernel_bridge_runtime.rs"`; `grep -n "m1_performance_event_from_profile" Body/S/S0/epi-cli/src/gate/kernel_bridge_runtime.rs` matches; `cargo test -p epi-cli m1_performance_event_replay` passes

### 2.5 — Surface the single session-held `#` (Inversion_Operator) carrier (CODE-PENDING closure)

- **Classification:** code-pending-closure
- **Cycle 2 substrate inheritance:** consumes `SPANDA_SEED_BITS=0x03` in m1.h as-is; extends bridge surface only
- **Deliverable:** named contract on the M1 kernel-bridge that exposes `invert(coordinate)` as a single session-held operator (no per-coordinate forks); extension affordance reachable from `m1.startWalk`; M1'-SPEC §14 (0/1)-wiring test landed
- **Verification:** `cargo check -p portal-core`; integration test "invert reaches the single session-held operator" passes; extension data-test selector `m1-invert-current-coordinate` round-trips

### 2.6 — Decision: K² played-torus 3D surface owner (DOC-AHEAD decision)

- **Classification:** contradiction-decision (UX vs surface-stack capacity)
- **Cycle 2 substrate inheritance:** consumes `m1.h` torus constants + `quaternion.rs`/`hopf.rs` math as-is; consumes Theia React surface as-is
- **Deliverable:** decision-register entry for user final-validation: option (a) 2D K² representation in React (downgrade UX §5 "played K² torus" to schematic), option (b) named Bevy + wgpu rendering extension as `m1-paramasiva-played-torus` (physical-pole-stack-architecture.md as design seed). Decision either downgrades the UX claim or names a build owner; no work begins until validated
- **Verification:** decision file present at `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md` row "K² played-torus surface owner"; no greenfield build until row marked validated

### 2.7 — Audit the four-scale Cl(4,2) identity (SPEC-AHEAD audit)

- **Classification:** spec-ahead-integration (audit-only)
- **Cycle 2 substrate inheritance:** consumes m1.h `CL42_BASIS[6]`, portal-core `codon.rs`, `codon_rotation_projection.rs`, `personal_identity.rs` as-is
- **Deliverable:** audit document asserting the same `Cl42_Basis_Entry` shape and signature `(+1,+1,+1,+1,−1,−1)=+2` is used at M1 ring, M3 codon, M4 personal scales in portal-core; identify any duplicated definition; name the Kerykeion natal scale owner (likely M4'-SPEC ↔ `personal_identity.rs`)
- **Verification:** `grep -rn "CL42_BASIS\|Cl42_Basis_Entry\|cl42_signature" Body/S/S0/` enumerates exactly one source-of-truth; audit file lists the four scales with their code-path

### 2.8 — Resolve audio-research open question on `MathemeHarmonicProfile` owner (DOC-AHEAD landing)

- **Classification:** doc-ahead-landing (trivial)
- **Cycle 2 substrate inheritance:** consumes substrate as-is — answer already in code at `portal-core::kernel`
- **Deliverable:** one-line update to `m1-prime-audio-generative-research.md` §"Open Research Questions" first item: resolve "Where is the canonical `MathemeHarmonicProfile` type defined" → `Body/S/S0/portal-core/src/kernel.rs:346`, re-exported via `Body/S/S0/portal-core/src/harmonic_profile.rs`
- **Verification:** `grep -n "MathemeHarmonicProfile type defined\|portal-core/src/kernel.rs:346" "Idea/Bimba/Seeds/M/M1'/m1-prime-audio-generative-research.md"` shows resolved attribution

---

## Closing Note

The M1 reconciliation surface is **substrate-rich and surface-shallow**: the engine (m1.h + portal-core kernel/hopf/quaternion/vimarsha_reading) is essentially landed; the M1' instrument surface (the Theia extension) is a scaffold with all the right slot names but most slot values still pending Track-01/Track-02 fills. The largest unsettled item is the played K² torus 3D rendering (Row 14 / Tranche 2.6) — a user-decision, not a build directive. The CONTRADICTION (Row 4) is documentation-only. The CODE-PENDING items (Rows 7, 9, 11) all have one named contract each: `klein_flip` field, S2 typed pointer relations, single `#` runtime carrier.

The 2026-06-02 memory note that `Idea/Pratibimba/System → Body/M/epi-theia` is itself a cycle-3 doc-ahead artifact in the kickoff prompt's "/pratibimba/system" invariant text — flagged for the controller, not owned by M1.
