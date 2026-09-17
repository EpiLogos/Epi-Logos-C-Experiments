// Generated from contracts/07-t0-extension-contract-preflight.json. Do not hand-edit.
import * as React from 'react';
import { CommandService } from '@theia/core';
import { injectable, inject, optional, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    SharedBridgeAdapter,
    MExtensionReadinessSnapshot,
    PENDING_M_READINESS,
    MathemeHarmonicProfileBoundary,
    CoordinateContext,
    EMPTY_COORDINATE_CONTEXT,
    Disposable,
    ReadinessBanner,
    SHARED_BRIDGE_ADAPTER
} from '@pratibimba/m-extension-runtime';
import {
    EXTENSION_ID,
    PRIMARY_VIEW_ID,
    DECLARED_BLOCKERS,
    PRIVACY_CLASS
} from '../common';
import {
    ResonanceEbmService,
    ResonanceProjection,
    ResonanceGridCell,
    TritoneSquare,
    EbmDescentStep,
    RESONANCE_TICK_COUNT
} from './services/resonance-ebm-service';
import {
    ContemplationObjectService,
    ContemplationObjectViewer,
    ContemplationRuntimeContext
} from './services/contemplation-object-service';
import {
    CONTEMPLATE_FETCH_WISDOM_DELTA_METHOD,
    WisdomDeltaFetchReceipt,
    WisdomDeltaInspector,
    WisdomDeltaRuntimeContext,
    WisdomDeltaService
} from './services/wisdom-delta-service';

export const S5_IMPROVE_HISTORY_METHOD = "s5'.improve.history";
export const ACR_WIDGET_ID = 'pratibimba.ide-shell.agentic-control-room';
export const ACR_OPEN_COMMAND_ID = 'pratibimba.ide-shell-m0-m5.agentic-control-room.open';

export type LegacyCapacityWireId =
    | 'anuttara'
    | 'paramasiva'
    | 'parashakti'
    | 'mahamaya'
    | 'nara'
    | 'epii_on_epii';

export type OperationalCapacityId =
    | 'anuttara-construction'
    | 'paramasiva-cpt-rag'
    | 'parashakti-graph-relational-ml'
    | 'mahamaya-process-reward-rl'
    | 'nara-anima-dialogic'
    | 'epii-self-referential';

export interface OperationalCapacity {
    readonly id: OperationalCapacityId;
    readonly legacyWireId: LegacyCapacityWireId;
    readonly label: string;
    readonly focus: string;
    readonly binding: string;
    readonly vakAddress: string;
    readonly metricLabel: string;
}

export const OPERATIONAL_CAPACITIES: readonly OperationalCapacity[] = Object.freeze([
    {
        id: 'anuttara-construction',
        legacyWireId: 'anuttara',
        label: 'Anuttara Construction',
        focus: 'construction-not-training; axiom proposals and monotonic-with-retraction history',
        binding: 'CR 1.10 Verifier',
        vakAddress: 'M5-4/anuttara-construction',
        metricLabel: 'axiom proposals'
    },
    {
        id: 'paramasiva-cpt-rag',
        legacyWireId: 'paramasiva',
        label: 'Paramasiva CPT/RAG',
        focus: 'CPT/RAG proof support; lens x position coverage and RAG hit rates',
        binding: 'CR Pi-LLM substrate',
        vakAddress: 'M5-4/paramasiva-cpt-rag',
        metricLabel: 'coverage / hit rate'
    },
    {
        id: 'parashakti-graph-relational-ml',
        legacyWireId: 'parashakti',
        label: 'Parashakti Graph ML',
        focus: 'GDS embedding heatmap on the 72-fold harmonic field',
        binding: 'CR 6.8 training',
        vakAddress: 'M5-4/parashakti-graph-relational-ml',
        metricLabel: 'embedding heat'
    },
    {
        id: 'mahamaya-process-reward-rl',
        legacyWireId: 'mahamaya',
        label: 'Mahamaya Reward RL',
        focus: 'trajectory rewards as resonance-vector targets',
        binding: 'CR 6.8',
        vakAddress: 'M5-4/mahamaya-process-reward-rl',
        metricLabel: 'reward trajectory'
    },
    {
        id: 'nara-anima-dialogic',
        legacyWireId: 'nara',
        label: 'Nara Anima Dialogic',
        focus: 'dialogic-voice safety and governance-gate landings',
        binding: 'CR 5.20 Pi-as-LLM',
        vakAddress: 'M5-4/nara-anima-dialogic',
        metricLabel: 'gate landings'
    },
    {
        id: 'epii-self-referential',
        legacyWireId: 'epii_on_epii',
        label: 'Epii Self-Referential',
        focus: 'recursion depth and recursive-improvement audit trail',
        binding: 'CR 6.10',
        vakAddress: 'M5-4/epii-self-referential',
        metricLabel: 'recursion depth'
    }
] as const);

export interface CapacityHistoryRecord {
    readonly id?: string;
    readonly title?: string;
    readonly status?: string;
    readonly capacity?: string;
    readonly capacity_id?: string;
    readonly capacityId?: string;
    readonly target_subsystem?: string;
    readonly targetSubsystem?: string;
    readonly profile_generation?: number;
    readonly profileGeneration?: number;
    readonly generation?: number;
    readonly dispatch_count?: number;
    readonly dispatchCount?: number;
    readonly score?: number;
    readonly anchors?: readonly string[];
    readonly source_spec_anchors?: readonly string[];
    readonly sourceSpecAnchors?: readonly string[];
    readonly [key: string]: unknown;
}

export interface CapacityRuntimeRecord extends CapacityHistoryRecord {
    readonly method?: string;
    readonly runtimeContextSource?: string;
}

export interface CapacityProfileReading {
    readonly generation: number | null;
    readonly pointerAnchor: string | null;
    readonly vakAddress: string;
    readonly lastTickDispatchCount: number;
    readonly metricValue: string;
    readonly sourceKeys: readonly string[];
}

export interface CapacityPaneShellProps {
    readonly capacity: OperationalCapacity;
    readonly profile: MathemeHarmonicProfileBoundary | null;
    readonly history: readonly CapacityHistoryRecord[];
    readonly runtimeRecords: readonly CapacityRuntimeRecord[];
    readonly onOpenPiMonitor?: (capacity: OperationalCapacity) => void;
}

export interface CapacityTabProps {
    readonly capacity: OperationalCapacity;
    readonly selected: boolean;
    readonly dispatchCount: number;
    readonly onSelect: (capacity: OperationalCapacity) => void;
}

export function normalizeCapacityId(value: unknown): OperationalCapacityId | null {
    if (typeof value !== 'string') {
        return null;
    }
    const normalized = value.trim().toLowerCase().replace(/_/g, '-');
    for (const capacity of OPERATIONAL_CAPACITIES) {
        if (normalized === capacity.id || normalized === capacity.legacyWireId.replace(/_/g, '-')) {
            return capacity.id;
        }
    }
    return null;
}

export function capacityForId(id: OperationalCapacityId): OperationalCapacity {
    return OPERATIONAL_CAPACITIES.find(capacity => capacity.id === id) ?? OPERATIONAL_CAPACITIES[0];
}

export function filterCapacityRecords<T extends CapacityHistoryRecord>(
    records: readonly T[],
    capacity: OperationalCapacity
): T[] {
    return records.filter(record => recordMatchesCapacity(record, capacity));
}

export function extractCapacityHistoryRecords(artifact: unknown): CapacityHistoryRecord[] {
    if (Array.isArray(artifact)) {
        return artifact.filter(isRecordObject) as CapacityHistoryRecord[];
    }
    if (!isRecordObject(artifact)) {
        return [];
    }
    for (const key of ['candidates', 'history', 'items', 'records', 'control_room_panels', 'controlRoomPanels']) {
        const value = artifact[key];
        if (Array.isArray(value)) {
            return value.filter(isRecordObject) as CapacityHistoryRecord[];
        }
    }
    return [artifact as CapacityHistoryRecord];
}

export function extractCapacityRuntimeRecords(runtimeContext: unknown): CapacityRuntimeRecord[] {
    if (!isRecordObject(runtimeContext)) {
        return [];
    }
    const roots = [
        runtimeContext.capacityWorkflows,
        runtimeContext.capacity_workflows,
        runtimeContext.capacities,
        isRecordObject(runtimeContext.payload) ? runtimeContext.payload.capacityWorkflows : undefined,
        isRecordObject(runtimeContext.payload) ? runtimeContext.payload.capacity_workflows : undefined,
        isRecordObject(runtimeContext.payload) ? runtimeContext.payload.capacities : undefined
    ];
    return roots.flatMap(root => extractCapacityHistoryRecords(root) as CapacityRuntimeRecord[]);
}

export function readCapacityProfileBoundary(
    profile: MathemeHarmonicProfileBoundary | null,
    capacity: OperationalCapacity
): CapacityProfileReading {
    const record = findCapacityProfileRecord(profile, capacity);
    const lastTickDispatchCount = numberField(record, [
        'last_tick_dispatch_count',
        'lastTickDispatchCount',
        'dispatch_count',
        'dispatchCount',
        'dispatches'
    ]) ?? 0;
    const metricValue =
        stringField(record, ['metric', 'status', 'readiness', 'summary']) ??
        numberField(record, [
            'rag_hit_rate',
            'ragHitRate',
            'coverage',
            'heat',
            'reward',
            'recursion_depth',
            'recursionDepth',
            'axiom_proposals',
            'axiomProposals'
        ])?.toString() ??
        'pending';
    return {
        generation: profile?.generation ?? null,
        pointerAnchor: profile?.pointerAnchor ?? null,
        vakAddress: capacity.vakAddress,
        lastTickDispatchCount,
        metricValue,
        sourceKeys: record ? Object.keys(record).sort() : []
    };
}

export function buildPiMonitorIntent(
    capacity: OperationalCapacity,
    profile: MathemeHarmonicProfileBoundary | null,
    context: CoordinateContext
): Readonly<Record<string, unknown>> {
    return Object.freeze({
        coordinate: capacity.vakAddress,
        vakAddress: capacity.vakAddress,
        capacity: capacity.id,
        legacyCapacityId: capacity.legacyWireId,
        requestedLayout: 'ide-deep',
        requestedExtensionId: 'ide-shell-m0-m5',
        requestedContributionId: 'agentic-control-room.select-run',
        targetWidgetId: ACR_WIDGET_ID,
        dayNow: context.dayNowSessionHandle ?? null,
        sessionKey: context.dayNowSessionHandle ?? null,
        profileGeneration: profile?.generation ?? context.profileGeneration ?? null,
        privacyClass: 'public',
        reason: `m5-epii capacity ${capacity.id} dispatch trace`
    });
}

export const CapacityTab: React.FC<CapacityTabProps> = ({
    capacity,
    selected,
    dispatchCount,
    onSelect
}) => (
    <button
        type="button"
        role="tab"
        aria-selected={selected}
        className={selected ? 'm5-capacity-tab m5-capacity-tab-active' : 'm5-capacity-tab'}
        data-test={`CapacityTab-${capacity.id}`}
        onClick={() => onSelect(capacity)}
    >
        <span>{capacity.label}</span>
        <strong>{dispatchCount}</strong>
    </button>
);

export const CapacityPaneShell: React.FC<CapacityPaneShellProps> = ({
    capacity,
    profile,
    history,
    runtimeRecords,
    onOpenPiMonitor
}) => {
    const profileReading = readCapacityProfileBoundary(profile, capacity);
    const scopedHistory = filterCapacityRecords(history, capacity);
    const scopedRuntime = filterCapacityRecords(runtimeRecords, capacity);
    const lastTickDispatchCount = profileReading.lastTickDispatchCount || countProfileTickRecords(scopedHistory, profile);
    const recent = scopedHistory.slice(0, 4);
    return (
        <section
            className="mext-widget-detail m5-capacity-pane"
            data-test={`CapacityPaneShell-${capacity.id}`}
            data-capacity={capacity.id}
            data-vak-address={capacity.vakAddress}
        >
            <header className="m5-capacity-pane-header">
                <div>
                    <h3>{capacity.label}</h3>
                    <p>{capacity.focus}</p>
                </div>
                <button
                    type="button"
                    className="m5-capacity-monitor-button"
                    data-test={`m5-capacity-open-pi-monitor-${capacity.id}`}
                    onClick={() => onOpenPiMonitor?.(capacity)}
                >
                    open in Pi-monitor
                </button>
            </header>
            <dl className="m5-capacity-metrics">
                <dt>last tick dispatches</dt>
                <dd data-test={`m5-capacity-dispatch-count-${capacity.id}`}>{lastTickDispatchCount}</dd>
                <dt>MathemeHarmonicProfileBoundary</dt>
                <dd>
                    generation {profileReading.generation ?? 'pending'} · {capacity.metricLabel}:{' '}
                    {profileReading.metricValue}
                </dd>
                <dt>dispatch-trace VAK</dt>
                <dd><code>{capacity.vakAddress}</code></dd>
                <dt>binding</dt>
                <dd>{capacity.binding}</dd>
            </dl>
            <div className="m5-capacity-records">
                <div>
                    <h4>runtimeContext</h4>
                    <p data-test={`m5-capacity-runtime-count-${capacity.id}`}>
                        {scopedRuntime.length} surfaced record(s)
                    </p>
                </div>
                <div>
                    <h4>improve.history</h4>
                    {recent.length === 0 ? (
                        <p className="mext-widget-empty">No capacity-scoped history yet.</p>
                    ) : (
                        <ol data-test={`m5-capacity-history-${capacity.id}`}>
                            {recent.map((record, index) => (
                                <li key={record.id ?? `${capacity.id}-${index}`}>
                                    <strong>{record.title ?? record.id ?? 'capacity workflow'}</strong>
                                    {record.status ? <span> · {record.status}</span> : null}
                                    {typeof record.score === 'number' ? <span> · {record.score.toFixed(3)}</span> : null}
                                </li>
                            ))}
                        </ol>
                    )}
                </div>
            </div>
        </section>
    );
};

@injectable()
export class M5EpiiWidget extends ReactWidget {
    static readonly ID = PRIMARY_VIEW_ID;
    static readonly LABEL = 'M5 — Epii';

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    @inject(ResonanceEbmService)
    protected readonly ebm!: ResonanceEbmService;

    @inject(ContemplationObjectService)
    protected readonly contemplationObjects!: ContemplationObjectService;

    @inject(WisdomDeltaService)
    protected readonly wisdomDeltas!: WisdomDeltaService;

    @inject(CommandService) @optional()
    protected readonly commandService?: CommandService;

    protected readiness: MExtensionReadinessSnapshot = PENDING_M_READINESS;
    protected profile: MathemeHarmonicProfileBoundary | null = null;
    protected context: CoordinateContext = EMPTY_COORDINATE_CONTEXT;
    protected subscriptions: Disposable[] = [];
    protected selectedCapacity: OperationalCapacityId = OPERATIONAL_CAPACITIES[0].id;
    protected capacityHistory: CapacityHistoryRecord[] = [];
    protected capacityRuntimeRecords: CapacityRuntimeRecord[] = [];
    protected capacityHistoryError: string | null = null;

    @postConstruct()
    protected init(): void {
        this.id = M5EpiiWidget.ID;
        this.title.label = M5EpiiWidget.LABEL;
        this.title.caption = M5EpiiWidget.LABEL;
        this.title.closable = true;
        this.addClass('mext-widget');
        this.addClass('mext-widget-' + EXTENSION_ID);

        this.subscriptions.push(
            this.bridge.onReadiness(snapshot => {
                this.readiness = snapshot;
                this.update();
            })
        );
        this.subscriptions.push(
            this.bridge.onProfile(profile => {
                this.profile = profile;
                this.ebm.ingest(profile);
                void this.refreshCapacityHistory();
                this.update();
            })
        );
        this.subscriptions.push(
            this.bridge.onCoordinateContext(context => {
                this.context = context;
                this.acceptRuntimeContemplationObject(context);
                this.acceptRuntimeWisdomDelta(context);
                this.acceptCapacityRuntimeContext(context);
                this.fetchWisdomDeltaForContext(context);
                void this.refreshCapacityHistory();
                this.update();
            })
        );
    }

    override dispose(): void {
        for (const sub of this.subscriptions) {
            try {
                sub.dispose();
            } catch {
                // best-effort
            }
        }
        super.dispose();
    }

    protected override render(): React.ReactNode {
        const provenance = `privacy=${PRIVACY_CLASS} | generation=${this.context.profileGeneration ?? '—'} | pointer=${this.context.pointerAnchor ?? '—'}`;
        const projection = this.profile ? this.ebm.project(this.profile) : null;
        const contemplationModel = this.contemplationObjects.currentModel();
        const wisdomDeltaModel = this.wisdomDeltas.currentModel();
        return (
            <div className="mext-widget-root">
                <ReadinessBanner
                    extensionId={EXTENSION_ID}
                    extensionLabel={M5EpiiWidget.LABEL}
                    snapshot={this.readiness}
                    declaredBlockers={DECLARED_BLOCKERS}
                    provenance={provenance}
                />
                {projection ? this.renderProjection(projection) : (
                    <section className="mext-widget-detail">
                        <p className="mext-widget-empty">Awaiting kernel profile…</p>
                    </section>
                )}
                {this.renderCapacityAffordance()}
                {contemplationModel ? (
                    <ContemplationObjectViewer model={contemplationModel} />
                ) : (
                    <section className="mext-widget-detail m5-contemplation-object" data-test="m5-contemplation-object-empty">
                        <h3>ContemplationObjectViewer</h3>
                        <p className="mext-widget-empty">Awaiting PASU-scoped M5_ContemplationObject.</p>
                    </section>
                )}
                {wisdomDeltaModel ? (
                    <WisdomDeltaInspector model={wisdomDeltaModel} />
                ) : (
                    <section className="mext-widget-detail m5-wisdom-delta" data-test="m5-wisdom-delta-empty">
                        <h3>WisdomDeltaInspector</h3>
                        <p className="mext-widget-empty">Awaiting PASU-scoped WisdomDeltaTrace.</p>
                    </section>
                )}
            </div>
        );
    }

    protected renderCapacityAffordance(): React.ReactNode {
        const selected = capacityForId(this.selectedCapacity);
        return (
            <section className="mext-widget-detail m5-capacity-affordance" data-test="m5-capacity-affordance">
                <header className="m5-capacity-affordance-header">
                    <h3>Six operational capacities</h3>
                    <span data-test="m5-capacity-history-binding">{S5_IMPROVE_HISTORY_METHOD}</span>
                </header>
                <div className="m5-capacity-tabbar" role="tablist" aria-label="M5 operational capacities">
                    {OPERATIONAL_CAPACITIES.map(capacity => (
                        <CapacityTab
                            key={capacity.id}
                            capacity={capacity}
                            selected={capacity.id === this.selectedCapacity}
                            dispatchCount={this.dispatchCountForCapacity(capacity)}
                            onSelect={this.selectCapacity}
                        />
                    ))}
                </div>
                {this.capacityHistoryError ? (
                    <p className="mext-widget-empty" data-test="m5-capacity-history-error">
                        {this.capacityHistoryError}
                    </p>
                ) : null}
                <CapacityPaneShell
                    capacity={selected}
                    profile={this.profile}
                    history={this.capacityHistory}
                    runtimeRecords={this.capacityRuntimeRecords}
                    onOpenPiMonitor={this.openCapacityInPiMonitor}
                />
            </section>
        );
    }

    protected selectCapacity = (capacity: OperationalCapacity): void => {
        this.selectedCapacity = capacity.id;
        this.update();
    };

    protected dispatchCountForCapacity(capacity: OperationalCapacity): number {
        const reading = readCapacityProfileBoundary(this.profile, capacity);
        return reading.lastTickDispatchCount || countProfileTickRecords(
            filterCapacityRecords(this.capacityHistory, capacity),
            this.profile
        );
    }

    protected acceptCapacityRuntimeContext(context: CoordinateContext): void {
        const runtimeContext = (context as CoordinateContext & {
            runtimeContext?: unknown;
        }).runtimeContext;
        const records = extractCapacityRuntimeRecords(runtimeContext);
        if (records.length === 0) {
            return;
        }
        this.capacityRuntimeRecords = records;
    }

    protected async refreshCapacityHistory(): Promise<void> {
        if (!this.profile && !this.context.dayNowSessionHandle) {
            return;
        }
        try {
            const receipt = await this.bridge.invokeGatewayRpc(S5_IMPROVE_HISTORY_METHOD, {
                capacity: this.selectedCapacity,
                capacity_id: capacityForId(this.selectedCapacity).legacyWireId,
                profileGeneration: this.profile?.generation ?? this.context.profileGeneration ?? null,
                sessionId: this.context.dayNowSessionHandle ?? null
            });
            const artifact = isRecordObject(receipt) && 'artifact' in receipt ? receipt.artifact : receipt;
            this.capacityHistory = extractCapacityHistoryRecords(artifact);
            this.capacityHistoryError = null;
        } catch (err) {
            this.capacityHistoryError = err instanceof Error ? err.message : String(err);
        }
        this.update();
    }

    protected openCapacityInPiMonitor = (capacity: OperationalCapacity): void => {
        void this.commandService?.executeCommand(
            ACR_OPEN_COMMAND_ID,
            buildPiMonitorIntent(capacity, this.profile, this.context)
        );
    };

    protected acceptRuntimeContemplationObject(context: CoordinateContext): void {
        const runtimeContext = (context as CoordinateContext & {
            runtimeContext?: ContemplationRuntimeContext;
        }).runtimeContext;
        if (!runtimeContext?.contemplationObject && !runtimeContext?.payload?.contemplationObject) {
            return;
        }
        void this.contemplationObjects.acceptRuntimeContext(runtimeContext).catch(() => {
            // Privacy failures are intentionally non-committing; the widget keeps the last safe object.
        });
    }

    protected acceptRuntimeWisdomDelta(context: CoordinateContext): void {
        const runtimeContext = (context as CoordinateContext & {
            runtimeContext?: WisdomDeltaRuntimeContext;
        }).runtimeContext;
        if (
            !runtimeContext?.wisdomDeltaTrace &&
            !runtimeContext?.trace &&
            !runtimeContext?.payload?.wisdomDeltaTrace &&
            !runtimeContext?.payload?.trace
        ) {
            return;
        }
        void this.wisdomDeltas.acceptRuntimeContext(runtimeContext).then(() => this.update()).catch(() => {
            // Privacy or hash-validation failures are intentionally non-committing.
        });
    }

    protected fetchWisdomDeltaForContext(context: CoordinateContext): void {
        const sessionId = context.dayNowSessionHandle;
        if (!sessionId || this.wisdomDeltas.trace?.sessionId === sessionId) {
            return;
        }
        void this.wisdomDeltas.fetchWisdomDelta(
            async (method, request) => {
                if (method !== CONTEMPLATE_FETCH_WISDOM_DELTA_METHOD) {
                    throw new Error(`Unsupported wisdom-delta method ${method}`);
                }
                return this.bridge.invokeGatewayRpc(method, { ...request }) as Promise<WisdomDeltaFetchReceipt>;
            },
            {
                sessionId,
                contemplationObjectRef: context.pointerAnchor,
                profileGeneration: context.profileGeneration
            }
        ).then(() => this.update()).catch(() => {
            // The gateway may not have closed a contemplation object yet.
        });
    }

    protected renderProjection(projection: ResonanceProjection): React.ReactNode {
        const final = projection.descent[projection.descent.length - 1];
        const maxGradient = projection.gradient.reduce((max, g) => Math.max(max, Math.abs(g)), 0);
        const peakEnergy = projection.descent.reduce((max, s) => Math.max(max, s.energy), 1);
        return (
            <React.Fragment>
                <section className="mext-widget-detail m5-ebm-summary">
                    <h3>Resonance EBM — generation {projection.generation}</h3>
                    <dl>
                        <dt>Grid energy</dt>
                        <dd>{projection.totalEnergy.toFixed(4)}</dd>
                        <dt>Max gradient</dt>
                        <dd>{maxGradient.toFixed(4)}</dd>
                        <dt>Descent</dt>
                        <dd>{projection.converged ? 'converged' : 'open'} · {projection.descent.length} steps</dd>
                    </dl>
                </section>
                <section className="mext-widget-detail">
                    <h3>72-dim resonance grid</h3>
                    <div
                        className="m5-ebm-grid"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${RESONANCE_TICK_COUNT}, 1fr)`,
                            gap: '2px'
                        }}
                    >
                        {projection.cells.map(cell => this.renderCell(cell))}
                    </div>
                </section>
                <section className="mext-widget-detail">
                    <h3>Tritone-symmetric squares</h3>
                    <div className="m5-ebm-squares">
                        {projection.squares.map(square => this.renderSquare(square))}
                    </div>
                </section>
                <section className="mext-widget-detail">
                    <h3>Energy gradient (∂E/∂a)</h3>
                    <div
                        className="m5-ebm-gradient"
                        style={{ display: 'flex', alignItems: 'flex-end', gap: '1px', height: '48px' }}
                    >
                        {projection.gradient.map((g, index) => (
                            <div
                                key={index}
                                title={`cell ${index}: ${g.toFixed(4)}`}
                                style={{
                                    flex: '1 1 0',
                                    height: `${Math.min(100, Math.abs(g) / (maxGradient || 1) * 100)}%`,
                                    background: g >= 0
                                        ? 'var(--theia-charts-orange, #d18616)'
                                        : 'var(--theia-charts-blue, #4f8cc9)'
                                }}
                            />
                        ))}
                    </div>
                </section>
                <section className="mext-widget-detail">
                    <h3>Möbius descent</h3>
                    <div
                        className="m5-ebm-descent"
                        style={{ display: 'flex', alignItems: 'flex-end', gap: '1px', height: '48px' }}
                    >
                        {projection.descent.map(step => this.renderDescentStep(step, peakEnergy))}
                    </div>
                    {final ? (
                        <p className="mext-widget-empty">
                            resting energy {final.energy.toFixed(4)} ·{' '}
                            {projection.descent.filter(s => s.mobiusWrapped).length} #5→#0 returns
                        </p>
                    ) : null}
                </section>
            </React.Fragment>
        );
    }

    protected renderCell(cell: ResonanceGridCell): React.ReactNode {
        const intensity = Math.round(cell.activation * 255);
        return (
            <div
                key={cell.index}
                title={`#${cell.index} tick${cell.tick12} QL${cell.ql} sq${cell.square} a=${cell.activation.toFixed(3)} E=${cell.energy.toFixed(3)}`}
                style={{
                    aspectRatio: '1 / 1',
                    borderRadius: '2px',
                    background: `rgb(${intensity}, ${Math.round(80 + cell.square * 40)}, ${255 - intensity})`,
                    outline: cell.phase === 1 ? '1px solid rgba(255,255,255,0.35)' : 'none'
                }}
            />
        );
    }

    protected renderSquare(square: TritoneSquare): React.ReactNode {
        return (
            <dl key={square.id} className="m5-ebm-square">
                <dt>{square.label}</dt>
                <dd>
                    energy {square.energy.toFixed(3)} · defect {square.symmetryDefect.toFixed(3)} ·{' '}
                    {square.tritonePairs.length} tritone pairs
                </dd>
            </dl>
        );
    }

    protected renderDescentStep(step: EbmDescentStep, peakEnergy: number): React.ReactNode {
        return (
            <div
                key={step.step}
                title={`step ${step.step}: tick${step.tick12} QL${step.ql} E=${step.energy.toFixed(4)} g=${step.gradient.toFixed(4)}`}
                style={{
                    flex: '1 1 0',
                    height: `${Math.min(100, step.energy / peakEnergy * 100)}%`,
                    minHeight: '2px',
                    background: step.mobiusWrapped
                        ? 'var(--theia-charts-purple, #b180d7)'
                        : 'var(--theia-charts-green, #89d185)'
                }}
            />
        );
    }
}

function recordMatchesCapacity(record: CapacityHistoryRecord, capacity: OperationalCapacity): boolean {
    const candidates = [
        record.capacity,
        record.capacity_id,
        record.capacityId,
        record.target_subsystem,
        record.targetSubsystem,
        record.promotion_destination_family,
        record.ide_surface_anchor,
        record.source_actor_detail
    ];
    for (const value of candidates) {
        if (normalizeCapacityId(value) === capacity.id) {
            return true;
        }
    }
    const haystack = JSON.stringify(record).toLowerCase();
    return haystack.includes(capacity.id) || haystack.includes(capacity.legacyWireId.replace(/_/g, '-')) || haystack.includes(capacity.legacyWireId);
}

function findCapacityProfileRecord(
    profile: MathemeHarmonicProfileBoundary | null,
    capacity: OperationalCapacity
): Readonly<Record<string, unknown>> | null {
    if (!profile) {
        return null;
    }
    const payload = profile.payload;
    const roots = [
        payload.operational_capacities,
        payload.operationalCapacities,
        payload.capacity_profiles,
        payload.capacityProfiles,
        payload.capacity_workflows,
        payload.capacityWorkflows,
        payload[capacity.id],
        payload[capacity.legacyWireId]
    ];
    for (const root of roots) {
        const record = readCapacityRecord(root, capacity);
        if (record) {
            return record;
        }
    }
    return null;
}

function readCapacityRecord(
    value: unknown,
    capacity: OperationalCapacity
): Readonly<Record<string, unknown>> | null {
    if (Array.isArray(value)) {
        const found = value.find(item => (
            isRecordObject(item) && recordMatchesCapacity(item as CapacityHistoryRecord, capacity)
        ));
        return isRecordObject(found) ? found : null;
    }
    if (!isRecordObject(value)) {
        return null;
    }
    const direct = value[capacity.id] ?? value[capacity.legacyWireId];
    if (isRecordObject(direct)) {
        return direct;
    }
    if (recordMatchesCapacity(value as CapacityHistoryRecord, capacity)) {
        return value;
    }
    return null;
}

function countProfileTickRecords(
    records: readonly CapacityHistoryRecord[],
    profile: MathemeHarmonicProfileBoundary | null
): number {
    if (!profile) {
        return records.length;
    }
    const count = records.filter(record => (
        record.profileGeneration ?? record.profile_generation ?? record.generation
    ) === profile.generation).length;
    return count || records.length;
}

function numberField(record: Readonly<Record<string, unknown>> | null, keys: readonly string[]): number | null {
    if (!record) {
        return null;
    }
    for (const key of keys) {
        const value = record[key];
        if (typeof value === 'number' && Number.isFinite(value)) {
            return value;
        }
    }
    return null;
}

function stringField(record: Readonly<Record<string, unknown>> | null, keys: readonly string[]): string | null {
    if (!record) {
        return null;
    }
    for (const key of keys) {
        const value = record[key];
        if (typeof value === 'string' && value.trim().length > 0) {
            return value;
        }
    }
    return null;
}

function isRecordObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
