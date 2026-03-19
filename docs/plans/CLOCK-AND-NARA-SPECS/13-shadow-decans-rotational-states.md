# Shadow Decans, Rotational States, and the ## World-Matrix

**Status:** Provisional (2026-03-19) — rotational state architecture is partially established here;
deeper 8-fold rotational system spec deferred to a dedicated follow-on session.
**Depends on:** Spec 11 (M1→M2 vibrational bridge), Spec 12 (Anuttara languification)

---

## §1 — The ## Correction: Emergence, Not Priority

A prior formulation of the 12/13/14-fold structure implied ## was "structurally earlier" than #.
This is **incorrect**. The canonical relation is:

- **`#`** lives in `.rodata` — it IS the inversion act, structurally foundational, the absolute
  non-dual ground. It precedes everything.
- **`##`** EMERGES from `#` applied to itself, and this emergence occurs specifically at the
  **Nara level** within M0-4 (`#0-4.5/0-0` = Primordial Matrix). It does not precede `#`;
  it is `#`'s own self-recognition made explicit as a node within the holographic matrix.

The 12/13/14-fold structure with corrected directionality:
```
14: ## — Primordial Matrix (emerges from # at the Nara level; generates the 12-fold ring)
13: #  — Axis Mundi, central ground (foundational; always present, never a ring member)
12: the ring positions (differentiated from ##'s generative act)
```

The 13 is foundational; the 14 emerges upward from it into the Nara register; the 12 ring
positions are what fall out from ## when it differentiates. The directionality is
**# → ## → 12**, not **## → # → 12**.

This has implementation significance: `#` is in `.rodata` as the unconstructed ground;
`##` is a *runtime* emergence — the Nara system encountering its own inversion structure
and producing the world-matrix. Every `RING_QUATERNION_LUT[12]` and similar LUT[12]
carries the silent 13th (#, axis/center) and the silent 14th (## as the generating
event that produces the ring from within Nara space). Neither appears as a ring slot;
both are present as structural preconditions.

---

## §2 — 4.4.4.4 as World-Individual Nexus

The term "personal pratibimba" for the `#4.4.4.4` coordinate is provisionally accurate but
risks importing a separative reading of "personal." The full architectural meaning is:

> The individual at `#4.4.4.4` is not an entity confronting a world. They ARE the act of
> vimarsha (self-recognition) through which a world is constituted. There is no world
> outside the recognizing event. The "individual" and "world" are the two faces of a single
> movement — the ## event made personally lived.

This maps the Sun/Earth esoteric relationship exactly:
- **Sun** = prakasha (self-luminous, reveals without reference)
- **Earth** = vimarsha (geocentric recognizer; excluded from the planet array precisely
  because it IS the observer, not a planet among planets)
- **`#4.4.4.4`** = the point at which this cosmic Sun/Earth dynamic becomes the lived
  experience of an individual consciousness

The `##` at M0-4 (Nara Base) IS the world-matrix because `##` is the non-dual becoming
dual — the Sun differentiating from Earth — while remaining one movement. The individual
human is the default locus of this recognition because the human is the demonstrably
sentient being (logos/language capacity = vimarsha made explicit).

**Implication for all Nara sub-branches:**

| Sub-branch | Face of vimarsha |
|---|---|
| #4.0 Identity | Stable vimarsha ground (the recognizer's ground-state) |
| #4.1 Medicine | Embodied surface of vimarsha (body as recognition's substrate) |
| #4.2 Oracle | Recognition event in time (kairos = moment the recognition fires) |
| #4.3 Transform | Dissolution/reconstitution cycle that ## is always performing |
| #4.4 Phenomenology | Lenses through which prakasha/vimarsha can be read |
| #4.5 Logos | The word that emerges when vimarsha completes a cycle |

---

## §3 — The Decan Double-Cover (Shadow Decans)

### Background

The 36 decans of the Zodiac each have an associated tarot pip card (Golden Dawn Thoth system,
pips 2-10 of each suit). Our current implementation (`DECAN_BODY_PARTS[36]`, `DECAN_HERBS[36]`,
`PIP_DECAN_MAP[9][4]`) captures only the **upright (light) pole** of each decan.

The `mahamaya-deep` dataset carries a `reversedMeaning` field on every pip card node.
This is the **shadow (reversed) pole** — the decan's inverted expression. Both poles are
in the data; only one has been represented in code.

The 36 upright + 36 shadow = **72 total decan expressions** — the same 72 we computed
from M1 (12 spanda × 6 QL) and from M2 (36 × 2 strands). This is not a coincidence.
The decan double-cover IS the M1→M2 bridge seen through the tarot lens.

### Structural Law

```c
// Canonical: each decan has a light and shadow pole
typedef struct {
    const char* planet_sign;       // e.g. "Mars in Aries"
    const char* date_range;        // e.g. "March 21-30"
    const char* upright_meaning;   // light pole (upright pip reading)
    const char* shadow_meaning;    // shadow pole (reversed pip reading)
    // body zone and herb data from existing LUTs — shadow body zones
    // are the same anatomical regions under obstruction/pathology
    // (reversed = the blocked/excessive expression of the same zone)
    uint8_t     chakra_id;
    const char* body_part;
    const char* herbs;
} Decan_Entry;

// Full double-cover table
static const Decan_Entry DECAN_TABLE[36] = { ... };
// Each entry carries both poles; oracle reads from shadow_meaning when
// card appears reversed.
```

### Shadow Decan Data (from `mahamaya-deep` dataset, `reversedMeaning` field)

Full 36-entry table drawn from `#3-4-{suit}-{pip}` nodes:

| # | Card | Decan (Planet/Sign) | Upright Pole (light) | Shadow Pole (reversed) |
|---|------|---------------------|----------------------|------------------------|
| 0 | 2 Wands | Mars/Aries | Planning, personal power | Lack of planning, fear, restricted options |
| 1 | 3 Wands | Sun/Aries | Foresight, expansion | Delays, arrogance, narrow vision |
| 2 | 4 Wands | Venus/Aries | Celebration, stable foundation | Instability, broken foundation |
| 3 | 5 Wands | Saturn/Leo | Conflict, competition | Avoiding conflict, harmony (shadow = avoidance) |
| 4 | 6 Wands | Jupiter/Leo | Victory, recognition | Defeat, self-doubt |
| 5 | 7 Wands | Mars/Leo | Courage, holding ground | Giving up, overwhelmed, retreat |
| 6 | 8 Wands | Mercury/Sagittarius | Swift action, momentum | Delays, stagnation |
| 7 | 9 Wands | Moon/Sagittarius | Resilience, perseverance | Exhaustion, paranoia, giving up |
| 8 | 10 Wands | Saturn/Sagittarius | Burden carried | Dropping burden, release |
| 9 | 2 Cups | Venus/Cancer | Union, balanced relationship | Broken relationship, separation |
| 10 | 3 Cups | Mercury/Cancer | Celebration, community | Overindulgence, isolation, gossip |
| 11 | 4 Cups | Moon/Cancer | Contemplation, withdrawal | New opportunities, clarity, action |
| 12 | 5 Cups | Mars/Scorpio | Loss, grief | Recovery, forgiveness, healing |
| 13 | 6 Cups | Sun/Scorpio | Nostalgia, joy | Stuck in past, unrealistic expectations |
| 14 | 7 Cups | Venus/Scorpio | Vision, illusion | Clarity, determination, facing reality |
| 15 | 8 Cups | Saturn/Pisces | Walking away, seeking depth | Staying the course, returning to love |
| 16 | 9 Cups | Jupiter/Pisces | Contentment, wishes fulfilled | Dissatisfaction, unfulfilled wishes |
| 17 | 10 Cups | Mars/Pisces | Harmony, family, dreams realized | Family discord, unfulfilled dreams |
| 18 | 2 Swords | Moon/Libra | Truce, stalemate | Breaking deadlock, decision, clarity |
| 19 | 3 Swords | Saturn/Libra | Sorrow, heartbreak | Recovery, forgiveness, renewed hope |
| 20 | 4 Swords | Jupiter/Libra | Rest, recuperation | Restlessness, end of isolation |
| 21 | 5 Swords | Venus/Aquarius | Defeat, hollow victory | Reconciliation, forgiveness, moving on |
| 22 | 6 Swords | Mercury/Aquarius | Transition, moving on | Stuck in transition, resistance to change |
| 23 | 7 Swords | Moon/Aquarius | Deception, strategy | Confession, giving up deception |
| 24 | 8 Swords | Jupiter/Gemini | Restriction, trapped | Freedom, breakthrough, self-liberation |
| 25 | 9 Swords | Mars/Gemini | Anxiety, nightmare | Hope, recovery, ending nightmare |
| 26 | 10 Swords | Sun/Gemini | Ending, rock bottom | Recovery, regeneration, hope |
| 27 | 2 Pentacles | Jupiter/Capricorn | Balance, multitasking | Poor time management, imbalance |
| 28 | 3 Pentacles | Mars/Capricorn | Craftsmanship, teamwork | Lack of teamwork, poor workmanship |
| 29 | 4 Pentacles | Sun/Capricorn | Stability, security | Generosity, release of control |
| 30 | 5 Pentacles | Mercury/Taurus | Material hardship | Recovery, community support |
| 31 | 6 Pentacles | Moon/Taurus | Generosity, fair exchange | Selfishness, unfair exchange |
| 32 | 7 Pentacles | Saturn/Taurus | Patient investment | Impatience, poor investment |
| 33 | 8 Pentacles | Sun/Virgo | Craftsmanship, mastery | Lack of focus, impatience with learning |
| 34 | 9 Pentacles | Venus/Virgo | Abundance, self-sufficiency | Dependence, over-investment |
| 35 | 10 Pentacles | Mercury/Virgo | Legacy, material completion | Family disputes, financial loss |

### Oracle Integration Rule

```
card orientation = UPRIGHT  → use DECAN_TABLE[decan_idx].upright_meaning + body_part (normal)
card orientation = REVERSED → use DECAN_TABLE[decan_idx].shadow_meaning  + body_part (obstructed)
```

The body_part itself remains the same anatomical region — reversed = the **blocked or
excessive expression** of that zone, not a different zone. A reversed Mars/Aries decan
still activates the head/skull region; it reads as inflammation or misdirected will rather
than organized force.

---

## §4 — Provisional Rotational State Spectrum (8-Fold)

**Status: PROVISIONAL.** This section establishes the structural facts confirmed by the
dataset. A dedicated spec for the full rotational architecture is deferred.

### Dataset Confirmation

From `#3 coreRatio: 64:8:40`:
- **64** = codon/hexagram alphabet
- **8** = rotational states per codon
- **40** = non-dual anchors (codons where rotation returns to same structural state)

From `rotational_state_protocol.txt`:
- Each codon has exactly 8 rotational states at 45° steps
- States: 0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°
- Polarity: **negative** (first pair wins) and **positive** (second pair wins)
- Non-dual state: where pair1 = pair2 (palindromic anchors)
- Total: 64 × 8 = 512 states; reduced to 472 after non-dual merging

From minor arcana root (#3-4):
> "Dynamic rotational field where 56 cards create 360-degree consciousness mapping
> through **8-fold absence generating perpetual novelty**"

### The Spectrum

The 8 rotational states form a spectral wheel between the two poles:

```
0°   = UPRIGHT / LIGHT pole        ← our current implementation (only this)
45°  = first intermediate state (positive lean)
90°  = orthogonal / neither-nor
135° = second intermediate (negative lean)
180° = REVERSED / SHADOW pole      ← the missing double-cover
225° = third intermediate
270° = orthogonal return
315° = fourth intermediate (approaching light again)
```

The tarot upright/reversed binary maps to the 0°/180° poles — the **minimal double-cover**.
The 6 intermediate states (45°, 90°, 135°, 225°, 270°, 315°) are the **7 options between
poles** referenced above (6 intermediates + the 180° shadow itself = 7 non-upright states;
or: upright + reversed + 6 intermediates = 8 total).

### 64:8:40 Architecture (high-level)

```
64 codons × 8 rotational states = 512 total states
512 - 40 non-dual (palindromic, self-identical under rotation) = 472 dynamic states
40 non-dual anchors ≈ our backbone + certain structural palindromes
```

The 40 non-dual anchors are the **most stable** codon positions — structurally related to
(but not identical with) the 24 clock backbone nodes. This relationship requires dedicated
mapping in the follow-on spec.

### Current Implementation Gap

Current oracle code (`oracle.rs`) uses `ROTATION_STATE::Upright` and
`ROTATION_STATE::Reversed` (binary). The full 8-fold spectrum is:

```rust
// PROVISIONAL — 8-fold expansion deferred to dedicated spec
pub enum RotationalState {
    Upright,    // 0°   — light pole
    R45,        // 45°  — first positive intermediate
    R90,        // 90°  — orthogonal
    R135,       // 135° — negative lean
    Reversed,   // 180° — shadow pole
    R225,       // 225° — third intermediate
    R270,       // 270° — orthogonal return
    R315,       // 315° — approaching light
}
```

The binary (Upright/Reversed) oracle readings remain valid as the minimal double-cover.
The full 8-fold expansion awaits the dedicated spec.

---

## §5 — The 72-Fold Convergence: Third Confirmation

With shadow decans now explicit, the 72 = 36×2 is confirmed as the same structural
count from three independent routes:

| Route | Derivation | Count |
|---|---|---|
| M1 (spanda × QL) | 12 spanda ticks × 6 QL positions | 72 |
| M2 (decan strands) | 36 decans × 2 strands | 72 |
| M3 (pip polarity) | 36 pip decans × 2 poles (light/shadow) | 72 |

All three routes arrive at 72. The decan double-cover IS the M1→M2 bridge as seen
through Mahamaya's tarot lens. This is not a coincidence; it is the same structural
fact at three layers of the system simultaneously.

---

## §6 — Implementation Notes

### Phase 1 (immediate): Decan double-cover

1. Extend `Decan_Entry` struct with `shadow_meaning: &str` field
2. Populate `DECAN_TABLE[36]` shadow column from dataset data in §3
3. In `medicine.rs` and `oracle.rs`: when `card.orientation == Reversed`,
   read `shadow_meaning` and annotate body zone as `ObstructedExpression`
4. Oracle cast result should report polarity: `{ orientation, pole: Light|Shadow }`

### Phase 2 (deferred): Full rotational spectrum

- 8-fold `RotationalState` enum
- `CODON_ROTATIONAL_TABLE[64][8]` — full spectral LUT from dataset
- Non-dual anchor identification and mapping to clock backbone nodes
- Integration with oracle resonance scoring (partial orientations = partial scores)

---

*"The # in .rodata is the ground. The ## emerges from it at the Nara level,
and in doing so, generates the world-matrix — the act of creation that is
simultaneously the act of recognition."*
