# Canon Audit: M2-parashakti

**Auditor scope:** Cycle-3 Tranche 03 (M2 Paraśakti reconciliation) plus M2-touching rows of Tranche 10 (kernel-bridge profile-contract) and Tranche 18 (typed kernel-bridge JSON edge); DR rows DR-M2-1, DR-M2-2, DR-M2-3, DR-KB-1, DR-IG-5.
**Audit date:** 2026-06-03

## Authoritative sources read

- Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md (both pages: lines 0-505, 506-668)
- Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md (430 lines)
- Idea/Bimba/Seeds/M/M2'/m2-prime-parashakti-cymatic-engine.md (600 lines)
- Idea/Bimba/Seeds/M/M2'/m2-prime-frequency-meaning-research.md (608 lines)
- Idea/Pratibimba/System/Subsystems/Parashakti/parashakti-ux-full-m2-branch.md (249 lines)
- Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/03-m2-parashakti-reconciliation.md
- Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/10-kernel-bridge-profile-contract.md
- Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/18-typed-kernel-bridge-json-edge.md
- Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/wave-a-m2-reconciliation-matrix.md
- Idea/Bimba/Seeds/M/M2'/M2-ARCHITECTURE.md (735 lines, both pages)

## Per-row audit

### T03-headnote — "72-invariant well-grounded; chief gaps F_routing + S2 adapter"
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:40-42 (72-invariant statement); Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:30 (vimarsha_reading.rs anchor); 13-decision-register.md:412-420 (DR-M2-3 confirms F_routing carrier ownership as closure of landed substrate, not new substrate)
- **Current framing in tranche:** "harmonic-correspondential instrument well-grounded; chief gaps are F_routing carrier and S2 graph-correspondence adapter."
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Headnote tracks SPEC + DR-M2-3 verbatim. No drift.

### T03-totalshape — "M2-ARCHITECTURE.md is total-shape; profile-bus projections ParashaktiMeaningProjection + EarthObserverHandle per 10.M2"
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M2'/M2-ARCHITECTURE.md:174-184 (profile-bus contract section); Idea/Bimba/Seeds/M/M2'/M2-ARCHITECTURE.md:240-313 (ParashaktiMeaningProjection + EarthObserverHandle proposed structures); 13-decision-register.md:66-74 (DR-M2-1 substrate ratification)
- **Current framing in tranche:** Total-shape document is M2-ARCHITECTURE.md; profile-bus projections ParashaktiMeaningProjection and EarthObserverHandle land per 10.M2.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** ARCHITECTURE doc and DR-M2-1 agree that Earth-observer surfaces as a separate handle (not a planet-LUT row). Total-shape framing matches SPEC §9.5.

### T03-vimarsha-window — "M2-1' is the canonical writer at vimarsha_reading.rs:17-93; M1 reads"
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:24 (Vimarsha as primary audio-genesis surface); Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:73 (M2-1' performs Vimarśa reading at portal-core/src/parashakti/vimarsha_reading.rs); Idea/Bimba/Seeds/M/M2'/M2-ARCHITECTURE.md:144-170 (substrate writer anchors)
- **Current framing in tranche:** M2-1' is the canonical writer; M1 reads, never re-derives.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Matches SPEC §0/1 commitments + §3 backend contract.

### T03-m2-m3-epogdoon — "M2↔M3 epogdoon 9:8 PASSES"
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:354-358 (§9.5 9:8 epogdoon = 72×8/9=64); 13-decision-register.md:254-260 (DR-KB-1 substrate canonicality)
- **Current framing in tranche:** M2↔M3 epogdoon bridge passes.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Substrate already canonical per DR-KB-1.

### T03.1 — Klein-flip profile field closure
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:89 (§4 lists kleinFlipState as required profile field); Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:132-154 (§7 Klein-flip operative architecture); 13-decision-register.md:308-318 (DR-IG-2 Klein-flip event unification, three-variant union)
- **Current framing in tranche:** M1' (Track 02.2) produces klein_flip on MathemeHarmonicProfile; kernel-bridge (Track 10.2) emits it; M2' consumes. Round-trip flip-return test.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Consistent with both SPEC §4/§7 and ratified DR-IG-2. Tranche 18.2 consolidates landing as `Option<KleinFlipEvent>` discriminated union.

### T03.2 — F_routing carrier landing
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:298-326 (§9.2 routing function signature + traversal chain); 13-decision-register.md:410-420 (DR-M2-3 ratification of carrier ownership + signature)
- **Current framing in tranche:** Author Body/S/S0/portal-core/src/parashakti/f_routing.rs with exact signature `f_routing(intent, kerykeion, t) -> RoutingTrace { planetary_hour_ruler, active_decan, shem_pair, maqam_family/mode, mantra_index, asma_name, index72, det64 }`.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Signature exactly matches DR-M2-3 ratified resolution; anti-greenfield closure over six landed LUTs is canonical.

### T03.3 — Six-axes address-view decoder
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:382 (§10 round-trip test: all six axes round-trip through [0,71]); Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:262-280 (§8.6 cross-axis simultaneity); 13-decision-register.md:78-86 (DR-M2-2 six axes)
- **Current framing in tranche:** Replace six identical addressView stubs with per-axis decoders via kernel-bridge `m2.decodeAxisAt(address72, axis)`. Per-axis round-trip test.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Matches SPEC §10 readiness criterion and DR-M2-2 cardinality discipline.

### T03.4 — S2 graph-correspondence Theia adapter
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:74 (§3: S2 graph law supplies configurable planetary/chakral/musical correspondences); Idea/Pratibimba/System/Subsystems/Parashakti/parashakti-ux-full-m2-branch.md:116-120 (§5 relation-web: correspondences live in graph as typed edges, not hardcoded tables)
- **Current framing in tranche:** Kernel-bridge method `s2.parashaktiCorrespondences(address72)` returning {decanFace, sacredSonic, planetaryChakral, earthObserverHandle}.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Matches §3 backend contract and UX §5 graph-edge principle.

### T03.5 — Decision: planet-count + Earth-observer semantics (DCC-03)
- **Status:** CONTRADICTS-RATIFIED-DR
- **Cited:** 13-decision-register.md:66-74 (DR-M2-1 ratified resolution: 10 planets total INCLUDING Earth-as-centre; Earth IS the 10th planet; "Already resolved at the C/Rust substrate level — M2_PLANET_LUT[10] is canon"); 13-decision-register.md:254-260 (DR-KB-1 consolidates the substrate canonicality)
- **Current framing in tranche:** "Recommend: keep M2_PLANET_LUT[10] (Sun as identity root) + separate earth_observer_handle kernel-bridge field (NOT a planet-LUT row); document 9 non-Sun × 8 chakras 9:8 epogdoon explicitly."
- **Canon framing (if not ALIGNED):** Per DR-M2-1 (VALIDATED 2026-06-02): "10 planets total including Earth-as-centre. Earth IS the 10th planet — the centre of the map and centre of the clock. The 9:8 epogdoon is 9 non-Earth planets to 8 chakras; Earth as observer-centre is structurally the 10th." Substrate `M2_PLANET_LUT[10]` is canon as written (per 13-decision-register.md:68). The tranche's "9 non-Sun" framing is wrong — the canon is 9 non-Earth (Sun is included; Earth IS the centre/10th). Cited: 13-decision-register.md:68-70.
- **Recommendation:** REWRITE
- **Recommendation detail:** Drop the "Sun as identity root + separate earth_observer_handle row" framing. Replace with the DR-M2-1 ratified semantics: Earth IS the 10th planet (centre of map and clock); the 9:8 epogdoon is the ratio of 9 non-Earth planets to 8 chakras. Strip `planetCountDecision: 'pending-DCC-03'` from `meaning-packet.ts:145`; document Earth-at-centre in `M2'-SPEC §9.5` + cymatic-engine companion (per DR-M2-1 Action). NO new kernel-bridge field for Earth-observer is needed beyond what DR-M2-1 + DR-KB-1 already settle.

### T03.6 — Decision: six axes of 72 + overlays canon (M2 17th-lens question)
- **Status:** ALIGNED
- **Cited:** 13-decision-register.md:78-86 (DR-M2-2 ratified six 72-axes (MEF/tattva/decan/Shem/maqam/DET-projection) + two sonic overlays (mantra-100, Asma'ul-Husna 99+1) + planetary keying via decan-link; split Theia shem-asma into shem and asma); Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:69 (register disambiguation: 12×6=72 canonical; 16+1 belongs to M3 Mahāmāyā lens-stack); Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:264-276 (§8.6 cross-axis correspondence)
- **Current framing in tranche:** Decision-register entry ratifying six addressing-axes of 72 + two sonic overlays + planetary keying via decan-link; downgrade UX §3 seventh row (mantra) from axis to overlay; split shem-asma M2AddressView into shem and asma.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Exactly tracks DR-M2-2's ratified Action. UX §3 already lists mantra outside the 72-bracket (parashakti-ux-full-m2-branch.md:71 enumerates mantra as 50+50=100, not 72), so the patch tightens an already-substantially-aligned UX row.

### T03.7 — Tuning-aware music-tech bridge (deferred CODE-PENDING)
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:66 (§2 surface bullet: MPE, MIDI 2.0, MIDI Tuning Standard / Scala, MTS-ESP, OSC required for canonical maqam rendering); Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:388 (§10 test: MIDI/music-tech uses real event streams and real tuning conversion)
- **Current framing in tranche:** Named integration blocker; `M2_MAQAM_DESC[72]` 24-TET interval patterns already in .rodata; flagged not executed in cycle-3 unless promoted.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** SPEC explicitly names the tuning standards; tranche correctly defers rather than greenfields.

### T03.8 — Nara deposit-handle wiring
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:318-323 (§9.2 routing emissions list explicitly names "deposit handle → M4' journal session"); Idea/Pratibimba/System/Subsystems/Parashakti/parashakti-ux-full-m2-branch.md:152-158 (UX §7 emits deposit handle into Nara journal); Idea/Pratibimba/System/Subsystems/Parashakti/parashakti-ux-full-m2-branch.md:161-170 (UX §8 Parashakti serves Nara binding)
- **Current framing in tranche:** F_routing trace (3.2) emits an M4' deposit handle consumed by Nara surface.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Matches SPEC §9.2 emission list and UX §7-§8.

### T10-headnote (M2-relevant rows) — "MathemeHarmonicProfile substantially landed"
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M2'/M2-ARCHITECTURE.md:174-185 (profile-bus already exposes audio_octet, nodal_quartet, elements, planetary_chakral); Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:80-89 (§4 required MathemeHarmonicProfile fields)
- **Current framing in tranche:** Tranche 10 is canonical cycle-3 profile-field ledger.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Aligns with SPEC §4.

### T10.2 — Land MathemeHarmonicProfile.klein_flip + bridge JSON emit
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:89 (§4 required kleinFlipState field); 13-decision-register.md:308-318 (DR-IG-2 three-variant KleinFlipEvent union ratified)
- **Current framing in tranche:** Add klein_flip field to MathemeHarmonicProfile; populate from vimarsha_reading.rs; emit at kernel_bridge_runtime.rs:615-622.
- **Recommendation:** AUGMENT
- **Recommendation detail:** Tighten so the type is `Option<KleinFlipEvent>` (the DR-IG-2 three-variant discriminated union), not plain `bool`. Tranche 18.2 consolidates this — add a cross-link note to 18.2.

### T10.3 — DR-KB-1 planetary projection LUT cardinality
- **Status:** CONTRADICTS-RATIFIED-DR
- **Cited:** 13-decision-register.md:254-260 (DR-KB-1 VALIDATED: M2_PLANET_LUT[10] is canon; "9:8 epogdoon = 9 non-Earth planets × 8 chakras; Earth-as-centre is the 10th planet"; "Tranche 10.3 downgrades to doc-ahead-landing"); 13-decision-register.md:66-74 (DR-M2-1 underlying ratification)
- **Current framing in tranche:** "Register the choice carried forward from M2 DCC-03 so cycle-4 can extend MathemePlanetaryChakralProjection::from_diatonic at kernel.rs:664-736. Current code: 8 bodies via 7-degree diatonic + Pluto fallback. M2'-SPEC §9.5: 10-planet + Earth-observer."
- **Canon framing (if not ALIGNED):** Per DR-KB-1, Tranche 10.3 has DOWNGRADED to doc-ahead-landing (no new bridge field needed). The substrate (`M2_PLANET_LUT[10]` with Earth-as-centre as the 10th) is already canon; the ledger row should document Earth-at-centre and note the downgrade. "10-planet + Earth-observer" phrasing in the tranche frames Earth as a separate handle on top of 10 planets, which contradicts DR-M2-1's "Earth IS the 10th planet". Cited: 13-decision-register.md:254-256, 66-70.
- **Recommendation:** REWRITE
- **Recommendation detail:** Rewrite as doc-ahead-landing per DR-KB-1 Action: keep `MathemePlanetaryChakralProjection::from_diatonic` at 9×8 with Earth as centre-of-map; document Earth-at-centre in the readiness ledger row; do NOT introduce a separate `earth_observer_handle` profile field. Remove the "10-planet + Earth-observer" framing.

### T10.M2 — M2' Profile Projections (parashakti_meaning + earth_observer_handle)
- **Status:** WRONG-FRAMING
- **Cited:** 13-decision-register.md:66-74 (DR-M2-1 Earth IS 10th planet, no separate observer handle needed at substrate level); 13-decision-register.md:254-260 (DR-KB-1 consolidates: no bridge field change)
- **Current framing in tranche:** "Two new fields: `parashakti_meaning: ParashaktiMeaningProjection` ... `earth_observer_handle: EarthObserverHandle` (DR-M2-1 substrate-validated; bus surface pending — Earth-at-centre observation point for 9:8 epogdoon rendering)."
- **Canon framing (if not ALIGNED):** `parashakti_meaning` is canonical (six-axis decoders + cymatic frame + meaning-packet state are SPEC §4.1 packet + §8 axes). But `earth_observer_handle` as a SEPARATE profile-bus field contradicts DR-M2-1's "Earth IS the 10th planet" + DR-KB-1's "no bridge field change". Earth-at-centre is a RENDERING semantics on the existing `planetary_chakral` projection, not a new typed handle. Cited: 13-decision-register.md:70 (DR-M2-1 Action explicitly says "NO kernel-bridge field changes"); 13-decision-register.md:256 (DR-KB-1: "No bridge field change").
- **Recommendation:** REWRITE
- **Recommendation detail:** Keep `parashakti_meaning: ParashaktiMeaningProjection` (DR-M2-2 + DR-M2-3 backed; six-axis decoders + F_routing trace + DET projection per SPEC §4.1/§8/§9). Drop the separate `earth_observer_handle: EarthObserverHandle` field. Document Earth-at-centre semantics either as a derived sub-field of `planetary_chakral` (e.g., `is_observer_centre: bool` flag at the Earth row) OR purely as a rendering-time semantic per DR-M2-1 Action. Verification grep should be `grep -n "Earth.*centre\|10th planet" Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md` per DR-M2-1 Verification, not `grep -n earth_observer_handle`.

### T18-headnote — "Eight separate profile-bus and kernel-bridge surface additions consolidated"
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M2'/M2-ARCHITECTURE.md:240-245 (profile-bus gap enumeration); 13-decision-register.md:308-318 (DR-IG-2 typed Klein-flip event)
- **Current framing in tranche:** Single most leveraged cycle-3 cleanup; typed JSON edge.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Consolidation strategy matches landed substrate.

### T18.2 — Land klein_flip and KleinFlipEvent together (M2-touching)
- **Status:** ALIGNED
- **Cited:** 13-decision-register.md:308-318 (DR-IG-2 three-variant KleinFlipEvent: M1TritoneCrossing / M2CymaticValenceInvert / M3CodonRotationCross at kernel-bridge level); Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:132-154 (§7 enumerates M2-side enactments per panel)
- **Current framing in tranche:** Add `klein_flip: Option<KleinFlipEvent>` populated from vimarsha_reading.rs; three-variant discriminated union at portal-core/src/events.rs.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Matches DR-IG-2 SSOT and SPEC §7.

### T18.4 — Per-domain typed projections, M2 row
- **Status:** WRONG-FRAMING
- **Cited:** 13-decision-register.md:66-74 (DR-M2-1 no separate Earth-observer field); 13-decision-register.md:254-260 (DR-KB-1 no bridge field change)
- **Current framing in tranche:** "`ParashaktiMeaningProjection` + `EarthObserverHandle` (M2)"
- **Canon framing (if not ALIGNED):** Same issue as T10.M2: ParashaktiMeaningProjection is canonical, but `EarthObserverHandle` as a separate typed projection contradicts DR-M2-1 / DR-KB-1. The Earth-at-centre semantics ride inside `planetary_chakral` (or as a planet-row flag), not as a sibling projection. Cited: 13-decision-register.md:70 ("NO kernel-bridge field changes").
- **Recommendation:** REWRITE
- **Recommendation detail:** Remove `EarthObserverHandle` from the typed projection list. Keep `ParashaktiMeaningProjection` carrying the six-axis decoders + F_routing trace + DET64 + Klein-flip handle. Earth-at-centre is a documented semantic in the planetary axis view, not a separate type.

### T18.5 — Composition projections (M2-touching via cosmic_composition_state + dipyramid)
- **Status:** ALIGNED
- **Cited:** 13-decision-register.md:350-360 (DR-IG-5 cymatic surface pinned to torus inside cosmic composition); 13-decision-register.md:364-382 (DR-IG-6 dipyramid + Hopf-linked tori with corrected 6+6=12 geometry); Idea/Bimba/Seeds/M/M2'/M2-ARCHITECTURE.md:541-549 (§7.6 cymatic IS the surface texture of the K² played-torus in composition)
- **Current framing in tranche:** Three composition projections including `CosmicCompositionState` and `PsychoidFieldProjection` (dipyramid + Hopf-linked tori per DR-IG-6).
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Composition-pinning of cymatic to torus is DR-IG-5 verbatim; dipyramid terminology is DR-IG-6 ratified. Tranche correctly references the corrected 6+6 geometry by DR id rather than re-stating it. (Audit note: anywhere in implementation that the dipyramid is rendered, it must be the 6+6 = 12 positions form per DR-IG-6, not the deprecated "6 vertices = 6 QL positions" form.)

### Wave-A matrix M2.01 — One 72-invariant, six addressing-axes
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:40 (commitment 1); Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:160-181 (§8 enumerates the six 72-fold sub-systems including 10 maqam families totalling 72 modes)
- **Current framing in matrix:** Six-axes substrate carried; Theia surface is stub (SPEC-AHEAD).
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Aligns with SPEC §0 + §8.

### Wave-A matrix M2.02 — M2-1' is audio-genesis writer
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:24 (M2-1' MEF lenses read the cloud); Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:73 (vimarsha_reading.rs)
- **Current framing in matrix:** Aligned per spec.
- **Recommendation:** KEEP-AS-IS

### Wave-A matrix M2.03 — Klein L↔L' meaning-flip
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:89 (kleinFlipState required); Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:132-154 (§7 surface valence inversion on every panel); 13-decision-register.md:308-318 (DR-IG-2 ratified)
- **Current framing in matrix:** CODE-PENDING; owning spec M1'-SPEC §6.
- **Recommendation:** KEEP-AS-IS

### Wave-A matrix M2.04 — Cymatic Chladni surface
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:62 (cymatic surface from M2-1' 8+4 bus); Idea/Bimba/Seeds/M/M2'/m2-prime-parashakti-cymatic-engine.md:398-411 (Chladni equation primitive)
- **Current framing in matrix:** Aligned (deterministic stylised wave register).
- **Recommendation:** KEEP-AS-IS

### Wave-A matrix M2.05 — Dual cymatic registers (cosmic + personal-Pratibimba)
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:63 (dual cymatic registers); Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:120 (§5 privacy boundary)
- **Current framing in matrix:** Aligned; Theia enforces protected-m4 scope block.
- **Recommendation:** KEEP-AS-IS

### Wave-A matrix M2.06 — Correspondences as graph edges (M0-2' relation-web)
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:74 (§3 S2 graph law); Idea/Pratibimba/System/Subsystems/Parashakti/parashakti-ux-full-m2-branch.md:116-120 (§5 relation-web)
- **Current framing in matrix:** SPEC-AHEAD; awaits S2 graph-services adapter.
- **Recommendation:** KEEP-AS-IS

### Wave-A matrix M2.07 — F_routing protocol
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:298-326 (§9.2 routing function); 13-decision-register.md:410-420 (DR-M2-3 carrier ownership)
- **Current framing in matrix:** DOC-AHEAD pre-DR-M2-3; cycle-3 landing tranche named.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Already ratified by DR-M2-3 since matrix authoring; carrier signature matches exactly.

### Wave-A matrix M2.08 — Parashakti serves Nara
- **Status:** ALIGNED
- **Cited:** Idea/Pratibimba/System/Subsystems/Parashakti/parashakti-ux-full-m2-branch.md:161-170 (§8 four-channel binding); Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:318-323 (§9.2 emission to M4' journal)
- **Current framing in matrix:** DOC-AHEAD cross-extension.
- **Recommendation:** KEEP-AS-IS

### Wave-A matrix M2.09 — Venus carries 9:8 epogdoon
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:260 (§8.5 Venus carries 9:8 epogdoon); Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:354-358 (§9.5 9:8 explicit)
- **Current framing in matrix:** Aligned, M2' renders evidence, M3' classifies.
- **Recommendation:** KEEP-AS-IS

### Wave-A matrix M2.10 — Earth observer-ground
- **Status:** CONTRADICTS-RATIFIED-DR
- **Cited:** 13-decision-register.md:66-74 (DR-M2-1 VALIDATED: Earth IS the 10th planet — centre of the map and centre of the clock; M2_PLANET_LUT[10] is canon)
- **Current framing in matrix:** "CONTRADICTION (DCC-03) — Spec §9.8 explicitly holds this open: production mapping of 10-entry LUT vs Sun-as-identity-root vs Earth-observer-handle. Cycle-3 decision-register entry."
- **Canon framing (if not ALIGNED):** No longer contradiction. DR-M2-1 has resolved it (2026-06-02 user-validated): "10 planets total including Earth-as-centre. Earth IS the 10th planet." `M2_PLANET_LUT[10]` is canon with Earth as the 10th row (semantically at centre); the 9:8 ratio is 9 non-Earth to 8 chakras. SPEC §9.8 open-question text is itself stale post-DR. Cited: 13-decision-register.md:68-70.
- **Recommendation:** REWRITE
- **Recommendation detail:** Update matrix M2.10 status from CONTRADICTION to ALIGNED-POST-DR-M2-1; remove the "Sun-identity-root vs Earth-observer-handle dual semantics" framing; cite DR-M2-1 as the ratification.

### Wave-A matrix M2.11 — M2 = frequency-space; M3 = matter
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:42 (M2' does not classify codons; M3'/M3'-SPEC §7 owns); Idea/Pratibimba/System/Subsystems/Parashakti/parashakti-ux-full-m2-branch.md:97-113 (§4 M2 = frequency-space, M3 = Matter)
- **Current framing in matrix:** Aligned, clean handoff.
- **Recommendation:** KEEP-AS-IS

### Wave-A matrix M2.12 — M2PrimeMeaningPacket canonical
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:93-110 (§4.1 packet shape); Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:114-116 (§4.2 S5 surface ownership)
- **Current framing in matrix:** Aligned; Theia owns shape per cycle-2 T0.
- **Recommendation:** KEEP-AS-IS

### Wave-A matrix M2.13 — Tuning-aware music-tech bridge
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:66 (§2 surface bullet); Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:388 (§10 test)
- **Current framing in matrix:** CODE-PENDING deferred.
- **Recommendation:** KEEP-AS-IS

### Wave-A matrix M2.14 — Mantra LUT 50+50 = 100
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:222-241 (§8.4 Mantra LUT); 13-decision-register.md:78-86 (DR-M2-2 mantra-100 is a sonic overlay, NOT a 72-axis)
- **Current framing in matrix:** SPEC-AHEAD; mantra is overlay per spec.
- **Recommendation:** KEEP-AS-IS

### Wave-A matrix M2.15 — 84-state (lens, mode) is M1' overlay; 16+1 belongs to M3
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:69 (register disambiguation); 13-decision-register.md:114-122 (DR-M3-3: 16+1 Mahamaya lens-stack is M3'-domain)
- **Current framing in matrix:** Aligned.
- **Recommendation:** KEEP-AS-IS

### Wave-A matrix M2.16 — Six addressing-axes + overlays canonicalisation
- **Status:** ALIGNED
- **Cited:** 13-decision-register.md:78-86 (DR-M2-2 ratified); Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:69 (register disambiguation)
- **Current framing in matrix:** CONTRADICTION → cycle-3 decision row; now ratified by DR-M2-2.
- **Recommendation:** AUGMENT
- **Recommendation detail:** Update matrix M2.16 status from CONTRADICTION to ALIGNED-POST-DR-M2-2; cross-link to DR-M2-2 ratified Action.

### Wave-A matrix M2.17 — Tritone-mirror lens-pairs
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:136-138 (§7 six tritone-mirror lens-pairs per ql-musical-derivation §6)
- **Current framing in matrix:** SPEC-AHEAD M1' owns pair table.
- **Recommendation:** KEEP-AS-IS

### Wave-A matrix M2.18 — Cl(4,2) at four scales
- **Status:** ALIGNED
- **Cited:** Idea/Pratibimba/System/Subsystems/Parashakti/parashakti-ux-full-m2-branch.md:171-174 (UX §8.1: personal-quaternion and codon/cosmic-quaternion share same Cl(4,2) algebra); 10-kernel-bridge-profile-contract.md:74-78 (Tranche 10.7 audits one-algebra identity)
- **Current framing in matrix:** Defer to Wave-B kernel-bridge agent.
- **Recommendation:** KEEP-AS-IS

## Drift patterns observed

The dominant drift in the M2-parashakti slice is **stale "Sun-as-identity-root + separate Earth-observer-handle" framing surviving in three downstream rows after DR-M2-1 ratification**. Tranche 03.5 still proposes the dual-semantics resolution that DR-M2-1 explicitly rejected; Tranche 10.3 (DR-KB-1 carrier row) frames Earth as a separate handle on top of 10 planets; Tranche 10.M2 and 18.4 list `EarthObserverHandle` as a separate typed projection alongside `ParashaktiMeaningProjection`. DR-M2-1 (validated 2026-06-02) is unambiguous: "Earth IS the 10th planet — the centre of the map and centre of the clock. Already resolved at the C/Rust substrate level — M2_PLANET_LUT[10] is canon. NO kernel-bridge field changes." The Wave-A matrix M2.10 also still reads as CONTRADICTION even though the same matrix authored DCC-03 which DR-M2-1 then closed.

A second, smaller drift: SPEC §9.8's "Open Questions" block (M2'-SPEC.md:368-373) still text-frames planet-count as open, even though DR-M2-1 has closed it. Per DR-M2-1's Action ("document Earth-at-centre semantics in M2'-SPEC §9.5 + the cymatic-engine companion"), §9.8 should also be revised to remove the planet-count item.

Otherwise the tranche set tracks canon tightly: the six addressing-axes (DR-M2-2), F_routing carrier signature (DR-M2-3), Klein-flip three-variant union (DR-IG-2), cymatic-pinned-to-torus in composition (DR-IG-5), and Vimarsha-window contract (M2-1' writes / M1' reads) all align with their ratified sources. The dipyramid reference in Tranche 18.5 correctly defers geometry to DR-IG-6 by id, avoiding the deprecated 6-vertex form. The matheme spine (`137 = 64 + 72 + 1` with +1 = M1-5, never M0) is honoured.

## Tranche augmentation / removal / addition recommendations

- **REMOVE:** Tranche 03.5's "Sun-as-identity-root + separate earth_observer_handle kernel-bridge field" recommendation. Replace with the DR-M2-1 verification action: strip `planetCountDecision: 'pending-DCC-03'` from `meaning-packet.ts:145`; document Earth-at-centre in M2'-SPEC §9.5 and the cymatic-engine companion. Cited: 13-decision-register.md:70.
- **REMOVE:** `earth_observer_handle: EarthObserverHandle` from Tranche 10.M2's two-field list. Keep `parashakti_meaning: ParashaktiMeaningProjection` only. Earth-at-centre is a documented semantic on the planetary axis view, not a separate typed projection. Cited: 13-decision-register.md:70, 256.
- **REMOVE:** `EarthObserverHandle` from Tranche 18.4's M2 row of typed projections, for the same reason. Cited: 13-decision-register.md:70.
- **REWRITE:** Tranche 10.3 from "register the choice" to doc-ahead-landing per DR-KB-1: document Earth-at-centre in the readiness ledger row; keep `MathemePlanetaryChakralProjection::from_diatonic` at 9×8 with Earth as centre-of-map; no bridge field change. Cited: 13-decision-register.md:254-260.
- **AUGMENT:** Tranche 10.2 — explicit type should be `Option<KleinFlipEvent>` (DR-IG-2 three-variant), not `bool`. Add cross-link to Tranche 18.2 as the consolidation site. Cited: 13-decision-register.md:308-318.
- **AUGMENT:** Wave-A matrix rows M2.10 and M2.16: update statuses from CONTRADICTION to ALIGNED-POST-DR-M2-1 and ALIGNED-POST-DR-M2-2 respectively; cross-link the ratified DR ids.
- **ADD:** New Tranche 03.9 — "SPEC §9.8 open-questions cleanup". Per DR-M2-1's Action: rewrite M2'-SPEC §9.8 to remove the planet-count item now that DR-M2-1 has closed it (and update §9.5 with Earth-at-centre semantics). Cited: 13-decision-register.md:70 (Action wording: "document Earth-at-centre semantics in M2'-SPEC §9.5").

## Open questions for user

- **Mantra/maqam active-synthesis target.** SPEC §9.8 (Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:372) holds open whether mantra/maqam frequencies become active synthesis targets vs canonical correspondence/tuning data only. The cycle-3 tranches defer this (Tranche 03.7 deferred CODE-PENDING) which is consistent with the spec leaving it open. Per the audit discipline, this is genuinely undecided in canon; the deferred CODE-PENDING classification is correct, and no audit row needs to force resolution.

- **CouplingFlowAlignment register on the M3 row, M2-touching aspect.** Tranche 18.4 lists `CouplingFlowAlignment` as an optional inspector payload (per DR-M3-5). This crosses M2's surface only via the matheme-skeleton `64 + 72 + 1 = 137` and the `64 / 36 = (4/3)^2` skeleton. Canon (Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md:40) commits to the 72 in `137 = 64 + 72 + 1` and DR-M3-5 (13-decision-register.md:138-146) ratifies the disciplined attribution surface. No drift here; flagging only to confirm the audit found no M2-side conflict.
