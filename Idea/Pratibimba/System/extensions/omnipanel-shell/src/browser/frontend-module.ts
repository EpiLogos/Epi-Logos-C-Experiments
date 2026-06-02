// Install browser-runtime stub for the Electron-only globals the OmniPanel
// expects. Must run before any module that touches `window.sPrime`.
import './omnipanel-runtime-stub';

import { ContainerModule, interfaces } from '@theia/core/shared/inversify';
import { WidgetFactory, bindViewContribution, FrontendApplicationContribution } from '@theia/core/lib/browser';
import { OmniPanelWidget } from './omnipanel-widget';
import { OmniPanelContribution } from './omnipanel-contribution';

export default new ContainerModule(bind => {
    bind(OmniPanelWidget).toSelf();
    bind(WidgetFactory)
        .toDynamicValue(ctx => ({
            id: OmniPanelWidget.ID,
            createWidget: () => createWidget(ctx.container)
        }))
        .inSingletonScope();

    bindViewContribution(bind, OmniPanelContribution);
    bind(FrontendApplicationContribution).toService(OmniPanelContribution);
});

function createWidget(container: interfaces.Container): OmniPanelWidget {
    const child = container.createChild();
    child.bind(OmniPanelWidget).toSelf();
    return child.get(OmniPanelWidget);
}
