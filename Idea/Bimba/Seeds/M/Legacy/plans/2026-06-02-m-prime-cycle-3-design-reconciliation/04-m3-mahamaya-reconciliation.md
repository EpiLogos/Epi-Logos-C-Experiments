# Track 04 — M3 Mahāmāyā Reconciliation

Reconciles [[M3']] across the four corpora. M3 is **structurally aligned at the contract surface**: the 472-state codon-rotation projection is materialised at `Body/S/S0/portal-core/src/codon_rotation_projection.rs` (`CODON_ROTATION_SURFACE_COUNT=472`, forward/reverse maps, `codon_charge_quaternion`); the m3-mahamaya extension (contract `2026-06-01.07-T6`) consumes it via `buildM3ProjectionSurface` and throws when `profile.codonRotationProjection` is missing; the 40 non-dual / 24 dual / 7-rotational split is exactly what `classify_codon` enforces. 8 of 18 load-bearing claims are ALIGNED. M3 has **no genuine CODE-PENDING** — all gaps are doc-ahead rendering work over landed substrate or contradictions for the decision register.

## Total-Shape Architecture (Phase A)

Canonical total-shape document for M3' (six summonable inspectors + four depth-views + clock-field + transcription chain + coupling-flow / measurement-face inspector): [`Idea/Bimba/Seeds/M/M3'/M3-ARCHITECTURE.md`](Idea/Bimba/Seeds/M/M3'/M3-ARCHITECTURE.md) (expanded in cycle-3). Profile-bus projections now include the language-architecture handles: `TranscriptionalClockPacket`, `OracleFrameProjection`, `SymbolicProteinProjection`, `MahamayaLensStack`, and optional inspector `CouplingFlowAlignment` per Tranches 4.11 / 10.M3 / 18.4. DR-IG-3 owns M3 codon-ring Klein-flip choreography. M3-5 owns the `K² × T²_Mahāmāyā` double-torus; M1-5 single K² boundary verified bilaterally.

## Source Specs and Matrix

- Canonical: `Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md`, `Idea/Pratibimba/System/Subsystems/Mahamaya/mahamaya-ux-full-m3-branch.md`
- Companions: `Idea/Bimba/Seeds/M/M-SYMBOLIC-LANGUAGE-ARCHITECTURE.md`, `Idea/Bimba/Seeds/M/ql_physics_anthropic_chemistry_alignment_v2.md`, `Idea/Bimba/Seeds/M/M3'/m3-prime-symbolic-transcription-research.md`, `Idea/Bimba/Seeds/M/M3'/full_theoretical_alignments_ql_physics.md`, `Idea/Bimba/Seeds/M/M3'/alpha_rasa_bridge_ql.md`, `Idea/Bimba/Seeds/M/M3'/m3-prime-ql-binary-tabulation.md`, `Idea/Bimba/Seeds/M/M3'/m3-prime-clifford-consolidation.md`
- Full row-level reconciliation: `plan.runs/wave-a-m3-reconciliation-matrix.md`

## Cycle 2 Substrate Inheritance

Consume as-is — `Body/S/S0/portal-core/src/codon_rotation_projection.rs` (materialized-kernel-lut); `epi-lib/src/m3_clock_lut.c` `CLOCK_DEGREE_LUT[360]` + 384 line-change graph + 24-spoke 15° lattice + 12-deep ring-buffer; `Body/M/epi-theia/extensions/m3-mahamaya` extension (contract 2026-06-01.07-T6, first-slice 64/472 wheel + provenance + trace overlay). Cycle 2 Track 05 named substrate; cycle 3 closes surface consumers.

## Tranches

1. **4.1 — Codon-rotation projection field contract audit** *(code-pending-closure; audit-only)*

   Audit whether current forward/reverse proportional projection IS the canonical kernel LUT per M3'-SPEC §7 or a placeholder. Extend round-trip tests on representative `(lens,mode) ↔ (codon,rotation)` cells. **No rebuild** — `codon_rotation_projection.rs` is materialized.

   Verification: `cargo check -p portal-core && cargo test -p portal-core codon_rotation`; `grep 'dataset_lut_state'` for `materialized-kernel-lut` literal.

2. **4.2 — M3' summonable inspectors + four depth-view modes** *(doc-ahead-landing; closes O-1)*

   Add the six summonable inspectors (dinucleotide-matrix, charge-quaternion w/ `pp+mm+mp+pm=4X` audit, 24-spoke + 12-deep ring-buffer, Major-Arcana/chromosome, DNA/RNA toggle, per-suit integral `84+96+88+92=360`) and four depth-view widget modes (Flat Clock Debug / Lens Annulus / Toroidal-World / Hopf Identity) over the existing `buildM3ProjectionSurface` contract.

   Verification: `test -d Body/M/epi-theia/extensions/m3-mahamaya && grep -r 'dinucleotide\|chargeQuaternion\|twentyFourSpoke\|majorArcana\|dnaRnaPhase' Body/M/epi-theia/extensions/m3-mahamaya/src/`; assert **zero** hardcoded codon/hexagram/tarot mapping tables inside extension src (all reads via profile/bridge).

3. **4.3 — Clock-field angular/hop edge overlay rendering** *(doc-ahead-landing)*

   Render cross-clock angular relations (aspect/opposition/trine/square) and hop edges along the 384 line-change graph; codon wheel perturbs with tick advance. Renderer overlay only — substrate (`epi-lib/src/m3_clock_lut.c`) is landed.

   Verification: `grep -r 'aspectEdge\|hopGraph\|lineChangeEdge\|spokeLattice' Body/M/epi-theia/extensions/m3-mahamaya/src/`; widget render-test confirms tick redraw.

4. **4.4 — TCT / Nine-of-Wands dataset reconciliation** *(contradiction-decision; routes to DR-M3-1)*

   Decision-register entry confirming dataset reconciliation (move dataset value from 8 to 7, not code change). Runtime law (`classify_codon`, `test_m3.c`) is authoritative — TCT is 7-state non-dual. Name S2 import-time validator that rejects value 8 for TCT.

   Verification: `grep -rn 'TCT' 13-decision-register.md`; `cargo test -p portal-core::codon::tests` confirms `classify_codon(0x35) == ImperfectPalindromic`.

5. **4.5 — Execute DR-M3-2: 72→64 epogdoon cross-reference** *(doc-ahead-landing; DR-M3-2 VALIDATED)*

   Replace the pre-DR "uniqueness / injectivity / gap-marker" framing with the ratified epogdoon reading: the 72→64 fold IS the same 9:8 harmonic as M2's 9 non-Earth planets to 8 chakras. UI must not assume bijectivity, but no `det72to64Fold` / `DetFoldState` profile field is added. Patch M3'-SPEC to cross-reference M2'-SPEC §9.5 planetary epogdoon.

   Verification: `grep -n "epogdoon\|9:8" Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md` references M2'-SPEC §9.5; sweep confirms the retired partitioning/profile-field language has no live implementation mandate.

6. **4.6 — 17th lens / 16+1 namespace split** *(contradiction-decision; routes to DR-M3-3)*

   Decision-register entry namespace-splitting the **M2-1' Vimarśa MEF surface** (12 chromatic MEF lenses) vs `M3_LENS_STACK` (16+1 Mahamaya lens-stack from `M3'-SPEC §8.10`). Forbid silent merger. Lens Annulus inspector (4.2) naming follows decision and must not relabel the 12-count surface as an M1-local lens stack.

   Verification: DR-M3-3 entry present; `grep LENS_COUNT` returns only M1' anchors; no `M3_LENS_STACK_COUNT=17` introduced.

7. **4.7 — Cl(4,2) one-algebra-four-scales handoff** *(aligned-only-note; cross-link to Tranches 02.7, 10.7)*

   Note for Wave-B kernel-bridge / profile-contract: confirm `one Cl(4,2) algebra, four call-sites` (M1 ring · M3 codon · M4 personal · Kerykeion natal). Not M3-domain work; handoff only — M1 (Tranche 02.7) and kernel-bridge (Tranche 10.7) own the audit memo.

   Verification: `grep -rn 'Quaternion\|cl_4_2\|cl42' Body/S/S0/portal-core/src/` returns one canonical type; audit memo lists four call-sites.

8. **4.8 — Integrated reading/transcription clock chain** *(doc-ahead-landing; routes to DR-M3-4)*

   Land the deterministic Mahāmāyā reading chain across the seed and UX specs: kernel clock/profile → VAK-addressed `OracleFrame` → M3-5 lens aperture → clock walk / 384 line-change slot → base codon/hexagram → 3 matrix paths × 2 polarities → 7/8 rotational state → DNA/RNA transcription and Start/Stop governance → `#3-4.0` Tarot reflection → amino/operator join → `TranscriptionalClockPacket`. This closes the ambiguity around "protein/genetic information" readings: a single card/codon is a motif, while the readable symbolic peptide/protein is an ordered packet chain around the clock or spread grammar.

   The tranche also records the Nara boundary: M4-3 receives packet chains as `mahamaya_transcription` evidence inside `PatternPacket`, compares them to M4-0-3 stable Gene Keys / 64-code evidence and macro/inhabited deck context, and updates only `Q_activity`, trajectory, and #4.4.4.4 under M4.5 review. It never mutates M4-0 identity-system sources.

   Verification: `rg -n 'TranscriptionalClockPacket|OracleFrame|SymbolicProtein|mahamaya_transcription|M3_LENS_STACK|#3-4\\.0' Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md Idea/Bimba/Seeds/M/M-SYMBOLIC-LANGUAGE-ARCHITECTURE.md Idea/Pratibimba/System/Subsystems/Mahamaya/mahamaya-ux-full-m3-branch.md Idea/Pratibimba/System/Subsystems/Nara/nara-ux-full-m4-branch-update.md`; decision-register entry DR-M3-4 present.

9. **4.9 — Strange-attractor / coupling-flow discipline for M3→Nara** *(doc-ahead-landing; routes to DR-M3-5)*

   Land the disciplined dynamics bridge: subsystem CF assignments `(00/00)`, `(0/1)`, `(0/1/2)`, `(0/1/2/3)`, `4.x`, `(5/0)`; M2 root context correction to `(0/1/2)`; M3 packet chains as symbolic phase portraits; Nara M4-3 as attractor-dynamics integrator; and the mandatory rigor split `symbolic_phase_portrait` vs `measured_nonlinear_dynamics`. Follow `full_theoretical_alignments_ql_physics.md` for the register split: symbolic skeleton, physics descent, psychoid bridge, and low-energy measurement-face. Include research warrants for strange attractors, running alpha, electroweak mixing, QCD running, and Standard Model sixfold global seams.

   Verification: `rg -n 'AttractorDynamicsIntegrator|dynamical_rigor|dynamical systems|symbolic_phase_portrait|Subsystem CF Assignment|Context Frames' Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md Idea/Pratibimba/System/Subsystems/Mahamaya/mahamaya-ux-full-m3-branch.md Idea/Pratibimba/System/Subsystems/Nara/nara-ux-full-m4-branch-update.md Idea/Pratibimba/System/Subsystems/README.md`; decision-register entry DR-M3-5 present.

10. **4.10 — Coupling-flow / measurement-face inspector** *(doc-ahead-landing; depends on 4.8, 4.9, 10.M3)*

   Land the M3-5 inspector surface that follows `full_theoretical_alignments_ql_physics.md`: four lanes for `symbolic_skeleton`, `physics_descent`, `measurement_face`, and `recognition_context`. Required displayed skeletons (the **Third Spanda Equation in its five canonical forms** per `ql_m0_m3_third_spanda_integral_quilting_v2.md`):
   - Mersenne view: `137 = (2^7 − 1) + 1 + 9` (M_7 ground + parent-seal + wholeness-dressing)
   - Binary view: `137 = 2^7 + 9` (binary closure + wholeness)
   - Octave-field view: `137 = 8(8+9) + 1` (octave-applied-to-(octave+wholeness) + parent)
   - Spanda-bridge view: `137 = 64 + 2(36) + 1` (Mahāmāyā + doubled recognition-square + parent)
   - M-stack view: `137 = M_3(64) + M_2(72) + M_1(1)`
   - Plus the **execution-order trace**: `64 + 72 = 136 → (−9) → 127 = M_7 → (+1) → 128 = 2^7 → (+9) → 137 → (+δ) → 137.035999…` (Mersenne ground first exposed, then sealed by parent, then dressed by wholeness, then physical residue).
   - Plus the **translation rule** `9_{M_2} = 8_{M_3} + 1_{M_1}` (the 9-gap at M2's 72-fold = 8 evolutionary-discontinuity markers at M3's RES_MATRIX + the M1 parent unit; recurs as QCD `3 ⊗ 3̄ = 8 ⊕ 1`).

   Required displayed descent: `G_SM -> D_mu -> (g3,g2,gY) -> RG -> EW breaking -> e(mu) -> alpha_EM(mu) -> alpha_EM(0)` plus QCD underbody `SU(3)c -> alpha_s -> 8+1 -> Lambda_QCD -> proton -> hydrogen spectrum`. Required caveat: `137 is the integer skeleton; 137.035999... is the dressed low-energy measurement-face`. The 7-8-9 spine `(7 = action/generator, 8 = octave-field, 9 = wholeness/recognition)` is the operational reading of `N_5 = 8n ± n → {7n, 9n}` per M0-4 N# at [m0.h](Body/S/S0/epi-lib/include/m0.h) — display as a labelled triad anchoring the symbolic skeleton lane.

   This inspector is source-warrant/provenance UI only. It may highlight current packet links to Ananda/Mahamaya skeleton events (`36/64`, `64/72`, `Additive137`, **`MersenneM7Ground`**, **`SpandaCrownBifurcation`**) and current Nara handoff state, but it must not compute RG flow, electroweak mixing, QCD corrections, or experimental constants in the renderer.

   Verification: `rg -n 'CouplingFlowAlignment|coupling-flow|measurement-face|symbolic skeleton|137\\.035999|physics_descent|recognition_context' Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md Idea/Bimba/Seeds/M/M3'/M3-ARCHITECTURE.md Idea/Pratibimba/System/Subsystems/Mahamaya/mahamaya-ux-full-m3-branch.md`; `rg -n '127 = 2\\^7|M_7|9_M2 = 8_M3 \\+ 1_M1|Third Spanda Equation' Idea/Bimba/Seeds/M/M3'/M3-ARCHITECTURE.md` returns the five-form section and the translation rule; widget/string audit rejects `QL derives alpha` and accepts only register-disciplined caveat language.

11. **4.11 — VAK-addressed OracleFrame and SymbolicProtein runtime schema** *(code-pending-closure; new integration horizon)*

    Add first-class schema/types for `OracleFrame`, `ReadingPosition`, and `SymbolicProtein` / `OracleSequence` in the M3-facing kernel/bridge contract. `TranscriptionalClockPacket` must carry `vak`, `oracle_frame`, and `cp_position_ref` fields so the renderer and Nara can tell whether a packet is a one-card motif, a compressed triad, a sixfold QL traverse, a Night' inverse pass, a 4/5 depth pass, a clock walk, or a symbolic ORF.

    Required law: variable-size Tarot readings are not coerced into six cards. `reading_frame.positions[]` is authoritative. `spread_scale` names the topological family; `positions[]` names actual cardinality and CP binding; complementary pairs are computed from position pairs (`P0/P5`, `P1/P4`, `P2/P3`) when the frame declares them, not from prose.

    Verification: Rust/TS bridge schemas include `OracleFrame`, `ReadingPosition`, `SymbolicProtein` or chosen final names; tests cover single-card CP point, three-card compressed CP-set, sixfold CP traverse, and Night' inverse pass; M3 renderer consumes only bridge/profile schema, no local Tarot/codon mapping tables.

12. **4.12 — Pre-DR-M3-2 wording sweep** *(doc-ahead-landing; DR-M3-2 VALIDATED)*

    Sweep M3'-SPEC §10.1.899, Mahamaya UX, and related live cycle-3 plan rows for pre-DR-M3-2 partitioning/profile-field wording. Replace with the ratified epogdoon wording from 4.5. Historical notes may remain only when explicitly marked as superseded.

    Verification: live M3 spec / UX / tranche prose names the 9:8 epogdoon and contains no active request for an extra fold-state profile field.

## Track 19 Cross-Reference

Track 19 (Contemplation Surface Integration) consumes M3 substrate at **T19.5**: exposes `m3_major_arcana_from_codon(uint8_t codon) → uint8_t card_id` as the named transcription utility — composes existing `M3_CODON_TO_AA[64]` ([m3.c:221-245](Body/S/S0/epi-lib/src/m3.c:221)) + reverse-lookup on `M3_MAJOR_ARCANA[].amino_acid_index` ([m3.c:266-289](Body/S/S0/epi-lib/src/m3.c:266)). Returns 0xFF on STOP codons. Lets the M5 Möbius return call it on each codon in the session's M3 trace during contemplation. Data is fully there; only the named function is missing. See [`19-contemplation-surface-integration.md`](19-contemplation-surface-integration.md).
