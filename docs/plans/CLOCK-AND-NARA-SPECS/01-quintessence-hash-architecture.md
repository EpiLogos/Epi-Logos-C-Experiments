# Quintessence Hash Architecture — Corrected

**Status:** Canonical correction (2026-03-15)
**Supersedes:** Any prior description of M4_Quintessence_Identity taking M4.0-M4.5 as inputs.

> **Identity minimum for portal entry:** Natal data (#4.0-0) is the ONLY required sub-system.
> Layers #4.0-1 through #4.0-4 are additive enrichment. Their absence does NOT invalidate the
> system — it marks the hash as `partial: true` and lowers `quintessence_weight`. The portal
> opens with natal data alone.

---

## Core Correction

The quintessence hash is **NOT** a synthesis across all of M4's branches (oracle, transform, logos, etc.).

It is the quintessence OF #4.0's own sub-systems (#4.0-0 through #4.0-4) — the 5th element that
emerges when the 4 elemental expressions of the IDENTITY layer itself are in balance.

**Input boundary:** natal/birth data only. Birthdate encoding = our framework for parsing birth data
through the QL coordinate system — same data as the natal chart, different parsing register.

---

## The 5 Sub-Systems of #4.0 Identity

Each sub-system is a complete identity matrix in its own right. Each carries the 4 elements
(FIRE/WATER/EARTH/AIR → ACTG nucleotides) as its structural backbone:

| Coord | System | 4-Element Backbone | Description |
|---|---|---|---|
| #4.0-0 | Natal Chart | Sun/Moon/Rising/Dominant planet → elem | Raw planetary configuration at birth. All 10 planet degrees (Sun–Pluto). Earth is geocentric observer/center; excluded from array. |
| #4.0-1 | Gene Keys | Shadow/Gift/Siddhi → elem mapping | 64 Gene Keys derived from birth data. Each key carries elemental quality. |
| #4.0-2 | Human Design | Type/Profile/Centers/Channels → elem | HD chart from birth data + 88° transit (soul position). Defined/undefined centers = active/passive elem. |
| #4.0-3 | Jungian Typology | Sensation/Feeling/Intuition/Thinking | The 4 functions ARE the 4 elements. Birth configuration → dominant/inferior function assignment. |
| #4.0-4 | QL Birth Encoding | QL coordinate of birth date → elem | Date parsed through QL position system: day_position, month_family, year_archetype, time_phase → 4 QL coords. |

**The quintessence** = Akasha/5th element = emerges when variance across the 4 elemental
expressions is LOW — when all 5 sub-systems converge on similar elemental balance.
Low nucleotide_balance variance → Quintessence present.

---

## Hash Computation

```c
typedef struct {
    // The 5 sub-system elemental profiles (each = 4 floats summing to 1.0)
    float  profile_40_natal[4];      // natal chart elemental balance [FIRE,WATER,EARTH,AIR]
    float  profile_40_genekeys[4];   // gene keys elemental balance
    float  profile_40_humandesign[4]; // human design elemental balance
    float  profile_40_jungian[4];    // jungian function elemental balance
    float  profile_40_ql_birth[4];   // QL birth encoding elemental balance

    // Quintessence metric: how much all 5 agree
    float  variance;                 // low = quintessence present, high = tension/becoming
    float  quintessence_weight;      // 1.0 - variance = how "quintessential" this identity is

    // The natal planetary configuration (source of truth for #4.0-0)
    // planet_degrees[10]: Sun(0) through Pluto(9). Earth excluded (geocentric observer/center).
    // Sun is the stable root/parent. 9 non-Sun orbiting bodies (Moon–Pluto) = 9:8 epogdoon
    // against 8 chakras. Uranus at index 7. See 00-canonical-invariants.md §2 for full table.
    float  planet_degrees[10];       // [Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto]

    // The hashes
    uint8_t natal_hash[32];          // BLAKE3 of full natal config — NEVER changes
    uint8_t live_hash[32];           // BLAKE3 of current elemental state — updates as sub-systems refine

    // Component hashes (8 bytes each for quick comparison)
    uint8_t h_natal[8];
    uint8_t h_genekeys[8];
    uint8_t h_humandesign[8];
    uint8_t h_jungian[8];
    uint8_t h_ql_birth[8];
} M4_Quintessence_Identity;
```

**`natal_hash`** = BLAKE3 of all 10 planet_degrees + birth_date + birth_location.
Fixed forever at first `epi nara identity set`.

**`live_hash`** = BLAKE3(h_natal || h_genekeys || h_humandesign || h_jungian || h_ql_birth).
Updates as user fills in gene keys, refines HD chart, etc. Does NOT update from oracle casts.

---

## Bimba/Pratibimba in the Hash Context

- **Bimba** = ALWAYS implicate = the source these systems all reflect FROM = the #4.0-0 natal chart
  (Earth as geocentric observer, the irreducible ground of the birth moment)
- **Pratibimba** = the explicate reflections = #4.0-1 through #4.0-4 (Gene Keys, HD, Jungian, QL —
  each is a different mirror of the same birth-ground)

The natal chart IS the Bimba. The 4 derived systems are Pratibimbas of it, each casting a different
light. The quintessence = the essence that ALL four reflections agree on.

---

## HARD REQUIREMENT: Totality Within #4.0

All 5 sub-systems MUST be represented in the FINAL quintessence — not for portal entry.

**Natal-only is a fully functional starting state.** The portal opens with #4.0-0 alone.
A partial hash (e.g., just natal chart) is a "pallid reflection" in the sense that it
represents a single surface reading rather than the full quintessence — but it is NOT
invalid and MUST NOT block the user from entering the portal or using any other sub-system.

The system MUST:
1. Accept partial data gracefully (some sub-systems may not be filled in yet)
2. Mark the hash as `partial = true` when any sub-system beyond #4.0-0 is missing
3. Prompt the user to complete missing sub-systems (#4.0-1 through #4.0-4) as enrichment
4. Only produce a `quintessence_weight > 0.5` when at least 4 of 5 sub-systems are present

**Completion arc:** natal (#4.0-0) → gene keys (#4.0-1) → human design (#4.0-2) →
jungian (#4.0-3) → QL birth encoding (#4.0-4) → full quintessence. Each addition raises
`quintessence_weight`. Only the fully complete hash (all 5 present) can reach weight ≥ 0.5.

---

## Quintessence Quaternion Derivation (→ PortalClockState)

The `quintessence_quaternion: [f32; 4]` in `PortalClockState` is the elemental distillation
of the entity's identity — the weighted average of all five #4.0 identity profiles, normalized
to a unit quaternion. It is the "stable ground reference" for the torus visualization.

**Derivation:**

```rust
/// Compute the quintessence quaternion from the 5 elemental identity profiles.
/// Each profile is [FIRE, WATER, EARTH, AIR] (4 floats summing to ~1.0).
/// pp=T(Earth/w), nn=A(Fire/x), np=G(Water/y), pn=C(Air/z)
pub fn compute_quintessence_quaternion(identity: &M4QuintessenceIdentity) -> [f32; 4] {
    let profiles = [
        identity.profile_40_natal,
        identity.profile_40_genekeys,
        identity.profile_40_humandesign,
        identity.profile_40_jungian,
        identity.profile_40_ql_birth,
    ];

    // Count valid (non-zero) profiles for weighted average
    let valid: Vec<_> = profiles.iter()
        .filter(|p| p.iter().any(|&v| v > f32::EPSILON))
        .collect();
    let n = valid.len() as f32;
    if n < f32::EPSILON { return [1.0, 0.0, 0.0, 0.0]; }

    // Average across valid profiles: each profile is [FIRE, WATER, EARTH, AIR]
    let mut avg = [0.0f32; 4];
    for p in &valid {
        avg[0] += p[0];  // FIRE   → A nucleotide → x (nn charge)
        avg[1] += p[1];  // WATER  → G nucleotide → y (np charge)
        avg[2] += p[2];  // EARTH  → T nucleotide → w (pp charge)
        avg[3] += p[3];  // AIR    → C nucleotide → z (pn charge)
    }
    // Map FIRE/WATER/EARTH/AIR → w/x/y/z (Earth=w, Fire=x, Water=y, Air=z)
    let w = avg[2] / n;  // EARTH → w
    let x = avg[0] / n;  // FIRE  → x
    let y = avg[1] / n;  // WATER → y
    let z = avg[3] / n;  // AIR   → z

    // Normalize to unit quaternion
    let mag = (w*w + x*x + y*y + z*z).sqrt();
    if mag < f32::EPSILON { return [1.0, 0.0, 0.0, 0.0]; }
    [w/mag, x/mag, y/mag, z/mag]
}
```

**Quintessence weight modulation:** When `variance` is very low (all 5 profiles agree),
the quintessence_weight approaches 1.0 and the quaternion IS the stable identity ground.
When variance is high (profiles conflict), the average is still taken — the tension IS
the identity signature at this stage of development. The `quintessence_weight` field
can scale visual emphasis in the spine plugin but does not alter the quaternion computation.

**Updates:** The quintessence_quaternion updates only when `epi nara identity` is augmented
(new sub-system filled in). It does NOT update from oracle casts (live_quaternion is for that).

---

## Clock Integration

The natal_hash maps to a clock degree via:
```
natal_degree = (natal_hash[0] | natal_hash[1]<<8) % 360
```
This is the entity's Bimba address on the cosmic clock — their ground position.

The `planet_degrees[10]` gives 10 clock positions (Sun through Pluto) — the full natal
distribution. The entity IS this distribution, not a single point. The `natal_degree` is the
geometric center of gravity of all 10 planetary positions.
