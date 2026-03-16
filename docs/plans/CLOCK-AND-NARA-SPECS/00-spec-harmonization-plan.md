# Nara / Cosmic Clock Spec Harmonization Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Harmonize the M0/M1/M3/M4 Nara and Cosmic Clock specifications into one canonical architecture before further implementation work.

**Architecture:** Treat natal data as the minimum viable identity input, the quintessence identity as the BLAKE3-derived archetypal address, and the quintessence quaternion as its mathematical derivation that feeds the clock. Preserve exact measured inputs, but make the M1 12-state tick / spanda ring the single canonical discrete clock state. Separate "canonical but not yet implemented" from "implemented today" in every document.

**Tech Stack:** Markdown architecture specs, C/Rust data contracts, Kerykeion, Khora session lifecycle, M0/M1/M3 dataset-derived numerical invariants

---

## Canonical Primitive Vocabulary (Codex contribution, 2026-03-16)

One named primitive set to use across ALL specs — prevents future drift:

| Primitive | Type | Meaning |
|---|---|---|
| `exact_degree_720` | `f32` | High-precision continuous clock address (0.0–719.999…); first 360° = explicate, second = implicate |
| `degree_node_360` | `u16` | Integer 0–359 for LUT lookup. Derived from `exact_degree_720 % 360.0` |
| `phase` | `u8` | 0 = explicate (Strand A), 1 = implicate (Strand B). Derived from `(exact_degree_720 / 360) as u8` |
| `tick12` | `u8` | Canonical M1 ring position 0–11. The single discrete clock state. All spanda/torus/substage terminology collapses here. |
| `cf_substage6` | `u8` | 6-fold view derived from `tick12`: `tick12 % 6`. Strand A view of the 12-state ring. |
| `quaternion4` | `[f32;4]` | Normalized `[w=EARTH, x=FIRE, y=WATER, z=AIR]`. Always unit quaternion. |
| `quintessence_hash` | `[u8;32]` | BLAKE3 archetypal address. The identity. |
| `oracle_eval4` | `(f32,f32,f32,f32)` | `(pp, nn, np, pn)` charge algebra from coin throw. |
| `oracle_payload` | struct | Machine-readable + human-readable simultaneously. See Task 7. |

**Rules:**
- `tick12` IS the spanda stage IS the torus_stage. One field, one name in every spec.
- `cf_substage6` is a view/lens on `tick12`, not a separate counter.
- `exact_degree_720` is stored and computed with full `f32` precision. Never truncated.
- `degree_node_360` is ONLY for LUT index lookup. Never used in arithmetic.

---

## Canon To Lock Before Editing

1. **Identity minimum:** Natal data is the only required identity layer for first entry. Numerological, Jungian, Gene Keys, and Human Design remain additive enrichment layers.
2. **Quintessence identity:** The quintessence identity is the BLAKE3 archetypal address. The quintessence quaternion is a derived mathematical form of that identity, not a competing identity object.
3. **Planet model:** Canonical public model is **10 planets + Earth as center**. Sun is at position 0 (the stable parent, encapsulates all others). Planets spiral outward: Sun(0), Moon(1), Mercury(2), Venus(3), Mars(4), Jupiter(5), Saturn(6), Uranus(7), Neptune(8), Pluto(9). Earth = center/observer/bridge, NOT in the 10-planet array. The 9:8 ratio (9 personal planets : 8 chakra slots) is canonical — Sun is excluded from the chakra-mapping series because it is the stable fixture that encapsulates all others. Planets Moon–Pluto (9 planets) map to the 8 chakras + Earth center. Uranus/Neptune/Pluto = M2-5 transpersonal layer (`is_transpersonal: bool` in `PlanetState`). Outer planets participate fully in the clock; their weight in the quintessence quaternion is configurable (default low). Transpersonal planets become primary in the SpacetimeDB multiplayer instantiation (future).
4. **Precision rule:** No arbitrary rounding or truncation. Preserve exact input precision. Quantization is allowed only when explicitly entering the M1 12-state ring or other named discrete lenses.
5. **Clock state:** The M1 tick / torus stage / spanda ring must be one coherent 12-state model. If multiple 12-fold apertures coexist, they must be explicitly named as concurrent streams, not conflated accidentally.
6. **Binary evaluation:** The system computes from real binary and arithmetic operators: M0 zero-logic and operator ISA, M1 `(0/1)` and spanda, M3 2-bit nucleotide logic, yin=2 / yang=3 coin arithmetic, 6-bit codon space, charge algebra, and downstream oracle payloads.
7. **Cross-layer contract:** `identity -> clock -> oracle -> payload -> medicine/transform/logos` is canonical architecture even where implementation is pending. Specs must say which links are normative now and which are scheduled.
8. **Earth center semantics:** Earth is NOT "always activated" at full level. Earth IS the clock's center anchor — the geocentric observer, the site of the 4.4.4.4 identity, the most neutral ground. All other elements (Fire/Water/Air) are the "active" ones that modulate around Earth's center. Rendering: Earth = central axis/anchor marker, not a chakra-level value on a spine.
9. **Lenses vs Walk modes (distinct, not the same):** Lenses = 16 simultaneous static reading apertures (all active at once for every degree). Walk modes = sequential traversal paths (one at a time). Most walks use a matching lens's step-size but serve a different function. WALK_HEXAGRAM (64-step, ~5.625°) and WALK_LINE_CHANGE (384-step) are binary-evaluation traversals with NO matching lens — intentionally, because 360/64 is not an integer. The 16-lens system is integer-factor geometry; the hexagram and line-change walks operate in 2^6 binary space. WALK_TORUS must be renamed WALK_SPANDA to signal M1 spanda semantics (distinct from WALK_ZODIAC even though both are 12-step/30°).
10. **Gateway contract location:** Gateway contract fields (`nara.*` method shapes) belong BOTH in `docs/specs/S/S3-S3i-GATEWAY.md` (for safety/continuity of live gateway code) AND in the centralized nara/clock spec files (`M4-nara-personal-interface.md`, `09-cosmic-clock-plugin-tui-spec.md`). The S3 spec is the implementation reference; the nara/clock specs are the canonical design source.
11. **Binary thread spec deferred:** The full binary evaluation thread spec (M0 zero-logic → M1 yin/yang → coin arithmetic → 2^6 oracle calculation → Ananda matrix as processing layer) is a dedicated spec requiring fresh focus. Do NOT interleave it with the harmonization edits. It becomes its own canonical document (`10-binary-evaluation-thread.md`) in a separate session.

---

## Architectural Decisions Locked 2026-03-16

### Planet Model Detail

```
Position  Planet       Role                       Chakra mapping (Moon–Pluto series)
0         Sun          Stable parent, clock root  excluded from chakra series (encapsulates all)
1         Moon         Personal inner             Sahasrara (Crown)
2         Mercury      Personal                   Ajna (Third Eye)
3         Venus        Personal                   Vishuddha (Throat)
4         Mars         Personal                   Anahata (Heart)
5         Jupiter      Social                     Manipura (Solar Plexus)
6         Saturn       Social                     Svadhisthana (Sacral)
7         Uranus       Transpersonal (M2-5)        Muladhara (Root)
8         Neptune      Transpersonal (M2-5)        —  (2nd root / Earth resonance, to spec)
9         Pluto        Transpersonal (M2-5)        —  (transformational deep; to spec)
—         Earth        Center/observer/bridge      index slot = sentinel only
```

9:8 ratio: 9 personal+social planets (Moon–Saturn) : 8 chakra slots (Earth center + 7 chakras).
Outer planets extend this into M2-5 territory. Internal array: `[PlanetState; 10]` with `is_transpersonal` flag.
Harmonic and frequency data for Uranus, Neptune, Pluto: TO BE ADDED from M2 Parashakti dataset updates.

### Lenses vs Walks Correspondence

| Walk Constant     | Steps | °/step  | Matching Lens      | Notes |
|---|---|---|---|---|
| WALK_DEGREE       | 360   | 1°      | Lens 0 (1×360)     | |
| WALK_AMINO        | 24    | 15°     | Lens 7 (15×24)     | backbone nodes only |
| WALK_ZODIAC       | 12    | 30°     | Lens 6 (12×30)     | astrological semantics |
| WALK_SPANDA       | 12    | 30°     | Lens 9 (30×12)     | M1 spanda semantics — rename from WALK_TORUS |
| WALK_DECAN        | 36    | 10°     | Lens 5 (10×36)     | |
| WALK_HEXAGRAM     | 64    | ~5.625° | **none**           | binary 2^6 space |
| WALK_ENNEADIC     | 9     | 40°     | Lens 11 (40×9)     | |
| WALK_SEASONAL     | 4     | 90°     | Lens 13 (90×4)     | |
| WALK_LINE_CHANGE  | 384   | varies  | **none**           | full transformation graph; 384=64×6 |

---

### Task 1: Publish A Canonical Invariants And Deprecations Sheet

**Files:**
- Create: `docs/plans/CLOCK-AND-NARA-SPECS/00-canonical-invariants.md`
- Modify: `docs/plans/CLOCK-AND-NARA-SPECS/07-unified-architecture-golden-thread.md`
- Modify: `docs/specs/M/2026-03-12-cosmic-clock-full-architecture.md`
- Modify: `docs/plans/2026-03-10-nara-runtime-full-plan.md`

**Steps:**
1. Write a one-page canonical sheet defining the authoritative answers for identity minimum, planet count, Earth role, 12-state clock, precision policy, and cross-layer payload routing.
2. Add a "superseded assumptions" table naming the exact outdated formulas and array shapes that must no longer be copied forward.
3. Link every affected spec back to this invariants sheet at the top of the document.

**Acceptance Criteria:**
- Any reader can answer "what is canonical?" without comparing four documents by hand.
- Out-of-date material is marked as superseded, not left to drift as ambiguous parallel truth.

### Task 2: Reframe M4 Identity Around Natal Minimum And BLAKE3 Quintessence

**Files:**
- Modify: `docs/plans/CLOCK-AND-NARA-SPECS/01-quintessence-hash-architecture.md`
- Modify: `docs/specs/M/M4-nara-personal-interface.md`
- Modify: `docs/plans/2026-03-10-nara-runtime-full-plan.md`

**Steps:**
1. Rewrite the identity sections so natal data is the first and only required layer for portal entry.
2. Keep the multi-layer matrix, but mark non-natal layers as additive enrichment instead of blockers.
3. State explicitly that the quintessence identity is the BLAKE3 address, while the quintessence quaternion is its derived elemental / rotational form used by clock processing.
4. Replace any wording that implies partial identity is architecturally invalid when natal data is present.

**Acceptance Criteria:**
- The specs distinguish "minimum viable identity" from "full enriched identity."
- No document treats placeholder enrichment layers as blockers to first implementation or first use.

### Task 3: Canonicalize The Planet Model And Earth Bridge

**Files:**
- Modify: `docs/plans/CLOCK-AND-NARA-SPECS/01-quintessence-hash-architecture.md`
- Modify: `docs/plans/CLOCK-AND-NARA-SPECS/07-unified-architecture-golden-thread.md`
- Modify: `docs/specs/M/M4-nara-personal-interface.md`
- Modify: `docs/specs/M/2026-03-12-cosmic-clock-full-architecture.md`
- Modify: `docs/plans/2026-03-10-nara-runtime-full-plan.md`

**Decision locked (2026-03-16):**
- 10 planets + Earth center. Array `[PlanetState; 10]`. Sun = index 0.
- Sun is the stable parent/encapsulator — excluded from chakra-mapping series.
- 9:8 ratio (Moon–Pluto : 8 chakras) is the canonical planetary-chakra alignment.
- Uranus/Neptune/Pluto = M2-5 transpersonal, `is_transpersonal: bool` per PlanetState.
- Harmonic/frequency data for outer planets: sourced from M2 Parashakti dataset updates.
- SpacetimeDB multiplayer context: transpersonal planets are primary environmental field generators.

**Steps:**
1. Replace conflicting `[7]`, `[9]`, and `[10]` descriptions everywhere with `[PlanetState; 10]` and the canonical Sun(0)–Pluto(9) + Earth=center table from the "Architectural Decisions" section above.
2. Define Earth in one sentence everywhere: clock center/observer, geocentric anchor, site of 4.4.4.4 identity — NOT a tracked clock-face planet.
3. Update `KairosState` comment in `clock_state.rs` to reflect the 10-slot array with correct planet order and `is_transpersonal` annotation. (Code change — coordinate with implementation pass.)
4. Add the M2-5 note: outer planets tie to M2 Parashakti bimba coordinates. Harmonic data for Uranus pending dataset update.
5. Parashakti dataset reconciliation: mark as a dependent task. Uranus integration requires updating the C dataset layer (M2 branch) before full clock-face rendering is possible for outer planets.

**Acceptance Criteria:**
- No spec disagrees about array size or planet order.
- Earth-center rule stated once, referenced everywhere.
- Outer planets explicitly marked as M2-5 transpersonal with staged rollout path documented.

### Task 4: Make The Binary Evaluation Thread Explicit End-To-End

**Files:**
- Modify: `docs/specs/M/M0-anuttara-language-architecture.md`
- Modify: `docs/specs/M/M1-paramasiva-mathematical-dna.md`
- Modify: `docs/specs/M/M3-mahamaya-symbolic-transcription.md`
- Modify: `docs/plans/CLOCK-AND-NARA-SPECS/04-shadow-dynamics-three-computations.md`
- Modify: `docs/plans/CLOCK-AND-NARA-SPECS/07-unified-architecture-golden-thread.md`

**Steps:**
1. Add a single canonical derivation chain: M0 operator / zero-logic ground -> M1 `(0/1)` and spanda -> M3 2-bit nucleotide encoding -> yin=2 / yang=3 coin arithmetic -> 6/7/8/9 line values -> 6-bit codon / hexagram address -> `pp/nn/np/pn` charge algebra.
2. Reconcile any remaining transpositions in young yin / young yang commentary so the arithmetic tables, nucleotide tables, and oracle wording all match.
3. State clearly that the 64-space is not symbolic-only: it is executable binary evaluation space (`2^6`) and must remain computable in all downstream modules.
4. Add one compact "holographic arithmetic" appendix that shows how the same numbers recur across codon, I-Ching, tarot, and charge layers.

**Acceptance Criteria:**
- A reader can trace the exact numeric route from `(0/1)` to a cast's computed charge tuple.
- No document treats yin/yang, nucleotide, coin, and charge values as separate symbolic vocabularies.

### Task 5: Unify Precision, Tick, Spanda, And Quaternion Projection

**Files:**
- Modify: `docs/specs/M/M1-paramasiva-mathematical-dna.md`
- Modify: `docs/plans/CLOCK-AND-NARA-SPECS/03-spanda-double-helix-12fold.md`
- Modify: `docs/plans/CLOCK-AND-NARA-SPECS/07-unified-architecture-golden-thread.md`
- Modify: `docs/specs/M/2026-03-12-cosmic-clock-full-architecture.md`
- Modify: `docs/plans/CLOCK-AND-NARA-SPECS/09-cosmic-clock-plugin-tui-spec.md`

**Steps:**
1. Decide one canonical projection from quaternion space into clock state and mark all alternatives as deprecated.
2. Define the exact rule for preserving high-precision degrees while still deriving a discrete 12-state M1 tick.
3. Clarify whether percentile weighting is retained as a precision-preserving interpolation layer, and if so, state that it supplements exact inputs and discrete tick states instead of replacing either.
4. Collapse duplicate language around tick, torus stage, spanda stage, and CF sub-stage wherever the architecture intends one thing.
5. Preserve the multi-aperture model only where genuinely needed, with each aperture explicitly named and semantically distinct.

**Acceptance Criteria:**
- The specs expose one singular precision model instead of mixed float, rounded, and quantized narratives.
- No document implies that arbitrary rounding is acceptable.
- Tick / spanda / torus terminology is consistent across M1, clock, and TUI specs.

### Task 6: Repair The 16-Lens, Backbone, Amino-Acid, And Walk Architecture

**Files:**
- Modify: `docs/plans/CLOCK-AND-NARA-SPECS/02-16-lenses-backbone-temporal.md`
- Modify: `docs/specs/M/2026-03-12-cosmic-clock-full-architecture.md`
- Modify: `docs/specs/M/HMS-quaternionic-overlay.md`

**Decision locked (2026-03-16) — Lenses vs Walks are distinct:**
- **Lenses** = 16 simultaneous static reading apertures (all 16 active at once for any degree). A lens is how you READ the clock at a granularity. `lens_segment[16]` pre-bakes each degree's membership in all 16.
- **Walk modes** = sequential traversal paths (one at a time). A walk is how you MOVE node to node.
- Most walks correspond to a matching lens's step-size (see correspondence table in Canon section above), but WALK_HEXAGRAM (64-step, ~5.625°) and WALK_LINE_CHANGE (384-step) have NO matching lens. These are binary 2^6 evaluation traversals. 360/64 is not an integer — by design. The hexagram and transformation walks operate outside the integer-factor lens paradigm.
- `WALK_TORUS` must be renamed `WALK_SPANDA` to signal M1 spanda semantics, distinct from `WALK_ZODIAC` even though both are 12-step/30°. Same geometry, different semantic register.

**Steps:**
1. Add a "Lenses vs Walks" clarification section to `02-16-lenses-backbone-temporal.md` using the correspondence table and the binary-space distinction.
2. Rename `WALK_TORUS` → `WALK_SPANDA` in the clock architecture spec and any other spec referencing it.
3. Reassert Lens 7 / 24-fold backbone as the primary amino-acid and hourly structural lens.
4. Tie the amino-acid nodes, major-arcana relations, and WALK_AMINO to the same canonical Lens 7 language.
5. State how the tarot-quaternion bridge consumes the 24-fold backbone via elemental quaternion (4-foldness → nucleotides → elements → quaternion components), not via a separate static table.
6. State explicitly: WALK_HEXAGRAM and WALK_LINE_CHANGE are the binary evaluation walks. They are where the system's 2^6 arithmetic actually operates.

**Acceptance Criteria:**
- The 24-fold backbone reads as one architecture across clock, amino acids, hours, and tarot bridges.
- Lenses and walks are never conflated in any spec.
- WALK_SPANDA is named and distinguished from WALK_ZODIAC with rationale.
- The binary-evaluation nature of WALK_HEXAGRAM and WALK_LINE_CHANGE is explicit.

### Task 7: Specify The Real Cross-Layer Contract And Payload Shapes

**Files:**
- Modify: `docs/plans/CLOCK-AND-NARA-SPECS/09-cosmic-clock-plugin-tui-spec.md`
- Modify: `docs/specs/M/M4-nara-subtle-body-map.md`
- Modify: `docs/plans/2026-03-10-nara-runtime-full-plan.md`
- Modify: `docs/specs/M/M4-nara-personal-interface.md`

**Steps:**
1. Write the canonical fields for `nara.identity.get`, `nara.kairos.current`, `nara.oracle.payload`, and `nara.medicine.*`.
2. Specify both machine-readable and human-readable oracle payload forms, including elemental quaternion output and readable body/organ/timing interpretations.
3. Make the cross-layer handoff explicit: identity seeds the clock, the clock contextualizes oracle reading, oracle emits canonical payload, medicine / transform / logos consume that payload.
4. Define which parts are required for the TUI, which for gateway, and which for frontend consumers.

**Acceptance Criteria:**
- The gateway contract is described in one place and referenced elsewhere.
- Oracle payload is no longer implied or deferred; it has an explicit schema and routing story.

### Task 8: Add Session Lifecycle And Khora Ownership Boundaries

**Files:**
- Modify: `docs/plans/2026-03-10-nara-runtime-full-plan.md`
- Modify: `docs/plans/CLOCK-AND-NARA-SPECS/09-cosmic-clock-plugin-tui-spec.md`
- Modify: `docs/specs/M/M4-nara-personal-interface.md`

**Steps:**
1. State that session-open and session-start timestamps are owned by the Khora / PI extension lifecycle.
2. Define how session identity is assembled from quintessence identity plus session metadata without duplicating session authority inside Nara.
3. Add a boundary section describing what the portal may assume is already initialized when a session begins.

**Acceptance Criteria:**
- Session-derived fields such as `session_hash` have a named authority and source.
- Nara, Khora, and the portal no longer compete for session ownership in prose.

### Task 9: Mark Planned Versus Implemented Architecture Without Ambiguity

**Files:**
- Modify: `docs/plans/2026-03-10-nara-runtime-full-plan.md`
- Modify: `docs/plans/CLOCK-AND-NARA-SPECS/09-cosmic-clock-plugin-tui-spec.md`
- Modify: `docs/specs/M/2026-03-12-cosmic-clock-full-architecture.md`

**Steps:**
1. Add a status legend to every major section: canonical, planned, partial, or implemented.
2. Move portal-tab layout changes, shared clock state wiring, oracle->medicine routing, and payload emission into clearly labelled future phases if they are not yet live.
3. Keep the architecture normative while removing the accidental suggestion that every documented bridge already exists in runtime.

**Acceptance Criteria:**
- Future readers can tell whether a statement is architectural canon, implementation roadmap, or current runtime fact.
- Review work stops misclassifying planned architecture as a broken implementation promise.

### Task 10: Add A Holographic Validation Matrix To The Specs

**Files:**
- Create: `docs/plans/CLOCK-AND-NARA-SPECS/10-holographic-validation-matrix.md`
- Modify: `docs/plans/CLOCK-AND-NARA-SPECS/07-unified-architecture-golden-thread.md`
- Modify: `docs/plans/2026-03-10-nara-runtime-full-plan.md`

**Steps:**
1. Create a matrix with columns for claim, source spec, data structure, derivation function, downstream consumers, status, and notes.
2. Seed it with the canonical cross-layer chains: quintessence identity, quaternion projection, clock state, oracle faces, payload, medicine, transform, logos, subtle body, and session presence.
3. Use this matrix as the gate for future spec changes: no new symbolic claim without a computational slot, and no new computational slot without a named symbolic meaning.

**Acceptance Criteria:**
- There is one audit artifact that future reviews can diff instead of re-deriving the whole system.
- Structural completeness, derivation completeness, and cross-layer coherence become checkable rather than rhetorical.

---

## Recommended Execution Order

1. Task 1
2. Task 2
3. Task 3
4. Task 4
5. Task 5
6. Task 6
7. Task 7
8. Task 8
9. Task 9
10. Task 10

## Verification Pass After Spec Edits

1. Re-run a structural diff across all touched specs for planet count, Earth handling, quaternion mapping, tick semantics, and payload schema names.
2. Re-audit the `identity -> clock -> oracle -> payload -> medicine` chain using the validation matrix only, without leaning on implementation files.
3. Only after the spec pass is stable, open a separate implementation plan for code changes.
