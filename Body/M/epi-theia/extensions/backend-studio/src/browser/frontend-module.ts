import { ContainerModule, interfaces, injectable } from '@theia/core/shared/inversify';
import { CommandContribution, CommandRegistry } from '@theia/core/lib/common';
import {
    FrontendApplicationContribution,
    WidgetFactory,
    bindViewContribution
} from '@theia/core/lib/browser';
import { AbstractViewContribution } from '@theia/core/lib/browser/shell/view-contribution';
import {
    BACKEND_STUDIO_OPEN_COMMAND_ID,
    BACKEND_STUDIO_WIDGET_ID
} from '../common';
import { BackendStudioLanguageService } from './backend-studio-language-service';
import { BackendStudioWidget } from './backend-studio-widget';

@injectable()
export class BackendStudioContribution
    extends AbstractViewContribution<BackendStudioWidget>
    implements CommandContribution, FrontendApplicationContribution
{
    constructor() {
        super({
            widgetId: BACKEND_STUDIO_WIDGET_ID,
            widgetName: BackendStudioWidget.LABEL,
            defaultWidgetOptions: { area: 'main' },
            toggleCommandId: BACKEND_STUDIO_OPEN_COMMAND_ID
        });
    }

    async onStart(): Promise<void> {
        // Backend Studio registers its view and activates LSP metadata on demand.
    }

    override registerCommands(commands: CommandRegistry): void {
        super.registerCommands(commands);
        commands.registerCommand(
            { id: BACKEND_STUDIO_OPEN_COMMAND_ID, label: 'Backend Studio: Open Provenance View' },
            { execute: () => this.openView({ activate: true, reveal: true }) }
        );
    }
}

export default new ContainerModule(bind => {
    bind(BackendStudioLanguageService).toSelf().inSingletonScope();
    bind(BackendStudioWidget).toSelf();
    bind(WidgetFactory)
        .toDynamicValue(ctx => ({
            id: BackendStudioWidget.ID,
            createWidget: () => createWidget(ctx.container)
        }))
        .inSingletonScope();
    bindViewContribution(bind, BackendStudioContribution);
    bind(FrontendApplicationContribution).toService(BackendStudioContribution);
});

function createWidget(container: interfaces.Container): BackendStudioWidget {
    const child = container.createChild();
    child.bind(BackendStudioWidget).toSelf();
    return child.get(BackendStudioWidget);
}
