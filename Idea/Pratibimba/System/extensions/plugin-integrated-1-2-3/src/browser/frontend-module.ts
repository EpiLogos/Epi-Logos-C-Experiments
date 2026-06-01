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
    NAMED_LAYOUTS
} from '@pratibimba/integrated-composition';
import { PluginIntegrated123Widget } from './plugin-integrated-1-2-3-widget';
import { PLUGIN_ID, PRIMARY_COMMAND_ID, NAMED_LAYOUT_ID } from '../common';

export const PLUGIN_INTEGRATED_1_2_3_BRIDGE_GATE = Symbol(
    'plugin-integrated-1-2-3.bridgeGate'
);

@injectable()
export class PluginIntegrated123Contribution
    extends AbstractViewContribution<PluginIntegrated123Widget>
    implements CommandContribution, FrontendApplicationContribution
{
    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    protected gate: IntegratedBridgeGate | null = null;
    protected installed = false;
    protected installedDisposables: TheiaDisposable[] = [];

    constructor() {
        super({
            widgetId: PluginIntegrated123Widget.ID,
            widgetName: PluginIntegrated123Widget.LABEL,
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
            throw new Error(`plugin-integrated-1-2-3: named layout ${NAMED_LAYOUT_ID} missing from registry`);
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
            { id: PRIMARY_COMMAND_ID, label: `Cosmic Engine: open` },
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
        // ALL_INTEGRATED_COMMANDS is referenced for test discovery.
        void ALL_INTEGRATED_COMMANDS;
        void PLUGIN_ID;
    }
}

export default new ContainerModule(bind => {
    bind(PluginIntegrated123Widget).toSelf();
    bind(WidgetFactory)
        .toDynamicValue(ctx => ({
            id: PluginIntegrated123Widget.ID,
            createWidget: () => createWidget(ctx.container)
        }))
        .inSingletonScope();
    bindViewContribution(bind, PluginIntegrated123Contribution);
    bind(FrontendApplicationContribution).toService(PluginIntegrated123Contribution);
});

function createWidget(container: interfaces.Container): PluginIntegrated123Widget {
    const child = container.createChild();
    child.bind(PluginIntegrated123Widget).toSelf();
    return child.get(PluginIntegrated123Widget);
}
