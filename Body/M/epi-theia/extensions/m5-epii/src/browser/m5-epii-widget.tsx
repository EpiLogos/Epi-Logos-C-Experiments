// Generated from contracts/07-t0-extension-contract-preflight.json. Do not hand-edit.
import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
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

    protected readiness: MExtensionReadinessSnapshot = PENDING_M_READINESS;
    protected profile: MathemeHarmonicProfileBoundary | null = null;
    protected context: CoordinateContext = EMPTY_COORDINATE_CONTEXT;
    protected subscriptions: Disposable[] = [];

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
                this.update();
            })
        );
        this.subscriptions.push(
            this.bridge.onCoordinateContext(context => {
                this.context = context;
                this.acceptRuntimeContemplationObject(context);
                this.acceptRuntimeWisdomDelta(context);
                this.fetchWisdomDeltaForContext(context);
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
