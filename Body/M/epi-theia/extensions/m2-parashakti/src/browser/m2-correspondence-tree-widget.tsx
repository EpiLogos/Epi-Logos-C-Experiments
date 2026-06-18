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
import { CorrespondenceTreePlanetaryKeyingPanel } from './components/planetary-correspondence';

@injectable()
export class M2CorrespondenceTreeWidget extends ReactWidget {
    static readonly ID = 'm2.parashakti.correspondenceTree';
    static readonly LABEL = 'M2 - Correspondence Tree';

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    protected readiness: MExtensionReadinessSnapshot = PENDING_M_READINESS;
    protected profile: MathemeHarmonicProfileBoundary | null = null;
    protected context: CoordinateContext = EMPTY_COORDINATE_CONTEXT;
    protected subscriptions: Disposable[] = [];

    @postConstruct()
    protected init(): void {
        this.id = M2CorrespondenceTreeWidget.ID;
        this.title.label = M2CorrespondenceTreeWidget.LABEL;
        this.title.caption = M2CorrespondenceTreeWidget.LABEL;
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
                    extensionLabel={M2CorrespondenceTreeWidget.LABEL}
                    snapshot={this.readiness}
                    declaredBlockers={DECLARED_BLOCKERS}
                    provenance={provenance}
                />
                <section className="mext-widget-detail">
                    <h3>M2 Correspondence Tree</h3>
                    {packet ? (
                        <dl>
                            <dt>72 address</dt>
                            <dd>{packet.address72}</dd>
                            <dt>Axis views</dt>
                            <dd>{packet.addressViews.map(view => view.name).join(' / ')}</dd>
                            <dt>Sacred sonic source</dt>
                            <dd>{String(packet.sacredSonicFrame.source ?? 'pending')}</dd>
                            <dt>S2 tree handle</dt>
                            <dd>{packet.provenance.find(handle => handle.source === 's2')?.handle ?? 'pending'}</dd>
                            <dt>Pending authorities</dt>
                            <dd>{packet.pendingFields.join(', ') || '-'}</dd>
                        </dl>
                    ) : (
                        <p className="mext-widget-empty">
                            The correspondence tree is waiting for the shared profile bus and
                            coordinate context before resolving the unified M2 meaning packet.
                        </p>
                    )}
                    <CorrespondenceTreePlanetaryKeyingPanel />
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
