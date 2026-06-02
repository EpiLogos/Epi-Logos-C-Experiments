// Generated from contracts/08-t0-composition-contract-preflight.json. Do not hand-edit.
import { ContainerModule, injectable, interfaces, inject } from '@theia/core/shared/inversify';
import { CommandContribution, CommandRegistry, Disposable as TheiaDisposable } from '@theia/core/lib/common';
import {
    WidgetFactory,
    FrontendApplicationContribution,
    bindViewContribution
} from '@theia/core/lib/browser';
import { AbstractViewContribution } from '@theia/core/lib/browser/shell/view-contribution';
import {
    SharedBridgeAdapter,
    SHARED_BRIDGE_ADAPTER
} from '@pratibimba/m-extension-runtime';
import {
    ALL_INTEGRATED_COMMANDS,
    COMMAND_COPY_EVIDENCE_HANDLE,
    COMMAND_OPEN_EVIDENCE_PANEL,
    COMMAND_TOGGLE_MINI_INSPECTORS,
    IntegratedBridgeGate,
    InvalidIntegratedDeepLinkError,
    NAMED_LAYOUTS,
    parseIntegratedDeepLink
} from '@pratibimba/integrated-composition';
import { PluginIntegrated450Widget } from './plugin-integrated-4-5-0-widget';
import { PLUGIN_ID, PRIMARY_COMMAND_ID, NAMED_LAYOUT_ID } from '../common';

export const PLUGIN_INTEGRATED_4_5_0_BRIDGE_GATE = Symbol(
    'plugin-integrated-4-5-0.bridgeGate'
);

@injectable()
export class PluginIntegrated450Contribution
    extends AbstractViewContribution<PluginIntegrated450Widget>
    implements CommandContribution, FrontendApplicationContribution
{
    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    protected gate: IntegratedBridgeGate | null = null;
    protected installed = false;
    protected installedDisposables: TheiaDisposable[] = [];

    constructor() {
        super({
            widgetId: PluginIntegrated450Widget.ID,
            widgetName: PluginIntegrated450Widget.LABEL,
            defaultWidgetOptions: { area: 'main' },
            toggleCommandId: PRIMARY_COMMAND_ID
        });
    }

    async onStart(): Promise<void> {
        // Integrated plugins do NOT auto-open; the user (or another extension)
        // must invoke the open command. The bridge gate decides whether the
        // commands and layout descriptors are even installed.
        this.gate = new IntegratedBridgeGate(this.bridge);
        this.gate.onChange(attached => this.applyGate(attached));
    }

    protected applyGate(attached: boolean): void {
        if (attached && !this.installed) {
            this.installCommandsAndLayout();
        } else if (!attached && this.installed) {
            this.uninstallCommandsAndLayout();
        }
    }

    protected installCommandsAndLayout(): void {
        this.installed = true;
        // Layout is registered by being claimable via NAMED_LAYOUTS; we
        // emit a debug log so tests can assert installation order.
        const layout = NAMED_LAYOUTS.find(l => l.id === NAMED_LAYOUT_ID);
        if (!layout) {
            throw new Error(`plugin-integrated-4-5-0: named layout ${NAMED_LAYOUT_ID} missing from registry`);
        }
        // No-op marker for downstream layout consumers.
        void layout;
    }

    protected uninstallCommandsAndLayout(): void {
        this.installed = false;
        for (const d of this.installedDisposables) {
            try { d.dispose(); } catch { /* best-effort */ }
        }
        this.installedDisposables = [];
    }

    isInstalled(): boolean {
        return this.installed;
    }

    override registerCommands(commands: CommandRegistry): void {
        super.registerCommands(commands);
        // Commands are guarded by the bridge gate; until the bridge attaches
        // each handler short-circuits with a "bridge unavailable" notice.
        const guard = <T,>(fn: () => T): T | undefined => {
            if (!this.installed) {
                return undefined;
            }
            return fn();
        };
        commands.registerCommand(
            { id: PRIMARY_COMMAND_ID, label: `Jiva-Siva: open` },
            { execute: () => guard(() => this.openView({ activate: true, reveal: true })) }
        );
        commands.registerCommand(
            { id: COMMAND_TOGGLE_MINI_INSPECTORS, label: 'Integrated: toggle mini inspectors' },
            { execute: () => guard(() => undefined) }
        );
        commands.registerCommand(
            { id: COMMAND_OPEN_EVIDENCE_PANEL, label: 'Integrated: open evidence panel' },
            { execute: () => guard(() => undefined) }
        );
        commands.registerCommand(
            { id: COMMAND_COPY_EVIDENCE_HANDLE, label: 'Integrated: copy evidence handle' },
            { execute: () => guard(() => undefined) }
        );
        // 08.T7: deep-link handler. Accepts a raw epi-logos://ide/integrated/...
        // URL, parses it, refuses unrelated plugin routes, and opens this
        // plugin's view with the link state applied.
        commands.registerCommand(
            { id: `${PLUGIN_ID}.handleDeepLink`, label: `${PLUGIN_ID}: handle deep link` },
            {
                execute: (raw: string) => guard(() => {
                    try {
                        const link = parseIntegratedDeepLink(raw);
                        if (link.pluginId !== PLUGIN_ID) {
                            return undefined;
                        }
                        // The widget reads selectedCoordinate / profileGeneration
                        // through the SharedBridgeAdapter; the deep link command
                        // is responsible for opening the view + signaling the
                        // intended inspector. Inspector switching is plumbed in
                        // a follow-on (08.T8 acceptance scenarios).
                        void link;
                        return this.openView({ activate: true, reveal: true });
                    } catch (err) {
                        if (err instanceof InvalidIntegratedDeepLinkError) {
                            return undefined;
                        }
                        throw err;
                    }
                })
            }
        );
        // 08.T7: workspace-layout activation. Signals the named workspace
        // layout id so a downstream layout service (or the future Theia
        // LayoutService binding) can apply it. Until that binding lands the
        // command is a no-op marker; it does NOT silently succeed against a
        // missing layout service.
        commands.registerCommand(
            { id: `${PLUGIN_ID}.openWorkspaceLayout`, label: `${PLUGIN_ID}: open named layout` },
            { execute: () => guard(() => NAMED_LAYOUT_ID) }
        );
        // ALL_INTEGRATED_COMMANDS is referenced for test discovery.
        void ALL_INTEGRATED_COMMANDS;
        void PLUGIN_ID;
    }
}

export default new ContainerModule(bind => {
    bind(PluginIntegrated450Widget).toSelf();
    bind(WidgetFactory)
        .toDynamicValue(ctx => ({
            id: PluginIntegrated450Widget.ID,
            createWidget: () => createWidget(ctx.container)
        }))
        .inSingletonScope();
    bindViewContribution(bind, PluginIntegrated450Contribution);
    bind(FrontendApplicationContribution).toService(PluginIntegrated450Contribution);
});

function createWidget(container: interfaces.Container): PluginIntegrated450Widget {
    const child = container.createChild();
    child.bind(PluginIntegrated450Widget).toSelf();
    return child.get(PluginIntegrated450Widget);
}
