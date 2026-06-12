import { ContainerModule, interfaces, injectable } from '@theia/core/shared/inversify';
import { CommandContribution, CommandRegistry } from '@theia/core/lib/common';
import {
    FrontendApplicationContribution,
    WidgetFactory,
    bindViewContribution
} from '@theia/core/lib/browser';
import { AbstractViewContribution } from '@theia/core/lib/browser/shell/view-contribution';
import {
    CANON_STUDIO_OPEN_COMMAND_ID,
    CANON_STUDIO_WIDGET_ID
} from '../common';
import { CanonDecorationService } from './canon-decoration-service';
import { CanonStudioWidget } from './canon-studio-widget';

@injectable()
export class CanonStudioContribution
    extends AbstractViewContribution<CanonStudioWidget>
    implements CommandContribution, FrontendApplicationContribution
{
    constructor() {
        super({
            widgetId: CANON_STUDIO_WIDGET_ID,
            widgetName: CanonStudioWidget.LABEL,
            defaultWidgetOptions: { area: 'main' },
            toggleCommandId: CANON_STUDIO_OPEN_COMMAND_ID
        });
    }

    async onStart(): Promise<void> {
        // Canon Studio is command-opened; it does not seize the workbench on startup.
    }

    override registerCommands(commands: CommandRegistry): void {
        super.registerCommands(commands);
        commands.registerCommand(
            { id: CANON_STUDIO_OPEN_COMMAND_ID, label: 'Canon Studio: Open Markdown Editor' },
            { execute: () => this.openView({ activate: true, reveal: true }) }
        );
    }
}

export default new ContainerModule(bind => {
    bind(CanonDecorationService).toSelf().inSingletonScope();
    bind(CanonStudioWidget).toSelf();
    bind(WidgetFactory)
        .toDynamicValue(ctx => ({
            id: CanonStudioWidget.ID,
            createWidget: () => createWidget(ctx.container)
        }))
        .inSingletonScope();
    bindViewContribution(bind, CanonStudioContribution);
    bind(FrontendApplicationContribution).toService(CanonStudioContribution);
});

function createWidget(container: interfaces.Container): CanonStudioWidget {
    const child = container.createChild();
    child.bind(CanonStudioWidget).toSelf();
    return child.get(CanonStudioWidget);
}
