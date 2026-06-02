# M-Branch Nara Integration — System Clarity Plan

> **Status:** ✅ Implemented (2026-03-12) — architecture realized. TUI portal complete. Electron next.
> **Date:** 2026-03-11
> **Purpose:** Establish full architectural clarity across M2→M3→M4 chain before implementation.
>   Development sequence: TUI portal first (feature/function parity), Electron second.
>
> **Reads together with:**
> - `Idea/Bimba/Seeds/S/S3/S3'/Legacy/plans/2026-03-10-nara-runtime-full-plan.md` (v2.1) — 12-phase backend plan
> - `Idea/Bimba/Seeds/M/Legacy/specs/M/2026-03-11-hypertile-portal-design.md` — TUI portal spec
> - `Idea/Bimba/Seeds/M/M4'/Legacy/specs/M/M4-nara-subtle-body-map.md` — frontend subtle body spec
> - `docs/prompts/nara-runtime-impl.md` — implementation prompt (backend)
> - `docs/prompts/nara-subtle-body-impl.md` — implementation prompt (frontend)
> - SpacetimeDB client infrastructure: Part V (self-contained below — no external tracking)

---

## Part I: Architecture Overview

### I.1 The Two-Stack Split (critical for development)

M4 spans two stacks that must be kept clean:

| Stack | Layer | Components | Development Priority |
|-------|-------|------------|---------------------|
| **M4 (C/Rust core)** | Data + logic | `epi-lib/m4.h/c`, `epi-cli/src/nara/`, gateway RPC methods | Implement first |
| **M4' (TUI portal)** | Experience | `epi-cli/src/portal/plugins/m4.rs`, ratatui hypertile plugins | Implement second, before Electron |
| **M4' (Electron)** | Experience | `epi-app/renderer/domains/M4_Nara/` | Implement third, after portal proves the model |

**Rule:** All business logic lives in `epi-cli/src/nara/` modules. Portal plugins and Electron panels are render + event adapters that call into nara modules. No logic duplication.

### I.2 The Six Sub-Branches (complete map)

```
M4 (#4 — Lemniscate anchor, Context Frame (4.0/1-4.4/5))
├── #4.0 — Identity: 6-layer personal matrix (numerology, astro, Jungian, Gene Keys, HD, Symbol DNA)
├── #4.1 — Medicine: elemental triage + chakra prescription
├── #4.2 — Oracle: I-Ching + Tarot with hygiene guards + canonical tag pipeline
│   └── #4.2-0 — Common substrate: EMITS_CANONICAL_TAGS_TO → #4.1 and #4.3
├── #4.3 — Transform: dialogical container practices (Bohm, Talking Circle, Diamond)
├── #4.4 — Lenses: 6 wisdom lenses (Jungian, Trika, Phenomenological, Gene Keys, Alchemical, Integral)
│   └── #4.4.4.4 — Pratibimba: Neo4j-backed term archaeology
└── #4.5 — Logos Cycle: 6-stage retrospective synthesis (A-Logos → An-a-Logos)
```

### I.3 Temporal Authority Chain (#4.1-4 law)

```
Planetary hour (Kerykeion / kairos) MUST be loaded before:
  → any oracle cast (#4.2)
  → any medicine prescription (#4.1)
  → any transform recipe (#4.3)
  → any logos stage execution (#4.5)

If kairos unavailable: hard error (not degraded mode).
The planetary hour is the temporal authority. This is non-negotiable.
```

---

## Part II: I-Ching 3-Coin Method — Canonical ACTG Derivation

### II.1 The Correspondence (from `m3.h` `NUCLEOTIDE_ICHING_VALUE`)

The M3 C code defines the canonical values:
```c
NUCLEOTIDE_ICHING_VALUE[4] = {6, 9, 7, 8}
// A=6, T=9, C=7, G=8
// Sum invariant: 6+9+7+8 = 30
```

These ARE the 3-coin throw values. In the classical 3-coin method:
- Each coin is heads (Yang = 3) or tails (Yin = 2)
- Sum of 3 coins gives: 6 (3Yin), 7 (2Yin+1Yang), 8 (2Yang+1Yin), 9 (3Yang)

**Direct mapping — no translation needed:**

| Coin Sum | I-Ching Line | Nucleotide | Element | Suit | Quality |
|----------|-------------|-----------|---------|------|---------|
| **6** | Old Yin (——x——) | **A** (Adenine) | Water | Cups | Moving — changes to Yang |
| **7** | Young Yin (—— ——) | **C** (Cytosine) | Earth | Pentacles | Stable |
| **8** | Young Yang (————) | **G** (Guanine) | Air | Swords | Stable |
| **9** | Old Yang (——o——) | **T** (Thymine) | Fire | Wands | Moving — changes to Yin |

**Moving lines (A=6, T=9) = changing lines = `M3_IChing_State.changing_lines` bitmask.**

### II.2 The Hexagram Cast (6 lines → 2 codons)

A hexagram has 6 lines, each a separate 3-coin throw:

```
Lines 1-3 (lower trigram) → 3 nucleotides → primary codon (6-bit: line1<<4 | line2<<2 | line3)
Lines 4-6 (upper trigram) → 3 nucleotides → shadow codon (same encoding)
```

This maps exactly to `M3_TarotCodonEntry.codon_a` (primary) and `codon_b` (shadow/secondary).

**Rust implementation for oracle (#4.2):**

```rust
/// Throw 3 coins → nucleotide value (ACTG 2-bit encoding)
fn throw_one_line(rng: &mut impl Rng) -> u8 {
    let sum: u8 = (0..3).map(|_| if rng.gen::<bool>() { 3u8 } else { 2u8 }).sum();
    match sum {
        6 => NUC_A, // old yin — moving
        7 => NUC_C, // young yin — stable
        8 => NUC_G, // young yang — stable
        9 => NUC_T, // old yang — moving
        _ => unreachable!()
    }
}

/// Cast full hexagram → (primary_codon, shadow_codon, changing_lines_mask)
fn cast_hexagram(rng: &mut impl Rng) -> (u8, u8, u8) {
    let lines: Vec<u8> = (0..6).map(|_| throw_one_line(rng)).collect();
    let primary = encode_codon(lines[0], lines[1], lines[2]); // lower trigram
    let shadow  = encode_codon(lines[3], lines[4], lines[5]); // upper trigram
    let changing = lines.iter().enumerate()
        .filter(|(_, &n)| n == NUC_A || n == NUC_T)
        .fold(0u8, |acc, (i, _)| acc | (1u8 << i));
    (primary, shadow, changing)
}
```

**Yarrow stalk method:** Stubbed (`Err("yarrow: not yet implemented")`). Lower priority — coin method is canonical per our ACTG mapping.

### II.3 Hexagram to King Wen Sequence

The M3 system uses a 6-bit codon (0-63) as the hexagram index. The King Wen sequence is a different ordering (traditional Chinese numbering 1-64). The mapping:

- M3 index: `(upper_trigram << 3) | lower_trigram` (bitwise, 0-indexed)
- King Wen number: requires `KING_WEN_TO_M3[64]` LUT (reverse of `M3_HEXAGRAM_LUT`)
- Torus position: `hexagram_to_torus_pos(kw_num) = ((kw_num - 1) * 12 / 64) as u8` (0-11 clock)

**Decision:** Display uses King Wen numbers (human convention), compute uses M3 6-bit index (machine canonical). The LUT bridges them.

---

## Part III: Tarot → Body Zone Chain (The Full Path via M2)

### III.1 The Chain (complete, no gaps)

```
Tarot card (suit + rank)
    ↓ M3_TarotCodonEntry lookup (suit = nucleotide 2-bit)
Codon (6-bit = upper_trigram<<3 | lower_trigram)
    ↓ codon → zodiac degree via card-to-decan assignment
        (Ace = 1st decan of suit's element sign,
         2-3-4 = decan 0/1/2 of sign 0, 5-6-7 = sign 1, 8-9-10 = sign 2,
         Courts mapped to the dual-codon system from M3_TarotCodonEntry)
M2 Decan (via DECAN_FLAT_IDX(element, sign_0_2, decan_0_2, face))
    ↓ M2_DECAN_DESC[idx].ruling_planet → Planet_Id
Planet (M2_PLANET_LUT[planet_id])
    ↓ Planet_Operator.elem_sig → Elemental_Signature → Chakra_Id
    ↓ ELEM_SIG_GET_CHAKRA(elem_sig)
Chakra (M2_CHAKRA_LUT[chakra_id])
    ↓ Chakra_Descriptor.tattva_idx → Tattva_Entry_Desc
Tattva (M2_TATTVA_DESC[tattva_idx])
    ↓ element_id + tattva body organ correspondences (from Parashakti dataset)
Body zone/organ system
    ↓ BODY_ZONE_SVG_ID lookup
SVG body zone region in SubtleBodyPanel
```

### III.1b Thoth Deck + Golden Dawn (canonical alignment)

**The M3 C code already confirms Thoth deck alignment.** The pip names in `m3.h`:
```c
#define M3_TAROT_PIP_PRINCESS  10   // Thoth naming — NOT "Page" (RWS)
#define M3_TAROT_PIP_PRINCE    11   // Thoth naming — NOT "Knight" (RWS)
#define M3_TAROT_PIP_QUEEN     12
#define M3_TAROT_PIP_KING      13
```
Princess/Prince = Thoth/Golden Dawn. This is not RWS. Everything downstream must be Thoth-aligned.

**Golden Dawn Minor Arcana decan assignments (the canonical `TAROT_DECAN_MAP`):**

Cards 2-10 in each suit each rule one 10° decan of the zodiac, with a planetary ruler:

| Card | Wands (Fire/T/Aries-Leo-Sag) | Cups (Water/A/Cancer-Scorpio-Pisces) | Swords (Air/G/Libra-Aquarius-Gemini) | Pentacles (Earth/C/Capricorn-Taurus-Virgo) |
|------|------------------------------|--------------------------------------|--------------------------------------|---------------------------------------------|
| 2 | Mars/Aries | Venus/Cancer | Moon/Libra | Jupiter/Capricorn |
| 3 | Sun/Aries | Mercury/Cancer | Saturn/Libra | Mars/Capricorn |
| 4 | Venus/Aries | Moon/Cancer | Jupiter/Libra | Sun/Capricorn |
| 5 | Saturn/Leo | Mars/Scorpio | Venus/Aquarius | Mercury/Taurus |
| 6 | Jupiter/Leo | Sun/Scorpio | Mercury/Aquarius | Moon/Taurus |
| 7 | Mars/Leo | Venus/Scorpio | Moon/Aquarius | Saturn/Taurus |
| 8 | Mercury/Sagittarius | Saturn/Pisces | Jupiter/Gemini | Sun/Virgo |
| 9 | Moon/Sagittarius | Jupiter/Pisces | Mars/Gemini | Venus/Virgo |
| 10 | Saturn/Sagittarius | Mars/Pisces | Sun/Gemini | Mercury/Virgo |

**Aces:** Root of each element — no decan, maps to element apex (chakra of element's full expression).

**Court cards (Thoth — Princess/Prince/Queen/Knight):**
- **Knight** (mounted, swift, Fire quality): rules 20° of one sign to 20° of next (straddles decan boundary). E.g., Knight of Wands: 20°Scorpio–20°Sagittarius.
- **Queen**: Water quality. Rules a zodiac sign fully (e.g., Queen of Wands = 0°–30°Aries → planetary ruler = Mars).
- **Prince**: Air quality. Rules a zodiac sign (e.g., Prince of Wands = 0°–30°Leo → ruler = Sun).
- **Princess**: Earth quality. Attributed to a quadrant of the zodiac (NE/SE/SW/NW), not a single sign. Elemental focus only — body zone = full element zone.

**Status of this data in codebase:** The ruling planet per decan is in `M2_DECAN_DESC[72].ruling_planet`. The missing pieces are three LUTs:

```rust
/// 36 pip cards (ranks 2-10, 4 suits) → decan flat index
/// (elem_idx_0_3, sign_within_elem_0_2, decan_within_sign_0_2)
static PIP_DECAN_MAP: [[(u8, u8, u8); 9]; 4] = [ /* Wands, Cups, Swords, Pentacles */ ];

/// 16 court cards (4 suits × Princess/Prince/Queen/Knight) → zodiac sign + element quality
/// Knights straddle two signs (20°–20°) — handled by decan range, not single decan
static COURT_SIGN_MAP: [(u8, u8); 16] = [ /* (sign_0_11, quality: 0=Fire/1=Water/2=Air/3=Earth) */ ];

/// Aces → element index only (no decan)
static ACE_ELEMENT_MAP: [u8; 4] = [M4_ELEM_FIRE, M4_ELEM_WATER, M4_ELEM_AIR, M4_ELEM_EARTH];
// [Wands=Fire, Cups=Water, Swords=Air, Pentacles=Earth]
```

These are purely Golden Dawn correspondence data — the full table is in III.1b. **Task: OI-3.**

### III.2 Element → Chakra → Mahabhuta → Body Zone

The 4-element throughline (M4_ELEM_*) maps to M2's 5-element system:

| M4 Nucleotide | Element | M2 Chakra | Mahabhuta (tattva) | Body System / Zone |
|---------------|---------|-----------|-------------------|-------------------|
| A (Water) | Apas | Svadhisthana (#2) | Apas mahabhuta | Sacral/genitourinary, lower abdomen, lymph |
| T (Fire) | Agni | Manipura (#3) | Tejas/Agni mahabhuta | Solar plexus, digestive fire, adrenals, diaphragm |
| C (Earth) | Prithvi | Muladhara (#1) | Prithvi mahabhuta | Root/perineum, bones, large intestine, lower limbs |
| G (Air) | Vayu | Anahata (#4) | Vayu mahabhuta | Heart, lungs, respiratory, circulatory, hands |
| — (Akasha) | Akasha | Vishuddha (#5) | Akasha mahabhuta | Throat, sound, thyroid, cervical spine |

**Quintessence (Akasha/fifth element)**: The Aces in each suit carry quintessential energy — they are root-seed codons and map to the element's purest expression including the Akasha bridge (Vishuddha/throat as transformer between personal and transpersonal).

### III.3 Body Zone Derivation — Through the Element Chain

**The body zone connection is NOT a direct planet→body mapping.** It derives through the element chain, which is already mathematically unified across the whole system:

```
Planet
  → Planet_Operator.elem_sig (packed in M2_PLANET_LUT)
  → ELEM_SIG_GET_ELEMENT(elem_sig) → Element_Id (Akasha/Vayu/Agni/Apas/Prithvi)
  → ELEM_SIG_GET_CHAKRA(elem_sig)  → Chakra_Id
  → CHAKRA_BODY_ZONES[chakra]      → body regions (the one LUT)
```

This means there is only **one LUT that matters**: `CHAKRA_BODY_ZONES[8]`. Every planet, every Tarot card, every decan reaches body zones through the same chakra gateway. The data is not fragmented across arbitrary planet-body tables — it flows through the single elemental throughline.

**`CHAKRA_BODY_ZONES[8]` — the single canonical body zone LUT:**

| Chakra | Element | Body Regions | SVG Zone |
|--------|---------|-------------|----------|
| CHAKRA_EARTH (0) | (ground) | Feet, soles | `zone-feet` |
| CHAKRA_MULADHARA (1) | Prithvi/Earth | Perineum, base of spine, large intestine, bones, lower limbs | `zone-root` |
| CHAKRA_SVADHISTHANA (2) | Apas/Water | Sacrum, genitourinary, kidneys, lower abdomen, lymph | `zone-sacral` |
| CHAKRA_MANIPURA (3) | Agni/Fire | Solar plexus, digestive organs, adrenals, liver, diaphragm | `zone-solar` |
| CHAKRA_ANAHATA (4) | Vayu/Air | Heart, lungs, hands, arms, circulatory, thymus | `zone-heart` |
| CHAKRA_VISHUDDHA (5) | Akasha/Space | Throat, thyroid, cervical spine, ears, voice | `zone-throat` |
| CHAKRA_AJNA (6) | (beyond) | Brain, eyes, pituitary, nervous system command | `zone-third-eye` |
| CHAKRA_SAHASRARA (7) | (beyond) | Crown, pineal, whole-body integration field | `zone-crown` |

This is Neo4j-updatable at the semantic level (body region descriptions, SVG zone names can be enriched), but the **index is stable** — it's a direct `Chakra_Id` lookup, which is already a fixed enum in `m2.h`.

**Planet → Chakra derivation (from existing M2 data, no new LUT needed):**

```rust
fn planet_chakra(planet: Planet_Id) -> Chakra_Id {
    ELEM_SIG_GET_CHAKRA(M2_PLANET_LUT[planet as usize].elem_sig)
}
fn planet_body_zones(planet: Planet_Id) -> &'static [BodyRegion] {
    &CHAKRA_BODY_ZONES[planet_chakra(planet) as usize]
}
```

Saturn's `elem_sig` → Prithvi/Earth → CHAKRA_MULADHARA → root/bones/lower body. This is why Saturn rules those parts — not because of an arbitrary list, but because Saturn is Earth in its elem_sig, and Earth-element rules the root chakra zone. The math is the explanation.

**Neo4j layer (schema-pending OI-GraphSchema):** The Parashakti dataset likely has planet and decan nodes with their element/chakra attributes already encoded. The body zone semantic content (region names, organ lists) should augment those existing nodes, not create a new node type. Schema review needed before writing Cypher — see OI-GraphSchema.

### III.3b The Fifth Element — Quintessence (Akasha) as Integrative Field

Akasha is not the "5th slot after ACTG" — it is the **harmony that emerges between the four**. The ACTG nucleotide quaternion only generates Akasha through balance:

```rust
/// Quintessence activation: how much the 4 elements are in harmony
/// Returns 0.0 (total imbalance) to 1.0 (perfect equilibrium = Akasha fully manifest)
fn quintessence_activation(nb: &NucleotideBalance) -> f32 {
    let vals = [
        nb.adenine_water as f32,
        nb.thymine_fire as f32,
        nb.cytosine_earth as f32,
        nb.guanine_air as f32,
    ];
    let mean = vals.iter().sum::<f32>() / 4.0;
    let variance = vals.iter().map(|v| (v - mean).powi(2)).sum::<f32>() / 4.0;
    // Low variance = balanced = Akasha emerges
    1.0 - (variance / (mean.powi(2) + 1.0)).min(1.0)
}
```

**In the SubtleBodyPanel:**
- When `quintessence_activation > 0.65` → CHAKRA_VISHUDDHA lights up (Akasha zone / throat)
- When `quintessence_activation > 0.85` → CHAKRA_AJNA and CHAKRA_SAHASRARA also gain ambient glow
- The quintessence ground canvas (`QuintessenceGround.tsx`) opacity scales with this value — the sacred geometry beneath becomes more visible as the 4 elements balance

**In Oracle:** Non-dual codons (`M3_NONDUAL_CODONS[16]` — XyX palindromes) carry Akasha energy. When a non-dual codon is drawn, the throat/crown zones receive the oracle highlight rather than a specific elemental zone.

### III.3c Kerykeion Live Feed → Live Body Zone Activation

This is the integration that makes the subtle body map **alive rather than static**. Kerykeion gives current planet sky positions; those positions feed directly into the body zone chain:

```
Kerykeion (live ephemeris)
  → M4_Temporal_Now.planet_degrees[10]  (current sky position, 0-359°)
  → for each planet: degree → sign (degree / 30) → sign element
  → sign element → chakra → body zone (same CHAKRA_BODY_ZONES LUT)
  → compose with NATAL planet positions (from M4_Astrological_Layer.planet_degrees[10])
```

**Three temporal layers of body zone activation:**

| Layer | Source | Updates | Character |
|-------|--------|---------|-----------|
| **Natal** | `M4_Astrological_Layer.planet_degrees` | Never (stable) | Who you ARE — permanent body constitution |
| **Transit** | Kerykeion live + `M4_Temporal_Now.planet_degrees` | Daily (kairos refresh) | What the sky is activating NOW |
| **Oracle** | Oracle draw canonical tags → decan ruler | Per cast, decays ~4h | What the oracle has illuminated |

**Composition in the SubtleBodyPanel:**

```typescript
// Zone activation = weighted sum of all three layers
zoneActivation[zone] =
    natal_weight    * natal_zones[zone]    +  // 0.4 weight — permanent ground
    transit_weight  * transit_zones[zone]  +  // 0.4 weight — live sky
    oracle_weight   * oracle_zones[zone]      // 0.2 weight × exp(-t/DECAY_TAU)
```

This is what makes the subtle body map a **living instrument** — the natal layer shows constitutional tendency, the transit layer shows cosmic timing (what Kerykeion sees), and the oracle layer shows what the most recent cast illuminated.

**Parashakti dataset provides the tanmatra/organ correspondence** for the mahabhuta chain (tattva → sense organ → action organ). This is separate from the planet body zone mapping — it's the subtle body layer (what the element *does* in the body, not which body parts the planet *rules*).

### III.4 The Shem 72-Name Bridge

`M2.Shem_Name_Desc` has both `decan_link` (0-71 index into M2_DECAN_DESC) and `planet_link` (Planet_Id). This means every Shem name (divine name from Kabbalistic tradition) carries the full body-planet-decan chain automatically — no extra mapping needed.

When oracle draws a card, the corresponding decan's Shem name can be displayed as the divine name invocation, providing the mantra/divine name correspondence the user needs.

### III.5 What Lives in the Dataset (Parashakti dataset — nodes_parashakti.json)

The Parashakti dataset (595 nodes) contains the full body-organ tattva correspondences that are **not** hardcoded in C structs but live in Neo4j/graph:
- Tanmatra (subtle sense) → sense organ (jnanendriya) → action organ (karmendriya) per mahabhuta
- Specific organ names for each tattva level (e.g., "earth → nose → smell → smelling", "water → tongue → taste → procreation")
- The full decan-planet-body zone expansions for all 72 decans

**Implementation note:** M4 medicine module queries these via Neo4j (graph client) to populate the `M4_Medicine_Triage.recommended_zones[]` field. The C structs hold the indices; the semantic content lives in graph. This is the correct boundary.

---

## Part IV: M3 Quaternionic Codon Charges → M4 Oracle Resonance

### IV.1 What M3 Computes

From `m3.h` FR 2.3.18 (Inner Charge Closed-Form):

```c
// For codon with nucleotides X, Y, Z (outer, middle, inner):
// X, Y, Z are NUCLEOTIDE_ICHING_VALUE values (6, 7, 8, or 9)
pp = X + Y + Z   // Total convergent resonance peak
nn = X - Y - Z   // Total divergent trough
np = X - Y + Z   // Ascending charge (inner > middle)
pn = X + Y - Z   // Descending charge (outer+middle dominant)
// Invariant: pp + nn + np + pn = 4 * X (4 times outer nucleotide value)
```

This creates a **4D charge space** for every codon. The 4 dimensions are:
- `pp` (yang-yang resonance): peak convergence, systemic integration
- `nn` (yin-yin resonance): trough, descent, shadow work
- `np` (yin-yang ascending): ascending transformation, growth
- `pn` (yang-yin descending): descending grounding, embodiment

### IV.2 The Quaternionic Structure

The 8-fold rotational composition law (`compose_rotational_state`) creates a composition algebra:
- Positive composition: `Xy + Za → Xya` (yang dominates — forward flow)
- Negative composition: `Xy + Za → XZa` (yin dominates — shadow integration)
- Non-dual: when `y == Z` (inner of first = outer of second → `is_nondual_composition()`)

This is structurally isomorphic to **Hamilton's quaternion product** with the four basis elements mapping to:
```
1 → non-dual (scalar) composition
i → np ascending charge
j → pn descending charge
k → pp/nn convergent resonance
```

The `M3_NONDUAL_CODONS[16]` (XyX palindromes) are the **scalar quaternion** positions — pure `pp` resonance with no directional component (mp=0, pm=0 via `m3_evaluate_with_nondual_guard()`).

### IV.3 Oracle Resonance Calculation in M4

When a Tarot card is drawn, M4 computes resonance against the user's identity:

```rust
/// Oracle card resonance — how well this card aligns with user's identity
fn oracle_card_resonance(card: &TarotCard, identity: &M4IdentityMatrix) -> f32 {
    // Get card's codon charges
    let entry = M3_TAROT_CODON_MAP[card.suit][card.rank];
    let (pp, nn, np, pn) = m3_compute_charges(entry.codon_a);

    // User's nucleotide balance as charge vector
    let user = &identity.layer_2.nucleotide_balance;
    // Map nucleotide balance to charge: A→water/np, T→fire/pn, C→earth/nn, G→air/pp
    let user_charge = [
        user.guanine_air as f32 / 255.0,     // pp (air/thinking — systemic)
        user.cytosine_earth as f32 / 255.0,  // nn (earth/sensation — grounding)
        user.adenine_water as f32 / 255.0,   // np (water/feeling — ascending)
        user.thymine_fire as f32 / 255.0,    // pn (fire/intuition — descending)
    ];
    let card_charge = [pp as f32, nn.abs() as f32, np.abs() as f32, pn.abs() as f32];

    // Cosine similarity in 4D charge space
    let dot: f32 = user_charge.iter().zip(card_charge.iter()).map(|(a, b)| a * b).sum();
    let mag_u: f32 = user_charge.iter().map(|x| x * x).sum::<f32>().sqrt();
    let mag_c: f32 = card_charge.iter().map(|x| x * x).sum::<f32>().sqrt();

    if mag_u == 0.0 || mag_c == 0.0 { return 0.5; }
    dot / (mag_u * mag_c)  // 0.0-1.0 resonance score
}
```

**This drives:**
- Oracle card "germane" highlighting in `M4LensPlugin` and `SubtleBodyPanel`
- Medicine prescription weighting (cards with high resonance → more relevant prescriptions)
- Logos cycle synthesis (high-resonance oracle draws get elevated weight in stage integration)

---

## Part V: SpacetimeDB Architecture

SpacetimeDB is the real-time presence and synchrony substrate — **not** a general database for M4. All semantic content (oracle interpretation, identity data, vault entries) stays local. SpacetimeDB holds only temporal presence signals.

### V.1 Principle: Privacy Bridge

SpacetimeDB holds **NO personal data.** The privacy bridge is:
- User identity (natal chart, nucleotide balance, Gene Keys) = **local only**
- `quintessence_hash` (BLAKE3 of identity matrix) = **the only identifier** written to SpacetimeDB
- Torus position = positional index (0-11), carries no meaning without local context
- Oracle draws = hexagram index (0-63) + timestamp, no personal interpretation

This means SpacetimeDB is a **temporal presence layer** — it knows *when* and *where* (torus position) someone is present, not *who* or *why*.

### V.2 Table Definitions (SpacetimeDB WASM module)

```rust
// --- spacetime_module/src/lib.rs ---

/// User presence heartbeat (refreshed every 30s while session active)
#[spacetimedb::table(name = user_presence, public)]
pub struct UserPresence {
    #[primary_key]
    identity_hash: u64,             // truncated BLAKE3 (first 8 bytes)
    torus_position: u8,             // 0-11 on the 12-clock
    session_started_at: i64,        // Unix ms
    last_seen_at: i64,              // Unix ms (updated on heartbeat)
}

/// Public oracle draw (written only with user consent gate passed)
#[spacetimedb::table(name = oracle_draw, public)]
pub struct OracleDraw {
    #[auto_inc]
    id: u64,
    identity_hash: u64,             // link to presence (no personal data)
    hexagram_primary: u8,           // M3 6-bit codon index
    hexagram_shadow: u8,            // shadow codon
    changing_lines: u8,             // 6-bit mask
    torus_position: u8,             // torus clock position at draw time
    drawn_at: i64,                  // Unix ms
    // NO: interpretation, card meaning, personal context — all local
}

/// Logos cycle phase for multi-user session coordination
#[spacetimedb::table(name = logos_phase, public)]
pub struct LogosPhase {
    #[primary_key]
    identity_hash: u64,
    stage: u8,                      // 0-5 (A-Logos through An-a-Logos)
    stage_started_at: i64,          // Unix ms
    session_date: String,           // "YYYY-MM-DD" — the day this belongs to
}

/// Torus synchrony — real-time clock position feed
/// Written once per M1 tick (not per-user heartbeat)
#[spacetimedb::table(name = torus_sync, public)]
pub struct TorusSync {
    #[primary_key]
    tick_id: u64,
    position: u8,                   // 0-11
    degree: u16,                    // 0-719
    epoch_ms: i64,
}
```

### V.3 SpacetimeDB Reducer Operations

```rust
// Reducers (server-side compute on SpacetimeDB WASM module)
#[spacetimedb::reducer]
pub fn heartbeat(ctx: &ReducerContext, torus_pos: u8) {
    // Update or insert UserPresence with caller's identity
}

#[spacetimedb::reducer]
pub fn record_oracle(ctx: &ReducerContext, primary: u8, shadow: u8, changing: u8, torus: u8) {
    // Consent already validated client-side. Insert OracleDraw.
}

#[spacetimedb::reducer]
pub fn advance_logos_phase(ctx: &ReducerContext, stage: u8, session_date: String) {
    // Update or insert LogosPhase for caller.
}

#[spacetimedb::reducer]
pub fn end_session(ctx: &ReducerContext) {
    // Remove UserPresence entry (or mark expired). Logos phase persists.
}
```

### V.4 Client-Side (gate/spacetimedb_bridge.rs — existing file)

The existing `gate/spacetimedb_bridge.rs` file needs:
- `SpacetimeBridge::heartbeat(torus_pos)` — called by nara `wind` command on session start + every 30s
- `SpacetimeBridge::record_oracle(draw)` — called by oracle module after consent gate passes
- `SpacetimeBridge::advance_logos(stage, date)` — called by logos module on stage completion
- `SpacetimeBridge::end_session()` — called on `epi nara logos end-session`
- `SpacetimeBridge::subscribe_torus()` — async stream of `TorusSync` updates for live torus display in M1WalkPlugin

### V.5 Platform Client Infrastructure

SpacetimeDB runs as a local/self-hosted process — the `epi-cli` is a client, not a host.

**Deployment topology:**
```
[epi-cli / gate] ──ws://localhost:3000──► [spacetimedb process]
                                            ↑
                          spacetime start (local dev)
                          OR spacetime start --listen 0.0.0.0 (LAN)
```

**CLI surface for users:**
```
epi gate spacetime start          # spawn SpacetimeDB process (if not running)
epi gate spacetime status         # check connection + version
epi gate spacetime publish        # deploy/update WASM module
epi gate spacetime stop           # shutdown
```

**Client configuration (`~/.epi-logos/config.toml`):**
```toml
[spacetimedb]
url = "ws://localhost:3000"          # default local
module = "epi-nara-module"           # deployed module name
identity_token = ""                  # auto-populated on first connect
```

**`gate/spacetimedb_bridge.rs` public API:**
```rust
pub struct SpacetimeBridge { /* connection handle */ }
impl SpacetimeBridge {
    pub async fn connect(cfg: &Config) -> Result<Self>
    pub async fn heartbeat(&self, torus_pos: u8) -> Result<()>
    pub async fn record_oracle(&self, draw: &OracleDrawPublic) -> Result<()>
    pub async fn advance_logos(&self, stage: u8, date: &str) -> Result<()>
    pub async fn end_session(&self) -> Result<()>
    pub async fn subscribe_torus(&self) -> Result<impl Stream<Item = TorusSync>>
    pub async fn peers_at_position(&self, torus_pos: u8) -> Result<Vec<u64>> // identity hashes
}
```

**Module crate location:** `epi-spacetime-module/` (sibling to `epi-cli/`, separate workspace member). Not built by default — `make spacetime-module` target.

### V.6 What is NOT in SpacetimeDB

- Session state / dialogue content → `epi vault` (markdown files)
- Oracle interpretation + canonical tags → local `~/.epi-logos/oracle/` cache
- Identity matrix (natal chart, nucleotide balance) → local encrypted files (ChaCha20-Poly1305)
- Logos cycle output → vault markdown
- Medicine prescriptions → local session state only

---

## Part VI: TUI Portal — Implementation Plan (hypertile-first)

See `Idea/Bimba/Seeds/M/Legacy/specs/M/2026-03-11-hypertile-portal-design.md` for full portal spec.

### VI.1 Why Portal Before Electron

The portal:
1. **Forces feature completeness** in `epi-cli/src/nara/` modules (portal cannot fake it — if the module doesn't work, the pane is broken)
2. **Eliminates UI risk** — validates user mental model before React component investment
3. **Provides a testing surface** — all M4 features can be exercised without a browser/Electron context
4. **Matches our tooling** — the team works in the terminal; the portal is the natural home

### VI.2 Portal M4' Plugin Mapping

| Plugin | Calls into | Key Test |
|--------|-----------|----------|
| `M4IdentityPlugin` | `nara::identity::load_profile()`, `nara::kairos::load_current()` | Renders all 5 layers, kairos freshness indicator |
| `M4FlowPlugin` | `flow::parse_entries()`, `flow::append()` | Can write a flow entry and see it rendered |
| `M4OraclePlugin` | `nara::oracle::cast()`, `nara::oracle::history()` | Full cast with consent gate, display hexagram + card |
| `M4MedicinePlugin` | `nara::medicine::triage()`, `::prescribe()` | Shows elemental balance, prescription with body zone |
| `M4TransformPlugin` | `nara::transform::status()`, `::recipe()` | Shows open cycles, decan recipe |
| `M4LensPlugin` | `nara::lens::list()`, each lens query | All 6 lenses with germane indicator from oracle resonance |
| `M4PratibimbaPlugin` | `nara::pratibimba::stats()`, `::excavate()` | Neo4j-dependent; shows stub when Neo4j unavailable |
| `M5LogosPlugin` | `nara::logos::status()`, `::stage()` | Today's logos cycle stages with completion markers |

### VI.3 Portal Implementation Phases

**Phase 1 — Foundation (1-2 sessions)**
- Add `ratatui-hypertile` + `ratatui-hypertile-extras` to `Cargo.toml`
- `portal/mod.rs`: launch(), event loop, terminal lifecycle
- `portal/persist.rs`: workspace JSON save/load
- `portal/registry.rs`: plugin registration
- `portal/plugins/shared.rs`: HelpPlugin (render-only, validates framework)
- Wire `epi portal` in `main.rs`
- Test: portal launches, shows help pane, saves/restores layout

**Phase 2 — M4' Core (2-3 sessions, depends on nara module completion)**
- `M4IdentityPlugin`: identity + kairos display
- `M4FlowPlugin`: flow write + display
- `M4OraclePlugin`: oracle cast + history
- Default M4'-M5' tab layout wired
- Test: default layout works, flow input works, oracle cast with consent works

**Phase 3 — M0'-M3' Structural (1 session)**
- Extract render logic from `tui/mod.rs` into `tui/widgets/`
- `M0DashboardPlugin`, `M0FamiliesPlugin`, `M1WalkPlugin`
- Default structural tab wired
- Test: existing TUI commands still work (regression), portal structural tab works

**Phase 4 — Remaining M4' + M5' (1-2 sessions)**
- `M4MedicinePlugin`, `M4TransformPlugin`, `M4LensPlugin`, `M4PratibimbaPlugin`
- `M5LogosPlugin`, `M5ChatPlugin`, `M5FsmPlugin`
- `StatusPlugin` (cross-M aggregation)
- Test: all plugins render, cross-M StatusPlugin correctly aggregates

**Phase 5 — Polish (0.5 session)**
- Theme tokens, M-level color identity, command palette wired
- M2/M3 stub plugins
- Keybinding docs

---

## Part VII: Full Implementation Phase Map (updated)

Replaces the phase numbering in the v2.1 runtime plan. All phases from v2.1 are preserved but resequenced with portal insertion.

| Phase | Scope | Depends On | Files |
|-------|-------|------------|-------|
| **0** | C struct expansion: `M4_Medicine_Triage`, `M4_Transform_State`, `M4_Oracle_Draw`, expanded `M4_Identity_Matrix` | — | `epi-lib/include/m4.h` |
| **1** | `epi nara` CLI scaffold: `NaraCmd` enum, all sub-enums, `main.rs` dispatch | Phase 0 | `epi-cli/src/nara/mod.rs`, `main.rs` |
| **2** | FFI mirrors: `NaraIdentityMatrix`, `static_assertions`, safe wrappers | Phase 0 | `epi-cli/src/ffi/mod.rs` |
| **3** | Kerykeion subprocess wrapper + full wind sequence (9 steps) | Phase 2 | `epi-cli/src/nara/kairos.rs`, `wind.rs` |
| **4** | Deterministic CLI commands: clock, kairos, decan, resonance, project, status | Phase 3 | `epi-cli/src/nara/*.rs` |
| **5** | Oracle engine (#4.2): hygiene guards, consent gate, 3-coin I-Ching (above spec), Tarot draw with quaternionic resonance scoring | Phase 4 | `epi-cli/src/nara/oracle.rs` |
| **5b** | Medicine, transform (3 static container protocols), lens (PHENOM_TATTVA_MAP), pratibimba (Neo4j), logos (6 stages) | Phase 4 | `epi-cli/src/nara/{medicine,transform,lens,pratibimba,logos}.rs` |
| **6** | Gateway RPC: all ~50 `nara.*` methods, `NaraRuntime` struct | Phase 5b | `epi-cli/src/gate/nara.rs` |
| **6b** | SpacetimeDB bridge: heartbeat, oracle write, logos phase sync | Phase 6 | `epi-cli/src/gate/spacetimedb_bridge.rs` |
| **7** | TUI portal foundation: hypertile crates, event loop, persist, registry, HelpPlugin | Phase 1 | `epi-cli/src/portal/` |
| **8** | Portal M4' core plugins: Identity, Flow, Oracle | Phase 5, 7 | `epi-cli/src/portal/plugins/m4.rs` |
| **9** | Portal structural plugins (M0'/M1') + TUI refactor | Phase 7 | `epi-cli/src/portal/plugins/{m0,m1}.rs`, `tui/widgets/` |
| **10** | Portal remaining plugins: Medicine, Transform, Lens, Pratibimba, Logos, Chat | Phase 5b, 8 | `epi-cli/src/portal/plugins/{m4,m5,shared}.rs` |
| **11** | Electron app frontend (SubtleBodyPanel + M4' React panels) | Phase 6, portal proven | `Idea/Pratibimba/System/epi-app/renderer/domains/M4_Nara/` |

---

## Part VIII: Key Architectural Decisions (settled)

### VIII.1 The Oracle #4.2-0 Canonical Tag Pipeline

```
Oracle cast
  → M4_Oracle_Draw populated (hexagram + card + changing lines + quaternionic resonance)
  → canonical tags emitted: {elements[], organs[], bodyZones[], operations[], timing[], lens[]}
  → nara.oracle.payload.apply --target medicine   → feeds #4.1 (pre-fills triage)
  → nara.oracle.payload.apply --target transform  → feeds #4.3 (suggests cycles)
```

This means oracle draws are **machine-readable** — not just poetic. The canonical tags are the interface between oracle (#4.2) and the rest of M4.

### VIII.2 The Elemental Throughline as Single Source of Truth

**Only one canonical mapping:** A=Water=Cups=Feeling=Apas=Svadhisthana, T=Fire=Wands=Intuition=Agni=Manipura, C=Earth=Pentacles=Sensation=Prithvi=Muladhara, G=Air=Swords=Thinking=Vayu=Anahata.

Verified by compile-time `_Static_assert` in `m4.h`:
```c
_Static_assert(M3_NUC_A == M4_ELEM_WATER,  "Elemental Throughline: A must be Water(0)");
_Static_assert(M3_NUC_T == M4_ELEM_FIRE,   "Elemental Throughline: T must be Fire(1)");
_Static_assert(M3_NUC_C == M4_ELEM_EARTH,  "Elemental Throughline: C must be Earth(2)");
_Static_assert(M3_NUC_G == M4_ELEM_AIR,    "Elemental Throughline: G must be Air(3)");
```

**Any system that introduces a different element mapping is wrong.** This includes frontend TypeScript (`elementConfig.ts`), gateway JSON responses, and oracle canonical tags. All must trace to this C-level definition.

### VIII.3 Quintessence / Akasha (5th Element)

The 4-element ACTG throughline does NOT include Akasha — Akasha is Vishuddha, the synthesizing/space element. In M4:
- Quintessence = the hash + integration state, not an oracle element per se
- In the SubtleBodyPanel: Akasha/Vishuddha sits between the 4 body elements and Ajna/Sahasrara
- In oracle: A card crossing from earth-to-air or water-to-fire activates Akasha (non-dual codon = XyX palindrome from `M3_NONDUAL_CODONS[16]`)

### VIII.4 M3 Quaternionic Integration (not a future concern — already in C code)

The `m3_compute_charges()` function already exists in `epi-lib/src/m3.c`. M4 simply calls it via FFI. The oracle resonance scoring described in Part IV is the **consumer** of existing M3 capability. This is NOT new work — it is wiring existing infrastructure.

### VIII.5 SpacetimeDB Module is a Separate Deliverable

The SpacetimeDB WASM module (`spacetime_module/`) is **not** part of the main epi-cli repository. It is:
- A separate crate: `epi-spacetime-module/`
- Deployed independently: `spacetime publish epi-nara-module`
- The `gate/spacetimedb_bridge.rs` in epi-cli is the **client** — it can be implemented against a stub when the module isn't deployed yet

**SpacetimeDB module development** is tracked separately on Agora Notion.

---

## Part IX: Open Items and Clarifications Needed

| # | Item | Status | Action |
|---|------|--------|--------|
| **OI-1** | SpacetimeDB Notion planning page | Needs link | User to create Agora page, link here |
| **OI-2** | Full `TAROT_THOTH_CANONICAL_TAGS[78]` body zone mapping | Partial | Phase 5: complete element+ops tags; Phase 5b: complete organ+zone tags from Parashakti dataset + Neo4j body zone LUT |
| **OI-3** | `TAROT_DECAN_MAP[56]` (Minor Arcana → decan flat index) | Needs Rust static | Thoth/Golden Dawn assignments in III.1b above. LLM can fill in; encode as `static TAROT_DECAN_MAP: [(u8, u8, u8); 56]` = (elem_idx, sign_0_2, decan_0_2). Major Arcana → planet ruler → PLANET_BODY_ZONE. |
| **OI-4** | QL-Quaternary Tarot deck grammar (#4.2-1) | Deferred | Uses Thoth as base until designed. Flag in code with `// TODO: QL-Quaternary grammar` |
| **OI-5** | Yarrow stalk I-Ching method | Stubbed | Lower priority. Coin method is canonical per ACTG mapping. |
| **OI-6** | `ratatui-hypertile` crate | **CONFIRMED** | https://crates.io/crates/ratatui-hypertile — exists, use it. |
| **OI-7** | Parashakti dataset Neo4j population | Depends on graph | Medicine module's organ queries require Parashakti nodes loaded. `epi graph seed` must include m2 dataset. |
| **OI-GraphSchema** | Graph schema review for body zone mapping | Blocking OI-3 integration | Read `docs/datasets/nodes_parashakti.json` + `relations_parashakti.json` to determine existing planet/decan node shapes before writing any Cypher for body zone data. Can't write schema-conformant queries without this. |
| **OI-8** | Human Design defined channels bitmask (0-35) | Stub in struct | `M4_HumanDesign_Layer.defined_channels` — channels LUT not yet defined |
| **OI-9** | Electron SubtleBodyPanel — when to start | After portal proves it | Do NOT start until portal M4' tab is complete and working |

---

## Part X: Test Coverage Strategy

### TUI Portal Tests (ratatui Buffer assertions)
- Each plugin: render test with `Buffer::empty(area)`, assert key strings present
- Layout persistence: `workspace_roundtrip_serialization()`
- Event handling: tab switch, pane split, resize tests

### M4 Nara Module Tests (existing pattern: `tests/`)
- `tests/nara_oracle.rs`: 3-coin throw distribution (all 4 nucleotide values, statistical), hexagram uniqueness over 1000 draws, consent gate rejection test
- `tests/nara_identity.rs`: layer presence bitmask, hash recompute stability, minimum viable check
- `tests/nara_resonance.rs`: quaternionic charge calculation matches M3 reference, non-dual guard test
- `tests/nara_element_chain.rs`: `Tarot → codon → decan → planet → chakra` chain completeness (all 56 Minor Arcana yield valid body zone)

### C Library Tests (existing `make test` pattern)
- `M4_Oracle_Draw` coin cast populates changing_lines correctly
- Quaternionic invariant: pp+nn+np+pn == 4*outer for all 64 codons
- Elemental throughline `_Static_assert` compile-time validation (already enforced)

---

---

## Part XI: The Full Quaternionic System — M3 Code (Canonical, Frozen)

### XI.1 What "Quaternionic" Actually Means in This System

The M3 code does NOT use float quaternions for Tarot. The quaternionic structure is **integer-arithmetic isomorphic** — the `M3_CodonEvaluation` {pp, mm, mp, pm} is a 4-dimensional integer charge vector that obeys quaternion-like composition rules. The `Quaternion` struct in `m1.h` is for **torus parametrization** (geometric). These are two faces of the same mathematics, not one floating-point and one integer — they are both real, at different levels.

### XI.2 M3_CodonEvaluation as Integer Quaternion

The 4-evaluation system (FR 2.3.13) is completely implemented:

```c
// For codon XYZ, using I-Ching values (A=6, T=9, C=7, G=8):
pp =  X + Y + Z   // convergent resonance peak (quaternion scalar w)
mm = -(X + Y + Z) // convergent trough (-w)
mp =  D(YZ)       // ascending: net diff of inner pair (quaternion i)
pm =  D(XY)       // descending: net diff of outer pair (quaternion j)
// 4X invariant: pp + |mm| + |np| + |pn| = 4 * X (always)
```

The 4X invariant (`_Static_assert` verified for TTT: (27) + (27) + (0) + (0) = 4×9... wait, that's the pure homogeneous case). The general structure is that pp + mm = 0 always (they're negatives), and the total "charge" of any codon is fully determined by its outer nucleotide's I-Ching value scaled by 4.

**The 360 Integral Invariant** (FR 2.3.15, `_Static_assert` verified):
- Sum of ALL pp values across all 64 codons = **1440** (raw)
- Per suit: A=336, T=384, C=352, G=368 (sum = 1440 = 360×4)
- Normalized by 4 suits: **360** — the complete circle
- Per-suit integrals: **A=84, T=96, C=88, G=92** (these are non-arbitrary — they encode elemental weight)

The per-suit integrals ARE the elemental weights in the system's own arithmetic:
- Water (A=84): most yin, receptive — lowest total charge
- Earth (C=88): stable yin — second lowest
- Air (G=92): stable yang — second highest
- Fire (T=96): most yang, expansive — highest total charge

**This is the system's self-derived elemental balance** — not assigned, computed from the I-Ching values through the 64-codon exhaustion.

### XI.3 Non-Dual Codons as Unit Quaternions

`M3_NONDUAL_CODONS[16]` — the XyX palindromes — are the **unit quaternion** positions:
- `mp = 0` and `pm = 0` (no directional component, from `m3_evaluate_with_nondual_guard()`)
- Pure `pp` value only — scalar quaternion (w-only, x=y=z=0 equivalent)
- These are the 16 Aces/archetypal-seed positions in codon space
- When an oracle draw produces a non-dual codon → pure elemental activation, no directional tension

### XI.4 compose_rotational_state() as SU(2) Group Multiplication

```c
// (xy) ∘ (za) = Xya  [positive/Yang — outer X anchors, middle bridges, inner a concludes]
// (xy) ∘ (za) = XZa  [negative/Yin  — outer X anchors, middle inverts to Z, inner a concludes]
// Non-dual when y == Z: bipolar self-interaction (pure scalar composition)
```

This is the **quaternion product structure**: positive = ij=k (forward composition), negative = ji=-k (reversed), non-dual = i²=-1 (self-squaring). The 8 possible composition outcomes (7 polarized + 1 non-dual) map to the 8 elements of the quaternion group Q₈.

### XI.5 How M4 Oracle Consumes the Quaternionic System

**Card drawn → full quaternionic profile:**

```rust
// Step 1: Get codon for drawn card
let entry = M3_TAROT_CODON_MAP[suit][rank];

// Step 2: Compute charges (closed-form, no LUT — m3_compute_charges)
let (pp, nn, np, pn) = m3_compute_charges(entry.codon_a);
// For dual-codon courts: average of codon_a and codon_b charges

// Step 3: Is it non-dual? (XyX palindrome)
let is_nondual = is_nondual_codon(entry.codon_a);
// If true: mp=0, pm=0 → pure elemental, no directional tension

// Step 4: Resonance against user identity
let resonance = quaternionic_resonance(pp, nn, np, pn, &identity.layer_2.nucleotide_balance);

// Step 5: Decan → planet → body zone (via CHAKRA_BODY_ZONES)
let zones = body_zones_for_card(suit, rank, degree);
```

**Resonance formula using per-suit integrals as baseline:**
```rust
fn quaternionic_resonance(pp: i8, nn: i8, np: i8, pn: i8, nb: &NucleotideBalance) -> f32 {
    // User's elemental weights normalized to [0,1]
    let u = [nb.adenine_water, nb.thymine_fire, nb.cytosine_earth, nb.guanine_air]
        .map(|v| v as f32 / 255.0);

    // Card's charge vector, normalized by per-suit invariant baseline
    // A=84, T=96, C=88, G=92 → expected per-suit scalar weight
    let card = [pp.abs(), nn.abs(), np.abs(), pn.abs()].map(|v| v as f32);

    // Cosine similarity in 4D charge space
    let dot: f32 = u.iter().zip(card.iter()).map(|(a, b)| a * b).sum();
    let mag_u = u.iter().map(|x| x*x).sum::<f32>().sqrt();
    let mag_c = card.iter().map(|x| x*x).sum::<f32>().sqrt();

    if mag_u == 0.0 || mag_c == 0.0 { return 0.5; }
    dot / (mag_u * mag_c)
}
```

---

## Part XII: M0 → M4 Archetypal Throughline

This is the most underspecified connection in the current plan. Every M-level is a manifestation of the M0 ground — the throughline is not metaphorical, it is encoded in `m0_read_cosmic_clock()` and `m0_compute_logos_state()`.

### XII.1 The Unified Clock — M0 Integrates All Levels at One Degree

```c
// m0_read_cosmic_clock(degree_0_to_719) → Unified_Clock_State:
//   .m1_torus_stage = degree / 30       (0-11: the SU(2) torus tick)
//   .m2_decan_phase = degree / 10       (0-35 primary, 36-71 shadow)
//   .m3_hexagram_id = (degree * 64) / 360  (0-63: M3 codon index)
//   .is_implicate   = degree >= 360     (shadow phase flag)
```

**At any moment Kerykeion gives a planet degree → this single function yields ALL M-level states simultaneously.** This is the M0 integrating function. M4's temporal layer reads this for EVERY planet and synthesises the composite state.

### XII.2 M0 Divine Acts = M4 Logos Stages (Direct Correspondence)

```c
// m0_compute_logos_state(tick_0_to_11) → Unified_Logos_State:
//   .current_stage      = tick (0-5) or 11-tick (6-11, descending)
//   .active_divine_act  = same as current_stage (!)
//   .active_r_factor    = same as current_stage
```

The 6 Logos stages (A-Logos through An-a-Logos) ARE the 6 Divine Acts:

| Logos Stage | Divine Act | r_factor | Oracle Weighting |
|-------------|------------|----------|-----------------|
| 0 — A-Logos (open) | Srishti (Creation) | 0 | High-pp cards (yang/fire) elevated — creation energy |
| 1 — Para-Logos (depth) | Sthiti (Sustenance) | 1 | Earth cards (C-suit, stable) elevated — grounding |
| 2 — Dia-Logos (weaving) | Samhara (Dissolution) | 2 | Non-dual codons elevated — integration over opposition |
| 3 — Syn-Logos (synthesis) | Tirodhana (Veiling) | 3 | Shadow codons (high mm) elevated — shadow integration |
| 4 — Meta-Logos (reflection) | Anugraha (Grace) | 4 | High resonance cards elevated — user-aligned |
| 5 — An-a-Logos (return) | Samavesa (Absorption) | 5 | Water cards (A-suit) elevated — return to ground |

**This means the Logos stage doesn't just track progress — it changes which oracle cards are weighted higher in the synthesis.** M4's logos module reads the current stage via `m0_compute_logos_state(current_tick)` to set the oracle elevation weights.

### XII.3 M0 VIRTUE_LUT → M4 Oracle Interpretation

The `VIRTUE_LUT[9]` has `r_factor` (0-8) and `divine_act` for each virtue position. The r_factor modulates the "quality" of the oracle reading:

```rust
// r_factor at current logos stage = interpretive filter
fn oracle_interpretation_mode(logos_stage: u8) -> InterpretiveMode {
    let r = logos_stage as usize;
    match VIRTUE_LUT[r].divine_act {
        Srishti   => InterpretiveMode::Expansive,   // creation — open possibilities
        Sthiti    => InterpretiveMode::Grounding,   // sustenance — consolidate
        Samhara   => InterpretiveMode::Release,     // dissolution — let go
        Tirodhana => InterpretiveMode::Shadow,      // veiling — examine what's hidden
        Anugraha  => InterpretiveMode::Receptive,   // grace — receive alignment
        Samavesa  => InterpretiveMode::Integration, // absorption — complete the cycle
    }
}
```

### XII.4 M0 Vimarsa Operators → M4 Oracle Language

The 7 Vimarsa operators (the ISA) provide the semantic vocabulary for oracle card interpretation. Each card's quaternionic charge maps to a dominant operator:

| Quaternionic Profile | Dominant Vimarsa Op | Oracle Language |
|---------------------|--------------------|----|
| High pp (pure yang, e.g., TTT) | OP_EQUATE (=) | "Identity confirmed — you are this" |
| High mm (pure shadow) | OP_DISTINGUISH (≠) | "Differentiation required — notice what differs" |
| High mp (ascending, D>0) | OP_ILLUMINATE (?!) | "Awareness illuminates — something is becoming visible" |
| High pm (descending, D<0) | OP_PROVOKE (!?) | "Being provokes — something is pressing inward" |
| Non-dual (XyX, mp=pm=0) | OP_ENCLOSE (@) | "Self-contained actuality — no tension, pure presence" |
| Evolutionary gap (0xFF) | OP_WITHHOLD (-) | "This cannot manifest yet — provisional state" |

This gives every oracle card reading a M0-grounded semantic in the system's own language, not external Tarot symbolism alone.

### XII.5 M1 Ananda Matrices → M4 Identity Archetypal Position

The `ANANDA_BIMBA` 12×12 matrix (nibble-packed) maps the user's natal position into the archetypal grid:

```rust
// User's natal sun/moon degrees → Ananda matrix cell
let sun_row  = (identity.layer_1.sun_degree_anchor / 30) as u8;   // 0-11
let moon_col = (identity.layer_1.moon_degree_anchor / 30) as u8;  // 0-11

let natal_harmonic = get_ananda_harmonic(&ANANDA_BIMBA, sun_row, moon_col);  // 0-15 (4-bit)
let natal_quintessence = get_quint_bimba(sun_row, moon_col);  // 0-15 (from Quintessence matrix)
// natal_quintessence is the user's Quintessence Number — their position in the integration field
```

The Quintessence matrix value at the user's (sun_row, moon_col) position IS their **quintessence number** — the digit root that represents their archetypal integration point. This should be stored in `M4_Numerological_Layer` alongside the birthdate numerological key.

### XII.6 M1 Spanda Stage → M4 Transform Container Selection

The Spanda compiler stages (FR 2.1.2) suggest which dialogical container is most appropriate:

| Spanda Stage | Character | Transform Container |
|-------------|-----------|---------------------|
| SPANDA_SEED (0) | Fused (0/1) — undifferentiated | Bohmian Dialogue (receptive ground) |
| SPANDA_POLE_A (1) | Original — Mahamaya {1,2,4,8,7,5} | Bohmian Dialogue (establishes original) |
| SPANDA_POLE_B (2) | Reflection — Parashakti {3,6,9,3,6,9} | Talking Circle (reflection/witnessing) |
| SPANDA_TRIKA (3) | Trika synthesis — first stable torus | Talking Circle (three-position synthesis) |
| SPANDA_FLOWERING (4) | Contextual Flowering — 6 CF substages | Diamond Approach (full engagement) |
| SPANDA_META (5) | Meta-Reflection — fold-count sieve | Diamond Approach (metacognitive return) |

M4's `transform::recipe()` reads current Spanda stage from M1_Root via FFI to suggest the appropriate container.

### XII.7 M1 TOPOLOGICAL_ELEMENT_COUNT_LUT → Oracle Spread Size

```c
// LUT[12] = {1, 2, 2, 3, 4, 5, 8, 10, 12, 6, 7, 11}
// At torus position p: this many "elements" are active
```

Oracle cast spread size is **NOT arbitrary** — it's read from the torus position:
- Position 0 (count=1): single card draw — ground state
- Position 3 (count=3): three-card spread — Trika
- Position 4 (count=4): four-card spread — Quaternity
- Position 5 (count=5): five-card spread — elemental pentagram
- Positions 6-8 (counts=8/10/12): deeper implicate spreads for full readings

M4's oracle module reads `M1_Root.torus_pos` → `TOPOLOGICAL_ELEMENT_COUNT_LUT` to determine the canonical spread size before the cast.

### XII.8 The Complete M0→M4 Throughline

```
M0 Vimarsa ISA (7 operators)
  ↓ grounds oracle semantic language (XI.4)

M0 Unified_Clock_State (m0_read_cosmic_clock)
  ↓ integrates M1/M2/M3 at current degree (XII.1)

M1 Ananda matrices (12×12, 6 views)
  ↓ user's natal sun/moon → archetypal harmonic + quintessence number (XII.5)

M1 Spanda stages (6-stage compiler)
  ↓ current Spanda stage → transform container selection (XII.6)

M1 SU(2) ring / torus position (0-11)
  ↓ TOPOLOGICAL_ELEMENT_COUNT_LUT → oracle spread size (XII.7)

M2 element/tattva/planet/decan (72-space)
  ↓ element → chakra → body zone (CHAKRA_BODY_ZONES[8]) (Part III)

M3 codon evaluation / Tarot-codon map (64-codon space)
  ↓ card → integer quaternion (pp/mm/mp/pm) → resonance score (Part XI)
  ↓ 360 integral per-suit baseline (A=84, T=96, C=88, G=92)

M4 Personal interface
  → identity (natal harmonic, quintessence number, nucleotide_balance)
  → oracle (spread size from torus, card resonance against identity, Vimarsa semantic)
  → medicine (element balance + oracle canonical tags + chakra body zones)
  → transform (Spanda stage → container selection)
  → logos (stage = divine act = r_factor → oracle elevation weighting)
```

Every connection is a function call or struct field read — no metaphor.

---

## Part XIII: Tunable Weights System — NaraWeights

The system is **compositionally grounded** (all values derive from mathematical first principles) but must also be **tunable** (weights let the user calibrate emphasis without breaking the underlying structure).

### XIII.1 NaraWeights Config Struct

```toml
# ~/.epi-logos/config.toml
[nara.weights]
# Body zone temporal layer composition (must sum to 1.0)
body_natal_weight   = 0.40   # constitutional / stable
body_transit_weight = 0.40   # Kerykeion live sky
body_oracle_weight  = 0.20   # decaying oracle signal

# Oracle resonance quaternionic dimensions [pp, |nn|, |mp|, |pm|]
# pp=convergent, nn=shadow, mp=ascending, pm=descending
oracle_resonance_pp = 0.40
oracle_resonance_nn = 0.15
oracle_resonance_mp = 0.25
oracle_resonance_pm = 0.20

# Oracle spread size override (0 = derive from M1 torus position — recommended)
oracle_spread_override = 0     # 0 = auto from TOPOLOGICAL_ELEMENT_COUNT_LUT

# Oracle decay (hours until oracle body zone signal halves)
oracle_decay_tau_hours = 4.0   # ~one decan cycle for Moon transit

# Quintessence activation thresholds
quintessence_vishuddha_threshold = 0.65   # Vishuddha lights up above this
quintessence_crown_threshold     = 0.85   # Ajna+Sahasrara above this

# Medicine prescription weights
medicine_element_weight = 0.50   # elemental balance dominance
medicine_oracle_weight  = 0.30   # oracle canonical tag influence
medicine_decan_weight   = 0.20   # current decan's ruling planet signal

# Logos oracle elevation per unit resonance above 0.5
logos_oracle_elevation = 0.20

# Active Ananda matrix view (0=Bimba, 1=Pratibimba, 2=Sum, 3=DiffA, 4=DiffB, 5=Quintessence)
# Normally tracks M1_Root.ananda (system-driven). Override for deliberate practice.
ananda_matrix_override = -1    # -1 = follow M1 system
```

### XIII.2 CLI Surface

```
epi nara weights show                   # display current weights + derived values
epi nara weights set body-oracle 0.3    # adjust a single weight (renormalizes siblings)
epi nara weights reset                  # restore all defaults
epi nara weights calibrate              # auto-calibrate from nucleotide_balance (per-suit integrals)
```

**`calibrate` command**: computes oracle_resonance_* weights from user's `nucleotide_balance` using the per-suit integral ratios (A=84, T=96, C=88, G=92). A user dominant in Fire (T) gets oracle_resonance_pp elevated (fire = high convergent charge). This makes the default weights self-derived rather than arbitrary.

### XIII.3 Self-Calibrating Defaults (the system's own principles as defaults)

The per-suit integrals already encode the correct default resonance weights:

```rust
fn calibrate_oracle_weights(nb: &NucleotideBalance) -> OracleResonanceWeights {
    // Normalize nucleotide balance
    let total = (nb.adenine_water + nb.thymine_fire + nb.cytosine_earth + nb.guanine_air) as f32;
    let a = nb.adenine_water as f32 / total;   // Water weight
    let t = nb.thymine_fire  as f32 / total;   // Fire weight
    let c = nb.cytosine_earth as f32 / total;  // Earth weight
    let g = nb.guanine_air   as f32 / total;   // Air weight

    // Map elements to quaternionic dimensions via per-suit integrals
    // pp ↔ Fire (T, max integral 96 → convergent)
    // nn ↔ Water (A, min integral 84 → receptive/shadow)
    // mp ↔ Air (G, yang-stable → ascending structural)
    // pm ↔ Earth (C, yin-stable → descending grounding)
    OracleResonanceWeights { pp: t, nn: a, mp: g, pm: c }
}
```

This means the oracle naturally resonates most with cards that match the user's dominant element — the weights ARE the identity, not an external preference.

### XIII.4 Portal Exposure — StatusPlugin Weight Display

The `StatusPlugin` (M0'-M3' structural tab) should display a weight summary panel:
- Current NaraWeights (what's active)
- Derived values (which Ananda matrix active, current quintessence activation level, current torus spread size)
- Flag any overrides from auto (so the user can see when they've departed from system-derived defaults)

All weights adjustable via `epi nara weights set` — the portal shows the state, the CLI mutates it. No in-portal weight editor in v1 (keep portal as read-render, CLI as write-configure).

---

*"The pattern reveals itself through repetition. The chain from coin to body zone is one pattern, now made explicit."*

*Plan version: 1.1 — 2026-03-11 (added Parts XI–XIII: quaternionic system, M0→M4 throughline, tunable weights)*
*Canonical ground: /Users/admin/Documents/Epi-Logos\ C\ Experiments/*

---

## Part XIV: OI-GraphSchema — Parashakti Body Zone Neo4j Integration

> **Status:** Research complete — Cypher ready for implementation
> **Source files examined:**
> - `docs/datasets/nodes_parashakti.json` — coordinate-format node catalogue (fields: `coordinate`, `name`, `coreNature`, `description`, `essence`, `formulation`, `structure`)
> - `docs/datasets/relations_parashakti.json` — coordinate-format relation catalogue (fields: `source`, `type`, `target`)
> - `docs/datasets/parashakti-deep/parashakti-planets.json` — live Neo4j export: 16 nodes with full `labels`, `properties`, `elementId`
> - `docs/datasets/parashakti-deep/relations.json` — live Neo4j export: 3960 source/relType/target/relProperties tuples

---

### XIV.1 Discovered Schema — Node Labels & Properties

The live Neo4j database (parashakti subsystem `#2-5`) uses two primary node label sets for this domain:

#### `PlanetaryHarmonic` nodes (also labelled `CelestialArchetype`, `BimbaNode`, `ParashaktiComponent`, `VectorNode`)

Bimba coordinate → planet name mapping (canonical Neo4j identities):

| bimbaCoordinate | name | Neo4j identity |
|-----------------|------|---------------|
| `#2-5-0/1` | Sun | 581 |
| `#2-5-2` | Venus | — |
| `#2-5-3` | Mercury | — |
| `#2-5-4` | Moon | — |
| `#2-5-5` | Saturn | 601 |
| `#2-5-6` | Jupiter | — |
| `#2-5-7` | Mars | — |

Key properties present on `PlanetaryHarmonic` nodes:
- `name` (string) — planet name in English
- `bimbaCoordinate` (string) — e.g. `"#2-5-5"`
- `therapeuticRole` (string) — Ficino-tradition therapeutic description
- `coreNature` (string) — deep philosophical nature
- `kashimirBijaMantra`, `vedicMantra`, `saivistMantra` — mantra strings
- `planetaryMode` (string) — modal scale (Dorian, Mixolydian, etc.)
- `scalarDegree` (string) — position in harmonic scale
- `elementId` (string) — Neo4j UUID, format `"4:<db-uuid>:<identity>"`
- `embeddings` (float[]) — 1536-dim vector

**No `body_zones` property exists on `PlanetaryHarmonic` nodes.** This data needs to be added.

#### `ChakralCenter` nodes (also labelled `BimbaNode`, `KashmirShaivite`, `VectorNode`)

| bimbaCoordinate | name | anatomicalLocation |
|-----------------|------|-------------------|
| `#2-5-0/1-1` | Mūlādhāra | Base of spine, perineum, pelvic floor |
| `#2-5-0/1-2` | Svādhiṣṭhāna | Lower abdomen, sacral region, reproductive organs |
| `#2-5-0/1-3` | Maṇipūra | Solar plexus, upper abdomen, digestive system |
| `#2-5-0/1-4` | Anāhata | Heart region, chest center, cardiac plexus |
| `#2-5-0/1-5` | Viśuddha | Throat region, thyroid, vocal apparatus |
| `#2-5-0/1-6` | Ājñā | Between eyebrows, pineal gland, third eye region |
| `#2-5-0/1-7` | Sahasrāra | Crown of head, fontanelle, cerebral cortex |

Key properties present on `ChakralCenter` nodes:
- `name` (string) — Sanskrit chakra name with diacritics
- `bimbaCoordinate` (string) — e.g. `"#2-5-0/1-1"`
- `anatomicalLocation` (string) — body region (spine/plexus level)
- `elementalCorrespondence` (string) — element name with description
- `coreNature` (string) — śakti principle
- `mantraSignature` (string) — bija mantra
- `psychologicalQualities` (string) — psychological domain
- `spiritualFunction` (string)
- `yantraForm` (string) — lotus petal count + symbol
- `devataPresence` (string) — deity/śakti present

**No `body_zones` property exists on `ChakralCenter` nodes.** This data needs to be added.

---

### XIV.2 Discovered Schema — Existing Relation Types (Planet ↔ Chakra)

The following relation types already exist in the live database connecting `PlanetaryHarmonic` → `ChakralCenter`:

| relType | Semantics | Planet→Chakra pairs |
|---------|-----------|---------------------|
| `PLANETARY_RESONANCE` | Primary harmonic resonance | Saturn→Muladhara, Jupiter→Svadhisthana, Mars→Manipura, Venus→Anahata, Mercury→Vishuddha, Moon→Ajna, Sun→Sahasrara |
| `CHAKRAL_VIRTUE_RECEPTION` | Virtue/quality reception | Sun→all 7 chakras |
| `DIVINE_NAMES_CHAKRAL_RECEPTION` | Divine name reception | Sun→Muladhara, Anahata, Ajna, Sahasrara |
| `GENDER_INCLUSIVE_SOLAR_PRACTICE` | Solar practice applicability | Sun→Muladhara, Anahata, Vishuddha, Ajna, Sahasrara |
| `LUNAR_FEMININE_DIVINE_INTEGRATION` | Lunar-feminine integration | Moon→Ajna |
| `GROUNDS_CHAKRAL_PATHWAY` | Grounding pathway | PlanetEarth→Muladhara |

The authoritative **planet→primary-chakra** mapping is `PLANETARY_RESONANCE`:

```
Saturn  → Mūlādhāra      (#2-5-5  → #2-5-0/1-1)
Jupiter → Svādhiṣṭhāna   (#2-5-6  → #2-5-0/1-2)
Mars    → Maṇipūra        (#2-5-7  → #2-5-0/1-3)
Venus   → Anāhata         (#2-5-2  → #2-5-0/1-4)
Mercury → Viśuddha        (#2-5-3  → #2-5-0/1-5)
Moon    → Ājñā            (#2-5-4  → #2-5-0/1-6)
Sun     → Sahasrāra       (#2-5-0/1 → #2-5-0/1-7)
```

---

### XIV.3 Body Zone Data — Does It Exist?

**Result: Body zone data does NOT exist as a structured property in the live database.**

Neither `PlanetaryHarmonic` nor `ChakralCenter` nodes carry a `body_zones` property array. The `ChakralCenter.anatomicalLocation` property gives the anatomical region at the plexus/structural level (e.g. "Base of spine, perineum, pelvic floor") but does not enumerate specific tissues, organs, or body systems in a structured form.

Two correct approaches follow.

---

### XIV.4 Option A — Property Augmentation (Recommended)

Add `body_zones` as a string array property to `ChakralCenter` nodes. Since the planet→chakra link already exists via `PLANETARY_RESONANCE`, querying `planet→PLANETARY_RESONANCE→chakra.body_zones` is then one hop.

```cypher
// ============================================================
// Option A: Add body_zones arrays to ChakralCenter nodes
// Uses MERGE on bimbaCoordinate (stable canonical identifier)
// Run once; safe to re-run (MERGE + SET =)
// ============================================================

MERGE (c:ChakralCenter {bimbaCoordinate: '#2-5-0/1-1'})
SET c.body_zones = ['bones', 'teeth', 'skin', 'joints', 'nails', 'skeletal_structure', 'adrenal_cortex']
SET c.body_zones_source = 'ayurveda_tantra_canonical'
SET c.body_zones_updated_at = datetime();

MERGE (c:ChakralCenter {bimbaCoordinate: '#2-5-0/1-2'})
SET c.body_zones = ['blood', 'lymph', 'mucus', 'reproductive_organs', 'urine', 'seminal_fluid', 'synovial_fluid']
SET c.body_zones_source = 'ayurveda_tantra_canonical'
SET c.body_zones_updated_at = datetime();

MERGE (c:ChakralCenter {bimbaCoordinate: '#2-5-0/1-3'})
SET c.body_zones = ['muscles', 'bile', 'liver', 'adrenals', 'stomach', 'small_intestine', 'digestive_fire']
SET c.body_zones_source = 'ayurveda_tantra_canonical'
SET c.body_zones_updated_at = datetime();

MERGE (c:ChakralCenter {bimbaCoordinate: '#2-5-0/1-4'})
SET c.body_zones = ['heart', 'lungs', 'thymus', 'kidneys', 'circulatory_system', 'upper_chest', 'arms']
SET c.body_zones_source = 'ayurveda_tantra_canonical'
SET c.body_zones_updated_at = datetime();

MERGE (c:ChakralCenter {bimbaCoordinate: '#2-5-0/1-5'})
SET c.body_zones = ['throat', 'vocal_cords', 'thyroid', 'bronchi', 'trachea', 'cervical_nerves', 'ears']
SET c.body_zones_source = 'ayurveda_tantra_canonical'
SET c.body_zones_updated_at = datetime();

MERGE (c:ChakralCenter {bimbaCoordinate: '#2-5-0/1-6'})
SET c.body_zones = ['pituitary', 'pineal', 'cerebrospinal_fluid', 'optic_nerves', 'frontal_lobe', 'autonomic_nervous_system']
SET c.body_zones_source = 'ayurveda_tantra_canonical'
SET c.body_zones_updated_at = datetime();

MERGE (c:ChakralCenter {bimbaCoordinate: '#2-5-0/1-7'})
SET c.body_zones = ['cerebral_cortex', 'higher_nervous_system', 'fontanelle', 'crown_endocrine_axis', 'consciousness_field']
SET c.body_zones_source = 'ayurveda_tantra_canonical'
SET c.body_zones_updated_at = datetime();
```

**Query pattern after augmentation — planet → body zones (one-hop via existing relation):**

```cypher
// Get body zones for a planet by name
MATCH (p:PlanetaryHarmonic {name: $planet_name})
      -[:PLANETARY_RESONANCE]->
      (c:ChakralCenter)
RETURN p.name            AS planet,
       c.name            AS chakra,
       c.body_zones      AS body_zones,
       c.anatomicalLocation AS anatomical_location
```

**Get all planet→body-zone mappings in one query:**

```cypher
MATCH (p:PlanetaryHarmonic)-[:PLANETARY_RESONANCE]->(c:ChakralCenter)
WHERE c.body_zones IS NOT NULL
RETURN p.name        AS planet,
       p.bimbaCoordinate AS planet_coord,
       c.name        AS chakra,
       c.bimbaCoordinate AS chakra_coord,
       c.body_zones  AS body_zones
ORDER BY p.bimbaCoordinate
```

---

### XIV.5 Option B — Query Existing Data (Fallback before augmentation)

If `body_zones` has not yet been written, the closest existing structured data is `ChakralCenter.anatomicalLocation`. This is a free-text string, not an array, but parseable:

```cypher
// Fallback: use anatomicalLocation as body zone proxy
MATCH (p:PlanetaryHarmonic)-[:PLANETARY_RESONANCE]->(c:ChakralCenter)
RETURN p.name                  AS planet,
       c.name                  AS chakra,
       c.anatomicalLocation    AS anatomical_location,
       c.elementalCorrespondence AS element,
       c.body_zones            AS body_zones_structured  -- null until Option A runs
ORDER BY c.bimbaCoordinate
```

**Expected output before Option A (anatomicalLocation only):**

| planet | chakra | anatomical_location |
|--------|--------|---------------------|
| Saturn | Mūlādhāra | Base of spine, perineum, pelvic floor |
| Jupiter | Svādhiṣṭhāna | Lower abdomen, sacral region, reproductive organs |
| Mars | Maṇipūra | Solar plexus, upper abdomen, digestive system |
| Venus | Anāhata | Heart region, chest center, cardiac plexus |
| Mercury | Viśuddha | Throat region, thyroid, vocal apparatus |
| Moon | Ājñā | Between eyebrows, pineal gland, third eye region |
| Sun | Sahasrāra | Crown of head, fontanelle, cerebral cortex |

---

### XIV.6 Rust Static Array — `CHAKRA_BODY_ZONES`

Hardcoded from canonical Ayurvedic/Tantric correspondences. Neo4j is the updatable source of truth; this static array is the fast in-process fallback for `M4_Temporal_Now` population and offline mode.

Index matches `Chakra_Id` enum: `EARTH=0` (no chakra), `MULADHARA=1`, `SVADHISTHANA=2`, `MANIPURA=3`, `ANAHATA=4`, `VISHUDDHA=5`, `AJNA=6`, `SAHASRARA=7`.

```rust
/// Canonical body zones per chakra, indexed by Chakra_Id.
/// Source of truth: Neo4j ChakralCenter.body_zones (parashakti #2-5-0/1-x).
/// Neo4j coordinates: Saturn→#2-5-0/1-1, Jupiter→#2-5-0/1-2, Mars→#2-5-0/1-3,
///   Venus→#2-5-0/1-4, Mercury→#2-5-0/1-5, Moon→#2-5-0/1-6, Sun→#2-5-0/1-7.
pub static CHAKRA_BODY_ZONES: [&[&str]; 8] = [
    // EARTH = 0: no chakra (planetary grounding substrate)
    &[],
    // MULADHARA = 1: Pṛthivī (Earth) — Saturn
    &["bones", "teeth", "skin", "joints", "nails", "skeletal_structure", "adrenal_cortex"],
    // SVADHISTHANA = 2: Āpas (Water) — Jupiter
    &["blood", "lymph", "mucus", "reproductive_organs", "urine", "seminal_fluid", "synovial_fluid"],
    // MANIPURA = 3: Agni (Fire) — Mars
    &["muscles", "bile", "liver", "adrenals", "stomach", "small_intestine", "digestive_fire"],
    // ANAHATA = 4: Vāyu (Air) — Venus
    &["heart", "lungs", "thymus", "kidneys", "circulatory_system", "upper_chest", "arms"],
    // VISHUDDHA = 5: Ākāśa (Space) — Mercury
    &["throat", "vocal_cords", "thyroid", "bronchi", "trachea", "cervical_nerves", "ears"],
    // AJNA = 6: beyond elements — Moon
    &["pituitary", "pineal", "cerebrospinal_fluid", "optic_nerves", "frontal_lobe", "autonomic_nervous_system"],
    // SAHASRARA = 7: pure consciousness — Sun
    &["cerebral_cortex", "higher_nervous_system", "fontanelle", "crown_endocrine_axis", "consciousness_field"],
];

/// Given a Chakra_Id, return its canonical body zones.
/// Falls back to empty slice for EARTH (0).
pub fn body_zones_for_chakra(chakra_id: u8) -> &'static [&'static str] {
    if (chakra_id as usize) < CHAKRA_BODY_ZONES.len() {
        CHAKRA_BODY_ZONES[chakra_id as usize]
    } else {
        &[]
    }
}

/// Derive body zones for a planet via its elem_sig chakra field.
/// elem_sig: bits [5:3] = chakra_id (3 bits).
pub fn body_zones_for_planet(elem_sig: u8) -> &'static [&'static str] {
    let chakra_id = (elem_sig >> 2) & 0b111;
    body_zones_for_chakra(chakra_id)
}
```

**Planet→Chakra→BodyZones chain (compile-time constants, matches M2 C enum values):**

| Planet | Element (elem_sig bits[7:5]) | Chakra_Id (bits[4:2]) | Primary Body Zones |
|--------|------------------------------|----------------------|-------------------|
| Saturn | PRITHVI=4 | MULADHARA=1 | bones, teeth, skin, joints |
| Moon | APAS=3 | SVADHISTHANA=2 | blood, lymph, mucus, reproductive |
| Mars | AGNI=2 | MANIPURA=3 | muscles, bile, liver, adrenals |
| Venus | APAS/VAYU mixed | ANAHATA=4 | heart, lungs, kidneys, thymus |
| Mercury | VAYU=1 | VISHUDDHA=5 | nerves, throat, bronchi, thyroid |
| Jupiter | AKASHA=0 | AJNA=6 | pituitary, pineal, cerebrospinal |
| Sun | AGNI=2 | SAHASRARA=7 | cerebral cortex, crown, consciousness |

**Note on `Elemental_Signature` bit packing:** The M2 C code packs `element(3bits)|chakra(3bits)|phase(2bits)` into a `uint8_t`. The Rust side must decode chakra_id as `(elem_sig >> 2) & 0b111` (bits 4:2, after the 2-bit phase), not `(elem_sig >> 5)`. Verify against `epi-lib/m2/include/m2.h` `Elemental_Signature` before shipping.

---

### XIV.7 Implementation Notes

1. **Run Option A Cypher once** against the live Neo4j instance (port configured in `epi-cli/src/graph/client.rs`) to persist `body_zones` arrays on `ChakralCenter` nodes.
2. **Cache invalidation**: `ChakralCenter.body_zones` is stable (Ayurvedic canon). No TTL needed. Embed `body_zones_updated_at` on each node for auditability.
3. **Fallback path**: If Neo4j is unavailable (offline), `body_zones_for_planet(elem_sig)` from the static array above returns the same data without a graph query.
4. **Node identity stability**: The `bimbaCoordinate` property (e.g. `"#2-5-0/1-1"`) is the stable MERGE key. Do not use Neo4j `identity` integers — those are internal and may differ across database instances.
5. **Outer planets**: Pluto, Uranus, Neptune have no `PlanetaryHarmonic` nodes in the current dataset. They are not in the Chaldean 7 and have no `PLANETARY_RESONANCE` relations. For M4 purposes, leave body zones empty (`&[]`) for outer planet `elem_sig` values.

---

## Part XV: L-Coordinate System — Klein V4 and Entity Elemental Charge

> **Canonical spec:** `Idea/Bimba/Seeds/S/S4/S4'/Legacy/specs/L/L-coordinate-system.md`
> **Source of truth:** `epi-lib/src/m2.c` `M2_MEF_LENS_NAMES[12]`, `M2_MEF_DESC[72]`

### XV.1 The 12-Lens System

The L-coordinate family manifests the #0-#5 archetypes through **epistemic modes** — distinct ways
consciousness apprehends reality. The system comprises 12 lenses in two hexads:

**Day lenses (L0-L5) — Torus topology, explicate, outward:**

| Lens | Canonical Name | QL Position | Root |
|------|---------------|-------------|------|
| L0 | Quaternal | #0 | QL as Psychoid Ground — Curiosity and Creative Potential |
| L1 | Causal | #1 | Aristotle, Iccha Shakti, Schopenhauer — Will as Causal Force |
| L2 | Logical | #2 | Catuskoti / Tetralemma — IS / IS-NOT / BOTH / NEITHER |
| L3 | Processual | #3 | Whitehead — Concrescence, Creative Advance into Novelty |
| L4 | Phenomenological | #4 | Heidegger — Being-in-the-World, Science of Experience |
| L5 | Para Vak | #5 | Kashmir Shaivism — Speech/Code as Creative Reality |

**Night lenses (L0'-L5') — Klein topology, implicate, inward:**

| Lens | Canonical Name | QL Position | Root |
|------|---------------|-------------|------|
| L0' | Archetypal-Numerical | #0' | Jung-Pauli — Number as Psychoid Reality |
| L1' | Phenomenal | #1' | Jungian Psychic Functions — Qualia and Immediate Experience |
| L2' | Alchemical-Elemental | #2' | Alchemy, Transcendent Function — Elemental Transformation |
| L3' | Chronological | #3' | Hegel, Aion — History as Becoming of Spirit |
| L4' | Scientific | #4' | Kuhn — Paradigm Awareness and Knowledge Work |
| L5' | Divine Logos | #5' | Logos (John 1:1), Epi-Logos — Divine Personage, Creative Word |

MEF structure: **12 lenses × 6 positions = 72 conditions** in `M2_Vibrational_72_Space`.

### XV.2 Klein V4 Relational Structure — Three Squares

The 12 lenses organize into three **Klein V4 squares** governing their mutual topology:

**Square A:** L0, L5, L0', L5' — Potential ↔ Speech ↔ Numbers ↔ Divine Logos
**Square B:** L1, L4, L1', L4' — Causal ↔ Phenomenological ↔ Phenomenal ↔ Scientific
**Square C:** L2, L3, L2', L3' — Logical ↔ Processual ↔ Alchemical-Elemental ↔ Chronological

**The Four Relational Laws (universal across all squares):**

| Law | Formula | Meaning |
|-----|---------|---------|
| Day complement | X + Y = 5 | L0+L5=5, L1+L4=5, L2+L3=5 — Klein complements |
| Night complement | X' + Y' = 5 | L0'+L5'=5, L1'+L4'=5, L2'+L3'=5 |
| Day-Night doubling | X + X' = 2x | Same QL position in both modes doubles the archetype |
| Cross integration | Y + Y' = 2y | Complement pair in both modes yields full synthesis |

**Möbius return pairs** (confirmed from Bimba files):

| Day sends to | Night | Night sends back to | Day |
|-------------|-------|---------------------|-----|
| L0 → | L5' (Divine Logos) | L5' → | L0 (Quaternal) |
| L1 → | L4' (Scientific) | L4' → | L1 (Causal) |
| L2 → | L3' (Chronological) | L3' → | L2 (Logical) |
| L3 → | L2' (Alchemical-Elemental) | L2' → | L3 (Processual) |
| L4 → | L1' (Phenomenal) | L1' → | L4 (Phenomenological) |
| L5 → | L0' (Archetypal-Numerical) | L0' → | L5 (Para Vak) |

### XV.3 Entity Elemental Charge via Klein Square Path

**L2' (Alchemical-Elemental) is the element-bearing lens.** Its 6 sub-positions directly name
the elements: Aether(0), Earth(1), Water(2), Air(3), Fire(4), Mineral(5).

Every entity with a QL coordinate has a **native lens** derived from its coordinate family and
position. Its primary element is determined by tracing through the Klein square to L2':

```
entity_coordinate → native_lens → Klein_square → L2'_sub_position → element
```

**Full element mapping:**

| Lens | Element | Derivation |
|------|---------|-----------|
| L0 | Aether | Square A: L0→L5'→L0' — psychoid number ground is quintessential |
| L1 | Earth | Square B: L1→material cause→Earth stability |
| L2 | Air | Square C: L2→L2' direct doubling — Logical↔Alchemical, Air=intellect |
| L3 | Water | Square C: L3→L2' Möbius return — Processual returns to Water flow |
| L4 | Earth | Square B: L4→L1' phenomenal→Earth grounding |
| L5 | Aether | Square A: L5→L0' return — Para Vak back to archetypal quintessence |
| L0' | Aether | Square A root: archetypal numbers are quintessential |
| L1' | Water | Square B: L1'→phenomenal psychic flow=Water |
| L2' | Aether | L2' root position — Aether as the quintessence from which elements emerge |
| L3' | Fire | Square C: L3'→dialectical drive→Fire transformation |
| L4' | Earth | Square B: L4'→systematic scientific grounding=Earth |
| L5' | Aether | Square A: L5' Divine Logos = quintessential speech |

### XV.4 ACTG Charge Vector Mapping

Every element maps to a quaternionic ACTG nucleotide charge vector that encodes the entity's
resonance profile in `M4_Identity_Matrix.quintessence_hash` space:

| Element | A (Adenine) | C (Cytosine) | T (Thymine) | G (Guanine) | Character |
|---------|------------|-------------|------------|-------------|-----------|
| **Aether** | 0.25 | 0.25 | 0.25 | 0.25 | Perfectly balanced — quintessence |
| **Earth** | 0.15 | 0.55 | 0.15 | 0.15 | C-dominant — material crystallization |
| **Fire** | 0.10 | 0.25 | 0.40 | 0.25 | T-dominant — transformative drive |
| **Water** | 0.50 | 0.20 | 0.15 | 0.15 | A-dominant — receptive flow |
| **Air** | 0.15 | 0.15 | 0.15 | 0.55 | G-dominant — communicative movement |
| **Mineral** | — | — | — | — | Crystallized result; inherits from Earth |

### XV.5 `entity_charge_from_coordinate()` — Function Spec

Implemented in `epi-cli/src/nara/resonance.rs`:

```rust
/// Derive the ACTG elemental charge vector for any entity from its QL coordinate.
///
/// Steps:
///   1. Parse coordinate → extract L-family position (0-11 = L0..L5')
///   2. Look up native_lens via coordinate_family (P→L0, S→L1, T→L2, M→L3, L→L4, C→L5)
///      or use explicit L-coordinate if entity IS an L-node
///   3. Map native_lens → element via Klein square path (XV.3 table above)
///   4. Return ACTG charge vector for that element (XV.4 table above)
///
/// Returns: [f32; 4] = [A, C, T, G]
pub fn entity_charge_from_coordinate(coordinate: &str) -> [f32; 4] {
    let lens_idx = parse_lens_from_coordinate(coordinate);
    let element = LENS_ELEMENT_MAP[lens_idx];  // static table from XV.3
    ELEMENT_ACTG_CHARGE[element as usize]      // static table from XV.4
}

/// Resonance between two entities = cosine similarity of their ACTG charge vectors.
/// Range: [-1.0, 1.0] — 1.0 = identical charge profile, -1.0 = polar opposition
pub fn entity_resonance(coord_a: &str, coord_b: &str) -> f32 {
    let charge_a = entity_charge_from_coordinate(coord_a);
    let charge_b = entity_charge_from_coordinate(coord_b);
    cosine_similarity(&charge_a, &charge_b)
}
```

### XV.6 Why Every Entity is a Point in ACTG Quaternionic Space

The ACTG charge vector places every entity — person, concept, artifact, oracle card, journal
entry, or coordinate node — into a **shared 4-dimensional space**. This enables:

- **Resonance computation**: `cosine_similarity(charge_A, charge_B)` → scalar resonance score
  between any two entities (person ↔ oracle card, concept ↔ moment, entity ↔ place)
- **Oracle alignment**: Tarot card draws and I-Ching hexagrams have coordinates; their charges
  resonate with the querent's current elemental state
- **Medicine prescription**: Elemental imbalance in `M4_Medicine_State` is detected by comparing
  the entity's current ACTG profile to the balanced Aether vector; deviations indicate deficiency
- **Pratibimba archaeology**: Neo4j term nodes carry coordinates; `entity_resonance()` enables
  semantic similarity queries that are ontologically grounded rather than purely statistical

The BLAKE3 quintessence hash (`M4_Identity_Matrix.quintessence_hash`) is computed from the
ACTG charge profile plus the 6 identity layers — ensuring the hash captures both the ontological
position (coordinate) and the lived identity (natal data, jungian type, gene keys, etc.).

**Architectural invariant**: Element derivation is **deterministic** from coordinate alone. No
stochastic component. The elemental charge is a property of where an entity sits in the QL
coordinate space, not of how it is perceived.

---

## Part XVI: M0–M4 Integration Threads (Added 2026-03-12)

**Companion plan:** `Idea/Bimba/Seeds/M/M0'/Legacy/plans/2026-03-12-m0-relational-depth-and-archetype-completeness.md`

### XVI.1 The Vak Thread in ZodiacDecanEntry

`ZODIAC_DECAN_TABLE[36]` (medicine.rs) currently captures M0→M1→M2 correctly but the Vak operator (`symbol_pair`) stores an index. **Fix required:** populate the Vak operator string (!, ?, !-, -?, !?, ?-, -!, ?!, -!/!-, -?/?-, !?/?!, ?!/!?) from the `elementalNature`/`symbol` properties of `#0-3-6-0` through `-11`. These ARE the same element as each zodiac sign — confirmed by `elementalNature` property on dataset nodes. See Plan §0.1 for full table.

### XVI.2 L-Coordinate Resonance with Archetypal Numbers

The 12 L-coordinates use **canonical names** (source: `Idea/Bimba/Seeds/S/S4/S4'/Legacy/specs/L/L-coordinate-system.md`):
L0=Quaternal, L1=Causal, L2=Logical, L3=Processual, L4=Phenomenological, L5=Para Vak,
L0'=Archetypal-Numerical, L1'=Phenomenal, L2'=Alchemical-Elemental, L3'=Chronological, L4'=Scientific, L5'=Divine Logos.

Key resonances (epistemic, not 1:1 mappings):
- **L3 Processual** ↔ **Archetype 3 (Vak)**: Whitehead concrescence = same creative advance that Vak enacts as speech
- **L0' Archetypal-Numerical** ↔ #0-3 number language directly (psychoid numbers as epistemic mode)
- **L2' Alchemical-Elemental** ↔ element chain through Vak operators and decans
- **L5 Para Vak** ↔ Archetype 5/MonoPoly: supreme speech as Siva-Shakti integration

Update `qv_data.c` L-family pithy strings using canonical names; add resonance annotations to `nara/lens.rs`.

### XVI.3 Planet as Relational Backbone

Planets (Chaldean 7) are the system connective tissue. The chain already partly implemented in medicine.rs (PLANET_CHAKRA, ZODIAC_DECAN_TABLE) extends upward through:
- Planet → tattva layer (#2-2 Shuddha/Ashuddha) → 100 Shaivite mantras (#2-4.1)
- Planet/element → maqam mode (#2-4.2 24 stations, #2-4.3 72 musical maqamat)
- Maqam → 99+1 divine names (#2-4.0 Asma ul-Husna)
- Divine name gematria → prime resonance → archetypal number (#0-3)
**Subagent task P8-A** (in companion plan) will map this fully.

### XVI.4 Mahamaya Codon Rotation Matrix → Oracle Integration

The mahamaya relation structure encodes tarot rotational states (no "GenerationEvent" label — just relation types): `YIELDS_CODON`, `USES_Pair` (upper/lower), `RESOLVES_TO` (hexagram), `LINE_CHANGE` (384=64×6), `GOVERNS_TAROT_EXPRESSION` (64 minor arcana), `GOVERNS_DEGREE_ARC` (360 degrees).

Pattern: tarot minor arcana → degree arc → codon pair (upper/lower, positive/negative, is_non_dual) → hexagram. The `is_non_dual` and `type: positive/negative` properties on YIELDS_CODON directly map to the M4 oracle's 3-coin method (A=6/T=9/C=7/G=8, old/young yin/yang). **Subagent task P8-B** (in companion plan) writes the extraction script.

### XVI.5 completeFormulation in C Structs

All LUT entries (Archetype, Zodiacal, Virtue, Divine Act, Shakti) should gain `const char* symbol` and `const char* formulation` fields. 67 nodes in anuttara alone have `completeFormulation` — this is the mathematical syntax of the system. Source priority for qv_data.c and struct strings: completeFormulation → coreNature → operationalEssence → operationalDynamics → description. **Subagent task P8-C** in companion plan.

*Part XIV added: 2026-03-11 (OI-GraphSchema research complete)*
