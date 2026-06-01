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
    buildM0InspectorModel
} from '../common';

@injectable()
export class M0AnuttaraWidget extends ReactWidget {
    static readonly ID = PRIMARY_VIEW_ID;
    static readonly LABEL = 'M0 — Anuttara';

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    protected readiness: MExtensionReadinessSnapshot = PENDING_M_READINESS;
    protected profile: MathemeHarmonicProfileBoundary | null = null;
    protected context: CoordinateContext = EMPTY_COORDINATE_CONTEXT;
    protected subscriptions: Disposable[] = [];

    @postConstruct()
    protected init(): void {
        this.id = M0AnuttaraWidget.ID;
        this.title.label = M0AnuttaraWidget.LABEL;
        this.title.caption = M0AnuttaraWidget.LABEL;
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
        const model = buildM0InspectorModel({
            selectedInput: this.context.hashInput ?? this.context.selectedCoordinate,
            graphNode: readGraphNode(this.profile),
            profile: this.profile,
            readiness: this.readiness,
            context: this.context
        });
        return (
            <div className="mext-widget-root">
                <ReadinessBanner
                    extensionId={EXTENSION_ID}
                    extensionLabel={M0AnuttaraWidget.LABEL}
                    snapshot={this.readiness}
                    declaredBlockers={DECLARED_BLOCKERS}
                    provenance={provenance}
                />
                <section className="mext-widget-detail">
                    <h3>M0 coordinate graph and language inspector</h3>
                    <dl>
                        <dt>Selected coordinate</dt>
                        <dd data-test="m0-selected-coordinate">
                            {model.query.input ?? 'No coordinate selected'}
                        </dd>
                        <dt>Canonical M coordinate</dt>
                        <dd data-test="m0-canonical-coordinate">
                            {model.query.canonicalMCoordinate ?? model.node.coordinate ?? 'Awaiting S2 payload'}
                        </dd>
                        <dt>Graph namespace</dt>
                        <dd>{model.node.namespace ?? 'S2 namespace pending'}</dd>
                        <dt>Label</dt>
                        <dd>{model.node.label ?? 'Canonical label pending'}</dd>
                    </dl>
                    <p className="mext-widget-empty">{model.pedagogy.priorGroundBoundary}</p>
                    <p className="mext-widget-empty">{model.pedagogy.parentAttribution}</p>
                    <p className="mext-widget-empty">{model.pedagogy.contradiction}</p>
                </section>
                <section className="mext-widget-detail">
                    <h3>Anuttara syntax fields</h3>
                    <dl>
                        {model.languageFields.map(field => (
                            <React.Fragment key={field.key}>
                                <dt>{field.label}</dt>
                                <dd data-provenance-state={field.state}>
                                    {field.value ?? field.provenance}
                                </dd>
                            </React.Fragment>
                        ))}
                    </dl>
                </section>
                <section className="mext-widget-detail">
                    <h3>S2 provenance and graph readiness</h3>
                    <dl>
                        <dt>Pointer-web summary</dt>
                        <dd data-provenance-state={model.pointerSummary.state}>
                            {model.pointerSummary.value ?? model.pointerSummary.provenance}
                        </dd>
                        <dt>Relation families</dt>
                        <dd>
                            {model.relationFamilies.length
                                ? model.relationFamilies.map(field => `${field.key}=${field.value}`).join(', ')
                                : 'No relation-family properties in S2 payload'}
                        </dd>
                        <dt>Source/spec/code/test anchors</dt>
                        <dd>
                            {model.anchors
                                .map(field => `${field.label}: ${field.value ?? field.state}`)
                                .join(' | ')}
                        </dd>
                        <dt>OWL/SHACL/GDS/kernel audit</dt>
                        <dd>
                            {model.readinessFacts
                                .map(fact => `${fact.label}: ${fact.state}`)
                                .join(' | ')}
                        </dd>
                    </dl>
                </section>
                <section className="mext-widget-detail">
                    <h3>M5 action hooks</h3>
                    <ul>
                        {model.actions.map(action => (
                            <li key={action.id}>
                                {action.label} <code>{action.method}</code>
                            </li>
                        ))}
                    </ul>
                </section>
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
            </div>
        );
    }
}

function readGraphNode(profile: MathemeHarmonicProfileBoundary | null): Record<string, unknown> | null {
    const payload = profile?.payload;
    const node = payload?.m0_graph_node ?? payload?.selected_graph_node ?? payload?.s2_graph_node;
    return node && typeof node === 'object' && !Array.isArray(node)
        ? (node as Record<string, unknown>)
        : null;
}
