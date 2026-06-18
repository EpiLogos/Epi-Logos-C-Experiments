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
    M2ParashaktiEmptyState,
    M2ParashaktiEmptyStateWidget
} from './empty-state';
import { M2CymaticEngineWidget } from './m2-cymatic-engine-widget';
import { M2CorrespondenceTreeWidget } from './m2-correspondence-tree-widget';
import { M2ParashaktiWidget } from './m2-parashakti-widget';
import {
    EXTENSION_ID,
    OPEN_COMMAND_ID,
    READ_ONLY_COMMAND_ID,
    DEPOSIT_ONLY_COMMAND_ID,
    ROUTE_PATH,
    OBSERVABILITY_EVENT_TYPES
} from '../common';

export const M2_PARASHAKTI_PUBLISHER = Symbol(
    'm2-parashakti.observabilityPublisher'
);

@injectable()
export class M2ParashaktiContribution
    extends AbstractViewContribution<M2ParashaktiWidget>
    implements CommandContribution, FrontendApplicationContribution
{
    constructor() {
        super({
            widgetId: M2ParashaktiWidget.ID,
            widgetName: M2ParashaktiWidget.LABEL,
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
        // Route handler: deep links of the form epi-logos://ide/m2-parashakti/meaning-packet?...
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
            'meaning-packet',
            'M2 Parashakti: Open Meaning Packet',
            () => this.openView({ activate: true, reveal: true })
        );
        registerIntentTarget(
            commands,
            EXTENSION_ID,
            'resonance',
            'M2 Parashakti: Open Resonance Packet',
            () => this.openView({ activate: true, reveal: true })
        );
        registerIntentTarget(
            commands,
            EXTENSION_ID,
            'correspondenceTree',
            'M2 Parashakti: Open Correspondence Tree',
            () => this.openView({ activate: true, reveal: true })
        );
    }
}

@injectable()
class M2ParashaktiPublisher implements MObservabilityPublisher {
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
class M2ParashaktiEmptyStateRegistration implements FrontendApplicationContribution {
    @inject(EMPTY_STATE_REGISTRY)
    protected readonly emptyStates!: EmptyStateRegistry;

    protected disposable?: Disposable;

    onStart(): void {
        this.disposable = this.emptyStates.register({
            extensionId: EXTENSION_ID,
            viewId: 'm2-parashakti.primary',
            activationCondition: snapshot => snapshot.state !== 'ready_public_current',
            component: M2ParashaktiEmptyState
        });
    }

    onStop(): void {
        this.disposable?.dispose();
        this.disposable = undefined;
    }
}

export default new ContainerModule(bind => {
    bind(M2ParashaktiWidget).toSelf();
    bind(M2ParashaktiEmptyStateWidget).toSelf();
    bind(WidgetFactory)
        .toDynamicValue(ctx => ({
            id: M2ParashaktiWidget.ID,
            createWidget: () => createWidget(ctx.container)
        }))
        .inSingletonScope();
    bind(M2CymaticEngineWidget).toSelf();
    bind(WidgetFactory)
        .toDynamicValue(ctx => ({
            id: M2CymaticEngineWidget.ID,
            createWidget: () => createCymaticEngineWidget(ctx.container)
        }))
        .inSingletonScope();
    bind(M2CorrespondenceTreeWidget).toSelf();
    bind(WidgetFactory)
        .toDynamicValue(ctx => ({
            id: M2CorrespondenceTreeWidget.ID,
            createWidget: () => createCorrespondenceTreeWidget(ctx.container)
        }))
        .inSingletonScope();
    bindViewContribution(bind, M2ParashaktiContribution);
    bind(FrontendApplicationContribution).toService(M2ParashaktiContribution);

    bind(M2ParashaktiPublisher).toSelf().inSingletonScope();
    bind(M2_PARASHAKTI_PUBLISHER).toService(
        M2ParashaktiPublisher
    );
    bind(M2ParashaktiEmptyStateRegistration).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(M2ParashaktiEmptyStateRegistration);

    // ROUTE_PATH reference keeps the constant load-bearing; route resolution
    // happens via the registered command above.
    void ROUTE_PATH;
});

function createWidget(container: interfaces.Container): M2ParashaktiWidget {
    const child = container.createChild();
    child.bind(M2ParashaktiWidget).toSelf();
    return child.get(M2ParashaktiWidget);
}

function createCymaticEngineWidget(container: interfaces.Container): M2CymaticEngineWidget {
    const child = container.createChild();
    child.bind(M2CymaticEngineWidget).toSelf();
    return child.get(M2CymaticEngineWidget);
}

function createCorrespondenceTreeWidget(container: interfaces.Container): M2CorrespondenceTreeWidget {
    const child = container.createChild();
    child.bind(M2CorrespondenceTreeWidget).toSelf();
    return child.get(M2CorrespondenceTreeWidget);
}
