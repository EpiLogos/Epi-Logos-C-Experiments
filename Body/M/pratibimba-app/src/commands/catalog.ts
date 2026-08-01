/**
 * Coordinate: M' (command catalog — completeness source-of-truth, rerun 31.T31.2)
 * Residency: Body/M/pratibimba-app/src/commands
 * Position (#n): #4 -- Context/Type
 * Actualises: the declarative manifest of EVERY command registered on the
 *   single command registry (`registry.ts`). One frozen row per live command
 *   (id, title, owner-surface, declaring-tranche). This file is the command
 *   source-of-truth; `catalog.test.ts` is the no-orphan / no-drift gate that
 *   holds it in lockstep with the real register sites (AST of the source +
 *   the M0_LAYER_ROUTES data table), both directions. The Theia six-extension
 *   command surface (~60 ids) collapsed into this carrier's faces/panes; this
 *   catalogs EXACTLY what the carrier registers — no more, no less.
 * Public surface: CatalogCommand, COMMAND_CATALOG.
 * Does NOT own: what commands do (their owners register them), palette
 *   rendering, action-surface placement, or command execution.
 * Contract: [[CHROME-CONTRACT]] sections 3 and 10 (the no-orphan gate).
 */

/** One catalogued command: identity plus honest provenance metadata. */
export interface CatalogCommand {
    /** The registered `AppCommand.id` (registry key). */
    readonly id: string;
    /** The registered `AppCommand.title` (palette label), verbatim. */
    readonly title: string;
    /** The surface/module that registers and owns this command. */
    readonly owner: string;
    /** The tranche that declared it (git/header-verified where available;
     *  `phase-1` = the Sprints 1-8 carrier bootstrap commit a31c5187, which
     *  has no finer rerun-tranche granularity). */
    readonly tranche: string;
}

/**
 * The complete command catalog. Every row corresponds to a command that is
 * really registered by a real register site:
 *   - App.tsx shell chrome (10)     — `commands.register({...})` on App mount
 *   - src/commands/atelier.ts (6)   — `registerAtelierCommands` (16.T16.19 + 26.T26.3)
 *   - src/engine/modulation (5)     — `registerEngineCommands` (E3)
 *   - src/commands/crossLayoutIntent (1) — `registerCrossLayoutIntentCommand` (31.T31.10)
 *   - src/commands/omnipanelTabChords (8) — `registerOmnipanelTabActivationCommands` (31.T31.3, CCT-4)
 *   - src/commands/theme.ts (8)     — `registerThemeCommands` (30.T30.4)
 *   - src/commands/layout.ts (3)    — `registerLayoutCommands` (52.T3)
 *   - src/commands/subsystem.ts (6) — `registerSubsystemCommands` (52.T5)
 *   - src/ui/leftSidebarModes.ts (5) — data-driven over LEFT_SIDEBAR_MODES;
 *     `registerLeftSidebarModeCommands` wired by App.tsx since 52.T6
 *   - src/commands/walkthrough.ts (1) — `registerWalkthroughCommand` (32.T32.3)
 *   - src/panes/M0LayerRail.tsx (4) — data-driven over M0_LAYER_ROUTES local layers (01.T1.1)
 *   - src/panes/coordinateTree/coordinateTreeCommands.ts (6) — data-driven over
 *     COORDINATE_TREE_FAMILY_ROOTS × FAMILY_NAMES (28.T28.6)
 * `registerLeftSidebarModeCommands` was dead code (declared, no caller) until
 * 52.T6 wired it into App.tsx — its five rows are catalogued below and the
 * gate now proves the factory IS called and reconstructs the family from
 * `LEFT_SIDEBAR_MODES` itself.
 */
export const COMMAND_CATALOG: readonly CatalogCommand[] = Object.freeze([
    // --- App.tsx shell chrome (registered on App mount) ---
    { id: 'face.toggle', title: 'Shell: Toggle 0/1 face (⌘.)', owner: 'shell', tranche: 'phase-1' },
    { id: 'palette.toggle', title: 'Shell: Command palette (⌘⇧P)', owner: 'shell', tranche: 'phase-1' },
    { id: 'vault.open', title: 'Vault: Open file…', owner: 'vault', tranche: 'phase-1' },
    {
        id: 'gateway.restart',
        title: 'Gateway: Restart under supervision',
        owner: 'gateway-supervisor',
        tranche: 'phase-1'
    },
    {
        id: 'instrument.toggleMute',
        title: 'Instrument: Toggle sound (kernel audio bus)',
        owner: 'instrument',
        tranche: 'phase-1'
    },
    {
        id: 'journal.beginToday',
        title: 'Journal: Begin today (anchor the day)',
        owner: 'journal',
        tranche: 'phase-1'
    },
    {
        id: 'journal.startFirstSession',
        title: 'Journal: Start first session',
        owner: 'journal',
        tranche: 'phase-1'
    },
    {
        id: 'identity.openWizard',
        title: 'Identity: Open PASU setup wizard',
        owner: 'identity',
        tranche: '25.T25.4'
    },
    {
        id: 'omnipanel.toggle',
        title: 'Shell: Toggle / membrane (⌘⇧O)',
        owner: 'shell',
        tranche: 'phase-1'
    },
    {
        id: 'omnipanel.openReview',
        title: 'Review: Open OmniPanel review fold',
        owner: 'omni-review',
        tranche: 'phase-1'
    },

    // --- src/commands/atelier.ts (registerAtelierCommands) ---
    {
        id: 'atelier.etymologyRoot',
        title: 'Atelier: Etymology root — trace this coordinate to its gnostic root',
        owner: 'atelier',
        tranche: '26.T26.3'
    },
    {
        id: 'atelier.scentFollow',
        title: 'Atelier: Scent-follow — stage this note as a Hen candidate',
        owner: 'atelier',
        tranche: '16.T16.19'
    },
    {
        id: 'atelier.cognateSearch',
        title: 'Atelier: Cognate search — semantic neighbours of this note',
        owner: 'atelier',
        tranche: '16.T16.19'
    },
    {
        id: 'atelier.semanticDrift',
        title: 'Atelier: Semantic drift — layered gnostic retrieval of sense drift',
        owner: 'atelier',
        tranche: '26.T26.3'
    },
    {
        id: 'atelier.psychoidTrace',
        title: 'Atelier: Psychoid trace — Anuttara grammatical tracing',
        owner: 'atelier',
        tranche: '16.T16.19'
    },
    {
        id: 'atelier.prosHen',
        title: 'Atelier: Pros-hen synthesis — toward-the-One Klein-V4 pull',
        owner: 'atelier',
        tranche: '26.T26.3'
    },

    // --- src/engine/modulation/engine.ts (registerEngineCommands, E3) ---
    {
        id: 'engine.pauseToggle',
        title: 'Engine: Pause / resume the choreography (scrub)',
        owner: 'engine',
        tranche: 'E3'
    },
    { id: 'engine.stepBack', title: 'Engine: Step one tick back (scrub)', owner: 'engine', tranche: 'E3' },
    {
        id: 'engine.stepForward',
        title: 'Engine: Step one tick forward (scrub)',
        owner: 'engine',
        tranche: 'E3'
    },
    {
        id: 'engine.cycleDivision',
        title: 'Engine: Cycle the 16 clock division apertures',
        owner: 'engine',
        tranche: 'E3'
    },
    {
        id: 'engine.toggleGroundGearing',
        title: 'Engine: Toggle Fibonacci Ground gearing (60-fold, the +1 aperture)',
        owner: 'engine',
        tranche: 'E3'
    },

    // --- src/commands/crossLayoutIntent.ts (registerCrossLayoutIntentCommand) ---
    {
        id: 'pratibimba.intent.dispatch',
        title: 'Shell: Dispatch cross-layout intent',
        owner: 'cross-layout',
        tranche: '31.T31.10'
    },

    // --- src/panes/omni/omnipanelIntentRouter.ts (OMNIPANEL_INTENT_ROUTE_COMMAND) ---
    {
        id: 'omnipanel.intent.route',
        title: 'OmniPanel: Route cross-layout intent to a fold',
        owner: 'omnipanel-shell',
        tranche: '27.T27.9'
    },

    // --- src/commands/omnipanelTabChords.ts (registerOmnipanelTabActivationCommands, CCT-4) ---
    { id: 'omnipanel.tab.activate.0', title: 'OmniPanel: Activate the Pi tab (⌘1)', owner: 'omnipanel-shell', tranche: '31.T31.3' },
    { id: 'omnipanel.tab.activate.1', title: 'OmniPanel: Activate the Sessions tab (⌘2)', owner: 'omnipanel-shell', tranche: '31.T31.3' },
    { id: 'omnipanel.tab.activate.2', title: 'OmniPanel: Activate the Dispatch tab (⌘3)', owner: 'omnipanel-shell', tranche: '31.T31.3' },
    { id: 'omnipanel.tab.activate.3', title: 'OmniPanel: Activate the Tools tab (⌘4)', owner: 'omnipanel-shell', tranche: '31.T31.3' },
    { id: 'omnipanel.tab.activate.4', title: 'OmniPanel: Activate the Evidence tab (⌘5)', owner: 'omnipanel-shell', tranche: '31.T31.3' },
    { id: 'omnipanel.tab.activate.5', title: 'OmniPanel: Activate the Review tab (⌘6)', owner: 'omnipanel-shell', tranche: '31.T31.3' },
    { id: 'omnipanel.tab.activate.6', title: 'OmniPanel: Activate the Gateway tab (⌘7)', owner: 'omnipanel-shell', tranche: '31.T31.3' },
    { id: 'omnipanel.tab.activate.7', title: 'OmniPanel: Activate the Diagnostics tab (⌘8)', owner: 'omnipanel-shell', tranche: '31.T31.3' },

    // --- src/commands/layout.ts (registerLayoutCommands, 52.T3) ---
    // The switch canon names the omni panel as. One addressed command per
    // layout (the palette runs commands with no argument, so the pair IS the
    // picker — the 30.T30.4 theme precedent) plus the no-argument toggle the
    // OmniPanel control fires.
    {
        id: 'layout.switch.daily-0-1',
        title: 'Layout: Daily 0/1 preview',
        owner: 'shell-layout',
        tranche: '52.T3'
    },
    {
        id: 'layout.switch.ide-deep',
        title: 'Layout: IDE deep (4+2 workspace)',
        owner: 'shell-layout',
        tranche: '52.T3'
    },
    {
        id: 'layout.toggle',
        title: 'Layout: Toggle daily 0/1 and IDE deep',
        owner: 'shell-layout',
        tranche: '52.T3'
    },

    // --- src/commands/subsystem.ts (registerSubsystemCommands, 52.T5) ---
    // The six 4+2 entry gestures. One addressed command per subsystem page
    // (the palette runs commands with no argument, so the six ARE the
    // picker — the layout.ts / theme.ts precedent); the Home grid tiles fire
    // the same six. No OmniPanel route exists (DR-SUBSYS-3 names the gap).
    { id: 'subsystem.open.m0', title: "Subsystem: Open M0' Bimba Map page", owner: 'subsystem-pages', tranche: '52.T5' },
    { id: 'subsystem.open.m1', title: "Subsystem: Open M1' Traversal page", owner: 'subsystem-pages', tranche: '52.T5' },
    { id: 'subsystem.open.m2', title: "Subsystem: Open M2' Matrix page", owner: 'subsystem-pages', tranche: '52.T5' },
    { id: 'subsystem.open.m3', title: "Subsystem: Open M3' Clock Cosmos page", owner: 'subsystem-pages', tranche: '52.T5' },
    { id: 'subsystem.open.m4', title: "Subsystem: Open M4' Nara page", owner: 'subsystem-pages', tranche: '52.T5' },
    { id: 'subsystem.open.m5', title: "Subsystem: Open M5' Epii IDE page", owner: 'subsystem-pages', tranche: '52.T5' },

    // --- Track 51 specced-surface entries (App.tsx, over panes/track51Surfaces.ts) ---
    { id: 'studio.open.frontend', title: "Studio: Open M5-3' Frontend Studio", owner: 'frontend-studio', tranche: '51.T51.2' },
    { id: 'm1.open.traversalTimeline', title: 'M1: Open the traversal timeline', owner: 'm1-traversal-timeline', tranche: '51.T51.3' },
    { id: 'm2.open.meaningPacket', title: 'M2: Open the meaning-packet inspector', owner: 'm2-meaning-packet', tranche: '51.T51.4' },
    { id: 'm3.open.doubleTorus', title: "M3: Open the M3-5' double-torus world clock", owner: 'm3-double-torus', tranche: '51.T51.5' },

    // --- src/ui/leftSidebarModes.ts (registerLeftSidebarModeCommands, 52.T6) ---
    // Data-driven over LEFT_SIDEBAR_MODES; the gate reconstructs these five
    // from the SAME registry rather than trusting the rows. Deep-only modes
    // are enabled-gated by the store's layout (they grey out in daily).
    { id: 'leftSidebar.mode.coordinate-tree', title: 'Left Sidebar: Coordinate Tree', owner: 'left-sidebar-modes', tranche: '52.T6' },
    { id: 'leftSidebar.mode.bimba-graph', title: 'Left Sidebar: Bimba Graph Viewer', owner: 'left-sidebar-modes', tranche: '52.T6' },
    { id: 'leftSidebar.mode.canon-studio', title: 'Left Sidebar: Canon Studio', owner: 'left-sidebar-modes', tranche: '52.T6' },
    { id: 'leftSidebar.mode.backend-studio', title: 'Left Sidebar: Backend Studio', owner: 'left-sidebar-modes', tranche: '52.T6' },
    { id: 'leftSidebar.mode.smart-connections', title: 'Left Sidebar: Smart Connections', owner: 'left-sidebar-modes', tranche: '52.T6' },

    // --- src/commands/walkthrough.ts (registerWalkthroughCommand, 32.T32.3) ---
    {
        id: 'epi-logos.help.openWalkthrough',
        title: 'Help: Replay onboarding walkthrough',
        owner: 'onboarding',
        tranche: '32.T32.3'
    },

    // --- src/commands/theme.ts (registerThemeCommands, 30.T30.4) ---
    // One command per selection the theme contract admits: the palette runs
    // commands with no argument, so this IS the picker (see theme.ts header).
    { id: 'theme.dark', title: 'Appearance: Dark', owner: 'appearance', tranche: '30.T30.4' },
    { id: 'theme.light', title: 'Appearance: Light', owner: 'appearance', tranche: '30.T30.4' },
    { id: 'theme.glass', title: 'Appearance: Glass', owner: 'appearance', tranche: '30.T30.4' },
    { id: 'theme.discause', title: 'Appearance: Discause', owner: 'appearance', tranche: '30.T30.4' },
    { id: 'theme.naraDark', title: 'Appearance: Nara Dark (M4)', owner: 'appearance', tranche: '30.T30.4' },
    { id: 'theme.naraLight', title: 'Appearance: Nara Light (M4)', owner: 'appearance', tranche: '30.T30.4' },
    { id: 'theme.naraGlass', title: 'Appearance: Nara Glass (M4)', owner: 'appearance', tranche: '30.T30.4' },
    { id: 'theme.system', title: 'Appearance: Follow system', owner: 'appearance', tranche: '30.T30.4' },

    // --- src/panes/M0LayerRail.tsx (data-driven over M0_LAYER_ROUTES local layers) ---
    { id: 'm0.layer.lang', title: "M0': Pre-math node language layer", owner: 'm0-anuttara-rail', tranche: '01.T1.1' },
    { id: 'm0.layer.ql', title: "M0': QL structure layer", owner: 'm0-anuttara-rail', tranche: '01.T1.1' },
    { id: 'm0.layer.rel', title: "M0': Relation field layer", owner: 'm0-anuttara-rail', tranche: '01.T1.1' },
    {
        id: 'm0.layer.time',
        title: "M0': Time / community overlay layer",
        owner: 'm0-anuttara-rail',
        tranche: '01.T1.1'
    },

    // --- src/panes/coordinateTree/coordinateTreeCommands.ts (28.T28.6 (d)) ---
    // Data-driven over COORDINATE_TREE_FAMILY_ROOTS × FAMILY_NAMES; the gate
    // reconstructs these six from the SAME tables rather than trusting the rows.
    {
        id: 'pratibimba.coordinate-tree.expand-family.P',
        title: 'Coordinate Tree: Expand Position family (P)',
        owner: 'coordinate-tree',
        tranche: '28.T28.6'
    },
    {
        id: 'pratibimba.coordinate-tree.expand-family.S',
        title: 'Coordinate Tree: Expand Stack family (S)',
        owner: 'coordinate-tree',
        tranche: '28.T28.6'
    },
    {
        id: 'pratibimba.coordinate-tree.expand-family.T',
        title: 'Coordinate Tree: Expand Thought family (T)',
        owner: 'coordinate-tree',
        tranche: '28.T28.6'
    },
    {
        id: 'pratibimba.coordinate-tree.expand-family.M',
        title: 'Coordinate Tree: Expand Subsystem family (M)',
        owner: 'coordinate-tree',
        tranche: '28.T28.6'
    },
    {
        id: 'pratibimba.coordinate-tree.expand-family.L',
        title: 'Coordinate Tree: Expand Lens family (L)',
        owner: 'coordinate-tree',
        tranche: '28.T28.6'
    },
    {
        id: 'pratibimba.coordinate-tree.expand-family.C',
        title: 'Coordinate Tree: Expand Category family (C)',
        owner: 'coordinate-tree',
        tranche: '28.T28.6'
    }
]);
