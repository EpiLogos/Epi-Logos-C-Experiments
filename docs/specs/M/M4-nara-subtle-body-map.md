# M4' — Archetypal-Citta: Subtle Body Map Specification

**Status:** Canonical Specification — v1.0
**Date:** 2026-03-10
**Coordinate:** #4.0 × #4.1 × #4.2 × M2 — Identity × Medicine × Oracle × Vibrational Ground
**Parent Spec:** `docs/specs/M/M4-nara-personal-interface.md` (FR 2.4)
**Runtime Plan:** `docs/plans/2026-03-10-nara-runtime-full-plan.md`
**Implementation Home:** `Idea/Pratibimba/System/epi-app/renderer/domains/M4_Nara/`

---

## I. Overview

The **Subtle Body Map** (coordinate name: **Archetypal-Citta**) is the primary identity
visualisation in the M4' Nara interface. It renders the user's psychophysical signature —
not their physical anatomy, but their **symbolic body-mind** as the convergence of identity
layers, oracular signals, planetary positions, and elemental triage.

**Archetypal-citta** (Sanskrit: *ārchaiotypa-citta*, archetypal body-mind) is the term for
the personal field that M4's coordinate #4.4.4.4 (Personal Pratibimba) is attempting to map:
the living intersection of cosmic pattern and individual life. In Kashmir Shaivism, *citta*
is consciousness in its contracted form as mind-body. At #4 (Lemniscate anchor), the universal
folds into the personal — this visualisation IS that fold, rendered.

### What This Is Not

- Not a medical anatomy diagram
- Not a generic chakra chart
- Not a static illustration
- Not decorative

### What This Is

A **live, data-driven, multi-layer symbolic map** that updates continuously from:
- `nara.identity.get` — nucleotide weights, planetary natal positions, quintessence hash
- `nara.medicine.balance` — chakra activation, elemental triage vector
- `nara.kairos.current` — current planetary positions on the SU(2) ring
- `nara.oracle.payload` (latest cast) — body zones, organs, elements, operations
- SpacetimeDB `M2PlanetaryState`, `M1TorusState` — live cosmic state

The map **decays** between oracle casts (highlights fade), **breathes** at planetary rates
(Cousto frequencies), and carries a **unique visual signature per user** (BLAKE3 hash seed).

---

## II. Philosophical Grounding — The Elemental Throughline

The Elemental Throughline (FR 2.4.7 in parent spec) is the structural backbone:

| Nucleotide | Element | Jungian Function | Tarot Suit | Colour |
|-----------|---------|-----------------|-----------|--------|
| Adenine (A) | Water (Yin) | Feeling (Fi/Fe) | Cups | Deep teal / moonstone |
| Thymine (T) | Fire (Yang) | Intuition (Ni/Ne) | Wands | Amber / saffron |
| Cytosine (C) | Earth (Yin) | Sensation (Si/Se) | Pentacles | Ochre / forest |
| Guanine (G) | Air (Yang) | Thinking (Ti/Te) | Swords | Silver / indigo |

These four are not colour choices — they are ontological fact established in M2/M3/M4.
Every visual encoding must be consistent with this table. A King of Swords (G/Air) canonical
tag MUST render in silver/indigo. High Adenine (A/Water) MUST expand the teal field.

---

## III. Data Sources and Visual Contribution

### Input Sources (all from Nara gateway)

| Source | Gateway Method | Contribution | Update Rate |
|--------|----------------|-------------|-------------|
| Identity layer 0 | `nara.identity.get` | Quintessence hash → colour seed | Session open |
| Identity layer 1 | `nara.identity.get` | Natal planet positions → ring anchors | Session open |
| Identity layer 2 | `nara.identity.get` | Nucleotide weights → element field | Session open |
| Identity layer 3 | `nara.identity.get` | Gene Keys mask → active hexagram glyphs | Session open |
| Medicine triage | `nara.medicine.balance` | Chakra activation levels | On request / daily |
| Kairos current | `nara.kairos.current` | Live planet positions → ring animation | Daily / on demand |
| Oracle payload | `nara.oracle.payload` | Body zones, organs, elements, operations | Per cast |
| M1 torus state | SpacetimeDB subscribe | Torus rotation, ascending/descending | Live |
| M2 planetary | SpacetimeDB subscribe | Planetary orbital positions | Live |

### Synthesis Rule

The map renders three temporal layers simultaneously:

```
NATAL (static ground)        — who you are at root
  ↓ composed with
KAIROS (today's sky)         — where the cosmic field is today
  ↓ modulated by
ORACLE (last cast, ephemeral) — what the oracle just revealed
```

The natal layer is the body. The kairos layer is the weather. The oracle layer is
the event — it illuminates specific regions and then fades.

---

## IV. Visual Layer Architecture

Seven layers render from back to front. Each independently toggleable.

### Layer 7 — Quintessence Ground (background canvas)

**Technology:** Canvas 2D (offscreen, redrawn once per session)
**Input:** `quintessence_hash` (u64, first 16 hex chars)
**Renders:**
- Seeded generative geometry from hash — every user sees a unique tiled pattern
- Pattern family: sacred geometry variants (Flower of Life, Metatron, Sri Yantra grid,
  Fibonacci spiral) selected by `hash % 4`
- Hue: derived from `hash & 0xFF` mapped to a 0-360° HSL rotation on a muted dark base
- Low opacity (0.08–0.15): this is ground, not foreground
- Never animates — computed once, displayed statically

**Invariant:** Two users with different hashes MUST have visually distinguishable grounds.
Two sessions for the same user MUST show the same ground.

---

### Layer 6 — Atmospheric Depth (Three.js canvas)

**Technology:** Three.js WebGL via `@react-three/fiber`, rendered to a `<canvas>` behind SVG
**Input:** `M1TorusState`, `M2PlanetaryState` (SpacetimeDB live subscription)
**Renders:**

1. **Torus Ring** — a thin luminous torus ring (R=16/9, r=0.1) centered behind the figure.
   - Rotation = `(torusPos / 12) * 2π` radians around Y axis
   - Ascending = glow warm (amber); descending = glow cool (slate)
   - Not a full 3D torus — a 2D ring with depth via perspective camera angle (~30°)
   - Animated: slowly rotates at 1 tick per real day (imperceptible drift, registers subliminally)

2. **Planetary Aura** — 10 faint orbital traces, one per planet
   - Each trace is a partial arc (not full circle — just the arc near the figure)
   - Opacity proportional to `keplerianVel` — faster planets are more visible
   - Colour = elemental affiliation of planet (Sun=Fire/amber, Moon=Water/teal, etc.)
   - Position anchored to `degree_anchor` (live from kairos) → angle on arc

3. **Particle field** — ~200 slow-drifting particles in background
   - Colour = nucleotide dominant element colour
   - Drift speed ∝ `fire_level / 255` (more fire = faster drift)

---

### Layer 5 — Element Field (SVG)

**Technology:** SVG `<radialGradient>` with animated `r`, `opacity`, `stopColor`
**Input:** `nucleotide: { A, T, C, G }` from `nara.identity.get`; `oracleElements[]` from latest cast
**Renders:**

An aura surrounding the figure silhouette. Four overlapping radial gradients, one per element:

```
Dominant element  → large gradient, opacity = (weight / 255) * 0.55, inner radius 40%
Secondary element → medium gradient, opacity = (weight / 255) * 0.35, inner radius 55%
Tertiary          → small gradient, opacity = (weight / 255) * 0.18
Deficient         → minimal trace, opacity = 0.05 (presence acknowledged)
```

Oracle overlay: when `oracleElements[]` is non-empty (fresh cast), the corresponding
element gradients pulse to full opacity for 3 seconds then settle back to nucleotide-derived
opacity over 30 seconds. The pulse is the oracle landing.

**Elemental colour stops:**

```
Fire  (T): inner #FF8C00 (amber), outer #FF4500 (red-orange), far #2D0A00 (near-black)
Water (A): inner #00CED1 (teal), outer #003366 (deep navy), far #000D1A
Earth (C): inner #8B7355 (ochre), outer #2D4A1E (forest), far #0A0F00
Air   (G): inner #C0C8D8 (silver-blue), outer #1A1A3E (deep indigo), far #05050F
```

---

### Layer 4 — Body Silhouette (SVG)

**Technology:** Static SVG paths (authored once, never changes)
**Style:** Alchemical woodcut aesthetic — stylized human figure, no photorealism
- Outline only, no fill (transparent interior so lower layers show through)
- Stroke: `var(--citta-silhouette)` — defaults to rgba(255,255,255,0.15) on dark theme
- Central spinal axis explicitly drawn (vertical line from crown to root) — chakra nodes
  attach to this axis
- Figure is front-facing, slightly abstract (Byzantine-icon proportion rather than natural)
- Arms at sides or subtly raised — gesture of openness, not action
- No facial features (this is not a person, it is a map)

**SVG named regions (body zones, for Layer 2 overlay):**

```
#zone-crown         crown region (top of head)
#zone-head          head/face
#zone-throat        throat/neck
#zone-chest         heart/chest
#zone-solar         solar plexus / upper abdomen
#zone-sacral        lower abdomen / sacral
#zone-root          perineum / root / legs

#zone-left-arm      left arm
#zone-right-arm     right arm
#zone-left-hand     left hand
#zone-right-hand    right hand

#organ-heart        heart organ region
#organ-lungs        lung regions (bilateral)
#organ-liver        liver region (right side)
#organ-kidneys      kidney regions (bilateral, posterior)
#organ-stomach      stomach region
#organ-intestines   lower abdominal region
```

These zone IDs map to the canonical body zone LUT from `#4.2-0`:

```typescript
const BODY_ZONE_SVG_MAP: Record<number, string> = {
  0: '#zone-crown',
  1: '#zone-head',
  2: '#zone-throat',
  3: '#zone-chest',
  4: '#zone-solar',
  5: '#zone-sacral',
  6: '#zone-root',
  7: '#zone-left-arm',
  8: '#zone-right-arm',
  // ... full LUT to be populated from #4.2-0 canonical tag definitions
}
```

---

### Layer 3 — Chakra Column (SVG)

**Technology:** SVG `<circle>` elements, CSS `@keyframes` animation
**Input:** `chakras[]` from `nara.medicine.balance`, planetary Cousto frequencies
**Renders:**

Seven chakra nodes on the spinal axis. Each is:

```
<circle cx="50%" cy={CHAKRA_Y[n]} r={baseR + activation * 0.06} />
```

| # | Name | SVG y% | Colour | Ruling Planet | Cousto Hz | Breath Period |
|---|------|--------|--------|--------------|-----------|--------------|
| 0 | Root | 82% | #CC0000 (deep red) | Saturn | 147.85 Hz | ~3.5s |
| 1 | Sacral | 72% | #FF6600 (orange) | Jupiter | 183.58 Hz | ~2.8s |
| 2 | Solar | 60% | #FFD700 (gold) | Mars | 144.72 Hz | ~3.6s |
| 3 | Heart | 48% | #00CC44 (emerald) | Sun | 126.22 Hz | ~4.1s |
| 4 | Throat | 37% | #0088CC (sapphire) | Venus | 221.23 Hz | ~2.3s |
| 5 | Third Eye | 27% | #4400CC (indigo) | Mercury | 141.27 Hz | ~3.7s |
| 6 | Crown | 8%  | #CC00FF (violet) | Moon | 210.42 Hz | ~2.4s | ← floats ABOVE head oval |

**Breath period computation (octave transposition to visible range):**

```typescript
function coustToBreathMs(hz: number): number {
  let period = 1000 / hz
  // Octave-transpose up until period is 2–8 seconds (human breath range)
  while (period < 2000) period *= 2
  return Math.round(period)
}
```

The raw Hz frequencies are musical/audio. By doubling the period (octave up) until we reach
2–8 seconds, we transpose these cosmic rhythms into the visible breath range while preserving
their ratios. Saturn (slowest, densest) breathes slowest. Moon (fastest) breathes quickest.

**CSS animation per chakra:**

```css
@keyframes chakra-breathe {
  0%, 100% { opacity: 0.6; r: var(--chakra-base-r); filter: blur(0px); }
  50%       { opacity: 1.0; r: calc(var(--chakra-base-r) + var(--chakra-act-delta));
               filter: blur(1px) brightness(1.4); }
}

.chakra-node {
  animation: chakra-breathe var(--chakra-period) ease-in-out infinite;
}
```

**`--chakra-base-r`:** 8px (inactive) → 14px (fully active, activation=255)
**`--chakra-act-delta`:** `(activation / 255) * 8px`
**`--chakra-period`:** computed from Cousto transposition above

**Activation from medicine triage:**
Chakra activation levels (`0-255`) come from `nara.medicine.balance`. If medicine data is
absent (clock not wound), all chakras render at 50% activation as a neutral ground state.

**Current planetary hour alignment:**
When the currently active planetary hour (from `nara.kairos.current`) matches a chakra's
ruling planet, that chakra glows at 110% of its computed activation. This is the planetary
hour resonance — visually marked without annotation (felt, not labelled).

---

### Layer 2 — Body Zone + Organ Highlights (SVG)

**Technology:** SVG path `fill-opacity` animated via CSS transitions
**Input:** `nara.oracle.payload` (latest cast canonical tags)
**Renders:**

When an oracle cast occurs, `#4.2-0` emits `{ bodyZones[], organs[] }`. These map to
named SVG paths in the silhouette (Layer 4). On cast:

1. Named zones transition to highlight state over 0.8s (ease-out)
2. Highlight state: fill with zone's elemental colour at 0.4 opacity, add glow stroke
3. Zones hold highlight for `ZONE_DECAY_HALF_LIFE = 4 hours` (decaying continuously)
4. Decay is exponential: `opacity(t) = 0.4 * e^(-t / DECAY_TAU)` where `DECAY_TAU = 4h`
5. Multiple casts stack (additive opacity, capped at 0.7)

**Zone colour = element affiliation of the cast, not the zone's "native" element.**
A Fire oracle lighting the Heart zone shows amber, not green.
The zone IS its natal element; the oracle IS what is visiting.

**If oracle payload is absent (no cast today):** zones render at a very low ambient glow
(0.05 opacity, zone's native elemental colour) — the body has its own baseline tone.

---

### Layer 1 — Planet Ring (SVG)

**Technology:** SVG `<circle>` + `<text>` glyphs on a computed ring path
**Input:** natal `planet_degrees[10]` (identity layer 1) + live `M2PlanetaryState`
**Renders:**

An outer ring surrounding the figure (radius ~90% of panel width). Ten planet glyphs
positioned on the ring according to `degree_anchor` (0-719):

```
degree_anchor 0   = top of ring (12 o'clock = spring equinox)
degree_anchor 180 = bottom (6 o'clock = autumn equinox)
degree_anchor 360-719 = same positions but implicate (inner ring, 75% radius, dimmer)
```

```typescript
function degreeAnchorToXY(anchor: number, ringRadius: number, cx: number, cy: number) {
  const isImplicate = anchor >= 360
  const r = isImplicate ? ringRadius * 0.75 : ringRadius
  const angleDeg = ((anchor % 360) / 360) * 360 - 90  // -90 puts 0 at top
  const angleRad = (angleDeg * Math.PI) / 180
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
    opacity: isImplicate ? 0.4 : 0.85,
    strokeDash: isImplicate ? '4 4' : 'none',
  }
}
```

**Natal vs live positions:**
- Natal (identity layer 1): rendered as filled circles with planet glyphs, stable positions
- Live (kairos current): rendered as open circles orbiting slowly; position updates daily
- When live position crosses natal position: **conjunction marker** — a brief radial flash
  (SVG CSS animation, 2s, fires once)

**Retrograde:** planet glyph rotates 180° (upside down) when `retrograde === true`

**Planet glyphs:**

| Planet | Glyph | Element | Colour |
|--------|-------|---------|--------|
| Sun ☉ | ☉ | Fire | #FFD700 |
| Moon ☽ | ☽ | Water | #C8D8E8 |
| Mercury ☿ | ☿ | Air | #B8C8D8 |
| Venus ♀ | ♀ | Earth | #90C878 |
| Mars ♂ | ♂ | Fire | #FF4444 |
| Jupiter ♃ | ♃ | Fire | #FF9922 |
| Saturn ♄ | ♄ | Earth | #886644 |
| Uranus ⛢ | ⛢ | Air | #88AACC |
| Neptune ♆ | ♆ | Water | #4466AA |
| Pluto ♇ | ♇ | Water | #664488 |

---

## V. Component Specification

### File structure

```
renderer/domains/M4_Nara/components/identity/
  SubtleBodyPanel.tsx          — top-level panel, data assembly, layer toggle state
  SubtleBodyPanel.css          — CSS variables, keyframe animations
  layers/
    QuintessenceGround.tsx     — Layer 7: hash-seeded canvas background
    AtmosphericDepth.tsx       — Layer 6: Three.js torus + planets
    ElementField.tsx           — Layer 5: SVG radial gradient aura
    BodySilhouette.tsx         — Layer 4: static SVG figure paths
    ChakraColumn.tsx           — Layer 3: animated chakra nodes
    BodyZoneOverlay.tsx        — Layer 2: oracle-driven zone highlights
    PlanetRing.tsx             — Layer 1: planet glyphs on outer ring
  LayerToggleBar.tsx           — toggle controls for each layer
  useSubtleBodyData.ts         — data hook: assembles SubtleBodyState from gateway
  subtleBodyTypes.ts           — TypeScript interfaces
  constants/
    bodyZoneSvgMap.ts          — body zone index → SVG element ID
    chakraConfig.ts            — chakra definitions with Cousto Hz + colour
    planetConfig.ts            — planet glyph, element, colour mappings
    elementConfig.ts           — element colour stops (from Elemental Throughline FR 2.4.7)
```

### `SubtleBodyState` interface

```typescript
// subtleBodyTypes.ts

export interface ChakraState {
  id: number                  // 0=Root, 6=Crown
  name: string
  activationLevel: number     // 0-255 from medicine triage
  breathPeriodMs: number      // computed from Cousto Hz
  colour: string
  svgYPercent: number
  isAtPlanetaryHour: boolean  // true when ruling planet is current planetary hour
}

export interface PlanetState {
  id: number                  // 0-9 (Planet_Id order)
  glyph: string
  natalDegreeAnchor: number   // 0-719 from identity layer 1
  liveDegreeAnchor: number    // 0-719 from kairos current
  retrograde: boolean
  keplerianVel: number
  coustFreq: number
  element: 0 | 1 | 2 | 3     // Fire/Water/Earth/Air
  colour: string
}

export interface BodyZoneHighlight {
  zoneId: number
  element: number             // Oracle element that lit this zone
  intensity: number           // 0.0-0.7 (decays over time)
  litAt: number               // Unix ms timestamp
}

export interface SubtleBodyState {
  // Identity (session-stable)
  quintessenceHash: string
  layerPresence: number       // bitmask — determines visual density
  nucleotide: { A: number; T: number; C: number; G: number }
  dominantElement: number

  // Chakras (updated by medicine triage)
  chakras: ChakraState[]

  // Planets (natal stable + live updating)
  planets: PlanetState[]
  currentPlanetaryHour: number  // 0-6 (Saturn=0..Moon=6)

  // Torus (live from SpacetimeDB)
  torusPos: number
  ascending: boolean

  // Oracle highlights (ephemeral, decay over ~4h)
  activeBodyZones: BodyZoneHighlight[]
  activeOrgans: BodyZoneHighlight[]
  oracleElementsSurge: number[]   // Elements from last cast — drives field pulse

  // Data availability
  clockWound: boolean         // false = show reduced state with wind prompt
  medicineAvailable: boolean
  oracleCastToday: boolean
}
```

### `useSubtleBodyData` hook

```typescript
// Assembles SubtleBodyState from multiple gateway calls + SpacetimeDB subscriptions
// Manages decay timers for oracle highlights

export function useSubtleBodyData(): {
  state: SubtleBodyState | null
  loading: boolean
  error: string | null
  refreshMedicine: () => Promise<void>
}

// Data assembly order:
// 1. nara.identity.get → quintessenceHash, nucleotide, planets (natal)
// 2. nara.medicine.balance → chakra activation levels
// 3. nara.kairos.current → live planet positions, current planetary hour
// 4. nara.oracle.payload (latest) → body zones, organs, oracle elements
// 5. SpacetimeDB subscription → M1TorusState, M2PlanetaryState (live updates)
// 6. Decay interval: every 60 seconds, recompute zone intensities from litAt timestamps
```

### `SubtleBodyPanel` component

```typescript
// Props
interface SubtleBodyPanelProps {
  height?: number         // default: fill parent
  compact?: boolean       // true = hide atmospheric layer, reduce planet ring
  showToggleBar?: boolean // default: true
}

// Layer toggle state (persisted to localStorage)
interface LayerVisibility {
  atmosphere: boolean     // Layer 6 — Three.js
  elementField: boolean   // Layer 5
  chakras: boolean        // Layer 3
  bodyZones: boolean      // Layer 2
  planets: boolean        // Layer 1
}
```

### `ChakraColumn` implementation detail

```typescript
// ChakraColumn renders 7 SVG circles with individual CSS animation durations
// The animation-duration comes from Cousto transposition — each chakra breathes differently

const CHAKRA_CONFIG = [
  { id: 0, name: 'Root',      svgY: 82, colour: '#CC0000', coustHz: 147.85, planet: 'Saturn'  },
  { id: 1, name: 'Sacral',    svgY: 72, colour: '#FF6600', coustHz: 183.58, planet: 'Jupiter' },
  { id: 2, name: 'Solar',     svgY: 60, colour: '#FFD700', coustHz: 144.72, planet: 'Mars'    },
  { id: 3, name: 'Heart',     svgY: 48, colour: '#00CC44', coustHz: 126.22, planet: 'Sun'     },
  { id: 4, name: 'Throat',    svgY: 37, colour: '#0088CC', coustHz: 221.23, planet: 'Venus'   },
  { id: 5, name: 'ThirdEye',  svgY: 27, colour: '#4400CC', coustHz: 141.27, planet: 'Mercury' },
  { id: 6, name: 'Crown',     svgY:  8, colour: '#CC00FF', coustHz: 210.42, planet: 'Moon'    },
  // NOTE: Crown sits ABOVE the head oval (y=8% places it outside the figure boundary)
  // This is anatomically correct for Sahasrara — confirmed by visual reference 2026-03-10
]
```

---

## VI. CSS Variable System

```css
/* SubtleBodyPanel.css */

.subtle-body-panel {
  /* Elemental colours (must match Elemental Throughline FR 2.4.7) */
  --elem-fire-inner:   #FF8C00;
  --elem-fire-outer:   #FF4500;
  --elem-fire-far:     #2D0A00;

  --elem-water-inner:  #00CED1;
  --elem-water-outer:  #003366;
  --elem-water-far:    #000D1A;

  --elem-earth-inner:  #8B7355;
  --elem-earth-outer:  #2D4A1E;
  --elem-earth-far:    #0A0F00;

  --elem-air-inner:    #C0C8D8;
  --elem-air-outer:    #1A1A3E;
  --elem-air-far:      #05050F;

  /* Silhouette */
  --citta-silhouette:  rgba(255, 255, 255, 0.12);

  /* Zone highlight (overlaid with oracle element colour) */
  --zone-highlight-transition: fill-opacity 0.8s ease-out;
}

/* Chakra breath animations — one per chakra */
@keyframes chakra-breath-0 { /* Root / Saturn */
  0%, 100% { opacity: 0.55; }
  50% { opacity: 0.95; filter: drop-shadow(0 0 6px #CC0000); }
}
/* ... @keyframes chakra-breath-1 through chakra-breath-6 */

/* Oracle zone pulse (fires once on new cast) */
@keyframes zone-oracle-land {
  0%   { fill-opacity: 0; }
  15%  { fill-opacity: 0.7; }
  100% { fill-opacity: var(--zone-decay-opacity); }
}
```

---

## VII. Unwound State (Clock Not Yet Wound)

When `clockWound === false` (user has not run `epi nara wind`), the map renders a
**ghost state** — all layers visible at reduced opacity with a prompt overlay:

```
[Ghost silhouette, all layers at 20% opacity]

     ◈  Wind the clock to activate your Archetypal-Citta

     Your subtle body map requires natal data to come alive.
     Run `epi nara wind` to orient the clock and populate
     your identity layers.

     [ Wind Clock ]   [ Enter birth data ]
```

The ghost state still renders:
- Layer 7 (hash ground): uses a placeholder hash (`0000000000000000`) → a neutral mandala
- Layer 3 (chakras): all at 50% activation, uniform 3s breath period (no planetary tuning)
- Layer 6 (atmosphere): torus at position 0, no planetary data

---

## VIII. User Stories

### US-SBM-01 — Identity Layer Visualisation
**As a** Nara user with at least one identity layer set,
**I want to** see a subtle body map that reflects my nucleotide/elemental profile,
**so that** I have a visceral, immediate sense of my archetypal-citta without reading a table.

**Acceptance Criteria:**
- AC1: Opening the identity panel renders the SubtleBodyPanel within 1.5s of data load
- AC2: The element field aura reflects the nucleotide weights from identity layer 2 (or layer 1 if 2 absent) — dominant element occupies >40% of the visible gradient area
- AC3: The elemental colour encoding matches the Elemental Throughline table (FR 2.4.7) exactly — Water=teal, Fire=amber, Earth=ochre, Air=silver
- AC4: The quintessence hash produces a unique background geometry pattern per user
- AC5: Two users with different hashes MUST produce visually distinct backgrounds
- AC6: With no identity layers set, the unwound ghost state renders with a "Wind Clock" prompt

---

### US-SBM-02 — Chakra Breathing at Planetary Rates
**As a** Nara user with the clock wound,
**I want** each chakra node to breathe (pulse) at its own rate derived from Cousto planetary frequencies,
**so that** the map feels cosmically alive rather than mechanically uniform.

**Acceptance Criteria:**
- AC1: All 7 chakra nodes have distinct animation-duration values derived from Cousto transposition
- AC2: Saturn (Root) breathes slowest (~3.5s), Moon (Crown) fastest (~2.4s) — ratio preserved
- AC3: No two chakras have the same animation-duration (all 7 Hz values are distinct)
- AC4: Chakra breath period does NOT change between renders unless `nara.kairos.current` is refreshed
- AC5: When the currently active planetary hour matches a chakra's ruling planet, that chakra glows visually brighter — no text annotation required, visual only
- AC6: On mobile/compact view, chakra breathing continues at the correct rates

---

### US-SBM-03 — Oracle Body Zone Illumination
**As a** Nara user who has just cast an oracle reading,
**I want** the relevant body zones and organs to illuminate on the subtle body map,
**so that** I can viscerally locate the oracle's signal in my symbolic body.

**Acceptance Criteria:**
- AC1: Within 2s of a successful oracle cast, the canonical tag payload is fetched from `nara.oracle.payload`
- AC2: Each `bodyZone` in the payload maps to a named SVG region and transitions to highlight state within 0.8s
- AC3: Highlight colour = oracle cast element (from payload `elements[]`), not the zone's native element
- AC4: Highlight intensity starts at 0.4 opacity and decays continuously; after 4 hours it is at ≤0.05
- AC5: Multiple casts accumulate additively (capped at 0.7 total opacity per zone)
- AC6: If no cast has been made today, zones render at ambient glow (0.05 opacity, native elemental colour)
- AC7: Organ highlights follow the same decay mechanics as body zone highlights

---

### US-SBM-04 — Planet Ring (Natal + Live Positions)
**As a** Nara user with astrological layer set (identity layer 1),
**I want** to see my natal planetary positions on a ring around the subtle body, with today's live positions as a second overlay,
**so that** I can feel where the planets are in relation to my natal chart right now.

**Acceptance Criteria:**
- AC1: Natal positions render as filled planet glyphs on the outer ring (radius ~90% of panel)
- AC2: Live positions render as open (unfilled) glyphs on a slightly inner ring (75% radius), animated to slowly drift
- AC3: Implicate positions (degree_anchor 360-719) render on the inner ring with dashed orbital trace
- AC4: Retrograde planets render their glyph rotated 180° (inverted)
- AC5: When a live planet crosses its natal position (within ±2° tolerance), a conjunction flash animation fires once
- AC6: Planet glyphs are touch/click targets: tapping a planet opens a tooltip showing planet name, degree, Cousto frequency, and element
- AC7: With identity layer 1 absent, planet ring does not render (graceful absence, not error)

---

### US-SBM-05 — Atmospheric Depth Layer (Three.js)
**As a** Nara user,
**I want** a subtle Three.js torus and particle atmosphere behind the body map,
**so that** the M1 torus state (ascending/descending, current tick) is felt as cosmic context, not read as data.

**Acceptance Criteria:**
- AC1: The torus ring renders as a thin luminous ring behind the SVG layers (not occluding them)
- AC2: Torus rotation angle = `(torusPos / 12) * 2π` — updates when M1TorusState changes
- AC3: Ascending state → warm amber glow; descending state → cool slate glow
- AC4: Background particle drift speed correlates with `fire_level` from medicine triage
- AC5: Atmospheric layer can be toggled off via LayerToggleBar without affecting other layers
- AC6: On machines without WebGL support, atmospheric layer gracefully degrades to a static CSS gradient; all other layers remain functional

---

### US-SBM-06 — Layer Toggle Bar
**As a** Nara user,
**I want** to be able to show/hide individual visual layers of the body map,
**so that** I can focus on what is relevant (e.g. just the chakras, or just the planets) without visual noise.

**Acceptance Criteria:**
- AC1: LayerToggleBar renders below or beside the panel with one toggle per layer (5 toggleable layers: Atmosphere, Element Field, Chakras, Body Zones, Planets)
- AC2: Layer visibility state persists to localStorage keyed to user session
- AC3: Toggling a layer off removes it from render with a 0.3s fade; toggling on fades it in
- AC4: All layers default to ON on first render
- AC5: Layer toggle controls are accessible (keyboard navigable, labelled)

---

### US-SBM-07 — Compact Mode
**As a** Nara user viewing the identity panel in the right sidebar (narrow context),
**I want** the subtle body map to adapt to a compact vertical format without losing meaning,
**so that** the map remains informative in a constrained layout.

**Acceptance Criteria:**
- AC1: Compact mode (triggered by `compact={true}` prop or container width < 280px) hides the atmospheric layer
- AC2: Planet ring renders at 85% radius in compact mode (closer to figure)
- AC3: Chakra nodes remain fully animated in compact mode (no simplification)
- AC4: Element field gradients remain visible in compact mode at reduced radius
- AC5: LayerToggleBar collapses to an icon-only row in compact mode

---

### US-SBM-08 — Unwound State UX
**As a** Nara user who has not yet wound the clock,
**I want** to see a clear but inviting prompt to initialise my identity data when I view the body map,
**so that** the empty state motivates rather than confuses.

**Acceptance Criteria:**
- AC1: Ghost state renders all layers at 20% opacity with a centred prompt overlay
- AC2: Prompt text: "Wind the clock to activate your Archetypal-Citta"
- AC3: Two CTA buttons: "Wind Clock" (triggers `epi nara wind` via gateway) and "Enter birth data" (opens identity setup panel)
- AC4: "Wind Clock" button is disabled and shows spinner while wind sequence is running
- AC5: On successful wind completion, ghost state transitions to full map with a 1.5s reveal animation (layers fade in sequentially, bottom to top)

---

### US-SBM-09 — Elemental Throughline Enforcement
**As a** developer implementing or modifying any visual encoding in the subtle body map,
**I need** all elemental colour assignments to be sourced from a single constants file that matches FR 2.4.7,
**so that** the M2/M3/M4 elemental throughline is visually consistent and cannot drift.

**Acceptance Criteria:**
- AC1: A single `constants/elementConfig.ts` file defines all elemental colours (inner, outer, far stops)
- AC2: All SVG gradients, chakra colours, planet colours, and zone highlight colours import from this file — never hard-coded locally
- AC3: A test (`elementConfig.test.ts`) asserts that the element-to-nucleotide mapping matches the table in FR 2.4.7 (Water=A, Fire=T, Earth=C, Air=G)
- AC4: Any PR that modifies `elementConfig.ts` requires explicit sign-off noting FR 2.4.7 compliance

---

### US-SBM-10 — Accessibility
**As a** Nara user who uses assistive technology or prefers reduced motion,
**I want** the subtle body map to degrade gracefully for my accessibility needs,
**so that** the panel is usable regardless of motion sensitivity or visual impairment.

**Acceptance Criteria:**
- AC1: `prefers-reduced-motion` media query halts all CSS animations (chakra breathing, oracle pulse, layer fade-ins) — body zones remain visible as static fills
- AC2: All SVG elements with semantic meaning (chakra nodes, planet glyphs, body zones) have `aria-label` attributes
- AC3: The panel has an accessible text alternative: a screen-reader-only `<table>` summarising chakra activation levels, dominant element, and active body zones
- AC4: Planet tooltips are keyboard accessible (focus triggers tooltip display)
- AC5: Layer toggle controls meet WCAG 2.1 AA contrast standards

---

## IX. Gateway Data Contract (for frontend)

The `useSubtleBodyData` hook assembles state from these gateway calls in order:

```typescript
// Call sequence (parallel where possible):
const [identity, medicine, kairos, oraclePayload] = await Promise.allSettled([
  gateway.call('nara.identity.get'),         // identity layers, hash, nucleotide
  gateway.call('nara.medicine.balance'),     // chakra activation
  gateway.call('nara.kairos.current'),       // live planets, planetary hour
  gateway.call('nara.oracle.payload'),       // latest cast payload (may 404 if no cast today)
])

// SpacetimeDB (live subscription, parallel with above):
const stdb = useSpacetimeSubscription(['M1TorusState', 'M2PlanetaryState'])
```

**Failure handling:**
- `nara.medicine.balance` failure → chakras render at 50% neutral activation, no error shown
- `nara.kairos.current` failure → planets render at natal positions only (no live drift)
- `nara.oracle.payload` 404 → no zone highlights (ambient glow only)
- SpacetimeDB disconnected → atmosphere frozen at last known position

---

## X. Implementation Phases (Nara Runtime Plan Alignment)

This spec extends the Nara Runtime Plan phases:

| Phase | This Spec Work | Plan Phase |
|-------|----------------|-----------|
| A | `subtleBodyTypes.ts`, `constants/`, data hook skeleton | Phase 6 (identity panel) |
| B | `BodySilhouette.tsx` — SVG figure authoring (design milestone) | Phase 6 |
| C | `ChakraColumn.tsx` — animated chakras with Cousto periods | Phase 6 |
| D | `ElementField.tsx` — nucleotide-driven radial gradients | Phase 6 |
| E | `PlanetRing.tsx` — natal positions from identity layer 1 | Phase 6 |
| F | `BodyZoneOverlay.tsx` — oracle payload highlights + decay | Phase 7 (WebMCP) |
| G | `AtmosphericDepth.tsx` — Three.js torus + particles | Phase 8 |
| H | `QuintessenceGround.tsx` — hash-seeded canvas geometry | Phase 8 |
| I | Live positions (kairos daily refresh + planet drift animation) | Phase 8 |
| J | Compact mode, LayerToggleBar, accessibility pass | Phase 12 |

**Phase A–E are the minimum viable Archetypal-Citta** — static natal map with live chakra
breathing. Phases F–J add the full temporal-oracle-atmospheric dimension.

---

## XI. Open Questions

1. **SVG body figure authoring — RESOLVED (2026-03-10)**

   **Direction confirmed via generative image exploration.**
   Reference image: `Idea/Pratibimba/System/Present/2026-03-10/215751-full-body-alchemical-symbolic-diagram-showing-comp.png`

   **Confirmed design decisions:**
   - Style: figurative organic silhouette (NOT geometric/mechanical) — woodcut aesthetic
   - Head: completely featureless blank oval, no face
   - Interior: hollow/black — all layers behind show through
   - Spine: dashed vertical axis from crown to between feet (root grounding path continues below figure)
   - Sacred geometry behind: Metatron's Cube / octahedron at ~12% opacity (preferred over pure Merkaba)
   - Proportions: androgynous, slightly elongated (Byzantine-icon ratio)
   - Chakra nodes: carry internal lotus/yantra symbol geometry — NOT plain circles
     Each node is an SVG `<symbol>` with the chakra's traditional geometric form nested inside
     (6-petal lotus for lower chakras, more complex yantra for upper)
   - Crown chakra position: ABOVE the head oval (anatomically correct for Sahasrara)
     → Update `CHAKRA_CONFIG[6].svgY` from `16%` to `8%`

   **SVG authoring path:**
   Use the reference image as a trace source in Inkscape or Figma. Key paths to define:
   - Outer silhouette path (single continuous stroke, `stroke-width: 2px`)
   - Head oval (separate element for zone targeting)
   - 13 named body zone regions (see Layer 4 in Section V)
   - 7 chakra `<symbol>` elements with yantra geometry
   - Spinal axis `<line>` (dashed, `stroke-dasharray: 4 6`)
   - Metatron's Cube `<g>` background (opacity: 0.12)

   **Why figurative beats geometric:** Geometric mannequin variant tested and rejected —
   loses somatic quality, body zones become unlocatable, reads as CAD model not subtle body.

2. **Body zone LUT completeness** — the `#4.2-0` canonical tag body zone indices need a
   full reference table (zone 0-N → anatomical name → SVG path ID). Currently the dataset
   gives `bodyZones: []` as output contract but the index mapping is not yet documented.
   Needs cross-referencing with #4.1 (medicine system) which uses the same zones.

3. **Quintessence ground geometry** — which of the 4 sacred geometry families maps to which
   hash bucket? This is currently `hash % 4` but the actual family assignment (Flower of
   Life, Metatron, Sri Yantra, Fibonacci) should be a considered decision, not arbitrary.

4. **Kairos refresh frequency** — `nara.kairos.current` is described as "daily" but planetary
   positions drift slowly (Sun ~1° per day). For the planet ring, should live positions update
   in real-time (WebSocket), hourly, or daily? The difference matters for the live drift
   animation smoothness.

5. **QL-Quaternary deck glyphs** — when the QL-Quaternary Tarot grammar is implemented
   (#4.2-1 bespoke deck), oracle body zone payload will carry different canonical tags than
   RWS/Thoth. The zone map should be agnostic to Tarot tradition — confirmed by #4.2-0
   Common Substrate, but needs verification in implementation.

---

*Spec version: 1.0 — 2026-03-10*
*Authors: Architect (onto-code) + Claude (specification)*
*Next: SVG figure design decision (Open Question 1) before Phase B implementation*
