import { injectable, inject } from '@theia/core/shared/inversify';
import {
    CommandContribution,
    CommandRegistry,
    Command,
    MenuContribution,
    MenuModelRegistry,
    MAIN_MENU_BAR
} from '@theia/core/lib/common';
import { FrontendApplicationContribution } from '@theia/core/lib/browser';
import {
    PRATIBIMBA_LAYOUT_DAILY_0_1,
    PRATIBIMBA_LAYOUT_IDE_DEEP
} from '../common/layout-types';
import { LAYOUT_SWITCHER } from './tokens';
import type { PratibimbaLayoutSwitcher } from './layout-switcher';

export const SWITCH_TO_DAILY: Command = {
    id: 'pratibimba.layout.switch-to-daily',
    label: 'Pratibimba: Return to 0/1 Daily Layout'
};

export const SWITCH_TO_IDE_DEEP: Command = {
    id: 'pratibimba.layout.switch-to-ide-deep',
    label: 'Pratibimba: Summon Deep IDE Layout'
};

export const TOGGLE_LAYOUT: Command = {
    id: 'pratibimba.layout.toggle',
    label: 'Pratibimba: Toggle Workspace Layout'
};

/**
 * Layout commands + startup contribution.
 *
 * - Registers commands the OmniPanel and command-palette surface.
 * - At Theia startup, restores the persisted layout (defaulting to daily-0-1).
 */
/** Top-level Pratibimba menu in the Electron menubar / Theia menu — T5. */
export const PRATIBIMBA_MENU = [...MAIN_MENU_BAR, '5_pratibimba'];
export const PRATIBIMBA_LAYOUTS_GROUP = [...PRATIBIMBA_MENU, '1_layouts'];
export const PRATIBIMBA_INTENTS_GROUP = [...PRATIBIMBA_MENU, '2_intents'];

@injectable()
export class PratibimbaLayoutCommandContribution
    implements CommandContribution, MenuContribution, FrontendApplicationContribution {
    @inject(LAYOUT_SWITCHER) protected readonly switcher!: PratibimbaLayoutSwitcher;

    async onStart(): Promise<void> {
        await this.switcher.restoreInitialLayout();
    }

    registerCommands(commands: CommandRegistry): void {
        commands.registerCommand(SWITCH_TO_DAILY, {
            execute: () => this.switcher.switchTo(PRATIBIMBA_LAYOUT_DAILY_0_1),
            isEnabled: () => this.switcher.currentLayout !== PRATIBIMBA_LAYOUT_DAILY_0_1
        });
        commands.registerCommand(SWITCH_TO_IDE_DEEP, {
            execute: () => this.switcher.switchTo(PRATIBIMBA_LAYOUT_IDE_DEEP),
            isEnabled: () => this.switcher.currentLayout !== PRATIBIMBA_LAYOUT_IDE_DEEP
        });
        commands.registerCommand(TOGGLE_LAYOUT, {
            execute: () => this.switcher.toggleLayout()
        });
    }

    registerMenus(menus: MenuModelRegistry): void {
        // Top-level "Pratibimba" menu in the menubar (Electron + browser).
        menus.registerSubmenu(PRATIBIMBA_MENU, 'Pratibimba');
        menus.registerMenuAction(PRATIBIMBA_LAYOUTS_GROUP, {
            commandId: SWITCH_TO_DAILY.id,
            label: 'Return to 0/1 Daily Layout',
            order: '1'
        });
        menus.registerMenuAction(PRATIBIMBA_LAYOUTS_GROUP, {
            commandId: SWITCH_TO_IDE_DEEP.id,
            label: 'Summon Deep IDE Layout',
            order: '2'
        });
        menus.registerMenuAction(PRATIBIMBA_LAYOUTS_GROUP, {
            commandId: TOGGLE_LAYOUT.id,
            label: 'Toggle Workspace Layout',
            order: '3'
        });
        // Intent commands are registered by CrossLayoutIntentDispatcher; we
        // group them into the Pratibimba menu's second section here.
        menus.registerMenuAction(PRATIBIMBA_INTENTS_GROUP, {
            commandId: 'pratibimba.intent.open-review-item',
            label: 'Open Review Item…',
            order: '1'
        });
        menus.registerMenuAction(PRATIBIMBA_INTENTS_GROUP, {
            commandId: 'pratibimba.intent.open-graph-node',
            label: 'Open Graph Node…',
            order: '2'
        });
        menus.registerMenuAction(PRATIBIMBA_INTENTS_GROUP, {
            commandId: 'pratibimba.intent.open-canon-studio-file',
            label: 'Open Canon Studio File…',
            order: '3'
        });
        menus.registerMenuAction(PRATIBIMBA_INTENTS_GROUP, {
            commandId: 'pratibimba.intent.start-journal-entry',
            label: 'Start Journal Entry',
            order: '4'
        });
        menus.registerMenuAction(PRATIBIMBA_INTENTS_GROUP, {
            commandId: 'pratibimba.intent.deposit-review-evidence',
            label: 'Deposit Review Evidence',
            order: '5'
        });
    }
}
