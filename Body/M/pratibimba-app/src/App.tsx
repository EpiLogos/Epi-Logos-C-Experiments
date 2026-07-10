/**
 * Coordinate: M' (one shell, two faces — now over a real pane system)
 * Residency: Body/M/pratibimba-app/src
 * Actualises: the (0/1) shell as two flexlayout root layouts over one state
 *   tree, with the application foundations underneath: command registry,
 *   palette, vault panes, session binding, layout persistence, gateway
 *   liveness. cmd-period IS the # inversion; the four stores are singletons
 *   so the faces cannot desynchronise.
 * Public surface: <App/>.
 * Does NOT own: gateway I/O (bridge/), vault law (src-tauri/vault.rs),
 *   command semantics (owners register them).
 */

import { useEffect, useRef, useState } from 'react';
import { Actions, DockLocation, Layout, Model, TabNode } from 'flexlayout-react';
import { createStrikeRouter, instrument, useInstrumentStore } from './audio/instrument';
import { GatewayClient } from './bridge/gatewayClient';
import { extractBellRoles, isChimeCoherent, ModalResonatorBoundary } from './bridge/types';
import { setGateway } from './bridge/gatewayHolder';
import { SessionClient } from './bridge/sessionClient';
import { invokeCommand } from './bridge/tauri';
import { wireSupervisorEvents } from './bridge/tauriEvents';
import { commands, usePaletteStore } from './commands/registry';
import { useEventsStore } from './state/eventsStore';
import { useCoordinateStore, useProvenanceStore, useSessionStore, useTickStore } from './state/stores';
import { StatusStrip } from './components/StatusStrip';
import { CosmicEngine } from './engine/CosmicEngine';
import { modulationEngine, registerEngineCommands, useEngineStore } from './engine/modulation/engine';
import { GraphExplorerPane } from './panes/GraphExplorerPane';
import { WalkPane } from './panes/WalkPane';
import { KleinTopologyPane } from './panes/KleinTopologyPane';
import { PlayedTorusPane } from './panes/PlayedTorusPane';
import { PentadicInspectorPane } from './panes/PentadicInspectorPane';
import { ChatPane } from './panes/ChatPane';
import { CommandPalette } from './panes/CommandPalette';
import { FileTreePane } from './panes/FileTreePane';
import { JournalTimelinePane } from './panes/JournalTimelinePane';
import { LogsPane } from './panes/LogsPane';
import { MarkdownEditorPane } from './panes/MarkdownEditorPane';
import { NowPane } from './panes/NowPane';
import { OraclePane } from './panes/OraclePane';
import { SessionsPane } from './panes/SessionsPane';
import { VaultEntry } from './panes/FileTreePane';

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

const OMNI_BORDER = {
    type: 'border',
    location: 'right',
    size: 380,
    children: [
        { type: 'tab', id: 'omni-tab', name: '/ chat', component: 'omniChat', enableClose: false },
        { type: 'tab', name: 'sessions', component: 'omniSessions', enableClose: false },
        { type: 'tab', name: 'logs', component: 'omniLogs', enableClose: false }
    ]
};

const PERSONAL_DEFAULT = {
    global: { tabEnableRename: false },
    borders: [
        {
            type: 'border',
            location: 'left',
            size: 260,
            selected: 0,
            children: [
                { type: 'tab', name: 'Vault', component: 'fileTree', enableClose: false },
                { type: 'tab', name: 'Journal', component: 'journalTimeline', enableClose: false },
                { type: 'tab', name: 'Oracle', component: 'oracle', enableClose: false }
            ]
        },
        OMNI_BORDER
    ],
    layout: {
        type: 'row',
        children: [
            {
                type: 'tabset',
                id: 'personal-main',
                children: [{ type: 'tab', name: 'Now', component: 'personalHome', enableClose: false }]
            }
        ]
    }
};

const COSMIC_DEFAULT = {
    global: { tabEnableRename: false },
    borders: [OMNI_BORDER],
    layout: {
        type: 'row',
        children: [
            {
                type: 'tabset',
                id: 'cosmic-main',
                children: [
                    { type: 'tab', name: 'Cosmic Engine', component: 'cosmic', enableClose: false },
                    { type: 'tab', name: 'Walk', component: 'walk', enableClose: false },
                    { type: 'tab', name: 'Bimba', component: 'bimbaGraph', enableClose: false },
                    { type: 'tab', name: 'Klein', component: 'kleinTopology', enableClose: false },
                    { type: 'tab', name: 'Played Torus', component: 'm1PlayedTorus', enableClose: false },
                    { type: 'tab', name: 'Pentadic', component: 'm3PentadicInspector', enableClose: false }
                ]
            }
        ]
    }
};

/** Bumped when the default layouts gain/lose panes — stale saved layouts
 *  fall back to defaults (face/session/coordinate still restore). */
const LAYOUT_VERSION = 7;

interface PersistedUiState {
    layoutVersion?: number;
    face?: Face;
    personal?: unknown;
    cosmic?: unknown;
    sessionKey?: string | null;
    coordinate?: string | null;
}

function factory(node: TabNode) {
    switch (node.getComponent()) {
        case 'fileTree':
            return <FileTreePane />;
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
        case 'bimbaGraph':
            return <GraphExplorerPane />;
        case 'kleinTopology':
            return <KleinTopologyPane />;
        case 'm1PlayedTorus':
            return <PlayedTorusPane />;
        case 'm3PentadicInspector':
            return <PentadicInspectorPane />;
        case 'personalHome':
            return <NowPane />;
        case 'journalTimeline':
            return <JournalTimelinePane />;
        case 'oracle':
            return <OraclePane />;
        case 'omniChat':
            return <ChatPane />;
        case 'omniSessions':
            return <SessionsPane />;
        case 'omniLogs':
            return <LogsPane />;
        default:
            return <div className="pane-message">unknown pane: {node.getComponent()}</div>;
    }
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
    const [models, setModels] = useState<{ personal: Model; cosmic: Model } | null>(null);
    const faceRef = useRef<Face>(1);
    faceRef.current = face;
    const modelsRef = useRef<typeof models>(null);
    modelsRef.current = models;
    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // boot: restore persisted UI state (or defaults outside tauri)
    useEffect(() => {
        invokeCommand<string | null>('ui_state_load')
            .then(raw => (raw ? (JSON.parse(raw) as PersistedUiState) : {}))
            .catch(() => ({}) as PersistedUiState)
            .then(state => {
                const layoutsCurrent = state.layoutVersion === LAYOUT_VERSION;
                setModels({
                    personal: safeModel(
                        layoutsCurrent ? (state.personal ?? PERSONAL_DEFAULT) : PERSONAL_DEFAULT,
                        PERSONAL_DEFAULT
                    ),
                    cosmic: safeModel(
                        layoutsCurrent ? (state.cosmic ?? COSMIC_DEFAULT) : COSMIC_DEFAULT,
                        COSMIC_DEFAULT
                    )
                });
                if (state.face === 0 || state.face === 1) {
                    setFace(state.face);
                }
                if (state.coordinate) {
                    useCoordinateStore.getState().setSelected(state.coordinate);
                }
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

    const persist = () => {
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
                coordinate: useCoordinateStore.getState().selected
            };
            void invokeCommand('ui_state_save', { json: JSON.stringify(state) }).catch(() => undefined);
        }, 800);
    };

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
            onEvent: event => useEventsStore.getState().push(event),
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
        const disposers = [
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

    return (
        <div className="shell" data-testid="shell" data-face={face}>
            <main className="faces">
                <div className={`face-slot ${face === 0 ? 'face-active' : 'face-hidden'}`}>
                    <Layout model={models.cosmic} factory={factory} onModelChange={persist} />
                </div>
                <div className={`face-slot ${face === 1 ? 'face-active' : 'face-hidden'}`}>
                    <Layout model={models.personal} factory={factory} onModelChange={persist} />
                </div>
            </main>
            <StatusStrip />
            <CommandPalette />
        </div>
    );
}
