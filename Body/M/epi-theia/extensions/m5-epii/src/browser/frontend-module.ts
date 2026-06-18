// Generated from contracts/07-t0-extension-contract-preflight.json. Do not hand-edit.
import { ContainerModule, injectable, interfaces, inject } from '@theia/core/shared/inversify';
import { CommandContribution, CommandRegistry } from '@theia/core/lib/common';
import {
    WidgetFactory,
    FrontendApplicationContribution,
    bindViewContribution
} from '@theia/core/lib/browser';
import { AbstractViewContribution } from '@theia/core/lib/browser/shell/view-contribution';
import {
    Disposable,
    EMPTY_STATE_REGISTRY,
    EmptyStateRegistry,
    MObservabilityPublisher,
    SharedBridgeAdapter,
    SHARED_BRIDGE_ADAPTER,
    parseExtensionRoute,
    registerIntentTarget
} from '@pratibimba/m-extension-runtime';
import {
    M5EpiiEmptyState,
    M5EpiiEmptyStateWidget
} from './empty-state';
import { M5EpiiWidget } from './m5-epii-widget';
import { ResonanceEbmService } from './services/resonance-ebm-service';
import { ContemplationObjectService } from './services/contemplation-object-service';
import { WisdomDeltaService } from './services/wisdom-delta-service';
import {
    EXTENSION_ID,
    OPEN_COMMAND_ID,
    READ_ONLY_COMMAND_ID,
    DEPOSIT_ONLY_COMMAND_ID,
    ROUTE_PATH,
    OBSERVABILITY_EVENT_TYPES
} from '../common';

export const M5_EPII_PUBLISHER = Symbol(
    'm5-epii.observabilityPublisher'
);

@injectable()
export class M5EpiiContribution
    extends AbstractViewContribution<M5EpiiWidget>
    implements CommandContribution, FrontendApplicationContribution
{
    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    constructor() {
        super({
            widgetId: M5EpiiWidget.ID,
            widgetName: M5EpiiWidget.LABEL,
            defaultWidgetOptions: { area: 'main' },
            toggleCommandId: OPEN_COMMAND_ID
        });
    }

    async onStart(): Promise<void> {
        // M-extensions register without auto-opening; the user (or a deep link)
        // triggers the view via OPEN_COMMAND_ID.
    }

    override registerCommands(commands: CommandRegistry): void {
        super.registerCommands(commands);
        commands.registerCommand(
            { id: OPEN_COMMAND_ID, label: `${EXTENSION_ID}: open primary view` },
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
        // Route handler: deep links of the form epi-logos://ide/m5-epii/review?...
        commands.registerCommand(
            { id: `${EXTENSION_ID}.handleRoute`, label: `${EXTENSION_ID}: handle route` },
            {
                execute: (raw: string) => {
                    const route = parseExtensionRoute(raw);
                    if (!route || route.extensionId !== EXTENSION_ID) {
                        return undefined;
                    }
                    return this.openView({ activate: true, reveal: true });
                }
            }
        );
        registerIntentTarget(
            commands,
            EXTENSION_ID,
            'review',
            'M5 Epii: Open Review Item',
            () => this.openView({ activate: true, reveal: true })
        );
        registerIntentTarget(
            commands,
            EXTENSION_ID,
            'evidence-deposit',
            'M5 Epii: Deposit Review Evidence',
            () => this.openView({ activate: true, reveal: true })
        );
        // 31.2 / CC-02 command-palette catalog — stage-1 wave-C commands for
        // m5-epii (26.x). Dispatch routes through the shared bridge only.
        commands.registerCommand({ id: 'm5-epii.capacity-tree.focus', label: `${EXTENSION_ID}: focus capacity tree` }, { execute: () => this.dispatchPaletteCommand('m5-epii.capacity-tree.focus') });
        commands.registerCommand({ id: 'm5-epii.mobius-pass-ribbon.open', label: `${EXTENSION_ID}: open Möbius pass ribbon` }, { execute: () => this.dispatchPaletteCommand('m5-epii.mobius-pass-ribbon.open') });
        commands.registerCommand({ id: 'm5-epii.contemplation-object.open', label: `${EXTENSION_ID}: open contemplation object` }, { execute: () => this.dispatchPaletteCommand('m5-epii.contemplation-object.open') });
        commands.registerCommand({ id: 'm5-epii.recognition-layer.focus', label: `${EXTENSION_ID}: focus recognition layer` }, { execute: () => this.dispatchPaletteCommand('m5-epii.recognition-layer.focus') });
        commands.registerCommand({ id: 'm5-epii.iod-17-parity.refresh', label: `${EXTENSION_ID}: refresh IoD-17 parity` }, { execute: () => this.dispatchPaletteCommand('m5-epii.iod-17-parity.refresh') });
        commands.registerCommand({ id: 'm5-epii.pi-axiom-translation.open', label: `${EXTENSION_ID}: open PI axiom translation` }, { execute: () => this.dispatchPaletteCommand('m5-epii.pi-axiom-translation.open') });
    }

    /**
     * 31.2 / CC-02: command-palette entries route through the shared bridge so
     * the OmniPanel parity layer can observe and forward the dispatch. Feature
     * behaviour lands in the owning feature tranche (26.x).
     */
    protected dispatchPaletteCommand(commandId: string, params: Record<string, unknown> = {}): void {
        this.bridge.updateCurrentStateSelectorPayload(commandId, {
            commandId,
            extensionId: EXTENSION_ID,
            ...params
        });
    }
}

@injectable()
class M5EpiiPublisher implements MObservabilityPublisher {
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
class M5EpiiEmptyStateRegistration implements FrontendApplicationContribution {
    @inject(EMPTY_STATE_REGISTRY)
    protected readonly emptyStates!: EmptyStateRegistry;

    protected disposable?: Disposable;

    onStart(): void {
        this.disposable = this.emptyStates.register({
            extensionId: EXTENSION_ID,
            viewId: 'm5-epii.primary',
            activationCondition: snapshot => snapshot.state !== 'ready_public_current',
            component: M5EpiiEmptyState
        });
    }

    onStop(): void {
        this.disposable?.dispose();
        this.disposable = undefined;
    }
}

export default new ContainerModule(bind => {
    bind(ResonanceEbmService).toSelf().inSingletonScope();
    bind(ContemplationObjectService).toSelf().inSingletonScope();
    bind(WisdomDeltaService).toSelf().inSingletonScope();
    bind(M5EpiiWidget).toSelf();
    bind(M5EpiiEmptyStateWidget).toSelf();
    bind(WidgetFactory)
        .toDynamicValue(ctx => ({
            id: M5EpiiWidget.ID,
            createWidget: () => createWidget(ctx.container)
        }))
        .inSingletonScope();
    bindViewContribution(bind, M5EpiiContribution);
    bind(FrontendApplicationContribution).toService(M5EpiiContribution);

    bind(M5EpiiPublisher).toSelf().inSingletonScope();
    bind(M5_EPII_PUBLISHER).toService(
        M5EpiiPublisher
    );
    bind(M5EpiiEmptyStateRegistration).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(M5EpiiEmptyStateRegistration);

    // ROUTE_PATH reference keeps the constant load-bearing; route resolution
    // happens via the registered command above.
    void ROUTE_PATH;
});

function createWidget(container: interfaces.Container): M5EpiiWidget {
    const child = container.createChild();
    child.bind(M5EpiiWidget).toSelf();
    return child.get(M5EpiiWidget);
}
