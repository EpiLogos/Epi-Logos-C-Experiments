import * as React from 'react';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import {
    CoordinateContext,
    Disposable,
    EMPTY_COORDINATE_CONTEXT,
    MathemeHarmonicProfileBoundary,
    MExtensionReadinessSnapshot,
    PENDING_M_READINESS,
    ReadinessBanner,
    SharedBridgeAdapter,
    SHARED_BRIDGE_ADAPTER
} from '@pratibimba/m-extension-runtime';
import {
    buildPlayedTorusFrame,
    BrowserVortexRendererHandle,
    EXTENSION_ID,
    PlayedTorusFrame,
    PRIMARY_VIEW_ID,
    PRIVACY_CLASS
} from '../common';

@injectable()
export class PlayedTorusWidget extends ReactWidget {
    static readonly ID = PRIMARY_VIEW_ID;
    static readonly LABEL = 'M1 — K2 Played Torus';

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    protected readiness: MExtensionReadinessSnapshot = PENDING_M_READINESS;
    protected profile: MathemeHarmonicProfileBoundary | null = null;
    protected context: CoordinateContext = EMPTY_COORDINATE_CONTEXT;
    protected subscriptions: Disposable[] = [];

    @postConstruct()
    protected init(): void {
        this.id = PlayedTorusWidget.ID;
        this.title.label = PlayedTorusWidget.LABEL;
        this.title.caption = PlayedTorusWidget.LABEL;
        this.title.closable = true;
        this.addClass('mext-widget');
        this.addClass('m1-played-torus-widget');

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
                // best-effort disposal
            }
        }
        super.dispose();
    }

    protected override render(): React.ReactNode {
        const frame = buildPlayedTorusFrame({
            profile: this.profile,
            readiness: this.readiness,
            context: this.context
        });
        const provenance = `privacy=${PRIVACY_CLASS} | generation=${this.context.profileGeneration ?? 'pending'} | source=${frame.rendererInput.frameSource}`;
        return (
            <div className="m1-played-torus-root">
                <ReadinessBanner
                    extensionId={EXTENSION_ID}
                    extensionLabel={PlayedTorusWidget.LABEL}
                    snapshot={this.readiness}
                    declaredBlockers={frame.readinessBadges.map(badge => badge.id)}
                    provenance={provenance}
                />
                <PlayedTorusCanvas frame={frame} />
            </div>
        );
    }
}

function PlayedTorusCanvas(props: { readonly frame: PlayedTorusFrame }): React.ReactElement {
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
    const rendererRef = React.useRef<BrowserVortexRendererHandle | null>(null);

    React.useEffect(() => {
        if (!rendererRef.current) {
            rendererRef.current = new BrowserVortexRendererHandle();
        }
        if (canvasRef.current) {
            rendererRef.current.mount(canvasRef.current);
            rendererRef.current.update(props.frame);
        }
        return () => rendererRef.current?.dispose();
    }, [props.frame]);

    return (
        <section className="m1-played-torus-surface" data-test="m1-played-torus">
            <canvas
                ref={canvasRef}
                className="m1-played-torus-canvas"
                data-test="m1-played-torus-canvas"
                aria-label="M1 K2 played torus renderer"
            />
            <dl className="m1-played-torus-readout">
                <dt>K2</dt>
                <dd data-test="k2-topology">
                    DOUBLE_COVER_DEG={props.frame.topology.doubleCoverDeg ?? 'pending'} · TORUS_GENUS=
                    {props.frame.topology.torusGenus ?? 'pending'}
                </dd>
                <dt>Ananda</dt>
                <dd data-test="ananda-source">{props.frame.rendererInput.activeCellValueSource ?? 'pending'}</dd>
                <dt>Vimarsha windows</dt>
                <dd data-test="vimarsha-window-source">
                    {props.frame.vimarshaWindows.audioSource} · {props.frame.vimarshaWindows.nodalSource}
                </dd>
                <dt>Boundary</dt>
                <dd data-test="single-k2-boundary">{props.frame.topology.boundary}</dd>
            </dl>
        </section>
    );
}
