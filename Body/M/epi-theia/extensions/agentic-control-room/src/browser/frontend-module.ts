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
import { registerIntentTarget } from '@pratibimba/m-extension-runtime';
import {
    AgenticControlRoomRuntimeService,
    ACR_RUNTIME_SERVICE
} from './acr-runtime-service';
import { RunFlowWidget } from './run-flow-widget';
import { EXTENSION_ID } from '../common';

/**
 * Frontend module for `@pratibimba/agentic-control-room` — Track 05 T8.
 *
 * Wires the run-flow widget + runtime service. The T4 chrome shell (in
 * `@pratibimba/ide-shell-m0-m5`) provides the VAK fields + capability tree
 * the user picks routes/actors with; this extension provides the run-time
 * mechanics (run tree, tool stream, diagnostics, abort/retry/continue,
 * evidence deposition, review decision controls).
 *
 * Registers an intent target so an external surface can route into the run-
 * flow widget directly with a candidate id + coordinate.
 */

@injectable()
export class RunFlowContribution
    extends AbstractViewContribution<RunFlowWidget>
    implements CommandContribution, FrontendApplicationContribution
{
    constructor() {
        super({
            widgetId: RunFlowWidget.ID,
            widgetName: RunFlowWidget.LABEL,
            defaultWidgetOptions: { area: 'main' },
            toggleCommandId: `pratibimba.${EXTENSION_ID}.run-flow.toggle`
        });
    }

    async onStart(): Promise<void> { /* lazy-open via intent */ }

    override registerCommands(commands: CommandRegistry): void {
        super.registerCommands(commands);
        // T8 routes route into the run-flow widget.
        registerIntentTarget(
            commands,
            EXTENSION_ID,
            'run-flow',
            'Agentic Control Room: Open Run Flow',
            intent => this.handleOpenRunFlow(intent)
        );
    }

    protected async handleOpenRunFlow(intent: unknown): Promise<void> {
        await this.openView({ activate: true, reveal: true });
        // Intent payload may include candidate context — the host extension
        // (ide-shell-m0-m5) populates the chrome panes; the run flow widget
        // reflects the same runtime service state.
        void intent;
    }
}

export default new ContainerModule(bind => {
    // Runtime service (singleton across the IDE process).
    bind(AgenticControlRoomRuntimeService).toSelf().inSingletonScope();
    bind(ACR_RUNTIME_SERVICE).toService(AgenticControlRoomRuntimeService);

    // Run-flow widget.
    bind(RunFlowWidget).toSelf();
    bind(WidgetFactory)
        .toDynamicValue(ctx => ({
            id: RunFlowWidget.ID,
            createWidget: () => createSimpleWidget(ctx.container, RunFlowWidget)
        }))
        .inSingletonScope();
    bindViewContribution(bind, RunFlowContribution);
    bind(FrontendApplicationContribution).toService(RunFlowContribution);
});

function createSimpleWidget<T>(
    container: interfaces.Container,
    Ctor: interfaces.Newable<T>
): T {
    const child = container.createChild();
    child.bind(Ctor).toSelf();
    return child.get(Ctor);
}
