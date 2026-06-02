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
    buildM4NaraSurface
} from '../common';

@injectable()
export class M4NaraWidget extends ReactWidget {
    static readonly ID = PRIMARY_VIEW_ID;
    static readonly LABEL = 'M4 — Nara';

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    protected readiness: MExtensionReadinessSnapshot = PENDING_M_READINESS;
    protected profile: MathemeHarmonicProfileBoundary | null = null;
    protected context: CoordinateContext = EMPTY_COORDINATE_CONTEXT;
    protected subscriptions: Disposable[] = [];

    @postConstruct()
    protected init(): void {
        this.id = M4NaraWidget.ID;
        this.title.label = M4NaraWidget.LABEL;
        this.title.caption = M4NaraWidget.LABEL;
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
        const naraSurface = this.profile
            ? buildM4NaraSurface({
                profile: this.profile,
                readiness: this.readiness,
                context: this.context,
                emittedAt: Date.now()
            })
            : null;
        return (
            <div className="mext-widget-root">
                <ReadinessBanner
                    extensionId={EXTENSION_ID}
                    extensionLabel={M4NaraWidget.LABEL}
                    snapshot={this.readiness}
                    declaredBlockers={DECLARED_BLOCKERS}
                    provenance={provenance}
                />
                <section className="mext-widget-detail">
                    <h3>Profile snapshot</h3>
                    {this.profile ? (
                        <dl>
                            <dt>Generation</dt>
                            <dd>{this.profile.generation}</dd>
                            <dt>Capabilities</dt>
                            <dd>{this.profile.capabilities.join(', ') || '—'}</dd>
                            <dt>Pointer anchor</dt>
                            <dd>{this.profile.pointerAnchor ?? '—'}</dd>
                        </dl>
                    ) : (
                        <p className="mext-widget-empty">
                            No MathemeHarmonicProfile available yet. The kernel-bridge is the
                            sole owner of this payload; this view will populate when the
                            shared adapter receives a generation update.
                        </p>
                    )}
                </section>
                <section className="mext-widget-detail">
                    <h3>Nara DayContainer</h3>
                    {naraSurface?.readiness.surfaceReady ? (
                        <dl>
                            <dt>Day</dt>
                            <dd>{String(naraSurface.daySummary.dayId ?? '—')}</dd>
                            <dt>Artifacts</dt>
                            <dd>{naraSurface.artifactTree.length}</dd>
                            <dt>Graphiti episodes</dt>
                            <dd>{naraSurface.graphitiBrowser.length}</dd>
                            <dt>Privacy</dt>
                            <dd>{naraSurface.privacyClass}</dd>
                        </dl>
                    ) : (
                        <p className="mext-widget-empty">
                            Waiting for a bridge-provided Nara DayContainer handle payload.
                            Protected journal, dream, oracle, and Graphiti bodies stay local;
                            this surface renders handles, scalar refs, readiness, and lineage.
                        </p>
                    )}
                </section>
            </div>
        );
    }
}
