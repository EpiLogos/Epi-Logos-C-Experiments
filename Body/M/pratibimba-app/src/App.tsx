/**
 * Coordinate: M' (one shell, two faces — now over a real pane system)
 * Residency: Body/M/pratibimba-app/src
 * Position (#n): active-carrier 0/1 shell composition root.
 * Actualises: the (0/1) shell as flexlayout root layouts over one state tree,
 *   with the application foundations underneath: command registry, palette,
 *   vault panes, session binding, layout persistence, gateway liveness, and the
 *   persisted M0/M2 surface records. cmd-period IS the # inversion; the four
 *   stores are singletons so the faces cannot desynchronise.
 *   52.T4: FOUR models, not two — the (face × layout) cells. `personalDefault`
 *   / `cosmicDefault` are the daily 0/1 preview; `ideDeepDefault` is the deep
 *   4+2 pane set, per face ([[DR-DEEP-LAYOUT-1]]), declared in
 *   `ui/deepPaneSet.ts`. Two `<Layout>` slots render the active layout's cell.
 * Public surface: <App/>.
 * Does NOT own: gateway I/O (bridge/), vault law (src-tauri/vault.rs),
 *   command semantics (owners register them).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Actions, BorderNode, DockLocation, Layout, Model, TabNode } from 'flexlayout-react';
import type { ITabSetRenderValues, TabSetNode } from 'flexlayout-react';
import { createStrikeRouter, instrument, useInstrumentStore } from './audio/instrument';
import { GatewayClient } from './bridge/gatewayClient';
import { extractBellRoles, isChimeCoherent, ModalResonatorBoundary } from './bridge/types';
import { gateway, gatewayReady, setGateway } from './bridge/gatewayHolder';
import { SessionClient } from './bridge/sessionClient';
import { invokeCommand } from './bridge/tauri';
import { wireSupervisorEvents } from './bridge/tauriEvents';
import { registerAtelierCommands } from './commands/atelier';
import { commands, usePaletteStore } from './commands/registry';
import {
    CROSS_LAYOUT_INTENT_COMMAND,
    intentTarget,
    parseCrossLayoutIntent,
    registerCrossLayoutIntentCommand
} from './commands/crossLayoutIntent';
import { registerOmnipanelTabActivationCommands } from './commands/omnipanelTabChords';
import { useEventsStore } from './state/eventsStore';
import { useReadinessStore } from './state/readinessStore';
import { useCoordinateStore, useProvenanceStore, useSessionStore, useTickStore } from './state/stores';
import {
    createCrossLayoutIdentityReceipt,
    CrossLayoutIdentityReceipt,
    readCrossLayoutIdentity
} from './state/crossLayoutIdentity';
import { CoordinateBreadcrumb } from './components/CoordinateBreadcrumb';
import { StatusStrip } from './components/StatusStrip';
import { FaceToggleChrome } from './components/FaceToggleChrome';
import { M3DailyWheelMiniView } from './components/M3CompactViews';
import { CosmicEngine } from './engine/CosmicEngine';
import { CompositionProfileProvider } from './composition/compositionProfileContext';
import { publishProfileTick } from './composition/profileTickSubscription';
import { modulationEngine, registerEngineCommands, useEngineStore } from './engine/modulation/engine';
import { GraphExplorerPane } from './panes/GraphExplorerPane';
import { SpandaNavigatorPane } from './panes/SpandaNavigatorPane';
import { WalkPane } from './panes/WalkPane';
import { M4DialogicalArenaPane } from './panes/M4DialogicalArenaPane';
import { M4PsycheAnchorCoherencePane } from './panes/M4PsycheAnchorCoherencePane';
import { M4SessionCloseCeremonyPane } from './panes/M4SessionCloseCeremonyPane';
import { CanonUpdateLedgerPane } from './panes/CanonUpdateLedgerPane';
import { AgenticControlRoomPane } from './panes/acr/AgenticControlRoomPane';
import { CoordinateTreePane } from './panes/coordinateTree/CoordinateTreePane';
import { COORDINATE_TREE_TAB_LABEL } from './panes/coordinateTree/coordinateTreeModel';
import { registerCoordinateTreeCommands } from './panes/coordinateTree/coordinateTreeCommands';
import { AutoresearchPane } from './panes/AutoresearchPane';
import { capacityFromIntentContributionId } from './panes/autoresearchModel';
import { KairosEnablementPane } from './panes/KairosEnablementPane';
import { M4MercuriusRelayChip } from './panes/M4MercuriusRelayPane';
import { MedicineViewPane } from './panes/MedicineViewPane';
import { TransformContainersPane } from './panes/TransformContainersPane';
import { PratibimbaCoordinatePane } from './panes/PratibimbaCoordinatePane';
import { PasuWizardPane } from './panes/PasuWizardPane';
import { M4LogosCyclePane } from './panes/M4LogosCyclePane';
import { PiAxiomTranslationInspector } from './panes/PiAxiomTranslationInspector';
import { SemanticConnectionsPane } from './panes/SemanticConnectionsPane';
import { DispatchTracePanel } from './panes/omni/DispatchTracePanel';
import { ToolStreamPanel } from './panes/omni/ToolStreamPanel';
import { EvidencePanel } from './panes/omni/EvidencePanel';
import { GatewayPanel } from './panes/omni/GatewayPanel';
import { DiagnosticsPanel } from './panes/omni/DiagnosticsPanel';
import { SettingsPane } from './panes/omni/SettingsPane';
import { M0CoordinateSummaryCard } from './panes/M0CoordinateSummaryCard';
import { M0SurfaceProvider } from './panes/M0SurfaceContext';
import { M2SurfaceProvider } from './panes/M2SurfaceContext';
import {
    DEFAULT_M0_SURFACE_STATE,
    deserializeM0SurfaceState,
    serializeM0SurfaceState,
    type M0SurfaceState
} from './panes/m0SurfaceState';
import {
    DEFAULT_M2_SURFACE_STATE,
    deserializeM2SurfaceState,
    serializeM2SurfaceState,
    type M2SurfaceState
} from './panes/m2SurfaceState';
import { ReviewBlocksPane } from './panes/omni/ReviewBlocksPane';
import { TuningPane } from './panes/TuningPane';
import { KleinTopologyPane } from './panes/KleinTopologyPane';
import { PlayedTorusPane } from './panes/PlayedTorusPane';
import { M1SurfaceDispatchPane, resolveM1SurfaceContext } from './panes/m1SurfaceDispatch';
import { PentadicInspectorPane } from './panes/PentadicInspectorPane';
import { M3InspectorsPane } from './panes/M3InspectorsPane';
import { M5EbmObservatoryPane } from './panes/M5EbmObservatoryPane';
import { ChatPane } from './panes/ChatPane';
import { CommandPalette } from './panes/CommandPalette';
import { FileTreePane } from './panes/FileTreePane';
import { JournalTimelinePane } from './panes/JournalTimelinePane';
import { LogsPane } from './panes/LogsPane';
import { MarkdownEditorPane } from './panes/MarkdownEditorPane';
import { OraclePane } from './panes/OraclePane';
import { DayCalendarPane } from './panes/DayCalendarPane';
import { M2CorrespondencePane } from './panes/M2CorrespondencePane';
import { SessionsPane } from './panes/SessionsPane';
import {
    filterOmniPanelTabsForLayout,
    OMNIPANEL_ACTIVE_LAYOUT_PREFERENCE_KEY,
    OMNIPANEL_TABS,
    OmniPanelLayoutId,
    omniPanelTabForComponent,
    parseOmniPanelLayoutPreference
} from './panes/omni/omnipanelRuntime';
import { parseLayoutId, type LayoutId } from './ui/layoutId';
import { deepLayoutJson, deepMainTabsetId, type DeepPaneModelId } from './ui/deepPaneSet';
// 52.T5 — the 4+2 body: six subsystem pages + the Home grid affordance.
import { SUBSYSTEM_PAGES, subsystemPageNodeId, type SubsystemPageId } from './ui/subsystemPages';
import { SubsystemWorkspacePane } from './panes/SubsystemWorkspacePane';
import { HomePane } from './panes/HomePane';
import { registerSubsystemCommands } from './commands/subsystem';
import { readStoredLayout, writeStoredLayout } from './ui/layoutPreference';
import { registerLayoutCommands } from './commands/layout';
// 52.T6 — the activity-bar mode registry, finally wired: commands on the
// spine, the store synced at every layout transition (fallback AFTER the
// identity receipt), and left-resident mode surfaces revealed on activation.
import {
    leftSidebarMode,
    registerLeftSidebarModeCommands,
    useLeftSidebarModeStore,
    type LeftSidebarModeId
} from './ui/leftSidebarModes';
import { OmniPanelLayoutSwitch } from './components/OmniPanelLayoutSwitch';
import { readOmniPanelSessionState, useOmniPanelSessionStore } from './panes/omni/omnipanelSessionState';
import {
    applyOmniPanelRouting,
    omniPanelIntentRouter,
    OMNIPANEL_INTENT_ROUTE_COMMAND
} from './panes/omni/omnipanelIntentRouter';
import { useCrossLayoutIntentLogStore } from './state/crossLayoutIntentLog';
import { VaultEntry } from './panes/FileTreePane';
import { MocBaseReflectionPane } from './bases/MocBaseReflectionPane';
import { assertDailyReceiverBindings } from './ui/dailySurfaceOwnership';
import { resolveLayoutClaims } from './ui/layoutClaims';
import { startFirstSession } from './onboarding/firstSessionOrchestration';
import {
    coldStartPasuBranch,
    detectPasuPresence,
    PASU_SKIPPED_PREFERENCE,
    recordPasuWizardSkip
} from './onboarding/pasuOnboarding';
import { browserKairosPreferences, ONBOARDING_COMPLETED_STEPS_PREFERENCE } from './panes/kairosEnablement';

assertDailyReceiverBindings({
    'pratibimba.daily.journal': 'journalTimeline',
    'pratibimba.daily.cymatic-placeholder': 'cosmic',
    'pratibimba.daily.library-projection': 'fileTree',
    'pratibimba.daily.atelier-cluster-lens': 'bimbaGraph'
});

/** Month-first (Architect correction): sorts within the year in the vault. */
function todayId(): string {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    return `${mm}-${dd}-${now.getFullYear()}`;
}

/** Legacy day-first id (June-era folders) — still adopted if present. */
function todayIdLegacy(): string {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    return `${dd}-${mm}-${now.getFullYear()}`;
}

export type Face = 0 | 1;

const STALE_WINDOW_MS = 10_000;

/** 27.T27.0 / 38.T06.8: the `/` membrane derives its tabs from the canonical 9-fold
 *  manifest (DR-WC-OP-1 collapse: `/ chat` → Pi, `logs` → Tools); shared
 *  by BOTH faces per 15.2. Unlanded folds mount the honest pending pane. */
function omniBorder(activeLayout: OmniPanelLayoutId) {
    return {
        type: 'border',
        location: 'right',
        size: 380,
        children: filterOmniPanelTabsForLayout(OMNIPANEL_TABS, activeLayout).map(tab => ({
            type: 'tab',
            id: tab.id === 'pi-chat' ? 'omni-tab' : `omni-${tab.id}`,
            name: tab.label,
            component: tab.component,
            enableClose: false
        }))
    };
}

function personalDefault(activeLayout: OmniPanelLayoutId) {
    return {
    global: { tabEnableRename: false },
    borders: [
        {
            type: 'border',
            location: 'left',
            size: 260,
            selected: 0,
            children: [
                {
                    type: 'tab',
                    name: 'Vault',
                    component: 'fileTree',
                    enableClose: false
                },
                {
                    type: 'tab',
                    name: 'Journal',
                    component: 'journalTimeline',
                    enableClose: false
                },
                { type: 'tab', name: 'Calendar', component: 'dayCalendar', enableClose: false },
                { type: 'tab', name: 'Oracle', component: 'oracle', enableClose: false },
                // 52.T6 settled the smart-connections contradiction: the mode
                // is `ide-deep`-only (`ui/leftSidebarModes.ts`), so the daily
                // Connections tab is WITHDRAWN — a developer semantic-index
                // surface is depth, not lived flow. The `[[` completion inside
                // Canon Studio rides `s1'.semantic.suggest_links` on its own
                // and never needed this tab.
                // 25.T25.19 — a ceremony READS, so it lives with the reading
                // surfaces on the border rather than as an 11th main tab: at
                // 1280x800 an eleventh `personal-main` tab makes the strip
                // un-clickable (measured — the click stops selecting).
                { type: 'tab', name: 'Session close', component: 'sessionCloseCeremony', enableClose: false },
                // 25.T25.20 — same law as the ceremony above: a reading surface,
                // so it joins the border rather than the main strip.
                { type: 'tab', name: 'Anchor', component: 'psycheAnchorCoherence', enableClose: false },
                // 28.T28.6 — CHROME-CONTRACT §2 designates the coordinate tree
                // "face 1 left border", and `LEFT_SIDEBAR_MODES` makes it the
                // default mode and cross-layout fallback in BOTH layouts. LAST
                // on purpose: `selected: 0` opens `fileTree`, so a navigation
                // backbone that publishes on click never mounts unasked.
                {
                    type: 'tab',
                    name: COORDINATE_TREE_TAB_LABEL,
                    component: 'coordinateTree',
                    enableClose: false
                }
            ]
        },
        omniBorder(activeLayout)
    ],
    layout: {
        type: 'row',
        children: [
            {
                type: 'tabset',
                id: 'personal-main',
                children: [
                    { type: 'tab', name: 'Now', component: 'personalHome', enableClose: false },
                    { type: 'tab', name: 'M1 Deep', component: 'm1SurfaceDeep', enableClose: false },
                    { type: 'tab', name: 'Arena', component: 'm4DialogicalArena', enableClose: false },
                    { type: 'tab', name: 'CU Ledger', component: 'canonUpdateLedger', enableClose: false },
                    { type: 'tab', name: 'Autoresearch', component: 'autoresearch', enableClose: false },
                    { type: 'tab', name: 'Medicine', component: 'medicineView', enableClose: false },
                    { type: 'tab', name: 'Transform', component: 'transformContainers', enableClose: false },
                    { type: 'tab', name: 'Coordinate', component: 'pratibimbaCoordinate', enableClose: false },
                    { type: 'tab', name: 'Logos', component: 'logosCycle', enableClose: false },
                    { type: 'tab', name: 'Kairos setup', component: 'kairosEnablement', enableClose: false }
                ]
            }
        ]
    }
    };
}

function cosmicDefault(activeLayout: OmniPanelLayoutId) {
    return {
    global: { tabEnableRename: false },
    borders: [omniBorder(activeLayout)],
    layout: {
        type: 'row',
        children: [
            {
                type: 'tabset',
                id: 'cosmic-main',
                children: [
                    {
                        type: 'tab',
                        name: 'Cosmic Engine',
                        component: 'cosmic',
                        enableClose: false
                    },
                    { type: 'tab', name: 'Spanda', component: 'spandaNavigator', enableClose: false },
                    { type: 'tab', name: 'Walk', component: 'walk', enableClose: false },
                    {
                        type: 'tab',
                        name: 'Bimba',
                        component: 'bimbaGraph',
                        enableClose: false
                    },
                    { type: 'tab', name: 'Bases', component: 'mocBases', enableClose: false },
                    { type: 'tab', name: 'Correspondence', component: 'm2Correspondence', enableClose: false },
                    { type: 'tab', name: 'Klein', component: 'kleinTopology', enableClose: false },
                    { type: 'tab', name: 'Played Torus', component: 'm1PlayedTorus', enableClose: false },
                    { type: 'tab', name: 'M1 Surface', component: 'm1SurfaceComposed', enableClose: false },
                    { type: 'tab', name: 'Pentadic', component: 'm3PentadicInspector', enableClose: false },
                    { type: 'tab', name: 'M3 Inspectors', component: 'm3Inspectors', enableClose: false },
                    { type: 'tab', name: 'M5 EBM', component: 'm5Ebm', enableClose: false },
                    { type: 'tab', name: 'Axiom', component: 'piAxiomTranslation', enableClose: false }
                ]
            }
        ]
    }
    };
}

/**
 * 52.T4 — the third default model: the deep 4+2 pane set, one per face.
 *
 * [[M5'-SPEC]] :91 specifies `ide-deep` as "the full 4+2 surface with M0/M5 IDE
 * chrome, six M-extensions, two integrated plugins, agentic control room".
 * Until this tranche selecting it only WITHDREW three face-0 daily widgets, so
 * the deep layout had no pane set of its own and 52.T3's switch had nothing to
 * switch to.
 *
 * PER-FACE, per [[DR-DEEP-LAYOUT-1]] — `ideDeepDefault` takes the model id, so
 * there are four models in play (cosmic/personal × daily/deep). Face is the `#`
 * inversion of the user's context and layout is the `.` nesting the shell opens
 * ([[M'-SYSTEM-SPEC]] :168); collapsing either into the other is the DCC-07
 * error 52.T2 just repaired on the M1 surface.
 *
 * The composition itself is DECLARED, not written here: `ui/deepPaneSet.ts`
 * carries what is mounted, what is deliberately withdrawn, and the reserved
 * seams for the doc-ahead `pending` surfaces (28.13 remains; 28.5 and 28.6
 * consumed theirs). The `/`
 * membrane is handed in so `omniBorder` stays the one builder of the right slot.
 */
function ideDeepDefault(model: DeepPaneModelId, activeLayout: OmniPanelLayoutId) {
    return deepLayoutJson(model, omniBorder(activeLayout));
}

/** Bumped when the default layouts gain/lose panes — stale saved layouts
 *  fall back to defaults (face/session/coordinate still restore).
 *  24: 52.T4 added the two `ide-deep` models and their persistence keys.
 *  25: 28.T28.6 landed the Coordinate Tree in the daily face-1 border and
 *  both deep rails.
 *  26: 52.T6 withdrew the daily face-1 Connections border tab (smart-
 *  connections settled `ide-deep`-only). */
const LAYOUT_VERSION = 26;

/** The four flexlayout models the shell holds: one per (layout, face) cell.
 *  52.T4 — before this tranche there was one pair, shared by both layouts. */
type FaceModels = { readonly cosmic: Model; readonly personal: Model };
type ShellModels = Readonly<Record<LayoutId, FaceModels>>;

/** The model for a (face, layout) cell. The two axes are orthogonal, so this
 *  is a lookup, never a derivation (DCC-07 / [[DR-DEEP-LAYOUT-1]]). */
function modelOf(models: ShellModels, face: Face, layout: LayoutId): Model {
    const pair = models[layout];
    return face === 0 ? pair.cosmic : pair.personal;
}

/** Where `vault.open` docks a new Canon Studio editor when no tabset is
 *  active — the main tabset of the layout the user is actually in. */
function mainTabsetIdFor(layout: LayoutId): string {
    return layout === 'ide-deep' ? deepMainTabsetId('personal') : 'personal-main';
}

interface PersistedUiState {
    layoutVersion?: number;
    face?: Face;
    personal?: unknown;
    cosmic?: unknown;
    /** 52.T4 — the deep models persist beside the daily ones; a layout switch
     *  must not discard the tab the user left open in the other layout. */
    personalDeep?: unknown;
    cosmicDeep?: unknown;
    sessionKey?: string | null;
    coordinate?: string | null;
    m0Surface?: unknown;
    m2Surface?: unknown;
    omniPanel?: unknown;
    /** LEGACY (pre-52.T3) home of the layout preference. Read once at boot so
     *  an existing install does not forget the layout it was left in; nothing
     *  writes it any more — `ui/layoutPreference.ts` owns the storage now. */
    [OMNIPANEL_ACTIVE_LAYOUT_PREFERENCE_KEY]?: OmniPanelLayoutId;
}

/** The right border is the sole `/` membrane. FlexLayout owns selection;
 * this adapter records the selected canonical fold in the shared 27.11 state
 * so it survives either face re-mount and persistence. */
function syncOmniPanelSelection(model: Model): void {
    const selected = model
        .getBorderSet()
        .getBorders()
        .find(border => border.getLocation() === DockLocation.RIGHT)
        ?.getSelectedNode();
    const component = selected?.getComponent();
    const tab = component ? omniPanelTabForComponent(component) : undefined;
    if (tab && useOmniPanelSessionStore.getState().session.activeTab !== tab.id) {
        useOmniPanelSessionStore.getState().selectTab(tab.id);
    }
}

function factory(node: TabNode, activeLayout?: OmniPanelLayoutId) {
    const pane = (() => {
        switch (node.getComponent()) {
        case 'fileTree':
            return <FileTreePane />;
        case 'semanticConnections':
            return <SemanticConnectionsPane />;
        case 'editor':
            return <MarkdownEditorPane path={(node.getConfig() as { path: string }).path} />;
        case 'cosmic':
            return (
                <CompositionProfileProvider>
                    <CosmicEngine />
                </CompositionProfileProvider>
            );
        // legacy tab components from saved layouts — never a second engine instance
        case 'cymatic':
        case 'codon':
            return (
                <div className="pane-message">
                    This surface is now a layer of the Cosmic Engine tab.
                </div>
            );
        case 'walk':
            return <WalkPane />;
        // 22.T22.1 — the spanda walk navigator (engine-walk face, DR-M1-5)
        case 'spandaNavigator':
            return <SpandaNavigatorPane />;
        case 'bimbaGraph':
            {
                const routed = (node.getConfig() as {
                    crossLayoutIntent?: {
                        requestedExtensionId?: string;
                        requestedContributionId?: string;
                        artifactUri?: string | null;
                        coordinate?: string | null;
                    };
                })?.crossLayoutIntent;
                const atelierTerm = routed?.requestedExtensionId === 'ide-shell-m0-m5'
                    && routed.requestedContributionId?.startsWith('term:')
                    ? routed.requestedContributionId.slice('term:'.length)
                    : null;
                // 28.T28.7: the M5' Atelier lens mounts only on a real
                // `logos-atelier` intent (or its `term:` alias, which
                // `intentTarget` resolves to the same contribution).
                const atelierIntent = routed?.requestedExtensionId === 'ide-shell-m0-m5'
                    && (routed.requestedContributionId === 'logos-atelier' || atelierTerm !== null)
                    ? {
                        contributionId: routed.requestedContributionId ?? 'logos-atelier',
                        artifactUri: routed.artifactUri ?? null,
                        coordinate: routed.coordinate ?? null
                    }
                    : null;
            return (
                <GraphExplorerPane
                    requestedM0Contribution={
                        ((node.getConfig() as { crossLayoutIntent?: { requestedExtensionId?: string; requestedContributionId?: string } })
                            ?.crossLayoutIntent?.requestedExtensionId === 'm0-anuttara')
                            ? (node.getConfig() as { crossLayoutIntent?: { requestedContributionId?: string } })
                                .crossLayoutIntent?.requestedContributionId ?? null
                            : null
                    }
                    requestedAtelierTerm={atelierTerm}
                    atelierIntent={atelierIntent}
                    // 28.T28.3(a): the layout chooses the rendering mode —
                    // daily previews the solar anchor, deep renders the lattice.
                    activeLayout={activeLayout}
                />
            );
            }
        case 'sessionCloseCeremony':
            return <M4SessionCloseCeremonyPane />;
        case 'psycheAnchorCoherence':
            return <M4PsycheAnchorCoherencePane />;
        case 'mocBases':
            return <MocBaseReflectionPane />;
        case 'm2Correspondence':
            return <M2CorrespondencePane />;
        case 'kleinTopology':
            return <KleinTopologyPane />;
        case 'm1PlayedTorus':
            return <PlayedTorusPane />;
        // 22.T22.10 — M1 surface dispatch (DR-WC-M1-1: one singleton, pure views).
        // 52.T2 (DR-M1-FACE-LAYOUT-1): the mount hands over BOTH orthogonal
        // axes — its own face AND the shell's real active layout. The dispatch
        // no longer derives one from the other.
        case 'm1SurfaceComposed':
            return (
                <M1SurfaceDispatchPane
                    context={resolveM1SurfaceContext({
                        face: 0,
                        activeLayout: parseLayoutId(activeLayout)
                    })}
                />
            );
        case 'm1SurfaceDeep':
            return (
                <M1SurfaceDispatchPane
                    context={resolveM1SurfaceContext({
                        face: 1,
                        activeLayout: parseLayoutId(activeLayout)
                    })}
                />
            );
        case 'm3PentadicInspector':
            return <PentadicInspectorPane />;
        case 'm3Inspectors':
            return <M3InspectorsPane />;
        case 'm5Ebm':
            return <M5EbmObservatoryPane />;
        // 52.T5 — the Home affordance (DR-SUBSYS-3): the same lived Now
        // surface, now carrying the `0/1` ↔ `#0-#5` subsystems-grid toggle.
        case 'personalHome':
            return <HomePane />;
        // 52.T5 — the six M0'-M5' subsystem pages (DR-SUBSYS-1): dynamic deep
        // workspace tabs opened by `subsystem.open.*`, never default-mounted.
        case 'm0SubsystemPage':
            return <SubsystemWorkspacePane subsystem="m0" />;
        case 'm1SubsystemPage':
            return <SubsystemWorkspacePane subsystem="m1" />;
        case 'm2SubsystemPage':
            return <SubsystemWorkspacePane subsystem="m2" />;
        case 'm3SubsystemPage':
            return <SubsystemWorkspacePane subsystem="m3" />;
        case 'm4SubsystemPage':
            return <SubsystemWorkspacePane subsystem="m4" />;
        case 'm5SubsystemPage':
            return <SubsystemWorkspacePane subsystem="m5" />;
        // 41.T41.7 — the M4' dia-logical arena carrier pane (CPF-gated wizard)
        case 'm4DialogicalArena':
            return <M4DialogicalArenaPane />;
        // 40.T40.5 — the Track-40 CU-ledger review surface (48 bases-view posture)
        case 'canonUpdateLedger':
            return <CanonUpdateLedgerPane />;
        // 28.T28.5 — the GOVERNANCE PRIMARY deep control room (DR-WC-IS-1).
        // DEEP-ONLY: it appears in `personal-deep-main` and in no daily model —
        // the OmniPanel folds carry the always-on abbreviated render (DR-WC-IS-2).
        case 'agenticControlRoom':
            return <AgenticControlRoomPane />;
        // 28.T28.6 — the M0' navigation backbone. Mounted in the daily face-1
        // rail AND in both deep rails, because `LEFT_SIDEBAR_MODES` declares
        // `coordinate-tree` the cross-layout fallback mode; it publishes the
        // shared coordinate on CLICK only, never on mount.
        case 'coordinateTree':
            return <CoordinateTreePane />;
        // 28.T28.10 - real S5 autoresearch disclosure over status/history.
        case 'autoresearch':
            {
                const requestedContributionId = (node.getConfig() as {
                    crossLayoutIntent?: { requestedExtensionId?: string; requestedContributionId?: string };
                })?.crossLayoutIntent?.requestedContributionId;
                // 26.T26.6: the prefix and the six-id membership test are the
                // codec's, not a second copy transcribed here — a capacity added
                // to `M5_OPERATIONAL_CAPACITIES` stays routable without an edit.
                return (
                    <AutoresearchPane
                        requestedCapacity={capacityFromIntentContributionId(requestedContributionId)}
                    />
                );
            }
        // 32.T32.10 - FR-3 default-off, probe-first Kairos onboarding.
        case 'kairosEnablement':
            return <KairosEnablementPane />;
        // 25.T25.10 - protected-local Medicine evidence and governed NOW pin.
        case 'medicineView':
            return <MedicineViewPane />;
        // 25.T25.11 - governed transform lifecycle and protected-local carrier.
        case 'transformContainers':
            return <TransformContainersPane />;
        // 25.T25.14 - handle-only personal-field render, atlas-sync consent
        // editor, and M5'-gated identity-augment proposal review.
        case 'pratibimbaCoordinate':
            return <PratibimbaCoordinatePane />;
        case 'logosCycle':
            return <M4LogosCyclePane />;
        case 'piAxiomTranslation':
            return <PiAxiomTranslationInspector />;
        case 'journalTimeline':
            return <JournalTimelinePane />;
        case 'dayCalendar':
            return <DayCalendarPane />;
        case 'oracle':
            return <OraclePane />;
        case 'omniChat':
            return <ChatPane />;
        case 'omniSessions':
            return <SessionsPane />;
        // 27.T27.4 — the Tool Stream fold IS the temporal fold of the same
        // Pi → subagent genealogy the Dispatch tab folds structurally (15.11).
        // The raw gateway-event ring stays reachable as a subordinate <details>
        // (mirrors 27.3's composition-observability fold), so promoting the fold
        // never drops the unfiltered log truth — no regression.
        case 'omniLogs':
            return (
                <div className="tool-stream-fold" data-testid="tool-stream-fold">
                    <ToolStreamPanel />
                    <details open className="tool-stream-raw-logs" data-testid="tool-stream-raw-logs">
                        <summary>Raw gateway logs</summary>
                        <LogsPane />
                    </details>
                </div>
            );
        // 44.T44.3 — the Review fold renders the first real data through the
        // block standard (27.6 extends with the live review reads + submit).
        case 'omniReview':
            return (
                <ReviewBlocksPane
                    requestedReviewId={
                        ((node.getConfig() as { requestedReviewId?: unknown })?.requestedReviewId as string) ?? null
                    }
                />
            );
        case 'omniTuning':
            return <TuningPane />;
        case 'omniDispatchTrace':
            return <DispatchTracePanel />;
        // 27.T27.5 — the Evidence fold IS the MediatedRunEvidencePacket landing
        // surface (15.2 "the tab is the surface"; no modal). Honest-empty until a
        // real deposit feed lands (s5.epii.deposit — feed-gated, 27.5 tail).
        case 'omniEvidence':
            return <EvidencePanel />;
        // 27.T27.7 — the Gateway fold IS capability-list + parity + readiness +
        // try-it, folded from the live s4'.mediation.capabilities.list snapshot;
        // un-ported facets + disconnect render honest ReadinessBanners.
        case 'omniGateway':
            return <GatewayPanel />;
        // 27.T27.8 — the Diagnostics fold IS kernel-bridge telemetry + intent
        // log: readiness ledger, profile-tick generation, gateway WS state,
        // active layout, and the CrossLayoutIntent log — all from live stores;
        // absent feeds (subscriber count, s2 ping) render honest ReadinessBanners.
        case 'omniDiagnostics':
            return <DiagnosticsPanel activeLayout={activeLayout} />;
        // 32.T32.4 — the Settings fold IS the preference surface: six sections
        // over the one register (31.T31.9), live keys as working controls and
        // the rest as honest pending/superseded/declined disclosures. A fold,
        // not a dialog, per 15.2 + CCT-8.
        case 'omniSettings':
            return <SettingsPane />;
            default:
                return <div className="pane-message">unknown pane: {node.getComponent()}</div>;
        }
    })();
    const config = node.getConfig();
    const rawIntent = config && typeof config === 'object' && !Array.isArray(config)
        ? (config as { crossLayoutIntent?: unknown }).crossLayoutIntent
        : undefined;
    if (rawIntent === undefined) {
        return pane;
    }
    const routedIntent = parseCrossLayoutIntent(rawIntent);
    const routedTarget = intentTarget(routedIntent);
    if (!routedTarget || routedTarget.component !== node.getComponent()) {
        throw new Error('cross-layout intent receiver does not match its mounted host');
    }
    return (
        <div
            className="cross-layout-intent-receiver"
            data-testid="cross-layout-pane-receiver"
            data-requested-extension-id={routedIntent.requestedExtensionId}
            data-requested-contribution-id={routedIntent.requestedContributionId}
        >
            {pane}
        </div>
    );
}

function safeModel(json: unknown, fallback: object): Model {
    try {
        return Model.fromJson(json as Parameters<typeof Model.fromJson>[0]);
    } catch {
        return Model.fromJson(fallback as Parameters<typeof Model.fromJson>[0]);
    }
}

export function App() {
    const [face, setFace] = useState<Face>(1);
    const [activeLayout, setActiveLayout] = useState<OmniPanelLayoutId>('daily-0-1');
    const [routingRevision, setRoutingRevision] = useState(0);
    const [m0Surface, setM0Surface] = useState<M0SurfaceState>(DEFAULT_M0_SURFACE_STATE);
    const [m2Surface, setM2Surface] = useState<M2SurfaceState>(DEFAULT_M2_SURFACE_STATE);
    const activeOmniTab = useOmniPanelSessionStore(state => state.session.activeTab);
    // 52.T6 — the activity-bar mode, live on the shell for tests and chrome.
    const activityBarMode: LeftSidebarModeId = useLeftSidebarModeStore(
        state => state.activeModeId
    );
    const [routedHost, setRoutedHost] = useState<{
        readonly face: Face;
        readonly extensionId: string;
        readonly contributionId: string;
    } | null>(null);
    const [pasuWizardOpen, setPasuWizardOpen] = useState(false);

    // 32.T32.2: on the first profile-tick, detect PASU absence and mount the
    // 25.T25.4 identity wizard (pre-kairos). Fires once; a completed or skipped
    // wizard proceeds. Subscribes to the tick store directly so App does not
    // re-render on every tick.
    useEffect(() => {
        let fired = false;
        const check = (generation: number | null) => {
            if (fired || generation === null) {
                return;
            }
            fired = true;
            void (async () => {
                const present = await detectPasuPresence((method, params) =>
                    gateway()
                        .invoke(method, params)
                        .then(receipt => (receipt as { artifact?: unknown }).artifact ?? receipt)
                );
                const preferences = browserKairosPreferences(window.localStorage);
                if (coldStartPasuBranch(present, preferences.get(PASU_SKIPPED_PREFERENCE)) === 'mount-wizard') {
                    setPasuWizardOpen(true);
                }
            })();
        };
        check(useTickStore.getState().generation);
        return useTickStore.subscribe(state => check(state.generation));
    }, []);
    const activeLayoutRef = useRef<OmniPanelLayoutId>('daily-0-1');
    activeLayoutRef.current = activeLayout;
    const crossLayoutIdentityReceiptRef = useRef<CrossLayoutIdentityReceipt | null>(null);
    const [models, setModels] = useState<ShellModels | null>(null);
    const faceRef = useRef<Face>(1);
    faceRef.current = face;
    const modelsRef = useRef<typeof models>(null);
    modelsRef.current = models;
    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const m0SurfaceRef = useRef<M0SurfaceState>(DEFAULT_M0_SURFACE_STATE);
    const m2SurfaceRef = useRef<M2SurfaceState>(DEFAULT_M2_SURFACE_STATE);

    // boot: restore persisted UI state (or defaults outside tauri)
    useEffect(() => {
        // 52.T5: the restore is CANCELLED on effect cleanup. StrictMode runs
        // this effect twice, so two loads used to race — and the second
        // `setModels` replaced the live models object, silently swallowing any
        // tab the user (or a test) had opened between the two resolutions
        // (dynamic workspace tabs, `vault.open` editors). Exactly one restore
        // may apply.
        let cancelled = false;
        invokeCommand<string | null>('ui_state_load')
            .then(raw => (raw ? (JSON.parse(raw) as PersistedUiState) : {}))
            .catch(() => ({}) as PersistedUiState)
            .then(state => {
                if (cancelled) {
                    return;
                }
                // 52.T3: the switch's own store first; the pre-52.T3 `ui_state`
                // value is the legacy fallback so an existing install resumes
                // into the layout it was left in exactly once, then migrates.
                const stored = readStoredLayout();
                const restoredLayout =
                    stored
                    ?? parseOmniPanelLayoutPreference(state[OMNIPANEL_ACTIVE_LAYOUT_PREFERENCE_KEY]);
                if (!stored) {
                    writeStoredLayout(restoredLayout);
                }
                useOmniPanelSessionStore.getState().hydrate(state.omniPanel);
                activeLayoutRef.current = restoredLayout;
                setActiveLayout(restoredLayout);
                // 52.T6 — the activity-bar store tracks the layout it serves;
                // a shell that resumes into `ide-deep` must not leave the
                // mode store believing it is in daily.
                useLeftSidebarModeStore.getState().switchLayout(restoredLayout);
                // 52.T4: each layout's models are built with THEIR OWN layout
                // id, not with whichever layout the shell restored into — the
                // `/` membrane's per-layout tab filter belongs to the model it
                // is part of, so a daily model can no longer be born carrying
                // the deep layout's fold set (or the reverse).
                const personalFallback = personalDefault('daily-0-1');
                const cosmicFallback = cosmicDefault('daily-0-1');
                const personalDeepFallback = ideDeepDefault('personal', 'ide-deep');
                const cosmicDeepFallback = ideDeepDefault('cosmic', 'ide-deep');
                const layoutsCurrent = state.layoutVersion === LAYOUT_VERSION;
                const restore = (saved: unknown, fallback: object) =>
                    safeModel(layoutsCurrent ? (saved ?? fallback) : fallback, fallback);
                setModels({
                    'daily-0-1': {
                        personal: restore(state.personal, personalFallback),
                        cosmic: restore(state.cosmic, cosmicFallback)
                    },
                    'ide-deep': {
                        personal: restore(state.personalDeep, personalDeepFallback),
                        cosmic: restore(state.cosmicDeep, cosmicDeepFallback)
                    }
                });
                if (state.face === 0 || state.face === 1) {
                    setFace(state.face);
                }
                if (state.coordinate) {
                    useCoordinateStore.getState().setSelected(state.coordinate);
                }
                const restoredM0Surface = deserializeM0SurfaceState(state.m0Surface);
                m0SurfaceRef.current = restoredM0Surface;
                setM0Surface(restoredM0Surface);
                const restoredM2Surface = deserializeM2SurfaceState(state.m2Surface);
                m2SurfaceRef.current = restoredM2Surface;
                setM2Surface(restoredM2Surface);
                if (state.sessionKey) {
                    useSessionStore.getState().setSession({ sessionKey: state.sessionKey });
                }
            });
        // adopt today's day if it already exists (no side effect — creation is
        // the explicit journal.beginToday gesture); closes the dayNow gap the
        // Sprint-2 verifier flagged
        invokeCommand<VaultEntry[]>('vault_list', { path: 'Empty/Present' })
            .then(entries => {
                if (cancelled) {
                    return;
                }
                const candidates = [todayId(), todayIdLegacy()];
                const found = candidates.find(id => entries.some(e => e.isDir && e.name === id));
                if (found) {
                    useSessionStore.getState().setSession({ dayNow: found });
                }
            })
            .catch(() => undefined);
        return () => {
            cancelled = true;
        };
    }, []);

    const persist = useCallback(() => {
        if (saveTimer.current) {
            clearTimeout(saveTimer.current);
        }
        saveTimer.current = setTimeout(() => {
            const current = modelsRef.current;
            if (!current) {
                return;
            }
            const state: PersistedUiState = {
                layoutVersion: LAYOUT_VERSION,
                face: faceRef.current,
                personal: current['daily-0-1'].personal.toJson(),
                cosmic: current['daily-0-1'].cosmic.toJson(),
                personalDeep: current['ide-deep'].personal.toJson(),
                cosmicDeep: current['ide-deep'].cosmic.toJson(),
                sessionKey: useSessionStore.getState().sessionKey,
                coordinate: useCoordinateStore.getState().selected,
                m0Surface: serializeM0SurfaceState(m0SurfaceRef.current),
                m2Surface: serializeM2SurfaceState(m2SurfaceRef.current),
                omniPanel: readOmniPanelSessionState()
                // 52.T3: the layout preference is NOT written here any more —
                // `epi-logos.layout.active` has one writer (`applyLayout` →
                // `ui/layoutPreference.ts`), so the Settings fold's register
                // read and the shell's own read cannot disagree.
            };
            void Promise.resolve(
                invokeCommand('ui_state_save', { json: JSON.stringify(state) })
            ).catch(() => undefined);
        }, 800);
    }, []);

    // 52.T3 — THE layout transition seam. Both ways into a layout change go
    // through here: the deliberate switch (below) and a cross-layout intent
    // whose resolved target declares a `preferredLayout`. It applies the layout
    // to the ref (read synchronously by everything else in this component), to
    // React state (what renders), and to the persisted preference — one writer.
    const applyLayout = useCallback((next: LayoutId) => {
        activeLayoutRef.current = next;
        setActiveLayout(next);
        writeStoredLayout(next);
    }, []);

    // The deliberate switch: canon's omni-panel mechanism and the palette
    // commands both land here. Every real transition mints the seven-field
    // cross-layout identity receipt — this is the exact place that invariant
    // earns its keep. The before/after reads are synchronous and adjacent, so
    // nothing (not even a profile tick) can land between them; a receipt that
    // throws means the shell really did drop identity across the transition.
    const switchLayout = useCallback(
        (next: LayoutId) => {
            const fromLayout = activeLayoutRef.current;
            if (next === fromLayout) {
                return; // not a transition; there is nothing to receipt
            }
            const identityBefore = readCrossLayoutIdentity();
            applyLayout(next);
            crossLayoutIdentityReceiptRef.current = createCrossLayoutIdentityReceipt(
                fromLayout,
                next,
                identityBefore,
                readCrossLayoutIdentity()
            );
            // 52.T6 — the activity-bar fallback happens AFTER the receipt is
            // minted: `activityBarMode` is one of the seven identity fields,
            // and the crossing must preserve it (the receipt throws on drift).
            // The fallback that follows is the LEFT SLOT's own lawful
            // resolution (`resolveModeForLayout` — a deep-only mode cannot
            // survive into daily and falls back to the backbone), not an
            // identity drift, so it lives outside the receipt window.
            useLeftSidebarModeStore.getState().switchLayout(next);
            // 52.T4 — this is the seam 52.T3 flagged for the tranche that
            // builds models per layout. It STAYS, with a changed reason. The
            // two `<Layout>` slots are now fed a DIFFERENT Model object per
            // layout, so the stale-factory-output problem 52.T3 was solving is
            // gone by construction (a different model means different TabNodes
            // and a fresh factory call). What the remount still buys is the
            // discard: a surface that exists in BOTH cells — `bimbaGraph`,
            // `m1SurfaceDeep`, every omni fold — would otherwise keep the
            // previous layout's mounted subtree alive under a swapped model
            // prop, and answer for it. Same remount the cross-layout intent
            // seam uses, for the same reason.
            setRoutingRevision(revision => revision + 1);
        },
        [applyLayout]
    );

    // 52.T5 — the subsystem-page entry (DR-SUBSYS-1). Ensures the deep layout
    // through the ONE transition seam (identity receipt minted there), then
    // opens/selects the page's workspace tab in the ACTIVE face's deep model —
    // idempotent by node id, face-local mechanically (the hidden face keeps
    // its overview; state continuity rides the shared stores per
    // [[M'-SYSTEM-SPEC]] :176), dynamic always (default models unchanged, so
    // LAYOUT_VERSION does not move). SINGLE OCCUPANCY: opening a page removes
    // any OTHER page tab from that model first — a full-page workspace, and
    // the strip stays under the carrier's measured 11-tab click-death limit.
    // The dock target falls back to the model's active tabset when the named
    // deep tabset is gone (a drag-split can auto-delete an emptied tabset and
    // persist that shape; flexlayout SKIPS an addNode to a missing target, so
    // without the fallback the command would be a silent permanent no-op).
    const openSubsystemWorkspace = useCallback(
        (pageId: SubsystemPageId) => {
            const current = modelsRef.current;
            const page = SUBSYSTEM_PAGES.find(candidate => candidate.id === pageId);
            if (!current || !page) {
                return;
            }
            if (activeLayoutRef.current !== 'ide-deep') {
                switchLayout('ide-deep');
            }
            const model = modelOf(current, faceRef.current, 'ide-deep');
            const nodeId = subsystemPageNodeId(page.id);
            for (const other of SUBSYSTEM_PAGES) {
                const otherId = subsystemPageNodeId(other.id);
                if (otherId !== nodeId && model.getNodeById(otherId)) {
                    model.doAction(Actions.deleteTab(otherId));
                }
            }
            if (model.getNodeById(nodeId)) {
                model.doAction(Actions.selectTab(nodeId));
            } else {
                const namedTabset = deepMainTabsetId(faceRef.current === 0 ? 'cosmic' : 'personal');
                const targetTabset = model.getNodeById(namedTabset)
                    ? namedTabset
                    : model.getActiveTabset()?.getId();
                if (!targetTabset) {
                    return;
                }
                model.doAction(
                    Actions.addNode(
                        {
                            type: 'tab',
                            id: nodeId,
                            name: page.tabLabel,
                            component: page.surfaceId,
                            enableClose: true
                        },
                        targetTabset,
                        DockLocation.CENTER,
                        -1,
                        true
                    )
                );
            }
            persist();
        },
        [switchLayout, persist]
    );

    const updateM0Surface = useCallback((patch: Partial<M0SurfaceState>) => {
        const next = { ...m0SurfaceRef.current, ...patch };
        m0SurfaceRef.current = next;
        setM0Surface(next);
        persist();
    }, [persist]);

    const updateM2Surface = useCallback((patch: Partial<M2SurfaceState>) => {
        const next = { ...m2SurfaceRef.current, ...patch };
        m2SurfaceRef.current = next;
        setM2Surface(next);
        persist();
    }, [persist]);

    useEffect(() => useOmniPanelSessionStore.subscribe(() => persist()), [persist]);

    // 52.T6 — mode activation has a real effect on the LEFT SLOT: when a mode
    // is EXPLICITLY selected and its surface is left-border-resident in the
    // current (face, layout) model, that border tab is selected — opening the
    // collapsed deep rail, which is exactly the explicit gesture the
    // opens-closed law waits for. Called ONLY from the command path (via the
    // decorated store below), never from a store subscription: the
    // `resolveModeForLayout` fallback that settles a crossing must not fire an
    // unasked reveal (DR-ABAR-1 scopes the reveal to "selecting a mode", and
    // the 28.T28.6 law holds — the navigation backbone never mounts unasked).
    // TOGGLE GUARD: flexlayout's SELECT_TAB on a border TOGGLES — re-selecting
    // the already-selected tab collapses the rail — so an activation whose tab
    // is already up is a no-op, never a collapse. Main-area mode surfaces
    // (Bimba Graph Viewer, Canon Studio) keep their main-tabset homes: the
    // activity bar governs the left slot and records the mode; it never
    // re-mounts a main surface into a rail.
    const revealLeftSidebarMode = useCallback(
        (modeId: LeftSidebarModeId) => {
            const current = modelsRef.current;
            if (!current) {
                return;
            }
            const surfaceId = leftSidebarMode(modeId).surfaceId;
            const model = modelOf(current, faceRef.current, activeLayoutRef.current);
            for (const border of model.getBorderSet().getBorders()) {
                if (border.getLocation() !== DockLocation.LEFT) {
                    continue;
                }
                const selected = border.getSelectedNode();
                for (const child of border.getChildren()) {
                    if ((child as TabNode).getComponent() !== surfaceId) {
                        continue;
                    }
                    if (selected?.getId() === child.getId()) {
                        return; // already up — selecting again would COLLAPSE
                    }
                    model.doAction(Actions.selectTab(child.getId()));
                    persist();
                    return;
                }
            }
        },
        [persist]
    );

    // 27.11 authority is the shared session store (activeTab + per-tab state,
    // persisted) surfaced via `data-omnipanel-active-tab`; `syncOmniPanelSelection`
    // records the user's fold choice INTO it. An imperative doAction that
    // re-selected the destination face's fold on every face change hijacked the
    // active tabset and raced in-face main-tab navigation (regressed ~19 e2e
    // specs), so the fold-carry is store-authoritative, not a layout mutation.

    // gateway client + session binding + liveness watchdog
    useEffect(() => {
        let lastProfileAt = 0;
        let bound = false;
        // Bell spec §9: the chime frame is the strike authority when the
        // stream is live; profile arrival is the legacy route. One strike
        // per generation, kernel role labels either way. The strike is geared
        // by the active temporal division through the modulation graph
        // (Sprint-8 E3 — lens selection re-gears the rhythmic subdivision).
        const strikeRouter = createStrikeRouter({
            strike: roles => instrument.strike(roles, modulationEngine.currentSubdivision())
        });
        const client = new GatewayClient(undefined, {
            onProfile: profile => {
                lastProfileAt = Date.now();
                useProvenanceStore.getState().setStale(false);
                // 29.T29.4 — the one seam a profile frame enters through.
                publishProfileTick(profile);
                // the instrument follows the kernel's Vimarśa reading — bus
                // tracked always, audible only when unmuted
                const hp = (
                    profile.profile as {
                        harmonicProfile?: { audioOctet?: number[]; modalResonator?: ModalResonatorBoundary };
                    } | null
                )?.harmonicProfile;
                if (Array.isArray(hp?.audioOctet)) {
                    instrument.setBus(hp.audioOctet);
                    strikeRouter.onProfile(profile.generation, extractBellRoles(hp.modalResonator));
                }
            },
            onChime: frame => {
                strikeRouter.onChime(
                    frame.sourceProfileGeneration,
                    extractBellRoles(frame.m2?.modalResonator),
                    isChimeCoherent(frame)
                );
            },
            onEvent: event => {
                useEventsStore.getState().push(event);
                // 28.11e: the shared readiness store is fed from the ONE gateway
                // readiness channel, so every bridge-gate reads the same source.
                if (event.kind === 'readiness') {
                    useReadinessStore.getState().ingestReadinessEvent(event.payload);
                }
            },
            onStatus: status => {
                useProvenanceStore.getState().setConnection(status);
                if (status.connected && !bound) {
                    bound = true;
                    const sessions = new SessionClient(client);
                    void sessions
                        .bind(useSessionStore.getState().sessionKey)
                        .then(record => {
                            if (record) {
                                useSessionStore.getState().setSession({
                                    sessionKey: record.sessionKey,
                                    privacyClass: null
                                });
                            }
                        })
                        .catch(() => undefined);
                }
            }
        });
        client.start('lite');
        setGateway(client);
        // liveness watchdog — NOT a render clock: it only flips the stale flag
        const watchdog = setInterval(() => {
            const { connection, stale, setStale } = useProvenanceStore.getState();
            const isStale = connection.connected && Date.now() - lastProfileAt > STALE_WINDOW_MS;
            if (isStale !== stale) {
                setStale(isStale);
            }
        }, 5000);
        let unlistenSupervisor: (() => void) | undefined;
        void wireSupervisorEvents().then(unlisten => {
            unlistenSupervisor = unlisten;
        });
        return () => {
            clearInterval(watchdog);
            setGateway(null);
            client.dispose();
            unlistenSupervisor?.();
        };
    }, []);

    // command registration
    useEffect(() => {
        // 16.T16.19 (CCT-19) + 26.T26.3: Atelier scent-following activation —
        // commands over the file/coordinate the user is already in; scent-follow
        // stages a Hen candidate, the root stage traces the active coordinate.
        const atelierDisposers = registerAtelierCommands({
            activeMarkdownPath: () => {
                const current = modelsRef.current;
                if (!current) {
                    return null;
                }
                const openEditorIn = (layout: LayoutId): string | null => {
                    let path: string | null = null;
                    modelOf(current, 1, layout).visitNodes(node => {
                        if (
                            node.getType() === 'tab' &&
                            (node as TabNode).getComponent() === 'editor' &&
                            (node as TabNode).isVisible()
                        ) {
                            path = ((node as TabNode).getConfig() as { path?: string })?.path ?? null;
                        }
                    });
                    return path;
                };
                // 28.T28.7: the open note is the open note. A layout switch does
                // not close the user's file, and the Atelier acts on the file
                // they are in — so the ACTIVE layout answers first and the other
                // is the fallback. Without this, carrying a `logos-atelier`
                // intent into `ide-deep` (whose personal model has no editor
                // tabset at all) silently disabled the Möbius write-back stage
                // of the very surface the intent had just opened.
                const active = activeLayoutRef.current;
                const other: LayoutId = active === 'ide-deep' ? 'daily-0-1' : 'ide-deep';
                return openEditorIn(active) ?? openEditorIn(other);
            },
            dayId: () => useSessionStore.getState().dayNow ?? null,
            // 26.T26.3: the root/etymology stage rides s5'.gnostic.etymology, which
            // takes the active bimba coordinate (not a path).
            activeCoordinate: () => useCoordinateStore.getState().selected ?? null,
            invoke: (method, params) => gateway().invoke(method, params),
            ready: () => gatewayReady(),
            // 28.T28.7 (d): the Möbius write-back's governed route. The Atelier
            // owns no transport — it hands the envelope to the ONE cross-layout
            // intent command, which carries the staged candidate to Canon Studio.
            dispatchIntent: intent => commands.execute(CROSS_LAYOUT_INTENT_COMMAND, intent),
            sessionKey: () => useSessionStore.getState().sessionKey ?? null,
            privacyClass: () => {
                const value = useSessionStore.getState().privacyClass;
                return value === 'public' || value === 'protected' || value === 'private'
                    ? value
                    : null;
            }
        });
        const disposers = [
            ...atelierDisposers,
            // 52.T3 — the layout switch canon names the omni panel as. Reads
            // the live layout through the ref and hands every transition to the
            // one `switchLayout` seam (which mints the identity receipt).
            registerLayoutCommands({
                activeLayout: () => activeLayoutRef.current,
                switchTo: layout => switchLayout(layout)
            }),
            // 52.T5 — the six subsystem-page entries (the Home grid tiles and
            // the command palette land on these; the OmniPanel carries no
            // route to the pages today — named in DR-SUBSYS-3).
            registerSubsystemCommands({
                openWorkspace: pageId => openSubsystemWorkspace(pageId)
            }),
            // 52.T6 — the five `leftSidebar.mode.*` commands, registered at
            // the seam the registry documented for its controller. Deep-only
            // modes are enabled-gated by the store's layout, which is now
            // really synced (above/below), so Backend Studio and Smart
            // Connections genuinely grey out in `daily-0-1`. The store is
            // DECORATED so the left-slot reveal rides the explicit command
            // gesture itself — and only when the activation actually took
            // (the store refuses modes unavailable in the current layout).
            ...registerLeftSidebarModeCommands(commands, {
                getState: () => {
                    const state = useLeftSidebarModeStore.getState();
                    return {
                        ...state,
                        setActiveMode: modeId => {
                            state.setActiveMode(modeId);
                            if (useLeftSidebarModeStore.getState().activeModeId === modeId) {
                                revealLeftSidebarMode(modeId);
                            }
                        }
                    };
                }
            }),
            registerCrossLayoutIntentCommand({
                setCoordinate: coordinate => useCoordinateStore.getState().setSelected(coordinate),
                applySession: context =>
                    useSessionStore.getState().setSession({
                        ...(context.dayNow ? { dayNow: context.dayNow } : {}),
                        ...(context.sessionKey ? { sessionKey: context.sessionKey } : {}),
                        ...(context.privacyClass ? { privacyClass: context.privacyClass } : {})
                    }),
                navigate: (target, intent) => {
                    const current = modelsRef.current;
                    if (!current) {
                        throw new Error('cross-layout intent: layouts are not ready');
                    }
                    const fromLayout = activeLayoutRef.current;
                    const toLayout = target.preferredLayout ?? fromLayout;
                    const identityBefore = readCrossLayoutIdentity();
                    // 52.T4: the receiver is looked up in the model of the
                    // layout the intent is carrying the user INTO, not the one
                    // they are leaving — the layout is applied first so the
                    // "component is not mounted" refusal below judges the
                    // destination cell.
                    if (target.preferredLayout && target.preferredLayout !== activeLayoutRef.current) {
                        applyLayout(target.preferredLayout);
                    }
                    const model = modelOf(current, target.face, toLayout);
                    if (faceRef.current !== target.face) {
                        setFace(target.face);
                    }
                    let nodeId: string | null = null;
                    let existingConfig: Record<string, unknown> = {};
                    model.visitNodes(node => {
                        if (node.getType() === 'tab' && (node as TabNode).getComponent() === target.component) {
                            nodeId = node.getId();
                            const config = (node as TabNode).getConfig();
                            existingConfig = config && typeof config === 'object' && !Array.isArray(config)
                                ? config as Record<string, unknown>
                                : {};
                        }
                    });
                    if (!nodeId) {
                        throw new Error(`cross-layout intent: component ${target.component} is not mounted`);
                    }
                    model.doAction(
                        Actions.updateNodeAttributes(nodeId, {
                            config: {
                                ...existingConfig,
                                crossLayoutIntent: intent,
                                ...(target.component === 'omniReview'
                                    ? { requestedReviewId: intent.reviewId }
                                    : {})
                            }
                        })
                    );
                    model.doAction(Actions.selectTab(nodeId));
                    setRoutedHost({
                        face: target.face,
                        extensionId: intent.requestedExtensionId,
                        contributionId: intent.requestedContributionId
                    });
                    crossLayoutIdentityReceiptRef.current = createCrossLayoutIdentityReceipt(
                        fromLayout,
                        toLayout,
                        identityBefore,
                        readCrossLayoutIdentity()
                    );
                    // 52.T6 — same law as `switchLayout`: the activity-bar
                    // fallback settles AFTER the receipt, outside the window.
                    useLeftSidebarModeStore.getState().switchLayout(toLayout);
                    // FlexLayout caches factory output. Remount the view shell so
                    // the selected host consumes its newly delivered node config.
                    setRoutingRevision(revision => revision + 1);
                    persist();
                }
            }),
            // 27.T27.9 — OmniPanelIntentRouter seam: a CrossLayoutIntent whose
            // requestedContributionId names an OmniPanel-internal route (e.g.
            // `evidence-pane.select-packet`) activates the target fold, applies
            // the per-tab payload (preserving unrelated fold state), reveals the
            // membrane, and opens the FlexLayout border tab on the active face.
            commands.register({
                id: OMNIPANEL_INTENT_ROUTE_COMMAND,
                title: 'OmniPanel: Route cross-layout intent to a fold',
                run: input => {
                    const intent = parseCrossLayoutIntent(input);
                    const result = omniPanelIntentRouter.route(intent);
                    useCrossLayoutIntentLogStore
                        .getState()
                        .record({ at: Date.now(), intent, outcome: result ? 'ok' : 'error' });
                    if (!result) {
                        throw new Error(
                            `no OmniPanel route for ${intent.requestedExtensionId}/${intent.requestedContributionId}`
                        );
                    }
                    applyOmniPanelRouting(result, {
                        revealBorderTab: tab => {
                            const current = modelsRef.current;
                            if (!current) {
                                return;
                            }
                            const model = modelOf(current, faceRef.current, activeLayoutRef.current);
                            const nodeId = tab === 'pi-chat' ? 'omni-tab' : `omni-${tab}`;
                            if (model.getNodeById(nodeId)) {
                                model.doAction(Actions.selectTab(nodeId));
                            }
                            persist();
                        }
                    });
                }
            }),
            commands.register({
                id: 'face.toggle',
                title: 'Shell: Toggle 0/1 face (⌘.)',
                run: () => {
                    setFace(current => (current === 0 ? 1 : 0));
                    persist();
                }
            }),
            commands.register({
                id: 'identity.openWizard',
                title: 'Identity: Open PASU setup wizard',
                run: () => setPasuWizardOpen(true)
            }),
            commands.register({
                id: 'palette.toggle',
                title: 'Shell: Command palette (⌘⇧P)',
                run: () => usePaletteStore.getState().setOpen(!usePaletteStore.getState().open)
            }),
            commands.register({
                id: 'vault.open',
                title: 'Vault: Open file…',
                run: arg => {
                    const path = typeof arg === 'string' ? arg : null;
                    const current = modelsRef.current;
                    if (!path || !current) {
                        return;
                    }
                    if (faceRef.current !== 1) {
                        setFace(1);
                    }
                    // 52.T4: Canon Studio opens in the layout the user is in —
                    // the daily personal model or the deep one. In `ide-deep`
                    // this IS the "Canon Studio" half of the M0/M5 IDE chrome
                    // ([[M5'-SPEC]] :161), docked in `personal-deep-main`.
                    const personal = modelOf(current, 1, activeLayoutRef.current);
                    let existing: string | null = null;
                    personal.visitNodes(node => {
                        if (
                            node.getType() === 'tab' &&
                            (node as TabNode).getComponent() === 'editor' &&
                            ((node as TabNode).getConfig() as { path?: string })?.path === path
                        ) {
                            existing = node.getId();
                        }
                    });
                    if (existing) {
                        personal.doAction(Actions.selectTab(existing));
                    } else {
                        personal.doAction(
                            Actions.addNode(
                                {
                                    type: 'tab',
                                    name: path.split('/').pop() ?? path,
                                    component: 'editor',
                                    config: { path }
                                },
                                personal.getActiveTabset()?.getId()
                                    ?? mainTabsetIdFor(activeLayoutRef.current),
                                DockLocation.CENTER,
                                -1,
                                true
                            )
                        );
                    }
                    persist();
                }
            }),
            commands.register({
                id: 'gateway.restart',
                title: 'Gateway: Restart under supervision',
                enabled: () => useProvenanceStore.getState().supervisor.state !== 'probing',
                run: () => invokeCommand<string>('gateway_restart').then(() => undefined)
            }),
            commands.register({
                id: 'instrument.toggleMute',
                title: 'Instrument: Toggle sound (kernel audio bus)',
                run: () => {
                    const store = useInstrumentStore.getState();
                    if (!instrument.running) {
                        instrument.start();
                        store.setRunning(true);
                    }
                    const muted = !store.muted;
                    instrument.setMuted(muted);
                    store.setMuted(muted);
                }
            }),
            commands.register({
                id: 'journal.beginToday',
                title: 'Journal: Begin today (anchor the day)',
                run: async () => {
                    const anchor = await invokeCommand<{ dayId: string; dailyNotePath: string; created: boolean }>(
                        'begin_today'
                    );
                    useSessionStore.getState().setSession({ dayNow: anchor.dayId });
                    if (faceRef.current !== 1) {
                        setFace(1);
                    }
                    persist();
                }
            }),
            commands.register({
                id: 'journal.startFirstSession',
                title: 'Journal: Start first session',
                enabled: () => gatewayReady(),
                run: async () => {
                    const preferences = browserKairosPreferences(window.localStorage);
                    const receipt = await startFirstSession(todayIdLegacy(), {
                        preferences,
                        invoke: async (method, params) => (await gateway().invoke(method, params)).artifact
                    });
                    useSessionStore.getState().setSession({
                        dayNow: receipt.dayId,
                        sessionKey: receipt.sessionId,
                        privacyClass: 'protected'
                    });
                    if (faceRef.current !== 1) setFace(1);
                    persist();
                }
            }),
            commands.register({
                id: 'omnipanel.toggle',
                title: 'Shell: Toggle / membrane (⌘⇧O)',
                run: () => {
                    const current = modelsRef.current;
                    if (!current) {
                        return;
                    }
                    const model = modelOf(current, faceRef.current, activeLayoutRef.current);
                    if (model.getNodeById('omni-tab')) {
                        model.doAction(Actions.selectTab('omni-tab'));
                        persist();
                    }
                }
            }),
            commands.register({
                id: 'omnipanel.openReview',
                title: 'Review: Open OmniPanel review fold',
                run: arg => {
                    const current = modelsRef.current;
                    if (!current) {
                        return;
                    }
                    if (faceRef.current !== 1) {
                        setFace(1);
                    }
                    const personal = modelOf(current, 1, activeLayoutRef.current);
                    if (personal.getNodeById('omni-review')) {
                        const requestedReviewId =
                            arg && typeof arg === 'object' && 'reviewId' in arg && typeof arg.reviewId === 'string'
                                ? arg.reviewId
                                : null;
                        personal.doAction(
                            Actions.updateNodeAttributes('omni-review', { config: { requestedReviewId } })
                        );
                        personal.doAction(Actions.selectTab('omni-review'));
                        persist();
                    }
                }
            }),
            ...registerEngineCommands(commands),
            // 28.T28.6 (d): six per-family bulk-expand commands over the tree's
            // module-scope expand set — data-driven from the same frozen family
            // table the pane renders, so the catalog cannot drift from them.
            ...registerCoordinateTreeCommands(commands),
            // 31.T31.3 (CCT-4): cmd-1..cmd-8 → omnipanel.tab.activate.{0..7}.
            // Activation switches the visible fold on the active face AND the
            // shared session store, so both agree; the 9th tab ('tuning') is
            // intentionally unbound (CCT-4 names exactly eight chords).
            ...registerOmnipanelTabActivationCommands({
                activeModel: () => {
                    const current = modelsRef.current;
                    if (!current) {
                        return null;
                    }
                    return modelOf(current, faceRef.current, activeLayoutRef.current);
                },
                activeLayout: () => activeLayoutRef.current,
                persist
            })
        ];
        return () => disposers.forEach(dispose => dispose());
    }, []);

    // keybinding spine — every chord routes through the registry
    useEffect(() => {
        // Editable surfaces keep their keys (spec §8.8's cmd-space is
        // OS-owned on macOS, so bare space with a focus guard stands in).
        const inEditable = (evt: KeyboardEvent) =>
            evt.target instanceof Element &&
            evt.target.closest(
                'input, textarea, select, button, a[href], [contenteditable], .cm-editor'
            ) !== null;
        // 31.T31.3 (CCT-4): the active CrossLayoutIntent envelope, assembled
        // from live shell state and routed to the neutral shell Bimba-graph
        // coordinate viewer (a stable, always-resolvable cross-layout target).
        const dispatchActiveCrossLayoutIntent = () => {
            const privacyClass = useSessionStore.getState().privacyClass;
            return commands.execute(CROSS_LAYOUT_INTENT_COMMAND, {
                coordinate: useCoordinateStore.getState().selected,
                artifactUri: null,
                reviewId: null,
                dayNow: useSessionStore.getState().dayNow,
                sessionKey: useSessionStore.getState().sessionKey,
                profileGeneration: useTickStore.getState().generation,
                privacyClass:
                    privacyClass === 'public' || privacyClass === 'protected' || privacyClass === 'private'
                        ? privacyClass
                        : null,
                requestedExtensionId: 'ide-shell-m0-m5',
                requestedContributionId: 'bimba-graph'
            });
        };
        // CCT-5 two-stroke highlight prefix: cmd-H arms; the next user-side
        // category letter fires it. Held as effect-local state (like the gateway
        // watchdog's locals) — it persists across keydowns for this one listener.
        let highlightPrefixArmed = false;
        let highlightPrefixTimer: ReturnType<typeof setTimeout> | null = null;
        const disarmHighlightPrefix = () => {
            highlightPrefixArmed = false;
            if (highlightPrefixTimer) {
                clearTimeout(highlightPrefixTimer);
                highlightPrefixTimer = null;
            }
        };
        // User-side highlight categories ONLY (CCT-5): agent-side categories
        // (recognition/prospective/retrospective/kairos/somatic/live-spread →
        // r/p/s/k/b/l) are deliberately NOT keyboard-bindable — those are
        // inscribed by agents, never by a user chord.
        const USER_HIGHLIGHT_CHORDS: Readonly<Record<string, string>> = {
            d: 'daily-note',
            o: 'oracle',
            e: 'expand',
            m: 'dream'
        };
        const onKeyDown = (evt: KeyboardEvent) => {
            const meta = evt.metaKey || evt.ctrlKey;
            // CCT-5: when the cmd-H prefix is armed, the NEXT keystroke selects
            // the user-side highlight category and fires it over the live Nara
            // canvas; Escape or any non-matching key just disarms.
            if (highlightPrefixArmed) {
                const category = !meta ? USER_HIGHLIGHT_CHORDS[evt.key.toLowerCase()] : undefined;
                disarmHighlightPrefix();
                if (category) {
                    evt.preventDefault();
                    window.dispatchEvent(
                        new CustomEvent('m4.nara.user-highlight', { detail: { category } })
                    );
                } else if (evt.key === 'Escape') {
                    evt.preventDefault();
                }
                return;
            }
            if (meta && evt.key === '.') {
                evt.preventDefault();
                void commands.execute('face.toggle');
            } else if (meta && evt.shiftKey && evt.key.toLowerCase() === 'p') {
                evt.preventDefault();
                void commands.execute('palette.toggle');
            } else if (meta && evt.shiftKey && evt.key.toLowerCase() === 'o') {
                evt.preventDefault();
                void commands.execute('omnipanel.toggle');
            } else if (meta && evt.shiftKey && evt.key.toLowerCase() === 'l') {
                // CCT-4 cross-layout-intent shortcut — dispatch the active envelope.
                evt.preventDefault();
                void dispatchActiveCrossLayoutIntent();
            } else if (meta && evt.shiftKey && /^Digit[0-5]$/.test(evt.code)) {
                // CCT-3 cmd-shift-{0..5} → Mn family-root navigation. Architect
                // decision: select the family root through the existing coordinate
                // seam (`setSelected('M'+n)`), no face change — the minimal
                // existing-seam default. Matches on evt.code, not evt.key, because
                // Shift+digit yields a symbol ('#') in evt.key. The selection is
                // OBSERVABLE in the always-mounted status-strip `active-coordinate`
                // readout so an e2e can assert the family root really changed.
                evt.preventDefault();
                useCoordinateStore.getState().setSelected(`M${evt.code.slice(-1)}`);
                persist();
            } else if (meta && !evt.shiftKey && !evt.altKey && /^[1-8]$/.test(evt.key)) {
                // CCT-4 cmd-1..cmd-8 → OmniPanel tab activation by declared index
                // (cmd-1 → index 0 … cmd-8 → index 7). The 9th tab ('tuning',
                // index 8) is intentionally UNBOUND — CCT-4 names exactly eight.
                // The two remaining 31.T31.3 chord families are now bound: CCT-3
                // cmd-shift-{0..5} (Mn family-root nav, above) and CCT-5 cmd-H
                // (two-stroke user-highlight prefix, below). Both drive the
                // existing coordinate-store / Nara highlight-service seams
                // directly (no registry command, so no catalog row).
                evt.preventDefault();
                void commands.execute(`omnipanel.tab.activate.${Number(evt.key) - 1}`);
            } else if (meta && !evt.shiftKey && !evt.altKey && evt.key.toLowerCase() === 'h' && !inEditable(evt)) {
                // CCT-5 cmd-H arms the two-stroke user-highlight prefix; the next
                // user-side category letter (d/o/e/m) fires it over the live Nara
                // canvas. A 2s timeout or Escape disarms.
                evt.preventDefault();
                highlightPrefixArmed = true;
                if (highlightPrefixTimer) {
                    clearTimeout(highlightPrefixTimer);
                }
                highlightPrefixTimer = setTimeout(disarmHighlightPrefix, 2000);
            } else if (evt.key === ' ' && !meta && !evt.altKey && !inEditable(evt)) {
                evt.preventDefault();
                void commands.execute('engine.pauseToggle');
            } else if (
                (evt.key === 'ArrowLeft' || evt.key === 'ArrowRight') &&
                useEngineStore.getState().paused &&
                !inEditable(evt)
            ) {
                evt.preventDefault();
                void commands.execute(evt.key === 'ArrowLeft' ? 'engine.stepBack' : 'engine.stepForward');
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            disarmHighlightPrefix();
        };
    }, []);

    if (!models) {
        return <div className="boot-splash">pratibimba…</div>;
    }

    // 52.T3 — the switch rides the OmniPanel's OWN border strip (canon's named
    // mechanism, `M5'-SPEC` :159), not a shell overlay: the `right` slot stays
    // owned by the omnipanel exactly as `ui/shellSlotPolicy.ts` declares. Both
    // faces carry the shared `/` membrane, so both get the control; the hidden
    // face's copy is inert like every other surface on it.
    const renderOmniBorderChrome = (
        node: TabSetNode | BorderNode,
        values: ITabSetRenderValues
    ): void => {
        if (node instanceof BorderNode && node.getLocation() === DockLocation.RIGHT) {
            values.buttons.push(
                <OmniPanelLayoutSwitch key="omnipanel-layout-switch" activeLayout={activeLayout} />
            );
        }
    };

    // 52.T4 — what the ACTIVE layout actually mounts, read off the live models
    // rather than restated. Two consumers: the layout-claim receiver check
    // (which is layout-scoped by declaration, `ui/layoutClaims.ts`) and the
    // `data-layout-pane-set` readout, which is how a running browser can assert
    // that the deep layout really is a different pane set — and that the
    // remaining reserved `pending` seam (28.13) is genuinely NOT in it. 28.5 and
    // 28.6 consumed theirs and now appear in the readout by right.
    const activeCell = models[activeLayout];
    const activePaneSet = new Set<string>();
    for (const model of [activeCell.cosmic, activeCell.personal]) {
        model.visitNodes(node => {
            if (node.getType() === 'tab') {
                const component = (node as TabNode).getComponent();
                if (component) {
                    activePaneSet.add(component);
                }
            }
        });
    }
    const layoutClaims = resolveLayoutClaims(activeLayout, component =>
        activePaneSet.has(component)
    );
    const codePendingLayoutClaims = layoutClaims
        .filter(claim => claim.status === 'code-pending')
        .map(claim => claim.id)
        .join(' ');

    return (
        <M0SurfaceProvider state={m0Surface} update={updateM0Surface}>
            <M2SurfaceProvider state={m2Surface} update={updateM2Surface}>
            <div
            className="shell"
            data-testid="shell"
            data-face={face}
            data-active-layout={activeLayout}
            data-m0-surface-state={JSON.stringify(m0Surface)}
            data-m2-surface-state={JSON.stringify(m2Surface)}
            data-code-pending-layout-claims={codePendingLayoutClaims || undefined}
            data-layout-pane-set={[...activePaneSet].sort().join(' ')}
            data-omnipanel-active-tab={activeOmniTab}
            data-activity-bar-mode={activityBarMode}
            data-cross-layout-identity-receipt={
                crossLayoutIdentityReceiptRef.current
                    ? JSON.stringify(crossLayoutIdentityReceiptRef.current)
                    : undefined
            }
        >
            <CoordinateBreadcrumb />
            <FaceToggleChrome face={face} onToggle={() => void commands.execute('face.toggle')}>
                <div
                    className={`face-slot ${face === 0 ? 'face-active' : 'face-hidden'}`}
                    data-testid={routedHost?.face === 0 ? 'cross-layout-intent-receiver' : undefined}
                    data-requested-extension-id={routedHost?.face === 0 ? routedHost.extensionId : undefined}
                    data-requested-contribution-id={routedHost?.face === 0 ? routedHost.contributionId : undefined}
                >
                    <Layout
                        key={`cosmic-${activeLayout}-${routingRevision}`}
                        model={activeCell.cosmic}
                        factory={node => factory(node, activeLayout)}
                        onRenderTabSet={renderOmniBorderChrome}
                        onModelChange={model => {
                            syncOmniPanelSelection(model);
                            persist();
                        }}
                    />
                </div>
                <div
                    className={`face-slot ${face === 1 ? 'face-active' : 'face-hidden'}`}
                    data-testid={routedHost?.face === 1 ? 'cross-layout-intent-receiver' : undefined}
                    data-requested-extension-id={routedHost?.face === 1 ? routedHost.extensionId : undefined}
                    data-requested-contribution-id={routedHost?.face === 1 ? routedHost.contributionId : undefined}
                >
                    <Layout
                        key={`personal-${activeLayout}-${routingRevision}`}
                        model={activeCell.personal}
                        factory={node => factory(node, activeLayout)}
                        onRenderTabSet={renderOmniBorderChrome}
                        onModelChange={model => {
                            syncOmniPanelSelection(model);
                            persist();
                        }}
                    />
                </div>
                {face === 0 && activeLayout === 'daily-0-1' ? (
                    <M3DailyWheelMiniView />
                ) : null}
                {face === 0 && activeLayout === 'daily-0-1' ? (
                    <M4MercuriusRelayChip />
                ) : null}
                {face === 0 && activeLayout === 'daily-0-1' ? (
                    <M0CoordinateSummaryCard
                        onOpenFullView={() => {
                            const privacyClass = useSessionStore.getState().privacyClass;
                            void commands.execute(CROSS_LAYOUT_INTENT_COMMAND, {
                                coordinate: useCoordinateStore.getState().selected,
                                artifactUri: null,
                                reviewId: null,
                                dayNow: useSessionStore.getState().dayNow,
                                sessionKey: useSessionStore.getState().sessionKey,
                                profileGeneration: useTickStore.getState().generation,
                                privacyClass:
                                    privacyClass === 'public' || privacyClass === 'protected' || privacyClass === 'private'
                                        ? privacyClass
                                        : null,
                                requestedExtensionId: 'm0-anuttara',
                                requestedContributionId: 'graph'
                            });
                        }}
                    />
                ) : null}
            </FaceToggleChrome>
                {pasuWizardOpen ? (
                    <div className="pasu-wizard-overlay" data-testid="pasu-wizard-overlay">
                        <PasuWizardPane
                            gateway={{
                                invoke: (method, params) =>
                                    gateway()
                                        .invoke(method, params)
                                        .then(receipt => (receipt as { artifact?: unknown }).artifact ?? receipt)
                            }}
                            onStepComplete={step => {
                                const preferences = browserKairosPreferences(window.localStorage);
                                const completed = preferences.get(ONBOARDING_COMPLETED_STEPS_PREFERENCE);
                                const prior = Array.isArray(completed)
                                    ? completed.filter((entry): entry is string => typeof entry === 'string')
                                    : [];
                                preferences.set(ONBOARDING_COMPLETED_STEPS_PREFERENCE, [...new Set([...prior, step])]);
                            }}
                            onComplete={() => setPasuWizardOpen(false)}
                            onSkipWizard={() => {
                                recordPasuWizardSkip(browserKairosPreferences(window.localStorage));
                                setPasuWizardOpen(false);
                            }}
                        />
                    </div>
                ) : null}
                <StatusStrip />
                <CommandPalette />
            </div>
            </M2SurfaceProvider>
        </M0SurfaceProvider>
    );
}
