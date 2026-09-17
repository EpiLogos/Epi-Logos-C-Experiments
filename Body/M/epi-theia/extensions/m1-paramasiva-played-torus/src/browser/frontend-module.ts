// frontend-module.ts — Theia frontend-module registration for the M1 Paramaśiva played K² torus surface.
// Binds the PlayedTorusWidget, its WidgetFactory, and the view/command contribution.
import { ContainerModule, interfaces } from '@theia/core/shared/inversify';
import { CommandContribution, CommandRegistry } from '@theia/core/lib/common';
import {
    FrontendApplicationContribution,
    WidgetFactory,
    bindViewContribution
} from '@theia/core/lib/browser';
import { AbstractViewContribution } from '@theia/core/lib/browser/shell/view-contribution';
import { parseExtensionRoute, registerIntentTarget } from '@pratibimba/m-extension-runtime';
import { OPEN_COMMAND_ID, ROUTE_PATH, EXTENSION_ID } from '../common';
import { PlayedTorusWidget } from './played-torus-widget';

class PlayedTorusContribution
    extends AbstractViewContribution<PlayedTorusWidget>
    implements CommandContribution, FrontendApplicationContribution
{
    constructor() {
        super({
            widgetId: PlayedTorusWidget.ID,
            widgetName: PlayedTorusWidget.LABEL,
            defaultWidgetOptions: { area: 'main' },
            toggleCommandId: OPEN_COMMAND_ID
        });
    }

    async onStart(): Promise<void> {
        // The surface opens through explicit command, route, or integrated layout request.
    }

    override registerCommands(commands: CommandRegistry): void {
        super.registerCommands(commands);
        commands.registerCommand(
            { id: OPEN_COMMAND_ID, label: `${EXTENSION_ID}: open K2 played torus` },
            { execute: () => this.openView({ activate: true, reveal: true }) }
        );
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
            'k2',
            'M1 Paramasiva: Open K2 Played Torus',
            () => this.openView({ activate: true, reveal: true })
        );
    }
}

export default new ContainerModule(bind => {
    bind(PlayedTorusWidget).toSelf();
    bind(WidgetFactory)
        .toDynamicValue(ctx => ({
            id: PlayedTorusWidget.ID,
            createWidget: () => createWidget(ctx.container)
        }))
        .inSingletonScope();
    bindViewContribution(bind, PlayedTorusContribution);
    bind(FrontendApplicationContribution).toService(PlayedTorusContribution);
    void ROUTE_PATH;
});

function createWidget(container: interfaces.Container): PlayedTorusWidget {
    const child = container.createChild();
    child.bind(PlayedTorusWidget).toSelf();
    return child.get(PlayedTorusWidget);
}
