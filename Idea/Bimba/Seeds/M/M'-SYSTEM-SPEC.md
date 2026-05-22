---
coordinate: "M'"
status: "active-system-spec"
updated: "2026-05-19"
depends_on:
  - "[[M-SYSTEM-INDEX]]"
  - "[[M'-PORTAL-SPEC]]"
  - "[[M'-TAURI-PORT-SPEC]]"
  - "[[S-AD-HOC-ROADMAP]]"
  - "[[S-SHARDING-TASK-LIST]]"
  - "[[2026-05-18-bimba-pointer-web-and-integration-spec]]"
  - "[[2026-05-19-kernel-mprime-harmonic-clock-integration-plan]]"
  - "[[mprime-domain-specs]]"
  - "[[mprime-tauri-gap-table]]"
---

# [[M']] System Spec

[[M']] is the [[Pratibimba]] expression of the [[M]] / [[Bimba]] map. Speak of it as the living experiential, visual, sonic, and operational face of the coordinate system. It is not a separate app family and not a UI layer floating above the stack. It is the way the system becomes present to user, agent, developer, journal, clock, map, and musical instrument.

The short formula:

```text
M  = Bimba map / canonical coordinate image
M' = Pratibimba surface / lived-reflected operation of that image
```

The S layers provide bodies and protocols. M' arranges their appearance and use.

## Domain Language

Use the six M' domains consistently:

| Coordinate | Name | Primary surface | S-layer substrate |
|------------|------|-----------------|-------------------|
| [[M0']] | Bimba map field | structural graph/map explorer | [[S2]] Neo4j, pointer web, source traceability |
| [[M1']] | relational movement | coordinate walks, torus/path traversal | [[S2']] graph law, retrieval, relation metadata |
| [[M2']] | harmonic/correspondential matrix | MEF, music, semantic, astrological, symbolic matrices | [[S0]] kernel, [[S2]] pointer profile, [[S3']] Kairos |
| [[M3']] | clock/cosmos platform | DAY/NOW, solar/kairos clock, sonic/cymatic timing | [[S0]] harmonic pulse, [[S3']] temporal projection |
| [[M4']] | Nara | journal, daily note, dream, oracle, personal Pratibimba | [[S3']] session/DAY/NOW, [[S5]] Nara/Gnosis, protected local graph |
| [[M5']] | Epii | pedagogy, archaeology, review, autoresearch, agentic execution | [[S4]] PI agents, [[S5']] review/autoresearch, [[S1']] compiler |

### Shell vs Subsystem Architecture

The app has **two distinct page layers** plus a cross-cutting command membrane:

| Layer | Pages | Design principle | Scope |
|-------|-------|------------------|-------|
| **Parent shell surfaces (0/1)** | Home (split view), Cosmic, Personal | Lean, immediately usable, daily-driver UX | Minimal M' parent surface — the two-faced daily instrument that previews the deepest resonant outputs without becoming the six subsystems |
| **Subsystem pages (M0-M5)** | Six full-page deep workspaces | Maximum scope, unique depth modules, inner 0-5 strata per domain | The full M' instrument — each domain at its own scale and depth |
| **OmniPanel (/)** | ESC-toggled overlay | Agent, settings, config, readiness, navigation | S0' command membrane — cross-cutting, accessible from every layer |

**Shell 0 (Cosmic):** Live clock/Hopf fibration, temporal field, structural orientation. This is the parent-level operational preview of the **1-2-3 structural systems**: [[M1']] relational movement, [[M2']] harmonic/correspondential matrix, and [[M3']] clock/cosmos platform integrated as one cymatic harmonic clock surface. It surfaces tick state, harmonic phase, selected coordinate, Kairos context, and the current structural resonance without being any one of those deep subsystems. It should remain lean enough to be the "open the app, see the state of things" surface.

**Shell 1 (Personal):** Flow editor, identity sidebar, journal entry, Epii/pedagogy access, and the Bimba data structures relevant to the user's current return-to-ground. This is the parent-level operational preview of the **4/5/0 return systems**: [[M4']] Nara, [[M5']] Epii, and the [[M0']] Bimba-map ground insofar as it is needed by journal, pedagogy, review, and identity continuity. It surfaces write/reflect/review/learn as one lived face without becoming the full Nara dashboard, the full Epii IDE, or the full Bimba map explorer. Click-anywhere-to-write remains the fastest path from thought to record.

**Home** defaults to the 0/1 split view. A toggle switches to the subsystems grid (M0-M5 entry points). Both views coexist; neither replaces the other.

**Subsystem pages** are reached from the Home grid, OmniPanel navigation, or keyboard shortcuts. Each is a full-page experience with room for inner strata, deep tooling, and domain-specific depth that would overwhelm the lean shell. M0' is the full Bimba map explorer. M3' is the full clock cosmos with DNA/I-Ching transcription and cymatic rendering. M4' is the full Nara dashboard with Journal, Daily Note, Dream Journal, Oracle, and highlight management. These expand what the shell previews.

The shorthand remains:

```text
0 = cosmic shell          -> lean parent preview of integrated M1'-M3' structural/cymatic clock outputs
/ = command membrane       -> S0' over S0-S5, OmniPanel / command centre
1 = personal shell         -> lean parent preview of M4'/M5'/M0' return: journal, pedagogy, review, relevant Bimba data
M0-M5 = subsystem pages   -> full-depth domain workspaces with inner 0-5 strata
```

Do not collapse these layers. Shell 0 is not M1', M2', or M3'; it is their integrated parent-level cymatic clock preview. Shell 1 is not M4', M5', or M0'; it is their integrated parent-level lived-return preview. The subsystem pages M0'-M5' are the 4+2 body where depth lives. The OmniPanel is where agent, config, readiness, and operator concerns cross-cut everything.

### The Shell 0/1 Split IS the (0/1) Inversionary Parent

The 0/1 of the shell layer is not a layout convention. It is the matheme's own primary differentiation — the same (0/1) that the C code carries as the raw `#` inversion-act and that `S0-HARMONIC-POINTER-WEB36-SPEC` identifies as `Psychoid_Hash` / the kernel's inversion operator — enacted at the UI architecture level.

```text
#        (raw inversion act, the engine itself)
|
v
(0/1)    -- non-dual ground, two poles fused (SPANDA_SEED_BITS = 0x03)
|
v
0     /     1   -- Shell 0, OmniPanel command return, Shell 1
|           |
v           v
M1' M2' M3'   M4' M5' (+ M0' ground-data as needed)
 structural       lived-return
 cymatic clock     journal / pedagogy / review

M0' M1' M2' M3' M4' M5'
        -- the 4+2 subsystem layer opened from the parent 0/1 surface
```

This means:

- **Shell 0 (Cosmic)** is the **0-face of the matheme** — the structural-Prakāśa side: the integrated M1'-M3' cymatic clock, kernel tick, harmonic profile, Hopf/clock rendering, and selected-coordinate structural orientation. The bimba face. The "what the matheme is doing" side made operational at the daily-driver layer.
- **Shell 1 (Personal)** is the **1-face of the matheme** — the lived-Vimarśa side: journal, Nara continuity, Epii pedagogy/review access, and the Bimba data structures relevant to the current lived return. The pratibimba face. The "how the matheme is being lived, learned, and returned into work" side.
- **Subsystem pages M0-M5** are the **4+2 explicate development** of the (0/1) — the six positions of the matheme made into full-depth workspaces. They are not "below" the shells and not duplicates of the shells; they are the deeper traversal that the parent 0/1 surface opens.
- **OmniPanel `/`** is the S0' command membrane that lives transverse to everything, the operator's access to the (0/1) ground from any position.

The same single `Inversion_Operator` that lives at `Coordinate->invert` in the C code's pointer web is what the Shell 0 ↔ Shell 1 toggle invokes at the user-surface level. Toggling between the cosmic and personal shells IS `#` applied to the user's current context. Opening a subsystem page from a shell IS the `.` nesting operator (the lemniscate at #4) firing the deeper context-frame into execution.

This is load-bearing for the Tauri implementation:

1. The Shell 0 / Shell 1 split must be a true matheme-toggle — same coordinate state held from two conjugate faces — not two unrelated home screens. State carried across the toggle: same active coordinate, same tick, same `MathemeHarmonicProfile`; what changes is which face of that state is foregrounded.
2. The subsystem pages must be reachable from either shell with full state-continuity — the user's current `(lens, mode)`, selected coordinate, and tick context follow them into the deep workspace.
3. The OmniPanel must always be able to show the current (0/1) state — which shell-face is active, which subsystem (if any) is open, which agent invocations are in flight — because it is the S0' command surface over the entire (0/1) inversionary field.

If the Tauri app does not feel like Shell 0 and Shell 1 are *the same state seen from opposite faces*, the (0/1) wiring is broken and the UI has reverted to two-screens-side-by-side. The toggle is the spanda-pulse at the user-experience scale; it must carry the matheme's structural identity.

## Domain Spec Set

The build-facing domain contracts are now split into six spec files:

| Domain | Spec |
|--------|------|
| [[M0']] | [[M0'-SPEC]] |
| [[M1']] | [[M1'-SPEC]] |
| [[M2']] | [[M2'-SPEC]] |
| [[M3']] | [[M3'-SPEC]] |
| [[M4']] | [[M4'-SPEC]] |
| [[M5']] | [[M5'-SPEC]] |

These files are the domain-level authority for user-facing surface, consumed backend contract, required `MathemeHarmonicProfile` fields, privacy boundary, readiness/test criteria, and visual/audio interaction model. [[M'-TAURI-PORT-SPEC]] remains the desktop integration authority across those domains.

[[mprime-tauri-gap-table]] provides the current-state assessment of `Body/M/epi-tauri` against these specs and the harmonic clock integration plan. The primary bottleneck is kernel profile enrichment (tranches 1-4 from [[2026-05-19-kernel-mprime-harmonic-clock-integration-plan]]) — the renderer type foundation and service client layer are substantially complete.

## Musical Instrument Ramification

The musical instrument is the key M' unifier. It gives the same matheme as sound, rhythm, visual pulse, graph traversal, and lived timing.

### Audio-Genesis Lives at S0 / Kernel, Not at M1'

The matheme's audio-genesis MATHEMATICS lives in `S0` / `portal-core` via the shared `MathemeHarmonicProfile`. M' surfaces are *renderers* over that profile, not parallel audio engines. There is one audio-genesis authority for the entire stack:

- **S0 / `portal-core`** computes the harmonic profile per tick: pitch class, ratio role, X/X' partner, mirror partner, square span, 8+4 sounded/nodal rendering role, diatonic CF/VAK projection, 72-fold resonance, elemental projection, planetary-chakral projection, Mahāmāyā address law. This is where the **8 explicate-sung frequencies** and **4 implicate-nodal boundary-parameters** are produced.
- **M1'** consumes the profile and renders it as **graph-traversal-as-melody** — the walked coordinate becomes the sounded note, the relation traversed becomes the interval, the path becomes the phrase. It is the *primary techne renderer* of the audio stream, not its generator.
- **M2'** consumes the same profile and renders it as **harmonic-correspondential cymatic surface** — the 8 sounded frequencies drive antinodal Chladni motion; the 4 nodal parameters constrain the standing-wave (m, n) modes.
- **M3'** consumes the same profile and renders it as **clock-pulse and codon-rotation timing** — the tick becomes the visible clock; the 8+4 partition organises sounded/nodal display on the codon-tarot wheel.

The 8+4 bus is therefore named at the kernel layer: `profile.audio_octet[8]` and `profile.nodal_quartet[4]` are profile fields, not M1'-private API. Every M' surface that needs them reads them from the shared profile.

Computational chain:

```text
Kernel tick (S0 Paramaśiva substrate)
  -> MathemeHarmonicProfile (the shared contract)
       carries: tick, harmonic, diatonic, 8+4 audio_octet/nodal_quartet,
                resonance72, elements, planetaryChakral, mahamaya,
                pointerAnchor, depositionAnchor
  -> Pointer-web coordinate topology (S2)
  -> Temporal projection (S3)
  -> M' rendering (M0' map, M1' walk-as-melody, M2' cymatic, M3' clock, M4' journal, M5' review)
```

More explicitly:

```text
n -> cycle/sub_tick -> bimba/pratibimba helix -> QL position
  -> pitch class / ratio / square / element / lens anchor
  -> 8 audio-octet frequencies + 4 nodal-quartet boundary params
  -> graph relation and resonance index
  -> clock, map, sound, cymatic field, journal context, agent orientation
```

M' domains consume this chain differently — but none of them generate the audio mathematics themselves:

| M' domain | Musical/harmonic expression | Profile fields consumed |
|-----------|-----------------------------|-------------------------|
| [[M0']] | coordinates become nodes in the playable map; selected node exposes harmonic profile and pointer web | full profile, pointerAnchor |
| [[M1']] | graph traversal becomes melodic/topological movement across relations; primary audio renderer | audio_octet, harmonic, diatonic, pointerAnchor |
| [[M2']] | MEF/correspondence matrix exposes lens anchors, elements, modes, scales, semantic resonance; cymatic surface | audio_octet (antinodes), nodal_quartet (boundaries), resonance72, elements |
| [[M3']] | clock renders epogdoon tick, helix phase, Kairos, solar/cosmic timing, sonic/cymatic pulse, codon-tarot wheel | tick, mahamaya, planetaryChakral, audio_octet (timing), nodal_quartet (display) |
| [[M4']] | Nara journal and modalities inherit DAY/NOW harmonic context and can be played back as lived trajectory | tick, harmonic, diatonic, depositionAnchor |
| [[M5']] | Epii reviews, teaches, researches, and improves the system from harmonic/profile evidence | full profile as review evidence |

The instrument is therefore not a later feature. It is the proof that kernel, graph, temporal context, agent work, and user experience are one system. **And the proof works because there is one audio-genesis source — the kernel profile — that all M' surfaces share.**

## Minimum Live Loop

The mature M' surface should be able to show one complete live loop across the whole system:

```text
quintessence_hash
  -> quintessence_quaternion
  -> live_quaternion
  -> tick12 / 720-degree address
  -> oracle / cast / kernel projection
  -> shared clock and temporal surface
  -> S2 graph + Graphiti deposit
  -> renewed coordinate ground
```

Each M' domain participates without owning the whole loop:

| Domain | Minimum live-loop role |
|--------|------------------------|
| [[M0']] | selected coordinate, canonical graph node, source/spec/code/test anchors |
| [[M1']] | relation walk, torus/path movement, pointer-web reachability |
| [[M2']] | harmonic matrix, MEF resonance, mode/CF, binary/codon correspondence |
| [[M3']] | [[Paramaśiva]] tick and [[Mahāmāyā]] symbolic clock/codon/transcription surface |
| [[M4']] | [[Nara]] identity, journal, oracle/cast, DAY/NOW lived context |
| [[M5']] | [[Epii]] / [[Anuttara]] review, energy/evidence, recognition and promotion gates |

This is the minimum evolutionary basis for the interface: M' must let the user and agents see what coordinate is active, what tick/mode/binary state it occupies, what graph relations it can traverse, what session/journal context is live, what evidence has been deposited, and what remains review-pending.

### Diatonic CF / VAK Projection

The diatonic scale is the musical face of the VAK context-frame grammar. It should be named as a projection, not confused with the full 12-note chromatic substrate.

For Lens 0:

| Degree | Note | CF | Function | M' implication |
|--------|------|----|----------|----------------|
| 1 | C | `(00/00)` | Nous / Para Vak | ground, tonic, pre-articulate coordinate field |
| 2 | D | `(0/1)` | Logos / nomos | first articulation, law, definitional routing |
| 3 | E | `(0/1/2)` | Eros / chreia | operative exchange, desire/circulation, task motion |
| 4 | F | `(0/1/2/3)` | Mythos / Pashyanti | tetradic closure, pattern, strange attractor |
| 5 | G | `(4.0/1-4.4/5)` | Anima/Psyche / oikonomia | perfect-fifth executive crossing, dispatch, fractal nesting |
| 6 | A | `(4.5/0)` | Psyche bridge / partial Aletheia | bridge stewardship, session continuity, evaluative crossing |
| 7 | B | `(5/0)` | Sophia / Spanda-Shakti | leading-tone synthesis, return pressure, integration |
| 8 | C' | `(00/00)` enriched | Nous / Para Vak | octave return, renewed ground |

This gives [[M2']] and [[M3']] the harmonic grammar for mode, scale, rhythm, clock, and cymatic display, while giving [[M5']] the VAK/agent language for execution. Modal rotation means a different CF becomes the tonal centre: Ionian grounds in Nous, Dorian in Logos, Phrygian in Eros, Lydian in Mythos, Mixolydian in the Anima/Psyche executive, Aeolian in the Psyche bridge, and Locrian in Sophia's return pressure.

The portal should never treat this as decorative labelling. When a coordinate is rendered musically or routed agentically, the current mode/CF should be visible as part of the same harmonic profile that carries helix, position, ratio, square, resonance, and element.

## Required Shared Profile

M' must consume a shared `MathemeHarmonicProfile` rather than inferring from unrelated fields. The profile should expose:

- coordinate and QL position;
- bimba/pratibimba helix identity;
- pitch-class pair and lens-anchor;
- X/X' semitone spanda pair;
- X+Y=5 mirror relation and Klein square;
- interval role: semitone, epogdoon, tritone, 16/9 totality, octave;
- ratio role: `1/1`, `9/8`, `4/3`, `3/2`, `16/9`, `2/1`;
- 72-fold resonance index mapping;
- 8+4 sounded/nodal rendering role, exposed as two concrete kernel arrays:
  - `audio_octet[8]`: the eight explicate-sung frequencies (inner-tetrachord positions 1,2,3,4 of bimba + 1',2',3',4' of pratibimba) — the audio bus that M1' renders as walk-melody and M2' uses as cymatic antinodal drivers
  - `nodal_quartet[4]`: the four implicate-nodal boundary parameters (positions 0,5 of bimba + 0',5' of pratibimba) — integer (m, n) Chladni mode-constraints that M2' uses as standing-wave boundaries
- P-position element and L2' element-bearing value;
- diatonic context-frame projection: degree, mode, mode-anchor CF, VAK register, and agent/function label;
- Mahāmāyā / binary DNA projection: 64 hexagram/codon address, 384 line-change operator address, symbolic transcription state, and M3 codec provenance where applicable;
- Paramasiva tick projection: `tick12`, 720-degree address, cycle/sub-tick, safe clock state handle, and oracle/cast payload handle where applicable;
- source anchors into S0 kernel, S2 pointer web, qvdata, and graph node.

This profile is the bridge between planned system vision and actual code implementation. It should be visible in specs, graph nodes, qvdata, semantic documents, gateway responses, portal readiness, and Tauri render clients.

Implementation foothold, 2026-05-19: `portal-core::KernelTemporalProjection` now serializes a public-current `harmonicProfile` with `tick12`, `degree720`, `degree360`, `su2Layer`, helix, ratio role, chromatic note, X/X' partner, X+Y=5 mirror, square, optional Lens-0 diatonic CF/VAK context, 72-fold resonance address, elemental projection, initial planetary-chakral projection, and an M3/Mahāmāyā address-law projection. `Body/M/epi-tauri/src/services/kernelProjection.ts` consumes the same shape for renderer readiness. The remaining work is to enrich this profile with coordinate-specific S2 pointer relation metadata, S3 deposition anchors, and dataset-backed Tarot/amino/correspondence LUT provenance where the address law currently reports `pending-dataset-lut`.

## Harmonic Clock Integration Plan

Planning foothold, 2026-05-19: [[2026-05-19-kernel-mprime-harmonic-clock-integration-plan]] is the current execution map for turning this spec into the minimum integrated kernel/M' basis.

It makes four corrections explicit:

1. [[Paramaśiva]]'s tick is the harmonic clock for the whole stack, not a display timer.
2. [[Parāśakti]]/[[M2]] is the 72-fold vibrational field where MEF, elements, planetary-chakral correspondences, modes, and scales are read from the same tick profile.
3. [[Mahāmāyā]]/[[M3]] is the binary symbolic transcription engine: DNA codons, I-Ching hexagrams, 384 line-change operators, Tarot compression, T/U phase, and M2->M3 epogdoon compression.
4. [[M']] is the instrument surface that renders the shared profile; it must not create a private clock, private codon mapping, or private planetary/musical correspondence table.

The intended computational chain is:

```text
absolute tick n
  -> tick12 / degree720 / SU(2) layer
  -> bimba-pratibimba harmonic state
  -> M2 72-fold vibration / MEF / solar-chakral correspondence
  -> M3 64-fold DNA-I-Ching-Tarot transcription
  -> S2 pointer-web coordinate law
  -> S3 DAY/NOW and Graphiti deposition
  -> M' lived instrument surface
```

The planetary-chakral-musical correspondences are part of [[M2']] and [[M3']] rendering. They should be stored and refreshed through S2 graph law and consumed through `MathemeHarmonicProfile`, with exact tradition-sensitive mappings treated as canonical data rather than renderer constants.

The next runtime tranche should therefore proceed in this order:

1. Enrich `MathemeHarmonicProfile` in S0/S0' with the full tick, harmonic, diatonic, 72-fold, elemental, planetary-chakral, and M3 symbolic address fields.
2. Add the M3 codec foothold as real integer address law with honest `pending-dataset-lut` state for unmaterialized LUTs.
3. Make S2 the pointer/harmonic law of record for coordinate relations and configurable correspondences.
4. Wire S3 Graphiti/Nara-clock deposition around the shared profile.
5. Let M' Tauri consume the contract as the live instrument surface.

## Development Memory Protocol

M' development should be live with graph and episodic memory as soon as the substrate is stable enough.

Before a development run:

1. Resolve the active coordinate(s) through `epi core knowing` and S2 coordinate resolution.
2. Read the relevant seed/spec nodes and source traceability.
3. Query S2 graph for current canonical node state and pointer-web profile.
4. Query Graphiti session memory for recent implementation episodes, decisions, tests, and unresolved review items.

During the run:

1. Keep code changes in Body-owned homes and spec changes in Idea-owned homes.
2. Update seed/spec files only when the coordinate vision or implementation law changes.
3. Use real tests as the authority for implementation claims.
4. Deposit high-signal session events to Graphiti with DAY/NOW, session key, coordinate, files touched, tests run, and next action.

After the run:

1. Refresh or plan refresh of affected S2 pointer/graph nodes.
2. Deposit a Graphiti episode summarising the work and verification.
3. Create Epii review inbox items for meaning-changing, identity-affecting, or promotion-relevant conclusions.
4. Update roadmap/task status only when tests or explicit spec changes justify it.

This protocol makes the system aware of both planned/spec vision and actual implementation state without pretending that either one alone is the truth.

## Neo4j / Graphiti Boundary

Use Neo4j for canonical coordinate topology and implementation-aware graph facts:

- `:Bimba` canonical coordinate nodes;
- compatibility with legacy `:BimbaCoordinate` / `bimbaCoordinate`;
- typed pointer relations and harmonic relation metadata;
- source/spec/code/test anchors where they become canonical;
- protected local Personal Pratibimba facts only inside the local protected boundary.

Use Graphiti for episodic development and journal memory:

- dev sessions, decisions, failures, tests, and handoffs;
- Nara journal episodes and modality-linked reflections;
- agent deposits from Anima/Aletheia to Epii;
- session summaries and autoresearch evidence.

Graphiti episodes may point to Neo4j coordinates; they do not replace canonical Bimba topology. Neo4j nodes may record Graphiti namespace/episode handles; they do not absorb private journal content into public graph projection.

## Minimum Evolutionary Basis

The minimum integral bootstrapping basis is reached when:

- every active coordinate can expose planned seed/spec intent;
- every implemented coordinate can expose code/test anchors;
- pointer web and harmonic profile are computable and refreshable;
- DAY/NOW/session context is live through S3';
- Graphiti can record development and journal episodes under protected-local namespace rules;
- Epii can review and promote changes through human-gated S5'/S1' law;
- M' surfaces can show the difference between planned, implemented, tested, live, and review-pending states.

At that point the system can begin evolving itself coherently: not by magic automation, but by keeping its map, code, memory, review, and musical clock in one inspectable loop.
