import { ContainerModule, injectable, interfaces } from '@theia/core/shared/inversify';
import { CommandContribution, CommandRegistry, MenuContribution, MenuModelRegistry } from '@theia/core/lib/common';
import { WidgetFactory, FrontendApplicationContribution, bindViewContribution } from '@theia/core/lib/browser';
import { AbstractViewContribution } from '@theia/core/lib/browser/shell/view-contribution';
import { KernelBridgeReadinessWidget, KERNEL_BRIDGE_READINESS_SOURCE } from './readiness-widget';
import { GatewayReadinessSource } from './gateway-readiness-source';
import { KernelBridgeReadinessSource } from '../common/readiness-types';
import { MinimalQuickAccessRegistry, MinimalQuickInputService } from './minimal-quick-input';

export const KernelBridgeReadinessCommand = {
    id: 'pratibimba.kernel-bridge-readiness.open',
    label: 'Pratibimba: Show Kernel Bridge Readiness'
};

@injectable()
export class KernelBridgeReadinessContribution
    extends AbstractViewContribution<KernelBridgeReadinessWidget>
    implements CommandContribution, MenuContribution, FrontendApplicationContribution
{
    constructor() {
        super({
            widgetId: KernelBridgeReadinessWidget.ID,
            widgetName: KernelBridgeReadinessWidget.LABEL,
            defaultWidgetOptions: { area: 'right' },
            toggleCommandId: KernelBridgeReadinessCommand.id
        });
    }

    async onStart(): Promise<void> {
        // Reveal the diagnostic pane on startup so readiness is visible without command-palette spelunking.
        await this.openView({ activate: false, reveal: true });
    }

    override registerCommands(commands: CommandRegistry): void {
        super.registerCommands(commands);
        commands.registerCommand(KernelBridgeReadinessCommand, {
            execute: () => this.openView({ activate: true, reveal: true })
        });
    }

    override registerMenus(menus: MenuModelRegistry): void {
        super.registerMenus(menus);
    }
}

export default new ContainerModule((bind, _unbind, isBound) => {
    if (!isBound(MinimalQuickAccessRegistry.SERVICE_ID)) {
        bind(MinimalQuickAccessRegistry.SERVICE_ID).to(MinimalQuickAccessRegistry).inSingletonScope();
    }
    if (!isBound(MinimalQuickInputService.SERVICE_ID)) {
        bind(MinimalQuickInputService.SERVICE_ID).to(MinimalQuickInputService).inSingletonScope();
    }

    // Real source — gateway HTTP. No mock branch.
    bind(GatewayReadinessSource)
        .toDynamicValue(() => new GatewayReadinessSource())
        .inSingletonScope();
    bind<KernelBridgeReadinessSource>(KERNEL_BRIDGE_READINESS_SOURCE).toService(GatewayReadinessSource);

    bind(KernelBridgeReadinessWidget).toSelf();
    bind(WidgetFactory)
        .toDynamicValue(ctx => ({
            id: KernelBridgeReadinessWidget.ID,
            createWidget: () => createWidget(ctx.container)
        }))
        .inSingletonScope();

    bindViewContribution(bind, KernelBridgeReadinessContribution);
    bind(FrontendApplicationContribution).toService(KernelBridgeReadinessContribution);
});

function createWidget(container: interfaces.Container): KernelBridgeReadinessWidget {
    const child = container.createChild();
    child.bind(KernelBridgeReadinessWidget).toSelf();
    return child.get(KernelBridgeReadinessWidget);
}
