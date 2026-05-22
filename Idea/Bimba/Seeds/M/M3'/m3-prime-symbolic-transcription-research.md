# [[M3']] Symbolic Transcription / Reading / Classification / Display Research

**Status:** research synthesis / implementation orientation
**Date:** 2026-05-22
**Scope:** [[M3']] as the [[Mahāmāyā]] I Ching / DNA / Tarot / codon-rotation / symbolic-imagery display layer, with cymatic integration bounded against [[M2']].

## Local Sources Consulted

- `Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md`
- `docs/datasets/mahamaya-deep/nodes-full-detail.json`
- `docs/datasets/mahamaya-deep/relations.json`
- `docs/datasets/mahamaya-deep/rotational_state_protocol.txt`
- `docs/datasets/mahamaya-deep/fibonacci-60-pisano-integration.md`
- `Body/S/S0/epi-lib/include/m3.h`
- `Body/S/S0/epi-lib/src/m3.c`
- `Body/S/S0/epi-lib/test/m3/test_m3.c`
- `Body/S/S0/epi-lib/test/m3/test_m3_codon_class.c`
- `Body/S/S0/portal-core/src/codon.rs`
- `Body/M/epi-tauri/src-tauri/src/oracle/iching.rs`
- `Body/M/epi-tauri/src-tauri/src/oracle/tarot.rs`
- Boundary anchors: `Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md`, `Idea/Bimba/Seeds/M/M2'/m2-prime-parashakti-cymatic-engine.md`, `Body/S/S0/epi-lib/include/m2.h`, `Body/S/S0/epi-lib/src/m2.c`, `Body/S/S0/epi-lib/test/m2/test_m2.c`, and relevant sections of `docs/plans/2026-05-19-kernel-mprime-harmonic-clock-integration-plan.md`.

## M3' Operational Surface Summary

[[M3]] is the symbolic transcription engine: the 64-address binary field where codons, hexagrams, line-change operators, tarot compression, amino-acid mappings, and codon rotations share one address grammar. [[M3']] is that engine made playable and inspectable. It is not a second implementation of the clock or a local oracle calculator; it is the user-facing surface that consumes kernel/S2/S3 profile data and renders the symbolic state honestly.

The operational surface has four simultaneous jobs:

- Read the shared harmonic profile: `tick`, `tick12`, `degree720`, `degree360`, SU(2) layer, `resonance72`, `audio_octet`, `nodal_quartet`, `lensMode`, and the [[Mahāmāyā]] projection fields.
- Classify the current 64-address state through [[M3]] laws: 2-bit nucleotide encoding, I Ching hexagram/trigram decomposition, codon class, rotational-state count, line-change address, tarot-codon compression, amino-acid/anticodon metadata, and `evolutionaryGap` status.
- Display symbolic imagery without inventing mappings: codon glyphs, hexagram/trigram forms, line-change edges, minor-arcana card tiles, rotational slots, DNA/RNA phase, shadow/paired codon, and degree-wheel position should come from backend/profile/S2 dataset authority.
- Support readings as structured profile observations: a reading is a profile-timed symbolic packet, not an ungrounded random draw. It may include oracle-style interpretation, but the address/classification/display data must remain separable from private Nara interpretation.

The current M3' spec correctly says the renderer must show `pending-dataset-lut`, `provisional-gap`, and audio-deferred states instead of filling gaps with local folklore. That matters for production readiness: M3' must be truthful about what is resolved, what is provisional, and what awaits graph/kernel materialization.

## I Ching / DNA / Tarot / Codon Rotation Roles

### I Ching

The I Ching role is the binary change grammar. In C, `M3_HEXAGRAM_LUT[64]`, `m3_line_change(hex, line)`, `upper_trigram`, `lower_trigram`, `m3_complement`, `M3_COMP_MATRIX`, and `M3_MOVE_MATRIX` provide the codec surface. In Tauri, `iching.rs` exposes `derive_temporal_hex(primary, changing_lines)` as XOR, `trigrams_from_binary`, `binary_to_king_wen`, and a King Wen sequence table.

The current I Ching nucleotide values are correct and should not be changed:

```text
A = 6, T = 9, C = 7, G = 8
```

Those values are load-bearing in `NUCLEOTIDE_ICHING_VALUE`: pair sums, codon sums, inner-charge values, integral invariants, and display labels depend on them. If later work reconciles display naming, it should not alter these values.

Dataset relations support the reading surface: `LINE_CHANGE` has 384 edges, each hexagram source has six line-change relations, and `HAS_UPPER_Trigram` / `HAS_LOWER_Trigram` attach trigram structure. M3' should render this as a navigable change graph: active hexagram, changing-line mask, temporal/result hexagram, upper/lower trigrams, line text, and line-change edge.

### DNA / Codons

The DNA role is the 64-address biological-symbolic alphabet. The code uses 2-bit nucleotides:

```text
A = 0b00, T = 0b01, C = 0b10, G = 0b11
codon = outer << 4 | middle << 2 | inner
```

`m3.h`, `m3.c`, and `portal-core/src/codon.rs` agree on the algorithmic classifier:

- 4 perfect palindromic codons: `n1 == n2 == n3`
- 12 imperfect palindromic codons: `n1 == n3 && n1 != n2`
- 24 non-palindromic non-dual codons: repeated adjacent pair, `n1 == n2 || n2 == n3`
- 24 dual codons: all neighboring positions differ

This yields the active production law:

```text
40 non-dual codons x 7 rotational states = 280
24 dual codons     x 8 rotational states = 192
total                                      = 472
```

`M3_CODON_CLASS[64]` adds rotational count, Watson-Crick paired codon, and amino-acid index. `M3_RNA_FUNCTIONAL_MASK` and `M3_RNA_DARK_MASK` partition the 64 codons into 37 RNA-capable / 27 dark states. M3' should expose DNA/RNA phase as a display condition, not as a separate address law.

### Tarot

The Tarot role is the 64-to-56 symbolic compression surface plus the major/transcendent arc. In `m3.c`, `M3_TAROT_CODON_MAP[4][16]` covers all 64 codons exactly once through 56 minor cards: 48 single-codon cards plus 8 dual-codon court pairings. The court-pair rule is implemented and tested:

- Yin suits, Cups and Pentacles: Knight/Prince and King are dual-codon cards.
- Yang suits, Wands and Swords: Page/Princess and Queen are dual-codon cards.

`M3_MAJOR_ARCANA[22]` maps major arcana to chromosome pairs and amino-acid indices, and `M3_TAROT_QUATERNION_COUNT == 80` accounts for 56 minor + 22 major + 2 transcendent operators.

`Body/M/epi-tauri/src-tauri/src/oracle/tarot.rs` currently exposes a generic 78-card Rider-Waite-style deck with keywords, elements, suits, and spreads. That can support oracle UI, but it is not the codon-compression authority. M3' should bridge from M3 profile/card IDs into whatever deck presentation is active, while keeping the codon-to-card mapping sourced from the M3 codec/S2 graph law.

### Codon Rotation

The codon-rotation role is the modal-inversion surface. `rotational_state_protocol.txt` gives the dataset-generation logic: for each codon, produce negative states by fixing the first pair and varying a second pair ending in the third nucleotide, and positive states by varying a first pair starting in the first nucleotide while fixing the last pair. Raw generation is 8 states per codon at 45-degree slots.

The production distinction is not raw generation count; it is distinct rotational-state count after non-dual collapse:

- Non-dual codons have a symmetry axis and collapse to 7 distinct positions.
- Dual codons preserve 8 positions.
- Rotation index is therefore bounded by the codon's class, not by a renderer-local wheel assumption.

`m3_generate_rotational_states()` computes raw states and sorts slot order by rotational value. `M3_ROTATIONAL_PROFILE[64]` materializes the dataset-backed profile with `state_count`, state type, anchor pairs, and court-pair links. The M3 tests assert 40 seven-state reflections, 24 eight-state reflections, 40 anchors, 16 paired codons, and specifically guard `TCT` as a 7-state imperfect palindromic codon.

Local dataset note: `nodes-full-detail.json` currently reports 39 seven-state / 25 eight-state codon-reflection nodes, with one mismatch: `TCT` / Nine of Wands is marked 8/full-rotational in the JSON, while the current code/spec/test law classifies it as 7/non-dual. Treat code/spec/tests as current authority and mark this as dataset reconciliation work, not a code-value change.

### Fibonacci 60 / Pisano Overlay

The Fibonacci 60 file is best read as a clock-bridge overlay for [[M3']], not as a competing classifier. Its useful display contributions are:

- 60 Pisano positions at 6 degrees each over the 360-degree face.
- Four zeros at cardinal anchors and eight fives at zodiacal hour positions.
- Strand asymmetry of 24, matching the backbone/codon-anchor motif.
- `LCM(60, 72) = 360`, making the Fibonacci 60 and M2's 72-space co-generators of the full clock face.
- A 720-degree double-cover reading as two Pisano periods.

M3' can show this as a secondary timing/overlay layer on the codon wheel, especially for cardinal/zodiacal emphasis and period-return. It should not replace the 64-address codon/hexagram law or the M2 72-space resonance law.

## Reading / Classification / Display Pipeline Proposal

1. **Profile intake.** Consume a `MathemeHarmonicProfile` snapshot. Required fields include tick/degree/SU(2), `resonance72`, `lensMode`, `audio_octet`, `nodal_quartet`, [[Mahāmāyā]] address fields, readiness/provenance, pointer anchor, and deposition anchor. M3' must not compute a private clock.

2. **Address resolution.** Read `mahamayaAddress64` / `codonId` / `hexagramId` from the profile when present. Fallback address law, if the backend explicitly exposes it, is `floor(degree360 * 64 / 360)`. Compute line-change address as `hexagram * 6 + line_index`, but display it as backend/profile state, not as UI magic.

3. **Codec classification.** Classify the codon with the shared M3 classifier, derive rotational-state count, read `M3_ROTATIONAL_PROFILE`, resolve anticodon/amino-acid/RNA capability, and attach `evolutionaryGap` / `datasetLutState`.

4. **Graph/LUT enrichment.** Join the resolved address to dataset/S2 details: I Ching trigrams and line changes, tarot card/court metadata, DNA/RNA descriptive fields, degree-wheel relations, and symbolic imagery metadata. Missing data becomes `pending-dataset-lut`.

5. **Reading packet assembly.** Build a stable packet for UI and deposition:

```text
tick address
primary 64-address
hexagram/trigrams/changing lines/temporal hex
codon sequence/class/rotation count/rotation index
tarot card/shadow codon/court pairing
DNA/RNA phase/amino acid/anticodon
M2 evidence: resonance72, DET bitboard, cymatic symmetry evidence if present
readiness/provenance/privacy flags
```

6. **Display.** Render a layered wheel: 64 address cells, current 720-degree layer, codon glyph, hexagram glyph, minor-arcana tile, 7/8 rotational slots, line-change edge, RNA phase, paired/shadow codon, and optional Fibonacci 60 ticks. A detail panel should show why the current state is classified the way it is.

7. **Cymatic imprint.** If M2 supplies a frame or symmetry evidence, M3' displays a small imprint or evidence overlay inside the active codon/card cell. It does not run the full Chladni solver.

8. **Reading/deposition boundary.** Public symbolic state is safe-current. Private Nara interpretation, journal context, and unreconciled Graphiti body text remain out of M3' unless explicitly promoted through governed channels.

## Cymatic Expression Boundary With M2': What M3 Owns vs What M2 Owns

The clean boundary is:

- [[M2']] owns visible standing-wave generation: 72-space resonance, MEF/lens material response, elemental medium, decanic/correspondential modulation, `audio_octet` + `nodal_quartet` ingestion, Chladni/torus/sphere/grid solvers, symmetry extraction, and form residue.
- [[M2']] owns DET as evidence production: `M2_TO_M3_CYMATIC_PROJECTION[72]`, OR-superposition into a 64-bit M3 bitboard, and `floor(index72 * 8 / 9)` compression.
- [[M3]] / [[M3']] own symbolic classification after evidence enters 64-space: codon address, I Ching address, tarot card, codon class, rotational count, rotation index, paired/shadow codon, line-change operator, and reading/display semantics.
- [[M3']] may consume `audio_octet` and `nodal_quartet` for pulse/readiness display, but should not synthesize pitch, solve material response, or infer M2's resonance field locally.

Recommendation: **M2 should emit cymatic symmetry evidence; M3' should bind that evidence to codon classification.** The M2' companion spec's recommendation is right: codon symmetry-axis should map first to M2' cymatic symmetry, not directly to the M1' lens-anchor. The lens-anchor is tonal ground; the cymatic symmetry-axis is geometric ground; codon non-duality is a symbolic symmetry property. M3' should therefore combine:

```text
M1' lens/mode tonal anchor
+ M2' cymatic symmetry evidence
+ M3 codon class / rotational profile
= codon-rotation reading/display
```

This prevents role theft in both directions. M2' does not decide "this is the Nine of Wands / TCT / 7-state non-dual." M3' does not decide "this Chladni surface has these material constants." The seam is an evidence packet: `m3_bitboard`, symmetry axes, rotational/reflection confidence, nodal-line family, provenance, and frame id.

M3' display should make cymatics legible as symbolic evidence, not as the main cymatic performance. A good UX pattern is a codon-cell micro-imprint: the active card/codon cell carries a live thumbnail or glyph derived from M2's frame, while the full cymatic arena remains M2'.

## Implementation / Test Implications

- Profile work should add or stabilize M3 fields: `codonClass`, `rotationalStateCount`, `rotationalIndex`, `codonRotationProjection`, `datasetLutState`, `transcriptionState`, and an optional `cymaticEvidenceRef` / `m3Bitboard` bridge from M2.
- C/Rust parity tests should assert the same classifier across `m3.h`, `m3.c`, and `portal-core/src/codon.rs` for all 64 codons: 4 / 12 / 24 / 24 class split, 40 / 24 non-dual/dual split, and total 472 rotational states.
- Dataset import tests should assert real relation counts: 996 nodes, 4891 relations, 384 `LINE_CHANGE`, 64 `REFLECTS_DNA_FORM`, 64 `GOVERNS_TAROT_EXPRESSION`, 16 `PAIRED_AS_COURT`, and 37 `HAS_RNA_POTENTIAL`.
- Dataset reconciliation should correct or quarantine the `TCT` state-count mismatch during import. Do not weaken the current production tests to match stale data.
- M3 rotational tests should cover both raw 8-state generation and distinct 7/8-state profiles. Tests should prove sort order, non-dual anchors, paired-codon links, and rotation-degree assignment from real generated states.
- Tarot tests should prove all 64 codons are covered exactly once through 56 minor cards and 8 dual-codon court pairings. Tauri UI tests should not substitute the generic 78-card deck as the M3 codon map.
- I Ching tests should keep current values and laws: 64 hexagrams, 384 line-change operators, XOR temporal derivation, trigram decomposition, and King Wen lookup/display as currently implemented.
- M2/M3 bridge tests should use real DET behavior: every 72 index maps to a one-bit mask, OR across all 72 covers all 64 bits, and states 64-71 fold back according to the epogdoon tax.
- Frontend tests should assert that M3' renders resolved, `pending-dataset-lut`, `provisional-gap`, and audio-deferred states distinctly. They should also assert the renderer contains no hardcoded private codon/hexagram/tarot/planetary mapping tables.
- Cymatic integration tests should use an actual M2 frame/evidence packet, not mocked symbolic outcomes. M3' should be tested as a consumer of real `m3_bitboard` and symmetry evidence, then as a classifier/display surface.

## Open Research Questions

- What is the exact table for `(lens, mode, cymatic_symmetry) -> (codon, rotation)` and its partial reverse map?
- How should the eighth rotation of dual codons be presented when M1' exposes only seven CF modes?
- How should M3' normalize Thoth/Crowley-style names in the M3 C major arcana table against the Rider-Waite-style Tauri oracle deck without losing codon authority?
- Should Fibonacci 60 be implemented as a wheel overlay, a walk-without-lens, or a profile subfield? It should not become a replacement for the 16-lens covenant unless a separate architectural decision says so.
- What exact shape should `cymaticSymmetryEvidence` take: discrete symmetry group, reflection-axis count, rotational order, palindromic confidence, nodal family, or all of these?
- Which symbolic imagery assets are canonical: dataset text-derived glyphs, static card art, generated abstract glyphs, or S2-managed media references?
- Should the dataset import layer preserve stale values as historical annotations, or fail fast when current code/spec invariants differ?
- Where should the canonical M1' 84-state to M3' 472-state projection LUT live: `S0-HARMONIC-POINTER-WEB36-SPEC`, a dedicated S0 codon-rotation spec, or M3 codec data with S2 graph provenance?
