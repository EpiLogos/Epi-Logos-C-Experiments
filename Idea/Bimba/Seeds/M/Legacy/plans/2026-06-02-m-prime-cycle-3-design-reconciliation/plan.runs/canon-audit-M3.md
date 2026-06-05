# Canon Audit: M3-mahamaya

**Auditor scope:** Cycle-3 Tranche 04 (M3 Mahamaya reconciliation, all 11 rows), the wave-a-m3 reconciliation matrix (20 rows), and the M3-touching rows of Tranche 10 (10.M3, 10.6, 10.7, 10.9) and Tranche 18 (18.4 M3 projections). DR rows: DR-M3-1, DR-M3-2, DR-M3-3, DR-M3-4, DR-M3-5, DR-VAK-1.
**Audit date:** 2026-06-03

## Authoritative sources read

- Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md (offset 0 lim 505 + offset 506 lim 165 — full 670 lines)
- Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md (full, 919 lines, paginated)
- Idea/Pratibimba/System/Subsystems/Mahamaya/mahamaya-ux-full-m3-branch.md (full, 311 lines)
- Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/04-m3-mahamaya-reconciliation.md (full, 92 lines)
- Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/10-kernel-bridge-profile-contract.md (full)
- Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/18-typed-kernel-bridge-json-edge.md (full, 161 lines)
- Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/wave-a-m3-reconciliation-matrix.md (full, 133 lines)
- Idea/Bimba/Seeds/M/M3'/M3-ARCHITECTURE.md (offset 0 lim 560 — covers §0-§6 of 897 LOC; later sections concern build/test/composition not auditied here)
- CLAUDE.md (from system reminder)

Companion M3' specs cited by SPEC (m3-prime-symbolic-transcription-research.md, m3-prime-ql-binary-tabulation.md, m3-prime-clifford-consolidation.md, alpha_rasa_bridge_ql.md, m3-prime-ql-transcriptional-bridge.md, m3-prime-ql-harmonic-mathematics-v2.md, full_theoretical_alignments_ql_physics.md) are heavily referenced within M3'-SPEC §0/1, §8.9.1, §8.16 — citations to those sources are made indirectly via the SPEC sections that quote them.

## Per-row audit

### T04-1 — Codon-rotation projection field contract audit (Tranche 4.1)
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md:116-173 (§7 forward/reverse map; canonical materialization site `codon_rotation_projection.rs`)
- **Current framing in tranche:** Audit whether current forward/reverse proportional projection IS the canonical kernel LUT per §7, extend round-trip tests; no rebuild.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Tranche correctly classifies as code-pending-closure / audit-only over the already-materialised LUT (`dataset_lut_state: "materialized-kernel-lut"`). Frames the §7 surface as load-bearing without inventing new framing.

### T04-2 — Summonable inspectors + four depth-view modes (Tranche 4.2)
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md:175-181 (§7.5 conversational-default / technical-on-request); :415-435 (§8.10 four render views); :866-884 (§9 panel enumeration including dinucleotide-matrix, charge-quaternion, 24-spoke, Major-Arcana, DNA/RNA toggle)
- **Current framing in tranche:** Six summonable inspectors + four depth views over existing `buildM3ProjectionSurface` contract; no hardcoded mapping tables in extension.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Faithful to §7.5 surface philosophy and §9 panel enumeration; correctly preserves the bridge/profile-only mapping discipline.

### T04-3 — Clock-field angular/hop edge overlay rendering (Tranche 4.3)
- **Status:** ALIGNED
- **Cited:** Idea/Pratibimba/System/Subsystems/Mahamaya/mahamaya-ux-full-m3-branch.md:187-203 (§4 "cymatics-as-clock-field-as-live-data-structure", angular/hop/traversal edges); M3'-SPEC.md:304-329 (§8.6 384 line-change graph + 24-spoke lattice)
- **Current framing in tranche:** Renderer-overlay over landed substrate (`m3_clock_lut.c`); no new C/Rust work.
- **Recommendation:** KEEP-AS-IS

### T04-4 — TCT / Nine-of-Wands dataset reconciliation (Tranche 4.4)
- **Status:** ALIGNED
- **Cited:** 13-decision-register.md:90-98 (DR-M3-1 — runtime law authority; dataset 8 → 7; S2 import-time validator)
- **Current framing in tranche:** Decision-register entry confirming dataset reconciliation; S2 import-time validator rejecting value 8.
- **Recommendation:** KEEP-AS-IS

### T04-5 — 72→64 uniqueness/injectivity contract (Tranche 4.5)
- **Status:** WRONG-FRAMING
- **Cited:** 13-decision-register.md:102-110 (DR-M3-2 ratified — 72→64 is the epogdoon 9:8 ratio, a structural harmonic, NOT a slots-to-codons mapping requiring injectivity scope; "no new profile field"; "no gap-marker contract")
- **Current framing in tranche:** "Decision-register entry naming uniqueness scope (per-cell vs per-cycle), gap-marker semantics, and profile-field shape (extend `evolutionaryGap` or add `det72to64Fold`)."
- **Canon framing:** Per DR-M3-2 the fold IS the epogdoon ratio (same as planetary 9:8 in M2'-SPEC §9.5). The structural identity with the planetary 9:8 IS the contract. No new profile field, no gap-marker contract, no per-cell vs per-cycle uniqueness scope to declare. (13-decision-register.md:104-106)
- **Recommendation:** REWRITE
- **Recommendation detail:** Tranche should be downgraded to a cross-reference doc patch only: add the epogdoon-9:8 cross-reference between M3'-SPEC and M2'-SPEC §9.5; remove any wording implying a profile-field decision is needed. Drop "extend `evolutionaryGap` or add `det72to64Fold`". Drop "uniqueness scope" framing — it imported software-engineering uniqueness concerns into an ontological harmonic structure.

### T04-6 — 17th lens / 16+1 namespace split (Tranche 4.6)
- **Status:** ALIGNED
- **Cited:** 13-decision-register.md:114-122 (DR-M3-3 — 12 MEF lenses are M2-1' Vimarśa chromatic; 16+1 Mahāmāyā lens-stack is M3'-domain; distinct ontologies in distinct namespaces); M3'-SPEC.md:415-435 (§8.10 "16 lens positions plus a Level-0 meta-position"); M3'-SPEC.md:506-514 (§8.15 clock aperture namespaces: M2_MEF_LENS=12, M3_LENS_STACK=16, M3_LENS_STACK_GROWTH=+1)
- **Current framing in tranche:** Decision-register entry namespace-splitting `M1_LENS` (12 chromatic anchors) vs `M3_LENS_STACK` (16+1 Mahamaya lens-stack); forbid silent merger.
- **Recommendation:** AUGMENT
- **Recommendation detail:** Tranche labels the 12 anchors as "M1' chromatic lens-anchors"; DR-M3-3 ratified labelling is M2-1' Vimarśa-domain chromatic MEF (not M1'). M3-ARCHITECTURE.md:117 also says "M1'/MEF" rather than "M2-1' Vimarśa". Add citation `cited: 13-decision-register.md:116` and tighten the label to "M2-1' chromatic MEF lens count" or accept the SPEC §8.15 three-namespace form `M2_MEF_LENS / M3_LENS_STACK / M3_LENS_STACK_GROWTH`. Substance is correct; framing label tightens to canon.

### T04-7 — Cl(4,2) one-algebra-four-scales handoff (Tranche 4.7)
- **Status:** ALIGNED
- **Cited:** M3'-SPEC.md:247-278 (§8.4 — codon as quaternion in Cl(4,2); "the same Cl(4,2) Clifford algebra as M1 SU(2) ring quaternions and M4's personal-quaternion at M4-4-4-4")
- **Current framing in tranche:** Cross-link audit memo to Wave-B kernel-bridge / profile-contract (Tranche 02.7, 10.7); not M3-domain work.
- **Recommendation:** KEEP-AS-IS

### T04-8 — Integrated reading/transcription clock chain (Tranche 4.8)
- **Status:** ALIGNED
- **Cited:** 13-decision-register.md:126-134 (DR-M3-4 — full chain spec, packet contract, Nara M4-3 boundary, M4-0 protection); M3'-SPEC.md:481-634 (§8.15 transcription clock chain, packet YAML)
- **Current framing in tranche:** Land deterministic chain across seed + UX specs; close ambiguity around protein/genetic readings; Nara boundary preserved.
- **Recommendation:** KEEP-AS-IS

### T04-9 — Strange-attractor / coupling-flow discipline (Tranche 4.9)
- **Status:** ALIGNED
- **Cited:** 13-decision-register.md:138-146 (DR-M3-5 — disciplined strange-attractor language, Subsystem CF assignments with M2 root corrected to (0/1/2), M3 (0/1/2/3), `AttractorDynamicsIntegrator` / `dynamical_rigor` / `attractor_dynamics`); M3'-SPEC.md:729-865 (§8.16 register discipline + 6.03 research warrants)
- **Current framing in tranche:** Land subsystem CF assignments; M2 root corrected to (0/1/2); packet chains as symbolic phase portraits; Nara M4-3 as attractor-dynamics integrator; mandatory rigor split.
- **Recommendation:** KEEP-AS-IS

### T04-10 — Coupling-flow / measurement-face inspector (Tranche 4.10)
- **Status:** ALIGNED
- **Cited:** M3'-SPEC.md:729-815 (§8.16 — three-register split mandatory; `symbolic_skeleton` / `physics_descent` / `measurement_face` / `recognition_context`; the displayed skeletons `64+72+1`, `64+2(36)+1`, `128+8+1`, `0,4,2,2,9`, `(4/3)^2`); M3'-SPEC.md:109-114 (§6 readiness tests require no renderer-local physics)
- **Current framing in tranche:** Source-warrant/provenance UI; four lanes; required caveat distinguishing `137` integer skeleton from `137.035999...` measurement-face.
- **Recommendation:** KEEP-AS-IS

### T04-11 — VAK-addressed OracleFrame and SymbolicProtein runtime schema (Tranche 4.11)
- **Status:** ALIGNED
- **Cited:** 13-decision-register.md:150-160 (DR-VAK-1 — active runtime order `CPF, CT, CP, CF, CFP, CS`; `reading_frame.positions[]` / `OracleFrame.vak_address.cp[]` is cardinality authority; spread label alone insufficient); M3'-SPEC.md:636-712 (§8.15.1 VAK-framed Tarot/Codon language; §8.15.2 Symbolic Proteins YAML); mahamaya-ux-full-m3-branch.md:114 (CPF/CT/CP/CF/CFP/CS active order on every reading)
- **Current framing in tranche:** Adds `OracleFrame`, `ReadingPosition`, `SymbolicProtein` schemas; `TranscriptionalClockPacket` carries `vak`, `oracle_frame`, `cp_position_ref`; variable-size readings are not coerced into six cards.
- **Recommendation:** KEEP-AS-IS

### T10-M3 — M3' Profile Projections (Tranche 10.M3)
- **Status:** WRONG-FRAMING (one row inside)
- **Cited:** 13-decision-register.md:102-110 (DR-M3-2 — "no new profile field"); 13-decision-register.md:126-134 (DR-M3-4 packet); 13-decision-register.md:114-122 (DR-M3-3 16+1 lens-stack)
- **Current framing in tranche:** Three required fields: `transcription_packet`, `m3_lens_stack: MahamayaLensStack` (16+1), `det_fold_state: DetFoldState` (epogdoon 9:8 fold state per DR-M3-2 reformulated). Two language-architecture handles: `oracle_frame`, `symbolic_protein`. Optional `coupling_flow_alignment`.
- **Canon framing:** DR-M3-2 ratified resolution explicitly says "No new profile field. Remove any UI assertion of injectivity." — therefore `det_fold_state: DetFoldState` should NOT be added as a profile field per DR-M3-2; the 9:8 epogdoon identity with planetary 9:8 IS the contract. (13-decision-register.md:106)
- **Recommendation:** REWRITE
- **Recommendation detail:** Drop `det_fold_state: DetFoldState` from 10.M3 required fields. Keep `transcription_packet` (DR-M3-4), `m3_lens_stack` (DR-M3-3), `oracle_frame`, `symbolic_protein`, optional `coupling_flow_alignment`. Cross-reference §8.12 / M2'-SPEC §9.5 epogdoon-identity in the spec docs rather than typing a fold-state on the profile bus.

### T10-6 — Bridge contract test: six-axes-of-72 carrier round-trip (Tranche 10.6)
- **Status:** ALIGNED
- **Cited:** M3'-SPEC.md:78-83 (§3 `resonance72` carrier shape); 13-decision-register.md:78-86 (DR-M2-2 six-axis enumeration)
- **Recommendation:** KEEP-AS-IS

### T10-7 — Four-scale Cl(4,2) audit in kernel.rs (Tranche 10.7)
- **Status:** ALIGNED
- **Cited:** M3'-SPEC.md:262-278 (§8.4 — same Cl(4,2) at M1 ring, M3 codon, M4 personal scales)
- **Recommendation:** KEEP-AS-IS

### T10-9 — `dataset_lut_state` / `m3_codec_provenance` host struct correction
- **Status:** ALIGNED (correction of prior Wave-A misattribution)
- **Cited:** wave-a-m3-reconciliation-matrix.md:36 (codon-rotation provenance); M3'-SPEC.md:78-83 (§3 datasetLutState requirement)
- **Recommendation:** KEEP-AS-IS

### T18-4 (M3 portion) — Per-domain M3 projections in typed JSON edge
- **Status:** WRONG-FRAMING (carries the same DetFoldState issue as T10-M3)
- **Cited:** 13-decision-register.md:102-110 (DR-M3-2 — no profile field, no gap-marker contract)
- **Current framing in tranche:** Lists `OracleFrameProjection + ReadingPosition + TranscriptionalClockPacket + SymbolicProteinProjection + MahamayaLensStack + DetFoldState + optional CouplingFlowAlignment` (M3) for typed JSON edge.
- **Canon framing:** DR-M3-2 explicitly says "No new profile field" for the 72→64 fold; the structural identity with planetary 9:8 is the contract. (13-decision-register.md:104-108)
- **Recommendation:** REWRITE
- **Recommendation detail:** Drop `DetFoldState` from the 18.4 M3 list. Keep `OracleFrameProjection`, `ReadingPosition`, `TranscriptionalClockPacket`, `SymbolicProteinProjection`, `MahamayaLensStack`, optional `CouplingFlowAlignment`. Update the JSON fixture acceptance: do not assert `detFoldState` presence; do assert the symbolic-skeleton caveat and the `137 vs 137.035999...` register split.

### WAM-1 — UX claim: M3 parses entity → codon/hexagram/tarot/Cl(4,2) signature
- **Status:** ALIGNED
- **Cited:** M3'-SPEC.md:247-278 (§8.4 codon-as-quaternion in Cl(4,2)); mahamaya-ux-full-m3-branch.md:31, :65-72 (§1, §3 axiom and parser)
- **Recommendation:** KEEP-AS-IS

### WAM-2 — 472 rotational states = 40×7 + 24×8
- **Status:** ALIGNED
- **Cited:** M3'-SPEC.md:124-128 (§7 cardinality); :100-106 (§6 readiness tests)
- **Recommendation:** KEEP-AS-IS

### WAM-3 — (lens,mode) ↔ (codon,rotation) bidirectional projection
- **Status:** ALIGNED
- **Cited:** M3'-SPEC.md:116-173 (§7 forward/reverse maps; LUT canonical site)
- **Recommendation:** KEEP-AS-IS

### WAM-4 — Each tarot card IS one codon; turning card changes the mode
- **Status:** ALIGNED
- **Cited:** M3'-SPEC.md:133 (§7 "Each tarot card IS one codon (one tonal signature). Its rotational positions ARE its modal inversions. Turning the card is changing the mode."); :330-356 (§8.7 56+8 exact cover); :356-371 (§8.8 per-suit integrals = 360)
- **Recommendation:** KEEP-AS-IS

### WAM-5 — Default surface alive/tarot-like; multi-matrix is summonable
- **Status:** ALIGNED
- **Cited:** M3'-SPEC.md:175-181 (§7.5)
- **Recommendation:** KEEP-AS-IS

### WAM-6 — M3-0 reception law: 72 → DET → 64 → quaternion
- **Status:** ALIGNED
- **Cited:** M3'-SPEC.md:440-456 (§8.12 transduction chain); :78-83 (§3 resonance72 field)
- **Recommendation:** KEEP-AS-IS

### WAM-7 — 360° clock-field as live data-structure; angular/hop edges; perturbs as tick advances
- **Status:** ALIGNED
- **Cited:** mahamaya-ux-full-m3-branch.md:187-203 (§4); M3'-SPEC.md:304-329 (§8.6 384 = 64×6 line-change graph + 24-spoke lattice)
- **Recommendation:** KEEP-AS-IS

### WAM-8 — 720° SU(2) double-cover never collapses to 360-only
- **Status:** ALIGNED
- **Cited:** M3'-SPEC.md:373-386 (§8.9 SU(2) double-covering wheel); :43 (§0/1 commitment 1)
- **Recommendation:** KEEP-AS-IS

### WAM-9 — Dual surface (M3' clock-wheel + M0' graph) over one Neo4j substrate; neither forks
- **Status:** ALIGNED
- **Cited:** M3'-SPEC.md:458-470 (§8.13 dual-rendering law); :43-49 (commitments 4, 5); 13-decision-register.md:586-618 (DR-TUI-1 ratified — Klein-surface seam via coordinate-tagging is canon mechanism)
- **Recommendation:** AUGMENT
- **Recommendation detail:** Add explicit cross-link from tranche 04 readiness/dual-surface row to DR-TUI-1's Klein-surface seam mechanism (`bimba_coordinate` direct / `bimba_resonances` LLM-classified per epii-ux §316-319). The M3'/M0' dual-surface law is the Mahāmāyā-side instance of the Klein-seam-joined chrome relationship DR-TUI-1 ratifies system-wide.

### WAM-10 — Cl(4,2) at four scales: one algebra
- **Status:** ALIGNED
- **Cited:** M3'-SPEC.md:262-278 (§8.4); covered by Tranche 4.7 handoff
- **Recommendation:** KEEP-AS-IS

### WAM-11 — TCT / Nine of Wands cardinality contradiction
- **Status:** ALIGNED
- **Cited:** 13-decision-register.md:90-98 (DR-M3-1 ratified)
- **Recommendation:** KEEP-AS-IS

### WAM-12 — 72→64 epogdoon "uniqueness/injectivity scope" framing
- **Status:** CONTRADICTS-RATIFIED-DR
- **Cited:** 13-decision-register.md:102-110 (DR-M3-2 VALIDATED 2026-06-02 — "the 72→64 fold is the epogdoon ratio 9:8 ... It is NOT a slots-to-codons mapping requiring injectivity scope. ... No new profile field ... The mistake in the original framing was importing software-engineering uniqueness concerns into an ontological structure that operates harmonically.")
- **Current framing in tranche:** "Decision needed: declare the fold/gap profile-field contract (per-cell vs per-cycle uniqueness; explicit gap-marker semantics) before any UI assumes injectivity."
- **Canon framing:** The 9:8 fold IS structurally identical to the planetary 9:8 from M2'-SPEC §9.5; the structural identity IS the contract; no profile field, no gap-marker contract, no uniqueness-scope decision. (13-decision-register.md:106)
- **Recommendation:** REWRITE
- **Recommendation detail:** Replace WAM-12 with a cross-reference patch: M3'-SPEC §8.12 reception law cross-references M2'-SPEC §9.5 planetary 9:8; cite DR-M3-2 ratified resolution; remove "uniqueness scope" / "injectivity" framing entirely.

### WAM-13 — "17th lens" / "16+1" / namespace collision
- **Status:** ALIGNED (with label tightening per T04-6)
- **Cited:** 13-decision-register.md:114-122 (DR-M3-3); M3'-SPEC.md:506-514 (§8.15 three-namespace form M2_MEF_LENS / M3_LENS_STACK / M3_LENS_STACK_GROWTH)
- **Recommendation:** AUGMENT
- **Recommendation detail:** Label the 12-count surface canonically as "M2-1' Vimarśa chromatic MEF (`LENS_COUNT=12`)" per DR-M3-3 §Action language. The wave-a row says "M1' chromatic-lens count" which is partially correct (M1' supplies the playing landscape) but per DR-M3-3 the canonical naming pins LENS_COUNT=12 to M2-1' Vimarśa chromatic MEF.

### WAM-14 — M3' is Matter pole of integrated 1-2-3 engine
- **Status:** ALIGNED
- **Cited:** M3'-SPEC.md:472-478 (§8.14); mahamaya-ux-full-m3-branch.md:234-241 (§6)
- **Recommendation:** KEEP-AS-IS

### WAM-15 — Reward/training authority outside renderer
- **Status:** ALIGNED
- **Cited:** M3'-SPEC.md:472-478 (§8.14); :87-91 (§4 privacy)
- **Recommendation:** KEEP-AS-IS

### WAM-16 — Privacy: public-current + scalar oracle refs only
- **Status:** ALIGNED
- **Cited:** M3'-SPEC.md:87-91 (§4); mahamaya-ux-full-m3-branch.md:269-275 (§8)
- **Recommendation:** KEEP-AS-IS

### WAM-17 — M3-5 Pauli-Jung World-Clock view as depth mode, not new substrate
- **Status:** ALIGNED
- **Cited:** M3'-SPEC.md:388-414 (§8.9.1 Várlaki/Rudas warrant); :458-470 (§8.13 depth-mode law)
- **Recommendation:** KEEP-AS-IS

### WAM-18 — M3 serves Nara (M4-2 Oracle, M4-0 Identity 64-code, M4-3 Janus)
- **Status:** ALIGNED
- **Cited:** M3'-SPEC.md:87-91 (§4 oracle-artifact scalar resolution); :436-438 (§8.11 Janus); mahamaya-ux-full-m3-branch.md:245-260 (§7)
- **Recommendation:** KEEP-AS-IS

### WAM-19 — Full reading/transcription clock chain (TranscriptionalClockPacket)
- **Status:** ALIGNED
- **Cited:** M3'-SPEC.md:481-634 (§8.15); 13-decision-register.md:126-134 (DR-M3-4)
- **Recommendation:** KEEP-AS-IS

### WAM-20 — Strange-attractor / coupling-flow discipline (symbolic phase portraits)
- **Status:** ALIGNED
- **Cited:** M3'-SPEC.md:729-865 (§8.16); 13-decision-register.md:138-146 (DR-M3-5)
- **Recommendation:** KEEP-AS-IS

### MARCH-A — M3-ARCHITECTURE.md §1 sub-coordinate "M3-2' Lens-mode" labelled "84-state shared playing landscape (M1' upstream)"
- **Status:** WRONG-EXTRACTION (label drift, not framing drift)
- **Cited:** 13-decision-register.md:114-122 (DR-M3-3 — LENS_COUNT=12 is M2-1' Vimarśa-domain chromatic MEF); M3'-SPEC.md:506-514 (§8.15 namespace M2_MEF_LENS)
- **Current framing:** M3-ARCHITECTURE §1 row says "M3-2' Lens-mode owns the 84-state shared playing landscape (M1' upstream)"
- **Canon framing:** M1' owns the 84-state `(lens, mode)` cell upstream; the LENS_COUNT=12 chromatic anchor is M2-1' Vimarśa-domain. Both are upstream of M3'; the architecture doc collapses them under "M1' upstream" without naming M2-1'. (DR-M3-3 §Action; SPEC §8.15.510)
- **Recommendation:** AUGMENT
- **Recommendation detail:** Architecture doc row should read: "M3-2' Lens-mode: the 84-state shared `(lens, mode)` landscape — M1' supplies `(lens, mode)` cell; the chromatic 12 anchors are M2-1' Vimarśa MEF (DR-M3-3)." This does not change tranche framing; it tightens the architecture-doc label, which is an INPUT for substrate-citation per the audit discipline.

### MARCH-B — M3-ARCHITECTURE.md §4.5 `det_fold_state` typed marker proposal
- **Status:** CONTRADICTS-RATIFIED-DR
- **Cited:** 13-decision-register.md:102-110 (DR-M3-2 — "No new profile field ... The mistake in the original framing was importing software-engineering uniqueness concerns")
- **Current framing:** "Replace `evolutionaryGap: bool` with `pub det_fold_state: DetFoldState` ... three-variant enum Closed / GapFolded / ProvisionalDataset"
- **Canon framing:** DR-M3-2 ratified resolution explicitly forbids this addition: "No new profile field. ... No `det72to64Fold` ... the structural identity with the planetary 9:8 IS the contract." (13-decision-register.md:106)
- **Recommendation:** REMOVE
- **Recommendation detail:** M3-ARCHITECTURE §4.5 should be removed or rewritten as a non-field cross-reference to M2'-SPEC §9.5 planetary 9:8. The proposed `DetFoldState` enum, `det_fold_state` field, and any tests asserting fold-state presence on the profile bus contradict ratified DR-M3-2.

### MARCH-C — M3-ARCHITECTURE.md §4.4 `m3_lens_stack: MahamayaLensStack` field with `static_segments: [MahamayaLensSegment; 16]` + optional `growth_meta`
- **Status:** ALIGNED
- **Cited:** 13-decision-register.md:114-122 (DR-M3-3); M3'-SPEC.md:506-514 (§8.15 16+1 namespace form)
- **Recommendation:** KEEP-AS-IS

### MARCH-D — M3-ARCHITECTURE.md §4.3 `TranscriptionalClockPacket` Rust struct
- **Status:** ALIGNED
- **Cited:** M3'-SPEC.md:481-634 (§8.15 YAML); 13-decision-register.md:126-134 (DR-M3-4)
- **Recommendation:** KEEP-AS-IS

### MARCH-E — M3-ARCHITECTURE.md §4.6 `coupling_flow_alignment` projection
- **Status:** ALIGNED
- **Cited:** M3'-SPEC.md:729-815 (§8.16 register discipline); explicit "never compute physical constants in renderer"
- **Recommendation:** KEEP-AS-IS

## Drift patterns observed

The dominant drift across this slice is **a single semantic mis-import that propagates**: the 72→64 epogdoon was framed in Wave-A row 12 + Tranche 4.5 + Tranche 10.M3 + Tranche 18.4 + M3-ARCHITECTURE §4.5 as a software-engineering injectivity/uniqueness/gap-marker problem requiring a typed profile field (`det_fold_state`, `DetFoldState` enum, `evolutionaryGap` replacement). DR-M3-2 ratified explicitly the opposite reading: the 9:8 ratio IS the planetary epogdoon (M2'-SPEC §9.5); the structural identity IS the contract; "the mistake in the original framing was importing software-engineering uniqueness concerns into an ontological structure that operates harmonically." Four tranche surfaces still carry the pre-ratification framing.

A secondary, milder drift is **label imprecision** around the M2-1' Vimarśa chromatic MEF `LENS_COUNT=12`. Multiple docs (M3-ARCHITECTURE §1, §4.1, wave-a row 13) call it "M1' chromatic-lens" rather than "M2-1' Vimarśa MEF". Substantively correct (M1' supplies the playing landscape including the chromatic anchor) but DR-M3-3 §Verification pins the canonical naming to M2-1'. This is wrong-extraction, not wrong-framing.

A subtle alignment opportunity: the M0'/M3' dual-rendering law (§8.13) is structurally identical to the Klein-surface seam DR-TUI-1 ratified for M0' chrome ↔ M5-0' Library/Gnostic Namespace. Tranche 04 does not cross-link to DR-TUI-1's coordinate-tagging mechanism; doing so would consolidate the two instances of "shared substrate, dual rendering" under one named pattern.

No invented extensions, no collapsed registers (the M3 vs M3' distinction is consistently held, 6 Aletheia subagents are not implicated here, the dipyramid is not in M3 scope), no wrong vertex counts, no mis-attributed dispatch authority. The architecture-doc over SPEC override pattern shows up only in M3-ARCHITECTURE §4.5 (DetFoldState contradicts ratified DR-M3-2).

## Tranche augmentation / removal / addition recommendations

- **REMOVE:** Tranche 4.5 in its current "uniqueness/injectivity contract" form. Replace with a single-line doc-patch row: "M3'-SPEC §8.12 cross-references M2'-SPEC §9.5 (planetary 9:8 epogdoon); the 72→64 fold IS that epogdoon. No profile-field decision needed. DR-M3-2 ratified." cited: 13-decision-register.md:102-110.
- **REMOVE:** `DetFoldState` / `det_fold_state` from Tranche 10.M3 required-fields list and from Tranche 18.4 M3 typed-projection list. cited: 13-decision-register.md:104-106.
- **REMOVE:** M3-ARCHITECTURE §4.5 (`det_fold_state` typed marker proposal). cited: 13-decision-register.md:106.
- **AUGMENT:** Tranche 4.6 — relabel the 12-count chromatic surface as "M2-1' Vimarśa MEF" (not "M1' chromatic-lens"). cited: 13-decision-register.md:116-120; M3'-SPEC.md:510.
- **AUGMENT:** Tranche 4 dual-surface row (or new sub-row) — cross-link M3'/M0' dual rendering (§8.13) to DR-TUI-1 Klein-surface seam via coordinate-tagging (`bimba_coordinate` / `bimba_resonances`). cited: 13-decision-register.md:586-616; M3'-SPEC.md:458-470.
- **AUGMENT:** Tranche 10.M3 / 18.4 — explicit JSON-fixture assertion: caveat string distinguishing "137 integer skeleton" from "137.035999... dressed low-energy measurement-face" must appear; physics_descent labelled `physics_reference`; no `computed_by_ql` markers. cited: M3'-SPEC.md:729-815; M3'-SPEC.md:109-114.
- **ADD:** New row in Tranche 04 (or 04.x sub-row) — corpus sweep removing pre-DR-M3-2 "uniqueness scope" / "injectivity" / "gap-marker contract" wording across M3'-SPEC §10.1.899, mahamaya-ux-full-m3-branch.md, and any other live attribution. cited: 13-decision-register.md:102-110; M3'-SPEC.md:897-902 (§10.1 open question text still names "uniqueness scope" as the pending decision — this is now settled by DR-M3-2).
- **AUGMENT:** Tranche 4.3 angular/hop overlay — explicitly cite the SPEC §8.6 `64 × 3 quaternionic gauge axes × 2 eigenvalue polarities = 384` second reading; the rendering should reflect both the "360 + 24 clock-topology" and "64 × 3 × 2 gauge decomposition" views to surface the Cl(4,2) i/j/k axis assignment per M3_MATRIX_QUATERNION_AXIS. cited: M3'-SPEC.md:313-319; M3'-SPEC.md:227-232.

## Open questions for user

- **Q1 (Cl(4,2) signature distribution across the six M3 sub-coordinates):** M3-ARCHITECTURE §1 ends with "M3-0/M3-5 are the implicate generator-poles (sin/cos signature −1 in Cl(4,2)); M3-1..M3-4 are the explicate derived ratios (tan/sec/cot/csc signature +1). Cycle-3 §8 audit will verify this Cl(4,2) signature distribution against M1-5's `CL42_BASIS[6]`". The audit is named but not done. M3'-SPEC does not authoritatively assign sin/cos/tan/sec/cot/csc to M3-0..M3-5; this appears to be M3-ARCHITECTURE's own framing extending the §8.4 codon-quaternion identity. cited: M3-ARCHITECTURE.md:67 (live in architecture only). Confirm whether this signature distribution is canon (route a new DR row) or speculative.
- **Q2 (M3'-SPEC §10.1.899 open question on 72→64 uniqueness):** SPEC §10.1 still names "the profile contract must define the uniqueness scope before UI or tests assume global injectivity" as an open question. DR-M3-2 ratified resolution overrides this open question, but the SPEC text itself has not been patched. Should the SPEC §10.1 line be removed in the cycle-3 sweep, or left as historical record? cited: M3'-SPEC.md:897-902; 13-decision-register.md:102-110.
- **Q3 (M3-5' co-foliated double-torus exact Klein-flip choreography):** DR-IG-3 ratified that M3 codon-ring renders a 200ms rotation-axis flip at the Klein-flip cross, but M3-ARCHITECTURE §5.7.3 specifies a "30° around the inscription-axis" rotation for T²_Mahāmāyā when K² Klein-flips. Are these the same animation (M3-ARCHITECTURE specifies the angle/axis; DR-IG-3 specifies the duration) or two separate behaviours? cited: 13-decision-register.md:322-332 (DR-IG-3); M3-ARCHITECTURE.md:492 (30° axis specification). Route to user for confirmation that 30° + 200ms is one choreography, not two.
- **Q4 (M3-ARCHITECTURE §0/§2.6 references to the M3-5 Pauli-Jung Várlaki/Rudas grammar `1 + 2×32 + 2×36 = 137`):** SPEC §8.9.1 introduces this with explicit source warrant and asserts it "must not replace the primary runtime spine M1(+1) → M2(72) → M3(64) or the physical α(E) running-coupling corridor". The architecture doc surfaces it as a "rendering grammar" only. This is aligned — but should there be a typed `CouplingFlowAlignment.symbolic_skeletons` enum variant `WorldClock137_1_32_36` corresponding to the Várlaki/Rudas decomposition? Tranche 4.10 / M3-ARCHITECTURE §4.6 enumerate `Spine137_64_72_1, Vortex137_64_2x36_1, EwQcd137_128_8_1, Spanda04229, VortexRatio64Over36, QcdOctetSinglet8Plus1` but not the Pauli-Jung variant. cited: M3'-SPEC.md:388-414; M3-ARCHITECTURE.md:391-398.
