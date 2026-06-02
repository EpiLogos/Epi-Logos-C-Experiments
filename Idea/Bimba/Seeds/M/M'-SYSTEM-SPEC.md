---
coordinate: "M'"
status: "active-system-spec"
updated: "2026-05-31"
depends_on:
  - "[[M-SYSTEM-INDEX]]"
  - "[[M'-PORTAL-SPEC]]"
  - "[[M'-TAURI-PORT-SPEC]]"
  - "[[M0'-SPEC]]"
  - "[[M1'-SPEC]]"
  - "[[M2'-SPEC]]"
  - "[[M3'-SPEC]]"
  - "[[M4'-SPEC]]"
  - "[[M5'-SPEC]]"
  - "[[S0-HARMONIC-POINTER-WEB36-SPEC]]"
  - "[[S-AD-HOC-ROADMAP]]"
  - "[[S-SHARDING-TASK-LIST]]"
  - "[[2026-05-18-bimba-pointer-web-and-integration-spec]]"
  - "[[2026-05-19-kernel-mprime-harmonic-clock-integration-plan]]"
  - "[[2026-04-04-graphiti-unified-temporal-context-service]]"
  - "[[2026-05-31-theia-ide-shell-and-m-plugin-architecture]]"
  - "[[mprime-domain-specs]]"
  - "[[mprime-tauri-gap-table]]"
  - "[[alpha_quaternionic_integration_across_M_stack]]"
  - "[[m4-prime-psychoid-cymatic-field-engine]]"
  - "[[m4-prime-nara-day-episodes-and-oracle-artifacts]]"
  - "[[m5-prime-system-shape-and-tauri-ide-canon]]"
---

# [[M']] System Spec

[[M']] is the [[Pratibimba]] expression of the [[M]] / [[Bimba]] map. Speak of it as the living experiential, visual, sonic, and operational face of the coordinate system. It is not a separate app family and not a UI layer floating above the stack. It is the way the system becomes present to user, agent, developer, journal, clock, map, and musical instrument.

The short formula:

```text
M  = Bimba map / canonical coordinate image
M' = Pratibimba surface / lived-reflected operation of that image
```

This boundary is operationally strict: [[M]] remains the canonical [[Bimba]] coordinate data and branch topology; [[M']] specs define how that topology is reflected into lived surfaces, renderer contracts, agents, tests, and protected personal contexts. Updating M' must therefore respect and leverage deeper M branching (`M4-0-*`, `M4-4-4-4`, [[M0]]..[[M5]], and legacy `#` projections) without turning those reflections into a parallel coordinate system.

The [[S]] layers provide bodies and protocols. M' arranges their appearance and use.

The current cross-system diagram pack is [[ARCHITECTURE-DIAGRAM-PACK]]. Use it as the architecture bridge before any implementation-plan or M-dev pass that touches [[M']], [[S/S']], [[/pratibimba/system]], the six M extensions, integrated plugins, or [[M5-4]] mediation. The pack preserves the critical invariant that [[M]] is the ontological [[Bimba]] map and [[M']] is coded [[Pratibimba]] expression, while [[S0]] remains a command membrane over coordinate-owned modules.

## Canonical Code Navigation

The M' corpus should function as navigation into the substrate it describes, not as a layer that requires separate audit reports to rediscover the code. Read each prime-domain spec with its canonical anchors one click away:

| Surface | Primary spec | Canonical code anchors |
|---|---|---|
| [[M0']] | [[M0'-SPEC]] | [[Body/S/S0/epi-lib/include/m0.h]], [[Body/S/S0/epi-lib/src/m0.c]], [[Body/S/S0/portal-core/src/kernel.rs]] |
| [[M1']] | [[M1'-SPEC]] | [[Body/S/S0/epi-lib/include/m1.h]], [[Body/S/S0/epi-lib/src/m1.c]], [[Body/S/S0/portal-core/src/state.rs]], [[Body/S/S0/portal-core/src/events.rs]], [[Body/S/S0/portal-core/src/harmonic_profile.rs]] |
| [[M2']] | [[M2'-SPEC]] | [[Body/S/S0/epi-lib/include/m2.h]], [[Body/S/S0/epi-lib/src/m2.c]], [[Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs]] |
| [[M3']] | [[M3'-SPEC]] | [[Body/S/S0/epi-lib/include/m3.h]], [[Body/S/S0/epi-lib/src/m3.c]], [[Body/S/S0/epi-lib/src/m3_clock_lut.c]], [[Body/S/S0/portal-core/src/codon_rotation_projection.rs]], [[Body/S/S0/portal-core/src/mahamaya.rs]] |
| [[M4']] | [[M4'-SPEC]] | [[Body/S/S0/epi-lib/include/m4.h]], [[Body/S/S0/epi-lib/src/m4.c]], [[Body/S/S0/portal-core/src/nara_journal.rs]], [[Body/S/S0/portal-core/src/personal_identity.rs]] |
| [[M5']] | [[M5'-SPEC]] | [[Body/S/S0/epi-lib/include/m5.h]], [[Body/S/S0/epi-lib/src/m5.c]], [[Body/S/S5/epi-gnostic/epi_gnostic/cli.py]], [[Body/S/S5/epi-kbase/src/index.ts]], [[Body/S/S5/epi-kbase-core/src/lib.rs]], [[Body/S/S5/epii-autoresearch-core/src/lib.rs]], [[Body/S/S5/epii-review-core/src/lib.rs]], [[Body/S/S5/epii-agent-core/src/lib.rs]] |

## Domain Language

Use the six M' domains consistently:

| Coordinate | Name | Primary surface | S-layer substrate |
|------------|------|-----------------|-------------------|
| [[M0']] | [[Bimba]] map field | structural graph/map explorer | [[S2]] [[Neo4j]], [[pointer web]], source traceability |
| [[M1']] | relational movement | coordinate walks, [[torus]]/path traversal | [[S2']] graph law, retrieval, relation metadata |
| [[M2']] | harmonic/correspondential matrix | [[MEF]], music, semantic, astrological, symbolic matrices | [[S0]] kernel, [[S2]] pointer profile, [[S3']] [[Kairos]] |
| [[M3']] | clock/cosmos platform | DAY/NOW, solar/kairos clock, sonic/cymatic timing | [[S0]] harmonic pulse, [[S3']] temporal projection |
| [[M4']] | Nara | journal, daily note, dream, oracle, personal Pratibimba | [[S3']] session/DAY/NOW, [[S5]] Nara/Gnosis, protected local graph |
| [[M5']] | Epii | pedagogy, archaeology, review, autoresearch, agentic execution | [[S4]] PI agents, [[S5']] review/autoresearch, [[S1']] compiler |

### Shell vs Subsystem Architecture

The app has **two distinct page layers** plus a cross-cutting command membrane:

| Layer | Pages | Design principle | Scope |
|-------|-------|------------------|-------|
| **Parent shell surfaces (0/1)** | Home (split view), Cosmic, Personal | Lean, immediately usable, daily-driver UX | Minimal M' parent surface — the two-faced daily instrument that previews the deepest resonant outputs without becoming the six subsystems |
| **Subsystem pages ([[M0]]-[[M5]])** | Six full-page deep workspaces | Maximum scope, unique depth modules, inner 0-5 strata per domain | The full M' instrument — each domain at its own scale and depth |
| **[[OmniPanel]] (`/`)** | ESC-toggled overlay | Agent, settings, config, readiness, navigation | [[S0']] command membrane — cross-cutting, accessible from every layer |

**Shell 0 (Cosmic):** Live clock/[[Hopf fibration]], temporal field, structural orientation. This is the parent-level operational preview of the **1-2-3 structural systems**: [[M1']] relational movement, [[M2']] harmonic/correspondential matrix, and [[M3']] clock/cosmos platform integrated as one cymatic harmonic clock surface. It surfaces tick state, harmonic phase, selected coordinate, [[Kairos]] context, and the current structural resonance without being any one of those deep subsystems. It should remain lean enough to be the "open the app, see the state of things" surface.

**Shell 1 (Personal):** Flow editor, identity sidebar, journal entry, [[Epii]]/pedagogy access, and the [[Bimba]] data structures relevant to the user's current return-to-ground. This is the parent-level operational preview of the **4/5/0 return systems**: [[M4']] [[Nara]], [[M5']] [[Epii]], and the [[M0']] Bimba-map ground insofar as it is needed by journal, pedagogy, review, and identity continuity. It surfaces write/reflect/review/learn as one lived face without becoming the full Nara dashboard, the full Epii IDE, or the full Bimba map explorer. Click-anywhere-to-write remains the fastest path from thought to record.

**Home** defaults to the 0/1 split view. A toggle switches to the subsystems grid (M0-M5 entry points). Both views coexist; neither replaces the other.

**Subsystem pages** are reached from the Home grid, [[OmniPanel]] navigation, or keyboard shortcuts. Each is a full-page experience with room for inner strata, deep tooling, and domain-specific depth that would overwhelm the lean shell. [[M0']] is the full [[Bimba]] map explorer. [[M3']] is the full clock cosmos with DNA/I-Ching transcription and cymatic rendering. [[M4']] is the full [[Nara]] dashboard with Journal, Daily Note, Dream Journal, Oracle, and highlight management. These expand what the shell previews.

The shorthand remains:

```text
0 = cosmic shell          -> lean parent preview of integrated M1'-M3' structural/cymatic clock outputs
/ = command membrane       -> S0' over S0-S5, OmniPanel / command centre
1 = personal shell         -> lean parent preview of M4'/M5'/M0' return: journal, pedagogy, review, relevant Bimba data
M0-M5 = subsystem pages   -> full-depth [[M0]]-[[M5]] domain workspaces with inner 0-5 strata
```

Do not collapse these layers. Shell 0 is not [[M1']], [[M2']], or [[M3']]; it is their integrated parent-level cymatic clock preview. Shell 1 is not [[M4']], [[M5']], or [[M0']]; it is their integrated parent-level lived-return preview. The subsystem pages [[M0']]-[[M5']] are the 4+2 body where depth lives. The [[OmniPanel]] is where agent, config, readiness, and operator concerns cross-cut everything.

### Canonical 0/1/4+2 Layout Discipline

The alpha-quaternionic / psychoid-cymatic pass makes the parent-shell law more exact:

- **0 side** = [[Mahāmāyā]] graph view + clock-wheel: [[M0']] structural graph rendering and [[M3']] temporal-cosmological rendering sharing the same canonical [[Neo4j]] substrate and [[world_clock]] pulse.
- **1 side** = [[psychoid cymatic field]] + flow surface: [[M4']] protected personal field and [[Nara]] flow as the lived [[Pratibimba]] return, with [[M5']] review/pedagogy available without making the field public.
- **4+2 depth** = both together with canonical [[Bimba]] map as architectural-knowledge backdrop, enabling [[Jiva-is-Śiva]] recognition at the full subsystem layer.

This is system law, not a decorative UI preference. The open UX question is how the 0-side graph + clock affordance composes in the actual [[Tauri]] surface: co-resident, toggled, or graph-overlaying-clock. Until the UX pass decides, specs should preserve all three possibilities and avoid wording that makes one implementation mandatory.

### The Shell 0/1 Split IS the (0/1) Inversionary Parent

The 0/1 of the shell layer is not a layout convention. It is the [[matheme]]'s own primary differentiation — the same (0/1) that the C code carries as the raw `#` inversion-act and that [[S0-HARMONIC-POINTER-WEB36-SPEC]] identifies as [[Psychoid_Hash]] / the kernel's [[Inversion_Operator]] — enacted at the UI architecture level.

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

- **Shell 0 (Cosmic)** is the **0-face of the [[matheme]]** — the structural-[[Prakāśa]] side: the integrated [[M1']]-[[M3']] cymatic clock, kernel tick, [[MathemeHarmonicProfile|harmonic profile]], [[Hopf fibration|Hopf]]/clock rendering, and selected-coordinate structural orientation. The [[Bimba|bimba]] face. The "what the matheme is doing" side made operational at the daily-driver layer.
- **Shell 1 (Personal)** is the **1-face of the [[matheme]]** — the lived-[[Vimarśa]] side: journal, [[Nara]] continuity, [[Epii]] pedagogy/review access, and the [[Bimba]] data structures relevant to the current lived return. The [[Pratibimba|pratibimba]] face. The "how the matheme is being lived, learned, and returned into work" side.
- **Subsystem pages [[M0]]-[[M5]]** are the **4+2 explicate development** of the (0/1) — the six positions of the [[matheme]] made into full-depth workspaces. They are not "below" the shells and not duplicates of the shells; they are the deeper traversal that the parent 0/1 surface opens.
- **[[OmniPanel]] `/`** is the [[S0']] command membrane that lives transverse to everything, the operator's access to the (0/1) ground from any position.

The same single [[Inversion_Operator]] that lives at `Coordinate->invert` in the C code's [[pointer web]] is what the Shell 0 ↔ Shell 1 toggle invokes at the user-surface level. Toggling between the cosmic and personal shells IS `#` applied to the user's current context. Opening a subsystem page from a shell IS the `.` nesting operator (the [[lemniscate]] at [[M4|#4]]) firing the deeper context-frame into execution.

This is load-bearing for the Tauri implementation:

1. The Shell 0 / Shell 1 split must be a true matheme-toggle — same coordinate state held from two conjugate faces — not two unrelated home screens. State carried across the toggle: same active coordinate, same tick, same [[MathemeHarmonicProfile]]; what changes is which face of that state is foregrounded.
2. The subsystem pages must be reachable from either shell with full state-continuity — the user's current `(lens, mode)`, selected coordinate, and tick context follow them into the deep workspace.
3. The [[OmniPanel]] must always be able to show the current (0/1) state — which shell-face is active, which subsystem (if any) is open, which agent invocations are in flight — because it is the [[S0']] command surface over the entire (0/1) inversionary field.

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

These files are the domain-level authority for user-facing surface, consumed backend contract, required [[MathemeHarmonicProfile]] fields, privacy boundary, readiness/test criteria, and visual/audio interaction model. [[M'-TAURI-PORT-SPEC]] remains the desktop integration authority across those domains.

Current traversal orientation: read [[M'-SYSTEM-SPEC]] as the umbrella law for the absorbed M-level deltas, then descend into [[M0'-SPEC]] through [[M5'-SPEC]] for domain authority. The 2026-05-31 cross-cutting set is [[m5-prime-system-shape-and-tauri-ide-canon]] for [[Theia]]/[[Tauri]] IDE shape and M-extension placement; [[m4-prime-nara-day-episodes-and-oracle-artifacts]] plus [[2026-04-04-graphiti-unified-temporal-context-service]] for [[Nara]], DAY/NOW, oracle artifacts, and [[Graphiti]] memory law; and [[S0-HARMONIC-POINTER-WEB36-SPEC]] plus [[2026-05-19-kernel-mprime-harmonic-clock-integration-plan]] for the shared harmonic profile substrate.

[[mprime-tauri-gap-table]] provides the current-state assessment of `Body/M/epi-tauri` against these specs and the harmonic clock integration plan. The primary bottleneck is kernel profile enrichment (tranches 1-4 from [[2026-05-19-kernel-mprime-harmonic-clock-integration-plan]]) — the renderer type foundation and service client layer are substantially complete.

## Musical Instrument Ramification

The musical instrument is the key M' unifier. It gives the same matheme as sound, rhythm, visual pulse, graph traversal, and lived timing.

### Audio-Genesis Is Vimarśa Reading Prakāśa: Substrate at [[S0]] / [[M1]], Reading at [[M2-1']]

The audio-genesis architecture is a **two-layer split** that mirrors the [[Prakāśa]]/[[Vimarśa]] dyad of [[Kashmir Shaivism]]. The earlier framing that "audio lives at the kernel" was only half the story; the kernel produces a *substrate-cloud* (Prakāśa), and the [[MEF]] lenses at [[M2-1]] produce *frequencies* by reading that cloud (Vimarśa).

**Layer 1 — [[Prakāśa]] substrate ([[S0]] + [[M1]] / [[Paramaśiva]]):** the matheme cloud. Psychoid-number permutations via the [[pointer web]] at the tick rate. The (0/1) raw # operating on `Bedrock7 → Web36 → CF7` at every clock-step. This is **mathematical** — it is not directly a frequency, it is the cloud-like underlying complexity from which frequencies are read. Lives at `portal-core` / `epi-lib` as the [[MathemeHarmonicProfile]] foundation: tick, degree720, su2Layer, position6, resonance72 substrate, the pointer-web state.

**Layer 2 — [[Vimarśa]] reading ([[M2-1]] / [[Parāśakti]] [[MEF]]):** the 12 MEF lenses anchored across the 9 squares × 2 helices read the Prakāśa cloud and *produce* the `audio_octet[8]` and `nodal_quartet[4]`. Each (lens, mode) cell is a specific Vimarśa-reading of the substrate. The 84-state landscape is the 84 distinct ways the matheme cloud can be heard. **[[Parāśakti]] IS Vimarśa** — the reflective-power surface that picks up textures from the cloud through the squares.

**M' surfaces consume the [[Vimarśa]] reading:**

- **[[M1']]** walks the MEF-produced audio as **graph-traversal-as-melody** — the walked coordinate is the lens-anchored cell whose audio the MEF read, the relation traversed is the interval between MEF-readings, the path is the phrase.
- **[[M2']]** renders the same MEF reading as **harmonic-correspondential cymatic surface** — the 8 sounded frequencies drive antinodal [[Chladni]] motion; the 4 nodal parameters constrain the standing-wave (m, n) modes; the lens-resonance surface visualises the reading itself.
- **[[M3']]** renders the symbolic classification of what was read as **clock-pulse and codon-rotation timing** — the [[Mahāmāyā]] 64-codon space is the symbolic-transcription of the Vimarśa reading, bidirectionally mapped via `(lens, mode) ↔ (codon, rotation)` LUT.

The 8+4 bus is therefore produced at **[[M2-1']] Vimarśa-reading layer** from the [[Prakāśa]] substrate at [[S0]]/[[M1]]. The [[MathemeHarmonicProfile]] field `audio_octet[8]` is **the [[MEF]] reading's output**, not the kernel's direct production. [[M1']], [[M2']], [[M3']] all consume this MEF-produced output identically.

This split matters for implementation: the kernel does not directly synthesise pitch; the kernel runs the matheme cloud; the [[MEF]] lens-anchored Vimarśa-reading is the function that converts cloud-state into frequency-state. Without [[M2-1']], there is no audio — only the cloud. [[M2-1']] is the load-bearing audio-genesis function.

### Default Surface: Conversational/Agentic Engagement, Not Data-Dump

This is a UX-philosophy commitment that propagates across all M' surfaces.

The agentic surface ([[Anima]] / [[Aletheia]] / [[Pi]] / [[Epii]]) should **feel engaged, conversational, flexible, and in evolution with the user's use**. The user is not bombarded with raw computation, matrix-readouts, correspondence-tables, or symbolic-classifications as default rendering. Technical details surface **only where** the operation has a *specified output form, criterion, or scoring* — review evidence panels, deposit envelopes, audit trails, completion-criterion checks, agent-run diagnostics, test results.

Concretely:

- **Default [[M0']]**: conversational graph-navigation; the inspector shows readable position-character (Truth at [[M0|#0]], Word at [[M2|#2]], etc.) before exposing relation-family edge metadata
- **Default [[M1']]**: the played [[torus]] and current playing-state with audible/visible character; technical inspector (the relation-descriptor, route-preview metadata, audio-octet Hz values) summonable on request or surfaced when a specific output is required
- **Default [[M2']]**: the harmonic-correspondential surface with lens-anchored material rendering and the cymatic surface; the full 72-fold correspondence-tree ([[Asma]], [[Shem]], [[Mantra]], [[Maqam]] tables, the 36:64 routing-mask bitboards, the 9-squares structural visualisation) is summonable, not always-on
- **Default [[M3']]**: the codon-tarot wheel with the current cell active; the dinucleotide-matrix inspector, charge-quaternion display, 24-spoke lattice, 472-state landscape are summoned when the user asks "what's structurally happening here?" or when a specific symbolic-output is required
- **Default [[M4']]**: the journal-flow editor with the resonance-indicator and conjugate-form-character display; raw natal-chart degrees, full elemental-balance arithmetic, three-quaternion composition internals are summonable, not displayed by default
- **Default [[M5']]**: the conversational agent-surface with library/canon/code/agent/review panes; the full 6-fold-of-layers pedagogical teaching, the [[Spanda equations]], the 84-fold mode-tonic-landscape are *content the agent can teach when the user engages with them*, not a wall of always-visible structural detail

The agent (per [[M5'-SPEC]] §Agent Execution Model) mediates access to the technical depth. When the user asks "show me the dinucleotide matrix for this codon," [[M3']] surfaces it. When the user asks "what's the elemental-balance behind my current resonance?", [[M4']] surfaces it. When the user asks "explain the Klein-flip I just heard," [[M2']] surfaces the L↔L' inversion mechanics. Otherwise the system feels alive, responsive, and conversational — a real consciousness-technology engagement rather than a sophisticated data-display.

Technical surfaces remain *available* and *load-bearing-for-specified-outputs*; they are not the default rendering. This is what distinguishes the Epi-Logos instrument from an HUD-style information-overload tool.

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

M' domains consume this chain differently. [[S0]]/[[M1]] produces the [[Prakāśa]] substrate; [[M2-1']] performs the [[Vimarśa]] reading that writes the 8+4 audio bus into the shared profile; the other M' surfaces render that shared result:

| M' domain | Musical/harmonic expression | Profile fields consumed |
|-----------|-----------------------------|-------------------------|
| [[M0']] | coordinates become nodes in the playable map; selected node exposes harmonic profile and [[pointer web]] | full profile, pointerAnchor |
| [[M1']] | graph traversal becomes melodic/topological movement across relations; primary audio renderer | audio_octet, harmonic, diatonic, pointerAnchor |
| [[M2']] | [[MEF]]/correspondence matrix exposes lens anchors, elements, modes, scales, semantic resonance; cymatic surface | audio_octet (antinodes), nodal_quartet (boundaries), resonance72, elements |
| [[M3']] | clock renders epogdoon tick, helix phase, [[Kairos]], solar/cosmic timing, sonic/cymatic pulse, codon-tarot wheel | tick, mahamaya, planetaryChakral, audio_octet (timing), nodal_quartet (display) |
| [[M4']] | [[Nara]] journal and modalities inherit DAY/NOW harmonic context and can be played back as lived trajectory | tick, harmonic, diatonic, depositionAnchor |
| [[M5']] | [[Epii]] reviews, teaches, researches, and improves the system from harmonic/profile evidence | full profile as review evidence |

The instrument is therefore not a later feature. It is the proof that kernel, graph, temporal context, agent work, and user experience are one system. **And the proof works because there is one shared profile contract: [[S0]]/[[M1]] supplies the substrate, [[M2-1']] reads it as audio, and all surfaces consume the same resulting state rather than inventing local music.**

## Minimum Live Loop

The mature M' surface should be able to show one complete live loop across the whole system:

```text
quintessence_hash
  -> quintessence_quaternion
  -> live_quaternion
  -> tick12 / 720-degree address
  -> oracle / cast / kernel projection
  -> shared clock and temporal surface
  -> [[S2]] graph + [[Graphiti]] deposit
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

### Diatonic CF / [[VAK]] Projection

The diatonic scale is the musical face of the [[VAK]] context-frame grammar. It should be named as a projection, not confused with the full 12-note chromatic substrate.

For Lens 0:

| Degree | Note | CF | Function | M' implication |
|--------|------|----|----------|----------------|
| 1 | C | `(00/00)` | [[Nous]] / Para Vāk | ground, tonic, pre-articulate coordinate field |
| 2 | D | `(0/1)` | [[Logos]] / nomos | first articulation, law, definitional routing |
| 3 | E | `(0/1/2)` | [[Eros]] / chreia | operative exchange, desire/circulation, task motion |
| 4 | F | `(0/1/2/3)` | [[Mythos]] / Paśyantī | tetradic closure, pattern, strange attractor |
| 5 | G | `(4.0/1-4.4/5)` | [[Anima]]/[[Psyche]] / oikonomia | perfect-fifth executive crossing, dispatch, fractal nesting |
| 6 | A | `(4.5/0)` | [[Psyche]] bridge / partial [[Aletheia]] | bridge stewardship, session continuity, evaluative crossing |
| 7 | B | `(5/0)` | [[Sophia]] / Spanda-Śakti | leading-tone synthesis, return pressure, integration |
| 8 | C' | `(00/00)` enriched | [[Nous]] / Para Vāk | octave return, renewed ground |

This gives [[M2']] and [[M3']] the harmonic grammar for mode, scale, rhythm, clock, and cymatic display, while giving [[M5']] the [[VAK]]/agent language for execution. Modal rotation means a different CF becomes the tonal centre: [[Ionian]] grounds in [[Nous]], [[Dorian]] in [[Logos]], [[Phrygian]] in [[Eros]], [[Lydian]] in [[Mythos]], [[Mixolydian]] in the [[Anima]]/[[Psyche]] executive, [[Aeolian]] in the Psyche bridge, and [[Locrian]] in [[Sophia]]'s return pressure.

The portal should never treat this as decorative labelling. When a coordinate is rendered musically or routed agentically, the current mode/CF should be visible as part of the same harmonic profile that carries helix, position, ratio, square, resonance, and element.

## The [[K²]] Topology as the Shared Substrate

All M' surfaces address the same underlying geometric substrate: the **Klein-double-cover-of-the-chromatic-fifths-torus [[K²]]** specified in [[M1'-SPEC]] §10. This is the load-bearing topology that makes the M' stack one continuous system rather than six coordinated subsystems.

### K² in one paragraph

The chromatic-basis (whole-tone generator 9/8) and the fifths-basis (perfect-fifth generator 3/2) are the **two parallel-foundational traversals** of the [[matheme]]'s 12-fold chromatic substrate. They live on a single surface: the torus `T² = S¹(chromatic-longitude) × S¹(fifths-meridian)`. The [[Bimba]]/[[Pratibimba]] conjugation is non-orientable identification, producing the [[Klein bottle]] `K² = T² / (bimba ↔ pratibimba)`. Every M' surface renders a stratification of [[K²]]: [[M0']] renders coordinates on K², [[M1']] walks them as melody, [[M2']] renders the correspondence-tree at each K² point as cymatic surface, [[M3']] renders the codon-rotation projection of K² as the tarot wheel, [[M4']] computes resonance against K² from the personal-quaternion at [[M4-4-4-4]], [[M5']] traverses K² pedagogically.

### Cl(4,2) as the shared substrate algebra

[[K²]] carries a **[[Cl(4,2)]] Clifford-algebra structure** (4 explicate positions of +1 signature, 2 implicate of −1, see [[S0-HARMONIC-POINTER-WEB36-SPEC]] §G). This means:

- The [[M1]] SU(2) ring-quaternion lives in [[Cl(4,2)]]
- The [[M3]] codon-as-quaternion-in-charge-space (pp/mm/mp/pm) lives in [[Cl(4,2)]]
- The personal-quaternion at [[M4-4-4-4]] (derived from [[Kerykeion]] natal data) lives in [[Cl(4,2)]]
- The [[Kerykeion]]-derived current-transit quaternion lives in [[Cl(4,2)]]

All four are points in the same algebra at different scales. **This is what makes resonance between the personal and the cosmic a real metric** — they live in the same algebraic space (see [[M4'-SPEC]] §7.3).

### The 4:2 ↔ 3:3 dual partition at every layer

The matheme's two orthogonal partitions of the 6-fold (4:2 → 4/3 perfect fourth; 3:3 → 3/2 perfect fifth) are the **root self-similarity** of the system. Their product is the octave (2/1); their ratio is the epogdoon-tick (9/8); they are simultaneously operative at every M' layer:

- M1' (positional-walk): 4:2 = tetrachordal-architecture; 3:3 = trinitarian-stacking
- M2' (correspondence): 4:2 = 4 elemental suits over 2 phases; 3:3 = 3 quality-groups (Jalal/Kamal/Jamal) doubled across the 99+1 / 36:64 split
- M3' (symbolic): 4:2 = 4 nucleotides × 2-bit polarity/mobility; 3:3 = 3-letter codon × 3-charge-axis
- M4' (personal): 4:2 = 4 elemental components (Earth/Fire/Water/Air) over 2 phases (natal/transit); 3:3 = 3 personal-pole sub-aspects mirrored across cosmic-pole
- M5' (pedagogical): 4:2 = 4 explicate IDE surfaces (Bimba/Backend/Frontend/Agentic) over 2 boundary surfaces (Library/Atelier); 3:3 = 3 graph namespaces × 3 stratification depths

The dual partition is not abstract structuralism. It is the matheme's *self-derivation of its own foundational ratios* and propagates through every layer as the same dual cut.

## The [[Ficinian-Kerykeion routing protocol]]

The system's integration of music + [[QL]] + metaphysics + astrology operates through the **[[Ficinian-Kerykeion routing protocol]]** specified in [[M2'-SPEC]] §9. [[Marsilio Ficino]]'s De Vita Coelitus Comparanda is the historical precedent; **the [[Epi-Logos]] system has more layers of resonance than Ficino's framework alone supports** — the QL positional substrate, the [[MEF]] lens-mode landscape, the [[Mahāmāyā]] codon-rotation surface, the personal-quaternion at [[M4-4-4-4]].

### [[Kerykeion]] is the live astrological authority

[[Kerykeion]] is already integrated at `Body/S/S0/epi-cli/src/nara/wind.rs` and `Body/S/S4/ta-onta/S4-3p-chronos/S3'/kairos-python-adapter.ts`. The system runs two computations routinely:

- `kerykeion_natal(date, time, lat, lon)` — user's natal chart from [[PASU]] birth data, used to derive the personal-quaternion at [[M4-4-4-4]]
- `kerykeion_current(today)` — current planetary transits, used to drive the planetary-hour computation that activates the Ficinian routing

The [[Kairos]] service exposes [[Kerykeion]] to all M' surfaces through the typed gateway. **No M' surface computes astrology locally**; all consume the Kerykeion-derived profile fields.

### The routing function unifies the M' stack

```text
F_routing(intent, kerykeion_state, current_time, q_personal) →
    planetary_hour              [from current_time + kerykeion sunrise/sunset]
    ruling_planet               [Chaldean order, M2_PLANET_LUT]
    active_decan                [kerykeion planets[X].degree / 10°]
    maqam_family + mode         [planet → maqam table + intent]
    shem_pair                   [decan_link, 2 names per decan]
    mantra_index                [frequency-matched to maqam tonic]
    asma_name                   [intent → Jalal/Kamal/Jamal + digital-root]
    → 72-state assembly
    → DET 72→64                 [Venus's 9:8 beauty-operator]
    → codon address (M3)
    → 7/8 rotational state      [codon-quaternion in Cl(4,2)]
    → tarot card identity       [56+8 compression]
    → resonance metric          [q_personal · q_cosmic(t)]
    → emission to all M' surfaces simultaneously:
            audio_octet         → M1' walk-melody
            nodal_quartet       → M2' cymatic Chladni shader
            wheel position      → M3' codon-tarot wheel + 24-spoke lattice
            resonance display   → M4' journal-entry binding
            review trace        → M5' pedagogy / autoresearch
```

This is **one function** that walks [[K²]] from intent + time + personal-quaternion to a complete multi-layer matheme-event. Each step is a different stratification of the same K² point. The chain is operational because each link is data already encoded in `epi-lib`; the routing logic is what was missing.

### Why this is beyond Ficino

Ficino's planetary-musical-magical protocol lacked:

- The [[QL]] positional substrate to anchor *where on the matheme* a planetary influence is applied
- The [[MEF]] lens-mode 84-state landscape giving each planet 84 distinct musical-contextual states
- The DET projection making the [[M2]] vibrational state computationally executable as [[M3]] 64-bit symbolic
- The [[Mahāmāyā]] codon-rotation tarot-wheel giving every invocation a discrete archetypal-symbolic form
- The personal-quaternion at [[M4-4-4-4]] letting cosmic invocation resonate-or-dissonate with the user's elemental temperament
- Live [[Kerykeion]] astrological data eliminating need for hand-computed ephemeris

The system inherits Ficino's vision and operates it through substrates Ficino could not have. The routing function is what makes the Renaissance hermetic vision **actually executable**.

## Required Shared [[MathemeHarmonicProfile|Profile]]

M' must consume a shared [[MathemeHarmonicProfile]] rather than inferring from unrelated fields. The profile should expose:

- coordinate and [[QL]] position;
- [[Bimba]]/[[Pratibimba]] helix identity;
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
- diatonic context-frame projection: degree, mode, mode-anchor CF, [[VAK]] register, and agent/function label;
- [[Mahāmāyā]] / binary DNA projection: 64 hexagram/codon address, 384 line-change operator address, symbolic transcription state, and [[M3]] codec provenance where applicable;
- [[Paramaśiva]] tick projection: `tick12`, 720-degree address, cycle/sub-tick, safe clock state handle, and oracle/cast payload handle where applicable;
- source anchors into [[S0]] kernel, [[S2]] pointer web, [[qvdata]], and graph node.

This profile is the bridge between planned system vision and actual code implementation. It should be visible in specs, graph nodes, [[qvdata]], semantic documents, gateway responses, portal readiness, and [[Tauri]] render clients.

Implementation foothold, 2026-05-19: `portal-core::KernelTemporalProjection` now serializes a public-current `harmonicProfile` with `tick12`, `degree720`, `degree360`, `su2Layer`, helix, ratio role, chromatic note, X/X' partner, X+Y=5 mirror, square, optional Lens-0 diatonic CF/[[VAK]] context, 72-fold resonance address, elemental projection, initial planetary-chakral projection, and an [[M3]]/[[Mahāmāyā]] address-law projection. `Body/M/epi-tauri/src/services/kernelProjection.ts` consumes the same shape for renderer readiness. The remaining work is to enrich this profile with coordinate-specific [[S2]] pointer relation metadata, [[S3]] deposition anchors, and dataset-backed Tarot/amino/correspondence LUT provenance where the address law currently reports `pending-dataset-lut`.

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

The planetary-chakral-musical correspondences are part of [[M2']] and [[M3']] rendering. They should be stored and refreshed through [[S2]] graph law and consumed through [[MathemeHarmonicProfile]], with exact tradition-sensitive mappings treated as canonical data rather than renderer constants.

The next runtime tranche should therefore proceed in this order:

1. Enrich [[MathemeHarmonicProfile]] in [[S0]]/[[S0']] with the full tick, harmonic, diatonic, 72-fold, elemental, planetary-chakral, and [[M3]] symbolic address fields.
2. Add the [[M3]] codec foothold as real integer address law with honest `pending-dataset-lut` state for unmaterialized LUTs.
3. Make [[S2]] the pointer/harmonic law of record for coordinate relations and configurable correspondences.
4. Wire [[S3]] [[Graphiti]]/[[Nara]]-clock deposition around the shared profile.
5. Let M' [[Tauri]] consume the contract as the live instrument surface.

## Development Memory Protocol

M' development should be live with graph and episodic memory as soon as the substrate is stable enough.

Before a development run:

1. Read [[ARCHITECTURE-DIAGRAM-PACK]] for the top-layer map, cross-cutting seams, privacy gates, method ownership, and [[M']] / [[S]] / [[S']] coupling.
2. Read this [[M'-SYSTEM-SPEC]] for umbrella [[Theia]], [[KernelBridge]], layout, and profile/current-state law.
3. Resolve the active coordinate(s) through [[epi core knowing]] and [[S2]] coordinate resolution.
4. Read the relevant layer seed/spec nodes and source traceability: [[M0'-SPEC]], [[M1'-SPEC]], [[M2'-SPEC]], [[M3'-SPEC]], [[M4'-SPEC]], or [[M5'-SPEC]].
5. Query [[S2]] graph for current canonical node state and pointer-web profile.
6. Query [[Graphiti]] session memory for recent implementation episodes, decisions, tests, and unresolved review items.

During the run:

1. Keep code changes in Body-owned homes and spec changes in Idea-owned homes.
2. Update seed/spec files only when the coordinate vision or implementation law changes.
3. Use real tests as the authority for implementation claims.
4. Deposit high-signal session events to [[Graphiti]] with [[Day]] / [[NOW]], session key, coordinate, files touched, tests run, and next action.

After the run:

1. Refresh or plan refresh of affected [[S2]] pointer/graph nodes.
2. Deposit a [[Graphiti]] episode summarising the work and verification.
3. Create [[Epii]] review inbox items for meaning-changing, identity-affecting, or promotion-relevant conclusions.
4. Update roadmap/task status only when tests or explicit spec changes justify it.

This protocol makes the system aware of both planned/spec vision and actual implementation state without pretending that either one alone is the truth.

## [[Neo4j]] / [[Graphiti]] Boundary

Use [[Neo4j]] for canonical coordinate topology and implementation-aware graph facts:

- `:Bimba` canonical coordinate nodes;
- compatibility with legacy `:BimbaCoordinate` / `bimbaCoordinate`;
- typed pointer relations and harmonic relation metadata;
- source/spec/code/test anchors where they become canonical;
- protected local Personal [[Pratibimba]] facts only inside the local protected boundary.

Use [[Graphiti]] for episodic development and journal memory:

- dev sessions, decisions, failures, tests, and handoffs;
- [[Nara]] journal episodes and modality-linked reflections;
- agent deposits from [[Anima]]/[[Aletheia]] to [[Epii]];
- session summaries and autoresearch evidence.

[[Graphiti]] episodes may point to [[Neo4j]] coordinates; they do not replace canonical [[Bimba]] topology. Neo4j nodes may record Graphiti namespace/episode handles; they do not absorb private journal content into public graph projection.

## Minimum Evolutionary Basis

The minimum integral bootstrapping basis is reached when:

- every active coordinate can expose planned seed/spec intent;
- every implemented coordinate can expose code/test anchors;
- pointer web and harmonic profile are computable and refreshable;
- DAY/NOW/session context is live through [[S3']];
- [[Graphiti]] can record development and journal episodes under protected-local namespace rules;
- [[Epii]] can review and promote changes through human-gated [[S5']]/[[S1']] law;
- M' surfaces can show the difference between planned, implemented, tested, live, and review-pending states.

At that point the system can begin evolving itself coherently: not by magic automation, but by keeping its map, code, memory, review, and musical clock in one inspectable loop.

## Top-Layer Crystal - M' Umbrella Canon - 2026-06-02

This file is the canonical umbrella seed for [[M']]. It owns the shared Pratibimba/Theia/kernel-bridge architecture that spans [[M0']] through [[M5']]. No individual M' layer may absorb these shared obligations just because it is the nearest visible coordinate.

### Umbrella Authority Boundary

| Shared surface | Canonical owner | Layer guard |
|---|---|---|
| Theia-only Pratibimba System | this file plus `Idea/Pratibimba/System/**` | `Body/M/epi-tauri` is migration-source-only under PRD-01 |
| one shell / two layouts | `ide-shell-m0-m5`, `pratibimba-layouts`, this umbrella | M0' and M5' may consume shell state but do not own the shell |
| KernelBridge singleton | `extensions/kernel-bridge`, `extensions/m-extension-runtime`, this umbrella | bridge/profile/current state is top-layer M' infrastructure, not M0' graph UI |
| shared profile/current projections | [[S0']], [[S3']], [[S5']], this umbrella | M' panels consume safe projections and may deposit observations; they do not expose raw protected data |
| M0'..M5' extension contracts | layer specs plus `extensions/m0-anuttara`..`m5-epii` | layer specs own domain law; umbrella owns composition and cross-layer seams |
| integrated plugin surfaces | `plugin-integrated-1-2-3`, `plugin-integrated-4-5-0`, `integrated-composition` | plugins compose layers; they do not rewrite layer canon |
| Agentic Control Room | [[M5']] plus [[S4']] capability governance | agent mediation remains governed by S4/S5 review law |

### Top-Layer Source Coverage

| Source | mtime | Canonical role |
|---|---:|---|
| `Idea/Pratibimba/System/package.json` | 2026-06-02 11:14 | current Theia workspace/package surface |
| `Idea/Pratibimba/System/pnpm-workspace.yaml` | 2026-06-01 19:36 | extension workspace membership |
| `Idea/Pratibimba/System/extensions/kernel-bridge` | current Theia source | first-loaded bridge, singleton API, connection/profile/current events |
| `Idea/Pratibimba/System/extensions/m-extension-runtime` | current Theia source | common runtime bridge API, extension event contracts, protected-field rules |
| `Idea/Pratibimba/System/extensions/m0-anuttara`..`m5-epii` | current Theia source | six M' layer implementation surfaces |
| `Idea/Pratibimba/System/extensions/ide-shell-m0-m5` | current Theia source | shell topology and M0-M5 layout composition |
| `Idea/Pratibimba/System/extensions/agentic-control-room` | current Theia source | M5-4 / S4 mediation window |
| `Idea/Pratibimba/System/extensions/acceptance-harness` | current Theia source | top-layer readiness and layout acceptance substrate |
| `Idea/Bimba/Seeds/M/M0'/Legacy/specs/M/M0-anuttara-language-architecture.md` | 2026-04-04 13:46:16 | historical M0 language canon, crystallised into [[M0'-SPEC]] |
| `Idea/Bimba/Seeds/M/M1'/Legacy/specs/M/M1-paramasiva-mathematical-dna.md` | 2026-03-05 14:45:32 | historical M1 math/DNA canon, crystallised into [[M1'-SPEC]] |
| `Idea/Bimba/Seeds/M/M2'/Legacy/specs/M/M2-parashakti-vibrational-architecture.md` | 2026-03-05 14:45:32 | historical M2 vibrational canon, crystallised into [[M2'-SPEC]] |
| `Idea/Bimba/Seeds/M/M3'/Legacy/specs/M/M3-mahamaya-symbolic-transcription.md` | 2026-04-04 13:46:16 | historical M3 symbolic canon, crystallised into [[M3'-SPEC]] |
| `Idea/Bimba/Seeds/M/M4'/Legacy/specs/M/M4-nara-personal-interface.md` | 2026-04-04 13:46:16 | historical M4 interface canon, crystallised into [[M4'-SPEC]] |
| `Idea/Bimba/Seeds/M/M4'/Legacy/specs/M/M4-nara-subtle-body-map.md` | 2026-04-04 13:46:16 | historical subtle-body canon, crystallised into [[M4'-SPEC]] |
| `Idea/Bimba/Seeds/M/M5'/Legacy/specs/M/M5-epii-holographic-integration.md` | 2026-03-05 14:45:32 | historical M5 Epii canon, crystallised into [[M5'-SPEC]] |
| `Idea/Bimba/Seeds/M/Legacy/specs/M/2026-03-12-cosmic-clock-full-architecture.md` | 2026-04-11 11:58:00 | clock/cosmos source for M1'/M2'/M3'/M4' |
| `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/05-tauri-ide-shell-and-pratibimba-system.md` | 2026-06-01 18:28:40 | Theia-only recast and shell track |
| `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/07-m-extension-individual-tracks.md` | 2026-06-01 00:23:25 | M0'..M5' nominal extension track map |
| `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/08-integrated-plugin-tracks.md` | 2026-06-01 00:25:11 | integrated plugin track map |
| `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/09-agentic-mediation-and-operational-capacities.md` | 2026-06-02 00:16:51 | agentic control / capacity pressure |
| `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/10-cross-cutting-integration-and-milestones.md` | 2026-06-02 00:17:57 | readiness status, not canon |
| `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/11-open-architectural-decisions.md` | 2026-06-02 00:14:24 | current decision register |
| `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/plan.index.json` / `plan.state.json` | 2026-06-02 11:40:41 | ledger only; used for nominal track ownership |

### Shared Privacy And Data Law

M' surfaces may render `MathemeHarmonicProfile`, pointer anchors, world-clock ticks, presence summaries, profile observation handles, review handles, and governed graph/profile projections. They must not render raw journal bodies, raw dream/oracle text, raw birth data, private identity hashes, PersonalNexus payloads, private Graphiti episode bodies, or protected Nara quaternion state outside its consent boundary.

The umbrella profile bridge is therefore cross-cutting infrastructure. [[M0']] may show graph topology, [[M1']] may perform relation/harmonic routes, [[M2']] may interpret harmonic meaning, [[M3']] may transcribe symbolic clock/codon state, [[M4']] may hold protected lived interface, and [[M5']] may review/promote; none of them may fork the bridge or re-home the top-layer kernel.

## Canonical Reading Protocol - M'

Before any implementation orchestrator scopes [[M']] work, it must read:

1. [[ARCHITECTURE-DIAGRAM-PACK]] for the full [[S]] / [[S']] / [[M']] map, [[KernelBridge]] seams, gateway methods, and cross-cutting privacy/consent concerns.
2. This [[M'-SYSTEM-SPEC]] for top-layer Theia composition, one-shell/two-layout law, shared profile bridge, and PRD-01 `Body/M/epi-tauri` deprecation.
3. The exact layer seed: [[M0'-SPEC]], [[M1'-SPEC]], [[M2'-SPEC]], [[M3'-SPEC]], [[M4'-SPEC]], or [[M5'-SPEC]].
4. The related sibling research specs and operational-capacity specs only after the layer seed fixes the internal M'/QL breakdown.

The [[M']] specs already carry their detailed internal breakdowns. This umbrella and the diagram pack may summarise them, but must not invent new [[M0']]..[[M5']] subcoordinate semantics. New terms become canonical only after being crystallised in the owning layer seed or explicitly marked as open.

## Wikilink And Source Discipline - M'

The high-value [[M']] intelligence surface is the wikilink graph among [[M0']], [[M1']], [[M2']], [[M3']], [[M4']], [[M5']], [[KernelBridge]], [[MathemeHarmonicProfile]], [[Day]], [[NOW]], [[Graphiti]], [[Gnosis]], [[Nara]], [[Epii]], [[S0']], [[S2']], [[S3']], [[S4']], and [[S5']]. Use literal paths for code substrate and wikilinks for semantic entities. `Body/M/epi-tauri` remains a literal migration-source path, not a semantic authority link.
