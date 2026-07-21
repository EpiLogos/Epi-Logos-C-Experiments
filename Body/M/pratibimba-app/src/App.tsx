/**
 * Coordinate: M' (one shell, two faces — now over a real pane system)
 * Residency: Body/M/pratibimba-app/src
 * Position (#n): active-carrier 0/1 shell composition root.
 * Actualises: the (0/1) shell as two flexlayout root layouts over one state
 *   tree, with the application foundations underneath: command registry,
 *   palette, vault panes, session binding, layout persistence, gateway
 *   liveness, and the persisted M0/M2 surface records. cmd-period IS the #
 *   inversion; the four stores are singletons so the faces cannot desynchronise.
 * Public surface: <App/>.
 * Does NOT own: gateway I/O (bridge/), vault law (src-tauri/vault.rs),
 *   command semantics (owners register them).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Actions, DockLocation, Layout, Model, TabNode } from 'flexlayout-react';
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
import { useEventsStore } from './state/eventsStore';
import { useReadinessStore } from './state/readinessStore';
import { useCoordinateStore, useProvenanceStore, useSessionStore, useTickStore } from './state/stores';
import {
    createCrossLayoutIdentityReceipt,
    CrossLayoutIdentityReceipt,
    readCrossLayoutIdentity
} from './state/crossLayoutIdentity';
import { StatusStrip } from './components/StatusStrip';
import { FaceToggleChrome } from './components/FaceToggleChrome';
import { M3DailyWheelMiniView } from './components/M3CompactViews';
import { CosmicEngine } from './engine/CosmicEngine';
import { modulationEngine, registerEngineCommands, useEngineStore } from './engine/modulation/engine';
import { PersonalRecognitionEngine } from './engine/PersonalRecognitionEngine';
import { GraphExplorerPane } from './panes/GraphExplorerPane';
import { SpandaNavigatorPane } from './panes/SpandaNavigatorPane';
import { WalkPane } from './panes/WalkPane';
import { M4DialogicalArenaPane } from './panes/M4DialogicalArenaPane';
import { CanonUpdateLedgerPane } from './panes/CanonUpdateLedgerPane';
import { AutoresearchPane } from './panes/AutoresearchPane';
import { KairosEnablementPane } from './panes/KairosEnablementPane';
import { MedicineViewPane } from './panes/MedicineViewPane';
import { TransformContainersPane } from './panes/TransformContainersPane';
import { M4LogosCyclePane } from './panes/M4LogosCyclePane';
import { PiAxiomTranslationInspector } from './panes/PiAxiomTranslationInspector';
import { SemanticConnectionsPane } from './panes/SemanticConnectionsPane';
import { CompositionDispatchTracePane } from './panes/omni/CompositionDispatchTracePane';
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
import { OmniPendingPane } from './panes/omni/OmniPendingPane';
import {
    filterOmniPanelTabsForLayout,
    OMNIPANEL_ACTIVE_LAYOUT_PREFERENCE_KEY,
    OMNIPANEL_TABS,
    OmniPanelLayoutId,
    omniPanelTabForComponent,
    parseOmniPanelLayoutPreference
} from './panes/omni/omnipanelRuntime';
import { readOmniPanelSessionState, useOmniPanelSessionStore } from './panes/omni/omnipanelSessionState';
import { VaultEntry } from './panes/FileTreePane';
import { MocBaseReflectionPane } from './bases/MocBaseReflectionPane';
import { assertDailyReceiverBindings } from './ui/dailySurfaceOwnership';
import { resolveLayoutClaims } from './ui/layoutClaims';
import { startFirstSession } from './onboarding/firstSessionOrchestration';
import { browserKairosPreferences } from './panes/kairosEnablement';

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
                { type: 'tab', name: 'Connections', component: 'semanticConnections', enableClose: false }
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

/** Bumped when the default layouts gain/lose panes — stale saved layouts
 *  fall back to defaults (face/session/coordinate still restore). */
const LAYOUT_VERSION = 22;

interface PersistedUiState {
    layoutVersion?: number;
    face?: Face;
    personal?: unknown;
    cosmic?: unknown;
    sessionKey?: string | null;
    coordinate?: string | null;
    m0Surface?: unknown;
    m2Surface?: unknown;
    omniPanel?: unknown;
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

function factory(node: TabNode) {
    const pane = (() => {
        switch (node.getComponent()) {
        case 'fileTree':
            return <FileTreePane />;
        case 'semanticConnections':
            return <SemanticConnectionsPane />;
        case 'editor':
            return <MarkdownEditorPane path={(node.getConfig() as { path: string }).path} />;
        case 'cosmic':
            return <CosmicEngine />;
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
                    crossLayoutIntent?: { requestedExtensionId?: string; requestedContributionId?: string };
                })?.crossLayoutIntent;
                const atelierTerm = routed?.requestedExtensionId === 'ide-shell-m0-m5'
                    && routed.requestedContributionId?.startsWith('term:')
                    ? routed.requestedContributionId.slice('term:'.length)
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
                />
            );
            }
        case 'mocBases':
            return <MocBaseReflectionPane />;
        case 'm2Correspondence':
            return <M2CorrespondencePane />;
        case 'kleinTopology':
            return <KleinTopologyPane />;
        case 'm1PlayedTorus':
            return <PlayedTorusPane />;
        // 22.T22.10 — M1 surface dispatch (DR-WC-M1-1: one singleton, pure views)
        case 'm1SurfaceComposed':
            return <M1SurfaceDispatchPane context={resolveM1SurfaceContext({ face: 0 })} />;
        case 'm1SurfaceDeep':
            return <M1SurfaceDispatchPane context={resolveM1SurfaceContext({ face: 1 })} />;
        case 'm3PentadicInspector':
            return <PentadicInspectorPane />;
        case 'm3Inspectors':
            return <M3InspectorsPane />;
        case 'm5Ebm':
            return <M5EbmObservatoryPane />;
        case 'personalHome':
            return <PersonalRecognitionEngine />;
        // 41.T41.7 — the M4' dia-logical arena carrier pane (CPF-gated wizard)
        case 'm4DialogicalArena':
            return <M4DialogicalArenaPane />;
        // 40.T40.5 — the Track-40 CU-ledger review surface (48 bases-view posture)
        case 'canonUpdateLedger':
            return <CanonUpdateLedgerPane />;
        // 28.T28.10 - real S5 autoresearch disclosure over status/history.
        case 'autoresearch':
            {
                const requestedContributionId = (node.getConfig() as {
                    crossLayoutIntent?: { requestedExtensionId?: string; requestedContributionId?: string };
                })?.crossLayoutIntent?.requestedContributionId;
                const requestedCapacity = requestedContributionId?.startsWith('capacity:')
                    ? requestedContributionId.slice('capacity:'.length)
                    : null;
                return (
                    <AutoresearchPane
                        requestedCapacity={
                            requestedCapacity && [
                                'anuttara-construction',
                                'paramasiva-cpt-rag',
                                'parashakti-graph-relational-ml',
                                'mahamaya-process-reward-rl',
                                'nara-anima-dialogic',
                                'epii-self-referential'
                            ].includes(requestedCapacity)
                                ? requestedCapacity as import('./panes/autoresearchModel').M5OperationalCapacity
                                : null
                        }
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
        case 'omniLogs':
            return <LogsPane />;
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
            return <CompositionDispatchTracePane />;
        // 27.T27.0: folds whose panels have not landed (27.3/.5/.7/.8
        // own the bodies) mount the honest pending pane.
        case 'omniEvidence':
        case 'omniGateway':
        case 'omniDiagnostics':
            return <OmniPendingPane componentKey={node.getComponent() ?? ''} />;
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
    const [routedHost, setRoutedHost] = useState<{
        readonly face: Face;
        readonly extensionId: string;
        readonly contributionId: string;
    } | null>(null);
    const activeLayoutRef = useRef<OmniPanelLayoutId>('daily-0-1');
    activeLayoutRef.current = activeLayout;
    const crossLayoutIdentityReceiptRef = useRef<CrossLayoutIdentityReceipt | null>(null);
    const [models, setModels] = useState<{ personal: Model; cosmic: Model } | null>(null);
    const faceRef = useRef<Face>(1);
    faceRef.current = face;
    const modelsRef = useRef<typeof models>(null);
    modelsRef.current = models;
    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const m0SurfaceRef = useRef<M0SurfaceState>(DEFAULT_M0_SURFACE_STATE);
    const m2SurfaceRef = useRef<M2SurfaceState>(DEFAULT_M2_SURFACE_STATE);

    // boot: restore persisted UI state (or defaults outside tauri)
    useEffect(() => {
        invokeCommand<string | null>('ui_state_load')
            .then(raw => (raw ? (JSON.parse(raw) as PersistedUiState) : {}))
            .catch(() => ({}) as PersistedUiState)
            .then(state => {
                const restoredLayout = parseOmniPanelLayoutPreference(
                    state[OMNIPANEL_ACTIVE_LAYOUT_PREFERENCE_KEY]
                );
                useOmniPanelSessionStore.getState().hydrate(state.omniPanel);
                activeLayoutRef.current = restoredLayout;
                setActiveLayout(restoredLayout);
                const personalFallback = personalDefault(restoredLayout);
                const cosmicFallback = cosmicDefault(restoredLayout);
                const layoutsCurrent = state.layoutVersion === LAYOUT_VERSION;
                setModels({
                    personal: safeModel(
                        layoutsCurrent ? (state.personal ?? personalFallback) : personalFallback,
                        personalFallback
                    ),
                    cosmic: safeModel(
                        layoutsCurrent ? (state.cosmic ?? cosmicFallback) : cosmicFallback,
                        cosmicFallback
                    )
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
                const candidates = [todayId(), todayIdLegacy()];
                const found = candidates.find(id => entries.some(e => e.isDir && e.name === id));
                if (found) {
                    useSessionStore.getState().setSession({ dayNow: found });
                }
            })
            .catch(() => undefined);
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
                personal: current.personal.toJson(),
                cosmic: current.cosmic.toJson(),
                sessionKey: useSessionStore.getState().sessionKey,
                coordinate: useCoordinateStore.getState().selected,
                m0Surface: serializeM0SurfaceState(m0SurfaceRef.current),
                m2Surface: serializeM2SurfaceState(m2SurfaceRef.current),
                omniPanel: readOmniPanelSessionState(),
                [OMNIPANEL_ACTIVE_LAYOUT_PREFERENCE_KEY]: activeLayoutRef.current
            };
            void Promise.resolve(
                invokeCommand('ui_state_save', { json: JSON.stringify(state) })
            ).catch(() => undefined);
        }, 800);
    }, []);

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
                useTickStore.getState().setProfile(profile);
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
        // 16.T16.19 (CCT-19): Atelier activation — commands over the file
        // the user is already in; scent-follow stages a Hen candidate.
        const atelierDisposers = registerAtelierCommands({
            activeMarkdownPath: () => {
                const current = modelsRef.current;
                if (!current) {
                    return null;
                }
                let path: string | null = null;
                current.personal.visitNodes(node => {
                    if (
                        node.getType() === 'tab' &&
                        (node as TabNode).getComponent() === 'editor' &&
                        (node as TabNode).isVisible()
                    ) {
                        path = ((node as TabNode).getConfig() as { path?: string })?.path ?? null;
                    }
                });
                return path;
            },
            dayId: () => useSessionStore.getState().dayNow ?? null,
            invoke: (method, params) => gateway().invoke(method, params),
            ready: () => gatewayReady()
        });
        const disposers = [
            ...atelierDisposers,
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
                    const model = target.face === 0 ? current.cosmic : current.personal;
                    if (target.preferredLayout && target.preferredLayout !== activeLayoutRef.current) {
                        activeLayoutRef.current = target.preferredLayout;
                        setActiveLayout(target.preferredLayout);
                    }
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
                    // FlexLayout caches factory output. Remount the view shell so
                    // the selected host consumes its newly delivered node config.
                    setRoutingRevision(revision => revision + 1);
                    persist();
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
                    let existing: string | null = null;
                    current.personal.visitNodes(node => {
                        if (
                            node.getType() === 'tab' &&
                            (node as TabNode).getComponent() === 'editor' &&
                            ((node as TabNode).getConfig() as { path?: string })?.path === path
                        ) {
                            existing = node.getId();
                        }
                    });
                    if (existing) {
                        current.personal.doAction(Actions.selectTab(existing));
                    } else {
                        current.personal.doAction(
                            Actions.addNode(
                                {
                                    type: 'tab',
                                    name: path.split('/').pop() ?? path,
                                    component: 'editor',
                                    config: { path }
                                },
                                current.personal.getActiveTabset()?.getId() ?? 'personal-main',
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
                    const model = faceRef.current === 0 ? current.cosmic : current.personal;
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
                    if (current.personal.getNodeById('omni-review')) {
                        const requestedReviewId =
                            arg && typeof arg === 'object' && 'reviewId' in arg && typeof arg.reviewId === 'string'
                                ? arg.reviewId
                                : null;
                        current.personal.doAction(
                            Actions.updateNodeAttributes('omni-review', { config: { requestedReviewId } })
                        );
                        current.personal.doAction(Actions.selectTab('omni-review'));
                        persist();
                    }
                }
            }),
            ...registerEngineCommands(commands)
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
        const onKeyDown = (evt: KeyboardEvent) => {
            const meta = evt.metaKey || evt.ctrlKey;
            if (meta && evt.key === '.') {
                evt.preventDefault();
                void commands.execute('face.toggle');
            } else if (meta && evt.shiftKey && evt.key.toLowerCase() === 'p') {
                evt.preventDefault();
                void commands.execute('palette.toggle');
            } else if (meta && evt.shiftKey && evt.key.toLowerCase() === 'o') {
                evt.preventDefault();
                void commands.execute('omnipanel.toggle');
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
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    if (!models) {
        return <div className="boot-splash">pratibimba…</div>;
    }

    const layoutClaims = resolveLayoutClaims(activeLayout, component => {
        let receiverFound = false;
        for (const model of [models.personal, models.cosmic]) {
            model.visitNodes(node => {
                if (node.getType() === 'tab' && (node as TabNode).getComponent() === component) {
                    receiverFound = true;
                }
            });
        }
        return receiverFound;
    });
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
            data-omnipanel-active-tab={activeOmniTab}
            data-cross-layout-identity-receipt={
                crossLayoutIdentityReceiptRef.current
                    ? JSON.stringify(crossLayoutIdentityReceiptRef.current)
                    : undefined
            }
        >
            <FaceToggleChrome face={face} onToggle={() => void commands.execute('face.toggle')}>
                <div
                    className={`face-slot ${face === 0 ? 'face-active' : 'face-hidden'}`}
                    data-testid={routedHost?.face === 0 ? 'cross-layout-intent-receiver' : undefined}
                    data-requested-extension-id={routedHost?.face === 0 ? routedHost.extensionId : undefined}
                    data-requested-contribution-id={routedHost?.face === 0 ? routedHost.contributionId : undefined}
                >
                    <Layout
                        key={`cosmic-${routingRevision}`}
                        model={models.cosmic}
                        factory={factory}
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
                        key={`personal-${routingRevision}`}
                        model={models.personal}
                        factory={factory}
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
                <StatusStrip />
                <CommandPalette />
            </div>
            </M2SurfaceProvider>
        </M0SurfaceProvider>
    );
}
