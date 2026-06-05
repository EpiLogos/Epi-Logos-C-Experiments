# Canon Audit: M4-nara

**Auditor scope:** Tranche 05 (M4 Nara reconciliation, rows 5.1-5.11), M4-touching rows of T10 (10.M4, plus 10.7 four-scale Cl(4,2) audit, 10.4 deposition_anchor, 10.IG psychoid composition) and T18 (18.4 PersonalPoleProjection, 18.5 PsychoidFieldProjection), and DR-M4-1, DR-M4-2 (5 clauses), DR-M4-3, DR-IG-6.
**Audit date:** 2026-06-03

## Authoritative sources read

- Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md (full, both pages, 0-505 + 506-705)
- Idea/Bimba/Seeds/M/M4'/M4'-SPEC.md (401 lines)
- Idea/Bimba/Seeds/M/M4'/m4-prime-psychoid-cymatic-field-engine.md (1157 lines, paginated)
- Idea/Bimba/Seeds/M/M4'/m4-prime-nara-day-episodes-and-oracle-artifacts.md (1084 lines)
- Idea/Bimba/Seeds/M/M4'/m4-prime-nara-activity-graphiti-instrument.md (100 lines + axis lock cited from §0/1)
- Idea/Bimba/Seeds/M/M4'/M4-ARCHITECTURE.md (789 lines, paginated)
- Idea/Pratibimba/System/Subsystems/Nara/nara-ux-full-m4-branch-update.md (lines 1-600 read of 1117 LOC; §§0-4 audited)
- Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/05-m4-nara-reconciliation.md (88 lines)
- Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/wave-a-m4-reconciliation-matrix.md (163 lines)
- Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/10-kernel-bridge-profile-contract.md (151 lines)
- Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/18-typed-kernel-bridge-json-edge.md (161 lines)

(Other dependency files — nara-m4-0-0-birthdate-encoding-spec.md, nara-m4-0-identity-branch-integration-map.md, mental-pole-mechanics.md, m4-prime-nara-integration-research.md, ql-unit-vama-shaktis-vameshvari.md — not opened in full; their load-bearing content is summarised by M4-ARCHITECTURE.md §§1-3 and M4'-SPEC §§7.9-7.13, which were read in full. Findings call out where deeper reading is needed to break a tie.)

## Per-row audit

### Tranche 05 — M4 Nara Reconciliation

### 5.1 — Resonance + Conjugate-Form indicator rendering on Nara surface
- **Status:** ALIGNED
- **Cited:** M4'-SPEC.md:71-77 (§6.5 lean surface), M4'-SPEC.md:234-252 (§7.3 resonance metric), M4-ARCHITECTURE.md:360-364 (§5.1 lean register table)
- **Current framing in tranche:** Extend m4-nara extension to render resonance numeric + ConjugateFormCharacter (Major/Minor/Shadow) per `NaraArtifactEnvelope` and day summary; obey §6.5 anti-quaternion-dump rule.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Substrate is real (`personal_identity.rs:151-175` `PersonalResonance::from_quaternions`; `kernel.rs:486` populates `profile.resonance`). The lean-surface framing matches M4'-SPEC §6.5 and ARCHITECTURE §5.1 exactly.

### 5.2 — Nara DayContainer vault path alignment
- **Status:** ALIGNED (this tranche correctly applies DR-M4-1; tranche itself is a doc patch)
- **Cited:** 13-decision-register.md:164-172 (DR-M4-1 VALIDATED 2026-06-02 — canonical path `${VAULT_ROOT}/Idea/Empty/Present/{day_id}/`)
- **Current framing in tranche:** Path is `${VAULT_ROOT}/Idea/Empty/Present/{day_id}/`; both M4'-SPEC §6.6 (`${VAULT}/Pratibimba/Nara/{day_id}/`) and current extension code (`${vaultRoot}/day/{dayId}/`) are drift to be patched.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Tranche 5.2 correctly cites DR-M4-1's resolution. Note however that M4-ARCHITECTURE.md §2.5 (line 173) and §10 test-criterion 4 still cite `nara-surface.ts:415-417` as "DR-M4-1 compliant" using `Pratibimba/Nara/{dayId}` — this is a STALE ARCHITECTURE-DOC ERROR (see drift-patterns section). The ARCHITECTURE doc disagrees with the ratified DR; SPEC/DR wins.

### 5.3 — Graphiti runtime Nara relations insertion API
- **Status:** ALIGNED
- **Cited:** M4'-SPEC.md:350 (§7.11 — `:HAS_DAY / :CONTAINS_DAILY_NOTE / :PART_OF_DAY / :NEXT_IN_ARC` named); m4-prime-nara-day-episodes-and-oracle-artifacts.md:772-781 (§7.2 the four relations explicit)
- **Current framing in tranche:** Add `nara_insert_relation(day_id, episode_handle, relation)` to `graphiti-runtime` writing the four edges; privacy-class enforcement.
- **Recommendation:** KEEP-AS-IS

### 5.4 — `(q_b, q_p)` Bimba/Pratibimba decomposition of Q_composed
- **Status:** ALIGNED (with substrate correction)
- **Cited:** M4'-SPEC.md:254-275 (§7.3a — bioquaternion is decomposition/reading of Q_composed, NOT independent input); M4-ARCHITECTURE.md:151-163 (§2.5 BioQuaternionState already landed at `kernel.rs:46-59` — corrects Wave-A row 8's claim of "no substrate")
- **Current framing in tranche:** `decompose_bioquaternion(q_composed) -> (q_b, q_p)` on `personal_identity.rs`; unit test proves `(q_b, q_p)` is a READ of Q_composed, not independent input.
- **Recommendation:** AUGMENT
- **Recommendation detail:** Tranche row should cross-reference M4-ARCHITECTURE.md §2.5's correction — `BioQuaternionState` already exists at `kernel.rs:46-59` and feeds `bimba_pratibimba_energy = quat_distance_sq(state.q_b, state.q_p)` at `kernel.rs:1095`. The missing piece is purely the *decomposition function*, not the type. Cite the substrate so cycle-3 doesn't accidentally re-introduce the type.

### 5.5 — Psychoid-cymatic field solver + audio-cymatic driver (minimum-viable)
- **Status:** ALIGNED (with DR-IG-6 cross-reference required)
- **Cited:** M4'-SPEC.md:317-328 (§7.7 — psychoid cymatic field, dipyramid + Hopf-linked tori, local-protected); m4-prime-psychoid-cymatic-field-engine.md:248-285 (§7 geometric scaffold); 13-decision-register.md:364-382 (DR-IG-6 corrected geometry: full 6+6 P/P', NOT "6 vertices = 6 QL positions")
- **Current framing in tranche:** New `portal-core::psychoid_cymatic` module consuming `audio_octet[8]` / `nodal_quartet[4]`; emits opaque renderer handle; Option-F vs Option-S decision.
- **Recommendation:** AUGMENT
- **Recommendation detail:** Tranche row is conceptually correct but does not cite DR-IG-6. The dipyramid geometry MUST be specified as 2 apex poles (P5/P5') + 4 base vertices (P1-4) + 4 inverted base (P1'-4') + central axis-point (P0/P0' as base-square centre projected to both poles), per DR-IG-6 corrected. The psychoid-engine spec at §7.1 lines 253-260 carries the OLD framing ("12 named QL positions ... #0/#0' at centre, #1-#4 on top square, #1'-#4' on bottom square mirrored ... #5/#5' at apexes (quintessence pair)") which is actually mostly correct — but the earlier wording "**Square-base dipyramid** ... 6 vertices + 8 triangular faces + 12 edges" is geometrically inconsistent with placing #1-#4 + #1'-#4' as eight base vertices, and ARCHITECTURE.md §5.3.1 line 388 perpetuates "**Square-base dipyramid (bipyramid)** — 6 vertices (4 equatorial + 2 polar) + 8 triangular faces + 12 edges". The 6-vertex claim at ARCHITECTURE.md:388 CONTRADICTS DR-IG-6. Cite DR-IG-6 and force the substrate spec to enumerate 4-base-square + 4-inverted-base + 2-poles + 1-central-axis-point = **9 distinct topological loci carrying the full 6+6 positions** before solver work begins.

### 5.6 — M4-0 birthdate encoding + six-layer identity branch
- **Status:** ALIGNED
- **Cited:** M4'-SPEC.md:340-347 (§7.10 — M4-0 six-layer branch; baseline = M4-0-0 + M4-0-1 + M4-0-5; absent layers as absent evidence, not fabricated)
- **Current framing in tranche:** Birthdate-encoding module (mod6/inverse, mod12 MEF, lens-square, L2' elemental extraction, caps, evidence paths); absent layers pending, not fabricated.
- **Recommendation:** KEEP-AS-IS

### 5.7 — q_personal baseline + axis-lock + identity-hash + Vāma policy + 0/1 polarity
- **Status:** ALIGNED (DR-M4-2 VALIDATED resolves all five clauses)
- **Cited:** 13-decision-register.md:176-194 (DR-M4-2 all five clauses VALIDATED 2026-06-02)
- **Current framing in tranche:** Single decision-register row resolving M4'-SPEC §7.13's five open questions: (1) q_personal Kerykeion baseline vs integrated; (2) Cl(4,2) axis order; (3) identity-hash migration; (4) Vāma classifier policy; (5) 0/1 cymatic polarity.
- **Recommendation:** AUGMENT
- **Recommendation detail:** Tranche 5.7 should be updated to reflect that DR-M4-2 is VALIDATED with these resolutions: clause 1 — `q_personal` IS the Nara quintessence output (the integrated identity), `Q_identity` is the natal Kerykeion baseline as a component; clause 2 — axis order pinned `[w=Earth, x=Fire, y=Water, z=Air]`; clause 3 — phased migration, both hashes valid during cutover, final state quaternionic; clause 4 — Vāma is computed-mandatory internally, surfaces as insight on request, NEVER auto-raised; clause 5 — 0 = cosmic, 1 = personal (always been). DR-TS-1 cross-links clause 5. Note: per DR-M4-2 clause 1, the tranche should drop the "Kerykeion-only vs integrated" framing — the answer is that `q_personal` IS the integrated Nara quintessence output, not the natal baseline. (Wave-A matrix row 10 — "Kerykeion-only `q_personal` baseline" — is now drift; the substrate today implements only the natal layer, but the DR has reframed which name binds to which form.)

### 5.8 — Period reading trajectory reconstruction
- **Status:** ALIGNED
- **Cited:** M4'-SPEC.md:330-334 (§7.8 temporal-processual reading layer); m4-prime-psychoid-cymatic-field-engine.md:368-410 (§9 temporal-processual integration)
- **Current framing in tranche:** `period_reading(day_range)` API on `nara_journal.rs` reconstructing Q_composed trajectory from Graphiti episodes + Chronos/Kairos + history; preserves privacy; emits Hopf-projected trajectory handle.
- **Recommendation:** KEEP-AS-IS

### 5.9 — Identity-augment proposal lifecycle (M4 side)
- **Status:** ALIGNED
- **Cited:** M4'-SPEC.md:87-94 (§6.7 promotion law one-way and governed; lifecycle `proposed → reviewed → accepted|rejected → applied`; only `applied` mutates `Q_identity`)
- **Current framing in tranche:** Adapter API + state machine; only `applied` mutates Q_identity; Theia hook surfaces pending proposals read-only.
- **Recommendation:** KEEP-AS-IS

### 5.10 — Connectivity-vs-bounded-access discriminator
- **Status:** ALIGNED
- **Cited:** M4'-SPEC.md:383 (§8 readiness — Nara distinguishes raw service connectivity from actual bounded agent access)
- **Current framing in tranche:** Gateway contract test asserting live ping is not a grant of bounded access for `nara.*` methods.
- **Recommendation:** KEEP-AS-IS

### 5.11 — Nara OracleFrame, deck-context, and symbolic-protein integration
- **Status:** ALIGNED
- **Cited:** M4'-SPEC.md:97-176 (§6.8 VAK-framed oracle language; macro/inhabited vs session deck; CP cardinality authority; 1/3/6/inverse/4-5 reading frames; mahamaya_transcription schema); 13-decision-register.md:150-160 (DR-VAK-1 active VAK order CPF/CT/CP/CF/CFP/CS and reading-frame authority)
- **Current framing in tranche:** Extend Nara artifact envelopes + `PatternPacket.mahamaya_transcription` to preserve oracle_frame_ref, symbolic_protein_ref, vak_address, deck_context, sequence_mode, packet refs, review state. Macro-deck = protected long-range; session-deck = local utterance; never mutate M4-0 identity sources.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Framing matches M4'-SPEC §6.8 line-for-line. Verification clause should also assert that `OracleFrame.vak_address.cp[]` is the cardinality authority per DR-VAK-1, not the spread label.

### Track 10 — M4-touching rows

### 10.4 — DR-KB-2: `depositionAnchor` typed-field vs bridge-DTO
- **Status:** ALIGNED
- **Cited:** 13-decision-register.md:264-272 (DR-KB-2 VALIDATED — typed `MathemeHarmonicProfile` field; `kernel.rs` authority)
- **Current framing in tranche:** Decide typed field vs DTO; resolves Wave-A M5 code-pending row.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** DR-KB-2 already ratifies "typed field on kernel.rs"; tranche 10.4 may be downgraded to doc-ahead execution of the DR (or rolled into 18.8). M4 cares because `depositionAnchor.dayId, nowPath, sessionKey, episodeHandle, privacyClass` are M4'-SPEC §6.5 required profile fields (M4'-SPEC.md:53-59).

### 10.7 — Audit four-scale Cl(4,2) one-algebra identity
- **Status:** ALIGNED
- **Cited:** M4'-SPEC.md:277-289 (§7.4 — same Cl(4,2) algebra at M1 ring, M3 codon, M4 personal, Kerykeion natal); M4-ARCHITECTURE.md:541-549 (§7.2 — one algebra, four scales)
- **Current framing in tranche:** Audit memo confirming M1 ring / M3 codon / M4 personal / Kerykeion natal share ONE Cl(4,2) primitive; touch points named.
- **Recommendation:** KEEP-AS-IS

### 10.M4 — Personal-pole profile-bus projection
- **Status:** ALIGNED (with DR-M4-3 strict invariant)
- **Cited:** 13-decision-register.md:422-434 (DR-M4-3 VALIDATED — `PersonalPoleProjection` exposes only `OpaqueProtectedHandle` types; resonance scalar IS surfaced; raw bodies never cross the bus); M4-ARCHITECTURE.md:255-330 (§4.3 PersonalPoleProjection structure)
- **Current framing in tranche:** `personal_pole: PersonalPoleProjection` exposing bioquaternion (opaque), q_personal_resonance (scalar), q_composed_handle (opaque), pattern_packet_handle (opaque), oracle_frame_handle, symbolic_protein_handle, deck_context_handle, torus_knot_phase (DR-IG-4 SSOT M4 reads not owns), vama_recognition (opaque).
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Privacy contract matches DR-M4-3 exactly. Note: ARCHITECTURE §4.3 still types `bioquaternion: BioQuaternionState` and `q_composed: [f32; 4]` directly on the projection at lines 287, 273 — this is WRONG-FRAMING relative to DR-M4-3. The TRANCHE row in 10.M4 (kernel-bridge plan) gets it right (`OpaqueProtectedHandle<BioQuaternion>`, `q_composed_handle: OpaqueProtectedHandle<QComposed>`). ARCHITECTURE doc needs DR-M4-3 patch; SPEC/DR wins.

### 10.IG — `PsychoidFieldProjection`
- **Status:** WRONG-FRAMING (in any inherited "6-vertex" wording); ALIGNED if DR-IG-6 geometry is used
- **Cited:** 13-decision-register.md:364-382 (DR-IG-6 VALIDATED with CORRECTED GEOMETRY — full 6+6 P/P' mapping; 2 poles P5/P5' + 4 base P1-4 + 4 inverted-base P1'-4' + 1 central axis-point P0/P0'; reject "6 vertices = 6 QL positions")
- **Current framing in tranche:** `psychoid_field: PsychoidFieldProjection` (dipyramid + Hopf-linked tori at personal scale per DR-IG-6).
- **Canon framing:** Dipyramid surfaces 2 apex poles (P5/P5') + 8 base-ring vertices (P1-4 explicate + P1'-4' explicate interleaved on octagonal base structure) + 1 central axis-point (P0/P0' centre of base square, projected up the axis to both poles). Hopf-linked tori ride this scaffold at personal scale per DR-IG-6 line 374.
- **Recommendation:** AUGMENT
- **Recommendation detail:** The Tranche 10.IG row correctly cites DR-IG-6; verify that the `PsychoidFieldProjection` schema enumerates the 9 distinct topological loci (4 base + 4 inverted-base + 1 central-axis-point with two-pole projection) rather than collapsing to "6 vertices." The psychoid-engine spec lines 253-260 and ARCHITECTURE §5.3.1 line 388 both need to be brought in line with DR-IG-6.

### Track 18 — M4-touching rows

### 18.4 — `PersonalPoleProjection` with protected handles (M4 portion)
- **Status:** ALIGNED
- **Cited:** 13-decision-register.md:422-434 (DR-M4-3 strict invariant); M4'-SPEC.md:303-314 (§7.6 — privacy boundary)
- **Current framing in tranche:** PersonalPoleProjection with protected handles for PatternPacket, OracleFrame, SymbolicProtein, NaraDeckContext; DR-M4-3 strict invariant.
- **Recommendation:** KEEP-AS-IS

### 18.5 — `PsychoidFieldProjection` (composition projection)
- **Status:** ALIGNED with same DR-IG-6 caveat as 10.IG above
- **Cited:** 13-decision-register.md:364-382 (DR-IG-6)
- **Current framing in tranche:** `PsychoidFieldProjection` (dipyramid + Hopf-linked tori; per DR-IG-6).
- **Recommendation:** AUGMENT (same as 10.IG — enumerate full 6+6 geometry in schema)

## Drift patterns observed

The dominant pattern in this tranche slice is **ARCHITECTURE-doc lag behind ratified DRs**. M4-ARCHITECTURE.md was authored 2026-06-02 and ratified DR-M4-1, DR-M4-2 same day; DR-IG-6 and DR-M4-3 came 2026-06-03 with corrected geometry and strict-invariant privacy. The architecture doc carries pre-correction language at three load-bearing places:

1. **DR-IG-6 dipyramid geometry.** M4-ARCHITECTURE.md §5.3.1 line 388 says "Square-base dipyramid (bipyramid) — 6 vertices (4 equatorial + 2 polar) + 8 triangular faces + 12 edges" which is the same wrong-vertex-count framing DR-IG-6 explicitly corrects. The psychoid-engine spec at §7.1 lines 253-260 has more-correct wording but mixes "6 vertices" with the 12-position listing. Both files need patches naming the 9 distinct topological loci that carry the full 6+6 P/P' positions.

2. **DR-M4-3 opaque-handle strict invariant.** M4-ARCHITECTURE.md §4.3 (lines 268-275) types `q_personal: [f32; 4]`, `q_composed: [f32; 4]`, `q_transit: [f32; 4]`, `q_activity: [f32; 4]`, `bioquaternion: BioQuaternionState` directly on `PersonalPoleProjection` — quaternion BODIES on the bus. DR-M4-3 says all of these must be `OpaqueProtectedHandle<…>` with only the resonance scalar surfaced. Tranche 10.M4 and 18.4 correctly use the opaque-handle framing; ARCHITECTURE needs a sweep.

3. **DR-M4-1 path correction.** M4-ARCHITECTURE.md §2.5 (line 173) and §10 test-criterion 4 (line 750) cite `dayContainerPath = join(vaultRoot, 'Pratibimba', 'Nara', dayId)` as "DR-M4-1 compliant" — but DR-M4-1 corrects to `Idea/Empty/Present/{day_id}/`. The ARCHITECTURE doc has the old `Pratibimba/Nara` path. SPEC §6.6 also still carries `${VAULT}/Pratibimba/Nara/{day_id}/`; Tranche 5.2 correctly identifies SPEC §6.6 as drift to patch. ARCHITECTURE §8.7 line 665 references "Idea/Empty/Present/{day_id}/Pratibimba/Nara/{day_id}/" which COMPOUNDS the two paths — that compound path is incoherent.

A secondary pattern is **DR-M4-2 clause 1 re-binding of names.** §7.13 originally framed the question as "Kerykeion-only q_personal vs integrated q_Nara"; DR-M4-2 clause 1 resolves it by making `q_personal` THE Nara quintessence output (the integrated identity) and `Q_identity` the natal-Kerykeion baseline component. The Wave-A matrix and ARCHITECTURE §2.1 still describe `q_personal` as "Kerykeion-natal-only" baseline. Cycle-3 substrate work should patch this naming or the substrate will encode the deprecated mapping.

No invented extensions detected (M4 has a real substrate-grounded extension at `Body/M/epi-theia/extensions/m4-nara/` per contract `2026-06-01.07-T7`); no collapsed registers; no mis-attributed dispatch (DR-B-3 / DR-M5-1 corrections do not impact this tranche slice). All substrate citations in 05-m4-nara and the matrix are verifiable.

## Tranche augmentation / removal / addition recommendations

- **ADD:** **Tranche 05.12 — DR-IG-6 dipyramid geometry sweep for psychoid renderer spec.** Cites DR-IG-6. Patches M4-ARCHITECTURE.md §5.3.1 line 388 (6-vertex framing) and m4-prime-psychoid-cymatic-field-engine.md §7.1 lines 253-260 (mixed 6-vertex / 12-position framing) to enumerate the full 6+6 P/P' geometry: 2 apex poles (P5/P5') + 4 base-square vertices (P1-4) + 4 inverted base vertices interleaved (P1'-4') + central axis-point (P0/P0' as base-square centre projected to both poles). This is load-bearing because Tranche 5.5 (psychoid solver) builds against the wrong geometry otherwise.
- **ADD:** **Tranche 05.13 — DR-M4-3 strict-invariant sweep of M4-ARCHITECTURE.md §4.3.** Patches the `PersonalPoleProjection` Rust pseudocode at ARCHITECTURE.md lines 266-316 to type each load-bearing quaternion field as `OpaqueProtectedHandle<…>` rather than `[f32; 4]` body. Add explicit assertion test that "no raw bodies cross the bus." Cites DR-M4-3 + 13-decision-register.md:422-434.
- **ADD:** **Tranche 05.14 — DR-M4-1 path coherence sweep of M4'-SPEC §6.6 + M4-ARCHITECTURE.md §2.5 + §8.7.** Replace the SPEC §6.6 line "canonical store is `${VAULT}/Pratibimba/Nara/{day_id}/`" (M4'-SPEC.md:81) with `${VAULT_ROOT}/Idea/Empty/Present/{day_id}/`. Replace ARCHITECTURE §2.5 line 173 `dayContainerPath` citation and §10 test 4 citation. Replace ARCHITECTURE §8.7 line 665 compound-path with the canonical single path. Cites 13-decision-register.md:164-172.
- **AUGMENT 5.4** with cross-reference to `BioQuaternionState` already at `kernel.rs:46-59` (it is NOT a missing type, only the decomposition function is missing) — cite M4-ARCHITECTURE.md:151-163.
- **AUGMENT 5.5** to cite DR-IG-6 corrected geometry in its verification clause.
- **AUGMENT 5.7** to drop the "Kerykeion-only vs integrated" framing and instead encode DR-M4-2 clause 1's name re-binding: `q_personal` = integrated Nara quintessence output; `Q_identity` = Kerykeion natal baseline component. Cites 13-decision-register.md:180-181.
- **AUGMENT 5.11** to assert OracleFrame.vak_address.cp[] cardinality authority per DR-VAK-1 (13-decision-register.md:150-160), not the spread label.
- **REMOVE:** None — no rows in this slice contradict ratified DRs once the augmentations above land.

## Open questions for user

1. **psychoid-engine §7.1 line 256 wording.** The phrase "12 named QL positions (6 + 6'): #0/#0' at centre (white/black = 0/1 ground)" places P0/P0' at the centre — consistent with DR-IG-6's "central point of the base square = P0/P0'." But the same paragraph lists "6 vertices + 8 triangular faces + 12 edges" — geometrically incoherent with placing #1-#4 + #1'-#4' as eight base vertices (that would require 8 base + 2 polar = 10 vertices, not 6). User decision: does the renderer build against the **face-count** topology (6 vertices = degenerate dipyramid with 4 equatorial + 2 polar) or against the **position-mapping** topology (8 base + 2 poles + 1 central axis-point = 11 topological loci carrying 12 positions because P0/P0' projects to both poles)? DR-IG-6 strongly implies the latter; canonical spec text needs a single answer. Cited: m4-prime-psychoid-cymatic-field-engine.md:253-260; 13-decision-register.md:364-382.

2. **NaraDeckContext / macro-deck-as-identity-handle vs M4-0 identity-source separation.** Tranche 5.11 says macro-deck is a "protected long-range symbolic register" stored "inside the protected M4 personal field as an identity/context handle" (M4'-SPEC.md:112-117). But M4'-SPEC §6.7 line 91 explicitly forbids any non-review mutation of M4-0 identity-system sources. Whether the macro-deck handle is M4-0 identity-source-evidence (governed by review) or M4-4 living-context (perturbable by activity) is genuinely undecided in canon. Both readings are defensible from the SPEC text. User decision needed before macro-deck schema lands. Cited: M4'-SPEC.md:111-117 (macro/session deck distinction); M4'-SPEC.md:87-94 (§6.7 promotion law).
