# S0 Codon-Rotation Projection Spec

Status: runtime foothold implemented in `portal-core`

## Purpose

This spec names the kernel-side bridge between M1'/M2' musical navigation and M3' symbolic transcription:

```text
(lens, mode) in 12 x 7 musical landscape
  <-> codon-rotation cell in 472-state Mahamaya surface
```

The projection lives in `portal-core`, not in M1', M2', M3', or renderer code. M' surfaces consume `MathemeHarmonicProfile.codonRotationProjection` as a public-current profile field.

## Cardinality Law

The codon-rotation surface has 472 cells:

- 40 non-dual codons x 7 rotations = 280 cells
- 24 dual codons x 8 rotations = 192 cells
- Total = 472 cells

The dual/non-dual split is computed from the existing M3 codon classifier. A codon is dual when all three nucleotide positions are mutually distinct; otherwise it is non-dual for this 40/24 modal-extension surface.

## Forward Map

Forward lookup maps each of the 84 M1'/M2' playing cells into the full 472-cell M3' surface:

```text
surface_index = ceil((lens * 7 + mode) * 472 / 84)
```

The indexed surface cell supplies:

- `codonId`
- `codon`
- `codonClass`
- `rotation`
- `rotationalStateCount`
- `rotationDegrees`
- `surfaceIndex`

The projection also carries `lensLabel`, `modeName`, reverse lens/mode anchors, `datasetLutState = materialized-kernel-lut`, and provenance.

## Reverse Map

Reverse lookup maps any valid `(codon, rotation)` cell to a lens-mode anchor family:

```text
lens_mode_index = floor(surface_index * 84 / 472)
lens = lens_mode_index / 7
mode = lens_mode_index % 7
```

For forward-produced anchors, reverse lookup returns the originating `(lens, mode)`.

## q_cosmic

`MathemeHarmonicProfile.qCosmic` is derived from the projected codon using the M3 charge quaternion:

```text
pp = X + Y + Z
mm = X - Y - Z
mp = X - Y + Z
pm = X + Y - Z
q_cosmic = normalize([pp, mm, mp, pm])
```

Nucleotide I-Ching values are `A=6`, `T=9`, `C=7`, `G=8`. This keeps M3 codon-charge quaternions interoperable with M1' SU(2) and later M4' personal-quaternion resonance.

## Tests

`portal-core/tests/m_prime_shared_contracts.rs` proves:

- the generated surface has exactly 472 cells;
- dual cells count `24 x 8`;
- non-dual cells count `40 x 7`;
- every one of the 84 `(lens, mode)` cells maps forward;
- every forward projection reverse-maps to its original lens and mode.
