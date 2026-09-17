import { ContainerModule, interfaces } from '@theia/core/shared/inversify';
import {
    FrontendApplicationContribution,
    WidgetFactory,
    bindViewContribution
} from '@theia/core/lib/browser';
import { BasesViewContribution, BasesViewWidget } from './bases-view-widget';

export default new ContainerModule(bind => {
    bind(BasesViewWidget).toSelf();
    bind(WidgetFactory)
        .toDynamicValue(ctx => ({
            id: BasesViewWidget.ID,
            createWidget: () => createWidget(ctx.container)
        }))
        .inSingletonScope();
    bindViewContribution(bind, BasesViewContribution);
    bind(FrontendApplicationContribution).toService(BasesViewContribution);
});

function createWidget(container: interfaces.Container): BasesViewWidget {
    const child = container.createChild();
    child.bind(BasesViewWidget).toSelf();
    return child.get(BasesViewWidget);
}
