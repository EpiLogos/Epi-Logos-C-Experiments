# Track 04 — M3 Mahāmāyā Reconciliation

Reconciles [[M3']] across the four corpora. M3 is **structurally aligned at the contract surface**: the 472-state codon-rotation projection is materialised at `Body/S/S0/portal-core/src/codon_rotation_projection.rs` (`CODON_ROTATION_SURFACE_COUNT=472`, forward/reverse maps, `codon_charge_quaternion`); the m3-mahamaya extension (contract `2026-06-01.07-T6`) consumes it via `buildM3ProjectionSurface` and throws when `profile.codonRotationProjection` is missing; the 40 non-dual / 24 dual / 7-rotational split is exactly what `classify_codon` enforces. 8 of 18 load-bearing claims are ALIGNED. M3 has **no genuine CODE-PENDING** — all gaps are doc-ahead rendering work over landed substrate or contradictions for the decision register.

## Source Specs and Matrix

- Canonical: `Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md`, `Idea/Pratibimba/System/Subsystems/Mahamaya/mahamaya-ux-full-m3-branch.md`
- Companions: `Idea/Bimba/Seeds/M/M3'/m3-prime-symbolic-transcription-research.md`, `Idea/Bimba/Seeds/M/M3'/alpha_rasa_bridge_ql.md`, `Idea/Bimba/Seeds/M/M3'/m3-prime-ql-binary-tabulation.md`, `Idea/Bimba/Seeds/M/M3'/m3-prime-clifford-consolidation.md`
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

5. **4.5 — 72→64 uniqueness/injectivity contract** *(contradiction-decision; routes to DR-M3-2)*

   Decision-register entry naming uniqueness scope (per-cell vs per-cycle), gap-marker semantics, and profile-field shape (extend `evolutionaryGap` or add `det72to64Fold`). The `floor(idx72*8/9)` fold is deterministic but many-to-one — UI must not assume injectivity.

   Verification: DR-M3-2 entry present; absence of `assert injectivity` patterns in `portal-core/tests/`.

6. **4.6 — 17th lens / 16+1 namespace split** *(contradiction-decision; routes to DR-M3-3)*

   Decision-register entry namespace-splitting `M1_LENS` (12 chromatic anchors) vs `M3_LENS_STACK` (16+1 Mahamaya lens-stack from `M3'-SPEC §8.10`). Forbid silent merger. Lens Annulus inspector (4.2) naming follows decision.

   Verification: DR-M3-3 entry present; `grep LENS_COUNT` returns only M1' anchors; no `M3_LENS_STACK_COUNT=17` introduced.

7. **4.7 — Cl(4,2) one-algebra-four-scales handoff** *(aligned-only-note; cross-link to Tranches 02.7, 10.7)*

   Note for Wave-B kernel-bridge / profile-contract: confirm `one Cl(4,2) algebra, four call-sites` (M1 ring · M3 codon · M4 personal · Kerykeion natal). Not M3-domain work; handoff only — M1 (Tranche 02.7) and kernel-bridge (Tranche 10.7) own the audit memo.

   Verification: `grep -rn 'Quaternion\|cl_4_2\|cl42' Body/S/S0/portal-core/src/` returns one canonical type; audit memo lists four call-sites.
