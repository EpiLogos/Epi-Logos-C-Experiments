---
title: Anuttara UX — Full M0 Branch
subtitle: The Integrated Bimba-Map Engagement System, its Six Data-Layers, and the One-Substrate / Three-Rendering Architecture
status: draft-update
created: 2026-06-02
coordinate: "M0'"
source_context:
  - M0'-SPEC.md
  - M1'-SPEC.md (base physics)
  - M2'-SPEC.md / M3'-SPEC.md (sibling renderings)
  - anuttara-language-map.md (M0 content)
  - graph-schema/src/lib.rs (relation + property registries)
  - m5-prime-epii-on-anuttara-language-development.md
  - 2026-06-02-m-prime-cycle-2-canonical (plans 02, 03, 08)
  - nara-ux-full-m4-branch-update.md / epii-ux-full-m5-branch.md
---

# Anuttara UX — Full M0 Branch

## 0. Purpose of This Document

This document articulates Anuttara as the **integrated bimba-map engagement system** — the M0' surface that holds, renders, and (within the IDE) gives full CRUD access to the entire bimba graph across all its data-integration layers. It is the third pole of the 4/5/0 seam (with [[nara-ux-full-m4-branch-update|Nara]] M4 and [[epii-ux-full-m5-branch|Epii]] M5), and it is the structural ground the recognition surface resolves into.

The corrected view, in one paragraph:

> **M0 (content) is Anuttara's own deep language** — the 109-node unified formal syntax (void-grammar, archetypal number language, the R-virtues, Śiva-Śakti). **M0' (app surface) is the bimba-map-as-held** — and *it* has a sixfold, because the surface that masters the whole graph reads it through six modes, one per subsystem. Within the IDE, M0' is a fully integrated bimba-map engagement system: full CRUD across all layers of data, full access, kept deliberately dynamic and open-ended. What it renders is not a static diagram but a **playable physics** — the graph as the matheme that M1' (Paramaśiva) walks.

This document clarifies six points:

1. **M0 unified, M0' sixfold.** The content-language is prior-to-differentiation; the app-surface that holds the graph has six data-layers. Both are true; they are different sides.
2. **The six M0-X' layers are six modes of holding the one graph**, each a subsystem's native concern (language, QL-structure, relations, community/time, personal, pedagogy).
3. **The graph is playable physics, not a diagram.** M1'/Paramaśiva is the musical-topological engine: the walk *is* the matheme, positions are trig-generators in Cl(4,2), relations are intervals on the K² chromatic-fifths-torus, the tick is the 9/8 epogdoon.
4. **One substrate, three renderings.** The same Neo4j graph + one `MathemeHarmonicProfile` renders as the M0' graph (structural), the M2' solar field (spectral/spatial), and the M3' clock-wheel (temporal/matter).
5. **The solar system is the spatial anchor; everything symbolic is a data-driven overlay.** Stable anchor + bimba-driven dynamic overlays is the governing design principle.
6. **M0' is a CRUD engagement system within the IDE** — full read/write/traverse across all six layers under governance, the dynamic open-ended workbench for the map itself.

---

# 1. Core UX Axiom

> **The bimba map is not a picture of the system — it is the system, made walkable.** Anuttara M0' is the surface where the whole graph can be engaged at every layer: read, traversed, sounded, edited, and grown. It stays dynamic and open-ended because everything symbolic is data on the graph, not hardcode in the renderer.

This is the deepest expression of the general design principle that has been guiding the whole scope: **stable anchor + data-driven dynamic overlays.** The map's geometry is stable; its content is graph-resident and therefore endlessly extensible without redesigning the surface.

---

# 2. M0 (Content) vs M0' (App Surface)

```text
M0   Anuttara's deep language       109-node unified formal syntax
     (CONTENT)                       void-grammar (M0-0), Brimming Void (M0-1),
                                     R-virtues (M0-2), Archetypal Number Language (M0-3),
                                     Holographic Matrix (M0-4), Śiva-Śakti (M0-5)
                                     → held UNIFIED, prior-to-differentiation

M0'  the bimba-map-as-held          the app surface that masters the WHOLE graph
     (APP SURFACE)                   → has a SIXFOLD: six data-layers, one per subsystem-mode
```

M0-4 (the Holographic Matrix) "contains the bases of every other subsystem" — so M0' holding the whole graph through all six subsystem-modes is the app-surface expression of that same holographic containment. The earlier "Anuttara has no internal sixfold" reading was a M/M′ confusion: M0 (language) is unified; M0' (graph-holding app) is sixfold.

---

# 3. The Six M0-X' Data-Layers

Each layer is a different mode of holding/reading the one graph, named by the subsystem whose concern it carries.

| M0-X′ | Subsystem mode | Holds in the graph | Grounded in |
|---|---|---|---|
| **M0-0′** | Anuttara | **Language / syntax** — `c_1_symbol`, `c_1_complete_formulation`, `c_1_form`, asset handles; the OWL deep-syntax (mostly M0–M2 props) | [[anuttara-language-map]] (7 `c_1` props); OWL lifting via M5-2 |
| **M0-1′** | Paramaśiva | **QL-structure** — coordinate organisation, mod6/4/3/2 variants, branch QL-formations; the topological skeleton | structural relations `CONTAINS`, `FAMILY_CONTAINS`, `ANCHORED_TO`; reflected in [[M1'-SPEC]] |
| **M0-2′** | Paraśakti | **Relations** — typed relations + properties *in full* (two families: structural + correspondential) | `graph-schema` + parashakti correspondence-web |
| **M0-3′** | Mahāmāyā | **Community + temporal/episodic** — GDS community clusters (synchronic) and the astrological-time / clock overlay (diachronic, "what's active now") | M3-5 world-clock + Graphiti episodes |
| **M0-4′** | Nara | **Personal Pratibimba** — what the user has touched / been touched by; traversal history, resonances | the `pratibimba` namespace (protected handles) |
| **M0-5′** | Epii | **Pedagogical / cartographic** — traversal depth/breadth, next-explorations, recommendations (map-compass-lens) | M5-5 Atelier + GDS recommendations |

The shape is the matheme's own: **M0-0′ and M0-5′ are the 0/5 frame** (language-ground and pedagogical-synthesis), the inner four are the dynamics. M0' reads the graph as language, as structure, as relation, as time, as personal-touch, as learning-path — depending on which mode the engagement enters through.

## 3.1 The M0-2′ relation layer is two relation-families

"The relations in their types and properties in full" means **both** registries:

- **Structural skeleton** (`graph-schema/src/lib.rs`): `CONTAINS`, `FAMILY_CONTAINS`, `ANCHORED_TO`, `BEDROCK`, `MANIFESTS`, `INVERTS_TO`, `REFLECTS_AS`, `DERIVES_FROM`, `HAS_LENS`, `HAS_KERNEL_RESONANCE` — the system's own ontological wiring.
- **Correspondential web** (parashakti dataset): `Decan-Level Divine Correspondence`, `Spanda Rhythmic Pulsation`, `Quantum Field Operation`, `Modal-Harmonic Resonance`, `Chaldean Decan Rulership`, `Ananda Vortex Spirit Axis`, `Traditional Planetary Rulership`, `Psycho-Ontological Resonance`, `Mono-Poly Expression`, and more.

The second family is "the angels etc." rendered as **edges, not hardcoded tables.** This is precisely what keeps the surface data-driven: divine/decan/planetary correspondences live in the graph, so new symbolic systems become new edges, not new code. (See [[Parashakti]] for the full 72-fold correspondence-tree these edges instantiate.)

---

# 4. The Base Physics: M1' / Paramaśiva as the Musical-Topological Engine

What M0' renders is **playable physics**, because M1' is the engine underneath the graph. This is what makes the map walkable rather than viewable.

- **The walk IS the matheme.** Selecting a coordinate and stepping to its neighbour through an S2 pointer-web relation is the same act as striking a tone: **relation = interval, position = pitch, traversal = phrase.** M0' walking is M1' playing.
- **Positions are trig-generators in Cl(4,2).** Each QL position carries a trigonometric identity: P0 = sin (implicate −1), P1 = tan, P2 = sec, P3 = cot, P4 = csc (explicate +1), P5 = cos (implicate −1). Signature `4(+1) + 2(−1) = +2` = Cl(4,2). **The matheme's positional architecture and its trigonometry are the same structure** — the 4:2 partition *is* the Cl(4,2) signature partition.
- **The topology is K²** — the Klein-double-cover-of-the-chromatic-fifths-torus. Chromatic-longitude (9/8 epogdoon-stacking) × fifths-meridian (3/2 leaps), with bimba↔pratibimba conjugation as the non-orientable identification. The Pythagorean comma (the slack between the two) *is* the aletheic-evolution mechanism — the graph is a spiral, not a closed cycle, which is why it can keep discovering itself.
- **The tick is self-derived.** `(4/3) × (3/2) = 2/1` octave; `(3/2) ÷ (4/3) = 9/8` epogdoon-tick. The matheme derives its own foundational intervals from the dual 4:2 ↔ 3:3 partition. The clock is not imposed; it falls out of the structure.
- **The 84-state landscape** (12 MEF lenses × 7 CF modes) is the shared playing-surface every M' rendering addresses. M0' walks it as graph-traversal; M2' reads it as frequency; M3' classifies it as codon-rotation.

**This is the "QL physics" that gives the solar system its base.** When the solar field (M2') becomes the spatial anchor, its geometry *is* K²; planetary positions and movements are walks on K²; intervals between planets are relation-traversals; and the whole is grounded in Cl(4,2). M1' is the engine of the tick and the walk; M0' is where you engage it as the map.

---

# 5. One Substrate, Three Renderings — The Integrated Bimba Graph View

The spec is explicit ([[M3'-SPEC]] §0/1): Mahāmāyā has two 0-side renderings of the *same* Neo4j substrate — the M3' clock-wheel and the M0' graph view — and **neither may fork the graph.** Generalised across the 1-2-3 cosmic engine, the integrated bimba graph view is **one substrate, three renderings, six data-layers:**

```text
              ONE bimba graph (Neo4j)  +  ONE MathemeHarmonicProfile
                                 │
       ┌──────────────────────────┼──────────────────────────┐
  M0' GRAPH VIEW            M2' SOLAR FIELD             M3' CLOCK-WHEEL
  STRUCTURAL                SPECTRAL / SPATIAL          TEMPORAL / MATTER
  nodes, relations,         planets as anchors,         codon-tarot turning,
  the map (where things     frequency field, angels     the singing clock,
  are and how they link)    & decans as overlays        matter taking form
                                 │
        held through the six M0' data-layers (language → pedagogy)
```

These are not three datasets. They are **three projections of the one graph + profile**, joined by the facts that every node has a coordinate, every coordinate has a 72-cell address, and every 72-cell sounds. The M0' graph is the *map* (structure); the M2' solar field is the *space* (frequency); the M3' clock-wheel is the *clock* (matter-in-time). The six M0' layers are what let you read the same graph as language, structure, relation, time, personal-touch, or learning-path.

The frequency→matter spine runs through all three:

```text
M1 (+1 parent / tick)  →  M2 (72 frequency-bridge)  →  M3 (64 binary-genetic Matter)
   the pulse                 the spectral field           the matter that takes form
                                                          (codon = Cl(4,2) quaternion)
```

The compressor between frequency and matter is the **9:8 epogdoon DET** (`floor(index72 × 8/9) = 64`), operated by **Venus, the beauty-operator.** Frequency becomes form through aesthetic refinement; the cymatic standing-wave is the visible moment of that becoming, and codon-rotations are its perturbations as the clock turns.

---

# 6. The Solar System as Spatial Anchor

The governing UX move: **render M0'/M2'/M3' over a solar-system spatial anchor**, not a grid. This makes the frequency space spatial, gives the Mahāmāyā clock a place to sit, and centres the user.

- **The frequency space becomes spatial.** M2' is the spectral field; the solar system is its natural geometry (= K²). Planets at real Kerykeion positions are the stable referent.
- **The clock sits in the field.** The M3' wheel turns as the planets move; M1's tick drives both. M2 (field) + M3 (clock-in-field) + M1 (tick) = the integrated 1-2-3 cosmic engine, spatially anchored.
- **The user is the central daimon.** `Q_composed` (the personal-quaternion at #4.4.4.4) is rendered as an aura / spirit / daimon over-or-on Earth, **given lens expression at the current tick.** The active lens colours the daimon; the planetary field colours the cosmos; the resonance between them is the recognition surface, made spatial. (This renders only inside the protected Nara register — see §10.)
- **Angels and every symbolic system are dynamic overlays computed from planetary geometry.** The Shem-pair lights up because its decan is active (Kerykeion degree → decan → 2 names); the maqam colours the field because its ruling planet is in the planetary hour; the mantra sounds because its chakra-frequency matches. **Add a new symbolic system later and it is just a new overlay over the same anchor** — the surface never needs redesigning, only new graph data and new edges.

**Image-assets-on-nodes** fit here exactly: nodes carry asset handles (a decan's seal, an angel's sigil, a planet's glyph, a tarot card image), and the overlays *are* those assets placed by data, positioned by the graph rather than by layout code. M0-0' holds the asset-prop alongside symbol/formulation.

---

# 7. M0' as a Full CRUD Engagement System (within the IDE)

Within the M5-3 Theia/Tauri IDE, M0' is not only a viewer — it is the **integrated bimba-map engagement workbench**, with full create/read/update/traverse/delete across every layer, under governance. This is what keeps the system "dynamic and open-ended."

```text
Layer        READ                          WRITE (governed)
M0-0′  Lang  inspect symbol/formulation     author/edit node language; lift to OWL (via M5-2);
                                            attach asset handles
M0-1′  QL    inspect coordinate structure   create/restructure coordinates, branch QL-formations
                                            (load-bearing → user final-validation)
M0-2′  Rel   inspect typed relations        create/retype/annotate edges (structural + correspondential)
M0-3′  Time  inspect community/clock overlay run GDS community detection; bind temporal/astro overlays
M0-4′  Pers  inspect personal traversal      protected; writes only via Nara governance + consent
M0-5′  Pedag inspect traversal analytics     author learning-paths, recommendations, map annotations
```

**Governance is the same construction-discipline that holds Anuttara's language** ([[epii-ux-full-m5-branch]] §11): every write is a deliberate act, never gradient-descended; load-bearing coordinates (R-virtues at M0-2-9, Śiva operators at M0-5, M0-4 holographic-matrix bases) require explicit user final-validation; all writes route through the S2 graph-services layer with provenance; reversibility via deprecation-with-reasons. The engagement system is *open* but never *ungoverned* — it is the place where the map grows by construction.

CRUD does not fork the substrate: M0' edits the canonical Neo4j graph that M2' and M3' also render. Edit a node's correspondence at M0-2', and the M2' solar overlay and M3' wheel re-read it on the next tick. **One substrate; edits propagate to all renderings.**

---

# 8. The Cl(4,2) Thread — Why Personal Resonates with Cosmic

The deepest reason the daimon can be seen resonating against the cosmos is algebraic, not aesthetic. The **same Cl(4,2) Clifford algebra runs at four scales:**

```text
M1  SU(2) ring-quaternion (720° double-cover)        the tick / substrate scale
M3  codon-quaternion (pp,mm,mp,pm = Earth,Fire,       the matter / symbolic scale
    Water,Air) — every codon is an elemental-temperament-quaternion
M4  personal-quaternion at #4.4.4.4                   the personal-identity scale
Kerykeion natal-chart-quaternion (birth data)         the cosmic-timing scale
```

All four live in the same algebra. So the resonance computation between the user's personal field (M4) and the active codon/cosmic field (M3 in the M2 solar space) is **well-posed** — they are the same object evaluated at different scales. *Tat tvam asi* is the algebra recognising itself across scale. This is the thread that binds Anuttara's map to Nara's daimon to Epii's recognition surface.

---

# 9. Open Discovery at Pedagogical Mode (within Nara)

M0' is the map; Epii is the [[epii-ux-full-m5-branch|paidagōgos]] who conducts the learner across it; Nara is where the learner lives. "Open discovery of the systems internally at the pedagogical mode" means: the user traverses this one integrated view, and M5/Epii surfaces whichever M0' layer the question lands on —

```text
"what does this symbol mean?"      → M0-0′ language layer
"how do these connect?"            → M0-2′ relation layer
"why is this active now?"          → M0-3′ clock/astro overlay
"where have I been?"               → M0-4′ personal traversal
"where should I go next?"          → M0-5′ pedagogical / next-explorations
```

The graph teaches itself through whichever layer the inquiry enters. The map-compass-lens (M0-5') is the cartographic instrument: depth/breadth reading of where the learner is, what's unexplored, what path coheres next. This is the M0' contribution to the 4/5/0 recognition loop.

---

# 10. Privacy & Governance

- M0' shows **public canonical** structure, language, and correspondences freely.
- The **M0-4' personal layer** (traversal history, resonances, the daimon render) is **protected-local** — rendered only inside Nara's protected register, never as a public cosmic panel. Epii reaches it only through governed `pratibimba` safe-handles.
- **Writes are governed construction**, not training: load-bearing coordinates require user final-validation; all writes carry provenance through S2; everything is reversible by deprecation.
- **No renderer-local source-of-truth.** M0' edits the canonical Neo4j substrate via S2 graph-services; it does not fork tables, run a private clock, or hold local correspondence constants. (Same kernel-bridge discipline as M1'/M2'/M3'.)

---

# 11. Cycle-2 m-dev Anchoring

Documentation relative to `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-2-canonical/`:

```text
02-m0-bimba-map-extension            this surface — the integrated engagement system (§3, §7)
03-m1-paramasiva-extension           the base physics M0' renders (§4)
08-integrated-1-2-3-cosmic-engine    the three-rendering composition (§5, §6)
```

The M0' graph view and the M3' wheel are the two 0-side renderings; the integrated 1-2-3 plugin composes M1'+M2'+M3' over the solar anchor; M0' is the structural pole that holds the substrate all three read.

---

# 12. Closing Formula

```text
M0-0′ holds the language (symbol, formulation, OWL, assets).
M0-1′ holds the QL-structure (coordinates, the topological skeleton).
M0-2′ holds the relations (structural skeleton + correspondential web).
M0-3′ holds community and the clock (what clusters, what's active now).
M0-4′ holds the personal (what the user touched and was touched by).
M0-5′ holds the pedagogy (depth, breadth, next-explorations — map-compass-lens).
```

The shorter operational mantra:

> **The bimba map is the system made walkable. M1' is the physics that walks it. M0' is the workbench that holds it — one substrate, three renderings, six layers, full CRUD under construction-discipline.**
> **The solar system is the anchor; the angels and every symbolic system are data-driven overlays; the user is the central daimon resonating against the cosmos in one shared Cl(4,2) algebra.**

---

*Counterparts: [[nara-ux-full-m4-branch-update]] (M4, the Jiva pole), [[epii-ux-full-m5-branch]] (M5, the paidagōgos pole). Frequency engine: [[Parashakti]] (M2). Base physics: [[M1'-SPEC]] (Paramaśiva). Content language: [[anuttara-language-map]] (M0). Canonical spec: [[M0'-SPEC]].*
