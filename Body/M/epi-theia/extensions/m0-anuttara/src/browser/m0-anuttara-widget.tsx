// Generated from contracts/07-t0-extension-contract-preflight.json. Do not hand-edit.
import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { CommandRegistry } from '@theia/core/lib/common/command';
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
import type { M0LayerKey, M0LayerRoute, M0SurfaceMode } from '../common';
import type { M0CrossLayoutIntentPayload, M0Phase } from '../common/cross-layout-intent';
import { projectM0CrossLayoutIntentState } from '../common/cross-layout-intent';
import { M0ModeToggle } from './components/mode-toggle';
import { LazyNodeBrowserPanel } from './panels/lazy-node-browser-panel';
import { LanguageLayerPanel } from './panels/language-layer-panel';

type M0LanguageSubtab = 'route' | 'lazy-browser';

@injectable()
export class M0AnuttaraWidget extends ReactWidget {
    static readonly ID = PRIMARY_VIEW_ID;
    static readonly LABEL = 'M0 — Anuttara';

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    @inject(CommandRegistry)
    protected readonly commands!: CommandRegistry;

    protected readiness: MExtensionReadinessSnapshot = PENDING_M_READINESS;
    protected profile: MathemeHarmonicProfileBoundary | null = null;
    protected context: CoordinateContext = EMPTY_COORDINATE_CONTEXT;
    protected activeLayer: M0LayerKey = 'language';
    protected activeLanguageSubtab: M0LanguageSubtab = 'route';
    protected phase: M0Phase = 'implicate';
    protected mode: M0SurfaceMode = 'reading';
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

    applyCrossLayoutIntent(payload: M0CrossLayoutIntentPayload): void {
        const state = projectM0CrossLayoutIntentState(payload, this.context);
        if (state.activeLayer) {
            this.activeLayer = state.activeLayer;
        }
        if (state.phase) {
            this.phase = state.phase;
        }
        if (state.mode) {
            this.mode = state.mode;
        }
        if (state.coordinateContext) {
            this.context = state.coordinateContext;
            this.bridge.updateCoordinateContext(state.coordinateContext);
        }
        this.update();
    }

    protected selectLayer(layer: M0LayerKey): void {
        if (this.activeLayer === layer) {
            return;
        }
        this.activeLayer = layer;
        this.update();
    }

    protected selectSurfaceMode(mode: M0SurfaceMode): void {
        if (this.mode === mode) {
            return;
        }
        this.mode = mode;
        this.update();
    }

    protected selectLanguageSubtab(subtab: M0LanguageSubtab): void {
        if (this.activeLanguageSubtab === subtab) {
            return;
        }
        this.activeLanguageSubtab = subtab;
        this.update();
    }

    protected override render(): React.ReactNode {
        const provenance = `privacy=${PRIVACY_CLASS} | generation=${this.context.profileGeneration ?? '—'} | pointer=${this.context.pointerAnchor ?? '—'}`;
        const model = buildM0InspectorModel({
            selectedInput: this.context.hashInput ?? this.context.selectedCoordinate,
            graphNode: readGraphNode(this.profile),
            profile: this.profile,
            readiness: this.readiness,
            context: this.context,
            mode: this.mode
        });
        const activeRoute =
            model.layerRoutes.find(route => route.layerKey === this.activeLayer) ?? model.layerRoutes[0];
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
                    <h3>M0 six-layer routes</h3>
                    <div role="tablist" aria-label="M0 layer routes" className="m0-layer-tabs">
                        {model.layerRoutes.map(route => (
                            <button
                                key={route.layer}
                                id={route.tabId}
                                type="button"
                                role="tab"
                                aria-selected={route.layerKey === activeRoute.layerKey}
                                aria-controls={`${route.tabId}-panel`}
                                data-layer={route.layer}
                                onClick={() => this.selectLayer(route.layerKey)}
                            >
                                {route.label}
                                <span
                                    aria-label={`${route.label} provenance ${model.layerReadiness[route.layerKey]}`}
                                    className="m0-layer-tab-provenance-pill"
                                    data-provenance-state={model.layerReadiness[route.layerKey]}
                                >
                                    {model.layerReadiness[route.layerKey].replace(/_/g, ' ')}
                                </span>
                            </button>
                        ))}
                    </div>
                    {activeRoute ? (
                        activeRoute.layer === 'lang' ? (
                            <LanguageLayerStackedTab
                                route={activeRoute}
                                bridge={this.bridge}
                                context={this.context}
                                coordinatePrefix={
                                    this.context.hashInput ??
                                    this.context.selectedCoordinate ??
                                    model.query.canonicalMCoordinate
                                }
                                activeSubtab={this.activeLanguageSubtab}
                                onSubtabChange={subtab => this.selectLanguageSubtab(subtab)}
                                onNodeSelected={() => this.selectLayer('language')}
                            />
                        ) : (
                            <LayerRoutePanel route={activeRoute} />
                        )
                    ) : null}
                </section>
                <LanguageLayerPanel model={model} />
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
                        <dt>Projection lenses</dt>
                        <dd>
                            {model.projectionLenses
                                .map(lens => `${lens.id}: ${lens.lensKind} on ${lens.targetViewId}`)
                                .join(' | ')}
                        </dd>
                    </dl>
                </section>
                <section
                    className="mext-widget-detail m0-community-clock-overlay"
                    data-view-id={model.communityClockOverlay.viewId}
                    data-provenance-state={model.communityClockOverlay.state}
                    data-read-only={model.communityClockOverlay.readOnly}
                    data-local-clock={model.communityClockOverlay.usesLocalClock}
                >
                    <h3>Community clock overlay</h3>
                    <dl>
                        <dt>View</dt>
                        <dd>{model.communityClockOverlay.viewId}</dd>
                        <dt>Coordinate</dt>
                        <dd>{model.communityClockOverlay.coordinate ?? 'Awaiting S2 coordinate'}</dd>
                        <dt>GDS community</dt>
                        <dd data-provenance-state={model.communityClockOverlay.gdsCommunity.state}>
                            {model.communityClockOverlay.gdsCommunity.value ??
                                model.communityClockOverlay.gdsCommunity.provenance}
                        </dd>
                        <dt>Active-now clock</dt>
                        <dd data-provenance-state={model.communityClockOverlay.activeNow.state}>
                            {model.communityClockOverlay.activeNow.value ??
                                model.communityClockOverlay.activeNow.provenance}
                        </dd>
                        <dt>Projection</dt>
                        <dd data-provenance-state={model.communityClockOverlay.projection.state}>
                            {model.communityClockOverlay.projection.value ??
                                model.communityClockOverlay.projection.provenance}
                        </dd>
                        <dt>Privacy boundary</dt>
                        <dd data-provenance-state={model.communityClockOverlay.privacyBoundary.state}>
                            {model.communityClockOverlay.privacyBoundary.value ??
                                model.communityClockOverlay.privacyBoundary.provenance}
                        </dd>
                    </dl>
                    <p className="mext-widget-empty">{model.communityClockOverlay.provenance}</p>
                </section>
                <M0ModeToggle
                    mode={model.mode}
                    coordinate={model.node.coordinate ?? model.query.canonicalMCoordinate}
                    actions={model.actions}
                    commands={this.commands}
                    onModeChange={mode => this.selectSurfaceMode(mode)}
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
            </div>
        );
    }
}

function LanguageLayerStackedTab(props: {
    readonly route: M0LayerRoute;
    readonly bridge: SharedBridgeAdapter;
    readonly context: CoordinateContext;
    readonly coordinatePrefix: string | null;
    readonly activeSubtab: M0LanguageSubtab;
    readonly onSubtabChange: (subtab: M0LanguageSubtab) => void;
    readonly onNodeSelected: () => void;
}): React.ReactElement {
    const { activeSubtab, onSubtabChange } = props;
    const routeTabId = `${props.route.tabId}-route-contract`;
    const lazyTabId = `${props.route.tabId}-lazy-browser`;
    return (
        <div
            id={`${props.route.tabId}-panel`}
            role="tabpanel"
            aria-labelledby={props.route.tabId}
            data-layer={props.route.layer}
        >
            <div role="tablist" aria-label="M0-0 language layer subtabs" className="m0-layer-tabs">
                <button
                    id={routeTabId}
                    type="button"
                    role="tab"
                    aria-selected={activeSubtab === 'route'}
                    aria-controls={`${routeTabId}-panel`}
                    onClick={() => onSubtabChange('route')}
                >
                    Route contract
                </button>
                <button
                    id={lazyTabId}
                    type="button"
                    role="tab"
                    aria-selected={activeSubtab === 'lazy-browser'}
                    aria-controls={`${lazyTabId}-panel`}
                    onClick={() => onSubtabChange('lazy-browser')}
                >
                    Lazy 96 browser
                </button>
            </div>
            {activeSubtab === 'route' ? (
                <LayerRoutePanel
                    route={props.route}
                    panelId={`${routeTabId}-panel`}
                    labelledBy={routeTabId}
                />
            ) : (
                <div
                    id={`${lazyTabId}-panel`}
                    role="tabpanel"
                    aria-labelledby={lazyTabId}
                >
                    <LazyNodeBrowserPanel
                        bridge={props.bridge}
                        context={props.context}
                        coordinatePrefix={props.coordinatePrefix}
                        onNodeSelected={props.onNodeSelected}
                    />
                </div>
            )}
        </div>
    );
}

function LayerRoutePanel(props: {
    readonly route: M0LayerRoute;
    readonly panelId?: string;
    readonly labelledBy?: string;
}): React.ReactElement {
    const route = props.route;
    return (
        <div
            id={props.panelId ?? `${route.tabId}-panel`}
            role="tabpanel"
            aria-labelledby={props.labelledBy ?? route.tabId}
            data-layer={route.layer}
        >
            <dl>
                <dt>Layer</dt>
                <dd>{route.layer}</dd>
                <dt>S2 query</dt>
                <dd>
                    <code>{route.query.method}</code>
                </dd>
                <dt>Route</dt>
                <dd>{route.routePath}</dd>
                <dt>Placement</dt>
                <dd>{route.placement}</dd>
                {route.bridgeRoute ? (
                    <>
                        <dt>Bridge route</dt>
                        <dd>{route.bridgeRoute}</dd>
                    </>
                ) : null}
            </dl>
            <p className="mext-widget-empty">{route.summary}</p>
        </div>
    );
}

function readGraphNode(profile: MathemeHarmonicProfileBoundary | null): Record<string, unknown> | null {
    const payload = profile?.payload;
    const node = payload?.m0_graph_node ?? payload?.selected_graph_node ?? payload?.s2_graph_node;
    return node && typeof node === 'object' && !Array.isArray(node)
        ? (node as Record<string, unknown>)
        : null;
}
