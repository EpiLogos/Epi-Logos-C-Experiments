---
coordinate: "M3'"
status: "active-domain-spec"
updated: "2026-05-19"
depends_on:
  - "[[M'-SYSTEM-SPEC]]"
  - "[[M'-TAURI-PORT-SPEC]]"
  - "[[M3-mahamaya-symbolic-transcription]]"
  - "[[2026-05-19-kernel-mprime-harmonic-clock-integration-plan]]"
---

# [[M3']] Domain Spec

[[M3']] is the clock/cosmos and symbolic transcription surface. It renders [[Paramaśiva]]'s tick as harmonic clock and [[Mahāmāyā]] as DNA/I-Ching/Tarot binary transcription. It is not a private renderer clock.

## User-Facing Surface

- Harmonic clock panel: absolute tick, tick12, cycle, degree720, degree360, SU(2) layer, phase, position6, ratio role, and pulse readiness.
- Codon/I-Ching/Tarot wheel: 64 address, codon, nucleotide bits, DNA/RNA phase, hexagram, trigrams, line-change operator, tarot compression state, shadow codon state, and transcription status.
- Solar/cosmos panel: planetary/chakral projection inherited from M2 profile metadata, not renderer constants.
- Cymatic/audio pulse panel: sounded/nodal role, chromatic note, diatonic CF/VAK projection, and pending audio-driver readiness.

## Backend Contract Consumed

- [[S0]] kernel profile is clock authority: Paramasiva tick drives every visual/audio/transcription state.
- M3 codec backend supplies integer address laws and LUT-backed details.
- [[S2]] graph law supplies configurable correspondence metadata and pointer-anchor canonicality.
- [[S3]] supplies DAY/NOW/session/deposition anchors for clock observations, Nara casts, and Graphiti episodes.

## Required `MathemeHarmonicProfile` Fields

- `tick`: absolute tick, cycle, `tick12`, `degree720`, `degree360`, `su2Layer`, `phase`, `position6`.
- `binary` / M3 projection: `mahamayaAddress64`, `hexagramId`, `upperTrigram`, `lowerTrigram`, `codonId`, `codon`, `nucleotideBits`, `dnaRnaPhase`, `lineChangeOperator`, `lineChangeOperatorAddress`, `tarotMinorId`, `tarotShadowCodon`, `aminoAcidCode`, `evolutionaryGap`, `datasetLutState`, and `transcriptionState`.
- `resonance72`: M2 source index used by `floor(m2_vibration_index * 8 / 9)`.
- `planetaryChakral`: read-only projection used by cosmos/solar panels.
- `pointerAnchor` and `depositionAnchor` for canonical coordinate and DAY/NOW binding.

## Privacy Boundary

M3' can show safe public-current clock and symbolic address data. It must not expose raw bioquaternion state, private Nara cast interpretation, journal content, or unreconciled Graphiti body text. `pending-dataset-lut` and `provisional-gap` states are honest UI states, not reasons to compute arbitrary mappings in the renderer.

## Visual / Audio Interaction Model

- Visual: clock, wheel, strata, and cosmos panels are driven by profile fields. The 720-degree SU(2) layer remains visible as primary/shadow without collapsing it to a 360-only display.
- Audio: tick pulse, chromatic pitch class, X/X' partner, ratio role, and sounded/nodal role are profile-driven. Audio can be deferred while data rendering is ready.
- Interaction: wheel hover/select can request S2/M3 details for a symbolic address; it cannot generate codon, hexagram, tarot, or planetary mappings locally.

## Readiness / Test Criteria

- Tests prove `degree360 -> 64` and `m2 -> m3` address fields are consumed from backend profile once present.
- Tests prove `evolutionaryGap`, `pending-dataset-lut`, and `provisional-gap` states render distinctly.
- Tests prove the renderer does not contain hardcoded private codon, hexagram, tarot, or planetary mapping tables.
- Tests prove M3' can run with data-ready/audio-deferred readiness.
- Readiness is blocked by the kernel profile tranche until M3 codec fields and M2 resonance fields are present.
