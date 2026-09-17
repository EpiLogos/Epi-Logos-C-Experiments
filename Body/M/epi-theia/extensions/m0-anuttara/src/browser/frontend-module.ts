// Generated from contracts/07-t0-extension-contract-preflight.json. Do not hand-edit.
import * as React from 'react';
import {
    ContainerModule,
    injectable,
    interfaces,
    inject,
    postConstruct
} from '@theia/core/shared/inversify';
import { CommandContribution, CommandRegistry } from '@theia/core/lib/common';
import {
    WidgetFactory,
    FrontendApplicationContribution,
    bindViewContribution
} from '@theia/core/lib/browser';
import type { KeybindingContribution, KeybindingRegistry } from '@theia/core/lib/browser/keybinding';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { AbstractViewContribution } from '@theia/core/lib/browser/shell/view-contribution';
import {
    MObservabilityPublisher,
    SharedBridgeAdapter,
    SHARED_BRIDGE_ADAPTER,
    MExtensionReadinessSnapshot,
    PENDING_M_READINESS,
    EMPTY_STATE_REGISTRY,
    EmptyStateRegistry,
    MathemeHarmonicProfileBoundary,
    CoordinateContext,
    EMPTY_COORDINATE_CONTEXT,
    Disposable,
    parseExtensionRoute,
    registerIntentTarget
} from '@pratibimba/m-extension-runtime';
import {
    PRATIBIMBA_LAYOUT_DAILY_0_1,
    PRATIBIMBA_LAYOUT_IDE_DEEP
} from '@pratibimba/pratibimba-layouts';
import type { DailyShellFace } from '@pratibimba/pratibimba-layouts';
import { M0AnuttaraWidget } from './m0-anuttara-widget';
import {
    M0AnuttaraEmptyState,
    M0AnuttaraEmptyStateWidget
} from './empty-state';
import { M0CoordinateSummaryCard } from './components/m0-coordinate-summary-card';
import {
    EXTENSION_ID,
    OPEN_COMMAND_ID,
    READ_ONLY_COMMAND_ID,
    DEPOSIT_ONLY_COMMAND_ID,
    ROUTE_PATH,
    OBSERVABILITY_EVENT_TYPES
} from '../common';
import {
    M0_CROSS_LAYOUT_INTENT_TARGETS,
    isM0CrossLayoutIntentTarget,
    parseM0CrossLayoutIntentPayload,
    projectM0CrossLayoutIntentState
} from '../common/cross-layout-intent';
import type { M0CrossLayoutIntentPayload } from '../common/cross-layout-intent';
import type { M0LayerKey } from '../common/m0-layers';

export const M0_ANUTTARA_PUBLISHER = Symbol(
    'm0-anuttara.observabilityPublisher'
);

@injectable()
export class M0AnuttaraContribution
    extends AbstractViewContribution<M0AnuttaraWidget>
    implements CommandContribution, FrontendApplicationContribution, KeybindingContribution
{
    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    constructor() {
        super({
            widgetId: M0AnuttaraWidget.ID,
            widgetName: M0AnuttaraWidget.LABEL,
            defaultWidgetOptions: { area: 'main' },
            toggleCommandId: OPEN_COMMAND_ID
        });
    }

    async onStart(): Promise<void> {
        // M-extensions register without auto-opening; the user (or a deep link)
        // triggers the view via OPEN_COMMAND_ID.
    }

    protected async openIntentTarget(intent: unknown): Promise<M0AnuttaraWidget> {
        const widget = await this.openView({ activate: true, reveal: true });
        const payload = parseM0CrossLayoutIntentPayload(intent);
        if (payload) {
            this.applyIntentPayload(widget, payload);
        }
        return widget;
    }

    protected applyIntentPayload(
        widget: M0AnuttaraWidget,
        payload: M0CrossLayoutIntentPayload
    ): void {
        if (typeof widget.applyCrossLayoutIntent === 'function') {
            widget.applyCrossLayoutIntent(payload);
            return;
        }
        const target = widget as unknown as {
            activeLayer?: M0LayerKey;
            phase?: M0CrossLayoutIntentPayload['implicateExplicate'];
            mode?: M0CrossLayoutIntentPayload['mode'];
            context?: CoordinateContext;
            bridge?: Pick<SharedBridgeAdapter, 'updateCoordinateContext'>;
            update?: () => void;
        };
        const state = projectM0CrossLayoutIntentState(
            payload,
            target.context ?? EMPTY_COORDINATE_CONTEXT
        );
        if (state.activeLayer) {
            target.activeLayer = state.activeLayer;
        }
        if (state.phase) {
            target.phase = state.phase;
        }
        if (state.mode) {
            target.mode = state.mode;
        }
        if (state.coordinateContext) {
            target.context = state.coordinateContext;
            target.bridge?.updateCoordinateContext(state.coordinateContext);
        }
        target.update?.();
    }

    protected intentPayloadFromRoute(raw: string): M0CrossLayoutIntentPayload | null {
        const route = parseExtensionRoute(raw);
        if (!route || route.extensionId !== EXTENSION_ID) {
            return null;
        }
        const requestedContributionId = isM0CrossLayoutIntentTarget(
            route.query.requestedContributionId
        )
            ? route.query.requestedContributionId
            : 'graph';
        return parseM0CrossLayoutIntentPayload({
            requestedExtensionId: EXTENSION_ID,
            requestedContributionId,
            coordinate: route.query.coordinate,
            implicateExplicate: route.query.implicateExplicate,
            mode: route.query.mode,
            source: route.query.source
        });
    }

    override registerCommands(commands: CommandRegistry): void {
        super.registerCommands(commands);
        commands.registerCommand(
            { id: OPEN_COMMAND_ID, label: `${EXTENSION_ID}: open primary view` },
            { execute: () => this.openView({ activate: true, reveal: true }) }
        );
        commands.registerCommand(
            { id: 'm0-anuttara.openCoordinate', label: `${EXTENSION_ID}: open coordinate` },
            { execute: () => this.openView({ activate: true, reveal: true }) }
        );
        commands.registerCommand(
            { id: READ_ONLY_COMMAND_ID, label: `${EXTENSION_ID}: open read-only` },
            { execute: () => this.openView({ activate: true, reveal: true }) }
        );
        commands.registerCommand(
            { id: DEPOSIT_ONLY_COMMAND_ID, label: `${EXTENSION_ID}: open deposit-only` },
            { execute: () => this.openView({ activate: true, reveal: true }) }
        );
        // Route handler: deep links of the form epi-logos://ide/m0-anuttara/coordinate?...
        commands.registerCommand(
            { id: `${EXTENSION_ID}.handleRoute`, label: `${EXTENSION_ID}: handle route` },
            {
                execute: (raw: string | unknown) => {
                    const payload =
                        typeof raw === 'string'
                            ? this.intentPayloadFromRoute(raw)
                            : parseM0CrossLayoutIntentPayload(raw);
                    if (!payload) {
                        return undefined;
                    }
                    return this.openIntentTarget(payload);
                }
            }
        );
        // 31.2 / CC-02 command-palette catalog — stage-1 wave-C commands for
        // m0-anuttara (21.x). Every command dispatches through the shared bridge;
        // no direct kernel/gateway/graph-driver imports.
        commands.registerCommand({ id: 'm0-anuttara.layer-selector.activate', label: `${EXTENSION_ID}: activate layer selector` }, { execute: () => this.dispatchPaletteCommand('m0-anuttara.layer-selector.activate') });
        commands.registerCommand({ id: 'm0-anuttara.implicate-explicate.toggle', label: `${EXTENSION_ID}: toggle implicate/explicate` }, { execute: () => this.dispatchPaletteCommand('m0-anuttara.implicate-explicate.toggle') });
        commands.registerCommand({ id: 'm0-anuttara.contemplation.submit', label: `${EXTENSION_ID}: submit contemplation` }, { execute: () => this.dispatchPaletteCommand('m0-anuttara.contemplation.submit') });
        commands.registerCommand({ id: 'm0-anuttara.virtue-witness.refresh', label: `${EXTENSION_ID}: refresh virtue witness` }, { execute: () => this.dispatchPaletteCommand('m0-anuttara.virtue-witness.refresh') });
        commands.registerCommand({ id: 'm0-anuttara.symbolic-question.submit', label: `${EXTENSION_ID}: submit symbolic question` }, { execute: () => this.dispatchPaletteCommand('m0-anuttara.symbolic-question.submit') });
        commands.registerCommand({ id: 'm0-anuttara.mode.toggle', label: `${EXTENSION_ID}: toggle mode` }, { execute: () => this.dispatchPaletteCommand('m0-anuttara.mode.toggle') });
        commands.registerCommand({ id: 'm0-anuttara.cross-layout-intent.dispatch', label: `${EXTENSION_ID}: dispatch cross-layout intent` }, { execute: () => this.dispatchPaletteCommand('m0-anuttara.cross-layout-intent.dispatch') });
        // Track 05 T5 + 21.19 intent targets — legacy graph fallback plus
        // layer-aware M0LayerKey targets promoted from Track 11.2.
        for (const target of M0_CROSS_LAYOUT_INTENT_TARGETS) {
            registerIntentTarget(
                commands,
                EXTENSION_ID,
                target,
                `M0 Anuttara: Open ${target}`,
                intent => this.openIntentTarget(intent)
            );
        }
        // Compatibility target for existing coordinate-opening callers in this
        // worktree; it opens the primary view without layer activation.
        registerIntentTarget(
            commands,
            EXTENSION_ID,
            'coordinate',
            'M0 Anuttara: Open Coordinate',
            () => this.openIntentTarget({
                requestedExtensionId: EXTENSION_ID,
                requestedContributionId: 'graph'
            })
        );
    }

    override registerKeybindings(keybindings: KeybindingRegistry): void {
        super.registerKeybindings(keybindings);
        keybindings.registerKeybinding({
            command: OPEN_COMMAND_ID,
            keybinding: 'cmd+shift+0',
            when: 'epi-logos.keymap.preserveTheiaDefaults === false'
        });
        keybindings.registerKeybinding({
            command: 'm0-anuttara.implicate-explicate.toggle',
            keybinding: 'cmd+shift+i'
        });
        keybindings.registerKeybinding({
            command: 'm0-anuttara.mode.toggle',
            keybinding: 'cmd+shift+m'
        });
    }

    /**
     * 31.2 / CC-02: command-palette entries route through the shared bridge so
     * the OmniPanel parity layer can observe and forward the dispatch. Feature
     * behaviour lands in the owning feature tranche (21.x); the palette entry
     * never reaches into the kernel/gateway/graph driver directly.
     */
    protected dispatchPaletteCommand(commandId: string, params: Record<string, unknown> = {}): void {
        this.bridge.updateCurrentStateSelectorPayload(commandId, {
            commandId,
            extensionId: EXTENSION_ID,
            ...params
        });
    }
}

/** Track 08 compact-card WidgetFactory id (distinct from the primary view id). */
export const M0_COORDINATE_SUMMARY_CARD_ID = 'm0.anuttara.coordinateSummaryCard';

/** Canonical intent-dispatch command the OmniPanel routes cross-layout deep links through. */
const OMNIPANEL_INTENT_DISPATCH = 'pratibimba.intent.dispatch';

/**
 * Layout-conditional placement for the compact card. The integrated composition
 * layer reads this binding to place {@link M0CoordinateSummaryCard}:
 *   - in `ide-deep` it materialises as the full `main`-area contribution;
 *   - in `daily-0-1` it materialises in the cosmic-face activity-bar compact slot.
 * Bound against the pratibimba-layouts canonical layout + face vocabulary so the
 * placement cannot drift from the layout descriptors.
 */
export const M0_COORDINATE_SUMMARY_CARD_LAYOUT_BINDING = Object.freeze({
    widgetFactoryId: M0_COORDINATE_SUMMARY_CARD_ID,
    exportName: 'M0CoordinateSummaryCard' as const,
    ideDeep: Object.freeze({
        layout: PRATIBIMBA_LAYOUT_IDE_DEEP,
        area: 'main' as const
    }),
    daily01CosmicCompact: Object.freeze({
        layout: PRATIBIMBA_LAYOUT_DAILY_0_1,
        face: '0-cosmic' as DailyShellFace,
        slot: 'activity-bar-compact' as const,
        miniMode: 'compact-card' as const
    })
});

/**
 * Host ReactWidget for the Track 08 compact card. Subscribes to the shared
 * bridge current-state (profile / readiness / coordinate context) and renders
 * {@link M0CoordinateSummaryCard}, wiring its "Open full view" affordance to the
 * canonical `omnipanel.intent.dispatch` deep-link into the ide-deep M0 surface.
 */
@injectable()
export class M0CoordinateSummaryCardWidget extends ReactWidget {
    static readonly ID = M0_COORDINATE_SUMMARY_CARD_ID;
    static readonly LABEL = 'M0 — Coordinate Summary';

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    @inject(CommandRegistry)
    protected readonly commands!: CommandRegistry;

    protected readiness: MExtensionReadinessSnapshot = PENDING_M_READINESS;
    protected profile: MathemeHarmonicProfileBoundary | null = null;
    protected context: CoordinateContext = EMPTY_COORDINATE_CONTEXT;
    protected subscriptions: Disposable[] = [];

    @postConstruct()
    protected init(): void {
        this.id = M0CoordinateSummaryCardWidget.ID;
        this.title.label = M0CoordinateSummaryCardWidget.LABEL;
        this.title.caption = M0CoordinateSummaryCardWidget.LABEL;
        this.title.closable = true;
        this.addClass('mext-widget');
        this.addClass('mext-widget-' + EXTENSION_ID);
        this.addClass('m0-coordinate-summary-card-widget');

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

    protected selectedCoordinate(): string | null {
        return (
            this.context.selectedCoordinate ??
            this.context.canonicalMCoordinate ??
            this.context.hashInput ??
            null
        );
    }

    protected openFullView(): void {
        void this.commands.executeCommand(OMNIPANEL_INTENT_DISPATCH, {
            requestedLayout: 'ide-deep',
            requestedExtensionId: EXTENSION_ID,
            requestedContributionId: 'coordinate',
            coordinate: this.selectedCoordinate(),
            source: 'm0-anuttara-compact'
        });
    }

    protected override render(): React.ReactNode {
        return React.createElement(M0CoordinateSummaryCard, {
            currentProfile: this.profile,
            readiness: this.readiness,
            coordinateContext: this.context,
            onOpenFullView: () => this.openFullView()
        });
    }
}

@injectable()
export class M0CoordinateSummaryCardContribution
    extends AbstractViewContribution<M0CoordinateSummaryCardWidget>
    implements FrontendApplicationContribution
{
    static readonly OPEN_COMMAND_ID = `${EXTENSION_ID}.openCoordinateSummaryCard`;

    constructor() {
        super({
            widgetId: M0CoordinateSummaryCardWidget.ID,
            widgetName: M0CoordinateSummaryCardWidget.LABEL,
            // ide-deep placement: full main-area contribution.
            defaultWidgetOptions: { area: 'main' },
            toggleCommandId: M0CoordinateSummaryCardContribution.OPEN_COMMAND_ID
        });
    }

    async onStart(): Promise<void> {
        // Registered without auto-opening; composition / layout routing opens it.
    }

    override registerCommands(commands: CommandRegistry): void {
        super.registerCommands(commands);
        commands.registerCommand(
            {
                id: M0CoordinateSummaryCardContribution.OPEN_COMMAND_ID,
                label: `${EXTENSION_ID}: open coordinate summary card`
            },
            { execute: () => this.openView({ activate: true, reveal: true }) }
        );
    }
}

@injectable()
class M0AnuttaraPublisher implements MObservabilityPublisher {
    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    publish(event: { type: string; extensionId: string; emittedAt: number; payload: Readonly<Record<string, unknown>> }): void {
        if (!OBSERVABILITY_EVENT_TYPES.includes(event.type as (typeof OBSERVABILITY_EVENT_TYPES)[number])) {
            throw new Error(
                `${EXTENSION_ID} cannot publish unlisted observability event type: ${event.type}`
            );
        }
        if (event.extensionId !== EXTENSION_ID) {
            throw new Error(
                `${EXTENSION_ID} publisher refusing event from foreign extensionId ${event.extensionId}`
            );
        }
        this.bridge.publish(event);
    }
}

@injectable()
class M0AnuttaraEmptyStateRegistration implements FrontendApplicationContribution {
    @inject(EMPTY_STATE_REGISTRY)
    protected readonly emptyStates!: EmptyStateRegistry;

    protected disposable?: Disposable;

    onStart(): void {
        this.disposable = this.emptyStates.register({
            extensionId: EXTENSION_ID,
            viewId: 'm0-anuttara.primary',
            activationCondition: snapshot => snapshot.state !== 'ready_public_current',
            component: M0AnuttaraEmptyState
        });
    }

    onStop(): void {
        this.disposable?.dispose();
        this.disposable = undefined;
    }
}

export default new ContainerModule(bind => {
    bind(M0AnuttaraWidget).toSelf();
    bind(M0AnuttaraEmptyStateWidget).toSelf();
    bind(WidgetFactory)
        .toDynamicValue(ctx => ({
            id: M0AnuttaraWidget.ID,
            createWidget: () => createWidget(ctx.container)
        }))
        .inSingletonScope();
    bindViewContribution(bind, M0AnuttaraContribution);
    bind(FrontendApplicationContribution).toService(M0AnuttaraContribution);

    // Track 08 compact card — WidgetFactory + layout-conditional contribution.
    bind(M0CoordinateSummaryCardWidget).toSelf();
    bind(WidgetFactory)
        .toDynamicValue(ctx => ({
            id: M0CoordinateSummaryCardWidget.ID,
            createWidget: () => createSummaryCardWidget(ctx.container)
        }))
        .inSingletonScope();
    bindViewContribution(bind, M0CoordinateSummaryCardContribution);
    bind(FrontendApplicationContribution).toService(M0CoordinateSummaryCardContribution);

    bind(M0AnuttaraPublisher).toSelf().inSingletonScope();
    bind(M0_ANUTTARA_PUBLISHER).toService(
        M0AnuttaraPublisher
    );
    bind(M0AnuttaraEmptyStateRegistration).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(M0AnuttaraEmptyStateRegistration);

    // ROUTE_PATH reference keeps the constant load-bearing; route resolution
    // happens via the registered command above.
    void ROUTE_PATH;
    // Layout binding keeps the daily-0-1 cosmic-face compact placement
    // load-bearing for the integrated composition layer.
    void M0_COORDINATE_SUMMARY_CARD_LAYOUT_BINDING;
});

function createSummaryCardWidget(container: interfaces.Container): M0CoordinateSummaryCardWidget {
    const child = container.createChild();
    child.bind(M0CoordinateSummaryCardWidget).toSelf();
    return child.get(M0CoordinateSummaryCardWidget);
}

function createWidget(container: interfaces.Container): M0AnuttaraWidget {
    const child = container.createChild();
    child.bind(M0AnuttaraWidget).toSelf();
    return child.get(M0AnuttaraWidget);
}
