import { injectable } from '@theia/core/shared/inversify';
import { Command, CommandRegistry, MenuModelRegistry } from '@theia/core/lib/common';
import { CommonMenus } from '@theia/core/lib/browser';
import { AbstractViewContribution } from '@theia/core/lib/browser/shell/view-contribution';
import { OmniPanelWidget } from './omnipanel-widget';

export const OPEN_OMNIPANEL: Command = {
    id: 'pratibimba.omnipanel.open',
    label: 'Pratibimba: Open OmniPanel'
};

export const TOGGLE_OMNIPANEL: Command = {
    id: 'pratibimba.omnipanel.toggle',
    label: 'Pratibimba: Toggle OmniPanel'
};

@injectable()
export class OmniPanelContribution extends AbstractViewContribution<OmniPanelWidget> {
    constructor() {
        super({
            widgetId: OmniPanelWidget.ID,
            widgetName: OmniPanelWidget.LABEL,
            // T2 scaffold uses 'main' for guaranteed visibility. T5 promotes
            // this to the canonical `/` command-membrane position with
            // Electron menu/tray/dock integration + cross-layout intent
            // routing — at that point the area may move to 'bottom' or a
            // dedicated overlay surface.
            defaultWidgetOptions: { area: 'main' },
            toggleCommandId: TOGGLE_OMNIPANEL.id
        });
    }

    /**
     * Reveal the OmniPanel on first start so users see the canonical `/`
     * command membrane without needing to spelunk the command palette.
     * Matches the kernel-bridge-readiness contribution's startup behaviour.
     */
    async onStart(): Promise<void> {
        // activate:true forces the bottom panel area to open (Theia keeps it
        // collapsed by default until something requests focus). Both layouts
        // mount the OmniPanel so this runs once per session.
        await this.openView({ activate: true, reveal: true });
    }

    override registerCommands(commands: CommandRegistry): void {
        super.registerCommands(commands);
        commands.registerCommand(OPEN_OMNIPANEL, {
            execute: () => this.openView({ activate: true, reveal: true })
        });
    }

    override registerMenus(menus: MenuModelRegistry): void {
        super.registerMenus(menus);
        menus.registerMenuAction(CommonMenus.VIEW, {
            commandId: OPEN_OMNIPANEL.id,
            order: 'a-omnipanel'
        });
    }
}
