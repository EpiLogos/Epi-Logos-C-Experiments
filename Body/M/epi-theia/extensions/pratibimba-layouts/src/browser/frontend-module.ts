import { ContainerModule, injectable, inject } from '@theia/core/shared/inversify';
import { CommandContribution, CommandRegistry, CommandService, MenuContribution } from '@theia/core/lib/common';
import { FrontendApplicationContribution } from '@theia/core/lib/browser';
import { KeybindingContribution, KeybindingRegistry } from '@theia/core/lib/browser/keybinding';
import { PreferenceService } from '@theia/core/lib/browser/preferences';
import { LAYOUT_SWITCHER } from './tokens';
import { PratibimbaLayoutSwitcher } from './layout-switcher';
import { PratibimbaLayoutCommandContribution } from './layout-commands';
import { EpiLogosMenuContribution } from './epi-logos-menu';
import { PratibimbaSessionStateService } from './session-state-service';
import { SESSION_STATE_SERVICE } from './session-state-service';
import {
    CROSS_LAYOUT_INTENT_DISPATCHER,
    CrossLayoutIntentDispatcher
} from './cross-layout-intent-dispatcher';

const PRESERVE_THEIA_DEFAULTS_PREFERENCE = 'epi-logos.keymap.preserveTheiaDefaults';
const CANONICAL_INTENT_DISPATCH_COMMAND = 'pratibimba.intent.dispatch';

@injectable()
class PratibimbaLayoutKeybindingContribution implements CommandContribution, KeybindingContribution {
    @inject(CommandService)
    protected readonly commands!: CommandService;

    @inject(PreferenceService)
    protected readonly preferences!: PreferenceService;

    registerCommands(commands: CommandRegistry): void {
        commands.registerCommand(
            {
                id: 'pratibimba.cross-layout-intent.dispatch',
                label: 'Pratibimba: Dispatch Cross-Layout Intent'
            },
            {
                execute: (...args: unknown[]) =>
                    this.commands.executeCommand(CANONICAL_INTENT_DISPATCH_COMMAND, ...args)
            }
        );
    }

    registerKeybindings(keybindings: KeybindingRegistry): void {
        if (this.preferences.get<boolean>(PRESERVE_THEIA_DEFAULTS_PREFERENCE, false) === false) {
            keybindings.unregisterKeybinding('cmd+.');
        }
        keybindings.registerKeybinding({
            command: 'pratibimba.layout.toggle',
            keybinding: 'cmd+.',
            when: 'epi-logos.keymap.preserveTheiaDefaults === false'
        });
        keybindings.registerKeybinding({
            command: 'pratibimba.layout.toggle',
            keybinding: 'cmd+shift+0',
            when: 'epi-logos.keymap.preserveTheiaDefaults === true'
        });
        keybindings.registerKeybinding({
            command: 'pratibimba.cross-layout-intent.dispatch',
            keybinding: 'cmd+shift+l'
        });
    }
}

export default new ContainerModule(bind => {
    bind(PratibimbaLayoutSwitcher).toSelf().inSingletonScope();
    bind(LAYOUT_SWITCHER).toService(PratibimbaLayoutSwitcher);

    bind(PratibimbaLayoutCommandContribution).toSelf().inSingletonScope();
    bind(CommandContribution).toService(PratibimbaLayoutCommandContribution);
    bind(MenuContribution).toService(PratibimbaLayoutCommandContribution);
    bind(FrontendApplicationContribution).toService(PratibimbaLayoutCommandContribution);

    bind(EpiLogosMenuContribution).toSelf().inSingletonScope();
    bind(MenuContribution).toService(EpiLogosMenuContribution);

    // Track 05 T5: session-state service + cross-layout intent dispatcher.
    bind(PratibimbaSessionStateService).toSelf().inSingletonScope();
    bind(SESSION_STATE_SERVICE).toService(PratibimbaSessionStateService);

    bind(CrossLayoutIntentDispatcher).toSelf().inSingletonScope();
    bind(CROSS_LAYOUT_INTENT_DISPATCHER).toService(CrossLayoutIntentDispatcher);
    bind(CommandContribution).toService(CrossLayoutIntentDispatcher);

    bind(PratibimbaLayoutKeybindingContribution).toSelf().inSingletonScope();
    bind(CommandContribution).toService(PratibimbaLayoutKeybindingContribution);
    bind(KeybindingContribution).toService(PratibimbaLayoutKeybindingContribution);
});
