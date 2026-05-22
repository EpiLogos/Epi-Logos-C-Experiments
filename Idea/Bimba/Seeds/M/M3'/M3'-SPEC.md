---
coordinate: "M3'"
status: "active-domain-spec"
updated: "2026-05-22"
depends_on:
  - "[[M'-SYSTEM-SPEC]]"
  - "[[M'-TAURI-PORT-SPEC]]"
  - "[[M3-mahamaya-symbolic-transcription]]"
  - "[[2026-05-19-kernel-mprime-harmonic-clock-integration-plan]]"
  - "[[ql-musical-derivation]]"
  - "[[M1'-SPEC]]"
  - "[[M2'-SPEC]]"
---

# [[M3']] Domain Spec — Mahāmāyā as Clock-Cosmos and Codon-Rotation Surface

> **M ↔ M' distinction.** M3 is [[Mahāmāyā]] — the binary symbolic transcription engine: 64 DNA codons, 64 I-Ching hexagrams, 384 line-change operators, 472 rotational codon states, 56+8 Tarot compression, M2 → M3 epogdoon compression. M3' is that engine made playable: clock-pulse surface, codon-tarot wheel, sonic/cymatic timing, and the **codon-rotation projection of M1''s 84-state (lens, mode) playing landscape into the 472-state (codon, rotation) modal-inversion surface**.

> **Authority boundary.** Audio-genesis math lives at `S0` / `portal-core`. M3' is the clock/transcription/wheel renderer that consumes the shared profile. It does not own the audio bus or the codon-classification math — both live below.

## §0/1 — What [[M3']] Is

[[M3']] is the **clock/cosmos and symbolic transcription surface**. It renders [[Paramaśiva]]'s tick as the operational clock for the whole stack and [[Mahāmāyā]] as DNA/I-Ching/Tarot binary transcription. It is the visible-and-audible face of the matheme's time-and-symbol axis.

Three commitments hold this domain:

1. **Paramaśiva's tick is the harmonic clock**, not a display timer. M3' visualises and sonifies the kernel-computed tick; it does not run a private renderer-clock.
2. **The 64-codon / 472-rotational-state surface is the modal-inversion landscape of M1''s 84 playing-states.** Each tarot card is a tonal signature; its 7-or-8 rotational positions are its modal inversions. See §7.
3. **M3' is the codon-classifier downstream of M2's DET projection.** M2-5' projects 72-space vibration into a 64-bit symbolic signature; M3 classifies that signature into the codon-and-rotation surface; M3' renders it.

## §1 — User-Facing Surface

- **Harmonic clock panel**: absolute tick, `tick12`, cycle, `degree720`, `degree360`, SU(2) layer, phase, `position6`, ratio role, pulse readiness. The 720° double-cover is shown as primary/shadow without collapsing into a 360-only display.
- **Codon/I-Ching/Tarot wheel**: 64 codon addresses arranged with 7-or-8 rotational positions per card, nucleotide bits, DNA/RNA phase, hexagram, trigrams, line-change operator, tarot compression state, shadow codon state, transcription status. The active card and its current rotational position pulse with the kernel tick.
- **(lens, mode) → (codon, rotation) projection display**: the M1' active playing-state projected onto the codon-rotation surface, showing which of the 472 (codon, rotation) cells is currently sounding.
- **Solar/cosmos panel**: planetary/chakral projection inherited from M2 profile metadata.
- **Cymatic/audio pulse panel**: sounded/nodal role, chromatic note, diatonic CF/VAK projection, pending audio-driver readiness. M3' consumes the kernel's `audio_octet` for sounded-position display and `nodal_quartet` for boundary-display on the wheel.

## §2 — Backend Contract Consumed

- [[S0]] kernel profile is clock authority: Paramaśiva tick drives every visual/audio/transcription state. M3' uses `audio_octet[8]` and `nodal_quartet[4]` from the shared profile; it does not synthesise.
- M3 codec backend supplies integer address laws and LUT-backed details for codon, hexagram, line-change operator, Tarot, and amino-acid mappings.
- [[S2]] graph law supplies configurable correspondence metadata and pointer-anchor canonicality.
- [[S3]] supplies DAY/NOW/session/deposition anchors for clock observations, Nara casts, and Graphiti episodes.
- [[M1']] supplies the active `(lens, mode)` cell that M3' projects into `(codon, rotation)` per §7.
- [[M2']] supplies the 72-vibration signature that M2-5' DET-projects to the 64-bit input M3 classifies.

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

## §5 — Visual / Audio Interaction Model

- **Visual:** clock, wheel, strata, and cosmos panels are driven by profile fields. The 720° SU(2) layer remains visible as primary/shadow without collapse. The codon-tarot wheel shows the 64 cards with rotational position highlighted; non-dual cards display 7 rotational slots, dual cards display 8.
- **Audio:** tick pulse, chromatic pitch class, X/X' partner, ratio role, sounded/nodal role are profile-driven. Audio can be deferred while data rendering is ready.
- **Interaction:** wheel hover/select can request S2/M3 details for a symbolic address; it cannot generate codon, hexagram, tarot, or planetary mappings locally.

## §6 — Readiness / Test Criteria

- Tests prove `degree360 → 64` and `m2 → m3` address fields are consumed from backend profile once present.
- Tests prove `evolutionaryGap`, `pending-dataset-lut`, and `provisional-gap` states render distinctly.
- Tests prove the renderer does not contain hardcoded private codon, hexagram, tarot, or planetary mapping tables.
- Tests prove M3' can run with data-ready / audio-deferred readiness.
- Tests prove `codonClass` and `rotationalStateCount` produce the expected 40 non-dual / 24 dual split totalling 472 rotational states (`40 × 7 + 24 × 8 = 472`).
- Tests prove the bidirectional `(lens, mode) ↔ (codon, rotation)` projection per §7 is consistent: same input always projects to same output; reverse map is single-valued where canonical.
- Readiness is blocked by the kernel profile tranche until M3 codec fields, codon-class fields, codon-rotation-projection field, and M2 resonance fields are present.

## §7 — The 472-State Modal-Inversion Landscape and the `(lens, mode) ↔ (codon, rotation)` Map

This section names the load-bearing structural feature that makes M3' the **modal-inversion surface of M1''s 84-state playing landscape**.

### 7/8 rotational states are modal inversions of tonal signatures

Per `m3.h` (FR 2.3.17b) and `ql-musical-derivation` §6.75:

```text
40 non-dual codons × 7 rotational states  = 280
24 dual codons     × 8 rotational states  = 192
Total                                      = 472
```

- **Non-dual codons (40)** carry at least one repeated adjacent nucleotide pair — they have an axis of symmetry. One of 8 possible rotational positions collapses onto the symmetry axis, yielding **7 distinct rotational states**. Musically: a tonal signature *with a tonal centre* — its tonic is the symmetry axis. The 7 rotational states ARE the 7 modal inversions of that signature (the seven scale-degrees + octave-return collapsing to 7 unique modes, exactly matching the diatonic 7-mode rotation).
- **Dual codons (24)** carry all-different nucleotides — no axis of symmetry, no rotational collapse. **8 distinct rotational states** preserved. Musically: a tonal signature *without a fixed tonal centre* — fully differentiated, octatonic/symmetric character with 8-fold rotational freedom.

Each tarot card IS one codon (one tonal signature). Its rotational positions ARE its modal inversions. Turning the card *is* changing the mode.

### The (lens, mode) ↔ (codon, rotation) bidirectional map

The 472-state codon-rotation surface is the modal-inversion projection of M1''s 84-state `(lens, mode)` playing landscape.

**Forward map (M1' → M3'):**

```text
(lens, mode)  →  (codon, rotation)
```

Given an active `(lens, mode)` cell from M1' (lens ∈ {0..11}, mode ∈ {1..7}):

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

For the player, this means: the lens-mode selector at M1' navigates the *normal* 84 modal positions; reaching the *extended* dual-codon rotational positions requires the matheme-state to traverse a dual codon's signature, which happens at specific tick alignments visible on M3''s codon wheel. The wheel is therefore a **modal-extension navigator** — the surface where the player sees which extended-rotation states are currently reachable from the current `(lens, mode)`.

### Implementation note

The forward and reverse maps must live in the kernel as part of `MathemeHarmonicProfile.codonRotationProjection`, NOT in M3' renderer code. M3' displays the projection; the kernel computes it. The canonical spec of the map itself is a kernel concern that ought to land in `S0-HARMONIC-POINTER-WEB36-SPEC` as an addendum or in a dedicated `S0-CODON-ROTATION-PROJECTION-SPEC` once the LUT is materialised. Until then, M3''s `codonRotationProjection` field carries `datasetLutState: pending-dataset-lut` and the projection panel renders the honest gap.

## §8 — Implementation Notes

The harmonisation pass of 2026-05-22 added §7 to M3'-SPEC as load-bearing law: M3' is the codon-rotation modal-inversion surface, not merely a clock-and-wheel display. The `codonClass` / `rotationalStateCount` / `rotationalIndex` / `codonRotationProjection` profile fields are now required for full M3' rendering; before they exist in the backend, M3' renders the wheel with pending-LUT honest states.

The `(lens, mode) ↔ (codon, rotation)` map specification is **the next concrete kernel work** that follows from this harmonisation pass. Until the LUT is materialised, the projection is a documentation contract; once materialised, it becomes the load-bearing surface that joins M1''s 84-state playing landscape to M3''s 472-state modal-inversion surface — and the instrument becomes capable of playing the full modal extension that dual codons unlock.
