# Implementation Prompt — Archetypal-Citta: Subtle Body Map Frontend

**Target:** React/SVG/Three.js SubtleBodyPanel — full implementation, all layers
**Spec:** `docs/specs/M/M4-nara-subtle-body-map.md` (v1.0)
**Working directory:** `Idea/Pratibimba/System/epi-app/`
**Scope:** ALL phases A–J. Complete implementation. No stubs.

---

## INVOCATION

```
Implement the SubtleBodyPanel React component — the Archetypal-Citta subtle body
map — for the M4 Nara identity panel in the Epi-Logos Electron app at
Idea/Pratibimba/System/epi-app/ following the full spec.
```

---

## CONTEXT TO LOAD FIRST

Read every one of these before writing code:

```
1. docs/specs/M/M4-nara-subtle-body-map.md               — canonical spec, all sections
2. docs/specs/M/M4-nara-personal-interface.md             — FR 2.4.7 Elemental Throughline
3. renderer/domains/M4_Nara/ui/NaraDashboard.tsx          — where panel slots in
4. renderer/domains/M4_Nara/ui/NaraTracePanel.tsx         — what is being replaced
5. renderer/domains/M4_Nara/core/useNara.ts               — existing hook pattern
6. renderer/domains/M4_Nara/core/naraService.ts           — existing service pattern
7. renderer/App.tsx                                        — gateway hook pattern
8. renderer/domains/M2_Parashakti/ui/CollabWorkspace.tsx  — peer layout pattern
```

---

## VISUAL REFERENCE IMAGES

Design direction confirmed through generative exploration. Use these as QA targets:

```
PRIMARY SILHOUETTE REFERENCE (the SVG figure to build):
  Idea/Pratibimba/System/Present/2026-03-10/215751-full-body-alchemical-symbolic-diagram-showing-comp.png

ELEMENT FIELD REFERENCE (aura corona quality target):
  Idea/Pratibimba/System/Present/2026-03-10/215510-four-elemental-aura-corona-around-a-barely-visible.png

GROUND PATTERN REFERENCE (Layer 7 — quintessence canvas):
  Idea/Pratibimba/System/Present/2026-03-10/215517-sacred-geometry-generative-background-pattern-for-.png

FULL COMPOSITION REFERENCE (all layers composited):
  Idea/Pratibimba/System/Present/2026-03-10/215503-subtle-body-archetypal-citta-visualization--dark-d.png
```

**Silhouette decisions locked in:**
- Organic human silhouette — NOT geometric/mechanical
- Featureless blank oval head — no face, no features whatsoever
- Hollow transparent interior — layers behind show through
- Dashed spinal axis crown → between feet
- Metatron's Cube / octahedron behind at ~12% opacity
- Androgynous, slightly elongated proportions
- Crown chakra ABOVE the head oval (`svgYPct: 8`)
- Chakra nodes carry internal yantra geometry as SVG `<symbol>`

---

## ARCHITECTURAL INVARIANTS

### 1. Elemental Throughline is LAW (FR 2.4.7)

Single source of truth: `constants/elementConfig.ts`. Never hard-code elemental colours
anywhere else. The mapping:

```typescript
export const ELEMENT_CONFIG = {
  Water: { inner: '#00CED1', outer: '#003366', far: '#000D1A', nucleotide: 'A' },
  Fire:  { inner: '#FF8C00', outer: '#FF4500', far: '#2D0A00', nucleotide: 'T' },
  Earth: { inner: '#8B7355', outer: '#2D4A1E', far: '#0A0F00', nucleotide: 'C' },
  Air:   { inner: '#C0C8D8', outer: '#1A1A3E', far: '#05050F', nucleotide: 'G' },
} as const
```

Any file importing elemental colours that is NOT importing from this file is a bug.

### 2. Seven layers are ALL real — build all of them

Layer 7: Canvas 2D (quintessence ground)
Layer 6: Three.js WebGL (torus + planetary atmosphere)
Layer 5: SVG radial gradients (element field)
Layer 4: SVG paths (body silhouette + named zones)
Layer 3: SVG circles/symbols (chakra column)
Layer 2: SVG path fill-opacity (oracle body zone highlights)
Layer 1: SVG circles + text (planet ring)

All seven layers stack via CSS `position: absolute; inset: 0` inside a `position: relative`
container. The SVG layers share one `<svg>` element (one DOM tree, multiple `<g>` groups
in z-order). The canvas layers (L7) and WebGL layer (L6) are separate `<canvas>` elements
behind the SVG.

### 3. Chakra breathing is CSS-only — no JS animation

Cousto transposition computed once at module load in `chakraConfig.ts`, applied as
`animation-duration` via CSS custom property. No `requestAnimationFrame`, no
`setInterval`, no framer-motion for this.

### 4. Oracle highlights decay in real time via a single interval

One `setInterval` at 60s updates all `BodyZoneHighlight.intensity` values using
exponential decay: `intensity = 0.4 * Math.exp(-elapsed_ms / DECAY_TAU)` where
`DECAY_TAU = 4 * 3600 * 1000`. The interval lives in `useSubtleBodyData` and is
cleared on unmount.

### 5. Three.js renders to a canvas BEHIND the SVG

The Three.js canvas has `position: absolute; z-index: 0`. The SVG has `z-index: 1`.
The Three.js scene uses an orthographic camera (no perspective distortion) with the
torus rendered as a thin luminous ring. No 3D scene complexity — just the ring + particles.

### 6. `prefers-reduced-motion` halts ALL animation

One media query check at the hook level disables: chakra CSS animations, oracle surge
animation, planet drift animation, and particle drift in Three.js. Checked via
`window.matchMedia('(prefers-reduced-motion: reduce)')` in `useSubtleBodyData`.

---

## FILE STRUCTURE — COMPLETE

```
renderer/domains/M4_Nara/components/identity/
  SubtleBodyPanel.tsx
  SubtleBodyPanel.css

  layers/
    QuintessenceGround.tsx      ← Layer 7: Canvas 2D hash-seeded geometry
    AtmosphericDepth.tsx        ← Layer 6: Three.js torus + planetary particles
    ElementField.tsx            ← Layer 5: SVG radial gradient aura
    BodySilhouette.tsx          ← Layer 4: static SVG figure + named zones
    ChakraColumn.tsx            ← Layer 3: animated chakra nodes with yantra symbols
    BodyZoneOverlay.tsx         ← Layer 2: oracle payload highlights with decay
    PlanetRing.tsx              ← Layer 1: natal + live planet glyphs on outer ring

  LayerToggleBar.tsx
  useSubtleBodyData.ts
  subtleBodyTypes.ts

  constants/
    elementConfig.ts
    chakraConfig.ts
    planetConfig.ts
    bodyZoneSvgMap.ts

  __tests__/
    elementConfig.test.ts
    chakraConfig.test.ts
    degreeAnchorToXY.test.ts
    useSubtleBodyData.test.ts
    SubtleBodyPanel.test.tsx
```

---

## IMPLEMENTATION — ALL PHASES

### Phase A — Constants + Types (write first, everything imports from here)

**`subtleBodyTypes.ts`** — full interfaces from spec Section V:
`SubtleBodyState`, `ChakraState`, `PlanetState`, `BodyZoneHighlight`

**`constants/elementConfig.ts`** — ELEMENT_CONFIG as above. Export a helper:
```typescript
export function elementIndex(nucleotide: 'A'|'T'|'C'|'G'): 'Water'|'Fire'|'Earth'|'Air' {
  return { A: 'Water', T: 'Fire', C: 'Earth', G: 'Air' }[nucleotide]
}
```

**`constants/chakraConfig.ts`**:
```typescript
function coustToBreathMs(hz: number): number {
  let p = 1000 / hz
  while (p < 2000) p *= 2
  return Math.round(p)
}

export const CHAKRA_CONFIG = [
  { id: 0, name: 'Root',     svgYPct: 82, hex: '#CC0000', coustHz: 147.85, planet: 'Saturn'  },
  { id: 1, name: 'Sacral',   svgYPct: 72, hex: '#FF6600', coustHz: 183.58, planet: 'Jupiter' },
  { id: 2, name: 'Solar',    svgYPct: 60, hex: '#FFD700', coustHz: 144.72, planet: 'Mars'    },
  { id: 3, name: 'Heart',    svgYPct: 48, hex: '#00CC44', coustHz: 126.22, planet: 'Sun'     },
  { id: 4, name: 'Throat',   svgYPct: 37, hex: '#0088CC', coustHz: 221.23, planet: 'Venus'   },
  { id: 5, name: 'ThirdEye', svgYPct: 27, hex: '#4400CC', coustHz: 141.27, planet: 'Mercury' },
  { id: 6, name: 'Crown',    svgYPct:  8, hex: '#CC00FF', coustHz: 210.42, planet: 'Moon'    },
].map(c => ({ ...c, breathMs: coustToBreathMs(c.coustHz) }))
```

**`constants/planetConfig.ts`** — 10 planets in Planet_Id order (matching m2.h):
```typescript
export const PLANET_CONFIG = [
  { id: 0, name: 'Sun',     glyph: '☉', element: 'Fire',  hex: '#FFD700' },
  { id: 1, name: 'Moon',    glyph: '☽', element: 'Water', hex: '#C8D8E8' },
  { id: 2, name: 'Mercury', glyph: '☿', element: 'Air',   hex: '#B8C8D8' },
  { id: 3, name: 'Venus',   glyph: '♀', element: 'Earth', hex: '#90C878' },
  { id: 4, name: 'Mars',    glyph: '♂', element: 'Fire',  hex: '#FF4444' },
  { id: 5, name: 'Jupiter', glyph: '♃', element: 'Fire',  hex: '#FF9922' },
  { id: 6, name: 'Saturn',  glyph: '♄', element: 'Earth', hex: '#886644' },
  { id: 7, name: 'Uranus',  glyph: '⛢', element: 'Air',   hex: '#88AACC' },
  { id: 8, name: 'Neptune', glyph: '♆', element: 'Water', hex: '#4466AA' },
  { id: 9, name: 'Pluto',   glyph: '♇', element: 'Water', hex: '#664488' },
] as const
```

**`constants/bodyZoneSvgMap.ts`** — canonical zone index → SVG element ID:
```typescript
export const BODY_ZONE_SVG_MAP: Record<number, string> = {
  0: 'zone-crown',    1: 'zone-head',      2: 'zone-throat',
  3: 'zone-chest',    4: 'zone-solar',     5: 'zone-sacral',
  6: 'zone-root',     7: 'zone-left-arm',  8: 'zone-right-arm',
  9: 'zone-left-leg', 10: 'zone-right-leg',
}
export const ORGAN_SVG_MAP: Record<number, string> = {
  0: 'organ-heart', 1: 'organ-lungs', 2: 'organ-liver',
  3: 'organ-kidneys', 4: 'organ-stomach', 5: 'organ-intestines',
}
```

---

### Phase B — BodySilhouette.tsx

The SVG figure. ViewBox `0 0 400 700`. All coordinates below are in SVG user units.

**The figure is built from SVG primitives — it is not traced from an image.**
The reference image shows the quality target. Build a clean simplified version:

```
Head oval:     <ellipse cx="200" cy="80" rx="44" ry="52" />
Neck:          short rect-ish path connecting head to shoulders
Torso:         single <path> — shoulders (wide) tapering to waist, flaring to hips
Left arm:      <path> from left shoulder down to wrist, slightly angled
Right arm:     <path> mirrored
Left leg:      <path> from left hip down to foot (heel + toe bump)
Right leg:     <path> mirrored
```

All paths: `fill="none"` (hollow interior), `stroke="rgba(255,255,255,0.18)"`,
`stroke-width="2"`, `stroke-linejoin="round"`.

**Spinal axis:**
```svg
<line id="spine-axis"
  x1="200" y1="28" x2="200" y2="668"
  stroke="rgba(255,255,255,0.12)"
  stroke-width="1"
  stroke-dasharray="4 6" />
```

**Metatron's Cube background `<g opacity="0.12">`:**
Build from first principles. Seven circles of equal radius R=80, centred at:
- Centre: (200, 350)
- Six around it at 60° intervals, each at distance R from centre:
  (200+80, 350), (200+40, 350-69), (200-40, 350-69), (200-80, 350), (200-40, 350+69), (200+40, 350+69)
Then draw straight lines connecting every circle centre to every other centre
(21 lines total). Add the outer circumscribed hexagon. All in `stroke="rgba(255,255,255,1)"`,
rendered at the `<g opacity="0.12">` level so the group opacity handles the subtlety.

**Named body zone regions** — `<path>` elements inside the silhouette body paths,
with explicit `id` attributes. These are invisible by default (`fill-opacity: 0`),
lit by `BodyZoneOverlay`. Define them as closed paths tracing the approximate
anatomical region within the silhouette:

```svg
<!-- Each zone path sits inside the figure outline -->
<path id="zone-crown"   d="..." fill="white" fill-opacity="0" />
<path id="zone-throat"  d="..." fill="white" fill-opacity="0" />
<path id="zone-chest"   d="..." fill="white" fill-opacity="0" />
<path id="zone-solar"   d="..." fill="white" fill-opacity="0" />
<path id="zone-sacral"  d="..." fill="white" fill-opacity="0" />
<path id="zone-root"    d="..." fill="white" fill-opacity="0" />
<path id="zone-left-arm"  d="..." fill="white" fill-opacity="0" />
<path id="zone-right-arm" d="..." fill="white" fill-opacity="0" />
<path id="zone-left-leg"  d="..." fill="white" fill-opacity="0" />
<path id="zone-right-leg" d="..." fill="white" fill-opacity="0" />
<!-- Organ zones -->
<path id="organ-heart"   d="..." fill="white" fill-opacity="0" />
<path id="organ-lungs"   d="..." fill="white" fill-opacity="0" />
<path id="organ-liver"   d="..." fill="white" fill-opacity="0" />
```

---

### Phase C — ChakraColumn.tsx

**SVG `<defs>` block with 7 `<symbol>` elements** — one yantra per chakra.
ViewBox per symbol: `"-12 -12 24 24"` (centred at origin, 24×24 unit space).

Yantra geometry per chakra (traditional, simplified to SVG primitives):
```
Root      (0): downward-pointing equilateral triangle: points (0,-8), (-7,4), (7,4)
              inside a circle r=10. The downward triangle is Muladhara.
Sacral    (1): 6 radiating line petals at 60° intervals, length 8.
              Traditional Svadisthana has 6 petals.
Solar     (2): upward-pointing triangle (0,8), (-7,-4), (7,-4) inside circle r=10.
              Manipura's fire triangle.
Heart     (3): Star of David — upward triangle + downward triangle overlapping.
              Up: (0,-8), (-7,4), (7,4). Down: (0,8), (-7,-4), (7,-4).
              Inner circle r=3. This is Anahata's hexagram.
Throat    (4): Circle r=8, inside equilateral triangle pointing up (inverted from root).
              Inner circle r=3 at centre. Vishuddha's circle-in-triangle.
Third Eye (5): Two oval "petals" side by side: ellipse cx=-4, rx=4, ry=6 and
              ellipse cx=4, rx=4, ry=6. Representing Ajna's two-petal form.
Crown     (6): A single point (circle r=1.5) at centre. Below it, a ring of 12 tiny
              dots at r=7, evenly spaced. Sahasrara as pure point + circumference
              (abstraction of the thousand petals into the core geometry).
```

Each `<symbol>` uses `fill="none"` and `stroke="currentColor"` at `stroke-width="0.8"`.

**Placement:** For each chakra config entry, render:
```tsx
<g
  className={`chakra-node chakra-node--${chakra.id}`}
  style={{
    '--chakra-period': `${chakra.breathMs}ms`,
    '--chakra-colour': chakra.hex,
    '--chakra-base-r': `${8 + (chakra.activationLevel / 255) * 6}`,
    color: chakra.hex,
  } as React.CSSProperties}
  transform={`translate(200, ${chakra.svgYPct * 7})`}
  // 700px viewBox height × svgYPct/100
  aria-label={`${chakra.name} chakra, activation ${chakra.activationLevel}`}
>
  {/* Outer glow circle */}
  <circle r="var(--chakra-base-r)" fill="none" stroke="currentColor" strokeOpacity="0.5" />
  {/* Inner yantra symbol */}
  <use href={`#chakra-symbol-${chakra.id}`}
       opacity={0.3 + (chakra.activationLevel / 255) * 0.7} />
</g>
```

**Planetary hour resonance:** When `chakra.isAtPlanetaryHour === true`, add class
`chakra-node--planetary-hour` which sets `opacity floor` to 0.75 via CSS:
```css
.chakra-node--planetary-hour { --chakra-opacity-floor: 0.75; }
@keyframes chakra-breathe {
  0%, 100% { opacity: var(--chakra-opacity-floor, 0.55); }
  50% { opacity: 1.0; filter: drop-shadow(0 0 8px var(--chakra-colour)); }
}
```

---

### Phase D — ElementField.tsx

Four `<radialGradient>` elements in `<defs>`, all centred at (200, 350).
Each gradient has three colour stops from ELEMENT_CONFIG.

Gradient radius per element is nucleotide-weight-driven:
```typescript
const BASE_R = 160  // SVG units

const gradientRadii = {
  Water: BASE_R * (nucleotide.A / 255) * 1.2,
  Fire:  BASE_R * (nucleotide.T / 255) * 1.0,
  Earth: BASE_R * (nucleotide.C / 255) * 0.9,
  Air:   BASE_R * (nucleotide.G / 255) * 0.8,
}
```

Render as four `<ellipse>` elements (not rect), each filled with its gradient,
`mixBlendMode="screen"` on the SVG group containing them. Group opacity: 0.7.

```svg
<g style="mix-blend-mode: screen" opacity="0.7">
  <ellipse cx="200" cy="350" rx={gradientRadii.Water} ry={gradientRadii.Water * 1.1}
           fill="url(#grad-water)" />
  <!-- Fire, Earth, Air similarly -->
</g>
```

**Oracle surge:** When `oracleElementsSurge` has entries, the matching element ellipses
get class `elem-surge` which triggers `@keyframes oracle-elem-surge`:
```css
@keyframes oracle-elem-surge {
  0%   { opacity: 0; }
  10%  { opacity: 0.95; }
  100% { opacity: var(--elem-base-opacity); }
}
.elem-surge { animation: oracle-elem-surge 30s ease-out forwards; }
```
The animation fires once on mount via a key change (use `surgeKey` state derived from
`oracleElementsSurge` contents — change the key to remount and re-trigger).

---

### Phase E — PlanetRing.tsx

**`degreeAnchorToXY` utility** (pure function, tested):
```typescript
export function degreeAnchorToXY(
  anchor: number,
  outerR: number,
  cx: number, cy: number
): { x: number; y: number; opacity: number; strokeDash: string } {
  const isImplicate = anchor >= 360
  const r = isImplicate ? outerR * 0.75 : outerR
  const angleDeg = ((anchor % 360) / 360) * 360 - 90  // 0 = top
  const angleRad = (angleDeg * Math.PI) / 180
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
    opacity: isImplicate ? 0.4 : 0.85,
    strokeDash: isImplicate ? '4 4' : 'none',
  }
}
```

**Outer ring guide circle** (faint, for reference):
```svg
<circle cx="200" cy="350" r="185" fill="none"
        stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
```

**Per planet:** Render natal position as filled, live position as open (unfilled):
```tsx
{PLANET_CONFIG.map(planet => {
  const natal = degreeAnchorToXY(planet.natalDegreeAnchor, 185, 200, 350)
  const live  = degreeAnchorToXY(planet.liveDegreeAnchor,  185, 200, 350)
  return (
    <g key={planet.id} className="planet-group">
      {/* Natal — filled, stable */}
      <circle cx={natal.x} cy={natal.y} r="5"
              fill={planet.hex} opacity={natal.opacity} />
      <text x={natal.x} y={natal.y - 8} textAnchor="middle"
            fontSize="10" fill={planet.hex} opacity={natal.opacity}
            className={planet.retrograde ? 'planet-retrograde' : ''}>
        {planet.glyph}
        <title>{planet.name} — {planet.natalDegreeAnchor}° natal · {planet.coustFreq}Hz</title>
      </text>

      {/* Live — open circle, drifts daily */}
      <circle cx={live.x} cy={live.y} r="4"
              fill="none" stroke={planet.hex}
              strokeDasharray={live.strokeDash}
              opacity={live.opacity * 0.7} />
    </g>
  )
})}
```

**Retrograde glyph rotation:**
```css
.planet-retrograde {
  transform-origin: center;
  transform: rotate(180deg);
}
```

**Conjunction flash:** detect when `Math.abs(natal.anchor - live.anchor) % 360 < 2`.
When true, add class `planet-conjunction` which fires a one-shot radial flash:
```css
@keyframes conjunction-flash {
  0%   { opacity: 0; }
  20%  { opacity: 0.9; r: 12px; }
  100% { opacity: 0; r: 20px; }
}
.planet-conjunction::after {
  animation: conjunction-flash 2s ease-out forwards;
}
```

---

### Phase F — BodyZoneOverlay.tsx

Reads `activeBodyZones` and `activeOrgans` from `SubtleBodyState`.
For each active highlight, finds the SVG element by ID and sets its `fill-opacity`:

```typescript
// Run in useEffect when activeBodyZones changes
activeBodyZones.forEach(({ zoneId, intensity, element }) => {
  const svgId = BODY_ZONE_SVG_MAP[zoneId]
  const el = svgRef.current?.getElementById(svgId)
  if (!el) return
  const elemConfig = ELEMENT_CONFIG[ELEMENTS[element]]
  el.setAttribute('fill', elemConfig.inner)
  el.setAttribute('fill-opacity', String(intensity))
})
```

The `svgRef` is passed down from `BodySilhouette` as a forwarded ref to the parent `<svg>`.
`BodyZoneOverlay` does not render its own SVG — it manipulates the shared SVG DOM.

The decay computation lives in `useSubtleBodyData` (60s interval):
```typescript
const DECAY_TAU = 4 * 3600 * 1000  // 4 hours in ms

function decayIntensity(litAt: number): number {
  const elapsed = Date.now() - litAt
  return 0.4 * Math.exp(-elapsed / DECAY_TAU)
}
```

Zones with `decayIntensity < 0.02` are removed from `activeBodyZones` entirely.

---

### Phase G — AtmosphericDepth.tsx (Three.js)

**Dependencies:** `three`, `@react-three/fiber`, `@react-three/drei`
Add to `package.json` if not present.

The Three.js canvas renders to a `<canvas>` positioned absolutely behind the SVG.
Use `@react-three/fiber`'s `<Canvas>` with:
- `orthographic` camera (no perspective distortion — flat 2D feel)
- `gl={{ alpha: true }}` (transparent background — shows quintessence ground through it)
- `style={{ position: 'absolute', inset: 0, zIndex: 0 }}`

**Scene contents:**

1. **Torus ring** — `<TorusGeometry args={[1.2, 0.04, 16, 100]}` (thin luminous ring).
   Position: centred in scene. Rotation on Y axis = `(torusPos / 12) * Math.PI * 2`.
   Material: `<meshBasicMaterial color={ascending ? '#FFB347' : '#6B8CAE'} transparent opacity={0.35} />`
   Animate rotation with `useFrame`: `mesh.rotation.y += 0.0001` (imperceptible drift).

2. **Particle field** — 200 particles as `<Points>`:
   ```typescript
   const positions = useMemo(() => {
     const arr = new Float32Array(200 * 3)
     for (let i = 0; i < 200; i++) {
       arr[i*3]   = (Math.random() - 0.5) * 4
       arr[i*3+1] = (Math.random() - 0.5) * 7
       arr[i*3+2] = (Math.random() - 0.5) * 0.5
     }
     return arr
   }, [])
   ```
   Drift speed `useFrame`: `points.position.y += fireLevel / 255 * 0.0003`.
   Wrap: when particle y > 3.5, reset to -3.5 (continuous upward drift for high Fire).
   Colour: dominant element from ELEMENT_CONFIG inner colour.

3. **Planetary aura arcs** — 10 partial `<Line>` arcs (one per planet), each covering
   ~60° of arc at the planet's current `liveDegreeAnchor` position.
   Colour = planet element colour. Opacity ∝ `keplerianVel / maxKeplerianVel`.
   These are very subtle — more suggested than shown.

**`prefers-reduced-motion`:** If `reducedMotion === true`, render only the static torus
ring with no animation at all. No particles. No arc drift.

---

### Phase H — QuintessenceGround.tsx (Canvas 2D)

A `<canvas>` element at `z-index: -1`, absolute positioned, drawn once per session.
No Three.js — plain Canvas 2D API.

The hash seed is derived from `quintessenceHash`:
```typescript
// Extract 4 seed values from the 16-hex-char hash
const h = quintessenceHash  // e.g. "8a3f2c1d5e7b9a2f"
const seed1 = parseInt(h.slice(0, 4), 16)   // geometry family
const seed2 = parseInt(h.slice(4, 8), 16)   // hue rotation
const seed3 = parseInt(h.slice(8, 12), 16)  // scale factor
const seed4 = parseInt(h.slice(12, 16), 16) // rotation offset

const geometryFamily = seed1 % 4
// 0 = Flower of Life (circle-based)
// 1 = Sri Yantra (triangle-based)
// 2 = Metatron's Cube (hexagon-based)
// 3 = Fibonacci spiral (rotational)

const hueRotation = (seed2 / 65535) * 360   // 0-360 hue shift on base blue-silver
const scale = 0.8 + (seed3 / 65535) * 0.4   // 0.8-1.2 pattern scale
const rotation = (seed4 / 65535) * Math.PI  // 0-π rotation offset
```

**Drawing each family:**

`Flower of Life (0):`
Draw the seed of life first (7 circles: 1 centre + 6 at 60° at radius R).
Then extend to full Flower of Life by adding the next ring (12 more circles).
Canvas: stroke only, `globalAlpha = 0.08`, line width 0.5px, hue-rotated blue-silver.

`Sri Yantra (1):`
Nine interlocking triangles arranged in a specific pattern (4 upward, 5 downward).
Simplify: draw 5 nested triangles alternating up/down, centred, scaled.
`globalAlpha = 0.08`.

`Metatron's Cube (2):`
Same 7-circle base as Flower of Life but connect ALL circle centre pairs with straight lines
(21 lines). Add the star polygon connecting every-other intersection.
`globalAlpha = 0.08`.

`Fibonacci Spiral (3):`
Draw the Fibonacci rectangle sequence (1,1,2,3,5,8,13,21...) as nested rectangles,
then draw the quarter-circle arcs. Centre on canvas. `globalAlpha = 0.08`.

All patterns: `strokeStyle = hsl(${210 + hueRotation * 0.1}, 30%, 60%)` (cool silver-blue
with subtle hash-derived hue shift — perceptible only on careful inspection).

Draw to offscreen canvas once, copy to visible canvas. Never redraws unless hash changes.

---

### Phase I — Live Kairos Integration (planet drift + daily refresh)

The planet ring already has natal positions (session-stable). Live positions come from
`nara.kairos.current` which refreshes daily (or on explicit `nara.kairos.sync`).

Implement a daily refresh in `useSubtleBodyData`:
```typescript
// Check if kairos/current.json is from today; if not, trigger a background sync
const kairosAge = Date.now() - kairosUpdatedAt
if (kairosAge > 20 * 3600 * 1000) {  // older than 20 hours
  gateway.call('nara.kairos.sync').then(refreshState)
}
```

**Planet drift animation** — live positions update once per day (not continuously).
The transition from old → new live position is animated via CSS transition on the SVG
element transform: `transition: transform 2s ease-in-out`.

**SpacetimeDB live subscription** (`M1TorusState`, `M2PlanetaryState`):
Use the existing gateway WebSocket to subscribe to SpacetimeDB table changes.
When `M1TorusState` changes → update `torusPos` + `ascending` → Three.js torus re-orients.
When `M2PlanetaryState` changes → update `liveDegreeAnchor` per planet → ring updates.

---

### Phase J — Compact Mode + LayerToggleBar + Accessibility

**`LayerToggleBar.tsx`**:
Five toggles (labels: Element Field, Chakras, Body Zones, Planets, Atmosphere).
Persist to `localStorage.setItem('citta.layers', JSON.stringify(vis))`.
```tsx
<button
  role="switch"
  aria-checked={vis.chakras}
  aria-label="Toggle chakra column"
  onClick={() => toggleLayer('chakras')}
  className={`layer-toggle ${vis.chakras ? 'active' : ''}`}
>
  ◎ Chakras
</button>
```
WCAG 2.1 AA: focus ring visible, contrast ratio ≥ 4.5:1 for toggle labels.

**Compact mode** (container width < 280px OR `compact={true}` prop):
```css
.subtle-body-panel--compact .atmospheric-layer { display: none; }
.subtle-body-panel--compact .planet-ring { --ring-r: 157px; }  /* 85% of 185 */
.subtle-body-panel--compact .layer-toggle-bar { /* icon-only, no labels */ }
```
Detect via `ResizeObserver` on the panel container.

**Accessible text alternative** (screen reader only):
```tsx
<table className="sr-only" aria-label="Subtle body state">
  <caption>Archetypal-Citta: current body-mind state</caption>
  <tbody>
    <tr><th>Dominant element</th><td>{dominantElement}</td></tr>
    <tr><th>Chakra activations</th>
      <td>{chakras.map(c => `${c.name}: ${c.activationLevel}`).join(', ')}</td></tr>
    <tr><th>Active body zones</th>
      <td>{activeBodyZones.map(z => BODY_ZONE_SVG_MAP[z.zoneId]).join(', ')}</td></tr>
  </tbody>
</table>
```

**`prefers-reduced-motion` full implementation:**
```typescript
// In useSubtleBodyData
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Pass reducedMotion to AtmosphericDepth (halts useFrame animations)
// Apply CSS class to panel root which disables all @keyframes animations
```
```css
.subtle-body-panel--reduced-motion .chakra-node { animation: none; opacity: 0.7; }
.subtle-body-panel--reduced-motion .elem-surge  { animation: none; }
```

---

### useSubtleBodyData.ts — Full Implementation

```typescript
export function useSubtleBodyData(): {
  state: SubtleBodyState | null
  loading: boolean
  error: string | null
  reducedMotion: boolean
  refreshMedicine: () => Promise<void>
} {
  // 1. Parallel gateway calls on mount
  const [identity, medicine, kairos, oraclePayload] = await Promise.allSettled([
    gateway.call('nara.identity.get'),
    gateway.call('nara.medicine.balance'),
    gateway.call('nara.kairos.current'),
    gateway.call('nara.oracle.payload'),  // may 404 — handled gracefully
  ])

  // 2. SpacetimeDB live subscriptions (M1TorusState, M2PlanetaryState)
  // Use existing gateway WebSocket subscription pattern

  // 3. Kairos age check → background sync if > 20h old
  // 4. Decay interval — 60s, updates zone intensities, removes expired zones
  // 5. prefers-reduced-motion detection
  // 6. Failure handling:
  //    - medicine failure → chakras at 50% neutral (activationLevel: 128)
  //    - kairos failure → planets at natal only, no live positions
  //    - oracle 404 → no zone highlights (ambient glow only in BodyZoneOverlay)
  //    - SpacetimeDB disconnected → atmosphere static at last known position
  //    - Full gateway failure → clockWound: false, render unwound ghost state
}
```

---

### SubtleBodyPanel.tsx — Composition

```tsx
export function SubtleBodyPanel({ compact, showToggleBar = true }: SubtleBodyPanelProps) {
  const { state, loading, reducedMotion } = useSubtleBodyData()
  const [layers, setLayers] = useLayerVisibility()  // from localStorage
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isCompact = useCompactDetector(containerRef, 280) || compact

  if (!state || !state.clockWound) return <UnwoundState onWind={...} />

  return (
    <div
      ref={containerRef}
      className={clsx(
        'subtle-body-panel',
        isCompact && 'subtle-body-panel--compact',
        reducedMotion && 'subtle-body-panel--reduced-motion'
      )}
    >
      {/* Layer 7 — back */}
      <QuintessenceGround hash={state.quintessenceHash} />

      {/* Layer 6 */}
      {layers.atmosphere && (
        <AtmosphericDepth
          torusPos={state.torusPos}
          ascending={state.ascending}
          planets={state.planets}
          fireLevel={state.nucleotide.T}
          reducedMotion={reducedMotion}
        />
      )}

      {/* Layers 1–5 share one SVG */}
      <svg ref={svgRef} viewBox="0 0 400 700" className="citta-svg">
        <defs>
          {/* Gradients for ElementField */}
          {/* Symbols for ChakraColumn */}
        </defs>

        {layers.elementField && <ElementField nucleotide={state.nucleotide} oracleSurge={state.oracleElementsSurge} />}
        <BodySilhouette />
        <BodyZoneOverlay svgRef={svgRef} activeZones={state.activeBodyZones} activeOrgans={state.activeOrgans} />
        {layers.chakras && <ChakraColumn chakras={state.chakras} planetaryHour={state.currentPlanetaryHour} />}
        {layers.planets && <PlanetRing planets={state.planets} />}
      </svg>

      {/* Screen reader table */}
      <AccessibleSummary state={state} />

      {showToggleBar && <LayerToggleBar layers={layers} onChange={setLayers} compact={isCompact} />}
    </div>
  )
}
```

**Replace `NaraTracePanel` with `SubtleBodyPanel`** in `NaraDashboard.tsx`.
The three info blocks (Signature, Kairos, Resonance from runtime plan Section VIII)
go above the SubtleBodyPanel in the right column.

---

### Unwound State Component

```tsx
function UnwoundState({ onWind }: { onWind: () => Promise<void> }) {
  const [winding, setWinding] = useState(false)

  return (
    <div className="subtle-body-panel subtle-body-panel--unwound">
      {/* Ghost layers at 20% opacity */}
      <div style={{ opacity: 0.2, pointerEvents: 'none' }}>
        <QuintessenceGround hash="0000000000000000" />
        <svg viewBox="0 0 400 700" className="citta-svg">
          <BodySilhouette />
          <ChakraColumn chakras={NEUTRAL_CHAKRAS} planetaryHour={-1} />
        </svg>
      </div>

      {/* Prompt overlay */}
      <div className="unwound-prompt">
        <span className="unwound-sigil">◈</span>
        <p>Wind the clock to activate your Archetypal-Citta</p>
        <div className="unwound-actions">
          <button
            onClick={async () => { setWinding(true); await onWind(); setWinding(false) }}
            disabled={winding}
            className="btn-primary"
          >
            {winding ? <Spinner /> : 'Wind Clock'}
          </button>
          <button className="btn-secondary">Enter birth data</button>
        </div>
      </div>
    </div>
  )
}
```

On successful wind, parent component's state refreshes (`useSubtleBodyData` re-fetches)
and the unwound state transitions out via CSS: layers fade in sequentially with
`animation-delay` staggered bottom to top (Layer 3 first, Layer 6 last), 1.5s total.

---

## TESTS

```
__tests__/elementConfig.test.ts
  - Water maps to Adenine (A)
  - Fire maps to Thymine (T)
  - Earth maps to Cytosine (C)
  - Air maps to Guanine (G)
  - All four inner/outer/far colours are valid hex strings

__tests__/chakraConfig.test.ts
  - All 7 breathMs values are distinct
  - All 7 breathMs values are in range 2000-8000ms
  - Crown svgYPct === 8 (above head)
  - Root svgYPct > Crown svgYPct (root is lower on screen)

__tests__/degreeAnchorToXY.test.ts
  - anchor 0   → y < cy (top of ring)
  - anchor 180 → y > cy (bottom of ring)
  - anchor 90  → x > cx (right side)
  - anchor 270 → x < cx (left side)
  - anchor 360 → r === outerR * 0.75 (implicate inner ring)
  - anchor 360 → opacity === 0.4
  - anchor 180 → opacity === 0.85

__tests__/useSubtleBodyData.test.ts
  - gateway failure → returns { clockWound: false }, does not throw
  - medicine failure → chakras all have activationLevel: 128
  - oracle 404 → activeBodyZones is []

__tests__/SubtleBodyPanel.test.tsx
  - renders unwound state when clockWound: false
  - renders all 7 chakra nodes when clockWound: true
  - renders accessible table with chakra data
  - layer toggle hides/shows ChakraColumn
```

---

## PACKAGES TO ADD (if not present)

```json
"three": "^0.162.0",
"@react-three/fiber": "^8.16.0",
"@react-three/drei": "^9.102.0"
```

---

## DO NOT

- Do NOT use `window.sPrime` stub — call the gateway directly
- Do NOT define elemental colours outside `elementConfig.ts`
- Do NOT use framer-motion or JS animation for chakra breathing — CSS only
- Do NOT make the SVG figure anatomically detailed — clean simplified paths only
- Do NOT skip `prefers-reduced-motion` (spec US-SBM-10 AC1, it's an accessibility law)
- Do NOT use perspective camera in Three.js — orthographic only (no 3D depth distortion)

---

*Prompt version: 2.0 — 2026-03-10 (complete, no stubs)*
*Start with Phase A constants. They are the foundation everything compiles against.*
