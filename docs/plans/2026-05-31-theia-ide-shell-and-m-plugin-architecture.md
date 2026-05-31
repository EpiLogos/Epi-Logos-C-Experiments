# Theia IDE Shell + M-Plugin Architecture — Implementation Plan

**Date:** 2026-05-31
**Status:** Architectural plan (pre-implementation)
**Canon-source:** [`Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md`](../../Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md)
**Sibling plans:** [`2026-04-23-vendor-spine-pi-port.md`](2026-04-23-vendor-spine-pi-port.md), [`2026-03-07-m5-epii-implementation.md`](2026-03-07-m5-epii-implementation.md)

---

## §0 — Plan summary

This plan articulates the implementation path for the Theia-based IDE shell at `/pratibimba/system/`, the kernel-bridge foundational extension, the six individual M-extensions, the two integrated plugins (1-2-3 cosmic-engine + 4/5/0 user-experience-integration), and the bridging between the IDE and the existing lightweight 0/1 Tauri app at `/body/`.

**The plan is pre-implementation.** It commits architectural decisions, sequences the build, and surfaces the concrete questions that arise during initial implementation tranches. Actual implementation work happens against this plan as a series of tranches.

**The canon for what is being built** is at `Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md`. This plan handles **how** it gets built; refer to the canon for **what** and **why**.

---

## §1 — Architectural commitments (from canon)

For clarity, the key architectural commitments this plan operates under:

1. **Theia as IDE shell basis** (not VSCode-fork, not Tauri-from-scratch). Forked from a recent Theia stable release; tracked with deliberate cadence.
2. **One Tauri app, two surfaces**: lightweight 0/1 free-flow (current `/body`) loads first; deep IDE (new `/pratibimba/system`) summoned on-demand via omni-panel/command/menubar.
3. **Code separation**: `/body` for the lightweight Tauri app; `/pratibimba/system` for the Theia-based IDE. Both compose into one Tauri-app distribution at build-time.
4. **Plugin granularity**: 6 individual M-extensions (m0/m1/m2/m3/m4/m5) + 2 integrated plugins (1-2-3 cosmic-engine + 4/5/0 user-experience-integration) inheriting QL context-frame structure (Mod 4 + Mod 6 respectively).
5. **Kernel-bridge as foundational extension**: first-loaded; wires SpaceTimeDB + gateway + MathemeHarmonicProfile + kernel-trace data to all downstream extensions and to the 0/1 surface.
6. **M0 + M5 integrated into IDE shell itself**: bimba-map graph viewer, canon studio, agentic control room, custom file-tree, Logos Atelier as IDE chrome (not separate plugins).
7. **M5-2/3/4 attribution**: M5-2 = full S-family stack; M5-3 = full M'-Tauri app; M5-4 = operational-capacities + Pi/Sophia/Anima/Aletheia + bridges to S5/S5' Pi-agent and S0/S0' CLI/library.

---

## §2 — Theia rationale (brief; defer to canon §4.1)

Per canon §4.1, the choice of Theia over alternatives was:

- VSCode-fork rejected: product-shape rather than framework-shape; substantial upstream-divergence maintenance cost
- Tauri-from-scratch rejected: reinvents IDE-plumbing investment; multi-month effort before basic IDE capabilities work
- Theia chosen: purpose-built for forking; modular extension API supporting both VS Code Extension API (ecosystem-compatibility) and Theia-native extensions (deeper integration); Eclipse Foundation institutional backing; browser+desktop deployment; the Ale-theia name-correspondence

What the plan inherits from this choice:

- Theia version: pin to a recent stable release (e.g., 1.50+ or current LTS); track upstream with quarterly cadence
- Extension API approach: Theia-native throughout for architectural coherence; revisit if specific VS Code extensions become attractive to consume
- Frontend framework: React (Theia default; consistent with existing Tauri-app substrate); allow individual extensions to deviate where rendering demands justify (e.g., Three.js + react-three-fiber for m2-parashakti cymatic engine)
- Deployment: Theia desktop-mode wrapped by Tauri (decision pending architectural prototype per §10.1)

---

## §3 — The `/pratibimba/system/` directory structure

### §3.1 Proposed structure

```
/pratibimba/system/
├── README.md                          # IDE codebase overview; pointer to canon
├── package.json                       # Monorepo root (yarn workspaces or pnpm)
├── tsconfig.json                      # Shared TypeScript config
├── lerna.json (or workspace config)   # Monorepo management
├── theia-app/                         # The Theia application bundle
│   ├── package.json                   # Theia browser+electron deployment config
│   ├── electron-main/                 # Electron entry (if Electron-mode chosen)
│   └── frontend/                      # Frontend entry; loads extensions
├── extensions/                        # Theia-native extensions
│   ├── kernel-bridge/                 # Foundational extension (loads first)
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── index.ts              # Extension contribution registration
│   │   │   ├── kernel-bridge-api.ts  # Public TypeScript API
│   │   │   ├── spacetimedb-client.ts # WebSocket client wrapper
│   │   │   ├── gateway-rpc.ts        # Gateway plane RPC dispatch
│   │   │   ├── profile-subscriber.ts # MathemeHarmonicProfile subscription
│   │   │   └── observability-stream.ts # Surfaces kernel events for autoresearch spine
│   │   └── tests/
│   ├── ide-shell-m0-m5/               # M0+M5 IDE chrome extension
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── bimba-graph-viewer/   # react-force-graph webview
│   │   │   ├── canon-studio/         # Markdown editor with QL decorations
│   │   │   ├── agentic-control-room/ # Sophia/Anima/Pi/Aletheia chat panel
│   │   │   ├── bimba-coordinate-tree/ # Custom file-tree provider
│   │   │   ├── logos-atelier/        # Etymological-archaeology workspace
│   │   │   └── omni-panel/           # Native-hotkey-driven command surface
│   │   └── tests/
│   ├── m0-anuttara/                  # M0 Anuttara individual extension
│   ├── m1-paramasiva/                # M1 Paramaśiva individual extension
│   ├── m2-parashakti/                # M2 Paraśakti individual extension
│   ├── m3-mahamaya/                  # M3 Mahāmāyā individual extension
│   ├── m4-nara/                      # M4 Nara individual extension (with cymatic field)
│   ├── m5-epii/                      # M5 Epii self-referential meta-extension
│   ├── plugin-integrated-1-2-3/      # Cosmic-engine integrated plugin
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── index.ts              # Composition of m1+m2+m3 extensions
│   │   │   ├── cosmic-engine-surface.ts  # Integrated rendering
│   │   │   └── ficinian-kerykeion-routing.ts
│   │   └── tests/
│   └── plugin-integrated-4-5-0/      # User-experience integration plugin
│       ├── package.json
│       ├── src/
│       │   ├── index.ts              # Composition of m4+m5+m0 extensions
│       │   ├── user-experience-surface.ts
│       │   ├── jiva-is-siva-recognition-render.ts
│       │   └── epii-city-scape-backdrop.ts
│       └── tests/
├── shared/                            # Cross-extension shared code
│   ├── kernel-types/                  # Shared TypeScript types matching kernel
│   ├── ql-notation-renderer/          # QL/bimba-coordinate notation rendering
│   ├── theia-helpers/                 # Theia-API convenience wrappers
│   └── chakral-color-palette/         # Shared elemental-color quaternion projection
├── docs/                              # IDE-specific developer docs
└── scripts/                           # Build, package, dev-server scripts
```

### §3.2 Naming conventions

- Extensions named `<position>-<subsystem-name>` (e.g., `m3-mahamaya`) for clarity
- Integrated plugins named `plugin-integrated-<positions>` to distinguish from individual extensions
- The kernel-bridge gets no position-prefix (it's foundational, not subsystem-specific)
- The IDE-shell extension is named `ide-shell-m0-m5` to make its M0+M5-integration-into-shell role explicit

### §3.3 Workspace management

Yarn Workspaces or pnpm workspaces for monorepo management. Theia uses Yarn Workspaces canonically; recommendation is to inherit that for compatibility with Theia tooling.

Each extension is its own package with its own `package.json`, declaring dependencies on `@theia/core`, `@theia/filesystem` (etc.), `kernel-bridge`, and any other extensions it depends on.

---

## §4 — The kernel-bridge foundational extension (concrete)

### §4.1 Activation lifecycle

The kernel-bridge extension activates **first** in the Theia extension activation lifecycle. Theia's contribution registration allows declaring activation events; for the kernel-bridge, the activation event is `onStartupFinished` (activates as soon as Theia's core finishes startup, before any user-visible extensions activate).

The activation sequence:

1. Theia core starts
2. Kernel-bridge activates on `onStartupFinished`
3. Kernel-bridge initialises:
   - Spawn `spacetimedb-client` (native WebSocket connection per `alpha_quaternionic_integration_across_M_stack.md` §11.3)
   - Spawn `gateway-rpc` dispatcher
   - Spawn `profile-subscriber`
   - Open observability stream
4. Kernel-bridge publishes its API to the Theia DI container
5. Downstream extensions activate on their conditions; they retrieve the kernel-bridge API from DI and subscribe

If the kernel-bridge fails to initialise (e.g., gateway unavailable, SpaceTimeDB unreachable), it enters a degraded-mode where downstream extensions can subscribe but receive no data; the IDE status bar surfaces the failure state; reconnection happens automatically with backoff.

### §4.2 The `KernelBridgeAPI` interface (concrete)

```typescript
// File: /pratibimba/system/extensions/kernel-bridge/src/kernel-bridge-api.ts

import { Disposable, Event } from '@theia/core';
import { 
  MathemeHarmonicProfile, 
  WorldClockState, 
  PratibimbaPresenceState,
  SharedArchetypeEvent,
  KernelTrace,
  AudioBus,
  CymaticFieldState,
  ConnectionStatus,
} from './kernel-types';

export interface KernelBridgeAPI {
  // ── Live profile subscription ──
  readonly onMathemeHarmonicProfile: Event<MathemeHarmonicProfile>;
  currentMathemeHarmonicProfile(): MathemeHarmonicProfile | undefined;

  // ── SpaceTimeDB table subscriptions ──
  readonly onWorldClock: Event<WorldClockState>;
  currentWorldClock(): WorldClockState | undefined;

  readonly onPratibimbaPresence: Event<PratibimbaPresenceState>;
  currentPratibimbaPresence(): PratibimbaPresenceState | undefined;

  readonly onSharedArchetypeEvents: Event<SharedArchetypeEvent[]>;

  // ── Gateway RPC dispatch ──
  invokeGatewayRpc<T>(method: string, args: unknown): Promise<T>;

  // ── Kernel-trace access ──
  readonly onKernelTrace: Event<KernelTrace>;

  // ── Audio bus access (for m1/m2 extensions) ──
  readonly onAudioBus: Event<AudioBus>;

  // ── Cymatic field state (for m2/m4 extensions) ──
  readonly onCymaticField: Event<CymaticFieldState>;

  // ── Connection state ──
  connectionStatus(): ConnectionStatus;
  readonly onConnectionStatusChange: Event<ConnectionStatus>;

  // ── Observability stream (for autoresearch spine surfacing) ──
  readonly onObservabilityEvent: Event<ObservabilityEvent>;
}

export const KernelBridgeAPI = Symbol('KernelBridgeAPI');
```

Theia's dependency-injection container exposes the kernel-bridge via the `KernelBridgeAPI` symbol; downstream extensions retrieve it via `@inject(KernelBridgeAPI)`.

### §4.3 Data flow specifics

**SpaceTimeDB subscription**: native WebSocket connection per spine spec §11.7 milestone 1. The kernel-bridge wraps `@clockworklabs/spacetimedb-sdk` for the TypeScript client. Subscriptions registered at activation; deltas propagated through Theia's event-bus to subscribers.

**Gateway RPC**: HTTP POST via existing REST surface initially (per `Body/S/S0/epi-cli/src/gate/spacetimedb_bridge.rs:1062`); WebSocket-multiplexed gateway when the WebSocket-shared gateway+SpaceTimeDB surface lands per `alpha_quaternionic_integration_across_M_stack.md` §11.3.

**MathemeHarmonicProfile subscription**: subscription via gateway WebSocket; carries the full kernel profile state per `S0-HARMONIC-POINTER-WEB36-SPEC`.

**Kernel-trace data**: more bandwidth-intensive; subscription is opt-in by downstream extensions (only m3-mahamaya and the autoresearch spine observability layer subscribe by default).

**Audio bus data**: real-time; opt-in subscription (m1, m2, integrated 1-2-3 plugin subscribe; m4 subscribes when active cymatic-field render needs frequency-stack input).

**Cymatic field state**: derived; computed by the kernel-bridge from audio bus + Q_composed + planetary-chakral state; cached and broadcast to subscribers (m2 and m4 are primary consumers).

### §4.4 Observability stream for autoresearch spine

Per canon §5.5, the kernel-bridge is structurally positioned as observability source for the autoresearch spine's surfacing-phase. The `onObservabilityEvent` event publishes:

- Connection-state changes (Epii-on-Epii surfacing input)
- SHACL violation events (Anuttara-construction surfacing input)
- Kernel-trace QL-coherence anomalies (Mahāmāya-calculation surfacing input)
- Cross-subsystem relation instantiation events (Paraśakti-relational surfacing input)
- RAG-retrieval-gap detections (Paramaśiva-derivational surfacing input)
- Dialogue-voice-drift detections from M4 (Nara-dialogic surfacing input)

The autoresearch spine spec's per-subsystem surfacing pipelines (per spine spec §3.2) consume from this stream and apply pattern-detection.

---

## §5 — The ide-shell-m0-m5 extension (concrete)

### §5.1 IDE chrome contributions

Theia exposes contribution points for chrome-level UI; the `ide-shell-m0-m5` extension registers:

- **`bimba-graph-viewer`**: a `View` contribution placing the bimba-map graph in the right-side panel by default. React webview using `react-force-graph-2d` (or `react-force-graph-3d` for the 3D mode); subscribes to kernel-bridge for tick-pulse data per `M0'-SPEC` §6 and the cymatic-field paper §18.10.
- **`canon-studio`**: a custom `EditorOpenerOptions` for `.md` files with the bimba-vault frontmatter convention. Uses Monaco (Theia's editor backend) with custom decorations for QL/bimba-coordinate syntax.
- **`agentic-control-room`**: a `View` contribution placing the agentic chat panel in the left-side panel by default. Custom React UI with Sophia/Anima/Pi/Aletheia chat tabs; integrates with `s5'.review.*` gateway endpoints for review-inbox; surfaces spine-state per `m5-prime-epii-on-epii-self-referential-capacity.md` §5.4.
- **`bimba-coordinate-tree`**: a custom `TreeWidget` or file-tree-provider showing M-coordinate hierarchy as primary navigation. Uses kernel-bridge to query S2 Neo4j for the M-coordinate structure.
- **`logos-atelier`**: a `Command` contribution + dedicated workspace for etymological-archaeology work. Command-palette accessible; opens dedicated workspace when invoked.
- **`omni-panel`**: a `KeybindingContribution` registering the native hotkey (e.g., `Cmd-Shift-P` or `Alt-Space`); summons a custom quick-input UI with command-search across the entire IDE + cross-surface actions.

### §5.2 Co-residence with individual extensions

When m0-anuttara individual extension is also active, the IDE-shell's `bimba-graph-viewer` and m0-anuttara's deep-engagement surfaces co-exist: the shell-level viewer provides quick-access navigation; the m0-anuttara extension provides deep Anuttara-language-development surfaces (the canon studio for Anuttara-specific articulations, the OWL/SHACL inspector, the R-virtue contemplative interface).

Similarly when m5-epii individual extension is active: the IDE-shell's agentic-control-room handles agentic-chat across all subsystems; m5-epii provides deep meta-engagement (Epii-on-Epii articulations, recursive spine refinement work).

The shell + individual-extension model is intentional: the shell gives always-available substrate; individual extensions give deep-engagement when needed.

---

## §6 — The six individual M-extensions (scope each)

### §6.1 m0-anuttara

**Primary surfaces**:
- Anuttara language-map browser (rendering of `docs/datasets/anuttara-deep/anuttara-language-map.md` as navigable surface)
- OWL/SHACL inspector (visualises the formal-language lifting per `m5-prime-epii-on-anuttara-language-development.md` §5)
- R-virtue contemplative interface (the 9 R-virtues at M0-2-9 with their formal SHACL shapes and philosophical articulations)
- Archetypal-number-language explorer (M0-3 with Kabbalah-Sephiroth parallel renderer)
- Symbolic-numerical parser (the M0-3 register acting on codon-numbers, hexagram-numbers, planetary degrees, gematria values)

**Dependencies**: `kernel-bridge` for S2 Neo4j queries via gateway; `shared/ql-notation-renderer` for symbol/formulation rendering.

**Sibling-spec reference**: `m5-prime-epii-on-anuttara-language-development.md`.

### §6.2 m1-paramasiva

**Primary surfaces**:
- Clock instrument (M1-5 toroidal recognition rendering with 720° SU(2) double-cover; lens-mode 84-state landscape navigator)
- K² topology visualisation (Klein-double-cover-of-chromatic-fifths-torus as 3D rendering)
- Audio-genesis controls (subscribe to audio bus; control audio output; visualise audio_octet[8] + nodal_quartet[4])
- Hopf-bundle inspector (S³ → S² → S¹ projection visualisation at M1-5)
- QL theory corpus browser (CPT corpus inspection per `m5-prime-epii-on-paramasiva-ql-cpt-and-rag.md` §5)

**Dependencies**: `kernel-bridge` for MathemeHarmonicProfile and audio bus subscriptions; Three.js + react-three-fiber for 3D K² topology rendering.

**Sibling-spec reference**: `m5-prime-epii-on-paramasiva-ql-cpt-and-rag.md`.

### §6.3 m2-parashakti

**Primary surfaces**:
- Cymatic engine (Chladni standing-wave rendering driven by audio bus + medium-tuning from q_Nara per cymatic field engine spec §5)
- Planetary-chakral state inspector (live M2_PLANET_LUT + EarthBodyState with Cousto-Hz frequencies)
- 72-fold correspondence-tree browser (the Maqam / Shem / Asma / mantra / planet / MEF cross-axis at M2'-SPEC §8)
- MEF lens matrix (12 lenses × 6 positions = 72 cells; pulse driven by resonance72 from profile)
- Klein-flip visualiser (the L↔L' meaning-flip enactment per M2'-SPEC §7)
- Ficinian-Kerykeion routing display (per M2'-SPEC §9 with live Kerykeion data)

**Dependencies**: `kernel-bridge` for audio bus, cymatic-field state, planetary-chakral state; Three.js + react-three-fiber for cymatic rendering; `shared/chakral-color-palette` for elemental colour quaternion.

**Sibling-spec reference**: `m5-prime-epii-on-parashakti-graph-relational-ml.md`.

### §6.4 m3-mahamaya

**Primary surfaces**:
- Cosmic wheel (360°/720° SU(2) double-covering wheel with 16+1 Mahāmāya lens-stack as concentric backdrop per cymatic field engine §6)
- Codon-tarot navigator (64 codons / 56+8 Tarot compression / 472-state modal-inversion landscape)
- Three-matrix gauge-trio explorer (the i/j/k quaternion-axis assignment from `M3_MATRIX_QUATERNION_AXIS` per `alpha_quaternionic_integration_across_M_stack.md` §2)
- Janus-doorway temporal-orientation viewer (every codon-rotation as temporal-doorway per cymatic field engine §10.1)
- Codon-quaternion inspector (4-charge `pp + mm + mp + pm = 4X` with elemental projection)
- DET projection viewer (M2-5 9:8 epogdoon → M3-0 64-bit reception)

**Dependencies**: `kernel-bridge` for kernel-trace and profile; Three.js + react-three-fiber for cosmic wheel rendering.

**Sibling-spec reference**: `m5-prime-epii-on-mahamaya-process-reward-rl.md`.

### §6.5 m4-nara

**Primary surfaces**:
- **Personal cymatic field (deep render)** — the full M4 psychoid cymatic field engine per `m4-prime-psychoid-cymatic-field-engine.md`. Three.js + react-three-fiber; dipyramid + Hopf-linked tori + chakra assemblage points + colour quaternion projection + sound output
- Journal/flow surface with full Graphiti integration (open writing space + highlight-system tagging per cymatic field engine §6.8.4.F)
- Identity inspector (q_Nara, current Q_composed, resonance metric, bioquaternion decomposition)
- Vāma-śakti contemplation interface (per `ql-unit-vama-shaktis-vameshvari.md` — the Shaktopāya operative wheel as contemplative-engagement surface)
- Temporal-reading protocols (daily/weekly/lunar/solar-arc/period readings as trajectory through psychoid field per cymatic field engine §9)
- Graphiti episodic browser (privacy-bounded; per `m4-prime-nara-activity-graphiti-instrument.md`)

**Dependencies**: `kernel-bridge` for cymatic-field state, planetary-chakral state, profile; Three.js + react-three-fiber; Graphiti sidecar at port 37778; `shared/chakral-color-palette`.

**Sibling-spec reference**: `m5-prime-epii-on-nara-qlora-dialogic-voice.md`.

### §6.6 m5-epii (self-referential meta-extension)

**Primary surfaces**:
- Recursive Epii-on-Epii engagement (per `m5-prime-epii-on-epii-self-referential-capacity.md`)
- Spine-state inspector (per that sibling §5.4 — the structurally-required transparency for recursive-system evolution)
- Review queue (full Epii review-inbox surface; deep engagement with Sophia/Anima/Pi/Aletheia)
- Canon-evolution browser (versioned record of M5 canon's own evolution)
- Self-referential meta-conversation interface (the user works on Epii itself through this surface)

**Dependencies**: `kernel-bridge` for gateway RPC to `s5'.review.*` and `s5'.improve.*`; integrates tightly with `ide-shell-m0-m5`'s agentic-control-room.

**Sibling-spec reference**: `m5-prime-epii-on-epii-self-referential-capacity.md`.

---

## §7 — The two integrated plugins (composition specifics)

### §7.1 plugin-integrated-1-2-3 (cosmic-engine substrate; QL Mod 4)

**Composition**: imports and composes m1-paramasiva + m2-parashakti + m3-mahamaya extensions into one unified surface.

**Surface**:
- Single multi-pane layout with M1 / M2 / M3 individual surfaces visible simultaneously, choreographed
- Cosmic wheel (M3-5) as central element with M2 lens-stack as backdrop and M1 toroidal recognition active
- Ficinian-Kerykeion routing visible as live timing
- Tick-clock advances continuously; all three subsystems synchronised
- The double-torus formalism (K² × T²_Mahāmāya) at M3-5 rendered with both tori visible

**Why integrated**: the user contemplating the cosmic-engine wants to see M1 + M2 + M3 *together as one unified instrument*, not switch between individual extensions. The integrated rendering shows the manifestational sequence M1 → M2 → M3 as one continuous engine, with the QL Mod 4 context-frame structure visible.

**Activation**: opens as its own Theia workspace-mode or as a command (e.g., "Open Cosmic Engine View"). When active, individual M1/M2/M3 extensions are inhibited from claiming the same screen real estate (or operate in mini-mode as inspector-side-panels alongside the integrated rendering).

### §7.2 plugin-integrated-4-5-0 (user-experience integration; QL Mod 6)

**Composition**: imports and composes m4-nara + m5-epii + m0-anuttara extensions into one unified surface.

**Surface**:
- Personal cymatic field (M4) as foreground; canonical bimba-map (M0) rendered as architectural-knowledge background — the Epii city-scape backdrop
- BEDROCK linkage from Pratibimba PersonalNexus to canonical #4 rendered as visible axial line
- GDS-rendered activity-resonance (user's recent activity-trace as luminous dots in canonical map; archetypal cluster as field-glow)
- Logos Atelier integration when contemplative-archaeological work is in progress
- Autoresearch spine state visible as operational continuity
- The Jiva-is-Śiva recognition surface per cymatic field engine §18.11

**Why integrated**: the user-experience integration is what makes Jiva-is-Śiva *visible to see*. Microcosm and macrocosm rendered together; the recognition isn't theoretical but contemplatively-encountered through the visual co-presence.

**Activation**: opens as its own Theia workspace-mode or as a command (e.g., "Open Jiva-Śiva Integration"). When active, individual M4/M5/M0 extensions operate in supporting-inspector mode.

### §7.3 The composition mechanism

Theia's contribution model supports plugin composition through:
- Shared services (multiple extensions injecting and consuming common services)
- View composition (an extension can compose other extensions' views into a meta-view)
- Workspace customisation (an extension can customise the workspace layout to bring specific views together)

The integrated plugins use a combination: they declare their composed-from extensions as dependencies; on activation they coordinate to render the unified surface; individual-extension surfaces remain available as fallback when the integrated plugin is not active.

---

## §8 — The 0/1 ↔ IDE bridging

### §8.1 Shared kernel-bridge instance

Per canon §5.4, the 0/1 surface and the IDE surface share the same Tauri-app process and the same kernel-bridge instance. The kernel-bridge supports lite-mode (for 0/1) and full-mode (for IDE) subscription patterns; subscribers in each mode receive only the data their mode needs.

### §8.2 The omni panel as cross-surface command surface

Per canon §3.4, the omni panel summoned via native OS hotkey from anywhere. Implementation:

- Tauri-level hotkey registration (`tauri-plugin-global-shortcut` or equivalent)
- On hotkey, Tauri shows a custom always-on-top window with the omni-panel UI
- Omni-panel queries live Tauri-app state to surface contextually-relevant commands
- Commands include: IDE-summoning ("open IDE"), cross-surface actions ("start journal entry", "check current state"), in-current-surface commands

The omni panel is implemented as a tiny dedicated Tauri window separate from both the 0/1 surface window and the IDE window; it's lightweight and ephemeral.

### §8.3 Menubar / background mode

When the user closes the IDE window but keeps the Tauri app running, the 0/1 surface persists in menubar mode. Menubar offers:
- Quick-actions (start journal entry, check state, agent chat)
- "Open IDE" to summon the IDE surface back
- "Quit" to fully exit the app

When the user closes the 0/1 surface entirely, the Tauri app sleeps to menubar (no main window visible; menubar icon present). The kernel-bridge maintains its subscriptions in the background for prompt resume.

### §8.4 Deep-link cross-surface actions

Per canon Milestone 9: highlights in the 0/1 surface can deep-link into the IDE. Example:
- User writes a journal entry in 0/1 surface
- User highlights a passage and tags it as "oracle"
- The Nara-dialogic surfacing pipeline (per autoresearch spine spec §3.2) creates an improvement-candidate
- The candidate surfaces in the 0/1 notification area as "Open in IDE to explore"
- User clicks; IDE opens with m4-nara extension active at the relevant context

Implementation: deep-link URLs (`epi-logos://ide/m4-nara/context?...`) handled by Tauri's URL-scheme registration; routing logic in the IDE shell.

---

## §9 — Build pipeline (one Tauri app from two directories)

### §9.1 Build-time composition

The Tauri-app build process composes both directories:

```
Build step 1: /body/
  - cd /body
  - yarn build (builds the lightweight 0/1 surface into /body/dist/)
  - Output: /body/dist/index.html + assets

Build step 2: /pratibimba/system/
  - cd /pratibimba/system
  - yarn install (composes all extensions into the Theia bundle)
  - yarn theia build (Theia's build process — webpack with extension bundling)
  - Output: /pratibimba/system/theia-app/dist/ with the full Theia browser-mode bundle

Build step 3: Tauri composition
  - Tauri's source-dir configuration includes both /body/dist/ and /pratibimba/system/theia-app/dist/
  - Tauri's frontend-routing determines which surface loads (0/1 by default; IDE on summon)
  - Tauri build produces one bundled application (dmg/msi/AppImage)
```

### §9.2 Routing within the Tauri app

The Tauri app's main webview loads `/body/dist/index.html` by default (the 0/1 surface). When IDE is summoned:
- Either: a new webview opens loading `/pratibimba/system/theia-app/dist/index.html`
- Or: the existing webview navigates to the IDE path

Decision pending architectural prototype (see §10.2): single-webview navigation is simpler architecturally but loses the ability to keep both surfaces running simultaneously; multi-webview is more complex but supports persistent 0/1 + IDE co-existence.

### §9.3 Theia desktop-mode vs browser-mode wrapping

Theia supports two deployment modes:
- **Electron-based desktop mode**: Theia bundles its own Electron process
- **Browser mode**: Theia runs as a web application served by a local server; can be loaded in any browser (or webview)

For our Tauri integration, the **browser mode** is preferable because it lets Tauri's webview load the Theia app without spawning a separate Electron process. Architectural prototype needed to confirm Tauri webview can handle Theia's browser-mode requirements (workers, ServiceWorker, IndexedDB, etc.).

If browser-mode-in-Tauri-webview is technically problematic, fall back to: Tauri spawns local Theia server process, Tauri webview loads `http://localhost:<port>/` showing the Theia browser-mode UI.

---

## §10 — Open architectural questions (decisions needed during prototype)

### §10.1 Tauri webview vs Theia Electron

Can Tauri's webview (Wry/WebKit) handle Theia's browser-mode requirements? If yes, fully integrated single-app deployment. If no, either:
- Run Theia in Electron as a separate process spawned by Tauri (less elegant; two processes; coordination overhead)
- Run Theia as local-server browser-mode loaded in Tauri webview (requires local-server-on-localhost which is a permission/security concern but typically acceptable for dev/desktop apps)

**Resolution path**: 1-2 day architectural prototype testing Theia browser-mode in Tauri-2 webview with minimum-viable setup.

### §10.2 Single-webview navigation vs multi-webview persistence

When user summons IDE from 0/1 surface:
- **Single-webview**: existing webview navigates to IDE; 0/1 surface state must be persisted and restored on return
- **Multi-webview**: new webview opens; both surfaces co-exist in different windows

Multi-webview better supports the canon's "0/1 persists in menubar/background while IDE open" model. Single-webview is simpler but breaks the persistent-co-existence model.

**Recommendation**: multi-webview. **Resolution path**: confirm Tauri-2 multi-window support handles the shared-state requirements cleanly.

### §10.3 Theia version pin

Which Theia release to start the fork from? Recommendation: most recent stable LTS (currently 1.50+ as of the plan's date). **Resolution path**: review current Theia release notes; pin to a release with no known blocking issues for our use-case.

### §10.4 Theia-native vs VS Code Extension API

For each extension, which API surface to use? Recommendation: Theia-native throughout for architectural coherence. **Resolution path**: build kernel-bridge in Theia-native; build first M-extension (m0-anuttara as simplest) in Theia-native; evaluate maintenance and capability vs VS Code Extension API alternative; commit one way for consistency.

### §10.5 Extension hosting model

In-tree (all 8 extensions in `/pratibimba/system/extensions/`) vs separate repos pulled at build-time? Recommendation: in-tree for phase 1; revisit when external plugin contributors become a real consideration.

### §10.6 State persistence across IDE sessions

- Theia workspace state (built-in)
- Custom state for: agentic-conversation history, m4-nara journal drafts, integrated-plugin layouts, etc.
- Coordination with existing Tauri-app state-store

**Resolution path**: enumerate state-categories; decide which use Theia built-in vs custom store; align with privacy-class constraints (Pratibimba content stays local-protected).

---

## §11 — Initial tranche specification (phase 1)

The first concrete implementation tranche, sequenced for early proof-of-concept:

### Tranche 1.1: Architectural prototype (1 week)

- Spawn `/pratibimba/system/` directory structure
- Initialise Theia 1.50+ application skeleton (browser-mode)
- Confirm Theia browser-mode loads in Tauri-2 webview (resolves §10.1)
- Confirm multi-webview model supports persistent 0/1 + IDE co-existence (resolves §10.2)
- Output: a "Hello, Theia from Tauri" proof-of-concept

### Tranche 1.2: Kernel-bridge MVP (2-3 weeks)

- Implement `kernel-bridge` extension with minimum-viable subscriptions:
  - SpaceTimeDB native WebSocket connection
  - Gateway RPC dispatch (REST initially)
  - MathemeHarmonicProfile subscription
- Publish `KernelBridgeAPI` via Theia DI
- Connect 0/1 surface (in `/body`) to kernel-bridge for lite-mode subscriptions
- Verify cross-surface state-sharing: data change in kernel reflects in both 0/1 and IDE

### Tranche 1.3: IDE shell with bimba-graph-viewer (2-3 weeks)

- Implement `ide-shell-m0-m5` extension with bimba-graph-viewer as the primary visible feature
- React-force-graph webview consuming kernel-bridge for tick-pulse data
- Custom bimba-coordinate file-tree provider
- Basic command palette + omni-panel summon
- Output: opening the IDE shows a live bimba-map graph view

### Tranche 1.4: Canon studio + agentic-control-room (2-3 weeks)

- Markdown editor with QL/bimba-coordinate decorations
- Agentic chat panel with Sophia/Anima/Pi/Aletheia tabs
- `s5'.review.*` integration for review-inbox surfacing
- Output: working IDE for canon-development conversations

### Tranche 1.5: First M-extension (m0-anuttara, 2-3 weeks)

- Anuttara language-map browser
- OWL/SHACL inspector (basic; depends on neosemantics integration per `m5-prime-epii-on-anuttara-language-development.md`)
- R-virtue contemplative interface
- Output: first deep-engagement M-extension working

### Tranche 1.6: Phase-1 review and replan

- Review what's been built; what worked; what needs rework
- Plan phase 2 tranches (remaining M-extensions; integrated plugins; cross-surface deep-linking)
- Update this plan with phase-2 details

---

## §12 — Success criteria

The implementation succeeds when:

1. **The two-surface model works**: 0/1 free-flow surface and IDE surface co-exist in one Tauri app, with menubar/background mode for the 0/1 when IDE is foreground
2. **Omni-panel access works**: hotkey-summon shows omni-panel; IDE-summoning command opens the IDE; the user never has to think "which app"
3. **Kernel-bridge provides unified data substrate**: all extensions consume from one API; data changes propagate consistently across all surfaces; reconnection handles transparently
4. **IDE shell integrates M0 + M5 as primary chrome**: bimba-graph-viewer, canon studio, agentic-control-room are always-available; the user opens the IDE and is immediately in canonical-development-substrate
5. **Six individual M-extensions provide pedagogical depth**: each is its own focused entity the user can engage with individually
6. **Two integrated plugins provide unified-substrate engagement**: 1-2-3 cosmic-engine and 4/5/0 user-experience-integration render multi-subsystem surfaces coherently
7. **The Tauri-app build produces one distributable artefact**: dmg/msi/AppImage that includes both surfaces; user installation experience is single-app
8. **The autoresearch spine consumes from kernel-bridge observability**: per-subsystem surfacing pipelines read from the observability stream and surface improvement candidates
9. **Deep-link cross-surface actions work**: 0/1 highlights can deep-link into IDE; IDE actions can publish to 0/1 surface
10. **State persistence across sessions**: closing and reopening the app restores the user's working state

---

## §13 — Plan delivery summary

This plan articulates:

1. The directory structure (`/pratibimba/system/` with extensions/, shared/, theia-app/, etc.)
2. The kernel-bridge foundational extension with concrete API and data-flow specifics
3. The IDE-shell-m0-m5 extension with concrete contribution points
4. Each of the 6 individual M-extensions with their primary surfaces and dependencies
5. The 2 integrated plugins with composition mechanisms
6. The 0/1 ↔ IDE bridging via shared kernel-bridge + omni panel + menubar mode + deep-links
7. The Tauri build pipeline composing both directories into one distribution
8. The 6 open architectural questions to resolve during prototype
9. The initial implementation tranche (1.1-1.6 with ~10-13 weeks of focused phase-1 work)
10. The 10 success criteria for the implementation

The plan is **pre-implementation, architecturally-substantive, decision-deferred-where-prototype-is-needed**. Phase 2 (post-MVP) tranche planning happens after tranche 1.6 review.

---

End of plan. Implementation tranche 1.1 (architectural prototype) is the immediate next concrete action when implementation work begins. The canon at `Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md` governs the architectural fidelity all tranches must respect.
