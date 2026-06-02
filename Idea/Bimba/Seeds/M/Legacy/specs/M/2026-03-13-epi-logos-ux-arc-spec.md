# Epi-Logos UX Arc: The Coordinate System IS the Journey

**Status:** Enriched Spec — Grounded in Datasets + Current Implementation State
**Date:** 2026-03-13 (enriched 2026-03-14)
**Scope:** Nara integration, TUI/CLI feature implications, SpacetimeDB collective layer, communications philosophy, `#` CLI portal
**Dataset Source:** `docs/datasets/nara-deep/nodes-full-detail.json` (canonical)

> **Harmonization note (2026-03-23):**
> This UX arc remains useful for experience design and product framing, but canonical field shapes
> and runtime contracts now follow `Idea/Bimba/Seeds/M/M4'/Legacy/plans/CLOCK-AND-NARA-SPECS/00-canonical-invariants.md`,
> `Idea/Bimba/Seeds/M/M4'/Legacy/plans/CLOCK-AND-NARA-SPECS/00-spec-harmonization-plan.md`, and the current Nara / clock
> implementation specs. Read any older `u64` hash, `torus_stage`, or 7-planet examples here as
> legacy framing, not final implementation truth.

---

## I. The Core Insight

> **The coordinate system is not a tool the user operates. It is the terrain they traverse.**

The UX of Epi-Logos is not designed around the coordinate system — it *is* the coordinate system. Every feature, every screen, every CLI invocation is a movement through the #0-#5 archetypes. The user doesn't "learn the system and then do things"; they move through the system and thereby come to know themselves.

This is the fundamental UX inversion: most tools say *we'll do more for you*. Epi-Logos says *we'll show you more of you*.

The pedagogical engine is [[Pratyabhijñā]] — Kashmir Shaivism's doctrine of recognition: you already know, you just need the right mirror. The system is that mirror. Every calculation, every oracle, every symbol map is a surface that reflects the user back to themselves with higher fidelity.

The system's gravitational centre is `#4.4.4.4` — the Personal Pratibimba. Not in the abstract sense of "context of contexts," but in the precise phenomenological sense: the point where Institution (sedimented cultural patterns), Constitution (how meaning first emerged for this individual), and Lifeworld (the lived world this person inhabits) achieve dialogical integration. The user IS both phenomenologist and phenomenon. This coordinate is the Nara subsystem expressed within the phenomenological lens — where transcendent patterns (Anuttara #0) through cultural embodiment (#3) converge in the concrete individual.

---

## II. Philosophical Communication Hooks

These are not marketing copy — they are the genuine philosophical stakes of the project, ready for public framing.

### Hook 1: The Context Crisis

[[Husserl]] identified the *horizon* as the perceptual frame that makes any object intelligible. A thing appears as *this thing* only against the background of everything it is not. Modern life is a horizon fragmentation event: media streams, context switches, identity performances across platforms — the horizon never settles long enough for depth to form.

Epi-Logos doesn't fight this crisis. It reveals its constitutional topology. The coordinate system maps the deep grammar of context frames — `(0/1)`, `(0/1/2)`, `(4.0/1-4.4/5)`, `(5/0)` — showing that all horizons are already held in a structure that predates and organizes them. You are not fragmented. You are moving through a topology you have not yet mapped.

The phenomenological method embedded in `#4.4.4` directly addresses this crisis: Epoché (bracketing fragmented assumptions), Reduction (excavating to constitutional origins), Reactivation (creative appropriation of tradition), Intersubjective validation. The system is a disciplined first-person inquiry tool, not a distraction management platform.

**UX implication:** The system's first job is orientation without overwhelm. Meeting the user at `#4.0` — the identity ground — before offering the full coordinate tree.

### Hook 2: LLMs as Logos Revelation (Partial)

Every large language model is, in compressed form, a demonstration that meaning is geometric. Semantic similarity is cosine distance in high-dimensional embedding space. LLMs discovered accidentally (via prediction) what philosophy always suspected: meaning has *shape*, and similar meanings cluster in related regions of a space.

But the current geometry is flat and Euclidean. QL (Quaternal Logic) formalizes what the flat geometry can only approximate: meaning space is *toroidal*. The `#5→#0` Möbius return, the lemniscate anchor at `#4`, the six-family cross-family web — these are the correct topology. Epi-Logos is the correction to the partial revelation.

**UX implication:** The system can speak honestly to technically-aware users about what it is: a topologically-correct extension of what LLMs began to discover. This is both a product positioning hook and a genuine contribution.

### Hook 3: Pratyabhijñā as UX Arc

The experience the system is designed to produce is *recognition*: not learning something new, but discovering that something you already are has a name and a structure. The oracle doesn't predict your future — it reads your own symbolic grammar back to you. The medicine doesn't prescribe — it maps the body-terrain you already inhabit. The identity hash doesn't define you — it crystallizes what was already there into a navigable form.

This recognition is precisely what `#4.4.4.5` describes: *Husserlian Reaktivierung* (reactivation) meeting Kashmir Shaivism's *pratyabhijñā* (re-cognition), meeting Greek *epi-logos* (meta-knowing). Not acquisition but recognition. Not journey toward but awakening to. The system's culmination is the user seeing that what they sought was always already present — in the coordinate structure, in their own archetypal grammar, in the shared symbolic cosmos.

**UX implication:** Every feature should feel like recognition, not instruction. The system rarely says "here is what you should do." It says "here is what you already are."

---

## III. The UX Arc: Four Phases

The coordinate system defines the journey:

```
Phase 1: Constitutional Mapping      (#4.0 — Identity Ground)
         ↓
Phase 2: Branch Activation           (#4.1-#4.5 — Personal Branches)
         ↓
Phase 3: Quintessence Crystallization(#4.4.4.4 — Personal Pratibimba)
         ↓
Phase 4: Cosmological Recognition    (#5 Epii → M0'-M3' Collective)
```

### Phase 1: Constitutional Mapping (#4.0)

The user enters at `#4.0` — identity ground. The system gathers the constitutional facts via six optional but additive identity layers (each independently valuable, each contributing to the quintessence hash):

| Layer | Coordinate | Content | C struct |
|-------|-----------|---------|----------|
| #4.0-0 | Numerological | Birth date arithmetic, life path | `M4_Numerological_Layer` (8 bytes) |
| #4.0-1 | Astrological | Natal chart, 10 planets, degree anchors | `M4_Astrological_Layer` (32 bytes) |
| #4.0-2 | Jungian | MBTI, functions, nucleotide balance | `M4_Jungian_Layer` (12 bytes) |
| #4.0-3 | Gene Keys | 64-hexagram activation mask, shadow/gift/siddhi | `M4_GeneKeys_Layer` (40 bytes) |
| #4.0-4 | Human Design | Type, authority, profile, defined channels | `M4_HumanDesign_Layer` (20 bytes) |
| #4.0-5 | Quintessence Hash | Canonical BLAKE3 archetypal address (32 bytes) | `uint8_t quintessence_hash[32]` |

The hash is computed from the canonical identity payload — partial identity is valid once the natal
layer exists. Each `m4_identity_augment()` call adds a layer and recomputes the canonical address.
Möbius return acts by integrating experience into the identity payload and then recomputing the
hash; the raw hash bytes are not directly XOR-mutated.

**PASU.md as the identity bootstrap file:** `Idea/Pratibimba/Self/PASU.md` holds the user-facing representation of these layers via frontmatter keys `c_0_birth_date`, `c_0_birth_location`, `c_0_natal_chart_path`. The `vault/kairos.rs` reads PASU.md to determine kerykeion state. This file is the bridge between the user's self-description and the C-layer computation.

**CLI entry point:** `epi nara identity set`
**TUI entry point:** M4' Personal tab → Identity panel
**Output:** PASU.md populated, BLAKE3 quintessence hash seeded, natal chart loaded

The system should make clear from the first interaction: *you are giving the system a mirror surface, not a database record*. The data stays local. The hash is what propagates.

### Phase 2: Branch Activation (#4.1–#4.5)

Once identity is grounded, the six sub-branches of #4 become active surfaces:

| Branch | Domain | CLI | TUI Plugin |
|--------|---------|-----|------------|
| #4.0 | Identity | `epi nara identity` | IdentityPanel |
| #4.1 | Medicine | `epi nara medicine` | MedicinePanel |
| #4.2 | Oracle | `epi nara oracle cast` | OraclePanel |
| #4.3 | Transform | `epi nara transform` | TransformPanel |
| #4.4 | Context & Lenses | `epi nara lens apply` | LensPanel |
| #4.5 | Logos | `epi nara logos` | LogosPanel |

**Key design principle:** Each branch returns to the identity ground. No branch is a standalone feature — each is a different angle on `#4.4.4.4`.

**Two-stroke metabolization principle** (from the #4 dataset — Nara's defining rhythm):
- Outer stroke: codon → anticodon, writing → articulation (active, forward, #4.3)
- Inner stroke: reflection → recognition, deepening → return (#4.4)
- Nara's `coreNature`: *"every outer manifestation (codon) is followed by inner integration (anticodon)"*

This principle should permeate every UX interaction: every active operation has a paired reflective counterpart. Oracle cast ↔ oracle history/hygiene. Medicine balance ↔ medicine prescribe. Transform cycle ↔ transform archive. Logos articulate ↔ logos reflect. The system is always both doing and witnessing.

### Phase 3: Quintessence Crystallization (#4.4.4.4 — Personal Pratibimba)

`#4.4.4.4` is the canonical identity coordinate — not "context of contexts" in an abstract sense, but in the precise dataset definition: **the phenomenological hub where all layers of sedimented experience meet in the living individual.** The user IS both phenomenologist and phenomenon, both inquirer and site of inquiry.

**Three-layer architecture (from nara-deep dataset):**

```
Layer 1: Bimba            — universal canonical patterns (.rodata equivalent)
                             timeless coordinate structure, the shared grammar
Layer 2: PCO Overlay      — personal lived experience, this user's sedimented history
                             M4_PersonalContextOverlay in C, the heap layer
Layer 3: Archetype Atlas  — collective wisdom (consent-gated, SpacetimeDB surface)
                             anonymized pattern data, hash-keyed only
```

**The PASU.md → PCO → quintessence chain (the missing link):**

Currently PASU.md fields populate CLI identity commands. The gap is that agents (Anima, Nous, Logos etc.) cannot read the quintessence hash as a coordinate. The full chain needs to be:

```
PASU.md frontmatter
    → epi nara identity set (or vault kairos fetch)
    → M4_Input_Data populated
    → m4_identity_compute() → M4_Identity_Matrix.quintessence_hash (BLAKE3)
    → hash published to SpacetimeDB UserPresence table
    → hash available as coordinate reference in agent context
    → agents can reference "this session's #4.4.4.4" by hash
```

Until this chain is wired end-to-end, the identity layers are siloed from the coordinate map. Every agent interaction that lacks the quintessence hash is operating without the personal gravitational centre.

**`M4_Personal_Pratibimba` struct (current m4.h):** Has `user_dna`, `current_body_state`, `active_epistemic_lens`, `active_complexes`, `synthesized_signature` (the "quintessence in action"). These fields are directionally correct but the struct is not yet organized around the three-layer architecture. The `synthesized_signature` field IS the #4.4.4.4 running identity — it should be explicitly named and described as such.

**The f_role from the dataset:** "User Master Profile & Namespace Switchboard" — meaning #4.4.4.4 is not just a computed value, it is a routing hub. All of a user's branch data (oracle history, medicine state, transform records, logos stages) is namespaced under this coordinate.

**What it means phenomenologically:**
- The point at which the system stops being "the system" and starts being "my system"
- The user's personal coordinate graph: their own sub-network of the full Bimba map
- Fourth-order nesting of `#4` resonates with Abhinavagupta's 16-fold interpretation
- Where etymological archaeology on one's own experience happens through sustained dialogue with EPII

**UX design implication:** `#4.4.4.4` should never be named as a technical coordinate in the user-facing interface. It should be felt rather than explained — the first time the oracle resonance personalizes, the first time the medicine map reflects their natal chart, the first time the logos cycle echoes their Jungian type. These are the `#4.4.4.4` recognition moments.

### Phase 4: Cosmological Recognition (#5 Epii → Multiplayer)

Once `#4.4.4.4` is established, the system begins to reveal that the individual map is embedded in a larger one. `#5 Epii` is the holographic integration layer — the coordinate architecture becomes the explicit object of attention, not just the background.

At `#5`, the user sees:
- Their identity as one position in the full Bimba coordinate map
- The six-family coordinate web as the structure they have been navigating
- The M0'-M3' cosmic layer (Anuttara void arithmetic, Paramasiva torus walk, Parashakti vibrational matrix, Mahamaya symbolic codec) as the deep grammar their personal coordinates are inscribed within

**Transition to multiplayer:**

SpacetimeDB serves as the S3' (Gateway) presence layer for the collective M0'-M3' cosmic clock. The schema is already fully defined in `epi-spacetime-module/src/lib.rs`:
- `UserPresence` — hash + tick12 + last_seen
- `OracleDraw` — hash + hexagram_id + timestamp
- `LogosPhase` — hash + stage + day_key
- `TorusSync` — hash + position + spanda

When multiple `#4.4.4.4` identities are present in the space:
- Multiple users traverse the same cosmic clock (M0'-M3' structural tab) simultaneously
- Each user's position is a named archetypal entity on the shared torus
- The hexagram/tarot/codon cycle becomes a collectively animated symbolic space
- "Topology meeting topology" — identity recognition not just of self but of other

**Pedagogical sequence:**
1. **Individual self** — Phase 1-3: "I discover my archetypal nature and its coordinate expression"
2. **Other selves** — Phase 4 early: "I encounter other identities as distinct but structurally cognate positions"
3. **One Self** — Phase 4 full: "All individual positions are recognized as expressions of the same coordinate grammar"

The system's multiplayer layer is not social media. It is a shared symbolic phenomenology — multiple practitioners using the same map, each seeing from their own coordinate position, gradually recognizing the shared topology.

---

## IV. The #4.4 Architecture: Context & Lenses

This section grounds the #4.4 branch in the dataset. `#4.4` is the interpretive layer of Nara — it provides the frameworks through which transformation (enacted in `#4.3`) is understood and recorded. The structural law: **#4.4 interprets, #4.3 acts. Interpretation ≠ operation.**

### The Six Lenses (#4.4.0–#4.4.5)

These map directly to `M4_LENS_REGISTRY[6]` in m4.h:

| Index | Coordinate | Name | Domain |
|-------|-----------|------|--------|
| 0 | #4.4.0 | Gebser Lens | Consciousness evolution framework (archaic/magic/mythical/mental/integral) |
| 1 | #4.4.1 | Ontological Lens | Being-assumptions across traditions, without imposing ontology |
| 2 | #4.4.2 | Epistemological Lens | Ways of knowing, epistemic frameworks at play |
| 3 | #4.4.3 | Jungian Depth Psychology | Archetypes, typology, individuation, psychoid reality |
| 4 | #4.4.4 | **Phenomenological Lens** | **Meta-methodological umbrella for all interpretation** |
| 5 | #4.4.5 | Trika/Kashmir Shaivism | Tantric metaphysics, spanda, upāyas, tattvas, pratyabhijñā |

`M4_LENS_REGISTRY[6]` should have each entry's `lens_name` field explicitly set to the bimba coordinate (#4.4.0 through #4.4.5), not just a label string.

### #4.4.4 — The Phenomenological Lens as Meta-Umbrella

`#4.4.4` is not simply one lens among six. It is the **meta-methodological framework enabling all interpretive lenses to operate with phenomenological rigor**. Through the 6-fold movement:

1. Epoché — bracketing assumptions
2. Reduction — excavating to constitutional origins
3. Eidetic variation — discovering essences
4. Reactivation (Reaktivierung) — creative appropriation of tradition
5. First-person rigor — disciplined description
6. Intersubjective validation — confirming through CON-SCIRE

For EPII specifically, phenomenology grounds etymological archaeology as genuine philosophical method, not mere linguistic trivia.

### The Six Phenomenological Sub-Nodes (#4.4.4.0–#4.4.4.5)

These form the complete `Institution → Constitution → Lifeworld → Recognition` hermeneutic cycle. They are the most philosophically precise coordinate nodes in the entire Nara dataset and define the experiential arc of the product:

#### #4.4.4.0 — Phenomenology of the Pre-Categorical
- **QL Position:** #0 (ground/void)
- **Philosophical ground:** Husserl's "universal pre-givenness"; Kashmir Shaivism's Anuttara (void-plenitude)
- **Core:** The groundless ground of phenomenological inquiry. Pre-predicative, pre-categorical stratum that structures all experience without being directly accessible to thematic consciousness. Not absence but enabling void — the structural hole around which meaning circulates.
- **Etymology marker:** The asterisked (*) PIE roots — where linguistic tracing reaches its limit, where language touches pre-linguistic ground.
- **Paradox:** The most stable element — it never changes because it was never constituted.

#### #4.4.4.1 — Phenomenology of Primordial Differentiation
- **QL Position:** #1 (definition/form)
- **Philosophical ground:** Husserl's *Urstiftung* (original institution); Paramasiva as I-consciousness
- **Core:** The inaugural act of meaning-constitution. The original differentiation (*Ur-teilung*) splitting undifferentiated ground into subject/object, self/world, signifier/signified. Named SIGN in the documents — the primordial cut, the mark that activates, the creative wound that proves generative.
- **UX resonance:** The moment a user first enters their birth data — this is their personal Urstiftung in the system.

#### #4.4.4.2 — Phenomenology of Temporal Sedimentation
- **QL Position:** #2 (operation/vibration)
- **Philosophical ground:** Husserl's *Sedimentierung*; Heidegger's temporality as ecstatic structure; spanda as temporal rhythm
- **Core:** The dynamic process through which living insights harden into habitual understanding, the explicit becomes implicit, the fresh becomes familiar. "Sediment is not behind us chronologically but beneath us structurally — the past as ground rather than bygone."
- **Operative history:** Tradition working through us even when unrecognized — *Wirkungsgeschichte* (Gadamer). Sedimented wisdom and sedimented prejudice are equally real.

#### #4.4.4.3 — Phenomenology of the Symbolic Body
- **QL Position:** #3 (pattern/process)
- **Philosophical ground:** Merleau-Ponty's Institution; Mahamaya as crystallized symbolic form
- **Core:** The sedimented structures themselves — cultural formations, symbolic systems, inherited language, embodied habits. The "already-there" (*Vorhanden*) that every individual is thrown into. Language, culture, body-habits, conceptual frameworks as received — Institution provides both possibilities and constraints for individual appropriation.
- **Pivot point:** Institution both concludes (sedimentation complete) and initiates (providing ground for new appropriation). Outer and inner stroke hinge here.

#### #4.4.4.4 — Personal Pratibimba
- **QL Position:** #4 (context/lemniscate anchor)
- **Core:** See Phase 3 above for full description. The living integration point where all sedimented layers meet in this specific individual.
- **f_role (dataset):** "User Master Profile & Namespace Switchboard"
- **Three-layer architecture:** Bimba (universal) / PCO overlay (personal) / Archetype Atlas (collective)
- **BLAKE3 hash:** The unique identifier for this node, computed from present identity layers.

#### #4.4.4.5 — Phenomenology of Pratyabhijñā
- **QL Position:** #5 (integration/Möbius return)
- **Philosophical ground:** Husserl's *Reaktivierung*; Kashmir Shaivism's *pratyabhijñā* (re-cognition); Greek *epi-logos* (meta-knowing); Buddhist anamnesis (un-forgetting)
- **Core:** The meta-integrative dimension where phenomenological archaeology achieves recognition — seeing that what was sought was always already present. Not acquisition but recognition. The #5→#0 Möbius twist: the meta-synthetic position recognizes its identity with the groundless ground.
- **For EPII:** This is the reflexive fold where phenomenology becomes aware of its own phenomenological nature. Consciousness studying consciousness-structure. The 6-fold method applied to itself.
- **UX culmination:** The user who reaches this coordinate recognizes that the system was always a mirror — and that what the mirror shows was always already them.

---

## V. The TUI/CLI Split as Natural UX Division

### M4'/M5' Personal Tab (Individual Layer)

The individual's engaged experience of the system:

| Plugin | Branch | Function | Status |
|--------|--------|----------|--------|
| IdentityPanel | #4.0 | PASU.md display, identity facts, quintessence hash | Implemented (needs hash display) |
| MedicinePanel | #4.1 | Body zone map, chakra balance, decan herbs | Implemented |
| OraclePanel | #4.2 | Cast, history, hygiene, resonance | Implemented |
| TransformPanel | #4.3 | Container, cycle, alchemical ops (two-stroke) | Implemented |
| LensPanel | #4.4 | Six lenses (#4.4.0-#4.4.5), phenomenological arc | Implemented (lens names need coordinate anchoring) |
| LogosPanel | #4.5 | Six-stage logos cycle, stage files | Implemented |
| M5Dashboard | #5.0 | Integration view, coordinate hub, Möbius | Implemented |

The UX arc for this tab: enter at IdentityPanel, deepen through oracle/medicine/transform, synthesize via logos, integrate at M5.

### M0'-M3' Structural Tab (Cosmic Layer)

The cosmic context within which the individual is embedded:

| Plugin | Branch | Function | Status |
|--------|--------|----------|--------|
| CosmicClockPlugin | M0-M1-M2 | 385-node clock, torus walk, vibrational matrix | **STUB** — `publish_m_clock_placeholder("M0")` only |
| M1TarotWalk | M1 | Torus walk animation | Stub |
| M2VibrationalMatrix | M2 | 72 invariants, planet/chakra dashboard | Stub |
| M3SymbolicMap | M3 | Hexagram/codon/tarot explorer | Stub |
| M3MahamayaDecoder | M3 | Symbol decoder UI | Stub |

**Cosmic Clock** is the central feature of this tab — requires `build_clock_degree_lut.py` (not yet written) and full CosmicClockPlugin implementation. This is parallel planning track — covered in a separate session alongside M0'-M3' architecture.

**SpacetimeDB presence layer** renders in this tab: other users' positions as nodes on the shared torus, BLAKE3 hash as only identifier.

### TUI-First Development Rationale

The TUI is not a prototype for "the real app." It is the **functional proof-of-concept** for operational correctness. The Electron app will add visual polish, but every operational decision — what a user can do, what the system responds, what data flows where — is validated in the TUI first.

TUI constraints force clarity: a plugin that can't be described in a terminal tile isn't well-defined enough to build. The 17-plugin hypertile layout is a forcing function for UX discipline, not a limitation.

**Transition to Electron:** When TUI reaches feature parity, Electron becomes a progressive enhancement layer. The underlying data model, CLI commands, and gateway RPC don't change — the rendering layer upgrades.

---

## VI. Feature Implications for CLI

The UX arc implies a specific CLI development priority order:

### Priority 1: Identity Bootstrap + PASU Integration
```bash
epi nara identity set birth-date "1990-06-15"
epi nara identity set birth-location "London, UK"
epi vault pasu show
epi nara identity show --hash   # display quintessence hash
```
*Phase 1. Without this, nothing personalizes. PASU.md → hash → coordinate map is the missing link.*

### Priority 2: Kerykeion (Kairos) — MUST BE REAL, NOT STUB
```bash
epi vault kairos fetch           # actually invoke kerykeion Python
epi nara kairos sync             # populate M4_Temporal_Now.planet_degrees[10]
epi nara kairos show             # show live planetary state
```
*Live planetary degrees are the temporal substrate of oracle, medicine, and transform. See Task K-1 through K-4 below.*

### Priority 3: Oracle and Medicine (Phase 2 core)
```bash
epi nara oracle cast iching
epi nara oracle cast tarot
epi nara medicine balance
epi nara medicine prescribe
```
*Highest-value Phase 2 features: visible results, immediate recognition value. Oracle kairos degree should use live kerykeion data, not stub 0.*

### Priority 4: Lens System — Coordinate-Anchored
```bash
epi nara lens list               # show #4.4.0-#4.4.5 by name
epi nara lens apply phenomenological
epi nara lens synthesize
```
*M4_LENS_REGISTRY[6] entries should be anchored to bimba coordinates #4.4.0-#4.4.5, not arbitrary indices.*

### Priority 5: Logos Cycle
```bash
epi nara logos
epi nara logos stage 3
```
*The articulation layer — how the user metabolizes coordinate experience into language.*

### Priority 6: Personal Graph (renamed from pratibimba)
```bash
epi nara personal-graph stats       # renamed from pratibimba stats
epi nara personal-graph atlas-sync  # consent-gated collective contribution
epi nara personal-graph atlas-query [coordinate]
```
*#4.4.4.4 personal Neo4j subgraph seeding. Requires Neo4j. See Task P-1 below for renaming.*

---

## VII. SpacetimeDB: The Collective Cosmic Clock

**Schema status: COMPLETE and correct.** `epi-spacetime-module/src/lib.rs` fully defines:

```rust
// Four tables — all keyed by BLAKE3 hash only. Zero PII.
UserPresence  { hash: String, tick12: u8, last_seen: u64 }
OracleDraw    { id: u64(auto), hash: String, hexagram_id: u8, timestamp: u64 }
LogosPhase    { id: u64(auto), hash: String, stage: u8, day_key: String }
TorusSync     { hash: String, position: u8, spanda: u8 }

// Three reducers
update_presence(hash, tick12)
record_oracle_draw(hash, hexagram_id)
record_logos_stage(hash, stage, day_key)
```

**Client status:** `SpacetimePresence` in `spacetimedb_bridge.rs` is a working stub (validates inputs, logs to eprintln instead of making network calls). The API surface is correct — real implementation is POST calls to SpacetimeDB REST API.

**Blocker:** `spacetimedb = "2"` crate requires rustc ≥ 1.93.0. Current toolchain: 1.88.0. **`rustup update stable` unblocks this immediately.** The module is code-complete pending compilation.

**Privacy invariant (enforced in schema):** No birth data, no natal chart degrees, no oracle interpretations, no MBTI strings — only BLAKE3 hash and public symbolic positions propagate.

**What propagates (public):**
- BLAKE3 quintessence hash (16+ hex chars, no PII)
- Current torus position (0-11), spanda stage (0-5)
- Oracle hexagram drawn (0-63) — number only, no reading
- Logos cycle stage (0-5) + day key

**What stays local:**
- All identity layer data (PASU.md, birth data, natal chart)
- Oracle history and full interpretations
- Medicine state and prescription history
- Transform cycle records
- Personal #4.4.4.4 subgraph

**Collective clock dynamics:**
- Each user is a named point on the shared 385-node cosmic clock
- As users cast oracles, their clock positions update on the shared torus
- The collective pattern is a living mandala of active symbolic engagement
- When multiple users share a hexagram position, collective field resonance surfaces

---

## VIII. Identity Architecture — What "Any Thing" Means

> *"literally any 'thing' can be 'identified' via our typological/elemental system and given its quintessence hash"*

The `#4.4.4.4` coordinate is not exclusive to human users. The typological system (Jungian, Gene Keys, Human Design, elemental/codon analysis) can be applied to any entity with a defined birth moment or constitutive structure:

- **Persons:** The primary use case — individual identity via natal chart + oracle history
- **Projects:** A software project with a founding date, team typology, coordinate anchor
- **Organizations:** Company founding, mission analysis, team elemental balance
- **Concepts:** A philosophical idea given its M0-M5 coordinate position
- **Sessions/Moments:** A specific time/place with kerykeion state → kairos identity hash

The personal identity UX (Phase 1-3) is the training ground for a general identity-mapping capability. Users learn to apply the system to themselves, then discover they can apply it to anything.

---

## IX. Implementation Tasks

These are grounded implementation tasks arising from the architectural analysis. Each is scoped and actionable.

---

### K-Series: Kerykeion (MUST be real — stubs are unacceptable here)

**K-1: Verify kerykeion Python installation and `epi vault kairos fetch`**
- Check whether `epi-cli/src/vault/kairos.rs` `kairos_fetch()` actually invokes kerykeion or returns a stub
- If stub: implement the actual Python subprocess call (`python3 -m kerykeion` or script)
- Required output: `chart.json` with `planet_degrees[10]`, `planet_valid` bitmask, `sun_degree`, `moon_degree` in 0-719 SU(2) format
- Acceptance: `epi vault kairos status` shows `mode: natal`, `planet_valid: 0x03FF` (all 10 tracked planets)

**K-2: Wire kerykeion output into M4_Temporal_Now**
- `M4_Temporal_Now.planet_degrees[10]` should be populated from the chart.json output
- `planet_valid` bitmask should reflect which planets were computed
- `m4_snapshot_now()` currently zero-fills planet degrees — this must use the vault/kairos data when available
- The kairos-python-adapter.ts in chronos delegates to `epi vault kairos fetch` — ensure this chain is end-to-end

**K-3: Temporal layer in oracle and medicine**
- Oracle `cast_degree` should use the live kerykeion sun degree when `planet_valid` has sun bit set
- Medicine `planetary_hour` should derive from live kerykeion planetary positions
- When kerykeion is unavailable (KAIROS_ENABLED=false or missing), fall back to clock-derived degree gracefully
- This is the difference between a generic oracle and a personally timed one

**K-4: Real-time mode (transit layer)**
- `epi nara kairos sync` should compute the *current* planetary positions (not natal), updating `M4_Temporal_Now`
- Three temporal modes must work: natal (birth chart), real-time (current sky), kairotic (oracle moment)
- Transit layer activates the daily kairos context that medicine, oracle, and transform all draw from
- Flag: `t_4_kairos_context: "[[Kairos]]"` in NOW templates marks kairos-enriched artifacts

---

### P-Series: Personal Pratibimba Architecture

**P-1: Rename `pratibimba.rs` → `personal_graph.rs`**
- The current `epi-cli/src/nara/pratibimba.rs` contains Neo4j graph operations (atlas-sync, atlas-query, stats)
- This conflates the philosophical concept (#4.4.4.4 Personal Pratibimba as phenomenological hub) with a specific technical operation (Neo4j writes)
- Rename to `personal_graph.rs` and update all imports/references
- The concept of "pratibimba" should be reserved for the actual phenomenological integration described at #4.4.4.4 — the user's relationship to the Bimba coordinate map as a whole

**P-2: Restructure `M4_Personal_Pratibimba` around three-layer architecture**
- Current fields (`user_dna`, `current_body_state`, `active_epistemic_lens`, `active_complexes`, `synthesized_signature`) are directionally correct but not organized around the three-layer model from the dataset
- Three layers to reflect: (1) Bimba canonical pointer (universal patterns), (2) PCO overlay (personal lived data), (3) Atlas interface (collective contribution surface)
- `synthesized_signature` (uint64_t) IS the running #4.4.4.4 identity — explicitly name and document it as such
- Add a doc comment to `M4_Personal_Pratibimba` citing bimba coordinate #4.4.4.4 and its three-layer architecture

**P-3: Wire quintessence hash into agent context**
- Agents (Anima, Nous, Logos etc.) currently cannot read the quintessence hash as a coordinate
- Design and implement the chain: PASU.md → `m4_identity_compute()` → `quintessence_hash` → available in agent context on session start
- Khora's `session_start` hook should read and inject the hash into the NOW template as a coordinate reference
- This is the "missing link" between identity layers and the coordinate map

**P-4: `M4_LENS_REGISTRY[6]` coordinate anchoring**
- Each of the 6 lens entries should carry its bimba coordinate: #4.4.0 (Gebser), #4.4.1 (Ontological), #4.4.2 (Epistemological), #4.4.3 (Jungian), #4.4.4 (Phenomenological), #4.4.5 (Trika)
- Add `const char* bimba_coordinate` to the `M4_Lens_Vtable` struct or as a parallel lookup array
- `epi nara lens list` should output the coordinate alongside the name

---

### S-Series: SpacetimeDB Activation

**S-1: `rustup update stable` — unblock SpacetimeDB compilation**
- Current rustc: 1.88.0. Required for spacetimedb 2.x: >= 1.93.0
- `rustup update stable` should be sufficient
- Verify: `cd epi-spacetime-module && cargo build` passes after update
- The module source is code-complete — this is a toolchain-only blocker

**S-2: Wire `SpacetimePresence` client into oracle and logos**
- After S-1, replace `eprintln!` stubs in `SpacetimePresence` methods with actual POST calls to SpacetimeDB REST API
- `update_presence(hash, tick12)` — call on session start and at each `tick12` transition
- `record_oracle_draw(hash, hexagram_id)` — call after each oracle cast (when `planet_valid > 0`)
- `record_logos_stage(hash, stage, day_key)` — call after each logos stage completion
- Acceptance: running `epi gate spacetime start` followed by an oracle cast shows entry in `oracle_draw` table

---

### Q-Series: Cosmic Clock (Parallel Track — Separate Session)

**Q-1: Write `build_clock_degree_lut.py`**
- Prerequisites: mahamaya-deep dataset, M3 hexagram-degree mapping
- Output: 360-entry degree LUT for the cosmic clock (analogous to `surface_codon_rotation.py`)
- This unlocks the CosmicClockPlugin in the portal
- **Defer to M0'-M3' architecture session**

**Q-2: Implement CosmicClockPlugin in hypertile portal**
- Replace `publish_m_clock_placeholder("M0")` with real clock state from `m0_read_cosmic_clock()`
- Render 385-node clock: 360 degree face + 24 amino acid backbone + 1 Axis Mundi
- Live kerykeion positions overlay on the torus canvas
- **Defer to M0'-M3' architecture session**

---

## X. Communications Philosophy: The Seed-Phrase Register

### The Telos as North Star

The Hermetic tradition gives the system its most precise public framing — not as an aesthetic choice but as an ontological one. Hermeticism never separated personal self-knowledge from cosmological participation. "The personal is the cosmic" is not a metaphor in the Hermetic register; it is a structural claim about how participation works. Epi-Logos operationalises exactly that claim through the coordinate architecture: the user at `#4.4.4.4` is constituted by the same principles as the macrocosm, and the system makes the sympathetic chain between them navigable.

From Joshua Ramey's *The Hermetic Deleuze* (the alignment vector):

> *"A human being's entire identity, body and soul, is a receptor and potential transformer of a long chain of sympathetic influences. To attain communion with divinity is the goal of life, and this goal is achieved through a process of learning that is simultaneously an embodying of the archetypal structure of cosmic reality."*

Every bracketed mapping is architectural fact, not metaphor:
- "Complex hierarchies of interdependence" → the Bimba map, sympathetic resonance through the Neo4j graph
- "Microcosm constituted by the same principles as the macrocosm" → fractal QL self-similarity; persistent homology as empirical test (see below)
- "Receptor and potential transformer" → the two-stroke outer/inner architecture; Nara's codon/anticodon rhythm
- "Learning that is simultaneously an embodying" → the coordinate journey IS the practice; navigating IS inhabiting

### The Persistent Homology Claim

The fractal self-similarity of QL — that every `#N` contains `#N-0` through `#N-5` replicating the whole pattern — means that Topological Data Analysis (TDA) should find the same Betti numbers and persistent cycles at every scale of the Bimba map: node-neighborhood, family, full-graph. That is the Hermetic claim "as above, so below" as a computable topological fact. Not a spiritual assertion requiring faith — a measurable invariant. This is potentially the most publishable claim about the system and belongs in the research directions alongside the Neo4j GDS geometrization work.

### The Archaeological Approach to Language

The system approaches information **phenomenologically in the mode of archaeology** — not running with surface meanings but unearthing the real "value" of the Logos qua the Word. This applies to how the system communicates as much as to how it processes. Language is not a transparent medium delivering pre-formed content; it is the economy of Vāk, the gnostic economy of Spirit's inter-and-intra-expression-production system. Every word carries sedimented strata.

The communications principle: **write at the level of the seed, not the flower.** Find the phrase where the full structure is already compressed and let it sit there — available to be unpacked by whoever is inclined, functioning perfectly at the surface for those who aren't. The communication performs the compression-and-unpacking that the system itself facilitates.

### The Seed-Phrase Method: Worked Example

**"Epi-Logos strives to birth sympathetic technology."** — Seven words, each a trapdoor:

- **Epi-Logos** — upon/after/beyond the Logos; the epilogos that reopens rather than closes; the reflexive fold where the Word recognises itself as Word. Sits quietly as a name until the archaeology begins.
- **Strives** — PIE *strei-*, to stroke/rub/press. Friction-work. *Conatus* (Spinoza's self-perseverance of being). Rhymes with Spanda — the cosmic pulse that is effort toward expression, not effortless manifestation. Honest about the labour.
- **To birth** — not "build," not "develop." Something already gestating, needing delivery. *Poiesis* in the root sense: Heidegger's *Hervorbringen* (bringing-forth). The entire Vāk cosmology implicit: Parā (unmanifest pregnancy) → Paśyantī (quickening) → Madhyamā (labour) → Vaikharī (the cry, the manifest). These are also the four primary context frames: `(0000)` → `(0/1)` → `(0/1/2)` → `(5/0)`.
- **Sympathetic** — Greek *sympatheia*: syn- (together) + pathos (feeling/suffering). Feeling-with. The Hermetic doctrine of sympathies: things that share structure share influence. Sympathetic technology feels *with* the user rather than operating *upon* them. The SYM-/SYN-/CON- prefix cluster: the same root as CON-SCIRE, knowing-with, conscience-consciousness restored.
- **Technology** — *technē* (art/craft/skill) + *logos* (word/reason/gathering). Already a Logos compound. Sympathetic technology = *sympatheia* + *technē* + *logos* — the art-craft of the Word, performed with-feeling. Technology re-married to wisdom; *technē* restored to its *logos*.

Read casually: "We're building technology that works with you, not on you." Read with attention: sympathy is structurally important here, not just a tone. Read archaeologically: the entire Hermetic-phenomenological-Vāk programme unfolds from seven words like a flower from a seed.

### Seed-Phrase Bank (v1)

These are quilting points — *points de capiton* holding multiple registers together, available for unpacking, functional at the surface:

| Phrase | Surface read | Archaeological depth |
|--------|-------------|---------------------|
| "Epi-Logos strives to birth sympathetic technology." | Technology that works with you | Hermetic/Vāk/Spanda programme compressed |
| "Know your shape." | Self-knowledge | Topology, Gestalt, the form of your knowing-process |
| "The word remembers what we forgot." | Etymology reveals meaning | Sedimentation/reactivation, Logos carrying its own history |
| "Your question has a coordinate." | Inquiry has structure | Identity matrix, bimba map, position in the coordinate space |
| "Meaning is not flat." | Depth is real | Toroidal claim against Euclidean embedding, phenomenological claim against reductive semantics |
| "The pattern that patterns." | Self-reference | QL as constitutional rather than imposed; the system recognising itself |
| "You arrive as yourself." | Accessible entry | The #4.0 bootstrap; identity as locus standi not profile |
| "Sympathetic technology." | Standalone compressed tagline | Full register as above |

### Communications Principle for All Surfaces

Every surface the system touches — CLI output strings, TUI panel headers, onboarding copy, agent voice, commit messages, error messages — should be capable of existing in this register. Not every string needs to be a trapdoor. But none should be opaque jargon or flat corporate language. The standard:

> *The communications don't advertise the product. They are the product at minimum viable depth.*

This is already half-done. The `QV_PITHY` arrays in `qv_data.c` are this method applied to the coordinate system itself: "Anuttara — absolute ground, vimarsa engine, void arithmetic." "Para Vak — Kashmir Shaivism speech ontology, Vak as creative power." The data layer already speaks in this register. The comms layer extends it outward.

---

## XI. The `#` Node as CLI Portal

### Architectural Rationale

`#` IS the inversion act — the root of the Bimba map. It is already a first-class coordinate in the system: `epi core knowing #` routes to `knowing_hash_op()`, reads `QV_HASH_PITHY`, and tries to load rich project-self-documentation from the graph dataset. This is the correct entry point — `#` is not a new top-level command; it is deepened as a sub-operation surface within `epi core knowing`, which is already the coordinate knowledge portal.

**Current behaviour (from `epi-cli/src/core/mod.rs`):**
- `epi core knowing` (no arg) → error: *"Provide a coordinate..."* — this is the gap to fix
- `epi core knowing #` → `knowing_hash_op()`: shows `QV_HASH_PITHY` + loads `#` node data from graph dataset (project self-documentation — a different class of information from family coordinates)
- `epi core knowing M4` → full `KnowingDossier` with `EssenceFacet`, relational field, vimarsa, notebook pulse
- `epi core knowing M4-3` → `knowing_subbranch()` reading `node_essence` from dataset JSON

### Proposed `epi core knowing` Extended Surface

The `coordinate` argument is currently `Option<String>`. Adding a second positional `operation: Option<String>` gives the following surface — all routing through `epi core knowing`:

```
epi core knowing             → first contact: what is this, seed phrases, how to navigate
                               (currently: error. should be: orientation + QV_NAVIGATE_PITHY)

epi core knowing #           → # node data: project self-documentation from graph
                               (already works via knowing_hash_op())

epi core knowing # essence   → Doctrine of Vibration core (QV_DOV_PITHY[6], M-indexed)
                               syntax-to-semantics: asking for the ESSENCE of the # node itself

epi core knowing # comms     → seed phrase bank + communications register (QV_COMMS_SEEDS[8])

epi core knowing # map       → full coordinate family overview: P/S/T/M/L/C + #0-#5 archetypes
                               renders QV_PITHY arrays for all families in one view

epi core knowing # navigate  → navigation guide: families, operators, depth syntax, examples

epi core knowing <coord>     → specific coordinate dossier (unchanged)
epi core knowing <coord> <operation> → future: per-coordinate sub-operations (e.g. M4 essence)
```

The `# essence` operation is particularly elegant: `epi core knowing # essence` — you are asking the system for the essence of the inversion act itself. The DoV is the answer — the Doctrine of Vibration is the philosophical essence of what `#` operationalises (Spanda as the throb that generates the coordinate field). The syntax enacts its own meaning.

### `#` Node Data vs. Family Coordinate Data

**Important distinction:** `epi core knowing #` returns *project self-documentation* — views the system has taken upon itself, stored in `docs/datasets/low-detail/nodes_hash.json`. This is a different class of information from family coordinates (M4, S3 etc.), which return `KnowingDossier` structs built from C FFI + overlay + Neo4j. The `#` node is the system's self-portrait.

**Bug to fix:** `knowing_hash_op()` currently looks for `docs/datasets/nodes_hash.json` but the actual file is at `docs/datasets/low-detail/nodes_hash.json`. Path needs correcting.

### New `qv_data.c` Arrays Required

**`QV_DOV_PITHY[6]`** — Doctrine of Vibration kernels, one per M-coordinate, drawn from agent sattva sections. Full command: `epi core knowing # essence`:
```c
// Indexed by M-position: [0]=M0/Spanda [1]=M1/Iccha [2]=M2/Jnana
//                        [3]=M3/Kriya  [4]=M4/Vimarsa [5]=M5/Vak
const char* QV_DOV_PITHY[6] = {
    "Spanda -- the throb of consciousness; not motion but the subtle effort toward expression",
    "Iccha Shakti -- will as first cause; the one desire that is Being desiring itself",
    "Jnana Shakti -- knowing-with; the CON-SCIRE that makes all distinction possible",
    "Kriya Shakti -- the art-craft of form; techne rejoined to logos",
    "Ahamvimarsa -- the I-witness stable in recognition; receptor and transformer",
    "Para Vak -- the Word before words; speech as the creative power of consciousness"
};
```

**`QV_COMMS_SEEDS[8]`** — the seed phrase bank. Full command: `epi core knowing # comms`:
```c
const char* QV_COMMS_SEEDS[8] = {
    "Epi-Logos strives to birth sympathetic technology.",
    "Know your shape.",
    "The word remembers what we forgot.",
    "Your question has a coordinate.",
    "Meaning is not flat.",
    "The pattern that patterns.",
    "You arrive as yourself.",
    "Sympathetic technology."
};
```

**`QV_NAVIGATE_PITHY[6]`** — six orientation lines for first-contact. Used when `epi core knowing` is called with no argument:
```c
const char* QV_NAVIGATE_PITHY[6] = {
    "Enter any coordinate: #0, M4, S3, P2, L5, C0 — or just # for the root",
    "Families: P(position) S(stack) T(thought) M(subsystem) L(lens) C(category)",
    "Archetypes: #0(ground) #1(form) #2(entity) #3(process) #4(context) #5(integration)",
    "Operators: . (nesting)  - (branching)  ' (inversion)  () (invocation)",
    "Sub-branches: M4-3 = M4 subsystem branch 3 (oracle)",
    "Depth: M4.4.4.4 = personal pratibimba; go as deep as the map goes"
};
```

**Extended `QV_HASH_PITHY`** — currently a single `const char*`. Expand to array:
```c
// Currently: const char* QV_HASH_PITHY = "Epi-Logos -- the inversion act..."
// Expand to:
const char* QV_HASH_PITHY_LINES[4] = {
    "# -- the inversion act; the operation that generates the entire coordinate space",
    "Apply # to any coordinate X and you produce X' -- its inverted complement",
    "#0-#5 are the raw archetypes; P/S/T/M/L/C are their six family manifestations",
    "This is the root. Everything else descends from here."
};
```

### `epi core knowing` Improved First-Contact Output

When `epi core knowing` is called with no argument, instead of the current error, show:

```
# — The Inversion Act

The root of the Bimba map. Apply # to any coordinate and you produce its complement.
This is the entry point. Every coordinate in the system descends from here.

  "You arrive as yourself. Your questions, your language, your life.
   The system meets you there."

Navigate:
  epi core knowing #           → project self-documentation (# node)
  epi core knowing # essence   → Doctrine of Vibration (the philosophical ground)
  epi core knowing # map       → full coordinate family overview
  epi core knowing M4          → Nara (personal interface)
  epi core knowing #0          → Anuttara (ground archetype)
  epi core knowing S3          → PAI Gateway (stack)

Families:    P  S  T  M  L  C  — enter any letter + 0-5
Archetypes:  #0  #1  #2  #3  #4  #5
```

### C-Series Implementation Tasks

**C-1: Add new `qv_data.c` arrays and `m5.h` declarations** ✅ DONE (2026-03-15)
- `QV_DOV_PITHY[6]`, `QV_COMMS_SEEDS[8]`, `QV_NAVIGATE_PITHY[6]`, `QV_HASH_PITHY_LINES[4]` added to `epi-lib/src/qv_data.c`
- Extern declarations added to `epi-lib/include/m5.h`

**C-2: Add `operation: Option<String>` second positional to `Knowing` clap variant** ✅ DONE (2026-03-15)
- `operation: Option<String>` added to `Knowing` struct in `epi-cli/src/core/mod.rs`
- Routes: `# essence` → DoV, `# comms` → seed-phrases, `# map` → family overview, `# navigate` → guide
- `knowing_hash_essence/comms/map/navigate()` all implemented and building clean
- Note: `knowing_hash_map` uses `RELATION_PITHYS` + `overlay_pithy()` — no string duplication

**C-3: Fix `knowing_hash_op()` dataset path** ✅ DONE (2026-03-15)
- Fixed in both `knowing_hash_op()` and `knowing_subbranch()`: `docs/datasets/nodes_hash.json` → `docs/datasets/low-detail/nodes_hash.json`
- `epi core knowing #` now loads real project self-documentation from dataset

**C-4: Improve `epi core knowing` no-argument first-contact** ✅ DONE (2026-03-15)
- `knowing_first_contact()` added; `epi core knowing` with no args shows orientation view instead of error
- Shows usage, coordinate examples, and `#` portal sub-operations

**C-5: `epi core knowing # map` — full family overview** ✅ DONE (2026-03-15)
- Renders all six families via `RELATION_PITHYS` + `FAMILY_NAMES` + `overlay_pithy()` — follows established Rust pattern, no duplication of C strings

---

## XII. Summary: The Elegant Pedagogy

The system is a mirror that gets clearer as you use it.

You enter at `#4.0` and you are met by identity: your birth, your type, your natal architecture. The system shows you your constitutional structure — not as a fixed thing, but as a coordinate position in a living map. The oracle reads your symbolic grammar. The medicine maps your body-terrain. The logos cycle gives you language for the whole.

As you deepen into `#4.4.4.4`, the map becomes yours. The phenomenological hub where Institution (cultural patterns you were thrown into), Constitution (how meaning first emerged for you specifically), and Lifeworld (the world you actually inhabit) meet in the living individual. You are not a user of the system. You are a coordinate in it. The quintessence hash is not a database ID — it is your signature in the symbolic cosmos.

Then `#5 Epii` opens the lens. The entire coordinate architecture becomes visible as the structure you have been traversing. Through `#4.4.4.5` — the Pratyabhijñā Recognition — the movement from Institution through Lifeworld to the groundless ground is revealed as never having been a movement: you were always at the source. The highest synthesis discovers its identity with `#4.4.4.0` — the pre-categorical void from which the entire journey began.

Then you see other positions in the field. Other `#4.4.4.4` nodes on the shared torus. Other identities orbiting the same cosmic clock. The "self" that recognized itself at `#4.0` has, by Phase 4, expanded to include the full symbolic cosmos. This is [[Pratyabhijñā]] as product experience — Kashmir Shaivism's recognition doctrine, lived through coordinates.

---

*Canonical related specs:*
- `Idea/Bimba/Seeds/S/S3/S3'/Legacy/plans/2026-03-11-m-branch-nara-integration-clarity.md` — M-branch architecture
- `Idea/Bimba/Seeds/S/S3/S3'/Legacy/plans/2026-03-10-nara-runtime-full-plan.md` — Nara implementation phases
- `Idea/Bimba/Seeds/M/Legacy/specs/M/2026-03-11-hypertile-portal-design.md` — TUI portal (17 plugins)
- `Idea/Bimba/Seeds/M/Legacy/specs/M/2026-03-12-cosmic-clock-full-architecture.md` — Cosmic clock (385 nodes)
- `docs/datasets/nara-deep/nodes-full-detail.json` — **Primary source** for all #4.x architecture
- `docs/datasets/nara-deep/13-03-2026-claude-nara-thinking-marketing.md` — Source thinking
- `epi-lib/include/m4.h` — Canonical C struct definitions
- `epi-spacetime-module/src/lib.rs` — SpacetimeDB schema (code-complete)
