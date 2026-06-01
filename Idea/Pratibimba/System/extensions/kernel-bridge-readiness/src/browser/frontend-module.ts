import { ContainerModule, interfaces } from '@theia/core/shared/inversify';
import { CommandContribution, CommandRegistry, MenuContribution, MenuModelRegistry } from '@theia/core/lib/common';
import { WidgetFactory, FrontendApplicationContribution, bindViewContribution } from '@theia/core/lib/browser';
import { AbstractViewContribution } from '@theia/core/lib/browser/shell/view-contribution';
import { KernelBridgeReadinessWidget, KERNEL_BRIDGE_READINESS_SOURCE } from './readiness-widget';
import { GatewayReadinessSource } from './gateway-readiness-source';
import { KernelBridgeReadinessSource } from '../common/readiness-types';

export const KernelBridgeReadinessCommand = {
    id: 'pratibimba.kernel-bridge-readiness.open',
    label: 'Pratibimba: Show Kernel Bridge Readiness'
};

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
        // Pre-load the widget so the side area shows the readiness state on first activation.
        await this.openView({ activate: false, reveal: false });
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

export default new ContainerModule(bind => {
    // Real source — gateway HTTP. No mock branch.
    bind(GatewayReadinessSource).toSelf().inSingletonScope();
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
