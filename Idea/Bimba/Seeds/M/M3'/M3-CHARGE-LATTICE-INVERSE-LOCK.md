# M3 Charge-Lattice Inverse Lock

Status: focused executable derivation boundary for issue #28  
Coordinate: `M3-2 / M3′`  
Runtime owner: `Body/S/S0/portal-core/src/mahamaya_charge_lattice.rs`  
Upstream elemental selector: `M3-ELEMENTAL-PRIMARY-SELECTION-LOCK.md`

## 0. Ground

The current M3 C kernel and capability matrix define every codon `XYZ` by the four exact charges:

```text
pp = X + Y + Z
mm = X - Y - Z
mp = X - Y + Z
pm = X + Y - Z
```

where `X`, `Y`, `Z` are the canonical I-Ching nucleotide values:

```text
A = 6
T = 9
C = 7
G = 8
```

The C kernel stores this as `M3_CodonEvaluation` and lifts it directly into the raw quaternion `(pp,mm,mp,pm)`.

The transform itself is exactly invertible:

```text
X = (pp + mm + mp + pm) / 4
Y = (pp - mm - mp + pm) / 4
Z = (pp - mm + mp - pm) / 4
```

A valid M3 charge tuple therefore determines one codon exactly when all three inverse numerators divide by four and the recovered site values are members of `{6,9,7,8}`. No proximity rule is required.

## 1. Exact raw-charge recognition

The executable relation is:

```text
raw M3 charge tuple
(pp,mm,mp,pm)
        ↓ exact inverse
(X,Y,Z) in {6,9,7,8}³
        ↓
A/T/C/G × 3
        ↓
canonical address64
```

This is a recognition law over the already-defined M3 charge lattice. Off-lattice tuples remain unresolved; they are not rounded to the nearest site value or codon.

The relation is reciprocal with the existing forward calculation:

```text
address64 → nucleotide values → raw four charges
raw four charges → nucleotide values → address64
```

All 64 canonical addresses must round-trip through that pair exactly.

## 2. Normalized quaternion is a different representation

`portal-core::codon_charge_quaternion()` currently normalizes the raw charge quaternion to unit length. That representation preserves charge **direction** but discards charge **magnitude**.

This distinction is materially observable. The four homogeneous codons:

```text
AAA
TTT
CCC
GGG
```

have proportionally identical raw charge vectors and therefore collapse onto the same normalized unit-quaternion direction.

Consequently:

```text
raw charge tuple → codon
  can be exact and unique

normalized charge quaternion → codon
  can be zero, one, or multiple exact lattice candidates
```

A normalized quaternion must therefore be treated as a recognition/candidate surface, not as a total primary-address selector.

## 3. No nearest-neighbour inverse

The current M3 matrix still leaves this upstream relation unresolved:

```text
Q_entity / Q_composed
        ↓ ?
canonical M3 charge/form lattice
```

This lock does not turn arbitrary quaternions into codons by nearest angular distance, dominant component, sign threshold, rounding, or another convenience rule.

For a supplied normalized quaternion, the runtime may only report canonical codon candidates whose existing normalized charge vectors fall within an explicit tolerance. The outcomes remain typed:

```text
0 matches  = off-charge-lattice
1 match    = unique exact-lattice candidate
>1 matches = ambiguous exact-lattice candidates
```

The four homogeneous codons provide the required ambiguity fixture.

## 4. Relation to the elemental selector

PR #35 / `M3-ELEMENTAL-PRIMARY-SELECTION-LOCK.md` established a second lawful entrance to the same 64-space:

```text
three resolved L2′ material sites
→ A/T/C/G × 3
→ address64
```

The charge-lattice inverse and elemental selector are reciprocal evidentiary routes into one M3 form, not competing definitions:

```text
resolved L2′ sites ──────────→ address64
                                  ↑
raw four-charge lattice ──────────┘
```

A later Q_entity/Q_composed selector can use these as independent discriminants. It should resolve a primary address only when the upstream source law actually determines sufficient material/charge evidence.

## 5. Acceptance

The executable cut must prove:

1. all 64 canonical codons round-trip exactly through raw charges;
2. raw off-lattice tuples fail without rounding;
3. normalized homogeneous codons remain the explicit four-way `AAA/TTT/CCC/GGG` ambiguity;
4. a non-homogeneous normalized canonical charge can resolve uniquely when its exact lattice direction is unique;
5. an arbitrary unit quaternion may remain off-lattice;
6. no API in this cut claims to solve `Q_entity/Q_composed → primary codon`.

This advances #28 by making the already-invertible charge layer executable while preserving the actual upstream research boundary.