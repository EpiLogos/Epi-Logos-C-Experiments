---
coordinate: "M3'"
status: "active-domain-spec"
updated: "2026-05-31"
depends_on:
  - "[[M'-SYSTEM-SPEC]]"
  - "[[M'-TAURI-PORT-SPEC]]"
  - "[[M3-mahamaya-symbolic-transcription]]"
  - "[[2026-05-19-kernel-mprime-harmonic-clock-integration-plan]]"
  - "[[ql-musical-derivation]]"
  - "[[M1'-SPEC]]"
  - "[[M2'-SPEC]]"
  - "[[alpha_rasa_bridge_ql]]"
  - "[[m3-prime-symbolic-transcription-research]]"
  - "[[alpha_quaternionic_integration_across_M_stack]]"
  - "[[m4-prime-psychoid-cymatic-field-engine]]"
  - "[[m5-prime-epii-on-mahamaya-process-reward-rl]]"
  - "[[m4-prime-nara-day-episodes-and-oracle-artifacts]]"
  - "[[m5-prime-system-shape-and-tauri-ide-canon]]"
---

# [[M3']] Domain Spec — [[Mahāmāyā]] as Clock-Cosmos and Codon-Rotation Surface

> **M ↔ M' distinction.** [[M3]] is [[Mahāmāyā]] — the binary symbolic transcription engine: 64 DNA codons, 64 [[I-Ching]] hexagrams, 384 line-change operators, 472 rotational codon states, 56+8 [[Tarot]] compression, [[M2]] → [[M3]] epogdoon compression. [[M3']] is that engine made playable: clock-pulse surface, codon-tarot wheel, sonic/cymatic timing, and the **codon-rotation projection of [[M1']] / [[M2-1']] 84-state (lens, mode) playing landscape into the 472-state (codon, rotation) modal-inversion surface**.

> **Authority boundary.** Clock substrate lives at [[S0]] / `portal-core`; the Vimarśa audio bus is produced by [[M2-1']] and carried in the shared profile; codon classification lives below [[M3']] in the [[M3]]/[[S0]] codec path. M3' is the clock/transcription/wheel renderer that consumes those contracts. It does not own the audio bus or invent codon-classification math locally.

## §0/1 — What [[M3']] Is

[[M3']] is the **clock/cosmos and symbolic transcription surface**. It renders [[Paramaśiva]]'s tick as the operational clock for the whole stack and [[Mahāmāyā]] as DNA/I-Ching/Tarot binary transcription. It is the visible-and-audible face of the matheme's time-and-symbol axis.

[[M3]] / [[Mahāmāyā]] now has two 0-side rendering surfaces: the **M3' clock-wheel** as temporal-cosmological rendering and the **[[M0']] graph view** as structural rendering. Both consume the same canonical [[Neo4j]] substrate. The M3' wheel must not duplicate or fork the graph, and the M0' graph must not become a private clock.

Six commitments hold this domain:

1. **Paramaśiva's tick is the harmonic clock**, not a display timer. M3' visualises and sonifies the kernel-computed tick; it does not run a private renderer-clock.
2. **The 64-codon / 472-rotational-state surface is the modal-inversion landscape of the shared 84 playing-states surfaced by [[M1']] and read by [[M2-1']].** Each tarot card is a tonal signature; its 7-or-8 rotational positions are its modal inversions. See §7.
3. **M3' is the codon-classifier downstream of [[M2]]'s DET projection.** [[M2-5']] projects 72-space vibration into a 64-bit symbolic signature; [[M3]] classifies that signature into the codon-and-rotation surface; M3' renders it.
4. **[[M3-0]] is the reception/transduction threshold.** [[Paraśakti]]'s 72-fold vibration, including [[M2-5]] planetary/chakral evidence, compresses through the 9:8 DET into [[Mahāmāyā]]'s 64-bit binary substrate. M3' renders the transduction provenance and gap-state; it does not infer private chakral meaning locally.
5. **[[M3-5]] is the co-foliated world-clock synthesis.** The double-torus [[K²]] × [[T²_Mahāmāyā]] lives at M3-5 as the visible cosmic-wheel rendering downstream of [[M1-5]]'s single-torus 4π recognition and [[M2]]'s 72-fold bridge. M3' must not relocate the +1 parent or collapse M3-5 back into M1-5.
6. **M3' has three app placements over one substrate.** The default wheel, the standalone `m3-mahamaya` [[Theia]] extension, and the integrated 1-2-3 cosmic-engine plugin all consume the same kernel/profile/[[SpaceTimeDB]] stream via the kernel-bridge named in [[m5-prime-system-shape-and-tauri-ide-canon]].

## §1 — User-Facing Surface

- **Harmonic clock panel**: absolute tick, `tick12`, cycle, `degree720`, `degree360`, SU(2) layer, phase, `position6`, ratio role, pulse readiness. The 720° double-cover is shown as primary/shadow without collapsing into a 360-only display.
- **Codon/I-Ching/Tarot wheel**: 64 codon addresses arranged with 7-or-8 rotational positions per card, nucleotide bits, DNA/RNA phase, hexagram, trigrams, line-change operator, tarot compression state, shadow codon state, transcription status. The active card and its current rotational position pulse with the kernel tick.
- **(lens, mode) → (codon, rotation) projection display**: the M1' active playing-state projected onto the codon-rotation surface, showing which of the 472 (codon, rotation) cells is currently sounding.
- **M3-0 transduction provenance strip**: the M2 72-index, M2-5 planetary/chakral source handle, DET `floor(index72 * 8 / 9)` result, 64-address, gap/readiness state, and codon-quaternion summary. This strip is evidence display, not interpretation of the user's private body state.
- **Solar/cosmos panel**: planetary/chakral projection inherited from M2 profile metadata.
- **M3-5 double-torus world-clock view**: a depth mode showing the co-foliation of [[K²]] audio-genesis substrate with [[T²_Mahāmāyā]] inscription × lens substrate, using the same active tick/codon/lens data as the flat wheel.
- **Cymatic/audio pulse panel**: sounded/nodal role, chromatic note, diatonic CF/VAK projection, pending audio-driver readiness. M3' consumes the shared-profile `audio_octet` for sounded-position display and `nodal_quartet` for boundary-display on the wheel; those fields are the M2-1' Vimarśa reading of the S0/M1 substrate.
- **Graph/wheel dual surface selector**: M3' acknowledges both Mahāmāyā renderings on the 0 side: the clock-wheel temporal-cosmological rendering and the M0' bimba-map graph structural rendering. Both consume the same canonical Neo4j nodes; neither may fork Mahāmāyā into a separate substrate.

## §2 — Backend Contract Consumed

- [[S0]] kernel profile is clock authority: Paramaśiva tick drives every visual/audio/transcription state. M3' uses `audio_octet[8]` and `nodal_quartet[4]` from the shared profile; it does not synthesise.
- [[M3]] codec backend supplies integer address laws and LUT-backed details for codon, hexagram, line-change operator, [[Tarot]], and amino-acid mappings.
- [[S2]] graph law supplies configurable correspondence metadata and pointer-anchor canonicality.
- [[S3]] supplies DAY/NOW/session/deposition anchors for clock observations, Nara casts, and Graphiti episodes.
- [[M1']] supplies the active `(lens, mode)` cell that M3' projects into `(codon, rotation)` per §7.
- [[M2']] supplies the 72-vibration signature that M2-5' DET-projects to the 64-bit input M3 classifies.
- [[M2']] / M2-5 supplies planetary/chakral source metadata for M3-0 reception provenance. M3' may show the public/current handle and evidence, but never raw Nara bioquaternion or protected personal interpretation.
- [[S3]] / [[S3']] and the kernel-bridge supply the shared `world_clock` / profile subscription used by the default surface, the `m3-mahamaya` extension, and the integrated 1-2-3 plugin. M3' does not open a second private clock subscription.
- [[M5']] may consume M3 kernel-trace evidence for process-reward RL and pathway archaeology. M3' is only a renderer/inspector of those trace handles; it does not train, mutate, or promote calculation pathways.

## §3 — Required `MathemeHarmonicProfile` Fields

- `tick`: absolute tick, cycle, `tick12`, `degree720`, `degree360`, `su2Layer`, `phase`, `position6`.
- `mahamaya` / M3 projection: `mahamayaAddress64`, `hexagramId`, `upperTrigram`, `lowerTrigram`, `codonId`, `codon`, `nucleotideBits`, `dnaRnaPhase`, `lineChangeOperator`, `lineChangeOperatorAddress`, `tarotMinorId`, `tarotShadowCodon`, `aminoAcidCode`, `evolutionaryGap`, `datasetLutState`, `transcriptionState`, **`codonClass`** (`PERFECT_PALINDROMIC` / `IMPERFECT_PALINDROMIC` / `NON_PALINDROMIC_NONDUAL` / `DUAL`), **`rotationalStateCount`** (7 or 8), **`rotationalIndex`** (0 to rotationalStateCount−1).
- `resonance72`: M2 source index used by `floor(m2_vibration_index * 8 / 9)`.
- `planetaryChakral`: read-only projection used by cosmos/solar panels.
- `audio_octet[8]` and `nodal_quartet[4]` for pulse display and standing-wave rendering.
- `lensMode` and **`codonRotationProjection`**: the `(codon, rotation)` cell on the 472-state surface that the current `(lens, mode)` maps to.
- `pointerAnchor` and `depositionAnchor` for canonical coordinate and DAY/NOW binding.

## §4 — Privacy Boundary

M3' can show safe public-current clock and symbolic address data. It must not expose raw bioquaternion state, private Nara cast interpretation, journal content, or unreconciled Graphiti body text. `pending-dataset-lut` and `provisional-gap` states are honest UI states, not reasons to compute arbitrary mappings in the renderer.

Oracle artifacts from [[m4-prime-nara-day-episodes-and-oracle-artifacts]] may carry scalar M3 Tarot/I-Ching/codon references. M3' may resolve those scalar references into canonical library details when the user opens a reading inspector, but the protected-local artifact body and interpretation remain outside the M3' boundary.

## §5 — Visual / Audio Interaction Model

- **Visual:** clock, wheel, strata, and cosmos panels are driven by profile fields. The 720° SU(2) layer remains visible as primary/shadow without collapse. The codon-tarot wheel shows the 64 cards with rotational position highlighted; non-dual cards display 7 rotational slots, dual cards display 8.
- **Audio:** tick pulse, chromatic pitch class, X/X' partner, ratio role, sounded/nodal role are profile-driven. Audio can be deferred while data rendering is ready.
- **Interaction:** wheel hover/select can request [[S2]]/[[M3]] details for a symbolic address; it cannot generate codon, hexagram, tarot, or planetary mappings locally. Developer/pipeline mode may open kernel-trace and [[Janus]]-bidirectionality inspectors, but all trace facts remain backend/profile-provided.

## §6 — Readiness / Test Criteria

- Tests prove `degree360 → 64` and `m2 → m3` address fields are consumed from backend profile once present.
- Tests prove `evolutionaryGap`, `pending-dataset-lut`, and `provisional-gap` states render distinctly.
- Tests prove the renderer does not contain hardcoded private codon, hexagram, tarot, or planetary mapping tables.
- Tests prove M3' can run with data-ready / audio-deferred readiness.
- Tests prove `codonClass` and `rotationalStateCount` produce the expected 40 non-dual / 24 dual split totalling 472 rotational states (`40 × 7 + 24 × 8 = 472`).
- Tests prove the bidirectional `(lens, mode) ↔ (codon, rotation)` projection per §7 is consistent: same input always projects to same output; reverse map is single-valued where canonical.
- Tests prove the M3-0 provenance strip renders backend-provided 72-index, DET result, 64-address, and gap/readiness state without deriving private planetary/chakral meaning locally.
- Tests prove the M3-5 double-torus view and the flat wheel view render the same active `tick`, `degree720`, `(codon, rotation)`, and lens state, and neither view forks the canonical Neo4j graph substrate.
- Tests prove M3' can resolve scalar Tarot/I-Ching/codon references from protected Nara artifacts without loading protected-local artifact bodies.
- Tests prove kernel-bridge consumption is shared across default M3' surface, `m3-mahamaya` extension, and integrated 1-2-3 plugin: one backend profile stream, no duplicate private clock.
- Tests prove pipeline/developer overlays render only backend-provided kernel-trace, gap-honesty, and Janus-bidirectionality evidence; no renderer-local reward, training, or pathway-promotion logic is present.
- Readiness is blocked by the kernel profile tranche until M3 codec fields, codon-class fields, codon-rotation-projection field, and M2 resonance fields are present.

## §7 — The 472-State Modal-Inversion Landscape and the `(lens, mode) ↔ (codon, rotation)` Map

This section names the load-bearing structural feature that makes M3' the **modal-inversion surface of the shared 84-state playing landscape surfaced by M1' and read by M2-1'**.

### 7/8 rotational states are modal inversions of tonal signatures

Per [[Body/S/S0/epi-lib/include/m3.h|m3.h]] (FR 2.3.17b) and [[ql-musical-derivation]] §6.75:

```text
40 non-dual codons × 7 rotational states  = 280
24 dual codons     × 8 rotational states  = 192
Total                                      = 472
```

- **Non-dual codons (40)** carry at least one repeated adjacent nucleotide pair — they have an axis of symmetry. One of 8 possible rotational positions collapses onto the symmetry axis, yielding **7 distinct rotational states**. Musically: a tonal signature *with a tonal centre* — its tonic is the symmetry axis. The 7 rotational states ARE the 7 modal inversions of that signature (the seven scale-degrees + octave-return collapsing to 7 unique modes, exactly matching the diatonic 7-mode rotation).
- **Dual codons (24)** carry all-different nucleotides — no axis of symmetry, no rotational collapse. **8 distinct rotational states** preserved. Musically: a tonal signature *without a fixed tonal centre* — fully differentiated, octatonic/symmetric character with 8-fold rotational freedom.

Each tarot card IS one codon (one tonal signature). Its rotational positions ARE its modal inversions. Turning the card *is* changing the mode.

### The (lens, mode) ↔ (codon, rotation) bidirectional map

The 472-state codon-rotation surface is the modal-inversion projection of the shared 84-state `(lens, mode)` playing landscape.

**Forward map (M1' → M3'):**

```text
(lens, mode)  →  (codon, rotation)
```

Given an active `(lens, mode)` cell from [[M1']] (lens ∈ {0..11}, mode ∈ {1..7}):

1. The lens-anchor identifies the chromatic-substrate anchoring (which of 12 notes is the matheme-tonic). This selects the codon's **symmetry-axis nucleotide** (or, for dual codons, the active reference position).
2. The mode (CF1..CF7) identifies the active context-frame configuration. This selects the codon's **rotational index** (0..6 for non-dual, 0..7 for dual).
3. The DET projection `floor(m2_vibration_index * 8 / 9)` selects the codon within the codon-class.

**Reverse map (M3' → M1'):**

```text
(codon, rotation)  →  (lens, mode)
```

Given a `(codon, rotation)` cell:

1. The codon's class (non-dual / dual) constrains the rotational count.
2. The rotational index maps back to mode CF1..CF(7 or 8).
3. The codon's symmetry-axis (or reference position) maps back to lens-anchor.

Where rotation > 7 (dual codons in 8-rotation positions), no canonical mode exists in the 7-CF set — these rotational positions are **modal positions beyond the diatonic-7**, accessible only when the active playing-state is on a dual (fully-symmetric) codon. The 24 dual codons therefore unlock an additional rotational dimension that the 40 non-dual codons cannot reach.

### Implication: the playable landscape is dual-cardinality

M1' addresses 84 `(lens, mode)` states. M3' addresses 472 `(codon, rotation)` states. The map between them is **not 1:1**: most lens-mode cells project to non-dual codons (84 → 280 of the 472 states), and only a subset reach the 192 dual-codon-8-rotation positions. The dual codons are the **modal-symmetry tonal signatures** — the ones with octatonic-style freedom that the diatonic-7-mode landscape can't fully reach.

For the player, this means: the lens-mode selector at M1' navigates the *normal* 84 modal positions; reaching the *extended* dual-codon rotational positions requires the matheme-state to traverse a dual codon's signature, which happens at specific tick alignments visible on M3's codon wheel as rendered by M3'. The wheel is therefore a **modal-extension navigator** — the surface where the player sees which extended-rotation states are currently reachable from the current `(lens, mode)`.

### Implementation note

The forward and reverse maps must live in the kernel/profile contract as part of `MathemeHarmonicProfile.codonRotationProjection`, NOT in M3' renderer code. M3' displays the projection; the backend computes it from the M2/M3 codec path. The canonical spec of the map itself is a kernel concern that ought to land in `S0-HARMONIC-POINTER-WEB36-SPEC` as an addendum or in a dedicated `S0-CODON-ROTATION-PROJECTION-SPEC` once the LUT is materialised. Until then, M3's `codonRotationProjection` field carries `datasetLutState: pending-dataset-lut` and the projection panel renders the honest gap.

## §7.5 — Surface Philosophy: Conversational Default, Technical on Request

The full multi-matrix architecture detailed in §8 below is **load-bearing for specified outputs** (codon-class classification, rotational-state determination, DET projection, evolutionary-gap flagging, Tarot exact-cover verification, codon-quaternion charge audits). It is **not** the default user-facing rendering.

Default M3' surface is the codon-tarot wheel with the current cell active, the harmonic clock panel, and the readiness-and-provenance display. The technical inspectors (dinucleotide-matrix grid, charge-quaternion display with pp/mm/mp/pm + 4X-invariant audit, 24-spoke lattice with 12-deep ring-buffer history, suit-integral breakdown, Major Arcana chromosome panel, DNA/RNA phase mask visualisation) are **summonable** — surfaced when the user asks "what's structurally happening at this codon?" or when an operational output requires them (review evidence, dataset reconciliation, audit trail). The agent (`M5-4'` Anima/Aletheia or domain-specialist) mediates the technical depth conversationally.

This keeps M3' feeling alive and tarot-like in default use, with the multi-matrix engine reachable when a user or agent needs to *show their work*. Per [[M'-SYSTEM-SPEC]] "Default Surface" subsection.

## §8 — The Full M3 Multi-Matrix Architecture

M3' renders far more than a codon-tarot wheel. The [[Bimba]] [[M3]] layer carries a multi-matrix symbolic-transcription engine that the M3' surface must expose faithfully. The colloquial reduction to "64 codons + 472 rotational states" understates the actual structure.

### §8.1 The 2-Bit Nucleotide Logic (Polarity ⊕ Mobility)

[[Body/S/S0/epi-lib/include/m3.h|m3.h]] FR 2.3.1: each nucleotide is 2 bits, with bit 0 = polarity (Yin/Yang) and bit 1 = mobility (Moving/Resting):

| Nuc | 2-bit | I-Ching value | Line type | Tarot suit | Element |
|-----|-------|----|-----------|---------|------|
| **A** | 0x00 | **6** (Old Yin) | Yin Moving | Cups | Water (Apas) |
| **T** | 0x01 | **9** (Old Yang) | Yang Moving | Wands | Fire (Agni) |
| **C** | 0x02 | **7** (Young Yin) | Yin Resting | Pentacles | Earth (Prithvi) |
| **G** | 0x03 | **8** (Young Yang) | Yang Resting | Swords | Air (Vayu) |

Base-pairing operates as XOR with 0x01 (polarity flip, mobility preserved): A↔T (both Moving), C↔G (both Resting). The 6/9/7/8 I-Ching values are the **operative arithmetic** of the entire M3 system — every codon's rotational evaluation, charge computation, and DET projection derives from these four nucleotide-values.

DNA/RNA phase toggle (`is_rna_phase` bit) XORs polarity across the codon, implementing T↔U substitution as a single bit-flip. The mask invariants:

```text
M3_RNA_FUNCTIONAL_MASK & M3_RNA_DARK_MASK == 0
M3_RNA_FUNCTIONAL_MASK | M3_RNA_DARK_MASK == 0xFFFFFFFFFFFFFFFF
```

partition the 64-bit codon-word into RNA-functional and RNA-dark regions with no overlap and complete cover.

### §8.2 The 16-Pair Dinucleotide Matrix (3 Types)

[[M3_PAIR_MATRIX]] (`M3_PAIR_MATRIX[16]`) is the *fundamental* evaluation engine, not the codon space. Three matrix-types organise the 16 pairs:

| Type | Pairs | Operative Semantics |
|------|-------|---------------------|
| **M3_MATRIX_COMPLEMENTARY** | AT, TA, GC, CG | Watson-Crick (polarity-complementary, mobility-shared) |
| **M3_MATRIX_MOVING_RESTING** | AG, GA, TC, CT | Mobility-swap (polarity preserved, mobility flipped) |
| **M3_MATRIX_SAME_QUALITY** | AC, CA, TG, GT | Cross-diagonal (polarity + mobility both differ) |
| (Homogeneous, shared across all 3) | AA, TT, CC, GG | Zero-difference baselines |

Each pair entry holds `(sum_value, difference_value)`:

```text
sum_value      = I-Ching value of nuc1 + I-Ching value of nuc2  (range 12-18)
                  TT = 18 maximum (9+9), AA = 12 minimum (6+6),
                  all Watson-Crick = 15 (asymmetry-conserving)
difference_value = asymmetry marker indicating directionality
                  AT = -3, TA = +3 (extreme), GC/CG = ±1 (slight)
```

The 16-pair matrix is the **dinucleotide-evaluation engine that drives the rotational composition algebra** (see §8.5). Every codon's rotational states are computed by composing its outer pair (n1, n2) with its inner pair (n2, n3) using sum and difference values from this matrix.

The three matrix-type families carry explicit quaternion-axis assignments from [[M3_MATRIX_QUATERNION_AXIS]] ([[Body/S/S0/epi-lib/include/m3.h|m3.h]]:166-170): the complementary, moving/resting, and same-quality pair matrices are the i/j/k gauge axes of the same Pauli-readable quaternionic substrate. This is not a later interpretive overlay on otherwise-neutral tables; the axis assignment is literally part of the code-level [[M3]] matrix contract (per [[alpha_quaternionic_integration_across_M_stack]] §7.4).

### §8.3 Three Hexagram Transformation Matrices

Beyond the dinucleotide-evaluation matrix, M3 carries three operational 64-entry matrices that act on the hexagram-codon space:

- **`M3_COMP_MATRIX[64]` (Complementarity)**: `comp[i] = i ^ 0x3F` — flips all 6 lines of hexagram i, mapping to its full complement (the 180° I-Ching rotation).
- **`M3_MOVE_MATRIX[64]` (Movement / Trigram Swap)**: `move[i] = ((i & 0x07) << 3) | ((i >> 3) & 0x07)` — swaps the upper and lower trigrams. Structurally a kaleidoscopic flip preserving line-count.
- **`M3_RES_MATRIX[64]` (Resonance with 56+8)**: 56 valid entries + 8 gaps marked `0xFF`. The 8 gaps are evolutionary-discontinuity markers — they trigger `STATUS_PROVISIONAL` during runtime and represent the M2→M3 epogdoon-compression slack-points where the 9:8 ratio cannot quite close.

The 56+8 resonance structure of M3_RES_MATRIX is the **same 56+8 partition** that the [[Tarot]] compression uses (see §8.7). The two are different views of the same structural fact: 56 fully-resonant addresses + 8 transitional-shadow addresses cover the 64-codon space.

These 64-entry matrices are the hexagram-scale action of the same three matrix families named at §8.2. The pair-scale signature and the 64-element transformation tables are not two unrelated M3 matrix systems; they are the same i/j/k matrix architecture acting at dinucleotide scale and hexagram scale.

### §8.4 The Four-Charge Closed-Form: Codon as Quaternion in Charge-Space

This is the load-bearing structural identity of [[M3]]: **every codon evaluates to a quaternion in [[Cl(4,2)]] charge-space**.

Per `m3.h` FR 2.3.18, for codon (X, Y, Z) where X/Y/Z are the I-Ching values of outer/middle/inner nucleotides:

```text
pp = X + Y + Z   (positive-positive: triplet sum, doubly-receptive valence)
mm = X − Y − Z   (negative-negative: outer minus inner sum, doubly-active valence)
mp = X − Y + Z   (negative-positive: middle flips, ascending-through-negation)
pm = X + Y − Z   (positive-negative: inner flips, descending-through-negation)
```

The compile-time invariant **`pp + mm + mp + pm = 4X`** holds for every codon (verified by `_Static_assert` against TTT giving 4×9 = 36). The four charges *partition the codon's vibrational content across four orthogonal axes*.

**The quaternion mapping**:

```text
Quaternion q = m3_eval_to_quat(codon) = { w = pp, x = mm, y = mp, z = pm }
```

Per `m1.h` [[Cl(4,2)]] basis and quaternion-elemental mapping:

```text
q.w (pp)  = Earth  = scalar-receptive integral
q.x (mm)  = Fire   = active-negation vector
q.y (mp)  = Water  = ascending-mediation vector
q.z (pm)  = Air    = descending-articulation vector
```

**Every codon is therefore an elemental-temperament-quaternion**. Each of the 64 codons carries a specific (Earth, Fire, Water, Air) signature. The codon's elemental-quaternion lives in the **same [[Cl(4,2)]] Clifford algebra** as [[M1]]'s SU(2) ring quaternions and [[M4]]'s personal-quaternion at [[M4-4-4-4]] (see [[M4'-SPEC]] §7). All three are the same algebra at different scales.

This is what makes M3' the *symbolic-elemental-quaternionic projection* of the matheme: every wheel-position the user touches at M3' carries a four-charge elemental-quaternion that can be aligned with the user's personal-quaternion to compute resonance (see `M4'-SPEC`).

### §8.5 The Rotational Composition Algebra (Pair-Composition)

The 472 rotational states are not codon rotations (cyclic permutations of n1, n2, n3). They are computed via the **pair-composition algebra** on the 16-pair dinucleotide matrix.

For each codon (n1, n2, n3):

- **first_pair** = (n1, n2) — the outer dinucleotide
- **last_pair** = (n2, n3) — the inner dinucleotide

8 rotational states are generated:

- **4 negative-valence rotations**: fix first_pair, vary outer-of-second; result `(first << 2 | n3)` with rotation_value = `sum(first_pair) + difference(varied_pair)`
- **4 positive-valence rotations**: vary inner-of-first, fix last_pair; result `(n1 << 2 | second)` with rotation_value = `difference(varied_pair) + sum(last_pair)`

Each rotation lives at a `rotation_degrees = idx × 45°` step. After computation, the 8 are sorted by rotation_value.

**The 7/8 distinction**:

- Non-dual codons (n1==n3 OR n1==n2 OR n2==n3) have a degeneracy where `first_pair == varied_pair` at one rotation, collapsing 8 → 7 distinct states. These have an **eigenstate** at 0°/180°.
- Dual codons (n1, n2, n3 all distinct) have no degeneracy, preserving full 8-fold rotational freedom.

The 472 rotational states map to **modal inversions of tonal signatures** (see §7) precisely because the rotation operates on dinucleotide-pair compositional algebra rather than on codon-letter cycling — and the algebra has the symmetry-collapse-at-axis behaviour that the diatonic 7-mode rotation does.

### §8.6 The 384 Line-Change Operator Graph (360 + 24)

`m3.h` enforces the topology invariant:

```c
_Static_assert(360 + 24 == 64 * 6, "Clock topology: 384 = 64 hexagrams × 6 lines");
```

**384 = 64 hexagrams × 6 lines per hexagram** = the complete bit-flip transformation graph on the 64-codon space.

It also factors as:

```text
64 codons × 3 quaternionic gauge axes × 2 eigenvalue polarities = 384
```

The `64 × 3 × 2` view and the `360 + 24` clock-topology view are equivalent readings of the same line-change operator graph: gauge-axis × eigenvalue-polarity decomposition on one side, degree-wheel + 24-spoke backbone on the other.

The 384 partitions as:

- **360 dynamic degree-nodes**: every degree of the cosmic wheel maps to one hexagram-state with one active line. `CLOCK_DEGREE_LUT[360]` provides this mapping.
- **24 palindromic backbone-nodes**: positions where `degree % 15 == 0`, marking the **24-spoke 15° lattice** of the cosmic wheel. These are the structural nodes that anchor the dynamic 360 between them.

The 24-spoke 15° lattice is **the discrete-rotation lattice on [[K²]]** (see [[M1'-SPEC]] §10). Each spoke is a 15° SU(2) step; 24 spokes complete a 360° revolution; the SU(2) double-cover doubles to 48 spokes across the full 720°. The 12-deep `M3_Ring_Buffer` carries the last 12 spokes — the matheme's short-term rotational memory of `6 QL positions × 2 helices`.

The `24 × 16` partition remains important for clock UX: 24 hour-gates / backbone-spokes each carry a 16-slot internal line-change signature. This is the human-inspectable wheel form of the same 384-law.

### §8.7 The 56+8 Tarot Compression (Exact Cover of 64)

The Tarot compression of the 64-codon space is exact, not approximate. Per `M3_TAROT_CODON_MAP[4][16]`:

```text
4 suits × 14 ranks (Ace through King) = 56 Minor Arcana cards
```

But the 56 cards cover 64 codons via **8 dual-codon courts**:

| Suit | Yin / Yang | Dual-Codon Courts |
|------|----|------|
| Cups (A) | Yin | Knight, King |
| Pentacles (C) | Yin | Knight, King |
| Wands (T) | Yang | Page, Queen |
| Swords (G) | Yang | Page, Queen |

8 dual-codon cards × 2 codons each = 16 codons, plus 48 single-codon cards = 48 + 16 = **64 codons exactly covered by 56 Minor Arcana cards**.

**Major Arcana (22) + Transcendent (2) = 80 Tarot Quaternion Points**:

- 22 Major Arcana cards → **22 autosomes** (human chromosomes 1-22), via `M3_MAJOR_ARCANA[22]`
- 2 Transcendent Tarot → the X/Y sex chromosomes (likely The Fool + The World, or High Priestess + Magician — implementation-specific)

Total: 56 + 22 + 2 = 80 Tarot quaternion-points used in Tarot-to-codon-to-hexagram rotation operations.

### §8.8 The Per-Suit Integral Invariant (Sums to 360)

Sum of all `pp` (positive-positive) charges for all codons in each suit:

```text
M3_SUIT_A_INTEGRAL  =  84  (Cups: Yin Moving)
M3_SUIT_T_INTEGRAL  =  96  (Wands: Yang Moving)
M3_SUIT_C_INTEGRAL  =  88  (Pentacles: Yin Resting)
M3_SUIT_G_INTEGRAL  =  92  (Swords: Yang Resting)
─────────────────────────────
                       360  (the degree-wheel)
```

`_Static_assert(84 + 96 + 88 + 92 == 360, "360 integral invariant")`.

**This is the load-bearing structural identity**: the four elemental suit-integrals sum to the degree-wheel exactly. The codon-space's elemental partition IS the degree-wheel's elemental partition. The codon-as-quaternion-in-charge-space (§8.4) and the cosmic-wheel-as-degree-space share the same elemental [[Cl(4,2)]] structure — they are the same algebra at codon vs cosmic-wheel scales.

### §8.9 The 360°/720° SU(2) Double-Covering Wheel

`M3_Wheel_State` carries the active layer (primary = 0-359°, shadow = 360-719°), the active 24-sector bitboard, the current season (quarter), and the Heaven mode (Earlier/Later). The polar-opposite computation:

```c
polar_opposite_su2(deg_720) =
    layer_offset + ((deg_720 % 360 + 180) % 360)
```

stays within the active layer (primary or shadow), and full identity-return requires **two complete 360° rotations = 720°** — the SU(2) spinorial double-covering.

Each degree position carries: degree, shadow, quadrant, sector (0-23), trigram_earlier, trigram_later, sign (0-11), decan (0-2). The 360 degrees map to 12 signs × 3 decans × 10° each.

This 720° SU(2) wheel is the same 4π number-form as [[M1-5]]'s `DOUBLE_COVER_DEG = 720` and the α-register field-closure named in [[alpha_rasa_bridge_ql]]. [[M3-5]] is where the downstream **double-torus** formalism lives: [[K²]] × [[T²_Mahāmāyā]], not the single-torus recognition site of M1-5.

### §8.9.1 Pauli-Jung World Clock Source Warrant For M3-5

[[M3-5]]'s world-clock rendering has an explicit [[Pauli-Jung]] source warrant in Péter Várlaki and Imre J. Rudas, "Twin Concept of Fine Structure Constant as the 'Self Number-Archetype' in Perspective of the Pauli-Jung Correspondence, Part I" (Acta Polytechnica Hungarica, 2009): https://acta.uni-obuda.hu/Varlaki_18.pdf.

Várlaki and Rudas read Pauli's World Clock dream as a spatial-temporal structure isomorphic with the inverse fine-structure-constant formula `4π^3 + π^2 + π ≈ 137.036`, and they give the clock's integer skeleton as:

```text
1 + 2×32 + 2×36 = 137
```

For M3-5 this is the relevant source-backed grammar:

```text
1      = parent / common centre / black-bird support
2×32   = doubled temporal rotation-scale
2×36   = doubled spatial-quaternary clock structure
137    = world-clock integer skeleton
```

M3-5 should therefore treat `137 = 64 + 72 + 1` not merely as an internal α-rasa bridge but as a convergent World Clock rendering law: the `64` term is the doubled temporal/codon field visible at Mahāmāyā scale, the `72` term is the doubled decanic/quaternary bridge inherited from M2, and the `+1` remains the M1 parent-centre rendered through M3's clock-cosmos. This source also gives a separate cube/parity surface:

```text
1 + 8 + 128 = 137
```

That second surface warrants M3-5's eightfold-return/cube-parity affordance where it is visually or pedagogically useful, but it must not replace the primary runtime spine `M1(+1) -> M2(72) -> M3(64)` or the physical α(E) running-coupling corridor maintained in [[alpha_rasa_bridge_ql]].

## §8.10 The 137 Spine, Pauli Overlay, And Four Render Views

[[M3]] carries the **64** in `137 = 64 + 72 + 1`: the [[Mahāmāyā]] binary-genetic substrate, downstream of [[M1]]'s +1 parent and [[M2]]'s 72-fold [[Paraśakti]] bridge. The canonical spine is therefore:

```text
M1 / M1'  -> +1 parent / toroidal recognition
M2 / M2'  -> 72 vibrational-correspondential bridge
M3 / M3'  -> 64 binary-genetic matrix
```

Pauli physics-register readings are interpretive overlays on this already-operative M3 architecture. They do not create a separate bimba coordinate and must not displace the code-level i/j/k axis assignment, the 64-codon substrate, or the 384 line-change graph.

M3' should support four representational views as depth modes over the same data:

- **Flat Clock Debug**: degree, tick, codon, line-change, and readiness facts plainly inspectable.
- **Lens Annulus**: the 16+1 Mahāmāyā lens-stack as cosmic wheel and as frequency-filter backdrop for the personal field.
- **Toroidal / World Clock**: `K² × T²_Mahāmāyā` double-torus rendering, with the Várlaki/Rudas Pauli-Jung World Clock source available as provenance for the M3-5 rendering grammar.
- **Hopf Identity**: identity trajectory projected through the SU(2) / Hopf surface into visible state.

Open issue: the TEMP holding context is inconsistent about the "17th lens" language. Canonical M3' should not silently add a new lens. Treat the current law as **16 lens positions plus a Level-0 meta-position** until the companion spec normalises the terminology.

## §8.11 Janus Temporal Doorway

Every codon-rotation is a [[Janus]] doorway: one face reads backward as inherited symbolic state, the other reads forward as possible transformation. M3' should expose this as bidirectional temporal orientation, not as fortune-telling certainty. In [[M4']] personal rendering, the Janus modulation becomes a temporal-processual reading layer; in M3' it remains a clock/codon affordance grounded in [[L3]] / [[L3']] / [[L2']] transformational structure.

## §8.12 M3-0 Reception Law: 72 → 64 Chakral-Genetic Transduction

[[alpha_quaternionic_integration_across_M_stack]] §6.4 sharpens [[M3-0]] as the reception ground where [[M2-5]]'s planetary/chakral vibration becomes [[Mahāmāyā]]'s binary-genetic articulation. M3' absorbs that law as a render contract, not as a new classifier: the backend supplies the 72-source evidence, the DET compression result, the [[M3]] codon address, and the codon-quaternion evaluation; M3' displays the chain.

The displayed transduction is:

```text
M2-5 planetary/chakral 72-source
  -> DET floor(index72 * 8 / 9)
  -> M3 64-address
  -> nucleotide triplet / I-Ching value triplet
  -> codon quaternion (pp, mm, mp, pm)
```

The M3-0 view may annotate polarity/mobility semantics only when those annotations are supplied by the profile or S2 graph. It must not reverse-engineer chakra phase, element activation, or personal meaning from a codon address. When 72→64 epogdoon folding produces a collision, gap, or provisional state, the view renders provenance and readiness honestly instead of pretending the compression is globally injective.

This M3-0 law is the reception-side companion to §7's playable modal-inversion law: §7 tells how the 84 `(lens, mode)` landscape projects onto the 472 `(codon, rotation)` surface; §8.12 tells how M2's 72 vibrational evidence enters the 64-address substrate before that surface can be rendered. [[m3-prime-symbolic-transcription-research]] remains the operational reading/classification/display source for this boundary.

## §8.13 M3-5 Surface Law: Co-Foliated Double-Torus and 0-Side Dual Rendering

[[M3-5]] is the mythic synthesis wheel where [[M1]]'s single-torus 4π recognition and [[M2]]'s 72-fold bridge have unfolded into the visible cosmic wheel. The M3-5 surface is therefore not just a more ornate clock. It is the co-foliated surface:

```text
K²                         ×  T²_Mahāmāyā
chromatic-fifths double       inscription-circle × lens-circle
cover / audio-genesis         symbolic-transcription substrate
```

M3' may render this as Flat Clock Debug, Lens Annulus, Toroidal / World Clock, or Hopf Identity, but all four views must remain depth modes over the same profile and graph state. The [[M0']] graph view is [[Mahāmāyā]]'s structural rendering; the M3' wheel is Mahāmāyā's temporal-cosmological rendering. Both are operational on the 0 side and both consume the same canonical [[Neo4j]] substrate, per [[m4-prime-psychoid-cymatic-field-engine]] §18 and §19.2.

The M3-5 world-clock render is hosted as shared current state at [[S3']] / Universal NOW where implementation supplies that substrate, but M3' remains a frontend consumer. The wheel does not become the [[SpaceTimeDB]] authority, and the graph does not become a private clock.

## §8.14 App Surface and Pipeline Hooks

[[m5-prime-system-shape-and-tauri-ide-canon]] assigns [[M3]] to the standalone `m3-mahamaya` [[Theia]] extension and to the integrated 1-2-3 cosmic-engine plugin. The standalone extension is the pedagogical/deep-inspection surface: cosmic wheel, codon-tarot navigator, 16+1 lens-stack inspector, three-matrix gauge-trio explorer, and [[Janus]] doorway orientation. The integrated 1-2-3 plugin composes [[M1]] + [[M2]] + [[M3]] as the full cosmic-engine surface, with [[M3-5]] showing M1's tick and M2's planetary/chakral bridge as one active substrate.

The kernel-bridge is the only live-data conduit for these app surfaces. It supplies the shared `MathemeHarmonicProfile`, `world_clock`, audio bus handles, cymatic evidence handles, and kernel-trace handles when available. M3' surfaces can inspect those handles; they cannot duplicate C tables, keep local codon/tarot/planetary mapping tables, or run a private clock.

[[m5-prime-epii-on-mahamaya-process-reward-rl]] adds an [[M5]] operational capacity over [[Mahāmāyā]]'s calculation pathways: process-reward RL, federated learning, symbolic-genetic synthesis, and pathway archaeology. That capacity lives at M5, not at M3'. M3' may expose developer/pipeline overlays for kernel traces, gap-honesty, [[Janus]]-bidirectionality, and pathway provenance, but reward computation, training, governance, and runtime promotion remain outside the renderer.

## §9 — How M3' Renders This Multi-Layer Architecture

M3' exposes the full multi-matrix surface as a coherent user-facing wheel + matrix-inspectors. Key panels added beyond the basic clock + codon wheel:

- **Dinucleotide-matrix inspector**: shows the 16-pair matrix with the current codon's first_pair and last_pair highlighted; shows sum/difference values; shows which matrix-type each pair belongs to.
- **Charge quaternion display**: shows the current codon's (pp, mm, mp, pm) as a quaternion in [[Cl(4,2)]], with elemental labelling (Earth/Fire/Water/Air). Shows the 4X invariant audit.
- **Tarot compression panel**: shows the active codon's tarot card identity; highlights when a dual-codon court is currently the active reading; shows the per-suit integral as the cosmic-wheel elemental breakdown.
- **Major Arcana / Chromosome panel**: when the active codon participates in a Major Arcana mapping, shows the corresponding chromosome reference.
- **24-spoke lattice display**: shows the 360°/720° wheel with the 24 backbone-spokes highlighted, the active SU(2) layer, and the 12-deep ring-buffer history.
- **DNA/RNA phase toggle**: explicit switch showing which codons are RNA-functional vs RNA-dark.
- **Four render-view modes**: Flat Clock Debug, Lens Annulus, Toroidal, and Hopf Identity, all backed by the same M3 profile fields.
- **Janus orientation overlay**: bidirectional look-back / look-forward modulation for codon-rotation state.
- **M3-0 provenance strip**: M2-5 source handle, 72-index, DET result, active 64-address, codon-quaternion summary, and gap/readiness state.
- **M3-5 co-foliation inspector**: shows the active [[K²]] audio-genesis coordinate and [[T²_Mahāmāyā]] inscription/lens coordinate as two readings of the same wheel-state.
- **Oracle reference resolver**: opens safe canonical M3 Tarot/I-Ching/codon library details from scalar artifact references without loading protected Nara artifact bodies.
- **Kernel-trace / pathway overlay**: developer-only inspector for backend-provided trace, gap-honesty, Janus-bidirectionality, and M5 pathway-provenance evidence.

## §10 — Implementation Notes

The harmonisation pass of 2026-05-22 added §7 to M3'-SPEC as load-bearing law: M3' is the codon-rotation modal-inversion surface, not merely a clock-and-wheel display. The `codonClass` / `rotationalStateCount` / `rotationalIndex` / `codonRotationProjection` profile fields are now required for full M3' rendering; before they exist in the backend, M3' renders the wheel with pending-LUT honest states.

The `(lens, mode) ↔ (codon, rotation)` map specification is **the next concrete kernel/profile-contract work** that follows from this harmonisation pass. Until the LUT is materialised, the projection is a documentation contract; once materialised, it becomes the load-bearing surface that joins the shared 84-state playing landscape to M3's 472-state modal-inversion surface — and the instrument becomes capable of playing the full modal extension that dual codons unlock.

The 2026-05-30 alpha-quaternionic pass adds that M3' is also the 0-side temporal rendering of [[Mahāmāyā]] alongside [[M0']] graph rendering. Future implementation must keep those as two views over the same canonical substrate, with the unresolved Level-0 / "17th lens" wording flagged for companion-spec normalisation rather than buried in UI code.

The 2026-05-31 canon update absorbs four additional M3' deltas: M3-0 as 72→64 reception/transduction provenance; M3-5 as the co-foliated double-torus world-clock view; `m3-mahamaya` / integrated 1-2-3 app placement through the kernel-bridge; and M5 pipeline overlays as read-only renderer evidence rather than local training logic.

### §10.1 Open Questions and Held Contradictions

- [[m3-prime-symbolic-transcription-research]] reports a dataset/code mismatch: `TCT` / Nine of Wands is marked 8/full-rotational in the JSON but is 7/non-dual in current code/spec/tests. M3' keeps code/spec/tests as runtime authority and treats the dataset value as reconciliation work.
- [[alpha_quaternionic_integration_across_M_stack]] consistently places the `+1` parent at M1 in §0, §1, and §6.1, but §1.1 still contains wording that can read as M0 witness-axis-as-+1. M3' follows the M1(+1) / M2(72) / M3(64) spine and flags the M0/M1 wording for companion normalisation.
- The 72→64 M3-0 reception source says chakral-vibrational state compresses to a unique codon at a tick, while DET is also an epogdoon compression with fold-back/gap behaviour. The profile contract must define the uniqueness scope before UI or tests assume global injectivity.
- [[m4-prime-psychoid-cymatic-field-engine]] §10.2 labels L3/L3' with causal-Aristotelian/process-causal language, while the current MEF table assigns causal law to L1, processual becoming to L3, and chronological arc to L3'. M3' keeps Janus as temporal-processual orientation without relocating causal law.
- The "17th lens" / "16+1" wording remains unresolved. M3' treats the law as 16 lens positions plus a Level-0 / Fibonacci-Pisano meta-position until M0'/M3'/M4' companion specs converge.
- The exact kernel/profile home for `codonRotationProjection`, M3-0 provenance, kernel-trace handles, and Janus-bidirectional trace shape remains unapplied. Candidate homes remain `S0-HARMONIC-POINTER-WEB36-SPEC`, a dedicated S0 codon-rotation/provenance spec, or M3 codec data with S2 graph provenance.
