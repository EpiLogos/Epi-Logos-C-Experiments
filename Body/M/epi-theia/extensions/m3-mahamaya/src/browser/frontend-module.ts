// Generated from contracts/07-t0-extension-contract-preflight.json. Do not hand-edit.
import { ContainerModule, injectable, interfaces, inject } from '@theia/core/shared/inversify';
import { CommandContribution, CommandRegistry } from '@theia/core/lib/common';
import {
    WidgetFactory,
    FrontendApplicationContribution,
    bindViewContribution
} from '@theia/core/lib/browser';
import { KeybindingContribution, KeybindingRegistry } from '@theia/core/lib/browser/keybinding';
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
    M3MahamayaEmptyState,
    M3MahamayaEmptyStateWidget
} from './empty-state';
import { M3MahamayaWidget } from './m3-mahamaya-widget';
import { M3MahamayaRendererService } from './services/m3-renderer-service';
import { M3_RENDERER_SERVICE } from './services/m3-renderer-protocol';
import {
    M3_PENTADIC_TRACE_SERVICE,
    M3PentadicTraceService
} from './services/m3-pentadic-trace-service';
import {
    EXTENSION_ID,
    OPEN_COMMAND_ID,
    READ_ONLY_COMMAND_ID,
    DEPOSIT_ONLY_COMMAND_ID,
    ROUTE_PATH,
    OBSERVABILITY_EVENT_TYPES
} from '../common';

export const M3_MAHAMAYA_PUBLISHER = Symbol(
    'm3-mahamaya.observabilityPublisher'
);
const M3_TAROT_DRAW_KEYBINDING: string = 'cmd+alt+r';

@injectable()
export class M3MahamayaContribution
    extends AbstractViewContribution<M3MahamayaWidget>
    implements CommandContribution, FrontendApplicationContribution, KeybindingContribution
{
    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    constructor() {
        super({
            widgetId: M3MahamayaWidget.ID,
            widgetName: M3MahamayaWidget.LABEL,
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
            { id: 'm3-mahamaya.openCoordinate', label: `${EXTENSION_ID}: open coordinate` },
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
        // Route handler: deep links of the form epi-logos://ide/m3-mahamaya/codon?...
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
        // 31.2 / CC-02 command-palette catalog — stage-1 wave-C commands for
        // m3-mahamaya (24.x). Dispatch routes through the shared bridge only.
        commands.registerCommand({ id: 'm3-mahamaya.cosmic-clock.open', label: `${EXTENSION_ID}: open cosmic clock` }, { execute: () => this.dispatchPaletteCommand('m3-mahamaya.cosmic-clock.open') });
        commands.registerCommand({ id: 'm3-mahamaya.tarot.draw', label: `${EXTENSION_ID}: draw tarot` }, { execute: () => this.dispatchPaletteCommand('m3-mahamaya.tarot.draw') });
        commands.registerCommand({ id: 'm3-mahamaya.iching.cast', label: `${EXTENSION_ID}: cast I-Ching` }, { execute: () => this.dispatchPaletteCommand('m3-mahamaya.iching.cast') });
        commands.registerCommand({ id: 'm3-mahamaya.decan-chain.lookup', label: `${EXTENSION_ID}: look up decan chain` }, { execute: () => this.dispatchPaletteCommand('m3-mahamaya.decan-chain.lookup') });
        commands.registerCommand({ id: 'm3-mahamaya.hexagram-body.open', label: `${EXTENSION_ID}: open hexagram body` }, { execute: () => this.dispatchPaletteCommand('m3-mahamaya.hexagram-body.open') });
        commands.registerCommand({ id: 'm3-mahamaya.quintessence.display', label: `${EXTENSION_ID}: display quintessence` }, { execute: () => this.dispatchPaletteCommand('m3-mahamaya.quintessence.display') });
        registerIntentTarget(
            commands,
            EXTENSION_ID,
            'codon',
            'M3 Mahamaya: Open Codon Rotation',
            () => this.openView({ activate: true, reveal: true })
        );
    }

    override registerKeybindings(keybindings: KeybindingRegistry): void {
        super.registerKeybindings(keybindings);
        keybindings.registerKeybinding({
            command: 'm3-mahamaya.openCoordinate',
            keybinding: 'cmd+shift+3'
        });
        keybindings.registerKeybinding({
            command: 'm3-mahamaya.iching.cast',
            keybinding: 'cmd+alt+c'
        });
        keybindings.registerKeybinding({
            command: 'm3-mahamaya.tarot.draw',
            keybinding: M3_TAROT_DRAW_KEYBINDING,
            when: "epiLogosLayoutActive === 'ide-deep'"
        });
    }

    /**
     * 31.2 / CC-02: command-palette entries route through the shared bridge so
     * the OmniPanel parity layer can observe and forward the dispatch. Feature
     * behaviour lands in the owning feature tranche (24.x).
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
class M3MahamayaPublisher implements MObservabilityPublisher {
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
class M3MahamayaEmptyStateRegistration implements FrontendApplicationContribution {
    @inject(EMPTY_STATE_REGISTRY)
    protected readonly emptyStates!: EmptyStateRegistry;

    protected disposable?: Disposable;

    onStart(): void {
        this.disposable = this.emptyStates.register({
            extensionId: EXTENSION_ID,
            viewId: 'm3-mahamaya.primary',
            activationCondition: snapshot => snapshot.state !== 'ready_public_current',
            component: M3MahamayaEmptyState
        });
    }

    onStop(): void {
        this.disposable?.dispose();
        this.disposable = undefined;
    }
}

export default new ContainerModule(bind => {
    // Renderer-service architecture (24.T24.16): the deterministic Mahamaya
    // visualisation projector, addressed through both its class and the
    // M3_RENDERER_SERVICE injection Symbol (DI symbol discipline).
    bind(M3MahamayaRendererService).toSelf().inSingletonScope();
    bind(M3_RENDERER_SERVICE).toService(M3MahamayaRendererService);
    bind(M3PentadicTraceService).toSelf().inSingletonScope();
    bind(M3_PENTADIC_TRACE_SERVICE).toService(M3PentadicTraceService);

    bind(M3MahamayaWidget).toSelf();
    bind(M3MahamayaEmptyStateWidget).toSelf();
    bind(WidgetFactory)
        .toDynamicValue(ctx => ({
            id: M3MahamayaWidget.ID,
            createWidget: () => createWidget(ctx.container)
        }))
        .inSingletonScope();
    bindViewContribution(bind, M3MahamayaContribution);
    bind(FrontendApplicationContribution).toService(M3MahamayaContribution);

    bind(M3MahamayaPublisher).toSelf().inSingletonScope();
    bind(M3_MAHAMAYA_PUBLISHER).toService(
        M3MahamayaPublisher
    );
    bind(M3MahamayaEmptyStateRegistration).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(M3MahamayaEmptyStateRegistration);

    // ROUTE_PATH reference keeps the constant load-bearing; route resolution
    // happens via the registered command above.
    void ROUTE_PATH;
});

function createWidget(container: interfaces.Container): M3MahamayaWidget {
    const child = container.createChild();
    child.bind(M3MahamayaWidget).toSelf();
    return child.get(M3MahamayaWidget);
}
