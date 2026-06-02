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
    PRIVACY_CLASS,
    buildM2PrimeMeaningPacket,
    M2PrimeMeaningPacket
} from '../common';

@injectable()
export class M2ParashaktiWidget extends ReactWidget {
    static readonly ID = PRIMARY_VIEW_ID;
    static readonly LABEL = 'M2 — Parashakti';

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    protected readiness: MExtensionReadinessSnapshot = PENDING_M_READINESS;
    protected profile: MathemeHarmonicProfileBoundary | null = null;
    protected context: CoordinateContext = EMPTY_COORDINATE_CONTEXT;
    protected subscriptions: Disposable[] = [];

    @postConstruct()
    protected init(): void {
        this.id = M2ParashaktiWidget.ID;
        this.title.label = M2ParashaktiWidget.LABEL;
        this.title.caption = M2ParashaktiWidget.LABEL;
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
        const provenance = `privacy=${PRIVACY_CLASS} | generation=${this.context.profileGeneration ?? '—'} | pointer=${this.context.pointerAnchor ?? '—'}`;
        const packet = this.profile ? this.safePacket(this.profile) : null;
        return (
            <div className="mext-widget-root">
                <ReadinessBanner
                    extensionId={EXTENSION_ID}
                    extensionLabel={M2ParashaktiWidget.LABEL}
                    snapshot={this.readiness}
                    declaredBlockers={DECLARED_BLOCKERS}
                    provenance={provenance}
                />
                <section className="mext-widget-detail">
                    <h3>M2PrimeMeaningPacket</h3>
                    {packet ? (
                        <dl>
                            <dt>72 address</dt>
                            <dd>{packet.address72}</dd>
                            <dt>Audio bus</dt>
                            <dd>{packet.cymaticSignature.audioOctetHz.map(hz => hz.toFixed(2)).join(' / ')}</dd>
                            <dt>DET evidence</dt>
                            <dd>{String(packet.detEvidence.finalClassificationAuthority)}</dd>
                            <dt>Pending authorities</dt>
                            <dd>{packet.pendingFields.join(', ') || '—'}</dd>
                            <dt>Klein valence</dt>
                            <dd>{String(packet.kleinFlip.surfaceValence)}</dd>
                        </dl>
                    ) : (
                        <p className="mext-widget-empty">
                            No complete public-current M2 packet available yet. The kernel-bridge
                            owns the profile bus, S2 owns correspondence provenance, and unresolved
                            fields stay pending rather than being filled with renderer folklore.
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
