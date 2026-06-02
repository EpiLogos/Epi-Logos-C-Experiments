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
    buildM5EpiiSurface
} from '../common';

@injectable()
export class M5EpiiWidget extends ReactWidget {
    static readonly ID = PRIMARY_VIEW_ID;
    static readonly LABEL = 'M5 — Epii';

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

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
        const epiiSurface = this.profile
            ? buildM5EpiiSurface({
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
                    extensionLabel={M5EpiiWidget.LABEL}
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
                    <h3>S5 Review and Spine</h3>
                    {epiiSurface?.readiness.surfaceReady ? (
                        <dl>
                            <dt>Open reviews</dt>
                            <dd>{String(epiiSurface.reviewWorkbench.open ?? 0)}</dd>
                            <dt>Human gates</dt>
                            <dd>{String(epiiSurface.reviewWorkbench.humanRequired ?? 0)}</dd>
                            <dt>Dry-run plans</dt>
                            <dd>{String(epiiSurface.reviewWorkbench.dryRunPlans ?? 0)}</dd>
                            <dt>Artifact refs</dt>
                            <dd>{epiiSurface.canonEvolutionBrowser.length}</dd>
                        </dl>
                    ) : (
                        <p className="mext-widget-empty">
                            Waiting for bridge-provided S5 review/autoresearch state.
                            This surface renders review handles, dry-run plans, recursive
                            gates, and artifact namespace refs; agents cannot finalize
                            human-required or recursive gates.
                        </p>
                    )}
                </section>
            </div>
        );
    }
}
