---
coordinate: "M2'"
status: "active-domain-spec"
updated: "2026-05-19"
depends_on:
  - "[[M'-SYSTEM-SPEC]]"
  - "[[M'-TAURI-PORT-SPEC]]"
  - "[[M2-parashakti-vibrational-architecture]]"
  - "[[2026-05-19-kernel-mprime-harmonic-clock-integration-plan]]"
---

# [[M2']] Domain Spec

[[M2']] is the harmonic/correspondential matrix. It renders [[Parāśakti]] as the 72-fold vibrational field where MEF lenses, elements, planetary-chakral alignments, modes, scales, and semantic resonance are all read from one shared profile.

## User-Facing Surface

- MEF lens matrix with 12 lens anchors by 6 positions.
- Dual resonance index display: legacy 6-lens/helix encoding and 12-anchor encoding.
- Element panel distinguishing P-position element from L2' element-bearing value.
- Planetary/chakral/musical alignment panel showing body/center, element, ratio role, scale/mode color, and canonical graph-law provenance.
- Mode/scale panel showing diatonic CF/VAK projection as contextual rotation over the chromatic substrate.

## Backend Contract Consumed

- [[S0]] / kernel profile supplies tick, chromatic harmonic state, diatonic projection, resonance72, and elemental projection.
- [[S2]] graph law supplies configurable planetary/chakral/musical correspondences and source provenance.
- [[S3]] supplies DAY/NOW/session context when a harmonic observation is deposited.
- M2' must treat the M2 72-space as the vibrational source that M3 compresses to 64 through `72 * 8 / 9 = 64`.

## Required `MathemeHarmonicProfile` Fields

- `resonance72.legacyResonanceIndex`.
- `resonance72.lensAnchorIndex`.
- `resonance72.lensAnchor`, `resonance72.position`, `resonance72.helixBit`, and helix/phase.
- `elements.pPositionElement`.
- `elements.l2PrimeElement`.
- `planetaryChakral`: body/center id, chakra role, element, musical role, ratio role, mode/scale color, provenance, and configurability status.
- `diatonic`: degree, pitch class, note, mode, mode-anchor CF, VAK register, context agent.
- `harmonic`: ratio role including `9/8` epogdoon as living bridge.

## Privacy Boundary

M2' may show public canonical correspondences and safe-current active profile data. It must not hardcode or expose private tradition-sensitive mapping choices in renderer code. Exact planetary/chakral/codon correspondences come from S2 graph law and profile metadata. Personal resonance observations are protected-local unless explicitly promoted through governed S5'/S1' review.

## Visual / Audio Interaction Model

- Visual: matrix cells pulse by resonance72 and profile tick; planetary/chakral rows highlight from active backend projection.
- Audio: scale/mode color comes from `planetaryChakral` and `diatonic`, not local arrays. Epogdoon `9/8` is the generative pulse bridge.
- Interaction: changing view mode rotates presentation over the same profile; it does not mutate the underlying chromatic 12, helix law, or S2 canonical mapping.

## Readiness / Test Criteria

- Tests prove the two resonance index encodings agree for all 72 positions.
- Tests prove M2' can render pending/configurable correspondence states without inventing defaults.
- Tests prove P-position and L2' element fields are displayed as distinct fields.
- Tests prove mode/scale labels are hidden or marked pending when profile provenance is absent.
- Readiness is blocked by the kernel profile tranche until `resonance72`, `elements`, and `planetaryChakral` are backend fields.
