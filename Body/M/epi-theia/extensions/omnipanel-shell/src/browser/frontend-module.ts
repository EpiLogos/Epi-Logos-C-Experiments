// Install browser-runtime stub for the Electron-only globals the OmniPanel
// expects. Must run before any module that touches `window.sPrime`.
import './omnipanel-runtime-stub';

import { ContainerModule, injectable, inject, interfaces } from '@theia/core/shared/inversify';
import { CommandContribution, CommandRegistry } from '@theia/core/lib/common';
import { WidgetFactory, bindViewContribution, FrontendApplicationContribution } from '@theia/core/lib/browser';
import { KeybindingContribution, KeybindingRegistry } from '@theia/core/lib/browser/keybinding';
import { OmniPanelWidget } from './omnipanel-widget';
import { OmniPanelContribution } from './omnipanel-contribution';
import { DispatchTracePanelContribution } from './dispatch-trace-contribution';
import { OMNIPANEL_RUNTIME_SERVICE, OmniPanelRuntimeService } from './services/omnipanel-runtime-service';
import { REVIEW_LANDING_SERVICE, ReviewLandingService } from './services/review-landing-service';
import { SlashCommandParser } from './services/slash-command-parser';
import { SlashCommandRegistry, registerDefaultSlashCommands } from './services/slash-command-registry';
import { PiChatConversationStore } from './stores/pi-chat-conversation-store';
import { OMNIPANEL_TABS } from '../common/omnipanel-types';

@injectable()
class OmniPanelTabKeybindingContribution implements CommandContribution, KeybindingContribution {
    @inject(OMNIPANEL_RUNTIME_SERVICE)
    protected readonly runtime!: OmniPanelRuntimeService;

    registerCommands(commands: CommandRegistry): void {
        commands.registerCommand({ id: 'omnipanel.tab.activate.0', label: 'OmniPanel: Activate tab 1' }, { execute: () => this.activateTab(0) });
        commands.registerCommand({ id: 'omnipanel.tab.activate.1', label: 'OmniPanel: Activate tab 2' }, { execute: () => this.activateTab(1) });
        commands.registerCommand({ id: 'omnipanel.tab.activate.2', label: 'OmniPanel: Activate tab 3' }, { execute: () => this.activateTab(2) });
        commands.registerCommand({ id: 'omnipanel.tab.activate.3', label: 'OmniPanel: Activate tab 4' }, { execute: () => this.activateTab(3) });
        commands.registerCommand({ id: 'omnipanel.tab.activate.4', label: 'OmniPanel: Activate tab 5' }, { execute: () => this.activateTab(4) });
        commands.registerCommand({ id: 'omnipanel.tab.activate.5', label: 'OmniPanel: Activate tab 6' }, { execute: () => this.activateTab(5) });
        commands.registerCommand({ id: 'omnipanel.tab.activate.6', label: 'OmniPanel: Activate tab 7' }, { execute: () => this.activateTab(6) });
        commands.registerCommand({ id: 'omnipanel.tab.activate.7', label: 'OmniPanel: Activate tab 8' }, { execute: () => this.activateTab(7) });
    }

    registerKeybindings(keybindings: KeybindingRegistry): void {
        keybindings.registerKeybinding({
            command: 'omnipanel.tab.activate.0',
            keybinding: 'cmd+1',
            when: 'omnipanelTabAvailable === true'
        });
        keybindings.registerKeybinding({
            command: 'omnipanel.tab.activate.1',
            keybinding: 'cmd+2',
            when: 'omnipanelTabAvailable === true'
        });
        keybindings.registerKeybinding({
            command: 'omnipanel.tab.activate.2',
            keybinding: 'cmd+3',
            when: 'omnipanelTabAvailable === true'
        });
        keybindings.registerKeybinding({
            command: 'omnipanel.tab.activate.3',
            keybinding: 'cmd+4',
            when: 'omnipanelTabAvailable === true'
        });
        keybindings.registerKeybinding({
            command: 'omnipanel.tab.activate.4',
            keybinding: 'cmd+5',
            when: 'omnipanelTabAvailable === true'
        });
        keybindings.registerKeybinding({
            command: 'omnipanel.tab.activate.5',
            keybinding: 'cmd+6',
            when: 'omnipanelTabAvailable === true'
        });
        keybindings.registerKeybinding({
            command: 'omnipanel.tab.activate.6',
            keybinding: 'cmd+7',
            when: 'omnipanelTabAvailable === true'
        });
        keybindings.registerKeybinding({
            command: 'omnipanel.tab.activate.7',
            keybinding: 'cmd+8',
            when: 'omnipanelTabAvailable === true'
        });
    }

    protected activateTab(index: number): void {
        const tab = OMNIPANEL_TABS[index];
        if (tab) {
            this.runtime.activateTab(tab.id);
        }
    }
}

export default new ContainerModule(bind => {
    bind(OmniPanelRuntimeService).toSelf().inSingletonScope();
    bind(OMNIPANEL_RUNTIME_SERVICE).toService(OmniPanelRuntimeService);
    bind(ReviewLandingService).toSelf().inSingletonScope();
    bind(REVIEW_LANDING_SERVICE).toService(ReviewLandingService);
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

    bind(OmniPanelTabKeybindingContribution).toSelf().inSingletonScope();
    bind(CommandContribution).toService(OmniPanelTabKeybindingContribution);
    bind(KeybindingContribution).toService(OmniPanelTabKeybindingContribution);
});

function createWidget(container: interfaces.Container): OmniPanelWidget {
    const child = container.createChild();
    child.bind(OmniPanelWidget).toSelf();
    return child.get(OmniPanelWidget);
}
