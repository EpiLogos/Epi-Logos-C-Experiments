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
    DECLARED_BLOCKERS,
    PRIVACY_CLASS,
    buildM2PrimeMeaningPacket,
    M2PrimeMeaningPacket
} from '../common';
import {
    CymaticTransport,
    M2CymaticTickSnapshot
} from './components/CymaticTransport';
import { CymaticChladniSurface } from './components/CymaticChladniSurface';

@injectable()
export class M2CymaticEngineWidget extends ReactWidget {
    static readonly ID = 'm2.parashakti.cymaticEngine';
    static readonly LABEL = 'M2 - Cymatic Engine';

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    protected readiness: MExtensionReadinessSnapshot = PENDING_M_READINESS;
    protected profile: MathemeHarmonicProfileBoundary | null = null;
    protected context: CoordinateContext = EMPTY_COORDINATE_CONTEXT;
    protected tickSnapshots: readonly M2CymaticTickSnapshot[] | null = null;
    protected subscriptions: Disposable[] = [];

    @postConstruct()
    protected init(): void {
        this.id = M2CymaticEngineWidget.ID;
        this.title.label = M2CymaticEngineWidget.LABEL;
        this.title.caption = M2CymaticEngineWidget.LABEL;
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
                this.update();
            })
        );
        this.subscriptions.push(
            this.bridge.onCoordinateContext(context => {
                this.context = context;
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
        const provenance = `privacy=${PRIVACY_CLASS} | generation=${this.context.profileGeneration ?? '-'} | pointer=${this.context.pointerAnchor ?? '-'}`;
        const packet = this.profile ? this.safePacket(this.profile) : null;
        return (
            <div className="mext-widget-root">
                <ReadinessBanner
                    extensionId={EXTENSION_ID}
                    extensionLabel={M2CymaticEngineWidget.LABEL}
                    snapshot={this.readiness}
                    declaredBlockers={DECLARED_BLOCKERS}
                    provenance={provenance}
                />
                <section className="mext-widget-detail">
                    <h3>M2 Cymatic Engine</h3>
                    {packet ? (
                        <>
                            <CymaticTransport
                                livePacket={packet}
                                liveTick={this.profile ? profileTick(this.profile) : packet.profileGeneration}
                                tickSnapshots={this.tickSnapshots}
                            >
                                {snapshot => (
                                    <CymaticChladniSurface
                                        frame={snapshot.packet.cymaticSignature}
                                        tick={snapshot.tick}
                                    />
                                )}
                            </CymaticTransport>
                            <dl>
                                <dt>72 address</dt>
                                <dd>{packet.address72}</dd>
                                <dt>Audio octet</dt>
                                <dd>{packet.cymaticSignature.audioOctetHz.map(hz => hz.toFixed(2)).join(' / ')}</dd>
                                <dt>Nodal quartet</dt>
                                <dd>{packet.cymaticSignature.nodalQuartet.map(node => nodeLabel(node)).join(' / ')}</dd>
                                <dt>Sample count</dt>
                                <dd>{packet.cymaticSignature.sampleCount}</dd>
                                <dt>Personal scope</dt>
                                <dd>{packet.cymaticSignature.blockReason ?? 'cosmic-public'}</dd>
                            </dl>
                        </>
                    ) : (
                        <p className="mext-widget-empty">
                            The cymatic engine is waiting for the shared profile bus and coordinate
                            context before deriving a deterministic standing-wave frame.
                        </p>
                    )}
                </section>
            </div>
        );
    }

    protected safePacket(profile: MathemeHarmonicProfileBoundary): M2PrimeMeaningPacket | null {
        try {
            return buildM2PrimeMeaningPacket({
                profile,
                readiness: this.readiness,
                context: this.context,
                subject: 'tick',
                emittedAt: Date.now()
            });
        } catch {
            return null;
        }
    }
}

function profileTick(profile: MathemeHarmonicProfileBoundary): number {
    const payload = profile.payload;
    const tick = typeof payload.tick === 'number' && Number.isFinite(payload.tick)
        ? payload.tick
        : profile.generation;
    return Math.trunc(tick);
}

function nodeLabel(node: Readonly<Record<string, unknown>>): string {
    const m = typeof node.m === 'number' ? node.m : '?';
    const n = typeof node.n === 'number' ? node.n : '?';
    return `m${m}:n${n}`;
}
