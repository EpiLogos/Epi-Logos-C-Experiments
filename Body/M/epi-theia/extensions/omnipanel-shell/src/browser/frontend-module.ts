// Install browser-runtime stub for the Electron-only globals the OmniPanel
// expects. Must run before any module that touches `window.sPrime`.
import './omnipanel-runtime-stub';

import { ContainerModule, interfaces } from '@theia/core/shared/inversify';
import { CommandContribution } from '@theia/core/lib/common';
import { WidgetFactory, bindViewContribution, FrontendApplicationContribution } from '@theia/core/lib/browser';
import { OmniPanelWidget } from './omnipanel-widget';
import { OmniPanelContribution } from './omnipanel-contribution';
import { DispatchTracePanelContribution } from './dispatch-trace-contribution';
import { OMNIPANEL_RUNTIME_SERVICE, OmniPanelRuntimeService } from './services/omnipanel-runtime-service';
import { SlashCommandParser } from './services/slash-command-parser';
import { SlashCommandRegistry, registerDefaultSlashCommands } from './services/slash-command-registry';
import { PiChatConversationStore } from './stores/pi-chat-conversation-store';

export default new ContainerModule(bind => {
    bind(OmniPanelRuntimeService).toSelf().inSingletonScope();
    bind(OMNIPANEL_RUNTIME_SERVICE).toService(OmniPanelRuntimeService);
    bind(SlashCommandParser).toSelf().inSingletonScope();
    bind(PiChatConversationStore).toSelf().inSingletonScope();
    bind(SlashCommandRegistry)
        .toDynamicValue(() => {
            const registry = new SlashCommandRegistry();
            registerDefaultSlashCommands(registry);
            return registry;
        })
        .inSingletonScope();

    bind(OmniPanelWidget).toSelf();
    bind(WidgetFactory)
        .toDynamicValue(ctx => ({
            id: OmniPanelWidget.ID,
            createWidget: () => createWidget(ctx.container)
        }))
        .inSingletonScope();

    bindViewContribution(bind, OmniPanelContribution);
    bind(FrontendApplicationContribution).toService(OmniPanelContribution);

    // Register the Dispatch Trace panel's command surface so the Pi → Anima →
    // Aletheia techne-guardian genealogy is reachable from the command palette.
    bind(DispatchTracePanelContribution).toSelf().inSingletonScope();
    bind(CommandContribution).toService(DispatchTracePanelContribution);
});

function createWidget(container: interfaces.Container): OmniPanelWidget {
    const child = container.createChild();
    child.bind(OmniPanelWidget).toSelf();
    return child.get(OmniPanelWidget);
}
