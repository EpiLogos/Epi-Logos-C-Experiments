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
 *   - src/panes/M0LayerRail.tsx (4) — data-driven over M0_LAYER_ROUTES local layers (01.T1.1)
 * `src/ui/leftSidebarModes.ts` also *declares* a register site, but its factory
 * (`registerLeftSidebarModeCommands`) has no caller — it is dead code, so its
 * commands are NOT registered and are deliberately absent here (the gate
 * proves the factory is uncalled).
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

    // --- src/commands/omnipanelTabChords.ts (registerOmnipanelTabActivationCommands, CCT-4) ---
    { id: 'omnipanel.tab.activate.0', title: 'OmniPanel: Activate the Pi tab (⌘1)', owner: 'omnipanel-shell', tranche: '31.T31.3' },
    { id: 'omnipanel.tab.activate.1', title: 'OmniPanel: Activate the Sessions tab (⌘2)', owner: 'omnipanel-shell', tranche: '31.T31.3' },
    { id: 'omnipanel.tab.activate.2', title: 'OmniPanel: Activate the Dispatch tab (⌘3)', owner: 'omnipanel-shell', tranche: '31.T31.3' },
    { id: 'omnipanel.tab.activate.3', title: 'OmniPanel: Activate the Tools tab (⌘4)', owner: 'omnipanel-shell', tranche: '31.T31.3' },
    { id: 'omnipanel.tab.activate.4', title: 'OmniPanel: Activate the Evidence tab (⌘5)', owner: 'omnipanel-shell', tranche: '31.T31.3' },
    { id: 'omnipanel.tab.activate.5', title: 'OmniPanel: Activate the Review tab (⌘6)', owner: 'omnipanel-shell', tranche: '31.T31.3' },
    { id: 'omnipanel.tab.activate.6', title: 'OmniPanel: Activate the Gateway tab (⌘7)', owner: 'omnipanel-shell', tranche: '31.T31.3' },
    { id: 'omnipanel.tab.activate.7', title: 'OmniPanel: Activate the Diagnostics tab (⌘8)', owner: 'omnipanel-shell', tranche: '31.T31.3' },

    // --- src/panes/M0LayerRail.tsx (data-driven over M0_LAYER_ROUTES local layers) ---
    { id: 'm0.layer.lang', title: "M0': Pre-math node language layer", owner: 'm0-anuttara-rail', tranche: '01.T1.1' },
    { id: 'm0.layer.ql', title: "M0': QL structure layer", owner: 'm0-anuttara-rail', tranche: '01.T1.1' },
    { id: 'm0.layer.rel', title: "M0': Relation field layer", owner: 'm0-anuttara-rail', tranche: '01.T1.1' },
    {
        id: 'm0.layer.time',
        title: "M0': Time / community overlay layer",
        owner: 'm0-anuttara-rail',
        tranche: '01.T1.1'
    }
]);
