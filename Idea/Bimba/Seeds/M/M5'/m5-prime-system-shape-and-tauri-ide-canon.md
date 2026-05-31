---
coordinate: "M5'"
status: "active-canon-clarification-spec"
updated: "2026-05-31"
type: "shape-clarification"
companion_to: "[[M5'-SPEC]]"
consolidates_across:
  - "[[M'-SYSTEM-SPEC]]"
  - "[[M'-TAURI-PORT-SPEC]]"
  - "[[M5'-SPEC]]"
  - "[[m5-prime-autoresearch-self-improvement-loop]]"
  - "[[epii-operational-capacities]] family"
  - "[[m4-prime-psychoid-cymatic-field-engine]]"
depends_on:
  - "[[M5'-SPEC]]"
  - "[[m5-prime-autoresearch-self-improvement-loop]]"
  - "[[CLAUDE.md]] §II-VI"
---

# [[M5']] System Shape Clarification — S as Backend, M' as Frontend, Theia IDE as Shell

## The canon-setting consolidation of the system's app-architectural shape

**Status:** M5'-level canon-clarification spec. Consolidates architectural decisions surfaced through recent thinking-work into a coherent shape-canon that downstream specs reference rather than re-articulate.

**Reading order:** This is the foundational app-architecture canon for the M5'/M'/Tauri/IDE layer. Read after `M5'-SPEC.md` and `CLAUDE.md` §II-VI; before drafting or updating any spec that touches the Tauri-app architecture, the IDE shell, the plugin-app boundary, or the M5-2/3/4 trinitarian breakdown.

---

## §0 — Thesis

Recent specification work surfaced several architectural diffusions that this spec consolidates into clear canon:

1. The **M5-2/M5-3/M5-4 trinitarian breakdown** was hovering as abstract registers ("siva-backend", "-shakti-frontend", "siva-shakti-agentic") across the operational-capacity siblings. The clarification: **M5-2 IS the S-family stack itself; M5-3 IS the M'-family Tauri app itself; M5-4 IS the operational-capacities-and-agentic-mediation**. The Siva-Shakti polarity is not metaphor at the M5 sixfold — it is the literal S-as-Siva-infrastructure / M'-as-Shakti-rendered-surface co-implication.

2. The **Tauri-app architecture** has been articulated as 0/1 + 4+2 across recent specs (`m4-prime-psychoid-cymatic-field-engine.md` §2; `alpha_quaternionic_integration_across_M_stack.md` §0.2). The clarification: **one Tauri app with two surface-modes** — a lightweight 0/1 free-flow surface (current `/body` directory; loads-first; persistent menubar/background presence) and a deep IDE surface (new `/pratibimba/system` directory; summonable via omni panel/command). Both share the same Tauri-app process; the IDE is summoned-into-existence on demand.

3. The **IDE shell basis** is committed: **Theia**, not VSCode-fork. The reason is partly practical (Theia is purpose-built for forking; Eclipse Foundation backing; modular extension API) and partly resonant — *Ale-theia* names the disclosure-tracking agent in the M5-4 agentic register. The IDE shell that surfaces canon-development work carries the right name-correspondence.

4. The **plugin-app granularity** within the IDE is a **6 + 2 architecture**: six individual M-extensions (one per subsystem, M0 through M5) plus two integrated plugins. The two integrated plugins inherit QL context-frame structure: **the integrated 1-2-3 plugin** (Mod 4 — Three-Plus-One; the full M1-M2-M3 manifestational substrate rendered together as the cosmic-engine surface) and **the integrated 4/5/0 plugin** (Mod 6 — Möbius-return; M4+M5+M0 rendered together as the user-experience integration, the system's 5→0 return at the app-architecture register).

5. The **kernel-bridge foundational extension** is what wires the actual C-library computation (M1' / M2' / M3' real engines at S0) through to every M-extension and integrated-plugin, so data underlying remains consistently available whether subsystems are rendered individually or together.

These five clarifications together resolve the diffusion. This spec is the canonical statement. Downstream specs reference it; updates flow from it.

---

## §1 — The S-as-Backend / M'-as-Frontend mapping

### §1.1 The Siva-Shakti polarity at the system/coordinate register

Per CLAUDE.md §VI, the Siva-Shakti polarity operates at the memory-arena register: `.rodata = Siva (immutable substrate)`, `Heap = Shakti (mutable instances)`, `Tensor = Prana (high-dim vector embeddings)`. This is the foundational pattern.

The same polarity operates at the **system/coordinate register**:

| Family | Polarity-role | Operative character |
|---|---|---|
| **S (Stack)** | **Siva — infrastructure-substrate** | Immutable-by-build technology layers: S0 Terminal/kernel/CLI/lib (the C-library substrate; the kernel runtime), S1 Obsidian/vault (canonical-knowledge filesystem), S2 Neo4j/bimba-map (canonical graph), S3 PAI/Gateway/SpaceTimeDB (live shared-state and gateway plane), S4 Claude/agent-SDK (LLM integration substrate), S5 Notion/canon-promotion (canonical-promotion infrastructure) |
| **M' (Subsystem-Prime / Rendered)** | **Shakti — rendered-surface plane** | Mutable-by-state UI/rendering: M0' Anuttara graph view, M1' Paramaśiva clock instrument, M2' Paraśakti cymatic engine, M3' Mahāmāyā wheel surface, M4' Nara psychoid-field surface, M5' Epii IDE workspace |

The M-family (without prime) carries the conceptual-archetypal subsystem identities (M0 Anuttara, M1 Paramaśiva, etc. — the canonical content); the M'-family carries those subsystems' **rendered playable surfaces** in the Tauri app. The S-family carries the **technology infrastructure** that the playable surfaces consume.

So S-and-M'-together form the Siva-Shakti polarity at the app-architecture register: **S supplies the infrastructure (backend); M' surfaces the rendered engagement (frontend); together they are Epii's integrated operational unity at M5**.

### §1.2 M5-2 = S-family; M5-3 = M'-family; M5-4 = operational-capacities + agentic mediation

The M5 sixfold structure (per `M5'-SPEC.md`) is:

| Sub-coord | Surface | Concrete identity (corrected canon) |
|---|---|---|
| **M5-0** Library / Gnostic Namespace | Documentary holding | Bimba pedagogy, Gnosis library, RAG-anything substrate, kbase integration, all subsystem documentation in queryable form |
| **M5-1** Philosophy / Canon Studio | Theory canon | Epi-Logos philosophy files, worldview docs, foundational instructions, M5-1 developer-conversational mechanism |
| **M5-2** Backend Studio | **= The full S-family stack itself** | S0 (Terminal/kernel/CLI/lib), S1 (Obsidian/vault), S2 (Neo4j/bimba-map), S3 (PAI/Gateway/SpaceTimeDB), S4 (Claude/agent-SDK), S5 (Notion/canon-promotion). M5-2 is NOT a parallel-M-side backend; M5-2 IS Epii's view-into-and-operational-relationship-with the S-stack |
| **M5-3** Frontend Studio | **= The full M'-Tauri app itself** | M0'/M1'/M2'/M3'/M4'/M5' rendered surfaces, the Tauri shell, the IDE, the 0/1 free-flow surface, all the plugin-apps. M5-3 IS Epii's view-into-and-operational-relationship-with the M'-Tauri-app |
| **M5-4** Agentic Control Room | **= Operational-capacities + Pi/Sophia/Anima/Aletheia + S5/S5' Pi-agent + S0/S0' CLI/library bridges** | The six sibling operational-capacities (Epii-on-Anuttara, Epii-on-Paramaśiva, etc.); the four agent roles (Sophia/Anima/Pi/Aletheia); the autoresearch spine; the bridges into S5/S5' Pi-agent endpoint and S0/S0' CLI/library |
| **M5-5** Logos Atelier | Etymological-archaeology engine | The scent-following method, word constellations, Logos-cycle FSM, archaeological verification work informing Anuttara articulation and all canon-evolution |

The corrected M5-2/3/4 attribution is the key clarification. The six operational-capacity siblings' "M5-2 Backend" and "M5-3 Frontend" sections were implicitly referring to S-stack and M'-Tauri work all along; this canon makes it explicit.

### §1.3 Operational implications

With this clarification:

- **Spec-writing discipline**: when an operational-capacity sibling specifies M5-2 work, it must enumerate the specific S-layer components involved (e.g., Mahāmāya's M5-2 work touches `Body/S/S0/epi-lib/include/m3.h` and `Body/S/S3/epi-spacetime-module/` for federated round coordination). When it specifies M5-3 work, it must enumerate the specific Tauri-app surface(s) involved (e.g., Paraśakti's M5-3 work touches the M2' cymatic-engine extension and the M0' graph-viewer's relational-overlay layer).
- **Architectural discipline**: when designing a new feature, the S-stack home and M'-Tauri home are determined first (these are infrastructure facts); the M5-2/3/4 attribution flows from where the feature lives in those substrates.
- **Reading discipline**: "M5-2 Backend Studio" in any spec means "Epii operating upon the S-stack at this specific point"; "M5-3 Frontend Studio" means "Epii operating upon the M'-Tauri app at this specific point"; "M5-4 Agentic Control Room" means "Epii's agentic-mediation layer linking the above through the operational-capacities".

---

## §2 — Code organisation: /body and /pratibimba/system

### §2.1 The two-directory structure

The repo carries two distinct code-substrate directories:

- **`/body`** — the current lightweight Tauri app codebase. Houses the existing 0/1 free-flow surface code (`epi-tauri` and related). Stays in place as the daily-use surface; not the IDE.
- **`/pratibimba/system`** — the new IDE codebase (Theia-based; see §4). Houses the deep IDE surface code. Separate directory because the IDE is structurally a different kind of artefact (an IDE shell with extensions) versus the lightweight Tauri free-flow app.

This separation honours the **separation of concerns**: the lightweight daily-use surface is its own focused product; the IDE shell is its own focused product; they share architectural identity (both are the user's relationship with the system) but have different scopes and engineering rhythms.

### §2.2 The pratibimba directory framing

The `/pratibimba/` directory name carries the right structural-meaning: pratibimba = reflection/mirror-image. The IDE is the **reflective surface** through which the user engages with the canonical bimba-map at depth — it mirrors the system back to the user as a structured engagement environment. The `/pratibimba/system/` sub-directory specifically holds the IDE codebase as the *systematic reflection* of the system back to the user.

This is consistent with the C-family ontological framing per CLAUDE.md §IIE: `C5 Pratibimba = Instance/Reflection`. The IDE IS a structured instance/reflection-surface; it sits at the pratibimba register architecturally.

### §2.3 Build into one Tauri app

Despite the two-directory code separation, **the user experiences one Tauri app**. The Tauri build process composes both directories' code into a single app distribution. The runtime model:

- The Tauri app loads first as the lightweight 0/1 free-flow surface (the `/body` code)
- The IDE surface (the `/pratibimba/system` code) is **available but not loaded by default**
- When the user invokes the IDE (via omni-panel, command palette, or menubar action), the IDE surface initialises and opens
- The 0/1 free-flow surface can persist as menubar/background mode while the IDE is open
- Both surfaces share access to the kernel-bridge (per §5), gateway, and SpaceTimeDB subscriptions

The user perceives this as one cohesive app with two engagement modes: daily-use mode (the 0/1) and deep-work mode (the IDE). The technical-architectural fact is one Tauri shell loading either or both surface-codes depending on user-engagement.

---

## §3 — The single-Tauri-app two-surface model

### §3.1 Surface-loading lifecycle

```
[Tauri app launches]
       ↓
[0/1 free-flow surface loads from /body]
       ↓
   ┌───┴────┐
   ▼        ▼
[User       [User invokes IDE
 stays in    via omni panel, command,
 0/1 mode]   or menubar]
                  ↓
            [IDE surface loads from /pratibimba/system]
                  ↓
            [0/1 surface persists in menubar/background]
                  ↓
            [User works in IDE; can ping-pong to 0/1 surface
             via menubar or hotkey]
                  ↓
            [User closes IDE; returns to pure 0/1 mode]
                  ↓
            [Or: user closes 0/1 entirely; Tauri app sleeps to menubar]
```

The lifecycle is **lazy-load and persist-resume**:
- 0/1 loads first because it's lightweight; the user enters daily-use mode immediately
- IDE loads on-demand; first-load is slower (Theia initialisation) but subsequent open/close is fast (warm-cache)
- Background/menubar/sleep modes preserve state across user-engagement sessions

### §3.2 The 0/1 free-flow surface

The 0/1 surface is the **lightweight daily-use register**:

- **0 side** (visual/contemplative engagement):
  - Personal cymatic field rendering (lightweight mode — not the full deep-engagement IDE render)
  - Agent chat with Nara/Anima (conversational interface; for daily check-in and exchange)
  - Today's daily-note quick-view
  - Brief status display (current tick12, planetary state, etc.)
- **1 side** (writing/expression):
  - Open flow writing space with highlight system (dream / oracle / daily-note / reflection / personal-note / LLM-task / reminder tags)
  - Cron-integrated reminder display
  - Quick journal-entry interface

The 0/1 surface is where the user **lives day-to-day**: morning journal, daily reflection, agent check-in, evening contemplation, oracle-cast if needed. It does NOT carry the full IDE complexity — no graph-explorer, no canon-studio, no deep agentic-orchestration, no plugin-apps.

### §3.3 The IDE surface

The IDE surface is the **deep system-work register**:

- The full 4+2 architectural depth
- The Theia shell with M0+M5 integrated as IDE substrate (per §4.2)
- The 6 + 2 plugin-app architecture (per §4.3-4.4)
- Multi-pane editor, file tree (custom bimba-coordinate-tree provider), command palette, terminal, settings, themes, multi-window
- Where the user goes when **working ON the system** (developing canon, building subsystem capacities, doing contemplative-archaeological work, exploring deep subsystem state, running autoresearch loops)

### §3.4 The omni panel as access mechanism

The **omni panel** is the canonical access mechanism between surfaces. It's a Spotlight/Raycast-style command surface accessible from anywhere:

- From the 0/1 surface: omni panel offers IDE-summoning commands ("open IDE", "open M3 wheel surface", "open Anuttara graph view")
- From the IDE: omni panel offers cross-plugin commands, file-search, conversational-engagement actions
- From menubar/background mode: omni panel offers quick-actions (start journal entry, check current state, request agent chat)

Implementation: native OS hotkey (e.g., Cmd-Space-like) summons the omni panel; the panel queries the live Tauri-app state to surface contextually-relevant commands.

The omni panel is what makes the **two-surface-one-app** architecture feel cohesive: the user never has to think "which app" — they invoke omni panel, the right surface opens (or the right action fires within the current surface).

---

## §4 — Theia as IDE shell + the 6 + 2 plugin-app architecture

### §4.1 Theia chosen as the IDE shell basis

The IDE surface at `/pratibimba/system` is built on **Theia** (`https://theia-ide.org/`) — the Eclipse-Foundation-backed open-source IDE platform.

Rationale:

- **Purpose-built for forking**: Theia is explicitly designed as a framework for building custom IDEs, unlike VSCode which is a product (with extensions) that happens to be open-source. Forking VSCode requires maintaining a divergence from a fast-moving upstream; Theia's design assumes the fork-and-customise use-case.
- **Modular extension API**: Theia's extension model (both VS Code-compatible extensions AND Theia-native extensions) gives both ecosystem-compatibility AND deeper architectural integration than VSCode's API alone permits.
- **Eclipse Foundation backing**: institutional stability for a 5-10 year horizon.
- **Browser + desktop deployment**: same codebase deploys as desktop app (Electron-equivalent) AND browser-based IDE; useful for future server-rendered or shared-IDE-session use-cases.
- **The Ale-theia name-correspondence**: Aletheia is the disclosure-tracking agent in the M5-4 agentic register (the agent that tracks what becomes visible through articulation). The IDE shell that surfaces canon-development work carries the resonant name-correspondence. Not load-bearing technically; load-bearing aesthetically and pedagogically.

Alternatives considered and not chosen: VSCode-fork (excellent ecosystem but maintenance-cost of staying current with upstream; product-shape rather than framework-shape), Tauri-from-scratch with custom IDE features (full control but reinvents IDE-plumbing investment), Atom/Pulsar (community-driven but smaller and less actively-developed than Theia).

### §4.2 M0 + M5 integrated into the IDE shell itself

M0 (Anuttara) and M5 (Epii) are the **implicate-boundary positions** in the manifestational sequence — both are integrative-substrate registers rather than active-prehending domains. They naturally co-resident as the IDE's *integrated holding-and-development substrate*:

- **M0** holds the canonical content: the bimba-map graph, the Anuttara symbolic substrate, all the symbol+formulation_type properties at the node level, the OWL/SHACL inference layer
- **M5** holds the developmental capacity: the canon studio, the agentic-orchestration, the autoresearch spine, the IDE itself

Both are **what the IDE IS**, not what runs *in* the IDE. Concretely, the IDE shell exposes:

- **Bimba-map graph viewer as primary panel** — a custom webview using react-force-graph (or equivalent) with custom relation-family colouring, lens-rotation animation, pulse-on-world-clock-tick, click-to-inspect interactions. This IS the M0 surface; it's not "an extension you open" — it's part of the IDE's primary chrome.
- **Canon studio as primary editor** — markdown editing with custom decorations for QL/bimba-coordinate syntax, embedded notation rendering, formulation-validation. The canon-document-editing experience is integrated into the IDE's main editor area, not a separate plugin.
- **Agentic control room as side panel** — Sophia/Anima/Pi/Aletheia chat interface, review-inbox, spine-state inspector, deposit-flow controls. Always-available as a sidebar/panel.
- **Custom file-tree provider** — instead of (or alongside) the filesystem tree, a bimba-coordinate-tree showing the M-coordinate hierarchy as the primary navigation structure.
- **Logos Atelier as command-palette + dedicated workspace** — etymological-archaeology operations accessible via command palette; deep archaeological work in a dedicated workspace.

Together these are the IDE's *integrated implicit substrate*. The user opens the IDE and is immediately in an environment where M0 (the canonical bimba-map) and M5 (the developmental capacity) are co-resident affordances.

### §4.3 The 6 individual M-extensions

For pedagogical / exploratory engagement with each subsystem individually, six dedicated extensions:

| Extension | Target | Primary surfaces |
|---|---|---|
| **m0-anuttara** | M0 Anuttara | Anuttara language-map browser, OWL/SHACL inspector, R-virtue contemplative interface, archetypal-number-language explorer (with Kabbalah-Sephiroth parallel renderer) |
| **m1-paramasiva** | M1 Paramaśiva | Clock instrument (lens-mode 84-state landscape, K² topology visualisation, audio-genesis controls, Hopf-bundle inspector at M1-5) |
| **m2-parashakti** | M2 Paraśakti | Cymatic engine, planetary-chakral state, 72-fold correspondence-tree browser, MEF lens matrix, Klein-flip visualiser, Ficinian-Kerykeion routing |
| **m3-mahamaya** | M3 Mahāmāyā | Cosmic wheel (360°/720° SU(2)), codon-tarot navigator, 16+1 lens-stack inspector, three-matrix gauge-trio explorer, Janus-doorway temporal-orientation |
| **m4-nara** | M4 Nara | Personal cymatic field (full deep render), journal/flow with full Graphiti integration, identity inspector, Vāma-śakti contemplation, temporal-reading protocols (daily/weekly/period) |
| **m5-epii** | M5 Epii (meta) | Self-referential surfaces; spine-state inspector; review queue; canon-evolution browser; the recursive Epii-on-Epii engagement |

Each is its own Theia extension (or extension-bundle if granularity demands; see §4.5 on granularity).

The pedagogical/exploratory mode: a user can open the m3-mahamaya extension on its own, explore the codon-tarot navigator without invoking the integrated cosmic-engine plugin. Each extension surfaces its subsystem at depth, with full inspector capabilities and contemplative-engagement affordances. **This is the explorable/pedagogical individual register.**

### §4.4 The 2 integrated plugins (inheriting QL context-frame structure)

Beyond the individual extensions, two integrated plugins render multiple subsystems together. They inherit QL context-frame structure per CLAUDE.md §IIIC:

#### §4.4.A The integrated 1-2-3 plugin (Mod 4 — Three Plus One)

The **integrated 1-2-3 plugin** renders **M1 + M2 + M3 together as the full cosmic-engine substrate surface**. This inherits the QL Mod 4 context frame `(0/1/2/3)` — "Three Plus One: Media, Medium, Method".

What it renders:
- **The full tick-clock-solar-system surface** — M3-5 cosmic wheel with M2-5 planetary-chakral state overlaid with M1 audio-genesis tick driving everything
- **The M1-M2-M3 manifestational sequence visible** — Paramaśiva's toroidal recognition (M1-5) emitting the double-track that becomes Paraśakti's vibrational bridge (M2) and Mahāmāya's binary substrate (M3); the K² × T²_Mahāmāya double-torus at M3-5
- **The 16+1 Mahāmāya lens-stack as holographic backdrop** for the wheel
- **The cymatic field rendered at cosmic scale** (not personal scale — that's the M4 extension; here we see the matheme's standing-wave patterns at the system register)
- **The active (lens, mode) cell and (codon, rotation) state** highlighted in their interconnection
- **The Ficinian-Kerykeion routing visible** as live planetary-hour timing

This is the **system-engine view**: the user sees the live cosmic-engine in its full integrated state, where M1's foundational substrate, M2's vibrational play, and M3's symbolic transcription all operate together as one continuous engine. **This is the active-substrate register the user can contemplate as a unified surface.**

#### §4.4.B The integrated 4/5/0 plugin (Mod 6 — Möbius Return Complete)

The **integrated 4/5/0 plugin** renders **M4 + M5 + M0 together as the user-experience integration surface**. This inherits the QL Mod 6 context frame `(5/0)` — "Total synthesis; Möbius return complete".

What it renders:
- **The user-experience-integration surface** — the user's personal Pratibimba (M4 cymatic field) seen against the canonical Bimba (M0 graph as architectural backdrop) with the canon-evolution/Epii integration (M5) operative
- **The Jiva-is-Śiva recognition surface** (per `m4-prime-psychoid-cymatic-field-engine.md` §18.11) — foreground personal cymatic field + background canonical bimba-map + visible BEDROCK linkage + GDS-rendered activity-resonance making *tat tvam asi* possible to see
- **The Epii city-scape backdrop** as architectural-rendered form of the canonical bimba map (per cymatic-field paper §18.4)
- **The Logos Atelier integration** — when contemplative-archaeological work is in progress, the integration surface shows what's being etymologically uncovered
- **The autoresearch spine state** as visible operational continuity

This is the **user-stack integration view**: M4 (Nara as Jiva) and M0 (Anuttara as canonical ground) and M5 (Epii as Möbius return) rendered as one user-facing register. The architectural punchline is the *5→0 of the app itself*: the user's deep engagement with the system culminates in the recognition that the user-as-Nara IS the canonical bimba (Jiva-is-Śiva), with Epii as the return-vector. **This is the user-experience-integration register the user inhabits when working with the system as a whole.**

### §4.5 Granularity decision: each M as one extension; integrated plugins as bundles

Per user direction:

- **Each MX as one extension** (m0-anuttara, m1-paramasiva, ..., m5-epii). Single extension per subsystem keeps the pedagogical/exploratory affordance clean — one focused entity per subsystem the user can engage with individually.
- **The integrated plugins (1-2-3 and 4/5/0) are larger composed bundles** — they orchestrate the relevant individual extensions plus their integration-specific rendering. The 1-2-3 plugin composes m1-paramasiva + m2-parashakti + m3-mahamaya into the unified cosmic-engine surface; the 4/5/0 plugin composes m4-nara + m5-epii + m0-anuttara into the unified user-experience-integration surface.

The individual extensions can run alone (pedagogical mode); they can also be composed by the integrated plugins (active-substrate / user-experience modes). The composition is structural rather than file-system — the integrated plugins import data and surface-elements from the individual extensions and compose them with integration-specific rendering.

This gives the right granularity: not too fine (cymatic-engine + planetary-chakral + maqam-modal as separate plugins would be too granular) and not too coarse (one big "cosmic" plugin covering M1+M2+M3 would lose the individual pedagogical surfaces).

---

## §5 — The kernel-bridge foundational extension

### §5.1 The structural need

The actual engine of the system is the **C-library substrate** — M1', M2', M3' are real computation at `Body/S/S0/epi-lib/` (the `m0.h` / `m1.h` / `m2.h` / `m3.h` headers and their `.c` implementations). The Tauri app's M'-rendered surfaces consume from this engine.

Every M-extension and integrated-plugin needs access to:
- The live kernel profile (`MathemeHarmonicProfile`)
- Live SpaceTimeDB subscriptions (`world_clock`, `pratibimba_presence`, etc. per `alpha_quaternionic_integration_across_M_stack.md` §11)
- Gateway plane RPC (`s5'.improve.*`, `s5'.review.*`, `s5'.epii.*` per autoresearch spine spec §1)
- Direct kernel-trace data (calculation pathways from M3, audio bus from M1, cymatic-field state from M2, etc.)

Without a unified data-availability layer, each M-extension would re-implement its own kernel/SpaceTimeDB/gateway-bridge code, with all the consistency and maintenance problems that implies.

### §5.2 The kernel-bridge contribution

A **foundational Theia extension** named `kernel-bridge` (or equivalent) is the **first-loaded extension** in the IDE. Its responsibilities:

- **Subscribe to the live kernel profile** via the gateway (one subscription per IDE session)
- **Subscribe to SpaceTimeDB state** (`world_clock`, `pratibimba_presence`, `shared_archetype_event`, `coincidence` — per the spec'd tables at `alpha_quaternionic_integration_across_M_stack.md` §11.5; the WebSocket-shared gateway+SpaceTimeDB surface per §11.3)
- **Provide a unified TypeScript API** that all downstream M-extensions and integrated-plugins consume for kernel/state data
- **Cache and distribute** kernel-data updates to subscribers (using Theia's event-bus or equivalent reactive primitives)
- **Handle reconnection** and state-resync transparently
- **Surface the connection-state** in the IDE status bar so the user knows when kernel/SpaceTimeDB is connected/disconnected/resyncing
- **Provide kernel-command dispatch** for downstream extensions needing to invoke gateway RPCs

The kernel-bridge is structurally **the IDE's M5-2 access point**. Per §1.2 above, M5-2 = the S-stack itself; the kernel-bridge is how M5-3 (the Tauri/IDE frontend) reaches into M5-2 (the S-stack backend) for live data.

### §5.3 The downstream extensions consume from kernel-bridge

Each M-extension declares a dependency on `kernel-bridge` and consumes from it. Example interface (conceptual):

```typescript
// Conceptual; real implementation in concrete Theia extension API
interface KernelBridgeAPI {
  // Live profile subscription
  subscribeMathemeHarmonicProfile(callback: (profile: MathemeHarmonicProfile) => void): Disposable;
  
  // SpaceTimeDB table subscriptions
  subscribeWorldClock(callback: (state: WorldClockState) => void): Disposable;
  subscribePratibimbaPresence(callback: (state: PratibimbaPresenceState) => void): Disposable;
  subscribeSharedArchetypeEvents(callback: (events: SharedArchetypeEvent[]) => void): Disposable;
  
  // Gateway RPC dispatch
  invokeGatewayRpc<T>(method: string, args: any): Promise<T>;
  
  // Kernel-trace access (for Mahāmāyā plugin)
  subscribeKernelTraces(callback: (trace: KernelTrace) => void): Disposable;
  
  // Audio bus access (for Paramaśiva and Paraśakti plugins)
  subscribeAudioBus(callback: (bus: AudioBus) => void): Disposable;
  
  // Cymatic field state (for Paraśakti and Nara plugins)
  subscribeCymaticField(callback: (state: CymaticFieldState) => void): Disposable;
  
  // Connection state
  connectionStatus(): ConnectionStatus;
  onConnectionStatusChange(callback: (status: ConnectionStatus) => void): Disposable;
}
```

Each M-extension (m0/m1/m2/m3/m4/m5) and integrated-plugin (1-2-3, 4/5/0) imports this API and consumes the subset relevant to its rendering needs. The kernel-bridge handles the multiplexing, caching, reconnection, and error-recovery.

### §5.4 The kernel-bridge in the 0/1 surface

The lightweight 0/1 free-flow surface (`/body` codebase) **also consumes from the kernel-bridge** — but with a lighter subscription footprint. The 0/1 surface needs:

- Current tick12 and planetary state (for the brief status display)
- Personal Pratibimba state (for the lightweight cymatic-field render)
- Cron-system state (for reminder display)
- Agent-chat dispatch (for Nara/Anima conversation)

The 0/1 surface initialises the kernel-bridge with a `lite-mode` subscription set; the IDE surface (when opened) upgrades to the full-mode subscription set. Both surfaces share the same kernel-bridge instance because they're in the same Tauri app process.

### §5.5 The kernel-bridge is itself an autoresearch surfacing source

Per the autoresearch spine spec §3.2, observation-pipelines surface improvement candidates. The kernel-bridge is structurally well-positioned to be **the observability layer** for the spine's surfacing-phase:

- Every kernel-trace passing through the bridge can be checked for QL-coherence anomalies
- SpaceTimeDB subscription patterns reveal which subsystem-surfaces are most engaged
- Connection-state issues surface as Epii-on-Epii spine-self-observation events
- Cross-subsystem-relation queries reveal where graph-relational learning would benefit

The kernel-bridge's observation-stream feeds the spine's surfacing-pipelines (per spine spec §3.4 — Aletheia-disclosure pipeline pattern generalised). Per-subsystem surfacing pipelines (Anuttara-construction, Paramaśiva-derivational, etc.) implement specific pattern-detection over the kernel-bridge's observation stream.

---

## §6 — The QL context-frame inheritance pattern

This is worth naming explicitly because it makes the 6 + 2 architecture's structural-correctness visible:

Per CLAUDE.md §IIIC, the QL context frames are:

| Context Frame | QL Mode | Description | App-architecture inheritance |
|---|---|---|---|
| `(00/00)` | Mod % | Receptive Dynamism; Absolute Ground | — |
| `(0/1)` | Mod 2 | Non-dual binary layer | The 0/1 free-flow surface itself |
| `(0/1/2)` | Mod 3 | The Trika — User, Agent, Code | The conversational-default UX triad |
| `(0/1/2/3)` | Mod 4 | **Three Plus One — Media, Medium, Method** | **The integrated 1-2-3 plugin** (M1 medium + M2 medium + M3 method, against the prior 0 ground) |
| `(4.0/1-4.4/5)` | Mod 4/6 | Fractal doubling; Jung's Quaternity through #4 Lemniscate | The Nara internal nesting #4.4.4.4 |
| `(5/0)` | Mod 6 | **Total synthesis; Möbius return complete** | **The integrated 4/5/0 plugin** (M4 + M5 + M0; the Möbius return enacted as user-experience integration) |

The 6 + 2 plugin architecture is therefore **the QL context-frame structure made app-architectural**:

- **The 6 individual M-extensions** = the six positional manifestations (one per #-position in the M-family)
- **The integrated 1-2-3 plugin** = the QL Mod 4 context frame instantiated as the cosmic-engine substrate
- **The integrated 4/5/0 plugin** = the QL Mod 6 context frame instantiated as the user-experience integration

This is structurally elegant: the app inherits the matheme's own context-frame composition law. The user navigating the IDE moves between individual-pedagogical mode (opening one M-extension), integrated-substrate mode (opening the 1-2-3 plugin), and integrated-experience mode (opening the 4/5/0 plugin) — each move IS a Mod-change in the QL register.

---

## §7 — How this consolidates across existing specs

### §7.1 The recent specs needing updates

- `M5'-SPEC.md` — annotation that M5-2 IS S-family, M5-3 IS M'-Tauri, M5-4 IS operational-capacities + agentic mediation (per §1.2 above)
- `M'-SYSTEM-SPEC.md` — annotation of the 0/1 + IDE two-surface model; reference to the canon-clarification spec for the full architecture
- `M'-TAURI-PORT-SPEC.md` — substantial update with the 0/1 free-flow + IDE summonable layout discipline; the omni-panel access mechanism; the single-Tauri-app two-surface model
- The six operational-capacity sibling specs at `epii-operational-capacities/` — light updates making M5-2/3/4 attribution concrete (which S-stack components; which M'-Tauri surfaces)
- `m5-prime-autoresearch-self-improvement-loop.md` — annotation that the kernel-bridge is the observability substrate for the spine's surfacing phase; integration-phase mechanism table makes S-stack attribution explicit
- `m4-prime-psychoid-cymatic-field-engine.md` — annotation that the cymatic field renders in the m4-nara plugin-app within the IDE 4+2 register; the lightweight version renders in the 0/1 surface; the deep version is the m4-nara plugin
- All specs touching the Tauri-app layout — reference this canon-clarification spec rather than re-articulating the 0/1 + 4+2 discipline

### §7.2 Net effect on the spec family

After the updates, the spec family reads consistently:
- This canon-clarification spec is the foundational app-architecture statement
- M5'-SPEC, M'-SYSTEM-SPEC, M'-TAURI-PORT-SPEC inherit from it
- The six sibling capacity specs reference its M5-2/3/4 attribution
- The autoresearch spine spec references its kernel-bridge
- The cymatic field engine spec references its plugin-app placement
- Any new spec touching Tauri/IDE/M5-2/3/4 inherits its canon

The terminology unevenness flagged in the recent coherence-check resolves naturally: by anchoring the M5-2/3/4 attribution to concrete S-stack-and-M'-Tauri identities, the abstract-register hovering disappears.

---

## §8 — Implementation milestones (rough sequencing)

This is suggested ordering, not strict timing. Some milestones can proceed in parallel.

### Milestone 1: Code-structure setup

- Create `/pratibimba/system/` directory structure
- Initialise Theia application skeleton (basic Theia browser+electron deployment)
- Verify build pipeline composes `/body` (existing Tauri lightweight) + `/pratibimba/system` (Theia IDE) into one Tauri-app distribution

### Milestone 2: Kernel-bridge foundational extension

- Implement `kernel-bridge` as the first-loaded Theia extension
- Wire SpaceTimeDB WebSocket subscription (per `alpha_quaternionic_integration_across_M_stack.md` §11.3 — first SpaceTimeDB milestone is the native-WebSocket subscription completion)
- Wire gateway RPC dispatch
- Wire MathemeHarmonicProfile subscription
- Define the KernelBridgeAPI interface and publish to downstream extensions
- Connect 0/1 surface to kernel-bridge in lite-mode

### Milestone 3: IDE shell with M0 + M5 integrated

- Bimba-map graph viewer as primary panel (react-force-graph webview)
- Canon studio markdown editor with QL/bimba-coordinate decorations
- Agentic control room as sidebar (chat with Sophia/Anima/Pi/Aletheia)
- Custom bimba-coordinate file-tree provider
- Omni-panel command surface

### Milestone 4: Omni panel + IDE summon mechanism

- Native OS hotkey integration for omni-panel
- IDE-summoning command from omni panel
- 0/1 surface menubar/background mode
- Cross-surface state sharing (kernel-bridge as common substrate)

### Milestone 5: Individual M-extensions (parallel tranches)

- m0-anuttara extension
- m1-paramasiva extension
- m2-parashakti extension
- m3-mahamaya extension
- m4-nara extension (with full cymatic field engine per `m4-prime-psychoid-cymatic-field-engine.md`)
- m5-epii extension (self-referential meta-surface)

### Milestone 6: Integrated 1-2-3 plugin

- Composition of m1 + m2 + m3 extensions
- Full cosmic-engine surface rendering
- Tick-clock-solar-system as unified visualisation
- Ficinian-Kerykeion routing visible

### Milestone 7: Integrated 4/5/0 plugin

- Composition of m4 + m5 + m0 extensions
- User-experience-integration surface
- Jiva-is-Śiva recognition rendering with Epii city-scape backdrop
- Logos Atelier integration

### Milestone 8: Lite-mode kernel-bridge integration for 0/1 surface

- 0/1 surface updates with kernel-bridge consumption (status display, lightweight cymatic field, agent chat dispatch)
- Cron-system integration for reminders/daily-notes
- Highlight-system tagging integrated with Graphiti deposit path

### Milestone 9: Cross-surface deep-link

- 0/1 surface highlights can deep-link into IDE (e.g., tagged "oracle" highlights can open the m3-mahamaya plugin at the relevant codon)
- IDE actions can publish to 0/1 surface (e.g., agentic-suggestion can surface in 0/1 notification)

### Milestone 10: Autoresearch spine observability integration

- Kernel-bridge observability stream feeds spine surfacing-pipelines
- Per-subsystem surfacing-pattern detectors implement against kernel-bridge data
- Spine-state inspector renders in IDE M5-4 agentic control room (per `m5-prime-epii-on-epii-self-referential-capacity.md` §5.4)

---

## §9 — Open implementation questions

These are decisions to make during implementation, not philosophical-architectural questions:

1. **Theia version**: which Theia release branch should the fork start from? Theia 1.x is stable; the more recent versions may have features worth inheriting. Likely answer: pin to a recent stable release (e.g., 1.50+) for initial development; track upstream with deliberate cadence (e.g., quarterly).

2. **Extension-API approach**: Theia supports both VS Code Extension API (for ecosystem compatibility) and Theia-native extensions (for deeper integration). The six M-extensions and two integrated plugins likely want Theia-native to leverage Theia-specific composition primitives; the kernel-bridge could be either. Decision: probably Theia-native throughout for architectural coherence; revisit if specific VS Code extensions become attractive to consume.

3. **Custom UI framework within extensions**: extensions can use React (the Theia default), Vue, Lit, plain DOM, etc. Recommendation: React for consistency with the existing Tauri-app's React substrate; allow individual extensions to deviate when their rendering needs justify (e.g., the m2-parashakti cymatic engine likely wants Three.js + react-three-fiber per the JSX site research at `alpha_quaternionic_integration_across_M_stack.md` §9).

4. **Tauri integration**: Theia is typically Electron-based for desktop; integrating with Tauri-2 (which uses native webview) requires confirming Theia's frontend can run in Tauri's webview. Alternative: run Theia as a local browser application and have Tauri wrap a webview pointing at localhost. Decision pending architectural prototype.

5. **State persistence**: kernel-bridge state, IDE workspace state, agentic-conversation history, etc. need persistence across IDE-sessions. Use Theia's built-in workspace state + custom state-store for specialised data; coordinate with the existing Tauri-app's state-store.

6. **The Pratibimba directory deeper structure**: `/pratibimba/system/` contains the IDE codebase, but the broader `/pratibimba/` directory family might extend to other reflection-surfaces (`/pratibimba/personal/` for personal-Pratibimba data perhaps? — needs decision per privacy-model). Decision deferred to a future organisation-pass.

7. **Plugin/extension publishing model**: are extensions developed in-tree at `/pratibimba/system/extensions/`? Or as separate repositories assembled at build-time? Decision: probably in-tree for the first phase (6 + 2 = 8 plugins all owned and developed in unity); revisit when external plugin contributors become a real consideration.

---

## §10 — What this canon delivers

1. **The M5-2/M5-3/M5-4 trinitarian breakdown is concrete**: M5-2 = S-family stack; M5-3 = M'-Tauri app; M5-4 = operational-capacities + agentic mediation + bridges to S5/S5' Pi-agent and S0/S0' CLI/library. No more abstract-register hovering.
2. **The Siva-Shakti polarity is non-metaphorical at the system register**: S = infrastructure-substrate (Siva); M' = rendered-surface plane (Shakti); their integration at M5 is the operational unity.
3. **The Tauri-app architecture is canonical**: one Tauri app with two surface-modes — lightweight 0/1 free-flow (current `/body` directory) + deep IDE (new `/pratibimba/system` directory built on Theia). Omni panel as access mechanism.
4. **The IDE shell basis is committed**: Theia, with the Ale-theia name-correspondence and the practical advantages (purpose-built for forking, modular extension API, browser+desktop deployment).
5. **The 6 + 2 plugin-app architecture is specified**: six individual M-extensions (one per subsystem) + integrated 1-2-3 plugin (cosmic-engine substrate; QL Mod 4) + integrated 4/5/0 plugin (user-experience integration; QL Mod 6).
6. **M0 + M5 are integrated into the IDE shell itself**: bimba-map graph viewer, canon studio, agentic control room, custom bimba-coordinate file-tree, Logos Atelier — all parts of the IDE's primary chrome rather than separate plugins.
7. **The kernel-bridge foundational extension wires the C-library substrate to all downstream extensions and to the 0/1 surface**, with multiplexing, caching, reconnection handling, and the autoresearch spine observability feed.
8. **The QL context-frame inheritance is structurally visible**: 6 + 2 architecture inherits Mod 4 (`0/1/2/3`) and Mod 6 (`5/0`) context-frame structure as load-bearing architectural-pattern.
9. **The spec family consolidates with consistent terminology**: existing diffusion resolves; downstream specs reference this canon rather than re-articulate.
10. **The implementation path is articulated**: ten ordered milestones from code-structure setup through cross-surface integration through spine observability.

This is the canonical statement. Downstream work — the Theia-architectural plan (`docs/plans/2026-05-31-theia-ide-shell-and-m-plugin-architecture.md`) and the light updates to existing specs — proceed against this canon.

---

## Sources

### Internal canon
- `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md` — canonical M5' sixfold structure
- `Idea/Bimba/Seeds/M/M5'/m5-prime-autoresearch-self-improvement-loop.md` — autoresearch spine spec
- `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/` — six sibling capacity specs
- `Idea/Bimba/Seeds/M/M4'/m4-prime-psychoid-cymatic-field-engine.md` — M4 cymatic field engine + 0/1 + 4+2 layout discipline
- `Idea/Bimba/Seeds/M/alpha_quaternionic_integration_across_M_stack.md` — α-quaternionic integration + SpaceTimeDB at S3' + WebSocket-shared gateway
- `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md`, `M'-TAURI-PORT-SPEC.md`, `M'-PORTAL-SPEC.md`
- `Idea/Bimba/Seeds/S/S5/S5-SPEC.md` — S5 master spec
- `Body/S/S5/epii-autoresearch-core/`, `epii-review-core/`, `epii-agent-core/` — live Rust cores
- `CLAUDE.md` §II-VI — coordinate architecture, context frames, Siva-Shakti polarity, memory arenas

### External
- Theia IDE: `https://theia-ide.org/` and `https://github.com/eclipse-theia/theia`
- Aletheia (the agent name): the disclosure-tracking agent in M5-4 register
- SpaceTimeDB native WebSocket subscription path: existing stub at `Body/S/S0/epi-cli/src/gate/spacetimedb_bridge.rs:603-641` (first SpaceTimeDB milestone per spine spec §11.7)

---

End of canon-clarification spec. The companion Theia-architectural plan at `docs/plans/2026-05-31-theia-ide-shell-and-m-plugin-architecture.md` follows. Light updates to existing specs flow from this canon.
