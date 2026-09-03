# M3 Elemental Primary-Selection Lock

Status: focused executable derivation boundary for issue #28  
Coordinate: `M3-2 / M3′`  
Runtime owner: `Body/S/S0/portal-core/src/mahamaya_primary_selection.rs`  
Upstream score hinge: `M3-RECIPROCAL-SCORE-HINGE-LOCK.md`

## 0. Ground

The current M3 capability matrix and C kernel already establish one exact four-state relation:

```text
A = 00 = Yin  + Moving  = Cups       = Water
T = 01 = Yang + Moving  = Wands      = Fire
C = 10 = Yin  + Resting = Pentacles  = Earth
G = 11 = Yang + Resting = Swords     = Air
```

The current authored L2′ relation places the Alchemical-Elemental aperture between situated elemental/bioquaternionic constitution and this nucleotide fourfold:

```text
elemental / bioquaternionic constitution
        ↓ L2′
qualitative material reading
        ↓
A/T/C/G four-state articulation
```

A codon is then the already-executable three-site composition:

```text
outer nucleotide  : 2 bits
middle nucleotide : 2 bits
inner nucleotide  : 2 bits
                  ──────
address64          : 6 bits

address64 = outer<<4 | middle<<2 | inner
```

This lock makes only that already-determined composition executable. It does not manufacture the still-open inverse from an arbitrary continuous/composed quaternion to the three qualitative material readings.

## 1. Determined selector

For one already-resolved L2′ material site:

```text
Water → A → 00
Fire  → T → 01
Earth → C → 10
Air   → G → 11
```

For three source-backed material sites:

```text
L2′ outer  + L2′ middle + L2′ inner
        ↓        ↓             ↓
      A/T/C/G  A/T/C/G       A/T/C/G
        └────────┬─────────────┘
                 ↓
          canonical address64
```

This is a deterministic primary-address selector because both relations are already native M3 laws: material fourfold → nucleotide two-bit value, then three two-bit nucleotide positions → six-bit codon/address.

`Aether`, `Mineral`, and other implicate/boundary readings are not members of the four-state nucleotide material alphabet and therefore do not receive convenience coercions.

## 2. Remaining quaternion inverse

The unresolved source relation remains upstream:

```text
Q_entity / Q_composed
        ↓ ?
three resolved L2′ material sites
```

The current M3 matrix explicitly says the exact deterministic inverse from a continuous or composed elemental quaternion to the primary nucleotide/codon address is not yet a settled kernel law.

Therefore this implementation requires provenance-bearing resolved site readings rather than deriving them by nearest quaternion, dominant component, sign threshold, modulo arithmetic, or any other convenience rule.

This distinction is load-bearing:

```text
established implementation fact
  three resolved material sites → address64

active research/body seam
  Q_entity / Q_composed → those three site readings
```

## 3. Runtime contract

`M3ElementalPrimarySelectionInput` carries:

```text
outer  { element, source_ref }
middle { element, source_ref }
inner  { element, source_ref }
source_entity_or_event_ref
m2_source_ref?
provenance_refs[]
```

`M3ElementalPrimaryAddressSelection` returns:

```text
address64
nucleotide_bits[3]
nucleotide_symbols[3]
l2_prime_elements[3]
site_source_refs[3]
selection_derivation_ref
upstream_quaternion_inverse_state
provenance_refs[]
```

The resulting address can enter the existing `M3PrimarySelectionEvidence` / reciprocal score hinge. Line-change index, M2 vibration address, DNA/RNA phase, optional rotation, and temporal context remain separately evidenced. The selector does not infer them from the codon.

## 4. M2 / L2′ relation

M2 already exposes bounded current-world evidence and an explicit L2′ element field through `M2RelationPlan`. Those fields may provide source references for a resolved site; they do not by themselves prove how one arbitrary `Q_entity` or `Q_composed` decomposes into all three codon sites.

The correct continuation is therefore to recover or authoritatively derive the upstream **three-site material-reading law** from the existing elemental/bioquaternionic, M2, charge and operator structure. Once that law is proven, it can feed this selector directly and the external resolved-site boundary can disappear.

## 5. Acceptance

The bounded executable cut must prove:

1. `Water/Fire/Earth/Air` map exactly to `A/T/C/G = 00/01/10/11`;
2. all `4³ = 64` ordered material triples map bijectively to all 64 codon addresses;
3. `Aether`, `Mineral`, and unresolved labels are rejected rather than coerced;
4. the resulting address enters the existing reciprocal M3 score hinge without fabricated rotation or clock state;
5. provenance retains the three L2′ site sources, M3 matrix/C-kernel authority, optional M2 source, and world/entity/event source;
6. the implementation continues to state explicitly that `Q_entity/Q_composed → three L2′ sites` remains unresolved.

This is an executable narrowing of #28, not closure of the full primary-selection programme.
