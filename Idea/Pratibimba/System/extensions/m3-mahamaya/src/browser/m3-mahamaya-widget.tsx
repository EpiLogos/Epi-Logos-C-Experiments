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
    M3ProjectionSurface,
    buildM3ProjectionSurface
} from '../common';

@injectable()
export class M3MahamayaWidget extends ReactWidget {
    static readonly ID = PRIMARY_VIEW_ID;
    static readonly LABEL = 'M3 — Mahamaya';

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    protected readiness: MExtensionReadinessSnapshot = PENDING_M_READINESS;
    protected profile: MathemeHarmonicProfileBoundary | null = null;
    protected context: CoordinateContext = EMPTY_COORDINATE_CONTEXT;
    protected subscriptions: Disposable[] = [];

    @postConstruct()
    protected init(): void {
        this.id = M3MahamayaWidget.ID;
        this.title.label = M3MahamayaWidget.LABEL;
        this.title.caption = M3MahamayaWidget.LABEL;
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
        const surface = this.profile ? this.safeSurface(this.profile) : null;
        return (
            <div className="mext-widget-root">
                <ReadinessBanner
                    extensionId={EXTENSION_ID}
                    extensionLabel={M3MahamayaWidget.LABEL}
                    snapshot={this.readiness}
                    declaredBlockers={DECLARED_BLOCKERS}
                    provenance={provenance}
                />
                <section className="mext-widget-detail">
                    <h3>Codon projection</h3>
                    {surface ? (
                        <dl>
                            <dt>Codon</dt>
                            <dd>{String(surface.activeProjection.codon ?? '—')}</dd>
                            <dt>Rotation</dt>
                            <dd>{String(surface.activeProjection.rotation ?? '—')}</dd>
                            <dt>DET source</dt>
                            <dd>{String(surface.m30ProvenanceStrip.m2SourceIndex72 ?? '—')} → {String(surface.m30ProvenanceStrip.detResult64 ?? '—')}</dd>
                            <dt>Wheel readiness</dt>
                            <dd>{String(surface.wheelSummary.totalRotationalStates ?? 'pending')} states</dd>
                            <dt>Pending authorities</dt>
                            <dd>{surface.pendingFields.join(', ') || '—'}</dd>
                        </dl>
                    ) : (
                        <p className="mext-widget-empty">
                            No backend-provided M3 projection available yet. This renderer will
                            not invent codon, Tarot, I-Ching, planetary, or reward-training
                            authority locally.
                        </p>
                    )}
                </section>
            </div>
        );
    }

    protected safeSurface(profile: MathemeHarmonicProfileBoundary): M3ProjectionSurface | null {
        try {
            return buildM3ProjectionSurface({
                profile,
                readiness: this.readiness,
                context: this.context,
                emittedAt: Date.now()
            });
        } catch {
            return null;
        }
    }
}
