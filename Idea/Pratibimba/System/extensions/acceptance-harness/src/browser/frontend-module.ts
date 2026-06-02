import { ContainerModule, interfaces, injectable } from '@theia/core/shared/inversify';
import {
    CommandContribution,
    CommandRegistry
} from '@theia/core/lib/common';
import {
    WidgetFactory,
    FrontendApplicationContribution,
    bindViewContribution
} from '@theia/core/lib/browser';
import { AbstractViewContribution } from '@theia/core/lib/browser/shell/view-contribution';
import { AcceptanceRunner, ACCEPTANCE_RUNNER } from './acceptance-runner';
import { HarnessControlWidget } from './harness-control-widget';
import { EXTENSION_ID } from '../common';

/**
 * Frontend module for `@pratibimba/acceptance-harness` — Track 05 T9.
 *
 * Binds the AcceptanceRunner as a singleton and exposes the harness control
 * widget. Registers a command (`pratibimba.acceptance-harness.run`) so the
 * Node-driven acceptance script can drive the runner via a Theia API call
 * (or via a CLI argument the operator passes through).
 */

const ACCEPTANCE_RUN_COMMAND = 'pratibimba.acceptance-harness.run';

@injectable()
export class HarnessContribution
    extends AbstractViewContribution<HarnessControlWidget>
    implements CommandContribution, FrontendApplicationContribution
{
    constructor() {
        super({
            widgetId: HarnessControlWidget.ID,
            widgetName: HarnessControlWidget.LABEL,
            defaultWidgetOptions: { area: 'right' },
            toggleCommandId: `pratibimba.${EXTENSION_ID}.harness-control.toggle`
        });
    }

    async onStart(): Promise<void> { /* operator opens explicitly */ }

    override registerCommands(commands: CommandRegistry): void {
        super.registerCommands(commands);
        commands.registerCommand(
            { id: ACCEPTANCE_RUN_COMMAND, label: 'Acceptance Harness: Run Plan' },
            {
                execute: async () => {
                    const widget = await this.openView({ activate: true, reveal: true });
                    if (widget) {
                        // Pull the runner from the widget's container, but
                        // the runner is a Theia singleton — directly invoke
                        // via the binding.
                        const { runner } = widget as unknown as { runner: AcceptanceRunner };
                        if (runner) {
                            await runner.run();
                        }
                    }
                }
            }
        );
    }
}

export default new ContainerModule(bind => {
    bind(AcceptanceRunner).toSelf().inSingletonScope();
    bind(ACCEPTANCE_RUNNER).toService(AcceptanceRunner);

    bind(HarnessControlWidget).toSelf();
    bind(WidgetFactory)
        .toDynamicValue(ctx => ({
            id: HarnessControlWidget.ID,
            createWidget: () => createSimpleWidget(ctx.container, HarnessControlWidget)
        }))
        .inSingletonScope();
    bindViewContribution(bind, HarnessContribution);
    bind(FrontendApplicationContribution).toService(HarnessContribution);
});

function createSimpleWidget<T>(
    container: interfaces.Container,
    Ctor: interfaces.Newable<T>
): T {
    const child = container.createChild();
    child.bind(Ctor).toSelf();
    return child.get(Ctor);
}
